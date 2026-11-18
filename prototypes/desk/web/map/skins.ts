import type { Point } from './model.ts';

export type Look = '0' | 'A' | 'B' | 'C';
export const LOOKS: Look[] = ['0','A','B','C'];
export const LOOK_NAMES = { '0': "Today's map", A: "The engineer's manuscript", B: 'The engraved atlas plate', C: 'The coloured war map of the press' };
export function readLook(search: string): Look {
  const value = new URLSearchParams(search).get('look');
  return LOOKS.includes(value as Look) ? value as Look : 'A';
}
export const PALETTES = {
  '0': {paper:'#e9dfc9',water:'#bfcbc8',quiet:'#ded8c6',land:'#e9dfc9',ink:'#464b40',river:'#638f9b',relief:'#8c8068',rail:'#555a4b',font:'Fell',border:.045},
  A: {paper:'#ead9b3',water:'#ead9b3',quiet:'#e5d9bd',land:'#ead9b3',ink:'#68472f',river:'#507d91',relief:'#795338',rail:'#29241e',font:'Fell',border:.045},
  B: {paper:'#fffefa',water:'#fffefa',quiet:'#f2f1eb',land:'#fffefa',ink:'#000000',river:'#000000',relief:'#000000',rail:'#000000',font:'Standard',border:.032},
  C: {paper:'#f1dfb9',water:'#bad1c8',quiet:'#e0dbc4',land:'#f1dfb9',ink:'#394333',river:'#487d87',relief:'#8c7959',rail:'#424b39',font:'Caslon',border:.10},
};

/** Canonical coordinates, not traversal order, seed every displaced vertex.
 * Shared boundaries therefore coincide even when adjacent polygons reverse it.
 * Endpoints remain anchored. No geography or hit geometry is modified. */
export function roughLine(points: readonly Point[], amplitude=.018): Point[] {
  return points.map(([x,y],i)=> {
    if(i===0||i===points.length-1)return [x,y];
    let h=(Math.imul(Math.round(x*1e5),73856093)^Math.imul(Math.round(y*1e5),19349663)^22018)>>>0;
    h^=h<<13;h^=h>>>17;h^=h<<5;
    const a=((h>>>0)/4294967295-.5)*2*amplitude;
    return [x+a,y+a*.73];
  });
}
