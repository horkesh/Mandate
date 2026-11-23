"""Apply only the lead-accepted S101 clauses. Run at the worktree root; no network."""
from pathlib import Path
import csv
import json

HERE = Path(__file__).parent
PACK = Path('packs/union-1861')

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def write(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

def rows(name):
    with (HERE / 'inputs' / name).open(encoding='utf-8', newline='') as f:
        return list(csv.DictReader(f))

base = {r['terms_id']: r for r in read(HERE / 'inputs/call-terms.json')['terms']}
values = {r['terms_id']: r for r in rows('value-mapping.csv')}
register = rows('call-register.csv')
KINDS = ['service_term', 'organisation', 'appointments', 'arms_equipment', 'destination', 'other_conditions']

def split(value):
    return value.split(';') if value else []

def demands(terms, text):
    # Typed categorical transcription [I]. No quantity or available inventory is inferred.
    spec = {
        'CS-A08': [('equipment', 'required', 'unspecified'), ('arms', 'unspecified', 'either'), ('clothing', 'required', 'volunteer')],
        'CS-A16': [('arms', 'as_practicable', 'either'), ('equipment', 'as_practicable', 'unspecified')],
        'CS-A22': [('arms', 'unspecified', 'either'), ('transport', 'required', 'national'), ('subsistence', 'required', 'national')],
        'CS-A22-N': [('arms', 'required', 'national'), ('clothing', 'required', 'volunteer'), ('transport', 'required', 'national'), ('subsistence', 'required', 'national')],
        'CS-J30-R': [('arms', 'not_required', 'unspecified')],
        'CS-J30-C': [('arms', 'required', 'unspecified'), ('equipment', 'required', 'unspecified'), ('horses', 'required', 'unspecified')],
        'CS-J01': [('arms', 'required', 'unspecified'), ('equipment', 'required', 'unspecified')],
        'US-NY2': [('arms', 'required', 'state'), ('equipment', 'required', 'state'), ('subsistence', 'required', 'national')],
    }.get(terms, [('arms', 'unspecified', 'unspecified'), ('equipment', 'unspecified', 'unspecified')])
    return [dict(resource=r, obligation=o, provider=p, quantity=None, demandText=text) for r, o, p in spec]

def instance(row):
    original = base[row['terms_id']]
    mapping = values[row['terms_id']]
    assert all(original[k] == mapping[k] for k in ['proposed_honours', 'proposed_offends', 'source_refs'])
    return dict(
        id=row['call_id'], sourceProfile=row['terms_id'],
        honours=split(mapping['proposed_honours']), offends=split(mapping['proposed_offends']),
        callProvenance=[dict(source=ref.rsplit(':', 1)[0], page=int(ref.rsplit(':', 1)[1])) for ref in split(row['source_refs'])],
        conditions=[dict(kind=k, clauseText=row[k]) for k in KINDS],
        materialDemand=demands(row['terms_id'], row['arms_equipment']),
        rationale=mapping['value_rationale'], limits=row['limits'],
    )

profiles = [instance(r) for r in register]
# The accepted national proclamation profile is context, not an additional levy.
profiles.append(instance(dict(base['US-M03'], call_id='us_may03_national')))
# The lead specifically distinguished this later demand. Record it; do not create troops
# or dispatch a second levy for two regiments already raised (OR IV-I p.466).
profiles.append(dict(
    id='cs_jul12_brigade_demand', sourceProfile='CS-J12', honours=[], offends=['state_autonomy'],
    callProvenance=[dict(source='OR-IV-I', page=466)],
    conditions=[dict(kind=k, clauseText=t) for k, t in [
        ('service_term', 'Not restated in this demand.'),
        ('organisation', 'Send the two already organized regiments without standing upon brigade organization; President cannot accept a brigade.'),
        ('appointments', 'No separate appointment clause in this demand.'),
        ('arms_equipment', 'No new material admission clause in this demand.'),
        ('destination', 'Send the two regiments; no destination expressly assigned to those two. Semmes regiment separately ordered here.'),
        ('other_conditions', 'Walker demand to Brown, July 12; distinct from the July 1 extra-regiment call. Not another levy.'),
    ]],
    materialDemand=[], rationale='[I] The express removal of State brigade organization offends state_autonomy, as ruled by the lead for S102.',
    limits='Recorded only: this pack has no separate July 12 demand. Never apply this offence to July 1 or create a duplicate levy.',
))
assert len(profiles) == 100 and len({p['id'] for p in profiles}) == 100
manifest = read(PACK / 'pack.json')
manifest['rules']['recruitment']['callProfiles'] = profiles
assigned = []
for principal in manifest['rules']['ruleSeats']['principals']:
    for call in principal['calls']:
        assert call['id'] in {r['call_id'] for r in register}
        call['termsId'] = call['id']
        assigned.append(call['id'])
write(PACK / 'pack.json', manifest)
for path in sorted((PACK / 'situations').glob('*.json')):
    situation = read(path)
    dirty = False
    for option in situation.get('options', []):
        for call in option.get('calls', []):
            ident = 'us_apr15_' + call['to'].removeprefix('st_gov_')
            assert ident in {r['call_id'] for r in register}, (path, call)
            call['termsId'] = ident
            assigned.append(ident)
            dirty = True
    if dirty:
        write(path, situation)
write(HERE / 'application.json', dict(
    acceptedProfiles=20, researchedInstances=98, runtimeProfiles=100,
    doctrineCalls=len(manifest['rules']['ruleSeats']['principals'][0]['calls']) + len(manifest['rules']['ruleSeats']['principals'][1]['calls']),
    assigned=assigned, recordedOnly=['us_may15_minnesota_renewal', 'us_may03_national', 'cs_jul12_brigade_demand'],
    fallback=manifest['rules']['recruitment']['callTerms'],
    capacity='Unknown means: all demands recorded only; required remains zero.',
    materialClassification='Categorical [I] transcription; quantity null. Unspecified is not no obligation. No state inventory inferred.',
))
print('Applied 20 accepted source profiles to 98 instances; 73 doctrine calls and 48 option call slots; two context-only profiles, no new levy.')
