/** Final read-only inventory. Writes only the authorized S8 evidence file. */
import {readFileSync,readdirSync,writeFileSync,statSync,existsSync} from 'node:fs';
import {resolve,relative,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=resolve('../..'),out=resolve(process.env.S8_EVIDENCE??'../../../ByOrderOfThePresident/art-masters/S8');
const hash=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
function files(dir:string):string[]{return existsSync(dir)?readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]):[];}
const captures=readdirSync(out).filter(n=>n.endsWith('.png')).map(name=>{
 const path=join(out,name),bytes=readFileSync(path),recipe=JSON.parse(readFileSync(`${path}.recipe.json`,'utf8'));
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 const ok=recipe.sha256===hash(bytes)&&recipe.actualSize===`${width}x${height}`&&recipe.references.every((r:{path:string;sha256:string})=>hash(readFileSync(r.path))===r.sha256);
 if(!ok)throw Error(`Capture or recipe mismatch: ${name}`);
 return {name,width,height,sha256:hash(bytes),bytes:bytes.length,recipeMatches:true};
});
for(const size of [[1920,1080],[3440,1440]])for(const kind of ['turn-stop','attention','accountability','org-board','audience','plan-review','ledger-figures','plan-marks','turn-playback']){
 if(!captures.some(c=>c.name===`${kind}-${size[0]}x${size[1]}.png`))throw Error(`Missing ${kind} at ${size}`);
}
const changed=execFileSync('git',['diff','--name-only','ceff796'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const untracked=execFileSync('git',['ls-files','--others','--exclude-standard'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
if([...changed,...untracked].some(p=>!p.startsWith('prototypes/desk/')))throw Error('Unexpected write outside prototype');
const branch=execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim();if(branch!=='sprint/desk')throw Error(`Wrong branch: ${branch}`);
const build=files(resolve('dist')).map(path=>({path:relative(resolve('dist'),path).replaceAll('\\','/'),bytes:statSync(path).size,sha256:hash(readFileSync(path))}));
const result={branch,base:'ceff796',changed,untracked,captures,buildFiles:build.length,buildBytes:build.reduce((n,f)=>n+f.bytes,0),build,
 limits:['Prototype build, not a shipping package. Ignored geographic inputs remain subject to their existing publication restrictions.','No hardware frame-rate claim; browser checks use the local headless renderer.','The main coordination file is a separate append-only hand-over, outside this worktree.']};
writeFileSync(join(out,'final-inventory.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({branch,captures:captures.length,buildFiles:build.length,buildBytes:result.buildBytes,sourceScopeClean:true}));
