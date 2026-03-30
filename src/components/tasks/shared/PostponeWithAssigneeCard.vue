<template>
  <div class="w-full">
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-4 w-full">
      <h5 class="font-semibold text-foreground text-sm mb-4">{{ title }}</h5>
      <template v-if="showQuickTimeOptions">
        <div class="reschedule-toggle-group flex flex-wrap gap-2">
          <Toggle
            variant="outline"
            :model-value="rescheduleTime === 'tomorrow-9am'"
            @update:model-value="(p) => p && setRescheduleTime('tomorrow-9am')"
            class="followup-toggle-item"
          >
            Tomorrow 9:00 AM
          </Toggle>
          <Toggle
            variant="outline"
            :model-value="rescheduleTime === 'monday'"
            @update:model-value="(p) => p && setRescheduleTime('monday')"
            class="followup-toggle-item mk-ai-mode-active-toggle"
          >
            <Sparkles
              :size="14"
              class="mk-sparkles-icon shrink-0"
              :fill="rescheduleTime === 'monday' ? 'url(#sparkles-gradient)' : 'currentColor'"
              :stroke="rescheduleTime === 'monday' ? 'none' : 'currentColor'"
              :stroke-width="rescheduleTime === 'monday' ? 0 : 1.5"
            />
            Suggest AI time
          </Toggle>
          <Toggle
            variant="outline"
            :model-value="rescheduleTime === 'custom'"
            @update:model-value="(p) => p && setRescheduleTime('custom')"
            class="followup-toggle-item"
          >
            Select time
          </Toggle>
        </div>
        <div
          v-if="rescheduleTime === 'monday' && aiSuggestionData"
          class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div class="flex items-start gap-2">
            <Lightbulb class="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-semibold text-foreground mb-1">
                {{ aiSuggestionData.formattedDate }} at {{ aiSuggestionData.time }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ aiSuggestionData.reason }}
              </p>
            </div>
          </div>
        </div>
        <div v-if="rescheduleTime === 'custom'" class="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label class="form-label">Date <span class="text-destructive">*</span></Label>
            <Input type="date" v-model="customDate" :min="minDate" class="w-full" />
          </div>
          <div>
            <Label class="form-label">Time</Label>
            <Input type="time" v-model="customTime" class="w-full" />
          </div>
        </div>
      </template>
      <div v-if="!showQuickTimeOptions" class="grid grid-cols-2 gap-3">
        <div>
          <Label class="form-label">Date <span class="text-destructive">*</span></Label>
          <Input type="date" v-model="customDate" :min="minDate" class="w-full" />
        </div>
        <div>
          <Label class="form-label">Time (optional)</Label>
          <Input type="time" v-model="customTime" class="w-full" />
        </div>
      </div>
      <div v-if="showReasonField" class="mt-4">
        <Label class="form-label">Reason (optional)</Label>
        <Textarea
          v-model="reason"
          rows="2"
          placeholder="Why are you postponing this task?"
          class="w-full resize-none border-border bg-background text-foreground"
        />
      </div>
      <div class="mt-4">
        <Label class="form-label">Assigned to</Label>
        <SelectMenu
          v-model="selectedAssigneeKey"
          :items="assigneeOptions"
          value-key="_key"
          :placeholder="assigneePlaceholder"
          class="w-full"
        >
          <template #item="{ item }">
            <div class="flex items-center gap-2">
              <div
                v-if="item.type === 'user'"
                class="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                :class="getRoleAvatarClass(item.role)"
              >
                {{ getInitials(item.name || item.label) }}
              </div>
              <Users v-else-if="item.type === 'team'" class="w-4 h-4 shrink-0 text-muted-foreground" />
              <span class="font-medium text-foreground">{{ item.label }}</span>
            </div>
          </template>
        </SelectMenu>
      </div>
      <div class="mt-4">
        <Label class="form-label">Note to assignee</Label>
        <Textarea
          v-model="noteToAssignee"
          rows="3"
          class="w-full resize-none border-border bg-background text-foreground"
          placeholder="Add any notes or instructions for the assignee..."
        />
      </div>
    </div>
    <div
      v-if="showConfirmButtons"
      class="flex w-full justify-end gap-2 pt-3 flex-wrap"
    >
      <Button variant="secondary" :disabled="saving" @click="emit('cancel')">
        {{ cancelLabel }}
      </Button>
      <Button
        variant="primary"
        class="bg-primary text-white"
        :disabled="!canSubmit || saving"
        @click="handleConfirm"
      >
        <Spinner v-if="saving" class="size-4 shrink-0 mr-2" />
        {{ confirmLabel }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Button, Input, Label, Textarea, Toggle, Spinner } from '@motork/component-library/future/primitives'
import { SelectMenu } from '@motork/component-library/future/components'
import { Sparkles, Lightbulb, Users } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, default: 'Postpone task to' },
  assigneeOptions: { type: Array, default: () => [] },
  defaultAssigneeKey: { type: String, default: '' },
  assigneePlaceholder: { type: String, default: 'Assign next attempt to...' },
  confirmLabel: { type: String, default: 'Postpone' },
  cancelLabel: { type: String, default: 'Cancel' },
  showQuickTimeOptions: { type: Boolean, default: false },
  showSuggestAi: { type: Boolean, default: false },
  aiSuggestionData: { type: Object, default: null },
  saving: { type: Boolean, default: false },
  showConfirmButtons: { type: Boolean, default: true },
  showReasonField: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel'])

const rescheduleTime = ref(props.showQuickTimeOptions ? 'tomorrow-9am' : 'custom')
const customDate = ref('')
const customTime = ref('')
const reason = ref('')
const selectedAssigneeKey = ref(props.defaultAssigneeKey || (props.assigneeOptions[0]?._key ?? ''))
const noteToAssignee = ref('')

const minDate = computed(() => new Date().toISOString().split('T')[0])

function getInitials(name) {
  if (!name) return '?'
  return String(name)
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

function getRoleAvatarClass(role) {
  const classes = {
    manager: 'bg-blue-100 text-blue-700',
    salesman: 'bg-purple-100 text-purple-700',
    operator: 'bg-orange-100 text-orange-700'
  }
  return classes[role] || 'bg-muted text-muted-foreground'
}

function setRescheduleTime(value) {
  rescheduleTime.value = value
}

function computeDateTime() {
  if (props.showQuickTimeOptions && rescheduleTime.value === 'tomorrow-9am') {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow.toISOString()
  }
  if (props.showQuickTimeOptions && rescheduleTime.value === 'monday' && props.aiSuggestionData?.dateTime) {
    return new Date(props.aiSuggestionData.dateTime).toISOString()
  }
  if (props.showQuickTimeOptions && rescheduleTime.value === 'monday') {
    const monday = new Date()
    const daysUntilMonday = (8 - monday.getDay()) % 7 || 7
    monday.setDate(monday.getDate() + daysUntilMonday)
    monday.setHours(9, 0, 0, 0)
    return monday.toISOString()
  }
  if (customDate.value && customTime.value) {
    return new Date(`${customDate.value}T${customTime.value}:00`).toISOString()
  }
  if (customDate.value) {
    return new Date(`${customDate.value}T12:00:00`).toISOString()
  }
  return null
}

const canSubmit = computed(() => !!computeDateTime())

function getPayload() {
  const dateTime = computeDateTime()
  if (!dateTime) return null
  const assignee = props.assigneeOptions.find(o => o._key === selectedAssigneeKey.value) ?? null
  return {
    dateTime,
    date: dateTime.split('T')[0],
    time: customTime.value || '12:00',
    reason: reason.value?.trim() || '',
    assignee: assignee?.type === 'none' ? null : assignee,
    noteToAssignee: noteToAssignee.value?.trim() || ''
  }
}

function handleConfirm() {
  if (!canSubmit.value || props.saving) return
  const payload = getPayload()
  if (payload) emit('confirm', payload)
}

watch(() => props.defaultAssigneeKey, (key) => {
  if (key) selectedAssigneeKey.value = key
}, { immediate: true })

watch(() => props.showQuickTimeOptions, (show) => {
  if (!show) {
    rescheduleTime.value = 'custom'
    const today = new Date()
    customDate.value = today.toISOString().split('T')[0]
    customTime.value = today.toTimeString().slice(0, 5)
  }
}, { immediate: true })

defineExpose({
  getPayload,
  canSubmit
})
</script>
