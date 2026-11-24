/** Day-of-month values for recurring monthly fields (01–31). */
export const monthDayCount = 31;

export function parseMonthDay(value: string): number | null {
  if (!/^\d{1,2}$/.test(value)) return null;
  const day = Number(value);
  return day >= 1 && day <= monthDayCount ? day : null;
}

export function encodeMonthDay(day: number): string {
  return String(day).padStart(2, '0');
}
