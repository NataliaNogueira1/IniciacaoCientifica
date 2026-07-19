using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColmeiaApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUsuarioEmoji : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "emoji",
                table: "Usuario",
                type: "varchar(10)",
                maxLength: 10,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "emoji",
                table: "Usuario");
        }
    }
}
