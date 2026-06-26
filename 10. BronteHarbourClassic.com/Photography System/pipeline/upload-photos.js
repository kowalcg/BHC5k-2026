#!/usr/bin/env node
/*
 * upload-photos.js — bulk-upload race photos to Cloudinary, organized by station.
 *
 * Point it at a local directory whose SUBFOLDERS are named by category:
 *   <dir>/finish-line/*.jpg
 *   <dir>/course/*.jpg
 *   <dir>/festival/*.jpg
 *   <dir>/kids-1k/*.jpg
 *   <dir>/start-line/*.jpg
 *
 * Optional narrow activation zones can be nested under a category:
 *   <dir>/festival/nickel-brook-beer-garden/*.jpg
 *   <dir>/festival/fortinos-food-table/*.jpg
 *   <dir>/start-line/signarama-start-signage/*.jpg
 *
 * Each photo uploads to Cloudinary as
 *   <CLOUDINARY_FOLDER>/<category>/<optional-zone>/<filename>
 * and is tagged with the category + the event folder, so process-photos.js can
 * read the station and activation zone from the public_id.
 *
 * Usage:
 *   node pipeline/upload-photos.js --dir ~/Desktop/BHC-photos
 *   node pipeline/upload-photos.js --dir ~/Desktop/BHC-photos --only finish-line
 *
 * Also uploads the watermark logo once:
 *   node pipeline/upload-photos.js --watermark assets/bhc-watermark.png
 *
 * Prereq: npm install   (cloudinary)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { env, ROOT, CATEGORIES, requireCloudinary } from './lib/config.js';

function arg(name, def) { const i = process.argv.indexOf(name); if (i === -1) return def; const n = process.argv[i + 1]; return n && !n.startsWith('--') ? n : true; }
const IMG_RE = /\.(jpe?g|png|heic|webp)$/i;

// --local-only: skip Cloudinary entirely. Copies originals (full resolution) to
// ~/BHC-2026-photos-backup/source/ so generate-variants.js can produce the best
// possible quality downloads. This is the preferred mode now that Cloudinary is
// replaced by R2. The Cloudinary flags below are kept for reference only.
const LOCAL_ONLY = !!arg('--local-only', false);
const BACKUP_SRC = path.join(os.homedir(), 'BHC-2026-photos-backup', 'source');

// Legacy Cloudinary resize flags (ignored in --local-only mode).
//   --full        upload untouched originals (uses chunked upload for >10 MB files)
//   --max <px>    change the long-edge cap (default 2400)
const FULL = !!arg('--full', false);
const MAXPX = arg('--max', null) ? parseInt(arg('--max'), 10) : 2400;
const SIPS = (() => { try { execFileSync('sips', ['--help'], { stdio: 'ignore' }); return true; } catch { return false; } })();
const TMP = LOCAL_ONLY ? null : fs.mkdtempSync(path.join(os.tmpdir(), 'bhc-upload-'));

// Resize a source image to <=MAXPX JPEG in a temp file. Returns the temp path, or
// null if we should upload the original as-is (--full, or sips unavailable).
function resizeLocal(src) {
  if (FULL || !SIPS) return null;
  const out = path.join(TMP, 'r-' + path.parse(src).name + '-' + (Date.now() % 1e6) + '.jpg');
  try {
    execFileSync('sips', ['-s', 'format', 'jpeg', '-Z', String(MAXPX), '-s', 'formatOptions', '82', src, '--out', out], { stdio: 'ignore' });
    return fs.existsSync(out) ? out : null;
  } catch { return null; }
}

async function main() {
  if (!LOCAL_ONLY) requireCloudinary();
  const { v2: cloudinary } = LOCAL_ONLY ? { v2: null } : await import('cloudinary');
  if (cloudinary) cloudinary.config({ cloud_name: env.cloudName, api_key: env.apiKey, api_secret: env.apiSecret });

  // --- watermark upload mode ---
  const wm = arg('--watermark', null);
  if (wm) {
    const wmPath = path.resolve(ROOT, wm);
    const publicId = env.watermarkPublicId; // e.g. bhc-2026/bhc-watermark
    const folder = path.dirname(publicId);
    const id = path.basename(publicId);
    const res = await cloudinary.uploader.upload(wmPath, { public_id: id, folder, overwrite: true });
    console.log(`✓ Watermark uploaded as ${res.public_id}`);
    return;
  }

  const dir = arg('--dir', null);
  if (!dir) { console.error('✗ Provide --dir <folder>  (or --watermark <file>)'); process.exit(1); }
  const only = arg('--only', null);
  const base = path.resolve(dir);
  // --category <key>: treat --dir as a FLAT folder of photos for that one category
  // (otherwise --dir must contain subfolders named by station).
  const flatCategory = arg('--category', null);
  // --zone <key>: when using --category, place every image in this narrow zone.
  const flatZone = arg('--zone', null);

  function listImages(rootDir) {
    const out = [];
    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (entry.isFile() && IMG_RE.test(entry.name)) out.push(p);
      }
    }
    walk(rootDir);
    return out;
  }

  // Build the list of {dir, category} jobs.
  const jobs = flatCategory
    ? [{ dir: base, category: flatCategory, zonePrefix: flatZone ? [flatZone] : [] }]
    : CATEGORIES.filter((c) => !only || only === c).map((c) => ({ dir: path.join(base, c), category: c, zonePrefix: [] }));

  // Idempotent: skip already-staged files. Use --reupload to force.
  const REUPLOAD = !!arg('--reupload', false);
  const existingIds = new Set();
  if (!REUPLOAD && !LOCAL_ONLY) {
    let next = null;
    do {
      const res = await cloudinary.api.resources({ type: 'upload', prefix: env.folder + '/', max_results: 500, next_cursor: next });
      res.resources.forEach((r) => existingIds.add(r.public_id));
      next = res.next_cursor;
    } while (next);
  }

  // --photographer "Name": credit every photo in this batch to that person.
  // Written to data/photographer-tags.json (same pattern as sponsor-tags.json).
  const photographer = arg('--photographer', null);
  // --tags-file <path>: write credits to a separate file instead of the shared
  // photographer-tags.json — useful when running multiple uploads in parallel.
  const phTagsFile = arg('--tags-file', null);
  const phTagsPath = phTagsFile ? path.resolve(ROOT, phTagsFile) : path.join(ROOT, 'data', 'photographer-tags.json');
  const phTags = (() => { try { return JSON.parse(fs.readFileSync(phTagsPath, 'utf8')); } catch { return {}; } })();

  let total = 0, failed = 0, skipped = 0, storedBytes = 0;
  for (const job of jobs) {
    const category = job.category;
    const catDir = job.dir;
    if (!fs.existsSync(catDir)) continue;
    const files = listImages(catDir);
    if (!files.length) continue;
    console.log(`"${category}": ${files.length} file(s) in folder…`);
    for (const src of files) {
      const relDir = path.dirname(path.relative(catDir, src));
      const nestedZones = relDir === '.' ? [] : relDir.split(path.sep).filter(Boolean);
      const zones = [...(job.zonePrefix || []), ...nestedZones];
      const zonePath = zones.join('/');
      const folder = `${env.folder}/${category}${zonePath ? '/' + zonePath : ''}`;
      const name = path.parse(src).name;
      const targetId = `${folder}/${name}`;
      if (!LOCAL_ONLY && existingIds.has(targetId)) { skipped++; continue; }
      if (LOCAL_ONLY) {
        // Copy original at FULL resolution to the local backup source dir.
        // generate-variants.js reads from here — keeping originals means
        // downloads will be full photographer quality (no 2400px cap).
        const srcExt = path.extname(src).toLowerCase() || '.jpg';
        const destPath = path.join(BACKUP_SRC, folder, name + srcExt);
        if (!REUPLOAD && fs.existsSync(destPath)) { skipped++; continue; }
        try {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(src, destPath);
          total++;
          storedBytes += fs.statSync(destPath).size;
          if (photographer) phTags[targetId] = photographer;
          if (total % 25 === 0) console.log(`  …${total} staged`);
        } catch (e) {
          failed++;
          console.warn(`  ⚠ failed ${path.relative(catDir, src)}: ${e.message}`);
        }
      } else {
        let tmp = null;
        try {
          tmp = resizeLocal(src);
          const uploadPath = tmp || src;
          const ctx = photographer
            ? `copyright=© 2026 Bronte Harbour Classic & TapeGeeks Inc.|credit=Bronte Harbour Classic|photographer=${photographer}`
            : 'copyright=© 2026 Bronte Harbour Classic & TapeGeeks Inc.|credit=Bronte Harbour Classic';
          const opts = {
            folder,
            public_id: name,
            overwrite: REUPLOAD,
            tags: [env.folder, category, ...zones],
            resource_type: 'image',
            context: ctx,
          };
          const big = !tmp && fs.statSync(src).size > 10 * 1024 * 1024;
          const res = big
            ? await cloudinary.uploader.upload_large(uploadPath, opts)
            : await cloudinary.uploader.upload(uploadPath, opts);
          total++;
          storedBytes += res.bytes || 0;
          if (photographer) phTags[targetId] = photographer;
          if (total % 25 === 0) console.log(`  …${total} uploaded`);
        } catch (e) {
          failed++;
          console.warn(`  ⚠ failed ${path.relative(catDir, src)}: ${e.message}`);
        } finally {
          if (tmp) { try { fs.unlinkSync(tmp); } catch {} }
        }
      }
    }
  }
  if (photographer && total > 0) {
    fs.writeFileSync(phTagsPath, JSON.stringify(phTags, null, 2));
    console.log(`  • credited ${total} new photo(s) to "${photographer}" in photographer-tags.json`);
  }
  if (TMP) { try { fs.rmdirSync(TMP); } catch {} }
  const mb = (storedBytes / 1048576).toFixed(1);
  if (LOCAL_ONLY) {
    console.log(`✓ Staged ${total} photo(s) to local backup${skipped ? `, skipped ${skipped} already present` : ''}${failed ? `, ${failed} failed` : ''} (${mb} MB, full resolution).`);
    console.log(`  Output: ${BACKUP_SRC}`);
    console.log('Next: npm run r2:process -- --local');
  } else {
    if (!SIPS && !FULL) console.log('  (note: `sips` not found — uploaded originals as-is; files >10MB may fail on the free tier)');
    console.log(`✓ Uploaded ${total} new photo(s)${skipped ? `, skipped ${skipped} already in Cloudinary` : ''}${failed ? `, ${failed} failed` : ''}.`);
    console.log(`  Stored ${mb} MB total${FULL ? ' (full originals)' : ` (resized to ≤${MAXPX}px, ~${total ? (storedBytes/1048576/total).toFixed(2) : 0} MB/photo)`}.`);
    console.log('Next: node pipeline/process-photos.js');
  }
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });
