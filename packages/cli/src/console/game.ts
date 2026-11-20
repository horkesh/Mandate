/**
 * The console's game (lane 1.13): the new kernel played turn by turn (0027), the player in his principal's seat and
 * the rules model in every other. This is the driver behind the desk: it holds the World and State, asks the seats each
 * morning, runs the day tick and keeps the command log. The desk (`../desk/`) sees only what this hands it: the
 * morning's request (the view and the menu), each day's new reports, and the refusals of his own orders.
 *
 * A turn runs up to the pack's `turns.maxDays` (0027) and ends early on any decision point that is the player's: an
 * objection, a plan for review, a battle report, a situation that surfaces or resurfaces, and the rest the kernel signals.
 * His orders are sent on the turn's first morning; the other days he waits, as the president waits for the mail.
 */
import { canonicalHash, ids, phase0, world as w } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { packStrings, seatsWorld } from '../seats-world.ts';
import {TURN_STOP_POINTS, type TurnStopPoint} from '@mandate/kernel/seat-api';

export interface GameOptions {
  readonly pack: string;
  /** Start with the war open (the war gate's labelled option, 0064); otherwise the pack's own opening. */
  readonly atWar?: boolean;
}

/** One of the player's orders the kernel refused that day, and why. */
export interface Refusal {
  readonly command: phase0.Command;
  readonly reason: phase0.RejectionReason;
  /** Its occurrence in the submitted player queue, so identical orders remain distinct. */
  readonly commandIndex:number;
}

/** One day of a turn as the player sees it pass. */
export interface TurnDay {
  readonly day: number;
  readonly date: string;
  /** Reports that reached him that day, as his view holds them. */
  readonly reports: readonly phase0.ReportView[];
  readonly refused: readonly Refusal[];
  /** His decision points that day (each would end the turn). */
  readonly points: readonly phase0.DecisionPoint['point'][];
}

export interface TurnResult {
  readonly days: readonly TurnDay[];
  /** Why the turn stopped: the pack's longest turn, or the decision points of its last day. */
  readonly stopped: 'week' | readonly phase0.DecisionPoint['point'][];
}

export class ConsoleGame {
  readonly pack: string;
  readonly world: phase0.SeatsWorld;
  readonly worldHash: string;
  readonly seat: ids.SeatId;
  readonly strings: Readonly<Record<string, string>>;
  private stateNow: phase0.State;
  private readonly logEntries: phase0.LogEntry[] = [];
  private readonly rules = createRuleSeat();
  private readonly mapCache = phase0.createDerivedMapCache();
  private viewCache = phase0.createViewCache();
  private stopPoints:readonly TurnStopPoint[] = TURN_STOP_POINTS;

  constructor(options: GameOptions) {
    const sw = seatsWorld(options.pack);
    this.pack = options.pack;
    this.world = sw.world;
    this.worldHash = sw.worldHash;
    this.strings = packStrings(options.pack);
    const playable = sw.world.start.factions.find((f) => f.playable && f.principal !== null);
    if (playable === undefined || playable.principal === null) throw new Error(`pack ${options.pack} has no playable faction with a principal`);
    this.seat = phase0.seatIdFor(playable.principal);
    // His seat is a human's: the kernel never takes a situation's historical default for him (0040), and the log says who drove it.
    this.stateNow = phase0.createState(sw.world, { ...sw.setup, drivers: { [playable.principal]: 'human' }, ...(options.atWar === true ? { atWar: true } : {}) });
  }

  get state(): phase0.State {
    return this.stateNow;
  }

  /** The command log so far: replaying it from the start reproduces the game (0015). */
  get log(): readonly phase0.LogEntry[] {
    return this.logEntries;
  }

  /** The calendar date of `day`. */
  dateOf(day: number): string {
    return this.stateNow.calendarStart === null ? `day ${day.toString()}` : w.formatIsoDate(w.dateOfDay(this.stateNow.calendarStart, day));
  }

  /** The morning's request for his seat: the view and the menu for the next day. */
  morning(): phase0.SeatRequest {
    const request = phase0.pendingRequests(this.world, this.stateNow, this.viewCache).find((r) => r.requestSeat === this.seat);
    if (request === undefined) throw new Error(`no request for ${this.seat}: the principal is asked every morning`);
    return {...request,turnStops:{maxDays:this.world.map.world.rules.turns.maxDays,points:TURN_STOP_POINTS.map(point=>({point,enabled:this.stopPoints.includes(point)}))}};
  }

  /** Presentation settings belong to this driver, never the State or command log. */
  setTurnStops(points:readonly string[]):void {
    if(points.some(p=>!TURN_STOP_POINTS.includes(p as TurnStopPoint))||new Set(points).size!==points.length)throw Error('Unknown or repeated turn stop');
    this.stopPoints=TURN_STOP_POINTS.filter(p=>points.includes(p));
  }

  /** Presentation playback of reports already delivered to this seat. This
   * uses only their visible bodies and the static graph, never live control. */
  controlFromReports(reports:readonly phase0.ReportView[]):Pick<phase0.SeatView,'controlBeliefs'|'claimedFronts'> {
    return phase0.claimedControlView(this.world.map,reports.map((r):phase0.KnownReport=>({
      id:r.id,knownReceivedDay:r.receivedDay,knownRoute:r.route,knownVia:r.via,
      ...(r.openingControl === true ? {knownPublicOpening:true as const} : {}),
      knownBody:{reportType:r.type,reportSubtype:r.subtype,reportAuthor:r.author,reportAuthorPost:r.authorPost,
        reportSubjectKind:r.subjectKind,reportSubjectId:r.subjectId,
        reportClaims:r.claims.map(c=>({claimKind:c.kind,claimRegion:c.region,claimValue:c.value,claimToken:c.token,claimConfidence:c.confidence})),
        reportDay:r.day,reportHour:r.hour,reportAnswers:r.answers,
        reportAdvice:r.advice?{adviceRecommends:r.advice.recommends,adviceReasons:r.advice.reasons.map(x=>({reasonKind:x.kind,reasonWeight:x.weight})),adviceConfidence:r.advice.confidence}:null},
    })));
  }

  /** The route an arrow edit would make, as of today (lane 0.9's finding 5). */
  preview(post: ids.PostId, edit: phase0.EditTerms): phase0.EditPreview {
    return phase0.previewEdit(this.world, this.stateNow, post, edit, this.stateNow.stateDay + 1);
  }

  /** Send his orders on the turn's first morning, then let days pass until a decision point or the turn's end. */
  turn(commands: readonly phase0.SeatCommand[]): TurnResult {
    const max = this.world.map.world.rules.turns.maxDays;
    const days: TurnDay[] = [];
    const human: phase0.Seat = { driver: 'human', respond: () => ({ answerKind: 'commands', commands }) };
    const silent: phase0.Seat = { driver: 'human', respond: () => ({ answerKind: 'commands', commands: [] }) };
    for (let i = 0; i < max; i++) {
      const requests = phase0.pendingRequests(this.world, this.stateNow, this.viewCache);
      const entries = requests.flatMap((r) => phase0.answerEntries(r, r.requestSeat === this.seat ? (i === 0 ? human : silent) : this.rules));
      const result = phase0.tick(this.world, this.stateNow, entries, { mapCache: this.mapCache });
      this.stateNow = result.state;
      this.logEntries.push(...entries);
      this.viewCache = phase0.createViewCache();
      const view = phase0.viewFor(this.world, this.stateNow, this.seat, this.viewCache);
      const ownEntries=entries.flatMap((entry,index)=>entry.seat===this.seat?[index]:[]);
      const refused = result.rejections.filter((x) => x.seat === this.seat && x.entry >= 0).map((x) => ({ command: entries[x.entry]!.command, reason: x.reason,commandIndex:ownEntries.indexOf(x.entry) }));
      const points = result.decisionPoints.filter((p) => p.seat === this.seat).map((p) => p.point);
      days.push({ day: result.day, date: this.dateOf(result.day), reports: view.reports.filter((r) => r.receivedDay === result.day), refused, points });
      const selected=points.filter(p=>this.stopPoints.includes(p));
      if (selected.length > 0) return { days, stopped: [...new Set(selected)].sort() };
    }
    return { days, stopped: 'week' };
  }

  /** The State's hash: two consoles fed the same lines reach the same one (the kernel's determinism, hard rule 4). */
  hash(): string {
    return canonicalHash(this.stateNow);
  }
}
