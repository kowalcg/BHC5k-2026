# Dashboard Handover - December 2025

## 📋 Summary of Recent Work Completed

### ✅ Major Enhancements Added

1. **Enhanced Financial & Sponsorships Tab**
   - Added navigation buttons: View Tasks, Action Plan, References, Email Templates
   - Created comprehensive Action Plan with week-by-week sponsorship guide
   - Added References section with links to partnership packages and MIJ references
   - Created 5 email templates for sponsor outreach (cold, follow-up, warm intro, thank you, urgency)

2. **Enhanced Post-Race & Volunteers Tab**
   - Added navigation buttons: View Tasks, Action Plan, References, Email Templates, Volunteer Roles
   - Created Action Plan with phased approach (Vendor recruitment, Volunteer recruitment, Entertainment, Race day)
   - Added References section with expo specs and volunteer resources
   - Created 5 email templates for vendor and volunteer outreach
   - Added detailed Volunteer Roles breakdown (~50 race + 20-30 additional support)

3. **Updated Financial Information**
   - Current Revenue: CA$1,768.45 (net)
   - Tax Collected: CA$203.45 (shown separately)
   - Registration Revenue: CA$1,565.00
   - Added revenue breakdown section in Financial tab
   - Updated registrations: 41

4. **Updated Volunteer Requirements**
   - Based on Greg Pace recommendations: ~50 volunteers during race course
   - +20-30 additional for pre-race, post-race (event runs until 5 PM), sponsorship activities, marketing
   - Total: 70-80 volunteers needed
   - Event end time: 5:00 PM

5. **Fixed Vendor Email Templates**
   - Single pricing: $250 for 10x10 space (no tables/equipment included)
   - Vendor setup: 5:30 AM (must be finished by 8:00 AM)
   - Event duration: 8:00 AM - 5:00 PM

6. **Corrected Organization Names**
   - Changed all instances of "Oakville Dances" to "Oakville Dads"
   - Updated tasks to indicate pending meeting with Greg & Charles

7. **Added New Sponsorship Tasks**
   - Reach out to shoe manufacturers for sponsorship
   - Discuss partnership with The Running Room
   - Talk with Kellie from VR Pro about partnership
   - Meet with Oakville Dads to finalize partnership (Greg & Charles)

8. **Fixed Links**
   - Updated all meeting document links to use GitHub Pages URLs
   - Fixed Content Creator Tool link to use GitHub Pages URL
   - All links now work from the live dashboard

9. **Completed Tasks**
   - Finalize Sponsorship Package: Marked as completed and ready for distribution

10. **Added Designer Credit**
    - Added "Designed by Greg Kowalczyk | Updated [today's date]" below race date
    - Date updates automatically via JavaScript

11. **Created README.md**
    - Comprehensive project overview
    - Links to dashboard and content creator tool
    - Explanation of dashboard features
    - Project structure documentation

## 🔗 Key URLs

- **Live Dashboard:** https://kowalcg.github.io/BHC5k-2026/
- **Direct Dashboard File:** https://kowalcg.github.io/BHC5k-2026/6.%20bronte-dashboard/BHC5K_PROJECT_DASHBOARD.html
- **Content Creator Tool:** https://kowalcg.github.io/BHC5k-2026/4.%20Tools/bronte-harbour-classic-content-creator-pro-v3.0.html
- **GitHub Repository:** https://github.com/kowalcg/BHC5k-2026

## 📁 Important Files

### Main Dashboard Files
- **Primary Dashboard:** `6. bronte-dashboard/BHC5K_PROJECT_DASHBOARD.html`
- **GitHub Pages Root:** `index.html` (redirects to dashboard file)
- **README:** `README.md` (project documentation)

### Meeting Documents
- **November 5, 2025 Meeting:**
  - Agenda: `2. Meetings/November 5 2025 - Core Team Meeting/MEETING_AGENDA_November_5_2025.html`
  - Minutes: `2. Meetings/November 5 2025 - Core Team Meeting/MEETING_MINUTES_November_5_2025.html`
  - Recording: `2. Meetings/November 5 2025 - Core Team Meeting/MEETING_RECORDING_November_5_2025.html`

## ⚙️ Technical Details

### GitHub Pages Setup
- Dashboard is served from root `index.html` which redirects to the dashboard file
- All links use GitHub Pages URLs (not relative paths) for proper browser access
- Format: `https://kowalcg.github.io/BHC5k-2026/[path]`

### File Update Workflow
When updating the dashboard:
1. Edit `6. bronte-dashboard/BHC5K_PROJECT_DASHBOARD.html`
2. Copy to `index.html`: `cp "6. bronte-dashboard/BHC5K_PROJECT_DASHBOARD.html" "index.html"`
3. Commit and push both files
4. GitHub Pages will update within 1-2 minutes

### JavaScript Functions
- `showTab(tabName, buttonElement)` - Tab switching
- `showSection(sectionId)` - Section card switching (Action Plans, References, etc.)
- `copyToClipboard(text)` - Copy email templates to clipboard
- Auto-updating date for "Last Updated"

## 📊 Current Dashboard State

### Financial Metrics
- **Registrations:** 41
- **Net Revenue:** CA$1,768.45
- **Tax Collected:** CA$203.45
- **Registration Revenue:** CA$1,565.00
- **Revenue Target:** $84,750-89,750

### Volunteer Requirements
- **During Race:** ~50 volunteers
- **Additional Support:** 20-30 volunteers (pre-race, post-race until 5 PM, sponsorship, marketing)
- **Total Needed:** 70-80 volunteers
- **Event End Time:** 5:00 PM

### Vendor Information
- **Booth Pricing:** $250 for 10x10 space (tables/equipment NOT included)
- **Setup Time:** 5:30 AM (must be finished by 8:00 AM)
- **Event Duration:** 8:00 AM - 5:00 PM

## 🎯 Key Decisions Made

1. **Oakville Dads Partnership:** All tasks related to Oakville Dads are marked as "[Pending meeting with Greg & Charles]" - details to be finalized after partnership meeting
2. **Volunteer Count:** Updated based on Greg Pace recommendations (not 50 total, but ~50 during race + additional support)
3. **Vendor Pricing:** Simplified to single $250 price (removed Standard/Premium tiers)
4. **Event Duration:** Extended to 5:00 PM (not 1:00 PM)

## ⚠️ Important Notes

### Pending Items
- Oakville Dads partnership details (waiting for Greg & Charles meeting)
- Volunteer numbers from Oakville Dads (to be determined)
- Several sponsorship outreach tasks (shoe manufacturers, Running Room, VR Pro)

### Known Issues
- None currently - all links working, all updates pushed to GitHub

### Browser Cache
- If changes don't appear immediately, user needs to hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- GitHub Pages can take 1-2 minutes to rebuild after push

## 🔄 How to Continue Work

### Making Updates
1. Always edit `6. bronte-dashboard/BHC5K_PROJECT_DASHBOARD.html` first
2. Test locally if possible (open in browser)
3. Copy to `index.html` for GitHub Pages
4. Commit with descriptive message
5. Push to GitHub
6. Wait 1-2 minutes for GitHub Pages to update

### Adding New Tasks
- Tasks are in `<ul class="task-list">` sections
- Format: `<li class="task-item pending">` or `completed`
- Status classes: `status-pending`, `status-in-progress`, `status-completed`

### Adding New Email Templates
- Located in section cards (`.section-card`)
- Use `copyToClipboard()` function for copy buttons
- Format templates in monospace font for readability

### Updating Financial Data
- Update in multiple places:
  1. Stats bar at top
  2. Overview tab Financial Overview card
  3. Financial tab info cards
  4. Financial tab revenue breakdown section

## 📝 Recent Commit History

Latest commits (as of December 2025):
- Mark 'Finalize Sponsorship Package' as completed
- Fix Content Creator Tool link
- Fix November 5 meeting links
- Add sponsorship partnership tasks
- Update Oakville Dads references
- Fix vendor email templates
- Add action plans and templates to Financial & Post-Race tabs
- Update revenue and registration counts
- Add designer credit and auto-updating date

## 🚀 Next Steps (Suggestions)

1. **Monitor Registration Numbers** - Update dashboard as registrations increase
2. **Track Sponsorship Progress** - Update tasks as sponsors are secured
3. **Update Volunteer Counts** - As volunteers are recruited
4. **Add Meeting Documents** - For future meetings (follow same format as November 5)
5. **Update Task Statuses** - Mark tasks as completed as work progresses

## 📞 Key Contacts

- **Project Manager:** Greg Kowalczyk
- **Project Coordinator:** Yasimin Bleik
- **Financial Management:** Judi Meston & Jocelyn
- **Sponsorship Sales:** Greg Kowalczyk & Charles Sathmary
- **Post-Race & Volunteers:** Adriana

---

**Last Updated:** December 2025
**Dashboard Version:** Current with all enhancements
**Status:** All systems operational ✅

