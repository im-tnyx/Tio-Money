import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';
import { AppTextField, type AppTextFieldProps } from '@/shared/ui/app-text-field';

export function AccountField({
  label,
  ...props
}: AppTextFieldProps & { readonly label: TranslationKey }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.space.xxs }}>
      <AppText>{t(label)}</AppText>
      <AppTextField accessibilityLabel={t(label)} {...props} />
    </View>
  );
}

export function AccountChoices<Value extends string>({
  label,
  options,
  value,
  onChange,
}: {
  readonly label: TranslationKey;
  readonly options: readonly { readonly value: Value; readonly label: string }[];
  readonly value?: Value;
  readonly onChange?: (value: Value) => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.space.xxs }}>
      <AppText>{t(label)}</AppText>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t(label)}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}
      >
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: selected, disabled: !onChange }}
              disabled={!onChange}
              onPress={onChange ? () => onChange(option.value) : undefined}
              style={{
                minHeight: theme.buttons.minimumHeight,
                borderWidth: theme.buttons.outlineWidth,
                borderColor: selected ? theme.colors.brand : theme.colors.border,
                borderRadius: theme.radius.sm,
                backgroundColor: theme.colors.card,
                paddingHorizontal: theme.space.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.xxs,
              }}
            >
              {selected ? (
                <Svg
                  width={theme.iconRoles.button}
                  height={theme.iconRoles.button}
                  viewBox="0 0 24 24"
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                >
                  <Path
                    d="m5 12 4 4 10-10"
                    fill="none"
                    stroke={theme.colors.primaryText}
                    strokeWidth={theme.icons.stroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : null}
              <AppText muted={!onChange}>{option.label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function UnavailableAccountChoice({
  label,
  detail,
}: {
  readonly label: TranslationKey;
  readonly detail: TranslationKey;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.space.xxs }}>
      <AppText>{t(label)}</AppText>
      <AppText variant="caption" muted>
        {t(detail)}
      </AppText>
    </View>
  );
}
