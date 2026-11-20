/**
 * The console session (lane 1.13): text in, text out. Each line is read by the desk against the morning's request;
 * orders are queued and sent when the turn ends ("end"), and the days of the turn are shown passing as their reports
 * arrive (0027). A scripted test feeds it lines, and `npm run play` feeds it the keyboard.
 */
import type { DeskInput } from '../desk/commands.ts';
import { HELP, parseLine } from '../desk/commands.ts';
import { commandText, dayLines, enemyLines, morningLines, planLines, planReviewLines, postLines, situationLines } from '../desk/render.ts';
import { dispatchLog } from '../desk/dispatches.ts';
import type { ConsoleGame, TurnResult } from './game.ts';
import type { phase0 } from '@mandate/kernel';

export interface Handled {
  readonly lines: readonly string[];
  /** The player quit. */
  readonly done: boolean;
}

export class ConsoleSession {
  private queue: phase0.SeatCommand[] = [];
  private request: phase0.SeatRequest;
  /** The first day whose reports he has not yet been shown. */
  private seenFrom = 0;

  constructor(private readonly game: ConsoleGame) {
    this.request = game.morning();
  }

  private readonly t = (key: string): string => this.game.strings[key] ?? key;

  /** The opening screen: who he is, and the first morning. */
  start(): string[] {
    const lines = ['By Order of the President: the console (type "help" for every order you can give).', ...this.morningScreen()];
    return lines;
  }

  private morningScreen(): string[] {
    const lines = morningLines(this.request, this.seenFrom, this.t, { date: this.game.dateOf(this.request.requestDay), attention: this.request.view.attention });
    this.seenFrom = this.request.requestDay;
    return lines;
  }

  handle(line: string): Handled {
    const input: DeskInput = parseLine(line, this.request, this.t);
    const menu = this.request.menu as phase0.PrincipalMenu;
    switch (input.kind) {
      case 'error':
        return { lines: [input.message], done: false };
      case 'quit':
        return { lines: [`Left on day ${this.request.requestDay.toString()} (${this.game.dateOf(this.request.requestDay)}).`], done: true };
      case 'command':
        this.queue.push(input.command);
        return { lines: [`Queued ${this.queue.length.toString()}: ${commandText(input.command, this.t)}. It goes when you end the turn.`], done: false };
      case 'cancel': {
        if (input.index < 1 || input.index > this.queue.length) return { lines: [`No order ${input.index.toString()} in the queue.`], done: false };
        const [gone] = this.queue.splice(input.index - 1, 1);
        return { lines: [`Taken back: ${commandText(gone!, this.t)}.`], done: false };
      }
      case 'preview': {
        const p = this.game.preview(input.post, input.edit);
        if (!p.ok) return { lines: [`That edit cannot be made: ${p.reason}.`], done: false };
        const review = menu.reviews.find((r) => r.post === input.post);
        const before = review === undefined ? [] : ['As submitted:', ...planLines(review.plan)];
        // Lane 0.9's finding 5: say plainly what the edit does to the time it takes, before he sends it.
        const longest = (plan: phase0.OptionView) => Math.max(0, ...plan.axes.map((a) => Math.ceil(a.arrival / 1000)));
        const change = review === undefined ? [] : [`The plan arrives in ${longest(p.plan).toString()} days instead of ${longest(review.plan).toString()}.`];
        return { lines: [...before, 'As edited (on today’s map; it reaches him days later):', ...planLines(p.plan), ...change], done: false };
      }
      case 'look':
        return { lines: this.look(input.what, input.all, menu), done: false };
      case 'end':
        return { lines: this.endTurn(), done: false };
    }
  }

  private look(what: 'help' | 'inbox' | 'situations' | 'plans' | 'posts' | 'enemy' | 'queue', all: boolean, menu: phase0.PrincipalMenu): string[] {
    switch (what) {
      case 'help':
        return [...HELP];
      case 'inbox': {
        const lines = dispatchLog(this.request.view, all ? 0 : this.seenLastTurn, this.t);
        return lines.length === 0 ? ['Your inbox is empty.'] : lines;
      }
      case 'situations':
        return situationLines(this.request.view.situations, menu, this.t);
      case 'plans':
        return planReviewLines(menu, this.t);
      case 'posts':
        return postLines(menu);
      case 'enemy':
        return enemyLines(this.request);
      case 'queue':
        return this.queue.length === 0 ? ['Nothing queued.'] : this.queue.map((c, i) => `${(i + 1).toString()}. ${commandText(c, this.t)}`);
    }
  }

  /** The first day of the turn just ended, for "inbox" (what came in during it). */
  private seenLastTurn = 0;

  private endTurn(): string[] {
    const sent = this.queue;
    this.queue = [];
    this.seenLastTurn = this.request.requestDay;
    const result: TurnResult = this.game.turn(sent);
    const lines: string[] = [sent.length === 0 ? 'You send nothing, and wait.' : `Sent: ${sent.map(c => commandText(c, this.t)).join('; ')}.`];
    for (const d of result.days) {
      lines.push(...dayLines({ day: d.day, date: d.date, reports: d.reports, refused: d.refused.map((r) => ({ what: commandText(r.command as phase0.SeatCommand, this.t), reason: r.reason })) }, this.t));
    }
    lines.push(result.stopped === 'week' ? 'A week has passed.' : `The turn stops: ${result.stopped.join(', ')}.`);
    this.request = this.game.morning();
    this.seenFrom = this.request.requestDay;
    lines.push(...morningLines(this.request, this.request.requestDay, this.t, { date: this.game.dateOf(this.request.requestDay), attention: this.request.view.attention }).slice(0, 1));
    const menu = this.request.menu as phase0.PrincipalMenu;
    const open = this.request.view.situations.filter((s) => s.status === 'open');
    if (open.length > 0) lines.push(`Before you: ${open.map((s) => s.id).join(', ')}. Type "situations".`);
    if (menu.reviews.length > 0) lines.push(`Plans for your review: ${menu.reviews.map((r) => r.post).join(', ')}. Type "plans".`);
    if (menu.awaiting.length > 0) lines.push(`Waiting for your word: ${menu.awaiting.join(', ')}.`);
    return lines;
  }
}
