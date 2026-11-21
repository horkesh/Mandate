/** All contact with the console lives here; the browser never receives this module. */
import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { HELP, parseLine } from '../../../packages/cli/src/desk/commands.ts';
import { commandText } from '../../../packages/cli/src/desk/render.ts';
import { dispatchLog } from '../../../packages/cli/src/desk/dispatches.ts';
import type { SeatCommand } from '@mandate/kernel/seat-api';
import type { DeskReply, DeskSnapshot, DeskTurn } from '../web/adapter.ts';
import type {MapPlan} from '../web/map/model.ts';
import {slipText} from '../web/business.ts';

export class DeskAdapter {
  private queue: { line: string; command: SeatCommand }[] = [];
  private history: DeskTurn[] = [];
  private closed = false;
  private approvedPlans=new Map<string,MapPlan>();
  constructor(private readonly game: ConsoleGame) {}

  setStops(points:readonly string[],expectedDay:number):DeskReply {
    const fail=(message:string):DeskReply=>({ok:false,message,snapshot:this.snapshot()});
    if(this.closed)return fail('This console session has ended.');
    if(expectedDay!==this.game.morning().requestDay)return fail('The morning has changed. Review the desk before changing its stops.');
    try {this.game.setTurnStops(points);}catch{return fail('Choose only the listed turn stops, without repeats.');}
    return {ok:true,snapshot:this.snapshot()};
  }

  snapshot(): DeskSnapshot {
    const morning = this.game.morning();
    if(morning.menu.menuKind==='principal')for(const review of morning.menu.reviews){
      const previous=this.approvedPlans.get(review.post);if(previous&&previous.source!==review.report)this.approvedPlans.delete(review.post);
    }
    // The words of a paper are the console's existing report text, not new narrative.
    const papers = [...this.history.flatMap(t => t.days.flatMap(d => d.reports)), ...morning.view.reports];
    const paperText = Object.fromEntries(papers.map(report => {
      const line = dispatchLog({ ...morning.view, reports: [report] }, 0, key => this.game.strings[key] ?? key)[0]!;
      return [report.id, line.slice(line.indexOf('): ') + 3)];
    }));
    // Deliberate allow-list. Never spread ConsoleGame or return its log/state/world.
    return structuredClone({
      pack: this.game.pack, morning, date: this.game.dateOfRequest(morning.requestDay),
      strings: this.game.strings, queue: this.queue.map(q => ({ line: q.line, text: slipText(morning,this.game.strings,q.line,commandText(q.command, key => this.game.strings[key] ?? key)) })),
      history: this.history, paperText, help: HELP, closed: this.closed,approvedPlans:[...this.approvedPlans.values()],
    });
  }

  execute(line: string, expectedDay = this.game.morning().requestDay): DeskReply {
    const reply = (extra: Partial<DeskReply> = {}): DeskReply => ({ ok: true, snapshot: this.snapshot(), ...extra });
    if (this.closed) return reply({ ok: false, message: 'This console session has ended.' });
    if (expectedDay !== this.game.morning().requestDay) return reply({ ok: false, message: 'The morning has changed. Review the desk before sending another order.' });
    const input = parseLine(line, this.game.morning(), key=>this.game.strings[key]??key);
    switch (input.kind) {
      case 'error': return reply({ ok: false, message: input.message });
      case 'look': return reply();
      case 'quit': this.closed = true; return reply();
      case 'command': this.queue.push({ line, command: input.command }); return reply();
      case 'cancel':
        if (input.index < 1 || input.index > this.queue.length) return reply({ ok: false, message: `No order ${input.index} in the queue.` });
        this.queue.splice(input.index - 1, 1); return reply();
      case 'preview': return reply({ preview: this.game.preview(input.post, input.edit) });
      case 'end': {
        const submitted=this.snapshot().queue;
        const before=this.game.morning(),reports=[...before.view.reports];
        const result = this.game.turn(this.queue.map(q => q.command),input.days);
        for(const [commandIndex,{command}] of this.queue.entries()){
          if(result.days.some(day=>day.refused.some(r=>r.commandIndex===commandIndex)))continue;
          if(command.cmd==='order'){this.approvedPlans.delete(command.to);continue;}
          if(command.cmd!=='review')continue;
          if(command.action!=='approve'){this.approvedPlans.delete(command.to);continue;}
          const draft=before.menu.menuKind==='principal'?before.menu.reviews.find(r=>r.post===command.to):undefined;
          const source=draft?before.view.reports.find(r=>r.id===draft.report):undefined;
          if(draft&&source)this.approvedPlans.set(draft.post,{post:draft.post,holder:draft.holder,source:draft.report,day:source.day,plan:draft.plan,approved:true});
        }
        const controlUpdates:Record<string,Pick<DeskSnapshot['morning']['view'],'controlBeliefs'|'claimedFronts'>>={};
        for(const day of result.days)for(const report of day.reports){
          reports.push(report);
          if(report.claims.some(c=>c.kind==='control'||c.kind==='control-government'))controlUpdates[report.id]=this.game.controlFromReports(reports);
        }
        const turn:DeskTurn={...result,controlUpdates,submitted};
        this.queue = [];
        this.history.push(turn);
        return reply({ turn });
      }
    }
  }
}

export const createDeskAdapter = (options: { pack: string; atWar: boolean }) => new DeskAdapter(new ConsoleGame(options));
