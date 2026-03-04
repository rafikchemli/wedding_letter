import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Check, Loader2, Download, Archive, Paperclip, ExternalLink, Link } from 'lucide-react'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

/* ── Helpers ── */

const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

function formatDateFr(isoOrDate) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate + 'T00:00:00') : isoOrDate
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

function letterData(d) {
  const passportLine = d.passportNumber
    ? `, passeport n\u00B0\u00A0${d.passportNumber} (délivré par ${d.issuingCountry || '—'})`
    : ''
  const accomDates =
    d.accommodationDatesStart && d.accommodationDatesEnd
      ? ` (ou du ${formatDateFr(d.accommodationDatesStart)} au ${formatDateFr(d.accommodationDatesEnd)} si différent)`
      : ''
  return { ...d, passportLine, accomDates, today: formatDateFr(new Date()) }
}

/* ── DOCX — Government of Canada official letter format ── */

const FONT = 'Times New Roman'
const BODY = 22  // 11pt in half-points
const SMALL = 20 // 10pt
const HEADER_NAME = 26 // 13pt
const GAP = 200  // ~10pt gap between sections
const TIGHT = 40 // ~2pt within sections

function p(runs, opts = {}) {
  return new Paragraph({
    children: Array.isArray(runs) ? runs : [runs],
    spacing: { after: opts.after ?? GAP, before: opts.before ?? 0, line: 264 },
    ...opts,
  })
}

function t(text, opts = {}) {
  return new TextRun({ text, font: FONT, size: opts.size ?? BODY, ...opts })
}

function bold(text, opts = {}) {
  return t(text, { bold: true, ...opts })
}

async function generateDocxBlob(d) {
  const L = letterData(d)

  const children = [
    // Sender header
    p([bold('MADJDI RAFIK CHEMLI', { size: HEADER_NAME })], { after: TIGHT }),
    p([t('308-267 Rachel Est, Montréal (QC), Canada H2W 1E5', { size: SMALL })], { after: TIGHT }),
    p([t('Tél. : 514-839-7573 — Courriel : rafik.madjdi.chemli@gmail.com', { size: SMALL })], { after: TIGHT }),
    new Paragraph({ thematicBreak: true, spacing: { after: GAP } }),

    // Date
    p([t(`Le ${L.today}`)], { after: GAP }),

    // Addressee
    p([t('Immigration, Réfugiés et Citoyenneté Canada (IRCC)')], { after: GAP }),

    // Subject — bold
    p([bold(`Objet : Lettre d'invitation — Visa visiteur pour ${L.fullName}`)], { after: GAP }),

    // Salutation
    p([t('Madame, Monsieur,')], { after: GAP }),

    // Body
    p([
      t('Je soussigné '), bold('Madjdi Rafik Chemli'),
      t(', né le 21 juin 1994 à Alger, Algérie, citoyen canadien depuis l\'âge de 11 ans, résidant au 308-267 Rachel Est, Montréal (QC), Canada, invite par la présente '),
      bold(L.fullName),
      t(`, né(e) le ${L.dob}, de nationalité ${L.nationality}, résidant au ${L.address}, téléphone ${L.phone}, courriel ${L.email}${L.passportLine}, à venir au Canada pour un séjour temporaire.`),
    ]),

    p([
      bold('Motif du voyage : '),
      t('assister à mon mariage, prévu le 19 septembre 2026 à Montréal, Québec.'),
    ]),

    p([
      bold('Dates prévues du séjour : '),
      t(`du ${formatDateFr(L.arrivalDate)} au ${formatDateFr(L.departureDate)} (durée totale : ${L.duration}).`),
    ]),

    p([
      bold('Hébergement : '),
      t(`${L.fullName} logera chez moi au 308-267 Rachel Est, Montréal (QC), Canada, sans frais pour le visiteur${L.accomDates}.`),
    ]),

    p([
      bold('Dispositions financières : '),
      t(`Je prendrai en charge l'hébergement de ${L.fullName} à mon domicile, sans frais pour le visiteur. ${L.fullName} assumera les autres frais liés à son voyage (billet d'avion, transport, nourriture).`),
    ]),

    p([
      bold('Départ du Canada : '),
      t(`${L.fullName} quittera le Canada au plus tard le ${formatDateFr(L.departureDate)} afin de retourner en ${L.returnCountry}.`),
    ]),

    new Paragraph({ thematicBreak: true, spacing: { after: GAP } }),

    // Host info — compact
    p([bold('Informations de l\'hôte :')], { after: TIGHT }),
    p([t('Conjointe : Sandrine Martelle, née le 3 février 1995', { size: SMALL })], { after: TIGHT }),
    p([t(`Lien avec le visiteur : ${L.relationship}`, { size: SMALL })], { after: TIGHT }),
    p([t(`Poste : Scientifique principal des données (EC-05) — Gouvernement du Canada — Statistique Canada`, { size: SMALL })], { after: GAP }),

    // Confirmation
    p([t(`Je confirme que les informations ci-dessus sont exactes et fournies à l'appui de la demande de visa visiteur de ${L.fullName}.`)]),

    // Signature
    p([t('Cordialement,')], { before: GAP, after: 800 }),
    p([bold('Madjdi Rafik Chemli')], { after: TIGHT }),
    p([t('Scientifique principal des données (EC-05)', { size: SMALL })], { after: TIGHT }),
    p([t('Statistique Canada', { size: SMALL })]),

    // Enclosures
    new Paragraph({ thematicBreak: true, spacing: { before: GAP * 2, after: GAP } }),
    p([bold('p.j.', { size: SMALL }), t(' (pièces jointes) :', { size: SMALL })], { after: TIGHT }),
    p([t('– Copie de la carte de citoyenneté canadienne', { size: SMALL })], { after: TIGHT }),
    p([t('– Preuve d\'emploi', { size: SMALL })], { after: TIGHT }),
    p([t('– Talon de paie récent', { size: SMALL })], { after: TIGHT }),
    p([t('– Facture d\'électricité (confirmation de domicile)', { size: SMALL })], { after: TIGHT }),
    p([t('– Contrat de location de la salle de réception (Studio L\'Éloi, Montréal)', { size: SMALL })]),
  ]

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: BODY, color: '1A1A1A' },
          paragraph: { spacing: { after: GAP, line: 264 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1800, right: 1440 },
          size: { width: 12240, height: 15840 },
        },
      },
      children,
    }],
  })

  return Packer.toBlob(doc)
}

async function downloadDocx(d) {
  const L = letterData(d)
  const blob = await generateDocxBlob(d)
  saveAs(blob, `invitation_${L.fullName.replace(/\s+/g, '_')}.docx`)
}

/* ── Supporting documents ── */

const base = import.meta.env.BASE_URL

const SUPPORTING_DOCS = [
  { label: 'Carte de citoyenneté canadienne', file: 'citoyennete.pdf' },
  { label: 'Facture d\'électricité', file: 'facture_hydro.pdf' },
  { label: 'Contrat de la salle de réception', file: 'contrat_salle.pdf' },
  // { label: 'Preuve d\'emploi', file: 'preuve_emploi.pdf' },
]

async function downloadZip(data) {
  const zip = new JSZip()

  // Generate the DOCX and add it
  const L = letterData(data)
  const docxBlob = await generateDocxBlob(data)
  zip.file(`invitation_${L.fullName.replace(/\s+/g, '_')}.docx`, docxBlob)

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

function OrnamentalDivider({ className = '' }) {
  return (
    <div className={`ornament text-sm font-display italic tracking-wide ${className}`}>
      ✿
    </div>
  )
}

function LetterDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#E8C4B8]/50 to-transparent" />
    </div>
  )
}

function StyledLetterPreview({ data }) {
  const d = data
  const today = new Date().toISOString().split('T')[0]
  const passportLine = d.passportNumber
    ? `, passeport no ${d.passportNumber} (délivré par ${d.issuingCountry || '—'})`
    : ''
  const accomDates =
    d.accommodationDatesStart && d.accommodationDatesEnd
      ? ` (ou du ${d.accommodationDatesStart} au ${d.accommodationDatesEnd} si différent)`
      : ''

  return (
    <div className="space-y-0">
      {/* Sender header */}
      <div className="text-center mb-8">
        <h3 className="font-calligraphy text-3xl text-[#3B4A30] mb-2">Madjdi Rafik Chemli</h3>
        <p className="text-xs text-[#7A6B55] tracking-wider uppercase">
          308-267 Rachel Est, Montréal (QC), Canada H2W 1E5
        </p>
      </div>

      <LetterDivider />

      {/* Date & addressee */}
      <div className="text-sm text-[#3B4A30]/70 space-y-1 mb-6">
        <p>Date : {today}</p>
        <p>À : Immigration, Réfugiés et Citoyenneté Canada (IRCC)</p>
      </div>

      {/* Subject */}
      <div className="bg-[#8B9E7E]/5 border-l-3 border-[#8B9E7E] rounded-r-lg px-4 py-3 mb-6">
        <p className="font-display text-base font-semibold text-[#3B4A30]">
          Objet : Lettre d'invitation — Demande de visa visiteur pour {d.fullName}
        </p>
      </div>

      {/* Body paragraphs */}
      <div className="space-y-4 text-sm text-[#3B4A30] leading-[1.85]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '15px' }}>
        <p>
          Je soussigné Madjdi Rafik Chemli, né le 21 juin 1994 à Alger, Algérie, citoyen canadien depuis l'âge de 11 ans, résidant au 308-267 Rachel Est, Montréal (QC), Canada, invite par la présente <strong className="text-[#3B4A30]">{d.fullName}</strong>, né(e) le {d.dob}, de nationalité {d.nationality}, résidant au {d.address}, téléphone {d.phone}, courriel {d.email}{passportLine}, à venir au Canada pour un séjour temporaire.
        </p>

        <p className="font-medium text-[#8B9E7E]">
          Motif du voyage : assister à mon mariage, prévu le 19 septembre 2026 à Montréal, Québec.
        </p>

        <p>
          Dates prévues du séjour : du <strong>{d.arrivalDate}</strong> au <strong>{d.departureDate}</strong> (durée totale : {d.duration}).
        </p>
        <p>
          Hébergement : {d.fullName} logera chez moi au 308-267 Rachel Est, Montréal (QC), Canada, sans frais pour le visiteur, pendant la durée du séjour{accomDates}.
        </p>

        <p>
          Dispositions financières : je prendrai en charge l'hébergement de {d.fullName} à mon domicile, sans frais pour le visiteur. {d.fullName} assumera les autres frais liés à son voyage (billet d'avion, transport, nourriture).
        </p>

        <p>
          Départ du Canada : {d.fullName} quittera le Canada au plus tard le {d.departureDate} afin de retourner en {d.returnCountry}.
        </p>

        <LetterDivider />

        {/* Host info block */}
        <div className="bg-[#FDF8F4] rounded-xl p-4 border border-[#E8C4B8]/20">
          <p className="font-display font-semibold text-[#3B4A30] mb-2">Informations de l'hôte :</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <span className="text-[#7A6B55]">Conjointe</span>
            <span>Sandrine Martelle, née le 3 février 1995</span>
            <span className="text-[#7A6B55]">Lien</span>
            <span>{d.relationship}</span>
            <span className="text-[#7A6B55]">Poste</span>
            <span>Scientifique principal des données (EC-05)</span>
            <span className="text-[#7A6B55]">Employeur</span>
            <span>Gouvernement du Canada — Statistique Canada</span>
          </div>
        </div>

        <p>
          Je confirme que les informations ci-dessus sont exactes et fournies à l'appui de la demande de visa visiteur de {d.fullName}.
        </p>

        <LetterDivider />

        {/* Signature */}
        <div className="pt-2">
          <p className="text-[#7A6B55] italic mb-3">Cordialement,</p>
          <p className="font-calligraphy text-2xl text-[#3B4A30]">Madjdi Rafik Chemli</p>
        </div>

        <LetterDivider />

        {/* Enclosures */}
        <div className="text-xs text-[#7A6B55]">
          <p className="font-semibold text-[#3B4A30] mb-1">p.j. (pièces jointes) :</p>
          <p>– Copie de la carte de citoyenneté canadienne</p>
          <p>– Preuve d'emploi</p>
          <p>– Talon de paie récent</p>
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
  return (
    <div className="space-y-6">
      {/* Success banner */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-[#8B9E7E]/10 border border-[#8B9E7E]/30 rounded-2xl p-5 flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-[#8B9E7E]/20 flex items-center justify-center shrink-0 mt-0.5">
          <Check className="w-4 h-4 text-[#3B4A30]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#3B4A30]">Lettre générée avec succès</p>
          <p className="text-sm text-[#8B9E7E] mt-0.5">
            Vérifiez l'aperçu ci-dessous puis téléchargez en DOCX ou PDF.
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
          className="inline-flex items-center gap-2 bg-transparent border border-[#E8C4B8]/40 text-[#3B4A30] rounded-full
            px-5 py-2.5 text-sm font-medium hover:bg-[#E8C4B8]/10
            focus-visible:ring-2 focus-visible:ring-[#8B9E7E] focus-visible:ring-offset-2
            transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Modifier le formulaire
        </motion.button>
        <DownloadButton
          onClick={() => downloadDocx(data)}
          icon={FileText}
          label="Télécharger DOCX"
          className="bg-[#8B9E7E] text-white hover:bg-[#7A8E6D] focus-visible:ring-[#8B9E7E]"
        />
      </motion.div>

      <OrnamentalDivider className="max-w-xs mx-auto" />

      {/* Supporting documents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-[#FFFBF7] rounded-2xl border border-[#E8C4B8]/30 shadow-sm overflow-hidden"
      >
        <div className="bg-[#FDF8F4] border-b border-[#E8C4B8]/30 px-6 py-3.5 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-[#7A6B55]" />
          <span className="text-xs font-medium text-[#7A6B55] uppercase tracking-wider">
            Pièces jointes
          </span>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-[#7A6B55] text-pretty">
            Documents justificatifs à joindre avec la lettre d'invitation.
          </p>
          <div className="space-y-2">
            {SUPPORTING_DOCS.map((doc) => (
              <a
                key={doc.file}
                href={`${base}documents/${doc.file}`}
                download
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E8C4B8]/20
                  hover:bg-[#8B9E7E]/5 transition-colors duration-200 group"
              >
                <Download className="w-4 h-4 text-[#8B9E7E] shrink-0" />
                <span className="text-sm text-[#3B4A30] group-hover:text-[#8B9E7E] transition-colors duration-200">
                  {doc.label}
                </span>
                <span className="ml-auto text-xs text-[#7A6B55]/60 uppercase">{doc.file.split('.').pop()}</span>
              </a>
            ))}
          </div>
          <div className="pt-2">
            <DownloadButton
              onClick={() => downloadZip(data)}
              icon={Archive}
              label="Tout télécharger (.zip)"
              className="bg-[#3B4A30] text-white hover:bg-[#2E3B25] focus-visible:ring-[#3B4A30] w-full justify-center"
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
        className="bg-[#FFFBF7] rounded-2xl border border-[#E8C4B8]/30 shadow-sm overflow-hidden"
      >
        <div className="bg-[#FDF8F4] border-b border-[#E8C4B8]/30 px-6 py-3.5 flex items-center gap-2">
          <Link className="w-4 h-4 text-[#7A6B55]" />
          <span className="text-xs font-medium text-[#7A6B55] uppercase tracking-wider">
            Liens utiles
          </span>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-[#7A6B55] text-pretty">
            Ressources pour votre demande de visa visiteur au Canada.
          </p>
          <div className="space-y-2">
            <a
              href="https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/apply-visitor-visa.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#E8C4B8]/20
                hover:bg-[#8B9E7E]/5 transition-colors duration-200 group"
            >
              <ExternalLink className="w-4 h-4 text-[#8B9E7E] shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-[#3B4A30] group-hover:text-[#8B9E7E] transition-colors duration-200 block">
                  Demande de visa visiteur — IRCC
                </span>
                <span className="text-xs text-[#7A6B55]/70">
                  Guide officiel pour faire une demande de visa de visiteur au Canada
                </span>
              </div>
            </a>
            <a
              href="https://www.vfsglobal.ca/canada/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#E8C4B8]/20
                hover:bg-[#8B9E7E]/5 transition-colors duration-200 group"
            >
              <ExternalLink className="w-4 h-4 text-[#8B9E7E] shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-[#3B4A30] group-hover:text-[#8B9E7E] transition-colors duration-200 block">
                  VFS Global Canada
                </span>
                <span className="text-xs text-[#7A6B55]/70">
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
        className="animated-border bg-[#FFFBF7] rounded-2xl border border-[#E8C4B8]/30 shadow-sm overflow-hidden"
      >
        <div className="bg-[#FDF8F4] border-b border-[#E8C4B8]/30 px-6 py-3.5 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#7A6B55]" />
          <span className="text-xs font-medium text-[#7A6B55] uppercase tracking-wider">
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
