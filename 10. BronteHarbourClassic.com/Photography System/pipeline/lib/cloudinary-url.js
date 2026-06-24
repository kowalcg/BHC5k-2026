// Builds Cloudinary delivery URLs with the sponsor watermark baked in.
// The watermark is applied on delivery (no re-processing of originals).
import { env } from './config.js';

// Cloudinary overlay public_ids use ':' instead of '/' for folder separators.
function overlayId(publicId) { return String(publicId).replace(/\//g, ':'); }

const WM = overlayId(env.watermarkPublicId);

// Watermark transform: sponsor logo, bottom-right, sized as a fraction of width.
function wm(frac) { return `l_${WM},g_south_east,x_20,y_20,w_${frac},o_75`; }
const WM_SMALL = wm(0.18); // thumbnails — subtle
const WM_LARGE = wm(0.30); // full-view + downloads — prominent (branding + rights protection)

function base() {
  return `https://res.cloudinary.com/${env.cloudName}/image/upload`;
}

// ~400px watermarked thumbnail for the grid.
export function thumbUrl(publicId) {
  return `${base()}/c_fill,w_400,q_auto,f_auto/${WM_SMALL}/${publicId}.jpg`;
}

// ~1600px watermarked image for the lightbox — lighter than full so it loads fast.
export function viewUrl(publicId) {
  return `${base()}/q_auto,f_auto,w_1600,c_limit/${WM_LARGE}/${publicId}.jpg`;
}

// Full-size watermarked image (used as a fallback / large view).
export function fullUrl(publicId) {
  return `${base()}/q_auto,f_auto,w_2000,c_limit/${WM_LARGE}/${publicId}.jpg`;
}

function sanitizeName(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// Forces a browser download (fl_attachment) of the watermarked full image at
// ORIGINAL quality — no resize or compression transforms so the downloaded file
// matches the original upload. Preview/lightbox URLs stay compressed for speed.
// `name` becomes the saved filename; Cloudinary adds the .jpg extension.
export function downloadUrl(publicId, name) {
  const attach = name ? `fl_attachment:${sanitizeName(name)}` : 'fl_attachment';
  return `${base()}/${WM_LARGE}/${attach}/${publicId}.jpg`;
}
