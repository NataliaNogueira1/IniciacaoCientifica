namespace ColmeiaApi.Models;

public class Leitura
{
    public Guid IdRegistro { get; set; }
    public Guid IdSensor { get; set; }
    public decimal? TemperaturaInterna { get; set; }
    public decimal? TemperaturaExterna { get; set; }
    public decimal? UmidadeInterna { get; set; }
    public decimal? UmidadeExterna { get; set; }
    public decimal? PressaoAtmosferica { get; set; }
    public decimal? VelocidadeVento { get; set; }
    public decimal? Peso { get; set; }
    public Registro Registro { get; set; } = null!;
    public Sensor Sensor { get; set; } = null!;
}
