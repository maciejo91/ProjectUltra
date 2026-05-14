<template>
  <div class="rounded-lg flex flex-col bg-muted space-y-4">
    <ThresholdBanner
      :show="true"
      :message="thresholdBannerMessage"
    />
    <!-- Single card: Delivery date details + Post-Delivery Customer Satisfaction Survey -->
    <div class="pt-1 px-1">
      <div class="bg-white rounded-lg shadow-nsc-card overflow-visible">
        <div class="p-6 space-y-6">
          <!-- Delivery date details (when delivery is scheduled) -->
          <div v-if="opportunity.deliveryDate">
            <h5 class="font-semibold text-foreground text-sm mb-2">Delivery date details</h5>
            <dl class="text-sm space-y-1 text-muted-foreground">
              <div class="flex gap-2">
                <dt class="font-medium text-foreground min-w-[6rem]">Date</dt>
                <dd>{{ formattedDeliveryDate }}</dd>
              </div>
              <div v-if="opportunity.deliveryLocation" class="flex gap-2">
                <dt class="font-medium text-foreground min-w-[6rem]">Location</dt>
                <dd>{{ opportunity.deliveryLocation }}</dd>
              </div>
              <div v-if="opportunity.deliveryNotes" class="flex gap-2">
                <dt class="font-medium text-foreground min-w-[6rem]">Notes</dt>
                <dd>{{ opportunity.deliveryNotes }}</dd>
              </div>
            </dl>
          </div>
          <!-- Post-Delivery Customer Satisfaction Survey -->
          <div>
            <div class="mb-3">
              <h4 class="font-bold text-foreground text-sm">
                {{ isAwaitingDelivery ? 'Delivery Delay Feedback' : 'Post-Delivery Customer Satisfaction Survey' }}
              </h4>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ isAwaitingDelivery 
                  ? 'Get feedback on delivery delay and check progress' 
                  : 'Collect feedback from the customer about their delivery experience' }}
              </p>
            </div>
            <div class="flex flex-wrap gap-3 items-center">
              <Toggle
                variant="outline"
                :model-value="showSurvey"
                @update:model-value="showSurvey = $event"
                class="outcome-toggle-item"
              >
                <ClipboardList class="w-4 h-4 shrink-0" />
                <span>Complete Survey</span>
              </Toggle>
              <Button
                v-if="showCloseWon"
                variant="default"
                class="outcome-toggle-item"
                @click="$emit('close-as-won')"
              >
                Close as Won
              </Button>
              <Toggle
                v-if="isAwaitingDelivery"
                variant="outline"
                :model-value="showReschedule"
                @update:model-value="showReschedule = $event"
                class="outcome-toggle-item"
              >
                <CalendarDays class="w-4 h-4 shrink-0" />
                <span>Reschedule Delivery</span>
              </Toggle>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showSurvey" class="mk-expanded-cards-area space-y-4">
      <PostDeliverySurvey
        ref="surveyRef"
        :opportunity="opportunity"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
      <div class="flex justify-end gap-2 pt-3">
        <Button
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          :disabled="!canSubmit"
          @click="handleConfirm"
        >
          Submit Survey
        </Button>
      </div>
    </div>
    
    <div v-if="showReschedule" class="mk-expanded-cards-area space-y-4">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">New Delivery Date</label>
          <MiniCalendarDateField
            v-model="rescheduleForm.newDeliveryDate"
            aria-label="New delivery date"
            group-class="rounded-md"
            input-class="min-w-0"
            :min-date="minRescheduleDate"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Reason (Optional)</label>
          <textarea
            v-model="rescheduleForm.reason"
            rows="3"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            placeholder="Reason for rescheduling..."
          />
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-3">
        <Button
          variant="secondary"
          @click="handleCancelReschedule"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          :disabled="!canSubmitReschedule"
          @click="handleConfirmReschedule"
        >
          Reschedule Delivery
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ClipboardList, CalendarDays } from 'lucide-vue-next'
import { Button, Toggle } from '@motork/component-library/future/primitives'
import PostDeliverySurvey from '@/components/tasks/opportunity/PostDeliverySurvey.vue'
import ThresholdBanner from '@/components/tasks/shared/ThresholdBanner.vue'
import MiniCalendarDateField from '@/components/shared/forms/MiniCalendarDateField.vue'
import { normalizeMotorkDateFieldToIso } from '@/utils/motorkDateField.js'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { getDeliverySubstatus } from '@/utils/stageMapper'
import { formatDateTime } from '@/utils/formatters'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  },
  activities: {
    type: Array,
    default: () => []
  },
  showCloseWon: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'survey-submitted', 'survey-cancelled', 'postpone', 'reschedule-delivery', 'close-as-won'])

const opportunitiesStore = useOpportunitiesStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const showSurvey = ref(false)
const showReschedule = ref(false)
const surveyRef = ref(null)

const formattedDeliveryDate = computed(() => {
  const d = props.opportunity?.deliveryDate
  return d ? formatDateTime(d) : ''
})

const deliverySubstatus = computed(() => {
  return getDeliverySubstatus(props.opportunity, props.activities)
})

const isAwaitingDelivery = computed(() => {
  return deliverySubstatus.value === 'Awaiting Delivery'
})

const daysSinceReference = computed(() => {
  const opp = props.opportunity
  const activities = props.activities || []
  let refDate
  if (isAwaitingDelivery.value && opp?.deliveryDate) {
    refDate = opp.deliveryDate
  } else {
    refDate = opp?.actualDeliveryDate || opp?.deliveredDate ||
      activities.find(a => a.data?.actualDeliveryDate)?.data?.actualDeliveryDate ||
      activities.find(a => a.data?.deliveredDate)?.data?.deliveredDate
  }
  if (!refDate) return 0
  const ref = new Date(refDate)
  const now = new Date()
  return Math.ceil(Math.abs(now - ref) / (1000 * 60 * 60 * 24))
})

const thresholdBannerMessage = computed(() => {
  const threshold = settingsStore.getSetting('dfbDays') ?? 3
  const context = isAwaitingDelivery.value ? 'scheduled delivery date' : 'delivery'
  return `This task appeared because ${daysSinceReference.value} days passed since ${context} (${threshold} days threshold as per Settings).`
})

const canSubmit = computed(() => {
  return surveyRef.value?.isValid || false
})

const rescheduleForm = ref({
  newDeliveryDate: '',
  reason: ''
})

const minRescheduleDate = computed(() => {
  const today = new Date()
  today.setDate(today.getDate() + 1)
  return today.toISOString().split('T')[0]
})

const canSubmitReschedule = computed(() => {
  return !!rescheduleForm.value.newDeliveryDate
})

const handleSubmit = async (surveyData) => {
  try {
    const opp = props.opportunity
    const { responses, triggerActions } = surveyData
    
    // Save survey as activity
    await opportunitiesStore.addActivity(opp.id, {
      type: 'post-delivery-survey',
      user: userStore.currentUser?.name || 'You',
      action: 'completed post-delivery customer satisfaction survey',
      content: 'Post-Delivery Customer Satisfaction Survey completed',
      data: {
        responses,
        triggerActions,
        timestamp: surveyData.timestamp
      },
      timestamp: surveyData.timestamp
    })
    
    // Process trigger actions and send emails
    const triggerActivityPromises = []
    
    if (triggerActions.negativeSatisfaction) {
      triggerActivityPromises.push(
        opportunitiesStore.addActivity(opp.id, {
          type: 'survey-trigger',
          user: userStore.currentUser?.name || 'You',
          action: 'triggered email notification',
          content: 'Email sent to Sales Manager + Branch Manager (Negative satisfaction)',
          data: {
            trigger: 'negative-satisfaction',
            recipients: ['Sales Manager', 'Branch Manager'],
            surveyResponse: responses.q1
          },
          timestamp: new Date().toISOString()
        })
      )
    }
    
    if (triggerActions.issuesReported) {
      triggerActivityPromises.push(
        opportunitiesStore.addActivity(opp.id, {
          type: 'survey-trigger',
          user: userStore.currentUser?.name || 'You',
          action: 'triggered email notification',
          content: 'Email sent to Service Department (Issues reported)',
          data: {
            trigger: 'issues-reported',
            recipients: ['Service Department'],
            issueDescription: responses.q3
          },
          timestamp: new Date().toISOString()
        })
      )
    }
    
    if (triggerActions.deliveryDelay) {
      triggerActivityPromises.push(
        opportunitiesStore.addActivity(opp.id, {
          type: 'survey-trigger',
          user: userStore.currentUser?.name || 'You',
          action: 'triggered email notification',
          content: 'Email sent to Delivery Coordinator (Major delivery delay)',
          data: {
            trigger: 'delivery-delay',
            recipients: ['Delivery Coordinator'],
            surveyResponse: responses.q4
          },
          timestamp: new Date().toISOString()
        })
      )
    }
    
    if (triggerActions.highNPS) {
      triggerActivityPromises.push(
        opportunitiesStore.addActivity(opp.id, {
          type: 'survey-trigger',
          user: userStore.currentUser?.name || 'You',
          action: 'triggered email notification',
          content: 'Email sent to Marketing (High NPS - Definitely Yes)',
          data: {
            trigger: 'high-nps',
            recipients: ['Marketing'],
            surveyResponse: responses.q7
          },
          timestamp: new Date().toISOString()
        })
      )
    }
    
    // Wait for all trigger activities to be created
    await Promise.all(triggerActivityPromises)
    
    // Close the survey section
    showSurvey.value = false
    
    // Emit event for parent component
    emit('survey-submitted', { opportunity: opp, surveyData })
  } catch (error) {
    console.error('Failed to submit survey:', error)
  }
}

const handleConfirm = () => {
  if (surveyRef.value) {
    surveyRef.value.submit()
  }
}

const handleCancel = () => {
  showSurvey.value = false
  emit('survey-cancelled', { opportunity: props.opportunity })
}

const handleCancelReschedule = () => {
  showReschedule.value = false
  rescheduleForm.value = { newDeliveryDate: '', reason: '' }
}

const handleConfirmReschedule = async () => {
  try {
    const raw = String(rescheduleForm.value.newDeliveryDate || '').trim()
    const dateIso = normalizeMotorkDateFieldToIso(raw) || raw
    emit('reschedule-delivery', {
      opportunity: props.opportunity,
      newDeliveryDate: dateIso,
      reason: rescheduleForm.value.reason
    })
    showReschedule.value = false
    rescheduleForm.value = { newDeliveryDate: '', reason: '' }
  } catch (error) {
    console.error('Failed to reschedule delivery:', error)
  }
}
</script>
