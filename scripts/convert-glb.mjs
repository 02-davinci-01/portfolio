/**
 * Convert personal_computer.glb from KHR_materials_pbrSpecularGlossiness
 * to standard pbrMetallicRoughness so modern renderers (model-viewer, Three.js)
 * can display it with correct colors and materials.
 *
 * Conversion logic:
 * - specularFactor ~= [0,0,0] → metalness = 0 (dielectric)
 * - roughness = (1 - glossinessFactor)^2 (perceptual mapping)
 * - baseColor = diffuseFactor (gamma-correct sRGB)
 * - "screen" material gets slight metalness for reflectivity
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, "..", "public", "personal_computer.glb");
const outputPath = path.join(__dirname, "..", "public", "personal_computer_pbr.glb");

// Read the GLB
const buf = fs.readFileSync(inputPath);

// Parse GLB structure
const magic = buf.toString("ascii", 0, 4);
if (magic !== "glTF") throw new Error("Not a GLB file");

const version = buf.readUInt32LE(4);
const totalLength = buf.readUInt32LE(8);

// Extract chunks
let offset = 12;
let jsonChunkData, binChunkData;

while (offset < totalLength) {
  const chunkLength = buf.readUInt32LE(offset);
  const chunkType = buf.readUInt32LE(offset + 4);

  if (chunkType === 0x4e4f534a) {
    // JSON
    jsonChunkData = buf.toString("utf8", offset + 8, offset + 8 + chunkLength);
  } else if (chunkType === 0x004e4942) {
    // BIN
    binChunkData = buf.slice(offset + 8, offset + 8 + chunkLength);
  }

  offset += 8 + chunkLength;
}

const gltf = JSON.parse(jsonChunkData);

console.log(`Found ${gltf.materials.length} materials to convert:`);

// Custom color palette — sleek dark theme that pops on a white background
const COLOR_OVERRIDES = {
  gray:          [0.12, 0.12, 0.13, 1],      // Dark charcoal body
  vintage_2:     [0.08, 0.08, 0.09, 1],      // Very dark accents
  "white.001":   [0.85, 0.85, 0.87, 1],      // Light silver keys/labels
  screen:        [0.01, 0.01, 0.03, 1],       // Near-black glossy screen
  black:         [0.02, 0.02, 0.02, 1],       // Pure black parts
  white:         [0.90, 0.90, 0.92, 1],       // Off-white details
  gray_metallic: [0.15, 0.15, 0.17, 1],      // Dark metallic trim
  metallic:      [0.30, 0.30, 0.32, 1],       // Brushed metal parts
  green:         [0.7, 0.7, 0.7, 1],          // Neutral body for the LED
  gray_stiker:   [0.20, 0.20, 0.22, 1],      // Dark sticker/label
  vintage_1:     [0.06, 0.06, 0.07, 1],       // Darkest wood/accent
};

// Convert each material
for (const mat of gltf.materials) {
  const ext = mat.extensions?.KHR_materials_pbrSpecularGlossiness;
  if (!ext) continue;

  const glossiness = ext.glossinessFactor ?? 0.5;

  // Use overridden color or fallback to original diffuse
  const diffuse = COLOR_OVERRIDES[mat.name] || ext.diffuseFactor || [0.8, 0.8, 0.8, 1];

  // Convert glossiness to roughness
  const roughness = Math.max(0, Math.min(1, 1 - glossiness));

  // Metalness based on material purpose
  let metalness = 0;
  if (mat.name === "screen") {
    metalness = 0.1;
  } else if (mat.name === "gray_metallic") {
    metalness = 0.6;
  } else if (mat.name === "metallic") {
    metalness = 0.7;
  } else if (mat.name === "gray" || mat.name === "gray_stiker") {
    metalness = 0.15;
  }

  // Set standard PBR
  mat.pbrMetallicRoughness = {
    baseColorFactor: diffuse,
    metallicFactor: metalness,
    roughnessFactor: roughness,
  };

  // Preserve emissive (already at top level — emissiveFactor stays)
  // Override green LED to a soft blue-white glow
  if (mat.name === "green") {
    mat.emissiveFactor = [0.2, 0.6, 1.0];
  }

  // Remove the old extension
  delete mat.extensions.KHR_materials_pbrSpecularGlossiness;

  // Clean up empty extensions object
  if (Object.keys(mat.extensions).length === 0) {
    delete mat.extensions;
  }

  console.log(
    `  ${mat.name}: color=[${diffuse.map((c) => c.toFixed(3)).join(",")}] ` +
      `roughness=${roughness.toFixed(3)} metalness=${metalness.toFixed(3)}`
  );
}

// Remove the extension from extensionsUsed / extensionsRequired
gltf.extensionsUsed = (gltf.extensionsUsed || []).filter(
  (e) => e !== "KHR_materials_pbrSpecularGlossiness"
);
gltf.extensionsRequired = (gltf.extensionsRequired || []).filter(
  (e) => e !== "KHR_materials_pbrSpecularGlossiness"
);

if (gltf.extensionsUsed.length === 0) delete gltf.extensionsUsed;
if (gltf.extensionsRequired.length === 0) delete gltf.extensionsRequired;

// Rebuild GLB
const jsonStr = JSON.stringify(gltf);
// JSON chunk must be padded to 4-byte boundary with spaces (0x20)
const jsonBuf = Buffer.from(jsonStr, "utf8");
const jsonPadding = (4 - (jsonBuf.length % 4)) % 4;
const paddedJsonBuf = Buffer.concat([
  jsonBuf,
  Buffer.alloc(jsonPadding, 0x20),
]);

// BIN chunk must be padded to 4-byte boundary with zeros
const binPadding = (4 - (binChunkData.length % 4)) % 4;
const paddedBinBuf = Buffer.concat([
  binChunkData,
  Buffer.alloc(binPadding, 0x00),
]);

// GLB header (12 bytes) + JSON chunk header (8) + JSON data + BIN chunk header (8) + BIN data
const totalSize = 12 + 8 + paddedJsonBuf.length + 8 + paddedBinBuf.length;
const out = Buffer.alloc(totalSize);

// Header
out.write("glTF", 0, 4, "ascii");
out.writeUInt32LE(2, 4); // version
out.writeUInt32LE(totalSize, 8); // total length

// JSON chunk
let pos = 12;
out.writeUInt32LE(paddedJsonBuf.length, pos);
out.writeUInt32LE(0x4e4f534a, pos + 4); // 'JSON'
paddedJsonBuf.copy(out, pos + 8);

// BIN chunk
pos += 8 + paddedJsonBuf.length;
out.writeUInt32LE(paddedBinBuf.length, pos);
out.writeUInt32LE(0x004e4942, pos + 4); // 'BIN\0'
paddedBinBuf.copy(out, pos + 8);

fs.writeFileSync(outputPath, out);
console.log(`\nConverted GLB written to: ${outputPath}`);
console.log(`Original size: ${buf.length} bytes`);
console.log(`New size: ${out.length} bytes`);
