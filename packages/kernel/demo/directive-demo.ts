/**
 * Headless demo (M0): one directive, three proxies, three different answers,
 * and not all of them honest. Setting-free on purpose (decision 0003).
 *
 *   npm run demo
 */
import {
  resolveDirective,
  type CommandContext,
  type DirectiveTerms,
  type ProxyProfile,
} from '../src/index.ts';

const directive: DirectiveTerms = {
  boldness: 850,
  honours: ['glory', 'duty'],
  offends: ['caution'],
  required: 650,
};

interface Case {
  readonly label: string;
  readonly proxy: ProxyProfile;
  readonly context: CommandContext;
}

const cases: Case[] = [
  {
    label: 'The Celebrated Organiser (beloved by the army, cautious, distrusts you)',
    proxy: { id: 'organiser', values: ['caution', 'reputation'], boldness: 200, candour: 650, standing: 850, regard: -350 },
    context: { available: 500, oversight: 250, leaderCredibility: 400 },
  },
  {
    label: 'The Political Appointee (owes his post to a bloc, tells you what you want to hear)',
    proxy: { id: 'appointee', values: ['party', 'career'], boldness: 450, candour: 200, standing: 400, regard: 0 },
    context: { available: 450, oversight: 600, leaderCredibility: 700 },
  },
  {
    label: 'The Hard Fighter (junior, aggressive, believes in you)',
    proxy: { id: 'fighter', values: ['duty', 'glory'], boldness: 800, candour: 800, standing: 150, regard: 600 },
    context: { available: 700, oversight: 300, leaderCredibility: 700 },
  },
];

const pad = (s: string, n: number) => s.padEnd(n);

console.log('\nDIRECTIVE: an aggressive offensive (boldness 850), honouring glory and duty, offending caution.\n');
for (const { label, proxy, context } of cases) {
  const r = resolveDirective(proxy, directive, context);
  console.log(label);
  console.log(`  tells you : ${r.declared}`);
  console.log(`  actually  : ${r.actual}${r.declared !== r.actual ? '   <-- you are not being told the truth' : ''}`);
  console.log(`  willingness ${r.willingness}  =  ${r.contributions.map((c) => `${c.term} ${c.amount >= 0 ? '+' : ''}${c.amount}`).join('  ')}`);
  console.log(`  reasons   : ${r.reasons.map((x) => ('value' in x ? `${x.kind}(${x.value})` : 'shortfall' in x ? `${x.kind}(${x.shortfall})` : x.kind)).join(', ')}`);
  if (r.counterProposal) console.log(`  counter   : boldness ${r.counterProposal.boldness}, needs ${r.counterProposal.required}`);
  console.log(pad('', 0));
}
