import DateTimePicker from '@react-native-community/datetimepicker';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  HelperText,
  IconButton,
  List,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
} from 'react-native-paper';

import type { Payment, PaymentMethod } from '@/db/schema';
import { formatDate, formatMoney, now, parseMoney } from '@/lib/format';
import { PAYMENT_COLORS } from '@/theme';
import { useFeedback } from '@/ui/feedback';
import {
  createPayment,
  deletePayment,
  PAYMENT_ICONS,
  PAYMENT_LABELS,
  paymentSituation,
  paymentsByOrderQuery,
} from './repository';

const SITUATION_LABELS: Record<string, string> = {
  em_aberto: 'Em aberto',
  parcial: 'Parcial',
  pago: 'Pago',
};

export function PaymentSection({ orderId, price }: { orderId: number; price: number }) {
  const { showMessage } = useFeedback();
  const { data: list } = useLiveQuery(paymentsByOrderQuery(orderId), [orderId]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [toDelete, setToDelete] = useState<Payment | null>(null);

  const paid = useMemo(() => list.reduce((sum, p) => sum + p.amount, 0), [list]);
  const balance = Math.max(0, price - paid);
  const situation = paymentSituation(price, paid);
  const sitColor = PAYMENT_COLORS[situation];

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Chip
          compact={false}
          style={{ backgroundColor: sitColor.bg }}
          textStyle={{ color: sitColor.fg, fontWeight: '700' }}
        >
          {SITUATION_LABELS[situation]}
        </Chip>
        <Text variant="titleMedium">
          {balance > 0 ? `Falta ${formatMoney(balance)}` : 'Quitado'}
        </Text>
      </View>

      {list.length > 0 ? (
        <Card mode="contained" style={styles.card}>
          {list.map((p, i) => (
            <View key={p.id}>
              {i > 0 ? <Divider /> : null}
              <List.Item
                title={formatMoney(p.amount)}
                description={`${PAYMENT_LABELS[p.method as PaymentMethod] ?? p.method} · ${formatDate(p.paidAt)}`}
                titleStyle={styles.payTitle}
                left={(props) => (
                  <List.Icon {...props} icon={PAYMENT_ICONS[p.method as PaymentMethod] ?? 'cash'} />
                )}
                right={() => (
                  <IconButton icon="delete" iconColor="#BA1A1A" onPress={() => setToDelete(p)} />
                )}
              />
            </View>
          ))}
        </Card>
      ) : (
        <Text variant="bodyMedium" style={styles.empty}>
          Nenhum pagamento registrado.
        </Text>
      )}

      <Button
        mode="contained-tonal"
        icon="cash-plus"
        onPress={() => setDialogVisible(true)}
        style={styles.addBtn}
        contentStyle={styles.addBtnContent}
      >
        Registrar pagamento
      </Button>

      <PaymentDialog
        visible={dialogVisible}
        suggested={balance}
        onDismiss={() => setDialogVisible(false)}
        onSave={(data) => {
          try {
            createPayment({ orderId, ...data });
            setDialogVisible(false);
            showMessage('Pagamento registrado!', 'success');
          } catch {
            showMessage('Não foi possível registrar o pagamento.', 'error');
          }
        }}
      />

      <Portal>
        <Dialog visible={!!toDelete} onDismiss={() => setToDelete(null)}>
          <Dialog.Title>Remover pagamento?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge">Esse pagamento será removido do pedido.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setToDelete(null)}>Cancelar</Button>
            <Button
              textColor="#BA1A1A"
              onPress={() => {
                const p = toDelete;
                setToDelete(null);
                if (p) {
                  try {
                    deletePayment(p.id);
                  } catch {
                    showMessage('Não foi possível remover.', 'error');
                  }
                }
              }}
            >
              Remover
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function PaymentDialog({
  visible,
  suggested,
  onDismiss,
  onSave,
}: {
  visible: boolean;
  suggested: number;
  onDismiss: () => void;
  onSave: (data: { amount: number; method: PaymentMethod; paidAt: number; note?: string }) => void;
}) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [paidAt, setPaidAt] = useState(now());
  const [note, setNote] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reinicia os campos ao abrir, sugerindo o saldo restante.
  useEffect(() => {
    if (visible) {
      setAmount(suggested > 0 ? String(suggested).replace('.', ',') : '');
      setMethod('pix');
      setPaidAt(now());
      setNote('');
      setError(null);
    }
  }, [visible, suggested]);

  function handleSave() {
    const value = parseMoney(amount);
    if (isNaN(value) || value <= 0) {
      setError('Informe um valor válido');
      return;
    }
    onSave({ amount: value, method, paidAt, note: note || undefined });
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Registrar pagamento</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Valor (R$)"
            mode="outlined"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            autoFocus
            error={!!error}
            style={styles.field}
          />
          {error ? <HelperText type="error">{error}</HelperText> : null}

          <Text variant="labelLarge" style={styles.fieldLabel}>
            Forma de pagamento
          </Text>
          <SegmentedButtons
            value={method}
            onValueChange={(v) => setMethod(v as PaymentMethod)}
            buttons={[
              { value: 'pix', label: 'Pix', icon: 'qrcode' },
              { value: 'dinheiro', label: 'Dinheiro', icon: 'cash' },
              { value: 'cartao', label: 'Cartão', icon: 'credit-card-outline' },
            ]}
            style={styles.field}
          />

          <TextInput
            label="Data"
            mode="outlined"
            value={formatDate(paidAt)}
            editable={false}
            right={<TextInput.Icon icon="calendar" onPress={() => setShowPicker(true)} />}
            onPressIn={() => setShowPicker(true)}
            style={styles.field}
          />
          {showPicker ? (
            <DateTimePicker
              value={new Date(paidAt)}
              mode="date"
              onChange={(event, date) => {
                setShowPicker(false);
                if (event.type === 'set' && date) setPaidAt(date.getTime());
              }}
            />
          ) : null}

          <TextInput
            label="Observação (opcional)"
            mode="outlined"
            value={note}
            onChangeText={setNote}
            style={styles.field}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancelar</Button>
          <Button mode="contained" onPress={handleSave}>
            Salvar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: {},
  payTitle: { fontSize: 17, fontWeight: '600' },
  empty: { opacity: 0.6 },
  addBtn: { marginTop: 4 },
  addBtnContent: { height: 48 },
  field: { marginBottom: 8 },
  fieldLabel: { marginTop: 4, marginBottom: 6, opacity: 0.7 },
});
