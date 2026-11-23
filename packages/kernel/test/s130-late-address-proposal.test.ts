import { describe, expect, it } from 'vitest';
import { enactMandate } from '../src/command/authority.ts';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import type { ReportBody } from '../src/knowledge/report.ts';
import { senderFor } from '../src/seats/sender.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { indexWorld } from '../src/world/index.ts';
import type { MandateGrant } from '../src/world/mandates.ts';
import { fixtureMap, fixtureStart, P, POST, R } from './support/seats-fixture.ts';

const office = POST('a_office');
const late = POST('late_command');
const commander = P('a_spy');
const secretary = P('a_sec');
const seat = seatIdFor(secretary);
const principal = seatIdFor(P('a_lead'));
const department = toId('department', 'a_war');
const message = toId('message', 'm.late.return');
const noTruth = { truthTerms: [], truthTrimmed: [] } as const;

function fixture() {
  const base = fixtureMap();
  const map = indexWorld({ ...base.world, vocabularies: { ...base.world.vocabularies,
    postKinds: base.world.vocabularies.postKinds.map(k => k.id === 'expedition' ? { ...k, creatable: 'appoint' as const } : k),
  } });
  const world = indexSeatsWorld(map, { ...fixtureStart(), temporaryPosts: [{
    id: late, name: 'post.late_command', kind: 'expedition', department, parent: office, holder: null, region: R('a_mid'), operation: 'late_operation',
  }] });
  const opening = { ...createState(world, { seed: 17 }), stateDay: 5 };
  const grant: MandateGrant = { mandateKey: 'root', mandateRevision: 1, mandateIssuer: P('a_lead'), mandateIssuerPost: null,
    mandateHolder: secretary, mandatePost: office, mandateParent: null, mandateActions: ['attack_or_demonstrate'],
    mandateRecipients: [office], mandateRegions: [R('a_mid')], mandateModes: ['land'],
    mandateCeiling: { ceilingPost: office, ceilingMen: null }, mandateGuard: null, mandateExpires: null,
    mandateReports: [], mandateOnward: false, mandateRevoke: false };
  const active = enactMandate(map, opening, grant, toId('message', 'm.root'), 1, 'answered', ['attack_or_demonstrate']);
  const body: ReportBody = { reportType: 'strength-return', reportSubtype: null, reportAuthor: commander, reportAuthorPost: late,
    reportSubjectKind: 'post', reportSubjectId: late, reportDay: 4, reportHour: null, reportAnswers: null, reportAdvice: null,
    reportClaims: [{ claimKind: 'present-for-duty', claimRegion: null, claimValue: 300, claimToken: null, claimConfidence: 900 }] };
  return { world, active, body };
}

describe('address of a declared late command under a received mandate', () => {
  it('uses one received self-attributed return and the declared parent, surviving hidden chain/holder changes', () => {
    const { world, active, body } = fixture();
    const report = { id: message, knownReceivedDay: 5, knownRoute: 'mail', knownVia: [], knownBody: body } as const;
    const heard = deliverReport(active, seat, report, noTruth);
    const sender = (state: typeof active) => senderFor(world, state, seat, undefined, undefined, office, late)!;
    expect(sender(active).known(late)).toBe(false);
    expect(sender(heard).holder(late)).toBe(commander);
    expect(sender(heard).chain(late)).toEqual([late]);
    const hidden = { ...heard, postStates: { ...heard.postStates, [late]: {
      ...heard.postStates[POST('a_army')]!, postParent: POST('b_office'), postHolder: P('b_gen'),
    } } };
    expect(sender(hidden).holder(late)).toBe(commander);
    expect(sender(hidden).chain(late)).toEqual([late]);
    expect(senderFor(world, heard, seat, undefined, undefined, office)?.known(late)).toBe(false);
    const principalKnowledge = deliverReport(active, principal, report, noTruth);
    expect(senderFor(world, principalKnowledge, principal, undefined, undefined, office, late)?.posts.get(late))
      .toMatchObject({ holder: commander, parent: null, placementKnown: false });
  });

  it('leaves withheld, future, unscoped, anonymous and superseded addresses closed', () => {
    const { world, active, body } = fixture();
    const report = { id: message, knownReceivedDay: 5, knownRoute: 'mail', knownVia: [], knownBody: body } as const;
    const sender = (state: typeof active) => senderFor(world, state, seat, undefined, undefined, office, late)!;
    expect(sender(deliverReport(active, seat, { ...report, knownReceivedDay: 6 }, noTruth)).known(late)).toBe(false);
    expect(sender(deliverReport(active, seat, { ...report, knownBody: { ...body, reportClaims: [] } }, noTruth)).known(late)).toBe(false);
    const heard = deliverReport(active, seat, report, noTruth);
    expect(sender({ ...heard, authorityByPost: {} }).known(late)).toBe(false);
    const vacant = deliverReport(heard, seat, { ...report, id: toId('message', 'm.late.vacant'), knownBody: {
      ...body, reportType: 'wire-dispatch', reportAuthor: secretary, reportAuthorPost: office, reportDay: 5,
      reportClaims: [{ claimKind: 'commander-lost', claimRegion: null, claimValue: 1, claimToken: 'captured', claimConfidence: 1000 }],
    } }, noTruth);
    expect(sender(vacant).known(late)).toBe(false);
  });
});
