"""R28: one blended elevation field, one contour hand, no rectangle replacement."""
from pathlib import Path
import hashlib, json, math, sys, time
ROOT = Path(__file__).resolve().parents[3]; P = ROOT/'prototypes/desk'; OUT = ROOT/'art-masters/R28'
sys.path[:0] = [str(P/'.geometry-tools'), str(ROOT/'art-masters/R22/python-tools')]
import numpy as np
from PIL import Image
from relief_surface import continuous_surface, read_3dep

sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
digest = lambda v: hashlib.sha256(json.dumps(v, sort_keys=True).encode()).hexdigest()
started = time.perf_counter()
source = OUT/'sources/3dep-east.tif'; meta = json.loads((OUT/'sources/3dep-response.json').read_text())
e = meta['extent']; fine_extent = [e['xmin'], e['ymin'], e['xmax'], e['ymax']]
fine, valid, missing = read_3dep(source, meta['width'], meta['height'])
coarse_source = ROOT/'art-masters/R22/sources/etopo1.tif'
coarse = np.asarray(Image.open(coarse_source), dtype=np.float32)
assert coarse.shape == (1300, 2000)
surface = continuous_surface(coarse, [-105,24,-65,50], fine, valid, fine_extent)
np.save(OUT/'continuous-elevation.npy', surface)
# One-cell smoothing is identical throughout; no wrap across the source edges.
s = np.pad(surface, 1, mode='edge')
s = (4*s[1:-1,1:-1]+s[:-2,1:-1]+s[2:,1:-1]+s[1:-1,:-2]+s[1:-1,2:])/8
gy, gx = np.gradient(s); step = .005; marks = []
q = [s[:-1,:-1],s[:-1,1:],s[1:,1:],s[1:,:-1]]
minimum = np.minimum.reduce(q); maximum = np.maximum.reduce(q)
for height in range(100, 4401, 100):
    rows, cols = np.nonzero((minimum <= height)&(maximum > height))
    keep = (rows>2)&(rows<s.shape[0]-3)&(cols>2)&(cols<s.shape[1]-3)
    rows = rows[keep]; cols = cols[keep]
    # March each contour cell; the shared grid fixes spatial stroke density.
    vals = np.stack([v[rows,cols] for v in q], axis=1)
    counts = np.zeros(len(rows), dtype=int); xsum = np.zeros(len(rows)); ysum = np.zeros(len(rows))
    corners = [(0,0),(1,0),(1,1),(0,1)]
    for j in range(4):
        k=(j+1)%4; crossing=(vals[:,j]<=height)&(vals[:,k]>height)|(vals[:,k]<=height)&(vals[:,j]>height)
        t=np.zeros(len(rows)); np.divide(height-vals[:,j],vals[:,k]-vals[:,j],out=t,where=crossing)
        xsum += np.where(crossing,corners[j][0]+(corners[k][0]-corners[j][0])*t,0)
        ysum += np.where(crossing,corners[j][1]+(corners[k][1]-corners[j][1])*t,0)
        counts += crossing
    lat = 50-(rows+.5)*step; cos = np.cos(np.radians(lat))
    east = gx[rows,cols]/(step*111.32*cos); north = -gy[rows,cols]/(step*111.32)
    slope = np.hypot(east,north); keep=(slope>=18)&(counts==2)
    lon=-105+(cols+.5+xsum/np.maximum(counts,1))*step
    lat=50-(rows+.5+ysum/np.maximum(counts,1))*step
    span=np.clip(100/np.maximum(slope,1)*.72,.12,2.6)
    end_lon=lon-east/np.maximum(slope,1)*span/(111.32*cos)
    end_lat=lat-north/np.maximum(slope,1)*span/111.32
    for i in np.flatnonzero(keep):
        marks.append({'a':[round(float(lon[i]),6),round(float(lat[i]),6)],
                      'b':[round(float(end_lon[i]),6),round(float(end_lat[i]),6)],
                      'strength':round(min(1,float(slope[i])/160),3),
                      'slope':round(float(slope[i]),3),'contour':height})
target=P/'public/map-data/union-1861.json'; g=json.loads(target.read_text(encoding='utf8'))
protected={k:digest(g[k]) for k in ['regions','base']}
protected['rail']=digest(g['cartography']['rail']); protected['rivers']=digest(g['cartography']['rivers'])
if not (OUT/'relief-before.json').exists():
    (OUT/'relief-before.json').write_text(json.dumps({'relief':g['cartography']['relief'],
        'fine':g['cartography']['lod'].get('relief',[]),'extent':g['cartography']['lod'].get('reliefExtent')},separators=(',',':')))
g['cartography']['relief']=marks
g['cartography']['lod'].pop('relief',None);g['cartography']['lod'].pop('reliefExtent',None)
target.write_text(json.dumps(g,sort_keys=True,separators=(',',':'),ensure_ascii=False)+'\n',encoding='utf8')
recipe_path=Path(str(target)+'.recipe.json'); recipe=json.loads(recipe_path.read_text(encoding='utf8'))
recipe.update(request='R28',sha256=sha(target),actualSize=target.stat().st_size)
recipe['R28']={'scriptSha256':sha(Path(__file__)),'samplingScriptSha256':sha(P/'scripts/relief_surface.py'),
    'sources':[{'path':str(coarse_source.relative_to(ROOT)),'sha256':sha(coarse_source)},
               {'path':str(source.relative_to(ROOT)),'sha256':sha(source),'manifest':'art-masters/R28/sources/manifest.json'}],
    'surface':'Uniform .005 degree grid; 3DEP East blended into ETOPO1 elevation with separable C2 smootherstep over two degrees (about 170–220 km), before gradients and contours. No close-source replacement.',
    'hachures':'One stroke per 100m contour cell, common metric slope >=18m/km; downhill length 72% contour separation, .12–2.6km. Every resolution band uses this same list.',
    'limits':'Modern bare-earth landform sources; no modern roads, buildings, places or invented terrain. Sparse/no-data 3DEP samples fall back to the coarser source.',
    'preservedHashes':protected}
recipe_path.write_text(json.dumps(recipe,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
report={'seconds':time.perf_counter()-started,'hachures':len(marks),'sourcePixels':list(fine.shape),
        'continuousPixels':list(surface.shape),'fineExtent':fine_extent,'blendMarginDegrees':2,
        'sparseFineTiles':missing,'fineValidFraction':float(valid.mean()),'preservedHashes':protected,
        'geometrySha256':sha(target),'surfaceSha256':sha(OUT/'continuous-elevation.npy')}
(OUT/'relief-build.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
