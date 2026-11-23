"""Compare retained S98 receipts and the one S102 capture; no simulation."""
from pathlib import Path
import csv, collections, json

D=Path(__file__).parent
R=Path('runs/s102')
REF=R/'corrected'
def read(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def write(name,value): (D/(name+'.json')).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def rows(name):
    with (D/'inputs'/name).open(encoding='utf-8',newline='') as f: return list(csv.DictReader(f))
def identity(r): return (r['respOrder'],r['respPerson'],r['respRole'],r['respDay'])

base=read(R/'baseline/0-union-1861-summary.json')
before=read(R/'baseline/0-union-1861-raw.json')
after=read(REF/'0-union-1861-raw.json')
summary=read(REF/'0-union-1861-summary.json')
profiles={p['id']:p for p in read('packs/union-1861/pack.json')['rules']['recruitment']['callProfiles']}
fallback=read(D/'application.json')['fallback']
oldraw=read('docs/audit/s98-evidence/raw-pushback-diagnostics.json')['after']
oldhashes=read('docs/audit/s98-evidence/union-1861-hashes.json')
oldcounters=read('docs/audit/s98-evidence/union-1861-counters.json')
assert all(a['hash']==b['after'] for a,b in zip(base['turns'],oldhashes))
assert base['liveness']==[r['after'] for r in oldcounters]
assert {r['id']:r for r in before['diagnostics']}=={r['id']:r for r in oldraw}

def cause(key):
    group=key.split('.')[0]
    return {
      'recruitment':'Direct: sourced per-call values change willingness, actual rung and accepted/delayed quotas; ordinary musters, expiry and renewal follow. No material capacity term or trait changes.',
      'orders':'Calls and their relays read their attached values; changed replies and levies change later reports/orders through the existing received-information and command paths.',
      'messages':'Changed call answers, levies, dispositions and field activity produce different ordinary dispatches; routing rules and route weights are unchanged.',
      'reports':'Changed answers and field activity produce different received reports; reporting and filtering rules are unchanged.',
      'plans':'Changed actual raised forces and received field picture change the existing plan/operation path. No goal, planner, discretion or scoring rule changed.',
      'planner':'Changed actual raised forces and received field picture alter existing draft candidates and contributing-term counts; no planner weight was fitted.',
      'operations':'Changed forces and plans alter ordinary assembly, support, movement and completion; no date, forced arrival or new operation instruction was introduced.',
      'combat':'Changed raised forces, assembly and movements alter battle participants and outcomes through the unchanged combat rules; no strength injected.',
      'movement':'Different levies, transfers and field plans produce different physical legs and joins; route and headquarters rules are unchanged.',
      'control':'Different physical forces and battles change control under the unchanged contest/occupation rules.',
      'map':'Derived-map counts follow changed forces, control and supply; no map data changed.',
      'forces':'Changed muster volumes and physical force paths alter stores, attrition and enlistment consequences; force rules and sourced original strengths are unchanged.',
      'people':'Different actual answers and subsequent service change ordinary grievances/disposition/person events. Starting cast and hidden draws are unchanged.',
      'ladder':'Different actual responses and ordinary field consequences alter the existing disposition ladder; ladder rules are unchanged.',
      'situations':'Different received answers and physical field consequences change existing causal situation tests. The only situation edit selects call terms; no premise, threshold or date was added.',
      'verbs':'Different raised forces and received replies change ordinary inquiries/transfers/answers; verb grammar and values are unchanged.',
      'politics':'Different received answers and subsequent field acts change ordinary political consequences; no political rule or value changed.',
      'seats':'Different received replies and field requests change ordinary menus/attention/decisions; no attention or initiative rule changed.',
    }.get(group,'Downstream of changed call willingness, accepted levies and ordinary field/received-paper consequences; this mechanic implementation and its parameters are unchanged.')+' [I] Causal path of this combined change, not an isolated additive intervention.'

comparisons={}
for index,pack in [(0,'union-1861'),(1,'testbed')]:
    current=read(REF/f'{index}-{pack}-summary.json')
    hashes=read(f'docs/audit/s98-evidence/{pack}-hashes.json')
    counters=read(f'docs/audit/s98-evidence/{pack}-counters.json')
    hh=[dict(day=a['turn'],before=b['after'],after=a['hash'],changed=a['hash']!=b['after'],cause=('S102: the call paper now carries its own recorded terms; response/levy consequences persist in subsequent State. No starting people draw or non-call rule changed.' if a['hash']!=b['after'] else 'unchanged')) for a,b in zip(current['turns'],hashes)]
    cc=[]
    for a,b in zip(current['liveness'],counters):
        assert a['mechanic']==b['mechanic']
        changed=a!=b['after']
        olddaily=base['daily'] if pack=='union-1861' else []
        changed_days=[day['day'] for day,old in zip(current['daily'],olddaily) if day['fires'].get(a['mechanic'],0)!=old['fires'].get(a['mechanic'],0)]
        cc.append(dict(mechanic=a['mechanic'],before=b['after'],after=a,changed=changed,changedFireDays=changed_days,magnitudeNote='Daily summaries retain fire counts only. An empty fire-day difference does not assert unchanged magnitudes; exact total magnitudes and raw battle/event records are retained.',cause=cause(a['mechanic']) if changed else 'unchanged'))
    write(pack+'-hashes',hh); write(pack+'-counters',cc)
    comparisons[pack]=dict(hashes=len(hh),changedHashes=sum(r['changed'] for r in hh),firstChangedDay=next((r['day'] for r in hh if r['changed']),None),counterRows=len(cc),changedCounters=sum(r['changed'] for r in cc),initialHash=current['initialHash'],finalHash=current['finalHash'],rejections=current['rejections'],replay=current['replay'],resume=current['resume'])

oldcoverage=read('docs/audit/s98-evidence/coverage.json')
coverage=read(REF/'0-union-1861-coverage.json')
write('coverage',coverage)
write('coverage-changes',[dict(id=a['id'],before=b,after=a,changed=a!=b) for a,b in zip(coverage['rows'],oldcoverage['rows'])])
write('raw-pushback-diagnostics',dict(before=oldraw,after=coverage['diagnostics'],countsBefore=oldcoverage['counts'],countsAfter=coverage['counts'],mechanicsBefore=oldcoverage['mechanics'],mechanicsAfter=coverage['mechanics'],historicalCredit='None from raw counts; 0112 row matching only.'))

bmap={identity(r):r for r in before['responses']}
amap={identity(r):r for r in after['responses']}
response_changes=[dict(identity=k,before=bmap.get(k),after=amap.get(k),cause=('Attached per-call value reading; all structural/material clauses are unscored.' if (amap.get(k) or bmap[k])['respKind']=='call' else cause('orders'))) for k in sorted(bmap.keys()|amap.keys()) if bmap.get(k)!=amap.get(k)]
write('response-changes',response_changes)

def call_id(r, raw):
    if r.get('respCallId') is not None: return r['respCallId']
    diagnostic=next((d for d in raw['diagnostics'] if d['order']==r['respOrder'] and d['actor']==r['respPerson'] and d['role']==r['respRole'] and d['day']==r['respDay']),{})
    if diagnostic.get('termDays')==90 and (r.get('respPost') or '').startswith('st_gov_'): return 'us_apr15_'+r['respPost'].removeprefix('st_gov_')
    return None

def answers(raw,actor,ids,stage):
    out=[]
    for r in raw['responses']:
        if r['respKind']!='call' or r['respRole']!='addressee' or r['respPerson']!=actor: continue
        ident=call_id(r,raw)
        if ident not in ids: continue
        p=profiles.get(ident)
        out.append(dict(callId=ident,callTerms=fallback if stage=='before' else dict(boldness=fallback['boldness'],**{k:p[k] for k in ['id','sourceProfile','honours','offends','callProvenance','conditions','materialDemand']}),response=r))
    return out

registers=read('packs/union-1861/pushback-union.json')['rows']+read('packs/union-1861/pushback-confederate.json')['rows']
governors=[]
for row in rows('governor-qualifications.csv'):
    reg=next(r for r in registers if r['id']==row['register_id'])
    actor=reg['actor']
    ids=row['answers_to'].split(';')
    if ids==['us_apr15']: ids=['us_apr15_'+actor.split('_')[0]] # resolved below from actual addressed post, never historical reconstruction
    if row['answers_to']=='us_apr15':
        ids=list({call_id(r,before) for r in before['responses'] if r['respKind']=='call' and r['respPerson']==actor and r.get('respCallId') is None})
    entry=dict(id=row['register_id'],actor=actor,status=reg['status'],historicalReply=row,before=answers(before,actor,ids,'before'),after=answers(after,actor,ids,'after'),coverageBefore=next((r for r in oldcoverage['rows'] if r['id']==row['register_id']),None),coverageAfter=next((r for r in coverage['rows'] if r['id']==row['register_id']),None))
    if not entry['before'] and not entry['after']:
        entry['limitation']='No corresponding model troop-call answer. Non-call matter, source hold, excluded proposal or unissued later demand stays explicit; no response or rung is invented.'
    if row['register_id']=='C09': entry['limitation']='The separate SC July 1 call remains unissued and its original unread. Reserve responses are context, not a substitute for that demand.'
    if row['register_id']=='C04':
        entry['transferDiagnosticsBefore']=[r for r in before['responses'] if r['respPerson']==actor and r['respKind']=='verb:transfer']
        entry['transferDiagnosticsAfter']=[r for r in after['responses'] if r['respPerson']==actor and r['respKind']=='verb:transfer']
        entry['limitation']='Not a troop call. Ordinary transfer replies are diagnostics only: the model still lacks the permanent-service consent and regimental-integrity terms of this matter. No call profile is substituted.'
    governors.append(entry)
write('governor-answers',governors)
callresponses=[r for r in after['responses'] if r['respKind']=='call' and r['respRole']=='addressee']
assert all(next(t['respTermAmount'] for t in r['respTerms'] if t['respTermName']=='capacity')==0 for r in callresponses)
write('reservation-diagnostics',dict(
    rungCounts=dict(collections.Counter(r['respActual'] for r in callresponses)),
    rungsAndWillingness=[dict(actor=r['respPerson'],callId=call_id(r,after),day=r['respDay'],actual=r['respActual'],declared=r['respDeclared'],willingness=r['respWillingness'],terms=r['respTerms'],conditions=r['respConditions']) for r in callresponses],
    reservationWindow='Unchanged 0..9. No fitted threshold. Exact historical contractual qualifications are not executed by value terms.',
    allCallCapacityTermsZero=True))

bands=[]
for p in sorted(REF.glob('*-bands.json')):
    saved=read(p)
    current=read(p.with_name(p.name.replace('-bands','-summary')))
    failures={f['mechanic']:f for f in saved['failures']}
    for key,band in saved['bands'].items():
        observed=next(r for r in current['liveness'] if r['mechanic']==key)
        bands.append(dict(run=saved['name'],mechanic=key,beforeBand=band,observation=observed,failure=failures.get(key),cause=cause(key) if key in failures else 'within existing band'))
write('liveness-review',bands)
write('checkpoints',read(REF/'0-union-1861-checkpoints.json'))

def strength(raw):
    state=raw['finalState']; known=0; unknown=0
    for b in state['forceBlockStates'].values():
        if state['departmentFactions'].get(b['fbDepartment'])!='confederate': continue
        if any(l['lotMen'] is None for l in b['fbLots']): unknown+=1
        else: known+=sum(l['lotMen'] for l in b['fbLots'])
    return dict(known=known,unknownBlocks=unknown)
comparisons['coverageBefore']=dict(collections.Counter(r['verdict'] for r in oldcoverage['rows']))
comparisons['coverageAfter']=dict(collections.Counter(r['verdict'] for r in coverage['rows']))
comparisons['strengthBefore']=strength(before); comparisons['strengthAfter']=strength(after)
comparisons['baselineReceipt']=dict(all148S98HashesExact=True,all162CountersExact=True,all256RawDiagnosticsExact=True,baselineTrace='runs/s102/baseline',priorReplayResume='S98 retained evidence reused; not rerun in targeted baseline trace')
comparisons['failedBands']=sum(r['failure'] is not None for r in bands)
comparisons['governorDispositions']=len(governors)
write('comparison',comparisons)

def strength_origins(raw):
    out=collections.Counter()
    for b in raw['finalState']['forceBlockStates'].values():
        if raw['finalState']['departmentFactions'].get(b['fbDepartment'])!='confederate' or any(l['lotMen'] is None for l in b['fbLots']): continue
        for lot in b['fbLots']:
            service=lot.get('lotService') or {}
            origin=service.get('enlCallId') or service.get('enlSourceAct') or service.get('enlCall') or 'initial.forces'
            out[origin]+=lot['lotMen']
    return out
sb,sa=strength_origins(before),strength_origins(after)
strength_rows=[dict(origin=k,before=sb[k],after=sa[k],delta=sa[k]-sb[k],cause='Changed accepted call quotas and subsequent ordinary movement/combat losses; original source strength is unchanged. These are model surviving known men, not a historical return.') for k in sorted(sb.keys()|sa.keys())]
assert sum(r['before'] for r in strength_rows)==comparisons['strengthBefore']['known']
assert sum(r['after'] for r in strength_rows)==comparisons['strengthAfter']['known']
write('strength-reconciliation',strength_rows)
write('battles',dict(before=before['finalState']['battleRecords'],after=after['finalState']['battleRecords']))
write('call-rung-changes',[dict(identity=r['identity'],before=r['before'],after=r['after'],changedTerms={name:dict(before=next((t['respTermAmount'] for t in (r['before'] or {}).get('respTerms',[]) if t['respTermName']==name),None),after=next((t['respTermAmount'] for t in (r['after'] or {}).get('respTerms',[]) if t['respTermName']==name),None)) for name in ['values','temperament','regard','deterrence','capacity','disposition','grievances']}) for r in response_changes if (r['after'] or r['before'])['respKind']=='call'])
print(json.dumps(comparisons))
