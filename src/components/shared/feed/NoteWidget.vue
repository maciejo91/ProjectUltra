<template>
  <!-- Modal Mode -->
  <Dialog v-if="modal" :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>{{ item ? 'Edit Note' : 'Add Note' }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-6">
          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">
              Note <span class="text-brand-red">*</span>
            </Label>
            <Textarea 
              v-model="noteText"
              rows="8" 
              :placeholder="t('common.notes.placeholder')"
              required
              class="w-full min-h-[200px] resize-none"
            />
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            @click="handleCancel"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!noteText.trim() || saving"
            @click="handleSave"
          >
            {{ saving ? 'Saving...' : (item ? 'Update Note' : 'Add note') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>

  <!-- Inline Mode -->
  <div
    v-else
    class="animate-fade-in relative bg-white rounded-lg border border-border p-6 shadow-nsc-card"
  >
    <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-border rotate-45"></div>
    <div v-if="!hideHeader" class="flex justify-between items-center mb-4">
      <h5 class="text-sm font-semibold text-foreground">{{ item ? 'Edit Note' : 'Add Note' }}</h5>
      <button type="button" @click="handleCancel" class="text-muted-foreground hover:text-foreground p-1 rounded" aria-label="Close"><X class="w-4 h-4 shrink-0" /></button>
    </div>
    <div v-else class="flex justify-end mb-2">
      <button type="button" @click="handleCancel" class="text-muted-foreground hover:text-foreground p-1 rounded" aria-label="Close"><X class="w-4 h-4 shrink-0" /></button>
    </div>
    <div>
      <Label class="form-label">Note</Label>
      <Textarea
        v-model="noteText"
        rows="4"
        class="w-full resize-none min-h-[120px]"
        :placeholder="t('common.notes.placeholder')"
      />
    </div>
    <div v-if="!hideActions" class="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
      <Button variant="secondary" @click="handleCancel">
        Cancel
      </Button>
      <Button
        variant="primary"
        :disabled="!noteText.trim() || saving"
        @click="handleSave"
      >
        {{ saving ? 'Saving...' : 'Save' }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { X } from 'lucide-vue-next'
import { 
  Button,
  Label,
  Textarea
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

const { t } = useI18n()

const props = defineProps({
  // Modal mode props
  modal: {
    type: Boolean,
    default: false
  },
  show: {
    type: Boolean,
    default: false
  },
  
  // Note data props
  item: {
    type: Object,
    default: null
  },
  taskType: {
    type: String,
    default: 'lead'
  },
  taskId: {
    type: Number,
    default: null
  },
  
  // Inline mode customization props
  hideActions: {
    type: Boolean,
    default: false
  },
  hideHeader: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel', 'close'])

const noteText = ref('')
const saving = ref(false)

// Initialize note text from item if editing
onMounted(() => {
  if (props.item) {
    noteText.value = props.item.content || props.item.message || ''
  }
})

// Watch for item changes (for edit mode)
watch(() => props.item, (newItem) => {
  if (newItem) {
    noteText.value = newItem.content || newItem.message || ''
  }
}, { deep: true })

// Reset form when modal closes (modal mode only)
watch(() => props.show, (isOpen) => {
  if (props.modal && !isOpen) {
    setTimeout(() => {
      noteText.value = props.item ? (props.item.content || props.item.message || '') : ''
      saving.value = false
    }, 300)
  }
})

const handleSave = async () => {
  if (!noteText.value.trim()) return
  
  saving.value = true
  
  try {
    const noteData = {
      id: props.item?.id || Date.now(),
      type: 'note',
      action: props.item ? 'updated a note' : 'added a note',
      content: noteText.value,
      message: noteText.value, // Support both content and message for compatibility
      timestamp: props.item?.timestamp || new Date().toISOString(),
      isEdit: !!props.item
    }
    
    emit('save', noteData)
    
    // In modal mode, close after save
    if (props.modal) {
      emit('close')
    }
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  if (props.modal) {
    emit('close')
  }
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

defineExpose({
  submit: handleSave,
  canSubmit: () => !!noteText.value.trim()
})
</script>
