#!/usr/bin/env node
/*
 * process-photos.js — list uploaded race photos in Cloudinary, run Google Vision
 * bib-number OCR on each, and write data/photos-raw.json.
 *
 * Prereqs:
 *   - Photos uploaded to Cloudinary under <folder>/<category>/... (see upload-photos.js)
 *   - CLOUDINARY_* and GOOGLE_APPLICATION_CREDENTIALS set in .env
 *   - npm install   (cloudinary, @google-cloud/vision)
 *
 * Behaviour:
 *   - Resumable: skips publicIds already present in photos-raw.json unless --force.
 *   - Detects bib = the largest 1–4 digit number block in the image (race-bib heuristic).
 *
 * Flags:
 *   --force        re-OCR everything (ignore existing photos-raw.json)
 *   --limit <n>    only process the first n new photos (useful for a test run)
 */
import path from 'node:path';
import { DATA, env, CATEGORIES, ZONE_KEYWORDS, requireCloudinary, normalizeBib, readJson, writeJson } from './lib/config.js';
import { detectSponsors, detectThemes } from './lib/detection-maps.js';

function arg(name, def) { const i = process.argv.indexOf(name); if (i === -1) return def; const n = process.argv[i + 1]; return n && !n.startsWith('--') ? n : true; }
const FORCE = !!arg('--force', false);
const LIMIT = arg('--limit', null) ? parseInt(arg('--limit'), 10) : Infinity;

// category is the path segment right after the root folder: bhc-2026/<category>/<file>
function categoryFromPublicId(publicId) {
  const parts = String(publicId).split('/');
  const rootIdx = parts.indexOf(env.folder);
  const cat = rootIdx !== -1 ? parts[rootIdx + 1] : parts[1];
  return CATEGORIES.indexOf(cat) !== -1 ? cat : 'festival';
}

// Any path segment between category and filename is treated as a narrow physical
// activation zone, e.g. bhc-2026/festival/nickel-brook-beer-garden/photo-001.
function zonesFromPublicId(publicId) {
  const parts = String(publicId).split('/');
  const rootIdx = parts.indexOf(env.folder);
  const catIdx = rootIdx !== -1 ? rootIdx + 1 : 1;
  const cat = parts[catIdx];
  if (CATEGORIES.indexOf(cat) === -1) return [];
  return parts.slice(catIdx + 1, -1).filter(Boolean);
}

function unique(arr) {
  return [...new Set((arr || []).filter(Boolean))];
}

function keywordsForZones(zones) {
  const out = [];
  for (const z of zones || []) out.push(...(ZONE_KEYWORDS[z] || []));
  return unique(out);
}

// Bib heuristic: collect ALL visible bib numbers from text annotations.
// Returns sorted array (largest/most-prominent first). Includes any bib whose
// bounding-box area is >= max(300px², 8% of the largest detected bib).
// The 8% threshold (lowered from 15%) captures runners further back in frame or
// partially behind the lead runner — the human eye can read them, Vision can too.
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
    if (bibs.length >= 8) break; // cap at 8 per photo (extreme crowd shots)
  }
  return bibs;
}

async function main() {
  requireCloudinary();
  const { v2: cloudinary } = await import('cloudinary');
  const vision = await import('@google-cloud/vision');
  cloudinary.config({ cloud_name: env.cloudName, api_key: env.apiKey, api_secret: env.apiSecret });
  const visionClient = new vision.ImageAnnotatorClient();

  const outPath = path.join(DATA, 'photos-raw.json');
  const existing = FORCE ? [] : readJson(outPath, []);
  const seen = new Set(existing.map((p) => p.publicId));

  // page through all resources under the event folder
  const resources = [];
  let next = null;
  do {
    const res = await cloudinary.api.resources({
      type: 'upload', prefix: env.folder + '/', max_results: 500, next_cursor: next,
    });
    resources.push(...res.resources);
    next = res.next_cursor;
  } while (next);

  // Exclude the watermark logo itself (it lives in the same folder, not a race photo).
  const toProcess = resources
    .filter((r) => !seen.has(r.public_id) && r.public_id !== env.watermarkPublicId)
    .slice(0, LIMIT);
  console.log(`Found ${resources.length} photos in Cloudinary; ${toProcess.length} new to analyze.`);

  // One Vision call per image requests: bib text + sponsor logos + scene labels.
  const features = [
    { type: 'TEXT_DETECTION' },
    { type: 'LOGO_DETECTION', maxResults: 10 },
    { type: 'LABEL_DETECTION', maxResults: 15 },
  ];

  const out = existing.slice();
  let detected = 0, sponsored = 0, themed = 0;
  for (let i = 0; i < toProcess.length; i++) {
    const r = toProcess[i];
    const category = categoryFromPublicId(r.public_id);
    const zones = zonesFromPublicId(r.public_id);
    let bib = null, bibs = [], sponsorTags = [], keywords = [];
    try {
      const [result] = await visionClient.annotateImage({ image: { source: { imageUri: r.secure_url } }, features });
      // Pre-race content (pace car, graphics) has no runners — don't read bibs.
      if (category !== 'pre-race') bibs = pickBibs(result.textAnnotations);
      const fullText = (result.fullTextAnnotation && result.fullTextAnnotation.text)
        || (result.textAnnotations && result.textAnnotations[0] && result.textAnnotations[0].description) || '';
      const logos = (result.logoAnnotations || []).map((l) => l.description || '');
      sponsorTags = detectSponsors(fullText, logos);
      // Pre-race graphics are marketing assets, not race-day scenes. Theme
      // labels on graphics are noisy, so only race-day photo categories get
      // automatic theme suggestions.
      if (category !== 'pre-race') keywords = detectThemes(result.labelAnnotations || []);
    } catch (e) {
      console.warn(`  ⚠ Vision failed for ${r.public_id}: ${e.message}`);
    }
    bib = bibs[0] || null; // primary bib = largest/most-prominent
    keywords = unique([...keywords, ...keywordsForZones(zones)]);
    if (bib) detected++;
    if (sponsorTags.length) sponsored++;
    if (keywords.length) themed++;
    out.push({
      publicId: r.public_id,
      category: category,
      zones,              // narrow physical activation zones from nested folders
      detectedBib: bib,   // primary bib (largest) — kept for backward compat
      detectedBibs: bibs, // all visible bibs, sorted largest-first
      sponsorTags,        // auto-detected sponsors/vendors (merged with manual tags at build)
      keywords,           // generic themes and reviewed/zone-backed theme tags
      width: r.width || 1600,
      height: r.height || 1067,
    });
    if ((i + 1) % 25 === 0) { writeJson(outPath, out); console.log(`  …${i + 1}/${toProcess.length} analyzed`); }
  }
  writeJson(outPath, out);
  console.log(`✓ Wrote ${out.length} photos to ${path.relative(process.cwd(), outPath)}`);
  console.log(`  • bibs detected: ${detected} new   • sponsors auto-tagged: ${sponsored}   • themes auto-tagged: ${themed}`);
  console.log('Next: node pipeline/import-roster.js, then build-manifest.js (tag-sponsors.js only for manual fixes)');
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
