"""R59 bounded retrieval. Source data stays outside the worktree."""
import concurrent.futures
import hashlib
import json
import pathlib
import sys
import urllib.request

DEST = pathlib.Path('C:/Pyrrhic/mandate-research-sources/r59-sources')
DEST.mkdir(parents=True, exist_ok=True)

def fetch(identifier):
    url = f'https://archive.org/download/{identifier}/{identifier}_djvu.txt'
    target = DEST / f'{identifier}.txt'
    record = {'identifier': identifier, 'url': url, 'path': str(target)}
    try:
        if not target.exists():
            with urllib.request.urlopen(url, timeout=45) as response:
                data = response.read()
            if len(data) < 5000 or b'<html' in data[:200].lower():
                raise ValueError('Not a readable OCR text')
            target.write_bytes(data)
        data = target.read_bytes()
        record.update(status='ok', bytes=len(data), sha256=hashlib.sha256(data).hexdigest())
    except Exception as error:
        record.update(status='failed', error=str(error))
    (DEST / f'{identifier}.fetch.json').write_text(json.dumps(record, indent=2), encoding='utf8')
    return record

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for result in pool.map(fetch, sys.argv[1:]):
            print(json.dumps(result))
