"""Headless extraction of local primary volumes; originals are read-only.

Build a search index, or extract pages by printed number. Inspect running heads
before citing. Search results alone are not reading receipts.
"""
import argparse, hashlib, json, pathlib, re, xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / 'runs/s88/reading'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = pathlib.Path('C:/Pyrrhic/mandate-research-sources')
VOLUMES = {
    'OR-I-I': ('S73/OR-I-1-correct_djvu.xml', 'S73/OR-I-1-correct_scandata.xml', 'cu31924077725913'),
    'OR-I-II': ('S73/OR-I-2_djvu.xml', 'S73/OR-I-2_scandata.xml', 'cu31924077730186'),
    'OR-III-I': ('S73/OR-III-1_djvu.xml', None, 'warofrebellion0301rootrich'),
    'OR-IV-I': ('S73/OR-IV-1_djvu.xml', 'S73/OR-IV-1_scandata.xml', 'cu31924079579524'),
    'ORN-I-IV': ('S73/ORN-I-4_djvu.xml', 'S73/ORN-I-4_scandata.xml', 'cu31924079893859'),
    'OR-I-III': ('S37/or-i3.xml', None, 'warofrebellionco03unit'),
}

def volume(name):
    xml, scan, archive = VOLUMES[name]
    cache = OUT / (name + '-index.json')
    if cache.exists():
        return json.loads(cache.read_text(encoding='utf-8'))
    objects = ET.parse(SOURCE / xml).findall('.//OBJECT')
    mapping = {}
    if scan:
        for p in ET.parse(SOURCE / scan).findall('.//pageData/page'):
            n = p.findtext('pageNumber', '')
            if n.isdigit(): mapping[int(p.attrib['leafNum'])] = int(n)
    rows = []
    for i, ob in enumerate(objects):
        text = ' '.join(w.text or '' for w in ob.findall('.//WORD'))
        leafmatch = re.search(r'_(\d+)\.djvu', ob.attrib.get('usemap', ''))
        leaf = int(leafmatch.group(1)) if leafmatch else i
        page = mapping.get(leaf)
        # Without scan metadata inspect the running-head numeral; never use
        # arbitrary numbers in the body. OR III-I has object offset 15.
        if name == 'OR-III-I' and 16 <= i <= 1000: page = i - 15
        if name == 'OR-I-III' and 14 <= i <= 800: page = i - 13
        rows.append(dict(page=page, leaf=leaf, object=i, text=text))
    cache.write_text(json.dumps(rows, ensure_ascii=False), encoding='utf-8')
    return rows

def extract(name, pages):
    rows = volume(name)
    receipts = []
    xml, scan, archive = VOLUMES[name]
    for page in pages:
        found = [r for r in rows if r['page'] == page]
        if len(found) != 1: raise ValueError((name, page, len(found)))
        row = found[0]
        target = OUT / f'{name}-p{page}.txt'
        target.write_text(row['text'] + '\n', encoding='utf-8', newline='\n')
        receipts.append(dict(volume=name, page=page, leaf=row['leaf'],
                             header=row['text'][:190], path=str(target.relative_to(ROOT)),
                             sha256=hashlib.sha256(target.read_bytes()).hexdigest(),
                             source=str(SOURCE/xml),
                             url=f'https://archive.org/details/{archive}/page/n{row["leaf"]}/mode/1up'))
    return receipts

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('volume', choices=VOLUMES)
    parser.add_argument('pages', nargs='*', type=int)
    parser.add_argument('--search')
    args = parser.parse_args()
    if args.search:
        for row in volume(args.volume):
            match = re.search(args.search, row['text'], re.I)
            if match:
                print(row['page'], row['leaf'], row['text'][max(0,match.start()-100):match.end()+230])
    else:
        got = extract(args.volume, args.pages)
        print(json.dumps(got, ensure_ascii=False, indent=2))
