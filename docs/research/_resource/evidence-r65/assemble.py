"""Assemble R65 research recommendations. Writes only research artifacts, never pack data."""
from pathlib import Path
import csv, json, collections

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'docs/research/_resource'
EVIDENCE = OUT / 'evidence-r65'
SOURCES = Path('C:/Pyrrhic/mandate-research-sources/r65-sources')
FIELDS = ['native_state', 'state_autonomy', 'union', 'duty']
SCALARS = ['competence', 'nerve', 'reputation', 'boldness', 'candour', 'regard']
IDS = json.loads((EVIDENCE / 'target-ids.json').read_text())

def read_people(name):
    with (EVIDENCE / name).open(encoding='utf-8-sig', newline='') as f:
        return {r['id']: r for r in csv.DictReader(f)}

people = read_people('phase1-resignation-people.csv')
for person, row in read_people('phase1-situations-people.csv').items():
    if person in ['houston_samuel', 'clark_edward']:
        people[person] = row

search = {
 'buchanan_franklin': 'Exact-name January 1861 web discovery and the OR I-1 surname screen found no readable pre-start personal allegiance declaration. James Buchanan hits are not Franklin Buchanan. Neither a commission nor the later departure class supplies a motive.',
 'cooper_samuel': 'Exact-name January and February 1861 letter searches and the OR I-1 screen were read as finding aids. The Foster-report endorsement on OR I-1 p81 records an administrative transmission, not Cooper\'s allegiance. No personal pre-start motive was established.',
 'crittenden_george_b': 'Exact-name January and general 1861 letter discovery found later biographies and service accounts. Coleman\'s Crittenden correspondence was located, but its OCR download timed out twice and remains unread. The OR I-1 p604 expedition appraisal is after the cutoff and is not a pre-start allegiance statement.',
 'ewell_richard_s': 'January 1861 letter searches found a modern article quoting a late-January letter through Pfanz\'s 2012 edition. The original manuscript or a permitted public-domain printing was not reached. The article is a finding aid, not a contemporary leg, and its general description of officers is not automatically Ewell\'s individual allegiance.',
 'gorgas_josiah': 'Exact-name 1860 and February 1861 discovery and the OR I-1 screen found no readable pre-start personal loyalty statement. The Gorgas mention on OR I-1 p274 is a proposal to recruit him, not his reply or a declaration of his motive, and is after the cutoff. Modern journals editions were located in the catalogue but not used as evidence.',
 'holmes_theophilus_h': 'Exact-name 1861 Union-letter discovery and the OR I-1 screen yielded later service summaries, not a readable pre-start declaration. Appointment provenance and the eventual resignation do not establish personal loyalty values.',
 'johnston_albert_s': 'Read William Preston Johnston pp269-271, including both 25 February letters and the 9 April letter. Only the February Porter letter provides the positive union leg below. The later state-allegiance declaration and the biographer\'s narrative on pp257-260 cannot be backdated.',
 'johnston_joseph_e': 'Exact-name February 1861 Union/resignation-letter discovery found no qualifying original. The NARA article is a finding aid to an April resignation, not a pre-start leg. The inherited OR I-2 p473 duty citation has not been established as a qualifying pre-cutoff document in this pass and is not grandfathered.',
 'lee_robert_e': 'Read the 23 January letter excerpt on Long pp88-89 and the April resignation letters in Lee 1904 pp24-26. January supports native_state and union. April is beyond the R65 cutoff. The January passage does not declare loyalty to the army as an institution or affirm a unilateral constitutional secession right.',
 'longstreet_james': 'Exact-name February 1861 letter discovery and the OR I-1 screen found no readable pre-start declaration. NARA\'s later resignation example is a finder only. Later military service and a bare resignation cannot establish his earlier values.',
 'loring_william_w': 'Exact-name February 1861 discovery and the OR I-1 screen found later service accounts and command assignments, not a qualifying personal motive before 5 March. A service fact is not a value.',
 'magruder_john_b': 'Exact-name January and February 1861 letter discovery and the OR I-1 screen found no readable pre-start motive. A William Thomas Magruder hit concerns another man. Later resignation and campaign conduct are not backdated.',
 'pemberton_john_c': 'Exact-name January and February 1861 discovery found modern biographies and archival collection descriptions but no readable pre-start letter about allegiance. The public-domain catalogue title search mainly returned other Pembertons. His later choice is not a motive source.',
 'smith_edmund_k': 'Read Smith\'s 1 March 1861 report, OR I-1 p559, and the 25 February enclosure on p560. The report supports a limited military-duty value. Obeying the departmental evacuation agreement does not by itself establish a Union-political or Florida-allegiance value.',
 'stuart_james_e_b': 'Targeted searches located modern quotations attributed to a January 1861 Hill letter, but no original manuscript or permitted printing was reached. Read McClellan 1885 pp28-32, which includes a January 1860 letter but gives the 1861 allegiance choice only in later narrative. Do not substitute the modern quotation or the narrative for the missing leg.',
 'houston_samuel': 'Read Houston\'s September 1860 speech and January-February 1861 messages in Crane. Own words may support values, but do not rate his own competence, nerve, reputation, boldness, candour or regard. No qualifying external appraisal of those six fields was established. Existing low regard toward Davis is outside this remaining-fields pass and is preserved.',
 'clark_edward': 'Read the Texas journal\'s prefatory convention call, pp9-12, with Clark among its signers. State-autonomy is the only supported field here. The newspaper\'s collective patriotic praise is not enough to choose a personal reputation band. Most roll-call Clark hits concern William Clark Jr, not Edward Clark. No individual external appraisal for the six scalar fields was established.'
}

def prior(person, cell):
    row = people[person]
    if cell.startswith('value:'):
        value = cell.split(':', 1)[1]
        return next((s for s in row['values'].split(';') if s.startswith(value + ':')), '')
    return row[cell]

rows = []
for person in IDS + ['houston_samuel', 'clark_edward']:
    cells = ['value:' + f for f in FIELDS]
    if person in ['houston_samuel', 'clark_edward']:
        cells += SCALARS + ['value:slavery_defence']
    for cell in cells:
        rows.append(dict(person=person, cell=cell, decision='HOLD', proposed_direction='', citations='',
                         basis=search[person] + ' [I] Retain HOLD for this field. HOLD records this search limit, not absence of a value.',
                         prior_value=prior(person, cell)))

def recommend(person, value, citations, basis):
    row = next(r for r in rows if r['person'] == person and r['cell'] == 'value:' + value)
    row.update(decision='KEEP' if row['prior_value'] else 'CHANGE', proposed_direction=value,
               citations=citations, basis=basis)

recommend('lee_robert_e', 'native_state', 'NEW:LEE-JAN1861-DOC pp88-89 dated 1861-01-23',
 'STRONG letter excerpt only, Lee to his son, Fort Mason, 23 January 1861, printed in Long pp88-89. On p89 he says he will return to his native State if the Union dissolves and share his people\'s miseries. [I] KEEP native_state with a timely leg. The condition and defensive limitation matter. This is not a claim that he then supported immediate secession. Long\'s surrounding praise is secondary.')
recommend('lee_robert_e', 'union', 'NEW:LEE-JAN1861-DOC p88 dated 1861-01-23',
 'STRONG letter excerpt only, Lee to his son, 23 January 1861, Long p88. He calls dissolution a calamity and is willing to sacrifice everything except honor for preservation. [I] CHANGE from absent to union. His opposition to a Union maintained by force on pp88-89 qualifies the value but does not erase it. No binary priority or numerical strength is inferred.')
recommend('johnston_albert_s', 'union', 'NEW:ASJ-PORTER-1861-DOC p270 dated 1861-02-25',
 'STRONG letter only, A. S. Johnston to F. J. Porter, 25 February 1861, William Preston Johnston p270. After describing resolutions supporting the Union and rejecting secession as a right, Johnston wishes that no other sentiments existed across the country. [I] CHANGE from absent to union. His personal endorsement in the concluding sentence distinguishes this from his merely descriptive letter to his son on p269. His April letter is not backdated.')
recommend('smith_edmund_k', 'duty', 'OR I-1 p559 dated 1861-03-01',
 'STRONG official report, Smith to the department adjutant-general, 1 March 1861, OR I-1 p559. He refused to give up his arms and horses or accept terms that would dishonor his troops, then carried out departmental orders with their military equipment retained. [I] CHANGE from absent to duty, limited to military obligation and the integrity of his command. This is his declared standard of action, not a rating of his ability or an inference of permanent Union allegiance.')
recommend('houston_samuel', 'union', 'NEW:HOUSTON-AUSTIN-1860-DOC pp599-600 dated 1860-09-22',
 'STRONG speech only, Houston at Austin, 22 September 1860, Crane pp599-600. He pledges to risk his health for the Union and connects his life and hopes with its survival. [I] KEEP the already-entered union value, corroborated with a separately read primary speech. The existing Daly letter is preserved as input provenance, not freshly certified here. This confirmation is counted separately from the remaining held fields.')
recommend('houston_samuel', 'native_state', 'NEW:HOUSTON-LEGIS-1861-DOC pp644-645 dated 1861-02-06',
 'STRONG message only, Houston to the Texas legislature, 6 February 1861, Crane pp644-645, heading on p642. He commits himself to protect the honor and interest of Texas under the people\'s trust, including the contingency of separation. [I] CHANGE from absent to native_state as attachment to his adopted state, Texas, not a birthplace assertion or priority over the Union. His conditional fiscal preparation does not mean that he favored secession or Confederate obligations.')
recommend('houston_samuel', 'duty', 'NEW:HOUSTON-LEGIS-1861-DOC p645 dated 1861-02-06',
 'STRONG message only, Houston to the Texas legislature, 6 February 1861, Crane p645, heading on p642. He promises to act faithfully to the trust reposed in him by the people and to protect Texas within his powers. [I] CHANGE from absent to duty, as a civic obligation he explicitly undertakes. This is not army attachment or a self-rating of competence. The model\'s generic duty term must not silently turn civic duty into willingness to obey Davis.')
recommend('houston_samuel', 'slavery_defence', 'NEW:HOUSTON-AUSTIN-1860-DOC p602 dated 1860-09-22',
 'STRONG speech only, Houston at Austin, 22 September 1860, Crane p602, heading on p599. He warns that dissolution would endanger slavery and connects its security with that of the Union. [I] CHANGE from absent to slavery_defence. Unionism here must not be read as abolitionism. This companion finding keeps the speech\'s stated purpose visible. Any placement follows 0074 and its cost-only rule, with no positive reward for honoring this value.')
recommend('clark_edward', 'state_autonomy', 'NEW:CLARK-CONVENTION-1860-DOC pp9-12 dated 1860',
 'STRONG signed public call only, Texas journal pp9-12. The call claims the Texas people\'s power to alter their government without official consent on p10, and Ed. Clark signs on p12. The contemporary newspaper notice quoted on p9 identifies him as Lieutenant Governor. [I] CHANGE from absent to state_autonomy from his endorsement of that declaration. Publication is identified as 8 December 1860 on p9, but no signing day is printed, so the citation keeps a year bound. No general personality rating follows. Read the separate slavery_defence HOLD and 0074 placement limitation before applying.')

clark_slave = next(r for r in rows if r['person'] == 'clark_edward' and r['cell'] == 'value:slavery_defence')
clark_slave['basis'] = ('The signed call on Texas journal pp9-12 invokes the threatened Southern social order but does not explicitly name slavery in its substantive declaration. The December 1860 newspaper notice is reprinted on p9. [I] No separately supported slavery_defence value is entered from euphemism alone. HOLD, as an explicit companion research lead under 0074. Do not silently omit this issue when reviewing or placing the proposed state_autonomy value, and do not borrow another Clark\'s vote or another man\'s declaration.')

header = ['person','cell','decision','proposed_direction','citations','basis','prior_value']
with (OUT / 'rs16.csv').open('w', encoding='utf-8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=header, lineterminator='\n')
    w.writeheader()
    w.writerows(rows)

counts = {'total':len(rows), 'people':len(set(r['person'] for r in rows)),
          'decisions':dict(collections.Counter(r['decision'] for r in rows)), 'by_person':{}, 'by_field':{}}
for group, key in [('by_person', lambda r:r['person']), ('by_field', lambda r:r['cell'])]:
    for label in sorted(set(key(r) for r in rows)):
        counts[group][label] = {d:sum(key(r)==label and r['decision']==d for r in rows) for d in ['KEEP','CHANGE','HOLD']}
(EVIDENCE / 'counts.json').write_text(json.dumps(counts,indent=2)+'\n',encoding='utf-8')
(EVIDENCE / 'search-limits.json').write_text(json.dumps(search,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in counts.items() if k not in ['by_person','by_field']}))
