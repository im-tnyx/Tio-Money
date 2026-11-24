/** Local civil dates: never convert these values to UTC timestamps. */
export const calendarYearMin = 1900;
export const calendarYearMax = 2100;
export const calendarMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export interface CalendarDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export type CalendarPart = keyof CalendarDate;

export function calendarDays(year: number, month: number): number {
  if (month === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function encodeCalendarDate({ year, month, day }: CalendarDate): string {
  return [
    String(year).padStart(4, '0'),
    String(month).padStart(2, '0'),
    String(day).padStart(2, '0'),
  ].join('-');
}

export function parseCalendarDate(value: string): CalendarDate | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  if (
    year < calendarYearMin ||
    year > calendarYearMax ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > calendarDays(year, month)
  ) {
    return null;
  }
  return { year, month, day };
}

export function localCalendarToday(now = new Date()): string {
  return encodeCalendarDate({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  });
}

export function changeCalendarPart(
  date: CalendarDate,
  part: CalendarPart,
  value: number,
): CalendarDate {
  if (!Number.isInteger(value)) return date;
  if (part === 'year' && (value < calendarYearMin || value > calendarYearMax)) return date;
  if (part === 'month' && (value < 1 || value > 12)) return date;
  if (part === 'day' && (value < 1 || value > calendarDays(date.year, date.month))) return date;
  const next = { ...date, [part]: value };
  return { ...next, day: Math.min(next.day, calendarDays(next.year, next.month)) };
}

// UTC is used only as an arithmetic coordinate for Gregorian civil-day ordinals.
// No local time or timezone conversion is applied to stored dates.
const millisecondsPerDay = 86_400_000;
const firstCalendarDay = Date.UTC(calendarYearMin, 0, 1) / millisecondsPerDay;
const yearCount = calendarYearMax - calendarYearMin + 1;

export const calendarWheelCounts: Readonly<Record<CalendarPart, number>> = {
  day: Date.UTC(calendarYearMax + 1, 0, 1) / millisecondsPerDay - firstCalendarDay,
  month: yearCount * 12,
  year: yearCount,
};

export function calendarWheelIndex(date: CalendarDate, part: CalendarPart): number {
  if (part === 'year') return date.year - calendarYearMin;
  if (part === 'month') return (date.year - calendarYearMin) * 12 + date.month - 1;
  return Date.UTC(date.year, date.month - 1, date.day) / millisecondsPerDay - firstCalendarDay;
}

function dateAtDayIndex(index: number): CalendarDate {
  const date = new Date((firstCalendarDay + index) * millisecondsPerDay);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function calendarWheelLabel(part: CalendarPart, index: number): string {
  if (part === 'year') return String(calendarYearMin + index);
  if (part === 'month') return calendarMonths[index % 12] ?? '';
  return String(dateAtDayIndex(index).day).padStart(2, '0');
}

/** Select an absolute detent; skipped events and multiple month/year rollovers remain exact. */
export function selectCalendarWheel(
  date: CalendarDate,
  part: CalendarPart,
  index: number,
): CalendarDate {
  if (!Number.isInteger(index) || index < 0 || index >= calendarWheelCounts[part]) return date;
  if (part === 'day') return dateAtDayIndex(index);
  const year = calendarYearMin + (part === 'year' ? index : Math.floor(index / 12));
  const month = part === 'month' ? (index % 12) + 1 : date.month;
  return { year, month, day: Math.min(date.day, calendarDays(year, month)) };
}
