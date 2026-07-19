using System.ComponentModel.DataAnnotations;

namespace ColmeiaApi.DTOs;

public record AtualizarPerfilDto(
    [Required, MaxLength(100)] string Nome,
    [Required, MaxLength(100)] string Sobrenome,
    [Required, EmailAddress, MaxLength(200)] string Email,
    DateOnly DataNascimento,
    [MaxLength(200)] string? Instituicao,
    [MaxLength(10)] string? Emoji,
    string? SenhaAtual,
    [MinLength(6)] string? NovaSenha
);

public record PerfilResponseDto(
    Guid Id,
    string Nome,
    string Sobrenome,
    string Cpf,
    string Email,
    DateOnly DataNascimento,
    string Instituicao,
    string Permissao,
    string? Emoji,
    DateTime Criacao,
    DateTime? UltimoLogin
);
