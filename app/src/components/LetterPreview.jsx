import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Check, Loader2, Download, Archive, Paperclip, ExternalLink, Link } from 'lucide-react'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
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
  const passportLine = d.passportNumber
    ? `, passeport n\u00B0\u00A0${d.passportNumber} (délivré par ${d.issuingCountry || '—'})`
    : ''
  const passportLineEn = d.passportNumber
    ? `, holding passport no.\u00A0${d.passportNumber} (issued by ${d.issuingCountry || '—'})`
    : ''
  const accomDates =
    d.accommodationDatesStart && d.accommodationDatesEnd
      ? ` (ou du ${formatDateFr(d.accommodationDatesStart)} au ${formatDateFr(d.accommodationDatesEnd)} si différent)`
      : ''
  // relationship value is "fr label|en label" — split for each language
  const [relationshipFr, relationshipEn] = (d.relationship || '').split('|')
  return { ...d, passportLine, passportLineEn, accomDates, relationshipFr: relationshipFr || d.relationship, relationshipEn: relationshipEn || relationshipFr || d.relationship, today: formatDateFr(new Date()), todayEn: formatDateEn(new Date()) }
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
    spacing: { after, before, line: LINE },
    ...(justify ? { alignment: 'both' } : {}),
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
    p([t('Montréal (QC), Canada H2W 1E5')], { after: 0 }),
    p([t('Tél. : 514-793-1185')], { after: 0 }),
    p([t('Courriel : rafik.madjdi.chemli@gmail.com')], { after: 200 }),
    p([t(`Date : ${L.today}`)], { after: 480 }),

    // Addressee + Subject
    p([bold('À : '), t('Immigration, Réfugiés et Citoyenneté Canada (IRCC)')], { after: 0 }),
    p([bold('Objet : '), t(`Lettre d'invitation pour visa visiteur — ${L.fullName}`)], { after: 480 }),

    // Salutation
    p([t('Madame, Monsieur,')], { after: 480 }),

    // §1 — Who I am + who I invite
    p([
      t('Je soussigné, '), bold('Madjdi Rafik Chemli'),
      t(`, invite ${L.relationshipFr}, `),
      bold(L.fullName),
      t(`, né(e) le `), bold(formatDateFr(L.dob)),
      t(`${L.passportLine}, résidant au `), bold(L.address),
      t(', à me rendre visite au Canada.'),
    ], { justify: true }),

    // §2 — My status in Canada
    p([
      t('Je suis '), bold('citoyen canadien'),
      t(', résidant à l\'adresse mentionnée ci-dessus. Je suis citoyen canadien depuis 2006 et je réside de façon permanente au Canada depuis 2014. Je suis actuellement employé comme '),
      bold('Senior AI Engineer'),
      t(' chez '),
      bold('NewMathData'),
      t(', et je suis financièrement stable.'),
    ], { justify: true }),

    // §3 — Purpose of the visit
    p([
      t('Le but de cette visite est d\''),
      bold('assister à mon mariage'),
      t(', prévu le '), bold('19 septembre 2026'),
      t(' à la salle '), bold('L\'Éloi, Montréal, Québec'),
      t('. Le séjour est prévu du '),
      bold(formatDateFr(L.arrivalDate)),
      t(' au '),
      bold(formatDateFr(L.departureDate)),
      t(` (${L.duration}). Durant cette période, ${L.fullName} logera chez moi à mon domicile.`),
    ], { justify: true }),

    // §4 — Financial support
    p([
      t(`Je confirme que je fournirai l'hébergement pendant le séjour. ${L.fullName} assumera les autres frais liés à son voyage (billet d'avion, transport, nourriture).`),
    ], { justify: true }),

    // §5 — Ties to home country
    p([
      t(`${L.fullName} a des attaches solides dans son pays de résidence (${L.returnCountry}), notamment : `),
      bold(L.returnReason),
      t(`. Il/elle retournera en ${L.returnCountry} à la fin de son séjour autorisé.`),
    ], { justify: true }),

    // §6 — Request
    p([
      t('Je vous prie de bien vouloir lui accorder un visa de résident temporaire pour visiter le Canada.'),
    ], { justify: true }),

    // §7 — Contact + Thank you
    p([
      t('Si vous avez besoin de renseignements supplémentaires, n\'hésitez pas à me contacter. Je vous remercie de votre considération.'),
    ], { justify: true, after: 480 }),

    // Signature
    p([t('Cordialement,')], { after: 80 }),
    p([bold('Madjdi Rafik Chemli')], { after: 0 }),
    p([t('Senior AI Engineer — NewMathData')], { after: 0 }),
    p([t('Citoyen canadien')], { after: 480 }),

    // Enclosures
    p([bold('p.j. (pièces jointes) :', { underline: { type: 'single' } })], { after: 40 }),
    p([t('– Copie de la carte de citoyenneté canadienne')], { after: 20, indent: 360 }),
    p([t('– Lettre d\'emploi (NewMathData)')], { after: 20, indent: 360 }),
    p([t('– Facture d\'électricité (confirmation de domicile)')], { after: 20, indent: 360 }),
    p([t('– Contrat de location de la salle de réception (Studio L\'Éloi, Montréal)')], { after: 0, indent: 360 }),
  ]

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SZ, color: '000000' },
          paragraph: { spacing: { after: 80, line: LINE } },
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
    p([t('Montréal (QC), Canada H2W 1E5')], { after: 0 }),
    p([t('Phone: 514-793-1185')], { after: 0 }),
    p([t('Email: rafik.madjdi.chemli@gmail.com')], { after: 200 }),
    p([t(`Date: ${L.todayEn}`)], { after: 480 }),

    // Addressee + Subject
    p([bold('To: '), t('Immigration, Refugees and Citizenship Canada (IRCC)')], { after: 0 }),
    p([bold('Subject: '), t(`Invitation Letter for Visitor Visa — ${L.fullName}`)], { after: 480 }),

    // Salutation
    p([t('Dear Sir/Madam,')], { after: 480 }),

    // §1
    p([
      t(`I am writing to invite ${L.relationshipEn}, `),
      bold(L.fullName),
      t(', born on '), bold(formatDateEn(L.dob)),
      t(`${L.passportLineEn}, currently residing at `), bold(L.address),
      t(', to visit me in Canada.'),
    ], { justify: true }),

    // §2
    p([
      t('I am a '), bold('Canadian citizen'),
      t(', residing at the address mentioned above. I have been a Canadian citizen since 2006 and have been living permanently in Canada since 2014. I am currently employed as a '),
      bold('Senior AI Engineer'),
      t(' at '),
      bold('NewMathData'),
      t(', and I am financially stable.'),
    ], { justify: true }),

    // §3
    p([
      t('The purpose of this visit is to '),
      bold('attend my wedding'),
      t(', scheduled for '), bold('September 19, 2026'),
      t(' at '), bold('Salle L\'Éloi, Montréal, Québec'),
      t('. The visit is planned from '),
      bold(formatDateEn(L.arrivalDate)),
      t(' to '),
      bold(formatDateEn(L.departureDate)),
      t(` (${L.duration}). During this period, ${L.fullName} will stay with me at my home.`),
    ], { justify: true }),

    // §4
    p([
      t(`I confirm that I will provide accommodation during the stay. ${L.fullName} will cover other travel-related expenses (airfare, transportation, food).`),
    ], { justify: true }),

    // §5
    p([
      t(`${L.fullName} has strong ties to their country of residence (${L.returnCountry}), including: `),
      bold(L.returnReason),
      t(`. They will return to ${L.returnCountry} at the end of their authorized stay.`),
    ], { justify: true }),

    // §6
    p([
      t('I kindly request that you grant them a Temporary Resident Visa to visit Canada.'),
    ], { justify: true }),

    // §7 + Thank you
    p([
      t('If you require any additional information, please do not hesitate to contact me. Thank you for your consideration.'),
    ], { justify: true, after: 480 }),

    // Signature
    p([t('Sincerely,')], { after: 80 }),
    p([bold('Madjdi Rafik Chemli')], { after: 0 }),
    p([t('Senior AI Engineer — NewMathData')], { after: 0 }),
    p([t('Canadian Citizen')], { after: 480 }),

    // Enclosures
    p([bold('Encl. (enclosed documents):', { underline: { type: 'single' } })], { after: 40 }),
    p([t('– Copy of Canadian citizenship card')], { after: 20, indent: 360 }),
    p([t('– Employment letter (NewMathData)')], { after: 20, indent: 360 }),
    p([t('– Electricity bill (proof of residence)')], { after: 20, indent: 360 }),
    p([t('– Venue rental contract (Studio L\'Éloi, Montréal)')], { after: 0, indent: 360 }),
  ]

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SZ, color: '000000' },
          paragraph: { spacing: { after: 80, line: LINE } },
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
  const today = formatDateFr(new Date())
  const passportLine = d.passportNumber
    ? `, passeport no ${d.passportNumber} (délivré par ${d.issuingCountry || '—'})`
    : ''
  const accomDates =
    d.accommodationDatesStart && d.accommodationDatesEnd
      ? ` (ou du ${formatDateFr(d.accommodationDatesStart)} au ${formatDateFr(d.accommodationDatesEnd)} si différent)`
      : ''

  return (
    <div className="space-y-0">
      {/* Sender header */}
      <div className="text-center mb-8">
        <h3 className="font-calligraphy text-3xl text-[var(--text)] mb-2">Madjdi Rafik Chemli</h3>
        <div className="text-xs text-[var(--text-muted)] tracking-wider uppercase space-y-0.5">
          <p>308-267 Rachel Est</p>
          <p>Montréal (QC), Canada H2W 1E5</p>
          <p>Tél. : 514-793-1185</p>
          <p>Courriel : rafik.madjdi.chemli@gmail.com</p>
          <p className="mt-2">{today}</p>
        </div>
      </div>

      <LetterDivider />

      {/* Addressee */}
      <div className="text-sm text-[var(--text-70)] mb-6">
        <p>À : Immigration, Réfugiés et Citoyenneté Canada (IRCC)</p>
      </div>

      {/* Subject */}
      <div className="bg-[var(--accent-5)] border-l-3 border-[var(--accent)] rounded-r-lg px-4 py-3 mb-6">
        <p className="font-display text-base font-semibold text-[var(--text)]">
          Objet : Lettre d'invitation pour visa visiteur — {d.fullName}
        </p>
      </div>

      {/* Body paragraphs */}
      <div className="space-y-4 text-sm text-[var(--text)] leading-[1.85]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '15px' }}>
        <p>Madame, Monsieur,</p>

        <p>
          Je soussigné, <strong>Madjdi Rafik Chemli</strong>, invite {d.relationship.split('|')[0]}, <strong>{d.fullName}</strong>, né(e) le {formatDateFr(d.dob)}{passportLine}, résidant au {d.address}, à me rendre visite au Canada.
        </p>

        <p>
          Je suis <strong>citoyen canadien</strong>, résidant à l'adresse mentionnée ci-dessus. Je suis citoyen canadien depuis 2006 et je réside de façon permanente au Canada depuis 2014. Je suis actuellement employé comme <strong>Senior AI Engineer</strong> chez <strong>NewMathData</strong>, et je suis financièrement stable.
        </p>

        <p>
          Le but de cette visite est d'<strong>assister à mon mariage</strong>, prévu le 19 septembre 2026 à la salle L'Éloi, Montréal, Québec. Le séjour est prévu du <strong>{formatDateFr(d.arrivalDate)}</strong> au <strong>{formatDateFr(d.departureDate)}</strong> ({d.duration}). Durant cette période, {d.fullName} logera chez moi à mon domicile.
        </p>

        <p>
          Je confirme que je fournirai l'hébergement pendant le séjour. {d.fullName} assumera les autres frais liés à son voyage (billet d'avion, transport, nourriture).
        </p>

        <p>
          {d.fullName} a des attaches solides dans son pays de résidence ({d.returnCountry}), notamment : {d.returnReason}. Il/elle retournera en {d.returnCountry} à la fin de son séjour autorisé.
        </p>

        <p>
          Je vous prie de bien vouloir lui accorder un visa de résident temporaire pour visiter le Canada.
        </p>

        <p>
          Si vous avez besoin de renseignements supplémentaires, n'hésitez pas à me contacter.
        </p>

        <p>Je vous remercie de votre considération.</p>

        <LetterDivider />

        {/* Signature */}
        <div className="pt-2">
          <p className="text-[var(--text-muted)] italic mb-3">Cordialement,</p>
          <p className="font-calligraphy text-2xl text-[var(--text)]">Madjdi Rafik Chemli</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Senior AI Engineer — NewMathData</p>
          <p className="text-xs text-[var(--text-muted)]">Citoyen canadien</p>
        </div>

        <LetterDivider />

        {/* Enclosures */}
        <div className="text-xs text-[var(--text-muted)]">
          <p className="font-semibold text-[var(--text)] mb-1">p.j. (pièces jointes) :</p>
          <p>– Copie de la carte de citoyenneté canadienne</p>
          <p>– Lettre d'emploi (NewMathData)</p>
          <p>– Facture d'électricité (confirmation de domicile)</p>
          <p>– Contrat de location de la salle de réception (Studio L'Éloi, Montréal)</p>
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
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium
        shadow-md hover:shadow-lg
        focus-visible:ring-2 focus-visible:ring-offset-2
        transition-all duration-200 cursor-pointer
        disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {label}
    </motion.button>
  )
}

export default function LetterPreview({ data, onBack }) {
  const notifiedRef = useRef(false)

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
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
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
        <div className="flex gap-2">
          <DownloadButton
            onClick={() => { handleFirstDownload(); return downloadDocx(data, 'fr') }}
            icon={FileText}
            label="DOCX Français"
            className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent)]"
          />
          <DownloadButton
            onClick={() => { handleFirstDownload(); return downloadDocx(data, 'en') }}
            icon={FileText}
            label="DOCX English"
            className="bg-[var(--accent-dark)] text-white hover:bg-[var(--accent-dark-hover)] focus-visible:ring-[var(--accent-dark)]"
          />
        </div>
      </motion.div>

      <OrnamentalDivider className="max-w-xs mx-auto" />

      {/* Supporting documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
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
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
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
          </div>
        </div>
      </motion.div>

      {/* Styled letter preview card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
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

    </div>
  )
}
