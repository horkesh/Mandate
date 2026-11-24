"""Publish the one retained S152 capture. Never runs or changes the simulation."""
from pathlib import Path
import collections
import csv
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'runs/s152/measurement'
OUT = ROOT / 'docs/audit/s152-evidence/capture'
OUT.mkdir(parents=True, exist_ok=True)


def read(name):
    return json.loads((RAW / (name + '.json')).read_text(encoding='utf-8'))


def put(name, value):
    (RAW / (name + '.json')).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


events = [json.loads(line) for line in (RAW / 'causal-events.jsonl').open(encoding='utf-8')]
summary, final, papers = read('summary'), read('final-state'), read('instrument-requests')
assert summary['rejections'] == 0
assert summary['replay']['matches'] and summary['resume']['matches'] and summary['resume']['savedLogReplays']
assert read('new-zeros') == [], 'new zero goes to the lead before the hook'
allocations = list(final.get('allocationRecords', {}).values())


def messages(kind, origins):
    return [e for e in events if e['kind'] == kind and e['value']['msgOrigin'] in origins]


def evidence_for(paper):
    dispatches = [e for e in events if e['kind'] == 'dispatch' and
                  (e['value'].get('msgOrder') or {}).get('orderAllocation') == paper['id']]
    origins = {e['value']['msgOrigin'] for e in dispatches}
    records = [r for r in allocations if r['allocPaper'] == paper['id']]
    lots = {lot for r in records for lot in r['allocLots']}
    history = [e for e in events if e['kind'] == 'allocation_receipt' and e['value']['allocPaper'] == paper['id']]
    gates = [e for e in events if e['kind'] == 'instrument_gate' and e['key'] == paper['id']]
    journeys = [e for e in events if e['kind'] == 'lot_place' and e['key'] in lots]
    answers = [e for e in events if e['kind'] == 'allocation_answer' and e['value']['respOrder'] in origins]
    if records and all(r['allocStatus'] == 'received' for r in records):
        unmet = None
    elif records:
        unmet = {'day': records[0]['allocDay'], 'reasons': records[0]['allocReasons'] or ['receiving_command_receipt_pending'],
                 'basis': 'actual recorded allocation answer/state, not a hypothetical gate'}
    elif dispatches:
        unmet = {'reasons': ['no_allocation_record'], 'basis': 'dispatch and paper-receipt events retained separately'}
    else:
        gate = gates[0]['value'] if gates else None
        reasons = (['date_not_reached'] if gate is None else
                   ['sending_post_unheld'] if gate['sender'] is None else
                   ['receiving_post_unheld'] if gate['receiver'] is None else
                   ['issue_authority_unavailable'] if not gate['authority'] else ['no_logged_issue_choice'])
        unmet = {'reasons': reasons, 'basis': 'first eligible after-tick diagnostic; no claim of an unlogged seat decision', 'gate': gate}
    return {'paper': paper, 'dispatches': dispatches, 'paperReceipts': messages('paper_receipt', origins),
            'answers': answers, 'allocationHistory': history, 'finalAllocations': records,
            'selectedLots': sorted(lots), 'lotJourneys': journeys, 'gateChanges': gates,
            'firstUnmetPrerequisite': unmet}


fates = [evidence_for(p) for p in papers]
assert len(fates) == 25 and sum(p['paper']['id'].startswith('s152_') for p in fates) == 9
put('instrument-fates', fates)
onward = []
for p in json.loads((ROOT / 'packs/union-1861/pack.json').read_text(encoding='utf-8'))['rules']['onwardAssignments']:
    dispatches = [e for e in events if e['kind'] == 'dispatch' and
                  ((e['value'].get('msgOrder') or {}).get('orderAssignment') or {}).get('paper') == p['id']]
    origins = {e['value']['msgOrigin'] for e in dispatches}
    onward.append({'paper': p, 'dispatches': dispatches, 'paperReceipts': messages('paper_receipt', origins),
                   'firstUnmetPrerequisite': None if dispatches else 'no_logged_eligible_assignment; no forced selection'})
put('onward-fates', onward)
cycles = []
for request in final.get('forceRequests', {}).values():
    identity = request['freqId']
    assignments = {a['fansAssignment'][0] for a in request['freqAnswers'] if 'fansAssignment' in a}
    records = [r for r in allocations if r['allocPaper'] in assignments]
    origins = {identity, *(r['allocOrder'] for r in records)}
    wires = []
    for e in events:
        if e['kind'] not in ['dispatch', 'paper_receipt']:
            continue
        m = e['value']
        report = m.get('msgReport') or {}
        order = m.get('msgOrder') or {}
        if m['msgOrigin'] in origins or report.get('reportAnswers') in origins or report.get('reportForceRequest') == identity or order.get('orderAllocation') in assignments:
            wires.append(e)
    lots = {lot for r in records for lot in r['allocLots']}
    cycles.append({'request': request, 'wires': wires, 'allocations': records,
                   'lotJourneys': [e for e in events if e['kind'] == 'lot_place' and e['key'] in lots]})
put('request-cycles', cycles)
armies = read('army-totals')
focus = {'us_dept_northeastern_virginia', 'us_dept_pennsylvania', 'cs_cmd_manassas', 'cs_cmd_harpers_ferry'}
put('army-focus', [a for a in armies if a['army'] in focus])
composition = list(csv.DictReader((RAW / 'army-lots.csv').open(encoding='utf-8', newline='')))
status = {'baseline': 'b2a0c513512bf54397c0deafac50cfa5b919d16150c5a9c9c5c733fb93eb2eb4',
          'referenceCaptures': 1, 'finalHash': summary['finalHash'], 'days': summary['finalDay'],
          'rejections': summary['rejections'], 'replay': summary['replay'], 'resume': summary['resume'],
          'armyRows': len(armies), 'lotKindRows': len(composition), 'instruments': len(fates), 'onward': len(onward),
          'requestCycles': len(cycles), 'requestAnswers': sum(len(c['request']['freqAnswers']) for c in cycles),
          'battles': len(read('battles')), 'changedBattles': len(read('changed-battles')), 'newZeros': [],
          'bands': len(read('all-bands')), 'gateFailures': len(read('gate-failures')),
          'timing': 'not measured locally; lead hosted baseline absent at fresh pre-capture read',
          'method': 'read-only after-tick observations in the one forward run; same-day substeps may be net effects. Gates are labelled for the following day, never historical receipt assertions.'}
put('measurement-status', status)
inventory, published = [], []
for p in sorted(RAW.iterdir()):
    if not p.is_file():
        continue
    row = {'path': p.relative_to(ROOT).as_posix(), 'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
    inventory.append(row)
    if p.name.startswith('state-') or p.name in ['final-state.json', 'save-60.json']:
        continue
    dest = OUT / p.name
    shutil.copyfile(p, dest)
    assert hashlib.sha256(dest.read_bytes()).hexdigest() == row['sha256']
    published.append({**row, 'published': dest.relative_to(ROOT).as_posix()})
for name, value in [('raw-inventory', inventory), ('published-inventory', published)]:
    (OUT / (name + '.json')).write_text(json.dumps(value, indent=2) + '\n', encoding='utf-8')
print(json.dumps(status))
