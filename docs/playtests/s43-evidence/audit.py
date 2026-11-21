from pathlib import Path
import json,hashlib,datetime
out=Path(__file__).resolve().parent
root=out.parents[2]
raw=root/'runs/s43'
def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))
def write(n,d):
 text=('[\n'+',\n'.join(json.dumps(r,ensure_ascii=False) for r in d)+'\n]\n') if n=='movements-private.json' else json.dumps(d,indent=2,ensure_ascii=False)+'\n'
 (out/n).write_text(text,encoding='utf-8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def date(n):return str(datetime.date(1861,3,5)+datetime.timedelta(days=n))
daily=read(raw/'daily-private.json');papers=read(raw/'public-papers.json')
world=read(raw/'world-context.json');summary=read(raw/'summary.json')
entries=read(raw/'issued-entries.json');transcript=read(raw/'transcript.json')
regions={'washington','northern_virginia','manassas','fredericksburg','hanover','richmond','chesterfield','southside','harpers_ferry','winchester','shenandoah','staunton','norfolk','fort_monroe','yorktown','hampton','williamsburg','petersburg','lynchburg','danville'}
movements=[];prior={};battles={};operations={}
for d in daily:
 for bid,b in d['forceBlockStates'].items():
  loc=d['forceLocations'][bid];post=d['forceAssignments'].get(bid)
  if bid!='fb_us_dc_militia' and post not in ['cs_cmd_manassas','cs_cmd_harpers_ferry'] and loc['locRegion'] not in regions:continue
  row={'block':bid,'post':post,'force':b,'location':loc,'enlistment':d['forceEnlistments'].get(bid)}
  key=json.dumps(row,sort_keys=True)
  if prior.get(bid)!=key:movements.append({'day':d['day'],'date':d['date'],**row});prior[bid]=key
 for k,b in d['battleRecords'].items():
  if b['battleRegion'] in regions:battles[k]=b
 for k,op in d['operationRecords'].items():
  if op['opPost'] in ['us_dc_militia','cs_cmd_manassas','cs_cmd_harpers_ferry']:operations[k]=op
write('movements-private.json',movements);write('battles-private.json',battles);write('operations-private.json',operations)
write('commands.json',[{'index':x.get('i'),'line':x['line'],'before':x.get('before'),'after':x.get('after'),'signingDate':date(x['before'])} for x in transcript if x['line']])
write('rule-entries-private.json',[e for e in entries if 'cs_cmd_' in str(e) or 'st_gov_virginia' in str(e)])
selected=[p for p in papers if p['subjectId'] in regions or p['authorPost']=='us_dc_militia' or any(c.get('region') in ['richmond','manassas'] for c in p['claims'])]
write('papers-public.json',selected)
write('trace-summary.json',{**summary,'battles':None,'date':date(summary['day']),
 'dailyHashes':[{'day':d['day'],'hash':d['hash']} for d in daily],
 'allStoneStoresUnknown':all(d['forceBlockStates']['fb_us_dc_militia']['fbStoresMilli'] is None for d in daily),
 'noManassasBattle':not any(b['battleRegion']=='manassas' for d in daily for b in d['battleRecords'].values()),
 'initialStone':next(b for b in world['start']['forceBlocks'] if b['id']=='fb_us_dc_militia'),
 'rules':{k:world['map']['rules'][k] for k in ['stores','operations'] if k in world['map']['rules']}})
source=root/'docs/audit/s41-evidence/replay.json';replay=read(source)
def comparable(p):
 return {'author':p['author'],'authorPost':p['authorPost'],'day':p['day'],'receivedDay':p['receivedDay'],'type':p['type'],
 'subtype':p.get('subtype'),'subjectKind':p['subjectKind'],'subjectId':p['subjectId'],'hour':p.get('hour'),
 'claims':[{k:c.get(k) for k in ['kind','region','value','token','confidence']} for c in p['claims']]}
byid={p['id']:p for p in papers};comparisons=[]
for changed in replay['changedPapers']:
 after=changed['after'];found=byid.get(changed['id'])
 if after is None:ok=found is None
 else:ok=found is not None and comparable(found)==comparable(after)
 comparisons.append({'id':changed['id'],'match':ok})
write('s41-public-comparison.json',{'source':str(source.relative_to(root)),'sha256':sha(source),'comparisons':comparisons,
 'allMatch':all(x['match'] for x in comparisons),'scope':'All 31 changed S41 records, not an independent comparison of all 2163 papers; opening bulletin excluded from daily delivery capture.'})
old=Path(r'C:/Pyrrhic/sprint-play/art-masters/S39/advance/last-turn-reply.json')
if old.exists():
 s=read(old)['snapshot'];allp=[p for t in s['history'] for d in t['days'] for p in d['reports']]+s['morning']['view']['reports']
 unique={p['id']:p for p in allp}
 oldselected=[p for p in unique.values() if any(c.get('region')=='richmond' and c['kind'] in ['arrived','battle-phase','battle-result','own-losses','missing','captured','casualties'] for c in p['claims'])]
 write('s39-papers-public.json',{'source':str(old),'sourceSha256':sha(old),'papers':oldselected,'scope':'Read-only retained public desk snapshot; no old-pin private trace claimed.'})
checks={'day':summary['day'],'commands':summary['commandCount'],'turns':summary['turns'],'controlHashes':summary['observerControlEveryCommand'],
 's41ChangedPapersMatch':all(x['match'] for x in comparisons),'rawFiles':[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(raw.glob('*.json'))]}
write('audit.json',checks)
print(json.dumps({k:v for k,v in checks.items() if k!='rawFiles'}))
assert summary['day']==148 and summary['commandCount']==86 and summary['turns']==44
assert checks['s41ChangedPapersMatch']
