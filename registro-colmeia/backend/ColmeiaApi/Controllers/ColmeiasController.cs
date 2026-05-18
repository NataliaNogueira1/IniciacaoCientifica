using ColmeiaApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ColmeiaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ColmeiasController(ColmeiaContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() =>
        Ok(await db.Colmeias
            .Include(c => c.Localizacao)
            .OrderBy(c => c.Nome)
            .Select(c => new
            {
                c.Id,
                c.Nome,
                Localizacao = new
                {
                    c.Localizacao.Cidade,
                    c.Localizacao.Latitude,
                    c.Localizacao.Longitude,
                    c.Localizacao.Altitude
                }
            })
            .ToListAsync());
}
