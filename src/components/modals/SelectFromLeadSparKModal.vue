<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>Select from LeadSparK</DialogTitle>
          <DialogDescription class="text-muted-foreground">
            Choose files from recently uploaded negotiations and attachments.
          </DialogDescription>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-4">
          <p v-if="!recentAttachments?.length" class="text-sm text-muted-foreground">
            No files have been uploaded to this request yet. Upload attachments in the Data tab first, then you can attach them to emails here.
          </p>
          <ul v-else class="space-y-2">
            <li
              v-for="item in recentAttachments"
              :key="item.id || item.fileName"
              class="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
            >
              <input
                type="checkbox"
                :id="`leadspark-${item.id || item.fileName}`"
                :checked="selectedIds.has(item.id || item.fileName)"
                class="h-4 w-4 rounded border-border"
                @change="toggle(item)"
              />
              <label
                :for="`leadspark-${item.id || item.fileName}`"
                class="flex-1 min-w-0 cursor-pointer text-sm text-foreground truncate"
              >
                {{ item.fileName || item.content?.replace(/^Attachment: /, '') || 'File' }}
              </label>
            </li>
          </ul>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            @click="handleClose"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="selectedIds.size === 0"
            @click="handleConfirm"
          >
            Add selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Button } from '@motork/component-library/future/primitives'
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

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  recentAttachments: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select'])

const selectedIds = ref(new Set())

watch(() => props.show, (isOpen) => {
  if (!isOpen) {
    selectedIds.value = new Set()
  }
})

function toggle(item) {
  const id = item.id ?? item.fileName
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function handleConfirm() {
  const selected = props.recentAttachments.filter(
    (item) => selectedIds.value.has(item.id ?? item.fileName)
  )
  emit('select', selected)
  emit('close')
}

function handleClose() {
  emit('close')
}

function handleOpenChange(isOpen) {
  if (!isOpen) emit('close')
}
</script>
