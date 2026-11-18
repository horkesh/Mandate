import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { installDesk } from '../server/http.ts';
import {ensureMapAtlases} from './bake-map.ts';
import {ensureRuntimeMaps} from './runtime-map.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const at = args.indexOf('--pack');
const pack = at >= 0 ? args[at + 1] : (args.find(x => !x.startsWith('--')) ?? 'union-1861');
if (pack !== 'union-1861' && pack !== 'testbed') throw Error('Use --pack union-1861 or --pack testbed');
await ensureMapAtlases([pack]);
ensureRuntimeMaps([pack]);
const server = await createServer({
  root, configFile: false,
  server: { host: '127.0.0.1', port: 5274, strictPort: true, cors: false, fs: { strict: true, allow: [root] } },
  plugins: [{ name: 'local-desk', configureServer(vite) { installDesk(vite, { pack, atWar: args.includes('--at-war') }); } }],
});
await server.listen();
server.printUrls();
