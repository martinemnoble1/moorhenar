#!/usr/bin/env node
// Merge the four 7BMG GLBs into one file with four named root nodes:
//   target, surface, map, drug
// Run: node scripts/merge-7bmg.mjs

import { NodeIO } from '@gltf-transform/core';
import { mergeDocuments } from '@gltf-transform/functions';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '..', 'public', 'data');

const inputs = [
  { name: 'target',  file: '7bmg-target.glb'  },
  { name: 'surface', file: '7bmg-surface.glb' },
  { name: 'map',     file: '7bmg-map.glb'     },
  { name: 'drug',    file: '7bmg-drug.glb'    },
];
const outputPath = resolve(dataDir, '7bmg-combined.glb');

const io = new NodeIO();
const out = await io.read(resolve(dataDir, inputs[0].file));
const outScene = out.getRoot().getDefaultScene() ?? out.getRoot().listScenes()[0];

// Wrap the first model's existing root nodes under a single named node.
const firstRoots = outScene.listChildren();
const firstWrap = out.createNode(inputs[0].name);
for (const child of firstRoots) {
  outScene.removeChild(child);
  firstWrap.addChild(child);
}
outScene.addChild(firstWrap);

// For the remaining files, read them and merge their nodes/meshes/materials
// into `out`, then attach under a named wrapper node.
for (let i = 1; i < inputs.length; i++) {
  const { name, file } = inputs[i];
  const doc = await io.read(resolve(dataDir, file));
  mergeDocuments(out, doc);

  // After merge, the incoming scene(s) live alongside the original. Move
  // their root nodes into our scene under a wrapper, then drop the extra
  // scene(s) so AR Quick Look sees a single composed scene.
  const allScenes = out.getRoot().listScenes();
  const incomingScenes = allScenes.filter(s => s !== outScene);
  const wrap = out.createNode(name);
  for (const s of incomingScenes) {
    for (const child of s.listChildren()) {
      s.removeChild(child);
      wrap.addChild(child);
    }
    s.dispose();
  }
  outScene.addChild(wrap);
}

outScene.setName('7bmg');

// GLB allows only one buffer; mergeDocuments() preserves each input's buffer.
// Point every accessor at the first buffer, then dispose the rest.
const buffers = out.getRoot().listBuffers();
const primary = buffers[0];
for (const accessor of out.getRoot().listAccessors()) {
  accessor.setBuffer(primary);
}
for (const buf of buffers.slice(1)) {
  buf.dispose();
}

await io.write(outputPath, out);
console.log(`Wrote ${outputPath}`);
console.log(`Top-level nodes: ${outScene.listChildren().map(n => n.getName()).join(', ')}`);
