import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Divider, Menu, Portal, Text, useTheme } from 'react-native-paper';

import { getClient } from '@/features/clients/repository';
import { PhotoGallery } from '@/features/orders/photo-gallery';
import { PaymentSection } from '@/features/payments/payment-section';
import { deleteOrder, orderByIdQuery, updateOrderStatus } from '@/features/orders/repository';
import { formatDate, formatMoney } from '@/lib/format';
import { STATUS_LABELS } from '@/theme';
import { ErrorScreen } from '@/ui/error-boundary';
import { useFeedback } from '@/ui/feedback';
import { Screen } from '@/ui/screen';
import { StatusChip } from '@/ui/status-chip';

const STATUS_ORDER = ['a_fazer', 'em_andamento', 'pronto', 'entregue', 'cancelado'];

export default function PedidoDetalheScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const { showMessage } = useFeedback();
  const { data } = useLiveQuery(orderByIdQuery(orderId), [orderId]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const order = data?.[0];
  if (!order) {
    return <ErrorScreen />;
  }

  const client = order.clientId ? getClient(order.clientId) : null;

  function changeStatus(status: string) {
    setMenuVisible(false);
    try {
      updateOrderStatus(orderId, status);
      showMessage('Situação atualizada!', 'success');
    } catch {
      showMessage('Não foi possível atualizar a situação.', 'error');
    }
  }

  function handleDelete() {
    setConfirmVisible(false);
    try {
      deleteOrder(orderId);
      showMessage('Pedido excluído.', 'success');
      router.back();
    } catch {
      showMessage('Não foi possível excluir.', 'error');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Pedido' }} />
      <Screen>
        <Text variant="headlineSmall" style={styles.title}>
          {order.title}
        </Text>

        <View style={styles.statusRow}>
          <StatusChip status={order.status} compact={false} />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button icon="pencil" onPress={() => setMenuVisible(true)}>
                Mudar situação
              </Button>
            }
          >
            {STATUS_ORDER.map((s) => (
              <Menu.Item key={s} onPress={() => changeStatus(s)} title={STATUS_LABELS[s]} />
            ))}
          </Menu>
        </View>

        <Card mode="contained" style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Field label="Cliente" value={client?.name || 'Sem cliente'} />
            <Divider />
            <Field label="Valor combinado" value={formatMoney(order.price)} />
            <Divider />
            <Field label="Prazo de entrega" value={formatDate(order.dueDate)} />
            {order.description ? (
              <>
                <Divider />
                <Field label="Detalhes" value={order.description} />
              </>
            ) : null}
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Pagamentos
        </Text>
        <PaymentSection orderId={orderId} price={order.price} />

        <Text variant="titleMedium" style={[styles.sectionTitle, styles.sectionSpacer]}>
          Fotos
        </Text>
        <PhotoGallery orderId={orderId} />

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => router.push(`/pedido/editar/${orderId}`)}
            style={styles.actionBtn}
            contentStyle={styles.actionContent}
          >
            Editar pedido
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            textColor={theme.colors.error}
            onPress={() => setConfirmVisible(true)}
            style={styles.actionBtn}
            contentStyle={styles.actionContent}
          >
            Excluir pedido
          </Button>
        </View>
      </Screen>

      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Excluir pedido?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge">
              Tem certeza? O pedido e suas fotos serão removidos e não poderão ser recuperados.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancelar</Button>
            <Button textColor={theme.colors.error} onPress={handleDelete}>
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
  title: { fontWeight: 'bold', marginBottom: 10 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  card: { marginBottom: 20 },
  cardContent: { gap: 4 },
  field: { paddingVertical: 10 },
  fieldLabel: { opacity: 0.6, marginBottom: 2 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 10 },
  sectionSpacer: { marginTop: 24 },
  actions: { gap: 12, marginTop: 24 },
  actionBtn: {},
  actionContent: { height: 52 },
});
