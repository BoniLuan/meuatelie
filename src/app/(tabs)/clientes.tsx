import { Screen } from '@/ui/screen';
import { EmptyState } from '@/ui/empty-state';

export default function ClientesScreen() {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="account-group-outline"
        title="Nenhum cliente ainda"
        subtitle="Em breve você poderá cadastrar seus clientes aqui."
      />
    </Screen>
  );
}
