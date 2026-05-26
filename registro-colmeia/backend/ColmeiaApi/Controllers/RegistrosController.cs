using ColmeiaApi.Data;
using ColmeiaApi.DTOs;
using ColmeiaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ColmeiaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegistrosController(ColmeiaContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] RegistroDto dto)
    {
        var colmeia = await db.Colmeias.FirstOrDefaultAsync(c => c.Nome == dto.Colmeia);
        if (colmeia is null)
            return NotFound(new { message = "Colmeia não encontrada" });

        var registro = new Registro { DataHora = dto.DataHora };
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

    private static bool TemDadosLeitura(RegistroDto dto) =>
        dto.TemperaturaInterna.HasValue ||
        dto.TemperaturaExterna.HasValue ||
        dto.UmidadeInterna.HasValue ||
        dto.UmidadeExterna.HasValue ||
        dto.PressaoAtmosferica.HasValue ||
        dto.VelocidadeVento.HasValue ||
        dto.Peso.HasValue;
}
