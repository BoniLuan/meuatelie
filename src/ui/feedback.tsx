import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar, useTheme } from 'react-native-paper';

type FeedbackType = 'info' | 'success' | 'error';

type FeedbackContextValue = {
  showMessage: (message: string, type?: FeedbackType) => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

/**
 * Provider de feedback: mostra mensagens curtas em Snackbar na parte de baixo.
 * Uso: const { showMessage } = useFeedback(); showMessage('Pedido salvo!', 'success').
 */
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<FeedbackType>('info');

  const showMessage = useCallback((msg: string, kind: FeedbackType = 'info') => {
    setMessage(msg);
    setType(kind);
    setVisible(true);
  }, []);

  const value = useMemo(() => ({ showMessage }), [showMessage]);

  const bg =
    type === 'error'
      ? theme.colors.error
      : type === 'success'
        ? '#1B5E20'
        : theme.colors.inverseSurface;

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={type === 'error' ? 5000 : 2500}
        style={[styles.snackbar, { backgroundColor: bg }]}
        action={{ label: 'OK', textColor: '#FFFFFF', onPress: () => setVisible(false) }}
      >
        {message}
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback deve ser usado dentro de <FeedbackProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  snackbar: { marginBottom: 12 },
});
