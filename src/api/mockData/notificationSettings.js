export const mockNotificationSettings = [
  {
    id: 'ns-oem-instance-new-lead',
    categoryId: 'leads',
    titleKey: 'common.settingsNotifications.items.oemInstanceReceivedNewLead.title',
    descriptionKey: 'common.settingsNotifications.items.oemInstanceReceivedNewLead.description',
    channels: { email: true, inApp: false, mobileApp: false }
  },
  {
    id: 'ns-integration-user-sync-failed',
    categoryId: 'integrations',
    titleKey: 'common.settingsNotifications.items.integrationUserSyncFailed.title',
    descriptionKey: 'common.settingsNotifications.items.integrationUserSyncFailed.description',
    channels: { email: true, inApp: false, mobileApp: false }
  },
  {
    id: 'ns-qualified-lead',
    categoryId: 'leads',
    titleKey: 'common.settingsNotifications.items.qualifiedLead.title',
    descriptionKey: 'common.settingsNotifications.items.qualifiedLead.description',
    channels: { email: true, inApp: false, mobileApp: false }
  },
  {
    id: 'ns-opportunity-assigned',
    categoryId: 'opportunities',
    titleKey: 'common.settingsNotifications.items.opportunityAssigned.title',
    descriptionKey: 'common.settingsNotifications.items.opportunityAssigned.description',
    channels: { email: false, inApp: true, mobileApp: false }
  },
  {
    id: 'ns-opportunity-entered-pool',
    categoryId: 'opportunities',
    titleKey: 'common.settingsNotifications.items.opportunityEnteredPool.title',
    descriptionKey: 'common.settingsNotifications.items.opportunityEnteredPool.description',
    channels: { email: false, inApp: true, mobileApp: false }
  },
  {
    id: 'ns-opportunity-reentered-pool',
    categoryId: 'opportunities',
    titleKey: 'common.settingsNotifications.items.opportunityReEnteredPool.title',
    descriptionKey: 'common.settingsNotifications.items.opportunityReEnteredPool.description',
    channels: { email: false, inApp: true, mobileApp: false }
  },
  {
    id: 'ns-task-assigned',
    categoryId: 'tasks',
    titleKey: 'common.settingsNotifications.items.taskAssigned.title',
    descriptionKey: 'common.settingsNotifications.items.taskAssigned.description',
    channels: { email: false, inApp: true, mobileApp: false }
  },
  {
    id: 'ns-task-due-date-passed',
    categoryId: 'tasks',
    titleKey: 'common.settingsNotifications.items.taskDueDatePassed.title',
    descriptionKey: 'common.settingsNotifications.items.taskDueDatePassed.description',
    channels: { email: false, inApp: true, mobileApp: false }
  },
  {
    id: 'ns-task-entered-pool',
    categoryId: 'tasks',
    titleKey: 'common.settingsNotifications.items.taskEnteredPool.title',
    descriptionKey: 'common.settingsNotifications.items.taskEnteredPool.description',
    channels: { email: false, inApp: true, mobileApp: false }
  },
  {
    id: 'ns-task-reentered-pool',
    categoryId: 'tasks',
    titleKey: 'common.settingsNotifications.items.taskReEnteredPool.title',
    descriptionKey: 'common.settingsNotifications.items.taskReEnteredPool.description',
    channels: { email: false, inApp: true, mobileApp: false }
  },
  {
    id: 'ns-contact-online',
    categoryId: 'contacts',
    titleKey: 'common.settingsNotifications.items.contactOnline.title',
    descriptionKey: 'common.settingsNotifications.items.contactOnline.description',
    channels: { email: false, inApp: true, mobileApp: false }
  }
]
