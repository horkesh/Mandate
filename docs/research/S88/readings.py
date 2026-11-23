"""Reproduce S88's particular page extracts and receipt their read-only sources.

Only the listed pages/passages were read, not whole volumes. Downloaded originals
and extracts remain in ignored runs/s88. No other worktree is written.
"""
import csv, hashlib, json, pathlib, re, sys, xml.etree.ElementTree as ET
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from extract import ROOT, OUT, SOURCE, VOLUMES, extract

P = ROOT/'docs/research/S88'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p, x): p.write_text(json.dumps(x, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='\n')
def table(p, rows):
    with p.open('w', encoding='utf-8', newline='') as f:
        w=csv.DictWriter(f, fieldnames=list(rows[0]), lineterminator='\n'); w.writeheader(); w.writerows(rows)

# Running heads checked against these final extracts. Earlier III-I and I-III
# constant-offset guesses were rejected on seeing their running heads.
pages = {
 'OR-I-I': [196,197,200,201,248,249,250,276,279,284,285,286,288,291,292,456,457,458,459,462,488],
 'OR-I-II': [164,165,166,167,168,169,325,578,579,580,581,582,896,897,901,902,903,907,908,909,910,924,925,929,930,931,932,933,934,959,975,976],
 'OR-I-III': [374,375,376,381],
 'OR-III-I': [70,72,76,81,82,83,84,85,86,87,91,92,99,327,328],
 'OR-IV-I': [134,135,207,209,213,214,232,233,234,235,236,295,302,303,355,419,420,421,422,423,424,466,477,478],
 'ORN-I-IV': [90,109,110,111,112,237,238,240,275,281,288,289,302,303],
}
receipts=[]; sources=[]
for name, nums in pages.items():
    got=extract(name, nums)
    for row in got:
        row['id']=f'{name}:{row["page"]}'
        row['reading']='Relevant document and running head read; OCR retained without silent correction.'
        receipts.append(row)
    xml, scan, archive=VOLUMES[name]
    sources.append(dict(work=name, path=str(SOURCE/xml), sha256=sha(SOURCE/xml),
                        url=f'https://archive.org/download/{archive}/{archive}_djvu.xml'))
    if scan:
        sources.append(dict(work=name+' page-map metadata',path=str(SOURCE/scan),sha256=sha(SOURCE/scan),
                            url=f'https://archive.org/download/{archive}/{archive}_scandata.xml'))

def receipt_text(work, number, text, source, url, quality='Primary compilation text'):
    target=OUT/f'{work}-p{number}.txt'
    target.write_text(text+'\n', encoding='utf-8', newline='\n')
    receipts.append(dict(id=f'{work}:{number}', volume=work, page=number, leaf='',
      header=(f'Printed manuscript page {number}; page and footnotes read.' if work.startswith('Burlingame-') else ' '.join(text[:190].split())),path=str(target.relative_to(ROOT)),sha256=sha(target),
      source=str(source),url=url,reading=quality))

src=SOURCE/'S37/lincoln-works2.txt'; text=src.read_text(encoding='utf-8')
# Use the first matching actual running head for each number; a later OCR G19
# is printed 619, and must never overwrite the real page 19.
heads=[(m.start(),int(re.search(r'\d+',m[0])[0])) for m in re.finditer(r'^.*STATE.*LINCOLN.*$',text,re.M) if re.search(r'\d+',m[0])]
picked={}
for i,(start,n) in enumerate(heads[:-1]):
    if n not in picked: picked[n]=text[start:heads[i+1][0]]
for n in [11,12,13,14,15,16,17,18,19,20,21,22,26,27,28,29,30,36,37,47,48,76,77]:
    receipt_text('Lincoln-II',n,picked[n],src,'https://archive.org/details/abrahamlincolnco02linco',
                 'Nicolay and Hay, Complete Works II (1894), printed running head and cited passage read. Some OCR headers missed; adjacent text can extend beyond one printed page.')
sources.append(dict(work='Lincoln-II',path=str(src),sha256=sha(src),url='https://archive.org/download/abrahamlincolnco02linco/abrahamlincolnco02linco_djvu.txt'))

import fitz
for chapter,src,nums in [(22,SOURCE/'S37/burlingame-ch22.pdf',[2334,2335,2339,2349,2350,2351,2382,2383,2387,2392,2403]),
                          (23,OUT/'Burlingame-ch23.pdf',[2459,2460])]:
    doc=fitz.open(src)
    for n in nums:
        matches=[(i,p.get_text()) for i,p in enumerate(doc) if re.search(r'\b'+str(n)+r'\b',p.get_text()[:180])]
        assert len(matches)==1,(chapter,n)
        i,t=matches[0]
        receipt_text(f'Burlingame-{chapter}',n,t,src,f'https://www.knox.edu/documents/LincolnStudies/BurlingameVol2Chap{chapter}.pdf#page={i+1}',
                     'Published secondary manuscript; printed page and footnotes read. Quoted older sources are not claimed as separately read.')
    sources.append(dict(work=f'Burlingame-{chapter}',path=str(src),sha256=sha(src),url=f'https://www.knox.edu/documents/LincolnStudies/BurlingameVol2Chap{chapter}.pdf'))

src=SOURCE/'S37/galaxy-1871-01.xml'; objects=ET.parse(src).findall('.//OBJECT')
idx=next(i for i,o in enumerate(objects) if '95' in [w.text for w in o.findall('.//WORD')][:25])
for n in [95,96,97]:
    receipt_text('Welles-Galaxy',n,' '.join(w.text or '' for w in objects[idx+n-95].findall('.//WORD')),src,
                 'https://archive.org/details/sim_galaxy_1871-01_11_1', 'Retrospective article, January 1871; printed pp.95-97 read, including quoted orders.')
sources.append(dict(work='Welles-Galaxy',path=str(src),sha256=sha(src),url='https://archive.org/download/sim_galaxy_1871-01_11_1/sim_galaxy_1871-01_11_1_djvu.xml'))

src=SOURCE/'S73/Taney.txt'; t=src.read_text(encoding='utf-8')
start=t.index('250  DISTEIGT'); end=t.index('APEIL  TERM,  1861.  253',start)
receipt_text('Taney-Reports','250-252',t[start:end],src,'https://archive.org/details/cu31924068531247', 'Reported case, writ and return only; not legal advice or a complete case reading.')
sources.append(dict(work='Taney-Reports',path=str(src),sha256=sha(src),url='https://archive.org/details/cu31924068531247'))

src=SOURCE/'S37/confederacy-messages1.txt'; t=src.read_text(encoding='utf-8')
positions={}
for m in re.finditer(r'^.*(?:Provisional  Congress|Messages  and  Pa[m]?pers  of  the  Confederacy).*$',t,re.M):
    numeric=re.search(r'\b\d+\b',m[0])
    if numeric and 80<=int(numeric[0])<=100: positions.setdefault(int(numeric[0]),m.start())
for label,first,after in [('85-88',85,89),('93-97',93,98)]:
    receipt_text('Richardson-I',label,t[positions[first]:positions[after]],src,'https://archive.org/details/compmessages01richrich',
                 'Richardson I (1905), exact cited printed page boundaries; not whole volume.')
sources.append(dict(work='Richardson-I',path=str(src),sha256=sha(src),url='https://archive.org/download/compmessages01richrich/compmessages01richrich_djvu.txt'))

web=[]
for p in sorted(OUT.glob('web-*.json')):
    r=json.loads(p.read_text(encoding='utf-8')); s=r.get('structuredContent',{})
    if not s.get('markdown'): continue
    web.append(dict(path=str(p.relative_to(ROOT)),sha256=sha(p),url=s.get('metadata',{}).get('sourceURL'),
                    title=s.get('metadata',{}).get('title'),status=s.get('metadata',{}).get('statusCode')))
    if p.name=='web-Holt-Scott-LOC.json':
        receipt_text('LOC-0779200','1-6',s['markdown'],p,s['metadata']['sourceURL'],
          'LoC/Knox complete transcript of six-image manuscript read; Scott endorsement. Digital document pages 1-6, not an asserted printed pagination or individual scan reading.')

sources.append(dict(work='0111',path='C:/Pyrrhic/ByOrderOfThePresident/docs/decisions/0111-pushback-is-measured-by-named-acts.md',
                    sha256=sha(pathlib.Path('C:/Pyrrhic/ByOrderOfThePresident/docs/decisions/0111-pushback-is-measured-by-named-acts.md')),url='main decision 0111, read locally'))
decision=pathlib.Path(sources[-1]['path']).read_bytes()
(P/'0111-pushback-is-measured-by-named-acts.md').write_bytes(decision.replace(b'\r\n',b'\n'))
table(P/'source-pages.csv', [{k:r.get(k,'') for k in ['id','volume','page','leaf','header','path','sha256','source','url','reading']} for r in receipts])
dump(P/'source-reading.json',dict(sources=sources,web_receipts=web,scope='Only specifically cited pages/passages read; search index is discovery, not reading.',
 exclusions=['Initial III-I and I-III guessed object offsets rejected; final running heads inspected and corrected before registration.',
 'Initial Lincoln page 19 extract overwritten by OCR G19 (619) rejected; actual printed 19 restored.',
 'Initial Richardson keyword-context extract ended on p.85, not p.88; replaced by printed-header extraction before factual use.',
 'LoC PDF direct HTTP read timed out, web PDF open failed, and direct IIIF manifest returned HTTP 403. Successful LoC/Knox HTML transcript used instead; no individual manuscript scan reading claimed.',
 'Web advice summary pages are discovery only where local full primary answers are cited.',
 'Cameron-contracts secondary is unpaginated and supplies no primary refusal document; cannot supply a verified president-issued act.']))
print(json.dumps(dict(page_receipts=len(receipts),source_files=len(sources),web_receipts=len(web))))
