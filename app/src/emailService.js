import emailjs from '@emailjs/browser'

// Set as GitHub repo secrets (Settings > Secrets > Actions):
//   VITE_EMAILJS_SERVICE_ID
//   VITE_EMAILJS_TEMPLATE_ID
//   VITE_EMAILJS_PUBLIC_KEY
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

export async function notifyHost(formData) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[EmailJS] Not configured — skipping email notification.')
    return
  }

  const now = new Date()
  const accomDates = formData.accommodationDatesStart && formData.accommodationDatesEnd
    ? `Du ${formData.accommodationDatesStart} au ${formData.accommodationDatesEnd}`
    : 'Même que les dates du voyage'

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      guest_name: formData.fullName,
      guest_dob: formData.dob,
      guest_nationality: formData.nationality,
      guest_address: formData.address,
      guest_phone: formData.phone,
      guest_email: formData.email,
      guest_passport: formData.passportNumber
        ? `${formData.passportNumber} (${formData.issuingCountry || '—'})`
        : '',
      guest_relationship: formData.relationship,
      arrival_date: formData.arrivalDate,
      departure_date: formData.departureDate,
      duration: formData.duration,
      accommodation_address: formData.accommodationAddress,
      accommodation_dates: accomDates,
      return_country: formData.returnCountry,
      return_reason: formData.returnReason,
      generated_date: now.toLocaleDateString('fr-CA'),
      generated_time: now.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' }),
    }, PUBLIC_KEY)
    console.log('[EmailJS] Notification sent successfully.')
  } catch (err) {
    console.error('[EmailJS] Failed to send notification:', err)
  }
}
