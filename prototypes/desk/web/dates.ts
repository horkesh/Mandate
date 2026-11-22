/**
 * The desk's one date formatter (lead's ruling on S60, 2026-11-22): every date
 * the player reads is written out, "5 March 1861", and the calendar block adds
 * the weekday, "Tuesday, 5 March 1861". ISO dates stay in data, file names and
 * tests only. Integer arithmetic throughout (Sakamoto's weekday rule for the
 * proleptic Gregorian calendar), so nothing depends on the browser's clock or
 * time zone. Out-of-world chrome strings; game text still comes from the pack.
 */
export const DATE_WORDS = {
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
} as const;

/** An ISO calendar date anywhere in a string; global, for replacement. */
export const ISO_DATE = /\b(\d{4})-(\d{2})-(\d{2})\b/g;

export type CalendarFace = { weekday: string; day: number; month: string; year: number };

/** The parts of an ISO date, or null when the text is not one. */
export function calendarFace(iso: string): CalendarFace | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const y = month < 3 ? year - 1 : year;
  const weekday = (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + offsets[month - 1]! + day) % 7;
  return { weekday: DATE_WORDS.weekdays[weekday]!, day, month: DATE_WORDS.months[month - 1]!, year };
}

/**
 * "5 March 1861", or "Tuesday, 5 March 1861" with the weekday. Text that is
 * not an ISO date (a day number, "Unknown") is returned unchanged.
 */
export function writtenDate(iso: string, options: { weekday?: boolean } = {}): string {
  const face = calendarFace(iso);
  if (!face) return iso;
  const date = `${face.day} ${face.month} ${face.year}`;
  return options.weekday ? `${face.weekday}, ${date}` : date;
}

/** Every ISO date inside a piece of text, written out. */
export function writtenDates(text: string): string {
  return text.replace(ISO_DATE, iso => writtenDate(iso));
}
