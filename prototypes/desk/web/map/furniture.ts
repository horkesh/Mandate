import type {Point} from './model.ts';
export const GLYPH_KINDS=['hamlet','town','city','capital','fort','earthwork','station','bridge','ferry','mountain','woods','marsh','compass','scale','cartouche'] as const;
export type GlyphKind=typeof GLYPH_KINDS[number];
export type Furniture={id:string;kind:GlyphKind;point:Point;name?:string;size?:number;source:string;orientation?:number;ridgeBand?:string};
export const furnitureScale=(zoom:number)=>zoom<2?'wide':zoom<5.2?'theatre':'close';
export {glyphPaths,glyphSvg,glyphDesign,glyphVariant} from './glyph-design.ts';
