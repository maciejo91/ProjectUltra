<template>
  <div class="space-y-4">
    <!-- Step 1: Event Type Selection (same as LQTask) -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <Label class="form-label mb-2">Event type <span class="text-red-600">*</span></Label>
      <SelectMenu
        v-model="eventType"
        :items="eventTypeOptionsForSelect"
        placeholder="Select event type..."
        value-key="value"
        class="w-full"
      >
        <template #item="{ item }">
          <span>{{ item.label }}</span>
        </template>
      </SelectMenu>
    </div>

    <!-- Step 2: Assign appointment to (show when event type selected) -->
    <div v-if="eventType" class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h5 class="font-semibold text-foreground text-sm mb-4">Assign appointment to</h5>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <Label class="form-label">Team</Label>
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
        <div>
          <Label class="form-label">Salesperson <span class="optional">(optional)</span></Label>
          <SelectMenu
            v-model="selectedSalesmanId"
            :items="salespersonSelectOptions"
            :disabled="!salespersonSelectOptions.length"
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
    </div>

    <!-- Step 3: Schedule (Calendar and Time Slots) - only after event type is selected (same as LQTask) -->
    <div v-if="eventType" class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h5 class="font-semibold text-foreground text-sm mb-4">Schedule <span class="text-red-600">*</span></h5>
      <div class="bg-white border border-border rounded-lg overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 divide-x divide-black/5">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <button
                type="button"
                @click="previousMonth"
                class="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
              >
                <ChevronLeft class="w-4 h-4 shrink-0 text-muted-foreground" />
              </button>
              <h6 class="text-sm font-semibold text-foreground">{{ currentMonthYear }}</h6>
              <button
                type="button"
                @click="nextMonth"
                class="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
              >
                <ChevronRight class="w-4 h-4 shrink-0 text-muted-foreground" />
              </button>
            </div>
            <div class="grid grid-cols-7 gap-1 mb-2">
              <div v-for="label in calendarDayLabels" :key="label" class="text-center text-sm font-medium text-muted-foreground py-2">
                {{ label }}
              </div>
            </div>
            <div class="grid grid-cols-7 gap-1">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                @click="day && selectDate(day)"
                class="aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all"
                :class="isSelectedDate(day)
                  ? 'bg-primary text-white cursor-pointer'
                  : day ? 'text-muted-foreground hover:bg-muted cursor-pointer' : 'text-transparent'"
              >
                {{ day }}
              </div>
            </div>
          </div>
          <div class="p-6">
            <h6 class="text-sm font-semibold text-foreground mb-4">{{ selectedDateLabel }}</h6>
            <div v-if="selectedDate && availableScheduleSlots.length > 0" class="schedule-slot-toggle-group flex flex-col gap-2 w-full space-y-2">
              <Toggle
                v-for="slot in availableScheduleSlots"
                :key="slot"
                variant="outline"
                :model-value="selectedSlot === slot"
                @update:model-value="(p) => (selectedSlot = p ? slot : '')"
                class="schedule-slot-toggle-item"
              >
                {{ slot }}
              </Toggle>
            </div>
            <div v-else-if="selectedDate && availableScheduleSlots.length === 0" class="text-sm text-muted-foreground py-4 text-center">
              No available time slots for this date
            </div>
            <div v-else class="text-sm text-muted-foreground py-4 text-center">
              Select a date to see available time slots
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: Automated Communications -->
    <AppointmentCommunications
      v-if="eventType && selectedTeam"
      :appointment="{
        type: eventType,
        date: selectedDate,
        time: selectedSlot,
        duration: durationValue
      }"
      :customer="opportunity.customer"
      :salesperson="selectedSalesman"
      :team="selectedTeam"
      :dealership="selectedTeam?.dealership ? { name: selectedTeam.dealership } : null"
      @update="handleCommunicationsUpdate"
    />

    <!-- Action buttons below cards (same as LQTask outcome buttons) -->
    <div class="flex flex-wrap justify-end items-center gap-2 pt-3">
      <slot name="extra-actions" />
      <Button
        v-if="!hideCancelButton"
        variant="secondary"
        @click="onCancel"
      >
        Cancel
      </Button>
      <Button
        variant="default"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        {{ primaryButtonLabel }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { Button, Label, Toggle } from '@motork/component-library/future/primitives'
import { SelectMenu } from '@motork/component-library/future/components'
import { useUsersStore } from '@/stores/users'
import { getAvailabilityForAssignee } from '@/services/availabilityService'
import AppointmentCommunications from '@/components/shared/communication/AppointmentCommunications.vue'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  },
  mode: {
    type: String,
    validator: (v) => ['schedule', 'reschedule'].includes(v),
    default: 'schedule'
  },
  initialAppointment: {
    type: Object,
    default: null
  },
  hideCancelButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const usersStore = useUsersStore()

const eventType = ref('')
const selectedDate = ref(null)
const selectedSlot = ref('')
const selectedTeam = ref(null)
const selectedSalesman = ref(null)
const durationMinutes = ref(null)
const customDuration = ref('')
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const communicationPreferences = ref({
  immediateConfirmation: { enabled: true, channels: ['email'] },
  reminder: { enabled: true, channels: ['email'] },
  salespersonNotification: { enabled: true }
})

const EVENT_TYPE_OPTIONS = [
  { value: 'appointment-on-phone', label: 'Appointment on the phone (15m)' },
  { value: 'appointment-at-dealership', label: 'Appointment at the dealership (30m)' },
  { value: 'recall-internal', label: 'Recall - internal (15m)' },
  { value: 'appointment-at-dealership-test-drive', label: 'Appointment at the dealership + Test drive (1h)' },
  { value: 'appointment-at-workshop', label: 'Appointment at the workshop (15m)' },
  { value: 'appointment-at-customer-site', label: 'Appointment at customer\'s site (1h 40m)' },
  { value: 'appointment-at-customer-site-test-drive', label: 'Appointment at customer\'s site + Test drive (5h)' }
]

const eventTypeDurationMap = {
  'appointment-on-phone': 15,
  'appointment-at-dealership': 30,
  'recall-internal': 15,
  'appointment-at-dealership-test-drive': 60,
  'appointment-at-workshop': 15,
  'appointment-at-customer-site': 100,
  'appointment-at-customer-site-test-drive': 300
}

const eventTypeOptionsForSelect = computed(() =>
  EVENT_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))
)

const scheduleSlotOptions = computed(() => {
  const slots = []
  for (let m = 9 * 60; m <= 18 * 60; m += 30) {
    const h = String(Math.floor(m / 60)).padStart(2, '0')
    const min = String(m % 60).padStart(2, '0')
    slots.push(`${h}:${min}`)
  }
  return slots
})

const durationValue = computed(() => {
  if (durationMinutes.value != null) return durationMinutes.value
  const n = parseInt(customDuration.value, 10)
  return Number.isFinite(n) && n > 0 ? n : null
})

const primaryButtonLabel = computed(() =>
  props.mode === 'reschedule' ? 'Reschedule and Save' : 'Schedule and Save'
)

const canSubmit = computed(() =>
  !!(eventType.value && selectedDate.value && selectedSlot.value && selectedTeam.value)
)

const calendarDayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const currentMonthYear = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null)
  for (let day = 1; day <= daysInMonth; day++) days.push(day)
  return days
})

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return 'Select a date'
  const date = selectedDate.value
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
})

const assignableUsers = computed(() => usersStore.assignableUsers)
const assignableTeams = computed(() => usersStore.assignableTeams)

const teamSelectOptions = computed(() =>
  assignableTeams.value.map((team) => ({
    ...team,
    label: `${team.dealership || 'No location'} → ${team.name}`,
    value: team.id
  }))
)

const salespersonSelectOptions = computed(() => {
  if (!selectedTeam.value) return []
  const team = selectedTeam.value
  const users = assignableUsers.value?.filter(
    (u) => u.team === team.name || u.teamId === team.id
  ) || []
  return users.map((u) => ({ ...u, label: u.name, value: u.id }))
})

const selectedTeamId = computed({
  get: () => selectedTeam.value?.id || null,
  set: (id) => {
    if (!id) {
      selectedTeam.value = null
      selectedSalesman.value = null
      return
    }
    const team = assignableTeams.value?.find((t) => t.id === id)
    selectedTeam.value = team || null
    if (team) selectSoonestAvailability(`team-${team.id}`)
  }
})

const selectedSalesmanId = computed({
  get: () => selectedSalesman.value?.id || null,
  set: (id) => {
    if (!id) {
      selectedSalesman.value = null
      return
    }
    const user = salespersonSelectOptions.value.find((u) => u.id === id)
    selectedSalesman.value = user || null
    if (user) selectSoonestAvailability(`user-${user.id}`)
  }
})

const availableScheduleSlots = computed(() => {
  if (!selectedDate.value) return []
  const dateStr = selectedDate.value.toISOString().split('T')[0]
  if (selectedSalesman.value) {
    const slots = getAvailabilityForAssignee(`user-${selectedSalesman.value.id}`, dateStr)
    return scheduleSlotOptions.value.filter((s) => slots.includes(s))
  }
  if (selectedTeam.value) {
    const slots = getAvailabilityForAssignee(`team-${selectedTeam.value.id}`, dateStr)
    return scheduleSlotOptions.value.filter((s) => slots.includes(s))
  }
  return scheduleSlotOptions.value || []
})

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function getRoleAvatarClass(role) {
  const map = {
    manager: 'bg-blue-100 text-blue-700',
    salesman: 'bg-purple-100 text-purple-700',
    operator: 'bg-orange-100 text-orange-700'
  }
  return map[role] || 'bg-muted text-muted-foreground'
}

function selectDate(day) {
  if (!day) return
  const date = new Date(currentYear.value, currentMonth.value, day)
  selectedDate.value = date
  selectedSlot.value = ''
}

function isSelectedDate(day) {
  if (!day || !selectedDate.value) return false
  const d = selectedDate.value
  return (
    d.getDate() === day &&
    d.getMonth() === currentMonth.value &&
    d.getFullYear() === currentYear.value
  )
}

function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function selectSoonestAvailability(assigneeId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 30; i++) {
    const check = new Date(today)
    check.setDate(today.getDate() + i)
    if (check.getDay() === 0 || check.getDay() === 6) continue
    const dateStr = check.toISOString().split('T')[0]
    const slots = getAvailabilityForAssignee(assigneeId, dateStr)
    if (slots?.length) {
      selectedDate.value = check
      currentMonth.value = check.getMonth()
      currentYear.value = check.getFullYear()
      const filtered = scheduleSlotOptions.value.filter((s) => slots.includes(s))
      if (filtered.length) selectedSlot.value = filtered[0]
      break
    }
  }
}

function handleCommunicationsUpdate(comms) {
  communicationPreferences.value = comms
}

function onCancel() {
  resetForm()
  emit('cancel')
}

function resetForm() {
  eventType.value = ''
  selectedDate.value = null
  selectedSlot.value = ''
  selectedTeam.value = null
  selectedSalesman.value = null
  durationMinutes.value = null
  customDuration.value = ''
  communicationPreferences.value = {
    immediateConfirmation: { enabled: true, channels: ['email'] },
    reminder: { enabled: true, channels: ['email'] },
    salespersonNotification: { enabled: true }
  }
}

function prefillFromAppointment(app) {
  if (!app) return
  eventType.value = app.type || ''
  if (app.assignee) {
    const assigneeUser = assignableUsers.value?.find((u) => u.name === app.assignee)
    const assigneeTeam = assignableTeams.value?.find((t) => t.name === app.assignee)
    if (assigneeUser) {
      const userTeam = assignableTeams.value?.find(
        (t) => t.name === assigneeUser.team || t.id === assigneeUser.teamId
      )
      if (userTeam) {
        selectedTeam.value = userTeam
        selectedSalesman.value = assigneeUser
      }
    } else if (assigneeTeam) {
      selectedTeam.value = assigneeTeam
    }
  }
  if (app.start) {
    const d = new Date(app.start)
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    selectedDate.value = dateOnly
    currentMonth.value = d.getMonth()
    currentYear.value = d.getFullYear()
    const h = d.getHours()
    const m = d.getMinutes()
    const rounded = m < 15 ? 0 : m < 45 ? 30 : 60
    const adjH = rounded === 60 ? h + 1 : h
    const adjM = rounded === 60 ? 0 : rounded
    const slot = `${String(adjH).padStart(2, '0')}:${String(adjM).padStart(2, '0')}`
    if (scheduleSlotOptions.value.includes(slot)) {
      selectedSlot.value = slot
    } else {
      const slotMin = adjH * 60 + adjM
      const closest = scheduleSlotOptions.value.reduce((best, s) => {
        const [sh, sm] = s.split(':').map(Number)
        const smMin = sh * 60 + sm
        if (!best) return s
        const [bh, bm] = best.split(':').map(Number)
        const bMin = bh * 60 + bm
        return Math.abs(smMin - slotMin) < Math.abs(bMin - slotMin) ? s : best
      }, null)
      selectedSlot.value = closest || scheduleSlotOptions.value[0] || ''
    }
  }
  if (app.duration) {
    const dur = app.duration
    if (dur === 15) durationMinutes.value = 15
    else if (dur === 30) durationMinutes.value = 30
    else if (dur === 60) durationMinutes.value = 60
    else {
      durationMinutes.value = null
      customDuration.value = String(dur)
    }
  }
}

watch(eventType, (v) => {
  if (!v) return
  const dur = eventTypeDurationMap[v]
  if (!dur) return
  if (dur === 15) durationMinutes.value = 15
  else if (dur === 30) durationMinutes.value = 30
  else if (dur === 60) durationMinutes.value = 60
  else {
    durationMinutes.value = null
    customDuration.value = String(dur)
  }
  if (!selectedDate.value) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.value = today
    currentMonth.value = today.getMonth()
    currentYear.value = today.getFullYear()
  }
})

watch(selectedDate, () => {
  selectedSlot.value = ''
})

watch(
  () => props.opportunity.assignee,
  (assignee) => {
    if (!assignee || selectedTeam.value || selectedSalesman.value) return
    const u = assignableUsers.value?.find((us) => us.name === assignee)
    const t = assignableTeams.value?.find((te) => te.name === assignee)
    if (u) {
      const userTeam = assignableTeams.value?.find(
        (te) => te.name === u.team || te.id === u.teamId
      )
      if (userTeam) {
        selectedTeam.value = userTeam
        selectedSalesman.value = u
      }
    } else if (t) {
      selectedTeam.value = t
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.mode === 'reschedule' && props.initialAppointment) {
    prefillFromAppointment(props.initialAppointment)
  }
})

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit', {
    eventType: eventType.value,
    selectedDate: selectedDate.value,
    selectedSlot: selectedSlot.value,
    selectedTeam: selectedTeam.value,
    selectedSalesman: selectedSalesman.value,
    durationValue: durationValue.value,
    communicationPreferences: communicationPreferences.value
  })
}

defineExpose({ resetForm })
</script>
