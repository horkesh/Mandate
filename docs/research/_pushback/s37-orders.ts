import { readFileSync, writeFileSync } from 'node:fs';
import { phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';

// A bounded follow-up to retain the actual sent commands, including calls without callId.
// No forks, tuning, daily hashing, or player-facing code. The matching final State is required.
const { world, setup } = seatsWorld('union-1861');
const startup = process.argv.includes('--startup');
for (let seed = 1861; seed <= (startup ? 1861 : 1868); seed++) {
 const model = createRuleSeat();
 const run = phase0.playDays(world, phase0.createState(world,{...setup,seed}),()=>model,startup ? 1 : 148,
  {freeze:false,deepChecks:false,hashEvery:148});
 const hash = run.hashes.at(-1)!.hash;
 if (!startup && hash !== JSON.parse(readFileSync(`runs/s37/seed-${seed}.json`,'utf8')).summary.finalHash) throw Error(`seed ${seed} diverged`);
 writeFileSync(`runs/s37/orders-${seed}${startup ? '-startup' : ''}.json`,JSON.stringify({seed,hash,log:run.log},null,2)+'\n');
 console.log(JSON.stringify({seed,entries:run.log.length,hash}));
}
