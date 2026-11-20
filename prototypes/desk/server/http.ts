import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, sep } from 'node:path';
import { createDeskAdapter } from './adapter.ts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const proto = fileURLToPath(new URL('../', import.meta.url));
const json = (res: ServerResponse, code: number, data: unknown) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
};

export function installDesk(vite: ViteDevServer, options: { pack: string; atWar: boolean; port?:number; artRoot?:string }) {
  const port=options.port??5274;
  if(!Number.isSafeInteger(port)||port<1024||port>65535)throw Error('Invalid local desk port');
  const authority=`127.0.0.1:${port}`,origin=`http://${authority}`;
  const artRoot=resolve(options.artRoot??resolve(root,'art'));
  const desk = createDeskAdapter(options);
  vite.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const host = req.headers.host;
    if (host !== authority) return json(res, 403, { error: 'Loopback host only' });
    if (req.headers.origin && req.headers.origin !== origin) return json(res, 403, { error: 'Same origin only' });
    let path: string;
    try { path = decodeURIComponent(new URL(req.url ?? '/', origin).pathname).replaceAll('\\', '/'); }
    catch { return json(res, 400, { error: 'Invalid path' }); }
    if (path.startsWith('/api/')) {
      if (req.method === 'GET' && path === '/api/desk') return json(res, 200, desk.snapshot());
      if (req.method !== 'POST' || path !== '/api/command') return json(res, 404, { error: 'Unknown endpoint' });
      if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'JSON required' });
      try {
        let body = '';
        for await (const chunk of req) {
          body += String(chunk);
          if (body.length > 8192) return json(res, 413, { error: 'Command too long' });
        }
        const input = JSON.parse(body) as { line?: unknown; day?: unknown };
        if (typeof input.line !== 'string' || !Number.isSafeInteger(input.day)) return json(res, 400, { error: 'A command and morning day are required' });
        return json(res, 200, desk.execute(input.line, input.day as number));
      } catch (error) {
        console.error(error);
        return json(res, 400, { error: 'Command could not be read' });
      }
    }
    if (path.startsWith('/art/')) {
      // Art only, never masters, recipes, pack sources or arbitrary files.
      const appArt = /^\/art\/(?:_pilot|app\/(?:chrome|textures|sound))\/[a-z0-9@.-]+\.(?:png|wav)$/.test(path);
      const documentArt = /^\/art\/union-1861\/documents\/(?:telegraph-form-header|general-orders-head|masthead-ornament|rule-double|rule-thick-thin)(?:@2x)?\.png$/.test(path);
      if (!appArt && !documentArt) return json(res, 404, {});
      const file = resolve(artRoot, path.slice('/art/'.length));
      if (!file.startsWith(artRoot + sep) || !existsSync(file)) return json(res, 404, {});
      res.writeHead(200, { 'Content-Type': file.endsWith('.png') ? 'image/png' : 'audio/wav', 'Content-Length': statSync(file).size, 'Cache-Control': 'public, max-age=3600' });
      createReadStream(file).pipe(res); return;
    }
    // The Vite source server must not make server/ or sibling packages reachable.
    // The client needs only web/, fonts, and Vite's dependency/client modules.
    const normalized = path.replace(/^\/@fs\//, '');
    if (path.startsWith('/@fs/')) {
      if (!resolve(normalized).startsWith(resolve(proto, 'node_modules') + sep)) return json(res, 403, {});
    } else if (!(path === '/' || path === '/index.html' || /^\/map-data\/(union-1861|testbed)\.json$/.test(path) || /^\/map-data\/(union-1861|testbed)-atlas\/(?:(?:manifest|geometry)\.json|[ABC0]-(?:normal|lamp|contrast)(?:-study)?-[0-3]\.png)$/.test(path) || /^\/map-data\/union-1861-signs\/(?:manifest\.json|geographic\.png)$/.test(path) || path.startsWith('/web/') || path.startsWith('/fonts/') || path.startsWith('/node_modules/') || path.startsWith('/@vite/') || path.startsWith('/@id/'))) {
      return json(res, 404, {});
    }
    next();
  });
}
