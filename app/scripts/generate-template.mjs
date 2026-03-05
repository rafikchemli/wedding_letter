/**
 * Generate the FR and EN DOCX templates with {placeholder} tags.
 * Run: node app/scripts/generate-template.mjs
 */
import { Document, Packer, Paragraph, TextRun, AlignmentType, UnderlineType } from 'docx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FONT = 'Times New Roman'
const SZ = 22
const SZ_NAME = 26
const LINE = 240

function p(runs, opts = {}) {
  const { after = 80, before = 0, indent, justify, ...rest } = opts
  return new Paragraph({
    children: Array.isArray(runs) ? runs : [runs],
    spacing: { after, before, line: LINE },
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

function makeDoc(children) {
  return new Document({
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
}

// ── French template ──
const frChildren = [
  p([bold('MADJDI RAFIK CHEMLI', { size: SZ_NAME })], { after: 0 }),
  p([t('308-267 Rachel Est')], { after: 0 }),
  p([t('Montréal (QC), Canada, H2W 1E5')], { after: 0 }),
  p([t('Tél. : 514-793-1185')], { after: 0 }),
  p([t('Courriel : rafik.madjdi.chemli@gmail.com')], { after: 200 }),
  p([t('{dateFr}')], { after: 480 }),

  p([bold('À : '), t('Immigration, Réfugiés et Citoyenneté Canada (IRCC)')], { after: 0 }),
  p([bold('Objet : '), t('Lettre d\'invitation pour visa visiteur — {fullName}')], { after: 480 }),

  p([t('Madame, Monsieur,')], { after: 480 }),

  p([
    t('Je soussigné, '), bold('Madjdi Rafik Chemli'),
    t(', invite {relationshipFr}, '),
    bold('{fullName}'),
    t(', né(e) le '), bold('{dobFr}'),
    t('{passportLineFr}, résidant au '), bold('{address}'),
    t(', à me rendre visite au Canada.'),
  ], { justify: true }),

  p([
    t('Je suis '), bold('citoyen canadien'),
    t(', résidant à l\'adresse mentionnée ci-dessus. Je suis citoyen canadien depuis 2006 et je réside de façon permanente au Canada depuis 2014. Je suis actuellement employé comme '),
    bold('Senior AI Engineer'),
    t(' chez '),
    bold('NewMathData'),
    t(', et je suis financièrement stable.'),
  ], { justify: true }),

  p([
    t('Le but de cette visite est d\''),
    bold('assister à mon mariage'),
    t(', prévu le '), bold('19 septembre 2026'),
    t(' à la salle '), bold('L\'Éloi, Montréal, Québec'),
    t('. Le séjour est prévu du '),
    bold('{arrivalDateFr}'),
    t(' au '),
    bold('{departureDateFr}'),
    t(' ({duration}). Durant cette période, {fullName} logera chez moi à mon domicile.'),
  ], { justify: true }),

  p([
    t('Je confirme que je fournirai l\'hébergement pendant le séjour. {fullName} assumera les autres frais liés à son voyage (billet d\'avion, transport, nourriture).'),
  ], { justify: true }),

  p([
    t('{fullName} a des attaches solides dans son pays de résidence ({returnCountry}), notamment : '),
    bold('{returnReason}'),
    t('. Il/elle retournera en {returnCountry} à la fin de son séjour autorisé.'),
  ], { justify: true }),

  p([
    t('Je vous prie de bien vouloir lui accorder un visa de résident temporaire pour visiter le Canada.'),
  ], { justify: true }),

  p([
    t('Si vous avez besoin de renseignements supplémentaires, n\'hésitez pas à me contacter. Je vous remercie de votre considération.'),
  ], { justify: true, after: 480 }),

  p([t('Cordialement,')], { after: 80 }),
  p([bold('Madjdi Rafik Chemli')], { after: 0 }),
  p([t('Senior AI Engineer — NewMathData')], { after: 0 }),
  p([t('Citoyen canadien')], { after: 480 }),

  p([bold('p.j. (pièces jointes) :', { underline: { type: UnderlineType.SINGLE } })], { after: 40 }),
  p([t('– Copie de la carte de citoyenneté canadienne')], { after: 20, indent: 360 }),
  p([t('– Lettre d\'emploi (NewMathData)')], { after: 20, indent: 360 }),
  p([t('– Facture d\'électricité (confirmation de domicile)')], { after: 20, indent: 360 }),
  p([t('– Contrat de location de la salle de réception (Studio L\'Éloi, Montréal)')], { after: 0, indent: 360 }),
]

// ── English template ──
const enChildren = [
  p([bold('MADJDI RAFIK CHEMLI', { size: SZ_NAME })], { after: 0 }),
  p([t('308-267 Rachel Est')], { after: 0 }),
  p([t('Montréal (QC), Canada, H2W 1E5')], { after: 0 }),
  p([t('Phone: 514-793-1185')], { after: 0 }),
  p([t('Email: rafik.madjdi.chemli@gmail.com')], { after: 200 }),
  p([t('{dateEn}')], { after: 480 }),

  p([bold('To: '), t('Immigration, Refugees and Citizenship Canada (IRCC)')], { after: 0 }),
  p([bold('Subject: '), t('Invitation Letter for Visitor Visa — {fullName}')], { after: 480 }),

  p([t('Dear Sir/Madam,')], { after: 480 }),

  p([
    t('I am writing to invite {relationshipEn}, '),
    bold('{fullName}'),
    t(', born on '), bold('{dobEn}'),
    t('{passportLineEn}, currently residing at '), bold('{address}'),
    t(', to visit me in Canada.'),
  ], { justify: true }),

  p([
    t('I am a '), bold('Canadian citizen'),
    t(', residing at the address mentioned above. I have been a Canadian citizen since 2006 and have been living permanently in Canada since 2014. I am currently employed as a '),
    bold('Senior AI Engineer'),
    t(' at '),
    bold('NewMathData'),
    t(', and I am financially stable.'),
  ], { justify: true }),

  p([
    t('The purpose of this visit is to '),
    bold('attend my wedding'),
    t(', scheduled for '), bold('September 19, 2026'),
    t(' at '), bold('Salle L\'Éloi, Montréal, Québec'),
    t('. The visit is planned from '),
    bold('{arrivalDateEn}'),
    t(' to '),
    bold('{departureDateEn}'),
    t(' ({duration}). During this period, {fullName} will stay with me at my home.'),
  ], { justify: true }),

  p([
    t('I confirm that I will provide accommodation during the stay. {fullName} will cover other travel-related expenses (airfare, transportation, food).'),
  ], { justify: true }),

  p([
    t('{fullName} has strong ties to their country of residence ({returnCountry}), including: '),
    bold('{returnReason}'),
    t('. They will return to {returnCountry} at the end of their authorized stay.'),
  ], { justify: true }),

  p([
    t('I kindly request that you grant them a Temporary Resident Visa to visit Canada.'),
  ], { justify: true }),

  p([
    t('If you require any additional information, please do not hesitate to contact me. Thank you for your consideration.'),
  ], { justify: true, after: 480 }),

  p([t('Sincerely,')], { after: 80 }),
  p([bold('Madjdi Rafik Chemli')], { after: 0 }),
  p([t('Senior AI Engineer — NewMathData')], { after: 0 }),
  p([t('Canadian Citizen')], { after: 480 }),

  p([bold('Encl. (enclosed documents):', { underline: { type: UnderlineType.SINGLE } })], { after: 40 }),
  p([t('– Copy of Canadian citizenship card')], { after: 20, indent: 360 }),
  p([t('– Employment letter (NewMathData)')], { after: 20, indent: 360 }),
  p([t('– Electricity bill (proof of residence)')], { after: 20, indent: 360 }),
  p([t('– Venue rental contract (Studio L\'Éloi, Montréal)')], { after: 0, indent: 360 }),
]

const outDir = path.resolve(__dirname, '../public/templates')

const frDoc = makeDoc(frChildren)
const enDoc = makeDoc(enChildren)

const frBuf = await Packer.toBuffer(frDoc)
fs.writeFileSync(path.join(outDir, 'lettre_template_fr.docx'), frBuf)
console.log('✓ lettre_template_fr.docx')

const enBuf = await Packer.toBuffer(enDoc)
fs.writeFileSync(path.join(outDir, 'lettre_template_en.docx'), enBuf)
console.log('✓ lettre_template_en.docx')
