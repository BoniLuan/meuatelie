import { router, useLocalSearchParams } from 'expo-router';

import { OrderForm, type OrderFormValues } from '@/features/orders/order-form';
import { getOrder, updateOrder } from '@/features/orders/repository';
import { moneyToInput, parseMoney } from '@/lib/format';
import { ErrorScreen } from '@/ui/error-boundary';
import { useFeedback } from '@/ui/feedback';

export default function EditarPedidoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const { showMessage } = useFeedback();
  const order = getOrder(orderId);

  if (!order) {
    return <ErrorScreen />;
  }

  function handleSubmit(values: OrderFormValues) {
    try {
      updateOrder(orderId, {
        clientId: values.clientId,
        title: values.title,
        description: values.description,
        dueDate: values.dueDate,
        price: values.price ? parseMoney(values.price) : 0,
        status: values.status,
      });
      showMessage('Pedido atualizado!', 'success');
      router.back();
    } catch {
      showMessage('Não foi possível atualizar o pedido.', 'error');
    }
  }

  return (
    <OrderForm
      submitLabel="Salvar alterações"
      defaultValues={{
        title: order.title,
        clientId: order.clientId,
        price: moneyToInput(order.price),
        dueDate: order.dueDate,
        status: order.status,
        description: order.description ?? '',
      }}
      onSubmit={handleSubmit}
    />
  );
}
