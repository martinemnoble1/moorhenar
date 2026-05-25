#!/usr/bin/env node
// Convert public/data/7bmg-combined.glb -> public/data/7bmg-combined.usdz
// using three.js's USDZExporter directly (no web converter, no Xcode).
// Run: node scripts/glb-to-usdz.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js';

const here = dirname(fileURLToPath(import.meta.url));
const inputPath  = resolve(here, '..', 'public', 'data', '7bmg-combined.glb');
const outputPath = resolve(here, '..', 'public', 'data', '7bmg-combined.usdz');

const buf = await readFile(inputPath);
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

const loader = new GLTFLoader();
const gltf = await new Promise((res, rej) =>
  loader.parse(arrayBuffer, '', res, rej));

// AR Quick Look doesn't reliably honour glTF vertex colors through three.js's
// USDZExporter, so assign one solid PBR material per named top-level layer.
// Walk the scene, find each named root node (target/surface/map/drug), and
// give all descendants the layer's material.
const LAYER_MATERIALS = {
  target: new THREE.MeshStandardMaterial({
    color: 0x4a90e2, metalness: 0.0, roughness: 0.55,
  }),
  surface: new THREE.MeshStandardMaterial({
    color: 0x8ed1a5, metalness: 0.0, roughness: 0.8,
    transparent: true, opacity: 0.45,
  }),
  map: new THREE.MeshStandardMaterial({
    color: 0xf5a623, metalness: 0.0, roughness: 0.9,
    transparent: true, opacity: 0.35,
  }),
  drug: new THREE.MeshStandardMaterial({
    color: 0xf8e71c, metalness: 0.1, roughness: 0.4,
    emissive: 0x554400, emissiveIntensity: 0.25,
  }),
};

let assigned = 0;
gltf.scene.traverse(layerNode => {
  const mat = LAYER_MATERIALS[layerNode.name];
  if (!mat) return;
  layerNode.traverse(child => {
    if (!child.isMesh) return;
    child.material = mat;
    assigned++;
  });
});
console.log(`Assigned per-layer materials to ${assigned} mesh(es)`);

// Safety net: any mesh that didn't get a layer material gets a neutral one
// so USDZExporter doesn't choke.
gltf.scene.traverse(obj => {
  if (!obj.isMesh) return;
  if (!obj.material || !obj.material.isMeshStandardMaterial) {
    obj.material = new THREE.MeshStandardMaterial({
      color: 0xcccccc, metalness: 0, roughness: 0.7,
    });
  }
});

// Rescale so the whole molecule fits in a sensible real-world bounding box.
// USDZ uses `metersPerUnit = 1`, so 1 three.js unit = 1 metre in AR. The raw
// model spans ~60 Ångströms; we want the longest axis to be ~30 cm.
const TARGET_METRES = 0.3;
const box = new THREE.Box3().setFromObject(gltf.scene);
const size = new THREE.Vector3();
box.getSize(size);
const longest = Math.max(size.x, size.y, size.z);
if (longest > 0) {
  const scale = TARGET_METRES / longest;
  gltf.scene.scale.setScalar(scale);
  gltf.scene.updateMatrixWorld(true);
  console.log(`Scaling by ${scale.toFixed(4)} (longest axis ${longest.toFixed(2)} -> ${TARGET_METRES} m)`);
}

const exporter = new USDZExporter();
const data = await exporter.parse(gltf.scene, { quickLookCompatible: true });
await writeFile(outputPath, Buffer.from(data));
console.log(`Wrote ${outputPath} (${data.byteLength.toLocaleString()} bytes)`);
