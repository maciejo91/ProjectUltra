<template>
  <div class="space-y-2">
    <div class="border rounded-lg bg-white shadow-sm p-3">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Calendar class="w-4 h-4" />
          </div>
          <div>
            <h4 class="text-sm font-semibold">{{ appointment.title || 'Appointment' }}</h4>
            <div class="text-sm text-muted-foreground">{{ formattedDate }}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm">Details</Button>
          <Button
            v-if="showMarkNoShow"
            variant="outline"
            size="sm"
            class="text-muted-foreground"
            @click="handleMarkNoShowClick"
          >
            <UserX class="w-4 h-4 shrink-0" />
            Mark as no show
          </Button>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span class="flex items-center gap-1.5 shrink-0">
          <MapPin class="size-3.5 shrink-0" />
          {{ appointment.location || appointment.dealership || 'Unknown location' }}
        </span>
        <span class="flex items-center gap-1.5 shrink-0">
          <User class="size-3.5 shrink-0" />
          {{ appointment.customerName || appointment.customer || 'Unknown customer' }}
        </span>
        <span v-if="appointment.vehicle" class="flex items-center gap-1.5 shrink-0">
          <Car class="size-3.5 shrink-0" />
          {{ appointment.vehicle }}
        </span>
      </div>
    </div>

    <!-- Inline NS task section (NS1/NS2/NS3) when expanded -->
    <div v-if="showNsTaskSection" class="space-y-4 pl-2 border-l-2 border-muted">
      <NS1Task
        v-if="nsTaskCount === 1"
        ref="ns1TaskRef"
        :opportunity="opportunity"
        :scheduled-appointment="effectiveScheduledAppointment"
        @assigned="$emit('ns-assigned', $event)"
        @cancel="handleCancelNs"
      />
      <NS2Task
        v-else-if="nsTaskCount === 2"
        ref="ns2TaskRef"
        :opportunity="opportunity"
        :scheduled-appointment="effectiveScheduledAppointment"
        @assigned="$emit('ns-assigned', $event)"
        @cancel="handleCancelNs"
      />
      <NS3Task
        v-else-if="nsTaskCount >= 3"
        ref="ns3TaskRef"
        :opportunity="opportunity"
        :scheduled-appointment="effectiveScheduledAppointment"
        @close-as-lost="handleNsCloseAsLost"
        @cancel="handleCancelNs"
      />

      <div class="flex justify-end gap-2">
        <Button variant="secondary" @click="handleCancelNs">
          Cancel
        </Button>
        <Button
          variant="primary"
          :disabled="!canSubmitNsTask"
          class="bg-primary"
          @click="handleConfirmNsTask"
        >
          {{ nsTaskButtonLabel }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Calendar, MapPin, User, Car, UserX } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import NS1Task from '@/components/tasks/opportunity/NS1Task.vue'
import NS2Task from '@/components/tasks/opportunity/NS2Task.vue'
import NS3Task from '@/components/tasks/opportunity/NS3Task.vue'
import { updateCalendarEvent } from '@/api/calendar'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  appointment: {
    type: Object,
    required: true
  },
  request: {
    type: Object,
    default: null
  },
  isFuture: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['appointment-no-show', 'appointment-created'])

const opportunitiesStore = useOpportunitiesStore()
const userStore = useUserStore()

const showNsTaskSection = ref(false)
const ns1TaskRef = ref(null)
const ns2TaskRef = ref(null)
const ns3TaskRef = ref(null)
const effectiveScheduledAppointment = ref(null)

const opportunity = computed(() => {
  const storeOpp = opportunitiesStore.currentOpportunity
  const req = props.request
  if (!req) return null
  if (storeOpp && storeOpp.id === req.id) return storeOpp
  return req
})

const showMarkNoShow = computed(
  () =>
    props.request?.type === 'opportunity' &&
    props.isFuture &&
    !opportunity.value?.stage?.toLowerCase?.().includes('closed')
)

const formattedDate = computed(() => {
  if (!props.appointment?.start) return ''
  return new Date(props.appointment.start).toLocaleString()
})

const nsTaskCount = computed(() => {
  const appt = effectiveScheduledAppointment.value || props.appointment
  const count = appt?.noShowCount || 0
  if (count === 0 && showNsTaskSection.value) return 1
  return count
})

const canSubmitNsTask = computed(() => {
  const refs = { 1: ns1TaskRef, 2: ns2TaskRef, 3: ns3TaskRef }
  const ref = refs[nsTaskCount.value]
  return ref?.value?.canSubmit ?? false
})

const nsTaskButtonLabel = computed(() =>
  nsTaskCount.value === 3 ? 'Close as Lost' : 'Assign and Save'
)

async function handleMarkNoShowClick() {
  if (!props.request?.id || !opportunity.value) return

  const oppScheduled = opportunity.value.scheduledAppointment
  const isMatch = oppScheduled && oppScheduled.id === props.appointment.id
  const baseAppt = isMatch ? { ...oppScheduled } : { ...props.appointment }
  const currentCount = baseAppt.noShowCount || 0
  const newCount = currentCount + 1

  try {
    if (props.appointment.id) {
      await updateCalendarEvent(props.appointment.id, { status: 'no-show' })
    }

    const updated = {
      ...baseAppt,
      ...props.appointment,
      id: props.appointment.id || baseAppt.id,
      start: props.appointment.start || baseAppt.start,
      status: 'no-show',
      noShowCount: newCount
    }

    await opportunitiesStore.updateOpportunity(props.request.id, {
      scheduledAppointment: updated
    })

    const nsLabel = newCount === 1 ? 'NS1' : newCount === 2 ? 'NS2' : 'NS3'
    await opportunitiesStore.addActivity(props.request.id, {
      type: 'ns-task',
      user: userStore.currentUser?.name || 'You',
      action: `${nsLabel} - marked appointment as no-show`,
      content: `${nsLabel}: Appointment on ${new Date(updated.start).toLocaleString()} marked as no-show. This is the ${newCount === 1 ? 'first' : newCount === 2 ? 'second' : 'third'} no-show.`,
      data: { appointmentId: updated.id, noShowCount: newCount, nsLabel },
      timestamp: new Date().toISOString()
    })

    effectiveScheduledAppointment.value = updated
    showNsTaskSection.value = true
    emit('appointment-no-show', { appointmentId: updated.id, noShowCount: newCount, nsLabel })
  } catch (err) {
    console.error('Failed to mark appointment as no-show:', err)
  }
}

function handleConfirmNsTask() {
  const refs = { 1: ns1TaskRef, 2: ns2TaskRef, 3: ns3TaskRef }
  refs[nsTaskCount.value]?.value?.submit()
}

function handleCancelNs() {
  showNsTaskSection.value = false
}

async function handleNsCloseAsLost({ opportunity: opp, reason }) {
  showNsTaskSection.value = false
  await opportunitiesStore.updateOpportunity(opp.id, {
    stage: 'Closed Lost',
    lossReason: reason
  })
  await opportunitiesStore.addActivity(opp.id, {
    type: 'close-lost',
    user: userStore.currentUser?.name || 'You',
    action: 'closed opportunity as lost',
    content: `Opportunity closed as lost. Reason: ${reason || 'N/A'}`,
    data: { reason },
    timestamp: new Date().toISOString()
  })
  emit('appointment-no-show')
}

watch(
  () => props.appointment?.status,
  (status) => {
    if (status === 'no-show' && props.request?.type === 'opportunity') {
      const opp = opportunity.value
      const oppScheduled = opp?.scheduledAppointment
      const isMatch = oppScheduled && oppScheduled.id === props.appointment?.id
      if (isMatch) {
        effectiveScheduledAppointment.value = { ...props.appointment, ...oppScheduled }
        showNsTaskSection.value = true
      }
    }
  },
  { immediate: true }
)
</script>
