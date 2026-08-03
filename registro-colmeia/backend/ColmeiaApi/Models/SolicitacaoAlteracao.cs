namespace ColmeiaApi.Models;

public enum TipoSolicitacao { Editar, Excluir }
public enum StatusSolicitacao { Pendente, Aprovada, Rejeitada }

public class SolicitacaoAlteracao
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid IdRegistro { get; set; }
    public Guid IdUsuario { get; set; }
    public TipoSolicitacao Tipo { get; set; }
    public StatusSolicitacao Status { get; set; } = StatusSolicitacao.Pendente;

    /// <summary>JSON com os novos dados (RegistroDto serializado) — preenchido só para Editar</summary>
    public string? DadosNovos { get; set; }

    public string? MotivoRejeicao { get; set; }
    public DateTime Criacao { get; set; } = DateTime.UtcNow;
    public DateTime? Resolucao { get; set; }
    public Guid? IdAdminResolveu { get; set; }

    public Registro Registro { get; set; } = null!;
    public Usuario Usuario { get; set; } = null!;
}
