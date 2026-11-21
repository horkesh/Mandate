from pathlib import Path
import json,hashlib,datetime
out=Path(__file__).resolve().parent;root=out.parents[2];raw=root/'runs/s43'
def read(p):return json.loads(p.read_text(encoding='utf8'))
def write(n,d):(out/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8',newline='\n')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
d=read(raw/'daily-private.json');w=read(raw/'world-context.json')
regions={'northern_virginia','manassas','fredericksburg','hanover','richmond','harpers_ferry','winchester','norfolk','fort_monroe','yorktown','hampton','petersburg','chesterfield','southside'}
snapshots=[]
for s in d:
 if s['day'] not in [43,48,50,56,62,67,72,79,87,93,94,99,100,101,104,105,136,148]:continue
 snapshots.append({'day':s['day'],'date':s['date'],'posts':{k:s['postStates'].get(k) for k in ['us_dc_militia','cs_cmd_harpers_ferry','cs_cmd_manassas']},
 'control':{r:s['regionControl'].get(r) for r in sorted(regions)},'works':{r:s['regionFortification'].get(r) for r in sorted(regions)},
 'forcesInRegions':[{'id':k,'state':b,'post':s['forceAssignments'].get(k),'location':s['forceLocations'][k]} for k,b in s['forceBlockStates'].items() if s['forceLocations'][k]['locRegion'] in regions],
 'VirginiaBlocksAnywhere':[{'id':k,'state':b,'post':s['forceAssignments'].get(k),'location':s['forceLocations'][k]} for k,b in s['forceBlockStates'].items() if b['fbDepartment']=='st_virginia']})
write('context-private.json',{'snapshots':snapshots,'stoneInitial':next(x for x in w['start']['forceBlocks'] if x['id']=='fb_us_dc_militia'),
 'coastGuardInitial':next(x for x in w['start']['forceBlocks'] if x['id']=='fb_st_georgetown_coast_guard'),
 'stonePlanDay47':d[46]['planRecords']['us_dc_militia'],'stoneEnlistmentDay81':d[80]['forceEnlistments'].get('fb_us_dc_militia'),
 'initialForcesInVirginiaRegions':[b for b in w['start']['forceBlocks'] if b['region'] in regions],
 'mapRules':{k:w['map']['rules'][k] for k in ['retreatControlPermille','supplyThresholdPermille','stores','movement'] if k in w['map']['rules']}})
pages=[620,621,646,718,719,720,721,726,730,774,775,777,778,783,784,827,845,846,847,895,911,912,927,928]
sources=Path(r'C:/Pyrrhic/mandate-research-sources/S43')
text='Official Records, series I, volume II (1880). Complete extracted cited pages.\nPrinted page + 20 = one-based PDF page in the retained scan. Line-end whitespace normalized; OCR wording unchanged.\n'
for p in pages:text+=f'\n\n===== PRINTED PAGE {p}; PDF PAGE {p+20} =====\n'+'\n'.join(x.rstrip() for x in (sources/f'or2-{p:04}.txt').read_text(encoding='utf8').splitlines())+'\n'
(out/'source-pages.txt').write_text(text,encoding='utf8',newline='\n')
scan=read(sources/'scan.json')
write('sources.json',{'book':'The War of the Rebellion, Official Records, series I, volume II (1880)','scan':scan,
 'readPages':pages,'textArtifact':'source-pages.txt','textSha256':sha(out/'source-pages.txt'),
 'imageChecks':[{'printedPage':p,'path':str(sources/f'or2-{p}.png'),'sha256':sha(sources/f'or2-{p}.png')} for p in [718,726,847,895,928]],
 'links':[{'printedPage':p,'url':f'https://ehistory.osu.edu/books/official-records/002/{p:04}'} for p in pages],
 'qualification':'All cited text pages were read. Five pages rendered; 726 and 895 inspected visually before the quantitative table was written. No claim to have read the whole volume.'})
print('assembled',len(snapshots),'dated private snapshots;',len(pages),'read source pages')
