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
  const [year, month, day] = value.split('-').map(Number);
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
