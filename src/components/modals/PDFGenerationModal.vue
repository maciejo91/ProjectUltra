<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col p-0">
        <DialogHeader class="flex-shrink-0 p-6 pb-4 border-b border">
          <DialogTitle>{{ documentType === 'contract' ? 'Generate Contract PDF' : 'Send Offer PDF' }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto p-6 w-full space-y-6">
          <!-- Offer-specific UI: Customer Details, Email, Offer Details, Message -->
          <template v-if="documentType === 'offer'">
            <!-- Customer Details (Uneditable) -->
            <div v-if="customer" class="bg-muted rounded-lg p-4 border border-border">
              <Label class="text-sm font-semibold text-foreground mb-3 block">Customer Details</Label>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-muted-foreground font-medium w-24">Name:</span>
                  <span class="text-foreground">{{ customer.name || 'N/A' }}</span>
                </div>
                <div v-if="customer.phone" class="flex items-center gap-2">
                  <span class="text-muted-foreground font-medium w-24">Phone:</span>
                  <span class="text-foreground">{{ customer.phone }}</span>
                </div>
                <div v-if="customer.address" class="flex items-center gap-2">
                  <span class="text-muted-foreground font-medium w-24">Address:</span>
                  <span class="text-foreground">{{ customer.address }}</span>
                </div>
              </div>
            </div>

            <!-- Email Address (Editable) -->
            <div>
              <Label class="text-sm font-semibold text-foreground mb-2 block">Email Address <span class="text-red-600">*</span></Label>
              <Input
                v-model="emailAddress"
                type="email"
                placeholder="customer@example.com"
                class="w-full"
              />
            </div>

            <!-- Offer Details (Uneditable) -->
            <div v-if="selectedOffer" class="bg-muted rounded-lg p-4 border border-border">
              <Label class="text-sm font-semibold text-foreground mb-3 block">Offer Details</Label>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <span class="text-muted-foreground font-medium w-24">Vehicle:</span>
                  <span class="text-foreground">{{ getOfferVehicleName(selectedOffer) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-muted-foreground font-medium w-24">Price:</span>
                  <span class="text-foreground font-semibold">€ {{ formatCurrency(getOfferPrice(selectedOffer)) }}</span>
                </div>
                <div v-if="selectedOffer.createdAt" class="flex items-center gap-2">
                  <span class="text-muted-foreground font-medium w-24">Created:</span>
                  <span class="text-foreground">{{ formatDate(selectedOffer.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div>
              <Label class="text-sm font-semibold text-foreground mb-2 block">Message (Optional)</Label>
              <Textarea
                v-model="emailMessage"
                rows="4"
                placeholder="Add a personal message to accompany the offer..."
                class="w-full"
              />
            </div>

            <!-- Terms & Conditions Checkbox -->
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                :id="'terms-offer-' + _uid"
                v-model="options.includeTermsAndConditions"
                class="mt-1"
              />
              <label :for="'terms-offer-' + _uid" class="text-sm text-foreground cursor-pointer">
                Include Terms & Conditions
              </label>
            </div>
          </template>

          <!-- Contract-specific UI (existing) -->
          <template v-else>
          <!-- Document Type Selection (if not pre-selected) -->
          <div v-if="!preSelectedDocumentType">
            <Label class="text-sm font-semibold text-foreground mb-3 block">Document Type</Label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                :class="[
                  'p-4 border-2 rounded-lg text-left transition-all',
                  documentType === 'contract'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                ]"
                @click="documentType = 'contract'"
              >
                <div class="font-semibold text-sm text-foreground mb-1">Contract</div>
                <div class="text-sm text-muted-foreground">Formal contract with signature area</div>
              </button>
              <button
                type="button"
                :class="[
                  'p-4 border-2 rounded-lg text-left transition-all',
                  documentType === 'offer'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                ]"
                @click="documentType = 'offer'"
              >
                <div class="font-semibold text-sm text-foreground mb-1">Offer</div>
                <div class="text-sm text-muted-foreground">Purchase proposal for customer</div>
              </button>
            </div>
          </div>

            <!-- Offer Selection (if document type is offer and multiple offers) -->
            <div v-if="documentType === 'offer' && availableOffers && availableOffers.length > 1">
              <Label class="text-sm font-semibold text-foreground mb-3 block">Select Offer</Label>
              <Select v-model="selectedOfferId">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select an offer..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="offer in availableOffers"
                    :key="offer.id"
                    :value="offer.id"
                  >
                    {{ getOfferLabel(offer) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

          <!-- Language Selection -->
          <div>
            <Label class="text-sm font-semibold text-foreground mb-3 block">Language</Label>
            <Select v-model="options.language">
              <SelectTrigger class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="nl">Nederlands</SelectItem>
              </SelectContent>
            </Select>
          </div>

            <!-- Template Selection (for contract) -->
            <div>
              <Label class="text-sm font-semibold text-foreground mb-3 block">Template Style</Label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  :class="[
                    'p-4 border-2 rounded-lg text-left transition-all',
                    options.template === 'classic'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  ]"
                  @click="options.template = 'classic'"
                >
                  <div class="font-semibold text-sm text-foreground mb-1">Classic</div>
                  <div class="text-sm text-muted-foreground">
                    Detailed with comprehensive information and legal sections
                  </div>
                </button>
                <button
                  type="button"
                  :class="[
                    'p-4 border-2 rounded-lg text-left transition-all',
                    options.template === 'express'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  ]"
                  @click="options.template = 'express'"
                >
                  <div class="font-semibold text-sm text-foreground mb-1">Express</div>
                  <div class="text-sm text-muted-foreground">
                    Streamlined with essential information
                  </div>
                </button>
              </div>
            </div>

            <!-- Customization Options (for contract) -->
            <div class="space-y-4">
              <Label class="text-sm font-semibold text-foreground block">Options</Label>
              
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  :id="'terms-' + _uid"
                  v-model="options.includeTermsAndConditions"
                  class="mt-1"
                />
                <label :for="'terms-' + _uid" class="text-sm text-foreground cursor-pointer">
                  Include Terms & Conditions
                </label>
              </div>

              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  :id="'disclaimer-' + _uid"
                  v-model="options.includeDisclaimerPage"
                  class="mt-1"
                />
                <label :for="'disclaimer-' + _uid" class="text-sm text-foreground cursor-pointer">
                  Include Disclaimer Page (last page)
                </label>
              </div>
            </div>
          </template>

          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 p-6 pt-4 bg-muted flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 border-t border">
          <Button
            label="Cancel"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            :disabled="isGenerating || isPreviewing || isSending"
            @click="$emit('close')"
          />
          <template v-if="documentType === 'offer'">
            <Button
              label="Send Offer PDF"
              variant="primary"
              size="small"
              class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
              :disabled="!isValidForSend || isGenerating || isPreviewing || isSending"
              @click="handleSend"
            >
              <template v-if="isSending">
                <Loader2 class="w-4 h-4 shrink-0 mr-2 animate-spin" />
                Sending...
              </template>
              <template v-else>
                <Send class="w-4 h-4 shrink-0 mr-2" />
                Send
              </template>
            </Button>
          </template>
          <template v-else>
            <Button
              label="Preview"
              variant="outline"
              size="small"
              class="rounded-sm w-full sm:w-auto"
              :disabled="!isValid || isGenerating || isPreviewing"
              @click="handlePreview"
            />
            <Button
              label="Generate PDF"
              variant="primary"
              size="small"
              class="rounded-sm w-full sm:w-auto !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
              :disabled="!isValid || isGenerating || isPreviewing"
              @click="handleGenerate"
            >
              <template v-if="isGenerating">
                <Loader2 class="w-4 h-4 shrink-0 mr-2 animate-spin" />
                Generating...
              </template>
            </Button>
          </template>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Loader2, Send } from 'lucide-vue-next'
import { Button, Label, Input, Textarea } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@motork/component-library/future/primitives'
import { useContractPDF } from '@/composables/useContractPDF'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  opportunityId: {
    type: [String, Number],
    required: true
  },
  documentType: {
    type: String,
    default: null, // 'contract' | 'offer' | null (user selects)
    validator: (value) => !value || ['contract', 'offer'].includes(value)
  },
  offerId: {
    type: [String, Number],
    default: null
  },
  availableOffers: {
    type: Array,
    default: () => []
  },
  customer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'generate', 'preview', 'send'])

const {
  isGenerating,
  isPreviewing,
  error: pdfError,
  getDefaultOptions,
  ensureTemplatesLoaded
} = useContractPDF()

const preSelectedDocumentType = computed(() => props.documentType !== null)
const documentType = ref(props.documentType || 'contract')
const selectedOfferId = ref(props.offerId)
const emailAddress = ref(props.customer?.email || '')
const emailMessage = ref('')
const isSending = ref(false)
const options = ref({
  template: 'classic',
  language: 'en',
  includeTermsAndConditions: true,
  includeDisclaimerPage: true
})

// Get selected offer details
const selectedOffer = computed(() => {
  if (documentType.value !== 'offer' || !selectedOfferId.value) return null
  return props.availableOffers?.find(o => o.id === selectedOfferId.value) || null
})

// Initialize email from customer
watch(() => props.customer, (customer) => {
  if (customer?.email && documentType.value === 'offer') {
    emailAddress.value = customer.email
  }
}, { immediate: true })

const error = computed(() => pdfError.value)

// Initialize with defaults
onMounted(async () => {
  await ensureTemplatesLoaded()
  const defaults = getDefaultOptions()
  options.value = {
    ...defaults,
    ...options.value
  }
})

// Watch for document type changes
watch(() => props.documentType, (newType) => {
  if (newType) {
    documentType.value = newType
  }
})

// Watch for offer ID changes
watch(() => props.offerId, (newId) => {
  if (newId) {
    selectedOfferId.value = newId
  }
}, { immediate: true })

// Auto-select offer if only one available
watch(() => [props.availableOffers, documentType.value], ([offers, docType]) => {
  if (docType === 'offer' && offers && offers.length === 1 && !selectedOfferId.value) {
    selectedOfferId.value = offers[0].id
  }
}, { immediate: true })

const isValid = computed(() => {
  if (documentType.value === 'offer') {
    return selectedOfferId.value !== null && selectedOfferId.value !== undefined
  }
  return true
})

const isValidForSend = computed(() => {
  if (documentType.value !== 'offer') return false
  return isValid.value && emailAddress.value && emailAddress.value.includes('@')
})

const getOfferVehicleName = (offer) => {
  if (offer.data) {
    const data = offer.data
    return `${data.brand || ''} ${data.model || ''} (${data.year || ''})`
  }
  if (offer.vehicleBrand) {
    return `${offer.vehicleBrand} ${offer.vehicleModel} (${offer.vehicleYear})`
  }
  return 'Vehicle'
}

const getOfferPrice = (offer) => {
  return offer.price || offer.data?.price || 0
}

const formatCurrency = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getOfferLabel = (offer) => {
  if (offer.data) {
    const data = offer.data
    return `${data.brand || ''} ${data.model || ''} (${data.year || ''}) - €${(data.price || 0).toLocaleString()}`
  }
  if (offer.vehicleBrand) {
    return `${offer.vehicleBrand} ${offer.vehicleModel} (${offer.vehicleYear}) - €${(offer.price || 0).toLocaleString()}`
  }
  return `Offer #${offer.id}`
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

const handleGenerate = async () => {
  if (!isValid.value) return

  try {
    const finalOptions = {
      ...options.value,
      includeDisclaimerPage: documentType.value === 'contract' ? options.value.includeDisclaimerPage : false
    }

    if (documentType.value === 'contract') {
      emit('generate', {
        type: 'contract',
        opportunityId: props.opportunityId,
        options: finalOptions
      })
    } else {
      if (!selectedOfferId.value) {
        error.value = 'Please select an offer'
        return
      }
      emit('generate', {
        type: 'offer',
        opportunityId: props.opportunityId,
        offerId: selectedOfferId.value,
        options: finalOptions
      })
    }
  } catch (err) {
    console.error('Error generating PDF:', err)
  }
}

const handlePreview = async () => {
  if (!isValid.value) return

  try {
    const finalOptions = {
      ...options.value,
      includeDisclaimerPage: documentType.value === 'contract' ? options.value.includeDisclaimerPage : false
    }

    if (documentType.value === 'contract') {
      emit('preview', {
        type: 'contract',
        opportunityId: props.opportunityId,
        options: finalOptions
      })
    } else {
      if (!selectedOfferId.value) {
        error.value = 'Please select an offer'
        return
      }
      emit('preview', {
        type: 'offer',
        opportunityId: props.opportunityId,
        offerId: selectedOfferId.value,
        options: finalOptions
      })
    }
  } catch (err) {
    console.error('Error previewing PDF:', err)
  }
}

const handleSend = async () => {
  if (!isValidForSend.value) return

  isSending.value = true
  try {
    const finalOptions = {
      ...options.value,
      includeDisclaimerPage: false
    }

    if (!selectedOfferId.value) {
      error.value = 'Please select an offer'
      return
    }

    emit('send', {
      type: 'offer',
      opportunityId: props.opportunityId,
      offerId: selectedOfferId.value,
      email: emailAddress.value,
      message: emailMessage.value,
      options: finalOptions
    })
  } catch (err) {
    console.error('Error sending PDF:', err)
    error.value = err.message || 'Failed to send PDF'
  } finally {
    isSending.value = false
  }
}
</script>
