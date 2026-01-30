import { useSettingsStore } from '@/stores/settings'
import { calculateLeadUrgency } from '@/composables/useLeadUrgency'

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
   * @param {string} sortOption - Sort option: '', 'none', 'urgent-first', 'assigned-to-me', 'assigned-to-my-team', 'recent-first'
   * @returns {Array} Sorted tasks
   */
  const sortTasks = (tasks, sortOption) => {
    // No sort or 'none': return tasks as-is (no sorting applied)
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
      
      if (urgencyEnabled) {
        // Calculate urgency scores for leads
        const tasksWithUrgency = tasks.map(task => {
          if (task.type === 'lead' && !task.urgencyScore) {
            const urgencyResult = calculateLeadUrgency(task)
            return {
              ...task,
              urgencyScore: urgencyResult.score,
              urgencyLevel: urgencyResult.level
            }
          }
          return task
        })

        // Sort: leads by urgency score DESC, then by createdAt DESC (tiebreaker)
        return [...tasksWithUrgency].sort((a, b) => {
          // If both are leads, sort by urgency score
          if (a.type === 'lead' && b.type === 'lead') {
            const scoreA = a.urgencyScore || 0
            const scoreB = b.urgencyScore || 0
            if (scoreA !== scoreB) {
              return scoreB - scoreA // Higher score first
            }
            // Tiebreaker: most recent first
            const dateA = new Date(a.createdAt || 0)
            const dateB = new Date(b.createdAt || 0)
            return dateB - dateA
          }
          // If one is lead and one is opportunity, leads come first when urgency sorting
          if (a.type === 'lead' && b.type === 'opportunity') return -1
          if (a.type === 'opportunity' && b.type === 'lead') return 1
          // Both opportunities: use priority then date
          if (a.priority === 'Hot' && b.priority !== 'Hot') return -1
          if (a.priority !== 'Hot' && b.priority === 'Hot') return 1
          const dateA = new Date(a.lastActivity || a.createdAt || 0)
          const dateB = new Date(b.lastActivity || b.createdAt || 0)
          return dateB - dateA
        })
      } else {
        // Fallback to priority-based sorting if urgency disabled
        return [...tasks].sort((a, b) => {
          // Hot priority first
          if (a.priority === 'Hot' && b.priority !== 'Hot') return -1
          if (a.priority !== 'Hot' && b.priority === 'Hot') return 1
          // Then by date (most recent first)
          const dateA = new Date(a.lastActivity || a.createdAt || 0)
          const dateB = new Date(b.lastActivity || b.createdAt || 0)
          return dateB - dateA
        })
      }
    }

    return tasks
  }

  return {
    sortTasks
  }
}



