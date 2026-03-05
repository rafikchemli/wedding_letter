import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, FileText, Check, Loader2, Download, Archive, Paperclip, ExternalLink, Link, AlertTriangle, X } from 'lucide-react'
import { Document, Packer, Paragraph, TextRun, AlignmentType, UnderlineType, LineRuleType } from 'docx'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { notifyHost } from '../emailService'
import OrnamentalDivider from './OrnamentalDivider'

/* ── Helpers ── */

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatDateFr(isoOrDate) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate + 'T00:00:00') : isoOrDate
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function formatDateEn(isoOrDate) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate + 'T00:00:00') : isoOrDate
  return `${MONTHS_EN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function letterData(d) {
  const isFemale = d.gender === 'F'
  const titleFr = isFemale ? 'Mme' : 'M.'
  const titleEn = isFemale ? 'Mrs.' : 'Mr.'
  const titleFullFr = isFemale ? 'Madame' : 'Monsieur'
  // Last name for subsequent references (e.g. "M. Belkacem")
  const nameParts = (d.fullName || '').trim().split(/\s+/)
  const lastName = nameParts[nameParts.length - 1] || d.fullName
  const passportLine = d.passportNumber
    ? `, titulaire du passeport n\u00B0\u00A0${d.passportNumber} (${d.issuingCountry || '—'})`
    : ''
  const passportLineEn = d.passportNumber
    ? `, holder of passport no.\u00A0${d.passportNumber} (${d.issuingCountry || '—'})`
    : ''
  const [relationshipFr, relationshipEn] = (d.relationship || '').split('|')
  const ne = isFemale ? 'née' : 'né'
  const ilElle = isFemale ? 'Elle' : 'Il'
  const heShe = isFemale ? 'She' : 'He'
  const herHis = isFemale ? 'her' : 'his'
  const herThem = isFemale ? 'her' : 'him'
  // Detect if visitor stays at host's home (default address contains host name or "308-267")
  const accomAddr = (d.accommodationAddress || '').trim()
  const atHostHome = !accomAddr || accomAddr.includes('308-267') || accomAddr.toLowerCase().includes('chemli')
  return {
    ...d, passportLine, passportLineEn, titleFr, titleEn, titleFullFr, lastName,
    atHostHome, accomAddr,
    relationshipFr: relationshipFr || d.relationship,
    relationshipEn: relationshipEn || relationshipFr || d.relationship,
    today: formatDateFr(new Date()), todayEn: formatDateEn(new Date()),
    ne, ilElle, heShe, herHis, herThem,
  }
}

/* ── DOCX — Government of Canada official letter format ── */

const FONT = 'Times New Roman'
const SZ = 22      // 11pt in half-points (matches reference DOCX)
const SZ_NAME = 26 // 13pt for sender name
const LINE = 240   // single line spacing

function p(runs, opts = {}) {
  const { after = 80, before = 0, indent, justify, ...rest } = opts
  return new Paragraph({
    children: Array.isArray(runs) ? runs : [runs],
    spacing: { after, before, line: LINE, lineRule: LineRuleType.AUTO },
    ...(justify ? { alignment: AlignmentType.BOTH } : {}),
    ...(indent ? { indent: { left: indent } } : {}),
    ...rest,
  })
}

function t(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: opts.size ?? SZ, ...opts })
}

function bold(text, opts = {}) {
  return t(text, { bold: true, ...opts })
}

async function generateDocxBlob(d) {
  const L = letterData(d)

  const children = [
    // Sender header
    p([bold('MADJDI RAFIK CHEMLI', { size: SZ_NAME })], { after: 0 }),
    p([t('308-267 Rachel Est')], { after: 0 }),
    p([t('Montréal (QC), Canada, H2W 1E5')], { after: 0 }),
    p([t('Tél. : 514-793-1185')], { after: 0 }),
    p([t('Courriel : rafik.madjdi.chemli@gmail.com')], { after: 200 }),
    p([t(`Montréal, le ${L.today}`)], { after: 480 }),

    // Addressee
    p([t('À l\u2019attention de l\u2019agent des visas,')], { after: 0 }),
    p([t('Immigration, Réfugiés et Citoyenneté Canada (IRCC)')], { after: 200 }),

    // Subject
    p([bold('Objet\u00A0: '), t(`Lettre d\u2019invitation \u2014 Demande de visa de résident temporaire (visiteur) de ${L.titleFr}\u00A0${L.fullName}`)], { after: 480 }),

    // §1 — Host intro
    p([
      t('Je soussigné, '), bold('Madjdi Rafik Chemli'),
      t(', citoyen canadien depuis 2006, résidant au Canada de façon continue depuis 2014, actuellement employé à titre de '),
      bold('Senior AI Engineer'), t(' chez '), bold('NewMathData'),
      t(', demeurant à l\u2019adresse indiquée ci\u2011dessus, invite par la présente\u00A0:'),
    ], { justify: true }),

    // §2 — Visitor intro
    p([
      t(`${L.titleFr}\u00A0`), bold(L.fullName),
      t(`, ${L.ne} le `), bold(formatDateFr(L.dob)),
      t(`${L.passportLine}, domicilié${L.gender === 'F' ? 'e' : ''} au `),
      bold(L.address),
      t(`, téléphone\u00A0: ${L.phone}.`),
    ], { justify: true }),

    // §3 — Relationship
    p([
      t(`Je précise que ${L.titleFr}\u00A0${L.lastName} est ${L.relationshipFr} et que cette invitation est faite dans le seul but d\u2019une visite temporaire au Canada.`),
    ], { justify: true }),

    // §4 — Visit purpose + dates
    p([
      t(`La présente visite a pour objet de permettre à ${L.titleFr}\u00A0${L.lastName} d\u2019assister à mon mariage, prévu le `),
      bold('19 septembre 2026'),
      t(' à la salle '), bold('L\u2019Éloi, à Montréal (Québec)'),
      t('. La période de séjour prévue est du '),
      bold(formatDateFr(L.arrivalDate)),
      t(' au '),
      bold(formatDateFr(L.departureDate)),
      t(` (${L.duration}). ${L.ilElle} quittera le Canada au plus tard le ${formatDateFr(L.departureDate)}, afin de retourner en ${L.returnCountry}.`),
    ], { justify: true }),

    // §5 — Accommodation + financial
    p([
      t(L.atHostHome
        ? `Pendant la durée de son séjour, ${L.titleFr}\u00A0${L.lastName} logera à mon domicile, à l\u2019adresse indiquée en en\u2011tête. Je confirme que je prendrai en charge l\u2019hébergement pour la totalité du séjour.`
        : `Pendant la durée de son séjour, ${L.titleFr}\u00A0${L.lastName} logera à l\u2019adresse suivante\u00A0: ${L.accomAddr}.`),
      t(` ${L.titleFr}\u00A0${L.lastName} assumera toutes les autres dépenses liées au voyage et au séjour, notamment\u00A0: billets d\u2019avion (aller\u2011retour), transport, repas et dépenses personnelles.`),
    ], { justify: true }),

    // §6 — Ties to home country
    p([
      t(`À ma connaissance, ${L.titleFr}\u00A0${L.lastName} dispose d\u2019attaches solides dans son pays de résidence, notamment\u00A0: `),
      bold(L.returnReason),
      t(`, et ${L.ilElle.toLowerCase()} a l\u2019intention de reprendre ses obligations professionnelles à l\u2019issue de son séjour autorisé.`),
    ], { justify: true }),

    // §7 — Compliance
    p([
      t(`Je comprends que ce séjour est strictement temporaire. ${L.titleFr}\u00A0${L.lastName} s\u2019engage à respecter les conditions applicables aux visiteurs, notamment à ne pas travailler et à ne pas étudier au Canada sans autorisation.`),
    ], { justify: true }),

    // §8 — Contact + Thanks
    p([
      t('Je demeure à votre disposition pour tout renseignement complémentaire. Merci de l\u2019attention portée à la présente.'),
    ], { justify: true, after: 480 }),

    // Closing
    p([t('Veuillez agréer, Madame, Monsieur, l\u2019expression de mes salutations distinguées.')], { after: 200 }),

    // Signature
    p([bold('Madjdi Rafik Chemli')], { after: 0 }),
    p([t('Senior AI Engineer — NewMathData')], { after: 0 }),
    p([t('Citoyen canadien')], { after: 480 }),

    // Enclosures
    p([bold('Pièces jointes (de l\u2019hôte) — copies\u00A0:', { underline: { type: UnderlineType.SINGLE } })], { after: 40 }),
    p([t('Copie preuve de citoyenneté\u00A0: passeport canadien (page d\u2019identité) et/ou certificat')], { after: 20, indent: 360 }),
    p([t('Preuve d\u2019adresse au Canada\u00A0: facture de services publics')], { after: 20, indent: 360 }),
    p([t('Lettre d\u2019emploi / preuves d\u2019emploi')], { after: 20, indent: 360 }),
    p([t('Preuve liée au mariage\u00A0: réservation de salle / confirmation')], { after: 0, indent: 360 }),
  ]

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SZ, color: '000000' },
          paragraph: { spacing: { after: 80, line: LINE, lineRule: LineRuleType.AUTO } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1080, bottom: 720, left: 1200, right: 1200 },
          size: { width: 12240, height: 15840 },
        },
      },
      children,
    }],
  })

  return Packer.toBlob(doc)
}

function generateDocxBlobEn(d) {
  const L = letterData(d)

  const children = [
    // Sender header
    p([bold('MADJDI RAFIK CHEMLI', { size: SZ_NAME })], { after: 0 }),
    p([t('308-267 Rachel Est')], { after: 0 }),
    p([t('Montréal (QC), Canada, H2W 1E5')], { after: 0 }),
    p([t('Phone: 514-793-1185')], { after: 0 }),
    p([t('Email: rafik.madjdi.chemli@gmail.com')], { after: 200 }),
    p([t(`Montréal, ${L.todayEn}`)], { after: 480 }),

    // Addressee
    p([t('To: Visa Officer')], { after: 0 }),
    p([t('Immigration, Refugees and Citizenship Canada (IRCC)')], { after: 200 }),

    // Subject
    p([bold('Subject: '), t(`Letter of Invitation \u2014 Temporary Resident Visa (Visitor) application for ${L.titleEn} ${L.fullName}`)], { after: 480 }),

    // §1 — Host intro
    p([
      t('I, '), bold('Madjdi Rafik Chemli'),
      t(', a Canadian citizen since 2006, residing in Canada continuously since 2014, currently employed as a '),
      bold('Senior AI Engineer'), t(' with '), bold('NewMathData'),
      t(', living at the address indicated above, hereby invite:'),
    ], { justify: true }),

    // §2 — Visitor intro
    p([
      t(`${L.titleEn} `), bold(L.fullName),
      t(', born '), bold(formatDateEn(L.dob)),
      t(`${L.passportLineEn}, residing at `),
      bold(L.address),
      t(`, phone: ${L.phone}.`),
    ], { justify: true }),

    // §3 — Relationship
    p([
      t(`${L.titleEn} ${L.lastName} is ${L.relationshipEn}, and this invitation is issued solely for a temporary visit to Canada.`),
    ], { justify: true }),

    // §4 — Visit purpose + dates
    p([
      t(`The purpose of this visit is for ${L.titleEn} ${L.lastName} to attend my wedding, scheduled for `),
      bold('September 19, 2026'),
      t(' at '), bold('L\u2019Éloi in Montréal, Quebec'),
      t('. The planned stay is from '),
      bold(formatDateEn(L.arrivalDate)),
      t(' to '),
      bold(formatDateEn(L.departureDate)),
      t(` (${L.duration}). ${L.heShe} will depart Canada no later than ${formatDateEn(L.departureDate)} to return to ${L.returnCountry}.`),
    ], { justify: true }),

    // §5 — Accommodation + financial
    p([
      t(L.atHostHome
        ? `During ${L.herHis} stay, ${L.titleEn} ${L.lastName} will stay at my home at the address shown in the header of this letter. I confirm I will provide accommodation for the full duration of the visit.`
        : `During ${L.herHis} stay, ${L.titleEn} ${L.lastName} will stay at the following address: ${L.accomAddr}.`),
      t(` ${L.titleEn} ${L.lastName} will cover all other travel and living expenses, including round-trip airfare, transportation, meals, and personal expenses.`),
    ], { justify: true }),

    // §6 — Ties to home country
    p([
      t(`To the best of my knowledge, ${L.titleEn} ${L.lastName} has strong ties to ${L.herHis} country of residence, including: `),
      bold(L.returnReason),
      t(`, and ${L.heShe.toLowerCase()} intends to resume ${L.herHis} professional obligations upon the end of ${L.herHis} authorized stay.`),
    ], { justify: true }),

    // §7 — Compliance
    p([
      t(`I understand this visit is strictly temporary. ${L.titleEn} ${L.lastName} will comply with visitor conditions, including not working and not studying in Canada without authorization.`),
    ], { justify: true }),

    // §8 — Contact + Thanks
    p([
      t('Please feel free to contact me should you require any further information. Thank you for your consideration.'),
    ], { justify: true, after: 480 }),

    // Closing
    p([t('Sincerely,')], { after: 200 }),

    // Signature
    p([bold('Madjdi Rafik Chemli')], { after: 0 }),
    p([t('Senior AI Engineer — NewMathData')], { after: 0 }),
    p([t('Canadian citizen')], { after: 480 }),

    // Enclosures
    p([bold('Attachments (host) \u2014 copies:', { underline: { type: UnderlineType.SINGLE } })], { after: 40 }),
    p([t('Proof of Canadian status: Canadian passport biodata page and/or citizenship certificate')], { after: 20, indent: 360 }),
    p([t('Proof of Canadian address: utility bill / lease / mortgage statement')], { after: 20, indent: 360 }),
    p([t('Employment confirmation / proof of employment')], { after: 20, indent: 360 }),
    p([t('Wedding-related proof: venue booking / confirmation / invitation')], { after: 0, indent: 360 }),
  ]

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SZ, color: '000000' },
          paragraph: { spacing: { after: 80, line: LINE, lineRule: LineRuleType.AUTO } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1080, bottom: 720, left: 1200, right: 1200 },
          size: { width: 12240, height: 15840 },
        },
      },
      children,
    }],
  })

  return Packer.toBlob(doc)
}

async function downloadDocx(d, lang = 'fr') {
  const L = letterData(d)
  const blob = lang === 'en' ? await generateDocxBlobEn(d) : await generateDocxBlob(d)
  saveAs(blob, `invitation_${L.fullName.replace(/\s+/g, '_')}_${lang.toUpperCase()}.docx`)
}

/* ── Docxtemplater engine ── */

async function downloadDocxTemplate(d, lang = 'fr') {
  const L = letterData(d)
  const templateUrl = `${import.meta.env.BASE_URL}templates/lettre_template_${lang}.docx`
  const res = await fetch(templateUrl)
  if (!res.ok) throw new Error(`Template not found: ${templateUrl}`)
  const buf = await res.arrayBuffer()

  const zip = new PizZip(buf)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{', end: '}' },
  })

  const data = {
    fullName: L.fullName,
    lastName: L.lastName,
    address: L.address,
    phone: L.phone,
    duration: L.duration,
    returnCountry: L.returnCountry,
    returnReason: L.returnReason,
    passportNumber: L.passportNumber || '',
    issuingCountry: L.issuingCountry || '',
    ne: L.ne,
    domiciliee: L.gender === 'F' ? 'domiciliée' : 'domicilié',
  }

  if (lang === 'fr') {
    data.today = L.today
    data.titleFr = L.titleFr
    data.dobFr = formatDateFr(L.dob)
    data.arrivalDateFr = formatDateFr(L.arrivalDate)
    data.departureDateFr = formatDateFr(L.departureDate)
    data.relationshipFr = L.relationshipFr
    data.passportLineFr = L.passportLine
    data.ilElle = L.ilElle
  } else {
    data.todayEn = L.todayEn
    data.titleEn = L.titleEn
    data.dobEn = formatDateEn(L.dob)
    data.arrivalDateEn = formatDateEn(L.arrivalDate)
    data.departureDateEn = formatDateEn(L.departureDate)
    data.relationshipEn = L.relationshipEn
    data.passportLineEn = L.passportLineEn
    data.heShe = L.heShe
    data.herHis = L.herHis
  }

  doc.render(data)

  const out = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  saveAs(out, `invitation_${L.fullName.replace(/\s+/g, '_')}_${lang.toUpperCase()}_template.docx`)
}

/* ── python-docx engine (dev only, calls local Python) ── */

async function downloadDocxPython(d, lang = 'fr') {
  const L = letterData(d)
  const res = await fetch('/api/generate-docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: d, lang }),
  })
  if (!res.ok) throw new Error('python-docx generation failed')
  const blob = await res.blob()
  saveAs(blob, `invitation_${L.fullName.replace(/\s+/g, '_')}_${lang.toUpperCase()}_pydocx.docx`)
}

/* ── Supporting documents ── */

const base = import.meta.env.BASE_URL

const SUPPORTING_DOCS = [
  { label: 'Carte de citoyenneté canadienne', file: 'carte_citoyennete_canadienne.pdf' },
  { label: 'Lettre d\'emploi — NewMathData', file: 'lettre_emploi_NewMathData.pdf' },
  { label: 'Facture d\'électricité (preuve de domicile)', file: 'facture_electricite_domicile.pdf' },
  { label: 'Contrat de la salle de réception (Studio L\'Éloi)', file: 'contrat_salle_reception.pdf' },
]

async function downloadZip(data) {
  const zip = new JSZip()

  // Generate both FR and EN DOCX
  const L = letterData(data)
  const docxBlobFr = await generateDocxBlob(data)
  const docxBlobEn = await generateDocxBlobEn(data)
  const slug = L.fullName.replace(/\s+/g, '_')
  zip.file(`invitation_${slug}_FR.docx`, docxBlobFr)
  zip.file(`invitation_${slug}_EN.docx`, docxBlobEn)

  // Fetch each supporting document
  const results = await Promise.allSettled(
    SUPPORTING_DOCS.map(async (doc) => {
      const res = await fetch(`${base}documents/${doc.file}`)
      if (!res.ok) return null
      const blob = await res.blob()
      zip.file(doc.file, blob)
    })
  )

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, `dossier_visa_${L.fullName.replace(/\s+/g, '_')}.zip`)
}

function LetterDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--border-50)] to-transparent" />
    </div>
  )
}

function StyledLetterPreview({ data }) {
  const d = data
  const L = letterData(d)

  return (
    <div className="space-y-0">
      {/* Sender header */}
      <div className="text-center mb-8">
        <h3 className="font-calligraphy text-3xl text-[var(--text)] mb-2">Madjdi Rafik Chemli</h3>
        <div className="text-xs text-[var(--text-muted)] tracking-wider uppercase space-y-0.5">
          <p>308-267 Rachel Est</p>
          <p>Montréal (QC), Canada, H2W 1E5</p>
          <p>Tél. : 514-793-1185</p>
          <p>Courriel : rafik.madjdi.chemli@gmail.com</p>
          <p className="mt-2">Montréal, le {L.today}</p>
        </div>
      </div>

      <LetterDivider />

      {/* Addressee */}
      <div className="text-sm text-[var(--text-70)] mb-2">
        <p>À l{'\u2019'}attention de l{'\u2019'}agent des visas,</p>
        <p>Immigration, Réfugiés et Citoyenneté Canada (IRCC)</p>
      </div>

      {/* Subject */}
      <div className="bg-[var(--accent-5)] border-l-3 border-[var(--accent)] rounded-r-lg px-4 py-3 mb-6">
        <p className="font-display text-base font-semibold text-[var(--text)]">
          Objet&nbsp;: Lettre d{'\u2019'}invitation — Demande de visa de résident temporaire (visiteur) de {L.titleFr}&nbsp;{d.fullName}
        </p>
      </div>

      {/* Body paragraphs */}
      <div className="space-y-4 text-sm text-[var(--text)] leading-[1.85]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '15px' }}>

        <p>
          Je soussigné, <strong>Madjdi Rafik Chemli</strong>, citoyen canadien depuis 2006, résidant au Canada de façon continue depuis 2014, actuellement employé à titre de <strong>Senior AI Engineer</strong> chez <strong>NewMathData</strong>, demeurant à l{'\u2019'}adresse indiquée ci‑dessus, invite par la présente&nbsp;:
        </p>

        <p>
          {L.titleFr}&nbsp;<strong>{d.fullName}</strong>, {L.ne} le <strong>{formatDateFr(d.dob)}</strong>{L.passportLine}, domicilié{d.gender === 'F' ? 'e' : ''} au <strong>{d.address}</strong>, téléphone&nbsp;: {d.phone}.
        </p>

        <p>
          Je précise que {L.titleFr}&nbsp;{L.lastName} est {L.relationshipFr} et que cette invitation est faite dans le seul but d{'\u2019'}une visite temporaire au Canada.
        </p>

        <p>
          La présente visite a pour objet de permettre à {L.titleFr}&nbsp;{L.lastName} d{'\u2019'}assister à mon mariage, prévu le <strong>19 septembre 2026</strong> à la salle <strong>L{'\u2019'}Éloi, à Montréal (Québec)</strong>. La période de séjour prévue est du <strong>{formatDateFr(d.arrivalDate)}</strong> au <strong>{formatDateFr(d.departureDate)}</strong> ({d.duration}). {L.ilElle} quittera le Canada au plus tard le {formatDateFr(d.departureDate)}, afin de retourner en {d.returnCountry}.
        </p>

        <p>
          {L.atHostHome
            ? <>Pendant la durée de son séjour, {L.titleFr}&nbsp;{L.lastName} logera à mon domicile, à l{'\u2019'}adresse indiquée en en‑tête. Je confirme que je prendrai en charge l{'\u2019'}hébergement pour la totalité du séjour.</>
            : <>Pendant la durée de son séjour, {L.titleFr}&nbsp;{L.lastName} logera à l{'\u2019'}adresse suivante&nbsp;: {L.accomAddr}.</>}
          {' '}{L.titleFr}&nbsp;{L.lastName} assumera toutes les autres dépenses liées au voyage et au séjour, notamment&nbsp;: billets d{'\u2019'}avion (aller‑retour), transport, repas et dépenses personnelles.
        </p>

        <p>
          À ma connaissance, {L.titleFr}&nbsp;{L.lastName} dispose d{'\u2019'}attaches solides dans son pays de résidence, notamment&nbsp;: <strong>{d.returnReason}</strong>, et {L.ilElle.toLowerCase()} a l{'\u2019'}intention de reprendre ses obligations professionnelles à l{'\u2019'}issue de son séjour autorisé.
        </p>

        <p>
          Je comprends que ce séjour est strictement temporaire. {L.titleFr}&nbsp;{L.lastName} s{'\u2019'}engage à respecter les conditions applicables aux visiteurs, notamment à ne pas travailler et à ne pas étudier au Canada sans autorisation.
        </p>

        <p>
          Je demeure à votre disposition pour tout renseignement complémentaire. Merci de l{'\u2019'}attention portée à la présente.
        </p>

        <p>Veuillez agréer, Madame, Monsieur, l{'\u2019'}expression de mes salutations distinguées.</p>

        <LetterDivider />

        {/* Signature */}
        <div className="pt-2">
          <p className="font-calligraphy text-2xl text-[var(--text)]">Madjdi Rafik Chemli</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Senior AI Engineer — NewMathData</p>
          <p className="text-xs text-[var(--text-muted)]">Citoyen canadien</p>
        </div>

        <LetterDivider />

        {/* Enclosures */}
        <div className="text-xs text-[var(--text-muted)]">
          <p className="font-semibold text-[var(--text)] mb-1">Pièces jointes (de l{'\u2019'}hôte) — copies&nbsp;:</p>
          <p>Copie preuve de citoyenneté&nbsp;: passeport canadien (page d{'\u2019'}identité) et/ou certificat</p>
          <p>Preuve d{'\u2019'}adresse au Canada&nbsp;: facture de services publics</p>
          <p>Lettre d{'\u2019'}emploi / preuves d{'\u2019'}emploi</p>
          <p>Preuve liée au mariage&nbsp;: réservation de salle / confirmation</p>
        </div>
      </div>
    </div>
  )
}

function DownloadButton({ onClick, icon: Icon, label, className }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      await onClick()
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={loading}
      whileHover={loading ? {} : { scale: 1.02 }}
      whileTap={loading ? {} : { scale: 0.98 }}
      className={`download-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium
        focus-visible:ring-2 focus-visible:ring-offset-2
        transition-all duration-200 cursor-pointer
        disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {label}
    </motion.button>
  )
}

export default function LetterPreview({ data, onBack, isEntering, onEnterComplete }) {
  const notifiedRef = useRef(false)
  const [engine, setEngine] = useState(import.meta.env.DEV ? 'python' : 'docx') // 'docx' | 'template' | 'python'
  const [confirmLang, setConfirmLang] = useState(null) // null | 'fr' | 'en'

  const triggerDownload = useCallback(async (lang) => {
    handleFirstDownload()
    const fn = engine === 'template' ? downloadDocxTemplate : engine === 'python' ? downloadDocxPython : downloadDocx
    await fn(data, lang)
  }, [engine, data])

  const handleFirstDownload = () => {
    if (!notifiedRef.current) {
      notifiedRef.current = true
      notifyHost(data)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success banner */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: isEntering ? 0 : 0 }}
        className="bg-[var(--accent-10)] border border-[var(--accent-30)] rounded-2xl p-5 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--accent-20)] flex items-center justify-center shrink-0 mt-0.5">
          <Check className="w-4 h-4 text-[var(--text)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text)]">Lettre générée avec succès</p>
          <p className="text-sm text-[var(--accent)] mt-0.5">
            Vous pouvez modifier le document Word librement avant de le soumettre. N'oubliez pas d'y joindre les pièces justificatives ci-dessous.
          </p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: isEntering ? 0.08 : 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 bg-transparent border border-[var(--border-40)] text-[var(--text)] rounded-full
            px-5 py-2.5 text-sm font-medium hover:bg-[var(--border-10)]
            focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
            transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Modifier le formulaire
        </motion.button>
        <div className="flex flex-wrap gap-2">
          <DownloadButton
            onClick={() => setConfirmLang('fr')}
            icon={FileText}
            label="DOCX Français"
            className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent)]"
          />
          <DownloadButton
            onClick={() => setConfirmLang('en')}
            icon={FileText}
            label="DOCX English"
            className="bg-[var(--accent-dark)] text-white hover:bg-[var(--accent-dark-hover)] focus-visible:ring-[var(--accent-dark)]"
          />
        </div>
      </motion.div>

      {/* Dev toggle — engine selector */}
      {import.meta.env.DEV && (
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--surface-alt)] border border-[var(--border-20)] text-xs text-[var(--text-muted)]">
          <span className="font-medium">Engine :</span>
          <button
            onClick={() => setEngine('docx')}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${engine === 'docx' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--border-20)] text-[var(--text)]'}`}
          >
            docx (programmatic)
          </button>
          <button
            onClick={() => setEngine('template')}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${engine === 'template' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--border-20)] text-[var(--text)]'}`}
          >
            docxtemplater
          </button>
          <button
            onClick={() => setEngine('python')}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${engine === 'python' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--border-20)] text-[var(--text)]'}`}
          >
            python-docx
          </button>
        </div>
      )}

      <OrnamentalDivider className="max-w-xs mx-auto" />

      {/* Supporting documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: isEntering ? 0.2 : 0 }}
        className="bg-[var(--surface)] rounded-2xl border border-[var(--border-30)] shadow-sm overflow-hidden"
      >
        <div className="bg-[var(--surface-alt)] border-b border-[var(--border-30)] px-6 py-3.5 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Pièces jointes
          </span>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-[var(--text-muted)] text-pretty">
            Documents justificatifs à joindre avec la lettre d'invitation.
          </p>
          <div className="space-y-2">
            {SUPPORTING_DOCS.map((doc) => (
              <a
                key={doc.file}
                href={`${base}documents/${doc.file}`}
                download
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border-20)]
                  hover:bg-[var(--accent-5)] transition-colors duration-200 group"
              >
                <Download className="w-4 h-4 text-[var(--accent)] shrink-0" />
                <span className="text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200">
                  {doc.label}
                </span>
                <span className="ml-auto text-xs text-[var(--text-muted-60)] uppercase">{doc.file.split('.').pop()}</span>
              </a>
            ))}
          </div>
          <div className="pt-2">
            <DownloadButton
              onClick={() => { handleFirstDownload(); return downloadZip(data) }}
              icon={Archive}
              label="Tout télécharger (.zip)"
              className="bg-[var(--accent-dark)] text-white hover:bg-[var(--accent-dark-hover)] focus-visible:ring-[var(--accent-dark)] w-full justify-center"
            />
          </div>
        </div>
      </motion.div>

      {/* Useful links for visa application */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: isEntering ? 0.28 : 0 }}
        className="bg-[var(--surface)] rounded-2xl border border-[var(--border-30)] shadow-sm overflow-hidden"
      >
        <div className="bg-[var(--surface-alt)] border-b border-[var(--border-30)] px-6 py-3.5 flex items-center gap-2">
          <Link className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Liens utiles
          </span>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-[var(--text-muted)] text-pretty">
            Ressources pour votre demande de visa visiteur au Canada.
          </p>
          <div className="space-y-2">
            <a
              href="https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/apply-visitor-visa.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[var(--border-20)]
                hover:bg-[var(--accent-5)] transition-colors duration-200 group"
            >
              <ExternalLink className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200 block">
                  Demande de visa visiteur — IRCC
                </span>
                <span className="text-xs text-[var(--text-muted-70)]">
                  Guide officiel pour faire une demande de visa de visiteur au Canada
                </span>
              </div>
            </a>
            <a
              href="https://www.vfsglobal.ca/canada/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[var(--border-20)]
                hover:bg-[var(--accent-5)] transition-colors duration-200 group"
            >
              <ExternalLink className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200 block">
                  VFS Global Canada
                </span>
                <span className="text-xs text-[var(--text-muted-70)]">
                  Centre de réception des demandes de visa (prise de rendez-vous)
                </span>
              </div>
            </a>
            <a
              href="https://www.reddit.com/r/CanadaVisitorVisa/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[var(--border-20)]
                hover:bg-[var(--accent-5)] transition-colors duration-200 group"
            >
              <ExternalLink className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200 block">
                  r/CanadaVisitorVisa — Reddit
                </span>
                <span className="text-xs text-[var(--text-muted-70)]">
                  Communauté Reddit pour les demandes de visa visiteur au Canada
                </span>
              </div>
            </a>
            <a
              href="https://www.facebook.com/groups/2386718511610313/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[var(--border-20)]
                hover:bg-[var(--accent-5)] transition-colors duration-200 group"
            >
              <ExternalLink className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-200 block">
                  Visa Canada — Facebook
                </span>
                <span className="text-xs text-[var(--text-muted-70)]">
                  Groupe d{'\u2019'}entraide pour les demandes de visa canadien
                </span>
              </div>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Styled letter preview card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: isEntering ? 0.36 : 0 }}
        onAnimationComplete={() => {
          if (isEntering) onEnterComplete?.()
        }}
        className="animated-border bg-[var(--surface)] rounded-2xl border border-[var(--border-30)] shadow-sm overflow-hidden"
      >
        <div className="bg-[var(--surface-alt)] border-b border-[var(--border-30)] px-6 py-3.5 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Aperçu de la lettre
          </span>
        </div>
        <div className="p-6 sm:p-10">
          <StyledLetterPreview data={data} />
        </div>
      </motion.div>

      {/* Download confirmation modal */}
      <AnimatePresence>
        {confirmLang && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmLang(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--surface)] rounded-2xl border border-[var(--border-30)] shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="px-6 pt-6 pb-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-10)] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[var(--text)]">
                    Vérifiez le document
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed text-pretty">
                    La lettre générée peut contenir des erreurs. Veuillez relire attentivement le document Word et le modifier au besoin avant de le soumettre avec votre demande de visa.
                  </p>
                </div>
              </div>
              <div className="px-6 pb-5 flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmLang(null)}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]
                    rounded-lg hover:bg-[var(--border-10)] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <DownloadButton
                  onClick={async () => { await triggerDownload(confirmLang); setConfirmLang(null) }}
                  icon={Download}
                  label={confirmLang === 'fr' ? 'Télécharger (FR)' : 'Download (EN)'}
                  className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent)] !rounded-lg !shadow-none"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
