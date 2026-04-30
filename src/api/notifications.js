import { NotificationRepository } from '@/repositories/NotificationRepository'

const notificationRepository = new NotificationRepository()

const delayMs = import.meta.env.DEV ? 0 : 50
const delay = (ms = delayMs) =>
  ms <= 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchNotifications({ limit } = {}) {
  await delay()
  return await notificationRepository.findAll({ limit })
}

