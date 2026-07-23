import { Screen } from '@/ui/screen';
import { EmptyState } from '@/ui/empty-state';

export default function FinanceiroScreen() {
  return (
    <Screen scroll={false}>
      <EmptyState
        icon="cash-multiple"
        title="Sem movimentações"
        subtitle="Em breve o resumo financeiro aparecerá aqui."
      />
    </Screen>
  );
}
