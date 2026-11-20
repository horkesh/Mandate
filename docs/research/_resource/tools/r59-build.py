"""Build R59's research tables from R51's held-list snapshot, never pack data."""
import collections
import csv
import hashlib
import json
import pathlib
import re

RESOURCE = pathlib.Path(__file__).resolve().parents[1]
EVIDENCE = RESOURCE / 'evidence-r59'
SOURCES = pathlib.Path('C:/Pyrrhic/mandate-research-sources/r59-sources')
held = list(csv.DictReader((EVIDENCE / 'input-held-judgments.csv').open(encoding='utf8')))
blocs = list(csv.DictReader((EVIDENCE / 'input-held-blocs.csv').open(encoding='utf8')))

# These are search cohorts, not assertions of dates of office or command.
cohorts = {
    'principal and US cabinet': '''lincoln_abraham bates_edward blair_montgomery cameron_simon chase_salmon_p seward_william_h smith_caleb_b welles_gideon stanton_edwin_m'''.split(),
    'Scott and commander search': '''scott_winfield banks_nathaniel_p beauregard_pierre_g_t bragg_braxton buell_don_c butler_benjamin_f dix_john_a fremont_john_c halleck_henry_w hardee_william_j harney_william_s hunter_david mcclellan_george_b mcculloch_ben mcdowell_irvin patterson_robert pillow_gideon_j polk_leonidas rosecrans_william_s sumner_edwin_v wool_john_e'''.split(),
    'April-call governor search': '''andrew_john_a blair_austin buckingham_william_a curtin_andrew_g dennison_william kirkwood_samuel_j morgan_edwin_d morton_oliver_h_p_t ramsey_alexander randall_alexander_w sprague_william washburn_israel_jr yates_richard'''.split(),
    'Davis and cabinet search': '''davis_jefferson benjamin_judah_p hunter_robert_m_t mallory_stephen_r memminger_christopher_g reagan_john_h toombs_robert_a walker_leroy_p'''.split(),
}
priority = {p: group for group, people in cohorts.items() for p in people}
order = {p: n for n, p in enumerate(priority)}

# A KEEP is a recommendation to restore the direction in R51's prior_value.
# Only these manually read and page-checked passages support a positive result.
keeps = {
 ('scott_winfield','competence'): ('above', 'NEW:STAT9-SCOTT-1848 p333 section 2 dated 1848-03-09',
  'STRONG, Congress, joint resolution approved 9 March 1848, 9 Stat. 333, section 2. Congress expressly commends Scott\'s "valor, skill, and judicious conduct" in the 1847 campaign. [I] This is another body\'s assessment of demonstrated military skill, supporting above competence. It is not an inference from rank or an appointment. It supplies a leg, not a numerical measurement or proof about his health in 1861.'),
 ('scott_winfield','reputation'): ('high', 'NEW:STAT9-SCOTT-1848 p333 sections 1-2 dated 1848-03-09',
  'STRONG, Congress, joint resolution approved 9 March 1848, 9 Stat. 333. The resolution is unanimous and awards a gold medal as a testimony of the "high sense entertained by Congress" of Scott\'s conduct. [I] The explicit, collective national commendation supports the prior high reputation band. The praise is Congress\'s, not Scott\'s own account and not the later service register. It does not claim universal approval of his politics.'),
 ('lincoln_abraham','competence'): ('above', 'NEW:CHASE-LINCOLN-1861-DOC p377 dated 1861-01-09',
  'STRONG document only, Chase to Thaddeus Stevens, 9 January 1861, printed verbatim in Warden p377. Chase says possible mistakes would arise from insufficient information, "not unsoundness of judgment". [I] This explicit contemporary assessment after a conversation supplies a leg for above competence, limited to judgment in political business. Chase is a political ally. Warden\'s surrounding narrative is not a leg. This does not restore Lincoln\'s separately held reputation or reopen 0097.'),
 ('cameron_simon','reputation'): ('below', 'CHASE-D p489-490 dated 1861-01-07+CHASE-D p491 dated 1861-01-10',
  'STRONG letters, H. B. Stanton to Chase, 7 January 1861, pp489-490, and E. B. Washburne to Chase, 10 January 1861, p491. Stanton reports the "strongest protests" against Cameron at Treasury, including Trumbull. Washburne calls Cameron\'s possible exclusion avoidance of "a great calamity". [I] These separate contemporary adverse judgments support the prior below band among these Republican politicians. Both favor Chase, so this is a qualified political reputation leg, not a finding that corruption was proved or that everyone disliked Cameron.'),
 ('dix_john_a','competence'): ('above', 'NEW:DIX-BANKERS-1861-DOC v1 p363-364 dated 1861-01',
  'STRONG document only, resolution of bank officers and directors printed verbatim in Morgan Dix, Memoirs, volume 1 p363. The meeting expresses confidence in Dix\'s "well-known ability" and integrity. [I] An explicit external assessment of ability supports above competence in administration. The date is kept to January 1861, from the surrounding dated sequence on pp363-364, not a day invented in the resolution. The biography\'s claims about his financial success outside the quotation are not used.'),
 ('wadsworth_james_s','reputation'): ('above', 'CHASE-D p487-489 dated 1860-12-07',
  'STRONG letter, H. B. Stanton to Chase, 7 December 1860, date on p487 and assessment on pp488-489. Stanton calls Wadsworth one of the State\'s most reliable men and says his "integrity & courage are unquestionable". [I] This explicit contemporary esteem supports above reputation. It is a friendly recommendation for a civilian cabinet role, not evidence of his later military ability or universal popularity.'),
 ('sumner_charles','competence'): ('above', 'CHASE-D p288 dated 1860-06-11',
  'STRONG letter, Chase to Charles Sumner, 11 June 1860, p288. Chase calls the delivered address "Your great speech" after reading it in several printings and compares it favorably with an antique discourse. [I] This is a contemporary external judgment of Sumner\'s political oratory and supports above political competence. It does not measure administrative or military ability, and one friend\'s assessment does not settle the separately held high reputation band.'),
 ('sumner_charles','trait:antislavery'): ('antislavery', 'CHASE-D p277-278 dated 1858-07-16',
  'STRONG letter, Chase to Sumner, 16 July 1858, opening on p277 and assessment on p278. Chase describes Sumner\'s opposition to slavery in principle, contrasting it with other senators\' narrower objections to political encroachment, and hopes for his return to rebuke its defenders. [I] This explicit contemporary judgment of another man supports antislavery. It is the letter, not a biographical gloss or Sumner\'s own estimate. Research recommendation only, with later sensitive-history placement/review still required.'),
 ('wilson_henry','trait:antislavery'): ('antislavery', 'CHASE-D p271-272 dated 1855-02-15',
  'STRONG letter, Chase to A. M. G. as printed, 15 February 1855, date on p271 and assessment on p272. Chase says Wilson is "true as steel on the Slavery question" and would break up the organization rather than see it used for slavery. [I] This is another contemporary\'s explicit assessment, supporting antislavery. The passage is not Wilson estimating himself. Research recommendation only, with later sensitive-history placement/review still required.'),
}

hold_notes = {
 'lincoln_abraham': '0097 keeps reputation at the average runtime default as a HOLD. Chase\'s letter supplies a competence leg only. No eligible pre-start Lincoln judgment of Welles or Montgomery Blair was established in the read passages.',
 'bates_edward': 'H. B. Stanton\'s 7 January letter, CHASE-D pp489-490, groups Bates with desired cabinet associates but does not assess his ability or his own regard toward Lincoln or Blair. A cabinet preference is not an assessment of the gift required.',
 'blair_montgomery': 'The Chase and Sherman correspondence passages read did not establish Blair\'s own pre-start judgments of Lincoln, Chase or Bates, or an external assessment sufficient to set his average reputation. Later cabinet conduct is outside R59\'s boundary.',
 'cameron_simon': 'The January letters used for reputation do not show Cameron\'s own values party or career, or his nerve, regard for Lincoln, or a pre-start tendency to make policy. A critic\'s opposition to his appointment is not evidence of every other field.',
 'chase_salmon_p': 'CHASE-1847 pp107-108 gives Chase\'s own antislavery argument, and Whittier\'s letter of 9 November 1860, CHASE-D p484, praises service to Liberty. The latter does not expressly identify the trait, and R59 expressly allows own words for a value. [I] Retain the trait HOLD rather than silently broaden that exception. Neither supplies a pre-start regard toward Montgomery Blair.',
 'seward_william_h': 'No external pre-start judgment of Seward\'s nerve or a pre-start Seward judgment of Welles was established by this pass. The existing March 5 and March 26 leads cannot satisfy R59\'s before-March-5 cutoff.',
 'welles_gideon': 'The read CHASE-D pp489-490 passage commends Welles as a possible cabinet colleague, not Welles\'s own order value or regard toward Seward. The Welles retrospective remains ineligible.',
 'mcclellan_george_b': 'Davis\'s transmission of McClellan\'s European report, dated 25 February 1857, printed p3, reports completion but gives no personal appraisal. Sherman Letters p115 praises him only in May 1861. [I] Neither restores his start-day reputation.',
 'sherman_william_t': 'John Sherman\'s 6 January 1861 letter, Sherman Letters pp92-93, reports Scott\'s support for a return to army duty. [I] Patronage and prospective employment alone cannot establish the prior low reputation band. Later April praise is outside the boundary.',
 'banks_nathaniel_p': 'Briggs to Chase, 17 March 1860, CHASE-D pp481-483, criticizes Banks as slippery in a nomination dispute. [I] This challenges an uncomplicated high rating but does not establish a replacement general reputation band from one factional quarrel. HOLD, not an unsupported downgrade.',
 'sumner_charles': 'The read Chase letters support political oratory and antislavery, but a friend\'s praise of one speech and its wide printing do not by themselves establish the prior high general reputation band.',
 'wilson_henry': 'Chase\'s 15 February 1855 letter supplies the antislavery leg only. [I] It does not establish the prior high nerve band or above general reputation band.',
 'julian_george_w': 'Julian\'s speech of 14 May 1850, Speeches on Political Questions pp1,7, is primary evidence of his own antislavery position. R59 expressly describes own words as a leg for a value, while this held cell is a trait. [I] HOLD under that narrower wording. A political speech is not an external appraisal of his nerve or reputation.',
 'dana_charles_a': 'The Bates diary is excluded on rights and is not used. Mentions of Dana in cabinet and nomination correspondence do not identify his antislavery trait, competence or general reputation. No eligible independently attributed pre-start editorial was read.',
}

corpus_names = ['chase-diary.txt','warden-chase.txt','dix-v1.txt','shermanlettersco00sher.txt','nyt-1861-01-14.txt','globe-1861-01-16.txt','or-I-1.txt','mcclellan-report1857.txt']
corpus = {name: (SOURCES/name).read_text(encoding='utf8') for name in corpus_names}
surname_hits = {}
for surname in sorted({r['person'].split('_')[0] for r in held}):
    surname_hits[surname] = {name: len(re.findall(r'\b'+re.escape(surname)+r'\b', text, re.I)) for name,text in corpus.items()}
survey = []
rows = []
for r in sorted(held, key=lambda r: (0,order[r['person']],r['cell']) if r['person'] in order else (1,r['person'],r['cell'])):
    person, cell = r['person'], r['cell']
    surname = person.split('_')[0]
    hits = surname_hits[surname]
    survey.append({'person': person,'cell':cell,'surname':surname,'hits':hits,'cohort':priority.get(person,'alphabetical residual screen'),'limitation':'Machine discovery counts only, including wrong people, indexes, retrospective narrative and late documents. No assertion all hits were read. Positive decisions rely only on manually read pages listed in rs15.csv. Other rows retain HOLD.'})
    if (person,cell) in keeps:
        direction,cites,basis = keeps[(person,cell)]
        decision='KEEP'
    else:
        direction=cites=''
        decision='HOLD'
        basis=hold_notes.get(person,'No qualifying leg established in the bounded R59 surname screen of the retained correspondence, newspaper, Globe and OR texts. Hit counts include indexes, other people and documents beyond the cutoff. Unread hits are not evidence. No separate cell-specific document was established for this row. [I] Retain HOLD, without claiming that no evidence exists.')
        if '[I]' not in basis: basis += ' [I] Retain HOLD.'
    rows.append(dict(person=person,cell=cell,decision=decision,proposed_direction=direction,citations=cites,basis=basis,prior_value=r['prior_value']))

with (RESOURCE/'rs15.csv').open('w',encoding='utf8',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=['person','cell','decision','proposed_direction','citations','basis','prior_value'],lineterminator='\n')
    writer.writeheader();writer.writerows(rows)
(EVIDENCE/'surname-screen.json').write_text(json.dumps(survey,indent=2),encoding='utf8')
totals=collections.Counter(r['decision'] for r in rows)
by_person=collections.defaultdict(collections.Counter)
by_field=collections.defaultdict(collections.Counter)
by_exact_field=collections.defaultdict(collections.Counter)
for r in rows:
    by_person[r['person']][r['decision']]+=1
    by_field[r['cell'].split(':')[0]][r['decision']]+=1
    by_exact_field[r['cell']][r['decision']]+=1
stats={'judgments':len(rows),'people':len(by_person),'KEEP':totals['KEEP'],'CHANGE':totals['CHANGE'],'HOLD':totals['HOLD'],'held_blocs_read':len(blocs),'bloc_changes_proposed':0,'by_person':dict(by_person),'by_field':dict(by_field),'by_exact_field':dict(by_exact_field),'cohorts':cohorts}
stats['priority_name_counts'] = {p: dict(by_person.get(p,{})) for p in priority}
stats['cohort_counts'] = {group: {d: sum(by_person.get(p,{}).get(d,0) for p in names) for d in ['KEEP','CHANGE','HOLD']} for group,names in cohorts.items()}
(EVIDENCE/'counts.json').write_text(json.dumps(stats,indent=2),encoding='utf8')
def table(data,title):
    out=[f'## {title}','','| Person | KEEP | CHANGE | HOLD |' if title=='Per person' else '| Field | KEEP | CHANGE | HOLD |','|---|---:|---:|---:|']
    for name,c in sorted(data.items()):out.append(f'| {name} | {c["KEEP"]} | {c["CHANGE"]} | {c["HOLD"]} |')
    return '\n'.join(out)
(EVIDENCE/'count-tables.md').write_text(table(by_field,'Per field')+'\n\n'+table(by_person,'Per person')+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in stats.items() if k not in ['by_person','by_field','by_exact_field','cohorts']},indent=2))
