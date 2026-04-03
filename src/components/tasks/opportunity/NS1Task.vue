<template>
  <div class="space-y-4">
    <!-- Title and Description Card -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h4 class="font-bold text-foreground text-sm mb-1">1st No-Show Follow-up Task</h4>
      <p class="text-sm text-muted-foreground">
        Appointment was scheduled for {{ appointmentDate }} but customer did not show up. {{ noShowMessage }}
      </p>
    </div>

    <!-- Assignment Section -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h5 class="font-semibold text-foreground text-sm mb-4">Assign to</h5>
        
        <div class="grid grid-cols-2 gap-4">
          <!-- Team -->
          <div>
            <Label class="block text-sm font-medium text-muted-foreground mb-1.5">Team <span class="text-red-600">*</span></Label>
            <SelectMenu
              v-model="selectedTeamId"
              :items="teamSelectOptions"
              placeholder="Search and select team..."
              value-key="id"
              class="w-full"
            >
              <template #item="{ item }">
                <div class="flex items-center gap-2">
                  <span class="text-muted-foreground">{{ item.dealership || 'No location' }}</span>
                  <span class="text-muted-foreground">→</span>
                  <span class="font-medium text-foreground">{{ item.name }}</span>
                </div>
              </template>
            </SelectMenu>
          </div>

          <!-- Salesperson -->
          <div>
            <Label class="block text-sm font-medium text-muted-foreground mb-1.5">Salesperson <span class="text-muted-foreground text-sm">(optional)</span></Label>
            <SelectMenu
              v-model="selectedSalesmanId"
              :items="salespersonSelectOptions"
              :disabled="!selectedTeam"
              placeholder="Search and select salesperson..."
              value-key="id"
              class="w-full"
            >
              <template #item="{ item }">
                <div class="flex items-center gap-2">
                  <div
                    class="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                    :class="getRoleAvatarClass(item.role)"
                  >
                    {{ getInitials(item.name) }}
                  </div>
                  <span class="font-medium text-foreground">{{ item.name }}</span>
                </div>
              </template>
            </SelectMenu>
          </div>
        </div>

        <!-- Notes for assignee -->
        <div class="mt-4">
          <Label class="block text-sm font-medium text-muted-foreground mb-1.5">Notes for assignee</Label>
          <Textarea 
            v-model="noteForSellers"
            rows="4" 
            class="w-full"
            placeholder="Add any notes or instructions for the assignee..."
          />
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { Label, Textarea } from '@motork/component-library/future/primitives'
import { SelectMenu } from '@motork/component-library/future/components'
import { useUsersStore } from '@/stores/users'
import { useUserStore } from '@/stores/user'
import { useOpportunitiesStore } from '@/stores/opportunities'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  },
  scheduledAppointment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['assigned', 'cancel'])

const usersStore = useUsersStore()
const userStore = useUserStore()
const opportunitiesStore = useOpportunitiesStore()

// Assignment state
const selectedTeam = ref(null)
const selectedSalesman = ref(null)
const noteForSellers = ref('')

const assignableUsers = computed(() => usersStore.assignableUsers)
const assignableTeams = computed(() => usersStore.assignableTeams)

const teamSelectOptions = computed(() => {
  return assignableTeams.value.map(team => ({
    ...team,
    label: `${team.dealership || 'No location'} → ${team.name}`,
    value: team.id
  }))
})

const salespersonSelectOptions = computed(() => {
  if (!selectedTeam.value) return []
  
  const team = selectedTeam.value
  const users = assignableUsers.value?.filter(user => 
    user.team === team.name || user.teamId === team.id
  ) || []
  
  return users.map(user => ({
    ...user,
    label: user.name,
    value: user.id
  }))
})

const selectedTeamId = computed({
  get: () => selectedTeam.value?.id || null,
  set: (id) => {
    if (!id) {
      selectedTeam.value = null
      return
    }
    const team = assignableTeams.value?.find(t => t.id === id)
    selectedTeam.value = team || null
    if (team) {
      selectedSalesman.value = null
    }
  }
})

const selectedSalesmanId = computed({
  get: () => selectedSalesman.value?.id || null,
  set: (id) => {
    if (!id) {
      selectedSalesman.value = null
      return
    }
    const user = salespersonSelectOptions.value.find(u => u.id === id)
    selectedSalesman.value = user || null
  }
})

// Helper functions
const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getRoleAvatarClass = (role) => {
  const classes = {
    'manager': 'bg-blue-100 text-blue-700',
    'salesman': 'bg-purple-100 text-purple-700',
    'operator': 'bg-orange-100 text-orange-700'
  }
  return classes[role] || 'bg-muted text-muted-foreground'
}

// Validation - expose to parent
const canSubmit = computed(() => {
  return !!selectedTeam.value
})

// Submit method - called by parent
async function submit() {
  if (!canSubmit.value) return
  
  const assigneeName = selectedSalesman.value?.name || selectedTeam.value?.name
  
  const updateData = {
    assignee: assigneeName
  }
  
  if (noteForSellers.value) {
    updateData.assignmentNote = noteForSellers.value
  }
  
  await opportunitiesStore.updateOpportunity(props.opportunity.id, updateData)
  
  await opportunitiesStore.addActivity(props.opportunity.id, {
    type: 'assignment',
    user: userStore.currentUser?.name || 'You',
    action: 'assigned opportunity',
    content: `Opportunity assigned to ${assigneeName}${noteForSellers.value ? ` with note: ${noteForSellers.value}` : ''}`,
    timestamp: new Date().toISOString()
  })
  
  emit('assigned', {
    opportunity: props.opportunity,
    assignee: assigneeName,
    note: noteForSellers.value
  })
}

// Expose for parent component
defineExpose({
  canSubmit,
  submit
})

const noShowMessage = computed(() => {
  return 'Follow up with customer to understand the situation and book another appointment.'
})

const appointmentDate = computed(() => {
  if (!props.scheduledAppointment?.start) return 'unknown date'
  const date = new Date(props.scheduledAppointment.start)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// Initialize assignment from current opportunity assignee
onMounted(() => {
  if (props.opportunity.assignee && !selectedTeam.value && !selectedSalesman.value) {
    const assigneeUser = assignableUsers.value?.find(u => u.name === props.opportunity.assignee)
    const assigneeTeam = assignableTeams.value?.find(t => t.name === props.opportunity.assignee)
    
    if (assigneeUser) {
      const userTeam = assignableTeams.value?.find(team => 
        team.name === assigneeUser.team || team.id === assigneeUser.teamId
      )
      if (userTeam) {
        selectedTeam.value = userTeam
        selectedSalesman.value = assigneeUser
      }
    } else if (assigneeTeam) {
      selectedTeam.value = assigneeTeam
    }
  }
  
  if (props.opportunity.assignmentNote) {
    noteForSellers.value = props.opportunity.assignmentNote
  }
})

watch(() => props.opportunity.assignee, (newAssignee) => {
  if (newAssignee && !selectedTeam.value && !selectedSalesman.value) {
    const assigneeUser = assignableUsers.value?.find(u => u.name === newAssignee)
    const assigneeTeam = assignableTeams.value?.find(t => t.name === newAssignee)
    
    if (assigneeUser) {
      const userTeam = assignableTeams.value?.find(team => 
        team.name === assigneeUser.team || team.id === assigneeUser.teamId
      )
      if (userTeam) {
        selectedTeam.value = userTeam
        selectedSalesman.value = assigneeUser
      }
    } else if (assigneeTeam) {
      selectedTeam.value = assigneeTeam
    }
  }
})
</script>
