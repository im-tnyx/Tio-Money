import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppPopupCard } from './app-popup-card';
import { AppText } from './app-text';
import { AppWheelPicker } from './app-wheel-picker';
import { fitPopupRows } from './popup-position';
import {
  calendarMonths,
  calendarWheelCounts,
  calendarWheelIndex,
  calendarWheelLabel,
  dayWheelBounds,
  dayWheelCount,
  initialDayWheelIndex,
  initialMonthWheelIndex,
  monthWheelBounds,
  monthWheelCount,
  parseCalendarDate,
  type CalendarPart,
} from './calendar-date';

export interface AppDateFieldModel {
  readonly value: string;
  readonly open: boolean;
  readonly dayIndex?: number | undefined;
  readonly monthIndex?: number | undefined;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  readonly onChange: (part: CalendarPart, index: number) => void;
}

/** Reusable controlled local-date field; selection updates immediately, with no footer. */
export function AppDateField({
  label,
  leading,
  value,
  open,
  dayIndex,
  monthIndex,
  onOpen,
  onClose,
  onChange,
}: AppDateFieldModel & {
  readonly label: string;
  readonly leading: ReactNode;
}) {
  const theme = useAppTheme();
  const viewport = useWindowDimensions();
  const date = parseCalendarDate(value);
  if (!date) return null;

  const day = String(date.day).padStart(2, '0');
  const month = calendarMonths[date.month - 1];
  const physicalDay = dayIndex ?? initialDayWheelIndex(date);
  const dayBounds = dayWheelBounds(date, physicalDay);
  const physicalMonth = monthIndex ?? initialMonthWheelIndex(date);
  const monthBounds = monthWheelBounds(date, physicalMonth);
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
      value={`${day} ${month} ${date.year}`}
      dismissLabel={t('closeDatePicker')}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      preferredWidth={theme.datePicker.width}
      placement="above"
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
              {day}
            </AppText>
            <AppText style={{ includeFontPadding: false }}>
              {month} {date.year}
            </AppText>
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
                key={`day-${wheelKey}`}
                label={t('accountDateDay')}
                count={dayWheelCount}
                minimumIndex={dayBounds.minimum}
                maximumIndex={dayBounds.maximum}
                labelAt={(index) => calendarWheelLabel('day', index + dayBounds.origin)}
                value={physicalDay}
                onChange={(index) => onChange('day', index + dayBounds.origin)}
                rowHeight={rowHeight}
                visibleRows={visibleRows}
              />
              <AppWheelPicker
                key={`month-${wheelKey}`}
                label={t('accountDateMonth')}
                count={monthWheelCount}
                minimumIndex={monthBounds.minimum}
                maximumIndex={monthBounds.maximum}
                labelAt={(index) => calendarWheelLabel('month', index + monthBounds.origin)}
                value={physicalMonth}
                onChange={(index) => onChange('month', index + monthBounds.origin)}
                rowHeight={rowHeight}
                visibleRows={visibleRows}
              />
              <AppWheelPicker
                key={`year-${wheelKey}`}
                label={t('accountDateYear')}
                count={calendarWheelCounts.year}
                labelAt={(index) => calendarWheelLabel('year', index)}
                value={calendarWheelIndex(date, 'year')}
                onChange={(value) => onChange('year', value)}
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
