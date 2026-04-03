<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Financing</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-6">
          <!-- Type selection -->
          <div>
            <div class="outcome-toggle-group grid grid-cols-3 gap-3">
              <Toggle
                variant="outline"
                :model-value="formData.type === 'FIN'"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
                @update:model-value="(p) => selectType(p ? 'FIN' : '')"
              >
                <span>Financing</span>
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="formData.type === 'LEA'"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
                @update:model-value="(p) => selectType(p ? 'LEA' : '')"
              >
                <span>Leasing</span>
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="formData.type === 'LTR'"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
                @update:model-value="(p) => selectType(p ? 'LTR' : '')"
              >
                <span>Long-Term Rental</span>
              </Toggle>
            </div>
          </div>

          <!-- Dynamic Form Based on Type -->
          <div v-if="formData.type" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Monthly Instalment <span class="text-muted-foreground">*</span></Label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  <Input
                    v-model.number="formData.fields.monthlyInstalment"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-full pl-8"
                    :class="{ 'border-destructive': errors.monthlyInstalment }"
                    @input="clearError('monthlyInstalment')"
                    @blur="validateField('monthlyInstalment')"
                  />
                </div>
                <p v-if="errors.monthlyInstalment" class="text-sm text-destructive">{{ errors.monthlyInstalment }}</p>
              </div>

              <div class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Down Payment <span class="text-muted-foreground">*</span></Label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  <Input
                    v-model.number="formData.fields.downPayment"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    class="w-full pl-8"
                    :class="{ 'border-destructive': errors.downPayment }"
                    @input="clearError('downPayment')"
                    @blur="validateField('downPayment')"
                  />
                </div>
                <p v-if="errors.downPayment" class="text-sm text-destructive">{{ errors.downPayment }}</p>
              </div>
            </div>

            <template v-if="formData.type === 'LTR'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Duration (months) <span class="text-muted-foreground">*</span></Label>
                  <Select
                    v-model="formData.fields.duration"
                    @update:model-value="clearError('duration')"
                  >
                    <SelectTrigger class="w-full" :class="{ 'border-destructive': errors.duration }">
                      <SelectValue placeholder="Select duration..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="month in getDurationOptions(formData.type)"
                        :key="month"
                        :value="month"
                      >
                        {{ month }} months
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.duration" class="text-sm text-destructive">{{ errors.duration }}</p>
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Unlock Kilometers</Label>
                  <Input
                    v-model.number="formData.fields.mileageLimit"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full"
                    :class="{ 'border-destructive': errors.mileageLimit }"
                    @input="clearError('mileageLimit')"
                  />
                  <p v-if="errors.mileageLimit" class="text-sm text-destructive">{{ errors.mileageLimit }}</p>
                </div>
              </div>

              <div class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Customer Type <span class="text-muted-foreground">*</span></Label>
                <Select
                  v-model="formData.fields.customerType"
                  @update:model-value="clearError('customerType')"
                >
                  <SelectTrigger class="w-full" :class="{ 'border-destructive': errors.customerType }">
                    <SelectValue placeholder="Select customer type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Fleet">Fleet</SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="errors.customerType" class="text-sm text-destructive">{{ errors.customerType }}</p>
              </div>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Offer Valid From</Label>
                <Input v-model="formData.offerValidFrom" type="date" class="w-full" />
              </div>
              <div class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Offer Valid To</Label>
                <Input v-model="formData.offerValidTo" type="date" class="w-full" />
              </div>
            </div>

            <template v-if="formData.type === 'LTR'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                <div class="flex items-center gap-2">
                  <Checkbox id="ltr-insurance" v-model:checked="formData.fields.insuranceIncluded" />
                  <Label for="ltr-insurance" class="text-sm text-muted-foreground cursor-pointer">Insurance Included</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox id="ltr-maintenance" v-model:checked="formData.fields.maintenanceIncluded" />
                  <Label for="ltr-maintenance" class="text-sm text-muted-foreground cursor-pointer">Maintenance Included</Label>
                </div>
                <div class="flex items-center gap-2">
                  <Checkbox id="ltr-registration" v-model:checked="formData.fields.registrationTaxesIncluded" />
                  <Label for="ltr-registration" class="text-sm text-muted-foreground cursor-pointer">Registration/Taxes Included</Label>
                </div>
              </div>
              <div class="bg-muted p-4 rounded-lg border border-border mt-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-muted-foreground">Total Rental Amount:</span>
                  <span class="text-lg font-bold text-foreground">€ {{ formatCurrency(totalRentalAmount) }}</span>
                </div>
              </div>
            </template>
          </div>

          <div v-if="validationErrors.length > 0" class="bg-destructive/10 border border-border rounded-lg p-4">
            <h4 class="text-sm font-medium text-destructive mb-2">Please fix the following errors:</h4>
            <ul class="list-disc list-inside text-sm text-foreground space-y-1">
              <li v-for="error in validationErrors" :key="error">{{ error }}</li>
            </ul>
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
          <div class="flex gap-3 order-2 sm:order-1">
            <Button
              v-if="isEditMode"
              variant="destructive"
              class="rounded-sm w-full sm:w-auto"
              :disabled="saving"
              @click="$emit('delete')"
            >
              Delete
            </Button>
          </div>
          <div class="flex flex-col-reverse sm:flex-row gap-3 flex-1 sm:justify-end order-1 sm:order-2">
            <Button
              variant="outline"
              class="rounded-sm w-full sm:w-auto"
              @click="$emit('close')"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              class="rounded-sm w-full sm:w-auto"
              :disabled="!isFormValid || saving"
              @click="handleSubmit"
            >
              {{ saving ? 'Saving...' : (isEditMode ? 'Update' : 'Save') }}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  Button,
  Input,
  Label,
  Checkbox,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Toggle
} from '@motork/component-library/future/primitives'
import { usePurchaseMethodsStore } from '@/stores/purchaseMethods'
import { purchaseMethodService } from '@/services/purchaseMethodService'
import { formatCurrency } from '@/utils/formatters'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  taskType: {
    type: String,
    default: 'lead',
    validator: (value) => ['lead', 'opportunity'].includes(value)
  },
  taskId: {
    type: [String, Number],
    required: true
  },
  purchaseMethod: {
    type: Object,
    default: null
  },
  vehicleId: {
    type: [String, Number],
    default: null
  },
  offerId: {
    type: [String, Number],
    default: null
  },
  vehiclePrice: {
    type: Number,
    default: null
  },
  standalone: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save', 'delete', 'save-start', 'save-end'])

const purchaseMethodsStore = usePurchaseMethodsStore()
const userStore = useUserStore()

const saving = ref(false)
const errors = ref({})
const validationErrors = ref([])

const formData = ref({
  type: '',
  fields: {
    monthlyInstalment: null,
    downPayment: null,
    duration: null,
    interestRate: null,
    effectiveInterestRate: null,
    gfv: null,
    mileageLimit: null,
    finalInstalment: null,
    customerType: '',
    insuranceIncluded: false,
    maintenanceIncluded: false,
    registrationTaxesIncluded: false
  },
  currency: 'EUR',
  offerValidFrom: null,
  offerValidTo: null
})

const isEditMode = computed(() => !!props.purchaseMethod)

// Computed calculated fields
const totalLeasingAmount = computed(() => {
  if (formData.value.type !== 'LEA') return 0
  const monthly = parseFloat(formData.value.fields.monthlyInstalment) || 0
  const duration = parseInt(formData.value.fields.duration) || 0
  const downPayment = parseFloat(formData.value.fields.downPayment) || 0
  const finalInstalment = parseFloat(formData.value.fields.finalInstalment) || 0
  return (monthly * duration) + downPayment + finalInstalment
})

const totalRentalAmount = computed(() => {
  if (formData.value.type !== 'LTR') return 0
  const monthly = parseFloat(formData.value.fields.monthlyInstalment) || 0
  const duration = parseInt(formData.value.fields.duration) || 0
  const downPayment = parseFloat(formData.value.fields.downPayment) || 0
  return (monthly * duration) + downPayment
})

// Get duration options based on type
const getDurationOptions = (type) => {
  if (type === 'FIN') return [12, 24, 36, 48, 60]
  if (type === 'LEA') return [24, 36, 48, 60]
  if (type === 'LTR') return [12, 24, 36, 48, 60]
  return []
}

const getTypeLabel = (type) => {
  const labels = {
    FIN: 'Captive Financing',
    LEA: 'Leasing',
    LTR: 'Long-Term Rental'
  }
  return labels[type] || type
}

function inferTypeFromLabel(label) {
  if (!label || typeof label !== 'string') return ''
  const lower = label.toLowerCase()
  if (lower.includes('captive') || lower.includes('loan') || (lower.includes('financing') && !lower.includes('leasing') && !lower.includes('rental'))) return 'FIN'
  if (lower.includes('leasing')) return 'LEA'
  if (lower.includes('rental') || lower.includes('ltr')) return 'LTR'
  return ''
}

const defaultFormFields = () => ({
  monthlyInstalment: null,
  downPayment: null,
  duration: null,
  interestRate: null,
  effectiveInterestRate: null,
  gfv: null,
  mileageLimit: null,
  finalInstalment: null,
  customerType: '',
  insuranceIncluded: false,
  maintenanceIncluded: false,
  registrationTaxesIncluded: false
})

function loadPurchaseMethodIntoForm(pm) {
  if (!pm) return
  const hasType = pm.type && pm.type.length > 0
  const hasFields = pm.fields && Object.keys(pm.fields || {}).length > 0
  const type = hasType ? pm.type : inferTypeFromLabel(pm.label)
  const duration = pm.termMonths ?? pm.fields?.duration ?? null
  formData.value = {
    type,
    fields: {
      ...defaultFormFields(),
      ...(pm.fields || {}),
      ...(duration != null && !hasFields ? { duration } : {})
    },
    currency: pm.currency || 'EUR',
    offerValidFrom: pm.offerValidFrom ?? null,
    offerValidTo: pm.offerValidTo ?? null
  }
}

// Validation
const validateField = (fieldName) => {
  const value = formData.value.fields[fieldName]
  
  switch (fieldName) {
    case 'monthlyInstalment':
      if (!value || value <= 0) {
        errors.value.monthlyInstalment = 'Monthly Instalment must be greater than 0'
      } else {
        delete errors.value.monthlyInstalment
      }
      break
    case 'downPayment':
      if (value === null || value === undefined || value < 0) {
        errors.value.downPayment = 'Down Payment must be greater than or equal to 0'
      } else {
        delete errors.value.downPayment
      }
      break
    case 'duration':
      // Duration is only required for LTR
      if (formData.value.type === 'LTR' && (!value || value < 12 || value > 60)) {
        errors.value.duration = 'Duration must be between 12 and 60 months'
      } else {
        delete errors.value.duration
      }
      break
    case 'customerType':
      if (formData.value.type === 'LTR' && (!value || !['Private', 'Business', 'Fleet'].includes(value))) {
        errors.value.customerType = 'Customer Type is required'
      } else {
        delete errors.value.customerType
      }
      break
  }
}

const clearError = (fieldName) => {
  delete errors.value[fieldName]
}

const validateForm = () => {
  validationErrors.value = []
  errors.value = {}
  
  const validation = purchaseMethodService.validate({
    type: formData.value.type,
    fields: formData.value.fields
  })
  
  if (!validation.isValid) {
    const type = formData.value.type
    const durationOnlyForLTR = type !== 'LTR'
    validationErrors.value = durationOnlyForLTR
      ? validation.errors.filter(e => !e.includes('Duration must be between'))
      : validation.errors
    validation.errors.forEach(error => {
      if (error.includes('Monthly Instalment')) {
        errors.value.monthlyInstalment = error
      } else if (error.includes('Down Payment')) {
        errors.value.downPayment = error
      } else if (error.includes('Duration') && type === 'LTR') {
        errors.value.duration = error
      } else if (error.includes('Customer Type')) {
        errors.value.customerType = error
      }
    })
  }

  const onlyDurationWasInvalid = formData.value.type !== 'LTR' && validationErrors.value.length === 0 && !validation.isValid
  return validation.isValid || onlyDurationWasInvalid
}

const isFormValid = computed(() => {
  if (!formData.value.type) return false
  if (!formData.value.fields.monthlyInstalment || formData.value.fields.monthlyInstalment <= 0) return false
  if (formData.value.fields.downPayment === null || formData.value.fields.downPayment === undefined || formData.value.fields.downPayment < 0) return false
  // Duration is only required for LTR
  if (formData.value.type === 'LTR' && (!formData.value.fields.duration || formData.value.fields.duration < 12 || formData.value.fields.duration > 60)) return false
  if (formData.value.type === 'LTR' && !formData.value.fields.customerType) return false
  return Object.keys(errors.value).length === 0
})

const selectType = (value) => {
  formData.value.type = value ?? ''
  handleTypeChange()
}

const handleTypeChange = () => {
  if (formData.value.type !== 'FIN') {
    formData.value.fields.effectiveInterestRate = null
    formData.value.fields.gfv = null
  }
  if (formData.value.type !== 'LEA') {
    formData.value.fields.finalInstalment = null
  }
  if (formData.value.type !== 'LTR') {
    formData.value.fields.customerType = ''
    formData.value.fields.registrationTaxesIncluded = false
  }
  if (formData.value.type !== 'LEA' && formData.value.type !== 'LTR') {
    formData.value.fields.mileageLimit = null
    formData.value.fields.maintenanceIncluded = false
  }
  errors.value = {}
  validationErrors.value = []
}

function isStandaloneSaveAllowed() {
  if (!formData.value.type) return false
  const monthly = formData.value.fields.monthlyInstalment
  const down = formData.value.fields.downPayment
  if (monthly == null || monthly <= 0) return false
  if (down == null || down < 0) return false
  if (formData.value.type === 'LTR') {
    const dur = formData.value.fields.duration
    if (!dur || dur < 12 || dur > 60) return false
    if (!formData.value.fields.customerType) return false
  }
  return true
}

const handleSubmit = async () => {
  const standaloneAndFinancingOrLeasing = props.standalone && (formData.value.type === 'FIN' || formData.value.type === 'LEA')
  const formValid = validateForm()
  const minimalValid = isStandaloneSaveAllowed()
  if (!formValid && !(standaloneAndFinancingOrLeasing && minimalValid)) {
    return
  }

  saving.value = true
  emit('save-start')
  emit('close')

  try {
    const purchaseMethodData = {
      type: formData.value.type,
      fields: { ...formData.value.fields },
      currency: formData.value.currency,
      offerValidFrom: formData.value.offerValidFrom || null,
      offerValidTo: formData.value.offerValidTo || null,
      createdBy: userStore.currentUser?.id || null
    }

    if (props.standalone) {
      const typeLabel = getTypeLabel(formData.value.type)
      const monthly = formData.value.fields.monthlyInstalment ?? 0
      const monthlyFormatted = formatCurrency(monthly)
      const duration = formData.value.fields.duration ?? null
      const foLabel = duration
        ? `${typeLabel || 'Financing'} - €${monthlyFormatted}/mo, ${duration} months`
        : `${typeLabel || 'Financing'} - €${monthlyFormatted}/mo`
      emit('save', {
        id: isEditMode.value ? props.purchaseMethod.id : undefined,
        type: formData.value.type,
        fields: { ...formData.value.fields },
        label: foLabel,
        termMonths: duration,
        currency: formData.value.currency,
        offerValidFrom: formData.value.offerValidFrom ?? null,
        offerValidTo: formData.value.offerValidTo ?? null,
        successMessage: `Purchase Method ${isEditMode.value ? 'Updated' : 'Added'}: ${typeLabel} - €${monthlyFormatted}/month`
      })
      emit('close')
      return
    }

    if (props.taskType === 'lead') {
      purchaseMethodData.leadId = parseInt(props.taskId)
    } else if (props.taskType === 'opportunity') {
      purchaseMethodData.opportunityId = parseInt(props.taskId)
    }

    if (props.vehicleId) {
      purchaseMethodData.vehicleId = parseInt(props.vehicleId)
    }

    if (props.offerId) {
      purchaseMethodData.offerId = parseInt(props.offerId)
    }

    let result
    if (isEditMode.value) {
      result = await purchaseMethodsStore.updatePurchaseMethod(props.purchaseMethod.id, purchaseMethodData)
    } else {
      result = await purchaseMethodsStore.createPurchaseMethod(purchaseMethodData)
    }

    const typeLabel = getTypeLabel(result.type)
    const monthly = formatCurrency(result.fields.monthlyInstalment || 0)
    emit('save', {
      ...result,
      successMessage: `Purchase Method Added: ${typeLabel} - €${monthly}/month`
    })
    emit('close')
  } catch (error) {
    const msg = error.message || 'Failed to save purchase method'
    const durationOnlyForLTR = formData.value.type !== 'LTR'
    let toShow = [msg]
    if (durationOnlyForLTR && msg.startsWith('Validation failed: ')) {
      const rest = msg.replace('Validation failed: ', '').split(', ').filter(e => !e.includes('Duration must be between'))
      toShow = rest.length ? rest : []
    } else if (durationOnlyForLTR && msg.includes('Duration must be between 12 and 60 months')) {
      toShow = []
    }
    validationErrors.value = toShow
    emit('save-end')
  } finally {
    saving.value = false
  }
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

watch(() => [props.show, props.purchaseMethod], ([isOpen, pm]) => {
  if (isOpen && pm) {
    loadPurchaseMethodIntoForm(pm)
  } else if (isOpen && !pm) {
    formData.value = {
      type: 'FIN',
      fields: defaultFormFields(),
      currency: 'EUR',
      offerValidFrom: null,
      offerValidTo: null
    }
    errors.value = {}
    validationErrors.value = []
  }
  if (!isOpen) {
    const timeoutId = setTimeout(() => {
      if (!props.show) {
        formData.value = {
          type: '',
          fields: defaultFormFields(),
          currency: 'EUR',
          offerValidFrom: null,
          offerValidTo: null
        }
        errors.value = {}
        validationErrors.value = []
        saving.value = false
      }
    }, 300)
    return () => clearTimeout(timeoutId)
  }
}, { immediate: true })

watch(() => props.purchaseMethod, (pm) => {
  if (props.show && pm) {
    loadPurchaseMethodIntoForm(pm)
  }
})
</script>

