import { asc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { clients } from '@/db/schema';
import { now } from '@/lib/format';

export type ClientInput = {
  name: string;
  phone?: string | null;
  notes?: string | null;
};

/** Query reativa (usar com useLiveQuery) — todos os clientes por nome. */
export const clientsQuery = db.select().from(clients).orderBy(asc(clients.name));

/** Query reativa de um cliente. */
export function clientByIdQuery(id: number) {
  return db.select().from(clients).where(eq(clients.id, id));
}

export function getClient(id: number) {
  return db.select().from(clients).where(eq(clients.id, id)).get();
}

export function createClient(data: ClientInput) {
  return db
    .insert(clients)
    .values({
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      notes: data.notes?.trim() || null,
      createdAt: now(),
    })
    .run();
}

export function updateClient(id: number, data: ClientInput) {
  return db
    .update(clients)
    .set({
      name: data.name.trim(),
      phone: data.phone?.trim() || null,
      notes: data.notes?.trim() || null,
    })
    .where(eq(clients.id, id))
    .run();
}

export function deleteClient(id: number) {
  return db.delete(clients).where(eq(clients.id, id)).run();
}
