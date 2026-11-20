"""Research-only catalogue/page reader. Original OCR and pack inputs are read-only."""
from pathlib import Path
import argparse, hashlib, json, re

OUT = Path(__file__).resolve().parents[1] / 'evidence-r52'
SCRATCH = Path(r'C:\Users\User\AppData\Local\Temp\claude\4d87ab6d8ae0089a\9b5270b2-8d26-4ceb-8899-4a7cb8486063\scratchpad')

def catalogue():
    records = []
    for p in SCRATCH.rglob('*.txt'):
        if p.stat().st_size < 100000 or p.name.endswith('.n.txt') or p.name.startswith('N_'):
            continue
        with p.open(encoding='utf-8-sig', errors='replace') as f:
            head = f.read(12000)
        compact = re.sub(r'\s+', ' ', head)
        series = re.search(r'SERIES.{0,75}VOLUME.{0,30}', compact, re.I)
        records.append({'file':str(p), 'size':p.stat().st_size,
                        'series':series.group() if series else None,
                        'title':compact[:350]})
    (OUT/'catalogue.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
    for r in records:
        if r['series']: print(str(Path(r['file']).relative_to(SCRATCH)),r['series'])

def headings(lines, page):
    found=[]
    for i,l in enumerate(lines):
        s=l.strip()
        # Page numbers occur alone or in short running heads. Returned candidates
        # require human inspection; this deliberately does not certify a page.
        if len(s)<145 and re.search(r'(?<!\d)'+str(page)+r'(?!\d)',s):
            if re.fullmatch(r'[\W\d]+',s) or re.search(r'(?:CHAP|OPERATIONS|CORRESPONDENCE|REPORTS|REBELLION|LINCOLN|DIARY|RECORD|WAR|CONFEDER|UNION|POLITIC|CONDUCT|SUMTER)',s,re.I):
                found.append(i)
    return found

def read(file, pages):
    p=Path(file)
    if not p.is_absolute():p=SCRATCH/p
    lines=p.read_text(encoding='utf-8-sig',errors='replace').splitlines()
    for page in pages:
        hits=headings(lines,page)
        print('\nFILE',p,'PAGE',page,'CANDIDATES',[i+1 for i in hits])
        for i in hits[-4:]:
            print('--- LINE',i+1,'---')
            print('\n'.join(lines[max(0,i-12):i+90]))

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('file');a.add_argument('pages',nargs='*',type=int);n=a.parse_args()
    if n.file=='catalogue':catalogue()
    else:read(n.file,n.pages)
