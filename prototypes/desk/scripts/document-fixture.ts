/** Real console papers for R15's browser proof; not shipped or sent to a game. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createDeskAdapter } from '../server/adapter.ts';

const evidence = new URL('../../../art-masters/R15/', import.meta.url);
mkdirSync(evidence, { recursive: true });
const desk = createDeskAdapter({ pack: 'testbed', atWar: true });
const commands = ['order n_army_west take salient_tip review', 'order n_army_east take e_city review', 'end', 'end', 'end'];
for (const line of commands) {
  const result = desk.execute(line);
  if (!result.ok) throw Error(`${line}: ${result.message}`);
}
const snapshot = desk.snapshot();
for (const type of ['wire-dispatch', 'press']) {
  if (!snapshot.morning.view.reports.some(report => report.type === type)) throw Error(`Missing fixture genre: ${type}`);
}
writeFileSync(new URL('paper-fixture.json', evidence), JSON.stringify(snapshot, null, 2));
writeFileSync(new URL('fixture-commands.json', evidence), JSON.stringify({ pack: 'testbed', atWar: true, commands }, null, 2));
console.log('R15 papers generated from the console after three testbed turns.');
