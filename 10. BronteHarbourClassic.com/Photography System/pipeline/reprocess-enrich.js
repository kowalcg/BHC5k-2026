#!/usr/bin/env node
/*
 * reprocess-enrich.js — LOCAL re-analysis pass with denser OCR to (a) recover
 * bibs missed on the first pass and (b) catch more sponsor/vendor banner text.
 * Replaces reprocess-missed.js, which was hardwired to retired Cloudinary URLs.
 *
 * Reads source bytes from ~/BHC-2026-photos-backup/source, runs
 * DOCUMENT_TEXT_DETECTION + LOGO + LABEL, and MERGES results into
 * photos-raw.json (never removes existing tags/bibs).
 *
 *   node pipeline/reprocess-enrich.js               # bib recovery + sponsor enrich
 *   node pipeline/reprocess-enrich.js --limit 20    # cap API calls (test)
 *
 * Target set = {no-bib finish-line/course/start-line}  ∪  {festival, awards}.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DATA, CATEGORIES, normalizeBib } from './lib/config.js';
import { detectSponsors, detectThemes } from './lib/detection-maps.js';

const BACKUP_SRC = path.join(os.homedir(), 'BHC-2026-photos-backup', 'source');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const LIMIT = arg('--limit', null) ? parseInt(arg('--limit'), 10) : Infinity;
const rawPath = path.join(DATA, 'photos-raw.json');
const BIB_EXPECTED = new Set(['finish-line', 'course', 'start-line']);
// Sponsor/vendor branding on apparel and gear shows up in every category, not
// just festival booths and awards — course, finish-line, and kids-1k account
// for ~90% of the archive and were previously excluded from re-enrichment.
const SPONSOR_CATS = new Set(CATEGORIES);

// Same bib heuristic as process-photos.js / reprocess-missed.js
function pickBibs(annotations) {
  if (!annotations || annotations.length < 2) return [];
  const cand = [];
  for (let i = 1; i < annotations.length; i++) {
    const a = annotations[i];
    const txt = (a.description || '').trim();
    if (!/^\d{1,4}$/.test(txt)) continue;
    const n = parseInt(txt, 10); if (n < 1 || n > 9999) continue;
    const v = (a.boundingPoly && a.boundingPoly.vertices) || []; if (v.length < 3) continue;
    const xs = v.map((p) => p.x || 0), ys = v.map((p) => p.y || 0);
    const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    cand.push({ txt, area });
  }
  if (!cand.length) return [];
  const maxArea = Math.max(...cand.map((c) => c.area));
  const minArea = Math.max(300, maxArea * 0.08);
  const seen = new Set(), bibs = [];
  for (const c of cand.sort((a, b) => b.area - a.area)) {
    if (c.area < minArea) continue;
    const nb = normalizeBib(c.txt);
    if (seen.has(nb)) continue;
    seen.add(nb); bibs.push(nb);
    if (bibs.length >= 8) break;
  }
  return bibs;
}

function findSrc(publicId) {
  for (const ext of ['.JPG', '.jpg', '.jpeg', '.JPEG', '.png', '.PNG']) {
    const p = path.join(BACKUP_SRC, publicId + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
}
const cat = (publicId) => publicId.split('/')[1];
const hasBib = (ph) => (Array.isArray(ph.detectedBibs) && ph.detectedBibs.length > 0) ||
  (ph.detectedBib != null && String(ph.detectedBib).trim() !== '');

(async () => {
  const { default: sharp } = await import('sharp');
  const vision = await import('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient();
  const features = [
    { type: 'DOCUMENT_TEXT_DETECTION' },
    { type: 'LOGO_DETECTION', maxResults: 10 },
    { type: 'LABEL_DETECTION', maxResults: 15 },
  ];

  const photos = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const targets = photos.filter((ph) => {
    const c = cat(ph.publicId);
    const wantBib = BIB_EXPECTED.has(c) && !hasBib(ph);
    const wantSponsor = SPONSOR_CATS.has(c);
    return wantBib || wantSponsor;
  }).slice(0, LIMIT === Infinity ? undefined : LIMIT);

  console.log(`Reprocessing ${targets.length} photos (denser OCR, merge-only)…`);
  let bibGain = 0, sponsorGain = 0, themeGain = 0, fail = 0, i = 0;
  for (const ph of targets) {
    i++;
    const src = findSrc(ph.publicId);
    if (!src) { console.warn(`  ⚠ no source: ${ph.publicId}`); fail++; continue; }
    try {
      const stat = fs.statSync(src);
      let content;
      if (stat.size > 30 * 1024 * 1024) {
        content = (await sharp(src).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer()).toString('base64');
      } else {
        content = fs.readFileSync(src).toString('base64');
      }
      const [result] = await client.annotateImage({ image: { content }, features });
      const c = cat(ph.publicId);
      // --- bib recovery ---
      if (BIB_EXPECTED.has(c) && !hasBib(ph)) {
        const bibs = pickBibs(result.textAnnotations || []);
        if (bibs.length) { ph.detectedBibs = bibs; ph.detectedBib = bibs[0]; bibGain++; }
      }
      // --- sponsor / theme enrichment (merge) ---
      const fullText = (result.fullTextAnnotation && result.fullTextAnnotation.text)
        || (result.textAnnotations && result.textAnnotations[0] && result.textAnnotations[0].description) || '';
      const logos = (result.logoAnnotations || []).map((l) => l.description || '');
      const newSp = detectSponsors(fullText, logos, result.fullTextAnnotation && result.fullTextAnnotation.pages);
      const newTh = detectThemes(result.labelAnnotations || []);
      const beforeSp = new Set(ph.sponsorTags || []);
      const beforeTh = new Set(ph.keywords || []);
      ph.sponsorTags = [...new Set([...(ph.sponsorTags || []), ...newSp])];
      ph.keywords = [...new Set([...(ph.keywords || []), ...newTh])];
      if (ph.sponsorTags.length > beforeSp.size) sponsorGain++;
      if (ph.keywords.length > beforeTh.size) themeGain++;
    } catch (e) {
      console.warn(`  ⚠ ${ph.publicId}: ${e.message}`); fail++;
    }
    if (i % 50 === 0) { fs.writeFileSync(rawPath, JSON.stringify(photos, null, 2) + '\n'); console.log(`  …${i}/${targets.length}  (+${bibGain} bibs, +${sponsorGain} sponsor, +${themeGain} theme)`); }
  }
  fs.writeFileSync(rawPath, JSON.stringify(photos, null, 2) + '\n');
  console.log(`\n✓ Done. bibs recovered: ${bibGain}  sponsor-tags gained: ${sponsorGain}  theme-tags gained: ${themeGain}  failed: ${fail}`);
  console.log('Next: npm run build → commit → push');
})();
