<template>
  <form v-click-outside="() => (showResults = false)" @submit.prevent="handleSubmit" class="w-full">
    <!-- Customer Section -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent class="space-y-8">
        
        <!-- Toggle and Search (hidden if hideContactSelection is true) -->
        <div v-if="!hideContactSelection" class="space-y-8">
          <!-- Radio: Existing vs New -->
          <div class="space-y-3">
            <Label class="block text-sm font-semibold text-foreground">Customer Type</Label>
            <div class="flex gap-6">
              <Label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="contactMode"
                  value="new"
                  class="w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                />
                <span class="text-sm text-muted-foreground">New Customer</span>
              </Label>
              <Label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  v-model="contactMode"
                  value="existing"
                  class="w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                />
                <span class="text-sm text-muted-foreground">Existing Customer</span>
              </Label>
            </div>
          </div>
        
          <!-- Contact Search (if existing) -->
          <div v-if="contactMode === 'existing'" class="space-y-6">
            <div class="relative space-y-3">
              <Label class="block text-sm font-semibold text-foreground">Search Customer</Label>
              <div class="relative w-full">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 shrink-0 text-muted-foreground z-10" />
                <Input 
                  v-model="searchQuery"
                  @input="handleSearch"
                  @focus="showResults = true"
                  type="text" 
                  placeholder="Search by name, email, phone, or company..."
                  class="pl-9 w-full h-10"
                />
              </div>
              
              <!-- Autocomplete Dropdown -->
              <Card 
                v-if="showResults && filteredContacts.length > 0"
                class="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto shadow-lg"
              >
                <CardContent class="p-0">
                  <div 
                    v-for="contact in filteredContacts" 
                    :key="contact.id"
                    @click="selectContact(contact)"
                    class="flex items-center gap-2 p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                  >
                    <div class="w-8 h-8 rounded-full bg-muted text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {{ contact.initials }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-semibold text-foreground truncate">{{ contact.name }}</div>
                      <div class="text-xs text-muted-foreground truncate">{{ contact.email }}</div>
                    </div>
                    <ChevronRight class="w-3 h-3 shrink-0 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <!-- Selected Customer Display -->
            <Card v-if="selectedContact" class="bg-muted border-border">
              <CardContent class="p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center text-xs font-bold border border-border">
                      {{ selectedContact.initials }}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-foreground">{{ selectedContact.name }}</div>
                      <div class="text-xs text-muted-foreground">{{ selectedContact.email }}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    class="h-8 w-8 p-0"
                    @click="clearSelection"
                  >
                    <X class="w-4 h-4 shrink-0" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        
          <!-- Customer Form Fields (if new) -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3 w-full">
              <Label class="block text-sm font-semibold text-foreground">
                Customer Name <span class="text-brand-red">*</span>
              </Label>
              <Input 
                v-model="contactFormData.name"
                type="text" 
                placeholder="Enter customer name..."
                class="w-full h-10"
                :required="contactMode === 'new'"
                :error="errors.name"
              />
              <p v-if="errors.name" class="text-brand-red text-xs mt-1">{{ errors.name }}</p>
            </div>
            
            <div class="space-y-3 w-full">
              <Label class="block text-sm font-semibold text-foreground">Company (optional)</Label>
              <Input 
                v-model="contactFormData.company"
                type="text" 
                placeholder="Company name..."
                class="w-full h-10"
              />
            </div>
            
            <div class="space-y-3 w-full">
              <Label class="block text-sm font-semibold text-foreground">
                Email <span class="text-brand-red">*</span>
              </Label>
              <Input 
                v-model="contactFormData.email"
                type="email" 
                placeholder="customer@example.com"
                class="w-full h-10"
                :required="contactMode === 'new'"
                :error="errors.email"
              />
              <p v-if="errors.email" class="text-brand-red text-xs mt-1">{{ errors.email }}</p>
            </div>
            
            <div class="space-y-3 w-full">
              <Label class="block text-sm font-semibold text-foreground">Phone</Label>
              <Input 
                v-model="contactFormData.phone"
                type="tel" 
                placeholder="+49..."
                class="w-full h-10"
              />
            </div>
          </div>
        </div>

        <!-- Read-only Selected Customer Display (shown if selection is hidden) -->
        <Card v-else-if="selectedContact" class="bg-muted border-border">
          <CardContent class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center text-xs font-bold border border-border">
                {{ selectedContact.initials }}
              </div>
              <div>
                <div class="text-sm font-semibold text-foreground">{{ selectedContact.name }}</div>
                <div class="text-xs text-muted-foreground">{{ selectedContact.email }}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
    
    <!-- Vehicle Details Section (Optional) -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle>
          Vehicle Details 
          <span class="text-xs font-normal text-muted-foreground">(Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-8">
        <div class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3 w-full">
              <Label class="block text-sm font-semibold text-foreground">Brand</Label>
              <Input 
                v-model="vehicleFormData.brand"
                type="text" 
                placeholder="e.g., VW"
                class="w-full h-10"
              />
            </div>
            
            <div class="space-y-3 w-full">
              <Label class="block text-sm font-semibold text-foreground">Model</Label>
              <Input 
                v-model="vehicleFormData.model"
                type="text" 
                placeholder="e.g., ID.4"
                class="w-full h-10"
              />
            </div>
            
            <div class="space-y-3 w-full">
              <Label class="block text-sm font-semibold text-foreground">Year</Label>
              <Input 
                v-model="vehicleFormData.year"
                type="number" 
                :min="1900"
                :max="new Date().getFullYear() + 1"
                placeholder="2024"
                class="w-full h-10"
              />
            </div>
            
            <div class="space-y-3 w-full">
              <Label class="block text-sm font-semibold text-foreground">Price</Label>
              <Input 
                v-model="vehicleFormData.price"
                type="number" 
                :min="0"
                placeholder="45000"
                class="w-full h-10"
              />
            </div>
          </div>
        </div>
      
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Request Details -->
          <div class="space-y-3 w-full">
            <Label class="block text-sm font-semibold text-foreground">Request Type</Label>
            <Select v-model="vehicleFormData.requestType">
              <SelectTrigger class="w-full h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Quotation">Quotation</SelectItem>
                <SelectItem value="Test Drive">Test Drive</SelectItem>
                <SelectItem value="Information">Information</SelectItem>
                <SelectItem value="Purchase">Purchase</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-3 w-full">
            <Label class="block text-sm font-semibold text-foreground">Source</Label>
            <Select v-model="vehicleFormData.source">
              <SelectTrigger class="w-full h-10">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Website">Website</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Walk-in">Walk-in</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Vehicle Specs -->
          <div class="space-y-3 w-full">
            <Label class="block text-sm font-semibold text-foreground">Fuel Type</Label>
            <Select v-model="vehicleFormData.fuelType">
              <SelectTrigger class="w-full h-10">
                <SelectValue placeholder="Select fuel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div class="space-y-3 w-full">
            <Label class="block text-sm font-semibold text-foreground">Gear Type</Label>
            <Select v-model="vehicleFormData.gearType">
              <SelectTrigger class="w-full h-10">
                <SelectValue placeholder="Select gear" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Automatic">Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-3">
          <Label class="block text-sm font-semibold text-foreground">Request Message</Label>
          <Textarea 
            v-model="vehicleFormData.requestMessage"
            :rows="3"
            placeholder="Customer's message or notes..."
            class="w-full"
          />
        </div>
      </CardContent>
    </Card>
    
    <!-- Task Creation Checkboxes -->
    <Card class="bg-muted border-border mb-6">
      <CardHeader>
        <CardTitle>Create Task (Optional)</CardTitle>
      </CardHeader>
      <CardContent class="space-y-5">
        <p class="text-sm text-muted-foreground">
          Convert this customer to a lead or opportunity. 
          <span class="font-semibold text-muted-foreground">Requires vehicle details.</span>
        </p>
        
        <div v-if="!forceType" class="flex flex-col md:flex-row gap-4">
          <Card 
            class="flex-1 border-border"
            :class="hasVehicleData ? 'cursor-pointer hover:border-primary/30' : 'cursor-not-allowed opacity-60'"
          >
            <CardContent class="flex items-center gap-3">
              <Checkbox
                v-model="markAsLead"
                :disabled="!hasVehicleData"
                label=""
              />
              <div>
                <span 
                  class="text-sm font-semibold"
                  :class="hasVehicleData ? 'text-foreground' : 'text-muted-foreground'"
                >
                  Mark as Lead
                </span>
                <p class="text-xs text-muted-foreground mt-0.5">New lead task</p>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            class="flex-1 border-border"
            :class="hasVehicleData ? 'cursor-pointer hover:border-primary/30' : 'cursor-not-allowed opacity-60'"
          >
            <CardContent class="flex items-center gap-3">
              <Checkbox
                v-model="markAsOpportunity"
                :disabled="!hasVehicleData"
                label=""
              />
              <div>
                <span 
                  class="text-sm font-semibold"
                  :class="hasVehicleData ? 'text-foreground' : 'text-muted-foreground'"
                >
                  Mark as Opportunity
                </span>
                <p class="text-xs text-muted-foreground mt-0.5">New opportunity</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- If forceType is set, just show confirmation -->
        <Card v-else class="bg-white border-border">
          <CardContent class="flex items-center gap-3">
            <Info class="w-4 h-4 shrink-0 text-primary" />
            <div>
              <p class="text-sm font-semibold text-foreground">
                Converting to {{ forceType === 'lead' ? 'Lead' : 'Opportunity' }}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card v-if="!hasVehicleData && !forceType" class="bg-orange-50 border-orange-200">
          <CardContent class="flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 shrink-0 text-orange-600 mt-0.5" />
            <span class="text-xs text-orange-700">Fill in vehicle details to enable lead/opportunity creation</span>
          </CardContent>
        </Card>
      </CardContent>
    </Card>

    <div class="flex justify-end pt-4">
      <Button
        type="submit"
        variant="default"
        :disabled="!canSubmit || isSubmitting"
        class="rounded-sm w-full sm:w-auto"
      >
        {{ isSubmitting ? 'Saving...' : 'Save' }}
      </Button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { Search, ChevronRight, X, Info, AlertTriangle } from 'lucide-vue-next'
import { Button, Checkbox, Input, Toggle, Card, CardHeader, CardTitle, CardContent, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label } from '@motork/component-library/future/primitives'
import { useCustomersStore } from '@/stores/customers'
import { useAddFormValidation } from '@/composables/useAddFormValidation'
import { useAddFormSubmission } from '@/composables/useAddFormSubmission'

const props = defineProps({
  initialContact: {
    type: Object,
    default: null
  },
  hideContactSelection: {
    type: Boolean,
    default: false
  },
  forceType: {
    type: String, // 'lead' | 'opportunity'
    default: ''
  }
})

const emit = defineEmits(['submit'])

const customersStore = useCustomersStore()

// Contact Mode
const contactMode = ref(props.initialContact ? 'existing' : 'new') // 'existing' or 'new'

// Contact Search (for existing)
const searchQuery = ref('')
const showResults = ref(false)
const selectedContact = ref(props.initialContact || null)

// Contact Form Data (for new)
const contactFormData = reactive({
  name: '',
  email: '',
  phone: '',
  company: ''
})

// Vehicle Form Data
const vehicleFormData = reactive({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  price: null,
  requestMessage: '',
  requestType: '',
  source: '',
  dealership: '',
  channel: 'Email',
  fuelType: '',
  gearType: '',
  kilometers: null,
  stockDays: null
})

// Task Marking
const markAsLead = ref(props.forceType === 'lead')
const markAsOpportunity = ref(props.forceType === 'opportunity')

// Update marking when forceType changes
watch(() => props.forceType, (newType) => {
  if (newType === 'lead') {
    markAsLead.value = true
    markAsOpportunity.value = false
  } else if (newType === 'opportunity') {
    markAsLead.value = false
    markAsOpportunity.value = true
  }
})

// Set initial contact if provided
watch(() => props.initialContact, (newContact) => {
  if (newContact) {
    selectedContact.value = newContact
    searchQuery.value = newContact.name
    contactMode.value = 'existing'
  }
}, { immediate: true })

let searchTimeout = null

// Use validation composable
const { errors, canSubmit, validateContactForm, clearErrors } = useAddFormValidation({
  contactMode,
  selectedContact,
  contactFormData
})

onMounted(() => {
  if (customersStore.customers.length === 0) {
    customersStore.fetchCustomers()
  }
})

// Computed
const filteredContacts = computed(() => {
  if (!searchQuery.value.trim()) {
    return customersStore.customers.slice(0, 10)
  }
  
  const query = searchQuery.value.toLowerCase()
  return customersStore.customers.filter(contact => 
    contact.name.toLowerCase().includes(query) ||
    contact.email.toLowerCase().includes(query) ||
    (contact.phone && contact.phone.toLowerCase().includes(query)) ||
    (contact.company && contact.company.toLowerCase().includes(query))
  ).slice(0, 10)
})

const hasVehicleData = computed(() => {
  return !!(
    vehicleFormData.brand ||
    vehicleFormData.model ||
    vehicleFormData.year !== new Date().getFullYear() ||
    vehicleFormData.price ||
    vehicleFormData.requestMessage ||
    vehicleFormData.requestType ||
    vehicleFormData.source ||
    vehicleFormData.dealership ||
    vehicleFormData.fuelType ||
    vehicleFormData.gearType ||
    vehicleFormData.kilometers ||
    vehicleFormData.stockDays
  )
})

// Use submission composable
const { isSubmitting, handleSubmit: submitHandler, resetSubmitting } = useAddFormSubmission({
  contactMode,
  selectedContact,
  contactFormData,
  vehicleFormData,
  markAsLead,
  markAsOpportunity,
  validateContactForm,
  onSubmit: (submissionData) => {
    emit('submit', submissionData)
  }
})

// Methods
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    showResults.value = true
  }, 300)
}

const selectContact = (contact) => {
  selectedContact.value = contact
  searchQuery.value = contact.name
  showResults.value = false
}

const clearSelection = () => {
  selectedContact.value = null
  searchQuery.value = ''
  showResults.value = false
}

const handleClear = () => {
  // Reset contact mode to new
  contactMode.value = 'new'
  
  // Clear contact search
  selectedContact.value = null
  searchQuery.value = ''
  showResults.value = false
  
  // Clear contact form
  contactFormData.name = ''
  contactFormData.email = ''
  contactFormData.phone = ''
  contactFormData.company = ''
  
  // Clear vehicle form
  Object.keys(vehicleFormData).forEach(key => {
    if (key === 'year') {
      vehicleFormData[key] = new Date().getFullYear()
    } else if (key === 'channel') {
      vehicleFormData[key] = 'Email'
    } else if (typeof vehicleFormData[key] === 'number') {
      vehicleFormData[key] = null
    } else {
      vehicleFormData[key] = ''
    }
  })
  
  // Clear task marking
  markAsLead.value = false
  markAsOpportunity.value = false
  
  // Clear errors
  clearErrors()
}

defineExpose({
  resetSubmitting,
  submit: submitHandler,
  clear: handleClear,
  canSubmit,
  isSubmitting
})
</script>
