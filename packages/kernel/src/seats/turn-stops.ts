/** Shell settings, never State or commands: which received decision points end a turn. */
export const TURN_STOP_POINTS = ['battle-report', 'objection', 'objective-reached', 'order-conflict', 'plan-review', 'pocket-closed', 'situation-lapsed', 'situation-options', 'situation-resurfaced', 'situation-surfaced'] as const;
export type TurnStopPoint = (typeof TURN_STOP_POINTS)[number];
export interface TurnStopsView {
 readonly maxDays: number;
 readonly points: readonly {readonly point: TurnStopPoint; readonly enabled: boolean}[];
}
