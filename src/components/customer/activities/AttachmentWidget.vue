<template>
  <!-- Modal Mode -->
  <Dialog v-if="modal" :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-lg max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>{{ item ? 'Edit Attachment' : 'Add Attachment' }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-6">
          <!-- File Selection -->
          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">
              File <span class="text-brand-red">*</span>
            </Label>
            <div class="flex items-center gap-3">
              <input 
                type="file" 
                @change="handleFileSelect"
                ref="fileInput"
                class="hidden"
              />
              <Button
                label="Choose File"
                variant="outline"
                size="small"
                class="rounded-sm"
                @click="fileInput?.click()"
              />
              <span v-if="selectedFileName" class="text-sm text-muted-foreground truncate">{{ selectedFileName }}</span>
              <span v-else class="text-sm text-muted-foreground">No file selected</span>
            </div>
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
            :label="saving ? 'Saving...' : (item ? 'Update Attachment' : 'Save Attachment')"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
            :disabled="!selectedFile || saving"
            @click="handleSave"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>

  <!-- Inline Mode -->
  <div
    v-else
    class="bg-white border border-border rounded-lg p-6 shadow-nsc-card animate-fade-in relative"
  >
    <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-border rotate-45"></div>
    <div class="flex justify-between items-center mb-4">
      <h5 class="text-sm font-semibold text-foreground">{{ item ? 'Edit Attachment' : 'Add Attachment' }}</h5>
      <button @click="handleCancel" class="text-muted-foreground hover:text-muted-foreground"><X class="w-4 h-4 shrink-0" /></button>
    </div>
    <div class="w-full">
      <label class="block text-xs font-medium text-muted-foreground mb-1">File</label>
      <div class="flex flex-wrap items-center gap-3 w-full">
        <input
          type="file"
          @change="handleFileSelect"
          ref="fileInput"
          class="hidden"
        />
        <Button variant="outline" @click="triggerFileInput">
          Choose File
        </Button>
        <span v-if="selectedFileName" class="text-sm text-muted-foreground truncate">{{ selectedFileName }}</span>
        <span v-else class="text-sm text-muted-foreground">No file selected</span>
      </div>
    </div>
    <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
      <Button variant="secondary" @click="handleCancel">
        Cancel
      </Button>
      <Button
        variant="primary"
        :disabled="!selectedFile || saving"
        @click="handleSave"
      >
        {{ saving ? 'Saving...' : 'Save' }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { 
  Button,
  Label
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
  
  // Attachment data props
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
  }
})

const emit = defineEmits(['save', 'cancel', 'close'])

const selectedFile = ref(null)
const selectedFileName = ref('')
const saving = ref(false)
const fileInput = ref(null)

// Initialize file name from item if editing
onMounted(() => {
  if (props.item) {
    selectedFileName.value = props.item.fileName || ''
  }
})

// Watch for item changes (for edit mode)
watch(() => props.item, (newItem) => {
  if (newItem) {
    selectedFileName.value = newItem.fileName || ''
  }
}, { deep: true })

// Reset form when modal closes (modal mode only)
watch(() => props.show, (isOpen) => {
  if (props.modal && !isOpen) {
    setTimeout(() => {
      selectedFile.value = null
      selectedFileName.value = props.item ? (props.item.fileName || '') : ''
      saving.value = false
    }, 300)
  }
})

function triggerFileInput() {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    selectedFileName.value = file.name
  }
}

const handleSave = async () => {
  if (!selectedFile.value && !props.item) return
  
  saving.value = true
  
  try {
    const attachmentData = {
      id: props.item?.id || Date.now(),
      type: 'attachment',
      action: props.item ? 'updated an attachment' : 'added an attachment',
      fileName: selectedFileName.value,
      file: selectedFile.value, // Include file object for upload
      timestamp: props.item?.timestamp || new Date().toISOString(),
      isEdit: !!props.item
    }
    
    emit('save', attachmentData)
    
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
  canSubmit: () => !!selectedFile.value || !!props.item
})
</script>
