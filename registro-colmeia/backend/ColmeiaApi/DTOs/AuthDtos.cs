using System.ComponentModel.DataAnnotations;

namespace ColmeiaApi.DTOs;

public record RegisterDto(
    [Required, MaxLength(100)] string Nome,
    [Required, MaxLength(100)] string Sobrenome,
    [Required, MaxLength(14)] string Cpf,
    [Required, EmailAddress, MaxLength(200)] string Email,
    [Required, MinLength(6)] string Senha,
    DateOnly DataNascimento,
    [MaxLength(200)] string? Instituicao
);

public record LoginDto(
    [Required, EmailAddress] string Email,
    [Required] string Senha
);

public record AuthResponseDto(
    string Token,
    string Nome,
    string Email,
    string Permissao,
    string? Emoji
);
