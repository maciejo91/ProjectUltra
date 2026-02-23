import { ref, computed } from 'vue'
import { useActionableQuestions } from '@/composables/useActionableQuestions'
import { fetchTodayAppointments } from '@/api/calendar'
import { fetchTasksDueToday as fetchLeadTasksDueToday } from '@/api/leads'
import { fetchTasksDueToday as fetchOppTasksDueToday } from '@/api/opportunities'
import { useUserStore } from '@/stores/user'

export function useDashboard() {
  const userStore = useUserStore()
  const { questions, totalQuestionsCount, loading: questionsLoading, loadQuestions } = useActionableQuestions()
  
  const todayAppointments = ref([])
  const todayLeadTasks = ref([])
  const todayOppTasks = ref([])
  const loadingAppointments = ref(true)
  const loadingTasks = ref(true)

  // Computed: All today's tasks (leads + opportunities)
  const todayTasks = computed(() => {
    const leads = todayLeadTasks.value.map(lead => ({
      ...lead,
      type: 'lead',
      taskType: 'Lead',
      dueTime: lead.nextActionDue ? new Date(lead.nextActionDue).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
      dueDate: lead.nextActionDue ? new Date(lead.nextActionDue) : null
    }))
    
    const opps = todayOppTasks.value.map(opp => ({
      ...opp,
      type: 'opportunity',
      taskType: 'Opportunity',
      dueTime: opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : null,
      dueDate: opp.expectedCloseDate ? new Date(opp.expectedCloseDate) : null
    }))
    
    return [...leads, ...opps]
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const todayItems = computed(() => {
    const items = []

    todayAppointments.value.forEach((apt) => {
      const start = new Date(apt.start)
      const sortTime = start.getTime()
      items.push({
        kind: 'appointment',
        id: `apt-${apt.id}`,
        sortTime,
        time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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
        type: task.type,
        sortTime,
        time: dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
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

  function getStatusTheme(status) {
    const map = { confirmed: 'green', scheduled: 'blue', pending: 'orange', cancelled: 'red', 'no-show': 'gray' }
    return map[status] || 'gray'
  }

  const loadingToday = computed(() => loadingAppointments.value || loadingTasks.value)

  // Notifications (from actionable questions)
  const notifications = computed(() => questions.value)

  async function loadDashboard() {
    // Load all data in parallel with individual loading states
    Promise.all([
      // Load actionable questions
      loadQuestions(),
      
      // Load today's appointments
      fetchTodayAppointments().then(data => {
        todayAppointments.value = data
        loadingAppointments.value = false
      }),
      
      // Load today's tasks based on user role
      Promise.all([
        userStore.canAccessLeads() ? fetchLeadTasksDueToday().then(data => { todayLeadTasks.value = data }) : Promise.resolve(),
        userStore.canAccessOpportunities() ? fetchOppTasksDueToday().then(data => { todayOppTasks.value = data }) : Promise.resolve()
      ]).then(() => {
        loadingTasks.value = false
      })
    ]).catch(error => {
      console.error('Error loading dashboard:', error)
      loadingAppointments.value = false
      loadingTasks.value = false
    })
  }

  return {
    notifications,
    totalNotificationsCount: totalQuestionsCount,
    todayItems,
    loadingNotifications: questionsLoading,
    loadingToday,
    loadDashboard
  }
}


