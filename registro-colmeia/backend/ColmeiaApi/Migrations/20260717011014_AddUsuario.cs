using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColmeiaApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Localizacao",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    cidade = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    latitude = table.Column<decimal>(type: "decimal(10,7)", precision: 10, scale: 7, nullable: false),
                    longitude = table.Column<decimal>(type: "decimal(10,7)", precision: 10, scale: 7, nullable: false),
                    altitude = table.Column<decimal>(type: "decimal(8,2)", precision: 8, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Localizacao", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Usuario",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    nome = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sobrenome = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    cpf = table.Column<string>(type: "varchar(14)", maxLength: 14, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    email = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    senhaHash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    dataNascimento = table.Column<DateOnly>(type: "date", nullable: false),
                    instituicao = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    permissao = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ativo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    criacao = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ultimoLogin = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuario", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Colmeia",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    idLocalizacao = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    nome = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Colmeia", x => x.id);
                    table.ForeignKey(
                        name: "FK_Colmeia_Localizacao_idLocalizacao",
                        column: x => x.idLocalizacao,
                        principalTable: "Localizacao",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Registro",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    idUsuario = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    idColmeia = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    dataHoraObservacao = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    criacao = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    atualizacao = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    exclusao = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Registro", x => x.id);
                    table.ForeignKey(
                        name: "FK_Registro_Colmeia_idColmeia",
                        column: x => x.idColmeia,
                        principalTable: "Colmeia",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Registro_Usuario_idUsuario",
                        column: x => x.idUsuario,
                        principalTable: "Usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Sensor",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    idColmeia = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    tipo = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sensor", x => x.id);
                    table.ForeignKey(
                        name: "FK_Sensor_Colmeia_idColmeia",
                        column: x => x.idColmeia,
                        principalTable: "Colmeia",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Saude",
                columns: table => new
                {
                    idRegistro = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    idColmeia = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    presencaRainha = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    presencaPredador = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    tipoPredador = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    comida = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    condicaoClimatica = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    saudavel = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    observacoes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Saude", x => x.idRegistro);
                    table.ForeignKey(
                        name: "FK_Saude_Colmeia_idColmeia",
                        column: x => x.idColmeia,
                        principalTable: "Colmeia",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Saude_Registro_idRegistro",
                        column: x => x.idRegistro,
                        principalTable: "Registro",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Leitura",
                columns: table => new
                {
                    idRegistro = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    idSensor = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    temperaturaInterna = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    temperaturaExterna = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    umidadeInterna = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    umidadeExterna = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    pressaoAtmosferica = table.Column<decimal>(type: "decimal(7,2)", precision: 7, scale: 2, nullable: true),
                    velocidadeVento = table.Column<decimal>(type: "decimal(6,2)", precision: 6, scale: 2, nullable: true),
                    peso = table.Column<decimal>(type: "decimal(7,3)", precision: 7, scale: 3, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leitura", x => x.idRegistro);
                    table.ForeignKey(
                        name: "FK_Leitura_Registro_idRegistro",
                        column: x => x.idRegistro,
                        principalTable: "Registro",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Leitura_Sensor_idSensor",
                        column: x => x.idSensor,
                        principalTable: "Sensor",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Colmeia_idLocalizacao",
                table: "Colmeia",
                column: "idLocalizacao");

            migrationBuilder.CreateIndex(
                name: "IX_Leitura_idSensor",
                table: "Leitura",
                column: "idSensor");

            migrationBuilder.CreateIndex(
                name: "IX_Registro_idColmeia",
                table: "Registro",
                column: "idColmeia");

            migrationBuilder.CreateIndex(
                name: "IX_Registro_idUsuario",
                table: "Registro",
                column: "idUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Saude_idColmeia",
                table: "Saude",
                column: "idColmeia");

            migrationBuilder.CreateIndex(
                name: "IX_Sensor_idColmeia",
                table: "Sensor",
                column: "idColmeia");

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_cpf",
                table: "Usuario",
                column: "cpf",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_email",
                table: "Usuario",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Leitura");

            migrationBuilder.DropTable(
                name: "Saude");

            migrationBuilder.DropTable(
                name: "Sensor");

            migrationBuilder.DropTable(
                name: "Registro");

            migrationBuilder.DropTable(
                name: "Colmeia");

            migrationBuilder.DropTable(
                name: "Usuario");

            migrationBuilder.DropTable(
                name: "Localizacao");
        }
    }
}
