import { NotificationSettingsRepository } from '@/repositories/NotificationSettingsRepository'

const repository = new NotificationSettingsRepository()

const delayMs = import.meta.env.DEV ? 0 : 50
const delay = (ms = delayMs) =>
  ms <= 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchNotificationSettings() {
  await delay()
  return await repository.findAll()
}

export async function updateNotificationSetting(id, updates) {
  await delay()
  return await repository.update(id, updates)
}

