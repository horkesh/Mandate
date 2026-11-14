/**
 * The calendar, in integer arithmetic (decision 0002: the kernel has no
 * `Date`). A scenario start names day 0 as an ISO date; the season rules
 * (0029) need the month of any later day. Proleptic Gregorian, which is the
 * calendar every Civil War source uses.
 *
 * The day-number conversion is Howard Hinnant's `days_from_civil` and
 * `civil_from_days` (public domain), written with `Math.floor` and `Math.trunc`
 * only. Day numbers count from 1970-01-01.
 */

export interface CivilDate {
  readonly year: number;
  /** 1-12. */
  readonly month: number;
  /** 1-31. */
  readonly day: number;
}

export class CalendarError extends Error {
  constructor(readonly text: string) {
    super(`not an ISO date (YYYY-MM-DD): "${text}"`);
    this.name = 'CalendarError';
  }
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

/** Parse `YYYY-MM-DD`, checking the day exists. Throws `CalendarError`. */
export function parseIsoDate(text: string): CivilDate {
  const m = ISO_DATE.exec(text);
  if (!m) throw new CalendarError(text);
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) throw new CalendarError(text);
  return { year, month, day };
}

/** Days from 1970-01-01 to a civil date. */
export function daysFromCivil(date: CivilDate): number {
  const y = date.month <= 2 ? date.year - 1 : date.year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const mp = date.month > 2 ? date.month - 3 : date.month + 9;
  const doy = Math.trunc((153 * mp + 2) / 5) + date.day - 1;
  const doe = yoe * 365 + Math.trunc(yoe / 4) - Math.trunc(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** The civil date of a day number counted from 1970-01-01. */
export function civilFromDays(days: number): CivilDate {
  const z = days + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.trunc((doe - Math.trunc(doe / 1460) + Math.trunc(doe / 36524) - Math.trunc(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.trunc(yoe / 4) - Math.trunc(yoe / 100));
  const mp = Math.trunc((5 * doy + 2) / 153);
  const day = doy - Math.trunc((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  return { year: yoe + era * 400 + (month <= 2 ? 1 : 0), month, day };
}

/** The civil date `day` days after a start date (day 0 is the start itself). */
export function dateOfDay(startIso: string, day: number): CivilDate {
  if (!Number.isSafeInteger(day)) throw new RangeError(`day must be a whole number, got ${day}`);
  return civilFromDays(daysFromCivil(parseIsoDate(startIso)) + day);
}

/** `YYYY-MM-DD` for a civil date. */
export function formatIsoDate(date: CivilDate): string {
  const pad = (n: number, w: number) => String(n).padStart(w, '0');
  return `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`;
}
