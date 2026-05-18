namespace ColmeiaApi.Models;

public class Localizacao
{
    public Guid Id { get; set; }
    public string Cidade { get; set; } = "";
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public decimal Altitude { get; set; }
    public ICollection<Colmeia> Colmeias { get; set; } = [];
}
