import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { orders, payments } from '@/db/schema';
import type { PaymentMethod } from '@/db/schema';

export type PaymentInput = {
  orderId: number;
  amount: number;
  method: PaymentMethod;
  paidAt: number;
  note?: string | null;
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
};

export const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  pix: 'qrcode',
  dinheiro: 'cash',
  cartao: 'credit-card-outline',
};

/** Pagamentos de um pedido (mais recentes primeiro). */
export function paymentsByOrderQuery(orderId: number) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .orderBy(desc(payments.paidAt));
}

/** Todos os pagamentos com o título do pedido (para o financeiro). */
export const allPaymentsQuery = db
  .select({
    id: payments.id,
    orderId: payments.orderId,
    amount: payments.amount,
    method: payments.method,
    paidAt: payments.paidAt,
    orderTitle: orders.title,
  })
  .from(payments)
  .leftJoin(orders, eq(payments.orderId, orders.id))
  .orderBy(desc(payments.paidAt));

export function createPayment(data: PaymentInput) {
  return db
    .insert(payments)
    .values({
      orderId: data.orderId,
      amount: data.amount,
      method: data.method,
      paidAt: data.paidAt,
      note: data.note?.trim() || null,
    })
    .run();
}

export function deletePayment(id: number) {
  return db.delete(payments).where(eq(payments.id, id)).run();
}

/** Situação de pagamento derivada de valor combinado x total pago. */
export function paymentSituation(price: number, paid: number): 'em_aberto' | 'parcial' | 'pago' {
  if (paid <= 0) return 'em_aberto';
  if (paid >= price) return 'pago';
  return 'parcial';
}
