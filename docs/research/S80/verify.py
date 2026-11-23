"""Audit S80's research packet, without fetching sources or applying pack data.

python docs/research/S80/verify.py --external-sources --baseline runs/s80/baseline.json
"""
from pathlib import Path
import argparse
import csv
import datetime
import hashlib
import json
import re

D = Path(__file__).resolve().parent
ROOT = D.parents[2]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--external-sources', action='store_true')
    parser.add_argument('--baseline', type=Path)
    args = parser.parse_args()
    checks = []

    def check(condition, label):
        checks.append({'check': label, 'pass': bool(condition)})

    def read_csv(name):
        with (D / name).open(encoding='utf-8', newline='') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            check(all(None not in r and all(v is not None for v in r.values()) for r in rows), name + ' rectangular CSV')
            return reader.fieldnames, rows

    header, people = read_csv('people.csv')
    live_header, live = read_csv_relative(ROOT / 'packs/union-1861/source/world/people.csv')
    check(header == live_header and len(header) == 28, 'exact live cast header')
    check(len(people) == 1, 'one person draft')
    row = people[0]
    check(row['id'] == 'anderson_richard_h' and row['id'] not in {r['id'] for r in live}, 'new unique Richard identity')
    check(row['name'] == 'Richard Heron Anderson', 'expanded identity')
    for field in ['born', 'died']:
        datetime.date.fromisoformat(row[field])
    check(row['notes'].startswith('[S80 research draft; never loaded]'), 'draft status explicit')
    judgments = ['competence', 'nerve', 'experience', 'reputation', 'boldness', 'candour', 'regard', 'values', 'traits', 'regard_others', 'practices']
    check(all(not row[k] for k in judgments + ['bloc', 'bloc_cites']), 'all unsupported judgments and blocs unknown')
    check(all(not row[k] for k in ['faction', 'kind', 'ranks']), 'opening service and rank uncertainty preserved')
    service_fields = ['service_government', 'resigned_on', 'resignation_side', 'resignation_bloc', 'resignation_cites']
    check(all(not row[k] for k in service_fields), 'no new in-window 0101 choice')
    _, held = read_csv('judgments.csv')
    check({r['cell'] for r in held} == set(judgments) and len(held) == len(judgments), 'every judgment HOLD accounted for')
    check(all(r['disposition'] == 'HOLD' and not r['proposed_value'] for r in held), 'no default ratings')
    _, facts = read_csv('facts.csv')
    _, services = read_csv('service-history.csv')
    check(all(r['person'] == row['id'] for r in held + facts + services), 'all packet records join one person')
    check(len({r['field'] for r in facts}) == len(facts), 'unique fact observations')
    fact_map = {r['field']: r for r in facts}
    check(fact_map['born']['status'] == 'PROPOSED_WITH_CONFLICT', 'contrary birth year retained')
    check(fact_map['opening_service']['status'] == 'HOLD', 'opening current commission held')
    check(fact_map['brigadier_appointment']['status'] == fact_map['brigadier_alternative']['status'] == 'CONFLICTING_OBSERVATION', 'promotion observations not flattened')
    resignations = [r for r in services if r['event'].startswith('US Army resignation')]
    check(len(resignations) == 1 and resignations[0]['on'] == '1861-03-03' and 'pre-start' in resignations[0]['scope'], 'register resignation outside scenario window')
    for r in services:
        datetime.date.fromisoformat(r['on'])
    manifest = json.loads((D / 'source-reading.json').read_text(encoding='utf-8'))
    sources = manifest['sources']
    locators = {(r['key'], r['page']) for r in sources}
    check(len(locators) == len(sources), 'unique source page locators')
    for r in facts + services + [row]:
        citations = r.get('citations', r.get('cites', r.get('sources', '')))
        check(bool(citations), 'nonempty factual citations: ' + r.get('field', r.get('event', 'people')))
        for c in citations.split(';'):
            match = re.fullmatch(r'(NEW:S80-[A-Z0-9-]+) p(\d+)', c.strip())
            check(match is not None and match.groups() in locators, 'source resolves: ' + c)
    receipt = json.loads((D / 'reading-receipt.json').read_text(encoding='utf-8'))
    check({(r['key'], r['page'], r['sha256']) for r in receipt['verified_pages']} ==
          {(r['key'], r['page'], r['sha256']) for r in sources}, 'reading receipt exactly covers admitted pages')
    artifacts = {}
    for r in sources:
        check(r['image_inspected'] and bool(r['reading_scope']) and bool(r['url']), 'scoped reading receipt: ' + r['key'] + ' p' + r['page'])
        artifacts[r['artifact']] = r['sha256']
        if 'rendered_from' in r:
            parent = r['rendered_from']
            artifacts[parent['artifact']] = parent['sha256']
    if args.external_sources:
        for path, expected in artifacts.items():
            p = Path(path)
            check(p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest() == expected, 'external artifact hash: ' + path)
    preserved = 0
    if args.baseline:
        baseline = json.loads(args.baseline.read_text(encoding='utf-8'))
        for path, expected in baseline['files'].items():
            p = ROOT / path
            check(p.is_file() and hashlib.sha256(p.read_bytes()).hexdigest() == expected, 'original tracked file unchanged: ' + path)
            preserved += 1
    runtime = ROOT / 'runs/s80/runtime.json'
    if runtime.is_file():
        for path, expected in json.loads(runtime.read_text(encoding='utf-8'))['read_only_S79'].items():
            check(hashlib.sha256(Path(path).read_bytes()).hexdigest() == expected, 'read-only S79 register unchanged: ' + path)
    report = dict(passed=all(r['pass'] for r in checks), checks=len(checks),
                  failed=[r for r in checks if not r['pass']], people=len(people), facts=len(facts),
                  judgment_holds=len(held), source_pages=len(sources),
                  external_hashes=len(artifacts) if args.external_sources else 0,
                  original_tracked_files=preserved)
    (D / 'validation.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report))
    return 0 if report['passed'] else 1


def read_csv_relative(path):
    with path.open(encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        return reader.fieldnames, list(reader)


if __name__ == '__main__':
    raise SystemExit(main())
