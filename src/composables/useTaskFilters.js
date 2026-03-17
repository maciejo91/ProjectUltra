import { computed } from 'vue'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import { useSettingsStore } from '@/stores/settings'
import { getDisplayStage } from '@/utils/stageMapper'
import { OPPORTUNITY_STAGES } from '@/utils/stageMapper/constants'
import { calculateLeadUrgency } from '@/composables/useLeadUrgency'

const CLOSED_OPPORTUNITY_STAGES = [OPPORTUNITY_STAGES.CLOSED_WON, OPPORTUNITY_STAGES.CLOSED_LOST, OPPORTUNITY_STAGES.ABANDONED]

/** Map opportunity/lead priority label to urgency level (HOT/WARM/STANDARD/COLD) for display. */
function priorityToUrgencyLevel(priority) {
  const p = (priority || '').toLowerCase()
  if (p === 'hot') return 'HOT'
  if (p === 'warm') return 'WARM'
  if (p === 'standard' || p === 'normal') return 'STANDARD'
  return 'COLD'
}

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
  const settingsStore = useSettingsStore()

  // Combine leads and opportunities with type property and composite key
  // Filter based on user role. Depends on urgency/leadScoring settings so urgency is recomputed when they change.
  const allTasks = computed(() => {
    const urgencyEnabled = settingsStore.getSetting('urgencyEnabled') !== false
    const _urgencyThresholds = settingsStore.getSetting('urgencyThresholds')
    const _leadScoring = settingsStore.getSetting('leadScoring')

    // Filter out disqualified leads (unless showClosed is enabled)
    const visibleLeads = showClosed.value
      ? leadsStore.leads
      : leadsStore.leads.filter(lead => !lead.isDisqualified)

    const leads = visibleLeads.map(lead => {
      const displayStage = getDisplayStage(lead, 'lead')

      const task = {
        ...lead,
        type: 'lead',
        compositeId: `lead-${lead.id}`,
        displayStage
      }
      if (!task.customer && lead.customer) {
        task.customer = lead.customer
      }

      if (urgencyEnabled) {
        const urgencyResult = calculateLeadUrgency(lead)
        task.urgencyScore = urgencyResult.score
        task.urgencyLevel = urgencyResult.level
      }

      return task
    })
    
    const visibleOpportunities = showClosed.value
      ? opportunitiesStore.opportunities
      : opportunitiesStore.opportunities.filter(opp => {
          const displayStage = getDisplayStage(opp, 'opportunity')
          // Include when stage is unknown (null/undefined) so we never hide opportunities by mistake
          if (displayStage == null) return true
          return !CLOSED_OPPORTUNITY_STAGES.includes(displayStage)
        })

    const opportunities = visibleOpportunities.map(opp => {
      const displayStage = getDisplayStage(opp, 'opportunity')

      const task = {
        ...opp,
        type: 'opportunity',
        compositeId: `opportunity-${opp.id}`,
        displayStage
      }
      if (!task.customer && opp.customer) {
        task.customer = opp.customer
      }
      if (urgencyEnabled) {
        task.urgencyLevel = priorityToUrgencyLevel(opp.priority)
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

  // Same as allTasks but always includes closed leads/opportunities (for keeping task detail open when task was just closed)
  const allTasksIncludingClosed = computed(() => {
    const urgencyEnabled = settingsStore.getSetting('urgencyEnabled') !== false

    const leads = leadsStore.leads.map(lead => {
      const displayStage = getDisplayStage(lead, 'lead')
      const task = {
        ...lead,
        type: 'lead',
        compositeId: `lead-${lead.id}`,
        displayStage
      }
      if (!task.customer && lead.customer) task.customer = lead.customer
      if (urgencyEnabled) {
        const urgencyResult = calculateLeadUrgency(lead)
        task.urgencyScore = urgencyResult.score
        task.urgencyLevel = urgencyResult.level
      }
      return task
    })

    const opportunities = opportunitiesStore.opportunities.map(opp => {
      const displayStage = getDisplayStage(opp, 'opportunity')
      const task = {
        ...opp,
        type: 'opportunity',
        compositeId: `opportunity-${opp.id}`,
        displayStage
      }
      if (!task.customer && opp.customer) task.customer = opp.customer
      if (urgencyEnabled) task.urgencyLevel = priorityToUrgencyLevel(opp.priority)
      return task
    })

    let tasks = []
    if (userStore.isOperator()) tasks = leads
    else if (userStore.isSalesman()) tasks = opportunities
    else tasks = [...leads, ...opportunities]
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

  // Filter tasks with recall badge (leads with scheduled recall appointment)
  const filterByRecallAppointment = (tasks) => {
    return tasks.filter(task => task.type === 'lead' && task.scheduledRecallAppointment?.date)
  }

  // Filter tasks at final attempt (e.g. 4/5 when max is 5)
  const filterByFinalAttempt = (tasks) => {
    const maxAttempts = settingsStore.getSetting('maxContactAttempts') ?? 5
    return tasks.filter(task => {
      const attempts = task.contactAttempts?.length ?? 0
      return attempts === maxAttempts - 1 && attempts > 0
    })
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
        case 'recall-appointment':
          filtered = filterByRecallAppointment(filtered)
          break
        case 'final-attempt':
          filtered = filterByFinalAttempt(filtered)
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
    allTasksIncludingClosed,
    filterByType,
    filterByDueIn24Hours,
    filterByRecallAppointment,
    filterByFinalAttempt,
    filterByLeadsCreated1Hour,
    filterByAssignedToMe,
    filterByAssignedToMyTeam,
    applyFilters,
    shouldShowTypeFilter
  }
}

