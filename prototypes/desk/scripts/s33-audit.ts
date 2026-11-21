/** Final S33 inventory; never writes another sprint lane or changes evidence. */
import {readFileSync,readdirSync,writeFileSync,statSync,existsSync} from 'node:fs';
import {resolve,relative,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=resolve('../..'),out=resolve('../../../ByOrderOfThePresident/art-masters/S33');
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const git=(...args:string[])=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
function files(p:string):string[]{return existsSync(p)?readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(p,e.name)):[join(p,e.name)]):[];}
const allowed=new Set(['notes/sprint-S33-desk.md','docs/playtests/2026-11-21-desk-manassas.md',
 'prototypes/desk/README.md','prototypes/desk/playwright.s33.config.ts','prototypes/desk/scripts/s33-trace.ts','prototypes/desk/scripts/s33-compare.ts','prototypes/desk/scripts/s33-audit.ts',
 'prototypes/desk/test/s33.spec.ts','prototypes/desk/test/s33-papers.spec.ts','prototypes/desk/test/s33-discovery.test.ts','prototypes/desk/test/s33-plan-permission.test.ts',
 'prototypes/desk/web/App.tsx','prototypes/desk/web/DeskViews.tsx','prototypes/desk/web/strings.ts','prototypes/desk/web/business.css','prototypes/desk/web/plan-business.ts',
 'prototypes/desk/web/map/StaffMap.tsx','prototypes/desk/web/map/strings.ts']);
if(git('branch','--show-current')!=='sprint/desk')throw Error('Wrong branch');
const changed=git('diff','--name-only','7db8c80').split(/\r?\n/).filter(Boolean),untracked=git('ls-files','--others','--exclude-standard').split(/\r?\n/).filter(Boolean);
for(const p of [...changed,...untracked])if(!allowed.has(p))throw Error(`Out-of-scope path: ${p}`);
const baseline=JSON.parse(readFileSync(`${out}/baseline.json`,'utf8')) as Record<string,string>;
for(const [p,sha] of Object.entries(baseline))if(hash(resolve(root,p))!==sha)throw Error(`Protected input changed: ${p}`);
const captures=['press-advance','discovery'].flatMap(dir=>files(join(out,dir)).filter(p=>p.endsWith('.png')&&!p.includes(`${join('','artifacts')}\\`)).map(p=>{
 const b=readFileSync(p),width=b.readUInt32BE(16),height=b.readUInt32BE(20),recipe=JSON.parse(readFileSync(`${p}.recipe.json`,'utf8'));
 if(recipe.sha256!==hash(p)||recipe.actualSize.width!==width||recipe.actualSize.height!==height)throw Error(`Capture mismatch: ${p}`);
 for(const source of recipe.references)if(hash(source.path)!==source.sha256)throw Error(`Source mismatch: ${p}`);
 return {path:relative(out,p),width,height,bytes:b.length,sha256:hash(p)};
}));
const build=files(resolve('dist')).map(p=>({path:relative(resolve('dist'),p),bytes:statSync(p).size,sha256:hash(p)}));
const primary=JSON.parse(readFileSync(`${out}/press-advance/result.json`,'utf8'));
const equivalence=JSON.parse(readFileSync(`${out}/discovery/equivalence.json`,'utf8'));
const inventory={base:'7db8c80',head:git('rev-parse','HEAD'),branch:'sprint/desk',protectedInputsUnchanged:Object.keys(baseline).length,captures,build,buildFiles:build.length,buildBytes:build.reduce((n,p)=>n+p.bytes,0),
 delivery:[...new Set([...changed,...untracked])].sort().map(p=>({path:p,sha256:hash(resolve(root,p))})),
 result:{throughDay:primary.throughDay,edited:primary.edited,approved:primary.approved,errors:primary.errors,battleIds:[...new Set(primary.battle.flatMap((r:any)=>r.claims.flatMap((c:any)=>c.battle?[c.battle]:[])))],battleWrittenDays:[...new Set(primary.battle.map((r:any)=>r.day))],battleReceivedDays:[...new Set(primary.battle.map((r:any)=>r.receivedDay))]},equivalence,
 limits:['Local-server prototype, not a shipping package.','Whole-branch and gate review remain with Claude under 0106.','No runtime/pack/schema/band edits.']};
writeFileSync(`${out}/final-inventory.json`,JSON.stringify(inventory,null,2));
console.log(JSON.stringify({protectedInputs:inventory.protectedInputsUnchanged,captures:captures.length,buildFiles:build.length,buildBytes:inventory.buildBytes,result:inventory.result,equivalence}));
