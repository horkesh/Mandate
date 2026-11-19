"""Fetch upstream OFL sources and losslessly encode WOFF2; no font CDN at runtime.
Run: python -m pip install --target .font-tools fonttools brotli
     python scripts/fonts.py
"""
import sys, pathlib, urllib.request, json, hashlib, zipfile, io
base = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(base / '.font-tools'))
from fontTools.ttLib import TTFont
out = base / 'public/fonts'
masters = base.parents[1] / 'art-masters/R14/fonts'
out.mkdir(parents=True, exist_ok=True)
masters.mkdir(parents=True, exist_ok=True)
records = []
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'R14-font-build'}), timeout=60).read()
def save_font(data, dest, source, xml=False):
    raw = masters / dest.replace('.woff2', '.ttf')
    raw.write_bytes(data)
    f = TTFont()
    if xml: f.importXML(str(raw))
    else: f = TTFont(io.BytesIO(data))
    f.flavor = 'woff2'
    target = out / dest
    f.save(str(target))
    records.append({'file': dest, 'source': source, 'sourceSha256': hashlib.sha256(data).hexdigest(), 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'processing': 'FontTools lossless WOFF2 encoding; no glyph changes'})

# Pin each upstream HEAD to an immutable commit for repeatable source references.
def ref(repo):
    return json.loads(get('https://api.github.com/repos/' + repo + '/commits/HEAD'))['sha']
imrepo = 'librefonts/imfellenglish'
imref = ref(imrepo)
tree = json.loads(get(f'https://api.github.com/repos/{imrepo}/git/trees/{imref}?recursive=1'))['tree']
for item in tree:
    if item['path'].endswith('.ttx'):
        (masters / item['path']).write_bytes(get(f'https://raw.githubusercontent.com/{imrepo}/{imref}/' + item['path']))
for name, dest in [('IMFeENrm28P.ttf', 'im-fell-regular.woff2'), ('IMFeENit28P.ttf', 'im-fell-italic.woff2')]:
    f = TTFont(); f.importXML(str(masters / (name + '.ttx'))); f.flavor = 'woff2'; f.save(str(out / dest))
    records.append({'file': dest, 'source': f'https://github.com/{imrepo}/tree/{imref}', 'sha256': hashlib.sha256((out / dest).read_bytes()).hexdigest(), 'processing': 'Reassembled upstream split TTX tables with FontTools, encoded WOFF2; no glyph changes'})
(out / 'IM-Fell-OFL.txt').write_bytes(get(f'https://raw.githubusercontent.com/{imrepo}/{imref}/OFL.txt'))

repo = 'impallari/Libre-Caslon-Text'; commit = ref(repo)
for style in ['Regular', 'Italic', 'Bold']:
    url = f'https://raw.githubusercontent.com/{repo}/{commit}/fonts/TTF/LibreCaslonText-{style}.ttf'
    save_font(get(url), 'libre-caslon-' + style.lower() + '.woff2', url)
(out / 'Libre-Caslon-OFL.txt').write_bytes(get(f'https://raw.githubusercontent.com/{repo}/{commit}/OFL.txt'))

url = 'https://github.com/akryukov/oldstand/releases/download/v2.2/oldstandard-2.2.ttf.zip'
data = get(url); (masters / 'oldstandard-2.2.ttf.zip').write_bytes(data)
z = zipfile.ZipFile(io.BytesIO(data))
for style in ['Regular', 'Italic', 'Bold']:
    name = next(n for n in z.namelist() if n.endswith(f'OldStandard-{style}.ttf'))
    save_font(z.read(name), 'old-standard-' + style.lower() + '.woff2', url)
ofl = next(n for n in z.namelist() if n.endswith('OFL.txt'))
(out / 'Old-Standard-OFL.txt').write_bytes(z.read(ofl))
(out / 'sources.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print('Encoded', len(records), 'WOFF2 files from their family repositories; OFL texts beside fonts.')
