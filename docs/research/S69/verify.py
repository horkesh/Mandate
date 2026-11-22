"""Focused S69 research checks; never applies data or fetches sources.

python docs/research/S69/verify.py --external-sources --baseline runs/s69/baseline.json
The baseline is the opening tracked-file hash receipt, retained in ignored runs/.
"""
from pathlib import Path
import argparse, collections, csv, datetime, hashlib, json, re

D = Path(__file__).resolve().parent
ROOT = D.parents[2]

def read_csv(name):
    with (D / name).open(encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        assert all(None not in x and all(v is not None for v in x.values()) for x in rows), name
        return reader.fieldnames, rows

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--external-sources', action='store_true')
    parser.add_argument('--baseline', type=Path)
    args = parser.parse_args()
    expected = next(csv.reader((ROOT / 'packs/union-1861/source/world/people.csv').open(encoding='utf-8')))
    header, people = read_csv('people.csv')
    held_header, held = read_csv('people-held.csv')
    assert header == held_header == expected and len(header) == 28
    assert len(people) == 25 and len(held) == 4
    assert len({x['id'] for x in people}) == 25
    assert {x['name'] for x in held} == {'Carson', 'Meem', 'Williams', 'Wynkoop'}
    assert all(not x['id'] for x in held)
    assert not any('cocke' in x['id'] for x in people)
    judgments = ['competence','nerve','experience','reputation','boldness','candour','regard','values','traits','bloc','bloc_cites','regard_others','practices']
    assert all(not x[k] for x in people + held for k in judgments)
    for x in people:
        for k in ['born', 'died']:
            value = x[k]
            if not value:
                continue
            assert re.fullmatch(r'\d{4}(?:-\d{2}(?:-\d{2})?)?', value), (x['id'], k)
            datetime.date.fromisoformat(value + ('-01-01' if len(value) == 4 else '-01' if len(value) == 7 else ''))
        assert x['faction'] in ['', 'union', 'confederate']
        assert x['kind'] in ['', 'general', 'naval_officer', 'other']
        assert x['sources'] and x['notes'].startswith('[S69 research draft; never loaded]')
    services = read_csv('service-history.csv')[1]
    assert len(services) == 11
    with_service = [x for x in people if x['resigned_on']]
    assert [x['id'] for x in with_service] == ['elzey_arnold']
    assert with_service[0]['resigned_on'] == '1861-04-25'
    assert not with_service[0]['service_government']
    assert with_service[0]['resignation_side'] == 'confederate'
    assert not next(x for x in people if x['id'] == 'terrett_george_h')['resigned_on']
    assert not next(x for x in people if x['id'] == 'howard_oliver_o')['resigned_on']
    audit = read_csv('commander-audit.csv')[1]
    assert len(audit) == 29
    assert collections.Counter(x['disposition'] for x in audit) == {'DRAFT':25,'IDENTITY_HOLD':4}
    _, facts = read_csv('facts.csv')
    assert len(facts) == 175
    assert [x for x in facts if x['status'] == 'KNOWN_NONE'] == [next(x for x in facts if x['person']=='early_jubal_a' and x['field']=='faction')]
    _, ratings = read_csv('judgments.csv')
    assert len(ratings) == 275 and all(x['disposition']=='HOLD' and not x['proposed_value'] for x in ratings)
    source_index = json.loads((D / 'source-index.json').read_text(encoding='utf-8'))
    keys = {(x['key'], x['page']) for x in source_index}
    assert len(keys) == len(source_index)
    readings = json.loads((D / 'read-passages.json').read_text(encoding='utf-8'))
    assert keys <= {(x['key'], x['page']) for x in readings}
    cited = set()
    for path in D.glob('*.csv'):
        cited.update(re.findall(r'NEW:S69-([A-Z0-9-]+) p(\d+)', path.read_text(encoding='utf-8')))
    assert cited == keys, {'unresolved':sorted(cited-keys),'uncited':sorted(keys-cited)}
    assert all(x['url'].startswith('https://') and x['status']=='ok' for x in source_index)
    external_count = 0
    if args.external_sources:
        for x in source_index:
            assert hashlib.sha256(Path(x['path']).read_bytes()).hexdigest() == x['sha256'], (x['key'],x['page'])
            external_count += 1
    preserved = 0
    if args.baseline:
        before = json.loads(args.baseline.read_text(encoding='utf-8'))
        for path, digest in before.items():
            assert hashlib.sha256((ROOT / path).read_bytes()).hexdigest() == digest, path
            preserved += 1
    print(json.dumps({'verdict':'PASS','people':25,'identity_holds':4,'facts':175,'judgment_holds':275,'service_events':11,'cited_pages':len(keys),'external_artifacts_checked':external_count,'original_tracked_files_unchanged':preserved},indent=2))

if __name__ == '__main__':
    main()
