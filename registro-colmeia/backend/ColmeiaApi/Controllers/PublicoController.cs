using ColmeiaApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ColmeiaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PublicoController(ColmeiaContext db) : ControllerBase
{
    [HttpGet("registros")]
    public async Task<IActionResult> GetRegistros(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        [FromQuery] string? colmeia = null,
        [FromQuery] DateTime? de = null,
        [FromQuery] DateTime? ate = null)
    {
        pageSize = Math.Clamp(pageSize, 1, 500);
        page = Math.Max(1, page);

        var query = db.Registros
            .Include(r => r.Saude)
            .Include(r => r.Leitura)
            .Include(r => r.Colmeia)
                .ThenInclude(c => c.Localizacao)
            .Where(r => r.Exclusao == null);

        if (!string.IsNullOrWhiteSpace(colmeia))
            query = query.Where(r => r.Colmeia.Nome == colmeia);

        if (de.HasValue)
            query = query.Where(r => r.DataHora >= de.Value);

        if (ate.HasValue)
            query = query.Where(r => r.DataHora <= ate.Value);

        var total = await query.CountAsync();

        var registros = await query
            .OrderByDescending(r => r.DataHora)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                IdUsuario = r.IdUsuario,
                DataHora = r.DataHora,
                Criacao = r.Criacao,
                Colmeia = new
                {
                    r.Colmeia.Nome,
                    Localizacao = r.Colmeia.Localizacao == null ? null : new
                    {
                        r.Colmeia.Localizacao.Cidade,
                        r.Colmeia.Localizacao.Latitude,
                        r.Colmeia.Localizacao.Longitude,
                        r.Colmeia.Localizacao.Altitude
                    }
                },
                Saude = r.Saude == null ? null : new
                {
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
                    r.Leitura.TemperaturaInterna,
                    r.Leitura.TemperaturaExterna,
                    r.Leitura.UmidadeInterna,
                    r.Leitura.UmidadeExterna,
                    r.Leitura.PressaoAtmosferica,
                    r.Leitura.VelocidadeVento,
                    r.Leitura.Peso
                }
            })
            .ToListAsync();

        return Ok(new
        {
            total,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(total / (double)pageSize),
            data = registros
        });
    }

    [HttpGet("colmeias")]
    public async Task<IActionResult> GetColmeias() =>
        Ok(await db.Colmeias
            .Include(c => c.Localizacao)
            .OrderBy(c => c.Nome)
            .Select(c => new { c.Nome, Cidade = c.Localizacao.Cidade })
            .ToListAsync());

    [HttpGet("periodo")]
    public async Task<IActionResult> GetPeriodo()
    {
        var min = await db.Registros.Where(r => r.Exclusao == null).MinAsync(r => (DateTime?)r.DataHora);
        var max = await db.Registros.Where(r => r.Exclusao == null).MaxAsync(r => (DateTime?)r.DataHora);
        return Ok(new { primeiro = min, ultimo = max });
    }
}
