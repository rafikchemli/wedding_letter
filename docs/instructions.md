# Wedding Invitation Letter Generator

## What to build
A single-page web app hosted on GitHub Pages that generates IRCC invitation letters for wedding guests. Guests fill out a form, preview the letter, and download it as DOCX or PDF.

## Stack
React + Tailwind CSS + Framer Motion + Inter font. Follow design rules in `ui-design.md`.

## Form fields

### 1. Visitor identity
- Full name (as on passport) — required
- Date of birth (YYYY-MM-DD) — required
- Nationality — required
- Full residential address — required
- Phone — required
- Email — required

### 2. Travel details
- Purpose: pre-filled — "Assister au mariage de Madjdi Rafik Chemli le 19 septembre 2026"
- Arrival date (YYYY-MM-DD) — required
- Departure date (YYYY-MM-DD) — required
- Total duration — auto-calculated from dates
- City in Canada: pre-filled — "Montréal (QC)"

### 3. Accommodation
- Address in Canada — pre-filled: "Chez Madjdi Rafik Chemli – 267 Rachel Est, Montréal (QC), Canada H2W 1E5"
- Accommodation dates if different from travel dates — optional

### 4. Return after visit
- Country of return — required
- Main reason for return (1 line) — required

### 5. Passport (optional)
- Passport number — optional
- Issuing country — optional

### 6. Relationship to host
- Relationship (e.g. cousin, friend, other) — required

## Host info (hardcoded)
- Name: Madjdi Rafik Chemli
- DOB: June 21, 1994
- Address: 267 Rachel Est, Montréal (QC), Canada H2W 1E5
- Job: Senior Data Scientist (EC-05)
- Employer: Statistique Canada — CAIRE (Centre of AI Research and Expertise)
- City: Montréal
- Spouse: Sandrine Martelle, born February 3, 1995
- Wedding location: Studio L'Éloi, 6250 Rue Hutchison 5e étage, Montréal, QC H2V 4C5
- Wedding date: September 19, 2026

## Letter template
Use the template in `template.md`. Fill placeholders with form data. Today's date for the letter date.

## Download
- DOCX (use docx library)
- PDF (use jspdf or html2pdf)

## Hosting
Static site on GitHub Pages. No backend.
