<template>
  <div 
    class="animate-fade-in relative"
    :class="{ 'bg-surface border border-border rounded-xl p-5 shadow-nsc-card mb-6': !hideHeader }"
  >
    <div v-if="!hideHeader" class="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-t border-l border-border rotate-45"></div>
    <div v-if="!hideHeader" class="flex justify-between items-center mb-4">
      <h5 class="text-sm font-semibold text-foreground">{{ item ? 'Edit Purchase Method' : 'Add Purchase Method' }}</h5>
      <button @click="$emit('cancel')" class="text-muted-foreground hover:text-muted-foreground"><X class="w-4 h-4 shrink-0" /></button>
    </div>

    <form @submit.prevent="handleSave" class="space-y-4">
      <!-- Type Selector (Radio buttons styled as tabs) -->
      <div>
        <label class="block text-sm font-medium text-muted-foreground mb-2">Purchase Method Type <span class="text-brand-red">*</span></label>
        <div class="flex gap-2">
          <label
            v-for="typeOption in typeOptions"
            :key="typeOption.value"
            class="flex-1 cursor-pointer"
          >
            <input
              type="radio"
              :value="typeOption.value"
              v-model="formData.type"
              class="sr-only"
              @change="handleTypeChange"
            />
            <div
              class="px-4 py-3 rounded-btn border-2 text-center text-sm font-medium transition-colors"
              :class="formData.type === typeOption.value
                ? 'border-brand-red bg-brand-red/5 text-brand-red'
                : 'border-D1D5DB bg-white text-muted-foreground hover:border-brand-slate'"
            >
              {{ typeOption.label }}
            </div>
          </label>
        </div>
      </div>

      <!-- Dynamic Form Based on Type -->
      <div v-if="formData.type" class="space-y-4">
        <!-- Common Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-1">
              Monthly Instalment <span class="text-brand-red">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              <input
                v-model.number="formData.fields.monthlyInstalment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="input pl-8"
                :class="{ 'border-red-500': errors.monthlyInstalment }"
                @input="clearError('monthlyInstalment')"
              />
            </div>
            <p v-if="errors.monthlyInstalment" class="text-sm text-red-600 mt-1">
              {{ errors.monthlyInstalment }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-1">
              Down Payment <span class="text-brand-red">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              <input
                v-model.number="formData.fields.downPayment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="input pl-8"
                :class="{ 'border-red-500': errors.downPayment }"
                @input="clearError('downPayment')"
              />
            </div>
            <p v-if="errors.downPayment" class="text-sm text-red-600 mt-1">
              {{ errors.downPayment }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-1">
              Duration (months) <span class="text-brand-red">*</span>
            </label>
            <select
              v-model.number="formData.fields.duration"
              class="input"
              :class="{ 'border-red-500': errors.duration }"
              @change="clearError('duration')"
            >
              <option value="">Select duration...</option>
              <option
                v-for="month in getDurationOptions(formData.type)"
                :key="month"
                :value="month"
              >
                {{ month }} months
              </option>
            </select>
            <p v-if="errors.duration" class="text-sm text-red-600 mt-1">
              {{ errors.duration }}
            </p>
          </div>

          <!-- FIN/LEA: Interest Rate -->
          <div v-if="formData.type === 'FIN' || formData.type === 'LEA'">
            <label class="block text-sm font-medium text-muted-foreground mb-1">Interest Rate / APR (%)</label>
            <div class="relative">
              <input
                v-model.number="formData.fields.interestRate"
                type="number"
                step="0.01"
                min="0"
                max="99.99"
                placeholder="0.00"
                class="input pr-8"
                @input="clearError('interestRate')"
              />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>

          <!-- LEA/LTR: Mileage Limit -->
          <div v-if="formData.type === 'LEA' || formData.type === 'LTR'">
            <label class="block text-sm font-medium text-muted-foreground mb-1">Mileage Limit (annual km)</label>
            <input
              v-model.number="formData.fields.mileageLimit"
              type="number"
              min="0"
              placeholder="0"
              class="input"
            />
          </div>
        </div>

        <!-- FIN-specific Fields -->
        <template v-if="formData.type === 'FIN'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted-foreground mb-1">Effective Interest Rate / TAEG (%)</label>
              <div class="relative">
                <input
                  v-model.number="formData.fields.effectiveInterestRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="99.99"
                  placeholder="0.00"
                  class="input pr-8"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-muted-foreground mb-1">Guaranteed Future Value / GFV (€)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                <input
                  v-model.number="formData.fields.gfv"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="input pl-8"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="fin-insurance"
              v-model="formData.fields.insuranceIncluded"
              class="w-4 h-4 rounded border-D1D5DB"
            />
            <label for="fin-insurance" class="text-sm text-muted-foreground cursor-pointer">
              Insurance Included
            </label>
          </div>
        </template>

        <!-- LEA-specific Fields -->
        <template v-if="formData.type === 'LEA'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-muted-foreground mb-1">Final Instalment (€)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                <input
                  v-model.number="formData.fields.finalInstalment"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="input pl-8"
                />
              </div>
            </div>
          </div>

          <!-- Calculated Total Leasing Amount -->
          <div class="bg-muted p-4 rounded-lg border border-border">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-muted-foreground">Total Leasing Amount:</span>
              <span class="text-lg font-bold text-foreground">€ {{ formatCurrency(totalLeasingAmount) }}</span>
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              (Monthly × Duration + Down Payment + Final Instalment)
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="lea-insurance"
                v-model="formData.fields.insuranceIncluded"
                class="w-4 h-4 rounded border-D1D5DB"
              />
              <label for="lea-insurance" class="text-sm text-muted-foreground cursor-pointer">
                Insurance Included
              </label>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="lea-maintenance"
                v-model="formData.fields.maintenanceIncluded"
                class="w-4 h-4 rounded border-D1D5DB"
              />
              <label for="lea-maintenance" class="text-sm text-muted-foreground cursor-pointer">
                Maintenance Included
              </label>
            </div>
          </div>
        </template>

        <!-- LTR-specific Fields -->
        <template v-if="formData.type === 'LTR'">
          <div>
            <label class="block text-sm font-medium text-muted-foreground mb-1">
              Customer Type <span class="text-brand-red">*</span>
            </label>
            <select
              v-model="formData.fields.customerType"
              class="input"
              :class="{ 'border-red-500': errors.customerType }"
              @change="clearError('customerType')"
            >
              <option value="">Select customer type...</option>
              <option value="Private">Private</option>
              <option value="Business">Business</option>
              <option value="Fleet">Fleet</option>
            </select>
            <p v-if="errors.customerType" class="text-sm text-red-600 mt-1">
              {{ errors.customerType }}
            </p>
          </div>

          <!-- Calculated Total Rental Amount -->
          <div class="bg-muted p-4 rounded-lg border border-border">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-muted-foreground">Total Rental Amount:</span>
              <span class="text-lg font-bold text-foreground">€ {{ formatCurrency(totalRentalAmount) }}</span>
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              (Monthly × Duration + Down Payment)
            </p>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="ltr-insurance"
                v-model="formData.fields.insuranceIncluded"
                class="w-4 h-4 rounded border-D1D5DB"
              />
              <label for="ltr-insurance" class="text-sm text-muted-foreground cursor-pointer">
                Insurance Included
              </label>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="ltr-maintenance"
                v-model="formData.fields.maintenanceIncluded"
                class="w-4 h-4 rounded border-D1D5DB"
              />
              <label for="ltr-maintenance" class="text-sm text-muted-foreground cursor-pointer">
                Maintenance Included
              </label>
            </div>
            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="ltr-registration"
                v-model="formData.fields.registrationTaxesIncluded"
                class="w-4 h-4 rounded border-D1D5DB"
              />
              <label for="ltr-registration" class="text-sm text-muted-foreground cursor-pointer">
                Registration/Taxes Included
              </label>
            </div>
          </div>
        </template>
      </div>
    </form>

    <div v-if="!hideActions" class="flex justify-end gap-2 mt-6 border-t border-border pt-4">
      <Button
        label="Cancel"
        variant="outline"
        size="small"
        @click="$emit('cancel')"
      />
      <Button
        label="Save"
        variant="primary"
        size="small"
        :disabled="!isFormValid"
        @click="handleSave"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { X } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'

const props = defineProps({
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
    required: true
  },
  hideActions: {
    type: Boolean,
    default: false
  },
  hideHeader: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const errors = ref({})

const typeOptions = [
  { value: 'FIN', label: 'FIN' },
  { value: 'LEA', label: 'LEA' },
  { value: 'LTR', label: 'LTR' }
]

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
  }
})

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

const formatCurrency = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

const clearError = (fieldName) => {
  delete errors.value[fieldName]
}

const isFormValid = computed(() => {
  if (!formData.value.type) return false
  if (!formData.value.fields.monthlyInstalment || formData.value.fields.monthlyInstalment <= 0) return false
  if (formData.value.fields.downPayment === null || formData.value.fields.downPayment === undefined || formData.value.fields.downPayment < 0) return false
  if (!formData.value.fields.duration || formData.value.fields.duration < 12 || formData.value.fields.duration > 60) return false
  if (formData.value.type === 'LTR' && !formData.value.fields.customerType) return false
  return Object.keys(errors.value).length === 0
})

const handleTypeChange = () => {
  // Reset type-specific fields when type changes
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
}

onMounted(() => {
  if (props.item && props.item.data) {
    // Load existing data
    formData.value = {
      type: props.item.data.type || '',
      fields: {
        monthlyInstalment: props.item.data.monthlyInstalment || null,
        downPayment: props.item.data.downPayment || null,
        duration: props.item.data.duration || null,
        interestRate: props.item.data.interestRate || null,
        effectiveInterestRate: props.item.data.effectiveInterestRate || null,
        gfv: props.item.data.gfv || null,
        mileageLimit: props.item.data.mileageLimit || null,
        finalInstalment: props.item.data.finalInstalment || null,
        customerType: props.item.data.customerType || '',
        insuranceIncluded: props.item.data.insuranceIncluded || false,
        maintenanceIncluded: props.item.data.maintenanceIncluded || false,
        registrationTaxesIncluded: props.item.data.registrationTaxesIncluded || false
      }
    }
  }
})

const handleSave = () => {
  if (!isFormValid.value) return

  const typeLabel = getTypeLabel(formData.value.type)
  const monthly = formData.value.fields.monthlyInstalment || 0
  const duration = formData.value.fields.duration || 0

  const data = {
    id: props.item?.id || Date.now(),
    type: 'purchase-method',
    action: props.item ? 'updated a purchase method' : 'added a purchase method',
    content: `${typeLabel}: €${formatCurrency(monthly)}/month for ${duration} months`,
    timestamp: props.item?.timestamp || new Date().toISOString(),
    isEdit: !!props.item,
    data: {
      type: formData.value.type,
      typeLabel: typeLabel,
      monthlyInstalment: formData.value.fields.monthlyInstalment,
      downPayment: formData.value.fields.downPayment,
      duration: formData.value.fields.duration,
      interestRate: formData.value.fields.interestRate,
      effectiveInterestRate: formData.value.fields.effectiveInterestRate,
      gfv: formData.value.fields.gfv,
      mileageLimit: formData.value.fields.mileageLimit,
      finalInstalment: formData.value.fields.finalInstalment,
      customerType: formData.value.fields.customerType,
      insuranceIncluded: formData.value.fields.insuranceIncluded,
      maintenanceIncluded: formData.value.fields.maintenanceIncluded,
      registrationTaxesIncluded: formData.value.fields.registrationTaxesIncluded,
      totalLeasingAmount: totalLeasingAmount.value,
      totalRentalAmount: totalRentalAmount.value
    }
  }

  emit('save', data)
}

defineExpose({
  submit: handleSave,
  canSubmit: () => isFormValid.value
})
</script>
