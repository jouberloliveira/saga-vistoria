import { PGlite } from '@electric-sql/pglite';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';
import fs from 'fs';
import path from 'path';

export const auditContext = new AsyncLocalStorage<{ funcionarioId: string }>();

const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), 'data', 'db');
fs.mkdirSync(DB_DIR, { recursive: true });

export const pglite = new PGlite(DB_DIR);
const adapter = new PrismaPGlite(pglite);

// Base client — used internally for audit log writes and pre-reads to avoid extension recursion
const _prisma = new PrismaClient({ adapter });

const AUDITED_MODELS = new Set([
  'Funcionario', 'Cliente', 'Veiculo', 'Vistoria',
  'Pneu', 'Dano', 'ItemFaltante', 'Foto', 'Assinatura',
]);

function lcFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

async function logAudit(
  model: string,
  acao: string,
  registroId: string | null,
  dadosAnteriores: unknown,
): Promise<void> {
  if (!registroId) return;
  const ctx = auditContext.getStore();
  try {
    await _prisma.auditLog.create({
      data: {
        tabela: model,
        registro_id: registroId,
        acao,
        funcionario_id: ctx?.funcionarioId ?? null,
        dados_anteriores: dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
      },
    });
  } catch {
    // non-blocking — never fail the main operation due to audit errors
  }
}

async function preRead(model: string, id: string): Promise<unknown> {
  try {
    const repo = (_prisma as unknown as Record<string, { findUnique: (a: unknown) => Promise<unknown> }>)[lcFirst(model)];
    return await repo.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

// Extended client exposed to the rest of the application
export const prisma = _prisma.$extends({
  query: {
    $allModels: {
      async create({ model, args, query }) {
        const result = await query(args) as Record<string, unknown>;
        if (AUDITED_MODELS.has(model)) {
          void logAudit(model, 'create', (result?.id as string) ?? null, null);
        }
        return result;
      },
      async update({ model, args, query }) {
        const id = (args.where as Record<string, unknown>)?.id as string | undefined;
        const before = AUDITED_MODELS.has(model) && id ? await preRead(model, id) : null;
        const result = await query(args);
        if (AUDITED_MODELS.has(model)) {
          void logAudit(model, 'update', id ?? null, before);
        }
        return result;
      },
      async delete({ model, args, query }) {
        const id = (args.where as Record<string, unknown>)?.id as string | undefined;
        const before = AUDITED_MODELS.has(model) && id ? await preRead(model, id) : null;
        const result = await query(args);
        if (AUDITED_MODELS.has(model)) {
          void logAudit(model, 'delete', id ?? null, before);
        }
        return result;
      },
    },
  },
});

export async function initDb(): Promise<void> {
  await pglite.waitReady;
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, '../../prisma/schema.sql'),
    'utf-8',
  );
  await pglite.exec(schemaSQL);
}

// Expose base prisma for operations that must bypass audit (e.g. audit log itself)
export { _prisma as rawPrisma };
