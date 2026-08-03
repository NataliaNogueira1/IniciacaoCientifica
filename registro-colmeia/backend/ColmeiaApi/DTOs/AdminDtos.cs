using System.ComponentModel.DataAnnotations;

namespace ColmeiaApi.DTOs;

public record AlterarPermissaoDto(
    [Required] string Permissao
);

public record RejeitarSolicitacaoDto(
    [MaxLength(500)] string? Motivo
);

public record ColmeiaDto(
    [Required][MaxLength(100)] string Nome,
    [Required][MaxLength(100)] string Cidade,
    decimal Latitude,
    decimal Longitude,
    decimal Altitude
);
