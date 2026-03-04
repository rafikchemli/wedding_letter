import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileDown, FileText } from 'lucide-react'
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

Motif du voyage : assister à mon mariage, prévu le 19 septembre 2026 à Montréal, Quebec.

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
  const el = document.getElementById('letter-content')
  if (!el) return
  html2pdf()
    .set({
      margin: [15, 15, 15, 15],
      filename: `invitation_${d.fullName.replace(/\s+/g, '_')}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(el)
    .save()
}

export default function LetterPreview({ data, onBack }) {
  const letterText = generateLetterText(data)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Modifier le formulaire
        </motion.button>
        <div className="flex gap-3">
          <motion.button
            onClick={() => downloadDocx(data)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-blue-500 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-blue-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            DOCX
          </motion.button>
          <motion.button
            onClick={() => downloadPdf(data)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            PDF
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Aperçu de la lettre
          </span>
        </div>
        <div
          id="letter-content"
          className="p-6 sm:p-10 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-serif"
          style={{ fontFamily: "'Times New Roman', serif" }}
        >
          {letterText}
        </div>
      </motion.div>
    </div>
  )
}
