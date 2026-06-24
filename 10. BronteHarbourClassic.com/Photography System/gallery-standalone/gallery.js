/*
 * BHC Photo Gallery — client logic (framework-free, portable to Astro).
 * Reads window.GALLERY_CONFIG and window.PHOTO_MANIFEST.
 *
 * Search modes: bib | name | entity (sponsor/vendor) | keyword (theme).
 */
(function () {
  'use strict';

  var CFG = window.GALLERY_CONFIG || {};
  var PHOTOS = Array.isArray(window.PHOTO_MANIFEST) ? window.PHOTO_MANIFEST : [];
  var ENTITIES = CFG.entities || [];
  var THEMES = CFG.themes || [];
  var CATEGORIES = CFG.categories || [{ key: 'all', label: 'All Photos' }];
  var WM = CFG.watermark || { label: 'Bronte Harbour Classic', image: '' };

  var state = { mode: 'bib', query: '', entityKey: '', category: 'all' };

  // --- helpers ---
  function $(id) { return document.getElementById(id); }
  function lc(s) { return String(s == null ? '' : s).toLowerCase(); }
  function normBib(v) { return String(v == null ? '' : v).trim().replace(/^0+(?=\d)/, '').toLowerCase(); }
  function normKeyword(v) { return lc(v).trim().replace(/[\s_]+/g, '-'); }
  function entityByKey(k) { for (var i = 0; i < ENTITIES.length; i++) if (ENTITIES[i].key === k) return ENTITIES[i]; return null; }
  function entityName(k) { var e = entityByKey(k); return e ? e.name : k; }
  function catLabel(k) { for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].key === k) return CATEGORIES[i].label; return k; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // A photo matches an entity if its branding/booth is in-frame (sponsorTags) OR
  // it was uploaded from one of that entity's narrow activation zones.
  function matchesEntity(photo, key) {
    if (!key) return true;
    if (photo.sponsorTags && photo.sponsorTags.indexOf(key) !== -1) return true;
    var e = entityByKey(key);
    var photoZones = photo.zones || [];
    if (e && e.zones && e.zones.some(function (z) { return photoZones.indexOf(z) !== -1; })) return true;
    return false;
  }

  // Returns bibs within ±2 of `bibStr` that have at least one photo — used to
  // suggest corrections when OCR misreads a digit (e.g. 3→8, 0→6).
  function nearbyBibs(bibStr) {
    var n = parseInt(bibStr, 10);
    if (isNaN(n)) return [];
    var found = [];
    for (var delta = -2; delta <= 2; delta++) {
      if (delta === 0) continue;
      var candidate = normBib(String(n + delta));
      var cnt = 0;
      for (var i = 0; i < PHOTOS.length; i++) {
        var ph = PHOTOS[i];
        var arr = ph.bibs && ph.bibs.length ? ph.bibs : (ph.bib ? [ph.bib] : []);
        for (var j = 0; j < arr.length; j++) { if (normBib(arr[j]) === candidate) { cnt++; break; } }
      }
      if (cnt > 0) found.push({ bib: candidate, count: cnt });
    }
    return found;
  }

  function matchesKeyword(p, q) {
    q = lc(q).trim();
    if (!q) return true;
    // expand if the query maps to a theme chip
    var theme = null;
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].key === normKeyword(q) || lc(THEMES[i].label).indexOf(q) !== -1) { theme = THEMES[i]; break; }
    var tokens = theme ? theme.match : [q];
    var pkw = (p.keywords || []).map(normKeyword);
    var pzones = (p.zones || []).map(normKeyword);
    if (theme && theme.zones && theme.zones.some(function (z) { return pzones.indexOf(normKeyword(z)) !== -1; })) return true;
    for (var t = 0; t < tokens.length; t++) {
      var tok = normKeyword(tokens[t]);
      if (pkw.indexOf(tok) !== -1) return true;
    }
    return false;
  }

  // --- filtering ---
  function filtered() {
    return PHOTOS.filter(function (p) {
      if (state.category !== 'all' && p.category !== state.category) return false;
      switch (state.mode) {
        case 'bib':
          if (state.query) {
            var q = normBib(state.query);
            var found = false;
            var pbArr = p.bibs && p.bibs.length ? p.bibs : (p.bib ? [p.bib] : []);
            for (var bi = 0; bi < pbArr.length; bi++) { if (normBib(pbArr[bi]) === q) { found = true; break; } }
            if (!found) return false;
          }
          break;
        case 'name':   if (state.query && (!p.name || lc(p.name).indexOf(lc(state.query)) === -1)) return false; break;
        case 'entity': if (state.entityKey && !matchesEntity(p, state.entityKey)) return false; break;
        case 'keyword': if (state.query && !matchesKeyword(p, state.query)) return false; break;
      }
      return true;
    }).sort(function (a, b) {
      var order = { 'finish-line': 0, 'course': 1, 'festival': 2, 'kids-1k': 3, 'start-line': 4 };
      var oa = order.hasOwnProperty(a.category) ? order[a.category] : 9;
      var ob = order.hasOwnProperty(b.category) ? order[b.category] : 9;
      var d = oa - ob;
      return d !== 0 ? d : (a.id < b.id ? -1 : 1);
    });
  }

  // --- rendering ---
  function cardHtml(p, idx) {
    var badges = '<span class="badge cat">' + esc(catLabel(p.category)) + '</span>';
    var bibList = p.bibs && p.bibs.length ? p.bibs : (p.bib ? [p.bib] : []);
    for (var bi = 0; bi < bibList.length; bi++) badges += '<span class="badge bib">#' + esc(bibList[bi]) + '</span>';
    // Real Cloudinary images already have the watermark baked in → no overlay.
    // The CSS overlay only simulates it for placeholder (preview) images.
    var baked = /res\.cloudinary\.com/.test(p.thumbUrl || '');
    var wm = baked ? '' : (WM.image
      ? '<img class="wm-img" src="' + esc(WM.image) + '" alt="" />'
      : '<span class="wm">' + esc(WM.label) + '</span>');
    var imgAlt = p.alt || (catLabel(p.category) + ' photo');
    var imgTitle = p.title || imgAlt;
    return (
      '<div class="card" data-idx="' + idx + '">' +
        '<div class="imgwrap">' +
          '<div class="badges">' + badges + '</div>' +
          '<img loading="lazy" decoding="async" src="' + esc(p.thumbUrl) + '" alt="' +
            esc(imgAlt) + '" title="' + esc(imgTitle) + '" />' +
          wm +
        '</div>' +
        '<div class="cardfoot">' +
          '<button class="dl" data-act="dl" data-idx="' + idx + '">⬇ Download</button>' +
          '<button data-act="share" data-idx="' + idx + '">↗ Share</button>' +
        '</div>' +
      '</div>'
    );
  }

  var current = [];
  var BATCH = 30;     // photos rendered per chunk (handles 2,000–3,000 photos smoothly)
  var shown = 0;
  var observer = null;

  function renderMore() {
    var grid = $('grid'); if (!grid) return;
    var end = Math.min(shown + BATCH, current.length);
    var html = '';
    for (var i = shown; i < end; i++) html += cardHtml(current[i], i);
    grid.insertAdjacentHTML('beforeend', html);
    shown = end;
    if (shown >= current.length && observer) observer.disconnect();
  }

  function render() {
    current = filtered();
    var results = $('results');
    var count = $('count');
    var clearBtn = $('clear');

    var hasSearch = (state.mode === 'entity' ? !!state.entityKey : !!state.query) || state.category !== 'all';
    clearBtn.style.display = hasSearch ? '' : 'none';

    if (observer) { observer.disconnect(); observer = null; }
    shown = 0;

    if (current.length === 0) {
      count.textContent = '0 photos';
      if (PHOTOS.length === 0) {
        // whole gallery is empty → pre-race "coming soon" state (safe to deploy early)
        results.innerHTML = '<div class="state"><h3>📸 Race photos are coming soon</h3><p>' +
          esc('Professional photos from race day will appear here shortly after June 21, 2026. Check back to search by your bib number, name, sponsor, or theme.') +
          '</p></div>';
      } else if (state.mode === 'bib' && state.query) {
        var searchedQ = normBib(state.query);
        var nearby = nearbyBibs(searchedQ);
        var nearbyHtml = '';
        if (nearby.length > 0) {
          nearbyHtml = '<p class="state-nearby">OCR sometimes misreads digits — did you mean: ' +
            nearby.map(function(nb) {
              return '<button class="nearby-bib-btn" data-bib="' + esc(nb.bib) + '">Bib #' + esc(nb.bib) + ' — ' + nb.count + ' photo' + (nb.count === 1 ? '' : 's') + '</button>';
            }).join(' ') + '</p>';
        }
        results.innerHTML = '<div class="state"><h3>No photos found for bib #' + esc(searchedQ) + '</h3>' +
          '<p>Your bib may not have been visible to the camera — try your name or browse a category above.</p>' +
          nearbyHtml +
          '<p class="state-contact">Think we missed you? <a href="mailto:' + esc(CFG.contactEmail || 'greg@tapegeeks.com') + '?subject=' + esc('Missing photo – Bib ' + searchedQ) + '">Send us a note</a>.</p>' +
          '</div>';
      } else {
        results.innerHTML = '<div class="state"><h3>No photos found</h3><p>' +
          esc("We haven't found those photos yet — the gallery may still be updating. Try a different search or browse a category above.") +
          '</p></div>';
      }
      return;
    }

    var label = current.length === 1 ? '1 photo' : current.length + ' photos';
    if (state.mode === 'bib' && state.query) label += ' for bib #' + esc(normBib(state.query));
    else if (state.mode === 'name' && state.query) label += ' matching “' + esc(state.query) + '”';
    else if (state.mode === 'entity' && state.entityKey) label += ' featuring ' + esc(entityName(state.entityKey));
    else if (state.mode === 'keyword' && state.query) label += ' for “' + esc(state.query) + '”';
    count.textContent = label;

    // batched render: grid + an off-screen sentinel that loads the next chunk
    results.innerHTML = '<div class="bhc-grid" id="grid"></div><div id="sentinel" style="height:1px"></div>';
    renderMore();
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) { if (entries[0].isIntersecting) renderMore(); }, { rootMargin: '800px' });
      observer.observe($('sentinel'));
    } else {
      while (shown < current.length) renderMore(); // fallback: render all
    }
  }

  // --- downloads & sharing ---
  function download(p) {
    var a = document.createElement('a');
    a.href = p.downloadUrl || p.fullUrl;
    a.download = (p.downloadName || p.id || 'bhc-photo') + '.jpg';
    a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
  function share(p) {
    var pageUrl = location.origin + location.pathname + (p.bib ? '?bib=' + encodeURIComponent(p.bib) : '');
    var text = 'Crossed the finish line at the Bronte Harbour Classic 5K! ' + (CFG.hashtag || '#BHC5K');
    if (navigator.share) {
      navigator.share({ title: 'BHC 5K Race Photo', text: text, url: pageUrl }).catch(function () {});
    } else {
      var tmp = document.createElement('textarea');
      tmp.value = text + ' ' + pageUrl;
      document.body.appendChild(tmp); tmp.select();
      try { document.execCommand('copy'); alert('Link copied! Share it with ' + (CFG.hashtag || '#BHC5K')); } catch (e) {}
      document.body.removeChild(tmp);
    }
  }

  // --- lightbox ---
  var lbIndex = 0;
  function lbView(p) { return p.viewUrl || p.fullUrl; }     // lighter image for fast viewing
  function preloadLb(i) {                                    // warm the cache for neighbours
    if (i < 0 || i >= current.length) return;
    var pp = current[i]; if (!pp) return;
    var im = new Image(); im.src = lbView(pp);
  }
  function openLb(idx) {
    lbIndex = idx;
    var p = current[idx]; if (!p) return;
    var img = $('lbImg');
    var view = lbView(p);
    // Show the already-cached thumbnail instantly, then swap to the larger view
    // once it's loaded — no blank wait. Guard against a slow load from a stale nav.
    img.src = p.thumbUrl;
    img.alt = p.alt || '';
    img.title = p.title || p.alt || '';
    var hi = new Image();
    hi.onload = function () { if (lbIndex === idx) img.src = view; };
    hi.src = view;
    // preload the next/previous images so arrow navigation is near-instant
    preloadLb(idx + 1); preloadLb(idx - 1);
    var lbWm = $('lbWm');
    if (lbWm) {
      var bakedF = /res\.cloudinary\.com/.test(view || '');
      if (WM.image && !bakedF) { lbWm.src = WM.image; lbWm.style.display = 'block'; }
      else { lbWm.style.display = 'none'; lbWm.removeAttribute('src'); }
    }
    var bibArr = p.bibs && p.bibs.length ? p.bibs : (p.bib ? [p.bib] : []);
    var searchedBib = (state.mode === 'bib' && state.query) ? normBib(state.query) : null;
    var metaBib, metaName;
    if (searchedBib && bibArr.indexOf(searchedBib) !== -1 && bibArr.length > 1) {
      // When opening from a bib search, lead with the runner's own bib so they
      // immediately see themselves identified in a group photo.
      metaBib = '#' + searchedBib + '  (group photo, ' + bibArr.length + ' runners)';
      metaName = (searchedBib === normBib(p.bib || '')) ? p.name : null;
    } else {
      metaBib = bibArr.length > 1 ? bibArr.map(function(b){return '#'+b;}).join(', ') : (p.bib ? '#'+p.bib : '');
      metaName = p.name;
    }
    $('lbMeta').textContent = (metaBib ? 'Bib ' + metaBib + '  ·  ' : '') + catLabel(p.category) + (metaName ? '  ·  ' + metaName : '');
    var lbPh = $('lbPhotographer');
    if (lbPh) {
      if (p.photographer) { lbPh.textContent = 'Photo by ' + p.photographer; lbPh.style.display = ''; }
      else { lbPh.style.display = 'none'; }
    }
    $('lb').classList.add('open'); $('lb').setAttribute('aria-hidden', 'false');
  }
  function closeLb() { $('lb').classList.remove('open'); $('lb').setAttribute('aria-hidden', 'true'); $('lbImg').src = ''; }
  function stepLb(d) { var n = lbIndex + d; if (n < 0) n = current.length - 1; if (n >= current.length) n = 0; openLb(n); }

  // --- UI wiring ---
  function setMode(mode) {
    state.mode = mode;
    var btns = document.querySelectorAll('.mode-btn');
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-mode') === mode ? 'true' : 'false');
    var input = $('q'), sel = $('qsel'), hint = $('hint'), chips = $('chips');
    chips.style.display = mode === 'keyword' ? 'flex' : 'none';
    if (mode === 'entity') {
      input.style.display = 'none'; sel.style.display = '';
      hint.textContent = 'Choose a sponsor or vendor to see their booth/activation photos and the photos taken in their race zone.';
    } else {
      input.style.display = ''; sel.style.display = 'none';
      if (mode === 'bib') { input.type = 'search'; input.inputMode = 'numeric'; input.placeholder = 'Enter your bib number, e.g. 247'; hint.textContent = 'Your bib number is printed on the bib you wore on race day.'; }
      else if (mode === 'name') { input.type = 'search'; input.inputMode = 'text'; input.placeholder = 'Enter your name, e.g. Sarah'; hint.textContent = 'We match the name you registered with (shown as “First L.” for privacy).'; }
      else if (mode === 'keyword') { input.type = 'search'; input.inputMode = 'text'; input.placeholder = 'Search a theme, e.g. beer garden, live music, kids zone'; hint.textContent = 'Tap a theme below, or type any keyword.'; }
      input.focus();
    }
    applySearch();
  }

  function applySearch() {
    if (state.mode === 'entity') { state.entityKey = $('qsel').value; state.query = ''; }
    else { state.query = $('q').value.trim(); state.entityKey = ''; }
    render();
  }

  function buildTabs() {
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
      var c = CATEGORIES[i];
      html += '<button class="tab" data-cat="' + c.key + '" aria-pressed="' + (c.key === state.category ? 'true' : 'false') + '">' + esc(c.label) + '</button>';
    }
    $('tabs').innerHTML = html;
  }

  function buildEntitySelect() {
    var sel = $('qsel');
    var groups = {};
    for (var i = 0; i < ENTITIES.length; i++) { var t = ENTITIES[i].type || 'other'; (groups[t] = groups[t] || []).push(ENTITIES[i]); }
    var html = '<option value="">— Select a sponsor or vendor —</option>';
    var labels = { sponsor: 'Sponsors', partner: 'Official Partners', organizer: 'Event Organizers', municipal: 'Municipal & Community', charity: 'Charity', vendor: 'Festival Vendors', other: 'Other' };
    Object.keys(groups).forEach(function (t) {
      html += '<optgroup label="' + esc(labels[t] || t) + '">';
      groups[t].forEach(function (e) { html += '<option value="' + esc(e.key) + '">' + esc(e.name) + '</option>'; });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
  }

  function buildChips() {
    var html = '';
    for (var i = 0; i < THEMES.length; i++) html += '<button class="chip" data-theme="' + esc(THEMES[i].key) + '">' + esc(THEMES[i].label) + '</button>';
    $('chips').innerHTML = html;
  }

  function init() {
    if ($('credit')) $('credit').textContent = CFG.creditLine || '';
    if ($('rights')) $('rights').textContent = CFG.rightsNotice || '';
    if ($('contactLink')) { $('contactLink').textContent = CFG.contactEmail || 'greg@tapegeeks.com'; $('contactLink').href = 'mailto:' + (CFG.contactEmail || 'greg@tapegeeks.com'); }

    buildTabs();
    buildEntitySelect();
    buildChips();

    // prefill ?bib= from URL (used by photo-ready emails)
    var prefilled = false;
    try {
      var params = new URLSearchParams(location.search);
      if (params.get('bib')) { setMode('bib'); $('q').value = params.get('bib'); applySearch(); prefilled = true; }
    } catch (e) {}

    // events
    document.querySelectorAll('.mode-btn').forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });
    $('go').addEventListener('click', applySearch);
    $('q').addEventListener('input', applySearch);
    $('q').addEventListener('keydown', function (e) { if (e.key === 'Enter') applySearch(); });
    $('qsel').addEventListener('change', applySearch);
    $('chips').addEventListener('click', function (e) {
      var c = e.target.closest('.chip'); if (!c) return;
      var key = c.getAttribute('data-theme');
      var chips = document.querySelectorAll('.chip');
      var active = c.getAttribute('aria-pressed') === 'true';
      for (var i = 0; i < chips.length; i++) chips[i].setAttribute('aria-pressed', 'false');
      if (active) { $('q').value = ''; }
      else { c.setAttribute('aria-pressed', 'true'); $('q').value = key; }
      applySearch();
    });
    $('tabs').addEventListener('click', function (e) {
      var t = e.target.closest('.tab'); if (!t) return;
      state.category = t.getAttribute('data-cat');
      var tabs = document.querySelectorAll('.tab');
      for (var i = 0; i < tabs.length; i++) tabs[i].setAttribute('aria-pressed', tabs[i] === t ? 'true' : 'false');
      render();
    });
    $('clear').addEventListener('click', function () {
      state.query = ''; state.entityKey = ''; state.category = 'all';
      $('q').value = ''; $('qsel').value = '';
      var chips = document.querySelectorAll('.chip'); for (var i = 0; i < chips.length; i++) chips[i].setAttribute('aria-pressed', 'false');
      var tabs = document.querySelectorAll('.tab'); for (var j = 0; j < tabs.length; j++) tabs[j].setAttribute('aria-pressed', tabs[j].getAttribute('data-cat') === 'all' ? 'true' : 'false');
      render();
    });
    $('results').addEventListener('click', function (e) {
      var nearbyBtn = e.target.closest('.nearby-bib-btn');
      if (nearbyBtn) { $('q').value = nearbyBtn.getAttribute('data-bib'); applySearch(); return; }
      var actBtn = e.target.closest('button[data-act]');
      if (actBtn) { e.stopPropagation(); var p = current[+actBtn.getAttribute('data-idx')]; if (!p) return; if (actBtn.getAttribute('data-act') === 'dl') download(p); else share(p); return; }
      var card = e.target.closest('.card'); if (card) openLb(+card.getAttribute('data-idx'));
    });

    $('lbClose').addEventListener('click', closeLb);
    $('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); stepLb(-1); });
    $('lbNext').addEventListener('click', function (e) { e.stopPropagation(); stepLb(1); });
    $('lbDl').addEventListener('click', function () { download(current[lbIndex]); });
    $('lbShare').addEventListener('click', function () { share(current[lbIndex]); });
    $('lb').addEventListener('click', function (e) { if (e.target === $('lb')) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!$('lb').classList.contains('open')) return;
      if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowLeft') stepLb(-1); else if (e.key === 'ArrowRight') stepLb(1);
    });

    if (!prefilled) render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
