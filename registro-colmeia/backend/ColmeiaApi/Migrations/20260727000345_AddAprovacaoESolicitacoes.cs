using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColmeiaApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAprovacaoESolicitacoes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Coluna pode já existir se a migration anterior falhou parcialmente
            migrationBuilder.Sql(@"
                ALTER TABLE `Usuario`
                ADD COLUMN IF NOT EXISTS `aprovado` tinyint(1) NOT NULL DEFAULT FALSE;
            ");

            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS `SolicitacaoAlteracao` (
                    `id`               char(36)         NOT NULL COLLATE ascii_general_ci,
                    `idRegistro`       char(36)         NOT NULL COLLATE ascii_general_ci,
                    `idUsuario`        char(36)         NOT NULL COLLATE ascii_general_ci,
                    `tipo`             varchar(10)      NOT NULL,
                    `status`           varchar(15)      NOT NULL,
                    `dadosNovos`       text             NULL,
                    `motivoRejeicao`   varchar(500)     NULL,
                    `criacao`          datetime(6)      NOT NULL,
                    `resolucao`        datetime(6)      NULL,
                    `idAdminResolveu`  char(36)         NULL COLLATE ascii_general_ci,
                    CONSTRAINT `PK_SolicitacaoAlteracao` PRIMARY KEY (`id`),
                    CONSTRAINT `FK_SolicitacaoAlteracao_Registro_idRegistro`
                        FOREIGN KEY (`idRegistro`) REFERENCES `Registro` (`id`),
                    CONSTRAINT `FK_SolicitacaoAlteracao_Usuario_idUsuario`
                        FOREIGN KEY (`idUsuario`) REFERENCES `Usuario` (`id`),
                    INDEX `IX_SolicitacaoAlteracao_idRegistro` (`idRegistro`),
                    INDEX `IX_SolicitacaoAlteracao_idUsuario` (`idUsuario`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SolicitacaoAlteracao");

            migrationBuilder.Sql(@"
                ALTER TABLE `Usuario`
                DROP COLUMN IF EXISTS `aprovado`;
            ");
        }
    }
}
