/**
 * Locale-aware mock data loader
 * 
 * This utility loads mock data based on the current i18n locale.
 * Loads translated copies of mock data files from locale-specific folders.
 */

// Import base mock data (non-translatable)
import { mockUsers } from './users.js'
import { mockContacts } from './contacts.js'
import { mockVehicles } from './vehicles.js'
import { calendarEventTypes, calendarDealerships, calendarTeams, mockCalendarEvents } from './calendar.js'
import {
  mockDashboardKPIs,
  mockSalesPipeline,
  mockTeamPerformance,
  mockTodaysEvents,
  mockActionableQuestions,
  mockPageViewsByVehicle,
  mockPageViewsOrganicPaid,
  mockBDCOperatorMetrics,
  mockSalespersonMetrics,
  mockManagerFunnelMetrics
} from './dashboard.js'
import { mockNotifications } from './notifications.js'
import { translateObject } from './locales/translations.js'
import { CRM_VEHICLE_MENTION_NAMES, getCrmVehicleDisplayName } from './crmVehicles.js'

// Import locale-specific data (English as default)
import { buildMockLeads as enBuildMockLeads } from './locales/en/leads.js'
import { mockCustomers as enCustomers } from './locales/en/customers.js'
import { buildMockOpportunities as enBuildMockOpportunities } from './locales/en/opportunities.js'
import { mockActivities as enActivities } from './locales/en/activities.js'
import { mockTasks as enTasks } from './locales/en/tasks.js'

const LEGACY_VEHICLE_MENTIONS = [
  'Audi A6 Allroad',
  'Audi A6',
  'Volkswagen ID.4',
  'VW ID.4',
  'Mercedes-Benz C-Class',
  'Mercedes C-Class',
  'Tesla Model 3',
  'Porsche Cayenne',
  'Porsche Macan',
  'BMW iX xDrive50',
  'BMW iX'
]

const VEHICLE_MENTIONS = [...new Set([...CRM_VEHICLE_MENTION_NAMES, ...LEGACY_VEHICLE_MENTIONS])]

const STAFF_MENTIONS = ['Sara Marino', 'Davide Rinaldi', 'Matteo Greco', 'Matteo Alpino']

const NEW_CAR_STATUS_KEYS = new Set(['tobeorder', 'tobeordered', 'toorder'])
const VEHICLE_MENTION_PATTERN = new RegExp(
  VEHICLE_MENTIONS
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((mention) => mention.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|'),
  'g'
)
const DEMO_CITY_BY_PROFILE = {
  New: 'Milano',
  Used: 'Roma'
}

const LOCALIZED_COPY = {
  en: {
    newRequestMessage: ({ vehicleName }) =>
      `I would like to know if the ${vehicleName} is available to order. Can you confirm configuration, price, and delivery timing?`,
    usedRequestMessage: ({ vehicleName }) =>
      `Hi, I am interested in the ${vehicleName}. Can we schedule a test drive?`,
    newLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'The customer'} is interested in ordering the ${vehicleName}; confirm configuration, price, delivery timing, and test-drive options.`,
    usedLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'The customer'} is interested in the used ${vehicleName}; confirm availability, price, and a test-drive slot at the Roma showroom.`,
    opportunitySummary: ({ customerName, vehicleName }) =>
      `${customerName || 'The customer'} is evaluating the ${vehicleName}; keep the next action focused on the same requested vehicle.`,
    newCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} is evaluating a new ${vehicleName} order and wants clear guidance on configuration, price, delivery timing, and test-drive availability.`,
    usedCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} is interested in the used ${vehicleName} in Roma and responds best when availability, price, and test-drive options are handled quickly.`
  },
  it: {
    newRequestMessage: ({ vehicleName }) =>
      `Vorrei sapere se la ${vehicleName} è disponibile da ordinare. Potete confermare configurazione, prezzo e tempi di consegna?`,
    usedRequestMessage: ({ vehicleName }) =>
      `Buongiorno, sono interessato alla ${vehicleName}. Possiamo fissare un test drive?`,
    newLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'Il cliente'} è interessato a ordinare la ${vehicleName}; confermare configurazione, prezzo, tempi di consegna e disponibilità per un test drive.`,
    usedLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'Il cliente'} è interessato alla ${vehicleName} usata; confermare disponibilità, prezzo e uno slot per il test drive nello showroom di Roma.`,
    opportunitySummary: ({ customerName, vehicleName }) =>
      `${customerName || 'Il cliente'} sta valutando la ${vehicleName}; mantenere il prossimo follow-up sullo stesso veicolo richiesto.`,
    newCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} sta valutando l'ordine di una nuova ${vehicleName} e vuole indicazioni chiare su configurazione, prezzo, tempi di consegna e test drive.`,
    usedCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} è interessato alla ${vehicleName} usata a Roma e risponde meglio quando disponibilità, prezzo e test drive vengono gestiti rapidamente.`
  },
  de: {
    newRequestMessage: ({ vehicleName }) =>
      `Ich möchte wissen, ob der ${vehicleName} bestellbar ist. Können Sie Konfiguration, Preis und Lieferzeit bestätigen?`,
    usedRequestMessage: ({ vehicleName }) =>
      `Hallo, ich interessiere mich für den ${vehicleName}. Können wir eine Probefahrt vereinbaren?`,
    newLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'Der Kunde'} interessiert sich für eine Bestellung des ${vehicleName}; Konfiguration, Preis, Lieferzeit und Probefahrt bestätigen.`,
    usedLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'Der Kunde'} interessiert sich für den gebrauchten ${vehicleName}; Verfügbarkeit, Preis und einen Probefahrttermin im Showroom Roma bestätigen.`,
    opportunitySummary: ({ customerName, vehicleName }) =>
      `${customerName || 'Der Kunde'} prüft den ${vehicleName}; der nächste Schritt sollte auf dasselbe angefragte Fahrzeug fokussiert bleiben.`,
    newCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} prüft eine Bestellung des neuen ${vehicleName} und erwartet klare Informationen zu Konfiguration, Preis, Lieferzeit und Probefahrt.`,
    usedCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} interessiert sich für den gebrauchten ${vehicleName} in Roma und reagiert am besten auf schnelle Informationen zu Verfügbarkeit, Preis und Probefahrt.`
  },
  fr: {
    newRequestMessage: ({ vehicleName }) =>
      `Je voudrais savoir si la ${vehicleName} est disponible à la commande. Pouvez-vous confirmer la configuration, le prix et le délai de livraison ?`,
    usedRequestMessage: ({ vehicleName }) =>
      `Bonjour, je suis intéressé par la ${vehicleName}. Pouvons-nous programmer un essai ?`,
    newLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'Le client'} souhaite commander la ${vehicleName}; confirmer la configuration, le prix, le délai de livraison et les options d'essai.`,
    usedLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'Le client'} est intéressé par la ${vehicleName} d'occasion ; confirmer la disponibilité, le prix et un créneau d'essai au showroom de Roma.`,
    opportunitySummary: ({ customerName, vehicleName }) =>
      `${customerName || 'Le client'} évalue la ${vehicleName}; garder le prochain suivi centré sur le même véhicule demandé.`,
    newCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} évalue une commande de ${vehicleName} neuve et souhaite des informations claires sur la configuration, le prix, le délai et l'essai.`,
    usedCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} est intéressé par la ${vehicleName} d'occasion à Roma et répond mieux lorsque disponibilité, prix et essai sont traités rapidement.`
  },
  nl: {
    newRequestMessage: ({ vehicleName }) =>
      `Ik wil graag weten of de ${vehicleName} te bestellen is. Kunt u configuratie, prijs en levertijd bevestigen?`,
    usedRequestMessage: ({ vehicleName }) =>
      `Hallo, ik ben geïnteresseerd in de ${vehicleName}. Kunnen we een proefrit plannen?`,
    newLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'De klant'} is geïnteresseerd in het bestellen van de ${vehicleName}; bevestig configuratie, prijs, levertijd en proefritopties.`,
    usedLeadSummary: ({ customerName, vehicleName }) =>
      `${customerName || 'De klant'} is geïnteresseerd in de gebruikte ${vehicleName}; bevestig beschikbaarheid, prijs en een proefritmoment in de showroom in Roma.`,
    opportunitySummary: ({ customerName, vehicleName }) =>
      `${customerName || 'De klant'} beoordeelt de ${vehicleName}; houd de volgende actie gericht op hetzelfde aangevraagde voertuig.`,
    newCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} bekijkt een bestelling van een nieuwe ${vehicleName} en wil duidelijke informatie over configuratie, prijs, levertijd en proefrit.`,
    usedCustomerSummary: ({ customerName, vehicleName }) =>
      `${customerName} is geïnteresseerd in de gebruikte ${vehicleName} in Roma en reageert het beste wanneer beschikbaarheid, prijs en proefrit snel worden opgevolgd.`
  }
}

function getCopy(locale) {
  return LOCALIZED_COPY[locale] || LOCALIZED_COPY.en
}

function isNewRequestedVehicle(entity) {
  const car = entity?.requestedCar || entity?.vehicle || entity
  const status = String(car?.status || '').toLowerCase()
  const carStatus = String(entity?.carStatus || car?.carStatus || '').toLowerCase().replace(/\s+/g, '')
  return status === 'new' || NEW_CAR_STATUS_KEYS.has(carStatus)
}

function getVehicleDisplayName(entity) {
  const car = entity?.requestedCar || entity?.vehicle || entity
  if (!car?.brand && !car?.model) return ''
  return getCrmVehicleDisplayName(car)
}

function normalizeRequestedVehicle(car, entity = {}, locale = 'en') {
  if (!car) return car
  const vehicleName = getCrmVehicleDisplayName(car)
  const copy = getCopy(locale)
  const isNew = String(car.status || '').toLowerCase() === 'new'
  const defaultMessage = isNew
    ? copy.newRequestMessage({ vehicleName })
    : copy.usedRequestMessage({ vehicleName })
  return {
    ...car,
    requestMessage: car.requestMessage || defaultMessage,
    staffNote: car.staffNote || ''
  }
}

function replaceVehicleMentions(text, vehicleName) {
  if (typeof text !== 'string' || !text.trim() || !vehicleName) return text
  return text.replace(VEHICLE_MENTION_PATTERN, vehicleName)
}

function replaceStaffMentions(text, assigneeName) {
  if (typeof text !== 'string' || !text.trim() || !assigneeName) return text
  return STAFF_MENTIONS.reduce(
    (out, mention) => out.replaceAll(mention, assigneeName),
    text
  )
}

function normalizeLeadCopy(lead, customerName, locale = 'en') {
  const vehicleName = getVehicleDisplayName(lead)
  const isNew = isNewRequestedVehicle(lead)
  const copy = getCopy(locale)
  const carStatus = lead.carStatus || (isNew ? 'toBeOrder' : 'In Stock')
  const aiSummary =
    lead.aiSummary ||
    (isNew
      ? copy.newLeadSummary({ customerName, vehicleName })
      : copy.usedLeadSummary({ customerName, vehicleName }))
  return {
    ...lead,
    carStatus,
    requestMessage: lead.requestedCar?.requestMessage || lead.requestMessage,
    aiSummary
  }
}

function normalizeOpportunityCopy(opportunity, customerName, locale = 'en') {
  const vehicleName = getVehicleDisplayName(opportunity)
  const car = opportunity.requestedCar || opportunity.vehicle
  const isNew = String(car?.status || '').toLowerCase() === 'new'
  const copy = getCopy(locale)
  return {
    ...opportunity,
    carStatus: opportunity.carStatus || (isNew ? 'toBeOrder' : 'In Stock'),
    aiSummary:
      opportunity.aiSummary || copy.opportunitySummary({ customerName, vehicleName })
  }
}

function normalizeTaskCopy(task, context) {
  if (!context) return task
  const vehicleName = getVehicleDisplayName(context)
  const customerName = context.customerName || 'Customer'
  const isNew = isNewRequestedVehicle(context)
  const titlePrefix = task.leadId ? 'Lead qualification' : 'Follow up'
  return {
    ...task,
    title: `${titlePrefix} - ${vehicleName}`,
    description: isNew
      ? `${customerName} asked about the ${vehicleName}. Confirm configuration, price, delivery timing, and test-drive options.`
      : `${customerName} asked about the ${vehicleName}. Confirm availability, price, and a Roma showroom test-drive slot.`
  }
}

function normalizeActivityCopy(activity, context) {
  if (!context) return activity
  const vehicleName = getVehicleDisplayName(context)
  const assigneeName = context.assignee || ''
  const isCustomerSide = String(activity.type || '').startsWith('customer-') ||
    (activity.type === 'call' && String(activity.action || '').toLowerCase().includes('inbound'))
  const user = isCustomerSide
    ? (context.customerName || activity.user)
    : (assigneeName || activity.user)
  const replace = (value) => replaceStaffMentions(replaceVehicleMentions(value, vehicleName), assigneeName)
  return {
    ...activity,
    user,
    action: replace(activity.action),
    title: replace(activity.title),
    message: replace(activity.message),
    content: replace(activity.content),
    data: activity.data && typeof activity.data === 'object'
      ? {
          ...activity.data,
          from: replace(activity.data.from),
          to: replace(activity.data.to)
        }
      : activity.data
  }
}

function applyDemoVehicleConsistency({ leads, customers, opportunities, tasks, activities, locale }) {
  const customerById = new Map((customers || []).map((customer) => [customer.id, customer]))
  const normalizedLeads = (leads || []).map((lead) => {
    const requestedCar = normalizeRequestedVehicle(lead.requestedCar, lead, locale)
    return normalizeLeadCopy({ ...lead, requestedCar }, customerById.get(lead.customerId)?.name, locale)
  })
  const leadById = new Map(normalizedLeads.map((lead) => [lead.id, lead]))

  const normalizedOpportunities = (opportunities || []).map((opportunity) => {
    const requestedCar = normalizeRequestedVehicle(opportunity.requestedCar, opportunity, locale)
    const vehicle = opportunity.vehicle ? normalizeRequestedVehicle(opportunity.vehicle, opportunity, locale) : opportunity.vehicle
    return normalizeOpportunityCopy(
      { ...opportunity, requestedCar, vehicle },
      customerById.get(opportunity.customerId)?.name,
      locale
    )
  })
  const opportunityById = new Map(normalizedOpportunities.map((opportunity) => [opportunity.id, opportunity]))

  const normalizedCustomers = (customers || []).map((customer) => {
    const context =
      normalizedLeads.find((lead) => lead.customerId === customer.id) ||
      normalizedOpportunities.find((opportunity) => opportunity.customerId === customer.id)
    if (!context) return customer
    const vehicleName = getVehicleDisplayName(context)
    const isNew = isNewRequestedVehicle(context)
    const city = DEMO_CITY_BY_PROFILE[isNew ? 'New' : 'Used']
    const copy = getCopy(locale)
    return {
      ...customer,
      city,
      address: `Centro ${city}, ${city}`,
      summary: isNew
        ? copy.newCustomerSummary({ customerName: customer.name, vehicleName })
        : copy.usedCustomerSummary({ customerName: customer.name, vehicleName }),
      preferredVehicleType: isNew ? 'New car' : 'Used / Km0',
      budgetRange: isNew ? '€40K-€45K' : '€15K-€45K'
    }
  })
  const normalizedCustomerById = new Map(normalizedCustomers.map((customer) => [customer.id, customer]))

  const contextForTask = (task) => {
    const lead = task.leadId != null ? leadById.get(task.leadId) : null
    const opportunity = task.opportunityId != null ? opportunityById.get(task.opportunityId) : null
    const context = lead || opportunity
    if (!context) return null
    return { ...context, customerName: normalizedCustomerById.get(context.customerId)?.name }
  }

  const normalizedTasks = (tasks || []).map((task) => normalizeTaskCopy(task, contextForTask(task)))
  const normalizedActivities = (activities || []).map((activity) => {
    const lead = activity.leadId != null ? leadById.get(activity.leadId) : null
    const opportunity = activity.opportunityId != null ? opportunityById.get(activity.opportunityId) : null
    const context = lead || opportunity
    if (!context) return activity
    return normalizeActivityCopy(activity, {
      ...context,
      customerName: normalizedCustomerById.get(context.customerId)?.name
    })
  })

  return {
    customers: normalizedCustomers,
    leads: normalizedLeads,
    opportunities: normalizedOpportunities,
    tasks: normalizedTasks,
    activities: normalizedActivities
  }
}

import { buildMockLeads as itBuildMockLeads } from './locales/it/leads.js'
import { mockCustomers as itCustomers } from './locales/it/customers.js'
import { buildMockOpportunities as itBuildMockOpportunities } from './locales/it/opportunities.js'
import { mockActivities as itActivities } from './locales/it/activities.js'

import { buildMockLeads as deBuildMockLeads } from './locales/de/leads.js'
import { mockCustomers as deCustomers } from './locales/de/customers.js'
import { buildMockOpportunities as deBuildMockOpportunities } from './locales/de/opportunities.js'
import { mockActivities as deActivities } from './locales/de/activities.js'

import { buildMockLeads as frBuildMockLeads } from './locales/fr/leads.js'
import { mockCustomers as frCustomers } from './locales/fr/customers.js'
import { buildMockOpportunities as frBuildMockOpportunities } from './locales/fr/opportunities.js'
import { mockActivities as frActivities } from './locales/fr/activities.js'

import { buildMockLeads as nlBuildMockLeads } from './locales/nl/leads.js'
import { mockCustomers as nlCustomers } from './locales/nl/customers.js'
import { buildMockOpportunities as nlBuildMockOpportunities } from './locales/nl/opportunities.js'
import { mockActivities as nlActivities } from './locales/nl/activities.js'

/**
 * Get current locale for mock data.
 * Defaults to English so updates to locales/en/* are always reflected.
 * Only uses other locales when user has explicitly set app-locale in localStorage.
 */
function getCurrentLocale() {
  const saved = localStorage.getItem('app-locale')
  if (saved && ['en', 'it', 'de', 'fr', 'nl'].includes(saved)) {
    return saved
  }
  return 'en'
}

/**
 * Locale-specific data maps
 */
function resolveLocaleCollection(collection) {
  return typeof collection === 'function' ? collection() : collection
}

const localeData = {
  en: {
    leads: enBuildMockLeads,
    customers: enCustomers,
    opportunities: enBuildMockOpportunities,
    activities: enActivities
  },
  it: {
    leads: itBuildMockLeads,
    customers: itCustomers,
    opportunities: itBuildMockOpportunities,
    activities: itActivities
  },
  de: {
    leads: deBuildMockLeads,
    customers: deCustomers,
    opportunities: deBuildMockOpportunities,
    activities: deActivities
  },
  fr: {
    leads: frBuildMockLeads,
    customers: frCustomers,
    opportunities: frBuildMockOpportunities,
    activities: frActivities
  },
  nl: {
    leads: nlBuildMockLeads,
    customers: nlCustomers,
    opportunities: nlBuildMockOpportunities,
    activities: nlActivities
  }
}

/**
 * Get mock data for current locale
 */
export function getMockData() {
  const locale = getCurrentLocale()
  const data = localeData[locale] || localeData.en
  const translatedTextFields = ['requestMessage', 'notes', 'content', 'summary', 'action', 'message', 'aiSummary']
  const translateLocaleData = (value) => locale === 'en' ? value : translateObject(value, locale, translatedTextFields)
  // English is the default source; other locales get interestScore from EN by id so we don't duplicate
  const localeCustomers = data.customers || []
  const mockCustomers =
    locale === 'en'
      ? localeCustomers
      : localeCustomers.map((c) => {
          const enCustomer = localeData.en.customers.find((e) => e.id === c.id)
          return { ...c, interestScore: enCustomer?.interestScore ?? c.interestScore }
        })
  const mockLeads = translateLocaleData(resolveLocaleCollection(data.leads))
  const mockOpportunities = translateLocaleData(resolveLocaleCollection(data.opportunities))
  const mockActivities = translateLocaleData(data.activities)
  const translatedCustomers = translateLocaleData(mockCustomers)
  const consistentDemoData = applyDemoVehicleConsistency({
    leads: mockLeads,
    customers: translatedCustomers,
    opportunities: mockOpportunities,
    tasks: enTasks,
    activities: mockActivities,
    locale
  })

  return {
    mockUsers, // Users don't need localization
    mockNotifications,
    mockCustomers: consistentDemoData.customers,
    mockLeads: consistentDemoData.leads,
    mockOpportunities: consistentDemoData.opportunities,
    mockTasks: consistentDemoData.tasks, // English default; task labels translated in components
    mockContacts, // Contacts are derived from customers
    mockVehicles, // Vehicles use technical names
    mockCalendarEvents, // Calendar events use technical data
    mockActivities: consistentDemoData.activities,
    calendarEventTypes,
    calendarDealerships,
    calendarTeams,
    mockDashboardKPIs,
    mockSalesPipeline,
    mockTeamPerformance,
    mockTodaysEvents,
    mockActionableQuestions,
    mockPageViewsByVehicle,
    mockPageViewsOrganicPaid,
    mockBDCOperatorMetrics,
    mockSalespersonMetrics,
    mockManagerFunnelMetrics
  }
}

