1. Diagrama de banco de dados
    ```mermaid
        classDiagram
        
        class Localizacao {
            +id: UUID
            +cidade: string
            +latitude: decimal(9,6)
            +longitude: decimal(9,6)
            +altitude: decimal(7,2)
        }
        
        class Colmeia {
            +id: UUID
            +idLocalizacao: UUID
            +nome: string
        }
        
        class RegistroSensor {
            +id: UUID
            +idColmeia: UUID
            +dataHora: datetime
            +temperaturaInterna: decimal(5,2)
            +temperaturaExterna: decimal(5,2)
            +umidadeInterna: decimal(5,2)
            +umidadeExterna: decimal(5,2)
            +pressaoAtmosferica: decimal(6,2)
            +velocidadeVento: decimal(5,2)
            +peso: decimal(6,2)
        }
        
        class RegistroSaude {
            +id: UUID
            +idColmeia: UUID
            +idRegistroSensor: UUID
            +dataHora: datetime
            +presencaRainha: boolean
            +comida: enum[ABUNDANTE, ADEQUADO, BAIXO, CRITICO]
            +condicaoClimatica: enum[ENSOLARADO, NUBLADO, CHUVOSO, TEMPESTADE]
            +saudavel: boolean
            +observacoes: string
        }
        

            Localizacao "1" --> "0..*" Colmeia
            Colmeia "1" --> "0..*" RegistroSensor
            Colmeia "1" --> "0..*" RegistroSaude
            RegistroSensor "1" --> "1" RegistroSaude

    ```
