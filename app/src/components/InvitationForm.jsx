import { useState, useEffect, useRef, useCallback, Children, isValidElement, cloneElement } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Home, RotateCcw, BookOpen, Users, ChevronRight, Eye, FileText, X, ExternalLink, Link } from 'lucide-react'

function Collapsible({ isExiting, delay, isLast, onExitComplete, children }) {
  return (
    <motion.div
      animate={isExiting
        ? { opacity: 0, height: 0, scale: 0.97, marginTop: 0 }
        : { opacity: 1, height: 'auto', scale: 1 }}
      transition={{
        duration: 0.35,
        delay: isExiting ? delay : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ overflow: 'hidden' }}
      onAnimationComplete={() => {
        if (isExiting && isLast) onExitComplete?.()
      }}
    >
      {children}
    </motion.div>
  )
}

function Field({ label, required, helper, error, children }) {
  const descId = `desc-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`
  const hasDesc = !!(error || helper)

  return (
    <div className="min-w-0">
      <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hasDesc
        ? Children.map(children, child =>
            isValidElement(child) ? cloneElement(child, { 'aria-describedby': descId }) : child
          )
        : children}
      {error && <p id={descId} className="text-xs text-red-600 mt-1.5" role="alert">{error}</p>}
      {!error && helper && <p id={descId} className="text-xs text-[var(--text-muted)] mt-1.5">{helper}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', required, disabled, error, ...rest }) {
  const [touched, setTouched] = useState(false)
  const showError = touched && error

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setTouched(true)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      aria-invalid={showError ? 'true' : undefined}
      className={`w-full min-w-0 max-w-full rounded-xl bg-[var(--surface)] border px-4 py-2.5 text-sm text-[var(--text)]
        placeholder:text-[var(--text-muted-60)]
        focus:ring-2 focus:ring-[var(--accent-20)]
        focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
        transition-all duration-200 outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${showError ? 'border-red-400 focus:border-red-400' : 'border-[var(--border-40)] focus:border-[var(--accent)]'}`}
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
      className="bg-[var(--surface)] rounded-2xl border border-[var(--border-30)] shadow-sm p-6 sm:p-8
        hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[var(--accent-10)] flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[var(--accent)]" />
        </div>
        <h3 className="font-display text-lg font-semibold text-[var(--text)]">{title}</h3>
      </div>
      <div className="space-y-5">{children}</div>
    </motion.div>
  )
}

const defaultForm = {
  fullName: '',
  gender: '',
  dob: '',
  nationality: '',
  address: '',
  phone: '',
  email: '',
  purpose: 'Assister au mariage de Madjdi Rafik Chemli le 19 septembre 2026',
  arrivalDate: '',
  departureDate: '',
  cityInCanada: 'Montréal (QC)',
  accommodationAddress: 'Chez Madjdi Rafik Chemli – 308-267 Rachel Est, Montréal (QC), Canada H2W 1E5',
  accommodationDatesStart: '',
  accommodationDatesEnd: '',
  returnCountry: '',
  returnReason: '',
  passportNumber: '',
  issuingCountry: '',
  relationship: '',
}

const mockForm = {
  fullName: 'Jean-Mouloud Belkacem',
  gender: 'M',
  dob: '1990-05-14',
  nationality: 'Algérienne',
  address: '42 Rue Didouche Mourad, Alger, Algérie',
  phone: '+213 5 55 12 34 56',
  email: 'jm.belkacem@exemple.com',
  purpose: 'Assister au mariage de Madjdi Rafik Chemli le 19 septembre 2026',
  arrivalDate: '2026-09-15',
  departureDate: '2026-09-25',
  cityInCanada: 'Montréal (QC)',
  accommodationAddress: 'Chez Madjdi Rafik Chemli – 308-267 Rachel Est, Montréal (QC), Canada H2W 1E5',
  accommodationDatesStart: '',
  accommodationDatesEnd: '',
  returnCountry: 'Algérie',
  returnReason: 'Emploi permanent à Alger',
  passportNumber: 'DZ1234567',
  issuingCountry: 'Algérie',
  relationship: 'mon ami d\'enfance|my childhood friend',
}

const isDev = import.meta.env.DEV

function LetterTemplate() {
  const M = (children) => <mark className="bg-[var(--accent-15)] text-[var(--text)] rounded px-1">{children}</mark>
  return (
    <div
      className="text-[var(--text)] leading-[1.85] space-y-[1em]"
      style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 'clamp(1rem, 0.8rem + 0.8vw, 1.35rem)',
      }}
    >
      <div className="text-center mb-[1em]">
        <p className="font-semibold">MADJDI RAFIK CHEMLI</p>
        <div className="text-[0.85em] text-[var(--text-muted)]">
          <p>308-267 Rachel Est</p>
          <p>Montréal (QC), Canada, H2W 1E5</p>
          <p>Tél. : 514-793-1185</p>
          <p>Courriel : rafik.madjdi.chemli@gmail.com</p>
        </div>
      </div>
      <div className="h-px bg-[var(--border-30)]" />
      <p className="text-[var(--text-muted)] text-[0.85em]">Montréal, le <span className="italic">[date du jour]</span></p>
      <div className="text-[var(--text-muted)] text-[0.85em]">
        <p>À l{'\u2019'}attention de l{'\u2019'}agent des visas,</p>
        <p>Immigration, Réfugiés et Citoyenneté Canada (IRCC)</p>
      </div>
      <p className="font-semibold text-[var(--text)]">
        Objet&nbsp;: Lettre d{'\u2019'}invitation — Demande de visa de résident temporaire (visiteur) de {M('[M./Mme]')}&nbsp;{M('[Nom du visiteur]')}
      </p>
      <div className="h-px bg-[var(--border-30)]" />
      <p>
        Je soussigné, <strong>Madjdi Rafik Chemli</strong>, citoyen canadien depuis 2006, résidant au Canada de façon continue depuis 2014, actuellement employé à titre de <strong>Senior AI Engineer</strong> chez <strong>NewMathData</strong>, demeurant à l{'\u2019'}adresse indiquée ci‑dessus, invite par la présente&nbsp;:
      </p>
      <p>
        {M('[M./Mme]')}&nbsp;<strong>{M('[Nom du visiteur]')}</strong>, {M('[né/née]')} le <strong>{M('[date de naissance]')}</strong>, titulaire du passeport n°&nbsp;{M('[n° passeport]')} ({M('[pays émetteur]')}), {M('[domicilié/domiciliée]')} au <strong>{M('[adresse]')}</strong>, téléphone&nbsp;: {M('[tél]')}.
      </p>
      <p>
        Je précise que {M('[M./Mme]')}&nbsp;{M('[Nom]')} est {M('[relation]')} et que cette invitation est faite dans le seul but d{'\u2019'}une visite temporaire au Canada.
      </p>
      <p className="font-medium text-[var(--accent)]">
        La présente visite a pour objet de permettre à {M('[M./Mme]')}&nbsp;{M('[Nom]')} d{'\u2019'}assister à mon mariage, prévu le <strong>19 septembre 2026</strong> à la salle <strong>L{'\u2019'}Éloi, à Montréal (Québec)</strong>. La période de séjour prévue est du <strong>{M('[date d\'arrivée]')}</strong> au <strong>{M('[date de départ]')}</strong> ({M('[durée]')}). {M('[Il/Elle]')} quittera le Canada au plus tard le {M('[date de départ]')}, afin de retourner en {M('[pays de retour]')}.
      </p>
      <p>
        Pendant la durée de son séjour, {M('[M./Mme]')}&nbsp;{M('[Nom]')} logera à mon domicile, à l{'\u2019'}adresse indiquée en en‑tête. Je confirme que je prendrai en charge l{'\u2019'}hébergement pour la totalité du séjour. {M('[M./Mme]')}&nbsp;{M('[Nom]')} assumera toutes les autres dépenses liées au voyage et au séjour, notamment&nbsp;: billets d{'\u2019'}avion (aller‑retour), transport, repas et dépenses personnelles.
      </p>
      <p>
        À ma connaissance, {M('[M./Mme]')}&nbsp;{M('[Nom]')} dispose d{'\u2019'}attaches solides dans son pays de résidence, notamment&nbsp;: <strong>{M('[raison de retour]')}</strong>, et {M('[il/elle]')} a l{'\u2019'}intention de reprendre ses obligations professionnelles à l{'\u2019'}issue de son séjour autorisé.
      </p>
      <p>
        Je comprends que ce séjour est strictement temporaire. {M('[M./Mme]')}&nbsp;{M('[Nom]')} s{'\u2019'}engage à respecter les conditions applicables aux visiteurs, notamment à ne pas travailler et à ne pas étudier au Canada sans autorisation.
      </p>
      <p>
        Je demeure à votre disposition pour tout renseignement complémentaire. Merci de l{'\u2019'}attention portée à la présente.
      </p>
      <p className="italic text-[var(--text-muted)]">Veuillez agréer, Madame, Monsieur, l{'\u2019'}expression de mes salutations distinguées.</p>
      <div className="h-px bg-[var(--border-30)]" />
      <div>
        <p className="font-semibold">Madjdi Rafik Chemli</p>
        <p className="text-[0.85em] text-[var(--text-muted)]">Senior AI Engineer — NewMathData</p>
        <p className="text-[0.85em] text-[var(--text-muted)]">Citoyen canadien</p>
      </div>
      <div className="h-px bg-[var(--border-30)]" />
      <div className="text-[0.85em] text-[var(--text-muted)] space-y-[0.25em]">
        <p className="font-semibold text-[var(--text)]">Pièces jointes (de l{'\u2019'}hôte) — copies&nbsp;:</p>
        <p>Copie preuve de citoyenneté&nbsp;: passeport canadien (page d{'\u2019'}identité) et/ou certificat</p>
        <p>Preuve d{'\u2019'}adresse au Canada&nbsp;: facture de services publics</p>
        <p>Lettre d{'\u2019'}emploi / preuves d{'\u2019'}emploi</p>
        <p>Preuve liée au mariage&nbsp;: réservation de salle / confirmation</p>
      </div>
    </div>
  )
}

const STORAGE_KEY = 'wedding-form-draft'

export default function InvitationForm({ onSubmit, initialData, isExiting, onExitComplete }) {
  const [form, setForm] = useState(() => {
    if (initialData) return initialData
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultForm, ...JSON.parse(saved) } : defaultForm
    } catch { return defaultForm }
  })
  const today = new Date().toISOString().split('T')[0]
  const [showTemplate, setShowTemplate] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const templateTriggerRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    if (initialData) setForm(initialData)
  }, [initialData])

  // Persist form to localStorage (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(form)) } catch {}
    }, 500)
    return () => clearTimeout(timer)
  }, [form])

  // Focus trap + Escape for modal
  useEffect(() => {
    if (!showTemplate) return
    const el = modalRef.current
    if (!el) return

    const focusable = () => el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = () => focusable()[0]
    const last = () => { const f = focusable(); return f[f.length - 1] }

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowTemplate(false)
        return
      }
      if (e.key === 'Tab') {
        const items = focusable()
        if (items.length === 0) return
        if (e.shiftKey && document.activeElement === first()) {
          e.preventDefault()
          last()?.focus()
        } else if (!e.shiftKey && document.activeElement === last()) {
          e.preventDefault()
          first()?.focus()
        }
      }
    }

    // Focus the close button on open
    requestAnimationFrame(() => first()?.focus())
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [showTemplate])

  // Return focus to trigger when modal closes
  const closeTemplate = useCallback(() => {
    setShowTemplate(false)
    requestAnimationFrame(() => templateTriggerRef.current?.focus())
  }, [])

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }))

  const validate = (key) => {
    const v = form[key]
    if (!v || (typeof v === 'string' && !v.trim())) return 'Ce champ est requis'
    if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Courriel invalide'
    return ''
  }

  const duration = () => {
    if (!form.arrivalDate || !form.departureDate) return ''
    const a = new Date(form.arrivalDate)
    const b = new Date(form.departureDate)
    const days = Math.round((b - a) / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} jours` : ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    const requiredFields = ['fullName', 'gender', 'dob', 'nationality', 'address', 'phone', 'email', 'arrivalDate', 'departureDate', 'returnCountry', 'returnReason', 'relationship']
    const hasErrors = requiredFields.some((k) => validate(k))
    if (hasErrors) return
    onSubmit({ ...form, duration: duration() })
  }

  const fillMock = () => {
    setForm(mockForm)
    setSubmitted(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isDev && (
        <button
          type="button"
          onClick={fillMock}
          className="w-full rounded-xl border-2 border-dashed border-amber-400/60 bg-amber-50 px-4 py-2.5
            text-sm font-medium text-amber-700 hover:bg-amber-100
            transition-colors duration-150 cursor-pointer"
        >
          DEV — Remplir avec des données fictives
        </button>
      )}
      {/* 1. Visitor Identity */}
      <Collapsible isExiting={isExiting} delay={0}>
      <Section icon={User} title="1. Identité du visiteur" delay={0}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <Field label="Nom complet (tel que sur le passeport)" required error={submitted && validate('fullName')}>
              <Input value={form.fullName} onChange={set('fullName')} placeholder="Jean-Mouloud Belkacem" required error={submitted && validate('fullName')} autoComplete="name" />
            </Field>
          </div>
          <Field label="Genre" required error={submitted && validate('gender')}>
            <select
              value={form.gender}
              onChange={(e) => set('gender')(e.target.value)}
              required
              className={`w-full rounded-xl bg-[var(--surface)] border px-4 py-2.5 text-sm text-[var(--text)]
                focus:ring-2 focus:ring-[var(--accent-20)]
                focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
                transition-all duration-200 outline-none cursor-pointer appearance-none
                ${!form.gender ? 'text-[var(--text-muted-60)]' : ''}
                ${submitted && validate('gender') ? 'border-red-400' : 'border-[var(--border-40)] focus:border-[var(--accent)]'}`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A6B55' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
            >
              <option value="" disabled>Choisir...</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </Field>
          <Field label="Date de naissance" required helper="Format AAAA-MM-JJ" error={submitted && validate('dob')}>
            <Input type="date" value={form.dob} onChange={set('dob')} required error={submitted && validate('dob')} autoComplete="bday" max={today} />
          </Field>
          <Field label="Nationalité" required error={submitted && validate('nationality')}>
            <Input value={form.nationality} onChange={set('nationality')} placeholder="Algérienne" required error={submitted && validate('nationality')} />
          </Field>
        </div>
        <Field label="Adresse résidentielle complète" required error={submitted && validate('address')}>
          <Input value={form.address} onChange={set('address')} placeholder="42 Rue Didouche Mourad, Alger, Algérie" required error={submitted && validate('address')} autoComplete="street-address" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Téléphone" required error={submitted && validate('phone')}>
            <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="+213 5 55 12 34 56" required error={submitted && validate('phone')} autoComplete="tel" />
          </Field>
          <Field label="Courriel" required error={submitted && validate('email')}>
            <Input type="email" value={form.email} onChange={set('email')} placeholder="jm.belkacem@exemple.com" required error={submitted && validate('email')} autoComplete="email" />
          </Field>
        </div>
      </Section>
      </Collapsible>

      {/* 2. Accommodation */}
      <Collapsible isExiting={isExiting} delay={0.05}>
      <Section icon={Home} title="2. Hébergement" delay={0.05}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Field label="Date d'arrivée" required error={submitted && validate('arrivalDate')}>
            <Input type="date" value={form.arrivalDate} onChange={set('arrivalDate')} required error={submitted && validate('arrivalDate')} min={today} />
          </Field>
          <Field label="Date de départ" required error={submitted && validate('departureDate')}>
            <Input type="date" value={form.departureDate} onChange={set('departureDate')} required error={submitted && validate('departureDate')} min={form.arrivalDate || today} />
          </Field>
          <Field label="Durée totale" helper="Calculée automatiquement">
            <Input value={duration()} disabled placeholder="—" />
          </Field>
        </div>
        <Field label="Adresse au Canada">
          <Input value={form.accommodationAddress} onChange={set('accommodationAddress')} />
        </Field>
      </Section>
      </Collapsible>

      {/* 3. Return */}
      <Collapsible isExiting={isExiting} delay={0.1}>
      <Section icon={RotateCcw} title="3. Retour après la visite" delay={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Pays de retour" required error={submitted && validate('returnCountry')}>
            <Input value={form.returnCountry} onChange={set('returnCountry')} placeholder="Algérie" required error={submitted && validate('returnCountry')} autoComplete="country-name" />
          </Field>
          <Field label="Raison principale du retour" required error={submitted && validate('returnReason')}>
            <Input value={form.returnReason} onChange={set('returnReason')} placeholder="Emploi permanent à Alger" required error={submitted && validate('returnReason')} />
          </Field>
        </div>
      </Section>
      </Collapsible>

      {/* 4. Passport */}
      <Collapsible isExiting={isExiting} delay={0.15}>
      <Section icon={BookOpen} title="4. Passeport (optionnel)" delay={0.15}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Numéro de passeport">
            <Input value={form.passportNumber} onChange={set('passportNumber')} placeholder="DZ1234567" />
          </Field>
          <Field label="Pays de délivrance">
            <Input value={form.issuingCountry} onChange={set('issuingCountry')} placeholder="Algérie" />
          </Field>
        </div>
      </Section>
      </Collapsible>

      {/* 5. Relationship */}
      <Collapsible isExiting={isExiting} delay={0.2}>
      <Section icon={Users} title="5. Lien avec l'hôte" delay={0.2}>
        <Field label="Relation avec Madjdi Rafik Chemli" required error={submitted && validate('relationship')}>
          <select
            value={form.relationship}
            onChange={(e) => set('relationship')(e.target.value)}
            required
            className={`w-full rounded-xl bg-[var(--surface)] border px-4 py-2.5 text-sm text-[var(--text)]
              focus:ring-2 focus:ring-[var(--accent-20)]
              focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
              transition-all duration-200 outline-none cursor-pointer appearance-none
              ${!form.relationship ? 'text-[var(--text-muted-60)]' : ''}
              ${submitted && validate('relationship') ? 'border-red-400' : 'border-[var(--border-40)] focus:border-[var(--accent)]'}`}
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A6B55' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
          >
            <option value="" disabled>Choisir le lien...</option>
            <option value="mon ami d'enfance|my childhood friend">Ami d'enfance</option>
            <option value="mon ami proche|my close friend">Ami proche</option>
            <option value="mon cousin|my cousin">Cousin</option>
            <option value="ma cousine|my cousin">Cousine</option>
            <option value="mon oncle|my uncle">Oncle</option>
            <option value="ma tante|my aunt">Tante</option>
            <option value="un membre de ma famille|a member of my family">Autre membre de la famille</option>
          </select>
        </Field>
      </Section>
      </Collapsible>

      {/* Template preview trigger */}
      <Collapsible isExiting={isExiting} delay={0.3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <button
          ref={templateTriggerRef}
          type="button"
          onClick={() => setShowTemplate(true)}
          className="w-full flex items-center justify-center gap-2 bg-[var(--surface)] rounded-2xl border border-[var(--border-30)]
            px-6 py-4 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-alt)] hover:shadow-sm
            focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
            transition-all duration-200 cursor-pointer"
        >
          <Eye className="w-4 h-4 text-[var(--accent)]" />
          Voir le modèle de lettre
        </button>
      </motion.div>
      </Collapsible>

      {/* Full-screen template modal */}
      {createPortal(
        <AnimatePresence>
          {showTemplate && (
            <>
              {/* Backdrop — click to dismiss */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                onClick={closeTemplate}
              />

              {/* Bottom sheet */}
              <motion.div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label="Modèle de lettre"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-[101] flex flex-col bg-[var(--surface)] rounded-t-3xl shadow-2xl overflow-hidden"
                style={{ maxHeight: '90vh' }}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-[var(--border-50)]" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-30)]" style={{ padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1.5rem, 4vw, 4rem)' }}>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--accent)]" />
                    <h3 className="font-display font-semibold text-[var(--text)]" style={{ fontSize: 'clamp(1rem, 0.8rem + 0.6vw, 1.25rem)' }}>Modèle de lettre</h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeTemplate}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--border-20)]
                      focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
                      transition-colors duration-200 cursor-pointer"
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-[var(--text)]" />
                  </button>
                </div>

                {/* Scrollable letter content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="flex justify-center" style={{ padding: 'clamp(1.5rem, 4vw, 4rem)' }}>
                    <div className="w-full" style={{ maxWidth: 'clamp(24rem, 55vw, 52rem)' }}>
                  <div className="flex items-center gap-2 mb-[2em]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    <p className="text-[0.85em] text-[var(--text-muted)] uppercase tracking-wider font-medium" style={{ fontSize: 'clamp(0.75rem, 0.6rem + 0.5vw, 1rem)' }}>
                      Les champs surlignés seront remplis avec vos informations
                    </p>
                  </div>
                  <LetterTemplate />
                  </div>
                </div>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Submit */}
      <Collapsible isExiting={isExiting} delay={0.35} isLast onExitComplete={onExitComplete}>
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
          className="w-full sm:w-auto bg-[var(--accent)] text-white rounded-full px-8 py-3 text-sm font-medium
            hover:bg-[var(--accent-hover)] shadow-md hover:shadow-lg
            focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
            transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          Générer la lettre
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
      </Collapsible>
    </form>
  )
}
