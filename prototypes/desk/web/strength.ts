import type {ClaimView} from '@mandate/kernel/seat-api';

/** Format received components without turning the claim encoding into men. */
export function strengthText(value:number|null,s?:ClaimView['strength']):string {
  const range=s?.strengthLower==null?'':s.strengthLower===s.strengthUpper?String(s.strengthLower):`${s.strengthLower}–${s.strengthUpper}`;
  const inference=s?.strengthComponents.some(c=>c.componentBasis.startsWith('[I]'))?' [I]':'';
  if(value===null || s?.strengthUnknown)return range?`${range}${inference} + unknown remainder`:'unknown';
  return (range||String(value))+inference;
}
