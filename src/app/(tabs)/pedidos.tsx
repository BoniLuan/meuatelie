import { Screen } from '@/ui/screen';
import { EmptyState } from '@/ui/empty-state';

export default function PedidosScreen() {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="clipboard-text-outline"
        title="Nenhum pedido ainda"
        subtitle="Em breve você poderá cadastrar seus pedidos aqui."
      />
    </Screen>
  );
}
