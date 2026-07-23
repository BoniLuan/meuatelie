import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';

import { deletePhotoFile, pickPhoto } from './photos';
import { addOrderPhoto, orderPhotosQuery, removeOrderPhoto } from './repository';
import type { OrderPhoto } from '@/db/schema';
import { useFeedback } from '@/ui/feedback';

export function PhotoGallery({ orderId }: { orderId: number }) {
  const { showMessage } = useFeedback();
  const { data: photos } = useLiveQuery(orderPhotosQuery(orderId), [orderId]);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<OrderPhoto | null>(null);

  async function add(source: 'camera' | 'library') {
    if (busy) return;
    setBusy(true);
    try {
      const uri = await pickPhoto(source);
      if (uri) {
        addOrderPhoto(orderId, uri);
        showMessage('Foto adicionada!', 'success');
      }
    } catch (e) {
      showMessage((e as Error).message || 'Não foi possível adicionar a foto.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    const photo = toDelete;
    setToDelete(null);
    if (!photo) return;
    try {
      removeOrderPhoto(photo.id);
      await deletePhotoFile(photo.uri);
    } catch {
      showMessage('Não foi possível remover a foto.', 'error');
    }
  }

  return (
    <View style={styles.container}>
      {photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip}>
          {photos.map((p) => (
            <Pressable key={p.id} style={styles.thumbWrap}>
              <Image source={{ uri: p.uri }} style={styles.thumb} contentFit="cover" />
              <IconButton
                icon="close-circle"
                size={24}
                iconColor="#FFFFFF"
                containerColor="rgba(0,0,0,0.5)"
                style={styles.remove}
                onPress={() => setToDelete(p)}
              />
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          Nenhuma foto ainda.
        </Text>
      )}

      <View style={styles.actions}>
        <Button
          mode="outlined"
          icon="camera"
          onPress={() => add('camera')}
          disabled={busy}
          style={styles.action}
          contentStyle={styles.actionContent}
        >
          Tirar foto
        </Button>
        <Button
          mode="outlined"
          icon="image"
          onPress={() => add('library')}
          disabled={busy}
          style={styles.action}
          contentStyle={styles.actionContent}
        >
          Galeria
        </Button>
      </View>

      <Portal>
        <Dialog visible={!!toDelete} onDismiss={() => setToDelete(null)}>
          <Dialog.Title>Remover foto?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge">Essa foto será apagada do pedido.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setToDelete(null)}>Cancelar</Button>
            <Button textColor="#BA1A1A" onPress={confirmDelete}>
              Remover
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  strip: { flexGrow: 0 },
  thumbWrap: { marginRight: 10 },
  thumb: { width: 120, height: 120, borderRadius: 10, backgroundColor: '#EEE' },
  remove: { position: 'absolute', top: -6, right: -6, margin: 0 },
  empty: { opacity: 0.6 },
  actions: { flexDirection: 'row', gap: 12 },
  action: { flex: 1 },
  actionContent: { height: 48 },
});
