/** S29's bounded final inventory. Reads the integrated baseline, never another lane. */
import {readFileSync,readdirSync,writeFileSync,statSync,existsSync} from 'node:fs';
import {resolve,relative,join,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=resolve('../..'),base=resolve('../../../ByOrderOfThePresident/art-masters/S29'),out=resolve(process.env.S29_OUTPUT??base);
if(relative(base,out).startsWith('..')||isAbsolute(relative(base,out)))throw Error('S29 evidence must stay in its masters folder');
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const save=(name:string,value:unknown)=>writeFileSync(`${out}/${name}`,JSON.stringify(value,null,2));
const git=(args:string[])=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
function files(dir:string):string[]{return existsSync(dir)?readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]):[];}
const allowed=new Set(['notes/sprint-S29-desk.md','docs/playtests/2026-11-21-desk-history-run.md',
 'packages/cli/src/console/game.ts','packages/cli/src/console/session.ts','packages/cli/src/desk/commands.ts',
 'packages/cli/test/turn-limit.test.ts','packages/cli/test/scheduled-calls.test.ts','packages/cli/test/short-turn-wording.test.ts',
 'packs/union-1861/test/desk-scheduled-calls.test.ts',
 'prototypes/desk/README.md','prototypes/desk/server/adapter.ts','prototypes/desk/web/App.tsx','prototypes/desk/web/DeskViews.tsx','prototypes/desk/web/strings.ts',
 'prototypes/desk/playwright.s29.config.ts','prototypes/desk/scripts/s29-audit.ts','prototypes/desk/scripts/s29-prepare.ts',
 'prototypes/desk/test/s29.spec.ts','prototypes/desk/test/s29-controls.spec.ts','prototypes/desk/test/support/s29-controls.ts',
 'prototypes/desk/test/s29-turn-limit.test.ts','prototypes/desk/test/s29-scheduled-calls.test.ts','prototypes/desk/test/s29-pending-decisions.test.ts','prototypes/desk/test/s29-call-picker.test.ts']);
if(git(['branch','--show-current'])!=='sprint/desk')throw Error('Wrong branch');
const changed=git(['diff','--name-only','d878dd3']).split(/\r?\n/).filter(Boolean);
const untracked=git(['ls-files','--others','--exclude-standard']).split(/\r?\n/).filter(Boolean);
for(const p of [...changed,...untracked])if(!allowed.has(p))throw Error(`Out-of-scope change: ${p}`);
const baseline=JSON.parse(readFileSync(`${base}/merged-baseline.json`,'utf8')) as {files:Record<string,string>};
let preserved=0;
for(const [p,sha] of Object.entries(baseline.files)){
 if(allowed.has(p))continue;
 if(!existsSync(resolve(root,p))||hash(resolve(root,p))!==sha)throw Error(`Integrated baseline changed: ${p}`);
 preserved++;
}
const prior=JSON.parse(readFileSync(resolve(base,'../S8/final-inventory.json'),'utf8')) as {build:{path:string;sha256:string}[]};
const maps=prior.build.filter(f=>f.path.startsWith('map-data/'));
if(maps.length!==files(resolve('public/map-data')).length)throw Error('Map inventory changed');
for(const f of maps)if(hash(resolve('public',f.path))!==f.sha256)throw Error(`Map changed: ${f.path}`);
const captures=readdirSync(out).filter(n=>n.endsWith('.png')).map(name=>{
 const file=join(out,name),b=readFileSync(file),width=b.readUInt32BE(16),height=b.readUInt32BE(20);
 if(!existsSync(`${file}.recipe.json`))throw Error(`Missing capture recipe: ${name}`);
 const recipe=JSON.parse(readFileSync(`${file}.recipe.json`,'utf8'));
 if(recipe.sha256!==hash(file)||recipe.actualSize!==`${width}x${height}`||!recipe.references.every((r:{path:string;sha256:string})=>hash(r.path)===r.sha256))throw Error(`Capture recipe mismatch: ${name}`);
 return {name,width,height,bytes:b.length,sha256:hash(file)};
});
for(let week=1;week<=22;week++)for(const size of ['3440x1440','1920x1080','papers'])if(!captures.some(c=>c.name===`week-${String(week).padStart(2,'0')}-${size}.png`))throw Error(`Missing week ${week} ${size}`);
const build=files(resolve('dist')).map(p=>({path:relative(resolve('dist'),p).replaceAll('\\','/'),bytes:statSync(p).size,sha256:hash(p)}));
const delivery=[...new Set([...changed,...untracked])].sort().map(path=>({path,sha256:hash(resolve(root,path))}));
save('final-inventory.json',{base:'d878dd3',head:git(['rev-parse','HEAD']),branch:'sprint/desk',delivery,preservedIntegratedPaths:preserved,ignoredMapFilesUnchanged:maps.length,captures,build,buildFiles:build.length,buildBytes:build.reduce((s,f)=>s+f.bytes,0),limits:['Local-server prototype; runtime art is served from the configured art root.','No shipping-package or release-hardware performance claim.','Whole-branch review remains with Claude under 0106.']});
console.log(JSON.stringify({delivery:delivery.length,preservedIntegratedPaths:preserved,ignoredMapFilesUnchanged:maps.length,captures:captures.length,buildFiles:build.length,buildBytes:build.reduce((s,f)=>s+f.bytes,0)}));
