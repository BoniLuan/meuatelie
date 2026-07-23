import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

/** Tela amigável de erro — evita "tela branca" e explica em linguagem simples. */
export function ErrorScreen({ error, onRetry }: { error?: Error; onRetry?: () => void }) {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Ops, algo deu errado
      </Text>
      <Text variant="bodyLarge" style={styles.message}>
        Não se preocupe, seus dados estão salvos. Tente novamente.
      </Text>
      {onRetry ? (
        <Button mode="contained" onPress={onRetry} style={styles.button} contentStyle={styles.buttonContent}>
          Tentar de novo
        </Button>
      ) : null}
      {__DEV__ && error ? (
        <Text variant="bodySmall" style={styles.debug}>
          {error.message}
        </Text>
      ) : null}
    </View>
  );
}

/** Boundary de classe para envolver a árvore e capturar erros de renderização. */
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <ErrorScreen error={this.state.error} onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}

/** Formato esperado pelo expo-router para o export `ErrorBoundary` de rotas. */
export function RouteErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return <ErrorScreen error={error} onRetry={retry} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  title: { textAlign: 'center', fontWeight: 'bold' },
  message: { textAlign: 'center' },
  button: { marginTop: 8 },
  buttonContent: { height: 52, paddingHorizontal: 12 },
  debug: { marginTop: 16, opacity: 0.6, textAlign: 'center' },
});
