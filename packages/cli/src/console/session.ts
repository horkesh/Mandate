/**
 * The console session (lane 1.13): text in, text out. Each line is read by the desk against the morning's request;
 * orders are queued and sent when the turn ends ("end"), and the days of the turn are shown passing as their reports
 * arrive (0027). A scripted test feeds it lines, and `npm run play` feeds it the keyboard.
 */
import type { DeskInput } from '../desk/commands.ts';
import { helpLines, parseLine } from '../desk/commands.ts';
import { commandText, dayLines, enemyLines, morningLines, planLines, planReviewLines, postLines, situationLines } from '../desk/render.ts';
import { dispatchLog } from '../desk/dispatches.ts';
import type { DeskStrings } from '../desk/strings.ts';
import { deskStrings } from '../pack-text.ts';
import type { ConsoleGame, TurnResult } from './game.ts';
import { previewReasonText } from './preview-text.ts';
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
  private readonly t: DeskStrings;

  constructor(private readonly game: ConsoleGame) {
    this.request = game.morning();
    this.t = deskStrings(game.strings, game.locale);
  }

  /** The opening screen: who he is, and the first morning. */
  start(): string[] {
    return [this.t('console.start'), ...this.morningScreen()];
  }

  private morningScreen(): string[] {
    const lines = morningLines(this.request, this.seenFrom, this.t, { date: this.game.dateOf(this.request.requestDay), attention: this.request.view.attention });
    this.seenFrom = this.request.requestDay;
    return lines;
  }

  handle(line: string): Handled {
    const t = this.t;
    const input: DeskInput = parseLine(line, this.request, t);
    const menu = this.request.menu as phase0.PrincipalMenu;
    switch (input.kind) {
      case 'error':
        return { lines: [input.message], done: false };
      case 'quit':
        return { lines: [t('console.quit', { day: String(this.request.requestDay), date: this.game.dateOf(this.request.requestDay) })], done: true };
      case 'command':
        this.queue.push(input.command);
        return { lines: [t('console.queue.add', { index: String(this.queue.length), command: commandText(input.command, t) })], done: false };
      case 'cancel': {
        if (input.index < 1 || input.index > this.queue.length) return { lines: [t('console.queue.missing', { index: String(input.index) })], done: false };
        const [gone] = this.queue.splice(input.index - 1, 1);
        return { lines: [t('console.queue.cancelled', { command: commandText(gone!, t) })], done: false };
      }
      case 'preview': {
        const p = this.game.preview(input.post, input.edit);
        if (!p.ok) return { lines: [t('console.preview.invalid', { reason: previewReasonText(p.reason, t) })], done: false };
        const review = menu.reviews.find((r) => r.post === input.post);
        const before = review === undefined ? [] : [t('console.preview.before'), ...planLines(review.plan, t)];
        // Lane 0.9's finding 5: say plainly what the edit does to the time it takes, before he sends it.
        const longest = (plan: phase0.OptionView) => Math.max(0, ...plan.axes.map((a) => Math.ceil(a.arrival / 1000)));
        const change = review === undefined ? [] : [t('console.preview.arrival', { edited: String(longest(p.plan)), submitted: String(longest(review.plan)) })];
        return { lines: [...before, t('console.preview.after'), ...planLines(p.plan, t), ...change], done: false };
      }
      case 'look':
        return { lines: this.look(input.what, input.all, menu), done: false };
      case 'end':
        return { lines: this.endTurn(input.days), done: false };
    }
  }

  private look(what: 'help' | 'inbox' | 'situations' | 'plans' | 'posts' | 'enemy' | 'queue', all: boolean, menu: phase0.PrincipalMenu): string[] {
    switch (what) {
      case 'help':
        return helpLines(this.t);
      case 'inbox': {
        const lines = dispatchLog(this.request.view, all ? 0 : this.seenLastTurn, this.t);
        return lines.length === 0 ? [this.t('console.inbox.empty')] : lines;
      }
      case 'situations':
        return situationLines(this.request.view.situations, menu, this.t);
      case 'plans':
        return planReviewLines(menu, this.t);
      case 'posts':
        return postLines(menu, this.t);
      case 'enemy':
        return enemyLines(this.request, this.t);
      case 'queue':
        return this.queue.length === 0 ? [this.t('console.queue.empty')]
          : this.queue.map((c, i) => this.t('console.queue.entry', { index: String(i + 1), command: commandText(c, this.t) }));
    }
  }

  /** The first day of the turn just ended, for "inbox" (what came in during it). */
  private seenLastTurn = 0;

  private endTurn(days?:number): string[] {
    const sent = this.queue;
    this.queue = [];
    this.seenLastTurn = this.request.requestDay;
    const result: TurnResult = this.game.turn(sent,days);
    const lines: string[] = [sent.length === 0 ? this.t('console.turn.wait')
      : this.t('console.turn.sent', { commands: sent.map(c => commandText(c, this.t)).join('; ') })];
    for (const d of result.days) {
      lines.push(...dayLines({ day: d.day, date: d.date, reports: d.reports, refused: d.refused.map((r) => ({ what: commandText(r.command as phase0.SeatCommand, this.t), reason: r.reason })) }, this.t));
    }
    lines.push(result.stopped === 'week'
      ? (days === undefined ? this.t('console.turn.week') : this.t('console.turn.days', { days: String(result.days.length) }))
      : this.t('console.turn.stopped', { points: result.stopped.join(', ') }));
    this.request = this.game.morning();
    this.seenFrom = this.request.requestDay;
    lines.push(...morningLines(this.request, this.request.requestDay, this.t, { date: this.game.dateOf(this.request.requestDay), attention: this.request.view.attention }).slice(0, 1));
    const menu = this.request.menu as phase0.PrincipalMenu;
    const open = this.request.view.situations.filter((s) => s.status === 'open');
    if (open.length > 0) lines.push(this.t('console.morning.situations', { situations: open.map(s => s.id).join(', ') }));
    if (menu.reviews.length > 0) lines.push(this.t('console.morning.plans', { posts: menu.reviews.map(r => r.post).join(', ') }));
    if (menu.awaiting.length > 0) lines.push(this.t('console.morning.awaiting', { posts: menu.awaiting.join(', ') }));
    return lines;
  }
}
