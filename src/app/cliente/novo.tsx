import { router } from 'expo-router';

import { ClientForm, type ClientFormValues } from '@/features/clients/client-form';
import { createClient } from '@/features/clients/repository';
import { useFeedback } from '@/ui/feedback';

export default function NovoClienteScreen() {
  const { showMessage } = useFeedback();

  function handleSubmit(values: ClientFormValues) {
    try {
      createClient(values);
      showMessage('Cliente salvo!', 'success');
      router.back();
    } catch {
      showMessage('Não foi possível salvar o cliente.', 'error');
    }
  }

  return <ClientForm submitLabel="Salvar cliente" onSubmit={handleSubmit} />;
}
