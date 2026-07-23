import { Chip } from 'react-native-paper';

import { STATUS_COLORS, STATUS_LABELS } from '@/theme';

export function StatusChip({ status, compact = true }: { status: string; compact?: boolean }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.a_fazer;
  return (
    <Chip
      compact={compact}
      style={{ backgroundColor: c.bg, alignSelf: 'flex-start' }}
      textStyle={{ color: c.fg, fontWeight: '600' }}
    >
      {STATUS_LABELS[status] ?? status}
    </Chip>
  );
}
