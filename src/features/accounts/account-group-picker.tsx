import { Pressable, View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import type { AccountGroupChoice } from './account-form-contract';
import { AccountGroupIcon } from './account-group-icon';

export function AccountGroupOptions({
  choices,
}: {
  readonly choices: readonly AccountGroupChoice[];
}) {
  const theme = useAppTheme();
  return (
    <>
      {choices.map(({ id, label, detail, status, onSelect }) => (
        <Pressable
          key={id}
          accessible
          accessibilityRole="button"
          accessibilityLabel={[t(label), t(detail), status ? t(status) : null]
            .filter(Boolean)
            .join('. ')}
          accessibilityState={{ disabled: !onSelect }}
          disabled={!onSelect}
          onPress={onSelect}
          style={{
            minHeight: theme.buttons.minimumHeight,
            paddingHorizontal: theme.space.lg,
            paddingVertical: theme.space.sm,
            gap: theme.space.md,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomColor: theme.colors.border,
            borderBottomWidth: theme.navigation.borderWidth,
          }}
        >
          <AccountGroupIcon group={id} />
          <View style={{ flex: 1, gap: theme.space.xxs }}>
            <AppText muted={!onSelect}>{t(label)}</AppText>
            <AppText variant="caption" muted>
              {t(detail)}
            </AppText>
            {status ? <AppText variant="caption">{t(status)}</AppText> : null}
          </View>
        </Pressable>
      ))}
    </>
  );
}
