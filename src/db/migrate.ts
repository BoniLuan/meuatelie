import { sqlite } from './client';

/**
 * Migrações simples versionadas por PRAGMA user_version.
 * Cada item do array é uma versão; para evoluir o schema, adicione um novo bloco no fim.
 * Mantém-se em sincronia com ./schema.ts.
 */
const MIGRATIONS: string[] = [
  // v1 — schema inicial
  `
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date INTEGER,
    price REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'a_fazer',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    uri TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    paid_at INTEGER NOT NULL,
    note TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_photos_order ON order_photos(order_id);
  CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
  `,
];

export function runMigrations(): void {
  sqlite.execSync('PRAGMA journal_mode = WAL;');
  sqlite.execSync('PRAGMA foreign_keys = ON;');

  const row = sqlite.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (let v = current; v < MIGRATIONS.length; v++) {
    sqlite.execSync(MIGRATIONS[v]);
    sqlite.execSync(`PRAGMA user_version = ${v + 1}`);
  }
}
