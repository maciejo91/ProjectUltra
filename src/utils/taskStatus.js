import { getDeadlineStatus } from '@/utils/formatters'
import { getDisplayStage } from '@/utils/stageMapper'
import { LEAD_STAGES, OPPORTUNITY_STAGES } from '@/utils/stageMapper/constants'

const CLOSED_OPPORTUNITY_STAGES = [
  OPPORTUNITY_STAGES.CLOSED_WON,
  OPPORTUNITY_STAGES.CLOSED_LOST,
  OPPORTUNITY_STAGES.ABANDONED
]

export const TASK_LEAD_REQUEST_STATUS = {
  VALID: LEAD_STAGES.VALID,
  IN_PROGRESS: 'In progress'
}

export const TASK_TABLE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  CLOSED: 'closed'
}

function getTaskDueTimestamp(task) {
  if (task?.type === 'opportunity' && task.expectedCloseDate) {
    return task.expectedCloseDate
  }
  return task?.nextActionDue ?? task?.dueDate ?? null
}

export function isTaskDueExpired(task) {
  const due = getTaskDueTimestamp(task)
  if (!due) return false
  return new Date(due).getTime() < Date.now()
}

function isTaskClosed(task) {
  if (task?.isDisqualified === true) return true
  if (task?.type === 'opportunity') {
    const stage = getDisplayStage(task, 'opportunity')
    return CLOSED_OPPORTUNITY_STAGES.includes(stage)
  }
  return false
}

/**
 * Unified status for tasks table: Open / In progress / Closed
 * @param {Object} task
 * @returns {'open'|'in_progress'|'closed'}
 */
export function getTaskTableStatus(task) {
  if (isTaskClosed(task)) {
    return TASK_TABLE_STATUS.CLOSED
  }
  if (task?.type === 'lead') {
    const attempts = task.contactAttempts?.length ?? 0
    return attempts === 0 ? TASK_TABLE_STATUS.OPEN : TASK_TABLE_STATUS.IN_PROGRESS
  }
  return TASK_TABLE_STATUS.IN_PROGRESS
}

export function getTaskTableStatusBadgeClass(status) {
  if (status === TASK_TABLE_STATUS.OPEN) return 'bg-blue-50 text-blue-700'
  if (status === TASK_TABLE_STATUS.IN_PROGRESS) return 'bg-muted text-muted-foreground'
  if (status === TASK_TABLE_STATUS.CLOSED) return 'bg-badge-green text-emerald-700'
  return 'bg-muted text-muted-foreground'
}

/**
 * Request status for tasks table (lead qualification): Valid at 0 attempts, In progress from 1+.
 * Closed leads and opportunities use the standard display stage.
 * @param {Object} task - Task (lead or opportunity)
 * @returns {string}
 */
export function getTaskRequestStatus(task) {
  if (task?.type === 'lead' && task.isDisqualified !== true) {
    const attempts = task.contactAttempts?.length ?? 0
    return attempts === 0 ? TASK_LEAD_REQUEST_STATUS.VALID : TASK_LEAD_REQUEST_STATUS.IN_PROGRESS
  }
  return getDisplayStage(task, task?.type === 'lead' ? 'lead' : 'opportunity')
}

/**
 * @param {string} status - Value from getTaskRequestStatus
 * @param {(key: string) => string} t - vue-i18n t function
 * @returns {string}
 */
export function translateTaskRequestStatus(status, t) {
  if (status === TASK_LEAD_REQUEST_STATUS.VALID) {
    return t('dataTable.tasks.requestStatuses.valid')
  }
  if (status === TASK_LEAD_REQUEST_STATUS.IN_PROGRESS) {
    return t('dataTable.tasks.requestStatuses.inProgress')
  }
  return status
}

/**
 * @param {'open'|'in_progress'|'closed'} status
 * @param {(key: string) => string} t
 * @returns {string}
 */
export function translateTaskTableStatus(status, t) {
  if (status === TASK_TABLE_STATUS.OPEN) {
    return t('dataTable.tasks.statuses.open')
  }
  if (status === TASK_TABLE_STATUS.IN_PROGRESS) {
    return t('dataTable.tasks.statuses.inProgress')
  }
  if (status === TASK_TABLE_STATUS.CLOSED) {
    return t('dataTable.tasks.statuses.closed')
  }
  return status
}

/**
 * Task-level status for table Status column: Overdue / In progress / Open
 * @param {Object} task - Task (lead or opportunity)
 * @param {number} maxAttempts - Max contact attempts from settings
 * @returns {'overdue'|'in_progress'|'open'}
 */
export function getTaskStatus(task, maxAttempts = 5) {
  const due = task.type === 'opportunity' && task.expectedCloseDate
    ? task.expectedCloseDate
    : (task.nextActionDue ?? task.dueDate)
  const deadlineStatus = getDeadlineStatus(due)
  if (deadlineStatus.type === 'overdue') return 'overdue'

  const attempts = task.contactAttempts?.length ?? 0
  if (attempts > 0 && attempts < maxAttempts) return 'in_progress'
  return 'open'
}
