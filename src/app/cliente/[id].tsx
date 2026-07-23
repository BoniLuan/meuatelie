import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Divider, List, Portal, Text } from 'react-native-paper';

import { clientByIdQuery, deleteClient } from '@/features/clients/repository';
import { ordersByClientQuery } from '@/features/orders/repository';
import { formatMoney } from '@/lib/format';
import { openWhatsApp } from '@/lib/whatsapp';
import { STATUS_LABELS } from '@/theme';
import { ErrorScreen } from '@/ui/error-boundary';
import { useFeedback } from '@/ui/feedback';
import { Screen } from '@/ui/screen';

export default function ClienteDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clientId = Number(id);
  const { showMessage } = useFeedback();
  const { data } = useLiveQuery(clientByIdQuery(clientId), [clientId]);
  const { data: orderHistory } = useLiveQuery(ordersByClientQuery(clientId), [clientId]);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const client = data?.[0];
  if (!client) {
    return <ErrorScreen />;
  }

  async function handleWhatsApp() {
    try {
      await openWhatsApp(client!.phone);
    } catch (e) {
      showMessage((e as Error).message, 'error');
    }
  }

  function handleDelete() {
    try {
      deleteClient(clientId);
      setConfirmVisible(false);
      showMessage('Cliente excluído.', 'success');
      router.back();
    } catch {
      setConfirmVisible(false);
      showMessage('Não foi possível excluir.', 'error');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: client.name }} />
      <Screen>
        <Card mode="contained" style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Field label="Nome" value={client.name} />
            <Divider />
            <Field label="Telefone / WhatsApp" value={client.phone || 'Não informado'} />
            {client.notes ? (
              <>
                <Divider />
                <Field label="Observações" value={client.notes} />
              </>
            ) : null}
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Pedidos deste cliente
        </Text>
        {orderHistory.length === 0 ? (
          <Text variant="bodyMedium" style={styles.emptyHistory}>
            Nenhum pedido ainda.
          </Text>
        ) : (
          <Card mode="contained" style={styles.card}>
            {orderHistory.map((o, i) => (
              <View key={o.id}>
                {i > 0 ? <Divider /> : null}
                <List.Item
                  title={o.title}
                  description={`${STATUS_LABELS[o.status] ?? o.status} · ${formatMoney(o.price)}`}
                  titleStyle={styles.historyTitle}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                  onPress={() => router.push(`/pedido/${o.id}`)}
                />
              </View>
            ))}
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained-tonal"
            icon="whatsapp"
            onPress={handleWhatsApp}
            style={styles.action}
            contentStyle={styles.actionContent}
          >
            Enviar WhatsApp
          </Button>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => router.push(`/cliente/editar/${clientId}`)}
            style={styles.action}
            contentStyle={styles.actionContent}
          >
            Editar
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            textColor="#BA1A1A"
            onPress={() => setConfirmVisible(true)}
            style={styles.action}
            contentStyle={styles.actionContent}
          >
            Excluir
          </Button>
        </View>
      </Screen>

      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Excluir cliente?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge">
              Tem certeza que deseja excluir {client.name}? Esta ação não pode ser desfeita.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancelar</Button>
            <Button textColor="#BA1A1A" onPress={handleDelete}>
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text variant="labelLarge" style={styles.fieldLabel}>
        {label}
      </Text>
      <Text variant="bodyLarge">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  cardContent: { gap: 4 },
  field: { paddingVertical: 10 },
  fieldLabel: { opacity: 0.6, marginBottom: 2 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 8 },
  emptyHistory: { opacity: 0.6, marginBottom: 16 },
  historyTitle: { fontSize: 17 },
  actions: { gap: 12, marginTop: 8 },
  action: {},
  actionContent: { height: 52 },
});
