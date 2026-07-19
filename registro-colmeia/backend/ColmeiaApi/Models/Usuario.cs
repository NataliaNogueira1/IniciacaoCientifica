namespace ColmeiaApi.Models;

public enum Permissao
{
    Pesquisador,
    Admin
}

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = "";
    public string Sobrenome { get; set; } = "";
    public string Cpf { get; set; } = "";
    public string Email { get; set; } = "";
    public string SenhaHash { get; set; } = "";
    public DateOnly DataNascimento { get; set; }
    public string Instituicao { get; set; } = "";
    public Permissao Permissao { get; set; } = Permissao.Pesquisador;
    public bool Ativo { get; set; } = true;
    public string? Emoji { get; set; }
    public DateTime Criacao { get; set; } = DateTime.UtcNow;
    public DateTime? UltimoLogin { get; set; }

    public ICollection<Registro> Registros { get; set; } = [];
}
