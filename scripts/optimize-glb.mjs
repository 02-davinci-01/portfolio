#!/usr/bin/env node
/**
 * optimize-glb.mjs
 * ─────────────────
 * Compresses ALL .glb files in public/ (recursively) using gltf-transform.
 *
 * Pipeline per file:
 *   1. dedup      – remove duplicate accessors & textures
 *   2. prune      – strip unreferenced nodes/materials
 *   3. weld       – merge near-identical vertices (tolerance 0.0001)
 *   4. simplify   – reduce polygon count by ~50% (ratio 0.5, error 0.01)
 *   5. quantize   – reduce vertex attribute precision (lossy-looking but tiny)
 *   6. meshopt    – apply Meshopt geometry + buffer compression
 *   7. webp       – re-encode embedded textures as WebP (quality 75, max 1024px)
 *
 * Usage:
 *   node scripts/optimize-glb.mjs              # optimize all
 *   node scripts/optimize-glb.mjs --dry-run    # preview sizes only
 *   node scripts/optimize-glb.mjs --no-simplify  # skip polygon reduction
 *
 * Originals are backed up to public/_originals/ before overwriting.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const BACKUP_DIR = path.join(PUBLIC_DIR, "_originals");
const CLI = path.join(__dirname, "..", "node_modules", ".bin", "gltf-transform");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SKIP_SIMPLIFY = args.includes("--no-simplify");

// ── Collect all .glb files recursively ──
function findGlbs(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip backup folder
      if (entry.name === "_originals") continue;
      results.push(...findGlbs(full));
    } else if (entry.name.endsWith(".glb")) {
      results.push(full);
    }
  }
  return results;
}

const glbs = findGlbs(PUBLIC_DIR);

if (glbs.length === 0) {
  console.log("No .glb files found in public/");
  process.exit(0);
}

console.log(`\n🔍 Found ${glbs.length} GLB file(s):\n`);
const sizesBefore = {};
for (const f of glbs) {
  const size = fs.statSync(f).size;
  sizesBefore[f] = size;
  const rel = path.relative(PUBLIC_DIR, f);
  console.log(`  ${rel.padEnd(50)} ${(size / 1024 / 1024).toFixed(2)} MB`);
}

if (DRY_RUN) {
  console.log("\n🏁 Dry run — no files modified.\n");
  process.exit(0);
}

// ── Create backup directory, mirroring subfolder structure ──
for (const f of glbs) {
  const rel = path.relative(PUBLIC_DIR, f);
  const backupPath = path.join(BACKUP_DIR, rel);
  const backupDir = path.dirname(backupPath);
  fs.mkdirSync(backupDir, { recursive: true });

  if (!fs.existsSync(backupPath)) {
    console.log(`\n📦 Backing up ${rel}`);
    fs.copyFileSync(f, backupPath);
  } else {
    console.log(`\n📦 Backup already exists for ${rel}, skipping copy`);
  }
}

// ── Optimize each file ──
console.log("\n🚀 Starting optimization...\n");

let totalBefore = 0;
let totalAfter = 0;

for (const f of glbs) {
  const rel = path.relative(PUBLIC_DIR, f);
  const sizeBefore = sizesBefore[f];
  totalBefore += sizeBefore;

  console.log(`── Optimizing: ${rel} (${(sizeBefore / 1024 / 1024).toFixed(2)} MB)`);

  // The 'optimize' command bundles: weld, simplify, dedup, prune, flatten,
  // join, resample, textureCompress, and mesh compression in one pass.
  const tmpFile = f + ".tmp.glb";

  // Build the optimize command with all options
  const simplifyRatio = SKIP_SIMPLIFY ? "1" : "0.5";
  const simplifyError = "0.01"; // allow up to 1% error for aggressive simplification
  const cmd = [
    `"${CLI}"`, "optimize",
    `"${f}"`, `"${tmpFile}"`,
    "--compress", "meshopt",
    "--texture-compress", "webp",
    "--texture-size", "1024",
    "--simplify-ratio", simplifyRatio,
    "--simplify-error", simplifyError,
    "--verbose",
  ].join(" ");

  try {
    console.log(`  Running: optimize (weld + simplify + dedup + prune + meshopt + webp)...`);
    execSync(cmd, { stdio: "pipe", maxBuffer: 50 * 1024 * 1024 });
    fs.renameSync(tmpFile, f);

    const sizeAfter = fs.statSync(f).size;
    totalAfter += sizeAfter;
    const saved = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
    console.log(
      `  ✅ ${(sizeBefore / 1024 / 1024).toFixed(2)} MB → ${(sizeAfter / 1024 / 1024).toFixed(2)} MB  (${saved}% saved)\n`
    );
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().slice(0, 500) : err.message;
    console.error(`  ❌ Failed: ${stderr}`);
    // Restore from backup if optimization failed
    const backupPath = path.join(BACKUP_DIR, rel);
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, f);
      console.log(`  ♻️  Restored from backup.\n`);
    }
    // Clean up temp file
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    totalAfter += sizeBefore; // count as unchanged
  }
}

// ── Summary ──
console.log(`\n${"═".repeat(60)}`);
console.log(`  TOTAL BEFORE:  ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
console.log(`  TOTAL AFTER:   ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
console.log(`  SAVED:         ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)`);
console.log(`${"═".repeat(60)}`);
console.log(`\n💾 Originals backed up in: public/_originals/`);
console.log(`   To restore: copy them back from _originals/\n`);
