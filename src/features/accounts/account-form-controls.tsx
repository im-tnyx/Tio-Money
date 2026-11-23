import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';
import { AppTextField, type AppTextFieldProps } from '@/shared/ui/app-text-field';

export function AccountField({
  label,
  leading,
  labelAsPlaceholder = false,
  ...props
}: AppTextFieldProps & {
  readonly label: TranslationKey;
  readonly leading?: ReactNode;
  readonly labelAsPlaceholder?: boolean;
}) {
  const theme = useAppTheme();
  const input = (
    <AppTextField
      accessibilityLabel={t(label)}
      {...props}
      placeholder={labelAsPlaceholder ? t(label) : props.placeholder}
    />
  );
  if (leading) {
    const iconColumnWidth = theme.iconRoles.textField + theme.space.sm;
    const iconGap = theme.space.xs;
    return (
      <View style={{ gap: theme.space.xxs }}>
        {labelAsPlaceholder ? null : (
          <AppText variant="caption" muted style={{ marginLeft: iconColumnWidth + iconGap }}>
            {t(label)}
          </AppText>
        )}
        <View style={{ flexDirection: 'row', gap: iconGap }}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: iconColumnWidth,
              minHeight: theme.buttons.minimumHeight,
              alignSelf: 'flex-start',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {leading}
          </View>
          <View style={{ flex: 1 }}>{input}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: theme.space.xxs }}>
      <AppText>{t(label)}</AppText>
      {input}
    </View>
  );
}

export function AccountChoices<Value extends string>({
  label,
  options,
  value,
  onChange,
  singleRow = false,
}: {
  readonly label: TranslationKey;
  readonly options: readonly {
    readonly value: Value;
    readonly label: string;
    readonly symbol?: string;
  }[];
  readonly value?: Value;
  readonly onChange?: (value: Value) => void;
  readonly singleRow?: boolean;
}) {
  const theme = useAppTheme();
  const choices = (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t(label)}
      style={{ flexDirection: 'row', flexWrap: singleRow ? 'nowrap' : 'wrap', gap: theme.space.sm }}
    >
      {options.map((option) => {
        const selected = value === option.value;
        const symbolOnly = option.symbol !== undefined;
        const filled = selected && symbolOnly;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected, disabled: !onChange }}
            disabled={!onChange}
            onPress={onChange ? () => onChange(option.value) : undefined}
            style={{
              minWidth: symbolOnly ? theme.buttons.minimumHeight : undefined,
              minHeight: theme.buttons.minimumHeight,
              borderWidth: theme.buttons.outlineWidth,
              borderColor: selected ? theme.colors.brand : theme.colors.border,
              borderRadius: theme.radius.sm,
              backgroundColor: filled
                ? theme.colors.brand
                : symbolOnly
                  ? 'transparent'
                  : theme.colors.card,
              paddingHorizontal: symbolOnly ? theme.space.xs : theme.space.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: symbolOnly ? 'center' : undefined,
              gap: theme.space.xxs,
            }}
          >
            {selected && !symbolOnly ? (
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
            <AppText
              variant={symbolOnly ? 'section' : 'body'}
              muted={!onChange}
              style={filled ? { color: theme.colors.brandText } : undefined}
            >
              {option.symbol ?? option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
  return (
    <View style={{ gap: theme.space.xxs }}>
      <AppText>{t(label)}</AppText>
      {singleRow ? (
        <ScrollView horizontal keyboardShouldPersistTaps="handled">
          {choices}
        </ScrollView>
      ) : (
        choices
      )}
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
