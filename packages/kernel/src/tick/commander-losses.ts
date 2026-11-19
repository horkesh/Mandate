/** Report every newly lost post holder, regardless of which phase took him. R48 / 0052. */
import { strictCompare } from '../compare.ts';
import type { PersonId, PostId } from '../ids.ts';
import { term } from '../knowledge/truth.ts';
import type { State } from '../root-state.ts';
import { headquartersOf, postFaction } from '../seats/posts.ts';
import { fire, sendReport, type TickContext } from './context.ts';

export function commanderLossReports(ctx: TickContext, before: State, state: State): void {
  for (const post of Object.keys(before.postStates).sort(strictCompare) as PostId[]) {
    const person = before.postStates[post]!.postHolder;
    if (person === null || state.postStates[post]?.postHolder === person) continue;
    const status = state.personStatus[person];
    if (status === undefined || status.statusKind === 'serving' || status === before.personStatus[person]) continue;
    const side = postFaction(ctx.world, before, post);
    if (side === null) continue;
    const principal = ctx.world.faction(side).principal;
    let author: PersonId = principal;
    let authorPost: PostId | null = null;
    for (let parent = before.postStates[post]!.postParent; parent !== null; parent = state.postStates[parent]?.postParent ?? null) {
      const holder = state.postStates[parent]?.postHolder ?? null;
      if (holder !== null && (state.personStatus[holder]?.statusKind ?? 'serving') === 'serving') {
        author = holder;
        authorPost = parent;
        break;
      }
    }
    const region = headquartersOf(ctx.world, before, post);
    sendReport(ctx, state, {
      body: {
        reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: author, reportAuthorPost: authorPost,
        reportSubjectKind: 'post', reportSubjectId: post,
        reportClaims: [{ claimKind: 'commander-lost', claimRegion: region, claimValue: 0, claimToken: status.statusKind, claimConfidence: 900 }],
        reportDay: ctx.day, reportHour: null, reportAdvice: null, reportAnswers: null,
      },
      truth: { truthTerms: [term('observed', 0, { person, post, rule: status.statusKind })], truthTrimmed: [] },
      to: principal, tag: `commander-lost.${post}`, fromRegion: region,
    });
    fire(ctx, 'reports.commander_lost');
  }
}
