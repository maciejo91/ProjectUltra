import { createHourOffset } from '@/utils/mockDataHelpers'

export const mockNotifications = [
  {
    id: 'notif-mention-1',
    type: 'message',
    titleKey: 'common.notifications.items.mention.title',
    bodyKey: 'common.notifications.items.mention.body',
    createdAt: createHourOffset(-0.25),
    isRead: false
  },
  {
    id: 'notif-whatsapp-1',
    type: 'message',
    titleKey: 'common.notifications.items.whatsapp.title',
    bodyKey: 'common.notifications.items.whatsapp.body',
    createdAt: createHourOffset(-1.5),
    isRead: false
  },
  {
    id: 'notif-email-1',
    type: 'message',
    titleKey: 'common.notifications.items.email.title',
    bodyKey: 'common.notifications.items.email.body',
    createdAt: createHourOffset(-3.25),
    isRead: true
  },
  {
    id: 'notif-update-1',
    type: 'update',
    titleKey: 'common.notifications.items.update.title',
    bodyKey: 'common.notifications.items.update.body',
    createdAt: createHourOffset(-6),
    isRead: true
  },
  {
    id: 'notif-system-1',
    type: 'system',
    titleKey: 'common.notifications.items.system.title',
    bodyKey: 'common.notifications.items.system.body',
    createdAt: createHourOffset(-28),
    isRead: true
  },
  {
    id: 'notif-system-2',
    type: 'system',
    titleKey: 'common.notifications.items.system.title',
    bodyKey: 'common.notifications.items.system.body',
    createdAt: createHourOffset(-120),
    isRead: true
  },
  {
    id: 'notif-update-2',
    type: 'update',
    titleKey: 'common.notifications.items.update.title',
    bodyKey: 'common.notifications.items.update.body',
    createdAt: createHourOffset(-240),
    isRead: true
  }
]

