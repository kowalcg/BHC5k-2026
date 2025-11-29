# How to Create PDF Meeting Documents

## Overview
All meeting documents (Agenda, Minutes, Recording Info) should be created as **PDF files** with a consistent, professional format. This ensures a uniform visual appearance across all documents.

## Template Location
**Template File:** `MEETING_DOCUMENT_TEMPLATE.html`

## Step-by-Step Process

### 1. Open the Template
- Open `MEETING_DOCUMENT_TEMPLATE.html` in a web browser (Chrome, Safari, or Edge work best)

### 2. Customize the Content
Edit the HTML file to include your meeting-specific information:

#### Update Header Information:
```html
<span><strong>📅 Date:</strong> November 5, 2025</span>
<span><strong>⏰ Time:</strong> 7:00 PM - 9:00 PM</span>
<span><strong>📍 Location:</strong> ACE Coworking, 132 Trafalgar Rd, Oakville</span>
```

#### Update Completed Tasks:
Edit the list in the "Completed Tasks" section:
```html
<li>Your completed task here</li>
```

#### Update Assignments:
Modify the assignment cards with your committee assignments:
```html
<div class="assignment-card">
    <div class="role">Committee Name</div>
    <div class="person">Person Name</div>
</div>
```

#### Update Attendees:
Modify the attendees section with actual names:
```html
<strong>Core Leadership:</strong>
<div class="names">Name 1, Name 2, Name 3</div>
```

#### Add Document-Specific Content:
- **For Agenda:** Add meeting objectives, discussion topics, action items
- **For Minutes:** Add detailed notes, decisions, action items with owners
- **For Recording Info:** Add recording links, access information, notes

### 3. Save as PDF

#### Method 1: Browser Print to PDF (Recommended)
1. Open the HTML file in your browser
2. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows)
3. Select "Save as PDF" as the destination
4. Click "Save"
5. Name the file: `MEETING_[TYPE]_[DATE].pdf`
   - Example: `MEETING_AGENDA_November_5_2025.pdf`
   - Example: `MEETING_MINUTES_November_5_2025.pdf`
   - Example: `MEETING_RECORDING_November_5_2025.pdf`

#### Method 2: Online HTML to PDF Converter
1. Upload the HTML file to an online converter (like html2pdf.com)
2. Download the generated PDF
3. Save in the appropriate meeting folder

### 4. File Naming Convention
**Format:** `MEETING_[TYPE]_[Date].pdf`

**Types:**
- `AGENDA` - Meeting agenda
- `MINUTES` - Meeting minutes
- `RECORDING` - Recording information

**Date Format:** `Month_Day_Year` (e.g., `November_5_2025`)

**Examples:**
- `MEETING_AGENDA_November_5_2025.pdf`
- `MEETING_MINUTES_November_5_2025.pdf`
- `MEETING_RECORDING_November_5_2025.pdf`

### 5. Save Location
Save PDFs in the appropriate meeting folder:
```
2. Meetings/
  └── [Meeting Name]/
      ├── MEETING_AGENDA_[Date].pdf
      ├── MEETING_MINUTES_[Date].pdf
      └── MEETING_RECORDING_[Date].pdf
```

## Visual Format Guidelines

### Consistent Elements:
- ✅ **Green checkmarks** for completed tasks
- 📋 **Red-bordered cards** for committee assignments
- 🎨 **Red accent color** (#e10600) for headings and important elements
- 📄 **Clean, professional layout** with proper spacing
- 🖨️ **Print-friendly** design (buttons hidden when printing)

### Color Scheme:
- **Primary Red:** #e10600 (headings, borders)
- **Success Green:** #4caf50 (checkmarks, completed items)
- **Text Gray:** #666 (body text)
- **Background Gray:** #f5f5f5 (cards)

## Tips for Best Results

1. **Preview Before Saving:** Always preview the PDF before finalizing
2. **Check Formatting:** Ensure all text is readable and properly formatted
3. **Consistent Naming:** Follow the naming convention exactly
4. **Test Links:** If including links, test them in the PDF
5. **File Size:** Keep PDFs under 5MB for easy sharing

## Updating the Dashboard

After creating PDFs, the dashboard links will automatically work (they're already configured to look for `.pdf` files). No code changes needed!

## Need Help?

If you need to modify the template design or add new sections, refer to the HTML template file and adjust the CSS styles as needed.

