import { getDeadlineStatus } from '@/utils/formatters'

const SIX_HOURS_MS = 6 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const DUE_URGENT_WINDOW_MS = 30 * 60 * 1000

function startOfLocalDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameLocalDay(a, b) {
  return startOfLocalDay(a).getTime() === startOfLocalDay(b).getTime()
}

function isYesterdayLocal(date) {
  const day = startOfLocalDay(date)
  const yesterday = startOfLocalDay(new Date())
  yesterday.setDate(yesterday.getDate() - 1)
  return day.getTime() === yesterday.getTime()
}

function getRelativeTimeFormatter(locale) {
  return new Intl.RelativeTimeFormat(locale || 'en', { numeric: 'auto' })
}

export function formatTaskTableDateTimeFull(isoTimestamp, locale = 'en') {
  if (!isoTimestamp) return ''
  const d = new Date(isoTimestamp)
  return d.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatRelativeFromNow(isoTimestamp, locale, t) {
  const rtf = getRelativeTimeFormatter(locale)
  const target = new Date(isoTimestamp).getTime()
  const diffMs = target - Date.now()
  const absMs = Math.abs(diffMs)
  const sign = diffMs < 0 ? -1 : 1
  const absMin = Math.floor(absMs / (1000 * 60))

  if (absMin < 1) {
    if (diffMs < 0) {
      return t('dataTable.tasks.values.overdueJustNow')
    }
    return t('dataTable.tasks.values.lessThanMinute')
  }
  if (absMin < 60) {
    return rtf.format(sign * absMin, 'minute')
  }
  const absHour = Math.floor(absMin / 60)
  if (absHour < 24) {
    return rtf.format(sign * absHour, 'hour')
  }
  const absDay = Math.floor(absHour / 24)
  return rtf.format(sign * absDay, 'day')
}

function formatRelativePast(isoTimestamp, locale, t) {
  const rtf = getRelativeTimeFormatter(locale)
  const diffMs = Date.now() - new Date(isoTimestamp).getTime()
  const absMin = Math.floor(diffMs / (1000 * 60))

  if (absMin < 1) {
    return t('dataTable.tasks.values.justNow')
  }
  if (absMin < 60) {
    return rtf.format(-absMin, 'minute')
  }
  const absHour = Math.floor(absMin / 60)
  if (absHour < 24) {
    return rtf.format(-absHour, 'hour')
  }
  const absDay = Math.floor(absHour / 24)
  return rtf.format(-absDay, 'day')
}

export function getTaskDueTimestamp(task) {
  if (task?.type === 'opportunity' && task.expectedCloseDate) {
    return task.expectedCloseDate
  }
  return task?.nextActionDue ?? task?.dueDate ?? null
}

export function isLeadLqFirstAttempt(task) {
  return task?.type === 'lead'
    && task.isDisqualified !== true
    && (task.contactAttempts?.length ?? 0) === 0
}

function getDueTimePillClass(isoTimestamp) {
  const { type } = getDeadlineStatus(isoTimestamp)
  if (type === 'overdue') return 'mk-due-pill-overdue'
  if (type === 'urgent' || type === 'today') return 'mk-due-pill-urgent'
  return 'mk-due-pill-normal'
}

/**
 * @param {Object} task
 * @param {string} isoTimestamp
 * @param {string} locale
 * @param {(key: string, ...args: unknown[]) => string} t
 * @returns {{ label: string, tooltip: string|null, pillClass: string }}
 */
export function formatTaskDueTimeDisplay(task, isoTimestamp, locale, t) {
  if (!isoTimestamp) {
    return { label: '', tooltip: null, pillClass: 'mk-due-pill-normal' }
  }

  const full = formatTaskTableDateTimeFull(isoTimestamp, locale)
  const pillClass = getDueTimePillClass(isoTimestamp)
  const expired = isDueTimeExpired(isoTimestamp)

  if (expired) {
    const timePart = formatRelativePast(isoTimestamp, locale, t)
    return {
      label: t('dataTable.tasks.values.expiredWithTime', { time: timePart }),
      tooltip: full,
      pillClass: 'mk-due-pill-overdue'
    }
  }

  const diffMs = new Date(isoTimestamp).getTime() - Date.now()
  const useRelative = isLeadLqFirstAttempt(task) || Math.abs(diffMs) <= SEVEN_DAYS_MS

  if (!useRelative) {
    return { label: full, tooltip: null, pillClass }
  }

  return {
    label: formatRelativeFromNow(isoTimestamp, locale, t),
    tooltip: full,
    pillClass
  }
}

/**
 * @param {string} isoTimestamp
 * @param {string} locale
 * @param {(key: string) => string} t
 * @returns {{ label: string, tooltip: string|null }}
 */
export function formatTaskCreatedAtDisplay(isoTimestamp, locale, t) {
  if (!isoTimestamp) {
    return { label: '', tooltip: null }
  }

  const full = formatTaskTableDateTimeFull(isoTimestamp, locale)
  const date = new Date(isoTimestamp)
  const now = new Date()
  const ageMs = now.getTime() - date.getTime()

  if (ageMs >= 0 && ageMs < SIX_HOURS_MS) {
    return {
      label: formatRelativePast(isoTimestamp, locale, t),
      tooltip: full
    }
  }
  if (isSameLocalDay(date, now)) {
    return {
      label: t('dataTable.tasks.values.today'),
      tooltip: full
    }
  }
  if (isYesterdayLocal(date)) {
    return {
      label: t('dataTable.tasks.values.yesterday'),
      tooltip: full
    }
  }

  return { label: full, tooltip: null }
}

export function isDueTimeUrgent(isoTimestamp) {
  if (!isoTimestamp) return false
  const diffMs = new Date(isoTimestamp).getTime() - Date.now()
  return diffMs <= DUE_URGENT_WINDOW_MS && diffMs >= -DUE_URGENT_WINDOW_MS
}

export function isDueTimeExpired(isoTimestamp) {
  if (!isoTimestamp) return false
  return new Date(isoTimestamp).getTime() < Date.now()
}
