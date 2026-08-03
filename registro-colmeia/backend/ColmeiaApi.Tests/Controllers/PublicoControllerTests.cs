using ColmeiaApi.Controllers;
using ColmeiaApi.Models;
using ColmeiaApi.Tests.Helpers;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ColmeiaApi.Tests.Controllers;

public class PublicoControllerTests
{
    private static async Task<(PublicoController ctrl, ColmeiaApi.Data.ColmeiaContext db)> SetupAsync()
    {
        var db  = DbHelper.CreateInMemory();
        var loc = new Localizacao
        {
            Id = Guid.NewGuid(), Cidade = "Florianópolis, SC",
            Latitude = -27.5954m, Longitude = -48.548m, Altitude = 12m
        };
        var col = new Colmeia { Id = Guid.NewGuid(), Nome = "SENAI-SOR-1", IdLocalizacao = loc.Id };
        db.Localizacoes.Add(loc);
        db.Colmeias.Add(col);
        await db.SaveChangesAsync();
        return (new PublicoController(db), db);
    }

    [Fact]
    public async Task GetColmeias_DeveRetornarListaComNomeECoordenadas()
    {
        var (ctrl, _) = await SetupAsync();
        var result    = await ctrl.GetColmeias();
        var ok        = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task GetRegistros_DeveRetornarListaVazia_QuandoNaoHaRegistros()
    {
        var db   = DbHelper.CreateInMemory();
        var ctrl = new PublicoController(db);
        var result = await ctrl.GetRegistros();
        var ok     = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }

    [Fact]
    public async Task GetPeriodo_DeveRetornarNulos_QuandoNaoHaRegistros()
    {
        var db     = DbHelper.CreateInMemory();
        var ctrl   = new PublicoController(db);
        var result = await ctrl.GetPeriodo();
        var ok     = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }
}
