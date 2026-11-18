/** All contact with the console lives here; the browser never receives this module. */
import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { HELP, parseLine } from '../../../packages/cli/src/desk/commands.ts';
import { commandText } from '../../../packages/cli/src/desk/render.ts';
import { dispatchLog } from '../../../packages/cli/src/desk/dispatches.ts';
import type { SeatCommand } from '@mandate/kernel/seat-api';
import type { DeskReply, DeskSnapshot, DeskTurn } from '../web/adapter.ts';

export class DeskAdapter {
  private queue: { line: string; command: SeatCommand }[] = [];
  private history: DeskTurn[] = [];
  private closed = false;
  constructor(private readonly game: ConsoleGame) {}

  snapshot(): DeskSnapshot {
    const morning = this.game.morning();
    // The words of a paper are the console's existing report text, not new narrative.
    const papers = [...this.history.flatMap(t => t.days.flatMap(d => d.reports)), ...morning.view.reports];
    const paperText = Object.fromEntries(papers.map(report => {
      const line = dispatchLog({ ...morning.view, reports: [report] })[0]!;
      return [report.id, line.slice(line.indexOf('): ') + 3)];
    }));
    // Deliberate allow-list. Never spread ConsoleGame or return its log/state/world.
    return structuredClone({
      pack: this.game.pack, morning, date: this.game.dateOf(morning.requestDay),
      strings: this.game.strings, queue: this.queue.map(q => ({ line: q.line, text: commandText(q.command) })),
      history: this.history, paperText, help: HELP, closed: this.closed,
    });
  }

  execute(line: string, expectedDay = this.game.morning().requestDay): DeskReply {
    const reply = (extra: Partial<DeskReply> = {}): DeskReply => ({ ok: true, snapshot: this.snapshot(), ...extra });
    if (this.closed) return reply({ ok: false, message: 'This console session has ended.' });
    if (expectedDay !== this.game.morning().requestDay) return reply({ ok: false, message: 'The morning has changed. Review the desk before sending another order.' });
    const input = parseLine(line, this.game.morning());
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
        const turn = this.game.turn(this.queue.map(q => q.command));
        this.queue = [];
        this.history.push(turn);
        return reply({ turn });
      }
    }
  }
}

export const createDeskAdapter = (options: { pack: string; atWar: boolean }) => new DeskAdapter(new ConsoleGame(options));
