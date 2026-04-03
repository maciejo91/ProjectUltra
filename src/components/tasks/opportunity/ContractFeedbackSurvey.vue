<template>
  <div class="space-y-6">
    <!-- Survey Questions with Collapsible Sections -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h5 class="font-semibold text-foreground text-sm mb-4">Post-Contract Customer Experience Survey</h5>
      
      <div class="space-y-4">
        <!-- Section 1: Contract Experience -->
        <CollapsibleSection
          :is-expanded="expandedSections.contractExperience"
          @toggle="expandedSections.contractExperience = !expandedSections.contractExperience"
          title="Contract Experience"
        >
          <div class="space-y-6 pt-4">
            <!-- Q1: Contract Satisfaction -->
            <div>
              <Label class="block text-sm font-medium text-muted-foreground mb-2">
                How satisfied are you with the contract signing process?
                <span class="text-red-600">*</span>
              </Label>
              <div class="space-y-2">
                <label
                  v-for="option in contractSatisfactionOptions"
                  :key="option.value"
                  class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition-colors"
                  :class="
                    responses.q1 === option.value
                      ? 'border-2 border-brand-blue bg-muted/50'
                      : 'border border-border hover:bg-muted/50'
                  "
                >
                  <input
                    v-model="responses.q1"
                    type="radio"
                    :value="option.value"
                    class="shrink-0"
                  />
                  <span class="text-sm text-foreground">{{ option.label }}</span>
                </label>
              </div>
            </div>

            <!-- Q2: Document Clarity -->
            <div>
              <Label class="block text-sm font-medium text-muted-foreground mb-2">
                Were all contract terms and conditions clearly explained to you?
                <span class="text-red-600">*</span>
              </Label>
              <div class="space-y-2">
                <label
                  v-for="option in documentClarityOptions"
                  :key="option.value"
                  class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition-colors"
                  :class="
                    responses.q2 === option.value
                      ? 'border-2 border-brand-blue bg-muted/50'
                      : 'border border-border hover:bg-muted/50'
                  "
                >
                  <input
                    v-model="responses.q2"
                    type="radio"
                    :value="option.value"
                    class="shrink-0"
                  />
                  <span class="text-sm text-foreground">{{ option.label }}</span>
                </label>
              </div>
            </div>

            <!-- Q3: Outstanding Issues (Conditional) -->
            <div v-if="showQ3">
              <Label class="block text-sm font-medium text-muted-foreground mb-2">
                Which aspects of the contract concerned you? (Select all that apply)
                <span class="text-red-600">*</span>
              </Label>
              <div class="space-y-2">
                <label
                  v-for="issue in outstandingIssuesOptions"
                  :key="issue.value"
                  class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <input
                    v-model="responses.q3"
                    type="checkbox"
                    :value="issue.value"
                    class="w-4 h-4 focus:ring-brand-blue border-gray-300 rounded"
                    style="accent-color: var(--brand-blue);"
                  />
                  <span class="text-sm text-foreground">{{ issue.label }}</span>
                </label>
                <div class="flex items-center gap-2 mt-2">
                  <input
                    v-model="responses.q3Other"
                    type="checkbox"
                    class="w-4 h-4 focus:ring-brand-blue border-gray-300 rounded"
                    style="accent-color: var(--brand-blue);"
                  />
                  <span class="text-sm text-foreground">Other:</span>
                  <Input
                    v-if="responses.q3Other"
                    v-model="responses.q3OtherText"
                    placeholder="Specify other concern"
                    class="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Section 2: Service Quality -->
        <CollapsibleSection
          :is-expanded="expandedSections.serviceQuality"
          @toggle="expandedSections.serviceQuality = !expandedSections.serviceQuality"
          title="Service Quality"
        >
          <div class="space-y-6 pt-4">
            <!-- Q5: Salesperson Support (5-Star Rating) -->
            <div>
              <Label class="block text-sm font-medium text-muted-foreground mb-2">
                How well did your salesperson support you through the contract process?
              </Label>
              <div class="flex items-center gap-2">
                <button
                  v-for="rating in 5"
                  :key="rating"
                  @click="responses.q5 = rating"
                  class="text-2xl transition-colors"
                  :class="responses.q5 >= rating ? 'text-yellow-500' : 'text-gray-300'"
                >
                  ⭐
                </button>
                <span v-if="responses.q5" class="text-sm text-muted-foreground ml-2">
                  {{ responses.q5 }} {{ responses.q5 === 1 ? 'star' : 'stars' }}
                </span>
              </div>
            </div>

            <!-- Q6: Likelihood to Recommend (NPS) -->
            <div>
              <Label class="block text-sm font-medium text-muted-foreground mb-2">
                How likely are you to recommend our dealership to friends and family?
              </Label>
              <div class="space-y-2">
                <label
                  v-for="option in recommendationOptions"
                  :key="option.value"
                  class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition-colors"
                  :class="
                    responses.q6 === option.value
                      ? 'border-2 border-brand-blue bg-muted/50'
                      : 'border border-border hover:bg-muted/50'
                  "
                >
                  <input
                    v-model="responses.q6"
                    type="radio"
                    :value="option.value"
                    class="shrink-0"
                  />
                  <span class="text-sm text-foreground">{{ option.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Section 4: Internal Notes -->
        <CollapsibleSection
          :is-expanded="expandedSections.internalNotes"
          @toggle="expandedSections.internalNotes = !expandedSections.internalNotes"
          title="Internal Notes"
        >
          <div class="space-y-6 pt-4">
            <!-- Q7: Internal Follow-up Notes -->
            <div>
              <Label class="block text-sm font-medium text-muted-foreground mb-2">
                Notes for follow-up actions:
                <span class="text-sm text-muted-foreground ml-1">(Private - only for internal staff)</span>
              </Label>
              <Textarea
                v-model="responses.q7"
                rows="4"
                placeholder="Add any notes or instructions for follow-up actions..."
                class="w-full"
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>

    <!-- Trigger Actions Section -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h5 class="font-semibold text-foreground text-sm mb-4">Trigger Actions (Email Notifications)</h5>
      
      <div class="space-y-4">
        <!-- Negative Contract Satisfaction -->
        <div class="flex items-center gap-3">
          <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors flex-1">
            <Checkbox
              id="trigger-negative-satisfaction"
              v-model="triggerActions.negativeSatisfaction"
            />
            <span class="text-sm font-medium text-foreground">
              ⚠️ Email to Sales Manager + Regional Manager
            </span>
          </Label>
          <span class="text-sm text-muted-foreground">(Q1 = Very Unsatisfied)</span>
        </div>
        
        <!-- Document Clarity Issues -->
        <div class="flex items-center gap-3">
          <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors flex-1">
            <Checkbox
              id="trigger-document-clarity"
              v-model="triggerActions.documentClarity"
            />
            <span class="text-sm font-medium text-foreground">
              ⚠️ Email to Compliance/Legal team
            </span>
          </Label>
          <span class="text-sm text-muted-foreground">(Q2 = Not clear at all)</span>
        </div>
        
        <!-- Poor Salesperson Support -->
        <div class="flex items-center gap-3">
          <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors flex-1">
            <Checkbox
              id="trigger-poor-support"
              v-model="triggerActions.poorSupport"
            />
            <span class="text-sm font-medium text-foreground">
              ⚠️ Email to Sales Manager for coaching
            </span>
          </Label>
          <span class="text-sm text-muted-foreground">(Q5 = 1 star)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Checkbox, Label, Textarea } from '@motork/component-library/future/primitives'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Collapsible sections state
const expandedSections = ref({
  contractExperience: true, // First section expanded by default
  serviceQuality: false,
  internalNotes: false
})

// Survey responses
const responses = ref({
  q1: '', // Contract Satisfaction
  q2: '', // Document Clarity
  q3: [], // Outstanding Issues (multi-select)
  q3Other: false,
  q3OtherText: '',
  q5: null, // Salesperson Support (1-5 stars)
  q6: '', // Likelihood to Recommend (NPS)
  q7: '' // Internal Follow-up Notes
})

// Trigger actions (auto-checked based on answers, but can be manually toggled)
const triggerActions = ref({
  negativeSatisfaction: false,
  documentClarity: false,
  poorSupport: false
})

// Question options
const contractSatisfactionOptions = [
  { value: 'very-satisfied', label: 'Very Satisfied - smooth and quick process' },
  { value: 'satisfied', label: 'Satisfied - minor delays but resolved' },
  { value: 'neutral', label: 'Neutral - took longer than expected' },
  { value: 'unsatisfied', label: 'Unsatisfied - had concerns about terms' },
  { value: 'very-unsatisfied', label: 'Very Unsatisfied - significant issues with contract' }
]

const documentClarityOptions = [
  { value: 'crystal-clear', label: 'Yes, everything was crystal clear' },
  { value: 'mostly-clear', label: 'Mostly clear, had a few questions' },
  { value: 'some-confusion', label: 'Some confusion, needed clarification' },
  { value: 'not-clear', label: 'Not clear at all, had many questions' },
  { value: 'didnt-review', label: "I didn't review it thoroughly" }
]

const outstandingIssuesOptions = [
  { value: 'pricing', label: 'Pricing or final price discrepancies' },
  { value: 'payment-terms', label: 'Payment terms unclear' },
  { value: 'warranty', label: 'Warranty or insurance terms' },
  { value: 'delivery-timeline', label: 'Delivery timeline not specified' },
  { value: 'trade-in', label: 'Trade-in valuation' },
  { value: 'additional-fees', label: 'Additional fees or charges' }
]

const recommendationOptions = [
  { value: 'definitely', label: 'Definitely (9-10) - Excellent experience' },
  { value: 'probably', label: 'Probably (7-8) - Good experience' },
  { value: 'unsure', label: 'Unsure (5-6) - Mixed experience' },
  { value: 'unlikely', label: 'Unlikely (3-4) - Poor experience' },
  { value: 'not-at-all', label: 'Not at all (0-2) - Very negative experience' }
]

// Computed properties
const showQ3 = computed(() => {
  return responses.value.q1 === 'unsatisfied' || responses.value.q1 === 'very-unsatisfied'
})

// Auto-check trigger actions based on survey answers
watch(() => responses.value.q1, (value) => {
  if (value === 'very-unsatisfied') {
    triggerActions.value.negativeSatisfaction = true
  } else {
    triggerActions.value.negativeSatisfaction = false
  }
})

watch(() => responses.value.q2, (value) => {
  if (value === 'not-clear') {
    triggerActions.value.documentClarity = true
  } else {
    triggerActions.value.documentClarity = false
  }
})

watch(() => responses.value.q5, (value) => {
  if (value === 1) {
    triggerActions.value.poorSupport = true
  } else {
    triggerActions.value.poorSupport = false
  }
})

// Form validation
const isValid = computed(() => {
  // Q1 is mandatory
  if (!responses.value.q1) return false
  
  // Q2 is mandatory
  if (!responses.value.q2) return false
  
  // Q3 is mandatory if Q1 indicates dissatisfaction
  if (showQ3.value && (!responses.value.q3 || responses.value.q3.length === 0) && !responses.value.q3Other) {
    return false
  }
  if (showQ3.value && responses.value.q3Other && !responses.value.q3OtherText?.trim()) {
    return false
  }
  
  return true
})

// Handle submit
const handleSubmit = () => {
  if (!isValid.value) return
  
  // Prepare survey data
  const surveyData = {
    responses: { ...responses.value },
    triggerActions: { ...triggerActions.value },
    timestamp: new Date().toISOString()
  }
  
  emit('submit', surveyData)
}

// Expose submit handler for parent component
defineExpose({
  submit: handleSubmit,
  isValid
})
</script>
