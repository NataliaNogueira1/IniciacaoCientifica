using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ColmeiaApi.Data;
using ColmeiaApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ColmeiaApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PerfilController(ColmeiaContext db) : ControllerBase
{
    private Guid? GetUsuarioId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(claim?.Value, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var id = GetUsuarioId();
        if (id is null) return Unauthorized();

        var u = await db.Usuarios.FindAsync(id);
        if (u is null) return NotFound();

        return Ok(new PerfilResponseDto(
            u.Id, u.Nome, u.Sobrenome, u.Cpf, u.Email,
            u.DataNascimento, u.Instituicao,
            u.Permissao.ToString(), u.Emoji,
            u.Criacao, u.UltimoLogin
        ));
    }

    [HttpPut]
    public async Task<IActionResult> Put([FromBody] AtualizarPerfilDto dto)
    {
        var id = GetUsuarioId();
        if (id is null) return Unauthorized();

        var u = await db.Usuarios.FindAsync(id);
        if (u is null) return NotFound();

        // Verifica se e-mail já está em uso por outro usuário
        if (dto.Email != u.Email &&
            await db.Usuarios.AnyAsync(x => x.Email == dto.Email && x.Id != u.Id))
            return Conflict(new { message = "E-mail já está em uso por outro usuário." });

        // Troca de senha opcional
        if (!string.IsNullOrEmpty(dto.NovaSenha))
        {
            if (string.IsNullOrEmpty(dto.SenhaAtual))
                return BadRequest(new { message = "Informe a senha atual para alterar a senha." });

            if (!BCrypt.Net.BCrypt.Verify(dto.SenhaAtual, u.SenhaHash))
                return BadRequest(new { message = "Senha atual incorreta." });

            u.SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
        }

        u.Nome = dto.Nome;
        u.Sobrenome = dto.Sobrenome;
        u.Email = dto.Email;
        u.DataNascimento = dto.DataNascimento;
        u.Instituicao = dto.Instituicao ?? "";
        u.Emoji = dto.Emoji;

        await db.SaveChangesAsync();

        return Ok(new PerfilResponseDto(
            u.Id, u.Nome, u.Sobrenome, u.Cpf, u.Email,
            u.DataNascimento, u.Instituicao,
            u.Permissao.ToString(), u.Emoji,
            u.Criacao, u.UltimoLogin
        ));
    }
}
