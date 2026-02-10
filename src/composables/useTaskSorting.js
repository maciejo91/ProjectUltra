import { useSettingsStore } from '@/stores/settings'
import { calculateLeadUrgency } from '@/composables/useLeadUrgency'

/**
 * Map opportunity/lead priority label to a numeric urgency score using the same thresholds as leads.
 * Used so "urgent first" sorts leads and opportunities on one scale.
 */
function priorityToUrgencyScore(priority, thresholds) {
  const hot = thresholds?.hot ?? 80
  const warm = thresholds?.warm ?? 50
  const standard = thresholds?.standard ?? 20
  const p = (priority || 'Cold').toLowerCase()
  if (p === 'hot') return (hot + 100) / 2
  if (p === 'warm') return (warm + hot - 1) / 2
  if (p === 'standard' || p === 'normal') return (standard + warm - 1) / 2
  return Math.max(0, (standard - 1) / 2)
}

/**
 * Composable for task sorting logic
 * Handles sorting tasks by urgency and date (recent-first, urgent-first, oldest-first).
 * Assignee filtering (assigned-to-me, assigned-to-my-team) is handled by useTaskFilters.
 */
export function useTaskSorting() {
  const settingsStore = useSettingsStore()

  /**
   * Sort tasks based on sort option
   * @param {Array} tasks - Tasks to sort
   * @param {string} sortOption - Sort option: '', 'none', 'urgent-first', 'recent-first', 'oldest-first'
   * @returns {Array} Sorted tasks
   */
  const sortTasks = (tasks, sortOption) => {
    if (!sortOption || sortOption === '' || sortOption === 'none') {
      return tasks
    }

    if (sortOption === 'recent-first') {
      return [...tasks].sort((a, b) => {
        const dateA = new Date(a.lastActivity || a.createdAt || 0)
        const dateB = new Date(b.lastActivity || b.createdAt || 0)
        return dateB - dateA
      })
    }

    if (sortOption === 'oldest-first') {
      return [...tasks].sort((a, b) => {
        const dateA = new Date(a.lastActivity || a.createdAt || 0)
        const dateB = new Date(b.lastActivity || b.createdAt || 0)
        return dateA - dateB
      })
    }

    if (sortOption === 'urgent-first') {
      const urgencyEnabled = settingsStore.getSetting('urgencyEnabled') !== false
      const thresholds = settingsStore.getSetting('urgencyThresholds') || { hot: 80, warm: 50, standard: 20 }

      if (urgencyEnabled) {
        const tasksWithScore = tasks.map(task => {
          if (task.type === 'lead') {
            const score = task.urgencyScore ?? calculateLeadUrgency(task).score
            const level = task.urgencyLevel ?? calculateLeadUrgency(task).level
            return {
              ...task,
              urgencyScore: score,
              urgencyLevel: level,
              _sortUrgencyScore: score
            }
          }
          if (task.type === 'opportunity') {
            const score = priorityToUrgencyScore(task.priority, thresholds)
            return { ...task, _sortUrgencyScore: score }
          }
          return { ...task, _sortUrgencyScore: 0 }
        })

        // Single order: by urgency score DESC, then by date DESC (tiebreaker)
        return [...tasksWithScore].sort((a, b) => {
          const scoreA = a._sortUrgencyScore ?? 0
          const scoreB = b._sortUrgencyScore ?? 0
          if (scoreA !== scoreB) return scoreB - scoreA
          const dateA = new Date(a.lastActivity || a.createdAt || 0)
          const dateB = new Date(b.lastActivity || b.createdAt || 0)
          return dateB - dateA
        })
      }

      // Urgency disabled: sort by priority (Hot first) then date, for both types
      return [...tasks].sort((a, b) => {
        const scoreA = priorityToUrgencyScore(a.priority, thresholds)
        const scoreB = priorityToUrgencyScore(b.priority, thresholds)
        if (scoreA !== scoreB) return scoreB - scoreA
        const dateA = new Date(a.lastActivity || a.createdAt || 0)
        const dateB = new Date(b.lastActivity || b.createdAt || 0)
        return dateB - dateA
      })
    }

    return tasks
  }

  return {
    sortTasks
  }
}



