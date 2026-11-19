from pathlib import Path
import csv, hashlib, json, subprocess

ROOT = Path(__file__).resolve().parents[4]
E = ROOT / 'docs/research/_resource/evidence-r65'
SRC = Path('C:/Pyrrhic/mandate-research-sources/r65-sources')
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
baseline = json.loads((E/'baseline.json').read_text())
changed = [name for name,sha in baseline.items() if not (ROOT/name).is_file() or digest(ROOT/name)!=sha]
assert changed == ['notes/lane-1.11r3-research.md'], changed
new = [str(p.relative_to(ROOT)).replace('\\','/') for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.parts and 'node_modules' not in p.parts and str(p.relative_to(ROOT)).replace('\\','/') not in baseline]
assert all(n.startswith('docs/research/_resource/evidence-r65/') or n in ['docs/research/_resource/rs16.csv','docs/research/_resource/rs16.md'] for n in new), new
assert not any(p.suffix.lower() in ['.png','.jpg','.jpeg','.pdf','.xml'] for p in (ROOT/'docs/research/_resource/evidence-r65').rglob('*') if p.is_file())
sources = json.loads((E/'sources.json').read_text())
references = 0
for record in sources['records']:
    for name,sha in record['hashes'].items():
        assert digest(SRC/name)==sha
        references += 1
inventory = [{'file':str(p.relative_to(SRC)).replace('\\','/'),'bytes':p.stat().st_size,'sha256':digest(p)} for p in sorted(SRC.rglob('*')) if p.is_file()]
(E/'source-inventory.json').write_text(json.dumps(inventory,indent=2)+'\n',encoding='utf-8')
def git(*args):
    r = subprocess.run(['git','--no-optional-locks',*args],cwd=ROOT,capture_output=True,check=True)
    return r.stdout.decode('utf-8')
head = git('log','-1','--format=%H').strip()
assert head.startswith('459b4a5')
assert git('diff','--cached','--name-only') == ''
git('diff','--check')
checks = json.loads((E/'research-checks.json').read_text())
assert checks['pass'] and checks['counts']=={'KEEP':2,'CHANGE':7,'HOLD':73}
counts = json.loads((E/'counts.json').read_text())
assert counts['total']==82 and counts['people']==17
md = (ROOT/'docs/research/_resource/rs16.md').read_text(encoding='utf-8')
for text in ['2 KEEP, 7 CHANGE, 73 HOLD','Zero tests and zero done-check criteria ran','200','500']:
    assert text in md, text
with (ROOT/'docs/research/_resource/rs16.csv').open(encoding='utf-8',newline='') as f:rows=list(csv.DictReader(f))
person_names={'buchanan_franklin':'Buchanan','cooper_samuel':'Cooper','crittenden_george_b':'G. B. Crittenden','ewell_richard_s':'Ewell','gorgas_josiah':'Gorgas','holmes_theophilus_h':'Holmes','johnston_albert_s':'A. S. Johnston','johnston_joseph_e':'J. E. Johnston','lee_robert_e':'Lee','longstreet_james':'Longstreet','loring_william_w':'Loring','magruder_john_b':'Magruder','pemberton_john_c':'Pemberton','smith_edmund_k':'E. Kirby Smith','stuart_james_e_b':'Stuart','houston_samuel':'Houston','clark_edward':'Clark'}
for person,c in counts['by_person'].items():
    assert f"| {person_names[person]} | {c['KEEP']} | {c['CHANGE']} | {c['HOLD']} |" in md
for field,c in counts['by_field'].items():
    assert f"| {field.replace('value:','')} | {c['KEEP']} | {c['CHANGE']} | {c['HOLD']} |" in md
required=json.loads((E/'required-gates.json').read_text())
assert [r['exit']for r in required]==[2,1]
assert all('MANDATE_NO_GIT=1' in r['command']for r in required)
report={'researchAudit':'PASS','head':head,'gitCommands':'read-only, optional locks disabled for final reads','stagedDiffEmpty':True,'whitespaceExit':0,'baselineFiles':len(baseline),'baselineOtherFilesPreserved':len(baseline)-1,'baselineChanged':changed,'addedFiles':new,'counts':{'rows':82,'people':17,'KEEP':2,'CHANGE':7,'HOLD':73},'sourceFiles':len(inventory),'sourceBytes':sum(r['bytes']for r in inventory),'sourceHashReferences':references,'packChanges':0,'requiredGates':required,'fullSuiteTestsRun':0,'doneCriteriaEvaluated':0,'standingReview':'pending with Claude','scope':'R65 only'}
(E/'final-checks.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
delivery=[{'file':str(p.relative_to(ROOT)).replace('\\','/'),'bytes':p.stat().st_size,'sha256':digest(p)} for p in sorted((ROOT/'docs/research/_resource').rglob('*')) if p.is_file() and (p.parent==E or p.name in ['rs16.csv','rs16.md']) and p.name!='delivery-inventory.json']
delivery.append({'file':'notes/lane-1.11r3-research.md','bytes':(ROOT/'notes/lane-1.11r3-research.md').stat().st_size,'sha256':digest(ROOT/'notes/lane-1.11r3-research.md')})
(E/'delivery-inventory.json').write_text(json.dumps(delivery,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k not in ['addedFiles','requiredGates']}))
