/**
 * Composable for task sorting logic
 * Handles sorting tasks by date (recent-first, oldest-first). No sort (none) leaves order unchanged.
 * Assignee filtering is handled by useTaskFilters.
 */
export function useTaskSorting() {
  /**
   * Sort tasks based on sort option
   * @param {Array} tasks - Tasks to sort
   * @param {string} sortOption - Sort option: '', 'none', 'recent-first', 'oldest-first'
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

    return tasks
  }

  return {
    sortTasks
  }
}



