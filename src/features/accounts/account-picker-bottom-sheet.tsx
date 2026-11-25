import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import type { BottomSheetLayer } from '@/shared/ui/app-bottom-sheet';
import { AppText } from '@/shared/ui/app-text';

import { AccountGroupIcon } from './account-group-icon';
import {
  accountPickerGroups,
  accountPickerVisible,
  type AccountPickerModel,
} from './account-picker-contract';

/** Reusable content for the existing single AppBottomSheet scroll shell. */
export function AccountPickerOptions({ picker }: { readonly picker: AccountPickerModel }) {
  const theme = useAppTheme();

  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t('choosePaymentAccount')}>
      {accountPickerGroups(picker.accounts).map(({ group, accounts }) => (
        <View key={group}>
          <AppText
            variant="caption"
            muted
            style={{ paddingHorizontal: theme.space.lg, paddingVertical: theme.space.xs }}
          >
            {t(group === 'cash' ? 'accountGroupCash' : 'accountGroupBank')}
          </AppText>
          {accounts.map((account) => {
            const selected = account.id === picker.selectedId;
            return (
              <Pressable
                key={account.id}
                accessibilityRole="radio"
                accessibilityLabel={account.name}
                accessibilityState={{ checked: selected }}
                onPress={() => picker.onSelect(account.id)}
                style={{
                  minHeight: theme.buttons.minimumHeight,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.space.md,
                  paddingHorizontal: theme.space.lg,
                  paddingVertical: theme.space.xs,
                }}
              >
                <AccountGroupIcon group={group} />
                <AppText style={{ flex: 1 }}>{account.name}</AppText>
                {selected ? (
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
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Reuse the screen's existing modal; never mount an empty account sheet. */
export function accountPickerBottomSheetLayer(
  picker: AccountPickerModel | null,
): BottomSheetLayer | undefined {
  if (!picker || !accountPickerVisible(picker)) return undefined;
  return {
    title: t('choosePaymentAccount'),
    dismissAccessibilityLabel: t('closePaymentAccountPicker'),
    onDismiss: picker.onClose,
    expandable: true,
    children: <AccountPickerOptions picker={picker} />,
  };
}
