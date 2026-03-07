# PRD: BronteHarbourClassic.com Official Website

## Introduction

Build the official website for the Bronte Harbour Classic 5K & Kids 1K race + Father's Day Festival at **bronteharbourclassic.com**. The current event page lives as a subpage on TapeGeeks' Shopify store, which dilutes brand identity, limits SEO control, and lacks social media integration. The new site will be the canonical "source of truth" for the event -- purpose-built with Astro 5, optimized for SEO + LLM discoverability, and designed to convert visitors into registrants, volunteers, sponsors, and vendors.

**Tech Stack:** Astro 5 (SSG/hybrid), Tailwind CSS 4, TypeScript
**Colors:** White (#FFFFFF), Black (#111111), Red (#E10600) -- Bronte Runners brand colors
**Domain:** bronteharbourclassic.com
**Hosting:** Vercel (free tier, edge CDN, automatic deployments)
**Registration:** Race Roster (external -- outbound CTAs with UTM tracking)

## Goals

- Establish bronteharbourclassic.com as the single canonical source for event information
- Drive 5K and Kids 1K registrations via clear CTAs to Race Roster (with UTM tracking)
- Showcase sponsors with proper tier hierarchy and clickable logos
- Convert sponsor, vendor, and volunteer leads through on-site forms
- Achieve Core Web Vitals "green" across all pages (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- Implement JSON-LD structured data (Event, Offer, FAQPage, Organization) for rich search results
- Integrate social media feeds (Instagram/Facebook) with auto-updating content display
- Build mobile-first, WCAG 2.1 AA accessible design
- Support LLM discoverability (OAI-SearchBot allowed, structured facts for AI summarization)

## Sitemap & Information Architecture

```
/ (Home / 2026 Landing)
/races/5k/
/races/kids-1k/
/festival/
/festival/schedule/
/course-map/
/sponsors/
/vendors/
/volunteer/
/faq/
/news/ (blog listing)
/news/[slug]/ (blog post)
/contact/
/media-kit/
```

## Design System

### Colors
- **Primary Red:** #E10600 (CTAs, accent, energy)
- **Black:** #111111 (text, headers, navigation)
- **White:** #FFFFFF (backgrounds, cards)
- **Light Gray:** #F5F5F5 (section alternating backgrounds)
- **Dark Gray:** #333333 (body text)
- **Success Green:** #22C55E (confirmation states)

### Typography
- **Headings:** Inter (bold, tight tracking) or system font stack
- **Body:** Inter (regular) or system font stack
- **Monospace:** For countdown timer digits

### Components
- Sticky "Register Now" bar (bottom on mobile, top on desktop)
- Countdown timer to race day (June 21, 2026)
- Sponsor logo grid (tiered: Founding > Gold > Silver > Bronze)
- Pricing tier cards with dynamic "current tier" highlighting
- FAQ accordion with smooth animations
- Social media feed embed (Instagram grid)
- Newsletter capture (email input + submit)
- "Event Facts" at-a-glance component (date, time, location, distances)
- Trust badges ("Town of Oakville Approved", "Professionally Chip-Timed")

## User Stories

### US-001: Astro 5 Project Scaffolding
**Description:** As a developer, I need the Astro 5 project initialized with Tailwind CSS 4, TypeScript, and core configuration so all subsequent pages can be built on a solid foundation.

**Acceptance Criteria:**
- [ ] Astro 5 project created with `npm create astro@latest`
- [ ] Tailwind CSS 4 integrated via `@astrojs/tailwind`
- [ ] TypeScript configured (strict mode)
- [ ] `astro.config.mjs` configured with: site URL (https://www.bronteharbourclassic.com), sitemap integration, image optimization
- [ ] Vercel adapter installed for hybrid rendering
- [ ] Project structure: `src/layouts/`, `src/components/`, `src/pages/`, `src/content/`, `src/assets/`, `src/styles/`
- [ ] Global CSS with Bronte color palette variables (Red #E10600, Black #111111, White #FFFFFF, Light Gray #F5F5F5)
- [ ] `public/robots.txt` with OAI-SearchBot allowed, GPTBot disallowed, sitemap reference
- [ ] `public/favicon.ico` placeholder
- [ ] Dev server runs without errors
- [ ] Typecheck passes

### US-002: Base Layout + Navigation Component
**Description:** As a visitor, I want consistent navigation across all pages so I can easily find race info, register, and explore the festival.

**Acceptance Criteria:**
- [ ] `BaseLayout.astro` with HTML lang="en-CA", meta viewport, theme-color (#E10600)
- [ ] Responsive navigation: logo (text "BHC" placeholder) + links: Home, Races, Festival, Course Map, Sponsors, Volunteer, FAQ, Contact
- [ ] Mobile hamburger menu with slide-out drawer
- [ ] "Register Now" button in nav (red, prominent) linking to Race Roster with UTM params
- [ ] Navigation is keyboard-accessible (tab, enter, escape to close mobile menu)
- [ ] Skip-to-main-content link for accessibility
- [ ] Active page indicator on current nav item
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Footer Component
**Description:** As a visitor, I want a footer with contact info, social links, and sponsor logos so I can connect with the event organizers.

**Acceptance Criteria:**
- [ ] Footer includes: event name, date, location one-liner
- [ ] Contact email: info@bronteharbourclassic.com
- [ ] Social media icon links: Instagram, Facebook, Strava (open in new tab with rel="noopener noreferrer")
- [ ] "Organized by" section with organizer logos/names (TapeGeeks, GearTOP, Pace Performance, Bronte Runners)
- [ ] Small sponsor logo strip (founding sponsors)
- [ ] Copyright line with current year
- [ ] Responsive layout (stacks on mobile)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Home Page Hero Section
**Description:** As a visitor landing on the homepage, I want an impactful hero section that immediately communicates what the event is and how to register.

**Acceptance Criteria:**
- [ ] Full-width hero with background image placeholder (aerial Bronte Harbour)
- [ ] Overlay with event name: "Bronte Harbour Classic 2026"
- [ ] Subtitle: "5K Race + Kids 1K + Father's Day Waterfront Festival"
- [ ] Date/location line: "Sunday, June 21, 2026 | 8:00 AM | Bronte Harbour Park, Oakville"
- [ ] Trust badges row: "Town of Oakville Approved" + "Professionally Chip-Timed" + "Inaugural Event"
- [ ] Two CTA buttons: "Register for 5K" (primary red) + "Kids 1K Fun Run" (secondary outline)
- [ ] Countdown timer showing days/hours/minutes/seconds to June 21, 2026 8:00 AM ET
- [ ] Responsive: text stacks, buttons full-width on mobile
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Event Facts Component + JSON-LD Event Schema
**Description:** As a visitor (and as a search engine/LLM), I want a clear "at a glance" facts section with structured data so event details are instantly scannable and machine-readable.

**Acceptance Criteria:**
- [ ] "At a Glance" grid: Date & Time, Location, Distances (5K + Kids 1K), What's Included, Charity Partner, Course Type
- [ ] Each fact has icon + label + value
- [ ] JSON-LD `Event` schema in head with: name, description, startDate, endDate, location (Place + PostalAddress), organizer, offers (5K + Kids 1K with prices), image, eventStatus, eventAttendanceMode
- [ ] JSON-LD `Organization` schema for Bronte Harbour Classic
- [ ] Schema validates in Google Rich Results Test (no critical errors)
- [ ] Component is reusable (used on home page and race detail pages)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: Race Cards Section (Choose Your Distance)
**Description:** As a visitor, I want to see the available races as clear cards so I can choose my distance and register.

**Acceptance Criteria:**
- [ ] "Choose Your Distance" section heading
- [ ] Two race cards side by side (stack on mobile):
  - 5K Race: distance, description ("Chip-timed, flat waterfront course"), who it's for, "What You Get" list (medal, timing, festival access, swag), CTA "Register for 5K"
  - Kids 1K Fun Run: age range (2-12), description, "What You Get" (finisher medal, festival access), CTA "Register for Kids 1K"
- [ ] Cards link to Race Roster with UTM parameters (utm_source=website, utm_medium=race_card, utm_campaign=bhc2026)
- [ ] Visually distinct cards with hover effect
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-007: Dynamic Pricing Tiers Section
**Description:** As a visitor, I want to see all pricing tiers with the current tier highlighted so I understand the cost and urgency to register.

**Acceptance Criteria:**
- [ ] All 6 pricing tiers displayed (Premier through Race Day) with dates and prices
- [ ] Current active tier automatically highlighted based on today's date (JavaScript client-side)
- [ ] Expired tiers shown as grayed out with "EXPIRED" label
- [ ] Savings callout on current tier (e.g., "Save $16.34 vs Last Chance")
- [ ] Kids 1K pricing shown separately below
- [ ] "Register Now" CTA button at bottom of section
- [ ] Pricing data defined in a single config file for easy updates
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-008: Sponsor Showcase Section
**Description:** As a visitor (and as a sponsor), I want to see who sponsors the event with proper tier hierarchy and an invitation to become a sponsor.

**Acceptance Criteria:**
- [ ] Sponsor tiers displayed with clear hierarchy: Founding Sponsor (largest), Official Sponsors (Shoe, Hydration, Awards), Event Organizers, Municipal Partners, Supported Charity
- [ ] Each sponsor: clickable logo (opens sponsor URL in new tab), name, tier label
- [ ] Sponsor data stored in a content collection or config file for easy management
- [ ] "Become a Sponsor" CTA linking to /sponsors/ page
- [ ] Current confirmed sponsors: CIBC (Founding), ON Running (Shoe), Natrilyte (Hydration), Be Active Physio (Awards), TapeGeeks, GearTOP, Pace Performance, Bronte Runners, Town of Oakville, Oakville Dads
- [ ] All sponsor links use target="_blank" rel="noopener noreferrer"
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-009: Community Impact / Charity Section
**Description:** As a visitor, I want to understand the charitable mission so I feel good about participating and donating.

**Acceptance Criteria:**
- [ ] Section highlighting Oakville Dads Community Fund as charity partner
- [ ] Fundraising goal display: "$10,000+ Goal"
- [ ] Quote from Oakville Dads: "Not a dollar leaves Oakville"
- [ ] Stats grid: Families Helped, Local Impact, Volunteer count
- [ ] "Donate Now" CTA linking to OCF donation page (https://ocf.fcsuite.com/erp/donate/create/fund?funit_id=1533)
- [ ] Link opens in new tab with rel="noopener noreferrer"
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-010: FAQ Preview Section + FAQ Page with Schema
**Description:** As a visitor, I want to quickly find answers to common questions without searching, and the FAQ should be SEO-optimized with structured data.

**Acceptance Criteria:**
- [ ] Home page: top 5 FAQ items in accordion format with "View All FAQ" link to /faq/
- [ ] /faq/ page: full FAQ list (8+ questions) in accordion format, organized by category
- [ ] FAQ data stored in content collection for easy editing
- [ ] Questions include: distances, start time, stroller policy, refund/transfer, parking, registration, what's included, age requirements
- [ ] FAQPage JSON-LD schema on /faq/ page that validates in Google Rich Results Test
- [ ] Accordion is keyboard-accessible (arrow keys, enter/space to toggle)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-011: Newsletter Capture Component
**Description:** As an organizer, I want to capture visitor emails across the site so I can send updates and drive registrations.

**Acceptance Criteria:**
- [ ] Email input + "Subscribe" button component
- [ ] Appears on home page (above footer) and can be placed on any page
- [ ] Form submits to a serverless endpoint or external provider (Mailchimp/similar placeholder)
- [ ] Success message shown after submission
- [ ] Honeypot field for spam prevention
- [ ] Basic email validation (client-side)
- [ ] GA4 event: `newsletter_signup` with `source_page` parameter
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-012: Sticky Register CTA Bar
**Description:** As a visitor scrolling the page, I want a persistent registration CTA so I can register at any point without scrolling back up.

**Acceptance Criteria:**
- [ ] Fixed bar at bottom of viewport on mobile, top on desktop (below nav)
- [ ] Shows current price tier and savings message
- [ ] "Register Now" button links to Race Roster with UTM params
- [ ] Appears after scrolling past the hero section (not on initial load)
- [ ] Can be dismissed/closed by the user
- [ ] Does not obscure content or cause CLS
- [ ] GA4 event: `click_register` with `cta_location=sticky_bar`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-013: 5K Race Detail Page (/races/5k/)
**Description:** As a potential runner, I want detailed information about the 5K race so I can decide if it's right for me.

**Acceptance Criteria:**
- [ ] Page at /races/5k/ with proper title, meta description, canonical URL
- [ ] Sections: Race Overview, Who It's For, Course Summary (link to /course-map/), What You Get, Pricing, Awards & Categories, Rules & Guidelines, Register CTA
- [ ] Awards categories listed (overall male/female, age groups)
- [ ] Stroller policy explained
- [ ] Wave/corral information (if applicable)
- [ ] Reuses Event Facts component and Pricing component
- [ ] Breadcrumb navigation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-014: Kids 1K Fun Run Page (/races/kids-1k/)
**Description:** As a parent, I want dedicated information about the Kids 1K so I can register my child with confidence.

**Acceptance Criteria:**
- [ ] Page at /races/kids-1k/ with proper title, meta description
- [ ] Sections: Overview (ages 2-12, non-timed, everyone gets medal), What Kids Get, Safety & Supervision, Pricing, Register CTA
- [ ] Family-friendly tone and messaging
- [ ] Photo placeholder for kids running
- [ ] Breadcrumb navigation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-015: Festival Page (/festival/)
**Description:** As a visitor (runner or non-runner), I want to know what happens at the Father's Day Festival so I can plan my day.

**Acceptance Criteria:**
- [ ] Page at /festival/ with proper title, meta description
- [ ] Sections: Festival Overview (10 AM - 3 PM), Live Music, Vendor Market, Kids Zone (jumping castle, face painting), Beer Garden, Food & Drink
- [ ] "This isn't just a race -- it's a Father's Day celebration" messaging
- [ ] Link to /festival/schedule/ for detailed timeline
- [ ] Link to /vendors/ for vendor information
- [ ] Photo placeholders for festival activities
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-016: Schedule Page (/festival/schedule/)
**Description:** As a participant, I want a minute-by-minute schedule so I know exactly when and where to be.

**Acceptance Criteria:**
- [ ] Page at /festival/schedule/ with race + festival combined timeline
- [ ] Timeline format with times, activities, and locations
- [ ] Key times: 7:00 AM (road closure), 8:00 AM (5K + Kids 1K start), 9:15 AM (awards), 10:00 AM (festival opens, live music), 3:00 PM (festival ends)
- [ ] "Last Updated" timestamp at bottom
- [ ] Mobile-friendly vertical timeline layout
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-017: Course Map Page (/course-map/)
**Description:** As a runner, I want to see the race course with a map so I can visualize the route and plan logistics.

**Acceptance Criteria:**
- [ ] Page at /course-map/ with embedded map (Google Maps or Mapbox static image with link)
- [ ] Route description: flat, out-and-back, Lakeshore Rd & waterfront, stroller-friendly
- [ ] Start/Finish location marked
- [ ] Aid station location (2.5K mark) noted
- [ ] Text-based route description as accessible alternative to map
- [ ] Parking & Transit section with Google Maps link to Bronte Harbour Park
- [ ] Road closure information
- [ ] GPX/PDF download links (placeholder)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-018: Sponsors Page (/sponsors/) + Inquiry Form
**Description:** As a potential sponsor, I want to see sponsorship packages and submit an inquiry so I can partner with the event.

**Acceptance Criteria:**
- [ ] Page at /sponsors/ with proper title, meta description
- [ ] Current sponsors displayed with tier hierarchy (reuses sponsor showcase component)
- [ ] Sponsorship tiers table: Title ($8,000), Gold ($5,000), Silver ($2,500), Bronze ($850), Vendor Booth ($250), Swag Bag Insert ($200)
- [ ] Benefits listed per tier (visibility, booth, ceremony mention, social media, etc.)
- [ ] Sponsor inquiry form: company name, contact name, email, phone, tier interest (dropdown), message
- [ ] Form has honeypot spam protection and basic validation
- [ ] Success confirmation message on submit
- [ ] GA4 events: `click_sponsor_inquiry`, `submit_sponsor_form`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-019: Vendors & Expo Page (/vendors/)
**Description:** As a potential vendor, I want to know booth options and requirements so I can apply for a spot.

**Acceptance Criteria:**
- [ ] Page at /vendors/ with proper title, meta description
- [ ] Sections: Vendor Expo Overview (50-70 booths), Booth Details ($250, 10x10, vendor-supplied tent), Setup & Hours (5:30 AM setup, 10 AM-3 PM festival), Requirements (insurance, food permits if applicable), Who Should Apply
- [ ] Vendor application form: business name, contact, email, phone, business type (dropdown), product/service description, food vendor (yes/no), message
- [ ] Form has honeypot spam protection
- [ ] GA4 event: `submit_vendor_form`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-020: Volunteer Page (/volunteer/)
**Description:** As a community member, I want to sign up as a volunteer and know what roles are available.

**Acceptance Criteria:**
- [ ] Page at /volunteer/ with proper title, meta description
- [ ] Sections: Why Volunteer, Volunteer Roles (water station, course marshal, finish line, kids zone, setup/teardown, registration), Shifts & Times, Volunteer Perks (t-shirt, meals, recognition)
- [ ] Volunteer signup form: name, email, phone, role preference (multi-select), shift preference, experience/notes
- [ ] Oakville Dads partnership mentioned (primary volunteer source)
- [ ] Form has honeypot spam protection
- [ ] GA4 event: `submit_volunteer_form`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-021: Contact Page (/contact/)
**Description:** As a visitor, I want to contact the organizers with questions or partnership inquiries.

**Acceptance Criteria:**
- [ ] Page at /contact/ with proper title, meta description
- [ ] Contact form: name, email, subject (dropdown: General, Sponsorship, Vendor, Volunteer, Media, Other), message
- [ ] Contact info displayed: info@bronteharbourclassic.com
- [ ] Social media links
- [ ] Form has honeypot spam protection
- [ ] Success confirmation message
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-022: Blog/News Page (/news/) + Content Collection
**Description:** As an organizer, I want a blog section to publish event updates, training tips, and community stories for SEO and engagement.

**Acceptance Criteria:**
- [ ] Astro content collection configured for blog posts (title, date, author, excerpt, tags, image)
- [ ] /news/ listing page showing posts in reverse chronological order with title, date, excerpt, read more link
- [ ] /news/[slug]/ dynamic page rendering full blog post content
- [ ] 2-3 placeholder posts created (e.g., "Welcome to BHC 2026", "Meet the Team", "Why Run for Oakville Dads")
- [ ] RSS feed at /rss.xml using @astrojs/rss
- [ ] Breadcrumb navigation on post pages
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-023: Social Media Feed Integration
**Description:** As a visitor, I want to see the latest social media posts from the event so I feel the community energy and engagement.

**Acceptance Criteria:**
- [ ] Social media section on home page showing latest Instagram posts
- [ ] Implementation options (in priority order): embedded Instagram feed via official embed, or curated grid of social post images with links
- [ ] Fallback: if embed fails or is blocked, show a styled "Follow us on Instagram" CTA with @bronteharbourclassic handle
- [ ] Hashtag promotion: #BronteHarbourClassic #BHC5K displayed prominently
- [ ] Links to all social platforms: Instagram, Facebook, Strava
- [ ] Does not negatively impact page load performance (lazy-loaded)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-024: Analytics Events + UTM Strategy
**Description:** As an organizer, I want to track visitor behavior and registration funnel so I can measure marketing effectiveness.

**Acceptance Criteria:**
- [ ] GA4 script integrated (configurable via environment variable)
- [ ] All outbound Race Roster links include UTM parameters: utm_source=website, utm_medium=[location], utm_campaign=bhc2026
- [ ] GA4 events implemented: click_register, outbound_raceroster, click_sponsor_inquiry, submit_sponsor_form, submit_vendor_form, submit_volunteer_form, newsletter_signup, open_map, share_social
- [ ] Each event includes relevant parameters (cta_location, race_type, page_type)
- [ ] Outbound click tracking on all external links
- [ ] Typecheck passes

### US-025: SEO Meta Tags + Open Graph + Sitemap
**Description:** As an organizer, I want proper SEO across all pages so the site ranks well and shares beautifully on social media.

**Acceptance Criteria:**
- [ ] BaseLayout includes configurable: `<title>`, meta description, canonical URL, Open Graph (og:title, og:description, og:image, og:type, og:url), Twitter Card (summary_large_image)
- [ ] Each page passes unique title and description
- [ ] Default OG image is Bronte Harbour aerial photo
- [ ] Sitemap auto-generated via @astrojs/sitemap at /sitemap-index.xml
- [ ] HTML lang="en-CA" on all pages
- [ ] Geo meta tags (geo.region=CA-ON, geo.placename=Oakville)
- [ ] Typecheck passes

### US-026: Media Kit Page (/media-kit/)
**Description:** As a journalist or media partner, I want downloadable press assets so I can cover the event.

**Acceptance Criteria:**
- [ ] Page at /media-kit/ with proper title, meta description
- [ ] Sections: Event Summary (copy-ready paragraph), Key Facts, Leadership Team (Greg Kowalczyk, Charles Sathmary, Greg Pace with bios/credentials), Downloadable Assets (logo, photos -- placeholder links)
- [ ] Press contact: info@bronteharbourclassic.com
- [ ] Charles Sathmary's elite credentials highlighted (13:32/5K, 2:13 marathon, sub-4 mile)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: All pages render as static HTML via Astro SSG for maximum performance
- FR-2: Forms use serverless endpoint (Vercel serverless function) or external form handler with spam protection
- FR-3: All external links open in new tab with `target="_blank" rel="noopener noreferrer"`
- FR-4: All Race Roster links include UTM tracking parameters
- FR-5: Pricing tier highlighting updates automatically based on current date (client-side JS)
- FR-6: Countdown timer updates in real-time (client-side JS, Astro island)
- FR-7: Navigation is fully keyboard-accessible and screen-reader friendly
- FR-8: Images use Astro's built-in image optimization pipeline (stored in src/assets/)
- FR-9: Social media embeds lazy-load to avoid blocking initial paint
- FR-10: Site deploys automatically from GitHub to Vercel on push to main
- FR-11: All pages include breadcrumb navigation (except home)
- FR-12: Content collections used for: blog posts, FAQ items, sponsors, team members
- FR-13: Color scheme strictly limited to: Red (#E10600), Black (#111111), White (#FFFFFF), Light Gray (#F5F5F5)

## Non-Goals (Out of Scope for MVP)

- No on-site registration processing (Race Roster handles all payments)
- No user accounts or login system
- No real-time Race Roster API integration (manual content updates are fine for year 1)
- No multi-language support (English only for MVP)
- No e-commerce or merchandise sales
- No live results page (post-race results are v2)
- No CMS backend (content managed via markdown/code for MVP)
- No animated page transitions or complex motion design
- No dark mode
- No "10K Coming 2027" interest capture page (v2)

## Design Considerations

- **Mobile-first:** Design for 375px width first, then scale up
- **Hero imagery:** Use high-quality Bronte Harbour aerial/waterfront photos (to be provided)
- **Typography:** System font stack for performance, or Inter via Google Fonts if visual polish is priority
- **Whitespace:** Generous padding between sections (80-120px vertical)
- **Cards:** Rounded corners (8px), subtle shadows, hover states
- **CTAs:** Red (#E10600) buttons with white text, rounded, prominent
- **Inspiration sites:** TCS Toronto Waterfront Marathon (clean above-fold), Run Ottawa (dual CTA pattern), Tough Mudder (What You Get section), Rock 'n' Roll Running Series (race + entertainment positioning)

## Technical Considerations

- **Astro 5** with static output mode (SSG) as default; hybrid only for form endpoints
- **Tailwind CSS 4** for utility-first styling
- **Astro Islands** for interactive components: countdown timer, pricing highlighter, mobile menu, FAQ accordion
- **Content Collections** for structured data: blog posts (markdown), FAQ items, sponsors, team bios
- **@astrojs/sitemap** for automatic sitemap generation
- **@astrojs/rss** for blog RSS feed
- **Vercel** for hosting with automatic GitHub deployments
- **Form handling:** Vercel serverless functions or hosted form provider (Formspree/similar)
- **Images:** Stored in `src/assets/` for Astro optimization; `public/` only for favicons/robots.txt
- **No heavy frameworks:** Vanilla JS for islands; no React/Vue unless absolutely needed

## Success Metrics

- Registration CTR: > 5% of sessions click "Register"
- Sponsor leads: > 3 form submissions per month
- Vendor leads: > 5 form submissions per month
- Volunteer signups: > 10 per month (April-June)
- Core Web Vitals: All pages "Good" in PageSpeed Insights
- Organic search: Top 3 for "Bronte Harbour Classic" within 2 weeks
- Page load: < 1.5s on 4G mobile connection
- Accessibility: Passes axe-core automated checks with 0 critical issues

## Open Questions

1. Do we have high-resolution photos beyond the 2 currently used? (aerial harbour, festival scene)
2. Instagram handle confirmed as @bronteharbourclassic?
3. Should we embed Race Roster registration widget or keep as outbound link?
4. Do we want a Strava Club set up and linked?
5. Google Analytics 4 property ID -- does one exist already or need new?
6. Form submissions -- email notification to which addresses?
7. Blog posts -- who will write content? Can we repurpose content calendar posts?
8. Domain DNS -- is bronteharbourclassic.com already pointing somewhere or available for Vercel?
