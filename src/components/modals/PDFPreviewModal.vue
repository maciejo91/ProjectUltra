<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-6xl max-h-[calc(100vh-4rem)] flex flex-col p-0">
        <DialogHeader class="flex-shrink-0 p-6 pb-4 border-b border">
          <DialogTitle>PDF Preview</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-hidden flex flex-col">
          <!-- PDF Viewer -->
          <div class="flex-1 overflow-auto bg-muted p-4">
            <div v-if="loading" class="flex items-center justify-center h-full">
              <div class="text-center">
                <Loader2 class="w-10 h-10 shrink-0 text-muted-foreground mb-4 animate-spin" />
                <p class="text-sm text-muted-foreground">Loading PDF preview...</p>
              </div>
            </div>
            
            <div v-else-if="error" class="flex items-center justify-center h-full">
              <div class="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle class="w-10 h-10 shrink-0 text-red-600 mb-4" />
                <p class="text-sm text-red-600 font-semibold mb-2">Failed to load PDF</p>
                <p class="text-sm text-red-500">{{ error }}</p>
              </div>
            </div>
            
            <div v-else-if="pdfUrl" class="bg-white rounded-lg shadow-lg overflow-hidden">
              <iframe
                :src="pdfUrl"
                class="w-full h-full min-h-[600px] border-0"
                title="PDF Preview"
              ></iframe>
            </div>
            
            <div v-else class="flex items-center justify-center h-full">
              <p class="text-sm text-muted-foreground">No PDF to preview</p>
            </div>
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 p-6 pt-4 bg-muted flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 border-t border">
          <Button
            label="Regenerate"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            :disabled="loading"
            @click="handleRegenerate"
          />
          <Button
            label="Print"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!pdfUrl || loading"
            @click="handlePrint"
          >
            <Printer class="w-4 h-4 shrink-0 mr-2" />
          </Button>
          <Button
            label="Email"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!pdfUrl || loading"
            @click="handleEmail"
          >
            <Mail class="w-4 h-4 shrink-0 mr-2" />
          </Button>
          <Button
            label="Download"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
            :disabled="!pdfUrl || loading"
            @click="handleDownload"
          >
            <Download class="w-4 h-4 shrink-0 mr-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Loader2, AlertTriangle, Printer, Mail, Download } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { useContractPDF } from '@/composables/useContractPDF'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  pdfUrl: {
    type: String,
    default: null
  },
  pdfId: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'regenerate', 'download', 'email', 'print'])

const { downloadPDF } = useContractPDF()

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

const handleRegenerate = () => {
  emit('regenerate')
}

const handleDownload = async () => {
  if (props.pdfId) {
    try {
      await downloadPDF(props.pdfId)
      emit('download', props.pdfId)
    } catch (err) {
      console.error('Error downloading PDF:', err)
    }
  } else if (props.pdfUrl) {
    // Fallback: download from URL
    const link = document.createElement('a')
    link.href = props.pdfUrl
    link.download = 'contract.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    emit('download', props.pdfUrl)
  }
}

const handleEmail = () => {
  emit('email', {
    pdfId: props.pdfId,
    pdfUrl: props.pdfUrl
  })
}

const handlePrint = () => {
  if (props.pdfUrl) {
    const printWindow = window.open(props.pdfUrl, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
    emit('print', props.pdfUrl)
  }
}

// Cleanup on unmount
onUnmounted(() => {
  // Cleanup is handled by store
})
</script>
