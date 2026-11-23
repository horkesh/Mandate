/**
 * What a command costs the principal's attention (lane 1.5; FOUNDATION section 5; 0025, 0040), from the pack's table:
 * a goal, an edit, each people verb at its own price; approving a draft as written, sending a plan back and the word to
 * go at theirs (the packs state 0); a situation decided as the staff recommended at `decide_staff`, overruling it at
 * `decide_overrule`, and ignoring it free; a special messenger adds its own price. A commander's `choose` is free: only
 * a principal's seat has a budget.
 */
import type { Command } from '../log/commands.ts';
import type { AttentionKey } from '../people/verb-rules.ts';
import type { State } from '../root-state.ts';
import type { SeatsWorld } from '../seats/world.ts';

function keyOf(world: SeatsWorld, c: Command): AttentionKey | null {
  switch (c.cmd) {
    case 'order':
    case 'go':
    case 'delegate':
    case 'appoint':
    case 'relieve':
    case 'transfer':
    case 'inquire':
    case 'consult':
    case 'audience':
    case 'observer':
    case 'promise':
    case 'pressure':
    case 'address':
      return c.cmd;
    case 'review':
      return c.action === 'approve' ? 'review_approve' : c.action === 'edit' ? 'review_edit' : 'review_send_back';
    case 'decide': {
      if (c.options.length === 0) return null;
      const def = world.situations.find((s) => s.id === c.situation);
      const staff = def?.staffLine?.recommends ?? [];
      const same = staff.length === c.options.length && staff.every((o) => c.options.includes(o));
      return same ? 'decide_staff' : 'decide_overrule';
    }
    // A call for regiments (lane 1.7) is an order to a governor: priced as an order.
    case 'call':
      return 'order';
    case 'answer_proposal':
      return c.action === 'decline' ? 'review_send_back' : 'order';
    // A commander's battle orders cost no attention: commanders have none (lane 1.12).
    case 'battle':
    case 'choose':
      return null;
  }
}

export function attentionPrice(world: SeatsWorld, _state: State, c: Command): number {
  const rules = world.map.world.rules.people.attention;
  const key = keyOf(world, c);
  const base = key === null ? 0 : rules.costs[key];
  const messenger = 'route' in c && c.route === 'special-messenger' ? world.rules.latency.specialMessengerPrice : 0;
  return base + messenger;
}
