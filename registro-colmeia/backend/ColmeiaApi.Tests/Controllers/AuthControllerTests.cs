using ColmeiaApi.Controllers;
using ColmeiaApi.DTOs;
using ColmeiaApi.Models;
using ColmeiaApi.Tests.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace ColmeiaApi.Tests.Controllers;

public class AuthControllerTests
{
    private static IConfiguration BuildConfig()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:Key"]      = "chave-super-secreta-para-testes-unitarios-123",
            ["Jwt:Issuer"]   = "TestIssuer",
            ["Jwt:Audience"] = "TestAudience",
        };
        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    // ── Register ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task Register_DeveRetornarCreated_QuandoDadosValidos()
    {
        using var db  = DbHelper.CreateInMemory();
        var config    = BuildConfig();
        var ctrl      = new AuthController(db, config);

        var dto = new RegisterDto(
            Nome: "Natália", Sobrenome: "Nogueira",
            Cpf: "16205343045", Email: "natalia@gmail.com",
            Senha: "Abc123!", DataNascimento: new DateOnly(2006, 1, 1),
            Instituicao: "SENAI"
        );

        var result = await ctrl.Register(dto);

        Assert.IsType<CreatedResult>(result);
    }

    [Fact]
    public async Task Register_DeveRetornarConflict_QuandoEmailJaCadastrado()
    {
        using var db = DbHelper.CreateInMemory();
        db.Usuarios.Add(new Usuario
        {
            Id = Guid.NewGuid(), Nome = "Outro", Sobrenome = "User",
            Cpf = "11122233344", Email = "natalia@gmail.com",
            SenhaHash = "hash", DataNascimento = new DateOnly(2000, 1, 1),
            Ativo = true,
        });
        await db.SaveChangesAsync();

        var ctrl = new AuthController(db, BuildConfig());
        var dto  = new RegisterDto(
            Nome: "Natália", Sobrenome: "Nogueira",
            Cpf: "16205343045", Email: "natalia@gmail.com",
            Senha: "Abc123!", DataNascimento: new DateOnly(2006, 1, 1),
            Instituicao: "SENAI"
        );

        var result = await ctrl.Register(dto);

        var conflict = Assert.IsType<ConflictObjectResult>(result);
        Assert.Contains("E-mail", conflict.Value?.ToString() ?? "");
    }

    [Fact]
    public async Task Register_DeveRetornarConflict_QuandoCpfAtivoDuplicado()
    {
        using var db = DbHelper.CreateInMemory();
        db.Usuarios.Add(new Usuario
        {
            Id = Guid.NewGuid(), Nome = "Outro", Sobrenome = "User",
            Cpf = "16205343045", Email = "outro@gmail.com",
            SenhaHash = "hash", DataNascimento = new DateOnly(2000, 1, 1),
            Ativo = true,
        });
        await db.SaveChangesAsync();

        var ctrl = new AuthController(db, BuildConfig());
        var dto  = new RegisterDto(
            Nome: "Natália", Sobrenome: "Nogueira",
            Cpf: "16205343045", Email: "natalia@gmail.com",
            Senha: "Abc123!", DataNascimento: new DateOnly(2006, 1, 1),
            Instituicao: "SENAI"
        );

        var result = await ctrl.Register(dto);

        Assert.IsType<ConflictObjectResult>(result);
    }

    [Fact]
    public async Task Register_DevPermitirCpf_QuandoContaAnteriorDesativada()
    {
        using var db = DbHelper.CreateInMemory();
        db.Usuarios.Add(new Usuario
        {
            Id = Guid.NewGuid(), Nome = "Outro", Sobrenome = "User",
            Cpf = "16205343045", Email = "outro@gmail.com",
            SenhaHash = "hash", DataNascimento = new DateOnly(2000, 1, 1),
            Ativo = false, // conta desativada
        });
        await db.SaveChangesAsync();

        var ctrl = new AuthController(db, BuildConfig());
        var dto  = new RegisterDto(
            Nome: "Natália", Sobrenome: "Nogueira",
            Cpf: "16205343045", Email: "natalia@gmail.com",
            Senha: "Abc123!", DataNascimento: new DateOnly(2006, 1, 1),
            Instituicao: "SENAI"
        );

        var result = await ctrl.Register(dto);

        Assert.IsType<CreatedResult>(result);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_DeveRetornarUnauthorized_QuandoEmailNaoEncontrado()
    {
        using var db = DbHelper.CreateInMemory();
        var ctrl     = new AuthController(db, BuildConfig());
        var dto      = new LoginDto("naoexiste@email.com", "Abc123!");

        var result = await ctrl.Login(dto);

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_DeveRetornarUnauthorized_QuandoContaDesativada()
    {
        using var db = DbHelper.CreateInMemory();
        db.Usuarios.Add(new Usuario
        {
            Id = Guid.NewGuid(), Nome = "Natália", Sobrenome = "Nogueira",
            Cpf = "16205343045", Email = "natalia@gmail.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Abc123!"),
            DataNascimento = new DateOnly(2006, 1, 1),
            Ativo = false, Aprovado = true,
        });
        await db.SaveChangesAsync();

        var ctrl   = new AuthController(db, BuildConfig());
        var result = await ctrl.Login(new LoginDto("natalia@gmail.com", "Abc123!"));

        var unauth = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Contains("desativada", unauth.Value?.ToString() ?? "");
    }

    [Fact]
    public async Task Login_DeveRetornarUnauthorized_QuandoContaNaoAprovada()
    {
        using var db = DbHelper.CreateInMemory();
        db.Usuarios.Add(new Usuario
        {
            Id = Guid.NewGuid(), Nome = "Natália", Sobrenome = "Nogueira",
            Cpf = "16205343045", Email = "natalia@gmail.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Abc123!"),
            DataNascimento = new DateOnly(2006, 1, 1),
            Ativo = true, Aprovado = false,
        });
        await db.SaveChangesAsync();

        var ctrl   = new AuthController(db, BuildConfig());
        var result = await ctrl.Login(new LoginDto("natalia@gmail.com", "Abc123!"));

        var unauth = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Contains("aprovada", unauth.Value?.ToString() ?? "");
    }
}
