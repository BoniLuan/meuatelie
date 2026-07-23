import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

import { Screen } from '@/ui/screen';

export default function HomeScreen() {
  return (
    <Screen>
      <Text variant="headlineSmall" style={styles.title}>
        Bem-vinda ao Meu Ateliê
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Aqui você controla seus pedidos, clientes e pagamentos.
      </Text>

      <Card style={styles.card} mode="contained">
        <Card.Content>
          <Text variant="titleMedium">Resumo</Text>
          <Text variant="bodyMedium">Os números da sua lojinha aparecerão aqui.</Text>
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: 'bold', marginBottom: 4 },
  subtitle: { marginBottom: 16 },
  card: { marginTop: 8 },
});
