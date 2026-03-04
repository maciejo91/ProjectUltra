<template>
  <div class="flex flex-col">
    <!-- Main card: title, subtitle, carousels, then more actions -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-visible">
      <div class="p-6 space-y-4">
        <div>
          <h4 class="font-bold text-foreground text-sm">Manage Offers & Follow Up</h4>
          <p class="text-sm text-muted-foreground mt-0.5">
            <template v-if="showNfuContent">
              Follow up with customer about offers
            </template>
            <template v-else-if="opportunity.offers && opportunity.offers.length > 0">
              <template v-if="meetsOFBCondition">
                This opportunity has been in negotiation for {{ daysInNegotiation }} days without a contract. Follow up with customer to get feedback and move forward.
              </template>
              <template v-else>
                Follow up with customer about offers
              </template>
            </template>
            <template v-else>
              Create an offer to continue negotiation
            </template>
          </p>
        </div>
        <slot name="carousels" />
        <!-- When NFU is active: no buttons in card (they appear in grey area below, like lead). Else: Follow up + more actions -->
        <div v-if="!showNfuContent" class="flex flex-wrap gap-3 items-center">
          <div v-if="showPrimaryFollowUpButton" class="outcome-toggle-group flex flex-wrap gap-3">
            <Toggle
              variant="outline"
              :model-value="showNegotiationSection"
              @update:model-value="(p) => {
                emit('update:show-negotiation-section', p);
                if (p) {
                  emit('update:show-add-offer-section', false);
                  emit('update:show-survey-section', false);
                }
              }"
              class="outcome-toggle-item"
            >
              <Phone class="w-4 h-4 shrink-0" />
              <span>Follow up</span>
            </Toggle>
          </div>
          <SecondaryActionsDropdown
            v-if="secondaryActions && secondaryActions.length > 0"
            :actions="secondaryActions"
            class="ml-auto shrink-0"
            @action-selected="handleSecondaryActionClick"
          />
        </div>
      </div>
    </div>

    <!-- Grey area below card (same UX as lead): NFU actions + expanded forms, or Contact Customer / OFB -->
    <div v-if="showNfuContent" class="mk-expanded-cards-area space-y-4">
      <slot name="nfu-content" />
    </div>
    <div v-else class="mk-expanded-cards-area space-y-4">
      <div v-if="showNegotiationSection" class="space-y-4">
        <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
          <h5 class="font-semibold text-foreground text-sm mb-4">Contact Customer</h5>
          
          <!-- Channel Selection -->
          <div class="followup-channel-toggle-group flex flex-wrap gap-2 mb-4">
            <Toggle
              variant="outline"
              :model-value="negotiationChannel === 'call'"
              @update:model-value="(p) => p && $emit('update:negotiation-channel', 'call')"
              class="followup-toggle-item"
            >
              <Phone class="w-3 h-3 shrink-0" />
              <span>Call</span>
            </Toggle>
            <Toggle
              variant="outline"
              :model-value="negotiationChannel === 'whatsapp'"
              @update:model-value="(p) => p && $emit('update:negotiation-channel', 'whatsapp')"
              class="followup-toggle-item"
            >
              <MessageCircle class="w-3 h-3 shrink-0" />
              <span>WhatsApp</span>
            </Toggle>
            <Toggle
              variant="outline"
              :model-value="negotiationChannel === 'sms'"
              @update:model-value="(p) => p && $emit('update:negotiation-channel', 'sms')"
              class="followup-toggle-item"
            >
              <MessageSquare class="w-3 h-3 shrink-0" />
              <span>SMS</span>
            </Toggle>
            <Toggle
              variant="outline"
              :model-value="negotiationChannel === 'email'"
              @update:model-value="(p) => p && $emit('update:negotiation-channel', 'email')"
              class="followup-toggle-item"
            >
              <Mail class="w-3 h-3 shrink-0" />
              <span>Email</span>
            </Toggle>
          </div>
            
          <!-- Message Composer -->
          <div v-if="negotiationChannel" class="space-y-3">
            <div v-if="offerSelectOptions.length > 0">
              <Label class="block text-sm font-medium text-muted-foreground mb-2">Select offer to reference (Optional)</Label>
              <SelectMenu
                :model-value="negotiationSelectedOfferId"
                @update:model-value="$emit('update:negotiation-selected-offer-id', $event)"
                :items="offerSelectOptions"
                placeholder="Select an offer..."
                value-key="id"
                class="w-full"
              >
                <template #item="{ item }">
                  <div class="flex items-center justify-between gap-2">
                    <span>{{ item.label }}</span>
                    <span class="text-muted-foreground text-xs">€ {{ formatCurrency(item.price) }}</span>
                  </div>
                </template>
              </SelectMenu>
            </div>
            
            <div>
              <Label class="block text-sm font-medium text-muted-foreground mb-2">Message</Label>
              <Textarea
                :model-value="negotiationMessage"
                @update:model-value="$emit('update:negotiation-message', $event)"
                rows="4"
                placeholder="Type your message here..."
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Unified Negotiation Buttons -->
      <div v-if="showNegotiationSection" class="flex justify-end gap-2 pt-3">
        <Button
          variant="secondary"
          @click="$emit('cancel-negotiation')"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          :disabled="!canSendNegotiationMessage"
          @click="$emit('send-negotiation-message')"
        >
          Send Message
        </Button>
      </div>
      
      <!-- OFB Survey Section (only when toggle is active and OFB condition is met) -->
      <div v-if="showSurveySection && meetsOFBCondition" class="space-y-4">
        <OFBTask
          ref="ofbTaskRef"
          :opportunity="opportunity"
          @submit="handleSurveySubmit"
          @postpone="handleSurveyPostpone"
        />
        <div class="flex justify-between items-center pt-3">
          <Button
            variant="secondary"
            @click="$emit('ofb-postpone', 'ofb')"
            class="flex items-center gap-2"
          >
            <Clock class="w-4 h-4 shrink-0" />
            <span>Postpone</span>
          </Button>
          <div class="flex gap-2">
            <Button
              variant="secondary"
              @click="handleSurveyCancel"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              :disabled="!canSubmitSurvey"
              @click="handleSurveyConfirm"
            >
              Submit Survey
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Phone, ClipboardList, MessageCircle, MessageSquare, Mail, Clock } from 'lucide-vue-next'
import { Button, Toggle, Label, Textarea } from '@motork/component-library/future/primitives'
import { SelectMenu } from '@motork/component-library/future/components'
import SecondaryActionsDropdown from '@/components/shared/SecondaryActionsDropdown.vue'
import OFBTask from '@/components/tasks/opportunity/OFBTask.vue'
import { OpportunityConditions } from '@/utils/opportunityRules'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  },
  showNegotiationSection: {
    type: Boolean,
    default: false
  },
  showAddOfferSection: {
    type: Boolean,
    default: false
  },
  showSurveySection: {
    type: Boolean,
    default: false
  },
  negotiationChannel: {
    type: String,
    default: null
  },
  negotiationMessage: {
    type: String,
    default: ''
  },
  negotiationSelectedOfferId: {
    type: String,
    default: null
  },
  offerSelectOptions: {
    type: Array,
    default: () => []
  },
  canSendNegotiationMessage: {
    type: Boolean,
    default: false
  },
  secondaryActions: {
    type: Array,
    default: () => []
  },
  /** When true (e.g. Offer Sent), show Follow up as primary button instead of only in dropdown */
  showPrimaryFollowUpButton: {
    type: Boolean,
    default: false
  },
  /** When true, show slot #nfu-content under title/subtitle (NFU task embedded in this section) */
  showNfuContent: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:show-negotiation-section',
  'update:show-add-offer-section',
  'update:show-survey-section',
  'update:negotiation-channel',
  'update:negotiation-message',
  'update:negotiation-selected-offer-id',
  'reset-negotiation-form',
  'send-negotiation-message',
  'cancel-negotiation',
  'offer-created',
  'cancel-add-offer',
  'open-add-offer-modal',
  'open-add-tradein',
  'open-add-financing',
  'offer-accepted',
  'mark-offer-accepted',
  'secondary-action',
  'ofb-postpone',
  'survey-submitted',
  'survey-cancelled'
])

const ofbTaskRef = ref(null)

const hasOffers = computed(() => {
  return props.opportunity?.offers && props.opportunity.offers.length > 0
})

const daysInNegotiation = computed(() => {
  const date = props.opportunity.lastActivity || props.opportunity.createdAt
  if (!date) return 0
  const negotiationDate = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now - negotiationDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

const canSubmitSurvey = computed(() => {
  return ofbTaskRef.value?.isValid || false
})

const handleSurveyConfirm = () => {
  if (ofbTaskRef.value) {
    ofbTaskRef.value.submit()
  }
}

const handleSurveySubmit = (surveyData) => {
  emit('survey-submitted', { opportunity: props.opportunity, surveyData })
  emit('update:show-survey-section', false)
}

const handleSurveyCancel = () => {
  emit('update:show-survey-section', false)
  emit('survey-cancelled', { opportunity: props.opportunity })
}

const handleSurveyPostpone = (event) => {
  emit('ofb-postpone', event)
  emit('update:show-survey-section', false)
}

// Handle secondary action clicks - toggle appropriate form sections
const handleSecondaryActionClick = (action) => {
  // Map action keys to form sections
  // Actions that should toggle Add Offer form
  const addOfferActions = ['add-offer', 'create-offer']
  // Actions that should toggle Follow Up form
  const followUpActions = ['follow-up', 'request-feedback', 'collect-feedback', 'reassign', 'schedule-appointment', 'close-lost']
  
  if (addOfferActions.includes(action.key)) {
    emit('open-add-offer-modal')
    return
  }
  if (followUpActions.includes(action.key)) {
    const newValue = !props.showNegotiationSection
    emit('update:show-negotiation-section', newValue)
    if (newValue) {
      emit('update:show-add-offer-section', false)
      emit('update:show-survey-section', false)
    } else {
      emit('reset-negotiation-form')
    }
  } else {
    const newValue = !props.showNegotiationSection
    emit('update:show-negotiation-section', newValue)
    if (newValue) {
      emit('update:show-add-offer-section', false)
      emit('update:show-survey-section', false)
    } else {
      emit('reset-negotiation-form')
    }
  }
  emit('secondary-action', action)
}

// Check if OFB condition is met (for subtitle display)
const meetsOFBCondition = computed(() => {
  // Only check for "Offer Sent" status
  const substatus = props.opportunity?.negotiationSubstatus
  if (substatus !== 'Offer Sent') {
    return false
  }
  
  // Check OFB condition
  const context = {
    opportunity: props.opportunity,
    hasOffers: props.opportunity?.offers && props.opportunity.offers.length > 0,
    stage: 'In Negotiation',
    activities: []
  }
  
  return OpportunityConditions['negotiation-5-plus-days-no-contract-has-offers'](context)
})

// Check if OFB task should be shown (only in expanded view, only for Offer Sent)
const shouldShowOFBTask = computed(() => {
  // TEMPORARY: For opportunity 33 evaluation, show even when not expanded
  const isEvaluationMode = props.opportunity?.id === 3
  
  if (!isEvaluationMode && !props.showNegotiationSection) {
    return false
  }
  
  // Only show for "Offer Sent" status
  const substatus = props.opportunity?.negotiationSubstatus
  if (substatus !== 'Offer Sent') {
    return false
  }
  
  // Check OFB condition
  const context = {
    opportunity: props.opportunity,
    hasOffers: props.opportunity?.offers && props.opportunity.offers.length > 0,
    stage: 'In Negotiation',
    activities: []
  }
  
  return OpportunityConditions['negotiation-5-plus-days-no-contract-has-offers'](context)
})

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('€', '€')
}

defineExpose({ ofbTaskRef })
</script>
