import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const stockPaths={
  '/stocks/linen.png':resolve(repo,'art/app/textures/paper-linen-map.png'),
  '/stocks/letter.png':resolve(repo,'art/app/textures/paper-letter-2.png'),
};
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
export function createIconServer() {
  return createServer(async(req,res)=>{
    try {
      if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
      const path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
      let target=stockPaths[path]??resolve(root,'.'+(path==='/'?'/index.html':path));
      if(!stockPaths[path]&&(!target.startsWith(root+sep)|| /(?:^|[/\\])(?:node_modules|\.[^/\\]+)(?:[/\\]|$)/.test(path))){res.writeHead(403).end();return;}
      if(!(await stat(target)).isFile()){res.writeHead(404).end();return;}
      res.writeHead(200,{'Content-Type':types[extname(target)]??'text/plain','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      res.end(req.method==='HEAD'?undefined:await readFile(target));
    } catch {res.writeHead(404).end();}
  });
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const server=createIconServer();
  server.listen(5276,'127.0.0.1',()=>console.log('Icon sheet: http://127.0.0.1:5276/'));
}
