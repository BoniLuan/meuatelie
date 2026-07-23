import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, RadioButton, Text, TextInput } from 'react-native-paper';

import { clientsQuery } from '@/features/clients/repository';

/** Campo de seleção de cliente: abre um diálogo com a lista (ou "Sem cliente"). */
export function ClientSelect({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const { data: clients } = useLiveQuery(clientsQuery);
  const [visible, setVisible] = useState(false);

  const selected = clients.find((c) => c.id === value);
  const label = selected ? selected.name : 'Sem cliente';

  return (
    <>
      <TextInput
        label="Cliente"
        mode="outlined"
        value={label}
        editable={false}
        right={<TextInput.Icon icon="menu-down" onPress={() => setVisible(true)} />}
        onPressIn={() => setVisible(true)}
        style={styles.input}
      />

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Escolher cliente</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView>
              <RadioButton.Item
                label="Sem cliente"
                value="none"
                status={value === null ? 'checked' : 'unchecked'}
                onPress={() => {
                  onChange(null);
                  setVisible(false);
                }}
              />
              {clients.length === 0 ? (
                <Text variant="bodyMedium" style={styles.hint}>
                  Você ainda não tem clientes cadastrados. Pode salvar o pedido sem cliente e
                  vincular depois.
                </Text>
              ) : null}
              {clients.map((c) => (
                <RadioButton.Item
                  key={c.id}
                  label={c.name}
                  value={String(c.id)}
                  labelStyle={styles.itemLabel}
                  status={value === c.id ? 'checked' : 'unchecked'}
                  onPress={() => {
                    onChange(c.id);
                    setVisible(false);
                  }}
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Fechar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 8 },
  scrollArea: { maxHeight: 360, paddingHorizontal: 0 },
  itemLabel: { fontSize: 17 },
  hint: { padding: 16, opacity: 0.7 },
});
