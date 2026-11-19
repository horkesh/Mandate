/** Run only the already-baked preflight; never start an automatic full bake. */
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {installDesk} from '../server/http.ts';
const root=fileURLToPath(new URL('..',import.meta.url));
const server=await createServer({root,configFile:false,
 server:{host:'127.0.0.1',port:5274,strictPort:true,cors:false,fs:{strict:true,allow:[root]}},
 plugins:[{name:'r28-preflight',configureServer(vite){installDesk(vite,{pack:'union-1861',atWar:true});}}]});
await server.listen();server.printUrls();
