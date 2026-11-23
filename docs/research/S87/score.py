"""Headless document arithmetic only; never invokes a model run or live scorer."""
import collections, csv, hashlib, json, pathlib, re, subprocess
R=pathlib.Path.cwd(); P=R/'docs/research/S87'; O=R/'runs/s87'
REF=pathlib.Path('C:/Pyrrhic/sprint-july/runs/s82/references')
def dump(p,x): p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def table(p, rows):
    with p.open('w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n'); w.writeheader(); w.writerows(rows)
inputs={}
def read(name):
    p=REF/name; inputs[str(p)]={'sha256':digest(p),'bytes':p.stat().st_size}
    return json.loads(p.read_text(encoding='utf-8'))
obs=read('union-1861-observations.json'); state=read('union-1861-final-state.json')
trace=read('union-1861-trace.json'); summary=read('union-1861-summary.json'); criteria=read('union-1861-criteria.json')
decisions=read('union-1861-decisions.json')
frozen=json.loads((P/'s84-reference-inputs.json').read_text())
for name in ['union-1861-final-state.json','union-1861-trace.json','union-1861-observations.json','union-1861-decisions.json']:
    assert inputs[str(REF/name)]['sha256']==frozen['inputs'][str(REF/name).replace('/','\\')]['sha256']
archive={}
policy_blob=subprocess.check_output(['git','show',frozen['commit']+':packs/union-1861/situations/fort_monroe_arrivals.json'])
policy=json.loads(policy_blob)
assert policy['faction']=='union'
for day in trace:
    for c in day.get('changes',{}).get('orderResponses',[]):
        for r in [c.get('before'),c.get('after')]:
            if r: archive[(c['id'],r['respActual'],r['respDay'])]=r
for k,r in state['orderResponses'].items(): archive[(k,r['respActual'],r['respDay'])]=r
rows=[]
for x in obs['responses']:
    r=archive[(x['key'],x['actual'],x['day'])]
    issuer=r['respOrder'].split('.')[2]
    assert issuer in ['lincoln_abraham','davis_jefferson'] or r['respOrder']=='m.80.policy.fort_monroe_arrivals.approve_holding'
    side=policy['faction'] if issuer=='policy' else 'union' if issuer=='lincoln_abraham' else 'confederate'
    rows.append({'side':side,
      'actor':r['respPerson'],'role':r['respRole'],'kind':r['respKind'],'actual':r['respActual'],
      'day':r['respDay'],'post':r['respPost'],'order':r['respOrder'],'call_id':r.get('respCallId',''),
      'declared':r['respDeclared']})
assert len(rows)==208
table(P/'all-response-diagnostics.csv',rows)
groups=collections.Counter((x['side'],x['role'],x['kind'],x['actual']) for x in rows)
relay=[]
for (_,_,_),r in sorted(archive.items()):
    if r['respRole']!='relay': continue
    issuer=r['respOrder'].split('.')[2]
    relay.append({'side':'union' if issuer=='lincoln_abraham' else 'confederate',
      'actor':r['respPerson'],'role':r['respRole'],'kind':r['respKind'],'actual':r['respActual'],
      'day':r['respDay'],'post':r['respPost'],'order':r['respOrder'],'call_id':r.get('respCallId',''),
      'declared':r['respDeclared']})
assert len(relay)==11
table(P/'relay-response-diagnostics.csv',relay)
groups.update((x['side'],x['role'],x['kind'],x['actual']) for x in relay)
table(P/'raw-counts.csv',[dict(zip(['side','role','kind','actual','count'],[*k,v])) for k,v in sorted(groups.items())])
s84=list(csv.DictReader((P/'s84-pushback-responses.csv').open(encoding='utf-8')))
chosen=[x for x in rows if x['role']=='addressee' and x['actual'] in ['slow_walk','comply_with_reservations']]
assert len(chosen)==len(s84)==34
assert {(x['order'],x['actor'],x['actual'],str(x['day'])) for x in chosen}=={(x['order'],x['actor'],x['actual'],x['response_day']) for x in s84}

# Row content is authored from pages read, not inferred from model outputs.
cases=[]
def case(id,band,actor,matter,act,dates,citation,status,reason,role='addressee',side='union'):
    cases.append(dict(id=id,band=band,side=side,actor=actor,role=role,matter=matter,act=act,
      dates=dates,unit='one named actor / role / matter / act',source_pages=citation,
      source_status=status,classification_reason=reason))
case('N3-10','slow_walk','scott_winfield','Pickens reinforcement','alleged delay before dispatch','1861-03-05/12','ORN I-4 p.90; Welles, Galaxy 11(1) pp.95-97','held','Order dated 12 March is read; elapsed interval alone does not prove deliberate slow walking.')
case('N3-11','relay_holds','unnamed_adjutant_general_staff','Pickens dispatch','dispatch preparation delay','1861-03-12/31','Welles, Galaxy 11(1) pp.95-97','held','Welles attributes departure delay to detailing companies; no named reluctant intermediary. Accepted 0109 floor remains binding.',role='relay')
case('N3-27','relay_holds','blair_francis_p','Harney relief','discretionary delivery','1861-05-16/30','Lincoln Complete Works II pp.47-48; OR I-III pp.374,381','excluded','Lincoln authorized withholding; accepted 0109 reclassification.',role='entrusted_delivery')
case('N3-06','filter_holds','seward_william_h','commissioners recognition request','outward refusal delivery','1861-03-15/04-08','Richardson I pp.85-88','excluded','Outward diplomatic handling; accepted 0109 reclassification.',role='outward_diplomacy')
case('X-03','filter_holds','unnamed_war_department_official','extra New York regiments','wait direction reported by Morgan','1861-04-19','OR III-I p.87','excluded','Reported direction about troop acceptance, not an incoming report held before Lincoln. Remains a 0109 upper-case citation pending lead ruling.',role='troop_acceptance')
for suffix,act,dates,pages in [
 ('a','initial evacuation assurance reported by Campbell','1861-03-15','93,95-96'),
 ('b','renewed assurance after non-evacuation reported by Campbell','1861-03-20/22','94'),
 ('c','notice-before-supply statement reported by Campbell','1861-04-01','94'),
 ('d','reassurance in response to alarm reported by Campbell','1861-04-07','94-95')]:
    case('N3-07'+suffix,'trims','seward_william_h','Sumter assurances to Campbell',act,dates,
      'Richardson I pp.'+pages+'; Burlingame II ch.22 pp.2349-2351,2392','excluded_trim_disclosure_held',
      'Outward communication attested by Campbell; specific disclosure to Lincoln unresolved; no incoming-report claim cut identified.',role='originator')
case('X-04','reservations','morgan_edwin_d','April militia requisition','clarification and undertaking','1861-04-15/18','OR III-I pp.72,85','eligible_qualified','Nearest-type classification [I]: clarification plus undertaking; not proof of private reluctance. Undertaking on printed p.85 corrects the catalogue p.86 locator.')
case('N3-26','reservations','harney_william_s','Missouri peace/security mandate','Price-Harney agreement','1861-05-21','OR I-III pp.374-376','eligible_qualified','Nearest-type reinterpretation [I], not a literal comply_with_reservations response token.')
case('N3-33','plan_objections','patterson_robert','holding Johnston in the Valley','alternative course pending long-term men','1861-07-16','OR I-II pp.166-167','eligible','Patterson challenges active operations and proposes conditional alternative.')
case('N3-34','slow_walk','patterson_robert','holding Johnston in the Valley','delay/declining advance after fresh direction','1861-07-17/18','OR I-II pp.167-169','eligible_qualified','Telegrams and reported conduct establish delay [I]; do not infer covert intent, strength or a personality score.')
case('N3-14','plan_objections','seward_william_h','administration policy and its direction','Some Thoughts memorandum','1861-04-01','Lincoln Complete Works II pp.29-30','eligible','Substantive proposed change of course; not generic refusal.')
table(P/'case-register.csv',cases)

catalogue=(R/'docs/research/2026-11-16-numbers-and-facts-1861.md').read_text(encoding='utf-8')
disposition=[]
for line in catalogue.splitlines():
    if not re.match(r'\| (N3-\d\d|X-\d\d) \|',line): continue
    c=[v.strip() for v in line.split('|')[1:-1]]; id=c[0]
    linked=[x for x in cases if x['id']==id or (id=='N3-07' and x['id'].startswith(id))]
    disposition.append({'catalogue_id':id,'catalogue_actor_claim':c[2],'catalogue_type_claim':c[4],
      'catalogue_date_claim':c[5],'catalogue_source_claim':c[7] if id.startswith('N3') else c[6],
      'reading_status':'freshly_read_relevant_pages' if linked else 'inherited_claim_not_freshly_verified',
      'new_register_rows':';'.join(x['id'] for x in linked),
      'effect':'see source-bounded rows; no band apply' if linked else 'retain original claim and hold; no new historical assertion or floor waiver'})
assert len(disposition)==41 and len({x['catalogue_id'] for x in disposition})==41
table(P/'catalogue-disposition.csv',disposition)

matches=[]
patterson_commands=[{'issued_day':x['day'],'command':cmd} for x in decisions
  if x.get('seat')=='seat:lincoln_abraham'
  for cmd in x.get('answer',{}).get('commands',[])
  if cmd.get('cmd')=='order' and cmd.get('to')=='us_dept_pennsylvania']
assert len(patterson_commands)==2 and all(x['command']['goal']['posture']=='hold' for x in patterson_commands)
for c in cases:
    if not c['source_status'].startswith('eligible'): continue
    candidates=[]
    for r in rows:
        if (r['side'],r['actor'],r['role'])!=(c['side'],c['actor'],c['role']): continue
        if c['id']=='X-04' and r['kind']=='call' and r['day']==41 and not r['call_id']: candidates.append(r)
        if c['id'] in ['N3-33','N3-34'] and r['kind']=='goal' and r['post']=='us_dept_pennsylvania': candidates.append(r)
        # Harney's specific agreement and Seward's memorandum have no matching
        # response. Consult on Sumter is not Seward's later policy memorandum.
    wanted={'reservations':'comply_with_reservations','slow_walk':'slow_walk','plan_objections':'object'}[c['band']]
    qualified=[r for r in candidates if r['actual']==wanted]
    matches.append({'case':c['id'],'band':c['band'],'wanted_actual':wanted,
      'verdict':'matched' if qualified else 'exposure_mismatch' if c['id'] in ['N3-33','N3-34'] else 'mismatch' if candidates else 'not_observed',
      'count':min(1,len(qualified)),'candidates':candidates,
      'limits':'Hand-scored bounded matter; day 41 identifies April mobilisation provenance, not an imposed response date. Patterson receives hold goals, not the recorded fresh Winchester attack/demonstration direction. No operation-delay inference from a response alone.',
      'nearby_commands':patterson_commands if c['id'] in ['N3-33','N3-34'] else []})
assert sum(x['count'] for x in matches)==1
matched={(r['order'],r['actor']) for x in matches if x['verdict']=='matched' for r in x['candidates'] if r['actual']==x['wanted_actual']}
table(P/'unmatched-s84-responses.csv',[r|{'reason':'no eligible registered act in this bounded rereading; retained diagnostic'} for r in chosen if (r['order'],r['actor']) not in matched])
dump(P/'score.json',{'reference_commit':frozen['commit'],'reference_final_hash':summary['finalHash'],
  'policy':'Proposed named-case coverage; not an implemented acceptance score or a full replacement catalogue.',
  's84_rows':len(s84),'all_observed_addressee_responses':len(rows),
  'raw_counts': [{'side':k[0],'role':k[1],'kind':k[2],'actual':k[3],'count':v} for k,v in sorted(groups.items())],
  'accepted_s82_pushback':criteria['pushback'],'matches':matches,
  'matched_by_band':{b:sum(x['count'] for x in matches if x['band']==b) for b in ['relay_objections','relay_holds','filter_holds','trims','reservations','slow_walk','plan_objections']},
  'unmatched_s84_rows':len(chosen)-len(matched),'no_pass_declared':True})
dump(P/'reference-receipts.json',inputs)
dump(P/'policy-provenance.json',{'commit':frozen['commit'],
  'path':'packs/union-1861/situations/fort_monroe_arrivals.json',
  'sha256':hashlib.sha256(policy_blob).hexdigest(),'faction':policy['faction'],
  'use':'One policy response has no issuer name in its order ID; read owning situation faction rather than infer actor allegiance.'})
print(json.dumps({'reference':summary['finalHash'],'observed_addressees':len(rows),'s84_rows':len(s84),'cases':len(cases),'catalogue_rows':len(disposition),'matched':len(matched),'unmatched_s84':len(chosen)-len(matched)}))
