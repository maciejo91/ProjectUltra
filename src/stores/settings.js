import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'projectultra_settings'

// Default settings values
const DEFAULT_SETTINGS = {
  // Opportunity Task Widget Thresholds
  oofbMinDays: 7,
  oofbMaxDays: 13,
  ufbDays: 14,
  ofbDays: 5,
  nfuDays: 5,
  cfbDays: 7,
  dfbDays: 3,
  
  // Opportunity Expected Close Date
  expectedCloseDateDays: 90,
  
  // Task Postponement
  postponeTaskDays: 7,
  
  // Opportunity Abandonment
  abandonedOpportunityDays: 30,
  abandonedEligibleStages: [
    'Qualified',
    'Awaiting Appointment',
    'In Negotiation'
  ],
  
  // Lead Thresholds
  maxContactAttempts: 5,
  excludeNotValidFromConversion: true,
  
  // Task Widgets
  autoCloseWidgetsOnClose: true,

  // Assigning rules (lead/opportunity assignment preferences)
  assigningRules: {
    assignLeadToSameCustomerEmployee: false
  },

  // Lead Urgency (level thresholds; score now from Lead Scoring)
  urgencyEnabled: true,
  urgencyThresholds: {
    hot: 80,
    warm: 50,
    standard: 20
  },

  // Lead Scoring (Opportunity Score for sorting)
  leadScoring: {
    weights: {
      freshness: 25,
      proximity: 20,
      vehicleMatch: 25,
      sourceQuality: 15,
      engagement: 15
    },
    sourcePriority: [
      'Walk-in',
      'Phone',
      'Website',
      'Google Ads',
      'Facebook',
      '3rd Party'
    ],
    prioritizeOldStock: true,
    agingFactor: 0.5
  },
  
  // UI Theme
  darkMode: false,
  
  // Navigation Visibility (per-item control)
  navigationVisibility: {
    home: false,
    tasks: true,
    customers: true,
    calendar: false,
    reports: false,
    lists: true,
    search: false,
    language: false
    // Note: Settings is always visible
  },
  
  // PDF Generation Defaults
  defaultPDFLanguage: 'en',
  defaultPDFTemplate: 'classic', // 'classic' | 'express'
  defaultIncludeTermsAndConditions: true,
  defaultIncludeDisclaimerPage: true
}

// Load settings from localStorage
function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      
      // Migrate navigationVisibility: if home is true (old default), update to new defaults
      // This ensures existing users get the new default visibility (only tasks and customers)
      if (parsed.navigationVisibility && parsed.navigationVisibility.home === true) {
        // User hasn't customized - apply new defaults
        parsed.navigationVisibility = { ...DEFAULT_SETTINGS.navigationVisibility }
        // Save the migrated settings immediately
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }))
      } else if (parsed.navigationVisibility) {
        // User has customized - merge with defaults for any missing keys
        parsed.navigationVisibility = {
          ...DEFAULT_SETTINGS.navigationVisibility,
          ...parsed.navigationVisibility
        }
      }
      if (parsed.leadScoring) {
        parsed.leadScoring = {
          ...DEFAULT_SETTINGS.leadScoring,
          ...parsed.leadScoring,
          weights: { ...DEFAULT_SETTINGS.leadScoring.weights, ...(parsed.leadScoring.weights || {}) }
        }
      }
      delete parsed.urgencyWeights
      // Merge with defaults to handle new settings added in future
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error)
  }
  return { ...DEFAULT_SETTINGS }
}

// Save settings to localStorage
function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error)
  }
}

export const useSettingsStore = defineStore('settings', () => {
  // Initialize settings from localStorage or defaults
  const settings = ref(loadSettings())

  // Save settings whenever they change
  function updateSettings(newSettings) {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings(settings.value)
  }

  // Reset to default settings
  function resetToDefaults() {
    settings.value = { ...DEFAULT_SETTINGS }
    saveSettings(settings.value)
  }

  // Get a specific setting value
  function getSetting(key) {
    return settings.value[key]
  }

  // Update a specific setting
  function setSetting(key, value) {
    settings.value[key] = value
    saveSettings(settings.value)
  }

  return {
    settings: computed(() => settings.value),
    updateSettings,
    resetToDefaults,
    getSetting,
    setSetting
  }
})


