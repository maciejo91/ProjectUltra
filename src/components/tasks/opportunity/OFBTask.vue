<template>
  <div class="space-y-6">
    <!-- Survey Questions -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <h5 class="font-semibold text-foreground text-sm mb-4">Questions to ask customer</h5>
      
      <div class="space-y-6">
        <!-- Q1: Did you review the offer? -->
        <div>
          <Label class="form-label mb-2">
            1. Did you review the offer?
            <span class="text-red-600">*</span>
          </Label>
          <div class="space-y-2">
            <label
              v-for="option in reviewOptions"
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

        <!-- Q2: Do you have questions about the offer? -->
        <div>
          <Label class="form-label mb-2">
            2. Do you have questions about the offer?
            <span class="text-red-600">*</span>
          </Label>
          <div class="space-y-2">
            <label
              v-for="option in yesNoOptions"
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

        <!-- Q3: Are you interested in this offer? -->
        <div>
          <Label class="form-label mb-2">
            3. Are you interested in this offer?
            <span class="text-red-600">*</span>
          </Label>
          <div class="space-y-2">
            <label
              v-for="option in interestOptions"
              :key="option.value"
              class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition-colors"
              :class="
                responses.q3 === option.value
                  ? 'border-2 border-brand-blue bg-muted/50'
                  : 'border border-border hover:bg-muted/50'
              "
            >
              <input
                v-model="responses.q3"
                type="radio"
                :value="option.value"
                class="shrink-0"
              />
              <span class="text-sm text-foreground">{{ option.label }}</span>
            </label>
          </div>
        </div>

        <!-- Q4: If no, why? (Conditional) -->
        <div v-if="showQ4">
          <Label class="form-label mb-2">
            4. If no, why?
            <span class="text-sm text-muted-foreground ml-1">(optional notes)</span>
          </Label>
          <Textarea
            v-model="responses.q4"
            rows="4"
            placeholder="Describe the reason..."
            class="w-full"
          />
        </div>

        <!-- Q5: Next steps? -->
        <div>
          <Label class="form-label mb-2">
            5. Next steps?
            <span class="text-red-600">*</span>
          </Label>
          <div class="space-y-2">
            <label
              v-for="option in nextStepsOptions"
              :key="option.value"
              class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition-colors"
              :class="
                responses.q5 === option.value
                  ? 'border-2 border-brand-blue bg-muted/50'
                  : 'border border-border hover:bg-muted/50'
              "
            >
              <input
                v-model="responses.q5"
                type="radio"
                :value="option.value"
                class="shrink-0"
              />
              <span class="text-sm text-foreground">{{ option.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Label, Textarea } from '@motork/component-library/future/primitives'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit', 'postpone', 'cancel'])

// Survey responses
const responses = ref({
  q1: '', // Did you review the offer?
  q2: '', // Do you have questions about the offer?
  q3: '', // Are you interested in this offer?
  q4: '', // If no, why? (optional notes)
  q5: '' // Next steps?
})

// Question options
const reviewOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not-yet', label: 'Not yet' }
]

const yesNoOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
]

const interestOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'maybe', label: 'Maybe' }
]

const nextStepsOptions = [
  { value: 'send-revised-offer', label: 'Send revised offer' },
  { value: 'close-opportunity', label: 'Close this opportunity' },
  { value: 'follow-up-later', label: 'Follow up later' }
]


// Conditional Q4 visibility (show if Q3 is "no")
const showQ4 = computed(() => {
  return responses.value.q3 === 'no'
})

// Form validation
const isValid = computed(() => {
  // Q1, Q2, Q3, and Q5 are mandatory
  if (!responses.value.q1) return false
  if (!responses.value.q2) return false
  if (!responses.value.q3) return false
  if (!responses.value.q5) return false
  
  return true
})

// Handle submit
const handleSubmit = () => {
  if (!isValid.value) return
  
  // Prepare survey data
  const surveyData = {
    responses: { ...responses.value },
    timestamp: new Date().toISOString()
  }
  
  emit('submit', surveyData)
}

// Expose for parent component
defineExpose({
  submit: handleSubmit,
  isValid
})
</script>

