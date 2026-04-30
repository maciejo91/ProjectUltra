import { BaseRepository } from './BaseRepository.js'
import { getMockData } from '@/api/mockData/localeLoader.js'

export class NotificationRepository extends BaseRepository {
  constructor() {
    super([])
  }

  get dataSource() {
    return getMockData().mockNotifications
  }

  async findAll(filters = {}) {
    await new Promise((resolve) => setTimeout(resolve, 0))

    const { limit } = filters
    const items = [...this.dataSource].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    if (typeof limit === 'number') {
      return items.slice(0, Math.max(0, limit))
    }

    return items
  }
}

