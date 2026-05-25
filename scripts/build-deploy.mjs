#!/usr/bin/env node
// Build the static AR-demo deploy bundle for Azure Static Web Apps.
// Produces: deploy/ containing index.html, legacy.html, test-ios.html,
// the AR.js libs that legacy.html needs, the data/ assets, and the SWA config.
// Run: node scripts/build-deploy.mjs

import { rm, mkdir, copyFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'deploy');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

// Top-level HTML pages and SWA config.
const topLevel = [
  'index.html',
  'legacy.html',
  'test-ios.html',
  'staticwebapp.config.json',
];
for (const f of topLevel) {
  await copyFile(resolve(root, f), resolve(out, f));
}

// AR.js libraries (needed by legacy.html). They live in public/ at runtime
// because Vite serves public/ from the URL root; in the deploy bundle they
// need to sit at the deploy root.
const aframeLibs = ['aframe-master.min.js', 'aframe-ar.js'];
for (const f of aframeLibs) {
  await copyFile(resolve(root, 'public', f), resolve(out, f));
}

// Copy public/data wholesale, minus dev-only junk.
const dataIn = resolve(root, 'public', 'data');
const dataOut = resolve(out, 'data');
await mkdir(dataOut, { recursive: true });
const SKIP = new Set(['.DS_Store', 'test-apple.usdz']);
for (const name of await readdir(dataIn)) {
  if (SKIP.has(name)) continue;
  const src = join(dataIn, name);
  const s = await stat(src);
  if (!s.isFile()) continue;
  await copyFile(src, join(dataOut, name));
}

console.log(`Built deploy bundle at ${out}`);
