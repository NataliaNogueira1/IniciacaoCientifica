namespace ColmeiaApi.Models;

public class Saude
{
    public Guid IdRegistro { get; set; }
    public Guid IdColmeia { get; set; }
    public bool PresencaRainha { get; set; }
    public bool PresencaPredador { get; set; }
    public string? TipoPredador { get; set; }
    public string Comida { get; set; } = "";
    public string CondicaoClimatica { get; set; } = "";
    public bool Saudavel { get; set; }
    public string? Observacoes { get; set; }
    public Registro Registro { get; set; } = null!;
    public Colmeia Colmeia { get; set; } = null!;
}
