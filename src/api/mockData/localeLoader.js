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

// Import locale-specific data (English as default)
import { mockLeads as enLeads } from './locales/en/leads.js'
import { mockCustomers as enCustomers } from './locales/en/customers.js'
import { mockOpportunities as enOpportunities } from './locales/en/opportunities.js'
import { mockActivities as enActivities } from './locales/en/activities.js'
import { mockTasks as enTasks } from './locales/en/tasks.js'

import { mockLeads as itLeads } from './locales/it/leads.js'
import { mockCustomers as itCustomers } from './locales/it/customers.js'
import { mockOpportunities as itOpportunities } from './locales/it/opportunities.js'
import { mockActivities as itActivities } from './locales/it/activities.js'

import { mockLeads as deLeads } from './locales/de/leads.js'
import { mockCustomers as deCustomers } from './locales/de/customers.js'
import { mockOpportunities as deOpportunities } from './locales/de/opportunities.js'
import { mockActivities as deActivities } from './locales/de/activities.js'

import { mockLeads as frLeads } from './locales/fr/leads.js'
import { mockCustomers as frCustomers } from './locales/fr/customers.js'
import { mockOpportunities as frOpportunities } from './locales/fr/opportunities.js'
import { mockActivities as frActivities } from './locales/fr/activities.js'

import { mockLeads as nlLeads } from './locales/nl/leads.js'
import { mockCustomers as nlCustomers } from './locales/nl/customers.js'
import { mockOpportunities as nlOpportunities } from './locales/nl/opportunities.js'
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
const localeData = {
  en: {
    leads: enLeads,
    customers: enCustomers,
    opportunities: enOpportunities,
    activities: enActivities
  },
  it: {
    leads: itLeads,
    customers: itCustomers,
    opportunities: itOpportunities,
    activities: itActivities
  },
  de: {
    leads: deLeads,
    customers: deCustomers,
    opportunities: deOpportunities,
    activities: deActivities
  },
  fr: {
    leads: frLeads,
    customers: frCustomers,
    opportunities: frOpportunities,
    activities: frActivities
  },
  nl: {
    leads: nlLeads,
    customers: nlCustomers,
    opportunities: nlOpportunities,
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
  const mockLeads = translateLocaleData(data.leads)
  const mockOpportunities = translateLocaleData(data.opportunities)
  const mockActivities = translateLocaleData(data.activities)

  return {
    mockUsers, // Users don't need localization
    mockNotifications,
    mockCustomers: translateLocaleData(mockCustomers),
    mockLeads,
    mockOpportunities,
    mockTasks: enTasks, // English default; task labels translated in components
    mockContacts, // Contacts are derived from customers
    mockVehicles, // Vehicles use technical names
    mockCalendarEvents, // Calendar events use technical data
    mockActivities,
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

