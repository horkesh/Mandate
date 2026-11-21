/** Final S19 inventories; no repository mutation. */
import {readFileSync,readdirSync,writeFileSync,statSync,existsSync} from 'node:fs';
import {resolve,relative,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=resolve('../..'),out=resolve('../../../ByOrderOfThePresident/art-masters/S19');
const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
function files(dir:string):string[]{return existsSync(dir)?readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]):[];}
const git=(args:string[])=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const changed=git(['diff','--name-only','e82a634']).split(/\r?\n/).filter(Boolean),untracked=git(['ls-files','--others','--exclude-standard']).split(/\r?\n/).filter(Boolean);
const allowed=new Set(['notes/sprint-S19-desk.md','packages/cli/src/console/game.ts','packages/cli/test/turn-stops.test.ts',
 'packages/kernel/src/knowledge/report.ts','packages/kernel/src/politics/rules.ts','packages/kernel/src/seat-api.ts','packages/kernel/src/seats/api.ts','packages/kernel/src/seats/turn-stops.ts','packages/kernel/src/tick/context.ts','packages/kernel/src/view/desk.ts','packages/kernel/src/view/types.ts','packages/kernel/src/view/view.ts','packages/kernel/test/desk-projections.test.ts',
 'packages/pack-format/src/schemas.ts','packages/pack-format/src/validate.ts','packages/pack-format/schemas/pack.schema.json','packages/pack-format/schemas/world.schema.json','packages/pack-format/schemas/situation.schema.json']);
if([...changed,...untracked].some(p=>!allowed.has(p)&&!p.startsWith('prototypes/desk/')))throw Error('Unexpected changed path');
if(git(['branch','--show-current'])!=='sprint/desk')throw Error('Wrong branch');
const captures=readdirSync(out).filter(n=>n.endsWith('.png')).map(name=>{
 const path=join(out,name),b=readFileSync(path),recipe=JSON.parse(readFileSync(`${path}.recipe.json`,'utf8'));
 const width=b.readUInt32BE(16),height=b.readUInt32BE(20);
 if(recipe.sha256!==hash(b)||recipe.actualSize!==`${width}x${height}`||!recipe.references.every((r:{path:string;sha256:string})=>hash(readFileSync(r.path))===r.sha256))throw Error(`Capture mismatch: ${name}`);
 return {name,width,height,sha256:hash(b),bytes:b.length};
});
for(const [w,h] of [[1920,1080],[3440,1440]])for(const kind of ['attention','congress','turn-stops','audience-correspondence','congress-acts','stops-200-contrast'])if(!captures.some(c=>c.name===`${kind}-${w}x${h}.png`))throw Error(`Missing ${kind} at ${w}`);
const build=files(resolve('dist')).map(p=>({path:relative(resolve('dist'),p).replaceAll('\\','/'),bytes:statSync(p).size,sha256:hash(readFileSync(p))}));
const delivery=[...new Set([...changed,...untracked])].sort().map(path=>({path,sha256:hash(readFileSync(resolve(root,path)))}));
const protectedDiff=git(['diff','--name-only','e82a634','--','packs','packages/kernel/src/root-state.ts','packages/kernel/src/ownership.ts','package-lock.json','prototypes/desk/package-lock.json','prototypes/desk/public/map-data']);
if(protectedDiff)throw Error(`Protected paths changed: ${protectedDiff}`);
const prior=JSON.parse(readFileSync(resolve(out,'../S8/final-inventory.json'),'utf8'));
const priorMaps=prior.build.filter((f:{path:string})=>f.path.startsWith('map-data/'));
const mapInputs=files(resolve('public/map-data'));
if(priorMaps.length!==mapInputs.length)throw Error('Ignored map inventory differs from S8');
for(const f of priorMaps)if(hash(readFileSync(resolve('public',f.path)))!==f.sha256)throw Error(`Ignored map changed: ${f.path}`);
const result={base:'e82a634',branch:'sprint/desk',changed,untracked,delivery,captures,build,buildFiles:build.length,buildBytes:build.reduce((n,f)=>n+f.bytes,0),protectedPathsUnchanged:true,ignoredMapFilesUnchanged:priorMaps.length,
 reused:['Unchanged S19 native attention, stop and granted-audience captures; only the Congress captures were refreshed after its missing-name correction.','The full 106-test desk pass is reused after Congress wording and the earlier-visitor link correction, with 15 affected tests and targeted browser checks.'],
 limits:['Local-server prototype, not a standalone shipping package.','No release-hardware frame-rate claim.','Union membership counts and prospective audience counter replies remain unpublished.']};
writeFileSync(`${out}/final-inventory.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({captures:captures.length,delivery:delivery.length,buildFiles:build.length,buildBytes:result.buildBytes,protectedPathsUnchanged:true}));
