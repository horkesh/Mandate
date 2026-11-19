"""Produce the bounded R45 research tables, never apply them to pack data."""
from pathlib import Path
from collections import Counter
import csv, hashlib, json, re

ROOT = Path(__file__).resolve().parents[1]
SCRATCH = Path(r'C:\Users\User\AppData\Local\Temp\claude\4d87ab6d8ae0089a\9b5270b2-8d26-4ceb-8899-4a7cb8486063\scratchpad\gaps')
HEADER = ['person','cell','decision','proposed_direction','citations','basis','prior_value']
EVIDENCE = ROOT / 'evidence-r45'
EVIDENCE.mkdir(exist_ok=True)
overrides = {}
def keep(person, cell, direction, cites, basis, decision='KEEP'):
    overrides[person, cell] = (decision, direction, cites, basis)

keep('andrew_john_a','regard','above','PEARSON-ANDREW v1 p116 (1860 ratification speech, day unverified)',
     'STRONG reprinted speech, not Pearson\'s characterization. Andrew says he would trust Lincoln with his country\'s cause. [I] Warm personal confidence supports above. The exact speech day is not printed here, so the old inferred 1860-05-23 is not repeated. The 1860 campaign context puts it before the start boundary.')
keep('andrew_john_a','value:state_autonomy','state_autonomy','PEARSON-ANDREW v1 p138-139 dated 1861-01-05',
     'STRONG reprinted inaugural, dated on p138. Andrew defends the Commonwealth\'s Personal Liberty Law as a duty between the Commonwealth and its subjects. [I] Supports this specific state-autonomy value, not a general endorsement of secession.')
keep('andrew_john_a','value:free_soil','free_soil','PEARSON-ANDREW v1 p127 dated 1860-09-13',
     'STRONG speech printed by Pearson, with Springfield Republican date in the p127 footnote. Andrew asserts constitutional power to act concerning institutions in federal territories and says he means to use its full extent. [I] Supports opposition to slavery\'s territorial extension.')
keep('andrew_john_a','value:fugitive_defence','fugitive_defence','PEARSON-ANDREW v1 p138-139 dated 1861-01-05',
     'STRONG reprinted inaugural. Andrew defends the Personal Liberty Law in terms of the Commonwealth\'s duty to its subjects. [I] The defence of this protection supports the value. No exact day is assigned to the separately printed undated letter on p166.')
keep('andrew_john_a','trait:antislavery','antislavery','PEARSON-ANDREW v1 p123-124 dated 1860-08-30',
     'STRONG contemporary newspaper extract, Springfield Republican date in p124 footnote. Bowles describes Andrew\'s record as extreme anti-slaveryism. [I] Even this unfriendly assessment supports the trait. The surrounding biographer\'s opinion is excluded.')
keep('bates_edward','nerve','average','NH 3 p388 dated 1861-03-16+NH 3 p432 dated 1861-03-29',
     'STRONG reprinted memoranda. Bates is willing to forbear longer in the first, but in the second recommends defending Pickens and Key West at all hazards. [I] Deliberation together with resolve supports average, not a clinical or battlefield judgment.')
keep('blair_montgomery','nerve','high','NH 3 p432 dated 1861-03-29',
     'STRONG reprinted memorandum. Blair insists Sumter ought to be relieved and refuses responsibility for abandonment. [I] His expressed readiness to face the risk supports high resolve. It is his policy conduct, not his self-rating.')
for person,direction,label,votes in [
    ('bates_edward','above','Edward Bates','48'),
    ('chase_salmon_p','high','Salmon P. Chase','49'),
    ('dayton_william_l','above','William L. Dayton','14'),
    ('seward_william_h','high','William H. Seward','173.5')]:
    keep(person,'reputation',direction,'CHI-1860 p108-109,p113 dated 1860-05-18',
         f'STRONG contemporary convention proceedings. Others nominate {label} for President and the first ballot records {votes} votes. [I] Collective willingness to entrust the presidency supports retaining this standing band. It proves political esteem within the convention, not universal approval or administrative competence. Fractional OCR on Seward is read as one half, not the letter J.')
keep('lincoln_abraham','reputation','above','PEARSON-ANDREW v1 p116 (1860 ratification speech, day unverified)',
     'STRONG another man\'s reprinted contemporary speech. Andrew expressly praises Lincoln\'s honesty, intellect and firmness and entrusts the country\'s cause to him. [I] This is affirmative esteem, so above is better supported than the coded average. Bounded to the 1860 campaign, with no invented day.', 'CHANGE')
keep('lyons_richard_b_p','reputation','above','NEWTON-LYONS v1 p2 (Russell letter, early 1853, day unprinted)',
     'STRONG quoted letter of Russell, not Newton\'s narrative about capacity. Russell explicitly states a very good opinion of Lyons. [I] Supports above standing with this superior. The surrounding early-1853 context bounds the letter before March 1861, but does not print a month or day.')
keep('stevens_thaddeus','trait:antislavery','antislavery','WOODBURN-STEVENS p165-166 dated 1861-01-29',
     'STRONG reprinted congressional speech. Stevens refuses to love slavery or withhold expression of his abhorrence of it. [I] His own explicit opposition supports antislavery. Uses the speech text, not Woodburn\'s subsequent assessment. Date given in the p166 footnote. The earlier speech\'s OCR has an impossible February day, so no exact date is assigned to it here.')

specific_holds = {
 ('andrew_john_a','trait:disdains_superiors'): 'Pearson p219-220 prints a complaint against federal equipment treatment. [I] Rebuking an administrative decision does not establish disdain for superiors, and its exact day is not printed. The old 1861-05-15 is not verified.',
 ('bates_edward','regard'): 'NH 3 p351 prints a short Bates diary extract about who ought to visit whom. [I] Politeness does not establish average regard toward Lincoln. The surrounding appraisal is the authors\' narrative, and the cited 13 December is not the meeting date.',
 ('lyons_richard_b_p','competence'): 'Newton p2 quotes Russell\'s good opinion, which sources reputation. His comment about capacity is the later author\'s. The May 6 letter at pp37-38 gives instructions, not an assessment of Lyons\' ability. The January 7 letter at p30 is Lyons\' assessment of Seward.',
 ('lyons_richard_b_p','nerve'): 'Newton pp31-37 prints Lyons\' letters of March 26 and April 15. [I] His diplomatic caution and description of uneasiness do not fix an average personal nerve band.',
 ('lyons_richard_b_p','trait:candid'): 'Newton p30 is Lyons\' confidential assessment of Seward, and p2 his complaint about promotion. [I] Neither establishes a stable candid disposition rather than ordinary confidential reporting or a grievance.',
 ('mercier_henri','competence'): 'Newton pp43-44, June 10 letter of Lyons, gives positions and coordination, not an assessment supporting average competence.',
 ('mercier_henri','nerve'): 'Newton p34, March 26 letter, records Mercier wanting discretion to recognize the South. [I] A policy preference is insufficient for an average nerve band. June 10 does not supply the missing assessment.',
 ('seward_william_h','nerve'): 'Read NH 3 pp370-372 and Newton pp31-37. Seward\'s March 2 withdrawal letter and Lyons\' March 26 description of his conduct establish tactics and policy disagreements. [I] They do not fix average personal nerve.',
 ('wilson_henry','nerve'): 'Nason pp306-308 is mostly retrospective narration. The printed Scott letter on p308 is dated August 10, 1861, after the innate boundary, and praises work rather than nerve. No qualifying leg established.',
 ('wilson_henry','reputation'): 'Nason p308 prints Scott\'s August 10, 1861 letter, after the reputation boundary. A later directory listing is a fact, not contemporary esteem before March 5.',
 ('cameron_simon','reputation'): 'CHI-1860 pp108-109,113 records nomination and support. [I] That does not support the coded below standing. It cannot settle the conflicting broader reputation, so no substitute band is inferred from votes alone.',
 ('scott_winfield','competence'): 'NH 3 p432 prints Blair\'s March 29 adverse judgment of Scott\'s current policy judgment. [I] A disputed political judgment does not settle general military competence. Neither the old Heitman service list nor retrospective Welles supplies the missing leg.',
 ('totten_joseph_g','reputation'): 'The supplied NH 3 locators p378 and p434 concern the March crisis, after the reputation boundary. The older Cullum service entry alone cannot supply reputation.',
 ('slidell_john','nerve'): 'The cited Newton chapter includes the Trent episode after July 31, 1861. [I] Later conduct cannot establish this innate band within the permitted window.',
}

news = sorted((SCRATCH / 'rs-13').glob('sim_new-york-times*.txt'))
corpus = news + [SCRATCH / 'rs1' / 'chi1860.txt']
texts = {p: p.read_text(encoding='utf-8-sig',errors='replace') for p in corpus}
manifest = []
for p in corpus + [SCRATCH/'rs-10'/'lifeofjohnaandre01pear.txt', SCRATCH/'rs1'/'lordlyonsrecordo01newtuoft.txt', SCRATCH/'rs1'/'abrahamlincolnhi03nico.txt', SCRATCH/'rs2'/'stevens.txt', SCRATCH/'rs1'/'publicservhenrywil00nasorich.txt']:
    manifest.append({'file':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'role':'retained OCR, selected passages read, not a claim of cover-to-cover inspection'})
(EVIDENCE/'round2-source-files.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
search_log = []
summary = {}
for batch in range(10,15):
    rows = []
    for line in (ROOT/'briefs'/f'batch{batch}.md').read_text(encoding='utf-8').splitlines():
        if ' | ' not in line or line.startswith('person '): continue
        person,cell,kind,prior = [x.strip() for x in line.split(' | ',3)]
        name = person.split('_')[0]
        surname = {'andrew_john_a':'Andrew','johnson_andrew':'Johnson','lyons_richard_b_p':'Lyons','smith_charles_f':'Smith','smith_edmund_k':'Smith','sumner_charles':'Sumner','sumner_edwin_v':'Sumner'}.get(person,name)
        pattern = re.compile(r'\b'+re.escape(surname)+r'\b',re.I)
        counts = {str(p.relative_to(SCRATCH)):len(pattern.findall(t)) for p,t in texts.items()}
        search_log.append({'batch':batch,'person':person,'cell':cell,'pattern':surname,'hits':counts,'limit':'surname matches are leads, not proof of identity, date, page or judgment'})
        basis = specific_holds.get((person,cell),
            'No qualifying contemporary leg established in this bounded pass. The batch\'s existing reference-work or retrospective locator is insufficient for this judgment. Searched the six retained pre-start NYT issues and CHI-1860 by surname, with results in evidence-r45/round2-search.json. Name hits alone do not establish identity or an eligible dated judgment. [I] HOLD rather than infer a personal quality from office, rank or later fame.')
        values = overrides.get((person,cell), ('HOLD','','',basis))
        rows.append([person,cell,*values,prior])
    with (ROOT/f'rs{batch}.csv').open('w',encoding='utf-8',newline='') as f:
        writer = csv.writer(f,lineterminator='\n'); writer.writerow(HEADER); writer.writerows(rows)
    by_field = {}
    for row in rows:
        field = row[1].split(':')[0]
        by_field.setdefault(field,Counter()).update([row[2]])
    counts = Counter(row[2] for row in rows)
    summary[str(batch)] = {'total':len(rows),**{d:counts[d] for d in ['KEEP','CHANGE','HOLD']},'fields':{k:dict(v) for k,v in sorted(by_field.items())}}
    table = '\n'.join(f'| {k} | {v["KEEP"]} | {v["CHANGE"]} | {v["HOLD"]} |' for k,v in sorted(by_field.items()))
    note = f'''# rs{batch}: R45 second-round re-sourcing

2026-11-19. Research recommendation, not pack data or gate approval.

{len(rows)} cells: KEEP {counts['KEEP']}, CHANGE {counts['CHANGE']}, HOLD {counts['HOLD']}.

| Field | KEEP | CHANGE | HOLD |
|---|---:|---:|---:|
{table}

Read `R45-method-and-results.md` for the bounded search, source URLs, date qualifications and proposed rulings. The CSV gives the decision and basis separately for every assigned cell. Every mapping from conduct or esteem to a pack band is [I]. HOLD means this pass did not establish adequate evidence, not that no contemporary document exists.

Existing sources only, no NEW keys. Contemporary words reprinted in Pearson, Newton, Woodburn and Nicolay and Hay are distinguished from their later narrative. A service entry, appointment or reference work is not used to infer a gift. The six newspaper issues are discovery searches, not wholesale factual citations. Source file hashes and per-cell surname hit counts are retained under `evidence-r45/`.

The gated values and traits are research proposals for later gate placement. No situation, player string, signature or sign-off is authored here. All other cells are HOLD, including unread or undated leads that would need another source.

## Findings outside my scope

The apply and the gate review belong to their owning lanes. See the aggregate note for the resignation handoff and validation prerequisite.
'''
    (ROOT/f'rs{batch}.md').write_text(note,encoding='utf-8')
(EVIDENCE/'round2-search.json').write_text(json.dumps(search_log,indent=2)+'\n',encoding='utf-8')
(EVIDENCE/'round2-counts.json').write_text(json.dumps(summary,indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary,indent=2))
