import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * Esquema do banco (SQLite via Drizzle). Ver DDL correspondente em ./migrate.ts.
 * Datas em epoch milissegundos (INTEGER). Valores em reais (REAL).
 */

export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phone: text('phone'),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clientId: integer('client_id').references(() => clients.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: integer('due_date'),
  price: real('price').notNull().default(0),
  status: text('status').notNull().default('a_fazer'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const orderPhotos = sqliteTable('order_photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  uri: text('uri').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  method: text('method').notNull(),
  paidAt: integer('paid_at').notNull(),
  note: text('note'),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderPhoto = typeof orderPhotos.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type OrderStatus = 'a_fazer' | 'em_andamento' | 'pronto' | 'entregue' | 'cancelado';
export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao';
