"""
Generate IRCC invitation letter DOCX using python-docx.
Reads JSON from stdin, writes DOCX to stdout.
Usage: echo '{"fullName":"...", ...}' | python generate_letter.py [fr|en]
"""
import sys
import json
from io import BytesIO
from datetime import datetime

from docx import Document
from docx.shared import Pt, Twips, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet',
             'août','septembre','octobre','novembre','décembre']
MONTHS_EN = ['January','February','March','April','May','June','July',
             'August','September','October','November','December']

def fmt_fr(iso):
    d = datetime.fromisoformat(iso)
    return f"{d.day} {MONTHS_FR[d.month-1]} {d.year}"

def fmt_en(iso):
    d = datetime.fromisoformat(iso)
    return f"{MONTHS_EN[d.month-1]} {d.day}, {d.year}"

def add_run(para, text, bold=False, size=Pt(11)):
    r = para.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = size
    r.bold = bold
    # Force Times New Roman on East Asian fallback too
    r._element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman')
    return r

def set_spacing(para, after=Twips(80), before=Twips(0)):
    pf = para.paragraph_format
    pf.space_after = after
    pf.space_before = before
    pf.line_spacing = 1.0  # single spacing (lineRule="auto")

def make_letter(data, lang='fr'):
    doc = Document()

    # Page setup
    section = doc.sections[0]
    section.page_width = Twips(12240)
    section.page_height = Twips(15840)
    section.top_margin = Twips(1080)
    section.bottom_margin = Twips(720)
    section.left_margin = Twips(1200)
    section.right_margin = Twips(1200)

    # Reset default Normal style (python-docx template has space_after=200)
    style = doc.styles['Normal']
    style.font.name = 'Times New Roman'
    style.font.size = Pt(11)
    style.font.color.rgb = None  # inherit (black)
    style.paragraph_format.space_after = Twips(0)
    style.paragraph_format.space_before = Twips(0)
    style.paragraph_format.line_spacing = 1.0

    d = data
    rel_parts = (d.get('relationship') or '').split('|')
    rel_fr = rel_parts[0] if rel_parts else ''
    rel_en = rel_parts[1] if len(rel_parts) > 1 else rel_fr

    passport_fr = f", passeport n\u00b0\u00a0{d['passportNumber']} (délivré par {d.get('issuingCountry','—')})" if d.get('passportNumber') else ''
    passport_en = f", holding passport no.\u00a0{d['passportNumber']} (issued by {d.get('issuingCountry','—')})" if d.get('passportNumber') else ''

    today_fr = fmt_fr(datetime.now().strftime('%Y-%m-%d'))
    today_en = fmt_en(datetime.now().strftime('%Y-%m-%d'))

    dob_fr = fmt_fr(d['dob'])
    dob_en = fmt_en(d['dob'])
    arr_fr = fmt_fr(d['arrivalDate'])
    arr_en = fmt_en(d['arrivalDate'])
    dep_fr = fmt_fr(d['departureDate'])
    dep_en = fmt_en(d['departureDate'])

    TWO_LINES = Twips(480)
    TIGHT = Twips(0)
    BODY = Twips(80)

    if lang == 'fr':
        # ── Header ──
        p = doc.add_paragraph(); add_run(p, 'MADJDI RAFIK CHEMLI', bold=True, size=Pt(13)); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, '308-267 Rachel Est'); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Montréal (QC), Canada, H2W 1E5'); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Tél. : 514-793-1185'); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Courriel : rafik.madjdi.chemli@gmail.com'); set_spacing(p, after=Twips(200))
        p = doc.add_paragraph(); add_run(p, f'Date : {today_fr}'); set_spacing(p, after=TWO_LINES)

        # Addressee + Subject
        p = doc.add_paragraph()
        add_run(p, 'À : ', bold=True); add_run(p, 'Immigration, Réfugiés et Citoyenneté Canada (IRCC)')
        set_spacing(p, after=TIGHT)

        p = doc.add_paragraph()
        add_run(p, 'Objet : ', bold=True); add_run(p, f"Lettre d'invitation pour visa visiteur — {d['fullName']}")
        set_spacing(p, after=TWO_LINES)

        # Salutation
        p = doc.add_paragraph(); add_run(p, 'Madame, Monsieur,'); set_spacing(p, after=TWO_LINES)

        # §1
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, 'Je soussigné, '); add_run(p, 'Madjdi Rafik Chemli', bold=True)
        add_run(p, f', invite {rel_fr}, '); add_run(p, d['fullName'], bold=True)
        add_run(p, ', né(e) le '); add_run(p, dob_fr, bold=True)
        add_run(p, f"{passport_fr}, résidant au "); add_run(p, d['address'], bold=True)
        add_run(p, ', à me rendre visite au Canada.')
        set_spacing(p, after=BODY)

        # §2
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, 'Je suis '); add_run(p, 'citoyen canadien', bold=True)
        add_run(p, ", résidant à l'adresse mentionnée ci-dessus. Je suis citoyen canadien depuis 2006 et je réside de façon permanente au Canada depuis 2014. Je suis actuellement employé comme ")
        add_run(p, 'Senior AI Engineer', bold=True); add_run(p, ' chez ')
        add_run(p, 'NewMathData', bold=True); add_run(p, ', et je suis financièrement stable.')
        set_spacing(p, after=BODY)

        # §3
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, "Le but de cette visite est d'"); add_run(p, 'assister à mon mariage', bold=True)
        add_run(p, ', prévu le '); add_run(p, '19 septembre 2026', bold=True)
        add_run(p, ' à la salle '); add_run(p, "L'Éloi, Montréal, Québec", bold=True)
        add_run(p, '. Le séjour est prévu du '); add_run(p, arr_fr, bold=True)
        add_run(p, ' au '); add_run(p, dep_fr, bold=True)
        add_run(p, f" ({d['duration']}). Durant cette période, {d['fullName']} logera chez moi à mon domicile.")
        set_spacing(p, after=BODY)

        # §4
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, f"Je confirme que je fournirai l'hébergement pendant le séjour. {d['fullName']} assumera les autres frais liés à son voyage (billet d'avion, transport, nourriture).")
        set_spacing(p, after=BODY)

        # §5
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, f"{d['fullName']} a des attaches solides dans son pays de résidence ({d['returnCountry']}), notamment : ")
        add_run(p, d['returnReason'], bold=True)
        add_run(p, f". Il/elle retournera en {d['returnCountry']} à la fin de son séjour autorisé.")
        set_spacing(p, after=BODY)

        # §6
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, 'Je vous prie de bien vouloir lui accorder un visa de résident temporaire pour visiter le Canada.')
        set_spacing(p, after=BODY)

        # §7
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, "Si vous avez besoin de renseignements supplémentaires, n'hésitez pas à me contacter. Je vous remercie de votre considération.")
        set_spacing(p, after=TWO_LINES)

        # Signature
        p = doc.add_paragraph(); add_run(p, 'Cordialement,'); set_spacing(p, after=BODY)
        p = doc.add_paragraph(); add_run(p, 'Madjdi Rafik Chemli', bold=True); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Senior AI Engineer — NewMathData'); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Citoyen canadien'); set_spacing(p, after=TWO_LINES)

        # Enclosures
        p = doc.add_paragraph()
        r = add_run(p, 'p.j. (pièces jointes) :', bold=True); r.underline = True
        set_spacing(p, after=Twips(40))
        for item in [
            'Copie de la carte de citoyenneté canadienne',
            "Lettre d'emploi (NewMathData)",
            "Facture d'électricité (confirmation de domicile)",
            "Contrat de location de la salle de réception (Studio L'Éloi, Montréal)",
        ]:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Twips(360)
            add_run(p, f'– {item}')
            set_spacing(p, after=Twips(20))

    else:  # English
        # ── Header ──
        p = doc.add_paragraph(); add_run(p, 'MADJDI RAFIK CHEMLI', bold=True, size=Pt(13)); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, '308-267 Rachel Est'); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Montréal (QC), Canada, H2W 1E5'); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Phone: 514-793-1185'); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Email: rafik.madjdi.chemli@gmail.com'); set_spacing(p, after=Twips(200))
        p = doc.add_paragraph(); add_run(p, f'Date: {today_en}'); set_spacing(p, after=TWO_LINES)

        p = doc.add_paragraph()
        add_run(p, 'To: ', bold=True); add_run(p, 'Immigration, Refugees and Citizenship Canada (IRCC)')
        set_spacing(p, after=TIGHT)

        p = doc.add_paragraph()
        add_run(p, 'Subject: ', bold=True); add_run(p, f"Invitation Letter for Visitor Visa — {d['fullName']}")
        set_spacing(p, after=TWO_LINES)

        p = doc.add_paragraph(); add_run(p, 'Dear Sir/Madam,'); set_spacing(p, after=TWO_LINES)

        # §1
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, f'I am writing to invite {rel_en}, '); add_run(p, d['fullName'], bold=True)
        add_run(p, ', born on '); add_run(p, dob_en, bold=True)
        add_run(p, f"{passport_en}, currently residing at "); add_run(p, d['address'], bold=True)
        add_run(p, ', to visit me in Canada.')
        set_spacing(p, after=BODY)

        # §2
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, 'I am a '); add_run(p, 'Canadian citizen', bold=True)
        add_run(p, ', residing at the address mentioned above. I have been a Canadian citizen since 2006 and have been living permanently in Canada since 2014. I am currently employed as a ')
        add_run(p, 'Senior AI Engineer', bold=True); add_run(p, ' at ')
        add_run(p, 'NewMathData', bold=True); add_run(p, ', and I am financially stable.')
        set_spacing(p, after=BODY)

        # §3
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, 'The purpose of this visit is to '); add_run(p, 'attend my wedding', bold=True)
        add_run(p, ', scheduled for '); add_run(p, 'September 19, 2026', bold=True)
        add_run(p, ' at '); add_run(p, "Salle L'Éloi, Montréal, Québec", bold=True)
        add_run(p, '. The visit is planned from '); add_run(p, arr_en, bold=True)
        add_run(p, ' to '); add_run(p, dep_en, bold=True)
        add_run(p, f" ({d['duration']}). During this period, {d['fullName']} will stay with me at my home.")
        set_spacing(p, after=BODY)

        # §4
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, f"I confirm that I will provide accommodation during the stay. {d['fullName']} will cover other travel-related expenses (airfare, transportation, food).")
        set_spacing(p, after=BODY)

        # §5
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, f"{d['fullName']} has strong ties to their country of residence ({d['returnCountry']}), including: ")
        add_run(p, d['returnReason'], bold=True)
        add_run(p, f". They will return to {d['returnCountry']} at the end of their authorized stay.")
        set_spacing(p, after=BODY)

        # §6
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, 'I kindly request that you grant them a Temporary Resident Visa to visit Canada.')
        set_spacing(p, after=BODY)

        # §7
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_run(p, 'If you require any additional information, please do not hesitate to contact me. Thank you for your consideration.')
        set_spacing(p, after=TWO_LINES)

        # Signature
        p = doc.add_paragraph(); add_run(p, 'Sincerely,'); set_spacing(p, after=BODY)
        p = doc.add_paragraph(); add_run(p, 'Madjdi Rafik Chemli', bold=True); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Senior AI Engineer — NewMathData'); set_spacing(p, after=TIGHT)
        p = doc.add_paragraph(); add_run(p, 'Canadian Citizen'); set_spacing(p, after=TWO_LINES)

        # Enclosures
        p = doc.add_paragraph()
        r = add_run(p, 'Encl. (enclosed documents):', bold=True); r.underline = True
        set_spacing(p, after=Twips(40))
        for item in [
            'Copy of Canadian citizenship card',
            'Employment letter (NewMathData)',
            'Electricity bill (proof of residence)',
            "Venue rental contract (Studio L'Éloi, Montréal)",
        ]:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Twips(360)
            add_run(p, f'– {item}')
            set_spacing(p, after=Twips(20))

    return doc


if __name__ == '__main__':
    lang = sys.argv[1] if len(sys.argv) > 1 else 'fr'
    data = json.loads(sys.stdin.read())
    doc = make_letter(data, lang)
    buf = BytesIO()
    doc.save(buf)
    sys.stdout.buffer.write(buf.getvalue())
