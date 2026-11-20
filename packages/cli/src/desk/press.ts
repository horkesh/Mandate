/** A received paper's stories. No State, lookup of current holders or later returns. */
import type { ReportView } from '@mandate/kernel/seat-api';

export interface PressStory { readonly headline: string; readonly body: string; readonly battle?: string }
export function pressStories(report: ReportView, t: (key: string) => string): PressStory[] {
  if (report.type !== 'press') return [];
  const fill = (key: string, values: Record<string,string>) => t(key).replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
  const stories: PressStory[] = [];
  for (const c of report.claims) {
    if (c.kind === 'battle-result' && c.region !== null && ['won','lost','drawn'].includes(c.token ?? '')) {
      const words = c.commander == null ? [] : [fill('press.commander', {commander:t(`person.${c.commander}.name`)})];
      words.push(c.confidence === 0 ? t('press.no_figures') : fill(c.confidence >= 900 ? 'press.losses.full' : 'press.losses.first', {losses:String(c.value)}));
      const captured = report.claims.find(x => x.kind === 'captured' && x.battle !== undefined && x.battle === c.battle);
      if (captured && c.confidence >= 900) words.push(fill('press.captured', {captured:String(captured.value)}));
      stories.push({headline:fill(`press.headline.${c.token}`,{region:t(`region.${c.region}.name`)}),body:words.join(' '), ...(c.battle === undefined ? {} : {battle:c.battle})});
    } else if (c.kind === 'framing') {
      stories.push({headline:t('press.framing.headline'), body:t(c.value > 0 ? 'press.framing.other' : 'press.framing.own')});
    }
  }
  return stories;
}
