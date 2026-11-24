import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';

import type { AccountGroupChoice } from './account-form-contract';
import { AccountDropdown, AccountFormIcon } from './account-form-controls';
import { AccountGroupIcon } from './account-group-icon';

export function AccountGroupField({
  value,
  expanded,
  onPress,
}: {
  readonly value: TranslationKey;
  readonly expanded: boolean;
  readonly onPress: () => void;
}) {
  const theme = useAppTheme();
  const rowHeight = theme.space.xxl;
  const touchInset = (theme.buttons.minimumHeight - rowHeight) / 2;
  return (
    <AccountDropdown
      label="accountGroup"
      value={value}
      expanded={expanded}
      leading={<AccountFormIcon name="group" />}
      onPress={onPress}
      minimumHeight={rowHeight}
      hitSlop={{ top: touchInset, bottom: touchInset }}
    />
  );
}

export function AccountGroupOptions({
  choices,
}: {
  readonly choices: readonly AccountGroupChoice[];
}) {
  const theme = useAppTheme();
  return (
    <>
      {choices.map(({ id, label, detail, status, selected, onSelect }) => (
        <Pressable
          key={id}
          accessible
          accessibilityRole="button"
          accessibilityLabel={[t(label), t(detail), status ? t(status) : null]
            .filter(Boolean)
            .join('. ')}
          accessibilityState={{ disabled: !onSelect, selected }}
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
          {selected ? <GroupMark /> : null}
        </Pressable>
      ))}
    </>
  );
}

function GroupMark() {
  const theme = useAppTheme();
  return (
    <Svg
      width={theme.iconRoles.bottomSheet}
      height={theme.iconRoles.bottomSheet}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="m5 12 4 4L19 6"
        fill="none"
        stroke={theme.colors.brand}
        strokeWidth={theme.icons.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
