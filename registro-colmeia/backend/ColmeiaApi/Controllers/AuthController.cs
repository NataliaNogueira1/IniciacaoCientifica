using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ColmeiaApi.Data;
using ColmeiaApi.DTOs;
using ColmeiaApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
namespace ColmeiaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ColmeiaContext db, IConfiguration config) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await db.Usuarios.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "E-mail já cadastrado." });

        if (await db.Usuarios.AnyAsync(u => u.Cpf == dto.Cpf && u.Ativo))
            return Conflict(new { message = "CPF já cadastrado." });

        var usuario = new Usuario
        {
            Nome = dto.Nome,
            Sobrenome = dto.Sobrenome,
            Cpf = dto.Cpf,
            Email = dto.Email,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
            DataNascimento = dto.DataNascimento,
            Instituicao = dto.Instituicao ?? ""
        };

        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync();

        return Created($"/api/auth/{usuario.Id}", new { id = usuario.Id, email = usuario.Email });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
            return Unauthorized(new { message = "E-mail ou senha inválidos." });

        if (!usuario.Ativo)
            return Unauthorized(new { message = "Conta desativada. Entre em contato com o administrador." });

        if (!usuario.Aprovado && usuario.Permissao != Permissao.Admin)
            return Unauthorized(new { message = "Conta ainda não aprovada. Aguarde a aprovação de um administrador." });

        usuario.UltimoLogin = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var token = GerarToken(usuario, config);
        return Ok(new AuthResponseDto(token, usuario.Nome, usuario.Email, usuario.Permissao.ToString(), usuario.Emoji));
    }

    private static string GerarToken(Usuario usuario, IConfiguration config)
    {
        var jwtSettings = config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, usuario.Email),
            new Claim(ClaimTypes.Name, $"{usuario.Nome} {usuario.Sobrenome}"),
            new Claim(ClaimTypes.Role, usuario.Permissao.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
