<template>
  <div 
    class="bg-background border border-border rounded-lg p-3 hover:border-primary/30 hover:shadow-sm transition-all group"
    :class="dismissing ? 'opacity-50' : ''"
  >
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0 flex-1" @click="handleQuestionClick">
        <p class="text-foreground text-sm font-medium leading-snug" v-html="getHighlightedQuestion()"></p>
      </div>
      <!-- Action Buttons + Dismiss -->
      <div class="flex gap-1.5 shrink-0 items-center">
          <template v-if="question.type === 'appointment-followup'">
            <Button
              @click="handleYes"
              size="sm"
              variant="default"
              class="h-7 text-xs"
            >
              Yes
            </Button>
            <Button
              @click="handleNo"
              size="sm"
              variant="outline"
              class="h-7 text-xs"
            >
              No
            </Button>
          </template>
          
          <template v-else-if="question.type === 'ns-followup'">
            <Button
              @click="handleYes"
              size="sm"
              variant="default"
              class="h-7 text-xs"
            >
              Yes
            </Button>
            <Button
              @click="handleNo"
              size="sm"
              variant="outline"
              class="h-7 text-xs"
            >
              No
            </Button>
            <Button
              @click="handleReassign"
              size="sm"
              variant="secondary"
              class="h-7 text-xs"
            >
              Reassign
            </Button>
          </template>
          
          <template v-else-if="question.type === 'offer-followup'">
            <Button
              @click="handleViewTask"
              size="sm"
              variant="default"
              class="h-7 text-xs"
            >
              View Opportunity
            </Button>
          </template>
          
          <template v-else-if="question.type === 'stuck-opportunity'">
            <Button
              @click="handleYes"
              size="sm"
              variant="default"
              class="h-7 text-xs"
            >
              Yes
            </Button>
            <Button
              @click="handleNo"
              size="sm"
              variant="outline"
              class="h-7 text-xs"
            >
              No
            </Button>
            <Button
              @click="handleReassign"
              size="sm"
              variant="secondary"
              class="h-7 text-xs"
            >
              Reassign
            </Button>
          </template>
          
          <template v-else-if="question.type === 'lead-qualification-urgency'">
            <Button
              @click="handleYes"
              size="sm"
              variant="default"
              class="h-7 text-xs"
            >
              Yes
            </Button>
            <Button
              @click="handleNo"
              size="sm"
              variant="outline"
              class="h-7 text-xs"
            >
              No
            </Button>
            <Button
              @click="handleReassign"
              size="sm"
              variant="secondary"
              class="h-7 text-xs"
            >
              Reassign
            </Button>
          </template>

        <!-- Dismiss -->
        <template v-if="!showDismissConfirm">
          <Button
            @click="showDismissConfirm = true"
            variant="ghost"
            size="icon-sm"
            class="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            title="Dismiss"
          >
            <X class="size-3.5" />
          </Button>
        </template>
        <div
          v-else
          class="bg-background border border-border rounded-lg shadow-lg p-2 flex flex-col gap-2 z-10 min-w-24 shrink-0"
        >
          <span class="text-xs font-semibold text-center text-muted-foreground uppercase">Dismiss?</span>
          <div class="flex gap-1">
            <Button
              @click="handleDismiss"
              size="xs"
              variant="default"
              class="h-7 flex-1 bg-destructive hover:bg-destructive/90 text-xs"
            >
              Yes
            </Button>
            <Button
              @click="showDismissConfirm = false"
              size="xs"
              variant="ghost"
              class="h-7 flex-1 text-xs"
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import { ref } from 'vue'
import { Button, Badge } from '@motork/component-library/future/primitives'

const props = defineProps({
  question: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'answer-yes', 
  'answer-no', 
  'reassign', 
  'view-task',
  'dismiss'
])

const showDismissConfirm = ref(false)
const dismissing = ref(false)

// Import stores
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'

const userStore = useUserStore()
const usersStore = useUsersStore()

const getOwnerDisplay = () => {
  // Get the assignee name from the opportunity or lead
  const assigneeName = props.question.opportunity?.assignee || props.question.lead?.assignee
  
  if (!assigneeName) return 'Unknown'
  
  // Check if it's the current user
  if (assigneeName === userStore.currentUser?.name) {
    return 'me'
  }
  
  return assigneeName
}

const getHighlightedQuestion = () => {
  const customerName = props.question.customer.name
  const questionText = props.question.question
  
  // Make the question clickable to view the task
  const highlightedName = `<span class="font-bold text-primary hover:underline cursor-pointer">${customerName}</span>`
  
  // Replace all instances of customer name with highlighted version
  return questionText.replace(new RegExp(customerName, 'g'), highlightedName)
}

const getPriorityTheme = (priority) => {
  if (priority === 1) return 'red'
  if (priority <= 3) return 'orange'
  return 'blue'
}

const getPriorityLabel = (priority) => {
  if (priority === 1) return 'CRITICAL'
  if (priority <= 3) return 'HIGH'
  return 'MEDIUM'
}

const getTimeAgo = () => {
  if (!props.question.createdAt && !props.question.appointmentDate) return 'Just now'
  
  const date = new Date(props.question.createdAt || props.question.appointmentDate)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  return `${Math.floor(diffDays / 7)} weeks ago`
}

const handleYes = () => emit('answer-yes', props.question)
const handleNo = () => emit('answer-no', props.question)
const handleReassign = () => emit('reassign', props.question)
const handleViewTask = () => emit('view-task', props.question)

const handleQuestionClick = (event) => {
  // Check if clicked on the highlighted customer name link
  if (event.target.tagName === 'A') {
    event.preventDefault()
    handleViewTask()
  }
}

const handleDismiss = () => {
  dismissing.value = true
  setTimeout(() => {
    emit('dismiss', props.question)
  }, 200)
}
</script>
