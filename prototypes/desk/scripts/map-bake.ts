import {ensureMapAtlases} from './bake-map.ts';
import {ensureRuntimeMaps} from './runtime-map.ts';
const args=process.argv.slice(2),at=args.indexOf('--pack'),look=args.indexOf('--look');
const packs=at>=0?[args[at+1]!]:['union-1861','testbed'];
await ensureMapAtlases(packs,args.includes('--force'),args.includes('--preflight'),look>=0?args[look+1]:undefined);
ensureRuntimeMaps(packs);
