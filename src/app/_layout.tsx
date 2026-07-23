import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { runMigrations } from '@/db/migrate';
import { AppErrorBoundary, ErrorScreen, RouteErrorBoundary } from '@/ui/error-boundary';
import { FeedbackProvider } from '@/ui/feedback';
import { theme } from '@/theme';

// Tela de erro usada pelo expo-router para erros de rota.
export { RouteErrorBoundary as ErrorBoundary };

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      runMigrations();
      setReady(true);
    } catch (e) {
      setDbError(e as Error);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={theme}
        settings={{ icon: (props) => <MaterialCommunityIcons {...(props as any)} /> }}
      >
        <StatusBar style="light" />
        <AppErrorBoundary>
          <FeedbackProvider>
            {dbError ? (
              <ErrorScreen error={dbError} />
            ) : !ready ? (
              <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.colors.background }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: theme.colors.primary },
                  headerTintColor: theme.colors.onPrimary,
                  headerTitleStyle: { fontSize: 20, fontWeight: 'bold' },
                  headerBackButtonDisplayMode: 'minimal',
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="cliente/novo" options={{ title: 'Novo cliente' }} />
                <Stack.Screen name="cliente/[id]" options={{ title: 'Cliente' }} />
                <Stack.Screen name="cliente/editar/[id]" options={{ title: 'Editar cliente' }} />
                <Stack.Screen name="pedido/novo" options={{ title: 'Novo pedido' }} />
                <Stack.Screen name="pedido/[id]" options={{ title: 'Pedido' }} />
                <Stack.Screen name="pedido/editar/[id]" options={{ title: 'Editar pedido' }} />
                <Stack.Screen name="config" options={{ title: 'Ajustes' }} />
              </Stack>
            )}
          </FeedbackProvider>
        </AppErrorBoundary>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
