import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppTopBar, type AppTopBarAction } from '@/shared/ui/app-top-bar';

export function AccountPage({
  title,
  backLabel,
  onBack,
  actions,
  editing,
  children,
}: {
  readonly title: string;
  readonly backLabel?: string;
  readonly onBack?: () => void;
  readonly actions?: readonly AppTopBarAction[];
  readonly editing?: boolean;
  readonly children: ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ flex: 1, backgroundColor: theme.colors.card }}
    >
      <AppTopBar
        title={title}
        onBack={onBack}
        backAccessibilityLabel={backLabel}
        actions={actions}
        editing={editing}
      />
      {children}
    </SafeAreaView>
  );
}
