"""S87 read-only input receipts and headless source extracts. Run at repo root."""
import csv, hashlib, json, pathlib, subprocess, xml.etree.ElementTree as ET
R = pathlib.Path.cwd()
O = R / 'runs/s87'
O.mkdir(parents=True, exist_ok=True)
P = R / 'docs/research/S87'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p, v): p.write_text(json.dumps(v, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='\n')
if not (O/'baseline.json').exists():
    files = subprocess.check_output(['git','ls-files','-z']).decode().split('\0')
    dump(O/'baseline.json', {'head':subprocess.check_output(['git','rev-parse','HEAD']).decode().strip(), 'files':{f:sha(R/f) for f in files if f}})
inputs = {}
for name in ['pushback-responses.csv','measurement-evidence.json','reference-inputs.json']:
    src = pathlib.Path('C:/Pyrrhic/sprint-research-military/docs/research/S84')/name
    inputs[str(src)] = {'sha256':sha(src),'bytes':src.stat().st_size}
    snapshot=src.read_bytes().replace(b'\r\n',b'\n')
    (P/('s84-'+name)).write_bytes(snapshot)
    inputs[str(src)]['snapshot_sha256']=hashlib.sha256(snapshot).hexdigest()
dump(P/'input-receipts.json',inputs)
sources = json.loads((R/'docs/research/_pushback/s37-sources.json').read_text())
readings = O/'reading'; readings.mkdir(exist_ok=True)
for key, pages in [('galaxy-1871-01.xml',[95,96,97]),('or-i3.xml',[374,375,376,381])]:
    src=next(pathlib.Path(x['path']) for x in sources if pathlib.Path(x['path']).name==key)
    tree=ET.parse(src)
    for ob in tree.findall('.//OBJECT'):
        words=[w.text or '' for w in ob.findall('.//WORD')]
        # Print candidates with running-page numbers, then inspect their headings.
        if any(str(p) in words[:35] for p in pages):
            n=next(str(p) for p in pages if str(p) in words[:35])
            (readings/f'{key}-p{n}.txt').write_text(' '.join(words),encoding='utf-8')
src=next(pathlib.Path(x['path']) for x in sources if x['path'].endswith('burlingame-ch22.pdf'))
import fitz
pdf=fitz.open(src)
for i,p in enumerate(pdf):
    t=p.get_text()
    if any(str(n) in t[:250] for n in [2349,2350,2351,2392]):
        (readings/f'burlingame-pdf{i+1}.txt').write_text(t,encoding='utf-8')
print('inputs retained; baseline captured; extracts',len(list(readings.glob('*'))))
for key, anchor, wanted in [('galaxy-1871-01.xml',95,[96]),('or-i3.xml',375,[374,376])]:
    src=next(pathlib.Path(x['path']) for x in sources if pathlib.Path(x['path']).name==key)
    objects=ET.parse(src).findall('.//OBJECT')
    idx=next(i for i,ob in enumerate(objects) if (readings/f'{key}-p{anchor}.txt').read_text(encoding='utf-8')==' '.join(w.text or '' for w in ob.findall('.//WORD')))
    for n in wanted:
        (readings/f'{key}-p{n}.txt').write_text(' '.join(w.text or '' for w in objects[idx+n-anchor].findall('.//WORD')),encoding='utf-8')
# Extract using printed running heads; the text includes both adjacent boundaries.
import re
for filename, pattern, target in [
 ('lincoln-works2.txt',r'47\s+\n','lincoln-p47-48.txt'),
 ('confederacy-messages1.txt',r'WASHINGTON  CITY,  April  13','campbell-context.txt'),
 ('or-iii1-correct.txt',r'87\s+\n','or-iii1-p87.txt')]:
    src=next(pathlib.Path(x['path']) for x in sources if x['path'].endswith(filename))
    t=src.read_text(encoding='utf-8'); m=re.search(pattern,t)
    if m: (readings/target).write_text(t[max(0,m.start()-200):m.start()+16000],encoding='utf-8')
