using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColmeiaApi.Migrations
{
    /// <inheritdoc />
    public partial class AddReprovado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Reprovado",
                table: "Usuario",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Reprovado",
                table: "Usuario");
        }
    }
}
