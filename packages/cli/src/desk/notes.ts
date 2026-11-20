/** Both desks render only the commander's reported account, using pack strings. */
import type { NoteAccount, PlanNote } from '@mandate/kernel/seat-api';

export function noteText(mark: PlanNote, t: (key: string) => string, name: (id: string) => string = id => id): string {
  return t(`plan.note.${mark.markKind}`).replace('{axis}', mark.markAxis).replace('{region}', mark.markRegion === null ? '' : name(mark.markRegion))
    .replace('{via}', mark.markVia.map(name).join(' → ')).replace('{days}', String(mark.markDays ?? ''));
}

export function noteAccountLines(notes: readonly NoteAccount[], t: (key: string) => string, name?: (id: string) => string): string[] {
  return notes.map(n => [noteText(n.accountMark,t,name), t(`plan.note.outcome.${n.accountOutcome}`),
    ...n.accountReasons.map(r => t(`plan.note.reason.${r.reasonKind}`)).filter(s => !s.startsWith('plan.note.reason.'))].join(' '));
}
