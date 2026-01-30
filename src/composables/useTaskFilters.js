import { computed } from 'vue'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import { useSettingsStore } from '@/stores/settings'
import { getDisplayStage } from '@/utils/stageMapper'
import { calculateLeadUrgency } from '@/composables/useLeadUrgency'

/**
 * Composable for task filtering logic
 * Handles combining leads and opportunities, role-based filtering, and type filtering
 * @param {Ref<boolean>} showClosed - Ref to showClosed state
 */
export function useTaskFilters(showClosed) {
  const leadsStore = useLeadsStore()
  const opportunitiesStore = useOpportunitiesStore()
  const userStore = useUserStore()
  const usersStore = useUsersStore()

  // Combine leads and opportunities with type property and composite key
  // Filter based on user role
  const allTasks = computed(() => {
    // Filter out disqualified leads (unless showClosed is enabled)
    const visibleLeads = showClosed.value 
      ? leadsStore.leads 
      : leadsStore.leads.filter(lead => !lead.isDisqualified)
    
    const leads = visibleLeads.map(lead => {
      // Calculate displayStage for lead
      const displayStage = getDisplayStage(lead, 'lead')
      
      // Ensure customer object is preserved
      const task = { 
        ...lead, 
        type: 'lead', 
        compositeId: `lead-${lead.id}`,
        displayStage
      }
      // Explicitly ensure customer is present
      if (!task.customer && lead.customer) {
        task.customer = lead.customer
      }
      return task
    })
    
    const opportunities = opportunitiesStore.opportunities.map(opp => {
      // Calculate displayStage for opportunity
      const displayStage = getDisplayStage(opp, 'opportunity')
      
      // Ensure customer object is preserved
      const task = { 
        ...opp, 
        type: 'opportunity', 
        compositeId: `opportunity-${opp.id}`,
        displayStage
      }
      // Explicitly ensure customer is present
      if (!task.customer && opp.customer) {
        task.customer = opp.customer
      }
      return task
    })
    
    // Filter by role
    let tasks = []
    if (userStore.isOperator()) {
      // Operators only see leads
      tasks = leads
    } else if (userStore.isSalesman()) {
      // Salesmen only see opportunities
      tasks = opportunities
    } else {
      // Managers see everything
      tasks = [...leads, ...opportunities]
    }
    
    return tasks
  })

  // Filter tasks by type (supports array of types)
  const filterByType = (tasks, typeFilters) => {
    if (!typeFilters || typeFilters.length === 0) return tasks
    if (Array.isArray(typeFilters)) {
      return tasks.filter(task => typeFilters.includes(task.type))
    }
    // Legacy support for single string filter
    if (typeFilters === 'all') return tasks
    return tasks.filter(task => task.type === typeFilters)
  }

  // Filter tasks due in 24 hours
  const filterByDueIn24Hours = (tasks) => {
    const now = new Date()
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    return tasks.filter(task => {
      if (!task.nextActionDue) return false
      const dueDate = new Date(task.nextActionDue)
      return dueDate >= now && dueDate <= in24Hours
    })
  }

  // Filter tasks that need to be called again (have nextActionDue set)
  const filterByToBeCalled = (tasks) => {
    return tasks.filter(task => task.nextActionDue != null)
  }

  // Filter leads created within the last hour
  const filterByLeadsCreated1Hour = (tasks) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    return tasks.filter(task => {
      if (task.type !== 'lead') return false
      if (!task.createdAt) return false
      const createdAt = new Date(task.createdAt)
      return createdAt >= oneHourAgo
    })
  }

  const filterByAssignedToMe = (tasks) => {
    const currentUserName = userStore.currentUser?.name
    if (!currentUserName) return []
    return tasks.filter(task => task.assignee === currentUserName)
  }

  const filterByAssignedToMyTeam = (tasks) => {
    const currentUser = userStore.currentUser
    if (!currentUser) return []
    let teamMemberNames = []
    if (currentUser.role === 'manager') {
      teamMemberNames = usersStore.users.map(u => u.name)
    } else if (currentUser.role === 'salesman') {
      teamMemberNames = usersStore.users.filter(u => u.role === 'salesman').map(u => u.name)
    } else if (currentUser.role === 'operator') {
      teamMemberNames = usersStore.users.filter(u => u.role === 'operator').map(u => u.name)
    }
    return tasks.filter(task => teamMemberNames.includes(task.assignee))
  }

  const applyFilters = (tasks, activeFilters) => {
    if (!activeFilters || activeFilters.length === 0) {
      return tasks
    }

    let filtered = [...tasks]

    // Extract type filters
    const typeFilters = activeFilters.filter(f => f === 'lead' || f === 'opportunity')
    if (typeFilters.length > 0) {
      filtered = filterByType(filtered, typeFilters)
    }

    // Apply other filters
    activeFilters.forEach(filter => {
      switch (filter) {
        case 'due-in-24h':
          filtered = filterByDueIn24Hours(filtered)
          break
        case 'to-be-called':
          filtered = filterByToBeCalled(filtered)
          break
        case 'leads-1h':
          filtered = filterByLeadsCreated1Hour(filtered)
          break
        case 'assigned-to-me':
          filtered = filterByAssignedToMe(filtered)
          break
        case 'assigned-to-my-team':
          filtered = filterByAssignedToMyTeam(filtered)
          break
      }
    })

    return filtered
  }

  // Check if user has both leads and opportunities (only show filter if they have both types)
  const shouldShowTypeFilter = computed(() => {
    const hasLeads = allTasks.value.some(task => task.type === 'lead')
    const hasOpportunities = allTasks.value.some(task => task.type === 'opportunity')
    return hasLeads && hasOpportunities
  })

  return {
    allTasks,
    filterByType,
    filterByDueIn24Hours,
    filterByToBeCalled,
    filterByLeadsCreated1Hour,
    filterByAssignedToMe,
    filterByAssignedToMyTeam,
    applyFilters,
    shouldShowTypeFilter
  }
}

