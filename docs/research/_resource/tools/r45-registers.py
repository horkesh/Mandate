"""Extract retained register entries for inspection, without modifying sources."""
from pathlib import Path
import re, json, hashlib
ROOT = Path(__file__).resolve().parents[1]
SCRATCH = Path(r'C:\Users\User\AppData\Local\Temp\claude\4d87ab6d8ae0089a\9b5270b2-8d26-4ceb-8899-4a7cb8486063\scratchpad\gaps\leads-A1-armybloc')
names = ['Franklin','Heintzelman','Keyes','McDowell','Mansfield','Meade','Meigs','Reynolds','Ripley','Schofield','Smith','Thomas','Porter','Burnside','Grant','Halleck','Hitchcock','Hooker','Mitchel','Patterson','Rosecrans','Sherman','Stone']
heit_patterns = ['Franklin,  William  Buel','Heintzelman,  Samuel  Peter','Keyes,  Erasmus  Darwin','McDowell,  Irvin','Mansfield,   Joseph','Meade,  George  Gordon','Meigs,  Montgomery','Reynolds,  John  Fulton','Ripley,  James  Wolfe','Schofield,  John  McAllister','Smith,  Charles  Ferguson','Thomas,  George  Henry','Porter,  Fitz  John','Burnside,  Ambrose  Everett','Grant,   Ulysses','Halleck,  Henry  Wager','Hitchcock,  Ethan  Allen','Hooker,  Joseph','Mitchel,  Ormsby','Patterson,  Robert.','Rosecrans,','Sherman,      William','Stone,    Charles']
lines = (SCRATCH/'heit1.txt').read_text(encoding='utf-8').splitlines()
out = []
for name,pattern in zip(names,heit_patterns):
    # Normalize only whitespace for discovery, retain the source lines verbatim.
    pat = re.sub(r'\s+', ' ',pattern).lower()
    hits = [i for i,l in enumerate(lines) if pat in re.sub(r'\s+',' ',l).lower()]
    if not hits:
        print(name,'MISSING'); continue
    i=hits[0]
    pages = [(j,l.strip()) for j,l in enumerate(lines[:i]) if re.fullmatch(r'\s*\d{3,4}\s*',l)]
    page=pages[-1][1] if pages else '?'
    excerpt='\n'.join(lines[max(0,i-5):i+26])
    out.append({'name':name,'source':'heit1.txt','page':page,'line':i+1,'text':excerpt})
    print(name,'Heitman p'+page, re.sub(r'\s+',' ', '\n'.join(lines[i:i+17])))
(ROOT/'evidence-r45'/'A1-Heitman-entries.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')

for volume in [1,2]:
    file = SCRATCH/('cullum1.txt' if volume==1 else 'cullum2b.txt')
    lines=file.read_text(encoding='utf-8').splitlines()
    wanted = [102,177,287,410,445,555,671,804,846,963,919,988,1022,1028] if volume==1 else [1084,1115,1167,1187,1237,1238,1348,1585]
    records=[]
    for name in wanted:
        hits=[i for i,l in enumerate(lines) if re.match(r'\s*'+str(name)+r'\s*[. ]',l) and re.search(r"Ap.?d",l)]
        for i in hits:
            end=next((j for j in range(i+2,min(i+170,len(lines))) if re.match(r'\s*\d+.*Ap.?d',lines[j])),min(i+100,len(lines)))
            heads=[l for l in lines[:i+1] if re.search(r'^\s*\d+\s+\w*[GR]ADU|ACADEMY[.,]?\s+\d+\s*$',l,re.I)]
            excerpt='\n'.join(lines[i:end])
            records.append({'name':name,'entry':lines[i],'preceding_headers':heads[-2:],'line':i+1,'text':excerpt})
            selection=[l for l in lines[i:end] if re.search(r'(?:Resign|Civil|185[0-9]|186[01])',l,re.I)]
            print('CULLUM',volume,lines[i],heads[-1:]); print('\n'.join(selection))
    (ROOT/'evidence-r45'/f'A1-Cullum{volume}-entries.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
