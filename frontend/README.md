# SAGA Vistoria — Frontend

Sistema de Vistoria Prévia Veicular. React 18 + TypeScript + Vite + Tailwind CSS.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- React Router v6
- TanStack Query v5
- signature_pad (assinaturas digitais)
- axios
- react-hot-toast
- Lucide React

## Setup

```bash
cd frontend
cp .env.example .env
# Edite VITE_API_URL se o backend rodar em porta diferente de 3001
npm install
npm run dev
```

O app sobe em http://localhost:5173.

## Variáveis de ambiente

| Variável       | Padrão                    | Descrição                     |
|----------------|---------------------------|-------------------------------|
| VITE_API_URL   | http://localhost:3001     | URL base do backend REST      |

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento (porta 5173)
npm run build    # Build de produção → dist/
npm run preview  # Visualizar build local
npm run lint     # ESLint
```

## Funcionalidades

- **Login** — JWT armazenado em localStorage, interceptor automático
- **Dashboard** — contadores do dia, lista recente de vistorias
- **Nova Vistoria (wizard 8 etapas)**
  - Dados do veículo
  - Dados do cliente (CPF/CNPJ com máscara)
  - Estado dos pneus (5 pneus × 4 status)
  - Danos (tipo, gravidade, localização, descrição)
  - Sujeira e itens faltantes
  - Upload de fotos (drag-and-drop + câmera mobile)
  - Revisão completa com edição rápida por etapa
  - Assinaturas digitais via canvas (funcionário + cliente)
- **Detalhe de Vistoria** — leitura + download PDF
- **Histórico** — filtros de busca, tabela paginada
- **Admin: Funcionários** — CRUD + ativar/desativar (role admin)

## Design

- Cores: azul `#1e3a5f` (primário) e laranja `#f97316` (destaque)
- Tipografia: Inter
- Responsivo: desktop e tablet/mobile
- Botões ≥ 44px (touch-friendly)
- Focus ring acessível
