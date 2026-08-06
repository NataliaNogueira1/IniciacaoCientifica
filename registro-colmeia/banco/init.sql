-- O banco e o usuário são criados pelas variáveis de ambiente do MariaDB.
-- As tabelas são criadas automaticamente pelo Entity Framework Migrations ao iniciar o backend.
-- Este arquivo existe apenas para garantir que o banco exista antes do backend conectar.
CREATE DATABASE IF NOT EXISTS colmeia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
