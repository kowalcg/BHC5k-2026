# Building a Digital-First Race — Editorial Calendar

> **Series owner:** Greg Kowalczyk
> **Created:** July 8, 2026
> **Cadence:** 1 article pair per week (Greg site + BHC sibling, cross-linked)
> **Status legend:** 📝 Planned | ✍️ Drafted | ✅ Published

## What this series is

A two-sided content network documenting the digital/AI decisions behind the Mercedes-Benz Oakville Bronte Harbour Classic 5K:

- **GregKowalczyk.com** (`/news/`, tag: `Digital-First Race`) — consultant voice, for business owners and event organizers. How and why we built it.
- **BronteHarbourClassic.com** (`/news/`, tag: `Behind the Race`) — community voice, for runners, sponsors, vendors. What it means for them.

Every pair cross-links both ways and links to live proof (/photos/, /2026/, sponsor pages). The series also carries the ecosystem mission: TapeGeeks (injury-free), GearTOP/SunUp (sun safety for every runner and kid), SportClinicFinder (find a clinic), RunMate Pro.

**Never mentioned in this series:** registration platform evaluations, vendor sales conversations (Movemint, Race Roster comparisons, etc.).

## The 7-week schedule

| Wk | Target date | GregKowalczyk.com article | BHC /news/ sibling | Proof links | Status |
|----|------------|---------------------------|--------------------|-------------|--------|
| 1 | Jul 8, 2026 | Why We Archived Every Race Forever | The 2026 Archive: Your Race, Saved Forever | /2026/, medal QR | ✅ Published |
| 2 | Jul 15, 2026 | How AI Organized 1,800+ Race Photos (and Drone Videos) | How to Find Your Race Photos (Search by Bib Number) | /photos/ | ✅ Published |
| 3 | Jul 22, 2026 | Why Every Sponsor and Vendor Gets a Permanent Web Presence | Why Every Sponsor and Vendor Has Their Own Page | /2026/[slug] pages | ✅ Published |
| 4 | Jul 29, 2026 | Why Our Medals Have QR Codes (When No One Else's Do) | Scan Your Medal: What the QR Code Unlocks | /2026/ hub | ✅ Published |
| 5 | Aug 5, 2026 | A Race Website That Grows Instead of Starting Over | Everything on BronteHarbourClassic.com (and Why It Stays Up All Year) | site-wide | ✅ Published |
| 6 | Aug 12, 2026 | A Race Is Just the Start: Building a Health & Safety Ecosystem | Beyond Race Day: Staying Safe & Injury-Free Outside | tapegeeks.com, getsunup.app, sportsclinicfinder.com, runmatepro.com | 📝 Planned |
| 7 | Aug 19, 2026 | What Digital-First Delivered: Year One by the Numbers | Thank You, 2026 — Here's What's Coming in 2027 | /2026/, 2027 teaser | 📝 Planned |

## SEO standards — MANDATORY for every article (goal: rank fast for 2027 — attract vendors, sponsors, runners, visitors)

**Word counts (body, excluding frontmatter):**
- GregKowalczyk.com posts: **1,800–2,200 words** (broader organizer/business SERP competition)
- BHC posts: **1,200–1,600 words** (local/community + partner recruiting; depth + FAQ beats raw length here)

**On-page requirements (both sites, every post):**
- Primary keyword in: title (front-loaded, <60 chars), H1, first 100 words, at least one H2, URL slug, meta description (<160 chars)
- Quick Answer block (40–60 words, standalone) near the top — targets featured snippets + AI answers
- FAQ section, 3–5 self-contained PAA-style answers (40–80 words each) — **mandatory on BOTH sites**
- Internal links 4–8: sibling article cross-link + live proof pages (/2026/, /photos/) + where natural /sponsors, /vendors, /register
- Greg posts: 2–4 external authoritative citations; ≥1 honest limitation or uncertainty (E-E-A-T); real numbers from the key-numbers bank
- Hero image: a REAL race-day photo from the gallery library (`~/BHC-2026-photos-backup/source/bhc-2026/` locally, or repo `public/photos` manifest) — **never the pre-race AI renders** in site public/; keyword filename, descriptive alt, landscape, ≤1400px, ≤500KB
- **ROTATE hero photo categories** — don't reuse the finish arch every week. Match the category to the topic and vary across the series: course, finish-line, kids-1k (281 photos), festival (217), awards (138), start-line. E.g. photos article → course action; sponsor/vendor article → festival/vendor village; medals article → awards or kids medal moments; ecosystem article → kids/festival
- Hero shortlist already scouted (in `~/BHC-2026-photos-backup/source/bhc-2026/`): `kids-1k/raul-0074.jpg` — dads running hand-in-hand with kids (Father's Day story; ideal Week 6 or 7); `kids-1k/bhc2026-_MG_8447-jdk.jpg` — kids passing the Bronte lighthouse (USED Week 1 BHC); `start-line/727497290_….jpg` — start corral crowd (USED Week 1 Greg); `finish-line/CHR00017.jpg` — finish arch (in repo as `/2026-archive-finish-line.jpg`, unused, available)
- Zero AI-isms (delve, comprehensive, crucial, leverage, seamless, landscape-as-metaphor, "in today's...")
- **Every BHC post ends with a 2027 hook**: June 20 2027 date + CTA to /sponsors, /vendors, or registration interest, whichever fits the post

**Primary keyword targets per week:**
| Wk | Greg-site primary keyword | BHC primary keyword |
|----|--------------------------|---------------------|
| 1 | race archive / why archive race results | bronte harbour classic 2026 photos results |
| 2 | find race photos by bib number (AI photo organization) | find your race photos bib number |
| 3 | race sponsorship benefits / why sponsor a local 5K | sponsor a 5K race Oakville / vendor expo Oakville |
| 4 | QR code race medals | race medal QR code |
| 5 | event website SEO / race website that grows | bronteharbourclassic.com year-round |
| 6 | runner safety ecosystem (sun safety, injury prevention) | staying safe running outside Oakville |
| 7 | first year race results digital marketing | Oakville 5K 2027 registration |

## Per-pair publish checklist

- [ ] Greg-site article written via blog-writer skill → `src/content/blog/[slug]/index.md`, tag `Digital-First Race`, series intro block ("Part N of Building a Digital-First Race")
- [ ] BHC article written → `site/src/content/blog/[slug].md`, tag `Behind the Race`
- [ ] Cross-links added both ways + live proof links verified
- [ ] Both drafts shown to Greg BEFORE any git push
- [ ] `npm run build` passes in each repo
- [ ] Push main → verify live URLs after Vercel deploy (~60s)
- [ ] `./submit-indexnow.sh` run on both sites
- [ ] Status column updated in this file
- [ ] LinkedIn post from Greg-site article (optional, via content-atomizer)

## Mandatory language rules (every article)

- Race name: **Mercedes-Benz Oakville Bronte Harbour Classic 5K** — never shortened on first use
- Venue: **Bronte Heritage Waterfront Park** (never "Bronte Harbour Park")
- Greg & Charles = **Race Co-Directors**
- 2026 was **5K + Kids 1K only**; 10K arrives 2027 (forward-looking mentions only)
- 2026 total = **875 registrations**
- ON shoes: "8 pairs of ON Running performance shoes" — never a dollar value
- Mercedes prize: "weekend experience, conditions apply" — never "win the car"
- Oakville Dads: "all donations collected go to Oakville Dads" — never "proceeds"
- BHC is **Bronte Runners' race**; MB Oakville is title sponsor, not owner
- Kids 1K 8:00 AM, 5K 8:30 AM; course starts WEST on Ontario Street

## Key numbers bank (verified July 8, 2026 — from photos-manifest.json + directory collection)

- 875 registrations, sold-out inaugural race (June 21, 2026, Father's Day)
- 1,843 photos and videos in the live gallery (includes 9 drone video chapters), 92% automatic bib detection
- Photo categories: course 813, finish line 341, kids 1K 281, festival 217, awards 138, start line 53
- 80 mini landing pages live at /2026/ — 21 sponsors + 52 vendors + 7 organizers (every sponsor AND vendor gets one; Civitan duplicate merged Jul 9). Plus /2027/ pages growing as partners sign
- 50+ articles on bronteharbourclassic.com/news/
- Photo hosting migrated Cloudinary → Cloudflare R2 (June 2026), ~$99/mo → $0
- 2027: June 20, 2027 — 5K, 10K (run only), Kids 1K; target ~1,500 participants

> Re-verify photo count before each article: `python3 -c "import json; print(len(json.load(open('10. BronteHarbourClassic.com/site/public/photos/photos-manifest.json'))['photos']))"` (or `items`/list root) and `find "10. BronteHarbourClassic.com/site/src/content/directory/2026" -name "*.md" | wc -l` for landing pages — these numbers grow as new batches are added.
