namespace ColmeiaApi.Models;

public class Registro
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IdUsuario { get; set; }
    public Guid IdColmeia { get; set; }
    public DateTime DataHora { get; set; } = DateTime.UtcNow;
    public DateTime Criacao { get; set; } = DateTime.UtcNow;
    public DateTime? Atualizacao { get; set; }
    public DateTime? Exclusao { get; set; }
    public Usuario Usuario { get; set; } = null!;
    public Colmeia Colmeia { get; set; } = null!;
    public Leitura? Leitura { get; set; }
    public Saude? Saude { get; set; }
}
