// Maps that turn Google Vision results into sponsor/vendor tags and theme keywords.
//
// - SPONSOR_ALIASES: entity key -> { text: [names to look for in OCR text],
//                                    logo: [Vision LOGO_DETECTION descriptions] }
//   Text matching catches any banner/booth with the name printed (works for
//   local sponsors). Logo matching catches famous brands even with no text.
// - THEME_LABELS: theme keyword -> [Vision LABEL_DETECTION terms that imply it]
//
// Keep entity keys in sync with gallery-standalone/config.js + lib/config.js.

export const SPONSOR_ALIASES = {
  'mercedes-benz':  { text: ['mercedes-benz', 'mercedes benz', 'mercedes'], logo: ['mercedes-benz', 'mercedes-benz logo'] },
  'cibc':           { text: ['cibc'], logo: ['cibc'] },
  'on-running':     { text: ['on running', 'on cloud', 'on-running'], logo: [] },
  'natrilyte':      { text: ['natrilyte'], logo: [] },
  'radixgym':       { text: ['radixgym', 'radix gym', 'radix'], logo: ['radix'] },
  'global-citizen': { text: ['global citizen'], logo: [] },
  'be-active':      { text: ['be active physio', 'be active', 'beactive'], logo: [] },
  'fortinos':       { text: ['fortinos'], logo: ['fortinos'] },
  'nickel-brook':   { text: ['nickel brook', 'nickelbrook'], logo: ['nickel brook'] },
  'speak-squad':    { text: ['speak squad', 'speaksquad'], logo: [] },
  'oakvest':        { text: ['oakvest'], logo: [] },
  'mycourier':      { text: ['mycourier', 'my courier'], logo: [] },
  'rockstar-brokerage': { text: ['rockstar brokerage', 'rockstar real estate', 'rockstar inner circle'], logo: [] },
  'runners-den':    { text: ["runner's den", 'runners den', 'runner den'], logo: [] },
  'film-ca':        { text: ['film.ca', 'film ca', 'filmca'], logo: ['film.ca', 'film ca'] },
  'signarama':      { text: ['signarama'], logo: ['signarama'] },
  'tapegeeks':      { text: ['tapegeeks', 'tape geeks'], logo: [] },
  'geartop-design': { text: ['geartop design', 'geartop'], logo: [] },
  'runmate-pro':    { text: ['runmate pro', 'runmate'], logo: [] },
  'sunup':          { text: ['sunup'], logo: [] },
  'oakville-performance-running': { text: ['oakville performance running', 'oakville performance', 'performance running'], logo: [] },
  'bronte-runners-club': { text: ['bronte runners club', 'bronte runners'], logo: [] },
  'pace-performance': { text: ['pace performance'], logo: [] },
  'town-of-oakville': { text: ['town of oakville'], logo: [] },
  'bronte-bia':     { text: ['bronte bia', 'bronte village bia', 'bronte village'], logo: [] },
  'oakville-dads':  { text: ['oakville dads community fund', 'oakville dads'], logo: [] },
  'vendor-foodtruck': { text: ['food truck', 'foodtruck'], logo: [] },
};

export const THEME_LABELS = {
  'live-music':  ['musician', 'concert', 'band', 'singer', 'guitar', 'guitarist', 'drummer', 'drum kit', 'dj', 'rock concert', 'music venue', 'live music'],
  'beer-garden': ['beer garden'],
  'kids-area':   ['child', 'kid', 'toddler', 'playground', 'play', 'toy', 'infant', 'baby', 'children', 'face painting', 'inflatable'],
  'food':        ['food', 'dish', 'meal', 'cuisine', 'fast food', 'food truck', 'restaurant', 'eating', 'snack'],
  'awards':      ['trophy', 'medal', 'award', 'prize', 'podium', 'championship', 'ceremony'],
  'festival':    ['festival', 'crowd', 'event', 'tent', 'fair', 'audience', 'public event', 'party'],
};

// Apparel/banner text is frequently printed as a stacked "logo lockup" (e.g. a
// shirt reading BRONTE on one line and RUNNERS on the next). Google Vision's
// fullTextAnnotation.text joins lines with newlines, so a plain substring
// check for "bronte runners" never matches even though a person reading the
// shirt would. Vision's own paragraph grouping (fullTextAnnotation.pages ->
// blocks -> paragraphs) already clusters visually-adjacent lines together —
// a two-line shirt logo typically comes back as ONE paragraph — so matching
// per-paragraph (instead of the single flattened block of text) recovers
// these without the false positives an ad hoc pixel-distance radius would
// invite (e.g. a race banner's "AMG PERFORMANCE" sitting near an unrelated
// runner's shirt in the frame, but in a different Vision-detected paragraph).
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[n];
}

// Tolerate small OCR misreads (e.g. "RUNNERS" read as "UNNERS" off a
// stylized/angled shirt logo) but only for longer words, to avoid false
// positives on short/common tokens.
function wordsMatch(a, b) {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5) return false;
  const maxDist = a.length >= 7 ? 2 : 1;
  return levenshtein(a, b) <= maxDist;
}

// Flatten Vision's fullTextAnnotation.pages into one lowercase word list per
// paragraph — each paragraph is Vision's own guess at a visually-clustered
// run of text (a shirt logo, a single banner line, etc).
function buildParagraphs(pages) {
  const out = [];
  for (const page of pages || []) {
    for (const block of page.blocks || []) {
      for (const para of block.paragraphs || []) {
        const words = (para.words || [])
          .map((w) => (w.symbols || []).map((s) => s.text || '').join('').toLowerCase().replace(/[^a-z0-9]/g, ''))
          .filter(Boolean);
        if (words.length) out.push(words);
      }
    }
  }
  return out;
}

// True if every word in `phraseWords` appears (in order, fuzzy-tolerant) as
// its own token within a single paragraph's word list.
function phraseInParagraph(phraseWords, paraWords) {
  let from = 0;
  for (const pw of phraseWords) {
    const idx = paraWords.findIndex((w, i) => i >= from && wordsMatch(w, pw));
    if (idx === -1) return false;
    from = idx + 1;
  }
  return true;
}

// Detect sponsor/vendor keys from OCR full text + detected logos, optionally
// enhanced with Vision's paragraph structure (fullTextAnnotation.pages) for
// stacked/multi-line logo lockups. `pages` is optional for callers that don't
// have it (falls back to flattened-text matching only).
export function detectSponsors(fullText, logoDescriptions, pages) {
  const text = (fullText || '').toLowerCase();
  const logos = (logoDescriptions || []).map((d) => d.toLowerCase());
  const paragraphs = pages ? buildParagraphs(pages) : null;
  const found = new Set();
  for (const [key, m] of Object.entries(SPONSOR_ALIASES)) {
    let hit = m.text.some((alias) => text.includes(alias));
    if (!hit && m.logo.length) hit = logos.some((ld) => m.logo.some((ml) => ld.includes(ml)));
    if (!hit && paragraphs && paragraphs.length) {
      hit = m.text.some((alias) => {
        const words = alias.split(/[\s-]+/).filter(Boolean);
        return words.length > 1 && paragraphs.some((p) => phraseInParagraph(words, p));
      });
    }
    if (hit) found.add(key);
  }
  return [...found];
}

// Detect theme keywords from Vision labels (each {description, score}).
export function detectThemes(labels, minScore = 0.6) {
  const hits = (labels || []).filter((l) => (l.score || 0) >= minScore).map((l) => (l.description || '').toLowerCase());
  const found = new Set();
  for (const [theme, terms] of Object.entries(THEME_LABELS)) {
    if (terms.some((t) => hits.some((h) => h === t || h.includes(t)))) found.add(theme);
  }
  return [...found];
}
