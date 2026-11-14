import { scale, strictCompare, type Decision, type FactionView, type KernelRules } from '@mandate/kernel';

/**
 * A scripted principal for the testbed: a plausible leader, not an optimal
 * one. It reads only its faction's view, as a human would.
 */
export function testbedScript(view: FactionView, rules: KernelRules): Decision[] {
  const out: Decision[] = [];
  const room = (n = 1) => out.length + n <= view.attentionPerTurn;
  const people = new Map(view.people.map((p) => [p.id, p]));

  // 1. Objections: give a man his way once; after that, insist.
  const objections = new Map<string, number>();
  for (const d of view.directives) {
    if (d.told?.declared === 'object') objections.set(d.told.personId, (objections.get(d.told.personId) ?? 0) + 1);
  }
  for (const d of view.directives) {
    if (!d.objectionPending || !d.told || !room()) continue;
    const insist = (objections.get(d.told.personId) ?? 0) >= 2;
    out.push({ verb: insist ? 'insist' : 'accept_counter', directiveId: d.id });
  }

  // 2. A man who refuses outright and still holds his post is dismissed.
  const vacated = new Set<string>();
  for (const d of view.directives) {
    if (d.told?.declared !== 'refuse' || !room()) continue;
    const person = people.get(d.told.personId);
    if (person?.status === 'active' && person.postId) {
      out.push({ verb: 'dismiss', personId: person.id });
      vacated.add(person.postId);
    }
  }

  // 2b. A man whose overseer has contradicted his battle reports twice is dismissed (P4: the gap is the evidence).
  const contradictions = new Map<string, number>();
  for (const c of view.claims) {
    if (c.author.kind !== 'overseer' || c.body.kind !== 'op_result') continue;
    const body = c.body;
    const own = view.claims.find(
      (x) => x.author.kind === 'person' && x.body.kind === 'op_result' && x.body.operationId === body.operationId,
    );
    if (own && own.body.kind === 'op_result' && own.body.reportedEnemyForce !== body.reportedEnemyForce) {
      contradictions.set(c.author.watchingId, (contradictions.get(c.author.watchingId) ?? 0) + 1);
    }
  }
  for (const [personId, count] of [...contradictions].sort((a, b) => strictCompare(a[0], b[0]))) {
    const person = people.get(personId);
    if (count >= 2 && person?.status === 'active' && person.postId && !vacated.has(person.postId) && room()) {
      out.push({ verb: 'dismiss', personId });
      vacated.add(person.postId);
    }
  }

  // 3. Fill vacant posts with the boldest competent man available, keeping any promise made to him.
  const vacant = [...view.posts.filter((p) => p.holderId === null).map((p) => p.id), ...vacated].sort(strictCompare);
  const candidates = view.people
    .filter((p) => p.status === 'active' && p.postId === null)
    .sort((a, b) => b.boldness + b.competence - (a.boldness + a.competence) || strictCompare(a.id, b.id));
  for (const postId of vacant) {
    const candidate = candidates.shift();
    if (candidate && room()) out.push({ verb: 'appoint', postId, personId: candidate.id });
  }

  // 4. On the first turn, promise the boldest unposted man a command.
  if (view.turn === 0 && candidates[0] && room()) out.push({ verb: 'promise', personId: candidates[0].id });

  // 4b. Send accumulated levies from offices to the weakest army (assets belong to posts: P1).
  const armies = view.posts.filter((p) => p.kind === 'field' && p.holderId !== null).sort((a, b) => a.force - b.force || strictCompare(a.id, b.id));
  const sending = new Set(view.directives.filter((d) => d.objective.kind === 'transfer' && view.day - d.issuedDay < 28).map((d) => d.postId));
  for (const office of view.posts) {
    const weakest = armies[0];
    if (!weakest || !room() || office.kind !== 'office' || office.holderId === null || sending.has(office.id)) continue;
    if (office.force * 4 < weakest.force) continue;
    out.push({ verb: 'allocate', fromPostId: office.id, toPostId: weakest.id, amount: office.force });
    armies.push(armies.shift()!);
  }

  // 4c. Honour a commander who has just taken ground, even though fame makes him harder to control (P6).
  for (const c of view.claims) {
    if (c.knownDay < view.day - 7 || c.body.kind !== 'op_result' || c.body.outcome !== 'taken' || c.author.kind !== 'person' || !room()) continue;
    const person = people.get(c.author.personId);
    if (person?.status === 'active' && !out.some((d) => d.verb === 'honour')) out.push({ verb: 'honour', personId: person.id });
  }

  // 5. Repulsed and not watched? Attach an overseer to the commander who reported it.
  for (const c of view.claims) {
    if (c.body.kind !== 'op_result' || c.body.outcome !== 'repulsed' || c.author.kind !== 'person' || !room()) continue;
    const person = people.get(c.author.personId);
    if (person?.status === 'active' && !person.overseen && !out.some((d) => d.verb === 'oversee')) {
      out.push({ verb: 'oversee', personId: person.id });
    }
  }

  // 6. If the mandate is slipping before the vote, court the least happy bloc.
  if (view.mandate < 200 && room()) {
    const weakest = [...view.blocs].sort((a, b) => a.support - b.support || strictCompare(a.id, b.id))[0];
    if (weakest) out.push({ verb: 'address', blocId: weakest.id });
  }

  // 7. Idle field armies are ordered forward against the weakest reported enemy region.
  const busy = new Set(view.directives.filter((d) => view.day - d.issuedDay < 28).map((d) => d.postId));
  for (const post of view.posts) {
    if (!room() || post.kind !== 'field' || post.holderId === null || busy.has(post.id) || vacated.has(post.id)) continue;
    const region = view.regions.find((r) => r.id === post.regionId);
    const target = region?.neighbours
      .map((id) => view.regions.find((r) => r.id === id)!)
      .filter((r) => r.controllerId !== view.factionId)
      .sort((a, b) => (a.lastEstimate?.force ?? 0) - (b.lastEstimate?.force ?? 0) || strictCompare(a.id, b.id))[0];
    if (!target) continue;
    const estimate = target.lastEstimate?.force ?? 0;
    const confident = estimate === 0 || post.force >= scale(estimate, rules.attackRatio);
    out.push({ verb: 'direct', postId: post.id, objective: { kind: 'attack', targetRegionId: target.id }, boldness: confident ? 800 : 600 });
  }
  return out;
}
