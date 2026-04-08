export const SETTINGS_PROTOTYPE_PATH = '/settings/prototype'

export const SETTINGS_NAV_SECTIONS = [
  {
    sectionKey: 'administration',
    items: [
      {
        relPath: 'administration/fiscal-entities',
        name: 'settings-admin-fiscal-entities',
        titleKey: 'common.navigation.settingsAdminFiscalEntities'
      },
      {
        relPath: 'administration/dealerships',
        name: 'settings-admin-dealerships',
        titleKey: 'common.navigation.settingsAdminDealerships'
      },
      {
        relPath: 'administration/teams',
        name: 'settings-admin-teams',
        titleKey: 'common.navigation.settingsAdminTeams'
      },
      {
        relPath: 'administration/users',
        name: 'settings-admin-users',
        titleKey: 'common.navigation.settingsAdminUsers'
      },
      {
        relPath: 'administration/whatsapp-business',
        name: 'settings-admin-whatsapp-business',
        titleKey: 'common.navigation.settingsAdminWhatsappBusiness'
      }
    ]
  },
  {
    sectionKey: 'operations',
    items: [
      {
        relPath: 'operations/data-normalization',
        name: 'settings-ops-data-normalization',
        titleKey: 'common.navigation.settingsOpsDataNormalization'
      },
      {
        relPath: 'operations/sales-alerts',
        name: 'settings-ops-sales-alerts',
        titleKey: 'common.navigation.settingsOpsSalesAlerts'
      },
      {
        relPath: 'operations/sales-tasks',
        name: 'settings-ops-sales-tasks',
        titleKey: 'common.navigation.settingsOpsSalesTasks'
      },
      {
        relPath: 'operations/after-sales-tasks',
        name: 'settings-ops-after-sales-tasks',
        titleKey: 'common.navigation.settingsOpsAfterSalesTasks'
      },
      {
        relPath: 'operations/timetables-and-holidays',
        name: 'settings-ops-timetables-and-holidays',
        titleKey: 'common.navigation.settingsOpsTimetablesAndHolidays'
      },
      {
        relPath: 'operations/quotes-and-contracts',
        name: 'settings-ops-quotes-and-contracts',
        titleKey: 'common.navigation.settingsOpsQuotesAndContracts'
      },
      {
        relPath: 'operations/failure-reasons',
        name: 'settings-ops-failure-reasons',
        titleKey: 'common.navigation.settingsOpsFailureReasons'
      },
      {
        relPath: 'operations/tags',
        name: 'settings-ops-tags',
        titleKey: 'common.navigation.settingsOpsTags'
      },
      {
        relPath: 'operations/sources-detail',
        name: 'settings-ops-sources-detail',
        titleKey: 'common.navigation.settingsOpsSourcesDetail'
      },
      {
        relPath: 'operations/after-sales-services',
        name: 'settings-ops-after-sales-services',
        titleKey: 'common.navigation.settingsOpsAfterSalesServices'
      },
      {
        relPath: 'operations/custom-fields',
        name: 'settings-ops-custom-fields',
        titleKey: 'common.navigation.settingsOpsCustomFields'
      },
      {
        relPath: 'operations/notifications',
        name: 'settings-ops-notifications',
        titleKey: 'common.navigation.settingsOpsNotifications'
      },
      {
        relPath: 'operations/calendar-events',
        name: 'settings-ops-calendar-events',
        titleKey: 'common.navigation.settingsOpsCalendarEvents'
      }
    ]
  },
  {
    sectionKey: 'templates',
    items: [
      {
        relPath: 'templates/email',
        name: 'settings-tpl-email',
        titleKey: 'common.navigation.settingsTplEmail'
      },
      {
        relPath: 'templates/sms',
        name: 'settings-tpl-sms',
        titleKey: 'common.navigation.settingsTplSms'
      },
      {
        relPath: 'templates/survey',
        name: 'settings-tpl-survey',
        titleKey: 'common.navigation.settingsTplSurvey'
      }
    ]
  }
]

export const SETTINGS_PLACEHOLDER_ROUTE_ITEMS = SETTINGS_NAV_SECTIONS.flatMap((s) => s.items)

export function settingsPathForRel(relPath) {
  return `/settings/${relPath}`
}
