import { COMPLIANCE_RUNGS } from '../directive.ts';
import type { PlansRules } from '../world/world.ts';
import { NOTE_KINDS } from './notes.ts';

/** Reject missing or invalid rules even when a caller bypasses the pack loader (0072). */
export function noteRulesProblems(rules: PlansRules['notes']): string[] {
  if (rules === undefined || rules === null) return ['plans note rules are required'];
  const problems: string[] = [];
  for (const [key,min] of [['maxMarks',1],['maxWaypoints',1],['maxWaitDays',0],['scoreWeight',0]] as const) {
    if (!Number.isSafeInteger(rules[key]) || rules[key]<min) problems.push(`plans note rule ${key} must be a whole number, at least ${min}`);
  }
  const permille=(v:number)=>Number.isSafeInteger(v)&&v>=0&&v<=1000;
  if (!Array.isArray(rules.rungs) || rules.rungs.length!==COMPLIANCE_RUNGS.length || new Set(rules.rungs.map(r=>r.rung)).size!==COMPLIANCE_RUNGS.length || rules.rungs.some(r=>!COMPLIANCE_RUNGS.includes(r.rung)||!permille(r.weight))) problems.push('plans note rules need one permille weight per compliance rung');
  if (!Array.isArray(rules.terms) || rules.terms.length!==NOTE_KINDS.length || new Set(rules.terms.map(t=>t.kind)).size!==NOTE_KINDS.length || rules.terms.some(t=>!NOTE_KINDS.includes(t.kind)||!permille(t.boldness))) problems.push('plans note rules need directive terms for each note kind');
  return problems;
}
