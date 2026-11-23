"""S88 research transcription/classification, never pack input.

Facts are paraphrases of receipted pages. Band assignment and proposed obligation
are explicitly interpretations, pending the lead's acceptance under 0111.
"""
from readings import P, table, dump

acts=[]
def act(id, origin, side, actor, office, band, matter, deed, date, refs, status, reason, match='', role='addressee'):
    acts.append(dict(id=id,catalogue_ids=origin,side=side,actor=actor,office=office,role=role,
      band=band,matter=matter,act=deed,date=date,source_refs=refs,status=status,
      unit='one issuing side / named actor / role / bounded matter / act',
      classification='Interpretation for lead ruling',reason=reason,model_matter=match))

def u(id,origin,actor,office,band,matter,deed,date,refs,status,reason,match='',role='addressee'):
    act(id,origin,'union',actor,office,band,matter,deed,date,refs,status,reason,match,role)

u('U01','N3-01','scott_winfield','general in chief / adviser','plan_objections','Sumter relief feasibility, March 12 inquiry',
  'Says relief requires a fleet, 5000 regulars and 20000 volunteers and months of preparation','March 12 inquiry; quoted in March 15 answer',
  'OR-I-I:197;Lincoln-II:16','eligible','Contemporary quotation of his response in Cameron answer; original separate letter not claimed read. Different inquiry from March 5.','sumter_consult')
u('U02','N3-02','scott_winfield','general in chief / adviser','plan_objections','Evacuating both Sumter and Pickens',
  'Recommends giving up both forts to retain the wavering States','March 1861; catalogue March 28 date not independently settled',
  'OR-I-I:200;OR-I-I:201','eligible','Distinct expanded two-fort course; not another copy of U01. OR files it among March 15 cabinet attachments; exact composition/receipt day remains uncertain.','sumter_consult')
for suffix,actor,office,refs,deed in [
 ('a','seward_william_h','Secretary of State','Lincoln-II:11;Lincoln-II:12;Lincoln-II:13;Lincoln-II:14','Opposes forceful relief as provoking civil war and favors conciliation'),
 ('b','cameron_simon','Secretary of War','OR-I-I:196;OR-I-I:197;Lincoln-II:16;Lincoln-II:17','Opposes Fox relief as no durable benefit commensurate with its costs'),
 ('c','welles_gideon','Secretary of Navy','Lincoln-II:17;Lincoln-II:18','Advises against provisioning under existing circumstances'),
 ('d','smith_caleb_b','Secretary of Interior','Lincoln-II:18;Lincoln-II:19;Lincoln-II:20','Advises against provisioning and favors other ways to assert authority'),
 ('e','bates_edward','Attorney General','Lincoln-II:21;Lincoln-II:22','Advises evacuation rather than starting civil war, while defending other forts')]:
    u('U03'+suffix,'N3-03',actor,office+' / adviser','plan_objections','March 15 written Sumter provisioning consultation',deed,
      '1861-03-15/16',refs,'eligible','One individually signed answer per actor; five primary answers read, not five inferred from a group summary.','sumter_consult')
u('U04','N3-04','seward_william_h','Secretary of State / adviser','plan_objections','March 29 renewed relief consultation',
  'Advises against the expedition and for Anderson to retire','1861-03-29','Lincoln-II:26','eligible',
  'Fresh presidential consultation with revised expedition under consideration; distinct from March 15, not an extra mention of the same letter.','sumter_consult')
u('U05','N3-05','blair_montgomery','Postmaster General / adviser','plan_objections','March 29 proposed Sumter abandonment',
  'Challenges Scott judgment and refuses responsibility for abandoning Sumter','1861-03-29','Lincoln-II:27','eligible',
  'A challenge to evacuation, not opposition to relief. Matching must preserve the direction of the advice.','sumter_consult')
u('U06','N3-06','seward_william_h','Secretary of State','filter_holds','Commissioners recognition memorandum',
  'Outward reply dated March 15 delivered April 8 with understood consent','1861-03-15/04-08','Richardson-I:85-88','excluded',
  '0109: outward negotiated handling, not an incoming report withheld from Lincoln.',role='outward_diplomacy')
u('U07','N3-07','seward_william_h','Secretary of State','trims','Sumter assurances to Campbell',
  'Campbell recounts successive outward assurances and complains of their failure','1861-03-15/04-07',
  'Richardson-I:93-97;Burlingame-22:2349;Burlingame-22:2350;Burlingame-22:2351;Burlingame-22:2392','excluded',
  '0111 excludes verified incoming trim. Four S87 communications retained there; disclosure to Lincoln remains unresolved. No claim cut from a report identified.',role='originator')
u('U08','N3-08','blair_montgomery','Postmaster General / adviser','plan_objections','Alleged March 12-13 protest',
  'The secondary describes a prepared resignation but attributes the visit and warning to his father','March 1861',
  'Burlingame-22:2334;Burlingame-22:2335;Lincoln-II:20;Lincoln-II:21','excluded',
  'No independently bounded March 12-13 act by Montgomery verified. Father Francis P. Blair is a different actor; March 15 signed answer is not substituted to rescue this row.')
u('U09','N3-09','pickens_francis_w','adversary governor','filter_holds','Sumter mail interception',
  'Reports seizing official mail and sending it to Confederate government while forwarding private letters','1861-04-08/09',
  'OR-I-I:248;OR-I-I:249;OR-I-I:250;OR-I-I:288;OR-I-I:291;OR-I-I:292','excluded',
  'Adversary interception of Union mail; not a filter between an incoming report and its own principal. Catalogue March 29 inspection order not verified; dated April documents replace that unsupported detail.',role='adversary_interception')
u('U10','N3-10','scott_winfield','general in chief','slow_walk','Pickens reinforcement order dispatch',
  'Order of March 12 directs landing at first favorable moment','1861-03-12','ORN-I-IV:90;Welles-Galaxy:95;Welles-Galaxy:96;Welles-Galaxy:97','excluded',
  'Elapsed time from alleged verbal direction is not evidence of an addressee deliberately delaying it. Retrospective account describes logistical difficulty; no slow-walk cause verified.')
u('U11','N3-11','unnamed_adjutant_general_staff','Adjutant General office','relay_holds','Crusader dispatch preparation and passage',
  'Welles attributes departure delay to difficulty detailing companies and a protracted voyage','1861-03-12/31',
  'Welles-Galaxy:95;Welles-Galaxy:96;Welles-Galaxy:97;ORN-I-IV:90;ORN-I-IV:110','excluded',
  'Neither a named reluctant intermediary nor withholding contrary to delivery direction is established. Existing binding relay floor of 1 is not waived by this proposed exclusion.',role='relay')
u('U12','N3-12','adams_henry_a','naval commander','outside_seven','Pickens landing under Army and Navy instructions',
  'Declines Vogdes request, invokes standing Navy instructions and asks Welles for orders','1861-04-01',
  'ORN-I-IV:109;ORN-I-IV:110;ORN-I-IV:111','excluded',
  'Refusal under conflicting authority is retained as such. No undertaking of the same request with a qualification; no dated deliberate delay after clear superseding Navy direction; no automatic plan-objection token.')
u('U13','N3-13','porter_david_d','naval expedition commander','outside_seven','Powhatan countermand',
  'Declines Seward telegram while invoking unrecalled explicit orders received from Lincoln','1861-04-06',
  'ORN-I-IV:109;ORN-I-IV:111;ORN-I-IV:112;ORN-I-IV:237;ORN-I-IV:238;ORN-I-IV:240','excluded',
  'Source depicts adherence to principal orders against a subordinate countermand, not pushback against Lincoln.')
u('U14','N3-14','seward_william_h','Secretary of State / adviser','plan_objections','Some Thoughts administration policy and direction',
  'Proposes changed domestic and foreign policy and a directing officer; Lincoln retains direction','1861-04-01',
  'Lincoln-II:29;Lincoln-II:30','eligible','Specific alternative course; distinct from Sumter advice and originator disclosure.','seward_policy')
u('U15','N3-15','summers_george_w','Virginia Unionist','reservations','Invitation to consult Lincoln',
  'Baldwin goes in Summers place under an invitation allowing a trusted substitute','1861-04-01/04',
  'Burlingame-22:2382;Burlingame-22:2383;Burlingame-22:2387','excluded',
  'Authorized substitution is not a qualification imposed against the request. Secondary recounts invitation and later recollections; no private motive inferred.')
for number,actor,office,date,refs in [
 (16,'magoffin_beriah','Kentucky governor','1861-04-15','OR-III-I:70'),
 (17,'ellis_john_w','North Carolina governor','1861-04-15','OR-III-I:72'),
 (18,'letcher_john','Virginia governor','1861-04-16','OR-III-I:76'),
 (19,'harris_isham_g','Tennessee governor','1861-04-17/20','OR-III-I:81;OR-III-I:91;OR-III-I:92'),
 (20,'jackson_claiborne_f','Missouri governor','1861-04-17','OR-III-I:82;OR-III-I:83'),
 (21,'rector_henry_m','Arkansas governor','1861-04-22','OR-III-I:99')]:
    u(f'U{number:02}',f'N3-{number:02}',actor,office,'outside_seven','April Union militia requisition',
      'Refuses the requisition',date,refs,'excluded','Actual refusal retained on Union issuing side under 0111. A troop-call refusal is not an objection to a plan. Harris April 20 explains the April 17 refusal; not a second act.')
for number,actor,office in [(22,'welles_gideon','Secretary of Navy'),(23,'bates_edward','Attorney General')]:
    u(f'U{number}',f'N3-{number}',actor,office+' / adviser','plan_objections','Blockade versus closing ports',
      'Opposes blockade as the wrong instrument for rebellion and favors closing ports','1861-04-14/19',
      'Burlingame-23:2459;Burlingame-23:2460','qualified_source',
      'Secondary page read with footnotes to retrospective accounts and later correspondence; individual original accounts not separately read. Proposed only if lead accepts this source qualification.','blockade_advice')
u('U24','N3-24','mccauley_charles_s','naval yard commander','outside_seven','Gosport destruction',
  'Reports deciding on destruction April 19 and beginning it April 20','1861-04-19/20',
  'ORN-I-IV:288;ORN-I-IV:289','excluded','Self-report of destruction is not a second proved refusal to evacuate. Earlier Merrimack retention is separately bounded as U40, not counted twice.')
u('U25a','N3-25','hicks_thomas_h','Maryland governor / policy interlocutor','plan_objections','Troop transit through Maryland after Baltimore alternative',
  'Advises that troops off Annapolis go elsewhere and no more come through Maryland','1861-04-22',
  'Lincoln-II:36;Lincoln-II:37;OR-I-II:581','eligible','Seward contemporary reply on Lincoln behalf identifies Hicks specific proposed change. Different matter from the troop-call refusal U36.','maryland_transit')
u('U25b','N3-25','brown_george_w','Baltimore mayor','reservations','Protecting troops marching around Baltimore',
  'Undertakes every effort to stop organized molestation but cannot guarantee individuals','1861-04-20',
  'OR-I-II:581;OR-I-II:582;Lincoln-II:36','eligible',
  'Reclassified to qualified undertaking of Lincoln request for peace and protection, not a separately proved objection to the route. No independent act by Marshal Kane on these pages.','baltimore_protection')
u('U25c','N3-25','kane_george_p','Baltimore marshal','outside_seven','Alleged grouped transit objection',
  'No separately identifiable Kane act in the cited exchanges','1861-04-18/22','OR-I-II:581;OR-I-II:582','excluded',
  'A grouped catalogue attribution cannot create a third person act without that person act on pages read.')
u('U26','N3-26','harney_william_s','department commander','reservations','Missouri security and peace mandate',
  'Implements security through the Price-Harney agreement and its pledge of no unnecessary military movements','1861-05-21',
  'OR-I-III:374;OR-I-III:375;OR-I-III:376','excluded',
  'Revises S87 nearest-type interpretation: the May 21 agreement precedes the May 27 presidential direction printed here. No identified earlier request is shown being undertaken with an imposed qualification; implementation of a general mandate alone cannot establish that unit.','missouri_security')
u('U27','N3-27','blair_francis_p','entrusted messenger','relay_holds','Conditional Harney relief delivery',
  'Holds relief order under Lincoln express discretion','1861-05-18/30','Lincoln-II:47;Lincoln-II:48;OR-I-III:374;OR-I-III:381','excluded',
  '0109: authorized conditional delivery, not resistance. Harney receipt and subsequent interpretation do not turn Blair into a reluctant relay.',role='entrusted_delivery')
u('U28','N3-28','magoffin_beriah','Kentucky governor','slow_walk','Alleged summer neutrality tolerance',
  'Catalogue supplied no bounded instruction or source; the specific removal correspondence read is in August','May-August catalogue interval',
  'Lincoln-II:76;Lincoln-II:77;OR-III-I:70','excluded',
  'August 19/24 correspondence is outside July 31 cutoff; April refusal already U16. Neither supplies a distinct in-window slow walk. No inference from general neutrality or elapsed summer.')
u('U29','N3-29','cadwalader_george','department commander','outside_seven','Merryman writ',
  'Declines court writ and invokes presidential authority while seeking instructions','1861-05-26/28','Taney-Reports:250-252','excluded',
  'Court is issuer of resisted writ. Not an instruction from Lincoln; no opinion on constitutional legality is offered.',role='court_writ_addressee')
u('U30','N3-30','cameron_simon','Secretary of War','outside_seven','Congressional contract information demands',
  'Unpaginated secondary alleges refusals to Congress, not Lincoln','July 1861 claimed','OR-III-I:327;OR-III-I:328','excluded',
  'Exact primary refusal documents not verified. American Heritage article read (source-reading.json, unpaginated, paragraph beginning Apprised); it names a legislative requester. Adjacent primary July 13 report concerns a different House inquiry and is NOT proof of the alleged contract refusals. No president-issued case or floor.')
u('U31','N3-31','mcdowell_irvin','army commander','plan_objections','Alleged pre-battle warning against advance',
  'After-action report describes expiring terms and says he could neither move sooner nor delay','1861-08-04 report about July',
  'OR-I-II:325','excluded','A later explanation does not establish the alleged dated objection to a proposed course. Not upgraded from a report to a warning.','mcdowell_advance')
u('U32','N3-32','patterson_robert','department commander','plan_objections','Changing Valley depot and line before active operations',
  'Requests time and permission to transfer depot via Harpers Ferry and replace short-term men','1861-07-12',
  'OR-I-II:164;OR-I-II:165','eligible','Bounded logistical/course revision. July 12 permission and July 13 new direction are not folded into his later July 16 response.','patterson_depot')
u('U33','N3-33','patterson_robert','department commander','plan_objections','Fresh attack or demonstration direction in Valley',
  'Says active operations toward Winchester cannot be considered without long-term replacements; proposes alternate course','1861-07-16',
  'OR-I-II:166;OR-I-II:167','eligible','Materially new July 13 direction after U32; not counted from every subsequent mention.','patterson_advance')
u('U34','N3-34','patterson_robert','department commander','slow_walk','Fresh July 17-18 attack/demonstration direction',
  'Defers advance while asking whether to attack and reiterating inability without replacements','1861-07-17/18',
  'OR-I-II:167;OR-I-II:168;OR-I-II:169','eligible','Delay inferred from response and reported conduct, not secret intent. Fresh July 17-18 instruction separates this act from U33; repeated telegram copies add zero.','patterson_advance')
u('U36','X-01','hicks_thomas_h','Maryland governor','outside_seven','April militia requisition',
  'Declines for the present to respond affirmatively to four-regiment requisition','1861-04-20','OR-I-II:581','excluded',
  'Troop-call refusal, not plan objection. Distinct from Hicks April 22 routing advice U25a.')
u('U37','X-02','garrett_john_w','private railroad president','outside_seven','Ohio troop transport arrangement',
  'Dennison reports Garrett declined transport citing empty cars needed on Washington branch','1861-04-17/18','OR-III-I:84;OR-I-II:578','excluded',
  'Correct printed page is 84, not 86/87. Private carriage arrangement, not a president order; reported reason is capacity, not established covert delay.',role='private_carrier')
u('U38','X-03','unnamed_war_department_official','War Department','filter_holds','Extra New York regiments',
  'Morgan reports a wait direction and asks whether his regimental dispatch order should be countermanded','1861-04-19','OR-III-I:87','excluded',
  'Troop-acceptance direction, not incoming report held before Lincoln; sender unnamed. Existing 0109 citation does not make this a named filter.',role='troop_acceptance')
u('U39','X-04','morgan_edwin_d','New York governor','reservations','April Union militia requisition',
  'Asks the object and takes steps to comply with the requisition','1861-04-15/18','OR-III-I:72;OR-III-I:85','eligible',
  'Nearest-type question plus undertaking [I], as S87; no private reluctance asserted. Undertaking is on printed 85, not 86.','morgan_april_call')
u('U40','X-07','mccauley_charles_s','naval yard commander','slow_walk','Peremptory Merrimack removal to Philadelphia',
  'Isherwood reports readiness, repeated postponement, and McCauley decision to retain ship and draw fires','1861-04-17/18',
  'ORN-I-IV:275;ORN-I-IV:281;ORN-I-IV:288;ORN-I-IV:289','eligible',
  'Read orders and named contemporary witness tie delay to McCauley decision. April 20 destruction U24 is not a second delay. Conflicting readiness claims retained, not used to assign personality.','merrimack_removal')
u('U41','X-06','mccauley_charles_s','naval yard commander','outside_seven','Alleged April 11 objection',
  'April 11 document read is a Navy order to prepare and remove the ship','1861-04-11','ORN-I-IV:275;ORN-I-IV:281','excluded',
  'An order is not the addressee objection. No independently verified April 11 act; April 18 retention appears once as U40.')
u('U42','X-05','scott_winfield','general in chief / adviser','plan_objections','March 5 first Sumter relief assessment',
  'Says changed defenses make evacuation almost inevitable and relief beyond available means','1861-03-05','LOC-0779200:1-6','eligible',
  'LoC/Knox full six-image document transcript read, Scott endorsement; no individual scan or printed pagination claimed. First assessment, distinct from March 12 inquiry and expanded two-fort course.','sumter_consult')

def c(id,actor,office,band,matter,deed,date,refs,status,reason,match=''):
    act(id,'','confederate',actor,office,band,matter,deed,date,refs,status,reason,match)

c('C01','brown_joseph_e','Georgia governor','reservations','First Pensacola contingent mustering',
  'Tenders regiment and battalion after obtaining consent, objects to distant muster and surgeon uncertainty','1861-04-04',
  'OR-IV-I:135;OR-IV-I:207;OR-IV-I:214','eligible','One undertaking with express conditions; Walker April 9 answer is supporting evidence, not another act.','cs_mar09_georgia')
c('C02','brown_joseph_e','Georgia governor','reservations','April additional regiments for Virginia',
  'Undertakes requisition only with Georgia organization and muster before leaving State','1861-04-23',
  'OR-IV-I:234','eligible','Walker accepts the proposed arrangement; negotiated qualification is still an evidenced qualification.','cs_apr22_absolute_georgia')
c('C03','moore_thomas_o','Louisiana governor','reservations','April active Virginia regiments and earlier readiness call',
  'Undertakes earliest readiness but objects to inability to camp or muster until immediate use and asks changed reception','1861-04-23',
  'OR-IV-I:232;OR-IV-I:233;OR-IV-I:235','eligible','One act addressing linked readiness and activation, not one act for every telegram. Capacity qualification, not an inferred slow walk.','cs_apr22_absolute_louisiana')
c('C04','pickens_francis_w','South Carolina governor','reservations','Sending South Carolina volunteers to Virginia',
  'Sends men while reserving regiment integrity and gubernatorial consent to permanent service elsewhere','1861-04-23',
  'OR-IV-I:233;OR-IV-I:235;OR-IV-I:236','eligible','Explicit conditional undertaking to government. April 22 Bonham notice is context; no separate count from the forwarding statement.','sc_virginia_transfer')
c('C05','harris_isham_g','Tennessee governor','reservations','Initial three Virginia regiments',
  'Undertakes three regiments while disclaiming legal authority to order troops outside State','1861-04-22',
  'OR-IV-I:232;OR-IV-I:233','eligible','Side is Confederate issuer, unlike his response to Union April call. Qualification is stated, no private opposition inferred.','tennessee_virginia_call')
c('C06','bragg_braxton','Pensacola commander','reservations','Preventing Pickens reinforcement at dock',
  'Undertakes best efforts but qualifies them by short supplies and transport need','1861-04-09',
  'OR-I-I:456;OR-I-I:457;OR-I-I:458','eligible','Specific April 8 direction clarified not to require island landing. Counts qualification, not claim of refusal or covert delay.','bragg_dock')
c('C07','letcher_john','Virginia governor','reservations','Reserve corps organization and appointments',
  'Undertakes raising 3000 and issuing proclamation but protests presidential appointment of field officers','1861-07-03',
  'OR-IV-I:419;OR-IV-I:420','eligible','Same requisition undertaken with a constitutional protest; not a pure troop-call refusal and not automatically a plan objection.','cs_jun30_reserve_virginia')
c('C08','moore_andrew_b','Alabama governor','reservations','Two additional armed regiments',
  'Says State cannot arm more than one extra regiment and would be left almost defenseless','1861-07-04',
  'OR-IV-I:420','excluded','Capacity limitation, without an explicit undertaking of this same extra-pair demand. Reserve and cavalry undertakings in the same letter answer separate requests; they cannot make this refusal/shortfall a reservation. Do not score the model extra-pair reservation as a historical match.','cs_jul01_extra_alabama')
c('C09','pickens_francis_w','South Carolina governor','reservations','Later two armed regiments',
  'Selects Orr and proposes existing twelve-month regiments as other contingent, if term change can be secured','1861-07-05',
  'OR-IV-I:420;OR-IV-I:421','eligible','Qualification is to later two-regiment call, not reserve corps. Gist interview and repeated explanations add no act.','sc_later_pair')
c('C10','brown_joseph_e','Georgia governor','reservations','Reserve corps and appointment authority',
  'Protests appointment authority but undertakes 3000, conditional on reception and federal support; cannot promise arms','1861-07-06',
  'OR-IV-I:421;OR-IV-I:422','eligible','One reserve-corps act. Cavalry supply difficulty retained in context; not an additional plan objection.','cs_jun30_reserve_georgia')
c('C11','moore_thomas_o','Louisiana governor','reservations','Reserve corps raising and support',
  'Will form reserve, proposes crediting Marigny regiment and rejects State-funded camp support','1861-07-06/07',
  'OR-IV-I:422;OR-IV-I:423;OR-IV-I:478','eligible','Grivot July 7 transmits Moore instruction on same matter, not a second actor act or relay objection. July 15 order is follow-through.','cs_jun30_reserve_louisiana')
c('C12','brown_joseph_e','Georgia governor','reservations','Later two armed regiments versus State brigade',
  'Declines dismantling brigade but promises two new regiments and offers whole brigade on specified command terms','1861-07-08',
  'OR-IV-I:424','eligible','One qualified undertaking of later pair. Conditional five-regiment offer not five acts and not delay evidence.','cs_jul01_extra_georgia')
c('C13','johnston_joseph_e','Valley commander','reservations','Valley resistance under June 15 direction',
  'Undertakes to conform as nearly as circumstances permit and emphasizes ammunition limitation','1861-06-17',
  'OR-I-II:924;OR-I-II:925;OR-I-II:934','excluded','The government already allows broad discretion, and Cooper June 18 confirms it. A statement of endeavor under ammunition limits does not establish an imposed reservation against that instruction. Not objection to July reinforcement.','johnston_valley_defense')
c('C14','holmes_theophilus_h','Fredericksburg commander','reservations','Supporting Commander Lewis river expedition',
  'Dispatches Bate as directed while saying force is unnecessarily strong and success would be miraculous','1861-06-28',
  'OR-I-II:959','eligible','Primary undertaking plus substantive reservation. OR editors do not identify expedition; keep this bounded identity, do not equate it with any convenient model transfer.','holmes_river_expedition')
c('C15','johnston_joseph_e','Valley commander','plan_objections','Keeping force at Harpers Ferry',
  'Challenges fixed garrison and proposes moving force rather than losing it','1861-06-06',
  'OR-I-II:896;OR-I-II:897;OR-I-II:907;OR-I-II:908;OR-I-II:910','eligible',
  'June 6 reply to June 3 instruction. Earlier warning is support, not additional act. Lee response puts subject before Davis; not resistance solely to a fellow general.','johnston_harpers_ferry')
c('C16','holmes_theophilus_h','Fredericksburg commander','plan_objections','Conditional withdrawal from Mathias Point',
  'Rejects withdrawal responsibility under no-enemy-landing condition and challenges strategic value of retaining point','1861-07-12',
  'OR-I-II:959;OR-I-II:975;OR-I-II:976','eligible','Specific response to government disposition, not generic dislike or troop call. Earlier Evansport discussion is supporting context.','holmes_mathias')
c('C17','toombs_robert','Secretary of State / adviser','plan_objections','Bombarding Sumter',
  'Secondary recounts warning Davis against attack as politically fatal','April 1861 before bombardment',
  'Burlingame-22:2403','qualified_source','Page and footnote read: Stovall dramatic wording is disputed; Walker retrospective recollection is corroboration cited by author, not separately read. Admit only with lead explicit source qualification, no exact quotation certified.','toombs_sumter')
c('C18','moore_thomas_o','Louisiana governor','outside_seven','Changing remaining twelve-month troops to war terms',
  'Will not seek changed terms unless government positively rejects twelve-month service','1861-05-07',
  'OR-IV-I:295;OR-IV-I:355','excluded','Conditional refusal of requested enlistment change, not plan objection or proof of slow walking. May 25 disbandment is not silently assigned a defiant motive.','louisiana_enlistment_change')
c('C19','brown_joseph_e','Georgia governor','outside_seven','State brigade after specific July 12 demand',
  'Will not disband brigade; reports two new regiments ready and reiterates whole brigade offer','1861-07-14/15',
  'OR-IV-I:466;OR-IV-I:477;OR-IV-I:478','excluded','Materially new demand for actual brigade regiments; refusal retained. Not another reservation on C12 or generic plan objection; July 14/15 letters support one response.','georgia_brigade')
c('C20','beauregard_pierre_g_t','Charleston commander','outside_seven','Immediate dispatch of Haskell to Baltimore',
  'Says Haskell cannot go immediately and asks department to send another officer','1861-03-21',
  'OR-I-I:276;OR-I-I:279','excluded','Personnel dispatch refusal/substitution, not a proved named relay hold or plan objection; no eventual addressee delay caused by reluctance established.','haskell_dispatch')
c('C21','moore_andrew_b','Alabama governor','outside_seven','War terms for previously raised twelve-month troops',
  'Asks if new war-term rule includes already raised companies and predicts refusal by some men','1861-05-08',
  'OR-IV-I:302;OR-IV-I:303','excluded','Clarification and predicted acts by unnamed troops are not a completed governor pushback act or slow walk.','alabama_enlistment_change')
c('C22','brown_joseph_e','Georgia governor','outside_seven','Armed State troops leaving Georgia',
  'Walker attributes a resolution not to let State-armed troops depart and offers twelve-month acceptance','1861-05-25',
  'OR-IV-I:355','excluded','Contemporary reported resolution retained; governor own instruction and its exact demand/date not verified. Do not equate with C12 or invent a delay.','georgia_arms')
c('C23','garlington_albert_c','State brigade commander','outside_seven','Prospective South Carolina brigade transfer',
  'Asks Jamison to preserve brigade and his command if troops consent to Confederate service','1861-04-23',
  'OR-IV-I:236','excluded','Page says call not yet made. Prospective preference is not an act against an identified government order.','sc_brigade')
c('C24','beauregard_pierre_g_t','Manassas commander','outside_seven','Manassas defenses and reinforcement need',
  'Reports inadequate force for all fords and alternatives of reinforcement or retirement','1861-06-03',
  'OR-I-II:901;OR-I-II:902','excluded','Situation report alone does not establish a refusal or qualification of a specified received instruction. No private reluctance inferred.','beauregard_defense')
c('C25','holmes_theophilus_h','Fredericksburg commander','plan_objections','Retaining the main force at Fredericksburg',
  'Challenges the size of the force retained and proposes leaving 500 while moving main force to Manassas','1861-06-15',
  'OR-I-II:907;OR-I-II:929;OR-I-II:932','eligible','Official June 5 assignment supplies the order link; June 15 is one counterproposal and Lee June 17 rejects reduction for now. Different course from July Mathias Point condition.','holmes_fredericksburg')
c('C26','holmes_theophilus_h','Fredericksburg commander','outside_seven','Beauregard proposed detachments from Fredericksburg',
  'Disagrees with Beauregard proposal to detach part of command','1861-06-18','OR-I-II:932;OR-I-II:933','excluded',
  'Competing commander proposal, not government instruction; consistent with Lee June 17 decision to retain force. Do not count ordinary inter-command disagreement as resistance to government.','holmes_detachment')
c('C27','magruder_john_b','Peninsula commander','outside_seven','Inherited enclosed defense work',
  'Calls work unhelpful but says he did not interfere because plan preceded his arrival','1861-06-03','OR-I-II:902;OR-I-II:903','excluded',
  'No identified government instruction or qualification imposed on it in pages read; situation/engineering criticism alone does not establish an addressee reservation.','magruder_works')

table(P/'union-register.csv',[a for a in acts if a['side']=='union'])
table(P/'confederate-register.csv',[a for a in acts if a['side']=='confederate'])
import csv
old=list(csv.DictReader((P.parent/'S87/catalogue-disposition.csv').open(encoding='utf-8')))
disposition=[]
for row in old:
    linked=[a for a in acts if row['catalogue_id'] in a['catalogue_ids'].split(';')]
    assert linked,row['catalogue_id']
    disposition.append(dict(catalogue_id=row['catalogue_id'],prior_reading_status=row['reading_status'],
      rows=';'.join(a['id'] for a in linked),status=';'.join(sorted({a['status'] for a in linked})),
      source_refs=';'.join(sorted({r for a in linked for r in a['source_refs'].split(';')})),
      disposition=' | '.join(a['reason'] for a in linked)))
assert len(disposition)==41
table(P/'catalogue-disposition.csv',disposition)
bands=['relay_objections','relay_holds','filter_holds','trims','reservations','slow_walk','plan_objections']
schedule=[]
for side in ['union','confederate']:
    for band in bands:
        core=[a['id'] for a in acts if a['side']==side and a['band']==band and a['status']=='eligible']
        qualified=[a['id'] for a in acts if a['side']==side and a['band']==band and a['status']=='qualified_source']
        schedule.append(dict(side=side,band=band,proposed_required=len(core),required_rows=';'.join(core),
          qualified_source_rows=';'.join(qualified),qualified_count=len(qualified),
          obligation_if_qualified_rows_accepted=len(core)+len(qualified),
          obligation='Every accepted named row, once; no substitution by unrelated acts',
          excess_ceiling='none proposed; needs denominator and separate ruling',
          authority='proposed only; 0111 requires lead acceptance before scorer changes'))
table(P/'coverage-proposal.csv',schedule)
print({side:{b:sum(a['side']==side and a['band']==b and a['status']=='eligible' for a in acts) for b in bands} for side in ['union','confederate']})
