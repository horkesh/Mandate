import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {fingerprint} from '../rules/common.ts';
import {livenessProblems} from '../rules/liveness-causes.ts';
import {QUIET,REFERENCE_RUNS} from '../../packages/cli/src/liveness-gate.ts';
const review=JSON.parse(readFileSync(new URL('../../docs/audit/s124-evidence/band-review.json',import.meta.url),'utf8'));
const frozen=JSON.parse(readFileSync(new URL('./support/s124-quiet-transitions.json',import.meta.url),'utf8'));
it('authorises only the two exact S124 zero records, preserving each cause, evidence and independent driver',()=>{
 expect(review.quietApplied).toBe(true);expect(review.proposals).toEqual(frozen);expect(frozen).toHaveLength(2);
 expect(frozen.map((p:{fingerprint:string})=>p.fingerprint)).toEqual([
  '8f5b474a9bddfda65a3f98307d26aff9726521425f90a93f8e1357def5d185bf',
  '7020d4917a1c23b18a1d733bc5c059322f60fd2c920ada328446904178def11c',
 ]);
 const history=JSON.parse(readFileSync(new URL('../rules/liveness-changes.json',import.meta.url),'utf8'));
 for(const p of frozen){
  const r=p.record;expect(p.fingerprint).toBe(fingerprint(r));expect(history).toContainEqual(r);
  const mechanic=r.key.slice(r.key.indexOf('/')+1);
  expect(REFERENCE_RUNS.find(s=>r.key.startsWith(s.name+'/'))!.bands[mechanic]).toEqual(r.after);
  expect(livenessProblems({[r.key]:r.before},{[r.key]:r.after},[r])).toEqual([]);
  for(const changed of [{...r,cause:'another cause'},{...r,evidence:'elsewhere'},{...r,key:'testbed, 120 days/'+mechanic},{...r,observed:1},{...r,after:{...r.after,maxFires:1}}])
   expect(livenessProblems({[changed.key]:changed.before},{[changed.key]:changed.after},[changed])).not.toEqual([]);
  expect(readFileSync(new URL('../../'+p.driver.test,import.meta.url),'utf8')).toContain(p.driver.needle);
 }
});
it('keeps the numeric landing/refusal driver and the fictional supply driver at their authorised scope',()=>{
 const landing=frozen[0],supply=frozen[1];
 expect(QUIET['forces.landing_refused']).toEqual({why:landing.record.cause,test:landing.driver.test,needle:landing.driver.needle});
 expect(QUIET['planner.term.supply']).toBeUndefined();
 expect(REFERENCE_RUNS.find(r=>r.name==='testbed, 120 days')!.bands['planner.term.supply']!.minFires).toBeGreaterThan(0);
 expect(supply.driver.retainedTelemetry).toBe('runs/s119/references/testbed-summary.json: planner.term.supply fires2');
});
