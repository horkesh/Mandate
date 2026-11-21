// Author verification only. Run with node --import tsx; never loaded by the pack.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, relative, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { RegisterSchema, TriggersSchema, triggerMatches, signatureRefuses } from '../../../../packages/pack-format/src/gate.ts';
import { loadPack } from '../../../../packages/pack-format/src/load.ts';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../..');
const pack = resolve(here, '../..');
const base = '5c1e8ed4739b135abe02914aae13ec6e1bd88d32';
const sha = b => createHash('sha256').update(b).digest('hex');
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64*1024*1024 }).trim();
const reportFile = process.argv[2];
assert(reportFile, 'Pass an external evidence path; no audit outputs in the pack.');
assert(relative(root, resolve(reportFile)).startsWith('..'), 'Evidence must be outside the worktree.');
let checks = 0;
const check = (condition, why) => { checks++; assert(condition, why); };
const coverage = read(join(here,'coverage.json'));
const sources = read(join(here,'sources.json'));
const rules = read(join(here,'common-rules.json'));
const live = read(resolve(here,'../register.json'));
const liveById = new Map(live.topics.map(t => [t.id,t]));
const classes = new Map(read(resolve(here,'../classes.json')).classes.map(c => [c.id,c]));
const liveTriggers = read(resolve(here,'../triggers.json'));
const files = readdirSync(here).filter(f=>f.endsWith('.draft.json')).sort();
check(git(['branch','--show-current'])==='sprint/research-gate','Own branch only');
check(git(['config','core.hooksPath'])==='.githooks','Actual project hook configured');
check(realpathSync(join(root,'node_modules/@mandate/kernel'))===realpathSync(join(root,'packages/kernel')), 'Workspace dependency is local');
check(files.length===coverage.topics.length,'Complete coverage list');
check(new Set(coverage.topics.map(t=>t.topic)).size===files.length,'Unique topics');
check(rules.draft && sources.draft && coverage.draft,'Supporting material marked draft');
let inherited = 0, signatures = 0, triggers = 0;
const newSignatures = [];
const items = files.map(f=>read(join(here,f)));
for (const f of readdirSync(here)) {
  const b = readFileSync(join(here,f));
  check(!b.subarray(0,3).equals(Buffer.from([0xef,0xbb,0xbf])), `${f}: UTF-8 without BOM`);
  check(!b.toString('utf8').includes('\ufffd'), `${f}: no damaged text`);
}
function noSignatures(v, path='') {
  if (!v || typeof v !== 'object') return;
  for (const [k,x] of Object.entries(v)) {
    check(!['gateReview','questionVersions','contentHash','reviewer','signature','signedAt'].includes(k), `${path}.${k}: no sign-off fields`);
    noSignatures(x,path+'.'+k);
  }
}
for (const [fileIndex, item] of items.entries()) {
  const f = files[fileIndex];
  check(item.draft===true && item.purpose.includes('Unsigned'), `${f}: unsigned draft`);
  noSignatures(item);
  check(item.baseCommit===base && item.entry.id===item.topic, `${f}: identity/base`);
  check(coverage.topics.some(t=>t.file===f && t.subject===item.subject), `${f}: covered`);
  const result = RegisterSchema.safeParse({topics:[item.entry]});
  check(result.success, `${f}: existing register schema ${result.success?'':JSON.stringify(result.error.issues)}`);
  check(classes.has(item.entry.class), `${f}: existing class`);
  if (classes.get(item.entry.class).requiresAgencyReason && item.entry.placements.includes('derived')) {
    check(item.entry.agencyReasons?.length>0,`${f}: agency required for derived candidate`);
  }
  const old = liveById.get(item.topic);
  if (old) {
    inherited++;
    for (const k of ['status','window','placements','supersededOptions','needsSource','interim']) {
      check(JSON.stringify(item.entry[k])===JSON.stringify(old[k]),`${f}: inherited ${k} unchanged`);
    }
    for (const sig of old.refused??[]) check(item.entry.refused.some(s=>JSON.stringify(s)===JSON.stringify(sig)),`${f}: existing refusal retained`);
    for (const fld of old.protectedFields??[]) check(item.entry.protectedFields.includes(fld),`${f}: protected field retained`);
  }
  check(item.sources.length>0,`${f}: sources`);
  for (const id of item.sources) {
    const source = sources.sources[id];
    check(!!source,`${f}: source ${id} resolves`);
    check(existsSync(join(root,source.note)),`${f}: source note exists`);
    check(/p[p.]|Stat[.]|section/.test(source.citation),`${f}: citation locator`);
    check(!!source.limit && !!source.section,`${f}: evidence scope`);
  }
  for (const facet of item.facets) {
    check(facet.recommendation.startsWith('[I] '),`${f}: recommendation marked inference`);
    check(facet.evidence.every(id=>item.sources.includes(id)),`${f}: facet evidence resolves`);
  }
  check(item.remaining.length>0 && item.proposedRuling.startsWith('[I] '),`${f}: remaining work/ruling`);
  check(item.wordingRules.examples.every(e=>e.notPlayerContent===true),`${f}: examples only`);
  check(item.agencyReasonNotes.length>0 && Array.isArray(item.entry.protectedGroups),`${f}: agency/protected groups addressed`);
  const tr = TriggersSchema.parse({terms:item.triggerRules.terms,allow:liveTriggers.allow});
  triggers += tr.terms.length;
  // Proper nouns must not be triggered by this topic's candidates.
  for (const name of ['Black River','Indian Ocean','Hanging Rock']) check(triggerMatches(name,tr).length===0,`${f}: proper noun ${name}`);
  for (const [i,sig] of item.entry.refused.entries()) {
    signatures++;
    for (const k of ['fieldPattern','subjectPattern','optionPattern','labelPattern','orderPattern']) {
      if (sig[k]) { new RegExp(sig[k],'u'); check(true,`${f}: regex ${k}`); }
    }
    if (!(old?.refused??[]).some(s=>JSON.stringify(s)===JSON.stringify(sig))) newSignatures.push({topic:item.topic,index:i,sig});
  }
}
// These are deliberately artificial matcher fixtures, not player-facing prose.
const probes = {
 'emancipation-policy': ['emancipation_bonus','ship_freedpeople'],
 'prize-money-and-cotton': ['assign_freedpeople'],
 'black-enlistment': ['black_pool','recruit_black'],
 'black-soldiers-pay': ['black_pay_savings'],
 'black-sailors': ['black_sailor_pool'],
 'captured-black-soldiers': ['execute_black_prisoners'],
 'prisoners-and-exchange': ['execute_prisoners'],
 'occupation-orders': ['increase_occupation_severity','confirm_execution'],
 'unionist-repression': ['execute_unionists'],
 'twenty-slave-law': ['set_overseer_exemption'],
 'dakota-war-1862': ['execute_dakota','dakota_pool'],
 'verdict-text': ['virtue'],
};
const cursor = new Map();
for (const {topic,index,sig} of newSignatures) {
  const n=cursor.get(topic)??0; cursor.set(topic,n+1);
  const value=probes[topic]?.[n];
  check(!!value,`${topic}#${index}: positive fixture`);
  if (sig.fieldPattern) {
    check(signatureRefuses({...sig,subjectPattern:sig.subjectPattern??null},value,null),`${topic}#${index}: field fires`);
    check(!signatureRefuses({...sig,subjectPattern:sig.subjectPattern??null},'strength',null),`${topic}#${index}: ordinary strength passes`);
  } else {
    check(new RegExp(sig.optionPattern,'u').test(value),`${topic}#${index}: option fires`);
    check(!new RegExp(sig.optionPattern,'u').test('request_review'),`${topic}#${index}: review passes`);
  }
}
// Actual loader comparison, without moving or hiding any files on disk.
const accesses=[];
function adapter(hidden) {
  return {
    read(p) { accesses.push(p); if(hidden && p.startsWith('gate/drafts/')) return undefined; const f=join(pack,p); return existsSync(f)&&statSync(f).isFile()?readFileSync(f,'utf8'):undefined; },
    folders(p) { const f=join(pack,p); return existsSync(f)?readdirSync(f,{withFileTypes:true}).filter(d=>d.isDirectory() && !(hidden && p==='gate' && d.name==='drafts')).map(d=>d.name):[]; },
    files(p) { if(hidden && p==='gate/drafts')return []; const f=join(pack,p); return existsSync(f)?readdirSync(f,{withFileTypes:true}).filter(d=>d.isFile()).map(d=>d.name):[]; },
  };
}
const visible=loadPack(adapter(false));
const hidden=loadPack(adapter(true));
const normalized = v => JSON.stringify(v, (_k,x) => x instanceof Map ? [...x.entries()] : x instanceof Set ? [...x] : x);
check(sha(normalized(visible))===sha(normalized(hidden)),'Loader result identical with drafts visible/hidden');
check(!accesses.some(p=>p.startsWith('gate/drafts/')),'No draft read by actual loader');
check(!visible.issues.some(i=>i.severity==='error'),'No loader errors');
const paths=git(['diff',base,'--name-only']).split('\n').filter(Boolean);
for (const p of paths) check(p.startsWith('packs/union-1861/gate/drafts/'),`No out-of-scope tracked write: ${p}`);
const untracked=git(['ls-files','--others','--exclude-standard']).split('\n').filter(Boolean);
for (const p of untracked) check(p.startsWith('packs/union-1861/gate/drafts/'),`No out-of-scope untracked file: ${p}`);
const baseFiles=git(['ls-tree','-r','--name-only',base]).split('\n');
// git diff covers every tracked byte; manifest records untouched live input identities.
const preserved=baseFiles.filter(p=>!p.startsWith('packs/union-1861/gate/drafts/'));
const liveInventory=preserved.filter(p=>/^(packages|packs|tools|\.githooks)\//.test(p) && !p.startsWith('packs/union-1861/gate/drafts/')).map(p=>({file:p,sha256:sha(readFileSync(join(root,p)))}));
const inventory=readdirSync(here).filter(f=>statSync(join(here,f)).isFile()).sort().map(f=>({file:f,bytes:statSync(join(here,f)).size,sha256:sha(readFileSync(join(here,f)))}));
const result={checks,topics:items.length,inheritedTopics:inherited,newTopics:items.length-inherited,sources:Object.keys(sources.sources).length,signatures,newSignatures:newSignatures.length,triggers,
 loader:{digest:sha(normalized(visible)),draftReads:0,errors:visible.issues.filter(i=>i.severity==='error').length,warnings:visible.issues.filter(i=>i.severity==='warning').length},
 preservedBaseFiles:preserved.length,liveInventory,inventory,
 limits:['Author checks only; independent review/signatures deferred by 0106.','Positive/negative probes cover new candidate signatures; inherited signature coverage belongs to unchanged gate-register tests.','No D6 or new runtime clearance; reuse of S7 evidence requires unchanged live inputs.']};
writeFileSync(resolve(reportFile),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({...result,liveInventory:undefined,inventory:undefined}));
