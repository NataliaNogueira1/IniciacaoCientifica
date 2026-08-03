flowchart TD
    U([Usuário]) -->|Acessa via URL| Nav[Navegador Web]
    
    Nav -->|HTTP :80| Nginx[Servidor Nginx\nProxy Reverso]
    
    subgraph Roteamento Nginx
        Nginx --> Cond{Avalia URI}
        Cond -->|Prefixo /api/*| B[Backend\nASP.NET Core]
        Cond -->|Demais rotas /*| F[Frontend\nNext.js Server]
    end

    F -->|Requisições API| B
    B -->|Consultas SQL - EF Core| D[(MariaDB)]