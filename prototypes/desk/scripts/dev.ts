import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { installDesk } from '../server/http.ts';
import {ensureMapAtlases} from './bake-map.ts';
import {ensureFurnitureAtlas} from './bake-furniture.ts';
import {ensureRuntimeMaps} from './runtime-map.ts';
import {existsSync} from 'node:fs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const at = args.indexOf('--pack');
const pack = at >= 0 ? args[at + 1] : (args[0]&&!args[0].startsWith('--')?args[0]:'union-1861');
const portAt=args.indexOf('--port');
const port=Number(portAt>=0?args[portAt+1]:process.env.DESK_PORT??5274);
if(!Number.isSafeInteger(port)||port<1024||port>65535)throw Error('Use a local port between 1024 and 65535');
if (pack !== 'union-1861' && pack !== 'testbed') throw Error('Use --pack union-1861 or --pack testbed');
if(args.includes('--saved-map')){
 for(const file of ['manifest.json','geometry.json'])if(!existsSync(`${root}/public/map-data/${pack}-atlas/${file}`))throw Error(`Missing saved map ${file}`);
}else{
 await ensureMapAtlases([pack]);
 ensureRuntimeMaps([pack]);
 if(pack==='union-1861')await ensureFurnitureAtlas();
}
const server = await createServer({
  root, configFile: false,
  server: { host: '127.0.0.1', port, strictPort: true, cors: false, fs: { strict: true, allow: [root] } },
  plugins: [{ name: 'local-desk', configureServer(vite) { installDesk(vite, { pack, port, artRoot:process.env.DESK_ART_ROOT, atWar: args.includes('--at-war') }); } }],
});
await server.listen();
server.printUrls();
