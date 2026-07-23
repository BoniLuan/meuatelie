import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Chip, FAB, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ordersListQuery } from '@/features/orders/repository';
import { formatDate, formatMoney } from '@/lib/format';
import { STATUS_LABELS } from '@/theme';
import { EmptyState } from '@/ui/empty-state';
import { StatusChip } from '@/ui/status-chip';

const FILTERS = ['todos', 'a_fazer', 'em_andamento', 'pronto', 'entregue'] as const;

export default function PedidosScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data } = useLiveQuery(ordersListQuery);
  const [filter, setFilter] = useState<string>('todos');

  const filtered = useMemo(
    () => (filter === 'todos' ? data : data.filter((o) => o.status === filter)),
    [data, filter],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {data.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f}
          style={styles.filterBar}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <Chip
              selected={filter === item}
              showSelectedCheck={false}
              onPress={() => setFilter(item)}
              style={styles.filterChip}
            >
              {item === 'todos' ? 'Todos' : STATUS_LABELS[item]}
            </Chip>
          )}
        />
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-text-outline"
            title={data.length === 0 ? 'Nenhum pedido ainda' : 'Nada nesse filtro'}
            subtitle={
              data.length === 0
                ? 'Toque em "Novo pedido" para começar.'
                : 'Experimente outro filtro acima.'
            }
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card} mode="elevated" onPress={() => router.push(`/pedido/${item.id}`)}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <StatusChip status={item.status} />
              </View>
              <Text variant="bodyMedium" style={styles.client}>
                {item.clientName || 'Sem cliente'}
              </Text>
              <View style={styles.cardFooter}>
                <Text variant="bodyMedium">Prazo: {formatDate(item.dueDate)}</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                  {formatMoney(item.price)}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        label="Novo pedido"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/pedido/novo')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: {},
  listContent: { padding: 12, paddingBottom: 96, gap: 12 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  card: {},
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontWeight: 'bold' },
  client: { marginTop: 4, opacity: 0.8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  fab: { position: 'absolute', right: 16 },
});
