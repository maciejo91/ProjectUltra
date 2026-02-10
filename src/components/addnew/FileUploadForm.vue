<template>
  <div class="space-y-4">
    <!-- File Input -->
    <div class="space-y-2">
      <Label class="block text-sm font-semibold text-foreground">
        Select File <span class="text-brand-red">*</span>
      </Label>
      <div class="relative w-full">
        <input
          ref="fileInputRef"
          type="file"
          accept=".csv,.xls,.xlsx"
          @change="handleFileChange"
          class="hidden"
          :disabled="loading"
        />
        <Card
          @click="fileInputRef?.click()"
          class="upload-drop-zone cursor-pointer transition-all w-full"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
        >
          <CardContent class="flex flex-col items-center text-center py-8">
            <Upload class="w-5 h-5 shrink-0 text-muted-foreground mb-3" />
            <p class="text-foreground text-sm font-bold mb-1">
              {{ selectedFile ? selectedFile.name : 'Click to upload or drag and drop' }}
            </p>
            <p class="text-muted-foreground text-xs">CSV or Excel (.csv, .xls, .xlsx) up to 10MB</p>
          </CardContent>
        </Card>
      </div>
      <Card v-if="error" class="bg-red-50 border-red-200 mt-2">
        <CardContent class="flex items-start gap-2 p-3">
          <AlertTriangle class="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span class="text-xs text-red-700">{{ error }}</span>
        </CardContent>
      </Card>
    </div>

    <!-- File Preview -->
    <Card v-if="selectedFile && parsedData && parsedData.length > 0" class="border-border">
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>File Preview</CardTitle>
          <Badge :text="`${parsedData.length} rows`" theme="gray" size="small" />
        </div>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-border">
                <th
                  v-for="header in headers"
                  :key="header"
                  class="text-left p-2 font-bold text-muted-foreground uppercase tracking-wider"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in previewRows"
                :key="index"
                class="border-b border-border hover:bg-muted transition-colors"
              >
                <td
                  v-for="header in headers"
                  :key="header"
                  class="p-2 text-muted-foreground"
                >
                  {{ row[header] || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p v-if="parsedData.length > previewLimit" class="text-muted-foreground text-xs mt-3 text-center">
          Showing first {{ previewLimit }} of {{ parsedData.length }} rows
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { Upload, AlertTriangle } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { Badge, Card, CardHeader, CardTitle, CardContent, Label } from '@motork/component-library/future/primitives'
import { useFileUpload } from '@/composables/useFileUpload'

const props = defineProps({
  modelValue: {
    type: File,
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'file-parsed'])

const fileInputRef = ref(null)
const previewLimit = 5

const {
  selectedFile,
  parsedData,
  headers,
  loading,
  error,
  handleFileSelect,
  clearFile,
  getPreview
} = useFileUpload()

const previewRows = computed(() => {
  return getPreview(previewLimit)
})

const handleFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const result = await handleFileSelect(file)
    emit('update:modelValue', file)
    emit('file-parsed', result)
  } catch (err) {
    // Error is handled by useFileUpload composable
    emit('update:modelValue', null)
  }
}

defineExpose({
  clearFile,
  selectedFile,
  parsedData,
  headers
})
</script>

<style scoped>
.upload-drop-zone {
  border: 1px dashed rgba(0, 0, 0, 0.2);
}
.upload-drop-zone:hover:not(.opacity-50) {
  border-color: rgba(4, 112, 233, 0.4);
}
</style>
