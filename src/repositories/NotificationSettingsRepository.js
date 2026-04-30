import { BaseRepository } from './BaseRepository.js'
import { mockNotificationSettings } from '@/api/mockData/notificationSettings.js'

export class NotificationSettingsRepository extends BaseRepository {
  constructor() {
    super([])
    this._items = (mockNotificationSettings || []).map((x) => ({ ...x }))
  }

  async findAll() {
    await new Promise((resolve) => setTimeout(resolve, 0))
    return this._items.map((x) => ({ ...x }))
  }

  async update(id, updates) {
    await new Promise((resolve) => setTimeout(resolve, 0))
    const idx = this._items.findIndex((x) => x.id === id)
    if (idx < 0) return null
    const next = { ...this._items[idx], ...(updates || {}) }
    this._items.splice(idx, 1, next)
    return { ...next }
  }
}

