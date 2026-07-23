import Constants from 'expo-constants';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Portal, Text } from 'react-native-paper';

import { exportData, importData } from '@/lib/backup';
import { useFeedback } from '@/ui/feedback';
import { Screen } from '@/ui/screen';

export default function ConfigScreen() {
  const { showMessage } = useFeedback();
  const [busy, setBusy] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);

  async function handleExport() {
    if (busy) return;
    setBusy(true);
    try {
      await exportData();
    } catch (e) {
      showMessage((e as Error).message || 'Não foi possível exportar.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    setConfirmImport(false);
    setBusy(true);
    try {
      const count = await importData();
      if (count >= 0) showMessage('Backup restaurado com sucesso!', 'success');
    } catch (e) {
      showMessage((e as Error).message || 'Não foi possível restaurar.', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium">Backup dos dados</Text>
          <Text variant="bodyMedium" style={styles.desc}>
            Gera um arquivo com seus clientes, pedidos e pagamentos. Guarde no Google Drive ou
            envie para você mesma pelo WhatsApp.
          </Text>
          <Button
            mode="contained"
            icon="download"
            onPress={handleExport}
            disabled={busy}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Fazer backup
          </Button>
        </Card.Content>
      </Card>

      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="titleMedium">Restaurar backup</Text>
          <Text variant="bodyMedium" style={styles.desc}>
            Substitui todos os dados atuais pelos do arquivo escolhido. Use ao trocar de celular.
          </Text>
          <Button
            mode="outlined"
            icon="upload"
            onPress={() => setConfirmImport(true)}
            disabled={busy}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Restaurar de um arquivo
          </Button>
        </Card.Content>
      </Card>

      <Text variant="bodySmall" style={styles.version}>
        Meu Ateliê • versão {Constants.expoConfig?.version ?? '1.0.0'}
      </Text>

      <Portal>
        <Dialog visible={confirmImport} onDismiss={() => setConfirmImport(false)}>
          <Dialog.Title>Restaurar backup?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge">
              Isso vai APAGAR os dados atuais e colocar os do arquivo no lugar. Deseja continuar?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmImport(false)}>Cancelar</Button>
            <Button mode="contained" onPress={handleImport}>
              Restaurar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  content: { gap: 8 },
  desc: { opacity: 0.8 },
  button: { marginTop: 8 },
  buttonContent: { height: 52 },
  version: { textAlign: 'center', opacity: 0.5, marginTop: 8 },
});
