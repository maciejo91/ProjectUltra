<template>
  <div class="w-full space-y-4">
    <!-- Source Selection -->
    <Card class="border-border">
      <CardHeader>
        <CardTitle>Select Source</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card
        v-for="type in sources"
        :key="type.value"
        @click="selectedSource = type.value"
        class="upload-source-card cursor-pointer transition-all p-1 border border-border bg-white hover:border-border"
        :class="{ 'upload-source-card-selected': selectedSource === type.value }"
      >
        <CardContent class="p-4">
          <div class="flex items-center gap-3 mb-1">
            <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border shrink-0">
              <component :is="getLucideIcon(type.icon)" :class="['w-5 h-5 shrink-0', selectedSource === type.value ? 'text-brand-primary' : 'text-muted-foreground']" />
            </div>
            <div>
              <span class="font-bold text-foreground text-sm">{{ type.label }}</span>
              <p class="text-muted-foreground text-xs">{{ type.description }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Removed Source Selection Info Card -->
      </CardContent>
    </Card>

    <!-- File Upload (shown after source selection) -->
    <div v-if="selectedSource">
      <FileUploadForm
        ref="fileUploadRef"
        v-model="selectedFile"
        @file-parsed="handleFileParsed"
      />
    </div>

    <!-- Column Mapping (shown after file is parsed) -->
    <div v-if="selectedSource && parsedData && parsedData.length > 0">
      <ColumnMappingForm
        ref="mappingFormRef"
        :entity-type="selectedSource"
        :file-columns="headers"
        :mapping="columnMapping"
        @update:mapping="columnMapping = $event"
      />
    </div>

    <!-- Action Buttons -->
    <div v-if="selectedSource && parsedData && parsedData.length > 0" class="flex items-center justify-end gap-3 pt-4 border-t border-border">
      <Button
        variant="outline"
        size="small"
        @click="handleCancel"
        :disabled="processing"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        size="small"
        @click="handleImport"
        :disabled="!canImport || processing"
      >
        <span v-if="processing">Importing...</span>
        <span v-else>Import {{ parsedData.length }} {{ selectedSource }}</span>
      </Button>
    </div>

    <!-- Progress Indicator -->
    <Card v-if="processing" class="border-border">
      <CardContent class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-foreground text-xs font-bold">Importing...</span>
          <span class="text-muted-foreground text-xs">{{ processedCount }} / {{ totalCount }}</span>
        </div>
        <Progress :value="progressPercentage" class="h-1.5" />
        <Card v-if="importErrors.length > 0" class="bg-orange-50 border-orange-200">
          <CardContent class="flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 shrink-0 text-orange-600 mt-0.5" />
            <span class="text-xs text-orange-700">
              {{ importErrors.length }} errors encountered
            </span>
          </CardContent>
        </Card>
      </CardContent>
    </Card>

    <!-- Success Message -->
    <Card v-if="importSuccess" class="bg-green-50 border-green-200">
      <CardContent class="space-y-2">
        <div class="flex items-center gap-2">
          <CheckCircle class="w-4 h-4 shrink-0 text-green-600" />
          <span class="font-bold text-foreground text-xs">Import Successful</span>
        </div>
        <p class="text-muted-foreground text-xs">
          Successfully imported {{ successCount }} {{ selectedSource }}.
          <span v-if="importErrors.length > 0" class="text-orange-700 font-semibold">
            {{ importErrors.length }} rows had errors.
          </span>
        </p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Progress, Card, CardHeader, CardTitle, CardContent } from '@motork/component-library/future/primitives'
import FileUploadForm from '@/components/addnew/FileUploadForm.vue'
import ColumnMappingForm from '@/components/addnew/ColumnMappingForm.vue'
import { useColumnMapping, getEntityFields } from '@/composables/useColumnMapping'
import { AlertTriangle, CheckCircle } from 'lucide-vue-next'
import { getLucideIcon } from '@/utils/lucideIcons'
import { useCustomersStore } from '@/stores/customers'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

const router = useRouter()
const customersStore = useCustomersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const fileUploadRef = ref(null)
const mappingFormRef = ref(null)

const selectedSource = ref('contacts')
const selectedFile = ref(null)
const parsedData = ref(null)
const headers = ref([])
const columnMapping = ref({})
const processing = ref(false)
const processedCount = ref(0)
const totalCount = ref(0)
const successCount = ref(0)
const importErrors = ref([])
const importSuccess = ref(false)

const sources = [
  {
    value: 'contacts',
    label: 'Customers',
    description: 'Import customer contacts',
    icon: 'fa-solid fa-users'
  },
  {
    value: 'leads',
    label: 'Leads',
    description: 'Import lead records',
    icon: 'fa-solid fa-user-plus'
  },
  {
    value: 'opportunities',
    label: 'Opportunities',
    description: 'Import opportunity records',
    icon: 'fa-solid fa-briefcase'
  }
]

// Create a transform function that uses the columnMapping prop
const transformRowData = (row) => {
  const transformed = {}
  const fields = getEntityFields(selectedSource.value)
  const allFields = [...fields.required, ...fields.optional]

  allFields.forEach(field => {
    const fileColumn = columnMapping.value[field]
    if (fileColumn && row[fileColumn] !== undefined) {
      const value = row[fileColumn]
      
      // Type conversions based on field type
      if (field === 'year' || field === 'price' || field === 'kilometers' || field === 'stockDays') {
        transformed[field] = value ? Number(value) : null
      } else {
        transformed[field] = value ? String(value).trim() : ''
      }
    }
  })

  return transformed
}

const transformData = (data) => {
  return data.map((row) => {
    try {
      return transformRowData(row)
    } catch (error) {
      console.error('Error transforming row:', error)
      return null
    }
  }).filter(row => row !== null)
}

// Validation
const isMappingValid = computed(() => {
  if (!selectedSource.value) return false
  const fields = getEntityFields(selectedSource.value)
  const requiredFields = fields.required || []
  
  return requiredFields.every(field => {
    const fileColumn = columnMapping.value[field]
    return fileColumn && fileColumn.trim() !== ''
  })
})

const canImport = computed(() => {
  return selectedSource.value && 
         parsedData.value && 
         parsedData.value.length > 0 &&
         isMappingValid.value
})

const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((processedCount.value / totalCount.value) * 100)
})

const handleFileParsed = (result) => {
  parsedData.value = result.data
  headers.value = result.headers
  columnMapping.value = {}
  importSuccess.value = false
  importErrors.value = []
}

const handleCancel = () => {
  selectedSource.value = 'contacts'
  selectedFile.value = null
  parsedData.value = null
  headers.value = []
  columnMapping.value = {}
  fileUploadRef.value?.clearFile()
  importSuccess.value = false
  importErrors.value = []
}

const handleImport = async () => {
  if (!canImport.value) return

  processing.value = true
  processedCount.value = 0
  successCount.value = 0
  importErrors.value = []
  importSuccess.value = false
  totalCount.value = parsedData.value.length

  try {
    // Transform data using mapping
    const transformedData = transformData(parsedData.value)

    // Process in batches
    const batchSize = 10
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize)
      
      for (const row of batch) {
        try {
          await processRow(row)
          successCount.value++
        } catch (error) {
          importErrors.value.push({
            row: i + batch.indexOf(row) + 1,
            error: error.message
          })
        }
        processedCount.value++
      }
    }

    importSuccess.value = true

    // Redirect after short delay
    setTimeout(() => {
      const tab = selectedSource.value === 'contacts' ? 'customers' :
                   selectedSource.value === 'leads' ? 'open-leads' :
                   'open-opportunities'
      router.push({
        path: '/customers',
        query: { tab }
      })
    }, 2000)
  } catch (error) {
    console.error('Import error:', error)
    importErrors.value.push({
      row: 'all',
      error: error.message
    })
  } finally {
    processing.value = false
  }
}

const processRow = async (row) => {
  // Create contact/customer first
  const contactData = {
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    company: row.company || null,
    address: row.address || '',
    initials: (row.name || '').split(' ').map(n => n[0]).join('').toUpperCase() || '??',
    source: row.source || 'Import',
    tags: []
  }

  const contact = await customersStore.addCustomer(contactData)

  if (selectedSource.value === 'contacts') {
    // Just create contact, done
    return
  }

  // Prepare vehicle data if present
  const vehicleData = {}
  if (row.brand || row.model || row.year || row.price) {
    vehicleData.brand = row.brand || ''
    vehicleData.model = row.model || ''
    vehicleData.year = row.year || null
    vehicleData.price = row.price || null
    vehicleData.requestMessage = row.requestMessage || ''
    vehicleData.requestType = row.requestType || ''
    vehicleData.source = row.source || 'Import'
    vehicleData.dealership = row.dealership || ''
    vehicleData.channel = row.channel || 'Email'
    vehicleData.fuelType = row.fuelType || ''
    vehicleData.gearType = row.gearType || ''
    vehicleData.kilometers = row.kilometers || null
    vehicleData.stockDays = row.stockDays || null
  }

  if (selectedSource.value === 'leads') {
    const leadData = {
      customer: {
        id: contact.id,
        name: contact.name,
        initials: contact.initials,
        email: contact.email,
        phone: contact.phone,
        address: contact.address || ''
      },
      status: 'Open',
      stage: 'Open',
      priority: row.priority || 'Normal',
      source: vehicleData.source || 'Import',
      assignee: null,
      assigneeInitials: '',
      isDisqualified: false,
      disqualifyReason: null,
      scheduledAppointment: null,
      contactAttempts: []
    }

    if (Object.keys(vehicleData).length > 0) {
      leadData.requestedCar = vehicleData
    }

    await leadsStore.createLead(leadData)
  } else if (selectedSource.value === 'opportunities') {
    const oppData = {
      customer: {
        id: contact.id,
        name: contact.name,
        initials: contact.initials,
        email: contact.email,
        phone: contact.phone,
        address: contact.address || ''
      },
      stage: row.stage || 'Qualified',
      priority: row.priority || 'Normal',
      source: vehicleData.source || 'Import',
      assignee: null,
      assigneeInitials: ''
    }

    if (Object.keys(vehicleData).length > 0) {
      oppData.vehicle = vehicleData
    }

    await opportunitiesStore.createOpportunity(oppData)
  }
}
</script>

<style scoped>
.upload-source-card-selected {
  border: 2px solid var(--base-primary) !important;
}
</style>
