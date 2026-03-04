import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Plane, Home, RotateCcw, BookOpen, Users, ChevronRight, Eye, FileText, X } from 'lucide-react'

function Field({ label, required, helper, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#5C6B4F] mb-1.5">
        {label}
        {required && <span className="text-[#E8C4B8] ml-0.5">*</span>}
      </label>
      {children}
      {helper && <p className="text-xs text-[#C4A98A] mt-1.5">{helper}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', required, disabled, ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full rounded-xl bg-[#FFFBF7] border border-[#E8C4B8]/40 px-4 py-2.5 text-sm text-[#5C6B4F]
        placeholder:text-[#C4A98A]/60
        focus:border-[#8B9E7E] focus:ring-2 focus:ring-[#8B9E7E]/20
        focus-visible:ring-2 focus-visible:ring-[#8B9E7E] focus-visible:ring-offset-2
        transition-all duration-200 outline-none
        disabled:opacity-50 disabled:cursor-not-allowed"
      {...rest}
    />
  )
}

function Section({ icon: Icon, title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="bg-[#FFFBF7] rounded-2xl border border-[#E8C4B8]/30 shadow-sm p-6 sm:p-8
        hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#8B9E7E]/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#8B9E7E]" />
        </div>
        <h3 className="font-display text-lg font-semibold text-[#5C6B4F]">{title}</h3>
      </div>
      <div className="space-y-5">{children}</div>
    </motion.div>
  )
}

const defaultForm = {
  fullName: '',
  dob: '',
  nationality: '',
  address: '',
  phone: '',
  email: '',
  purpose: 'Assister au mariage de Madjdi Rafik Chemli le 19 septembre 2026',
  arrivalDate: '',
  departureDate: '',
  cityInCanada: 'Montréal (QC)',
  accommodationAddress: 'Chez Madjdi Rafik Chemli – 267 Rachel Est, Montréal (QC), Canada H2W 1E5',
  accommodationDatesStart: '',
  accommodationDatesEnd: '',
  returnCountry: '',
  returnReason: '',
  passportNumber: '',
  issuingCountry: '',
  relationship: '',
}

function LetterTemplate() {
  return (
    <div
      className="text-sm text-[#5C6B4F] leading-[1.85] space-y-3"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '14px' }}
    >
      <div className="text-center mb-4">
        <p className="font-semibold">Madjdi Rafik Chemli</p>
        <p className="text-xs text-[#C4A98A]">267 Rachel Est, Montréal (QC), Canada H2W 1E5</p>
      </div>
      <div className="h-px bg-[#E8C4B8]/30" />
      <p className="text-[#C4A98A] text-xs">Date : <span className="italic">[date du jour]</span></p>
      <p className="text-[#C4A98A] text-xs">À : Immigration, Réfugiés et Citoyenneté Canada (IRCC)</p>
      <p className="font-semibold text-[#5C6B4F]">
        Objet : Lettre d'invitation — Demande de visa visiteur pour <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[Nom du visiteur]</mark>
      </p>
      <div className="h-px bg-[#E8C4B8]/30" />
      <p>
        Je soussigné Madjdi Rafik Chemli, né le 21 juin 1994, citoyen canadien, résidant au 267 Rachel Est, Montréal (QC), Canada, invite par la présente <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[Nom du visiteur]</mark>, né(e) le <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[date de naissance]</mark>, de nationalité <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[nationalité]</mark>, résidant au <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[adresse]</mark>, téléphone <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[tél]</mark>, courriel <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[courriel]</mark>, à venir au Canada pour un séjour temporaire.
      </p>
      <p className="font-medium text-[#8B9E7E]">
        Motif du voyage : assister à mon mariage, prévu le 19 septembre 2026 à Montréal, Québec.
      </p>
      <p>
        Dates prévues du séjour : du <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[date d'arrivée]</mark> au <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[date de départ]</mark> (durée totale : <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[X jours]</mark>).
      </p>
      <p>
        Hébergement : <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[Nom]</mark> logera chez moi au 267 Rachel Est, Montréal (QC), Canada, sans frais pour le visiteur.
      </p>
      <p>
        Dispositions financières : <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[Nom]</mark> assumera l'ensemble des frais liés à son voyage et à son séjour.
      </p>
      <p>
        Départ du Canada : <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[Nom]</mark> quittera le Canada au plus tard le <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[date de départ]</mark> afin de retourner à <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[pays de retour]</mark>.
      </p>
      <div className="h-px bg-[#E8C4B8]/30" />
      <div className="text-xs text-[#C4A98A] space-y-0.5">
        <p>Poste : Senior Data Scientist (EC-05)</p>
        <p>Employeur : Statistique Canada — CAIRE</p>
        <p>Lien avec le visiteur : <mark className="bg-[#8B9E7E]/15 text-[#5C6B4F] rounded px-1">[relation]</mark></p>
        <p>Conjointe : Sandrine Martelle, née le 3 février 1995.</p>
      </div>
      <div className="h-px bg-[#E8C4B8]/30" />
      <p className="italic text-[#C4A98A]">Cordialement,</p>
      <p className="font-semibold">Madjdi Rafik Chemli</p>
    </div>
  )
}

export default function InvitationForm({ onSubmit, initialData }) {
  const [form, setForm] = useState(initialData || defaultForm)
  const [showTemplate, setShowTemplate] = useState(false)

  useEffect(() => {
    if (initialData) setForm(initialData)
  }, [initialData])

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))

  const duration = () => {
    if (!form.arrivalDate || !form.departureDate) return ''
    const a = new Date(form.arrivalDate)
    const b = new Date(form.departureDate)
    const days = Math.round((b - a) / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} jours` : ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, duration: duration() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Visitor Identity */}
      <Section icon={User} title="1. Identité du visiteur" delay={0}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <Field label="Nom complet (tel que sur le passeport)" required>
              <Input value={form.fullName} onChange={set('fullName')} placeholder="Jean Dupont" required />
            </Field>
          </div>
          <Field label="Date de naissance" required helper="Format AAAA-MM-JJ">
            <Input type="date" value={form.dob} onChange={set('dob')} required />
          </Field>
          <Field label="Nationalité" required>
            <Input value={form.nationality} onChange={set('nationality')} placeholder="Française" required />
          </Field>
        </div>
        <Field label="Adresse résidentielle complète" required>
          <Input value={form.address} onChange={set('address')} placeholder="123 Rue Exemple, Paris, France" required />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Téléphone" required>
            <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="+33 6 12 34 56 78" required />
          </Field>
          <Field label="Courriel" required>
            <Input type="email" value={form.email} onChange={set('email')} placeholder="jean@exemple.com" required />
          </Field>
        </div>
      </Section>

      {/* 2. Travel Details */}
      <Section icon={Plane} title="2. Détails du voyage" delay={0.05}>
        <Field label="Motif du voyage">
          <Input value={form.purpose} onChange={set('purpose')} disabled />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Field label="Date d'arrivée" required>
            <Input type="date" value={form.arrivalDate} onChange={set('arrivalDate')} required />
          </Field>
          <Field label="Date de départ" required>
            <Input type="date" value={form.departureDate} onChange={set('departureDate')} required />
          </Field>
          <Field label="Durée totale" helper="Calculée automatiquement">
            <Input value={duration()} disabled placeholder="—" />
          </Field>
        </div>
        <Field label="Ville au Canada">
          <Input value={form.cityInCanada} onChange={set('cityInCanada')} disabled />
        </Field>
      </Section>

      {/* 3. Accommodation */}
      <Section icon={Home} title="3. Hébergement" delay={0.1}>
        <Field label="Adresse au Canada">
          <Input value={form.accommodationAddress} onChange={set('accommodationAddress')} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Début hébergement (si différent)" helper="Optionnel">
            <Input type="date" value={form.accommodationDatesStart} onChange={set('accommodationDatesStart')} />
          </Field>
          <Field label="Fin hébergement (si différent)" helper="Optionnel">
            <Input type="date" value={form.accommodationDatesEnd} onChange={set('accommodationDatesEnd')} />
          </Field>
        </div>
      </Section>

      {/* 4. Return */}
      <Section icon={RotateCcw} title="4. Retour après la visite" delay={0.15}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Pays de retour" required>
            <Input value={form.returnCountry} onChange={set('returnCountry')} placeholder="France" required />
          </Field>
          <Field label="Raison principale du retour" required>
            <Input value={form.returnReason} onChange={set('returnReason')} placeholder="Emploi permanent" required />
          </Field>
        </div>
      </Section>

      {/* 5. Passport */}
      <Section icon={BookOpen} title="5. Passeport (optionnel)" delay={0.2}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Numéro de passeport">
            <Input value={form.passportNumber} onChange={set('passportNumber')} placeholder="AB1234567" />
          </Field>
          <Field label="Pays de délivrance">
            <Input value={form.issuingCountry} onChange={set('issuingCountry')} placeholder="France" />
          </Field>
        </div>
      </Section>

      {/* 6. Relationship */}
      <Section icon={Users} title="6. Lien avec l'hôte" delay={0.25}>
        <Field label="Relation avec Madjdi Rafik Chemli" required>
          <Input value={form.relationship} onChange={set('relationship')} placeholder="Cousin, ami, collègue..." required />
        </Field>
      </Section>

      {/* Template preview trigger */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <button
          type="button"
          onClick={() => setShowTemplate(true)}
          className="w-full flex items-center justify-center gap-2 bg-[#FFFBF7] rounded-2xl border border-[#E8C4B8]/30
            px-6 py-4 text-sm font-medium text-[#5C6B4F] hover:bg-[#FDF8F4] hover:shadow-sm
            focus-visible:ring-2 focus-visible:ring-[#8B9E7E] focus-visible:ring-offset-2
            transition-all duration-200 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-[#8B9E7E]" />
          Voir le modèle de lettre
        </button>
      </motion.div>

      {/* Full-screen template modal */}
      {createPortal(
        <AnimatePresence>
          {showTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm"
              onClick={() => setShowTemplate(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative w-full max-w-2xl mx-4 my-8 sm:my-12 bg-[#FFFBF7] rounded-2xl border border-[#E8C4B8]/30 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#FFFBF7] border-b border-[#E8C4B8]/30 rounded-t-2xl">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#8B9E7E]" />
                    <h3 className="font-display text-base font-semibold text-[#5C6B4F]">Modèle de lettre</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTemplate(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E8C4B8]/20
                      focus-visible:ring-2 focus-visible:ring-[#8B9E7E] focus-visible:ring-offset-2
                      transition-colors duration-200 cursor-pointer"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4 text-[#5C6B4F]" />
                  </button>
                </div>

                {/* Modal body */}
                <div className="px-6 sm:px-10 py-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8B9E7E]" />
                    <p className="text-xs text-[#C4A98A] uppercase tracking-wider font-medium">
                      Les champs surlignés seront remplis avec vos informations
                    </p>
                  </div>
                  <LetterTemplate />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pt-4"
      >
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto bg-[#8B9E7E] text-white rounded-full px-8 py-3 text-sm font-medium
            hover:bg-[#7A8E6D] shadow-md hover:shadow-lg
            focus-visible:ring-2 focus-visible:ring-[#8B9E7E] focus-visible:ring-offset-2
            transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          Générer la lettre
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </form>
  )
}
