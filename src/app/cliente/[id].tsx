import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Divider, Portal, Text } from 'react-native-paper';

import { clientByIdQuery, deleteClient } from '@/features/clients/repository';
import { ErrorScreen } from '@/ui/error-boundary';
import { useFeedback } from '@/ui/feedback';
import { Screen } from '@/ui/screen';

export default function ClienteDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clientId = Number(id);
  const { showMessage } = useFeedback();
  const { data } = useLiveQuery(clientByIdQuery(clientId), [clientId]);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const client = data?.[0];
  if (!client) {
    return <ErrorScreen />;
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

        <View style={styles.actions}>
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
  actions: { gap: 12 },
  action: {},
  actionContent: { height: 52 },
});
