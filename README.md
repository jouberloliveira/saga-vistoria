# SAGA Vistoria Prévia Veicular

Sistema de Vistoria Prévia Veicular para Concessionária SAGA.

## Stack

- **Backend**: Node.js + Express + TypeScript + Prisma + @electric-sql/pglite (PostgreSQL embedded)
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Assinaturas**: signature_pad
- **PDF**: @react-pdf/renderer

## Estrutura

```
saga-vistoria/
├── backend/        # API REST
├── frontend/       # SPA React
└── docs/           # Documentação
```

## Funcionalidades (v1.0)

- Login de funcionários com JWT
- Cadastro de veículo e cliente
- Registro de estado: pneus, amassados, arranhados, sujeira, itens faltantes
- Upload de fotos associadas a danos
- Assinatura digital (funcionário + cliente)
- Vistoria imutável após assinatura
- Comprovante em PDF
- Busca e histórico de vistorias
- Operação offline (banco embarcado)
