import { motion } from 'framer-motion'
import { ArrowLeft, FileDown, FileText, Check } from 'lucide-react'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

function generateLetterText(d) {
  const today = new Date().toISOString().split('T')[0]
  const passportLine = d.passportNumber
    ? `, passeport no ${d.passportNumber} (délivré par ${d.issuingCountry || '—'})`
    : ''
  const accomDates =
    d.accommodationDatesStart && d.accommodationDatesEnd
      ? ` (ou du ${d.accommodationDatesStart} au ${d.accommodationDatesEnd} si différent)`
      : ''

  return `Madjdi Rafik Chemli
Adresse : 267 Rachel Est, Montréal (QC), Canada H2W 1E5
Ville : Montréal

Date : ${today}

À : Immigration, Réfugiés et Citoyenneté Canada (IRCC)
Objet : Lettre d'invitation — Demande de visa visiteur pour ${d.fullName}

Je soussigné Madjdi Rafik Chemli, né le 21 juin 1994, citoyen canadien, résidant au 267 Rachel Est, Montréal (QC), Canada, invite par la présente ${d.fullName}, né(e) le ${d.dob}, de nationalité ${d.nationality}, résidant au ${d.address}, téléphone ${d.phone}, courriel ${d.email}${passportLine}, à venir au Canada pour un séjour temporaire.

Motif du voyage : assister à mon mariage, prévu le 19 septembre 2026 à Montréal, Québec.

Dates prévues du séjour : du ${d.arrivalDate} au ${d.departureDate} (durée totale : ${d.duration}).
Hébergement : ${d.fullName} logera chez moi au 267 Rachel Est, Montréal (QC), Canada, sans frais pour le visiteur, pendant la durée du séjour${accomDates}.

Dispositions financières : ${d.fullName} assumera l'ensemble des frais liés à son voyage et à son séjour, incluant notamment le billet d'avion, le transport local, la nourriture, l'assurance voyage et les dépenses personnelles.

Départ du Canada : ${d.fullName} quittera le Canada au plus tard le ${d.departureDate} afin de retourner à ${d.returnCountry}.

Mes informations professionnelles :

Poste : Senior Data Scientist (EC-05)
Employeur : Statistique Canada — CAIRE (Centre of AI Research and Expertise)
Ville : Montréal

Lien avec le visiteur : ${d.relationship}.

Détails de ma famille :

Conjointe : Sandrine Martelle, née le 3 février 1995.

Je confirme que les informations ci-dessus sont exactes et fournies à l'appui de la demande de visa visiteur de ${d.fullName}.

Cordialement,

Madjdi Rafik Chemli`
}

async function downloadDocx(d) {
  const text = generateLetterText(d)
  const paragraphs = text.split('\n').map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line, font: 'Times New Roman', size: 24 })],
        spacing: { after: 120 },
      })
  )
  const doc = new Document({ sections: [{ children: paragraphs }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `invitation_${d.fullName.replace(/\s+/g, '_')}.docx`)
}

async function downloadPdf(d) {
  const html2pdf = (await import('html2pdf.js')).default
  const text = generateLetterText(d)
  const el = document.createElement('div')
  el.style.cssText = 'font-family: Times New Roman, Georgia, serif; font-size: 14px; line-height: 1.7; color: #333; padding: 20px; max-width: 680px; white-space: pre-wrap;'
  el.textContent = text
  document.body.appendChild(el)
  await html2pdf()
    .set({
      margin: [15, 15, 15, 15],
      filename: `invitation_${d.fullName.replace(/\s+/g, '_')}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(el)
    .save()
  document.body.removeChild(el)
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
        <h3 className="font-calligraphy text-3xl text-[#5C6B4F] mb-2">Madjdi Rafik Chemli</h3>
        <p className="text-xs text-[#C4A98A] tracking-wider uppercase">
          267 Rachel Est, Montréal (QC), Canada H2W 1E5
        </p>
      </div>

      <LetterDivider />

      {/* Date & addressee */}
      <div className="text-sm text-[#5C6B4F]/70 space-y-1 mb-6">
        <p>Date : {today}</p>
        <p>À : Immigration, Réfugiés et Citoyenneté Canada (IRCC)</p>
      </div>

      {/* Subject */}
      <div className="bg-[#8B9E7E]/5 border-l-3 border-[#8B9E7E] rounded-r-lg px-4 py-3 mb-6">
        <p className="font-display text-base font-semibold text-[#5C6B4F]">
          Objet : Lettre d'invitation — Demande de visa visiteur pour {d.fullName}
        </p>
      </div>

      {/* Body paragraphs */}
      <div className="space-y-4 text-sm text-[#5C6B4F] leading-[1.85]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '15px' }}>
        <p>
          Je soussigné Madjdi Rafik Chemli, né le 21 juin 1994, citoyen canadien, résidant au 267 Rachel Est, Montréal (QC), Canada, invite par la présente <strong className="text-[#5C6B4F]">{d.fullName}</strong>, né(e) le {d.dob}, de nationalité {d.nationality}, résidant au {d.address}, téléphone {d.phone}, courriel {d.email}{passportLine}, à venir au Canada pour un séjour temporaire.
        </p>

        <p className="font-medium text-[#8B9E7E]">
          Motif du voyage : assister à mon mariage, prévu le 19 septembre 2026 à Montréal, Québec.
        </p>

        <p>
          Dates prévues du séjour : du <strong>{d.arrivalDate}</strong> au <strong>{d.departureDate}</strong> (durée totale : {d.duration}).
        </p>
        <p>
          Hébergement : {d.fullName} logera chez moi au 267 Rachel Est, Montréal (QC), Canada, sans frais pour le visiteur, pendant la durée du séjour{accomDates}.
        </p>

        <p>
          Dispositions financières : {d.fullName} assumera l'ensemble des frais liés à son voyage et à son séjour, incluant notamment le billet d'avion, le transport local, la nourriture, l'assurance voyage et les dépenses personnelles.
        </p>

        <p>
          Départ du Canada : {d.fullName} quittera le Canada au plus tard le {d.departureDate} afin de retourner à {d.returnCountry}.
        </p>

        <LetterDivider />

        {/* Professional info block */}
        <div className="bg-[#FDF8F4] rounded-xl p-4 border border-[#E8C4B8]/20">
          <p className="font-display font-semibold text-[#5C6B4F] mb-2">Mes informations professionnelles :</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <span className="text-[#C4A98A]">Poste</span>
            <span>Senior Data Scientist (EC-05)</span>
            <span className="text-[#C4A98A]">Employeur</span>
            <span>Statistique Canada — CAIRE</span>
            <span className="text-[#C4A98A]">Ville</span>
            <span>Montréal</span>
          </div>
        </div>

        <p>Lien avec le visiteur : <strong>{d.relationship}</strong>.</p>

        {/* Family details */}
        <div className="bg-[#FDF8F4] rounded-xl p-4 border border-[#E8C4B8]/20">
          <p className="font-display font-semibold text-[#5C6B4F] mb-2">Détails de ma famille :</p>
          <p className="text-sm">Conjointe : Sandrine Martelle, née le 3 février 1995.</p>
        </div>

        <p>
          Je confirme que les informations ci-dessus sont exactes et fournies à l'appui de la demande de visa visiteur de {d.fullName}.
        </p>

        <LetterDivider />

        {/* Signature */}
        <div className="pt-2">
          <p className="text-[#C4A98A] italic mb-3">Cordialement,</p>
          <p className="font-calligraphy text-2xl text-[#5C6B4F]">Madjdi Rafik Chemli</p>
        </div>
      </div>
    </div>
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
          <Check className="w-4 h-4 text-[#5C6B4F]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#5C6B4F]">Lettre générée avec succès</p>
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
          className="inline-flex items-center gap-2 bg-transparent border border-[#E8C4B8]/40 text-[#5C6B4F] rounded-full
            px-5 py-2.5 text-sm font-medium hover:bg-[#E8C4B8]/10
            focus-visible:ring-2 focus-visible:ring-[#8B9E7E] focus-visible:ring-offset-2
            transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Modifier le formulaire
        </motion.button>
        <div className="flex gap-3">
          <motion.button
            onClick={() => downloadDocx(data)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-[#8B9E7E] text-white rounded-full px-5 py-2.5 text-sm font-medium
              hover:bg-[#7A8E6D] shadow-md hover:shadow-lg
              focus-visible:ring-2 focus-visible:ring-[#8B9E7E] focus-visible:ring-offset-2
              transition-all duration-200 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            DOCX
          </motion.button>
          <motion.button
            onClick={() => downloadPdf(data)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-[#5C6B4F] text-white rounded-full px-5 py-2.5 text-sm font-medium
              hover:bg-[#4A5A3F] shadow-md hover:shadow-lg
              focus-visible:ring-2 focus-visible:ring-[#5C6B4F] focus-visible:ring-offset-2
              transition-all duration-200 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </motion.button>
        </div>
      </motion.div>

      <OrnamentalDivider className="max-w-xs mx-auto" />

      {/* Styled letter preview card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="animated-border bg-[#FFFBF7] rounded-2xl border border-[#E8C4B8]/30 shadow-sm overflow-hidden"
      >
        <div className="bg-[#FDF8F4] border-b border-[#E8C4B8]/30 px-6 py-3.5 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C4A98A]" />
          <span className="text-xs font-medium text-[#C4A98A] uppercase tracking-wider">
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
