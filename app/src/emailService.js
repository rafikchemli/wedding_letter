import emailjs from '@emailjs/browser'

// Keys are injected at build time from environment variables.
// Set them as GitHub repo secrets (Settings > Secrets > Actions):
//   VITE_EMAILJS_SERVICE_ID
//   VITE_EMAILJS_TEMPLATE_ID
//   VITE_EMAILJS_PUBLIC_KEY
//
// For local dev, create app/.env.local (gitignored) with:
//   VITE_EMAILJS_SERVICE_ID=service_xxx
//   VITE_EMAILJS_TEMPLATE_ID=template_xxx
//   VITE_EMAILJS_PUBLIC_KEY=xxx
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''

export async function notifyHost(formData) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[EmailJS] Not configured — skipping email notification.')
    return
  }

  const templateParams = {
    guest_name: formData.fullName,
    guest_email: formData.email,
    guest_phone: formData.phone,
    nationality: formData.nationality,
    arrival: formData.arrivalDate,
    departure: formData.departureDate,
    duration: formData.duration,
    relationship: formData.relationship,
    date_generated: new Date().toLocaleDateString('fr-CA'),
  }

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
    console.log('[EmailJS] Notification sent successfully.')
  } catch (err) {
    console.error('[EmailJS] Failed to send notification:', err)
  }
}
