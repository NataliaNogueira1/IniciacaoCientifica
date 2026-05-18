namespace ColmeiaApi.DTOs;

public record RegistroDto(
    string Colmeia,
    DateTime DataHora,
    decimal? TemperaturaInterna,
    decimal? TemperaturaExterna,
    decimal? UmidadeInterna,
    decimal? UmidadeExterna,
    decimal? PressaoAtmosferica,
    decimal? VelocidadeVento,
    decimal? Peso,
    bool PresencaRainha,
    bool PresencaPredador,
    string? TipoPredador,
    string Comida,
    string CondicaoClimatica,
    bool Saudavel,
    string? Observacoes
);
