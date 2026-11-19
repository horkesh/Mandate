"""Read-only date/leg projection, matching e8c5808's validator predicates.

The semantic interval comparison is an additional research diagnostic, not a
replacement implementation or an assertion that unresolved sources are dated.
"""
from pathlib import Path
import calendar, collections, csv, datetime, hashlib, json, re, subprocess

ROOT=Path(__file__).resolve().parents[4]
E=ROOT/'docs/research/_resource/evidence-r52'
P=ROOT/'packs/union-1861'
cells=json.loads((E/'cells.json').read_text(encoding='utf-8'))
policy=json.loads((E/'policy-e8c5808.json').read_text(encoding='utf-8-sig'))
ep=policy['evidence']
sources={s['key']:s for s in json.loads((P/'PROVENANCE.json').read_text(encoding='utf-8'))['sources']}
weak=set(policy['weak']+policy['banned'])
refs=set(ep['referenceWorks'])
rows=list(csv.DictReader((ROOT/'docs/research/_resource/dating.csv').open(encoding='utf-8-sig',newline='')))
table={(r['cell'],r['citation']):r for r in rows}
date_re=re.compile(r'\bdated[: ]\s*(\d{4}-\d{2}-\d{2})\b',re.I)

def cls(cell):
    field=cell['cell'].split('/',1)[1]
    return 'innate' if field in ep['innateStats'] or field.startswith('trait:') and field[6:] in ep['innateTraits'] else 'start'

def static_weak(c):
    at=(c['at'] or '').strip().lower()
    marker=any(at==m or any(at.startswith(m+x) for x in [' ',':',',']) or at.startswith('['+m) for m in ['snippet','self-report','after-start'])
    return c['source'] in weak or marker

def judgement(cell):
    field=cell['cell'].split('/',1)[1]
    return field!='experience' and not(field.startswith('trait:') and field[6:] in ep['factTraits'])

def found(cell,c):return table[(cell['cell'],c['source']+' '+(c['at'] or ''))]['date']

def after(d,kind):return d>ep['innateThrough'] if kind=='innate' else d>=ep['startBefore']

def interval(d):
    def edge(s,upper):
        a=list(map(int,s.split('-')))
        if len(a)==1:return f'{a[0]:04d}-12-31' if upper else f'{a[0]:04d}-01-01'
        if len(a)==2:return f'{a[0]:04d}-{a[1]:02d}-{calendar.monthrange(*a)[1] if upper else 1:02d}'
        datetime.date(*a)
        return s
    a=d.split('..');return edge(a[0],False),edge(a[-1],True)

def date_weak(cell,c,mode):
    d=found(cell,c);kind=cls(cell)
    raw=date_re.search(c['at'] or '')
    if mode=='baseline':return after(raw[1],kind) if raw else False
    if mode=='mechanical':
        # Known bounds replace an inherited marker; their precision is preserved.
        # The production regex recognizes only a complete YYYY-MM-DD marker.
        if d=='not found':return after(raw[1],kind) if raw else False
        return after(d,kind) if re.fullmatch(r'\d{4}-\d{2}-\d{2}',d) else False
    if d=='not found':return None
    lo,hi=interval(d)
    if after(lo,kind):return True
    if not after(hi,kind):return False
    return None

def run(mode):
    failures=[];weak_only=[];uncertain=[];safe=[]
    for cell in cells:
        admissible=[c for c in cell['cites'] if c['source'] in sources and sources[c['source']]['kind']!='pointer']
        if admissible and all(static_weak(c) or date_weak(cell,c,mode) is True for c in admissible):weak_only.append(cell['cell'])
        if not judgement(cell):continue
        candidates=[c for c in cell['cites'] if sources.get(c['source'],{}).get('kind')=='primary' and c['source'] not in refs and not static_weak(c)]
        states=[date_weak(cell,c,mode) for c in candidates]
        if not states or all(x is True for x in states):failures.append(cell['cell'])
        elif any(x is False for x in states):safe.append(cell['cell'])
        else:uncertain.append(cell['cell'])
    return {'no_contemporary_leg':len(failures),'weak_citations_only':len(weak_only),'uncertain_leg':len(uncertain),'known_leg':len(safe),'refused_cells':failures,'weak_only_cells':weak_only,'uncertain_cells':uncertain}

def main():
    expected=collections.Counter((x['cell'],c['source']+' '+(c['at'] or '')) for x in cells for c in x['cites'])
    actual=collections.Counter((r['cell'],r['citation']) for r in rows if (r['cell'],r['citation']) in expected)
    assert actual==expected, 'coverage differs from current cited cells'
    assert list(rows[0])==['cell','citation','date','source of the date']
    for r in rows:
        assert r['source of the date']
        if r['date']!='not found':interval(r['date'])
    results={m:run(m) for m in ['baseline','mechanical','semantic']}
    results['inventory']={'cells':len(cells),'judgement_cells':sum(map(judgement,cells)),'citations':sum(expected.values()),'embedded_dated_markers':sum(bool(date_re.search(c['at'] or '')) for x in cells for c in x['cites']), 'resolved_dates':sum(table[(x['cell'],c['source']+' '+(c['at'] or ''))]['date']!='not found' for x in cells for c in x['cites']), 'unverified_embedded_markers':sum(found(x,c)=='not found' and bool(date_re.search(c['at'] or '')) for x in cells for c in x['cites'])}
    # The base has no blocCites. Bloc warnings are separate from these older cells.
    w=json.loads((P/'data/world.json').read_text(encoding='utf-8'))
    results['uncited_factional_blocs']=sum(p['bloc'] is not None and p['bloc'] not in ep['factBlocs'] and not p.get('blocCites') for p in w['people'])
    (E/'leg-audit.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
    for name,r in results.items():print(name,{k:v for k,v in r.items() if not isinstance(v,list)} if isinstance(r,dict) else r)
    print('coverage and date-shape checks: PASS')

if __name__=='__main__':main()
