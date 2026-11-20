/** Bounded browser-proof server: reuse the saved map; never bake unrelated assets. */
import {createServer} from 'vite';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {installDesk} from '../server/http.ts';
const root=fileURLToPath(new URL('..',import.meta.url));
for(const file of ['union-1861-atlas/manifest.json','union-1861-atlas/geometry.json'])if(!existsSync(`${root}/public/map-data/${file}`))throw Error(`Missing ${file}; run npm run map:setup`);
const server=await createServer({root,configFile:false,server:{host:'127.0.0.1',port:5274,strictPort:true,cors:false,fs:{strict:true,allow:[root]}},plugins:[{name:'r66-local-desk',configureServer(vite){installDesk(vite,{pack:'union-1861',atWar:true});}}]});
await server.listen();server.printUrls();
