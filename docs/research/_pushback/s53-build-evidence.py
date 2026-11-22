from pathlib import Path
import hashlib, json

root = Path('runs/s53/calibration')
pairs = []
for seed in range(1861, 1869):
    paths = [root / f'{seed}-{v}.json' for v in ['baseline', 'deterrence-1000']]
    a, b = [json.loads(p.read_text(encoding='utf-8')) for p in paths]
    assert a['days'] == b['days'] == 148
    assert a['rejections'] == b['rejections'] == 0
    for r in [a,b]:
        assert len(r['hashes']) == len(r['daily']) == 148
        for x in r['responses']:
            resp=x['response']
            assert sum(t['respTermAmount'] for t in resp['respTerms']) == resp['respWillingness']
    count_a, count_b = [{c['id']: c for c in r['counts']} for r in [a,b]]
    counts=[]
    for key in count_a:
        old,new=count_a[key],count_b[key]
        assert (old['min'],old['max']) == (new['min'],new['max'])
        counts.append({'id':key,'min':old['min'],'max':old['max'],'baseline':old['observed'],'candidate':new['observed']})
    daily_changes=[]
    for old,new in zip(a['daily'],b['daily']):
        assert old['day']==new['day']
        changes=[{'mechanic':k,'baseline':old['fires'].get(k,0),'candidate':new['fires'].get(k,0)}
                 for k in sorted(set(old['fires']) | set(new['fires'])) if old['fires'].get(k,0)!=new['fires'].get(k,0)]
        if changes:daily_changes.append({'day':old['day'],'changes':changes})
    hash_changes=[{'day':old['day'],'baseline':old['hash'],'candidate':new['hash']}
                  for old,new in zip(a['hashes'],b['hashes']) if old['hash']!=new['hash']]
    old_res,new_res=[{x['key']:x['response'] for x in r['responses']} for r in [a,b]]
    response_changes=[]
    for key in sorted(set(old_res) | set(new_res)):
        old,new=old_res.get(key),new_res.get(key)
        if old==new:continue
        old_terms={} if old is None else {t['respTermName']:t['respTermAmount'] for t in old['respTerms']}
        new_terms={} if new is None else {t['respTermName']:t['respTermAmount'] for t in new['respTerms']}
        terms=[k for k in sorted(set(old_terms)|set(new_terms)) if old_terms.get(k)!=new_terms.get(k)]
        direct=old is not None and new is not None and old['respDay']==new['respDay'] and terms==['deterrence']
        response_changes.append({'key':key,'baseline':old,'candidate':new,'changedTerms':terms,
          'cause':'changed deterrence contribution; other contributions equal' if direct else 'downstream response, timing or context change after the calibration [I]'})
    def pushbacks(r):return [x for x in r['responses'] if x['response']['respRole']=='addressee' and x['response']['respActual'] in ['comply_with_reservations','slow_walk']]
    old_live,new_live=[{x['mechanic']:x for x in r['liveness']} for r in [a,b]]
    live_changes=[{'mechanic':k,'baseline':old_live[k],'candidate':new_live[k]} for k in sorted(old_live) if old_live[k]!=new_live[k]]
    pairs.append({'seed':seed,'counts':counts,'baselinePushbackResponses':pushbacks(a),'candidatePushbackResponses':pushbacks(b),
      'baselineHash':a['finalHash'],'candidateHash':b['finalHash'],'changedDailyHashes':hash_changes,'changedDailyCounters':daily_changes,
      'changedLiveness':live_changes,'responseChanges':response_changes,'baselineScores':a['scores'],'candidateScores':b['scores'],
      'replayChecks':{'baseline':a['replayChecks'],'candidate':b['replayChecks']},
      'rawEvidence':[{'path':str(p).replace('\\','/'),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]})
output={'status':'measurement only; proposed for lead ruling; live pack unchanged','candidate':{'deterrenceWeight':1000},
        'fixed':{'temperamentWeight':400,'complyAt':10},'bandsChanged':False,'pairs':pairs}
Path('runs/s53/calibration-evidence.json').write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')
for p in pairs:
    c={r['id']:(r['baseline'],r['candidate']) for r in p['counts']}
    print(p['seed'],c,'changed hashes',len(p['changedDailyHashes']),'counter days',len(p['changedDailyCounters']))

# Portable compact trace; the raw evidence above retains complete original records.
def compact_response(x):
    if x is None: return None
    return [x['respPerson'],x['respPost'],x['respKind'],x['respRole'],x['respDay'],x['respActual'],x['respDeclared'],x['respWillingness'],[[t['respTermName'],t['respTermAmount']] for t in x['respTerms'] if t['respTermAmount'] != 0],x['respConditions'],x.get('respCallId')]
output['responseTupleColumns']=['person','post','kind','role','day','actual','declared','willingness','nonzeroContributions','conditions','callId']
output['zeroContributionMeaning']='All omitted contribution amounts are zero. Complete named terms/reasons and command logs remain in each raw evidence file, whose hash is retained.'
output['causeCodes']={'direct':'Only the deterrence contribution changed; other contributions equal.','downstream':'Response, timing or context changed after the calibration [I].'}
for p in output['pairs']:
    for name in ['baselinePushbackResponses','candidatePushbackResponses']:
        p[name]=[[x['key'],compact_response(x['response'])] for x in p[name]]
    for x in p['responseChanges']:
        x['cause']='direct' if x['cause'].startswith('changed deterrence') else 'downstream'
        for name in ['baseline','candidate']: x[name]=compact_response(x[name])
Path('runs/s53/calibration-portable.json').write_text(json.dumps(output,separators=(',',':'))+'\n',encoding='utf-8')
