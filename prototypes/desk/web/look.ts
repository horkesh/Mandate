/**
 * S60: chrome strings and small presentation helpers for the desk's look.
 * Out-of-world desk text only; game text still comes from the seat request.
 */
export const LOOK = {
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  mapKey: 'Map key',
  showKey: 'Show the map key',
  hideKey: 'Hide the map key',
  filed: 'Filed',
} as const;

export type CalendarFace = { weekday: string; day: number; month: string; year: number };

/**
 * The calendar block's face from the desk's ISO date. Integer arithmetic only
 * (Sakamoto's weekday rule for the proleptic Gregorian calendar), so the face
 * never depends on the browser's clock or time zone.
 */
export function calendarFace(iso: string): CalendarFace | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const y = month < 3 ? year - 1 : year;
  const weekday = (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + offsets[month - 1]! + day) % 7;
  return { weekday: LOOK.weekdays[weekday]!, day, month: LOOK.months[month - 1]!, year };
}
