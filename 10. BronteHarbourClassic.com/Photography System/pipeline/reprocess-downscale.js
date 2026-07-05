#!/usr/bin/env node
/*
 * reprocess-downscale.js — one-off: re-run Vision on photos whose full-res bytes
 * exceeded Vision's 40MB payload limit (large Fuji DSCF files). Downscales to
 * 2400px before sending, then patches sponsorTags + keywords back into
 * photos-raw.json. Reuses the same detection helpers as process-photos.js.
 *
 *   node pipeline/reprocess-downscale.js                 # all DSCF entries
 *   node pipeline/reprocess-downscale.js --only DSCF3578 # one file
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { DATA } from './lib/config.js';
import { detectSponsors, detectThemes } from './lib/detection-maps.js';

const BACKUP_SRC = path.join(os.homedir(), 'BHC-2026-photos-backup', 'source');
const only = (() => { const i = process.argv.indexOf('--only'); return i !== -1 ? process.argv[i + 1] : null; })();
const outPath = path.join(DATA, 'photos-raw.json');

function findSrc(publicId) {
  for (const ext of ['.JPG', '.jpg', '.jpeg', '.JPEG', '.png', '.PNG']) {
    const p = path.join(BACKUP_SRC, publicId + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

(async () => {
  const { default: sharp } = await import('sharp');
  const vision = await import('@google-cloud/vision');
  const visionClient = new vision.ImageAnnotatorClient();
  const features = [
    { type: 'TEXT_DETECTION' },
    { type: 'LOGO_DETECTION', maxResults: 10 },
    { type: 'LABEL_DETECTION', maxResults: 15 },
  ];

  const raw = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  let targets = raw.filter((p) => /DSCF/.test(p.publicId));
  if (only) targets = targets.filter((p) => p.publicId.includes(only));
  console.log(`Reprocessing ${targets.length} photo(s) (downscaled to 2400px)…`);

  let sponsored = 0, themed = 0, failed = 0;
  for (let i = 0; i < targets.length; i++) {
    const entry = targets[i];
    const src = findSrc(entry.publicId);
    if (!src) { console.warn(`  ⚠ no source for ${entry.publicId}`); failed++; continue; }
    try {
      const buf = await sharp(src).rotate()
        .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82 }).toBuffer();
      const [result] = await visionClient.annotateImage({ image: { content: buf.toString('base64') }, features });
      const fullText = (result.fullTextAnnotation && result.fullTextAnnotation.text)
        || (result.textAnnotations && result.textAnnotations[0] && result.textAnnotations[0].description) || '';
      const logos = (result.logoAnnotations || []).map((l) => l.description || '');
      const sponsorTags = detectSponsors(fullText, logos, result.fullTextAnnotation && result.fullTextAnnotation.pages);
      const keywords = detectThemes(result.labelAnnotations || []);
      entry.sponsorTags = [...new Set([...(entry.sponsorTags || []), ...sponsorTags])];
      entry.keywords = [...new Set([...(entry.keywords || []), ...keywords])];
      if (sponsorTags.length) sponsored++;
      if (keywords.length) themed++;
      console.log(`  ${entry.publicId}  sponsors=[${sponsorTags.join(',')}]  themes=[${keywords.join(',')}]`);
    } catch (e) {
      console.warn(`  ⚠ Vision failed for ${entry.publicId}: ${e.message}`);
      failed++;
    }
    if ((i + 1) % 10 === 0) fs.writeFileSync(outPath, JSON.stringify(raw, null, 2) + '\n');
  }
  fs.writeFileSync(outPath, JSON.stringify(raw, null, 2) + '\n');
  console.log(`✓ Done. sponsors tagged: ${sponsored}  themes tagged: ${themed}  failed: ${failed}`);
})();
