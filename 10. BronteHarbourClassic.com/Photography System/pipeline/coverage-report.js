#!/usr/bin/env node
/*
 * coverage-report.js — audit which registered bibs have photos vs. which were missed.
 *
 * Reads:
 *   data/participants.json      bib → { first, last, email, distance }
 *   site/public/photos/photos-manifest.json   produced by build-manifest.js
 *
 * Outputs to stdout:
 *   ✓ Good coverage  (2+ photos)
 *   ⚠ Thin coverage  (exactly 1 photo)
 *   ✗ No photos      (0 photos — runner not detected in any frame)
 *   ?  In photos but not in roster (walk-ups, volunteers in bibs, OCR false positives)
 *
 * Usage:
 *   node pipeline/coverage-report.js
 *   node pipeline/coverage-report.js --missing-only   # print only 0-photo bibs
 *   node pipeline/coverage-report.js --csv            # machine-readable CSV output
 */
import path from 'node:path';
import { DATA, env, readJson } from './lib/config.js';

function arg(name) { return process.argv.includes(name); }

const participants = readJson(path.join(DATA, 'participants.json'), {});
const manifest    = readJson(path.join(env.sitePublicDir, 'photos-manifest.json'), null);

if (!manifest) {
  console.error('✗ photos-manifest.json not found — run: npm run build');
  process.exit(1);
}

// Build bib → photo count from the manifest
const photoCount = {};
for (const photo of manifest) {
  const bibs = photo.bibs && photo.bibs.length ? photo.bibs : (photo.bib ? [photo.bib] : []);
  for (const b of bibs) photoCount[b] = (photoCount[b] || 0) + 1;
}

const registered   = Object.keys(participants).sort((a, b) => Number(a) - Number(b));
const inManifest   = new Set(Object.keys(photoCount));
const inRoster     = new Set(registered);

const good    = [];  // 2+ photos
const thin    = [];  // exactly 1
const missing = [];  // 0 photos

for (const bib of registered) {
  const cnt = photoCount[bib] || 0;
  const p   = participants[bib];
  const name = [p.first, p.last].filter(Boolean).join(' ') || '(no name)';
  if (cnt >= 2)     good.push({ bib, cnt, name });
  else if (cnt === 1) thin.push({ bib, cnt, name });
  else              missing.push({ bib, cnt, name });
}

// Bibs in photos but not in roster
const phantoms = [...inManifest]
  .filter(b => !inRoster.has(b) && b !== '1')
  .sort((a, b) => Number(a) - Number(b))
  .map(b => ({ bib: b, cnt: photoCount[b] }));

const missingOnly = arg('--missing-only');
const csvMode     = arg('--csv');

if (csvMode) {
  console.log('bib,name,photo_count,status');
  for (const r of [...good, ...thin, ...missing]) {
    const status = r.cnt >= 2 ? 'good' : r.cnt === 1 ? 'thin' : 'missing';
    console.log(`${r.bib},"${r.name}",${r.cnt},${status}`);
  }
  for (const r of phantoms) console.log(`${r.bib},"(not in roster)",${r.cnt},phantom`);
  process.exit(0);
}

console.log('\n── BHC 2026 Photo Coverage Report ──────────────────────────────────────');
console.log(`Registered bibs: ${registered.length}   |   Photos in gallery: ${manifest.length}`);
console.log(`✓ Good (2+ photos): ${good.length}   ⚠ Thin (1 photo): ${thin.length}   ✗ Missing (0): ${missing.length}`);
if (phantoms.length) console.log(`? In photos but not in roster: ${phantoms.length}`);
console.log('─────────────────────────────────────────────────────────────────────────\n');

if (!missingOnly) {
  if (thin.length) {
    console.log(`⚠  THIN COVERAGE (1 photo each) — ${thin.length} runners:\n`);
    for (const r of thin) console.log(`   Bib ${String(r.bib).padEnd(4)}  ${r.name}`);
    console.log();
  }
}

if (missing.length) {
  console.log(`✗  NO PHOTOS FOUND — ${missing.length} runners:\n`);
  for (const r of missing) console.log(`   Bib ${String(r.bib).padEnd(4)}  ${r.name}`);
  console.log();
}

if (!missingOnly && phantoms.length) {
  console.log(`?  IN PHOTOS BUT NOT IN ROSTER — ${phantoms.length} bibs:\n`);
  for (const r of phantoms) console.log(`   Bib ${String(r.bib).padEnd(4)}  (${r.cnt} photo${r.cnt === 1 ? '' : 's'}) — walk-up, volunteer, or OCR false positive`);
  console.log();
}

if (!missingOnly && good.length) {
  console.log(`✓  GOOD COVERAGE (2+ photos) — ${good.length} runners — all good.\n`);
}

const pct = registered.length ? Math.round(((good.length + thin.length) / registered.length) * 100) : 0;
console.log(`Coverage: ${pct}% of registered runners appear in at least one photo.`);
if (missing.length) {
  console.log(`\nTo fix missing bibs: add entries to pipeline/data/bib-overrides.json`);
  console.log(`then run: npm run build && git push origin main`);
}
console.log();
