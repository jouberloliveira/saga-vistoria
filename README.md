# SAGA Vistoria Prévia Veicular

Sistema de Vistoria Prévia Veicular para Concessionária SAGA.

## Stack

- **Backend**: Node.js + Express + TypeScript + better-sqlite3 (SQLite embarcado) + JWT
- **Frontend**: React + TypeScript + Vite + Tailwind CSS *(em desenvolvimento)*
- **Assinaturas**: signature_pad (Base64 → banco)
- **PDF**: @react-pdf/renderer *(roadmap)*

## Estrutura

```
saga-vistoria/
├── backend/        # API REST
│   ├── src/
│   │   ├── index.ts
│   │   ├── db/
│   │   │   ├── database.ts   # SQLite + migrations automáticas
│   │   │   └── seed.ts
│   │   ├── middleware/auth.ts # JWT
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── employees.ts
│   │   │   ├── vehicles.ts
│   │   │   ├── inspections.ts
│   │   │   └── photos.ts
│   │   └── types/index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/       # SPA React (em desenvolvimento)
└── docs/           # Documentação
```

## Funcionalidades (v1.0)

- Login de funcionários com JWT (8h de expiração)
- CRUD de veículos (busca por placa, marca, modelo)
- Vistorias com: itens de dano, upload de fotos, assinatura digital (Base64)
- Vistoria imutável após dupla assinatura (funcionário + cliente)
- Banco SQLite embarcado — sem dependências externas de infraestrutura
- Operação offline nativa

## Endpoints Principais

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET    | `/health` | Não | Health check |
| POST   | `/api/auth/login` | Não | Login |
| GET    | `/api/auth/me` | Sim | Perfil logado |
| GET/POST | `/api/employees` | Sim | Funcionários |
| GET/POST/PUT/DELETE | `/api/vehicles` | Sim | Veículos |
| GET/POST/PATCH | `/api/inspections` | Sim | Vistorias |
| POST   | `/api/inspections/:id/items` | Sim | Adicionar item de dano |
| POST   | `/api/inspections/:id/sign` | Sim | Assinar (employee/client) |
| POST   | `/api/inspections/:id/photos` | Sim | Upload foto |

## Como executar

### Pré-requisitos

- Node.js 18+

### Backend

```bash
cd backend

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e defina JWT_SECRET com um valor seguro

# Instalar dependências
npm install

# Popular banco com dados iniciais (opcional)
npm run seed

# Desenvolvimento (hot-reload)
npm run dev

# Produção
npm run build && npm start
```

A API estará disponível em `http://localhost:3000`.

### Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3000` | Porta da API |
| `JWT_SECRET` | — | **Obrigatório em produção** |
| `JWT_EXPIRES_IN` | `8h` | Validade do token JWT |
| `DATABASE_PATH` | `./data/saga-vistoria.db` | Caminho do banco SQLite |
| `UPLOADS_DIR` | `./uploads` | Diretório de fotos |

### Usuários padrão (após seed)

| Email | Senha | Papel |
|-------|-------|-------|
| `admin@saga.com.br` | `senha123` | admin |
| `vistoriador@saga.com.br` | `senha123` | inspector |

> **Atenção:** altere as senhas antes de usar em produção.

## Autenticação

Todas as rotas (exceto `/health` e `/api/auth/login`) exigem:

```
Authorization: Bearer <token>
```

Token obtido via `POST /api/auth/login`.
