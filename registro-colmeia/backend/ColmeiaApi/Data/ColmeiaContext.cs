using ColmeiaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ColmeiaApi.Data;

public class ColmeiaContext(DbContextOptions<ColmeiaContext> options) : DbContext(options)
{
    public DbSet<Localizacao> Localizacoes => Set<Localizacao>();
    public DbSet<Colmeia> Colmeias => Set<Colmeia>();
    public DbSet<Sensor> Sensores => Set<Sensor>();
    public DbSet<Registro> Registros => Set<Registro>();
    public DbSet<Leitura> Leituras => Set<Leitura>();
    public DbSet<Saude> Saudes => Set<Saude>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Localizacao>(e =>
        {
            e.ToTable("Localizacao");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.Cidade).HasColumnName("cidade").HasMaxLength(100);
            e.Property(x => x.Latitude).HasColumnName("latitude").HasPrecision(10, 7);
            e.Property(x => x.Longitude).HasColumnName("longitude").HasPrecision(10, 7);
            e.Property(x => x.Altitude).HasColumnName("altitude").HasPrecision(8, 2);
        });

        modelBuilder.Entity<Colmeia>(e =>
        {
            e.ToTable("Colmeia");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.IdLocalizacao).HasColumnName("idLocalizacao");
            e.Property(x => x.Nome).HasColumnName("nome").HasMaxLength(100);
            e.HasOne(x => x.Localizacao)
                .WithMany(x => x.Colmeias)
                .HasForeignKey(x => x.IdLocalizacao);
        });

        modelBuilder.Entity<Sensor>(e =>
        {
            e.ToTable("Sensor");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.IdColmeia).HasColumnName("idColmeia");
            e.Property(x => x.Tipo).HasColumnName("tipo").HasMaxLength(20);
            e.HasOne(x => x.Colmeia)
                .WithMany(x => x.Sensores)
                .HasForeignKey(x => x.IdColmeia);
        });

        modelBuilder.Entity<Registro>(e =>
        {
            e.ToTable("Registro");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.DataHora).HasColumnName("dataHora");
        });

        modelBuilder.Entity<Leitura>(e =>
        {
            e.ToTable("Leitura");
            e.HasKey(x => x.IdRegistro);
            e.Property(x => x.IdRegistro).HasColumnName("idRegistro");
            e.Property(x => x.IdSensor).HasColumnName("idSensor");
            e.Property(x => x.TemperaturaInterna).HasColumnName("temperaturaInterna").HasPrecision(5, 2);
            e.Property(x => x.TemperaturaExterna).HasColumnName("temperaturaExterna").HasPrecision(5, 2);
            e.Property(x => x.UmidadeInterna).HasColumnName("umidadeInterna").HasPrecision(5, 2);
            e.Property(x => x.UmidadeExterna).HasColumnName("umidadeExterna").HasPrecision(5, 2);
            e.Property(x => x.PressaoAtmosferica).HasColumnName("pressaoAtmosferica").HasPrecision(7, 2);
            e.Property(x => x.VelocidadeVento).HasColumnName("velocidadeVento").HasPrecision(6, 2);
            e.Property(x => x.Peso).HasColumnName("peso").HasPrecision(7, 3);
            e.HasOne(x => x.Registro)
                .WithOne(x => x.Leitura)
                .HasForeignKey<Leitura>(x => x.IdRegistro);
            e.HasOne(x => x.Sensor)
                .WithMany(x => x.Leituras)
                .HasForeignKey(x => x.IdSensor);
        });

        modelBuilder.Entity<Saude>(e =>
        {
            e.ToTable("Saude");
            e.HasKey(x => x.IdRegistro);
            e.Property(x => x.IdRegistro).HasColumnName("idRegistro");
            e.Property(x => x.IdColmeia).HasColumnName("idColmeia");
            e.Property(x => x.PresencaRainha).HasColumnName("presencaRainha");
            e.Property(x => x.PresencaPredador).HasColumnName("presencaPredador");
            e.Property(x => x.TipoPredador).HasColumnName("tipoPredador").HasMaxLength(20);
            e.Property(x => x.Comida).HasColumnName("comida").HasMaxLength(20);
            e.Property(x => x.CondicaoClimatica).HasColumnName("condicaoClimatica").HasMaxLength(20);
            e.Property(x => x.Saudavel).HasColumnName("saudavel");
            e.Property(x => x.Observacoes).HasColumnName("observacoes");
            e.HasOne(x => x.Registro)
                .WithOne(x => x.Saude)
                .HasForeignKey<Saude>(x => x.IdRegistro);
            e.HasOne(x => x.Colmeia)
                .WithMany(x => x.Saudes)
                .HasForeignKey(x => x.IdColmeia);
        });
    }
}
