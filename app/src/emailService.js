import emailjs from '@emailjs/browser'

// Set as GitHub repo secrets (Settings > Secrets > Actions):
//   VITE_EMAILJS_SERVICE_ID
//   VITE_EMAILJS_TEMPLATE_ID
//   VITE_EMAILJS_PUBLIC_KEY
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

function generateLetterHTML(d) {
  const today = new Date().toLocaleDateString('fr-CA')
  const passportLine = d.passportNumber
    ? `, passeport no ${d.passportNumber} (délivré par ${d.issuingCountry || '—'})`
    : ''
  const accomDates =
    d.accommodationDatesStart && d.accommodationDatesEnd
      ? ` (ou du ${d.accommodationDatesStart} au ${d.accommodationDatesEnd} si différent)`
      : ''

  return `
<div style="font-family: 'Times New Roman', Georgia, serif; font-size: 14px; line-height: 1.8; color: #333; max-width: 680px;">
  <p><strong>Madjdi Rafik Chemli</strong><br>
  Adresse : 267 Rachel Est, Montréal (QC), Canada H2W 1E5<br>
  Ville : Montréal</p>

  <p>Date : ${today}</p>

  <p>À : Immigration, Réfugiés et Citoyenneté Canada (IRCC)<br>
  <strong>Objet : Lettre d'invitation — Demande de visa visiteur pour ${d.fullName}</strong></p>

  <p>Je soussigné Madjdi Rafik Chemli, né le 21 juin 1994, citoyen canadien, résidant au 267 Rachel Est, Montréal (QC), Canada, invite par la présente <strong>${d.fullName}</strong>, né(e) le ${d.dob}, de nationalité ${d.nationality}, résidant au ${d.address}, téléphone ${d.phone}, courriel ${d.email}${passportLine}, à venir au Canada pour un séjour temporaire.</p>

  <p>Motif du voyage : assister à mon mariage, prévu le 19 septembre 2026 à Montréal, Québec.</p>

  <p>Dates prévues du séjour : du ${d.arrivalDate} au ${d.departureDate} (durée totale : ${d.duration}).<br>
  Hébergement : ${d.fullName} logera chez moi au 267 Rachel Est, Montréal (QC), Canada, sans frais pour le visiteur, pendant la durée du séjour${accomDates}.</p>

  <p>Dispositions financières : ${d.fullName} assumera l'ensemble des frais liés à son voyage et à son séjour, incluant notamment le billet d'avion, le transport local, la nourriture, l'assurance voyage et les dépenses personnelles.</p>

  <p>Départ du Canada : ${d.fullName} quittera le Canada au plus tard le ${d.departureDate} afin de retourner à ${d.returnCountry}.</p>

  <p><strong>Mes informations professionnelles :</strong><br>
  Poste : Senior Data Scientist (EC-05)<br>
  Employeur : Statistique Canada — CAIRE (Centre of AI Research and Expertise)<br>
  Ville : Montréal</p>

  <p>Lien avec le visiteur : ${d.relationship}.</p>

  <p><strong>Détails de ma famille :</strong><br>
  Conjointe : Sandrine Martelle, née le 3 février 1995.</p>

  <p>Je confirme que les informations ci-dessus sont exactes et fournies à l'appui de la demande de visa visiteur de ${d.fullName}.</p>

  <p>Cordialement,<br><br>Madjdi Rafik Chemli</p>
</div>`
}

export async function notifyHost(formData) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[EmailJS] Not configured — skipping email notification.')
    return
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      guest_name: formData.fullName,
      letter_html: generateLetterHTML(formData),
    }, PUBLIC_KEY)
    console.log('[EmailJS] Notification sent successfully.')
  } catch (err) {
    console.error('[EmailJS] Failed to send notification:', err)
  }
}
