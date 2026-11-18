import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { icons, renderSVG } from '../src/catalog.mjs';
const root = new URL('../',import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const sources = await Promise.all(['src/catalog.mjs','src/roughen.mjs','scripts/generate.mjs'].map(async path=>({path,sha256:sha(await readFile(new URL(path,root)))})));
const seed = Number(process.argv.find(a=>a.startsWith('--seed='))?.split('=')[1] ?? 4816);
if(!Number.isSafeInteger(seed))throw Error('Seed must be a safe integer');
const inventory=[];
for(const kind of ['clean','rough']) {
  await mkdir(new URL(`icons/${kind}/`,root),{recursive:true});
  for(const icon of icons) {
    const svg=renderSVG(icon,{rough:kind==='rough',seed});
    const rel=`icons/${kind}/${icon.id}.svg`;
    await writeFile(new URL(rel,root),svg);
    const recipe={
      asset:`prototypes/map-icons/${rel}`,request:'R16',brief:'docs/design/ASSETS.md#1',date:'2026-11-17',
      plan:'ChatGPT Pro 100 (owner confirmation recorded in CODEX.md)',client:'Codex CLI 0.167.0',
      model:'Codex; exact runtime model identifier not recorded by this procedural generator',
      apiKeyUnset:!process.env.OPENAI_API_KEY,tool:'Node.js authored vector generator',mode:'procedural SVG; no image model',
      prompt:`R16: original abstract staff-map convention for ${icon.id}; 24-unit grid; no lettering, flags, emblems or figures.`,
      references:[],requestedSize:'24x24 vector units',actualSize:'24x24 vector units',variantsMade:2,variantChosen:kind,
      humanEdits:[],postProcess:kind==='rough'?[`xorshift32 seeded resampling; seed ${seed}; 1.4-unit maximum segment; 0.105-unit maximum axis displacement; 0.001-unit serialization`]:[],
      provenanceMarks:'Code-produced SVG; no image-tool metadata or embedded provenance marks were created or removed.',
      sha256:sha(svg),sources,seed:kind==='rough'?seed:null,slot:icon.slot??null,
      availability:icon.availability??'draft',
      notes:'AI-assisted authored vectors, not traced from historical art. CSS supplies colour and source state. Standing review pending.'
    };
    await writeFile(new URL(`${rel}.recipe.json`,root),JSON.stringify(recipe,null,2)+'\n');
    inventory.push({path:rel,sha256:sha(svg)});
  }
}
await writeFile(new URL('icons/manifest.json',root),JSON.stringify({request:'R16',seed,icons:icons.map(({shapes,...rest})=>rest),files:inventory},null,2)+'\n');
console.log(`Generated ${inventory.length} SVGs and recipes; seed ${seed}.`);
