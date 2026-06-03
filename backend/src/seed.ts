import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from './utils/prisma';

async function main() {
  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.funcionario.upsert({
    where: { usuario: 'admin' },
    create: { nome: 'Administrador SAGA', usuario: 'admin', senhaHash: adminHash, role: 'admin' },
    update: {}
  });
  console.log('Seed concluído. Admin: admin/admin123');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
