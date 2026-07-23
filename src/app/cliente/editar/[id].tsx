import { router, useLocalSearchParams } from 'expo-router';

import { ClientForm, type ClientFormValues } from '@/features/clients/client-form';
import { getClient, updateClient } from '@/features/clients/repository';
import { ErrorScreen } from '@/ui/error-boundary';
import { useFeedback } from '@/ui/feedback';

export default function EditarClienteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clientId = Number(id);
  const { showMessage } = useFeedback();
  const client = getClient(clientId);

  if (!client) {
    return <ErrorScreen />;
  }

  function handleSubmit(values: ClientFormValues) {
    try {
      updateClient(clientId, values);
      showMessage('Cliente atualizado!', 'success');
      router.back();
    } catch {
      showMessage('Não foi possível atualizar o cliente.', 'error');
    }
  }

  return (
    <ClientForm
      submitLabel="Salvar alterações"
      defaultValues={{
        name: client.name,
        phone: client.phone ?? '',
        notes: client.notes ?? '',
      }}
      onSubmit={handleSubmit}
    />
  );
}
