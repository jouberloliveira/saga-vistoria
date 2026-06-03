import Database, { Database as BetterDatabase } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH ?? './data/saga-vistoria.db';

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: BetterDatabase = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const migrations = `
  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'inspector' CHECK(role IN ('admin','inspector')),
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    plate TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
    employee_id TEXT NOT NULL REFERENCES employees(id),
    client_name TEXT NOT NULL,
    client_cpf TEXT NOT NULL,
    mileage INTEGER,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','signed','cancelled')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    signed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS inspection_items (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'low' CHECK(severity IN ('low','medium','high')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    item_id TEXT REFERENCES inspection_items(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS signatures (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('employee','client')),
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(inspection_id, type)
  );
`;

db.exec(migrations);

export default db;
