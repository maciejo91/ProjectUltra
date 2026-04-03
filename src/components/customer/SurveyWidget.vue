<template>
  <div>
    <!-- Collapsed State - Minimal Space -->
    <button
      v-if="!isExpanded"
      @click="isExpanded = true"
      class="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
    >
      <span class="font-medium">Lead Qualification Survey</span>
      <ChevronDown class="w-3 h-3 shrink-0 text-muted-foreground" />
    </button>
    
    <!-- Expanded State -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <h5 class="text-sm font-semibold text-foreground">Lead Qualification Survey</h5>
        <button
          @click="isExpanded = false"
          class="text-sm text-muted-foreground hover:text-muted-foreground transition-colors"
        >
          <ChevronUp class="w-4 h-4 shrink-0" />
        </button>
      </div>
      
      <div class="space-y-4">
        <!-- Survey Questions -->
        <div
          v-for="(question, index) in questions"
          :key="index"
          class="space-y-2"
        >
          <label class="block text-sm font-medium text-muted-foreground">{{ question.label }}</label>
          
          <!-- Text input -->
          <textarea
            v-if="question.type === 'text'"
            v-model="responses[question.key]"
            :placeholder="question.placeholder"
            rows="3"
            class="input resize-none text-sm py-2 px-3 w-full"
          ></textarea>
          
          <!-- Select dropdown -->
          <Select
            v-else-if="question.type === 'select'"
            v-model="responses[question.key]"
          >
            <SelectTrigger class="w-full h-10 min-h-10">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="option in question.options"
                :key="option"
                :value="option"
              >
                {{ option }}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <!-- Radio buttons -->
          <div
            v-else-if="question.type === 'radio'"
            class="space-y-2"
          >
            <label
              v-for="option in question.options"
              :key="option"
              class="flex items-center text-sm text-muted-foreground cursor-pointer"
            >
              <input
                type="radio"
                v-model="responses[question.key]"
                :value="option"
                class="mr-2 w-4 h-4 text-brand-red focus:ring-brand-red border-gray-300"
              />
              {{ option }}
            </label>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-2 flex-wrap justify-end pt-2">
          <Button
            label="Complete Survey"
            variant="primary"
            size="small"
            @click="handleComplete"
            class="!bg-green-600 !hover:bg-green-700 !text-white !border-green-600"
          />
          <Button
            label="Customer Refused"
            variant="outline"
            size="small"
            @click="handleRefuse"
          />
          <Button
            label="Not Responding"
            variant="outline"
            size="small"
            @click="handleNotResponding"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { 
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@motork/component-library/future/primitives'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
    // Format: [{ key: 'interest', label: 'Is customer still interested?', type: 'select', options: ['Yes', 'No', 'Maybe'], placeholder: '' }]
  },
  initialExpanded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['survey-completed', 'survey-refused', 'not-responding'])

const isExpanded = ref(props.initialExpanded)
const responses = ref({})

// Initialize responses object
watch(() => props.questions, (newQuestions) => {
  const initialResponses = {}
  newQuestions.forEach(q => {
    initialResponses[q.key] = ''
  })
  responses.value = initialResponses
}, { immediate: true })

const handleComplete = () => {
  emit('survey-completed', { ...responses.value })
  resetForm()
}

const handleRefuse = () => {
  emit('survey-refused')
  resetForm()
}

const handleNotResponding = () => {
  emit('not-responding')
  resetForm()
}

const resetForm = () => {
  isExpanded.value = false
  const initialResponses = {}
  props.questions.forEach(q => {
    initialResponses[q.key] = ''
  })
  responses.value = initialResponses
}
</script>

