import csv,datetime,hashlib,json,pathlib,re,shutil,collections
root=pathlib.Path.cwd(); out=root/'docs/research/_pushback';out.mkdir(parents=True,exist_ok=True)
world=json.loads((root/'packs/union-1861/data/world.json').read_text(encoding='utf-8'))
names={r['id']:r['name'] for r in csv.DictReader((root/'packs/union-1861/source/world/people.csv').open(encoding='utf-8'))}
situations={j['id']:j for p in (root/'packs/union-1861/situations').glob('*.json') for j in [json.loads(p.read_text(encoding='utf-8'))]}
terms=world['rules']['people']; scenarios=[];rows=[];jsonrows=[];joins=[];failures=[]
for seed in range(1861,1869):
 run=json.loads((root/f'runs/s37/seed-{seed}.json').read_text())
 log=json.loads((root/f'runs/s37/orders-{seed}.json').read_text())
 assert run['summary']['finalHash']==log['hash']
 for r in run['responses']:
  sent=int(re.match(r'm\.(\d+)\.',r['respOrder'])[1]);kind=r['respKind'];post=r['respPost']
  candidates=[]
  for entry in log['log']:
   if entry['day']!=sent:continue
   c=entry['command']
   if (kind=='call' and c['cmd']=='call' and c['to']==post and c.get('callId')==r.get('respCallId')) or (kind=='verb:transfer' and c['cmd']=='transfer' and c['from']==post) or (kind=='goal' and c['cmd']=='order' and c['to']==post):
    candidates.append({'sent':sent,'seat':entry['seat'],'command':c,'source':'command log'})
   if kind=='call' and c['cmd']=='decide':
    sit=situations[c['situation']]
    for option in sit.get('options',[]):
     if option['id'] not in c['options']:continue
     for call in option.get('calls',[]):
      if call['to']==post:
       candidates.append({'sent':sent,'seat':entry['seat'],'command':{'cmd':'call',**call,'bypass':False},'source':f"situation {sit['id']}, option {option['id']}"})
  if not candidates and kind=='call' and not r.get('respCallId'):
   # These orders are issued by situations.historyDefault inside tick, not a seat.
   # Only one Union historical-default option in this pack has calls. Its delivery
   # day is independently in each observed origin id; do not invent a log entry.
   assert sent==41 and '.lincoln_abraham.' in r['respOrder']
   for sit in situations.values():
    if sit['faction']!='union':continue
    for option in sit.get('options',[]):
     if option['id'] not in (sit.get('historicalDefault') or {}).get('options',[]):continue
     for call in option.get('calls',[]):
      if call['to']==post:
       candidates.append({'sent':sent,'seat':'seat:lincoln_abraham','command':{'cmd':'call',**call,'bypass':False},'source':f"kernel history-default: {sit['id']}/{option['id']} (no seat log entry)"})
  if len(candidates)!=1:
   failures.append({'seed':seed,'order':r['respOrder'],'candidates':candidates});continue
  payload=candidates[0]
  if kind=='call':directive={**world['rules']['recruitment']['callTerms'],'required':0}
  elif kind=='verb:transfer':
   term=next(t for t in terms['verbs']['orderValues'] if t['order']==kind)
   directive={'boldness':500,'ownBest':500,'honours':term['honours'],'offends':term['offends'],'required':0}
  else:directive={k:v for k,v in next(t for t in terms['goalTerms'] if t['goal']=='advance').items() if k!='goal'}|{'required':0}
  vector={t['respTermName']:t['respTermAmount'] for t in r['respTerms']}
  assert sum(vector.values())==r['respWillingness']
  date=(datetime.date(1861,3,5)+datetime.timedelta(days=r['respDay'])).isoformat()
  row={'seed':seed,'day':r['respDay'],'date':date,'person':r['respPerson'],'name':names[r['respPerson']],
   'post':post,'kind':kind,'order':r['respOrder'],'call_id':r.get('respCallId',''),
   'actual':r['respActual'],'declared':r['respDeclared'],'willingness':r['respWillingness'],
   **{k:vector.get(k,'') for k in ['values','temperament','regard','deterrence','capacity','disposition','grievances','judgement','practice']},
   'edit_after_noted_redraft':str(r['noteBearingEdit']).lower(),'issued_day':sent,
   'request':json.dumps(payload,ensure_ascii=False,separators=(',',':')),
   'directive_terms':json.dumps(directive,ensure_ascii=False,separators=(',',':')),
   'reasons':json.dumps(r['respReasons'],separators=(',',':')),'conditions':json.dumps(r['respConditions'],separators=(',',':'))}
  rows.append(row);jsonrows.append({'seed':seed,'date':date,**r,'sentCommand':payload,'directiveTerms':directive})
  joins.append({'seed':seed,'order':r['respOrder'],'source':payload['source']})
 scenarios.append({k:run[k] for k in ['seed','days','counts','allEdits','noteEdits','allNotes']})
if failures:
 (root/'runs/s37/join-failures.json').write_text(json.dumps(failures,indent=2)+'\n',encoding='utf-8')
 raise RuntimeError(f'{len(failures)} ambiguous or missing order joins; see join-failures.json')
assert len(rows)==331
with (out/'s37-responses.csv').open('w',encoding='utf-8',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
(out/'s37-responses.json').write_text(json.dumps({'scope':'Kernel diagnostic truth; never a seat view. One row per observed addressee order/person/rung.','startDate':'1861-03-05','dayConvention':'start date is day 0, as history-run.dayOfDate; S35 owns console request-day mapping','seeds':scenarios,'responses':jsonrows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for source,target in [('extract.ts','s37-extract.ts'),('extract-orders.ts','s37-orders.ts')]:
 t=(root/'runs/s37'/source).read_text(encoding='utf-8').replace("'../../packages/","'../../../packages/")
 (out/target).write_text(t,encoding='utf-8')
verification={'rows':len(rows),'allTermsSum':True,'allOrdersJoined':True,'finalHashesMatch':8,
 'orderSources':dict(collections.Counter(j['source'] for j in joins)),
 'seedCounts':scenarios,'actualCounts':dict(collections.Counter(r['actual'] for r in rows))}
(root/'runs/s37/dossier-verification.json').write_text(json.dumps(verification,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in verification.items() if k!='seedCounts'},indent=2))
