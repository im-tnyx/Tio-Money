import { View } from 'react-native';

import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppText } from './app-text';
import { SectionCard } from './section-card';

export type PanelState = 'empty' | 'loading' | 'error' | 'planned';

export function StatePanel({
  title,
  description,
  state = 'planned',
}: {
  title: string;
  description: string;
  state?: PanelState;
}) {
  const theme = useAppTheme();
  const label = state === 'planned' ? 'COMING IN A LATER PHASE' : state.toUpperCase();
  return (
    <SectionCard>
      <View style={{ gap: theme.space.sm }}>
        <AppText variant="caption" style={{ color: theme.colors.brand, fontWeight: '700' }}>
          {label}
        </AppText>
        <AppText variant="section">{title}</AppText>
        <AppText muted>{description}</AppText>
      </View>
    </SectionCard>
  );
}
