![senai_logo](https://transparencia.sp.senai.br/Content/img/logo-senai.png)

# Lista de exercícios 01: POO & UML

Profº.: Cainã Antunes Silva  
Faculdade de Tecnologia **SENAI Sorocaba**  
Tecnólogo em Análise e Desenvolvimento de Sistemas (ADS)
___


> O objetivo desta aula é exercitar a habilidade de abstrair objetos em classes utilizando-se notações em UML.  

O paradigma de desenvolvimento de software intitulado Programação Orientada à Objetos é uma ferramenta poderosa que auxilia na construção de sistemas complexos. A abstração é um recurso indispensável para programadores que almejam dominar esta poderosa técnica de programação. Além disso o uso de diagramas UML é indispensavel para representar estas abstrações e guiar os desenvolvidores na hora da implementação.

Para mais informações acesse [Aula 01: Paradigma POO.](https://cainaantunes.notion.site/Aula-01-Paradigma-POO-23fbde521b3b80149a11f08e9d1eac02?source=copy_link)

***


10. **Repositório Git:**<br>
Pense em como um sistema como o GitHub representa um repositório de código. Quais dados ele precisa manter? Que ações podem ser realizadas sobre ele?<br>
Modele esse objeto como uma classe UML.

    ```mermaid
        classDiagram
        class SaudeColmeja {
            -IdRegistro: int
            -IdColmeia: int
            -Latitude: int
            -Longitude: int
            -NomeUsuario: string
            -Data: date
            -Horario: time
            -Comida: binario
            -TemperaturaInterna: int
            -TemperaturaExterna: int
            -UmidadeInterna: int
            -UmidadeExterna: int
            -CondicaoClimatica: string
            -PresencaRainha: binario
            -PressaoAtmosferica: int
            -Saudável: binario
           +Create(id: int, nome: string, price: double, category: string):bool
            +Read(id: int): string
            +Update(nome: string, price: double, category: string):bool
            +Delete(id: int):bool
        }
    ```
