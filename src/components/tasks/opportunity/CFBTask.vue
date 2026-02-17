<template>
  <div class="rounded-lg flex flex-col bg-muted">
    <div class="pt-1 px-1">
      <div class="bg-white rounded-lg shadow-nsc-card overflow-visible">
        <div class="p-6">
          <div class="mb-3">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h4 class="font-bold text-foreground text-sm">Contract Feedback</h4>
                <p class="text-sm text-muted-foreground mt-0.5">
                  Contract was signed {{ daysSinceContract }} days ago. Follow up on delivery status and collect customer feedback.
                </p>
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 items-center">
            <Toggle
              variant="outline"
              :model-value="showSurvey"
              @update:model-value="handleToggleChange('survey', $event)"
              class="outcome-toggle-item"
            >
              <ClipboardList class="w-4 h-4 shrink-0" />
              <span>Complete Survey</span>
            </Toggle>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showSurvey" class="mk-expanded-cards-area space-y-4">
      <ContractFeedbackSurvey
        ref="surveyRef"
        :opportunity="opportunity"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
      <div class="flex justify-between items-center pt-3">
        <Button
          variant="secondary"
          @click="$emit('postpone', 'cfb')"
          class="flex items-center gap-2"
        >
          <Clock class="w-4 h-4 shrink-0" />
          <span>Postpone</span>
        </Button>
        <div class="flex gap-2">
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
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ClipboardList, Clock } from 'lucide-vue-next'
import { Button, Toggle } from '@motork/component-library/future/primitives'
import ContractFeedbackSurvey from '@/components/tasks/opportunity/ContractFeedbackSurvey.vue'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  },
  activities: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'survey-submitted', 'survey-cancelled', 'postpone'])

const opportunitiesStore = useOpportunitiesStore()
const userStore = useUserStore()

const showSurvey = ref(false)
const surveyRef = ref(null)

const canSubmit = computed(() => {
  return surveyRef.value?.isValid || false
})

const daysSinceContract = computed(() => {
  if (!props.opportunity?.contractDate) return 0
  const contract = new Date(props.opportunity.contractDate)
  const now = new Date()
  const diffTime = Math.abs(now - contract)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

const handleSubmit = async (surveyData) => {
  try {
    const opp = props.opportunity
    const { responses, triggerActions } = surveyData
    
    // Save survey as activity
    await opportunitiesStore.addActivity(opp.id, {
      type: 'contract-feedback-survey',
      user: userStore.currentUser?.name || 'You',
      action: 'completed post-contract customer experience survey',
      content: 'Post-Contract Customer Experience Survey completed',
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
          content: 'Email sent to Sales Manager + Regional Manager (Negative satisfaction)',
          data: {
            trigger: 'negative-satisfaction',
            recipients: ['Sales Manager', 'Regional Manager'],
            surveyResponse: responses.q1
          },
          timestamp: new Date().toISOString()
        })
      )
    }
    
    if (triggerActions.documentClarity) {
      triggerActivityPromises.push(
        opportunitiesStore.addActivity(opp.id, {
          type: 'survey-trigger',
          user: userStore.currentUser?.name || 'You',
          action: 'triggered email notification',
          content: 'Email sent to Compliance/Legal team (Document clarity issues)',
          data: {
            trigger: 'document-clarity',
            recipients: ['Compliance/Legal team'],
            surveyResponse: responses.q2
          },
          timestamp: new Date().toISOString()
        })
      )
    }
    
    if (triggerActions.poorSupport) {
      triggerActivityPromises.push(
        opportunitiesStore.addActivity(opp.id, {
          type: 'survey-trigger',
          user: userStore.currentUser?.name || 'You',
          action: 'triggered email notification',
          content: 'Email sent to Sales Manager for coaching (Poor salesperson support)',
          data: {
            trigger: 'poor-support',
            recipients: ['Sales Manager'],
            surveyResponse: responses.q5
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

const handleToggleChange = (type, value) => {
  // Reset all toggles first
  showSurvey.value = false
  
  // If the toggle is being turned on, set only that one
  if (value) {
    if (type === 'survey') {
      showSurvey.value = true
    }
  }
}
</script>
