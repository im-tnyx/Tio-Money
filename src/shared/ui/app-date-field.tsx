import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/shared/i18n/strings';
import { useAppTheme } from '@/shared/theme/theme-provider';

import { AppPopupCard } from './app-popup-card';
import { AppText } from './app-text';
import { AppWheelPicker } from './app-wheel-picker';
import {
  calendarDays,
  calendarMonths,
  calendarYearMax,
  calendarYearMin,
  parseCalendarDate,
  type CalendarPart,
} from './calendar-date';

export interface AppDateFieldModel {
  readonly value: string;
  readonly open: boolean;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  readonly onChange: (part: CalendarPart, value: number) => void;
}

const years = Array.from({ length: calendarYearMax - calendarYearMin + 1 }, (_, index) => ({
  value: calendarYearMin + index,
  label: String(calendarYearMin + index),
}));
const months = calendarMonths.map((label, index) => ({ value: index + 1, label }));

/** Reusable controlled local-date field; selection updates immediately, with no footer. */
export function AppDateField({
  label,
  leading,
  value,
  open,
  onOpen,
  onClose,
  onChange,
}: AppDateFieldModel & {
  readonly label: string;
  readonly leading: ReactNode;
}) {
  const theme = useAppTheme();
  const viewport = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const date = parseCalendarDate(value);
  if (!date) return null;

  const day = String(date.day).padStart(2, '0');
  const month = calendarMonths[date.month - 1];
  const count = calendarDays(date.year, date.month);
  const days = Array.from({ length: count }, (_, index) => ({
    value: index + 1,
    label: String(index + 1).padStart(2, '0'),
  }));
  const desiredRowHeight = Math.max(
    theme.datePicker.rowHeight,
    Math.ceil(theme.typeScale.section * viewport.fontScale * theme.typography.relativeLineHeight) +
      theme.space.xxs,
  );
  const usableHeight = Math.max(
    1,
    viewport.height - insets.top - insets.bottom - theme.space.xs * 4,
  );
  const rowHeight = Math.min(desiredRowHeight, usableHeight);
  const visibleRows =
    usableHeight >= rowHeight * theme.datePicker.visibleRows
      ? theme.datePicker.visibleRows
      : usableHeight >= rowHeight * theme.datePicker.compactRows
        ? theme.datePicker.compactRows
        : theme.datePicker.minimumRows;
  const wheelHeight = rowHeight * visibleRows;
  const wheelKey = `${rowHeight}-${visibleRows}`;

  return (
    <AppPopupCard
      label={label}
      value={`${day} ${month} ${date.year}`}
      dismissLabel={t('closeDatePicker')}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      preferredWidth={theme.datePicker.width}
      preferredHeight={wheelHeight + theme.space.xs * 2}
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
      <View style={{ padding: theme.space.xs }}>
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
              backgroundColor: theme.colors.segmentedTrack,
            }}
          />
          <AppWheelPicker
            key={`day-${count}-${wheelKey}`}
            label={t('accountDateDay')}
            options={days}
            value={date.day}
            onChange={(value) => onChange('day', value)}
            rowHeight={rowHeight}
            visibleRows={visibleRows}
          />
          <AppWheelPicker
            key={`month-${wheelKey}`}
            label={t('accountDateMonth')}
            options={months}
            value={date.month}
            onChange={(value) => onChange('month', value)}
            rowHeight={rowHeight}
            visibleRows={visibleRows}
          />
          <AppWheelPicker
            key={`year-${wheelKey}`}
            label={t('accountDateYear')}
            options={years}
            value={date.year}
            onChange={(value) => onChange('year', value)}
            rowHeight={rowHeight}
            visibleRows={visibleRows}
          />
        </View>
      </View>
    </AppPopupCard>
  );
}
