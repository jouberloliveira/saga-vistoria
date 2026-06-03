import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './database';

const adminId = uuidv4();
const inspectorId = uuidv4();
const passwordHash = bcrypt.hashSync('senha123', 10);

const seedEmployees = db.prepare(`
  INSERT OR IGNORE INTO employees (id, name, email, password_hash, role)
  VALUES (?, ?, ?, ?, ?)
`);

seedEmployees.run(adminId, 'Administrador SAGA', 'admin@saga.com.br', passwordHash, 'admin');
seedEmployees.run(inspectorId, 'Vistoriador Padrão', 'vistoriador@saga.com.br', passwordHash, 'inspector');

const vehicleId = uuidv4();
db.prepare(`
  INSERT OR IGNORE INTO vehicles (id, plate, brand, model, year, color)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(vehicleId, 'ABC-1234', 'Toyota', 'Corolla', 2022, 'Prata');

console.log('Seed concluído.');
console.log('Admin: admin@saga.com.br / senha123');
console.log('Inspector: vistoriador@saga.com.br / senha123');
