-- PGlite initialization schema
-- Applied at server startup if tables don't exist

CREATE TABLE IF NOT EXISTS "Funcionario" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "usuario" TEXT NOT NULL,
  "senha_hash" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "role" TEXT NOT NULL DEFAULT 'funcionario',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Funcionario_usuario_key" ON "Funcionario"("usuario");

CREATE TABLE IF NOT EXISTS "Cliente" (
  "id" TEXT PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "documento" TEXT NOT NULL,
  "telefone" TEXT,
  "email" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Cliente_documento_key" ON "Cliente"("documento");

CREATE TABLE IF NOT EXISTS "Veiculo" (
  "id" TEXT PRIMARY KEY,
  "placa" TEXT NOT NULL,
  "marca" TEXT NOT NULL,
  "modelo" TEXT NOT NULL,
  "ano" INTEGER NOT NULL,
  "cor" TEXT NOT NULL,
  "chassi" TEXT,
  "quilometragem" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "Veiculo_placa_key" ON "Veiculo"("placa");

CREATE TABLE IF NOT EXISTS "Vistoria" (
  "id" TEXT PRIMARY KEY,
  "veiculo_id" TEXT NOT NULL REFERENCES "Veiculo"("id"),
  "cliente_id" TEXT NOT NULL REFERENCES "Cliente"("id"),
  "funcionario_id" TEXT NOT NULL REFERENCES "Funcionario"("id"),
  "data_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_fim" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'rascunho',
  "observacoes_gerais" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Pneu" (
  "id" TEXT PRIMARY KEY,
  "vistoria_id" TEXT NOT NULL REFERENCES "Vistoria"("id"),
  "posicao" TEXT NOT NULL,
  "estado" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Dano" (
  "id" TEXT PRIMARY KEY,
  "vistoria_id" TEXT NOT NULL REFERENCES "Vistoria"("id"),
  "tipo" TEXT NOT NULL,
  "localizacao" TEXT NOT NULL,
  "gravidade" TEXT NOT NULL,
  "descricao" TEXT
);

CREATE TABLE IF NOT EXISTS "ItemFaltante" (
  "id" TEXT PRIMARY KEY,
  "vistoria_id" TEXT NOT NULL REFERENCES "Vistoria"("id"),
  "nome" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Foto" (
  "id" TEXT PRIMARY KEY,
  "vistoria_id" TEXT NOT NULL REFERENCES "Vistoria"("id"),
  "dano_id" TEXT REFERENCES "Dano"("id"),
  "caminho" TEXT NOT NULL,
  "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "funcionario_id" TEXT NOT NULL REFERENCES "Funcionario"("id")
);

CREATE TABLE IF NOT EXISTS "Assinatura" (
  "id" TEXT PRIMARY KEY,
  "vistoria_id" TEXT NOT NULL REFERENCES "Vistoria"("id"),
  "tipo" TEXT NOT NULL,
  "imagem_base64" TEXT NOT NULL,
  "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "tabela" TEXT NOT NULL,
  "registro_id" TEXT NOT NULL,
  "acao" TEXT NOT NULL,
  "funcionario_id" TEXT REFERENCES "Funcionario"("id"),
  "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dados_anteriores" TEXT
);
