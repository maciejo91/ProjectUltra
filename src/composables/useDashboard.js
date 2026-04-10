import { ref, computed } from 'vue'
import { useActionableQuestions } from '@/composables/useActionableQuestions'
import { fetchTodayAppointments } from '@/api/calendar'
import {
  fetchTasksDueToday as fetchLeadTasksDueToday,
  fetchRecentlyCreatedLeads
} from '@/api/leads'
import {
  fetchTasksDueToday as fetchOppTasksDueToday,
  fetchRecentlyCreatedOpportunities
} from '@/api/opportunities'
import { useUserStore } from '@/stores/user'

const IMPORTANT_TODAY_CAP = 8
const RECENT_SINCE_HOURS = 48
const RECENT_INBOUND_LIMIT = 10

function getTodayBounds() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return { today, tomorrow }
}

export function useDashboard() {
  const userStore = useUserStore()
  const {
    questions,
    totalQuestionsCount,
    loading: questionsLoading,
    loadQuestions,
    dismissQuestion,
    addFollowUpQuestion
  } = useActionableQuestions()

  const todayAppointments = ref([])
  const todayLeadTasks = ref([])
  const todayOppTasks = ref([])
  const recentLeads = ref([])
  const recentOpportunities = ref([])
  const loadingAppointments = ref(true)
  const loadingTasks = ref(true)
  const loadingRecent = ref(true)

  const todayTasks = computed(() => {
    const leads = todayLeadTasks.value.map((lead) => ({
      ...lead,
      type: 'lead',
      taskType: 'Lead',
      dueTime: lead.nextActionDue
        ? new Date(lead.nextActionDue).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        : null,
      dueDate: lead.nextActionDue ? new Date(lead.nextActionDue) : null
    }))

    const opps = todayOppTasks.value.map((opp) => ({
      ...opp,
      type: 'opportunity',
      taskType: 'Opportunity',
      dueTime: opp.expectedCloseDate
        ? new Date(opp.expectedCloseDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        : null,
      dueDate: opp.expectedCloseDate ? new Date(opp.expectedCloseDate) : null
    }))

    return [...leads, ...opps]
  })

  function getStatusTheme(status) {
    const map = { confirmed: 'green', scheduled: 'blue', pending: 'orange', cancelled: 'red', 'no-show': 'gray' }
    return map[status] || 'gray'
  }

  const todayAppointmentItems = computed(() => {
    const items = []
    todayAppointments.value.forEach((apt) => {
      const start = new Date(apt.start)
      const sortTime = start.getTime()
      items.push({
        kind: 'appointment',
        id: `apt-${apt.id}`,
        sortTime,
        time: start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        title: apt.customer || apt.title || 'Appointment',
        subtitle: apt.vehicle ? `${apt.type} • ${apt.vehicle}` : apt.type || '',
        typeLabel: apt.status || 'Scheduled',
        typeTheme: getStatusTheme(apt.status),
        extraLabel: null,
        extraTheme: 'gray',
        opportunityId: apt.opportunityId,
        leadId: apt.leadId,
        isOverdue: sortTime < Date.now()
      })
    })
    return items.sort((a, b) => a.sortTime - b.sortTime)
  })

  const todayItems = computed(() => {
    const { today, tomorrow } = getTodayBounds()
    const items = [...todayAppointmentItems.value]

    todayTasks.value.forEach((task) => {
      const dueDate = task.dueDate || (task.nextActionDue ? new Date(task.nextActionDue) : null)
      if (!dueDate) return
      const taskDate = new Date(dueDate)
      taskDate.setHours(0, 0, 0, 0)
      if (taskDate < today || taskDate >= tomorrow) return

      const sortTime = dueDate.getTime()
      const isOverdue = sortTime < Date.now()
      const vehicle = task.requestedCar || task.vehicle
      const vehicleStr = vehicle ? `${vehicle.brand} ${vehicle.model}` : ''

      items.push({
        kind: 'task',
        id: `${task.type}-${task.id}`,
        entityId: task.id,
        entityType: task.type,
        type: task.type,
        sortTime,
        time: dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        title: task.customer?.name || 'Unknown Customer',
        subtitle: vehicleStr ? `${task.taskType || task.type} • ${vehicleStr}` : (task.taskType || task.type),
        typeLabel: task.type === 'lead' ? 'Lead' : 'Opportunity',
        typeTheme: task.type === 'lead' ? 'green' : 'purple',
        extraLabel: isOverdue ? 'OVERDUE' : task.priority === 'Hot' ? 'HOT' : null,
        extraTheme: 'red',
        isOverdue
      })
    })

    return items.sort((a, b) => a.sortTime - b.sortTime)
  })

  const importantTodayTasks = computed(() => {
    const { today, tomorrow } = getTodayBounds()
    const now = Date.now()
    const rows = []

    todayTasks.value.forEach((task) => {
      const dueDate = task.dueDate || (task.nextActionDue ? new Date(task.nextActionDue) : null)
      if (!dueDate) return
      const taskDate = new Date(dueDate)
      taskDate.setHours(0, 0, 0, 0)
      if (taskDate < today || taskDate >= tomorrow) return

      const sortTime = dueDate.getTime()
      const isOverdue = sortTime < now
      const vehicle = task.requestedCar || task.vehicle
      const vehicleStr = vehicle ? `${vehicle.brand} ${vehicle.model}` : ''
      const isHot = task.priority === 'Hot'

      rows.push({
        id: `${task.type}-${task.id}`,
        entityId: task.id,
        entityType: task.type,
        sortTime,
        time: dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        title: task.customer?.name || 'Unknown Customer',
        subtitle: vehicleStr ? `${task.taskType || task.type} • ${vehicleStr}` : (task.taskType || task.type),
        typeLabel: task.type === 'lead' ? 'Lead' : 'Opportunity',
        typeTheme: task.type === 'lead' ? 'green' : 'purple',
        extraLabel: isOverdue ? 'OVERDUE' : isHot ? 'HOT' : null,
        extraTheme: 'red',
        isOverdue,
        isHot
      })
    })

    rows.sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1
      if (a.isHot !== b.isHot) return a.isHot ? -1 : 1
      return a.sortTime - b.sortTime
    })

    return rows.slice(0, IMPORTANT_TODAY_CAP)
  })

  const recentInboundItems = computed(() => {
    const merged = []

    recentLeads.value.forEach((lead) => {
      const vehicle = lead.requestedCar || lead.vehicle
      const vehicleStr = vehicle ? `${vehicle.brand} ${vehicle.model}` : ''
      const created = lead.createdAt ? new Date(lead.createdAt) : null
      const sortTime = created ? created.getTime() : 0
      merged.push({
        id: `recent-lead-${lead.id}`,
        kind: 'recent',
        entityId: lead.id,
        entityType: 'lead',
        sortTime,
        time: created
          ? created.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
          : '',
        title: lead.customer?.name || 'Unknown Customer',
        subtitle: vehicleStr ? `Lead • ${vehicleStr}` : 'Lead',
        typeLabel: 'Lead',
        typeTheme: 'green',
        extraLabel: null,
        extraTheme: 'gray',
        isOverdue: false
      })
    })

    recentOpportunities.value.forEach((opp) => {
      const vehicle = opp.requestedCar || opp.vehicle
      const vehicleStr = vehicle ? `${vehicle.brand} ${vehicle.model}` : ''
      const created = opp.createdAt ? new Date(opp.createdAt) : null
      const sortTime = created ? created.getTime() : 0
      merged.push({
        id: `recent-opp-${opp.id}`,
        kind: 'recent',
        entityId: opp.id,
        entityType: 'opportunity',
        sortTime,
        time: created
          ? created.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
          : '',
        title: opp.customer?.name || 'Unknown Customer',
        subtitle: vehicleStr ? `Opportunity • ${vehicleStr}` : 'Opportunity',
        typeLabel: 'Opportunity',
        typeTheme: 'purple',
        extraLabel: null,
        extraTheme: 'gray',
        isOverdue: false
      })
    })

    return merged.sort((a, b) => b.sortTime - a.sortTime).slice(0, RECENT_INBOUND_LIMIT)
  })

  const loadingToday = computed(() => loadingAppointments.value || loadingTasks.value)

  const notifications = computed(() => questions.value)

  async function loadDashboard() {
    loadingAppointments.value = true
    loadingTasks.value = true
    loadingRecent.value = true

    Promise.all([
      loadQuestions(),

      fetchTodayAppointments().then((data) => {
        todayAppointments.value = data
        loadingAppointments.value = false
      }),

      Promise.all([
        userStore.canAccessLeads() ? fetchLeadTasksDueToday().then((data) => { todayLeadTasks.value = data }) : Promise.resolve(),
        userStore.canAccessOpportunities() ? fetchOppTasksDueToday().then((data) => { todayOppTasks.value = data }) : Promise.resolve()
      ]).then(() => {
        loadingTasks.value = false
      }),

      Promise.all([
        userStore.canAccessLeads()
          ? fetchRecentlyCreatedLeads({ sinceHours: RECENT_SINCE_HOURS, limit: RECENT_INBOUND_LIMIT }).then((data) => {
              recentLeads.value = data
            })
          : Promise.resolve(),
        userStore.canAccessOpportunities()
          ? fetchRecentlyCreatedOpportunities({ sinceHours: RECENT_SINCE_HOURS, limit: RECENT_INBOUND_LIMIT }).then((data) => {
              recentOpportunities.value = data
            })
          : Promise.resolve()
      ]).then(() => {
        loadingRecent.value = false
      })
    ]).catch(() => {
      loadingAppointments.value = false
      loadingTasks.value = false
      loadingRecent.value = false
    })
  }

  return {
    notifications,
    totalNotificationsCount: totalQuestionsCount,
    todayItems,
    todayAppointmentItems,
    importantTodayTasks,
    recentInboundItems,
    loadingNotifications: questionsLoading,
    loadingToday,
    loadingRecent,
    loadDashboard,
    dismissQuestion,
    addFollowUpQuestion
  }
}
