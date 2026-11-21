"""Build S32 navigation packets from pinned objects and explicit review notes.

This inventories proposals; it does not review, approve, merge or activate them.
All writes are under docs/audit/sprint-packets.
"""
import csv, hashlib, io, json, pathlib, posixpath, re, subprocess
from collections import Counter
from urllib.parse import quote

E = pathlib.Path(__file__).resolve().parent
OUT = E.parent
D = json.loads((E/'inventory.json').read_text(encoding='utf-8'))
B = D['branches']
PAIRS = json.loads((E/'merge-tree.json').read_text(encoding='utf-8'))
ROOT = E.parents[3]
CACHE = {}
REFS = []
RULES = {}
GATES = {}
ALTERNATIVES = {}
STATUS_MAP = {'1a':[1], 'audit':[26], 'checks':[18,25], 'desk':[8,19,29], 'people-data':[9,16], 'perf':[2,20,30], 'plan-1b':[10,11], 'playtest':[27], 'research-cast':[6,12,22], 'research-foreign-economy':[5,15,24], 'research-gate':[7,23], 'research-military':[4,14,21,31], 'research-politics':[3,17], 'situations-1862':[13,28]}

def git(*args):
    r=subprocess.run(['git',*args],cwd=ROOT,capture_output=True)
    if r.returncode: raise RuntimeError((args,r.returncode,r.stderr.decode('utf-8','replace')))
    return r.stdout.decode('utf-8')
def blob(n,p):
    k=(n,p)
    if k not in CACHE: CACHE[k]=git('show',B[n]['sha']+':'+p)
    return CACHE[k]
def pathline(n,p,needle=None):
    ls=blob(n,p).splitlines()
    if needle is None: line=1
    else:
        found=[i+1 for i,l in enumerate(ls) if needle in l]
        if not found: raise ValueError((n,p,needle))
        line=found[0]
    REFS.append({'branch':n,'sha':B[n]['sha'],'path':p,'line':line,'needle':needle})
    return line
def link(n,p,needle=None):
    line=pathline(n,p,needle)
    url=f'https://github.com/horkesh/Mandate/blob/{B[n]["sha"]}/{quote(p,safe="/")}#L{line}'
    return f'[{p}:{line}]({url})'
def archived(n,p):
    dest=E/'handovers'/n/p
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_text(blob(n,p),encoding='utf-8')
    return f'_evidence/handovers/{n}/{p}'
def changes(n): return [s.split('\t')[-1] for s in B[n]['changes']]
def paras(lines,start=1):
    """Preserve author numbered/bullet choices as individually addressable items."""
    result=[];buf=[];at=start
    def flush():
        nonlocal buf
        if buf: result.append((at,' '.join(s.strip() for s in buf)));buf=[]
    for i,l in enumerate(lines,start):
        if not l.strip(): flush();continue
        if l.startswith('#'): flush();continue
        if re.match(r'^\s*(?:\d+\.|[-*])\s',l):
            flush();at=i;buf=[re.sub(r'^\s*(?:\d+\.|[-*])\s+','',l)]
        elif l.startswith('|'):
            flush()
            if not re.match(r'^\|[- :|]+\|?$',l):result.append((i,l))
        else:
            if not buf:at=i
            buf.append(l)
    flush();return result
def add(n,text,p,line,origin='hand-over'):
    # Exact source wording is retained; no new rejected alternative is invented.
    RULES.setdefault(n,[]).append({'text':text,'path':p,'line':line,'origin':origin})
def section(n,p,title):
    ls=blob(n,p).splitlines();starts=[i for i,l in enumerate(ls) if l.startswith('#') and title.lower() in l.lower()]
    if not starts:raise ValueError((n,p,title))
    for start in starts:
        depth=len(ls[start])-len(ls[start].lstrip('#'));end=len(ls)
        for j in range(start+1,len(ls)):
            if ls[j].startswith('#') and len(ls[j])-len(ls[j].lstrip('#'))<=depth:end=j;break
        for line,text in paras(ls[start+1:end],start+2):
            if re.match(r'^(All (?:are|four|remain)|No proposed|None\b|For the lead:)',text):continue
            if text.startswith(('Findings outside my scope:','No menu/received-post','Each topic gives its narrower','The navy, staff, property','Remaining research HOLDs:','The fifteen HOLD records','All bands and representation','The delivery cites read primary','For transfers:','Proposed rulings [I], implemented')):continue
            if n=='people-data' and p=='notes/lane-1.11r3-research.md' and line<224:continue
            if n=='playtest' and p.startswith('docs/playtests/') and line>=143:continue
            add(n,text,p,line)
def lines(n,p,a,z):
    for line,text in paras(blob(n,p).splitlines()[a-1:z],a):add(n,text,p,line)
def manual(n,text,p,needle):add(n,text,p,pathline(n,p,needle),'S32 unpacking of the cited proposal [I]')

# Packet descriptions and lens-specific review questions. Every location below is
# resolved against its branch object, never the audit worktree's version.
META = {
'1a': {
 'summary':'Integrates the five named Phase 1A branches and R97 state-force acts. Includes call doctrine and reassignment, fort battle records, independent initiative admission, a report-only assault experiment, and regenerated schemas/World/save data. The remote hand-over is still explicitly in progress; later S1 build items, named test gaps and the second calibration budget are not delivered at this tip.',
 'evidence':'S1 history reports Manassas on model days 144–146, 58,497 known Union men/four unknown blocks and 130,862 Confederate men/twenty unknown blocks. No unknown block fights. These are model outputs. The Union floor was already nonbinding. The final S1 status is absent from the pinned shared CODEX; S30 and S27 provide downstream evidence for this same integrated runtime, not proof of S1 backlog completion.',
 'lenses':[
  ('Canon and decisions','Check the two appointment contracts, State ownership and the removal of administrative acts from governor compliance. Review the 600-second setup-ceiling proposal separately from the unchanged 40/160 ms production budget.','packages/kernel/src/seats/requests.ts','export function principalMenu','packages/kernel/test/command-establishment.test.ts'),
  ('Determinism','Check durable call IDs, unknown enlistment expiries, response-pruning behavior and bombardment record creation. Regenerate rather than hand-edit schemas, Worlds and the save fixture.','packages/kernel/src/tick/recruitment.ts','export function recruitmentPhase','packages/cli/test/state-forces.test.ts'),
  ('History','Read the state acts and later quantity evidence before accepting state-seat aggregates or the 1,000-men regiment norm. Dates of authority, delivery, muster and transfer must remain separate.','notes/lane-1.7-men-regions.md','### Proposed rulings and limits','packs/union-1861/test/state-forces.test.ts'),
  ('Realism','A fort operation must earn its battle record from actual bombardment. Normal routed appointments may complete after their sourced issue date; a forced historical arrival or invented filtering officer is not a repair.','packages/kernel/src/combat/bombard.ts','export function bombardRecords','packages/kernel/test/bombard.test.ts')],
 'gate':'The seven new administrative notices claim gate.none; review each exact exemption below. The imported combat/transfer work does not lift 0074/R2/R4/R6 or authorize protected-person effects. Existing signed material remains a separate preservation obligation.',
 'extra':'S1 and people-data both change liveness-gate.ts. Their observations come from different input States; choosing either side of the conflict cannot establish a valid integrated band. S18 will also reject unmatched history/fingerprints even though its textual merge is clean.'},
'audit': {
 'summary':'S26 adds a report and twelve evidence files: eleven current contract findings, eight outstanding accepted delivery requirements, three section-10 prose/row discrepancies and sixteen deferred capability groups. S32 adds only this packet directory on the local branch; the pinned remote audit tip below predates S32.',
 'evidence':'S26 reports nine bounded probes, a 196-file/52-root-key writer census with no conflicting implemented writers, 193 resolving source citations and 91 accepted decisions read (0017 retained separately as superseded). Its evidence is for pinned main code, not for the other sprint implementations.',
 'lenses':[
  ('Canon and decisions','Read A02’s explicit legal-menu interpretation before treating candidate filtering as an accepted exception. Route findings; do not turn the report into a superseding decision.','docs/audit/2026-11-21-canon-against-code.md','### A02.','docs/audit/s26-evidence/probes.json'),
  ('Determinism','A08’s World alias and A09’s same-day stale-post cache are bounded API risks. The report distinguishes constructed probes from ordinary frozen request behavior.','docs/audit/2026-11-21-canon-against-code.md','### A08.','docs/audit/s26-evidence/probes-result.json'),
  ('History','Distinguish code evidence from historical verification and inherited source holds; report dates/received succession in A10 cannot be filled from the auditor’s memory.','docs/audit/2026-11-21-canon-against-code.md','### A10.','docs/audit/s26-evidence/situation-causes.json'),
  ('Realism','Assess whether previews and planning expose unreceived truth, and whether the attribution/direction assumptions behind the atrocity sign check are sufficient.','docs/audit/2026-11-21-canon-against-code.md','### A11.','packages/cli/test/done-check.test.ts')],
 'gate':'No new playable draft or signature. A11’s sign/direction assumption and any later sensitive-copy correction need the separate gate reviewer. This packet inventories other lanes; it does not approve them.',
 'extra':'The local S32 commit must be reviewed in addition to pinned 9ab0f5e. Pairwise matrix entries for audit refer to 9ab0f5e, not to the as-yet-uncreated packet commit.'},
'checks': {
 'summary':'Adds B2 cause/exemption, projection-truth, liveness-cause/history and signed-content checks, their fixtures, CI/check wiring and a staged-history hook extension. Production packs/runtime are unchanged. S25 is not present at this remote tip.',
 'evidence':'S18 retains thirteen production findings (ten B2, three projection paths), nine explicit cause exemptions, 338 origin bands and 29 signed paths. The hand-over reports 76 focused controls; no production fix, new sign-off or acceptance waiver.',
 'lenses':[
  ('Canon and decisions','Baseline findings must not grow or become broad exceptions. Classify the exact menu/projection paths and date-only/railroad cases before changing the lists.','tools/rules/existing-findings.json',None,'tools/test/situation-causes.test.ts'),
  ('Determinism','Check AST reachability/helper-closure fingerprints, staged-index handling and append-only history replay. Dynamic dispatch/computed keys remain limits.','tools/rules/projection-truth.ts','export function projectionFindings','tools/test/projection-truth.test.ts'),
  ('History','Exemption citations are authority to review, not historical cause inference. A changed locale/source row must invalidate its exact exemption.','tools/rules/cause-exemptions.json',None,'tools/test/situation-causes.test.ts'),
  ('Realism','A new checker must catch lost prerequisites and stale signatures rather than teach authors to silence them. Reconcile integrated band observations with actual causes.','tools/rules/liveness-causes.ts','export function livenessProblems','tools/test/liveness-causes.test.ts')],
 'gate':'No new situation draft. All 29 known signed paths are inventoried; the checks do not issue replacement approvals. Ten B2 cases involving Native nations and other sensitive topics still need their production/gate classifications.',
 'extra':'Merge this branch only after explicit reconciliation of the integrated state. Its clean textual merge with 1a/perf/desk/people-data does not imply check:rules or staged-history will pass. Existing-findings fingerprints and the frozen band origin are from the pre-integration baseline.'},
'desk': {
 'summary':'S8 builds desk turn flow, attention, accountability, map wait notes and received people views; S19 adds public chamber composition, own attention/audience projections and driver stop preferences, then UI controls/accessibility. S29’s integrated merge/playtest is absent from the remote tip: its interrupted uncommitted work is outside this review snapshot.',
 'evidence':'S29 reports 22 weekly capture sets, 18 historical bundles, all five identified calls, 72 primary capture/recipe pairs and an exact 83-command public-UI replay checkpoint. Final root hook reports 151 files/1,609 passed/one expected failure/three skips; desk 115 passed/three skips. The final focused continuation exits 1 for missing human Manassas. One default campaign: exit 1, Phase 0 5/6, 1A 4/6, ten timing/pushback/sweep problems. No D6, Linux CI or human-battle clearance.',
 'lenses':[
  ('Canon and decisions','Keep the seat boundary and derive Congress only from public composition, received notices and own choices; do not read a hidden ledger as ratification.','packages/kernel/src/view/desk.ts',None,'packages/kernel/test/desk-projections.test.ts'),
  ('Determinism','Stop preferences belong to ConsoleGame; they must not enter State/commands/hashes. Check cache equality after composing the perf candidate-cache changes.','packages/cli/src/console/game.ts','setTurnStops','packages/cli/test/turn-stops.test.ts'),
  ('History','The pack has no published party-count data at this tip; bloc support is not a count of seats. Future composition and unreceived audience cases must stay invisible.','packages/kernel/src/politics/rules.ts','composition','packages/kernel/test/desk-projections.test.ts'),
  ('Realism','A sent slip is not compliance; an objection is not an audience request. Check wait-note grammar, rejected occurrences, keyboard focus/reflow and the still-missing prospective case.','prototypes/desk/web/DeskViews.tsx',None,'prototypes/desk/test/s19.spec.ts')],
 'gate':'No new signature or historical likeness. Rendering existing sensitive papers still requires their approved agency/uncertainty/terms to survive. No missing policy/cost/ratification is invented by these views.',
 'extra':'S29 includes 1a, so their earlier generated-schema conflicts are resolved at this pin; preserve that generated source union. view/view.ts still conflicts with perf, and liveness-gate.ts conflicts with people-data. S29 proves no human Manassas dispatch; the separate automated battle is not substitute evidence. Its appointment table has Butler only, with McDowell/Patterson absent. Pending S33 is outside this packet?s delivered scope.'},
'people-data': {
 'summary':'Incremental S9 apply/date holds, a curated one-row S6 opt-in, four unsigned people recommendations and S16 runtime data. S16 defers all new Seward/Walker row changes and changes only the initiative liveness band to around(3). Final held list is 414; 102 of 261 people change and all fifteen service-owned rows are protected.',
 'evidence':'S9’s initially blocked applied candidate is superseded by S16, whose unchanged historical tests pass. Warnings remain 17 identical cells. S16 reports reproducible apply outputs, historical wire/bombardment/evacuation assertions and a full check; its campaign still fails timing and four 1A criteria.',
 'lenses':[
  ('Canon and decisions','Inspect incremental ownership, source-date cutoffs, whole-row deferrals and HOLD semantics. Later research must not erase accepted cells through the old apply.','docs/research/_resource/tools/apply-s9.js','function applyS9','packs/union-1861/test/s9-people-apply.test.ts'),
  ('Determinism','Normalization/deduplication and reapply must reproduce all four outputs byte for byte; preserve service rows and durable citations.','docs/research/_resource/tools/apply-s9.js','function applyS9','packs/union-1861/test/s9-people-apply.test.ts'),
  ('History','Seward’s April motives and Walker’s April direction are not proven March-5 values. Keeping the baseline is a deliberate deferral, not new verification of that baseline.','notes/lane-1.11r3-research.md','**Seward proposed ruling:**','packages/cli/test/union-opening.test.ts'),
  ('Realism','Verify the unchanged memorandum and extra bypass assertions. Explain the initiative-band change from held Bates/Smith motives rather than suppressing historical refusal.','notes/lane-1.11r3-research.md','Only **`seats.initiative`**','packs/union-1861/test/r47-authoring.test.ts')],
 'gate':'Four recommendations in s9-people-gate.json remain unsigned: Sumner/Wilson antislavery traits, Houston slavery_defence and Clark state_autonomy. Clark’s companion slavery_defence HOLD must be reviewed with his value. 0074 costOnly remains binding.',
 'extra':'liveness-gate.ts conflicts with 1a, perf and playtest. The S16 around(3) observation uses its own pre-integration input set; do not overwrite S1’s independently recentered integrated bands. A merged data change also invalidates using S30 hashes as preservation proof of the combined runtime.'},
'perf': {
 'summary':'Contains all integrated 1a commits plus S2/S20/S30 optimizations: report batching, caller-owned immutable-input caches, unposted-roster/force-presence derivations, candidate-graph reuse, report-route holder lookup and one-pass command membership. Each retained optimization has a separate commit; rejected freezer/view/relay/wire/planner candidates are not delivered.',
 'evidence':'S30 reports all 268 daily hashes matching its integrated baseline, replay/save/resume equality, and one default run: Phase 0 6/6, 1A 4/6; war/history medians 27.83/26.30 ms. Linux CI and unloaded 20 ms aim remain unestablished. Paired savings are nonadditive; holder lookup has a negative war estimate.',
 'lenses':[
  ('Canon and decisions','Review the integrated ancestry as well as each perf commit. Derived holder/membership/candidate data must remain caller-owned and never persisted.','notes/lane-s2-perf.md','## S30 proposed rulings','packages/kernel/test/post-membership.test.ts'),
  ('Determinism','Batch reports only across consecutive reports and flush before every intervening reader. Check exact identity keys, retained older States, duplicates, vacancies and force transfers.','packages/kernel/src/tick/deliver.ts','export function deliverDue','packages/kernel/test/report-delivery.test.ts'),
  ('History','Preserve inherited signed/pack/calibration inputs and S1’s unresolved dates/unknowns. Performance equality does not prove historical validity.','notes/lane-s2-perf.md','## S30 settled verification','packages/kernel/test/self-emancipation-lookup.test.ts'),
  ('Realism','The same-day post-identity view-cache bug remains inherited and unresolved. Do not broaden morning-view sharing just because the candidate graph is safely reusable.','notes/lane-s2-perf.md','same-day reassignment','packages/kernel/test/principal-candidate-cache.test.ts')],
 'gate':'No new standalone draft. Inherits 1a’s seven administrative gate.none claims. The self-emancipation lookup optimization must preserve every term, cadence and agency path; performance equality is not D6 clearance.',
 'extra':'1a is an ancestor; review/merge it first, then the perf-only delta. view/view.ts conflicts with desk; liveness-gate.ts conflicts with people-data. Pairwise clean checks with the S18 tooling do not resolve its fingerprint/history requirements.'},
'plan-1b': {
 'summary':'Proposes 26 lanes (1.15–1.40), 26 corresponding design notes, a revised bounded dependency sequence and fourteen external unnumbered decision drafts D01–D14. The final remote commit contains the eighteen notes whose earlier status/hand-over said commit delivery was blocked; it does not retroactively satisfy the per-note-commit request.',
 'evidence':'The hand-over reports a 64-node/173-edge acyclic dependency audit, not estimates of duration or proof of sources/acceptance. Eight individual S11 note commits plus a final combined eighteen-note commit are present. D01–D14 are separately hash-checked in this packet’s evidence; the S11 text requires reconciliation before acceptance.',
 'lenses':[
  ('Canon and decisions','Distinguish proposals from accepted records. Review explicit amendments to 0073/0074/0076/0081 and principal-only 0052 commands before opening implementation.','docs/design/PHASE-1B-PROPOSAL.md','## 11.','docs/design/1b/1.15-entry-and-acceptance.md'),
  ('Determinism','Check one owner per proposed field, temporal evidence/knowledge, save/replay contracts and the stores-unit seam before physical split/rejoin changes.','docs/design/1b/1.22-evidence-and-gate-format.md',None,'docs/design/1b/1.39-phase-one-check.md'),
  ('History','The November integration endpoint cannot erase December/later held topics. New source needs are proposals; source pages were not newly verified by the plan.','docs/design/PHASE-1B-PROPOSAL.md','## 1.','docs/design/1b/1.21-gate-research-gaps.md'),
  ('Realism','Require actual consequence owners, institution/receipt contracts, campaign people restrictions and lawful availability. A declared interface is not a working response chain or full D6 measure.','docs/design/PHASE-1B-PROPOSAL.md','## 6.','docs/design/1b/1.40-exit-review.md')],
 'gate':'External D08–D14 and all sensitive facets in the design notes are unsigned proposals. They retain R2/R3/R4/R6/R7, capture-before-Black-service, the camps hold and terminal verdict restrictions; no design note authorizes an atrocity lever.',
 'extra':'No textual conflicts. Source branches and gate classification should be reviewed before accepting data/mechanic contracts. Merging proposal documents does not open 1B or waive the separate 1A exit review/playtest.'},
'playtest': {
 'summary':'Inherits 1a and adds S27’s five console-only July playthroughs, transcript-derived evidence/audit, nine reported-defect regressions and a normal-suite collector. No production correction, band, historical assertion, signature or player copy changes.',
 'evidence':'Five strategies, 217 turns/740 July days, all reach July without main-strategy parser/send-time failures or crashes. None sees an hour-stamped field-battle dispatch by July; the independent rule-seat history does fight at Manassas. The first actionable morning is March 6, leaving the requested March-5 criterion unmet.',
 'lenses':[
  ('Canon and decisions','Read B01 and B09’s explicit owner interpretations. Preserve console-only player setup and distinguish menu/receipt knowledge from physical truth.','docs/playtests/2026-11-21-console-playtests.md','**B01**','docs/playtests/s27-console-regressions.test.ts'),
  ('Determinism','Fixture assertions must run outside expected-failure wrappers; transcript derivation must not read State/World. An unexpected pass should become an ordinary passing regression.','docs/playtests/s27-console-regressions.test.ts',None,'packs/union-1861/test/s27-console-playtests.test.ts'),
  ('History','Do not infer event dates from report receipt, or trait/appointment corrections from a playtest observation. Five strategies are not independent seeds or historical-source verification.','docs/playtests/2026-11-21-console-playtests.md','## What each strategy','docs/playtests/s27-audit.mjs'),
  ('Realism','Prioritize unreadable closed notices and hold flags parsed as places; preserve legitimate resistance. Summaries must retain timing, bypass and audience arguments.','docs/playtests/2026-11-21-console-playtests.md','**B02**','docs/playtests/s27-writing-regressions.test.ts')],
 'gate':'No new sensitive-copy draft. B06 hides authored notice bodies; B09 flags two existing substantive policy labels. Any later rewrite needs author/gate review and renewed content hashes, not policy removal to shorten text. Inherits 1a’s seven gate.none notices.',
 'extra':'1a is an ancestor; changes beyond it are only the eight S27 paths. People-data still conflicts through inherited liveness-gate.ts; desk conflicts through inherited generated schemas. A later production fix may make an expected-failure test unexpectedly pass.'},
'research-cast': {
 'summary':'S6/S12/S22 add dated cast/governor/officer/regard research and sidecars. S6: 55 people/532 cells. S12: a substantial bounded pool, not exhaustive tenure coverage. S22: 169 records/132 directed pairs, 148 regard CHANGE proposals and 23 officer-stat CHANGE proposals; every experience cell remains HOLD.',
 'evidence':'Research identities, observation/transmission dates and conflicting witnesses are explicit. The old apply clears HOLD and lacks temporal semantics; do not feed these tables into it. Source scans remain external; selected-page reading is not whole-volume verification.',
 'lenses':[
  ('Canon and decisions','Preserve 0085/0087’s gifts/temporal evidence boundaries and research-HOLD semantics. The sole S6 timely candidate was separately curated by S9.','docs/research/S6/README.md',None,'packs/union-1861/test/resource-apply.test.ts'),
  ('Determinism','Directed regard requires deliberate principal/named override reconciliation; repeated cells cannot become uncontrolled last-row-wins updates.','docs/research/S22/README.md',None,'packages/kernel/test/people-verbs.test.ts'),
  ('History','Read exact original/quoted dates, excluded later reports, provisional identities and commission/assumption distinctions. No promotion, wound or appointment is itself a true-stat appraisal.','docs/research/S22/source-boundaries.csv',None,'docs/research/S22/sources.md'),
  ('Realism','Planner confidence is drafter→partner; actual compliance reads subordinate→issuer. Hostile and favorable witnesses must not become one averaged reputation or reciprocal affection.','notes/sprint-S22-regard.md','Use the actual consumer direction','packages/kernel/test/plans.test.ts')],
 'gate':'Review sensitive value/motive rows and their later use, including Brown/Milton/McClellan S6 draft rows. All non-none gate sidecar rows are listed below; generic research-draft labels are triage, not automatic gate-topic assignments. S12/S22 source claims involving coercion/slavery/prisoners/civilians need facet review on adoption.',
 'extra':'No textual conflicts. Applying this research is a separate, dated integration decision. S6’s 67 later observations and S12/S22 HOLDs must not replace the protected March baseline or service-owned fields.'},
'research-foreign-economy': {
 'summary':'S5 research plus S15 draft calls, quotas, service terms, finance/industry/foreign observations, and S24 route/depot/supply drafts. The remote tip includes the S24 combined delivery even though its own retained hand-over/status says hook-blocked; inspect its commit and subsequent review evidence separately.',
 'evidence':'S24 has 642 rows in thirteen CSVs, including 37 route candidates/76 depots. Model capacity/travel/depth/seasonal fields remain blank; seven depot regions and two coarse self-loop segments are held. No draft is loaded, no World or live economy is changed.',
 'lenses':[
  ('Canon and decisions','Authority, quota, enrollment, muster, retention and expiry are different stages. An exemption classification does not authorize managing protected people.','notes/sprint-S15-manpower-economy.md','## Proposed rulings','packs/union-1861/source/drafts/calls/1862/README.md'),
  ('Determinism','Preserve physical units, currencies, periods and reporting scopes before import. No conversion of yearly freight/purchases/gauge observations into daily runtime capacity is established.','packs/union-1861/source/drafts/supply/README.md',None,'packs/union-1861/source/drafts/supply/unresolved-inputs.csv'),
  ('History','Read the evidence-note arithmetic/date conflicts and separate orders/promises/purchases from fulfilled stocks. Private diplomatic documents are not immediately Lincoln’s knowledge.','packs/union-1861/source/drafts/supply/evidence-notes.md',None,'packs/union-1861/source/drafts/foreign/README.md'),
  ('Realism','Break-of-gauge, terminals, interrupted routes, dated access and Vicksburg continuity require map-owner adoption. No bypass edge or free local coercive supply may emerge from a clean merge.','packs/union-1861/source/drafts/supply/map-needs.csv',None,'packs/union-1861/source/drafts/supply/map-joins.csv')],
 'gate':'Conscription/exemptions, slavery-linked taxes and labor, civilian acquisition/coercion, cotton ownership and emancipation/foreign reception need gate review before player use. Draft file inventory below deliberately includes all source tables for classification; not every economic quantity is itself a gated facet.',
 'extra':'No textual conflicts. There is no modeled capacity/stock time series to approve by merging research. The final S24 commit proves content presence; its retained failed hooks are not rewritten into passing evidence.'},
'research-gate': {
 'summary':'S7 primary-source notes and S23’s 33 unsigned topic dossiers: twenty inherited-entry continuations and thirteen additions, with common rules, coverage, sources and verification. The live register, source policy, strings, runtime and all signatures are untouched.',
 'evidence':'S23 reports 4,361 focused checks, 28 evidence refs, 45 refusal signatures/16 new and 97 trigger candidates. Visible/hidden loader results match. Those author checks are not placement, end-to-end matcher approval or D6 clearance; five wholly later topics remain outside November.',
 'lenses':[
  ('Canon and decisions','Preserve all inherited windows/holds/refusals, conduct-specific fugitive restrictions and the R2/R4 capture prerequisite. A typed agency reason is not an implemented consequence owner.','packs/union-1861/gate/drafts/README.md','## Proposed rulings','packs/union-1861/test/gate-register.test.ts'),
  ('Determinism','Check refusal regex/trigger boundaries against proper-noun exceptions and actual end-to-end loader matching. Schema/positive-negative probes alone do not prove future integrated coverage.','packs/union-1861/gate/drafts/verify.mjs',None,'packs/union-1861/test/gate-register.test.ts'),
  ('History','Retain Hunter/Stanton/Pierce disagreements, later testimony provenance, the clothing-payment qualification and unresolved captives/Barker/Palmyra/committee sources.','packs/union-1861/gate/drafts/sources.json',None,'packs/union-1861/gate/drafts/verify.mjs'),
  ('Realism','Agency cannot stand in for atrocity sign/dependency checks. Reject authorization-to-strength conversion, execution levers, automatic service returns and rates built from incompatible denominators.','packs/union-1861/gate/drafts/black-enlistment.draft.json','proposedRuling','packs/union-1861/test/gate-register.test.ts')],
 'gate':'Every one of the 33 dossiers below requires the separate gate reviewer. Facet recommendations, refused signatures, proposed agency vocabulary, groups, triggers and wording examples remain unsigned. The committee candidate and whole-topic camps hold are not source-clearance by this packet.',
 'extra':'No textual conflicts. The S23 README is its hand-over (S7’s original note is intentionally unchanged). S23 explicitly reuses S7 runtime evidence after preservation/loader proof; no new runtime-clearance claim.'},
'research-military': {
 'summary':'S4 research, S14 dated OOB/checkpoint drafts, S21 and S31 strength follow-ups. The same 416 observations/62 snapshots now have 267 numeric observations and 149 unknowns. Numeric entries retain their reported/estimated/reconstructed/bound status; no live force, store, post or checkpoint is applied.',
 'evidence':'S31 adds fourteen limited quantities, not fourteen exact all-arms battle-day duty returns. No individual original Army manuscript morning return or Navy ship muster was read. Battle checkpoint kinds remain unsupported by today’s schema; Confederate national-strength and actual stores remain held.',
 'lenses':[
  ('Canon and decisions','Unknown-strength acceptance is not waived by an unloaded draft or by a harness with zero Union battle records. Select nonoverlapping temporal forces before application.','packs/union-1861/source/drafts/oob/1862/README.md',None,'packages/cli/test/done-check.test.ts'),
  ('Determinism','Parent/child/successive snapshots are nonadditive. Resolve identity/service joins and each measure explicitly before generating a scenario.','packs/union-1861/source/drafts/oob/1862/observations.csv',None,'packages/pack-format/test/validate.test.ts'),
  ('History','Inspect exclusive bounds, source conflicts, Carman reconstructions and excluded game roster; a nearby-date return cannot fill a missing earlier count.','docs/research/2026-11-21-S31-strength-dispositions.csv',None,'docs/research/2026-11-21-S31-source-inventory.json'),
  ('Realism','Hulls are not crews, provision orders are not fulfilled stores, and the meeting of fleets does not establish sustained naval control. No invented arm split or nominal regiment headcount fills the 149 blanks.','notes/sprint-S14-oob-drafts.md','Preserve naval/supply evidence types','packs/union-1861/source/drafts/oob/1862/stores-observations.csv')],
 'gate':'Surrender/exchange/confinement, Native-nation participation, civilian property and alleged fire on people in the water need protected review on use. All draft tables/checkpoint proposals are inventoried below for facet triage; ordinary strength rows do not acquire a gate placement merely from this inventory.',
 'extra':'No textual conflicts. Do not interpret national/battle envelope shape as schema support or a scheduled historical battle. Source research, identity adoption, supported observations and scenario application remain separate steps.'},
'research-politics': {
 'summary':'S3 research and S17 unloaded Congress/member/session/vote/press/state observations plus nineteen election checkpoint proposals. All 151 original winners in sixteen states are recorded under local-ticket labels; later elections, vacancies and seating remain separate.',
 'evidence':'The serving 37th is not replaced on election night. Reference groups 71 D/one Independent D/79 Republican–Union–Emancipation are a November contest classification, not the Directory’s wider 184-member series or a runtime coalition. All runtime press reach and permanent factions remain unknown.',
 'lenses':[
  ('Canon and decisions','Review the proposed November checkpoint, exact-winner/state constraints and the unsupported election observation kind before adoption. Do not relax a bound merely because a national total passes.','notes/sprint-S3-politics.md','## Proposed rulings','packs/union-1861/source/drafts/politics/README.md'),
  ('Determinism','Temporal member/session intersections are possibilities, not simultaneous seats; parties, factions and actual authority need explicit joins.','packs/union-1861/source/drafts/politics/README.md',None,'packages/cli/test/done-check.test.ts'),
  ('History','Read first-confiscation tally conflict, Vermont’s later return, Hanchett’s vacancy and S17’s corrections without silently repairing S3. Printed margins that disagree with components remain attributed.','notes/sprint-S3-politics.md','New page-backed corrections','packs/union-1861/source/drafts/politics/sources.json'),
  ('Realism','Circulation copies are not unique readers, persuasion or runtime reach. A governor party does not determine legislative control or actual policy.','notes/sprint-S3-politics.md','Every runtime reach','packs/union-1861/source/drafts/politics/README.md')],
 'gate':'Confiscation/emancipation/slavery legislation, press suppression/distribution constraints and allegations, Black rights and other sensitive authored uses need separate gate review. Inventory all draft tables/checkpoint proposals below; ordinary election counts remain source observations, not signed gate content.',
 'extra':'No textual conflicts. The desk composition API and this research have no accepted crosswalk. Do not import source classifications directly as bloc support, session authority or party counts without review.'},
'situations-1862': {
 'summary':'S13/S28 add 115 unsigned, unloaded situation JSON drafts with separate strings, topics, source/reading/hold ledgers and isolated tests. S28’s 42 drafts include Davis decisions and bounded period advocates; ordinary structural loading is distinct from promotion.',
 'evidence':'S28 reports nineteen ordinary drafts pass isolated structural loading and 23 retain unsigned/cost/topic holds. Documentary received-paper prerequisites are not the actual physical/institutional act. Seward’s complete victory-condition advice, typed acts, posts, cost owners and full receipt routes remain held.',
 'lenses':[
  ('Canon and decisions','Check 0040/0041/0046/0057/0100/0104: every option needs sourced advocacy and an existing consequence owner; a notice must wait for the actual cause.','notes/sprint-S28-situations.md','## Proposed rulings','packs/union-1861/test/s28-drafts.test.ts'),
  ('Determinism','Prove drafts stay outside live loading and that isolation tests retain actual blockers. A fabricated documentary ID/knowledge condition is not an implemented report producer.','packs/union-1861/situations/drafts/s28/validate.ts',None,'packs/union-1861/test/s13-drafts.test.ts'),
  ('History','Preserve letter/order/reply/law stages, actual receipt and bounded advocates; later memoirs cannot become contemporary minutes. Keep the October protected-population exemption facet an event.','packs/union-1861/situations/drafts/s28/s28_cs_october_exemption_act.json','citations','packs/union-1861/test/s28-drafts.test.ts'),
  ('Realism','Empty effects/cost arrays represent missing owners; do not claim a functioning policy or fill penalties from intuition. Proposed gate.none facets still need classification.','notes/sprint-S13-situations.md',None,'packs/union-1861/test/s28-drafts.test.ts')],
 'gate':'All 115 exact drafts are enumerated below, including proposed gate.none. Topic/placement/acting-side claims are review candidates; null gateReview and cost/record/source blockers remain real. Review accompanying translations, sources, options and advocates with each candidate.',
 'extra':'No textual conflicts, but shared S23 topics/expiry proposals and S11 future-owner contracts do not make these drafts runnable. No new live source-table adoption or signature is included.'}
}

def collect_primary():
    # Explicitly named ruling sections, plus inline recommendations that a
    # heading-only search would omit.
    sources={
      'audit':[('docs/audit/2026-11-21-canon-against-code.md','## Proposed rulings')],
      'checks':[('notes/sprint-S18-checks.md','## Proposed rulings')],
      'people-data':[('notes/lane-1.11r3-research.md','### Proposed rulings')],
      'perf':[('notes/lane-s2-perf.md','## Proposed rulings'),('notes/lane-s2-perf.md','## S20 proposed rulings'),('notes/lane-s2-perf.md','## S30 proposed rulings')],
      'research-cast':[(f'notes/sprint-S{s}-{tail}.md','proposed rulings') for s,tail in [(6,'cast'),(12,'cast'),(22,'regard')]],
      'research-foreign-economy':[(f,'proposed rulings') for f in ['notes/lane-s5-foreign-economy.md','notes/sprint-S15-manpower-economy.md','notes/sprint-S24-supply.md']],
      'research-military':[(f,'proposed rulings') for f in ['notes/sprint-S4-research-military.md','notes/sprint-S14-oob-drafts.md','notes/sprint-S21-unknown-strengths.md','notes/sprint-S31-unknown-strengths.md']],
      'research-politics':[('notes/sprint-S3-politics.md','## Proposed rulings')],
      'research-gate':[('packs/union-1861/gate/drafts/README.md','## Proposed rulings')],
      'situations-1862':[('notes/sprint-S28-situations.md','## Proposed rulings')],
      'plan-1b':[('notes/lane-1b-plan.md','## S10 proposed rulings')],
      'playtest':[('docs/playtests/2026-11-21-console-playtests.md','## Proposed rulings')],
      'desk':[('docs/playtests/2026-11-21-desk-history-run.md','## Proposed rulings')]
    }
    for n,items in sources.items():
        for p,title in items:
            archived(n,p);section(n,p,title)
    # Strip commit inventories and administrative introductory paragraphs from
    # mixed 'Commits and proposed rulings' sections, retaining each actual choice.
    for n in RULES:
        RULES[n]=[r for r in RULES[n] if not re.match(r'^(?:`[0-9a-f]{7}`|The final .*batch|The Western/non-battle|All proposed choices|The fourteen external|For the lead:|Review D0|The resulting|Lead:)',r['text'])]
    for p,title in [('notes/lane-1.7-men-regions.md','### Sources and proposed rulings'),('notes/lane-1.7-men-regions.md','### Proposed rulings and limits'),('notes/lane-1.12-rule-seats.md','### Proposed rulings [I]')]:section('1a',p,title)
    manual('1a','Keep initiativeAt as an independent required pack rule, at behavior-preserving 150 in both packs; reject retaining the trial complyAt=10 as production calibration.','notes/lane-1.5-people-verbs.md','### One measured comparison')
    lines('1a','notes/lane-1.5-people-verbs.md',139,139)
    manual('1a','Keep both effective-date appointments and cause-dependent reassignment; reject dropping either side’s resignation-aware/dated contract during integration.','notes/lane-1.14-done-check.md','Merge 3 preserves')
    lines('1a','notes/lane-1.14-done-check.md',23,23)
    manual('1a','Use bounded test-file concurrency after the retained failures, with a 600-second runner setup ceiling; reject skipping setup, suppressing criteria or treating the ceiling as a relaxed production tick budget.','notes/lane-1.14-done-check.md','Proposed rulings: retain')
    manual('1a','Keep R93 as a report-only parked contact experiment; reject retaining its failed exposure formula or moving historical/loss bounds to make it pass.','notes/lane-1.14-done-check.md','Merge 5 is the read R93')
    for n in ['desk','perf','playtest']:
        # Inherited rulings are reviewed once in 1a; this records their coverage
        # without duplicating the full integration packet.
        add(n,'Inherits every integration proposal in 1a.md, including the runner ceiling, appointment contracts, call/transfer representation and parked R93 experiment. Review them with 1a; neither descendant supersedes those choices.','notes/lane-1.14-done-check.md',3,'inherited coverage')
    for needle,text in [
      ('Proposed rulings: use public','Use public chamber records and own recorded choices; reject certifying ratification from hidden congressLedger state.'),
      ('explicit audience requests','Show explicit audience requests and own invitations; reject an objection as a request or reconstruction of a private prospective case.'),
      ('keep stop settings','Keep stop preferences in the console driver; reject new State or simulation commands.'),
      ('composition`','Use dated cited public composition; reject converting bloc support/voice into legislative seat counts.')]:manual('desk',text,'notes/sprint-S19-desk.md',needle)
    for needle in ['**Seward proposed ruling:**','**Walker proposed ruling:**','Only **`seats.initiative`**']:manual('people-data',blob('people-data','notes/lane-1.11r3-research.md').splitlines()[pathline('people-data','notes/lane-1.11r3-research.md',needle)-1],'notes/lane-1.11r3-research.md',needle)
    lines('research-politics','notes/sprint-S3-politics.md',91,91)
    lines('research-politics','notes/sprint-S3-politics.md',103,103)
    # S13's hand-over uses numbered 'For the lead' choices instead of a named
    # proposed-rulings heading; its complete numbered recommendations are kept.
    archived('situations-1862','notes/sprint-S13-situations.md')
    for line,text in paras(blob('situations-1862','notes/sprint-S13-situations.md').splitlines(),1):
        if re.match(r'^\d+\.',blob('situations-1862','notes/sprint-S13-situations.md').splitlines()[line-1]):add('situations-1862',text,'notes/sprint-S13-situations.md',line)
    # Unpack S11's dense hand-over using the exact, more specific self-review
    # table. Every table row carries its choice and rejected alternatives.
    p='docs/design/PHASE-1B-PROPOSAL.md';archived('plan-1b',p)
    ls=blob('plan-1b',p).splitlines();start=next(i for i,l in enumerate(ls) if l.startswith('## 11.'))
    for line,text in paras(ls[start+1:],start+2):
        if text.startswith('|') and '---' not in text and not any(word in text.lower() for word in ['| finding |','| issue |','| boundary |','| seam |']):add('plan-1b',text,p,line,'S11 self-review table')
    return sources

def status_blocks():
    # Keep only author statuses, not requests or acceptance messages. Original
    # shared-file line numbers accompany each preserved message.
    blocks={n:[] for n in B};old=[]
    for record in json.loads((E/'status-source.json').read_text(encoding='utf-8')):
        req=record['request']
        targets=[n for n,nums in STATUS_MAP.items() if req.startswith('S') and int(req[1:]) in nums]
        if req.startswith('R') and int(req[1:]) in [84,89,90,91,92,93,94,95,96,97,98]:targets=['1a'];old.append(record)
        for n in targets:blocks[n].append(record)
    (E/'CODEX-pre-sprint-statuses.md').write_text('\n\n'.join(f'<!-- Original CODEX.md:{r["originalLine"]} -->\n'+'\n'.join(r['lines']) for r in old).rstrip()+'\n',encoding='utf-8',newline='\n')
    save=[]
    for n,bs in blocks.items():
        for b in bs:
            body=b['lines']; active=False
            for off,text in paras(body,b['originalLine']):
                # Explicit ruling blocks and their following numbered/bulleted
                # choices; end at the next bold-labelled non-ruling paragraph.
                local=off-b['originalLine'];src=body[local]
                marker='roposed ruling' in text
                if marker and (text.startswith(('**','Proposed rulings','1.')) or '[I]' in text):active=True
                elif active and src.startswith('**') and not src.startswith('**[I]') and 'roposed' not in src:active=False
                elif active and (src.startswith('Status:') or src.startswith('###')):active=False
                meaningful_marker=marker and any(w in text.lower() for w in ['reject','recommend','propose retaining','propose only','proposed ruling [i]:'])
                if text.startswith(('**1. Delivery','**2. Audit and','**Butler is not delivered;')):meaningful_marker=False
                if meaningful_marker or (active and re.match(r'^\s*(?:\d+\.|[-*])\s',src)):
                    if text.startswith(('For the lead:','###')):continue
                    # The entire source paragraph is retained. Status-only
                    # rulings and withdrawn proposals cannot disappear through
                    # deduplication with a later hand-over.
                    add(n,text,'CODEX.md',off,f'{b["request"]} author status')
            save.append({'branch':n,'request':b['request'],'originalLine':b['originalLine'],'lineCount':len(body)})
    (E/'status-coverage.json').write_text(json.dumps(save,indent=2)+'\n',encoding='utf-8')
    return blocks

def external_decisions():
    folder=pathlib.Path('C:/Pyrrhic/mandate-reviews/decision-drafts/1b')
    hand=blob('plan-1b','notes/lane-1b-plan.md');out=[]
    for f in sorted(folder.glob('D*.md')):
        data=f.read_bytes();digest=hashlib.sha256(data).hexdigest()
        if f.name not in hand or digest not in hand:raise ValueError(('external draft hash mismatch',f))
        dest=E/'external-decisions'/f.name;dest.parent.mkdir(exist_ok=True);dest.write_bytes(data)
        txt=data.decode('utf-8-sig');ls=txt.splitlines();start=next(i for i,l in enumerate(ls) if l=='## Decision');end=next((i for i in range(start+1,len(ls)) if ls[i].startswith('## ')),len(ls))
        parts=paras(ls[start+1:end],start+2)
        # External decision is one explicit candidate ruling, retaining all its
        # clauses and rejected alternatives as a reviewable sub-list.
        reject_at=next((i for i,(_,t) in enumerate(parts) if t.startswith('Rejected:')),len(parts))
        code=f.stem.split('-')[0]
        rejected=[t for _,t in parts[reject_at+1:]]
        ALTERNATIVES[code]=rejected
        for line,text in parts[:reject_at]:
            ids=', '.join(f'{code}.A{i}' for i in range(1,len(rejected)+1))
            add('plan-1b',f'**{code}** — '+text+f' Rejected alternatives: [{ids}](#{code.lower()}-alternatives), listed below once for all clauses of this draft.',f'_external/{f.name}',line,'external decision clause, hash-verified')
        out.append({'file':f.name,'sha256':digest,'path':str(f),'gate':int(f.name[1:3])>=8})
    if len(out)!=14:raise ValueError('expected fourteen indexed external drafts')
    (E/'external-decisions.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')

def gate_inventory(n):
    records=[]
    for p in changes(n):
        if not p.endswith('.json') or not ('/drafts/' in p or '/situations/' in p):continue
        try:j=json.loads(blob(n,p))
        except (json.JSONDecodeError,RuntimeError):continue
        if 'entry' in j and 'proposedRuling' in j:
            entry=j['entry'];ln=pathline(n,p,'"proposedRuling"')
            records.append((p,j.get('topic'),', '.join(entry.get('placements',[])),str(entry.get('status'))+'; dependencies '+', '.join(j.get('reviewDependencies',[]))))
            choice=j['proposedRuling']+' Rejected alternatives: '+'; '.join(j.get('rejectedAlternatives',[]))
            add(n,choice,p,ln,'S23 topic-specific proposal')
        elif 'id' in j and 'gate' in j:
            g=j['gate'];topics=', '.join(g.get('topics',[])) if isinstance(g,dict) else str(g)
            if isinstance(g,dict) and 'none' in g:topics='proposed gate.none'
            records.append((p,j['id'],topics, g.get('placement','classification review') if isinstance(g,dict) else 'review'))
        elif 'recommendations' in j:
            for rec in j['recommendations']:records.append((p,rec['person']+'/'+rec['cell'],rec['decision'],rec.get('gateReason','unsigned recommendation')))
            for rec in j.get('companionHolds',[]):records.append((p,rec['person']+'/'+rec['cell'],'companion HOLD',rec.get('basis','')))
    # Every source draft is enumerated for classification, rather than implying
    # that a broad file-level topic search approves its ordinary rows.
    for p in changes(n):
        if '/source/drafts/' in p or re.search(r'checkpoints.*\.draft\.json$',p):
            if p.endswith(('.csv','.json','.md')):records.append((p,'source/observation draft','facet triage','Unloaded; no placement/signature follows from its presence.'))
    if n=='research-cast':
        for p in changes(n):
            if p.endswith('.csv'):
                rows=list(csv.DictReader(io.StringIO(blob(n,p))))
                for index,row in enumerate(rows,2):
                    gate=row.get('gate')
                    if gate and gate not in ['none','unsigned research draft']:
                        records.append((p,row.get('person',row.get('observer',''))+'/'+row.get('cell',''),gate,f'CSV record {index-1}; research only'))
    if n=='plan-1b':
        for rec in json.loads((E/'external-decisions.json').read_text()):
            if rec['gate']:records.append(('_external/'+rec['file'],rec['file'][:3],'gate decision draft','Hash-verified external candidate; reconcile S11 before acceptance.'))
        for p in changes(n):
            if p.startswith('docs/design/1b/'):records.append((p,'design proposal','facet triage','Read its gate section; ordinary notes are not automatically gated systems.'))
    GATES[n]=records

def source_link(n,p,line):
    if p=='CODEX.md':
        # Original CODEX lines are stable under append-only coordination.
        return f'CODEX.md:{line} (preserved in the linked status snapshot)'
    if p.startswith('_external/'):
        f=p.removeprefix('_external/');return f'[{f}:{line}](_evidence/external-decisions/{f})'
    pathline(n,p)  # records existence; explicit line bounds checked below
    ls=blob(n,p).splitlines()
    if line>len(ls):raise ValueError((n,p,line))
    REFS.append({'branch':n,'sha':B[n]['sha'],'path':p,'line':line,'needle':None})
    return f'[{p}:{line}](https://github.com/horkesh/Mandate/blob/{B[n]["sha"]}/{quote(p,safe="/")}#L{line})'

def rewrite_source_links(n,p,text):
    def replace(m):
        label,target=m.groups()
        if re.match(r'^(?:https?://|[A-Za-z]:[/\\])',target):return m.group(0)
        if p.startswith('_external/') or p=='CODEX.md':return m.group(0)
        path,sep,anchor=target.partition('#')
        dest=posixpath.normpath(posixpath.join(posixpath.dirname(p),path)) if path else p
        if dest.startswith('../'):return m.group(0)
        return f'[{label}](https://github.com/horkesh/Mandate/blob/{B[n]["sha"]}/{quote(dest,safe="/")}'+(f'#{anchor}' if sep else '')+')'
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)',replace,text)

def write_packet(n,blocks):
    b=B[n];m=META[n];rules=RULES.get(n,[])
    # Exact duplicate source paragraphs need only one ruling. Differently worded
    # status restatements remain visible; the lead may rule on them together.
    seen=set();unique=[]
    for r in rules:
        key=(r['path'],r['line'],r['text'])
        if key not in seen:seen.add(key);unique.append(r)
    RULES[n]=rules=unique
    out=[f'# sprint/{n}: review packet','',f'Pinned remote tip: `{b["sha"]}`. Comparison: `origin/main...origin/sprint/{n}` at main `{D["main"]}`; merge base `{b["mergeBase"]}`. Snapshot: {D["utc"]}.','', 'This is navigation for the standing reviewer and the lead under 0106. It is not a verdict, accepted ruling, gate sign-off or permission to merge. Locations below refer to the pinned branch, not to the audit worktree.','', '## What changes','',m['summary'],'',f'{len(b["commits"])} commits reachable from the branch but not pinned main; {len(b["changes"])} changed paths. Descendants include shared commits; counts across packets must not be added. Immutable [full diff](https://github.com/horkesh/Mandate/compare/{D["main"]}...{b["sha"]}) and [inventory](_evidence/inventory.json). Raw git diff, its command, size and SHA-256 are retained under `_evidence/validation-raw/diffs/` (local, ignored), with the receipt in the inventory.','', '### Commits','', '| Commit | Subject |','|---|---|']
    for row in b['commits']:
        sha,parents,subject=row.split('\t',2);out.append(f'| [`{sha[:12]}`](https://github.com/horkesh/Mandate/commit/{sha}) | {subject.replace("|", "&#124;")} |')
    out+=['','### Files and areas','','| Change | Path |','|---|---|']
    for row in b['changes']:
        cols=row.split('\t');p=cols[-1]
        if cols[0]=='D':out.append(f'| D | `{p}` (removed; inspect retained diff) |')
        else:out.append(f'| {cols[0]} | {link(n,p)} |')
    out+=['','## Proposed rulings for the lead','','Each number is a source proposal the lead can accept, revise or overturn. Choices and rejected alternatives retain the author’s wording unless marked as S32 unpacking. Status restatements are retained for traceability; they are not additional witnesses. A withdrawn or superseded proposal is labeled by its source and is not silently revived. Where the source supplies no rejected alternative, this packet does not manufacture one.','']
    for i,r in enumerate(rules,1):
        text=rewrite_source_links(n,r['path'],r['text'])
        if n=='1a' and r['path']=='notes/lane-1.7-men-regions.md' and r['line']==103:
            text='**Historical R90 proposal; its fixed subtraction and transfer-time expiry approximation are superseded by R97 below.** '+text
        if n=='desk' and 'S29 author status' in r['origin'] and 'interrupted' in r['text'].lower():
            text='**Earlier interrupted attempt, superseded by the resumed S29 delivery at 7db8c80.** '+text
        if n=='1a' and ('R84 author status' in r['origin']):
            text='**Historical R84 status; its Butler hold is superseded by R89’s delivered appointment.** '+text
        if n=='1a' and ('R90 author status' in r['origin']):
            text='**Historical R90 status; institutional transfer representation is superseded by R97.** '+text
        if n=='1a' and r['path']=='notes/lane-1.12-rule-seats.md' and r['line']==537:
            text='**R98 baseline limit; S1 later supplies the resignation/service integration while retaining this eligibility guard.** '+text
        if n=='people-data' and 'S9 author status' in r['origin']:
            text='**Historical S9 candidate/hold; S16’s explicit whole-row deferrals supersede its runtime-delivery block and withdrawn two-band idea.** '+text
        if text.startswith('|'):text=' / '.join(x.strip() for x in text.strip('|').split('|'))
        out.append(f'{i}. {text} — {source_link(n,r["path"],r["line"])}; {r["origin"]}.')
    if not rules:out+=['No explicit new proposed ruling was found at this pinned tip. Open review questions below remain unresolved.']
    if n=='plan-1b':
        out+=['','### Rejected alternatives shared by external draft clauses','','Each clause above names its rejected alternative IDs. The source groups these rejections by draft; they are listed once here to keep the individual choices readable.']
        for code,alternatives in ALTERNATIVES.items():
            out+=['',f'#### {code} alternatives','']
            for i,text in enumerate(alternatives,1):out.append(f'- **{code}.A{i}:** {text}')
    out+=['','### Status and hand-over coverage','','| Source | Coverage |','|---|---|']
    for s in blocks[n]:out.append(f'| {s["request"]} author status | Original `CODEX.md:{s["originalLine"]}`, {len(s["lines"])} lines; see [sprint snapshot](_evidence/CODEX-sprint-snapshot.md)'+(' / [pre-sprint statuses](_evidence/CODEX-pre-sprint-statuses.md)' if s['request'].startswith('R') else '')+' |')
    relevant=[p for p in b['handovers'] if p in changes(n)]
    for p in relevant:out.append(f'| {link(n,p)} | [Retained hand-over]({archived(n,p)}) |')
    out+=['','## Four review lenses','','| Lens | First question and location | Regression evidence / test |','|---|---|---|']
    for lens,question,p,needle,test in m['lenses']:
        # Tests are navigation, not claims of a fresh execution. If a research
        # branch has no such test, point to its concrete validation contract.
        out.append(f'| {lens} | {question} {link(n,p,needle)} | {link(n,test)} |')
    out+=['','A test link identifies the relevant guard or validation contract, not a claim that S32 ran that branch. Research/design inventories lack a general test for historical truth; compare cited pages and scope/measure sidecars before adoption. Run the required project/hook checks after integration and every behavior-triggered regression.','', '## Gate items','',m['gate'],'']
    recs=GATES[n]
    if recs:
        out+=['| Draft / item | Topic or classification | Remaining review |','|---|---|---|']
        for p,item,topics,state in recs:
            target=source_link(n,p,pathline(n,p) if not p.startswith('_external/') else 1)
            out.append('| '+target+' — '+str(item).replace('|','&#124;')+' | '+str(topics).replace('|','&#124;')+' | '+str(state).replace('|','&#124;').replace('\n',' ')+' |')
    else:out+=['No new per-item draft is added by this branch. Inherited or later-use review obligations are described above.']
    if n in ['desk','perf','playtest']:out+=['','The exact seven inherited administrative notice paths and exemption claims are listed in [1a](1a.md#gate-items).']
    out+=['','## Conflicts from merge-tree','','Every row is an actual `git merge-tree --write-tree --name-only <pinned-left> <pinned-right>` result. Exit 0 means textually clean, exit 1 means conflicted. No checkout, merge or conflict resolution was performed. [All 105 commands, exits, trees, complete stdout/stderr](_evidence/merge-tree.json).','', '| Other tip | Exit | Conflicting files |','|---|---:|---|']
    relevant=[]
    for pair in PAIRS:
        if n not in [pair['left'],pair['right']]:continue
        other=pair['right'] if pair['left']==n else pair['left'];relevant.append(other)
        out.append(f'| {"origin/main" if other=="main" else "sprint/"+other} | {pair["exit"]} | '+('; '.join(f'`{f}`' for f in pair['conflicts']) if pair['conflicts'] else 'None')+' |')
    if len(relevant)!=14:raise ValueError((n,'missing merge peers',relevant))
    out+=['',m['extra'],'','These are pairwise probes only. A clean pair does not establish a clean cumulative merge, compatible semantics, passing rules/history checks or preservation of signed content. Regenerate generated conflicts with their owning tools; handwritten conflict choices need the owning lane and reviewer.','', '## Retained validation and open work','',m['evidence'],'','S32’s own validation receipts are in [README](README.md#s32-validation). That checks this audit worktree and packet integrity; it does not re-execute all branch suites or substitute for Claude’s whole-branch review.','', '## Findings outside my scope','',m['extra']+' Standing review, lead rulings, separate gate review, cumulative integration, runtime repairs, CI and pushing remain with their owners.']
    (OUT/f'{n}.md').write_text('\n'.join(out)+'\n',encoding='utf-8')

def main():
    collect_primary();blocks=status_blocks();external_decisions()
    for n in B:gate_inventory(n)
    for n in B:write_packet(n,blocks)
    (E/'rulings.json').write_text(json.dumps(RULES,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (E/'gates.json').write_text(json.dumps(GATES,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (E/'references.json').write_text(json.dumps(REFS,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({n:{'rulings':len(RULES[n]),'gateRows':len(GATES[n])} for n in B},indent=2))
if __name__=='__main__':main()
