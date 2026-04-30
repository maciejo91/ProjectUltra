<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Schedule Callback</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-6">
      <p class="text-sm text-muted-foreground">
        Schedule a callback with {{ entityName }} to follow up at a convenient time.
      </p>

      <!-- Callback Date & Time -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">
            Callback Date <span class="text-brand-red">*</span>
          </Label>
          <Input 
            v-model="formData.date"
            type="date"
            :min="minDate"
            required
            class="w-full h-10"
          />
        </div>
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">
            Callback Time <span class="text-brand-red">*</span>
          </Label>
          <Input 
            v-model="formData.time"
            type="time"
            required
            class="w-full h-10"
          />
        </div>
      </div>

      <!-- Callback Reason -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Reason for Callback</Label>
        <Select v-model="formData.reason">
          <SelectTrigger class="w-full h-10">
            <SelectValue placeholder="Select a reason..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer-requested">Customer Requested</SelectItem>
            <SelectItem value="follow-up-quote">Follow up on Quote</SelectItem>
            <SelectItem value="financing-discussion">Financing Discussion</SelectItem>
            <SelectItem value="trade-in-evaluation">Trade-in Evaluation</SelectItem>
            <SelectItem value="vehicle-availability">Vehicle Availability Update</SelectItem>
            <SelectItem value="general-inquiry">General Inquiry</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Notes -->
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Callback Notes</Label>
        <Textarea 
          v-model="formData.notes"
          rows="4"
          placeholder="Add any relevant notes about this callback..."
          class="w-full min-h-[100px] resize-none"
        />
      </div>

      <!-- Assignee (optional) -->
      <div v-if="showAssignee" class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Assign To</Label>
        <Select v-model="formData.assigneeId">
          <SelectTrigger class="w-full h-10">
            <SelectValue placeholder="Current Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="null">Current Owner</SelectItem>
            <SelectItem 
              v-for="user in availableUsers" 
              :key="user.id" 
              :value="user.id"
            >
              {{ user.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Set Reminder -->
      <div class="flex items-center gap-2">
        <Checkbox 
          v-model:checked="formData.setReminder"
          id="reminder"
        />
        <Label for="reminder" class="text-sm text-muted-foreground cursor-pointer">
          Set reminder 15 minutes before callback
        </Label>
      </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            label="Cancel"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            @click="$emit('close')"
          />
          <Button
            label="Schedule Callback"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
            :disabled="!isValid"
            @click="handleConfirm"
          >
            <template #icon-left>
              <CalendarCheck class="w-4 h-4 shrink-0" />
            </template>
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { CalendarCheck } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { 
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  entityType: {
    type: String,
    default: 'lead' // 'lead' or 'opportunity'
  },
  entityName: {
    type: String,
    default: 'the customer'
  },
  currentAssigneeId: {
    type: Number,
    default: null
  },
  showAssignee: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'scheduled'])

const usersStore = useUsersStore()

const formData = ref({
  date: '',
  time: '',
  reason: '',
  notes: '',
  assigneeId: null,
  setReminder: true
})

const availableUsers = computed(() => usersStore.users)

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const isValid = computed(() => {
  return formData.value.date && formData.value.time
})

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

onMounted(() => {
  // Set default date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  formData.value.date = tomorrow.toISOString().split('T')[0]
  
  // Set default time to 10:00 AM
  formData.value.time = '10:00'
  
  // Set default assignee
  formData.value.assigneeId = props.currentAssigneeId
})

function handleConfirm() {
  if (!isValid.value) return
  
  const callbackData = {
    date: formData.value.date,
    time: formData.value.time,
    dateTime: `${formData.value.date}T${formData.value.time}:00`,
    reason: formData.value.reason,
    notes: formData.value.notes,
    assigneeId: formData.value.assigneeId || props.currentAssigneeId,
    assignee: availableUsers.value.find(u => u.id === (formData.value.assigneeId || props.currentAssigneeId))?.name,
    setReminder: formData.value.setReminder
  }
  
  emit('scheduled', callbackData)
  emit('close')
}
</script>

