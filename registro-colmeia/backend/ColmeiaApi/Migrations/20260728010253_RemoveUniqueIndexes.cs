using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColmeiaApi.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUniqueIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove o índice único do CPF (permite múltiplas contas com mesmo CPF se desativadas)
            migrationBuilder.Sql("DROP INDEX IF EXISTS `IX_Usuario_cpf` ON `Usuario`;");
            migrationBuilder.Sql("CREATE INDEX `IX_Usuario_cpf` ON `Usuario` (`cpf`);");
            // E-mail continua único — mantém o índice existente
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS `IX_Usuario_cpf` ON `Usuario`;");
            migrationBuilder.Sql("CREATE UNIQUE INDEX `IX_Usuario_cpf` ON `Usuario` (`cpf`);");
        }
    }
}
