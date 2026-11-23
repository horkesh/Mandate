"""Score frozen S82 evidence under the S88 proposal, without running the game.

This research script is not imported by a production scorer. It conservatively
marks missing advice content unresolved and never equates a consultation's
cooperation rung with the substantive advice given.
"""
import collections, csv, hashlib, json, pathlib
R=pathlib.Path(__file__).resolve().parents[3]; P=R/'docs/research/S88'; OLD=R/'docs/research/S87'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,x): p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def table(p,rows):
    with p.open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
receipts=[]
def read(p,kind='json'):
    receipts.append(dict(path=str(p),sha256=sha(p),bytes=p.stat().st_size))
    if kind=='csv': return list(csv.DictReader(p.open(encoding='utf-8')))
    return json.loads(p.read_text(encoding='utf-8'))
acts=read(P/'union-register.csv','csv')+read(P/'confederate-register.csv','csv')
schedule=read(P/'coverage-proposal.csv','csv')
responses=read(OLD/'all-response-diagnostics.csv','csv')+read(OLD/'relay-response-diagnostics.csv','csv')
s84=read(OLD/'s84-pushback-responses.csv','csv')
previous=read(OLD/'score.json')
measurement=read(OLD/'s84-measurement-evidence.json')
S84=pathlib.Path('C:/Pyrrhic/sprint-research-military')
calls=read(S84/'runs/s84/call-compact.json')
junction=read(S84/'runs/s84/junction.json')
source_s84=read(S84/'docs/research/S84/measurement-evidence.json')
assert source_s84==measurement
calls_by_id={c['id']:c for c in calls}
assert len(responses)==219 and len(s84)==34
for i,r in enumerate(responses):
    r['event_id']=f'{r["order"]}|{r["actor"]}|{r["role"]}|{r["actual"]}|{r["day"]}'
    r['rung']=r['actual']
assert len({r['event_id'] for r in responses})==219
groups=collections.Counter((r['side'],r['actor'],r['role'],r['kind'],r['actual'],r['declared']) for r in responses)
table(P/'raw-response-diagnostics.csv',responses)
table(P/'raw-counts.csv',[dict(zip(['side','actor','role','kind','actual','declared','count'],[*k,n])) for k,n in sorted(groups.items())])

# Matter keys below are declared independently from the response outcome. Dates
# identify source provenance; response day is not a matching acceptance test.
call_map={'C01':'cs_mar09_georgia','C02':'cs_apr22_absolute_georgia',
 'C03':'cs_apr22_absolute_louisiana','C05':'cs_apr22_absolute_tennessee',
 'C07':'cs_jun30_reserve_virginia',
 'C10':'cs_jun30_reserve_georgia','C11':'cs_jun30_reserve_louisiana',
 'C12':'cs_jul01_extra_georgia'}
matches=[]
for a in acts:
    if a['status'] not in ['eligible','qualified_source']: continue
    same=[r for r in responses if (r['side'],r['actor'],r['role'])==(a['side'],a['actor'],a['role'])]
    candidates=[]; eligible=[]; context=[]
    verdict='not_observed'; reason='No act in retained evidence on this bounded matter; unrelated same-actor responses cannot substitute.'
    if a['id'] in call_map:
        key=call_map[a['id']]; assert key in calls_by_id
        candidates=[r for r in same if r['call_id']==key]
        assert candidates,(a['id'],key)
        eligible=[r for r in candidates if r['actual']=='comply_with_reservations']
        verdict='matched_qualified' if eligible else 'mismatch'
        reason='Same named governor/addressee and identified requisition; reservation rung is only a nearest-type mechanism match, not proof of the precise historical qualification or motive.'
        context=[{k:v for k,v in calls_by_id[key].items() if k not in ['levies','answers']}]
    elif a['id']=='U39':
        # Same April presidential militia requisition established by S87; no
        # call_id is attached to this original situation-driven requisition.
        candidates=[r for r in same if r['kind']=='call' and not r['call_id']]
        assert len(candidates)==1
        eligible=[r for r in candidates if r['actual']=='comply_with_reservations']
        verdict='matched_qualified' if eligible else 'mismatch'
        reason='Same April militia requisition, the S87 qualified Morgan match. Day 41 is published provenance, not a required historical day. Question plus undertaking is a nearest-type classification.'
    elif a['model_matter']=='sumter_consult':
        candidates=[r for r in same if r['kind']=='verb:consult' and '.sumter_garrison.' in r['order']]
        if candidates:
            verdict='unresolved'
            reason='Retained response evidence shows participation in consultation, not delivered advice content or the exact proposed course. comply is not proof of agreement. One consultation cannot satisfy several distinct historical acts; no allocation or credit made.'
    elif a['id'] in ['U32','U33','U34']:
        candidates=[r for r in same if r['kind']=='goal' and r['post']=='us_dept_pennsylvania']
        context=next(x['nearby_commands'] for x in previous['matches'] if x['case']=='N3-33')
        assert len(context)==2 and all(x['command']['goal']['posture']=='hold' for x in context)
        verdict='exposure_mismatch'
        reason='S87 records hold lower_valley / hold harpers_ferry goals, not the historical depot-change request or fresh Winchester attack/demonstration instruction. No claim about behaviour under an unissued historical demand.'
    elif a['id']=='C15':
        candidates=[r for r in same if r['kind']=='goal']
        assert candidates and all('m.143.' in r['order'] for r in candidates)
        verdict='exposure_mismatch'
        reason='S84 junction evidence identifies this as the July Manassas offensive order, not June Harpers Ferry garrison/Valley defense instructions. Same commander and a runtime object rung are insufficient.'
        context=[dict(day=d['day'],command=c) for d in junction['decisions'] for c in d.get('answer',{}).get('commands',[])
                 if c.get('cmd')=='order' and c.get('to')=='cs_cmd_harpers_ferry' and d['day'] in [142,143]]
        assert len(context)==2 and all(x['command']['goal']['objective']=='manassas' and x['command']['goal']['posture']=='take' for x in context)
    elif a['id']=='C04':
        candidates=[r for r in same if r['kind']=='verb:transfer']
        verdict='unresolved' if candidates else 'not_observed'
        reason='Generic retained transfer responses do not identify the April Virginia volunteer organization and consent terms. Do not match an arbitrary transfer or April readiness call by actor/date alone.'
    elif a['id']=='C09':
        reason='S84/S87 call evidence contains South Carolina reserve/readiness calls, not this later two-regiment requisition. Reserve slow_walk cannot satisfy the later-pair reservation.'
    count=min(1,len(eligible))
    matches.append(dict(case_id=a['id'],side=a['side'],band=a['band'],historical_status=a['status'],
      verdict=verdict,count=count,candidate_event_ids=';'.join(r['event_id'] for r in candidates),
      matched_event_id=eligible[0]['event_id'] if eligible else '',reason=reason,
      context=json.dumps(context,ensure_ascii=False,separators=(',',':'))))

used=[x['matched_event_id'] for x in matches if x['count']]
assert len(used)==len(set(used)) # One actual act cannot satisfy two historical acts.
table(P/'case-matches.csv',matches)
coverage=[]
for row in schedule:
    chosen=[m for m in matches if (m['side'],m['band'])==(row['side'],row['band']) and m['historical_status']=='eligible']
    assert len(chosen)==int(row['proposed_required'])
    coverage.append(dict(side=row['side'],band=row['band'],required=len(chosen),
      matched=sum(m['count'] for m in chosen),unresolved=sum(m['verdict']=='unresolved' for m in chosen),
      mismatched=sum(m['verdict']=='mismatch' for m in chosen),
      exposure_mismatch=sum(m['verdict']=='exposure_mismatch' for m in chosen),
      not_observed=sum(m['verdict']=='not_observed' for m in chosen),
      qualified_source_extra=int(row['qualified_count']),
      result='no_required_case' if not chosen else 'unmet' if sum(m['count'] for m in chosen)<len(chosen) else 'covered_qualified'))
table(P/'coverage-score.csv',coverage)
for row in s84:
    event=f'{row["order"]}|{row["actor"]}|{row["role"]}|{row["actual"]}|{row["response_day"]}'
    assert event in {r['event_id'] for r in responses}
    row['coverage_case']=next((m['case_id'] for m in matches if m['matched_event_id']==event),'')
table(P/'s84-response-disposition.csv',s84)
dump(P/'input-receipts.json',receipts)
raw_reservations={side:sum(r['actual']=='comply_with_reservations' and r['role']=='addressee' and r['side']==side for r in responses) for side in ['union','confederate']}
raw_slow_walks={side:sum(r['actual']=='slow_walk' and r['role']=='addressee' and r['side']==side for r in responses) for side in ['union','confederate']}
assert raw_reservations=={'union':11,'confederate':5} and raw_slow_walks=={'union':9,'confederate':9}
dump(P/'score.json',dict(reference_commit=previous['reference_commit'],reference_final_hash=previous['reference_final_hash'],
  scope='Frozen S84/S87 evidence only; no July/perf3 worktree reads, no simulation, production scorer or band change.',
  raw_events=len(responses),raw_addressees=208,raw_relays=11,s84_response_rows=34,
  raw_reservations=raw_reservations,raw_slow_walks=raw_slow_walks,
  filter_telemetry=measurement['filter_telemetry'],coverage=coverage,
  matched_cases=[m['case_id'] for m in matches if m['count']],
  primary_obligations=sum(x['required'] for x in coverage),qualified_source_extras=3,
  qualified_matches=sum(x['count'] for x in matches),
  unmatched_s84_responses=sum(not x['coverage_case'] for x in s84),
  verdict_counts=dict(collections.Counter(m['verdict'] for m in matches)),
  binding_position='0111 retains old obligations except trims 0-3. Raw 16 reservations and 18 slow walks still fail existing ceilings; no acceptance pass declared.',
  no_pass_declared=True))
print(json.dumps(dict(required=sum(x['required'] for x in coverage),matched=used,verdicts=dict(collections.Counter(m['verdict'] for m in matches)),unmatched_s84=sum(not x['coverage_case'] for x in s84))))
