<script setup>
import { ref, watch, computed } from 'vue'
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@motork/component-library/future/primitives'

const props = defineProps({
  event: { type: Object, default: null },
  initialRange: { type: Object, default: null },
  eventTypes: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  defaultUserId: { type: [String, Number], default: '' },
})

const emit = defineEmits(['save', 'delete', 'cancel'])

const title = ref('')
const description = ref('')
const location = ref('')
const attendees = ref('')
const startInput = ref('')
const endInput = ref('')
const selectedTypeId = ref('')
const selectedUserId = ref('')

const formatForInput = (value) => {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

const parseInput = (v) => {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

const init = () => {
  title.value = ''
  description.value = ''
  location.value = ''
  attendees.value = ''
  startInput.value = ''
  endInput.value = ''
  selectedTypeId.value = ''
  selectedUserId.value = String(props.defaultUserId || '')

  if (props.event) {
    title.value = props.event.title || ''
    description.value = props.event.description || ''
    location.value = props.event.location || ''
    attendees.value = props.event.attendees || ''
    startInput.value = formatForInput(props.event.startTime)
    endInput.value = formatForInput(props.event.endTime)
    selectedTypeId.value = props.event.type || ''
    selectedUserId.value = String(props.event.assigneeId || props.defaultUserId || '')
    return
  }

  const start = props.initialRange?.start || new Date()
  const end = props.initialRange?.end || new Date(start.getTime() + 30 * 60 * 1000)
  startInput.value = formatForInput(start)
  endInput.value = formatForInput(end)
  selectedTypeId.value = props.eventTypes[0]?.value || ''
  selectedUserId.value = String(props.defaultUserId || '')
}

watch(() => [props.event, props.initialRange], init, { immediate: true, deep: true })

watch(
  () => props.eventTypes,
  (types) => {
    if (props.event) return
    if (!types?.length) return
    const valid = types.some((t) => t.value === selectedTypeId.value)
    if (!selectedTypeId.value || !valid) {
      selectedTypeId.value = types[0].value
    }
  },
  { immediate: true }
)

const isValid = computed(() =>
  title.value.trim() && parseInput(startInput.value) && parseInput(endInput.value) && selectedTypeId.value
)

const handleSave = () => {
  const startTime = parseInput(startInput.value)
  const endTime = parseInput(endInput.value)
  if (!isValid.value) return
  emit('save', {
    id: props.event?.id,
    title: title.value.trim(),
    description: description.value.trim() || undefined,
    startTime,
    endTime,
    typeId: selectedTypeId.value,
    type: selectedTypeId.value,
    location: location.value.trim() || undefined,
    attendees: attendees.value.trim() || undefined,
    assigneeId: selectedUserId.value ? parseInt(selectedUserId.value, 10) : undefined,
  })
}

const handleDelete = () => {
  if (props.event) emit('delete', props.event.id)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-foreground">Title</label>
      <Input v-model="title" type="text" class="h-9" placeholder="Event title" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-foreground">Starts</label>
        <Input v-model="startInput" type="datetime-local" class="h-9" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-foreground">Ends</label>
        <Input v-model="endInput" type="datetime-local" class="h-9" />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-foreground">Category</label>
        <Select v-model="selectedTypeId">
          <SelectTrigger class="h-9">
            <SelectValue :placeholder="eventTypes[0]?.label || 'Select type'" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="t in eventTypes"
              :key="t.value"
              :value="t.value"
            >
              {{ t.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-foreground">Owner</label>
        <Select v-model="selectedUserId">
          <SelectTrigger class="h-9">
            <SelectValue placeholder="Select owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="u in users"
              :key="u.id"
              :value="String(u.id)"
            >
              {{ u.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-foreground">Location</label>
      <Input v-model="location" type="text" class="h-9" placeholder="Meeting room or address" />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-foreground">Attendees</label>
      <Input v-model="attendees" type="text" class="h-9" placeholder="Names or team" />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-foreground">Notes</label>
      <Textarea
        v-model="description"
        rows="3"
        class="resize-none"
        placeholder="Additional context"
      />
    </div>

    <div class="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-2">
      <Button
        v-if="event"
        variant="ghost"
        size="sm"
        class="text-destructive rounded-sm w-full sm:w-auto order-last sm:order-none"
        @click="handleDelete"
      >
        Delete
      </Button>
      <div class="flex gap-2 ml-auto">
        <Button variant="outline" size="sm" class="rounded-sm w-full sm:w-auto" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          class="rounded-sm w-full sm:w-auto"
          :disabled="!isValid"
          @click="handleSave"
        >
          Save
        </Button>
      </div>
    </div>
  </div>
</template>
