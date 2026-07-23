import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { clients, orderPhotos, orders } from '@/db/schema';
import { now } from '@/lib/format';

export type OrderInput = {
  clientId: number | null;
  title: string;
  description?: string | null;
  dueDate?: number | null;
  price: number;
  status: string;
};

/** Lista reativa de pedidos com o nome do cliente. */
export const ordersListQuery = db
  .select({
    id: orders.id,
    title: orders.title,
    status: orders.status,
    dueDate: orders.dueDate,
    price: orders.price,
    clientName: clients.name,
  })
  .from(orders)
  .leftJoin(clients, eq(orders.clientId, clients.id))
  .orderBy(desc(orders.createdAt));

export function orderByIdQuery(id: number) {
  return db.select().from(orders).where(eq(orders.id, id));
}

/** Pedidos de um cliente (mais recentes primeiro). */
export function ordersByClientQuery(clientId: number) {
  return db
    .select({
      id: orders.id,
      title: orders.title,
      status: orders.status,
      dueDate: orders.dueDate,
      price: orders.price,
    })
    .from(orders)
    .where(eq(orders.clientId, clientId))
    .orderBy(desc(orders.createdAt));
}

export function getOrder(id: number) {
  return db.select().from(orders).where(eq(orders.id, id)).get();
}

export function orderPhotosQuery(orderId: number) {
  return db
    .select()
    .from(orderPhotos)
    .where(eq(orderPhotos.orderId, orderId))
    .orderBy(desc(orderPhotos.createdAt));
}

export function createOrder(data: OrderInput): number {
  const ts = now();
  const inserted = db
    .insert(orders)
    .values({
      clientId: data.clientId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      dueDate: data.dueDate ?? null,
      price: data.price || 0,
      status: data.status,
      createdAt: ts,
      updatedAt: ts,
    })
    .returning({ id: orders.id })
    .get();
  return inserted!.id;
}

export function updateOrder(id: number, data: OrderInput) {
  return db
    .update(orders)
    .set({
      clientId: data.clientId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      dueDate: data.dueDate ?? null,
      price: data.price || 0,
      status: data.status,
      updatedAt: now(),
    })
    .where(eq(orders.id, id))
    .run();
}

export function updateOrderStatus(id: number, status: string) {
  return db.update(orders).set({ status, updatedAt: now() }).where(eq(orders.id, id)).run();
}

export function deleteOrder(id: number) {
  return db.delete(orders).where(eq(orders.id, id)).run();
}

export function addOrderPhoto(orderId: number, uri: string) {
  return db.insert(orderPhotos).values({ orderId, uri, createdAt: now() }).run();
}

export function removeOrderPhoto(id: number) {
  return db.delete(orderPhotos).where(eq(orderPhotos.id, id)).run();
}
