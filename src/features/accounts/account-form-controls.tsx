import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { CurrencyCode } from '@/shared/currency/currency-preference';
import { t, type TranslationKey } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';
import { AppTextField, type AppTextFieldProps } from '@/shared/ui/app-text-field';

import type { AddAccountViewModel } from './account-form-contract';

export function AccountField({
  label,
  leading,
  trailing,
  labelAsPlaceholder = false,
  ...props
}: AppTextFieldProps & {
  readonly label: TranslationKey;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
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
    const iconColumnWidth = theme.iconRoles.textField;
    const iconGap = theme.space.sm;
    return (
      <View style={{ gap: theme.space.xxs }}>
        {labelAsPlaceholder ? null : (
          <AppText variant="caption" muted style={{ marginLeft: iconColumnWidth + iconGap }}>
            {t(label)}
          </AppText>
        )}
        <View
          style={{
            flexDirection: 'row',
            gap: iconGap,
            alignItems: trailing ? 'center' : 'flex-start',
          }}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: iconColumnWidth,
              minHeight: theme.textField.minimumHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {leading}
          </View>
          <View style={{ flex: 1 }}>{input}</View>
          {trailing}
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: theme.space.xxs }}>
      {labelAsPlaceholder ? null : <AppText>{t(label)}</AppText>}
      {input}
    </View>
  );
}

export function AmountCurrencyChoices({
  fieldLabel,
  options,
  value,
  onChange,
}: {
  readonly fieldLabel: TranslationKey;
  readonly options: NonNullable<AddAccountViewModel['currencyChoices']>;
  readonly value: CurrencyCode;
  readonly onChange: (currency: CurrencyCode) => void;
}) {
  const theme = useAppTheme();
  const amountResetHint = t('accountCurrencyChangeHint');

  return (
    <ScrollView
      horizontal
      keyboardShouldPersistTaps="handled"
      accessibilityRole="radiogroup"
      accessibilityLabel={t('currency') + ', ' + t(fieldLabel)}
      style={{
        flexGrow: 0,
        width: options.length * theme.buttons.minimumHeight,
        maxWidth: '50%',
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }}
            accessibilityHint={selected ? undefined : amountResetHint}
            onPress={() => onChange(option.value)}
            style={{
              width: theme.buttons.minimumHeight,
              minHeight: theme.buttons.minimumHeight,
              paddingEnd: theme.space.xxs,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: theme.buttons.currencyChoiceSize,
                height: theme.buttons.currencyChoiceSize,
                borderRadius: theme.radius.xs,
                borderWidth: theme.buttons.outlineWidth,
                borderColor: selected ? theme.colors.brand : theme.colors.border,
                backgroundColor: selected ? theme.colors.brandTint : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText
                variant="section"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={selected ? { color: theme.colors.brand } : undefined}
              >
                {option.symbol}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function AccountChoices<Value extends string>({
  label,
  options,
  value,
  onChange,
  compact = false,
}: {
  readonly label: TranslationKey;
  readonly options: readonly {
    readonly value: Value;
    readonly label: string;
    readonly disabled?: boolean;
    readonly accessibilityHint?: string;
  }[];
  readonly value?: Value;
  readonly onChange?: (value: Value) => void;
  readonly compact?: boolean;
}) {
  const theme = useAppTheme();
  const choices = options.map((option) => {
    const selected = value === option.value;
    const disabled = !onChange || option.disabled === true;
    return (
      <Pressable
        key={option.value}
        accessibilityRole="radio"
        accessibilityLabel={option.label}
        accessibilityState={{ checked: selected, disabled }}
        accessibilityHint={option.accessibilityHint}
        disabled={disabled}
        onPress={onChange && !disabled ? () => onChange(option.value) : undefined}
        style={{
          minWidth: compact ? theme.buttons.minimumHeight : undefined,
          minHeight: theme.buttons.minimumHeight,
          borderWidth: compact ? theme.buttons.noBorder : theme.buttons.outlineWidth,
          borderColor: selected ? theme.colors.brand : theme.colors.border,
          borderRadius: theme.radius.sm,
          backgroundColor: compact ? 'transparent' : theme.colors.card,
          paddingHorizontal: compact ? theme.space.xxs : theme.space.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: compact ? 'center' : undefined,
          opacity: option.disabled ? theme.buttons.disabledOpacity : undefined,
          gap: theme.space.xxs,
        }}
      >
        {selected && !compact ? (
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
        {compact ? (
          <View
            style={{
              minHeight: theme.segmentedControl.compactOptionHeight,
              borderRadius: theme.segmentedControl.radius,
              borderWidth: theme.buttons.outlineWidth,
              borderColor: selected ? theme.colors.primaryText : theme.colors.border,
              paddingHorizontal: theme.space.xs,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText variant="caption" muted={disabled || !selected} numberOfLines={1}>
              {option.label}
            </AppText>
          </View>
        ) : (
          <AppText muted={disabled}>{option.label}</AppText>
        )}
      </Pressable>
    );
  });
  if (compact) {
    return (
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="handled"
        accessibilityRole="radiogroup"
        accessibilityLabel={t(label)}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {choices}
      </ScrollView>
    );
  }

  return (
    <View style={{ gap: theme.space.xxs }}>
      <AppText>{t(label)}</AppText>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t(label)}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm }}
      >
        {choices}
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
