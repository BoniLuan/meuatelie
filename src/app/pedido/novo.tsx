import { router } from 'expo-router';

import { OrderForm, type OrderFormValues } from '@/features/orders/order-form';
import { createOrder } from '@/features/orders/repository';
import { parseMoney } from '@/lib/format';
import { useFeedback } from '@/ui/feedback';

export default function NovoPedidoScreen() {
  const { showMessage } = useFeedback();

  function handleSubmit(values: OrderFormValues) {
    try {
      const id = createOrder({
        clientId: values.clientId,
        title: values.title,
        description: values.description,
        dueDate: values.dueDate,
        price: values.price ? parseMoney(values.price) : 0,
        status: values.status,
      });
      showMessage('Pedido salvo!', 'success');
      router.replace(`/pedido/${id}`);
    } catch {
      showMessage('Não foi possível salvar o pedido.', 'error');
    }
  }

  return <OrderForm submitLabel="Salvar pedido" onSubmit={handleSubmit} />;
}
