"""Retain settled runtime diagnostics/inventory before final result documentation."""
import hashlib, json, pathlib
E=pathlib.Path(__file__).resolve().parent;P=E.parent;RAW=E/'validation-raw'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,value):p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
done=read(RAW/'done-result.json');receipt=read(RAW/'done-check.json')
criteria=done['criteria'];timings=[]
for r in done.get('runs',[])+done.get('history',[]):
    timings.append({'name':r['name'],'timing':r.get('timed',{}).get('timing')})
diag={'campaign':receipt,'bindingExit':'Phase 0 only, the repository default; supplemental 1A is reported and not waived','criteria':criteria,'timings':timings,'elapsedSeconds':done['elapsedSeconds'],'drafting':done['drafting'],'phase0Passed':sum(not c['problems'] for c in criteria if c['milestone']=='phase0'),'phase0Total':sum(c['milestone']=='phase0' for c in criteria),'oneAPassed':sum(not c['problems'] for c in criteria if c['milestone']=='1A'),'oneATotal':sum(c['milestone']=='1A' for c in criteria),'problems':[p for c in criteria for p in c['problems']]}
write(E/'runtime-diagnostics.json',diag)
raw=[]
for f in sorted(RAW.rglob('*')):
    if f.is_file():
        if not (f.suffix=='.diff' or f.name.startswith(('done-','save-')) or f.name in ['preflight.json','preflight.log','check.json','check.log']):continue
        data=f.read_bytes();raw.append({'path':str(f.relative_to(P)).replace('\\','/'),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
write(E/'runtime-inventory.json',{'files':raw,'note':'Before the commit; the later hook/commit/status append receipts remain separately local and in CODEX.'})
excluded={'validation-summary.json','delivery-inventory.json'}
files=[]
for f in sorted(P.rglob('*')):
    if not f.is_file() or 'validation-raw' in f.parts or '__pycache__' in f.parts or f.name in excluded:continue
    data=f.read_bytes();files.append({'path':str(f.relative_to(P)).replace('\\','/'),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
write(E/'delivery-inventory.json',{'files':files,'excludedClosingRecords':sorted(excluded),'note':'Substantive packets, sources and verification evidence inventoried before the final result record. No runtime/package build is delivered.'})
audit=read(E/'packet-checks.json');check=read(RAW/'check.json');preflight=read(RAW/'preflight.json')
summary={'scope':'S32 only, starting sprint/audit at 9ab0f5e; no production or other-worktree edits','packets':14,'index':'README.md','packetAudit':{k:audit[k] for k in ['passed','failed','branches','pairs','sourceReferences','uniqueSourceBlobs','protectedOriginalFiles']},'workspacePreflight':preflight,'requiredNoGitCheck':{**check,'testFilesPassed':137,'testsPassed':1530,'expectedFailures':1,'skips':3,'chainedGates':['typecheck','boundary','licences','106-decision index']},'defaultDoneCheck':{**receipt,'phase0':f'{diag["phase0Passed"]}/{diag["phase0Total"]}','supplemental1A':f'{diag["oneAPassed"]}/{diag["oneATotal"]}','problems':diag['problems'],'details':'runtime-diagnostics.json','noRetry':True},'commitHook':'Must pass the actual configured hook. Its subsequent result/hash belongs in local validation-raw/commit.json and the one CODEX append, not in a self-referential commit.','preservation':'Every original tracked file hash preserved by focused audit; new delivery paths confined to docs/audit/sprint-packets.','limitations':['This runtime check is on the audit baseline, not every sprint branch.','No Linux CI, independent standing review, lead ruling, gate signature, cumulative merge or acceptance waiver.','Raw diffs/logs/summaries/saves remain local and ignored; their paths and hashes are inventoried.']}
write(E/'validation-summary.json',summary)
print(json.dumps({'checkExit':check['exit'],'doneExit':receipt['exit'],'phase0':summary['defaultDoneCheck']['phase0'],'oneA':summary['defaultDoneCheck']['supplemental1A'],'problems':len(diag['problems']),'deliveryFilesBeforeClosingRecords':len(files)},indent=2))
