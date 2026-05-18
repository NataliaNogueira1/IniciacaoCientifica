CREATE DATABASE IF NOT EXISTS colmeia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE colmeia;

CREATE TABLE Localizacao (
    id          CHAR(36)       NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    cidade      VARCHAR(100)   NOT NULL,
    latitude    DECIMAL(10,7)  NOT NULL,
    longitude   DECIMAL(10,7)  NOT NULL,
    altitude    DECIMAL(8,2)   NOT NULL
);

CREATE TABLE Colmeia (
    id              CHAR(36)     NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    idLocalizacao   CHAR(36)     NOT NULL,
    nome            VARCHAR(100) NOT NULL,
    CONSTRAINT fk_colmeia_loc FOREIGN KEY (idLocalizacao) REFERENCES Localizacao(id)
);

CREATE TABLE Sensor (
    id          CHAR(36)    NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    idColmeia   CHAR(36)    NOT NULL,
    tipo        ENUM('TEMPERATURA','UMIDADE','PRESSAO','VENTO','PESO') NOT NULL,
    CONSTRAINT fk_sensor_col FOREIGN KEY (idColmeia) REFERENCES Colmeia(id)
);

CREATE TABLE Registro (
    id          CHAR(36)    NOT NULL DEFAULT (UUID()) PRIMARY KEY,
    dataHora    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Leitura (
    idRegistro          CHAR(36)      NOT NULL PRIMARY KEY,
    idSensor            CHAR(36)      NOT NULL,
    temperaturaInterna  DECIMAL(5,2)  NULL,
    temperaturaExterna  DECIMAL(5,2)  NULL,
    umidadeInterna      DECIMAL(5,2)  NULL,
    umidadeExterna      DECIMAL(5,2)  NULL,
    pressaoAtmosferica  DECIMAL(7,2)  NULL,
    velocidadeVento     DECIMAL(6,2)  NULL,
    peso                DECIMAL(7,3)  NULL,
    CONSTRAINT fk_leitura_reg FOREIGN KEY (idRegistro) REFERENCES Registro(id),
    CONSTRAINT fk_leitura_sen FOREIGN KEY (idSensor)   REFERENCES Sensor(id)
);

CREATE TABLE Saude (
    idRegistro          CHAR(36)    NOT NULL PRIMARY KEY,
    idColmeia           CHAR(36)    NOT NULL,
    presencaRainha      BOOLEAN     NOT NULL,
    presencaPredador    BOOLEAN     NOT NULL,
    tipoPredador        ENUM('FORMIGAS','LAGARTIXAS','FORIDEO','OUTROS') NULL,
    comida              ENUM('ABUNDANTE','ADEQUADO','BAIXO','CRITICO')   NOT NULL,
    condicaoClimatica   ENUM('ENSOLARADO','NUBLADO','CHUVOSO','TEMPESTADE') NOT NULL,
    saudavel            BOOLEAN     NOT NULL,
    observacoes         TEXT        NULL,
    CONSTRAINT fk_saude_reg FOREIGN KEY (idRegistro) REFERENCES Registro(id),
    CONSTRAINT fk_saude_col FOREIGN KEY (idColmeia)  REFERENCES Colmeia(id)
);

INSERT INTO Localizacao (id, cidade, latitude, longitude, altitude) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Florianopolis, SC', -27.5954, -48.5480, 12),
  ('11111111-0000-0000-0000-000000000002', 'Curitiba, PR',      -25.4284, -49.2733, 934),
  ('11111111-0000-0000-0000-000000000003', 'Porto Alegre, RS',  -30.0346, -51.2177, 10),
  ('11111111-0000-0000-0000-000000000004', 'Sao Paulo, SP',     -23.5505, -46.6333, 760);

INSERT INTO Colmeia (id, idLocalizacao, nome) VALUES
  ('22222222-0000-0000-0000-000000000001', '11111111-0000-0000-0000-000000000001', 'SENAI-SOR-1'),
  ('22222222-0000-0000-0000-000000000002', '11111111-0000-0000-0000-000000000002', 'COL-002'),
  ('22222222-0000-0000-0000-000000000003', '11111111-0000-0000-0000-000000000003', 'COL-003'),
  ('22222222-0000-0000-0000-000000000004', '11111111-0000-0000-0000-000000000004', 'COL-004');

INSERT INTO Sensor (id, idColmeia, tipo) VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'TEMPERATURA'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'TEMPERATURA'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'TEMPERATURA'),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'TEMPERATURA');
