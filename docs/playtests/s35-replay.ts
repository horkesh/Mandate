/** Replay the retained S29 human submissions through public requests. No State
 * is injected into a desk. Private diagnostics are kept separate from papers. */
import { readFileSync } from 'node:fs';
import { canonicalHash, phase0, world as calendar } from '@mandate/kernel';
import type { SeatCommand, SeatRequest } from '@mandate/kernel/seat-api';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../packages/cli/src/seats-world.ts';
import { parseLine } from '../../packages/cli/src/desk/commands.ts';
import { deskStrings } from '../../packages/cli/src/pack-text.ts';
import { packStrings } from '../../packages/cli/src/seats-world.ts';

export interface RecordedCommand { readonly day: number; readonly line: string; readonly ok: boolean }
export function s29Commands(): RecordedCommand[] {
  return JSON.parse(readFileSync(new URL('./s35-s29-commands.json', import.meta.url), 'utf8')).commands;
}

function queuedCommand(line: string, request: SeatRequest): SeatCommand | null {
  // S29's desk supported a dated-call convenience absent from this console pin.
  // Expand only the complete call offered by this public menu, as that desk did.
  const scheduled = /^call (\S+) scheduled=(\S+)$/.exec(line);
  if (scheduled) {
    const menu = request.menu;
    if (menu.menuKind !== 'principal') throw Error('principal expected');
    const call = menu.doctrine.calls.find(c => c.id === scheduled[2] && c.post === scheduled[1]);
    if (!call || call.issued === true || call.day > request.requestDay || (menu.atWarSince === null && call.atPeace !== true)) throw Error(`Call is not offered: ${line}`);
    const route = menu.commandable.find(c => c.post === call.post)?.routes.some(r => r.route === 'wire') ? 'wire' : 'courier';
    return { cmd:'call', to:call.post, callId:call.id!, regiments:call.regiments, termDays:call.termDays,
      ...(call.men === undefined ? {} : {men:call.men}), ...(call.arm === undefined ? {} : {arm:call.arm}),
      ...(call.readiness === undefined ? {} : {readiness:call.readiness}), route, bypass:false };
  }
  const parsed = parseLine(line, request, deskStrings(packStrings('union-1861')));
  if (parsed.kind === 'command') return parsed.command;
  throw Error(`Cannot replay ${line}: ${JSON.stringify(parsed)}`);
}

export function replayS29(days = 148) {
  const {world,setup} = seatsWorld('union-1861');
  const principal = world.start.factions.find(f => f.playable)!.principal!;
  const seat = phase0.seatIdFor(principal), rules = createRuleSeat();
  const commands = s29Commands();
  const human: phase0.Seat = {driver:'human',respond:request => {
    const queue: SeatCommand[] = [];
    for (const r of commands.filter(c => c.day === request.requestDay)) {
      if (!r.ok) throw Error('S29 fixture contains an unsuccessful command');
      if (/^(end|preview)\b/.test(r.line)) continue;
      const cancel = /^cancel (\d+)$/.exec(r.line);
      if (cancel) { if (!queue.splice(Number(cancel[1])-1,1).length) throw Error('invalid recall'); continue; }
      queue.push(queuedCommand(r.line,request)!);
    }
    return {answerKind:'commands',commands:queue};
  }};
  const diagnostics: unknown[] = [], papers: phase0.ReportView[] = [], rejections: phase0.TickResult['rejections'][number][] = [];
  const start = phase0.createState(world,{...setup,drivers:{[principal]:'human'}});
  const run = phase0.playDays(world,start,id => id === seat ? human : rules,days,{
    freeze:false,deepChecks:false,onDay:r => {
      rejections.push(...r.rejections);
      if (r.day < 133) return;
      const record = Object.entries(r.state.planRecords).find(([p]) => p === 'us_dc_militia')?.[1];
      const chosen = record?.planDraft?.draftCandidates.find(c => c.id === record.planChosen);
      diagnostics.push({day:r.day,chosenScore:chosen?.candScore,chosenTerms:chosen?.candTerms,
        notes:record?.planNotes,counters:record?.planCounters,approved:record?.planApproved,
        responses:Object.values(r.state.orderResponses).filter(v => v.respPost === 'us_dc_militia' && v.respDay === r.day)});
      papers.push(...phase0.viewFor(world,r.state,seat).reports.filter(p => p.receivedDay === r.day));
    },
  });
  const date = (day:number) => calendar.formatIsoDate(calendar.dateOfDay(run.state.calendarStart!,day));
  return {world,start,run,summary:{days,finalHash:canonicalHash(run.state),rejections,diagnostics,
    battles:Object.entries(run.state.battleRecords).map(([id,b]) => ({id,record:b})),
    fieldPapers:papers.filter(p => p.hour !== null).map(p => ({...p,writtenDate:date(p.day),receivedDate:date(p.receivedDay)}))}};
}
