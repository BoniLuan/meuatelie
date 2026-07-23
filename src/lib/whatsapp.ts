import { Linking } from 'react-native';

import { digitsOnly } from './format';

/**
 * Abre a conversa do WhatsApp com o número informado e uma mensagem opcional.
 * Assume DDI 55 (Brasil) quando o número tem só DDD + telefone.
 * Lança erro com mensagem amigável se não houver telefone.
 */
export async function openWhatsApp(phone?: string | null, message?: string): Promise<void> {
  const digits = digitsOnly(phone);
  if (!digits) throw new Error('Este cliente não tem telefone cadastrado.');

  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  const url = `https://wa.me/${withCountry}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

  try {
    await Linking.openURL(url);
  } catch {
    throw new Error('Não foi possível abrir o WhatsApp.');
  }
}

/** Monta uma mensagem padrão para avisar o cliente sobre o pedido. */
export function orderMessage(clientName: string | null | undefined, title: string): string {
  const hi = clientName ? `Olá, ${clientName}!` : 'Olá!';
  return `${hi} Passando para falar sobre o seu bordado: "${title}".`;
}
