import { configureFonts, MD3LightTheme } from 'react-native-paper';

/**
 * Tema do "Meu Ateliê".
 * Paleta rosa/vinho quente (clima de ateliê de bordados), clara e de alto contraste,
 * com fontes maiores por padrão para facilitar a leitura da usuária (~60 anos).
 */

const base = MD3LightTheme.fonts;

// Fontes maiores que o padrão do Material 3 (respeita o aumento de fonte do sistema).
const fonts = configureFonts({
  config: {
    bodyLarge: { ...base.bodyLarge, fontSize: 18, lineHeight: 26 },
    bodyMedium: { ...base.bodyMedium, fontSize: 16, lineHeight: 24 },
    bodySmall: { ...base.bodySmall, fontSize: 14, lineHeight: 20 },
    titleLarge: { ...base.titleLarge, fontSize: 24, lineHeight: 30 },
    titleMedium: { ...base.titleMedium, fontSize: 18, lineHeight: 26 },
    labelLarge: { ...base.labelLarge, fontSize: 16, lineHeight: 22 },
    headlineSmall: { ...base.headlineSmall, fontSize: 26, lineHeight: 34 },
  },
});

export const theme = {
  ...MD3LightTheme,
  roundness: 4,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#9C4668',
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFD9E1',
    onPrimaryContainer: '#3F0021',
    secondary: '#75565B',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FFD9E1',
    onSecondaryContainer: '#2B151A',
    tertiary: '#7A5B30',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFDDB0',
    onTertiaryContainer: '#2A1800',
    background: '#FFF8F8',
    onBackground: '#22191B',
    surface: '#FFF8F8',
    onSurface: '#22191B',
    surfaceVariant: '#F2DDE1',
    onSurfaceVariant: '#514347',
    outline: '#837377',
    error: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#410002',
  },
};

export type AppTheme = typeof theme;

/** Cores por status do pedido — leitura rápida por cor. */
export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  a_fazer: { bg: '#E3E7EB', fg: '#374553' },
  em_andamento: { bg: '#FDECC8', fg: '#7A5300' },
  pronto: { bg: '#CDEBCE', fg: '#1B5E20' },
  entregue: { bg: '#D6E4FF', fg: '#0D47A1' },
  cancelado: { bg: '#FFDAD6', fg: '#8C1D18' },
};

export const STATUS_LABELS: Record<string, string> = {
  a_fazer: 'A fazer',
  em_andamento: 'Em andamento',
  pronto: 'Pronto',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

/** Situação de pagamento (derivada). */
export const PAYMENT_COLORS: Record<string, { bg: string; fg: string }> = {
  em_aberto: { bg: '#FFDAD6', fg: '#8C1D18' },
  parcial: { bg: '#FDECC8', fg: '#7A5300' },
  pago: { bg: '#CDEBCE', fg: '#1B5E20' },
};
