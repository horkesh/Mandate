"""Cached fetch -> geography -> atlas build. All new work stays under the prototype.

The historical builders run in an isolated mirror, so their old evidence paths
cannot overwrite the project's retained R18-R40 evidence. Sources are pinned.
"""
import argparse, hashlib, json, os, shutil, subprocess, sys, urllib.request
from pathlib import Path

PROTO = Path(__file__).resolve().parents[1]
ROOT = PROTO.parents[1]
STAGES = [('base','build-map.py'),('rail','build-r22.py'),('rivers','build-r23.py'),
          ('detail','build-r24.py'),('relief','build-r28.py')]
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def read(path): return json.loads(path.read_text(encoding='utf8'))
def matches(path, expected):
    if not path.exists(): return False
    raw = path.read_bytes(); lf = raw.replace(b'\r\n', b'\n')
    return expected in {hashlib.sha256(b).hexdigest() for b in [raw, lf, lf.replace(b'\n',b'\r\n')]}

def areas_current(proto):
    file=proto/'public/map-data/union-1861-claim-areas.json'; recipe=Path(str(file)+'.recipe.json')
    if not file.exists() or not recipe.exists(): return False
    meta=read(recipe)
    return (sha(file)==meta.get('sha256') and matches(proto/'scripts/r30-areas.py',meta.get('scriptSha256'))
            and sha(proto.parents[1]/'packs/union-1861/source/world/regions.csv')==meta.get('csvSha256'))

def geography_plan(proto=PROTO):
    data = proto/'public/map-data'
    for pack in ['union-1861','testbed']:
        csv = proto.parents[1]/f'packs/{pack}/source/world/regions.csv'
        if not csv.exists(): raise RuntimeError(f'Missing pack input: {csv}')
        file = data/f'{pack}.json'; recipe = Path(str(file)+'.recipe.json')
        if not file.exists() or not recipe.exists(): return [name for name,_ in STAGES]
        meta = read(recipe)
        if sha(file) != meta.get('sha256') or sha(csv) != meta.get('inputCsvSha256'):
            return [name for name,_ in STAGES]
    meta = read(data/'union-1861.json.recipe.json')
    checks = [meta.get('baseLayerUpdate',meta).get('scriptSha256'),
              meta.get('R22',{}).get('scriptSha256'),meta.get('R23',{}).get('scriptSha256'),
              meta.get('R24',{}).get('scriptSha256'),meta.get('R28',{}).get('scriptSha256')]
    for index,(_,script) in enumerate(STAGES):
        if not matches(proto/'scripts'/script,checks[index]): return [s for s,_ in STAGES[index:]]
    if not matches(proto/'scripts/relief_surface.py',meta.get('R28',{}).get('samplingScriptSha256')): return ['relief']
    if not areas_current(proto): return ['areas']
    return []

def run(command, cwd=PROTO, env=None):
    print('Running:', ' '.join(map(str,command)), flush=True)
    subprocess.run(list(map(str,command)),cwd=cwd,env=env,check=True)

def rebuild(stages):
    # Reject missing tools before any download or long geometry operation.
    tools = [PROTO/'.geometry-tools',ROOT/'art-masters/R22/python-tools']
    env = {**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PYTHONPATH':os.pathsep.join(map(str,tools))}
    run([sys.executable,'-B','-c','import shapefile, shapely, numpy, PIL, pyproj'],env=env)
    mirror = PROTO/'data/map-setup/rebuild'
    target = mirror/'prototypes/desk'; sources = mirror/'art-masters'
    (target/'scripts').mkdir(parents=True,exist_ok=True)
    for file in (PROTO/'scripts').glob('*.py'): shutil.copy2(file,target/'scripts'/file.name)
    shutil.copytree(PROTO/'public/fonts',target/'public/fonts',dirs_exist_ok=True)
    for pack in ['union-1861','testbed']:
        dest = mirror/f'packs/{pack}/source/world'; dest.mkdir(parents=True,exist_ok=True)
        shutil.copy2(ROOT/f'packs/{pack}/source/world/regions.csv',dest/'regions.csv')
    data = target/'public/map-data'; data.mkdir(parents=True,exist_ok=True)
    for file in (PROTO/'public/map-data').glob('*.json'): shutil.copy2(file,data/file.name)
    specs = read(PROTO/'scripts/map-sources.json')
    # Only inputs consumed by the retained builders, not old study scans/pages.
    needed = {'R22/sources/rail.zip','R22/sources/etopo1.tif','R24/sources/US_AtlasHCB_Counties_Gen001.zip',
              'R28/sources/3dep-east.tif','R28/sources/3dep-response.json'}
    needed.update(s['path'] for s in specs if s['path'].startswith('R18/') and s['path'].endswith('.zip'))
    records = {}
    for spec in specs:
        if spec['path'] not in needed: continue
        dest = sources/spec['path']; dest.parent.mkdir(parents=True,exist_ok=True)
        if not dest.exists():
            cached = ROOT/'art-masters'/spec['path']
            if cached.exists() and sha(cached)==spec['sha256']: shutil.copy2(cached,dest)
            else:
                print('Fetching:',spec['url'],flush=True)
                request = urllib.request.Request(spec['url'],headers={'User-Agent':'Mandate-local-map-build/1.0'})
                try:
                    with urllib.request.urlopen(request,timeout=90) as response: payload=response.read()
                except Exception as error: raise RuntimeError(f"Missing map input {spec['path']}: {error}") from error
                if hashlib.sha256(payload).hexdigest()!=spec['sha256']: raise RuntimeError(f"Changed source: {spec['path']}; check the source and update its recipe before rebuilding")
                dest.write_bytes(payload)
        if sha(dest)!=spec['sha256']: raise RuntimeError(f'Corrupt cached input: {dest}')
        records.setdefault(dest.parent,[]).append({**spec,'file':dest.name})
    for folder,items in records.items(): (folder/'manifest.json').write_text(json.dumps(items,indent=2),encoding='utf8')
    for request in ['R18','R22','R23','R24','R28','R30']: (sources/request).mkdir(parents=True,exist_ok=True)
    # The detail stage needs the exact base-stage matching report, not guessed matches.
    if 'detail' in stages and 'base' not in stages:
        report=ROOT/'art-masters/R18/geometry-report.json'
        if not report.exists(): raise RuntimeError(f'Missing detail input {report}; rebuild from the base stage with --full')
        shutil.copy2(report,sources/'R18/geometry-report.json')
    for name,script in STAGES:
        if name in stages: run([sys.executable,'-B',target/'scripts'/script],cwd=target,env=env)
    # The area supplement reads MANDATE_MAIN and writes only inside this mirror.
    if not areas_current(PROTO):
        run([sys.executable,'-B',target/'scripts/r30-areas.py'],cwd=target,env={**env,'MANDATE_MAIN':str(mirror)})
    for file in data.glob('*.json'):
        if file.name.endswith('.recipe.json'):
            recipe=read(file);recipe['buildRoot']=str(mirror);file.write_text(json.dumps(recipe,indent=2),encoding='utf8')
        dest=PROTO/'public/map-data'/file.name;dest.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(file,dest)

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');parser.add_argument('--full',action='store_true')
    args=parser.parse_args();stages=[name for name,_ in STAGES] if args.full else geography_plan()
    print(json.dumps({'geographyStages':stages,'order':['fetch missing sources','build stale geography','bake stale images']},indent=2),flush=True)
    if args.check:return
    if stages:rebuild(stages)
    else:print('Geography current; no sources fetched or geometry rebuilt.',flush=True)
    node=shutil.which('node')
    if not node:raise RuntimeError('Missing Node.js; install the desk dependencies with npm ci')
    tsx=PROTO/'node_modules/tsx/dist/cli.mjs'
    if not tsx.exists():raise RuntimeError('Missing tsx; run npm ci in prototypes/desk')
    run([node,tsx,'scripts/map-bake.ts'])
    run([node,tsx,'scripts/bake-furniture.ts'])

if __name__=='__main__':
    try:main()
    except Exception as error:
        print(f'map:setup failed: {error}',file=sys.stderr);sys.exit(1)
