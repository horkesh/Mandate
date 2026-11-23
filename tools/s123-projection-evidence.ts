/** Reproducible read audit for 0121's commander-only derived menus. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { filesUnder } from './rules/common.ts';
import { projectionFindings } from './rules/projection-truth.ts';

const base = '5625454f';
const tracked = new Set(execFileSync('git',['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split(/\r?\n/));
const changed = new Set(execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split(/\r?\n/));
const files = ['packages','prototypes/desk'].flatMap(d => filesUnder(process.cwd(),d))
  .filter(p => /\.[cm]?[jt]sx?$/.test(p) && !/(?:\/tests?\/|\.test\.|\.d\.ts$)/.test(p));
const sources = (before: boolean) => files.filter(p => !before || tracked.has(p)).map(path => ({path,
  code:(before && changed.has(path) ? execFileSync('git',['show',`${base}:${path}`],{encoding:'utf8'}) : readFileSync(path,'utf8')).replaceAll('\r\n','\n')}));
const before = projectionFindings(sources(true),[]);
const after = projectionFindings(sources(false),[]);
const path = 'tools/rules/projection-derivations.json';
const allowed = JSON.parse(readFileSync(path,'utf8'));
const stale = projectionFindings(sources(false),allowed);
const rows = stale.map(actual => {
  const row = allowed.find((r: {path:string;symbol:string}) => r.path === actual.path && actual.detail.startsWith(`${r.symbol} reaches `));
  assert(row, `unexpected new protected projection: ${actual.detail}`);
  assert(['principalMenu','pendingRequests'].includes(row.symbol));
  const old = before.find(r => r.path === row.path && r.detail.startsWith(`${row.symbol} reaches `))!;
  if (row.symbol === 'principalMenu') assert.equal(actual.detail,old.detail);
  const receipt = {path:row.path,symbol:row.symbol,before:row.hash,after:actual.hash,previousReaders:old.detail,readers:actual.detail};
  row.hash = actual.hash;
  row.reason += ' S123: received commander-only menus may check their own grant, actual command chain and assigned resources under 0121/0124. Enemy knowledge comes through the acting view. Principal catalogue reader identities are unchanged. Opening command addresses are restricted to the received assignment and received corrections; no live holder enters the address projection.';
  row.citation += '; docs/decisions/0121-letters-receipts-and-authority-a-commander-receives.md item 4; notes/sprint-S123-mandates.md; docs/audit/s123-kernel-projection.json';
  return receipt;
});
assert.equal(rows.length,2);
writeFileSync('docs/audit/s123-kernel-projection.json',JSON.stringify({base,before,after,rows,
  checks:['C1 received authority only','C2 actual holder/chain/side and shared force checks','C3 actual issuer and relays',
    'C7 revocation at the receiving post, not globally on dispatch','C8 unchanged menu under hidden enemy-strength change',
    'Raw command rejection and save/replay equality'],
  distinction:'Only the commander receives local menus. Kernel validation reads own-side resources and the actual chain; targets and routes are planned from his reports. Execution repeats authority and resource checks. No new principal catalogue truth reader is authorized.'},null,2)+'\n');
writeFileSync(path,JSON.stringify(allowed,null,2)+'\n');
assert.deepEqual(projectionFindings(sources(false),allowed),[]);
console.log(JSON.stringify({updated:rows.map(r => r.symbol),principalReadersUnchanged:true}));
