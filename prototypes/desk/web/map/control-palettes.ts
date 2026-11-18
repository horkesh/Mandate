/** Live pigment only. Static paper, relief, rivers and geography are shared. */
export type ControlPalette = 'strong' | 'research';
export const CONTROL_PALETTE_IDS: ControlPalette[] = ['research','strong'];
export const CONTROL_PALETTES = {
 strong: {
  colours:{friendly:0x084bd6,enemy:0xd32238,neutral:0xf7c52f,correction:0x79438f},
  middle:1, rim:[[9,.17],[4,.3],[1.4,.8]],
 },
 research: {
  colours:{friendly:0x1f59a8,enemy:0xc33830,neutral:0xd5a32f,correction:0x76509b},
  middle:.66, rim:[[6,.17],[2.5,.3],[1.2,.8]],
 },
} as const;
export function readControlPalette(search:string):ControlPalette {
 return new URLSearchParams(search).get('palette')==='strong'?'strong':'research';
}
