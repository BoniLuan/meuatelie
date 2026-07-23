import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { db } from '@/db/client';
import { clients, orderPhotos, orders, payments } from '@/db/schema';

type BackupData = {
  version: number;
  exportedAt: number;
  clients: (typeof clients.$inferInsert)[];
  orders: (typeof orders.$inferInsert)[];
  orderPhotos: (typeof orderPhotos.$inferInsert)[];
  payments: (typeof payments.$inferInsert)[];
};

/**
 * Exporta todos os dados para um arquivo JSON e abre o menu de compartilhar
 * (salvar no Drive, enviar por WhatsApp, etc). As fotos ficam no aparelho e
 * não são incluídas no arquivo.
 */
export async function exportData(): Promise<void> {
  const data: BackupData = {
    version: 1,
    exportedAt: Date.now(),
    clients: db.select().from(clients).all(),
    orders: db.select().from(orders).all(),
    orderPhotos: db.select().from(orderPhotos).all(),
    payments: db.select().from(payments).all(),
  };

  const json = JSON.stringify(data, null, 2);
  const stamp = new Date().toISOString().slice(0, 10);
  const fileUri = `${FileSystem.cacheDirectory}meu-atelie-backup-${stamp}.json`;
  await FileSystem.writeAsStringAsync(fileUri, json);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartilhamento não disponível neste aparelho.');
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Salvar backup do Meu Ateliê',
  });
}

/**
 * Importa um backup JSON escolhido pela usuária, SUBSTITUINDO todos os dados atuais.
 * Retorna a quantidade de pedidos restaurados, ou -1 se a usuária cancelar.
 */
export async function importData(): Promise<number> {
  const res = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (res.canceled) return -1;

  const raw = await FileSystem.readAsStringAsync(res.assets[0].uri);
  let data: BackupData;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('Arquivo inválido: não é um backup do Meu Ateliê.');
  }

  if (!Array.isArray(data.clients) || !Array.isArray(data.orders)) {
    throw new Error('Arquivo inválido: não é um backup do Meu Ateliê.');
  }

  // Limpa na ordem inversa das dependências e restaura.
  db.delete(payments).run();
  db.delete(orderPhotos).run();
  db.delete(orders).run();
  db.delete(clients).run();

  if (data.clients.length) db.insert(clients).values(data.clients).run();
  if (data.orders.length) db.insert(orders).values(data.orders).run();
  if (data.orderPhotos?.length) db.insert(orderPhotos).values(data.orderPhotos).run();
  if (data.payments?.length) db.insert(payments).values(data.payments).run();

  return data.orders.length;
}
