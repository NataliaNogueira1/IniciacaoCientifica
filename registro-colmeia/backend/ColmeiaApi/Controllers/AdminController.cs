using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;
using ColmeiaApi.Data;
using ColmeiaApi.DTOs;
using ColmeiaApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ColmeiaApi.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(ColmeiaContext db) : ControllerBase
{
    private Guid? GetAdminId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(claim?.Value, out var id) ? id : null;
    }

    // ── Gestão de Usuários ────────────────────────────────────────────────

    [HttpGet("usuarios")]
    public async Task<IActionResult> ListarUsuarios()
    {
        var lista = await db.Usuarios
            .OrderBy(u => u.Aprovado)
            .ThenBy(u => u.Criacao)
            .Select(u => new
            {
                u.Id,
                u.Nome,
                u.Sobrenome,
                u.Email,
                u.Cpf,
                u.Instituicao,
                Permissao = u.Permissao.ToString(),
                u.Ativo,
                u.Aprovado,
                u.Reprovado,
                u.Criacao,
                u.UltimoLogin,
                u.Emoji,
            })
            .ToListAsync();

        return Ok(lista);
    }

    [HttpPatch("usuarios/{id:guid}/aprovar")]
    public async Task<IActionResult> AprovarUsuario(Guid id)
    {
        var u = await db.Usuarios.FindAsync(id);
        if (u is null) return NotFound(new { message = "Usuário não encontrado." });

        u.Aprovado = true;
        u.Ativo = true;
        await db.SaveChangesAsync();

        return Ok(new { message = "Usuário aprovado com sucesso." });
    }

    [HttpPatch("usuarios/{id:guid}/desativar")]
    public async Task<IActionResult> DesativarUsuario(Guid id)
    {
        var adminId = GetAdminId();
        if (id == adminId)
            return BadRequest(new { message = "Você não pode desativar a própria conta." });

        var u = await db.Usuarios.FindAsync(id);
        if (u is null) return NotFound(new { message = "Usuário não encontrado." });

        u.Ativo = false;
        u.Aprovado = false;
        await db.SaveChangesAsync();

        return Ok(new { message = "Usuário desativado." });
    }

    [HttpPatch("usuarios/{id:guid}/reprovar")]
    public async Task<IActionResult> ReprovarUsuario(Guid id)
    {
        var adminId = GetAdminId();
        if (id == adminId)
            return BadRequest(new { message = "Você não pode reprovar a própria conta." });

        var u = await db.Usuarios.FindAsync(id);
        if (u is null) return NotFound(new { message = "Usuário não encontrado." });

        if (u.Aprovado)
            return BadRequest(new { message = "Usuário já aprovado. Use a opção desativar." });

        u.Ativo = false;
        u.Aprovado = false;
        u.Reprovado = true;
        await db.SaveChangesAsync();

        return Ok(new { message = "Usuário reprovado." });
    }

    [HttpPatch("usuarios/{id:guid}/permissao")]
    public async Task<IActionResult> AlterarPermissao(Guid id, [FromBody] AlterarPermissaoDto dto)
    {
        var adminId = GetAdminId();
        if (id == adminId)
            return BadRequest(new { message = "Você não pode alterar a própria permissão." });

        var u = await db.Usuarios.FindAsync(id);
        if (u is null) return NotFound(new { message = "Usuário não encontrado." });

        if (!Enum.TryParse<Permissao>(dto.Permissao, out var permissao))
            return BadRequest(new { message = "Permissão inválida. Use 'Admin' ou 'Pesquisador'." });

        u.Permissao = permissao;
        await db.SaveChangesAsync();

        return Ok(new { message = "Permissão atualizada." });
    }

    // ── Solicitações de Alteração ─────────────────────────────────────────

    [HttpGet("solicitacoes")]
    public async Task<IActionResult> ListarSolicitacoes([FromQuery] string? status = "Pendente")
    {
        var query = db.SolicitacoesAlteracao
            .Include(s => s.Usuario)
            .Include(s => s.Registro)
                .ThenInclude(r => r.Colmeia)
            .Include(s => s.Registro)
                .ThenInclude(r => r.Leitura)
            .Include(s => s.Registro)
                .ThenInclude(r => r.Saude)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) &&
            Enum.TryParse<StatusSolicitacao>(status, out var statusEnum))
        {
            query = query.Where(s => s.Status == statusEnum);
        }

        var lista = await query
            .OrderByDescending(s => s.Criacao)
            .ToListAsync();

        var result = lista.Select(s => new
        {
            s.Id,
            s.IdRegistro,
            Registro = new
            {
                s.Registro.DataHora,
                Colmeia                 = s.Registro.Colmeia.Nome,
                TemperaturaInterna      = s.Registro.Leitura?.TemperaturaInterna,
                TemperaturaExterna      = s.Registro.Leitura?.TemperaturaExterna,
                UmidadeInterna          = s.Registro.Leitura?.UmidadeInterna,
                UmidadeExterna          = s.Registro.Leitura?.UmidadeExterna,
                PressaoAtmosferica      = s.Registro.Leitura?.PressaoAtmosferica,
                VelocidadeVento         = s.Registro.Leitura?.VelocidadeVento,
                Peso                    = s.Registro.Leitura?.Peso,
                PresencaRainha          = s.Registro.Saude?.PresencaRainha,
                PresencaPredador        = s.Registro.Saude?.PresencaPredador,
                TipoPredador            = s.Registro.Saude?.TipoPredador,
                Comida                  = s.Registro.Saude?.Comida,
                CondicaoClimatica       = s.Registro.Saude?.CondicaoClimatica,
                Saudavel                = s.Registro.Saude?.Saudavel,
                Observacoes             = s.Registro.Saude?.Observacoes,
            },
            Usuario        = new { s.Usuario.Nome, s.Usuario.Sobrenome, s.Usuario.Email },
            Tipo           = s.Tipo.ToString(),
            Status         = s.Status.ToString(),
            s.DadosNovos,
            s.MotivoRejeicao,
            s.Criacao,
            s.Resolucao,
        });

        return Ok(result);
    }

    [HttpPost("solicitacoes/{id:guid}/aprovar")]
    public async Task<IActionResult> AprovarSolicitacao(Guid id)
    {
        var adminId = GetAdminId();
        var sol = await db.SolicitacoesAlteracao
            .Include(s => s.Registro)
                .ThenInclude(r => r.Saude)
            .Include(s => s.Registro)
                .ThenInclude(r => r.Leitura)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sol is null) return NotFound(new { message = "Solicitação não encontrada." });
        if (sol.Status != StatusSolicitacao.Pendente)
            return BadRequest(new { message = "Solicitação já foi resolvida." });

        var registro = sol.Registro;

        if (sol.Tipo == TipoSolicitacao.Excluir)
        {
            registro.Exclusao = DateTime.UtcNow;
        }
        else if (sol.Tipo == TipoSolicitacao.Editar && sol.DadosNovos is not null)
        {
            var dto = JsonSerializer.Deserialize<RegistroDto>(sol.DadosNovos,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (dto is null)
                return BadRequest(new { message = "Dados da solicitação inválidos." });

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
        }

        sol.Status = StatusSolicitacao.Aprovada;
        sol.Resolucao = DateTime.UtcNow;
        sol.IdAdminResolveu = adminId;

        await db.SaveChangesAsync();
        return Ok(new { message = "Solicitação aprovada e alteração aplicada." });
    }

    [HttpPost("solicitacoes/{id:guid}/rejeitar")]
    public async Task<IActionResult> RejeitarSolicitacao(Guid id, [FromBody] RejeitarSolicitacaoDto dto)
    {
        var adminId = GetAdminId();
        var sol = await db.SolicitacoesAlteracao.FindAsync(id);

        if (sol is null) return NotFound(new { message = "Solicitação não encontrada." });
        if (sol.Status != StatusSolicitacao.Pendente)
            return BadRequest(new { message = "Solicitação já foi resolvida." });

        sol.Status = StatusSolicitacao.Rejeitada;
        sol.MotivoRejeicao = dto.Motivo;
        sol.Resolucao = DateTime.UtcNow;
        sol.IdAdminResolveu = adminId;

        await db.SaveChangesAsync();
        return Ok(new { message = "Solicitação rejeitada." });
    }

    // ── Gestão de Colmeias ────────────────────────────────────────────────

    [HttpGet("colmeias")]
    public async Task<IActionResult> ListarColmeias()
    {
        var lista = await db.Colmeias
            .Include(c => c.Localizacao)
            .OrderBy(c => c.Nome)
            .Select(c => new
            {
                c.Id,
                c.Nome,
                Localizacao = new
                {
                    c.Localizacao.Id,
                    c.Localizacao.Cidade,
                    c.Localizacao.Latitude,
                    c.Localizacao.Longitude,
                    c.Localizacao.Altitude,
                }
            })
            .ToListAsync();
        return Ok(lista);
    }

    [HttpPost("colmeias")]
    public async Task<IActionResult> CriarColmeia([FromBody] ColmeiaDto dto)
    {
        var loc = new Localizacao
        {
            Id = Guid.NewGuid(),
            Cidade = dto.Cidade,
            Latitude  = Math.Round(dto.Latitude,  7),
            Longitude = Math.Round(dto.Longitude, 7),
            Altitude  = Math.Round(dto.Altitude,  2),
        };
        var colmeia = new Colmeia
        {
            Id = Guid.NewGuid(),
            Nome = dto.Nome,
            IdLocalizacao = loc.Id,
        };
        db.Localizacoes.Add(loc);
        db.Colmeias.Add(colmeia);
        await db.SaveChangesAsync();
        return Created($"/api/admin/colmeias/{colmeia.Id}", new { colmeia.Id, colmeia.Nome });
    }

    [HttpPut("colmeias/{id:guid}")]
    public async Task<IActionResult> AtualizarColmeia(Guid id, [FromBody] ColmeiaDto dto)
    {
        var colmeia = await db.Colmeias.Include(c => c.Localizacao).FirstOrDefaultAsync(c => c.Id == id);
        if (colmeia is null) return NotFound(new { message = "Colmeia não encontrada." });

        colmeia.Nome = dto.Nome;
        colmeia.Localizacao.Cidade    = dto.Cidade;
        colmeia.Localizacao.Latitude  = Math.Round(dto.Latitude,  7);
        colmeia.Localizacao.Longitude = Math.Round(dto.Longitude, 7);
        colmeia.Localizacao.Altitude  = Math.Round(dto.Altitude,  2);

        await db.SaveChangesAsync();
        return Ok(new { message = "Colmeia atualizada." });
    }

    [HttpPatch("colmeias/{id:guid}/desativar")]
    public async Task<IActionResult> DesativarColmeia(Guid id)
    {
        var colmeia = await db.Colmeias.Include(c => c.Localizacao).FirstOrDefaultAsync(c => c.Id == id);
        if (colmeia is null) return NotFound(new { message = "Colmeia não encontrada." });

        // Soft-delete: renomeia com prefixo [INATIVA] para remover da seleção
        if (!colmeia.Nome.StartsWith("[INATIVA]"))
            colmeia.Nome = $"[INATIVA] {colmeia.Nome}";

        await db.SaveChangesAsync();
        return Ok(new { message = "Colmeia desativada." });
    }

    [HttpPatch("colmeias/{id:guid}/reativar")]
    public async Task<IActionResult> ReativarColmeia(Guid id)
    {
        var colmeia = await db.Colmeias.FirstOrDefaultAsync(c => c.Id == id);
        if (colmeia is null) return NotFound(new { message = "Colmeia não encontrada." });

        colmeia.Nome = colmeia.Nome.Replace("[INATIVA] ", "");
        await db.SaveChangesAsync();
        return Ok(new { message = "Colmeia reativada." });
    }
}
