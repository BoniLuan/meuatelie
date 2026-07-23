import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 12.5 -> "R$ 12,50" */
export function formatMoney(value: number): string {
  return brl.format(value ?? 0);
}

/** Converte texto digitado ("12,50" ou "12.50") em número. Retorna NaN se inválido. */
export function parseMoney(text: string): number {
  if (!text) return NaN;
  const normalized = text.replace(/\s|R\$/g, '').replace(/\./g, '').replace(',', '.');
  return Number(normalized);
}

/** Número -> texto para campo de valor ("120.5" -> "120,5"). */
export function moneyToInput(value?: number | null): string {
  if (value == null || value === 0) return '';
  return String(value).replace('.', ',');
}

/** epoch ms -> "22/07/2026" */
export function formatDate(ms?: number | null): string {
  if (!ms) return '—';
  return dayjs(ms).format('DD/MM/YYYY');
}

/** epoch ms -> "jul de 2026" */
export function formatMonth(ms: number): string {
  return dayjs(ms).format('MMM [de] YYYY');
}

export function now(): number {
  return Date.now();
}

/** Só os dígitos do telefone (para montar link do WhatsApp). */
export function digitsOnly(text?: string | null): string {
  return (text ?? '').replace(/\D/g, '');
}
