/** Identical sequential local recipe for the S150 tree and a pinned July source snapshot. */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const label=process.argv[2]!, out=process.argv[3]!;
assert(['s150','s150-optimised','july-de3a6601'].includes(label)&&out);
mkdirSync(out,{recursive:true});
assert(!existsSync(`${out}/${label}.started.json`),'one reading per tree, never overwrite');
const runtime={label,cwd:process.cwd(),node:process.version,platform:process.platform,
  workspacePackages:Object.fromEntries(['kernel','pack-format','rule-seats'].map(p=>[p,realpathSync(`node_modules/@mandate/${p}`)]))};
writeFileSync(`${out}/${label}.started.json`,JSON.stringify(runtime,null,2)+'\n');
const {phase0Run}=await import(pathToFileURL(`${process.cwd()}/packages/cli/src/phase0-run.ts`).href);
for(const atWar of [true,false]) {
  const smoke=phase0Run({pack:'union-1861',days:2,checkpointEvery:2,replay:false,timings:true,atWar});
  assert.equal(smoke.rejections,0);
}
const readings=[];
for(const atWar of [true,false]) {
  const summary=phase0Run({pack:'union-1861',days:148,checkpointEvery:148,replay:false,timings:true,atWar});
  writeFileSync(`${out}/${label}-${atWar?'war':'history'}.json`,JSON.stringify(summary,null,2)+'\n');
  assert.equal(summary.rejections,0);
  readings.push({atWar,finalHash:summary.finalHash,timing:summary.timing});
}
writeFileSync(`${out}/${label}.json`,JSON.stringify({runtime,readings},null,2)+'\n');
console.log(JSON.stringify({label,readings}));
