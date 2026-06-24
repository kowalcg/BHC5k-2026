/*
 * BHC Photo Gallery — configuration
 * Standalone preview version. Edit values here; the production Astro port reads
 * the same structure. Sponsors mirror site/src/data/sponsors.ts.
 */
window.GALLERY_CONFIG = {
  eventName: 'Mercedes-Benz Oakville Bronte Harbour Classic 5K',
  eventYear: 2026,
  hashtag: '#BHC5K',
  contactEmail: 'greg@tapegeeks.com',

  // Watermark applied to every photo. Until a Photo Sponsor signs, this is the
  // BHC race logo. When a sponsor is secured, swap image + label here (and the
  // Cloudinary WATERMARK_PUBLIC_ID in the pipeline .env) — one change, no reprocessing.
  watermark: {
    label: 'Bronte Harbour Classic 5K',
    image: 'assets/bhc-watermark.png',
  },
  creditLine: 'Race photos provided free by the Bronte Harbour Classic.',
  // Photo usage & rights notice shown at the bottom of the gallery.
  rightsNotice: '© 2026 Bronte Harbour Classic & TapeGeeks Inc. All rights reserved. ' +
    'These photos are provided free to participants, sponsors, and vendors, who are granted a ' +
    'non-exclusive licence to download, share, and use them for personal and promotional purposes ' +
    'with credit to the Bronte Harbour Classic. All images remain the property of the Bronte Harbour ' +
    'Classic and TapeGeeks Inc. They may not be sold, sub-licensed, or used commercially without ' +
    'written permission, and unauthorized use may be removed. For removal or commercial licensing ' +
    'requests, contact greg@tapegeeks.com.',

  // Cloudinary cloud name — set after the account is created (Phase 0).
  cloudinaryCloud: 'CLOUDINARY_CLOUD_NAME',

  // Photo categories (= photographer stations). Order = tab order.
  categories: [
    { key: 'all',         label: 'All Photos' },
    { key: 'finish-line', label: 'Finish Line' },
    { key: 'course',      label: 'Course Action' },
    { key: 'festival',    label: 'Festival & Awards' },
    { key: 'kids-1k',     label: 'Kids 1K' },
    { key: 'start-line',  label: 'Start Line' },
  ],

  // Searchable entities for the "Sponsor / Vendor" mode. `type` is shown as a
  // group label. `zones` are narrow physical activations, not broad browse
  // categories. A photo matches an entity when the brand is actually in-frame
  // (`sponsorTags`) or when it was uploaded from one of these reviewed zones.
  entities: [
    // --- Sponsors (mirror site/src/data/sponsors.ts) ---
    { key: 'mercedes-benz',  name: 'Mercedes-Benz Oakville', type: 'sponsor', zones: ['mercedes-display', 'mercedes-pace-car'] },
    { key: 'cibc',           name: 'CIBC',                   type: 'sponsor', zones: [] },
    { key: 'on-running',     name: 'ON Running',             type: 'sponsor', zones: [] },
    { key: 'natrilyte',      name: 'Natrilyte',              type: 'sponsor', zones: ['natrilyte-water-station', 'natrilyte-finish-hydration', 'natrilyte-booth'] },
    { key: 'radixgym',       name: 'RadixGym',               type: 'partner', zones: ['radixgym-booth', 'radixgym-fitness-zone'] },
    { key: 'global-citizen', name: 'Global Citizen',         type: 'sponsor', zones: ['global-citizen-photo-booth', 'global-citizen-shirt-table'] },
    { key: 'be-active',      name: 'Be Active Physio',       type: 'sponsor', zones: ['awards-podium'] },
    { key: 'fortinos',       name: 'Fortinos',               type: 'partner', zones: ['fortinos-food-table'] },
    { key: 'nickel-brook',   name: 'Nickel Brook Brewing Co.', type: 'partner', zones: ['nickel-brook-beer-garden'] },
    { key: 'speak-squad',    name: 'Speak Squad',            type: 'sponsor', zones: ['speak-squad-kids-zone'] },
    { key: 'oakvest',        name: 'Oakvest Group',          type: 'sponsor', zones: ['oakvest-bib'] },
    { key: 'mycourier',      name: 'MyCourier',              type: 'sponsor', zones: ['mycourier-ground-ops'] },
    { key: 'rockstar-brokerage', name: 'Rockstar Brokerage', type: 'partner', zones: ['rockstar-community-booth'] },
    { key: 'runners-den',    name: "Runner's Den Burlington", type: 'partner', zones: ['runners-den-booth'] },
    { key: 'film-ca',        name: 'Film.ca',                type: 'partner', zones: ['film-ca-booth'] },
    { key: 'signarama',      name: 'Signarama Oakville',     type: 'sponsor', zones: ['signarama-start-signage'] },
    // --- Event organizers and community partners ---
    { key: 'tapegeeks',      name: 'TapeGeeks',              type: 'organizer', zones: ['tapegeeks-recovery-zone'] },
    { key: 'geartop-design', name: 'GearTOP Design',         type: 'organizer', zones: ['geartop-sun-protection-booth'] },
    { key: 'runmate-pro',    name: 'RunMate Pro',            type: 'organizer', zones: ['runmate-pro-booth'] },
    { key: 'sunup',          name: 'SunUp',                  type: 'organizer', zones: ['sunup-booth'] },
    { key: 'oakville-performance-running', name: 'Oakville Performance Running', type: 'organizer', zones: ['oakville-performance-training-booth'] },
    { key: 'bronte-runners-club', name: 'Bronte Runners Club', type: 'organizer', zones: ['bronte-runners-volunteer-zone'] },
    { key: 'pace-performance', name: 'Pace Performance',     type: 'organizer', zones: ['pace-performance-race-ops'] },
    { key: 'town-of-oakville', name: 'Town of Oakville',     type: 'municipal', zones: ['town-of-oakville-info'] },
    { key: 'bronte-bia',     name: 'Bronte BIA',             type: 'municipal', zones: ['bronte-bia-village-booth'] },
    { key: 'oakville-dads',  name: 'Oakville Dads Community Fund', type: 'charity', zones: ['oakville-dads-charity-table'] },
    // --- Festival vendors (placeholder list — replace with the real vendor roster) ---
    { key: 'vendor-foodtruck', name: 'Food Truck Row',       type: 'vendor', zones: ['food-truck-row'] },
    { key: 'vendor-market',    name: 'Vendor Market',        type: 'vendor', zones: ['vendor-market'] },
  ],

  // Keyword / theme chips for the "Theme" search. `match` lists the keyword
  // tokens (on a photo's `keywords` array) that this chip should find.
  themes: [
    { key: 'pace-car',   label: '🏎️ Pace Car',   match: ['pace-car'], zones: ['mercedes-pace-car'] },
    { key: 'live-music',  label: '🎵 Live Music',  match: ['live-music', 'music', 'band', 'dj'], zones: ['live-music-stage'] },
    { key: 'beer-garden', label: '🍺 Beer Garden', match: ['beer-garden'], zones: ['nickel-brook-beer-garden'] },
    { key: 'kids-area',   label: '🧒 Kids Zone',   match: ['kids-area', 'kids', 'play', 'face-paint'], zones: ['speak-squad-kids-zone'] },
    { key: 'festival',    label: '🎉 Festival',    match: ['festival', 'vendors', 'community'], zones: ['vendor-market'] },
    { key: 'awards',      label: '🏆 Awards',      match: ['awards', 'podium', 'medal'], zones: ['awards-podium'] },
    { key: 'food',        label: '🍔 Food',        match: ['food', 'foodtruck'], zones: ['fortinos-food-table', 'food-truck-row'] },
  ],
};
