/** Day-of-month values for recurring monthly fields (01–31). */
export const monthDayCount = 31;

/** Odd cycle count so the wheel opens near the middle of a looping drum. */
export const monthDayWheelCycles = 21;
export const monthDayWheelCount = monthDayCount * monthDayWheelCycles;

export function parseMonthDay(value: string): number | null {
  if (!/^\d{1,2}$/.test(value)) return null;
  const day = Number(value);
  return day >= 1 && day <= monthDayCount ? day : null;
}

export function encodeMonthDay(day: number): string {
  return String(day).padStart(2, '0');
}

export function monthDayFromWheelIndex(index: number): number {
  return (((index % monthDayCount) + monthDayCount) % monthDayCount) + 1;
}

/** Place the selected day in the middle cycle so scroll can wrap both ways. */
export function initialMonthDayWheelIndex(day: number): number {
  const mid = Math.floor(monthDayWheelCycles / 2) * monthDayCount;
  return mid + (day - 1);
}
