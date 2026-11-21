import { beforeAll, describe, expect, it } from 'vitest';
import { ConsoleGame } from '../../packages/cli/src/console/game.ts';
import { ConsoleSession } from '../../packages/cli/src/console/session.ts';

/** S27 black-box regressions. The driver is constructed only to obtain a text
 * session. These players never read State, World, menus, logs or a runner.
 * S27_ASSERT_FIXED=1 runs the desired assertions as ordinary failing tests.
 * Otherwise it.fails preserves the known defects through the required hook;
 * a correction must turn its unexpected pass into an ordinary passing test. */
const bug = process.env.S27_ASSERT_FIXED === '1' ? it : it.fails;

class Player {
  readonly lines: string[];
  readonly commands: string[] = [];
  constructor(private readonly session = new ConsoleSession(new ConsoleGame({ pack: 'union-1861' }))) {
    this.lines = [...session.start()];
  }
  type(command: string): string[] {
    this.commands.push(command);
    const lines = [...this.session.handle(command).lines];
    this.lines.push(`> ${command}`, ...lines);
    return lines;
  }
}

describe('S27 reproducible console defects on the integrated 1A', () => {
  let opening: string[];
  let holdQueued: string[], holdResult: string[], invalidGoalResult: string[];
  let timingQueue: string[], approvalQueue: string[], audienceQueue: string[];
  let noticeInbox: string[], noticeSituations: string[];
  let cleanHelp: string[];
  let previewTiming: string[];

  beforeAll(() => {
    const p = new Player();
    opening = [...p.lines];
    cleanHelp = p.type('help');
    // Preconditions live outside it.fails: a fixture regression cannot masquerade
    // as the desired product assertion failing for the reported reason.
    expect(p.type('posts').join('\n')).toMatch(/^us_dc_militia: stone_charles_p /m);
    expect(cleanHelp.join('\n')).toContain('order <post> <hold|take|relieve> [objective]');

    const h = new Player();
    holdQueued = h.type('order us_dc_militia hold bypass');
    expect(holdQueued[0]).toMatch(/^Queued /);
    holdResult = h.type('end');
    expect(holdResult.some(line => line.startsWith('--- '))).toBe(true);

    const invalid = new Player();
    expect(invalid.type('order us_dc_militia take not_a_region bypass')[0]).toMatch(/^Queued /);
    invalidGoalResult = invalid.type('end');
    expect(invalidGoalResult.filter(line => line.includes('Refused:'))).toHaveLength(1);

    const r = new Player();
    expect(r.type('order us_dc_militia take manassas review bypass')[0]).toMatch(/^Queued /);
    let plan: string[] = [];
    for (let turns = 0; turns < 5; turns++) {
      r.type('end'); plan = r.type('plans');
      if (plan.some(line => line.startsWith('us_dc_militia ('))) break;
    }
    expect(plan.join('\n')).toContain('us_dc_militia (stone_charles_p) submits a plan for your review:');
    previewTiming = r.type('preview us_dc_militia timing days=1');
    expect(previewTiming.join('\n')).toContain('As edited');
    for (const days of [1, 8]) expect(r.type(`edit us_dc_militia timing days=${days}`)[0]).toMatch(/^Queued /);
    timingQueue = r.type('queue');
    r.type('cancel 2'); r.type('cancel 1');
    expect(r.type('queue')).toEqual(['Nothing queued.']);
    for (const suffix of ['', ' bypass']) expect(r.type(`approve us_dc_militia${suffix}`)[0]).toMatch(/^Queued /);
    approvalQueue = r.type('queue');

    const a = new Player();
    for (const boldness of [100, 900]) expect(a.type(`audience us_dc_militia adjust:${boldness}`)[0]).toMatch(/^Queued /);
    audienceQueue = a.type('queue');

    const n = new Player();
    for (let turns = 0; turns < 4; turns++) {
      n.type('end');
      if (n.lines.some(line => line.includes('about situation officer_resignation'))) break;
    }
    expect(n.lines.join('\n')).toContain('has resigned from his service');
    expect(n.lines.join('\n')).toContain('about situation officer_resignation');
    noticeInbox = n.type('inbox all');
    noticeSituations = n.type('situations');
  });

  it('guards the command-only fixtures and distinct intended inputs', () => {
    expect(timingQueue).toHaveLength(2);
    expect(approvalQueue).toHaveLength(2);
    expect(audienceQueue).toHaveLength(2);
    expect(noticeInbox.some(line => line.includes('officer_resignation'))).toBe(true);
    expect(noticeSituations.some(line => line.startsWith('sumter_garrison: '))).toBe(true);
  });

  bug('S27-B01: offers the requested first playable morning, 5 March', () => {
    expect(opening.find(line => line.startsWith('=== '))).toContain('1861-03-05');
  });

  bug('S27-B02: an optional hold-order flag is not consumed as its objective', () => {
    expect(holdResult.filter(line => line.includes('Refused:'))).toEqual([]);
  });

  bug('S27-B03: the queue preserves different concentration-day edits', () => {
    expect(timingQueue[0]).toMatch(/\b1\s+days?\b|days=1\b/);
    expect(timingQueue[1]).toMatch(/\b8\s+days?\b|days=8\b/);
  });

  bug('S27-B04: the queue distinguishes approval through the chain from a bypass', () => {
    const withoutQueueNumber = approvalQueue.map(line => line.replace(/^\d+\. /, ''));
    expect(new Set(withoutQueueNumber).size).toBe(2);
  });

  bug('S27-B05: the queue preserves the values of different audience counters', () => {
    expect(audienceQueue[0]).toContain('100');
    expect(audienceQueue[1]).toContain('900');
  });

  bug('S27-B06: a delivered notice is readable through at least one console reading command', () => {
    // This is the existing authored en string, not new player copy or history.
    expect([...noticeInbox, ...noticeSituations].join('\n')).toContain('The officer reports that he has resigned from United States service.');
  });

  bug('S27-B07: a refused order explains its problem without an internal reason code', () => {
    expect(invalidGoalResult.filter(line => line.includes('Refused:')).join('\n')).not.toMatch(/\(bad_goal\)/);
  });

  bug('S27-B08: a one-day edit preview uses the singular unit', () => {
    expect(previewTiming.join('\n')).not.toMatch(/\b1 days\b/);
  });

  it('keeps help within the explicit slogan, eyebrow and middle-dot bans', () => {
    expect(cleanHelp.join('\n')).not.toMatch(/·|SIGNED HERE|DESK STUDY/);
  });
});
