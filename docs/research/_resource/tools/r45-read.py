"""Read-only access to the retained source OCR. No network or pack writes."""
from pathlib import Path
import re, sys

SCRATCH = Path(r'C:\Users\User\AppData\Local\Temp\claude\4d87ab6d8ae0089a\9b5270b2-8d26-4ceb-8899-4a7cb8486063\scratchpad\gaps')

if __name__ == '__main__':
    path = SCRATCH / sys.argv[1]
    lines = path.read_text(encoding='utf-8-sig', errors='replace').splitlines()
    if sys.argv[2] == '--headings':
        before = int(sys.argv[3])
        heads = [(i+1,l) for i,l in enumerate(lines[:before]) if re.fullmatch(r'\s*\d{2,4}\s*',l) or re.search(r'^\s*\d+\s+JOURNAL|CONGRESS.*\d+\s*$',l)]
        for i,l in heads[-7:]: print(i,l)
        sys.exit(0)
    if sys.argv[2] == '--lines':
        lo, hi = map(int, sys.argv[3:5])
        print(str(path), 'lines', lo, hi)
        print('\n'.join(lines[lo-1:hi]))
        sys.exit(0)
    pattern = re.compile(sys.argv[2], re.I)
    radius = int(sys.argv[3]) if len(sys.argv) > 3 else 8
    limit = int(sys.argv[4]) if len(sys.argv) > 4 else 20
    hits = [i for i, line in enumerate(lines) if pattern.search(line)]
    print(str(path), 'hits', len(hits))
    end = -1
    for i in hits[:limit]:
        lo, hi = max(0, i-radius), min(len(lines), i+radius+1)
        if hi <= end:
            continue
        print('\n--- lines', lo+1, 'to', hi, '---')
        print('\n'.join(lines[max(lo,end):hi]))
        end = hi
