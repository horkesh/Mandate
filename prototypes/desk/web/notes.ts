/** Format only the received account, using pack wording. No compliance prediction. */
import type { NoteAccount } from '@mandate/kernel/seat-api';

export function noteAccountLines(notes: readonly NoteAccount[], strings: Readonly<Record<string,string>>, name: (id: string) => string): string[] {
  return notes.map(n => {
    const m=n.accountMark;
    const mark=(strings[`plan.note.${m.markKind}`]??'').replace('{axis}',m.markAxis)
      .replace('{region}',m.markRegion===null?'':name(m.markRegion)).replace('{via}',m.markVia.map(name).join(' → ')).replace('{days}',String(m.markDays??''));
    return [mark,strings[`plan.note.outcome.${n.accountOutcome}`]??'',...n.accountReasons.map(r=>strings[`plan.note.reason.${r.reasonKind}`]??'')].filter(Boolean).join(' ');
  });
}
