// Shared helpers: start vite, launch Chromium with the GPU enabled, and sample GPU memory from Windows counters.
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function startVite(port = 5273) {
  const server = await createServer({ root, server: { port, strictPort: true }, logLevel: 'error' });
  await server.listen();
  return { server, url: `http://localhost:${port}` };
}

/** gpu: 'hardware' (ANGLE/D3D11, the default path) or 'software' (SwiftShader, for contrast). */
export async function launch({ gpu = 'hardware', headless = false } = {}) {
  const args = gpu === 'hardware'
    ? ['--use-angle=d3d11', '--enable-gpu-rasterization', '--ignore-gpu-blocklist', '--enable-precise-memory-info']
    : ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--disable-gpu', '--enable-precise-memory-info'];
  // Playwright 1.65 wants chromium-1255, which is not installed; reuse an installed Chromium build instead of downloading.
  const executablePath = process.env.CHROMIUM_PATH ?? join(process.env.LOCALAPPDATA, 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');
  return chromium.launch({ headless, args, executablePath });
}

/** Total dedicated GPU memory (MB) in use on the adapter, and for a given process id, via Windows performance counters. */
export function gpuCounters(pid) {
  const ps = `
$a = (Get-Counter '\\GPU Adapter Memory(*)\\Dedicated Usage' -ErrorAction SilentlyContinue).CounterSamples | Where-Object { $_.CookedValue -gt 0 } | ForEach-Object { [pscustomobject]@{ n = $_.InstanceName; mb = [math]::Round($_.CookedValue/1MB,1) } }
$p = $null
${pid ? `$p = (Get-Counter '\\GPU Process Memory(pid_${pid}*)\\Dedicated Usage' -ErrorAction SilentlyContinue).CounterSamples | Measure-Object -Property CookedValue -Sum | ForEach-Object { [math]::Round($_.Sum/1MB,1) }` : ''}
[pscustomobject]@{ adapters = @($a); processDedicatedMB = $p } | ConvertTo-Json -Compress -Depth 4`;
  try { return JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-Command', ps], { encoding: 'utf8', timeout: 20000 })); } catch (e) { return { error: String(e.message).slice(0, 200) }; }
}
