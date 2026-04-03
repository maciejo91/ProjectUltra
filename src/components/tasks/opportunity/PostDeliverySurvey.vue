<template>
  <div class="space-y-6">
    <!-- Survey Questions -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h5 class="font-semibold text-foreground text-sm mb-4">Post-Delivery Customer Satisfaction Survey</h5>
      
      <div class="space-y-6">
        <!-- Q1: Overall Satisfaction -->
        <div>
          <Label class="form-label mb-2">
            How satisfied are you with your new vehicle delivery experience?
            <span class="text-red-600">*</span>
          </Label>
          <div class="space-y-2">
            <label
              v-for="option in satisfactionOptions"
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

        <!-- Q2: Vehicle Condition -->
        <div>
          <Label class="form-label mb-2">
            Is the vehicle in the condition you expected?
            <span class="text-red-600">*</span>
          </Label>
          <div class="space-y-2">
            <label
              v-for="option in conditionOptions"
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

        <!-- Q3: Follow-up on Issues (Conditional) -->
        <div v-if="showQ3">
          <Label class="form-label mb-2">
            Please describe the issues you found:
            <span class="text-red-600">*</span>
          </Label>
          <Textarea
            v-model="responses.q3"
            rows="4"
            placeholder="Describe the issues..."
            class="w-full"
          />
        </div>

        <!-- Q4: Delivery Timeline -->
        <div>
          <Label class="form-label mb-2">
            Was the vehicle delivered on the scheduled date?
          </Label>
          <div class="space-y-2">
            <label
              v-for="option in timelineOptions"
              :key="option.value"
              class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition-colors"
              :class="
                responses.q4 === option.value
                  ? 'border-2 border-brand-blue bg-muted/50'
                  : 'border border-border hover:bg-muted/50'
              "
            >
              <input
                v-model="responses.q4"
                type="radio"
                :value="option.value"
                class="shrink-0"
              />
              <span class="text-sm text-foreground">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Q5: Salesman Professionalism (Rating) -->
        <div>
          <Label class="form-label mb-2">
            How would you rate the professionalism of our sales team during delivery?
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

        <!-- Q6: Documentation & Keys (Multi-select) -->
        <div>
          <Label class="form-label mb-2">
            Did you receive all the required items?
            <span class="text-red-600">*</span>
          </Label>
          <div class="space-y-2">
            <label
              v-for="item in documentationItems"
              :key="item.value"
              class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <input
                v-model="responses.q6"
                type="checkbox"
                :value="item.value"
                class="w-4 h-4 focus:ring-brand-blue border-gray-300 rounded"
                style="accent-color: var(--brand-blue);"
              />
              <span class="text-sm text-foreground">{{ item.label }}</span>
            </label>
            <div class="flex items-center gap-2 mt-2">
              <input
                v-model="responses.q6Other"
                type="checkbox"
                class="w-4 h-4 focus:ring-brand-blue border-gray-300 rounded"
                style="accent-color: var(--brand-blue);"
              />
              <span class="text-sm text-foreground">Other:</span>
              <Input
                v-if="responses.q6Other"
                v-model="responses.q6OtherText"
                placeholder="Specify other item"
                class="flex-1"
              />
            </div>
          </div>
        </div>

        <!-- Q7: Would You Recommend Us? -->
        <div>
          <Label class="form-label mb-2">
            Would you recommend our dealership to friends and family?
          </Label>
          <div class="space-y-2">
            <label
              v-for="option in recommendationOptions"
              :key="option.value"
              class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition-colors"
              :class="
                responses.q7 === option.value
                  ? 'border-2 border-brand-blue bg-muted/50'
                  : 'border border-border hover:bg-muted/50'
              "
            >
              <input
                v-model="responses.q7"
                type="radio"
                :value="option.value"
                class="shrink-0"
              />
              <span class="text-sm text-foreground">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Q8: Internal Notes -->
        <div>
          <Label class="form-label mb-2">
            Internal notes for follow-up actions:
            <span class="text-sm text-muted-foreground ml-1">(Private - only for internal staff)</span>
          </Label>
          <Textarea
            v-model="responses.q8"
            rows="4"
            placeholder="Add internal notes..."
            class="w-full"
          />
        </div>
      </div>
    </div>

    <!-- Trigger Actions Section -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h5 class="font-semibold text-foreground text-sm mb-4">Trigger Actions (Email Notifications)</h5>
      
      <div class="space-y-4">
        <!-- Negative Satisfaction -->
        <div class="flex items-center gap-3">
          <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors flex-1">
            <Checkbox
              id="trigger-negative-satisfaction"
              v-model="triggerActions.negativeSatisfaction"
            />
            <span class="text-sm font-medium text-foreground">
              ⚠️ Email to Sales Manager + Branch Manager
            </span>
          </Label>
          <span class="text-sm text-muted-foreground">(Q1 = Very Unsatisfied/Unsatisfied)</span>
        </div>
        
        <!-- Issues Reported -->
        <div class="flex items-center gap-3">
          <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors flex-1">
            <Checkbox
              id="trigger-issues"
              v-model="triggerActions.issuesReported"
            />
            <span class="text-sm font-medium text-foreground">
              ⚠️ Email to Service Department
            </span>
          </Label>
          <span class="text-sm text-muted-foreground">(Q3 = Issues reported)</span>
        </div>
        
        <!-- Delivery Delay -->
        <div class="flex items-center gap-3">
          <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors flex-1">
            <Checkbox
              id="trigger-delay"
              v-model="triggerActions.deliveryDelay"
            />
            <span class="text-sm font-medium text-foreground">
              ⚠️ Email to Delivery Coordinator
            </span>
          </Label>
          <span class="text-sm text-muted-foreground">(Q4 = Delayed major)</span>
        </div>
        
        <!-- High NPS -->
        <div class="flex items-center gap-3">
          <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors flex-1">
            <Checkbox
              id="trigger-nps"
              v-model="triggerActions.highNPS"
            />
            <span class="text-sm font-medium text-foreground">
              ✅ Email to Marketing
            </span>
          </Label>
          <span class="text-sm text-muted-foreground">(Q7 = Definitely Yes)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Checkbox, Label, Textarea, Input } from '@motork/component-library/future/primitives'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit', 'cancel'])

// Survey responses
const responses = ref({
  q1: '', // Overall Satisfaction
  q2: '', // Vehicle Condition
  q3: '', // Follow-up on Issues
  q4: '', // Delivery Timeline
  q5: null, // Salesman Professionalism (1-5)
  q6: [], // Documentation & Keys (multi-select)
  q6Other: false,
  q6OtherText: '',
  q7: '', // Would You Recommend Us?
  q8: '' // Internal Notes
})

// Trigger actions (auto-checked based on answers, but can be manually toggled)
const triggerActions = ref({
  negativeSatisfaction: false,
  issuesReported: false,
  deliveryDelay: false,
  highNPS: false
})

// Question options
const satisfactionOptions = [
  { value: 'very-satisfied', label: 'Very Satisfied' },
  { value: 'satisfied', label: 'Satisfied' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'unsatisfied', label: 'Unsatisfied' },
  { value: 'very-unsatisfied', label: 'Very Unsatisfied' }
]

const conditionOptions = [
  { value: 'perfect', label: 'Yes, perfect condition' },
  { value: 'acceptable', label: 'Yes, acceptable' },
  { value: 'minor-issues', label: 'There are minor issues' },
  { value: 'major-issues', label: 'There are major issues' }
]

const timelineOptions = [
  { value: 'on-time', label: 'Yes, on time' },
  { value: 'early', label: 'Yes, early' },
  { value: 'delayed-minor', label: 'No, delayed (minor - 1-3 days)' },
  { value: 'delayed-major', label: 'No, delayed (major - more than 3 days)' }
]

const documentationItems = [
  { value: 'keys', label: 'Vehicle keys' },
  { value: 'manual', label: "Owner's manual" },
  { value: 'registration', label: 'Registration documents' },
  { value: 'warranty', label: 'Service warranty information' },
  { value: 'insurance', label: 'Insurance documents' }
]

const recommendationOptions = [
  { value: 'definitely-yes', label: 'Definitely Yes' },
  { value: 'probably-yes', label: 'Probably Yes' },
  { value: 'not-sure', label: 'Not Sure' },
  { value: 'probably-not', label: 'Probably Not' },
  { value: 'definitely-not', label: 'Definitely Not' }
]

// Conditional Q3 visibility
const showQ3 = computed(() => {
  return responses.value.q2 === 'minor-issues' || responses.value.q2 === 'major-issues'
})

// Auto-check trigger actions based on survey answers
watch(() => responses.value.q1, (value) => {
  if (value === 'very-unsatisfied' || value === 'unsatisfied') {
    triggerActions.value.negativeSatisfaction = true
  } else {
    triggerActions.value.negativeSatisfaction = false
  }
})

watch(() => responses.value.q3, (value) => {
  if (value && value.trim().length > 0) {
    triggerActions.value.issuesReported = true
  } else {
    triggerActions.value.issuesReported = false
  }
})

watch(() => responses.value.q4, (value) => {
  if (value === 'delayed-major') {
    triggerActions.value.deliveryDelay = true
  } else {
    triggerActions.value.deliveryDelay = false
  }
})

watch(() => responses.value.q7, (value) => {
  if (value === 'definitely-yes') {
    triggerActions.value.highNPS = true
  } else {
    triggerActions.value.highNPS = false
  }
})

// Form validation
const isValid = computed(() => {
  // Q1 is mandatory
  if (!responses.value.q1) return false
  
  // Q2 is mandatory
  if (!responses.value.q2) return false
  
  // Q3 is mandatory if Q2 indicates issues
  if (showQ3.value && !responses.value.q3?.trim()) return false
  
  // Q6 is mandatory (at least one item must be selected OR "Other" with text)
  const hasRegularItems = responses.value.q6 && responses.value.q6.length > 0
  const hasOtherItem = responses.value.q6Other && responses.value.q6OtherText?.trim()
  if (!hasRegularItems && !hasOtherItem) {
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
