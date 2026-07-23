import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, HelperText, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { formatDate, parseMoney } from '@/lib/format';
import { STATUS_COLORS, STATUS_LABELS } from '@/theme';
import { Screen } from '@/ui/screen';
import { ClientSelect } from './client-select';

const STATUS_ORDER = ['a_fazer', 'em_andamento', 'pronto', 'entregue', 'cancelado'] as const;

const orderSchema = z.object({
  title: z.string().trim().min(1, 'Descreva o que será bordado'),
  clientId: z.number().nullable(),
  price: z
    .string()
    .refine((v) => !v || (!isNaN(parseMoney(v)) && parseMoney(v) >= 0), 'Valor inválido'),
  dueDate: z.number().nullable(),
  status: z.string(),
  description: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

export function OrderForm({
  defaultValues,
  submitLabel,
  onSubmit,
}: {
  defaultValues?: Partial<OrderFormValues>;
  submitLabel: string;
  onSubmit: (values: OrderFormValues) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      title: '',
      clientId: null,
      price: '',
      dueDate: null,
      status: 'a_fazer',
      description: '',
      ...defaultValues,
    },
  });

  return (
    <Screen>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              label="O que será bordado? *"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoFocus
              error={!!errors.title}
              placeholder="Ex.: Toalha de banho - flores"
              style={styles.input}
            />
            {errors.title ? <HelperText type="error">{errors.title.message}</HelperText> : null}
          </>
        )}
      />

      <Controller
        control={control}
        name="clientId"
        render={({ field: { onChange, value } }) => (
          <ClientSelect value={value} onChange={onChange} />
        )}
      />

      <Controller
        control={control}
        name="price"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              label="Valor combinado (R$)"
              mode="outlined"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="0,00"
              error={!!errors.price}
              style={styles.input}
            />
            {errors.price ? <HelperText type="error">{errors.price.message}</HelperText> : null}
          </>
        )}
      />

      <Controller
        control={control}
        name="dueDate"
        render={({ field: { onChange, value } }) => (
          <View style={styles.dateRow}>
            <TextInput
              label="Prazo de entrega"
              mode="outlined"
              value={value ? formatDate(value) : ''}
              editable={false}
              placeholder="Sem prazo"
              right={<TextInput.Icon icon="calendar" onPress={() => setShowPicker(true)} />}
              onPressIn={() => setShowPicker(true)}
              style={styles.dateInput}
            />
            {value ? (
              <Button compact onPress={() => onChange(null)} style={styles.clearDate}>
                Limpar
              </Button>
            ) : null}
            {showPicker ? (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                onChange={(event, date) => {
                  setShowPicker(false);
                  if (event.type === 'set' && date) onChange(date.getTime());
                }}
              />
            ) : null}
          </View>
        )}
      />

      <Text variant="labelLarge" style={styles.sectionLabel}>
        Situação
      </Text>
      <Controller
        control={control}
        name="status"
        render={({ field: { onChange, value } }) => (
          <View style={styles.chips}>
            {STATUS_ORDER.map((s) => {
              const active = value === s;
              const c = STATUS_COLORS[s];
              return (
                <Chip
                  key={s}
                  selected={active}
                  showSelectedCheck={false}
                  onPress={() => onChange(s)}
                  style={[styles.chip, active && { backgroundColor: c.bg }]}
                  textStyle={active ? { color: c.fg, fontWeight: '700' } : undefined}
                >
                  {STATUS_LABELS[s]}
                </Chip>
              );
            })}
          </View>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Detalhes / observações"
            mode="outlined"
            multiline
            numberOfLines={3}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            style={styles.input}
          />
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        {submitLabel}
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { marginBottom: 8 },
  dateRow: { marginBottom: 8 },
  dateInput: {},
  clearDate: { alignSelf: 'flex-end' },
  sectionLabel: { marginTop: 8, marginBottom: 6, opacity: 0.7 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {},
  button: { marginTop: 16 },
  buttonContent: { height: 52 },
});
