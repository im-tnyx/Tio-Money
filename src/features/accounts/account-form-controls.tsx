import type { ReactNode } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Svg, { Path, SvgXml } from 'react-native-svg';

import infoIcon from '@/shared/assets/google-material-icons/info-icon.json';
import type { CurrencyCode } from '@/shared/currency/currency-preference';
import { t, type TranslationKey } from '@/shared/i18n/strings';
import { size } from '@/shared/theme/primitives';
import { useAppTheme } from '@/shared/theme/theme-provider';
import { AppText } from '@/shared/ui/app-text';
import { AppTextField, type AppTextFieldProps } from '@/shared/ui/app-text-field';

import type { AccountOption, AddAccountViewModel } from './account-form-contract';

const rowIcons = {
  text: 'M5 17 12 4l7 13 M8 12h8 M5 21h14',
  calendar: 'M4 6h16v14H4z M4 10h16 M8 4v4 M16 4v4 M8 14h1 M12 14h1 M16 14h1',
  description: 'M4 6h16 M4 10h16 M4 14h16 M4 18h10',
  options: 'M5 6h2 M5 12h2 M5 18h2 M11 6h8 M11 12h8 M11 18h8',
  card: 'M3 5h18v14H3z M3 10h18 M6 15h4',
  bank: 'm3 9 9-5 9 5H3 M6 9v8 M12 9v8 M18 9v8 M3 20h18',
  autoPay: 'M20 8a8 8 0 1 0 0 8 M20 4v4h-4 M13 7l-4 6h4l-2 4',
} as const;

export function AccountFormIcon({ name }: { readonly name: keyof typeof rowIcons }) {
  const theme = useAppTheme();
  return (
    <Svg
      width={theme.iconRoles.textField}
      height={theme.iconRoles.textField}
      viewBox="0 0 24 24"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d={rowIcons[name]}
        fill="none"
        stroke={theme.colors.primaryText}
        strokeWidth={theme.icons.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function AccountFormRow({
  label,
  leading,
  children,
  minimumHeight,
}: {
  readonly label: TranslationKey;
  readonly leading: ReactNode;
  readonly children: ReactNode;
  readonly minimumHeight?: number;
}) {
  const theme = useAppTheme();
  const rowHeight = minimumHeight ?? theme.textField.minimumHeight;
  return (
    <View
      style={{
        minHeight: rowHeight,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space.sm,
      }}
    >
      <View
        style={{
          minHeight: rowHeight,
          width: '50%',
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space.sm,
        }}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ width: theme.iconRoles.textField, alignItems: 'center' }}
        >
          {leading}
        </View>
        <AppText
          muted
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{ flex: 1, includeFontPadding: false }}
        >
          {t(label)}
        </AppText>
      </View>
      <View
        style={{
          flex: 1,
          minWidth: '0%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: theme.space.xs,
        }}
      >
        {children}
      </View>
    </View>
  );
}

/** Official Material Symbols Outlined `info` wght200 at 16 dp. */
export function AccountFieldInfoMark() {
  const theme = useAppTheme();
  return (
    <SvgXml
      xml={infoIcon}
      width={size.dp16}
      height={size.dp16}
      fill={theme.colors.secondaryText}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export function AccountField({
  label,
  leading,
  trailing,
  labelAsPlaceholder = false,
  suffix,
  info,
  ...props
}: AppTextFieldProps & {
  readonly label: TranslationKey;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
  readonly labelAsPlaceholder?: boolean;
  readonly suffix?: ReactNode;
  readonly info?: ReactNode;
}) {
  const theme = useAppTheme();
  const { fontScale } = useWindowDimensions();
  const input = (
    <AppTextField
      accessibilityLabel={t(label)}
      {...props}
      placeholder={labelAsPlaceholder ? t(label) : props.placeholder}
    />
  );

  if (leading) {
    const iconWidth = theme.iconRoles.textField;
    const columnGap = theme.space.sm;
    return (
      <View style={{ gap: theme.textField.captionGap }}>
        {labelAsPlaceholder ? null : (
          <View
            style={{
              marginStart: iconWidth + columnGap,
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.xxs,
            }}
          >
            <AppText variant="caption" muted style={{ flexShrink: 1, includeFontPadding: false }}>
              {t(label)}
            </AppText>
            {info}
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            alignItems: props.multiline ? 'flex-start' : 'center',
            gap: columnGap,
          }}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              width: iconWidth,
              minHeight: theme.textField.minimumHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {leading}
          </View>
          {suffix ? (
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.space.xxs,
              }}
            >
              <View
                style={{
                  width:
                    theme.typeScale.title * fontScale * ((props.maxLength ?? 2) / 2) +
                    theme.space.xs,
                }}
              >
                {input}
              </View>
              {suffix}
            </View>
          ) : (
            <View style={{ flex: 1, minWidth: '0%' }}>{input}</View>
          )}
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

export function CalendarDateMonthAndYear({
  label,
  month,
  year,
  onMonthChange,
  onYearChange,
}: {
  readonly label: TranslationKey;
  readonly month: string;
  readonly year: string;
  readonly onMonthChange: (value: string) => void;
  readonly onYearChange: (value: string) => void;
}) {
  const theme = useAppTheme();
  const { fontScale } = useWindowDimensions();

  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.space.xxs }}>
      <AppText muted>/</AppText>
      <View style={{ width: theme.typeScale.section * fontScale + theme.space.xs }}>
        <AppTextField
          appearance="borderless"
          textSize="section"
          accessibilityLabel={t(label) + ', ' + t('accountDateMonth')}
          keyboardType="number-pad"
          maxLength={2}
          placeholder={t('accountDateMonthPlaceholder')}
          value={month}
          onChangeText={onMonthChange}
        />
      </View>
      <AppText muted>/</AppText>
      <View style={{ flex: 1, minWidth: '0%' }}>
        <AppTextField
          appearance="borderless"
          textSize="section"
          accessibilityLabel={t(label) + ', ' + t('accountDateYear')}
          keyboardType="number-pad"
          maxLength={4}
          placeholder={t('accountDateYearPlaceholder')}
          value={year}
          onChangeText={onYearChange}
        />
      </View>
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

export function AccountChoices({
  label,
  options,
  compact = false,
}: {
  readonly label: TranslationKey;
  readonly options: readonly AccountOption[];
  readonly compact?: boolean;
}) {
  const theme = useAppTheme();
  const compactLabelSize = theme.segmentedControl.compactOptionLabelSize;
  const choices = options.map((option) => {
    const { selected, onSelect } = option;
    const disabled = !onSelect;
    return (
      <Pressable
        key={option.value}
        accessibilityRole="radio"
        accessibilityLabel={option.label}
        accessibilityState={{ checked: selected, disabled }}
        accessibilityHint={option.accessibilityHint}
        disabled={disabled}
        onPress={onSelect}
        style={{
          minWidth: compact ? theme.buttons.minimumHeight : undefined,
          minHeight: theme.buttons.minimumHeight,
          paddingVertical: compact ? undefined : theme.space.xs,
          paddingHorizontal: compact ? theme.space.xxs : theme.space.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: compact ? 'center' : 'space-between',
          opacity: disabled ? theme.buttons.disabledOpacity : undefined,
          gap: theme.space.sm,
        }}
      >
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
            <AppText
              variant="caption"
              muted={disabled || !selected}
              numberOfLines={1}
              style={{
                fontSize: compactLabelSize,
                lineHeight: Math.ceil(compactLabelSize * theme.typography.relativeLineHeight),
              }}
            >
              {option.label}
            </AppText>
          </View>
        ) : (
          <AppText muted={disabled}>{option.label}</AppText>
        )}
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
    <View accessibilityRole="radiogroup" accessibilityLabel={t(label)}>
      {choices}
    </View>
  );
}
