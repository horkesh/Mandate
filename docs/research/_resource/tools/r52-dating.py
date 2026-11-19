"""Reproducible research inventory and conservative date-resolution table.

Never changes pack data. Absence of a verified date is an explicit outcome,
not permission to use an event date or a compilation's imprint as a letter date.
"""
from pathlib import Path
import csv,json,re,collections,hashlib
ROOT=Path(__file__).resolve().parents[1]
E=ROOT/'evidence-r52'
CELLS=json.loads((E/'cells.json').read_text(encoding='utf-8'))

# These date headings were read in official-reading.txt and the retained extracts.
# Broad bounds deliberately include adjacent letters when a locator is not specific.
OFFICIAL={
 'OR I-1':{12:'1861-04-18..1861-04-19',163:'1861-02',166:'1861-02-06',9:'1860-12..1861-01',291:'1861-04',297:'1861-04',301:'1861-04',38:'1861-04',61:'1861-04',30:'1861-04'},
 'OR I-2':{1007:'1861-07',28:'1861-05',30:'1861-05',32:'1861-05',316:'1861-07',581:'1861-04',593:'1861-04',614:'1861-04',618:'1861-05',713:'1861-06',881:'1861-05',897:'1861-05',118:'1861-06'},
 'OR I-3':{372:'1861-05',374:'1861-05',375:'1861-05',377:'1861-05',395:'1861-07',399:'1861-07',408:'1861-07',104:'1861-07..1861-08',185:'1861-09',467:'1861-08',485:'1861-09',541:'1861-08..1862-03',542:'1861-08..1861-10',543:'1861-08..1861-10',544:'1861-09',57:'1861-08'},
 'OR I-4':{378:'1861-07..1861-08',180:'1861-08..1861-09',296:'1861-10',314:'1861-10'},
 'OR I-5':{1053:'1862-01..1862-02',1090:'1862-03',192:'1861-09',639:'1861-10..1861-11',823:'1861-08..1861-09',868:'1861-09'},
 'OR I-6':{558:'1863-04'},
 'OR I-7':{104:'1862-01..1862-02',161:'1862-02',254:'1862-03',259:'1862-03',278:'1862-02',301:'1862-03',680:'1862-03',682:'1862-03',683:'1862-03',746:'1861-12',80:'1862-01',927:'1861-12..1862-01',928:'1862-01'},
 'OR I-8':{194:'1862-03',196:'1862-03..1862-04',282:'1862-03',286:'1862-03..1862-04',370:'1861-11'},
 'OR I-9':{207:'1862-03'},
 'OR I-10-2':{379:'1862-03..1862-04'},
 'OR I-11-1':{1036:'1862-06',275:'1862-05',37:'1862-05',61:'1862-06-28..1863-08-04',74:'1862-07',751:'1862-06',78:'1862-07..1862-08',82:'1862-08',933:'1862-06',934:'1862-06'},
 'OR I-11-2':{680:'1862-08..1862-09'},
 'OR I-11-3':{422:'1862-04'},
 'OR I-12-1':{379:'1862-03'},
 'OR I-12-3':{473:'1862-07'},
 'OR I-16-1':{1087:'1862-10',1109:'1862-11'},
 'OR I-19-1':{46:'1862-09'},
 'OR I-21':{67:'1862-12'},
 'OR II-1':{755:'1861-05..1861-07',818:'1862-05'},
 'OR III-1':{298:'1861-06',337:'1861-07',378:'1861-08',388:'1861-08',431:'1861-08',439:'1861-08',71:'1861-04',72:'1861-04',73:'1861-04',75:'1861-04',76:'1861-04',77:'1861-04',81:'1861-04',82:'1861-04',83:'1861-04',102:'1861-04',463:'1861-08',623:'1861-11'},
 'OR III-2':{180:'1862-06',46:'1862-05',881:'1862-11'},
 'ORN I-4':{290:'1861-04-23'},
 'ORN I-5':{624:'1861-05',637:'1861-05',682:'1861-05'},
 'ORN II-2':{76:'1861-06..1861-07'},
}

def key(c):return c['source']+' '+(c['at'] or '')

def resolution(c):
    cite=key(c);s=c['source'];at=c['at'] or ''
    custom=json.loads((E/'date-overrides.json').read_text(encoding='utf-8')) if (E/'date-overrides.json').exists() else {}
    if cite in custom:return custom[cite]['date'],custom[cite]['basis']
    m=re.match(r'^(ORN?)\s+([IVX]+-\d+(?:-\d+)?)(?:[ -]+p\.?\s*(\d+))',cite)
    if m:
        v=m[1]+' '+m[2];p=int(m[3]);d=OFFICIAL.get(v,{}).get(p)
        if d:
            # Reading a first page does not establish a bound for unread pages.
            tail=cite[m.end():]
            if re.match(r'[-,]\s*(?:p\s*)?\d',tail):
                return 'not found', f'{v} p{p}: the first-page heading gives {d}, but the complete multi-page locator was not resolved to one document or independently bounded. No date is assigned to its unread or unidentified additional documents. See official-page-extracts.json and official-reading.txt.'
            if (v,p)==('OR I-1',12):
                return d, 'OR I-1 p12: Anderson telegram headed April18 [1861] and letter headed New York April19 1861, both under No6. The page-only locator selects neither separately, so retain 1861-04-18..1861-04-19. See evidence-r62/source-reading.json and evidence-r52/official-page-extracts.json.'
            if (v,p)==('OR I-11-1',61):
                return d, 'OR I-11-1 p61: independently headed telegram of June28 1862 quoted inside McClellan report No1, headed August4 1863 on p5. The page-only locator does not distinguish the telegram from the surrounding report. Retain 1862-06-28..1863-08-04; do not date the whole report from its quoted telegram. See evidence-r62/source-reading.json.'
            return d, f'{v} p{p}: printed date headings read in evidence-r52/official-page-extracts.json and official-reading.txt; bound covers neighboring documents where the locator does not select one. This dates this page only.'
        return 'not found',f'{v} p{p}: document date not established in this pass. See official-missing.txt or official-page-extracts.json; an absent date heading, continuation, ambiguous OCR page or unresolved additional document is not dated from the event it describes. Any embedded date remains unverified.'
    if s=='WELLES-D' and re.fullmatch(r'186[23]-\d\d-\d\d',at):
        return at,'Welles vol1, diary entry headed '+at+'; heading and surrounding text read in evidence-r52/diary-heading-extracts.json. The 1862/1863 chapter sequence distinguishes repeated month/day headings; not the 1911 publication date.'
    if s=='FOX-CC' and re.match(r'1:',at):
        p=int(re.search(r'1:(\d+)',at)[1])
        if p<=51:return '1861-01..1861-05','Fox vol1, Sumter correspondence pp1-51: dated letters in the chapter run January through May 1861 (headings at retained OCR lines496-2419). Broad chapter bound only; not a day inferred from a page number. Exact selected letters override this bound separately.'
    if s in {'BDAC','Heitman','Callahan','Cullum','Wright','CongDir37','APPLETONS','DNB'}:
        return 'not found',f'{s}, entry/locator {at}: no separately dated contemporary statement established. This is a compiled reference entry, not a dated commission or a letter. Its imprint or the service/event dates it lists must not become a fabricated document date; see dating-method.md, reference-work register.'
    return 'not found',f'{s}, locator {at}: no document date verified for this exact citation in the bounded pass. An imprint, narrated event, inherited locator date or another document on nearby pages is not substituted. See dating-method.md for sources searched and access/locator limits.'

def main():
    seedfile=E/'dating-r45-original.csv'
    if not seedfile.exists():seedfile.write_bytes((ROOT/'dating.csv').read_bytes())
    seed=list(csv.DictReader(seedfile.open(encoding='utf-8-sig',newline='')))
    rows=[];current=set()
    for cell in CELLS:
        for c in cell['cites']:
            d,b=resolution(c);rows.append({'cell':cell['cell'],'citation':key(c),'date':d,'source of the date':b});current.add((cell['cell'],key(c)))
    # R45's narrower documentary locators remain visible, without pretending they
    # date every document in a broader current pack locator.
    supplements=[]
    for r in seed:
        if (r['cell'],r['citation']) not in current:
            r['source of the date']='R45 supplemental documentary locator, not an exact current pack citation. '+r['source of the date'];supplements.append(r)
        else:
            for row in rows:
                if row['cell']==r['cell'] and row['citation']==r['citation']:row.update(r)
    with (ROOT/'dating.csv').open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=['cell','citation','date','source of the date'],lineterminator='\n');w.writeheader();w.writerows(rows+supplements)
    summary={'cells':len(CELLS),'citations':len(rows),'supplemental_r45_records':len(supplements),'dated_current':sum(r['date']!='not found' for r in rows),'unresolved_current':sum(r['date']=='not found' for r in rows),'by_source':{s:dict(collections.Counter('resolved' if r['date']!='not found' else 'not found' for r in rows if r['citation'].startswith(s+' '))) for s in sorted({c['source'] for x in CELLS for c in x['cites']})}}
    (E/'dating-counts.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8');print(json.dumps(summary,indent=2))

if __name__=='__main__':main()
