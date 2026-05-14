<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-6">
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Event Type</Label>
        <Select v-model="localEvent.type">
          <SelectTrigger class="w-full h-10">
            <SelectValue placeholder="Select event type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test-drive">Test Drive</SelectItem>
            <SelectItem value="appointment">Dealership Visit</SelectItem>
            <SelectItem value="offsite">Offsite Visit</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="marketing">Marketing Event</SelectItem>
            <SelectItem value="leave">Leave</SelectItem>
            <SelectItem value="memo">Memo</SelectItem>
            <SelectItem value="recall">Recall</SelectItem>
            <SelectItem value="absence">Absence</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Title</Label>
        <Input 
          v-model="localEvent.title"
          type="text" 
          placeholder="Event title..." 
          class="w-full h-10"
        />
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Date</Label>
          <MiniCalendarDateField
            v-model="localEvent.date"
            aria-label="Event date"
            group-class="rounded-md"
            input-class="min-w-0"
            popover-content-class="z-[110]"
          />
        </div>
        <div class="space-y-2">
          <Label class="block text-sm font-semibold text-foreground">Time</Label>
          <Input 
            v-model="localEvent.time"
            type="time" 
            class="w-full h-10"
          />
        </div>
      </div>
      
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Customer</Label>
        <Input 
          v-model="localEvent.customer"
          type="text" 
          placeholder="Customer name..." 
          class="w-full h-10"
          :disabled="disabledFields.includes('customer')"
          :value="customer?.name || localEvent.customer"
        />
      </div>
      
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Assign to</Label>
        <Select 
          v-model="localEvent.assignee"
          :disabled="disabledFields.includes('assignee')"
        >
          <SelectTrigger class="w-full h-10">
            <SelectValue placeholder="Select assignee..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="team in assignableTeams" :key="`team-${team.id}`" :value="`team-${team.id}`">
              {{ team.name }} Team
            </SelectItem>
            <SelectItem v-for="user in assignableUsers" :key="`user-${user.id}`" :value="`user-${user.id}`">
              {{ user.name }}{{ user.id === userStore.currentUser?.id ? ' (Me)' : '' }}
            </SelectItem>
          </SelectContent>
        </Select>
        <p v-if="isTeamSelected" class="text-sm text-muted-foreground mt-1">
          <Users class="w-4 h-4 shrink-0 text-muted-foreground inline" /> Any available team member will be assigned
        </p>
      </div>
      
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Vehicle</Label>
        <Input 
          v-model="localEvent.vehicle"
          type="text" 
          placeholder="Vehicle..." 
          class="w-full h-10"
        />
      </div>
      
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Dealership</Label>
        <Select v-model="localEvent.dealership">
          <SelectTrigger class="w-full h-10">
            <SelectValue placeholder="Select dealership..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="d in dealerships" :key="d" :value="d">{{ d }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div class="space-y-2">
        <Label class="block text-sm font-semibold text-foreground">Status</Label>
        <Select v-model="localEvent.status">
          <SelectTrigger class="w-full h-10">
            <SelectValue placeholder="Select status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no-show">No-show</SelectItem>
          </SelectContent>
        </Select>
      </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            label="Cancel"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            @click="handleCancel"
          />
          <Button
            label="Save Changes"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
            @click="handleSave"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { Users } from 'lucide-vue-next'
import { ref, watch, computed } from 'vue'
import { 
  Button,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
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
import MiniCalendarDateField from '@/components/shared/forms/MiniCalendarDateField.vue'
import { formatMotorkDateFieldEu, normalizeMotorkDateFieldToIso } from '@/utils/motorkDateField.js'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  event: {
    type: Object,
    default: null
  },
  dealerships: {
    type: Array,
    default: () => []
  },
  customer: {
    type: Object,
    default: null
  },
  assignee: {
    type: String,
    default: null
  },
  disabledFields: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel'])

const userStore = useUserStore()
const usersStore = useUsersStore()

const assignableUsers = computed(() => usersStore.assignableUsers)
const assignableTeams = computed(() => usersStore.assignableTeams)

const isTeamSelected = computed(() => {
  return localEvent.value.assignee && localEvent.value.assignee.startsWith('team-')
})

const localEvent = ref({
  id: null,
  type: 'test-drive',
  title: '',
  date: '',
  time: '',
  customer: '',
  assignee: '',
  vehicle: '',
  dealership: '',
  status: 'confirmed'
})

watch(() => [props.show, props.event], ([newShow, newEvent]) => {
  if (newShow && newEvent) {
    try {
      const startDate = newEvent.start ? new Date(newEvent.start) : new Date()
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid date')
      }
      // Extract assignee from event (could be assigneeId or assignee string)
      const eventAssignee = newEvent.assigneeId 
        ? `user-${newEvent.assigneeId}` 
        : (newEvent.assignee || props.assignee || `user-${userStore.currentUser?.id || 1}`)
      
      localEvent.value = {
        id: newEvent.id,
        type: newEvent.type || 'test-drive',
        title: newEvent.title || '',
        date: formatMotorkDateFieldEu(startDate),
        time: startDate.toTimeString().slice(0, 5),
        customer: props.customer?.name || newEvent.customer || '',
        assignee: eventAssignee,
        vehicle: newEvent.vehicle || '',
        dealership: newEvent.dealership || '',
        status: newEvent.status || 'confirmed'
      }
    } catch (error) {
      console.error('Error parsing event date:', error)
      // Set default values if date parsing fails
      const now = new Date()
      const eventAssignee = newEvent.assigneeId 
        ? `user-${newEvent.assigneeId}` 
        : (newEvent.assignee || props.assignee || `user-${userStore.currentUser?.id || 1}`)
      
      localEvent.value = {
        id: newEvent.id,
        type: newEvent.type || 'test-drive',
        title: newEvent.title || '',
        date: formatMotorkDateFieldEu(now),
        time: now.toTimeString().slice(0, 5),
        customer: props.customer?.name || newEvent.customer || '',
        assignee: eventAssignee,
        vehicle: newEvent.vehicle || '',
        dealership: newEvent.dealership || '',
        status: newEvent.status || 'confirmed'
      }
    }
  }
})

const handleSave = () => {
  if (localEvent.value.title && localEvent.value.date) {
    const dateIso =
      normalizeMotorkDateFieldToIso(String(localEvent.value.date || '').trim()) ||
      String(localEvent.value.date || '').trim()
    emit('save', { ...localEvent.value, date: dateIso })
  }
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    handleCancel()
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>



