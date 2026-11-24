import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppPopupCard } from './app-popup-card';
import { AppText } from './app-text';
import { AppWheelPicker } from './app-wheel-picker';
import {
  encodeMonthDay,
  initialMonthDayWheelIndex,
  monthDayFromWheelIndex,
  monthDayWheelCount,
  parseMonthDay,
} from './month-day';
import { fitPopupRows } from './popup-position';

export {
  encodeMonthDay,
  initialMonthDayWheelIndex,
  monthDayFromWheelIndex,
  monthDayCount,
  monthDayWheelCount,
  parseMonthDay,
} from './month-day';

export interface AppDayOfMonthFieldModel {
  readonly value: string;
  readonly open: boolean;
  readonly dayIndex?: number | undefined;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  /** Absolute looping wheel index; civil day is derived by modulo 31. */
  readonly onChange: (wheelIndex: number) => void;
}

/** Monthly day field: one Day wheel, with an “of every month” display suffix. */
export function AppDayOfMonthField({
  label,
  leading,
  value,
  open,
  dayIndex,
  onOpen,
  onClose,
  onChange,
}: AppDayOfMonthFieldModel & {
  readonly label: string;
  readonly leading: ReactNode;
}) {
  const theme = useAppTheme();
  const viewport = useWindowDimensions();
  const day = parseMonthDay(value);
  if (day === null) return null;

  const display = encodeMonthDay(day);
  const physicalDay = dayIndex ?? initialMonthDayWheelIndex(day);
  const rowHeight = Math.max(
    theme.datePicker.rowHeight,
    Math.ceil(theme.typeScale.section * viewport.fontScale * theme.typography.relativeLineHeight) +
      theme.space.xxs,
  );
  const verticalInsets = theme.datePicker.paddingVertical * 2 + theme.navigation.borderWidth * 2;
  const rowCounts = [
    theme.datePicker.visibleRows,
    theme.datePicker.compactRows,
    theme.datePicker.minimumRows,
  ];

  return (
    <AppPopupCard
      label={label}
      value={`${display} ${t('accountCardMonthlySuffix')}`}
      dismissLabel={t('closeDatePicker')}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      preferredWidth={theme.datePicker.dayPickerWidth}
      placement="above"
      align="start"
      preferredHeight={rowHeight * theme.datePicker.visibleRows + verticalInsets}
      minimumHeight={rowHeight * theme.datePicker.minimumRows + verticalInsets}
      trigger={
        <View style={{ gap: theme.textField.captionGap }}>
          <AppText
            variant="caption"
            muted
            style={{
              marginStart: theme.iconRoles.textField + theme.space.sm,
              includeFontPadding: false,
            }}
          >
            {label}
          </AppText>
          <View
            style={{
              minHeight: theme.textField.minimumHeight,
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
              variant="title"
              style={{ fontWeight: theme.typography.mediumWeight, includeFontPadding: false }}
            >
              {display}
            </AppText>
            <AppText style={{ includeFontPadding: false }}>{t('accountCardMonthlySuffix')}</AppText>
          </View>
        </View>
      }
    >
      {(availableContentHeight) => {
        const visibleRows = fitPopupRows(
          availableContentHeight - theme.datePicker.paddingVertical * 2,
          rowHeight,
          rowCounts,
        );
        if (!visibleRows) return null;
        const wheelHeight = rowHeight * visibleRows;
        const wheelKey = `${rowHeight}-${visibleRows}`;

        return (
          <View
            style={{
              paddingHorizontal: theme.datePicker.paddingHorizontal,
              paddingVertical: theme.datePicker.paddingVertical,
            }}
          >
            <View style={{ height: wheelHeight, flexDirection: 'row' }}>
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: ((visibleRows - 1) / 2) * rowHeight,
                  left: theme.navigation.origin,
                  right: theme.navigation.origin,
                  height: rowHeight,
                  borderRadius: theme.radius.sm,
                  backgroundColor: theme.colors.wheelSelection,
                }}
              />
              <AppWheelPicker
                key={`month-day-${wheelKey}`}
                label={t('accountDateDay')}
                count={monthDayWheelCount}
                labelAt={(index) => encodeMonthDay(monthDayFromWheelIndex(index))}
                value={physicalDay}
                onChange={onChange}
                rowHeight={rowHeight}
                visibleRows={visibleRows}
              />
            </View>
          </View>
        );
      }}
    </AppPopupCard>
  );
}
