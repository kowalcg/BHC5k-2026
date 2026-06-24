#!/usr/bin/env node
/*
 * build-manifest.js — merge the pipeline's intermediate data into the final
 * gallery manifest(s).
 *
 * Inputs (in ./data, override with --in <dir>):
 *   photos-raw.json    [{ publicId, category, zones, detectedBib, width, height }]
 *   participants.json  { "<bib>": { first, last, email, distance } }
 *   sponsor-tags.json  { "<publicId>": ["mercedes-benz", ...] }   (optional)
 *
 * Outputs:
 *   gallery-standalone/data/manifest.js   window.PHOTO_MANIFEST = [...]   (preview)
 *   <SITE_PUBLIC_DIR>/photos-manifest.json                                (production)
 *   <SITE_PUBLIC_DIR>/participants-index.json   { "<bib>": "First L." }   (production)
 *
 * Flags:
 *   --in <dir>         input data dir (default ./data; use ./data/sample to test)
 *   --demo-images      use picsum placeholder URLs instead of Cloudinary (offline test)
 *   --preview-out <f>  override preview manifest.js path
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DATA, SAMPLE, PREVIEW_MANIFEST_JS, ENTITY_NAMES, CATEGORY_LABELS, ZONE_SPONSORS, env, readJson, writeJson, ensureDir } from './lib/config.js';
import { thumbUrl, viewUrl, fullUrl, downloadUrl } from './lib/cloudinary-url.js';

const EVENT = 'Bronte Harbour Classic 5K 2026';

function titleize(s) {
  return String(s).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function unique(arr) {
  const seen = new Set(), out = [];
  for (const item of arr || []) {
    const value = String(item || '').trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (!seen.has(key)) { seen.add(key); out.push(value); }
  }
  return out;
}

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function trimSlug(s, max = 140) {
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/-[^-]*$/, '').replace(/-$/, '');
}

function zoneLabel(k) {
  return titleize(k);
}

// Build the descriptive parts for a photo's alt text + SEO filename, in priority
// order: category, runner (name/bib), sponsors/vendors, zones, then themes.
function descriptorParts(ph, bib, name, entityKeys) {
  const parts = [CATEGORY_LABELS[ph.category] || titleize(ph.category)];
  if (name) parts.push(name);
  else if (bib) parts.push('Bib ' + bib);
  for (const k of (Array.isArray(entityKeys) ? entityKeys : [])) parts.push(ENTITY_NAMES[k] || titleize(k));
  for (const k of (Array.isArray(ph.zones) ? ph.zones : [])) parts.push(zoneLabel(k));
  for (const k of (Array.isArray(ph.keywords) ? ph.keywords : [])) parts.push(titleize(k));
  return unique(parts);
}

function zoneSponsors(zones) {
  const keys = [];
  for (const z of zones || []) keys.push(...(ZONE_SPONSORS[z] || []));
  return unique(keys);
}

function seoTagParts(ph, id, bib, name, entityKeys) {
  return unique([
    'Bronte Harbour Classic',
    'Bronte Harbour Classic 5K',
    'BHC 5K',
    'Oakville race photos',
    'Father\'s Day race',
    '2026 race photos',
    CATEGORY_LABELS[ph.category] || titleize(ph.category),
    ph.category,
    id,
    bib ? `bib ${bib}` : '',
    bib ? `runner bib ${bib}` : '',
    name || '',
    ...(entityKeys || []).map((k) => ENTITY_NAMES[k] || titleize(k)),
    ...(ph.zones || []).map(zoneLabel),
    ...(ph.keywords || []).map(titleize),
  ]);
}

function downloadFilename(parts, id) {
  const base = trimSlug(slugify(['bronte harbour classic 5k 2026', ...parts].join(' ')), 140);
  const suffix = slugify(id);
  return suffix && !base.endsWith(suffix) ? `${base}-${suffix}` : base;
}

function arg(name, def) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

const inDir = (() => {
  const a = arg('--in', null);
  if (a === 'sample') return SAMPLE;
  return a ? path.resolve(a) : DATA;
})();
const demo = !!arg('--demo-images', false);
const previewOut = arg('--preview-out', PREVIEW_MANIFEST_JS);

function displayName(p) {
  if (!p || !p.first) return null;
  const li = p.last ? ` ${p.last.trim().charAt(0).toUpperCase()}.` : '';
  return `${p.first.trim()}${li}`;
}

function idFromPublicId(publicId) {
  return String(publicId).split('/').pop().replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
}

function picsum(seed, w, h) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function main() {
  const photos = readJson(path.join(inDir, 'photos-raw.json'), null);
  if (!Array.isArray(photos)) {
    console.error(`✗ Could not read ${path.join(inDir, 'photos-raw.json')}. Run process-photos.js first (or use --in sample).`);
    process.exit(1);
  }
  const participants = readJson(path.join(inDir, 'participants.json'), {});
  const sponsorTags = readJson(path.join(inDir, 'sponsor-tags.json'), {});
  const photographerTags = readJson(path.join(inDir, 'photographer-tags.json'), {});
  // Manual bib corrections: publicId → bib array override ([] = clear all bibs for that photo)
  const bibOverrides = readJson(path.join(inDir, 'bib-overrides.json'), {});
  // Manual keyword additions: publicId → extra keywords to merge with auto-detected ones
  const keywordsOverrides = readJson(path.join(inDir, 'keywords-overrides.json'), {});
  // Category overrides: range-based + individual publicId overrides, applied before bib rules
  const categoryOverrideConfig = readJson(path.join(inDir, 'category-overrides.json'), { ranges: [], individual: {} });

  function resolveCategory(publicId, defaultCategory) {
    if (Object.prototype.hasOwnProperty.call(categoryOverrideConfig.individual || {}, publicId)) {
      return categoryOverrideConfig.individual[publicId];
    }
    for (const range of (categoryOverrideConfig.ranges || [])) {
      if (publicId.startsWith(range.prefix)) {
        const suffix = publicId.slice(range.prefix.length);
        const num = parseInt(suffix, 10);
        if (!isNaN(num) && num >= range.from && num <= range.to) return range.category;
      }
    }
    return defaultCategory;
  }

  // participants-index: bib -> "First L." (NO emails ever leave this step for the browser)
  const participantsIndex = {};
  for (const bib of Object.keys(participants)) {
    const dn = displayName(participants[bib]);
    if (dn) participantsIndex[bib] = dn;
  }

  const photoCount = {}; // bib -> count, for email step
  const manifest = photos.map((ph) => {
    // Apply category overrides first — bib rules below depend on effective category
    const category = resolveCategory(ph.publicId, ph.category);

    // Support both old single-bib and new multi-bib formats
    const primaryBib = ph.detectedBib != null && String(ph.detectedBib).trim() !== '' ? String(ph.detectedBib).trim() : null;
    let allBibs = Array.isArray(ph.detectedBibs) && ph.detectedBibs.length > 0
      ? ph.detectedBibs.map(String)
      : (primaryBib ? [primaryBib] : []);

    // Kids 1K rule: every child wears bib #1. Any OCR number in kids-1k that is
    // NOT "1" AND NOT a verified 5K participant bib is noise (e.g. Vision reads
    // the printed "1" as "13" or "11"). Normalize: always start with "1", keep
    // only bona-fide adult 5K bibs alongside it, drop everything else.
    if (category === 'kids-1k') {
      const adultBibs = allBibs.filter((b) => b !== '1' && participantsIndex[b]);
      allBibs = ['1', ...adultBibs];
    }

    // Manual bib override: apply before automated filters ([] = clear all bibs)
    if (Object.prototype.hasOwnProperty.call(bibOverrides, ph.publicId)) {
      allBibs = (bibOverrides[ph.publicId] || []).map(String);
    }

    // Course/finish-line/start-line: filter to ONLY verified participant bibs
    // (range 200–949 for this race). Eliminates jersey numbers (Lakers #8), road
    // markings, score numbers, etc. If none match, allBibs = [] — better to show
    // no bib than a wrong one. All legitimate runners are in participants.json.
    const BIB_FILTER_CATS = ['course', 'finish-line', 'start-line'];
    if (BIB_FILTER_CATS.indexOf(category) !== -1) {
      allBibs = allBibs.filter((b) => participantsIndex[b]);
    }

    const bib = allBibs[0] || null; // primary (largest/first verified) bib
    const name = bib && bib !== '1' ? participantsIndex[bib] || null : null;
    // Increment photo count for EVERY detected bib (so runner #844 also finds this photo)
    for (const b of allBibs) photoCount[b] = (photoCount[b] || 0) + 1;

    const w = ph.width || 1600;
    const h = ph.height || 1067;

    // sponsorTags = auto-detected (from Vision, on the photo record) UNION manual
    // overrides (sponsor-tags.json). The gallery adds zone sponsors at query time.
    const autoTags = Array.isArray(ph.sponsorTags) ? ph.sponsorTags : [];
    const manualTags = Array.isArray(sponsorTags[ph.publicId]) ? sponsorTags[ph.publicId] : [];
    let tags = [...new Set([...autoTags, ...manualTags])];

    const zones = Array.isArray(ph.zones) ? ph.zones.slice() : [];
    let keywords = unique([
      ...(Array.isArray(ph.keywords) ? ph.keywords : []),
      ...(Array.isArray(keywordsOverrides[ph.publicId]) ? keywordsOverrides[ph.publicId] : []),
    ]);

    // Pace car: when both mercedes-benz AND signarama are detected, this photo shows
    // the Mercedes-Benz Oakville pace car (Signarama did the vinyl wrap, but the car
    // is fully credited to Mercedes-Benz Oakville). Add pace-car keyword and strip
    // signarama from entity tags so the photo doesn't appear in Signarama searches.
    if (tags.includes('mercedes-benz') && tags.includes('signarama')) {
      keywords = unique([...keywords, 'pace-car']);
      tags = tags.filter((t) => t !== 'signarama');
    }

    const entityKeys = unique([...tags, ...zoneSponsors(zones)]);

    const id = idFromPublicId(ph.publicId);

    // SEO/LLM: descriptive alt/title/caption + branded download filename.
    const parts = descriptorParts({ category, zones, keywords }, bib, name, entityKeys);
    const conciseParts = parts.slice(0, 8);
    const alt = `${EVENT} official race photo: ${conciseParts.join(', ')}.`;
    const title = `${EVENT} - ${parts.slice(0, 5).join(' - ')}`;
    const caption = `${EVENT} photo from ${parts.join(', ')}. Free official race photography from Oakville, Ontario.`;
    const seoTags = seoTagParts({ category, zones, keywords }, id, bib, name, entityKeys);
    const machineTags = unique([
      env.folder,
      'bronte-harbour-classic-5k-2026',
      category,
      ...zones,
      ...tags,
      ...keywords,
      ...seoTags.map(slugify),
    ]);
    const downloadName = downloadFilename(parts, id);

    return {
      id,
      publicId: ph.publicId,
      category,
      zones,                // narrow activation-zone keys, separate from broad categories
      bib,                  // primary bib (for badge + name lookup)
      bibs: allBibs,        // all detected bibs — used by gallery bib-search
      name,
      alt,                 // SEO alt text
      title,               // image title / LLM-friendly label
      caption,             // share/indexing caption for future surfaces
      downloadName,        // SEO download filename (Cloudinary names the file this)
      sponsorTags: tags,   // sponsor + vendor entity keys (in-frame branding/booth)
      keywords,            // free theme tokens: live-music, beer-garden, kids-area, ...
      photographer: photographerTags[ph.publicId] || null,  // "Photo by" credit in lightbox
      seoTags,             // human-readable search/indexing tags
      tags: machineTags,   // slug tags for machines, LLMs, and future indexing
      thumbUrl: demo ? picsum(id, 400, Math.round((400 * h) / w)) : thumbUrl(ph.publicId),
      viewUrl: demo ? picsum(id, Math.min(w, 1600), Math.round((Math.min(w, 1600) * h) / w)) : viewUrl(ph.publicId),
      fullUrl: demo ? picsum(id, w, h) : fullUrl(ph.publicId),
      downloadUrl: demo ? picsum(id, w, h) : downloadUrl(ph.publicId, downloadName),
      w,
      h,
    };
  });

  // Pre-race photos are excluded from the published gallery — they're archived in
  // photos-raw.json but runners search by their race bib, not pre-race shots.
  const publishManifest = manifest.filter((m) => m.category !== 'pre-race');

  // Privacy-safe email → bib lookup: SHA-256(lowercased email) → bib.
  // Browsers can hash client-side using SubtleCrypto and look up their bib without
  // the gallery ever exposing the full email list.
  const emailIndex = {};
  for (const [bib, p] of Object.entries(participants)) {
    if (p.email) {
      const hash = crypto.createHash('sha256').update(p.email.trim().toLowerCase()).digest('hex');
      emailIndex[hash] = bib;
    }
  }

  // --- write preview manifest.js (window.PHOTO_MANIFEST) ---
  const previewJs =
    '/* AUTO-GENERATED by build-manifest.js — do not edit by hand. */\n' +
    'window.PHOTO_MANIFEST = ' + JSON.stringify(publishManifest, null, 2) + ';\n';
  ensureDir(path.dirname(previewOut));
  fs.writeFileSync(previewOut, previewJs);

  // --- write production outputs ---
  ensureDir(env.sitePublicDir);
  writeJson(path.join(env.sitePublicDir, 'photos-manifest.json'), publishManifest);
  writeJson(path.join(env.sitePublicDir, 'participants-index.json'), participantsIndex);
  writeJson(path.join(env.sitePublicDir, 'email-index.json'), emailIndex);
  // manifest.js (window.PHOTO_MANIFEST) so the production page loads identically to the preview
  fs.writeFileSync(path.join(env.sitePublicDir, 'manifest.js'), previewJs);
  // photo counts (for the email step, kept out of the public site dir)
  writeJson(path.join(inDir, 'photo-counts.json'), photoCount);

  // --- report ---
  // Detection rate is only meaningful for categories where a bib is expected to
  // be visible. Festival/start-line are scene/atmosphere shots — exclude them.
  const BIB_EXPECTED = ['finish-line', 'course', 'kids-1k', 'start-line'];
  const expected = publishManifest.filter((m) => BIB_EXPECTED.indexOf(m.category) !== -1);
  const withBib = publishManifest.filter((m) => m.bib).length;
  const expWithBib = expected.filter((m) => m.bib).length;
  const detRate = expected.length ? Math.round((expWithBib / expected.length) * 100) : 0;
  const byCat = {};
  for (const m of publishManifest) byCat[m.category] = (byCat[m.category] || 0) + 1;
  console.log(`✓ Built manifest: ${publishManifest.length} photos published (${manifest.length - publishManifest.length} pre-race excluded) — ${withBib} carry a bib`);
  console.log(`  • bib detection on bib-expected photos: ${expWithBib}/${expected.length} (${detRate}%)  ${detRate >= 70 ? '✓ meets ≥70% target' : '⚠ below 70% target'}`);
  console.log(`  • participants indexed: ${Object.keys(participantsIndex).length}`);
  console.log(`  • by category: ${Object.entries(byCat).map(([k, v]) => `${k}:${v}`).join('  ')}`);
  console.log(`  • preview → ${path.relative(process.cwd(), previewOut)}`);
  console.log(`  • production → ${path.relative(process.cwd(), path.join(env.sitePublicDir, 'photos-manifest.json'))}`);
  if (demo) console.log('  • (demo-images mode: placeholder picsum URLs)');
}

main();
