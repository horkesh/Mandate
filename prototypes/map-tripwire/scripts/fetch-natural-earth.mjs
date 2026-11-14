// Fetches Natural Earth 10m data into the git-ignored data/ne folder and records the licence sentence.
// Natural Earth: "All versions of Natural Earth raster + vector map data found on this website are in the public domain."
// (https://www.naturalearthdata.com/about/terms-of-use/, read 2026-11-14).
// Note: census.gov blocks this machine (Cloudflare 403), so Census data is NOT used (lead's ruling, 2026-11-14).
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { unzipSync } from 'fflate';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'data', 'ne');
mkdirSync(out, { recursive: true });

const FILES = [
  { name: 'ne_10m_admin_1_states_provinces', url: 'https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip' },
  { name: 'ne_10m_rivers_lake_centerlines', url: 'https://naciscdn.org/naturalearth/10m/physical/ne_10m_rivers_lake_centerlines.zip' },
];
const UA = { 'User-Agent': 'map-tripwire-fetch-script' };

for (const f of FILES) {
  if (existsSync(join(out, f.name + '.shp'))) { console.log('have', f.name); continue; }
  console.log('fetching', f.url);
  const res = await fetch(f.url, { headers: UA });
  if (!res.ok) throw new Error(`${f.url}: HTTP ${res.status}`);
  const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
  for (const [path, bytes] of Object.entries(files)) {
    if (/\.(shp|dbf|prj|cpg|shx)$/i.test(path)) writeFileSync(join(out, path.split('/').pop()), bytes);
  }
}

// Record the licence sentence verbatim from the page, so the README can cite what was actually read.
const page = await (await fetch('https://www.naturalearthdata.com/about/terms-of-use/', { headers: UA })).text();
const text = page.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const m = text.match(/All versions of Natural Earth raster \+ vector map data found on this website are in the public domain\./);
if (!m) throw new Error('Licence sentence not found on the Natural Earth terms page; do not use the data until checked.');
writeFileSync(join(out, 'LICENCE.txt'), `Source: https://www.naturalearthdata.com/about/terms-of-use/\nRead: ${new Date().toISOString().slice(0, 10)}\n\n"${m[0]}"\n`);
console.log('licence sentence confirmed:', m[0]);
