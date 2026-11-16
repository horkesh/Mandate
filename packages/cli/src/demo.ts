/**
 * Headless demo (M0, ported to the new State in lane 1.13): one order, three men, three different answers, and not all
 * of them honest. It reads the testbed (fictional, setting-free: 0003) through the people core: each man's true stats
 * drawn by history's shadow, his regard for his principal, his grievances and the principal's derived credibility.
 *
 *   npm run demo
 */
import { ids, phase0 } from '@mandate/kernel';
import { seatsWorld } from './seats-world.ts';

const { world, setup } = seatsWorld('testbed');
const state = phase0.createState(world, setup);
const principal = world.faction(world.factionIds[0]!).principal;

// An aggressive offensive: the pack's terms for a goal to take ground, pushed bold, needing more than he has.
const take = phase0.goalTerms(world.rules.people, 'advance');
const directive = { ...take, boldness: 850, required: 650 };

const men: readonly { readonly id: string; readonly label: string }[] = [
  { id: 'n_organiser', label: 'The Celebrated Organiser (famous, cautious, distrusts you)' },
  { id: 'n_appointee', label: 'The Political Appointee (uncandid, far away by courier)' },
  { id: 'n_fighter', label: 'The Hard Fighter (junior, aggressive, believes in you)' },
];

console.log(`\nORDER from ${principal}: advance (boldness ${directive.boldness.toString()}), honouring ${directive.honours.join(', ') || 'nothing'}, offending ${directive.offends.join(', ') || 'nothing'}.\n`);
for (const { id, label } of men) {
  const person = id as ids.PersonId;
  const r = phase0.answerOrder(world, state, person, principal, directive, { available: 500 });
  console.log(label);
  console.log(`  tells you : ${r.declared}`);
  console.log(`  actually  : ${r.actual}${r.declared !== r.actual ? '   <-- you are not being told the truth' : ''}`);
  console.log(`  willingness ${r.willingness.toString()}  =  ${r.contributions.map((c) => `${c.term} ${c.amount >= 0 ? '+' : ''}${c.amount.toString()}`).join('  ')}`);
  console.log(`  says why  : ${r.statedReasons.map((x) => x.kind).join(', ') || '(nothing)'}`);
  console.log('');
}
