namespace ColmeiaApi.Models;

public class Colmeia
{
    public Guid Id { get; set; }
    public Guid IdLocalizacao { get; set; }
    public string Nome { get; set; } = "";
    public Localizacao Localizacao { get; set; } = null!;
    public ICollection<Sensor> Sensores { get; set; } = [];
    public ICollection<Saude> Saudes { get; set; } = [];
}
