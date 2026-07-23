import dayjs from 'dayjs';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, List, Text, useTheme } from 'react-native-paper';

import { ordersListQuery } from '@/features/orders/repository';
import {
  allPaymentsQuery,
  PAYMENT_ICONS,
  PAYMENT_LABELS,
} from '@/features/payments/repository';
import type { PaymentMethod } from '@/db/schema';
import { formatDate, formatMoney } from '@/lib/format';
import { Screen } from '@/ui/screen';

export default function FinanceiroScreen() {
  const theme = useTheme();
  const { data: orders } = useLiveQuery(ordersListQuery);
  const { data: payments } = useLiveQuery(allPaymentsQuery);
  const [monthOffset, setMonthOffset] = useState(0);

  const ref = useMemo(() => dayjs().add(monthOffset, 'month'), [monthOffset]);
  const start = ref.startOf('month').valueOf();
  const end = ref.endOf('month').valueOf();

  const paidByOrder = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of payments) {
      map.set(p.orderId, (map.get(p.orderId) ?? 0) + p.amount);
    }
    return map;
  }, [payments]);

  const toReceive = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelado')
        .reduce((sum, o) => sum + Math.max(0, o.price - (paidByOrder.get(o.id) ?? 0)), 0),
    [orders, paidByOrder],
  );

  const monthPayments = useMemo(
    () => payments.filter((p) => p.paidAt >= start && p.paidAt <= end),
    [payments, start, end],
  );

  const receivedInMonth = useMemo(
    () => monthPayments.reduce((sum, p) => sum + p.amount, 0),
    [monthPayments],
  );

  return (
    <Screen>
      <View style={styles.monthNav}>
        <IconButton icon="chevron-left" onPress={() => setMonthOffset((m) => m - 1)} />
        <Text variant="titleMedium" style={styles.monthLabel}>
          {ref.format('MMMM [de] YYYY')}
        </Text>
        <IconButton
          icon="chevron-right"
          disabled={monthOffset >= 0}
          onPress={() => setMonthOffset((m) => m + 1)}
        />
      </View>

      <Card mode="contained" style={[styles.card, { backgroundColor: '#CDEBCE' }]}>
        <Card.Content>
          <Text variant="labelLarge" style={styles.cardLabel}>
            Recebido no mês
          </Text>
          <Text variant="headlineSmall" style={styles.cardValue}>
            {formatMoney(receivedInMonth)}
          </Text>
        </Card.Content>
      </Card>

      <Card mode="contained" style={[styles.card, { backgroundColor: '#FDECC8' }]}>
        <Card.Content>
          <Text variant="labelLarge" style={styles.cardLabel}>
            Total a receber (em aberto)
          </Text>
          <Text variant="headlineSmall" style={styles.cardValue}>
            {formatMoney(toReceive)}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Pagamentos do mês
      </Text>
      {monthPayments.length === 0 ? (
        <Text variant="bodyMedium" style={styles.empty}>
          Nenhum pagamento neste mês.
        </Text>
      ) : (
        <Card mode="contained">
          {monthPayments.map((p, i) => (
            <View key={p.id}>
              {i > 0 ? <Divider /> : null}
              <List.Item
                title={p.orderTitle || 'Pedido'}
                description={`${PAYMENT_LABELS[p.method as PaymentMethod] ?? p.method} · ${formatDate(p.paidAt)}`}
                left={(props) => (
                  <List.Icon {...props} icon={PAYMENT_ICONS[p.method as PaymentMethod] ?? 'cash'} />
                )}
                right={() => (
                  <Text variant="titleMedium" style={{ alignSelf: 'center', color: theme.colors.primary }}>
                    {formatMoney(p.amount)}
                  </Text>
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
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  monthLabel: { textTransform: 'capitalize', fontWeight: '600' },
  card: { marginBottom: 12 },
  cardLabel: { opacity: 0.7 },
  cardValue: { fontWeight: 'bold', marginTop: 2 },
  sectionTitle: { fontWeight: 'bold', marginTop: 8, marginBottom: 10 },
  empty: { opacity: 0.6 },
});
