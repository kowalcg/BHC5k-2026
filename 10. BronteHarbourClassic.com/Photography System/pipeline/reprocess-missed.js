#!/usr/bin/env node
/*
 * reprocess-missed.js — re-run Google Vision on photos that have no bib detected.
 *
 * Standard process-photos.js uses TEXT_DETECTION. This script uses the slower but
 * more accurate DOCUMENT_TEXT_DETECTION (optimised for dense, small printed text)
 * on photos where no bib was found. Merges results back into photos-raw.json.
 *
 * Run AFTER process-photos.js and BEFORE build-manifest.js:
 *   node pipeline/reprocess-missed.js
 *   node pipeline/reprocess-missed.js --dry-run    # list candidates only, no API calls
 *   node pipeline/reprocess-missed.js --limit 50   # cap API calls (Vision costs ~$1.50/1000)
 *
 * Categories targeted: finish-line, course, start-line (bib expected but not found).
 * Kids-1k and festival are skipped — bibs not expected in those categories.
 */
import path from 'node:path';
import { DATA, env, normalizeBib, readJson, writeJson } from './lib/config.js';

function arg(name, def) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

const dryRun  = !!arg('--dry-run', false);
const limit   = parseInt(arg('--limit', '200'), 10);

// Same bib detection heuristic as process-photos.js (kept in sync manually)
function pickBibs(annotations) {
  if (!annotations || annotations.length < 2) return [];
  const candidates = [];
  for (let i = 1; i < annotations.length; i++) {
    const a = annotations[i];
    const txt = (a.description || '').trim();
    if (!/^\d{1,4}$/.test(txt)) continue;
    const n = parseInt(txt, 10);
    if (n < 1 || n > 9999) continue;
    const v = (a.boundingPoly && a.boundingPoly.vertices) || [];
    if (v.length < 3) continue;
    const xs = v.map((p) => p.x || 0), ys = v.map((p) => p.y || 0);
    const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    candidates.push({ txt, area });
  }
  if (!candidates.length) return [];
  const maxArea = Math.max(...candidates.map((c) => c.area));
  const minArea = Math.max(300, maxArea * 0.08);
  const seen = new Set();
  const bibs = [];
  for (const c of candidates.sort((a, b) => b.area - a.area)) {
    if (c.area < minArea) continue;
    const norm = normalizeBib(c.txt);
    if (seen.has(norm)) continue;
    seen.add(norm);
    bibs.push(norm);
    if (bibs.length >= 8) break;
  }
  return bibs;
}

const BIB_EXPECTED_CATS = new Set(['finish-line', 'course', 'start-line']);

async function main() {
  const rawPath = path.join(DATA, 'photos-raw.json');
  const photos = readJson(rawPath, null);
  if (!Array.isArray(photos)) {
    console.error('✗ photos-raw.json not found — run process-photos.js first');
    process.exit(1);
  }

  // Find candidates: bib-expected category + no bibs detected
  const candidates = photos.filter((ph) => {
    const hasBibs = (Array.isArray(ph.detectedBibs) && ph.detectedBibs.length > 0) ||
                    (ph.detectedBib != null && String(ph.detectedBib).trim() !== '');
    return BIB_EXPECTED_CATS.has(ph.category) && !hasBibs;
  });

  console.log(`Found ${candidates.length} photos with no bib detected in bib-expected categories.`);
  if (candidates.length === 0) { console.log('Nothing to reprocess.'); return; }

  const toProcess = candidates.slice(0, limit);
  console.log(`Processing ${toProcess.length} (limit: ${limit})${dryRun ? ' — DRY RUN, no API calls' : ''}...`);

  if (dryRun) {
    for (const ph of toProcess) console.log(`  ${ph.publicId}  [${ph.category}]`);
    return;
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_KEYFILE) {
    console.error('✗ Set GOOGLE_APPLICATION_CREDENTIALS in .env before running');
    process.exit(1);
  }

  const vision = await import('@google-cloud/vision');
  const { v2: cloudinary } = await import('cloudinary');
  const visionClient = new vision.ImageAnnotatorClient();

  // Build publicId → index map for fast updates
  const indexMap = new Map(photos.map((ph, i) => [ph.publicId, i]));

  let improved = 0;
  for (const ph of toProcess) {
    // Build a Cloudinary URL without transforms (give Vision the clearest possible image)
    const imageUri = `https://res.cloudinary.com/${env.cloudName}/image/upload/${ph.publicId}.jpg`;
    try {
      const [result] = await visionClient.annotateImage({
        image: { source: { imageUri } },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],  // denser OCR than TEXT_DETECTION
      });
      const annotations = result.textAnnotations || [];
      const bibs = pickBibs(annotations);
      if (bibs.length > 0) {
        const idx = indexMap.get(ph.publicId);
        photos[idx].detectedBibs = bibs;
        photos[idx].detectedBib  = bibs[0];
        improved++;
        console.log(`  ✓ ${ph.publicId}  →  bibs: [${bibs.join(', ')}]`);
      } else {
        console.log(`  – ${ph.publicId}  still no bib`);
      }
    } catch (err) {
      console.warn(`  ✗ ${ph.publicId}  Vision error: ${err.message}`);
    }
  }

  if (improved > 0) {
    writeJson(rawPath, photos);
    console.log(`\n✓ Updated ${improved}/${toProcess.length} photos — run "npm run build" to rebuild the gallery.`);
  } else {
    console.log('\nNo new bibs found. The photos may have genuinely unreadable bibs.');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
