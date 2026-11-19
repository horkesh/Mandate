"""Focused R62 coverage, date-bound, regeneration and preservation checks."""
from pathlib import Path
import collections
import csv
import hashlib
import io
import json
import os
import re
import subprocess

R = Path(__file__).resolve().parents[4]
D = R / 'docs/research/_resource'
E = D / 'evidence-r62'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    original = subprocess.check_output(['git', 'show', 'HEAD:docs/research/_resource/dating.csv'], cwd=R).decode('utf-8')
    before = list(csv.DictReader(io.StringIO(original)))
    after = list(csv.DictReader((D / 'dating.csv').open(encoding='utf-8', newline='')))
    assert len(before) == len(after) == 1716
    cells = json.loads((D / 'evidence-r52/cells.json').read_text(encoding='utf-8'))
    expected = collections.Counter((c['cell'], x['source'] + ' ' + (x['at'] or '')) for c in cells for x in c['cites'])
    actual = collections.Counter((x['cell'], x['citation']) for x in after[:1705])
    assert actual == expected
    assert before[1705:] == after[1705:], 'R45 supplements changed'
    assert [(x['cell'], x['citation']) for x in before] == [(x['cell'], x['citation']) for x in after]
    assert len({x['cell'] for x in after[:1705]}) == 1017
    counts = collections.Counter('unresolved' if x['date'] == 'not found' else 'exact' if re.fullmatch(r'\d{4}-\d{2}-\d{2}', x['date']) else 'bound' for x in after[:1705])
    assert counts == {'unresolved': 1293, 'exact': 157, 'bound': 255}
    changes = json.loads((E / 'date-changes.json').read_text(encoding='utf-8'))
    assert len(changes) == 10
    assert collections.Counter(x['cell'].split('/')[0] for x in changes) == {'anderson_robert': 5, 'bates_edward': 3, 'mcclellan_george_b': 2}
    groups = collections.defaultdict(list)
    for old, new in zip(before, after):
        assert list(new) == ['cell', 'citation', 'date', 'source of the date']
        assert new['source of the date']
        if re.fullmatch(r'\d{4}-\d{2}-\d{2}', old['date']):
            groups[(old['citation'], old['date'])].append((old, new))
    audit = []
    for (citation, date), pairs in groups.items():
        new = pairs[0][1]
        assert all(x[1]['date'] == new['date'] for x in pairs)
        if date != new['date']:
            basis = new['source of the date']
            verdict = 'bound: multiple independently dated documents'
        elif citation.startswith('NH-CW '):
            verdict = 'retain: March29 opinion group; cited pages stop before the March30 Stuart letter'
            basis = 'Complete Works VI pp227-230; evidence-r62/source-reading.json'
        elif citation.startswith('OR I-1-p166'):
            verdict = 'retain: February6 letter; earlier letters are mentioned/quoted without separate document headings'
            basis = 'OR I-1 p166; evidence-r62/source-reading.json'
        elif citation.startswith('ORN I-4 '):
            verdict = 'retain: April23 Paulding report continues from p289 through p290'
            basis = 'ORN I-4 pp289-290; evidence-r62/source-reading.json'
        elif citation.startswith('JCCS '):
            verdict = 'retain: single sitting date on the selected page'
            basis = 'R52 jccs-page-extracts.json and session-heading readings reused'
        elif citation.startswith('NH 3'):
            verdict = 'retain: selected documentary quotation, rather than adjacent narrative'
            basis = pairs[0][0]['source of the date']
        else:
            verdict = 'retain: selected letter, speech or diary entry; neighboring documents do not replace its heading'
            basis = pairs[0][0]['source of the date']
        audit.append({'citation': citation, 'before': date, 'after': new['date'], 'rows': len(pairs), 'verdict': verdict, 'evidence': basis})
    assert len(audit) == 99 and sum(x['rows'] for x in audit) == 178
    (E / 'exact-day-audit.json').write_text(json.dumps(audit, indent=2) + '\n', encoding='utf-8')
    outputs = [D / 'dating.csv', D / 'evidence-r52/dating-counts.json']
    hashes = [sha(p) for p in outputs]
    build = subprocess.run(['python', str(D / 'tools/r52-dating.py')], cwd=R, capture_output=True, text=True)
    (E / 'regeneration.log').write_text(build.stdout + build.stderr, encoding='utf-8')
    assert build.returncode == 0 and hashes == [sha(p) for p in outputs]
    baseline = json.loads((E / 'baseline.json').read_text(encoding='utf-8'))
    changed = [p for p, digest in baseline.items() if not (R / p).is_file() or sha(R / p) != digest]
    allowed = {
        'docs/research/2026-11-14-union-navy.md', 'docs/research/2026-11-16-cast-1861.md',
        *('docs/research/_resource/' + p for p in ['dating.csv', 'dating-method.md', 'evidence-r52/date-overrides.json', 'rs8.csv', 'rs8.md', 'tools/addsources.js', 'tools/apply.js', 'tools/r52-dating.py']),
    }
    assert set(changed) == allowed, changed
    additions = []
    for folder, dirs, names in os.walk(R):
        dirs[:] = [x for x in dirs if x not in ['.git', 'node_modules', '__pycache__']]
        for name in names:
            p = Path(folder) / name
            rel = p.relative_to(R).as_posix()
            if name != '.git' and rel not in baseline:
                assert rel.startswith('docs/research/_resource/evidence-r62/') or rel in ['docs/research/_resource/tools/r62-verify.py', 'docs/research/_resource/tools/r62-wording-probe.cjs'], rel
                additions.append(rel)
    commands = {}
    for args in [['log', '-1', '--format=%H %D'], ['diff', '--cached', '--name-only'], ['diff', '--check'], ['status', '--short']]:
        p = subprocess.run(['git', *args], cwd=R, capture_output=True, text=True)
        assert p.returncode == 0
        commands[' '.join(args)] = {'exit': p.returncode, 'output': p.stdout + p.stderr}
    assert commands['log -1 --format=%H %D']['output'].startswith('3230269')
    assert not commands['diff --cached --name-only']['output'].strip()
    result = {'result': 'PASS', 'current_cells': 1017, 'current_citations': 1705, 'supplements_unchanged': 11, 'current_dates': dict(counts), 'exact_groups_audited': len(audit), 'rows_changed': len(changes), 'regeneration_byte_identical': True, 'baseline_files_unchanged': len(baseline) - len(changed), 'protected_lane_note_unchanged': sha(R / 'notes/lane-1.11r3-research.md') == baseline['notes/lane-1.11r3-research.md'], 'changed_files': sorted(changed), 'additions': sorted(additions), 'git': commands}
    (E / 'final-checks.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print('PASS: 1705 citations, 11 supplements preserved; 99 exact-date groups audited; 10 rows corrected; regeneration identical;', result['baseline_files_unchanged'], 'baseline files unchanged; lane note unchanged; index empty; diff --check clean')


if __name__ == '__main__':
    main()
