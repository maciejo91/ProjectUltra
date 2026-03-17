import { getDeadlineStatus } from '@/utils/formatters'

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
