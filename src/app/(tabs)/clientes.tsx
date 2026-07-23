import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Divider, FAB, List, Searchbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { clientsQuery } from '@/features/clients/repository';
import { EmptyState } from '@/ui/empty-state';

export default function ClientesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data } = useLiveQuery(clientsQuery);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(term) || (c.phone ?? '').toLowerCase().includes(term),
    );
  }, [data, search]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {data.length > 0 ? (
        <Searchbar
          placeholder="Buscar cliente"
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={Divider}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : { paddingBottom: 96 }}
        ListEmptyComponent={
          <EmptyState
            icon="account-group-outline"
            title={data.length === 0 ? 'Nenhum cliente ainda' : 'Nada encontrado'}
            subtitle={
              data.length === 0
                ? 'Toque em "Novo cliente" para começar.'
                : 'Tente outro nome ou telefone.'
            }
          />
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={item.phone || 'Sem telefone'}
            titleStyle={styles.itemTitle}
            left={(props) => <List.Icon {...props} icon="account-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push(`/cliente/${item.id}`)}
          />
        )}
      />

      <FAB
        icon="plus"
        label="Novo cliente"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/cliente/novo')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 12 },
  itemTitle: { fontSize: 18 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  fab: { position: 'absolute', right: 16 },
});
