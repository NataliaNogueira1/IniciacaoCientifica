using ColmeiaApi.Controllers;
using ColmeiaApi.DTOs;
using ColmeiaApi.Models;
using ColmeiaApi.Tests.Helpers;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ColmeiaApi.Tests.Controllers;

public class AdminControllerTests
{
    private static async Task<(AdminController ctrl, ColmeiaApi.Data.ColmeiaContext db, Guid adminId)> SetupAsync()
    {
        var db      = DbHelper.CreateInMemory();
        var adminId = Guid.NewGuid();
        db.Usuarios.Add(new Usuario
        {
            Id = adminId, Nome = "Admin", Sobrenome = "Test",
            Cpf = "00000000000", Email = "admin@test.com",
            SenhaHash = "hash", DataNascimento = new DateOnly(1990, 1, 1),
            Permissao = Permissao.Admin, Ativo = true, Aprovado = true,
        });
        await db.SaveChangesAsync();
        var ctrl = new AdminController(db)
        {
            ControllerContext = AuthHelper.CreateContext(adminId, "Admin")
        };
        return (ctrl, db, adminId);
    }

    // ── Usuários ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task ListarUsuarios_DeveRetornarOk()
    {
        var (ctrl, _, _) = await SetupAsync();
        var result       = await ctrl.ListarUsuarios();
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task AprovarUsuario_DeveRetornarOk_QuandoUsuarioExiste()
    {
        var (ctrl, db, _) = await SetupAsync();
        var userId        = Guid.NewGuid();
        db.Usuarios.Add(new Usuario
        {
            Id = userId, Nome = "Pesq", Sobrenome = "Test",
            Cpf = "11111111111", Email = "pesq@test.com",
            SenhaHash = "hash", DataNascimento = new DateOnly(2000, 1, 1),
            Ativo = true, Aprovado = false,
        });
        await db.SaveChangesAsync();

        var result = await ctrl.AprovarUsuario(userId);
        Assert.IsType<OkObjectResult>(result);

        var usuario = await db.Usuarios.FindAsync(userId);
        Assert.True(usuario!.Aprovado);
    }

    [Fact]
    public async Task AprovarUsuario_DeveRetornarNotFound_QuandoNaoExiste()
    {
        var (ctrl, _, _) = await SetupAsync();
        var result       = await ctrl.AprovarUsuario(Guid.NewGuid());
        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task ReprovarUsuario_DeveMarcarComoReprovado()
    {
        var (ctrl, db, _) = await SetupAsync();
        var userId        = Guid.NewGuid();
        db.Usuarios.Add(new Usuario
        {
            Id = userId, Nome = "Pesq", Sobrenome = "Test",
            Cpf = "22222222222", Email = "pesq2@test.com",
            SenhaHash = "hash", DataNascimento = new DateOnly(2000, 1, 1),
            Ativo = true, Aprovado = false,
        });
        await db.SaveChangesAsync();

        var result = await ctrl.ReprovarUsuario(userId);
        Assert.IsType<OkObjectResult>(result);

        var usuario = await db.Usuarios.FindAsync(userId);
        Assert.True(usuario!.Reprovado);
        Assert.False(usuario.Ativo);
    }

    [Fact]
    public async Task DesativarUsuario_DeveRetornarBadRequest_QuandoDesativaProprioAdmin()
    {
        var (ctrl, _, adminId) = await SetupAsync();
        var result             = await ctrl.DesativarUsuario(adminId);
        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task AlterarPermissao_DeveRetornarBadRequest_QuandoPermissaoInvalida()
    {
        var (ctrl, db, _) = await SetupAsync();
        var userId        = Guid.NewGuid();
        db.Usuarios.Add(new Usuario
        {
            Id = userId, Nome = "Pesq", Sobrenome = "Test",
            Cpf = "33333333333", Email = "pesq3@test.com",
            SenhaHash = "hash", DataNascimento = new DateOnly(2000, 1, 1),
            Ativo = true, Aprovado = true,
        });
        await db.SaveChangesAsync();

        var result = await ctrl.AlterarPermissao(userId, new AlterarPermissaoDto("SuperAdmin"));
        Assert.IsType<BadRequestObjectResult>(result);
    }

    // ── Colmeias ──────────────────────────────────────────────────────────────

    [Fact]
    public async Task CriarColmeia_DeveRetornarCreated()
    {
        var (ctrl, _, _) = await SetupAsync();
        var dto          = new ColmeiaDto("COL-TEST", "São Paulo, SP", -23.5505m, -46.6333m, 760m);
        var result       = await ctrl.CriarColmeia(dto);
        Assert.IsType<CreatedResult>(result);
    }

    [Fact]
    public async Task DesativarColmeia_DeveAdicionarPrefixo()
    {
        var (ctrl, db, _) = await SetupAsync();
        var loc           = new Localizacao { Id = Guid.NewGuid(), Cidade = "SP", Latitude = 0, Longitude = 0, Altitude = 0 };
        var colmeia       = new Colmeia { Id = Guid.NewGuid(), Nome = "COL-001", IdLocalizacao = loc.Id };
        db.Localizacoes.Add(loc);
        db.Colmeias.Add(colmeia);
        await db.SaveChangesAsync();

        await ctrl.DesativarColmeia(colmeia.Id);

        var atualizado = await db.Colmeias.FindAsync(colmeia.Id);
        Assert.StartsWith("[INATIVA]", atualizado!.Nome);
    }

    [Fact]
    public async Task ReativarColmeia_DeveRemoverPrefixo()
    {
        var (ctrl, db, _) = await SetupAsync();
        var loc           = new Localizacao { Id = Guid.NewGuid(), Cidade = "SP", Latitude = 0, Longitude = 0, Altitude = 0 };
        var colmeia       = new Colmeia { Id = Guid.NewGuid(), Nome = "[INATIVA] COL-001", IdLocalizacao = loc.Id };
        db.Localizacoes.Add(loc);
        db.Colmeias.Add(colmeia);
        await db.SaveChangesAsync();

        await ctrl.ReativarColmeia(colmeia.Id);

        var atualizado = await db.Colmeias.FindAsync(colmeia.Id);
        Assert.Equal("COL-001", atualizado!.Nome);
    }
}
