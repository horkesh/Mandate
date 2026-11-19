"""Fetch one public-domain 3DEP surface covering the East and southern Appalachians."""
from pathlib import Path
import hashlib, json, urllib.parse, urllib.request

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'art-masters/R28/sources'
SERVICE = 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer'
OUT.mkdir(parents=True, exist_ok=True)

def fetch(url, name):
    p = OUT / name
    if not p.exists():
        with urllib.request.urlopen(url, timeout=180) as response:
            p.write_bytes(response.read())
    return p

service = fetch(SERVICE + '?f=pjson', '3dep-service.json')
metadata = json.loads(service.read_text())
assert metadata['maxImageWidth'] >= 5200 and metadata['maxImageHeight'] >= 4800
params = dict(bbox='-86,31,-73,43', bboxSR=4326, imageSR=4326,
              size='5200,4800', format='tiff', pixelType='F32',
              interpolation='RSP_BilinearInterpolation',
              renderingRule=json.dumps({'rasterFunction':'None'}), f='json')
url = SERVICE + '/exportImage?' + urllib.parse.urlencode(params)
response = fetch(url, '3dep-response.json')
result = json.loads(response.read_text())
assert 'error' not in result, result
assert result['width'] == 5200 and result['height'] == 4800, result
image = fetch(result['href'], '3dep-east.tif')
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
manifest = {'url':url, 'resolvedUrl':result['href'], 'date':'2026-11-18',
            'file':image.name, 'bytes':image.stat().st_size, 'sha256':sha(image),
            'extent':result['extent'], 'size':[result['width'],result['height']],
            'licence':'USGS 3DEP public domain US government elevation',
            'credit':metadata['copyrightText'], 'serviceSha256':sha(service),
            'rightsPage':'https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits',
            'rightsArchive':'art-masters/R24/sources/usgs-rights.md',
            'use':'Modern bare-earth landforms only; no roads, buildings or modern places.'}
(OUT/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
print(json.dumps(manifest))
