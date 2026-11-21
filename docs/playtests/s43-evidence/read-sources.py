"""Read-only scan search/extraction; scans remain outside worktrees."""
from pathlib import Path
import fitz,sys,re,json,hashlib
scan=Path(r'C:/Pyrrhic/mandate-research-sources/S4/warofrebellion02secrrich/warofrebellion02secrrich.pdf')
out=Path(r'C:/Pyrrhic/mandate-research-sources/S43');out.mkdir(exist_ok=True)
doc=fitz.open(scan)
if sys.argv[1]=='search':
 pattern=re.compile(sys.argv[2],re.I)
 for i in range(20,len(doc)-20):
  text=doc[i].get_text()
  hits=list(pattern.finditer(text))
  if hits:print(i-19,':',' | '.join(re.sub(r'\s+',' ',text[max(0,m.start()-90):m.end()+180]) for m in hits[:3]))
else:
 for n in map(int,sys.argv[1:]):
  p=doc[n+19];text=p.get_text()
  (out/f'or2-{n:04}.txt').write_text(text,encoding='utf-8')
  print('\nPRINTED PAGE',n,'PDF PAGE',n+20,'\n',text)
 (out/'scan.json').write_text(json.dumps({'path':str(scan),'sha256':hashlib.sha256(scan.read_bytes()).hexdigest(),'url':'https://archive.org/download/warofrebellion02secrrich/warofrebellion02secrrich.pdf','printedToPdfOffset':20},indent=2),encoding='utf-8')
