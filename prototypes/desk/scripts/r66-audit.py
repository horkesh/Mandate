"""Read-only delivery inventory, apart from evidence in art-masters/R66."""
from pathlib import Path
import hashlib
import json
import os
import struct

root = Path(__file__).resolve().parents[3]
out = root / 'art-masters/R66'
baseline = json.loads((out / 'baseline.json').read_text(encoding='utf-8'))
skip = {'.git', '.claude', 'node_modules', 'art-masters'}
current = {}
for folder, dirs, files in os.walk(root):
    dirs[:] = sorted(d for d in dirs if d not in skip)
    for name in sorted(files):
        path = Path(folder) / name
        current[path.relative_to(root).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
changes = [{'path': key, 'before': baseline.get(key), 'after': current.get(key)}
           for key in sorted(set(baseline) | set(current)) if baseline.get(key) != current.get(key)]
outside = [entry for entry in changes if not entry['path'].startswith('prototypes/desk/') and entry['path'] != 'CODEX.md']
captures = []
for path in sorted(out.glob('*.png')):
    data = path.read_bytes()
    width, height = struct.unpack('>II', data[16:24])
    recipe = json.loads(Path(str(path) + '.recipe.json').read_text(encoding='utf-8'))
    digest = hashlib.sha256(data).hexdigest()
    assert digest == recipe['sha256'], path
    assert recipe['actualSize'] == f'{width}x{height}', path
    assert (width, height) in [(1920, 1080), (3440, 1440)], path
    captures.append({'file': path.name, 'size': [width, height], 'sha256': digest})
delivery = {key: value for key, value in current.items()
            if key.startswith('prototypes/desk/') and '/dist/' not in key and baseline.get(key) != value}
package = {key: {'sha256': value, 'bytes': (root / key).stat().st_size}
           for key, value in current.items() if key.startswith('prototypes/desk/dist/')}
result = {'baselineFiles': len(baseline), 'unchangedBaselineFiles': sum(current.get(k) == v for k, v in baseline.items()),
          'changes': changes, 'outsideScope': outside, 'delivery': delivery, 'buildInventory': package,
          'captures': captures, 'excludedConcurrentOrDependencyTrees': sorted(skip)}
(out / 'final-inventory.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'unchangedBaselineFiles': result['unchangedBaselineFiles'], 'deliveryFiles': len(delivery),
                  'outsideScope': outside, 'captures': len(captures), 'buildFiles': len(package)}))
assert not outside, outside
assert len(captures) == 8, len(captures)
