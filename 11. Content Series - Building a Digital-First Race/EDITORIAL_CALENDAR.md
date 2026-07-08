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
| 2 | Jul 15, 2026 | How AI Organized 1,800+ Race Photos (and Drone Videos) | How to Find Your Race Photos (Search by Bib Number) | /photos/ | 📝 Planned |
| 3 | Jul 22, 2026 | Why Every Sponsor and Vendor Gets a Permanent Web Presence | Why Every Sponsor and Vendor Has Their Own Page | /2026/[slug] pages | 📝 Planned |
| 4 | Jul 29, 2026 | Why Our Medals Have QR Codes (When No One Else's Do) | Scan Your Medal: What the QR Code Unlocks | /2026/ hub | 📝 Planned |
| 5 | Aug 5, 2026 | A Race Website That Grows Instead of Starting Over | Everything on BronteHarbourClassic.com (and Why It Stays Up All Year) | site-wide | 📝 Planned |
| 6 | Aug 12, 2026 | A Race Is Just the Start: Building a Health & Safety Ecosystem | Beyond Race Day: Staying Safe & Injury-Free Outside | tapegeeks.com, getsunup.app, sportsclinicfinder.com, runmatepro.com | 📝 Planned |
| 7 | Aug 19, 2026 | What Digital-First Delivered: Year One by the Numbers | Thank You, 2026 — Here's What's Coming in 2027 | /2026/, 2027 teaser | 📝 Planned |

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
- 81 mini landing pages live at /2026/ — 21 sponsors + 53 vendors + 7 organizers (every sponsor AND vendor gets one)
- 50+ articles on bronteharbourclassic.com/news/
- Photo hosting migrated Cloudinary → Cloudflare R2 (June 2026), ~$99/mo → $0
- 2027: June 20, 2027 — 5K, 10K (run only), Kids 1K; target ~1,500 participants

> Re-verify photo count before each article: `python3 -c "import json; print(len(json.load(open('10. BronteHarbourClassic.com/site/public/photos/photos-manifest.json'))['photos']))"` (or `items`/list root) and `find "10. BronteHarbourClassic.com/site/src/content/directory/2026" -name "*.md" | wc -l` for landing pages — these numbers grow as new batches are added.
