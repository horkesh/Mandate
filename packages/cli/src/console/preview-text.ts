import { EDIT_KINDS } from '@mandate/kernel/seat-api';
import type { phase0 } from '@mandate/kernel';
import type { DeskStrings } from '../desk/strings.ts';

/** Both the console and browser display the pack's wording for a typed reason. */
export function previewReasonText(reason: phase0.EditPreviewFailure, t: DeskStrings): string {
  const key = 'console.preview.' + reason.kind;
  switch (reason.kind) {
    case 'invalid-edit':
      return reason.problems.map(({ kind, edit }) => t('console.preview.' + kind, { edit, kinds: EDIT_KINDS.join(', ') })).join('; ');
    case 'no-plan-draft':
    case 'no-plan-chosen':
      return t(key, { post: reason.post });
    case 'no-axis':
    case 'holding-axis':
      return t(key, { axis: String(reason.axis) });
    case 'no-axis-route':
      return t(key, { mode: reason.mode, from: reason.from, region: String(reason.region) });
    case 'no-waypoint':
      return t(key, { region: String(reason.region), mode: reason.mode });
    case 'no-route':
      return t(key, { region: String(reason.region) });
    case 'last-axis':
    case 'too-many-axes':
    case 'too-few-blocks':
    case 'unknown-strength':
      return t(key);
  }
}
