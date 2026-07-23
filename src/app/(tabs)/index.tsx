import dayjs from 'dayjs';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Divider, List, Text, useTheme } from 'react-native-paper';

import { ordersListQuery } from '@/features/orders/repository';
import { allPaymentsQuery } from '@/features/payments/repository';
import { formatDate, formatMoney } from '@/lib/format';
import { EmptyState } from '@/ui/empty-state';
import { Screen } from '@/ui/screen';
import { StatusChip } from '@/ui/status-chip';

const DONE = ['entregue', 'cancelado'];

export default function HomeScreen() {
  const theme = useTheme();
  const { data: orders } = useLiveQuery(ordersListQuery);
  const { data: payments } = useLiveQuery(allPaymentsQuery);

  const paidByOrder = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of payments) map.set(p.orderId, (map.get(p.orderId) ?? 0) + p.amount);
    return map;
  }, [payments]);

  const openOrders = useMemo(() => orders.filter((o) => !DONE.includes(o.status)), [orders]);

  const toReceive = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelado')
        .reduce((sum, o) => sum + Math.max(0, o.price - (paidByOrder.get(o.id) ?? 0)), 0),
    [orders, paidByOrder],
  );

  const upcoming = useMemo(() => {
    const today = dayjs().startOf('day').valueOf();
    return openOrders
      .filter((o) => o.dueDate != null)
      .sort((a, b) => (a.dueDate! - b.dueDate!))
      .slice(0, 5)
      .map((o) => ({ ...o, overdue: o.dueDate! < today }));
  }, [openOrders]);

  return (
    <Screen>
      <Text variant="headlineSmall" style={styles.title}>
        Bem-vinda ao Meu Ateliê
      </Text>

      <View style={styles.statsRow}>
        <Card mode="contained" style={[styles.stat, { backgroundColor: '#FFD9E1' }]} onPress={() => router.push('/pedidos')}>
          <Card.Content>
            <Text variant="displaySmall" style={styles.statNumber}>
              {openOrders.length}
            </Text>
            <Text variant="bodyMedium">pedidos em aberto</Text>
          </Card.Content>
        </Card>
        <Card mode="contained" style={[styles.stat, { backgroundColor: '#FDECC8' }]} onPress={() => router.push('/financeiro')}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.statNumber}>
              {formatMoney(toReceive)}
            </Text>
            <Text variant="bodyMedium">a receber</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.quickActions}>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => router.push('/pedido/novo')}
          style={styles.quickBtn}
          contentStyle={styles.quickBtnContent}
        >
          Novo pedido
        </Button>
        <Button
          mode="contained-tonal"
          icon="account-plus"
          onPress={() => router.push('/cliente/novo')}
          style={styles.quickBtn}
          contentStyle={styles.quickBtnContent}
        >
          Novo cliente
        </Button>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Próximas entregas
      </Text>

      {orders.length === 0 ? (
        <EmptyState
          icon="clipboard-text-outline"
          title="Tudo começa por aqui"
          subtitle='Toque em "Novo pedido" para registrar a primeira encomenda.'
        />
      ) : upcoming.length === 0 ? (
        <Text variant="bodyMedium" style={styles.empty}>
          Nenhuma entrega com prazo definido.
        </Text>
      ) : (
        <Card mode="contained">
          {upcoming.map((o, i) => (
            <View key={o.id}>
              {i > 0 ? <Divider /> : null}
              <List.Item
                title={o.title}
                description={o.clientName || 'Sem cliente'}
                titleStyle={styles.itemTitle}
                onPress={() => router.push(`/pedido/${o.id}`)}
                right={() => (
                  <View style={styles.itemRight}>
                    <StatusChip status={o.status} />
                    <Text
                      variant="bodySmall"
                      style={{ color: o.overdue ? theme.colors.error : theme.colors.onSurfaceVariant }}
                    >
                      {o.overdue ? 'Atrasado: ' : ''}
                      {formatDate(o.dueDate)}
                    </Text>
                  </View>
                )}
              />
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: 'bold', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  stat: { flex: 1 },
  statNumber: { fontWeight: 'bold' },
  quickActions: { gap: 12, marginBottom: 24 },
  quickBtn: {},
  quickBtnContent: { height: 52 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 10 },
  empty: { opacity: 0.6 },
  itemTitle: { fontSize: 17, fontWeight: '600' },
  itemRight: { alignItems: 'flex-end', gap: 4, justifyContent: 'center' },
});
