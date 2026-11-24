/** Certify the S150 received-governor menu dependency change against retained S147 evidence. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { filesUnder } from './rules/common.ts';
import { projectionFindings } from './rules/projection-truth.ts';

const subordinateOrders=process.argv.includes('--0134');
const needRetention=process.argv.includes('--0135');
const liveOrders=process.argv.includes('--live-orders');
assert(Number(liveOrders)+Number(needRetention)+Number(subordinateOrders)<=1);
const evidence=liveOrders?'docs/audit/s150-evidence/live-orders-projection.json':needRetention?'docs/audit/s150-evidence/0135-projection.json':subordinateOrders?'docs/audit/s150-evidence/0134-projection.json':'docs/audit/s150-evidence/projection.json';
const path='tools/rules/projection-derivations.json';
const permissions=JSON.parse(readFileSync(path,'utf8'));
const sources=['packages','prototypes/desk'].flatMap(p=>filesUnder(process.cwd(),p))
  .filter(p=>/\.[cm]?[jt]sx?$/.test(p)&&!/(?:\/tests?\/|\.test\.|\.d\.ts$)/.test(p))
  .map(path=>({path,code:readFileSync(path,'utf8').replaceAll('\r\n','\n')}));
const all=projectionFindings(sources,[]);
const actual=all.find(a=>a.path==='packages/kernel/src/seats/requests.ts'&&a.detail.startsWith('pendingRequests reaches '))!;
const previous=liveOrders?JSON.parse(readFileSync('docs/audit/s150-evidence/0135-projection.json','utf8')).after:needRetention?JSON.parse(readFileSync('docs/audit/s150-evidence/0134-projection.json','utf8')).after:subordinateOrders?JSON.parse(readFileSync('docs/audit/s150-evidence/projection.json','utf8')).after:
  JSON.parse(readFileSync('docs/audit/s147-evidence/projection.json','utf8')).rows[0].after;
assert.equal(actual.detail,previous.detail,'no new protected truth reader may enter the menu closure');
const stale=projectionFindings(sources,permissions);
assert(stale.every(a=>a.path===actual.path&&a.detail===actual.detail));
const row=permissions.find((p:{path:string;symbol:string})=>p.path===actual.path&&p.symbol==='pendingRequests');
assert(row);
const before={hash:previous.hash,detail:previous.detail};
const replacedPermissionHash=row.hash;
row.hash=actual.hash;
if(!row.reason.includes(' S150:'))row.reason+=' S150: governor routing uses only the acting seat received attributed lot notices/returns and their service/arm scopes, expiry and report freshness. Truth perturbation does not change that choice; the governor independently revalidates actual holdings and answers through0126. Declared national requests solicit an independent governor under the issuer receiving-chain mandate, never compel him or expose a global inventory. Protected reader identities are unchanged from S147.';
if(subordinateOrders&&!row.reason.includes(' 0134:'))row.reason+=' 0134: a superior selects a subordinate only from his own received attributed scoped strength return and active mandate, never remote lot truth. The order names cohort and quantity; the subordinate independently revalidates holdings, compliance and mission retention, then ownership changes on receiver receipt. Protected reader identities remain unchanged from S150.';
if(needRetention&&!row.reason.includes(' 0135:'))row.reason+=' 0135: the acting holder compares only his own received mission and joined ashore holdings. Sending may be retained only for a created/deepened determined planner shortfall; unavailable need is a stated reservation, preserving compliance. Actual direct/subordinate sending revalidates the same rule. No new remote truth input or protected-reader identity.';
if(liveOrders&&!row.reason.includes(' S150 live orders:'))row.reason+=' S150 live orders: an accepted no-lot order remains live; receipt or commitment release queues eligible stable lot identities for the sender’s logged fulfilment choice, with current authority and retention revalidation. Generated modes come from the received asking issuer’s scoped active declared authority or a typed gap. No added remote inventory or protected-reader identity.';
if(!row.citation.includes(evidence))row.citation+=`; ${evidence}; notes/sprint-S150-sending-orders.md; CODEX2026-11-24 S150`;
writeFileSync(evidence,JSON.stringify({baseline:liveOrders?'S150 0135 retained projection':needRetention?'S150 0134 retained projection':subordinateOrders?'S150 retained projection':'S147 retained projection',before,replacedPermissionHash,after:actual,otherRootsUnchanged:all.length-1,
  checks:liveOrders?['identical protected reader identities','all other permission hashes retained','live complied deferral is not a terminal decline','eligible lot receipt/release queues a logged choice, not a daily retry','current holder and authority revalidated before actual sending','generated modes use the received asking issuer’s declared authority or a typed gap']:needRetention?['identical protected reader identities','all other permission hashes retained','own received mission and ashore holdings only','same planner shortage comparison for direct grants and subordinate sends','unknown need stays unavailable and travels as stated reservation','actual sending and receiver receipt independently revalidated']:subordinateOrders?['identical protected reader identities','all other permission hashes retained','subordinate routing uses received attributed returns and active mandate','superior paper contains scope and quantity, never chosen lots','subordinate compliance and own planner decide','physical receiver receipt completes the order']:
  ['identical protected reader identities','all other permission hashes retained','fictional unreceived/other-seat/current-day/wrong-arm returns cannot select a governor','remote holdings perturbation cannot alter received governor selection','governor root, issuer mandate and physical receipt revalidated at execution']},null,2)+'\n');
writeFileSync(path,JSON.stringify(permissions,null,2)+'\n');
assert.deepEqual(projectionFindings(sources,permissions),[]);
console.log(JSON.stringify({updated:'pendingRequests',hash:actual.hash,otherRoots:all.length-1}));
