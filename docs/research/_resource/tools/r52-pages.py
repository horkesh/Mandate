"""Make compact OCR reading extracts, with unverified candidate page headings."""
from pathlib import Path
import re,json,sys,hashlib
from importlib.machinery import SourceFileLoader
helper=SourceFileLoader('r52read',str(Path(__file__).with_name('r52-read.py'))).load_module()
S=helper.SCRATCH;O=helper.OUT
MAP={
 'OR I-1':S/'gaps/leads-L3-sumter/or1.txt',
 'OR I-2':S/'gaps/gaps-C-mcdowell-s13/or_b.txt',
 'OR I-3':S/'gaps/gaps-D3-generals-govs/dl/warofrebellionco0003robe.txt',
 'OR I-4':S/'gaps/rs2/or4.txt',
 'OR I-5':S/'gaps/gaps-D1-confed/warofrebellionco0005vari.txt',
 'OR I-7':S/'gaps/gaps-D3-generals-govs/dl/warofrebellion07unit.txt',
 'OR I-10-2':S/'gaps/gaps-D3-generals-govs/dl/warofrebellion102unit.txt',
 'OR I-16-2':S/'gaps/gaps-D3-generals-govs/dl/warofrebellion162unit.txt',
 'OR I-17-2':S/'gaps/gaps-D3-generals-govs/dl/warofrebellion172unit.txt',
 'OR II-1':S/'gaps/gaps-D1-confed/warofrebellionco0001unit_h9h2.txt',
 'OR III-1':S/'gaps/gaps-C-mcdowell-s13/or3_1.txt',
 'OR III-2':S/'gaps/gaps-C-mcdowell-s13/or1_2.txt',
 'OR IV-1':S/'gaps/gaps-I-richmond/or4_1.txt',
 'ORN I-4':S/'gaps/leads-T2-strengths/orn4.txt',
 'ORN I-5':S/'g4data/orn5.txt',
 'ORN I-12':S/'gaps/gaps-B-ky-navy/orn12.txt',
 'ORN II-2':S/'gaps/leads-T2-strengths/x_officialrecordso02unitiala.txt',
}
for v,id in [('I-6','06'),('I-8','08'),('I-9','09'),('I-10-1','101'),('I-11-1','111'),('I-11-2','112'),('I-11-3','113'),('I-12-1','121'),('I-12-3','123'),('I-14','14'),('I-15','15'),('I-16-1','161'),('I-17-1','171'),('I-19-1','191'),('I-21','21')]:
 MAP['OR '+v]=O/'sources'/('warofrebellion'+id+'unit.txt')

def header_candidates(lines):
    hs=[]
    for i,l in enumerate(lines):
        s=l.strip()
        words=re.sub('[^a-zA-Z]','',s)
        if not words or len(s)>150 or sum(c.isupper() for c in words)/len(words)<.78:continue
        if not re.search(r'(?:OPERATIONS|CORRESPONDENCE|CAMPAIGN|SIEGE|CAPTURE|BATTLE|EXPEDITION|PRISON|BLOCKAD|UNION|NAVAL|RECORDS|DEFENSE|DEFENCE|ARMIES|REPORTS)',s):continue
        ns=[]
        a=re.match(r'\W*(\d{1,4})(?!\d)',s)
        b=re.search(r'(?<!\d)(\d{1,4})\W*$',s)
        if a:ns.append(int(a[1]))
        if b:ns.append(int(b[1]))
        for j in range(max(0,i-3),min(len(lines),i+4)):
            if re.fullmatch(r'\s*\d{1,4}\s*',lines[j]):ns.append(int(lines[j]))
        if ns:hs.append((i,list(set(ns))))
    return hs

def extract(p,page):
    lines=p.read_text(encoding='utf-8-sig',errors='replace').splitlines();hs=header_candidates(lines)
    cand=[]
    for j,(i,ns) in enumerate(hs):
        if page not in ns:continue
        near=hs[max(0,j-3):j]+hs[j+1:j+4]
        score=sum(1/(abs(i-k)/100+1) for k,nums in near if page-1 in nums or page+1 in nums)
        cand.append((score,i,j))
    if not cand:return None
    score,i,j=max(cand)
    # A conservative neighboring-page window. Never call an extracted date verified
    # without a human reading the date and checking its document/page association.
    start=max(0,i-100);end=min(len(lines),i+110)
    for k,ns in hs[j+1:j+5]:
        if page+1 in ns and k>i+15:end=k;break
    return {'file':str(p),'page':page,'line':i+1,'score':score,'header':lines[i],
            'text':'\n'.join(lines[start:end]),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}

def main():
    unique=(O/'unique-citations.txt').read_text(encoding='utf-8').splitlines();extracts={};missing=[]
    for cite in unique:
        m=re.match(r'^(ORN?)\s+([IVX]+-\d+(?:-\d+)?)(?:[ -]+p\.?\s*(\d+))',cite)
        if not m:continue
        key=m[1]+' '+m[2];page=int(m[3]);p=MAP.get(key)
        ep=key+' p'+str(page)
        if ep in extracts:continue
        rec=extract(p,page) if p and p.exists() else None
        if rec:extracts[ep]=rec
        else:missing.append(cite)
    (O/'official-page-extracts.json').write_text(json.dumps(extracts,indent=2)+'\n',encoding='utf-8')
    (O/'official-missing.txt').write_text('\n'.join(missing)+'\n',encoding='utf-8')
    for k,r in extracts.items():
        print('\n'+k+' line '+str(r['line'])+' '+r['header'])
        ls=r['text'].splitlines()
        dates=[(i,l) for i,l in enumerate(ls) if re.search(r'(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan\.|Feb\.|Sept\.|Oct\.|Nov\.|Dec\.).{0,45}(?:18[456]\d)',l,re.I)]
        for i,l in dates:print(' / '.join(ls[max(0,i-1):i+2]))
    print('\nMISSING',len(missing),'EXTRACTED',len(extracts))

if __name__=='__main__':main()
