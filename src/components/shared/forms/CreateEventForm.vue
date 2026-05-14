<template>
  <div class="space-y-4">
    <div>
      <label class="block label-upper mb-2">Event Type</label>
      <Select v-model="localEvent.type">
        <SelectTrigger class="w-full h-10 min-h-10">
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
        </SelectContent>
      </Select>
    </div>

    <div>
      <label class="block label-upper mb-2">Title</label>
      <input
        v-model="localEvent.title"
        type="text"
        placeholder="Event title..."
        class="input"
      >
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block label-upper mb-2">Date</label>
        <MiniCalendarDateField
          v-model="localEvent.date"
          aria-label="Event date"
          group-class="rounded-md"
          input-class="min-w-0"
        />
      </div>
      <div>
        <label class="block label-upper mb-2">Time</label>
        <input
          v-model="localEvent.time"
          type="time"
          class="input"
        >
      </div>
    </div>

    <div>
      <label class="block label-upper mb-2">Customer</label>
      <input
        v-model="localEvent.customer"
        type="text"
        placeholder="Customer name..."
        class="input"
        :disabled="disabledFields.includes('customer')"
      >
    </div>

    <div>
      <label class="block label-upper mb-2">Assign to</label>
      <Select
        v-model="localEvent.assignee"
        :disabled="disabledFields.includes('assignee')"
      >
        <SelectTrigger class="w-full h-10 min-h-10">
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

    <div>
      <label class="block label-upper mb-2">Dealership</label>
      <Select v-model="localEvent.dealership">
        <SelectTrigger class="w-full h-10 min-h-10">
          <SelectValue placeholder="Select dealership..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="d in dealerships" :key="d" :value="d">{{ d }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="showActions" class="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-2">
      <Button
        label="Cancel"
        variant="outline"
        size="small"
        class="rounded-sm w-full sm:w-auto"
        @click="handleCancel"
      />
      <Button
        label="Create Event"
        variant="primary"
        size="small"
        class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
        @click="handleCreate"
      />
    </div>
  </div>
</template>

<script setup>
import { Users } from 'lucide-vue-next'
import { ref, watch, computed, onMounted } from 'vue'
import { 
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@motork/component-library/future/primitives'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import MiniCalendarDateField from '@/components/shared/forms/MiniCalendarDateField.vue'

const props = defineProps({
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
  },
  initialDate: {
    type: String,
    default: ''
  },
  dealerships: {
    type: Array,
    default: () => []
  },
  /** When true, show Cancel / Create Event buttons. Use false when wrapping in modal with its own footer. */
  showActions: {
    type: Boolean,
    default: true
  },
  /** Pass to reset form when opening (e.g. modal show or inline expand). */
  resetTrigger: {
    type: [Boolean, Number, String],
    default: null
  }
})

const emit = defineEmits(['create', 'cancel'])

const userStore = useUserStore()
const usersStore = useUsersStore()

const assignableUsers = computed(() => usersStore.assignableUsers || [])
const assignableTeams = computed(() => usersStore.assignableTeams || [])

const isTeamSelected = computed(() => {
  return localEvent.value.assignee && localEvent.value.assignee.startsWith('team-')
})

const localEvent = ref({
  type: 'test-drive',
  title: '',
  date: '',
  time: '',
  customer: '',
  assignee: '',
  dealership: ''
})

function initFromProps() {
  const defaultAssignee = props.assignee || `user-${userStore.currentUser?.id || 1}`
  localEvent.value = {
    type: 'test-drive',
    title: '',
    date: props.initialDate || '',
    time: '',
    customer: props.customer?.name || '',
    assignee: defaultAssignee,
    dealership: ''
  }
}

watch(() => props.resetTrigger, () => {
  initFromProps()
}, { immediate: true })

watch(() => [props.customer, props.initialDate], () => {
  if (props.customer?.name) localEvent.value.customer = props.customer.name
  if (props.initialDate) localEvent.value.date = props.initialDate
})

onMounted(() => {
  if (!localEvent.value.assignee) {
    localEvent.value.assignee = props.assignee || `user-${userStore.currentUser?.id || 1}`
  }
  if (props.customer?.name && !localEvent.value.customer) {
    localEvent.value.customer = props.customer.name
  }
})

const handleCreate = () => {
  if (localEvent.value.title && localEvent.value.date) {
    emit('create', { ...localEvent.value })
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
