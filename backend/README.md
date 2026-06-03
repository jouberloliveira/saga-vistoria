# SAGA Vistoria — Backend

API REST para o Sistema de Vistoria Prévia Veicular.

## Setup

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

API rodando em `http://localhost:3001`

## Credenciais padrão
- Usuário: `admin`
- Senha: `admin123`

## Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /auth/login | Login |
| GET | /auth/me | Usuário logado |
| GET | /vistorias | Listar vistorias |
| POST | /vistorias | Nova vistoria |
| GET | /vistorias/:id | Detalhe |
| PATCH | /vistorias/:id | Atualizar |
| POST | /vistorias/:id/finalizar | Finalizar + assinaturas |
| GET | /vistorias/:id/pdf | Comprovante PDF |
| POST | /vistorias/:id/fotos | Upload foto |
| GET | /funcionarios | Listar funcionários (admin) |
| POST | /funcionarios | Criar funcionário (admin) |
| PATCH | /funcionarios/:id | Editar funcionário (admin) |
