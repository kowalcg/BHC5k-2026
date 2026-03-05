#!/usr/bin/env python3
"""Convert Markdown files to PDF using markdown and reportlab"""

import sys
import os
import glob
import markdown
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, ListFlowable, ListItem
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from html.parser import HTMLParser
from io import StringIO

class HTMLToParagraph(HTMLParser):
    """Convert HTML to ReportLab flowables"""

    def __init__(self, styles):
        super().__init__()
        self.styles = styles
        self.flowables = []
        self.current_text = []
        self.list_items = []
        self.in_list = False
        self.list_type = None
        self.in_heading = False
        self.heading_level = 0
        self.in_paragraph = False
        self.in_code = False
        self.in_bold = False
        self.in_italic = False
        # Table state
        self.in_table = False
        self.table_data = []
        self.current_row = []
        self.in_cell = False
        self.is_header_row = False

    def handle_starttag(self, tag, attrs):
        if self.in_table and tag not in ['table', 'thead', 'tbody', 'tr', 'th', 'td', 'strong', 'b', 'em', 'i', 'br']:
            return
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.flush_text()
            self.in_heading = True
            self.heading_level = int(tag[1])
        elif tag == 'p':
            self.flush_text()
            self.in_paragraph = True
        elif tag in ['ul', 'ol']:
            self.flush_text()
            self.in_list = True
            self.list_type = tag
            self.list_items = []
        elif tag == 'li':
            if self.current_text:
                self.current_text.append('<br/>')
        elif tag == 'br':
            self.current_text.append('<br/>')
        elif tag == 'strong' or tag == 'b':
            self.current_text.append('<b>')
            self.in_bold = True
        elif tag == 'em' or tag == 'i':
            self.current_text.append('<i>')
            self.in_italic = True
        elif tag == 'code':
            self.in_code = True
            self.current_text.append('<font name="Courier">')
        elif tag == 'hr':
            self.flush_text()
            self.flowables.append(Spacer(1, 0.2*inch))
        elif tag == 'table':
            self.flush_text()
            self.in_table = True
            self.table_data = []
            self.current_row = []
        elif tag == 'thead':
            self.is_header_row = True
        elif tag == 'tbody':
            self.is_header_row = False
        elif tag == 'tr':
            self.current_row = []
        elif tag in ['th', 'td']:
            self.in_cell = True
            self.current_text = []

    def handle_endtag(self, tag):
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            text = ''.join(self.current_text)
            if text.strip():
                style_name = f'Heading{self.heading_level}'
                try:
                    style = self.styles[style_name]
                except:
                    style = self.styles['Heading1']
                self.flowables.append(Paragraph(text, style))
                self.flowables.append(Spacer(1, 0.1*inch))
            self.current_text = []
            self.in_heading = False
        elif tag == 'p':
            text = ''.join(self.current_text)
            if text.strip():
                self.flowables.append(Paragraph(text, self.styles['BodyText']))
                self.flowables.append(Spacer(1, 0.1*inch))
            self.current_text = []
            self.in_paragraph = False
        elif tag == 'li':
            text = ''.join(self.current_text)
            if text.strip():
                self.list_items.append(text)
            self.current_text = []
        elif tag in ['ul', 'ol']:
            if self.list_items:
                for item in self.list_items:
                    bullet = '•' if self.list_type == 'ul' else '1.'
                    self.flowables.append(Paragraph(f"{bullet} {item}", self.styles['BodyText']))
                self.flowables.append(Spacer(1, 0.1*inch))
            self.list_items = []
            self.in_list = False
            self.list_type = None
        elif tag == 'strong' or tag == 'b':
            self.current_text.append('</b>')
            self.in_bold = False
        elif tag == 'em' or tag == 'i':
            self.current_text.append('</i>')
            self.in_italic = False
        elif tag == 'code':
            self.current_text.append('</font>')
            self.in_code = False
        elif tag in ['th', 'td']:
            cell_text = ''.join(self.current_text).strip()
            self.current_row.append(cell_text)
            self.current_text = []
            self.in_cell = False
        elif tag == 'tr':
            if self.current_row:
                self.table_data.append((self.current_row, self.is_header_row))
            self.current_row = []
        elif tag == 'thead':
            self.is_header_row = False
        elif tag == 'table':
            self._build_table()
            self.in_table = False
            self.table_data = []

    def _build_table(self):
        if not self.table_data:
            return
        rows = [row for row, _ in self.table_data]
        header_flags = [is_header for _, is_header in self.table_data]
        num_cols = max(len(r) for r in rows) if rows else 1

        # Available width: page width minus margins (6.5 inches)
        available_width = 6.5 * inch

        # Auto col widths: first col narrow if it looks like a number/index col
        if num_cols == 1:
            col_widths = [available_width]
        elif num_cols == 2:
            col_widths = [available_width * 0.35, available_width * 0.65]
        elif num_cols == 3:
            col_widths = [available_width * 0.35, available_width * 0.4, available_width * 0.25]
        elif num_cols == 4:
            # For action item tables: #, Action, Owner, Deadline
            first_col = rows[0][0] if rows and rows[0] else ''
            if first_col.strip() in ['#', 'No', 'Num', '']:
                col_widths = [0.3*inch, available_width - 0.3*inch - 1.2*inch - 1.1*inch, 1.2*inch, 1.1*inch]
            else:
                col_widths = [available_width * 0.15, available_width * 0.45, available_width * 0.2, available_width * 0.2]
        else:
            col_widths = [available_width / num_cols] * num_cols

        cell_style = ParagraphStyle(
            'TableCell', parent=self.styles['BodyText'],
            fontSize=8, leading=10, wordWrap='LTR'
        )
        header_cell_style = ParagraphStyle(
            'TableHeader', parent=self.styles['BodyText'],
            fontSize=8, leading=10, fontName='Helvetica-Bold', wordWrap='LTR'
        )

        table_rows = []
        for i, (row, is_header) in enumerate(self.table_data):
            # Skip pure separator rows (e.g. |---|---|)
            if all(set(cell.replace('-', '').replace(' ', '')) == set() for cell in row):
                continue
            style = header_cell_style if is_header else cell_style
            padded = row + [''] * (num_cols - len(row))
            table_rows.append([Paragraph(cell, style) for cell in padded])

        if not table_rows:
            return

        tbl = Table(table_rows, colWidths=col_widths, repeatRows=1)
        tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#c8d8e8')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#aaaaaa')),
            ('LINEBELOW', (0, 0), (-1, 0), 1.5, colors.HexColor('#6699bb')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        self.flowables.append(tbl)
        self.flowables.append(Spacer(1, 0.15*inch))

    def handle_data(self, data):
        if data.strip():
            # Escape special XML characters
            data = data.replace('&', '&amp;')
            data = data.replace('<', '&lt;')
            data = data.replace('>', '&gt;')
            self.current_text.append(data)

    def flush_text(self):
        if self.current_text and not self.in_heading and not self.in_paragraph and not self.in_list and not self.in_table:
            text = ''.join(self.current_text)
            if text.strip():
                self.flowables.append(Paragraph(text, self.styles['BodyText']))
                self.flowables.append(Spacer(1, 0.1*inch))
            self.current_text = []

    def get_flowables(self):
        self.flush_text()
        return self.flowables

def convert_md_to_pdf(md_file, pdf_file):
    """Convert a Markdown file to PDF"""

    # Read the markdown file
    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Convert markdown to HTML
    html_content = markdown.markdown(md_content, extensions=['extra', 'nl2br'])

    # Create PDF
    doc = SimpleDocTemplate(pdf_file, pagesize=letter,
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)

    # Get styles
    styles = getSampleStyleSheet()

    # Add custom styles
    styles.add(ParagraphStyle(name='CustomBodyText',
                             parent=styles['BodyText'],
                             fontSize=10,
                             leading=14,
                             alignment=TA_JUSTIFY))

    # Parse HTML and convert to flowables
    parser = HTMLToParagraph(styles)
    parser.feed(html_content)
    flowables = parser.get_flowables()

    # Build PDF
    try:
        doc.build(flowables)
        return True
    except Exception as e:
        print(f"Error building PDF: {e}")
        return False

def main():
    # Get all .md files in current directory
    md_files = glob.glob('*.md')

    if not md_files:
        print("No Markdown files found in current directory")
        return

    print(f"Found {len(md_files)} Markdown file(s) to convert")

    for md_file in md_files:
        pdf_file = md_file.replace('.md', '.pdf')
        print(f"Converting {md_file} -> {pdf_file}...", end=' ')

        try:
            if convert_md_to_pdf(md_file, pdf_file):
                print("✓ Done")
            else:
                print("✗ Failed")
        except Exception as e:
            print(f"✗ Error: {e}")

if __name__ == '__main__':
    main()
