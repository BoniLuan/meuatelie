import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { Screen } from '@/ui/screen';

const clientSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  phone: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientForm({
  defaultValues,
  submitLabel,
  onSubmit,
}: {
  defaultValues?: Partial<ClientFormValues>;
  submitLabel: string;
  onSubmit: (values: ClientFormValues) => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', phone: '', notes: '', ...defaultValues },
  });

  return (
    <Screen>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              label="Nome *"
              mode="outlined"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoFocus
              error={!!errors.name}
              style={styles.input}
            />
            {errors.name ? <HelperText type="error">{errors.name.message}</HelperText> : null}
          </>
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Telefone / WhatsApp"
            mode="outlined"
            keyboardType="phone-pad"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="(00) 00000-0000"
            style={styles.input}
          />
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Observações"
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
  button: { marginTop: 16 },
  buttonContent: { height: 52 },
});
