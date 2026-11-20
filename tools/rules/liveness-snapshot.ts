import { REFERENCE_RUNS } from '../../packages/cli/src/liveness-gate.ts';
import { collectBands } from './liveness-causes.ts';

export const currentBands = collectBands(REFERENCE_RUNS);
