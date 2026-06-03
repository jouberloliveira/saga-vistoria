import 'dotenv/config';
import { PGlite } from '@electric-sql/pglite';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), 'data', 'db');
fs.mkdirSync(DB_DIR, { recursive: true });

const pglite = new PGlite(DB_DIR);
const adapter = new PrismaPGlite(pglite);
const prisma = new PrismaClient({ adapter });

async function main() {
  const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pglite.exec(schemaSQL);

  const existing = await prisma.funcionario.findUnique({ where: { usuario: 'admin' } });
  if (existing) {
    console.log('Seed already applied, admin user exists.');
    return;
  }

  const senha_hash = await bcrypt.hash('admin123', 12);
  await prisma.funcionario.create({
    data: {
      nome: 'Administrador',
      usuario: 'admin',
      senha_hash,
      ativo: true,
      role: 'admin',
    },
  });

  console.log('Seed complete. Admin user created: admin / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
