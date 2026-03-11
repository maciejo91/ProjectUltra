<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-lg max-h-[calc(100vh-4rem)] flex flex-col" :show-close-button="true">
        <DialogHeader class="shrink-0">
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Add a task to this request.
          </DialogDescription>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-6 px-6">
          <div class="space-y-2">
            <Label class="text-xs font-semibold uppercase text-muted-foreground">Task type</Label>
            <Select v-model="taskCode">
              <SelectTrigger class="w-full bg-background">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="t in allTaskTypes"
                  :key="t.code"
                  :value="t.code"
                >
                  {{ t.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-semibold uppercase text-muted-foreground">Assignee</Label>
            <Popover :open="assigneeDropdownOpen" @update:open="(v) => (assigneeDropdownOpen = v)">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="w-full flex items-center gap-3 px-3 py-2 h-10 min-h-10 rounded-md border border-input bg-background text-left text-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                >
                  <template v-if="selectedAssignee">
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 bg-muted text-foreground"
                    >
                      {{ selectedAssignee.initials || (selectedAssignee.name || '?').slice(0, 2).toUpperCase() }}
                    </div>
                    <span class="truncate">{{ selectedAssignee.name }}</span>
                  </template>
                  <span v-else class="text-muted-foreground">Select assignee...</span>
                  <ChevronDown class="size-4 ml-auto shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" side="bottom" align="start">
                <AssigneeDropdownContent @select="handleAssigneeSelect" />
              </PopoverContent>
            </Popover>
          </div>

          <div class="space-y-2">
            <Label class="text-xs font-semibold uppercase text-muted-foreground">Due date</Label>
            <Input
              v-model="dueDate"
              type="date"
              class="w-full h-10 min-h-10 bg-background"
            />
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button variant="outline" class="rounded-sm w-full sm:w-auto" @click="handleClose">
            Cancel
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!isValid"
            @click="handleSave"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@motork/component-library/future/primitives'
import AssigneeDropdownContent from '@/components/tasks/AssigneeDropdownContent.vue'
import { getAllTaskTypes } from '@/utils/taskTypes'

const props = defineProps({
  show: { type: Boolean, required: true },
  request: { type: Object, default: null }
})

const emit = defineEmits(['save', 'close'])

const taskCode = ref('')
const selectedAssignee = ref(null)
const assigneeDropdownOpen = ref(false)
const dueDate = ref('')

const allTaskTypes = getAllTaskTypes()

const selectedTaskName = computed(() => {
  const t = allTaskTypes.find((x) => x.code === taskCode.value)
  return t?.name || ''
})

const isValid = computed(
  () => !!taskCode.value && !!selectedAssignee.value && !!dueDate.value
)

function handleAssigneeSelect(assignee) {
  selectedAssignee.value = assignee
  assigneeDropdownOpen.value = false
}

watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) {
      taskCode.value = ''
      selectedAssignee.value = null
      dueDate.value = ''
    }
  }
)

function handleOpenChange(isOpen) {
  if (!isOpen) handleClose()
}

function handleClose() {
  taskCode.value = ''
  selectedAssignee.value = null
  dueDate.value = ''
  emit('close')
}

function handleSave() {
  if (!isValid.value) return
  const assignee = selectedAssignee.value
  const initials = assignee?.initials ?? (assignee?.name || '').slice(0, 2).toUpperCase()
  emit('save', {
    taskCode: taskCode.value,
    taskName: selectedTaskName.value,
    assignee: assignee.name,
    assigneeInitials: initials,
    dueDate: dueDate.value
  })
}

</script>
