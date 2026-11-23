"""Receipt the particular source pages read for S87; raw originals stay outside git."""
import hashlib,json,pathlib,re,subprocess
R=pathlib.Path.cwd(); P=R/'docs/research/S87'; O=R/'runs/s87/reading'
sources=pathlib.Path('C:/Pyrrhic/mandate-research-sources')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,t): p.write_text(t,encoding='utf-8')
# Correct the first preparation's ambiguous numeric search: use the actual
# Morgan letter and its printed page 88 boundary, not an earlier table's 87.
t=(sources/'S37/or-iii1-correct.txt').read_text(encoding='utf-8')
n=t.index('Shall  the  order  for  the  Xew  York')
write(O/'or-iii1-p87-correct.txt',t[n-1800:n+600])
n=t.index('requisite  steps  have  been  taken')
write(O/'or-iii1-p85-morgan.txt',t[n-1000:n+1300])
t=(sources/'S37/lincoln-works2.txt').read_text(encoding='utf-8')
n=t.index('Some  Thoughts')
write(O/'lincoln-p29-30.txt',t[n-500:n+6100])
manifest=[]
def receipt(work,pages,path,url,scope='Relevant passages and printed boundaries read; not an entire-volume reading.'):
    manifest.append({'work':work,'printed_pages':pages,'path':str(path),'sha256':sha(path),'url':url,'reading':scope})
for work,pages,file,url in [
 ('Welles, Fort Pickens, Galaxy 11(1), January 1871','95-97','S37/galaxy-1871-01.xml','https://archive.org/download/sim_galaxy_1871-01_11_1/sim_galaxy_1871-01_11_1_djvu.xml'),
 ('Official Records I-III','374-376,381','S37/or-i3.xml','https://archive.org/download/warofrebellionco03unit/warofrebellionco03unit_djvu.xml'),
 ('Nicolay and Hay, Lincoln Complete Works II, 1894 edition','29-30,47-48','S37/lincoln-works2.txt','https://archive.org/download/abrahamlincolnco02linco/abrahamlincolnco02linco_djvu.txt'),
 ('Richardson, Messages and Papers of the Confederacy I, 1905','85-88,93-97','S37/confederacy-messages1.txt','https://archive.org/download/compmessages01richrich/compmessages01richrich_djvu.txt'),
 ('Burlingame II ch.22, online manuscript','2349-2351,2392','S37/burlingame-ch22.pdf','https://www.knox.edu/documents/LincolnStudies/BurlingameVol2Chap22.pdf'),
 ('Official Records III-I','85,87','S37/or-iii1-correct.txt','https://archive.org/download/warofrebellion0301rootrich/warofrebellion0301rootrich_djvu.txt')]:
    receipt(work,pages,sources/file,url)
for n in [166,167,168,169]:
    receipt('Official Records I-II',str(n),sources/f'S78/OR-I-2-p{n}.txt',f'https://archive.org/details/warofrebellion02secrrich/page/n{n+19}/mode/1up')
for n in [72,86]:
    receipt('Official Records III-I',str(n),sources/f'S73/reading/OR-III-1-p{n}.txt',f'https://archive.org/details/warofrebellion0301rootrich/page/n{n+16}/mode/1up')
receipt('Official Records, Navy I-IV','90',sources/'S73/reading/ORN-I-4-p90.txt','https://archive.org/details/cu31924079893859/page/n119/mode/1up')
for name in ['0107-the-sprint-continues-on-codexs-renewed-allowance.md','0109-two-pushback-floor-cases-belong-to-other-mechanisms.md']:
    b=subprocess.check_output(['git','show','e2b98c818b6e5e0c2e81256e5cba4955bb7feaa2:docs/decisions/'+name])
    (P/name).write_bytes(b)
(P/'source-reading.json').write_text(json.dumps({'sources':manifest,
 'extracts':{p.name:sha(p) for p in sorted(O.glob('*.txt')) if p.name!='or-iii1-p87.txt'},
 'exclusions':[{'path':'runs/s87/reading/or-iii1-p87.txt','reason':'Initial numeric search selected unrelated table; excluded. Correct Morgan excerpt separately retained.'},
 {'source':'OR I-LIII pp.162-163','reason':'Two web opens failed; not read; five/ten-day variant not settled.'}],
 'catalogue_read':'Appendix C all 41 rows and method read as prior research claims. Other underlying pages not freshly read remain held.'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print('source receipts',len(manifest))
