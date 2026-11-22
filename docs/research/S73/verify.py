"""Verify S73 research coverage, retained sources, held drafts and preservation.

Run from any directory: python docs/research/S73/verify.py
Optional starting-tree receipt: --baseline runs/s73/baseline.json
This verifies record integrity; it does not replace the lead's historical review.
"""
from pathlib import Path
import argparse
import csv
import hashlib
import json
import re

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]

def read(name):
    return json.loads((HERE / name).read_text(encoding='utf-8'))

def table(name):
    with (HERE / name).open(encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--baseline', type=Path)
    args = parser.parse_args()
    checks = 0

    def require(ok, message):
        nonlocal checks
        checks += 1
        if not ok:
            raise AssertionError(message)

    coverage = read('coverage.json')
    modeled = table('modeled-papers.csv')
    carriers = table('carriers.csv')
    filters = table('filters.csv')
    snapshots = read('pack-snapshots.json')
    drafts = read('latency-dispatches.partial-drafts.json')['drafts']
    receipt = read('source-receipt.json')
    pages = read('pages-read.json')
    require(len(modeled) == coverage['uniqueSituations'] == 70, 'situation coverage changed')
    require(len(carriers) == coverage['carrierObservations'] == 29, 'carrier count')
    require(len(filters) == coverage['filterRecords'] == 11, 'filter count')
    require(len(drafts) == coverage['partialDrafts'] == 38, 'partial draft count')
    require(sum(x['category'] == 'notice' for x in modeled) == coverage['noticeCount'] == 51, 'notice count')
    require(sum(x['category'] == 'decision' for x in modeled) == coverage['decisionCount'] == 19, 'decision count')
    require({x['model_id'] for x in modeled} == {x['id'] for x in snapshots}, 'an inspected context is missing')
    require(len(snapshots) == coverage['snapshotCount'], 'snapshot count')
    require({'pickens_refusal_received', 'pierpont_aid_requested', 'butler_at_fort_monroe'} <= {x['model_id'] for x in modeled}, 'cross-tree additions missing')
    carrier_ids = {x['id'] for x in carriers}
    require(len(carrier_ids) == len(carriers), 'duplicate carrier id')
    for row in modeled:
        require(bool(row['disposition']) and bool(row['hold']), 'unaccounted context: '+row['model_id'])
        require(set(filter(None, row['carrier_records'].split(';'))) <= carrier_ids, 'broken carrier reference')
        require(row['earliest_as_authored'] <= '1861-07-31', 'context outside upper window')
    for row in snapshots:
        require(bool(re.fullmatch('[0-9a-f]{64}', row['sha256'])), 'invalid snapshot hash')
        require('sprint-july' not in row['path'].lower(), 'excluded worktree snapshot')
        if row['tree'] == 'pushback':
            require(sha(Path(row['path'])) == row['sha256'], 'local model changed since inventory: '+row['id'])
    source_ids = {x['id'] for x in receipt['sources']}
    read_pages = {(x['source'], x['printedPage']) for x in pages['pages']}
    for row in carriers + filters:
        require(row['source'] in source_ids, 'source missing: '+row['source'])
        require(bool(row['pages']), 'citation missing')
        for page in row['pages'].split(';'):
            if page.isdigit():
                require((row['source'], int(page)) in read_pages, 'cited page not in read receipt')
    for source in receipt['sources']:
        p = Path(source['path'])
        require(p.exists() and p.stat().st_size == source['bytes'], 'source absent or changed size')
        require(sha(p) == source['sha256'], 'source hash changed: '+source['id'])
        require(bool(source['url'].startswith('https://')), 'source URL missing')
    for item in pages['pages'] + pages['images']:
        require(sha(item['path']) == item['sha256'], 'retained page/image changed: '+item['path'])
    scenario = json.loads((ROOT/'packs/union-1861/data/scenarios/march_1861.json').read_text(encoding='utf-8'))
    post_ids = {x['id'] for x in scenario['posts'] + scenario['temporaryPosts']}
    for draft in drafts:
        row = draft['latency.dispatches']
        require(set(row) == {'to', 'carriers', 'terms', 'source'}, 'S53 outer shape')
        require(set(row['terms']) == {'boldness', 'honours', 'offends'}, 'S53 terms shape')
        require(row['terms']['boldness'] is None, 'unassessed delivery demand made numeric')
        require(row['terms']['honours'] == row['terms']['offends'] == [], 'unassessed values filled')
        require(row['to'] is None or row['to'] in post_ids, 'unknown destination not marked null')
        require(draft['observation'] in carrier_ids and len(draft['holds']) >= 5, 'draft lacks factual record/holds')
        require('HELD UNAPPLIED' in draft['status'], 'draft presented as applied/admissible')
        require(all(set(x) == {'post', 'route'} and x['route'] in ['courier', 'ship'] for x in row['carriers']), 'S53 carrier shape')
        require(len(row['carriers']) == (2 if draft['observation'] == 'C16' else 1), 'companions serialized')
    require(not any(x['observation'] in ['C05', 'C24', 'C25', 'C29'] for x in drafts), 'undelivered/comparative paper drafted as delivery')
    note = ROOT/'docs/research/2026-11-23-S73-dispatch-carriers-and-filters.md'
    for p in [note, *HERE.glob('*')]:
        if not p.is_file():
            continue
        raw = p.read_bytes()
        require(not raw.startswith(b'\xef\xbb\xbf'), 'BOM: '+str(p))
        raw.decode('utf-8')
    for label, target in re.findall(r'\[([^\]]+)\]\(([^)]+)\)', note.read_text(encoding='utf-8')):
        if not target.startswith(('http:', 'https:')):
            require((note.parent/target).exists(), 'broken local link: '+label)
    preserved = None
    if args.baseline:
        base = json.loads(args.baseline.read_text(encoding='utf-8'))
        for name, expected in base['files'].items():
            require(sha(ROOT/name) == expected, 'starting tracked file changed: '+name)
        preserved = len(base['files'])
    print(json.dumps({'passed': True, 'checks': checks, 'modeledContexts': len(modeled),
        'carriers': len(carriers), 'heldPartialDrafts': len(drafts), 'filters': len(filters),
        'sourceArtifacts': len(receipt['sources']), 'printedPagePassages': len(pages['pages']),
        'images': len(pages['images']), 'preservedStartingFiles': preserved}, indent=2))

if __name__ == '__main__':
    main()
