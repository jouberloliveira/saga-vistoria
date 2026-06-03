# SAGA Vistoria — Backend

API REST para o Sistema de Vistoria Prévia Veicular SAGA.

## Stack

- Node.js + Express + TypeScript
- Prisma ORM com `@electric-sql/pglite` (PostgreSQL embarcado, sem servidor externo)
- JWT (8h) + bcrypt
- multer (upload de fotos)
- pdfmake (geração de PDF)

## Setup

### 1. Instalar dependências e gerar o cliente Prisma

```bash
cd backend
npm install
```

`prisma generate` roda automaticamente via `postinstall`.

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite JWT_SECRET com um valor seguro em produção
```

### 3. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

O servidor sobe em `http://localhost:3001`.

Na primeira execução, o schema é criado automaticamente no banco PGlite (arquivo local em `./data/db/`) e o usuário admin padrão é criado.

**Admin padrão:** `admin` / `admin123` — **troque a senha imediatamente em produção.**

### 4. Build de produção

```bash
npm run build
npm start
```

### 5. Seed manual (opcional)

```bash
npm run seed
```

### 6. Backup manual

```bash
npm run backup
```

O servidor também realiza backup automático a cada 1h, mantendo os últimos 7 dias em `./backups/`.

## Variáveis de Ambiente

| Variável       | Padrão              | Descrição                        |
|----------------|---------------------|----------------------------------|
| `PORT`         | `3001`              | Porta do servidor HTTP           |
| `JWT_SECRET`   | *(inseguro)*        | Segredo para assinar tokens JWT  |
| `DB_DIR`       | `./data/db`         | Diretório dos arquivos PGlite    |
| `BACKUP_DIR`   | `./backups`         | Diretório de backups             |
| `UPLOAD_DIR`   | `./uploads`         | Diretório de fotos enviadas      |
| `DATABASE_URL` | *(placeholder)*     | Necessário apenas para CLI Prisma|

## Endpoints

### Auth
| Método | Rota        | Descrição             | Auth |
|--------|-------------|-----------------------|------|
| POST   | /auth/login | Login, retorna JWT    | —    |
| GET    | /auth/me    | Dados do usuário atual| ✓    |

### Funcionários *(admin only)*
| Método | Rota               | Descrição         |
|--------|--------------------|-------------------|
| GET    | /funcionarios      | Listar            |
| POST   | /funcionarios      | Criar             |
| PATCH  | /funcionarios/:id  | Atualizar         |

### Vistorias
| Método | Rota                       | Descrição                          |
|--------|----------------------------|------------------------------------|
| POST   | /vistorias                 | Criar (cria/upsert veículo/cliente)|
| GET    | /vistorias                 | Listar (filtros: placa/cliente/data/funcionario) |
| GET    | /vistorias/:id             | Detalhe completo                   |
| PATCH  | /vistorias/:id             | Atualizar (apenas rascunho)        |
| POST   | /vistorias/:id/finalizar   | Finalizar com assinaturas          |
| GET    | /vistorias/:id/pdf         | Download do PDF                    |

### Pneus, Danos, Itens Faltantes *(nested em vistorias)*
```
GET    /vistorias/:id/pneus
POST   /vistorias/:id/pneus
PATCH  /vistorias/:id/pneus/:pneuId
DELETE /vistorias/:id/pneus/:pneuId

GET    /vistorias/:id/danos
POST   /vistorias/:id/danos
PATCH  /vistorias/:id/danos/:danoId
DELETE /vistorias/:id/danos/:danoId

GET    /vistorias/:id/itens-faltantes
POST   /vistorias/:id/itens-faltantes
DELETE /vistorias/:id/itens-faltantes/:itemId
```

### Fotos
| Método | Rota                      | Descrição                        |
|--------|---------------------------|----------------------------------|
| POST   | /vistorias/:id/fotos      | Upload multipart (campo: `foto`) |
| GET    | /fotos/:id                | Retorna imagem                   |

## Autenticação

Todos os endpoints (exceto `/auth/login`) exigem:
```
Authorization: Bearer <token>
```

## Exemplos

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin123"}'
```

### Criar Vistoria
```bash
curl -X POST http://localhost:3001/vistorias \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "veiculo": {"placa":"ABC1234","marca":"Toyota","modelo":"Corolla","ano":2020,"cor":"Prata"},
    "cliente": {"nome":"João Silva","documento":"123.456.789-00","telefone":"(11)99999-9999"},
    "pneus": [
      {"posicao":"DE","estado":"bom"},
      {"posicao":"DD","estado":"bom"},
      {"posicao":"TE","estado":"desgastado"},
      {"posicao":"TD","estado":"bom"},
      {"posicao":"ESTEPE","estado":"bom"}
    ]
  }'
```
