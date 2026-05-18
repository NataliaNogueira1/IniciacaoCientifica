namespace ColmeiaApi.Models;

public class Sensor
{
    public Guid Id { get; set; }
    public Guid IdColmeia { get; set; }
    public string Tipo { get; set; } = "";
    public Colmeia Colmeia { get; set; } = null!;
    public ICollection<Leitura> Leituras { get; set; } = [];
}
