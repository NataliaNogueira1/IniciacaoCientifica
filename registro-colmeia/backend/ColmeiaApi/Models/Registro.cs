namespace ColmeiaApi.Models;

public class Registro
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime DataHora { get; set; } = DateTime.UtcNow;
    public Leitura? Leitura { get; set; }
    public Saude? Saude { get; set; }
}
