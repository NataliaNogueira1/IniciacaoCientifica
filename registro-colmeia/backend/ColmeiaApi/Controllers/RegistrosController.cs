using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ColmeiaApi.Data;
using ColmeiaApi.DTOs;
using ColmeiaApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ColmeiaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegistrosController(ColmeiaContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] RegistroDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);

        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var usuarioId))
            return Unauthorized(new { message = "Token inválido." });

        var colmeia = await db.Colmeias.FirstOrDefaultAsync(c => c.Nome == dto.Colmeia);
        if (colmeia is null)
            return NotFound(new { message = "Colmeia não encontrada" });

        var registro = new Registro
        {
            IdUsuario = usuarioId,
            IdColmeia = colmeia.Id,
            DataHora = dto.DataHora
        };
        db.Registros.Add(registro);

        db.Saudes.Add(new Saude
        {
            IdRegistro = registro.Id,
            IdColmeia = colmeia.Id,
            PresencaRainha = dto.PresencaRainha,
            PresencaPredador = dto.PresencaPredador,
            TipoPredador = dto.PresencaPredador ? dto.TipoPredador : null,
            Comida = dto.Comida,
            CondicaoClimatica = dto.CondicaoClimatica,
            Saudavel = dto.Saudavel,
            Observacoes = dto.Observacoes
        });

        if (TemDadosLeitura(dto))
        {
            var sensor = await db.Sensores.FirstOrDefaultAsync(s => s.IdColmeia == colmeia.Id);
            if (sensor is not null)
            {
                db.Leituras.Add(new Leitura
                {
                    IdRegistro = registro.Id,
                    IdSensor = sensor.Id,
                    TemperaturaInterna = dto.TemperaturaInterna,
                    TemperaturaExterna = dto.TemperaturaExterna,
                    UmidadeInterna = dto.UmidadeInterna,
                    UmidadeExterna = dto.UmidadeExterna,
                    PressaoAtmosferica = dto.PressaoAtmosferica,
                    VelocidadeVento = dto.VelocidadeVento,
                    Peso = dto.Peso
                });
            }
        }

        await db.SaveChangesAsync();
        return Ok(new { id = registro.Id });
    }

    [HttpGet]
    public async Task<IActionResult> Get() =>
        Ok(await db.Registros
            .Include(r => r.Saude)
            .Include(r => r.Leitura)
            .OrderByDescending(r => r.DataHora)
            .Take(50)
            .Select(r => new
            {
                r.Id,
                r.DataHora,
                Saude = r.Saude == null ? null : new
                {
                    r.Saude.IdColmeia,
                    r.Saude.PresencaRainha,
                    r.Saude.PresencaPredador,
                    r.Saude.TipoPredador,
                    r.Saude.Comida,
                    r.Saude.CondicaoClimatica,
                    r.Saude.Saudavel,
                    r.Saude.Observacoes
                },
                Leitura = r.Leitura == null ? null : new
                {
                    r.Leitura.IdSensor,
                    r.Leitura.TemperaturaInterna,
                    r.Leitura.TemperaturaExterna,
                    r.Leitura.UmidadeInterna,
                    r.Leitura.UmidadeExterna,
                    r.Leitura.PressaoAtmosferica,
                    r.Leitura.VelocidadeVento,
                    r.Leitura.Peso
                }
            })
            .ToListAsync());

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var usuarioId))
            return Unauthorized();

        var registro = await db.Registros.FindAsync(id);
        if (registro is null || registro.Exclusao is not null)
            return NotFound(new { message = "Registro não encontrado." });

        var isAdmin = User.IsInRole("Admin");
        if (registro.IdUsuario != usuarioId && !isAdmin)
            return Forbid();

        registro.Exclusao = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Put(Guid id, [FromBody] RegistroDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var usuarioId))
            return Unauthorized();

        var registro = await db.Registros
            .Include(r => r.Saude)
            .Include(r => r.Leitura)
            .FirstOrDefaultAsync(r => r.Id == id && r.Exclusao == null);

        if (registro is null)
            return NotFound(new { message = "Registro não encontrado." });

        var isAdmin = User.IsInRole("Admin");
        if (registro.IdUsuario != usuarioId && !isAdmin)
            return Forbid();

        var colmeia = await db.Colmeias.FirstOrDefaultAsync(c => c.Nome == dto.Colmeia);
        if (colmeia is null)
            return NotFound(new { message = "Colmeia não encontrada." });

        registro.IdColmeia = colmeia.Id;
        registro.DataHora = dto.DataHora;
        registro.Atualizacao = DateTime.UtcNow;

        if (registro.Saude is not null)
        {
            registro.Saude.IdColmeia = colmeia.Id;
            registro.Saude.PresencaRainha = dto.PresencaRainha;
            registro.Saude.PresencaPredador = dto.PresencaPredador;
            registro.Saude.TipoPredador = dto.PresencaPredador ? dto.TipoPredador : null;
            registro.Saude.Comida = dto.Comida;
            registro.Saude.CondicaoClimatica = dto.CondicaoClimatica;
            registro.Saude.Saudavel = dto.Saudavel;
            registro.Saude.Observacoes = dto.Observacoes;
        }

        if (registro.Leitura is not null)
        {
            registro.Leitura.TemperaturaInterna = dto.TemperaturaInterna;
            registro.Leitura.TemperaturaExterna = dto.TemperaturaExterna;
            registro.Leitura.UmidadeInterna = dto.UmidadeInterna;
            registro.Leitura.UmidadeExterna = dto.UmidadeExterna;
            registro.Leitura.PressaoAtmosferica = dto.PressaoAtmosferica;
            registro.Leitura.VelocidadeVento = dto.VelocidadeVento;
            registro.Leitura.Peso = dto.Peso;
        }

        await db.SaveChangesAsync();
        return Ok(new { id = registro.Id });
    }

    private static bool TemDadosLeitura(RegistroDto dto) =>
        dto.TemperaturaInterna.HasValue ||
        dto.TemperaturaExterna.HasValue ||
        dto.UmidadeInterna.HasValue ||
        dto.UmidadeExterna.HasValue ||
        dto.PressaoAtmosferica.HasValue ||
        dto.VelocidadeVento.HasValue ||
        dto.Peso.HasValue;
}
