<template>
  <div
    class="rounded-lg border bg-background p-4"
    :class="selected ? 'border-primary' : 'border-border'"
  >
    <div class="flex flex-wrap items-center gap-2 gap-y-2">
      <Checkbox
        :id="`pm-sel-${method.id}`"
        :model-value="selected"
        class="shrink-0"
        @update:model-value="(v) => emit('update:selected', !!v)"
      />
      <span class="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0">
        {{ typeLabel }}
      </span>
      <span class="min-w-0 flex-1 text-base font-semibold text-foreground truncate">
        {{ method.name || '—' }}
      </span>
      <div class="flex shrink-0 items-center gap-1 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              class="shrink-0 rounded-md text-muted-foreground"
              :aria-label="`Actions for ${method.name || 'purchase method'}`"
            >
              <MoreVertical class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-40" align="end">
            <DropdownMenuItem class="cursor-pointer" @click="emit('edit')">Edit</DropdownMenuItem>
            <DropdownMenuItem class="cursor-pointer text-destructive" @click="emit('delete')">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="shrink-0 rounded-md text-muted-foreground"
          :aria-expanded="expanded"
          :aria-label="expanded ? 'Collapse details' : 'Expand details'"
          @click="expanded = !expanded"
        >
          <ChevronDown class="size-4 transition-transform duration-200" :class="{ 'rotate-180': expanded }" />
        </Button>
      </div>
    </div>

    <div
      v-if="!expanded"
      class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"
    >
      <span v-for="(part, idx) in collapsedParts" :key="idx">{{ part }}</span>
    </div>

    <div
      v-else
      class="mt-4 rounded-lg border border-border p-4"
    >
      <!-- Single grid + contents wrappers so column tracks align across all sections -->
      <div
        class="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4 md:items-start md:gap-x-6 md:gap-y-5"
      >
        <div class="contents">
          <template v-for="(cell, idx) in expandedCellsR1" :key="'r1-' + idx">
            <div class="flex min-h-0 min-w-0 flex-col gap-1">
              <p class="text-sm leading-snug text-muted-foreground">{{ cell.label }}</p>
              <p class="break-words text-sm font-medium tabular-nums text-foreground">
                {{ cell.value }}
              </p>
            </div>
          </template>
        </div>

        <template v-if="expandedCellsR2.length">
          <div class="contents">
            <template v-for="(cell, idx) in expandedCellsR2" :key="'r2-' + idx">
              <div class="flex min-h-0 min-w-0 flex-col gap-1">
                <p class="text-sm leading-snug text-muted-foreground">{{ cell.label }}</p>
                <p class="break-words text-sm font-medium tabular-nums text-foreground">
                  {{ cell.value }}
                </p>
              </div>
            </template>
          </div>
        </template>

        <template v-if="expandedCellsR3.length">
          <div class="contents">
            <template v-for="(cell, idx) in expandedCellsR3" :key="'r3-' + idx">
              <div class="flex min-h-0 min-w-0 flex-col gap-1">
                <p class="text-sm leading-snug text-muted-foreground">{{ cell.label }}</p>
                <p class="break-words text-sm font-medium text-foreground">
                  {{ cell.value }}
                </p>
              </div>
            </template>
          </div>
        </template>
      </div>
      <div v-if="expandedCellsNotes" class="mt-6 space-y-1 border-t border-border pt-6">
        <p class="text-sm text-muted-foreground">Notes</p>
        <p class="break-words text-sm font-medium whitespace-pre-wrap text-foreground">{{ expandedCellsNotes }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ChevronDown, MoreVertical } from 'lucide-vue-next'
import {
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@motork/component-library/future/primitives'
import {
  PURCHASE_METHOD_TYPE_LABELS,
  normalizeConfiguratorPurchaseMethod,
} from '@/utils/purchaseMethodConfiguratorForm.js'

const props = defineProps({
  method: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

const emit = defineEmits(['update:selected', 'edit', 'delete'])

const expanded = ref(false)

const m = computed(() => normalizeConfiguratorPurchaseMethod(props.method))

const typeLabel = computed(() => PURCHASE_METHOD_TYPE_LABELS[m.value.type] || m.value.type)

function dash(val) {
  if (val === null || val === undefined || val === '') return '--'
  if (typeof val === 'string' && !val.trim()) return '--'
  return val
}

function fmtEuro(n) {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return '--'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n))
}

function fmtEuroMo(n) {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return '--'
  return `${fmtEuro(n)}/mo`
}

function fmtPct(n) {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return '--'
  return `% ${new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n))}`
}

function fmtKm(n) {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return '--'
  return `${new Intl.NumberFormat('it-IT').format(Number(n))} Km`
}

function fmtMonths(n) {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return '--'
  return `${Math.round(Number(n))} months`
}

function fmtMonthsShort(n) {
  if (n === null || n === undefined || !Number.isFinite(Number(n))) return '--'
  return `${Math.round(Number(n))} m`
}

const providerLabel = computed(() => {
  if (m.value.providerType === 'independent') return 'Independent'
  return 'Captive'
})

const collapsedParts = computed(() => {
  const row = m.value
  if (row.type === 'FIN') {
    return [
      `${fmtEuroMo(row.monthlyInstallment)}`,
      fmtMonths(row.durationMonths),
      `Down payment ${fmtEuro(row.downPayment)}`,
      `Financed amount ${fmtEuro(row.financedAmount)}`,
      `Balloon payment ${fmtEuro(row.balloonPayment)}`,
    ]
  }
  if (row.type === 'LEA') {
    return [
      `${fmtEuroMo(row.monthlyInstallmentGross)}`,
      fmtMonths(row.durationMonths),
      `Down payment ${fmtEuro(row.downPayment)}`,
      `Residual ${fmtEuro(row.residualValue)}`,
    ]
  }
  if (row.type === 'LTR') {
    return [
      `${fmtEuroMo(row.monthlyInstallmentGross)}`,
      fmtMonths(row.durationMonths),
      `Down payment ${fmtEuro(row.downPayment)}`,
    ]
  }
  return []
})

const expandedCellsR1 = computed(() => {
  const row = m.value
  if (row.type === 'FIN') {
    return [
      { label: 'Vehicle price', value: fmtEuro(row.vehiclePrice) },
      { label: 'Down payment', value: fmtEuro(row.downPayment) },
      { label: 'Financed amount', value: fmtEuro(row.financedAmount) },
      { label: 'Balloon payment', value: fmtEuro(row.balloonPayment) },
    ]
  }
  if (row.type === 'LEA') {
    return [
      { label: 'Vehicle price', value: fmtEuro(row.vehiclePrice) },
      { label: 'Down payment', value: fmtEuro(row.downPayment) },
      { label: 'Financed amount', value: fmtEuro(row.financedAmount) },
      { label: 'Residual value', value: fmtEuro(row.residualValue) },
    ]
  }
  if (row.type === 'LTR') {
    return [
      { label: 'Down payment', value: fmtEuro(row.downPayment) },
      { label: 'Duration', value: fmtMonthsShort(row.durationMonths) },
      { label: 'Annual mileage limit', value: fmtKm(row.annualMileageLimit) },
      { label: 'Total mileage (contract)', value: fmtKm(row.totalMileageContract) },
    ]
  }
  return []
})

const expandedCellsR2 = computed(() => {
  const row = m.value
  if (row.type === 'FIN') {
    return [
      { label: 'Duration', value: fmtMonthsShort(row.durationMonths) },
      { label: 'Monthly installment', value: fmtEuro(row.monthlyInstallment) },
      { label: 'TAN', value: fmtPct(row.tan) },
      { label: 'TAEG', value: fmtPct(row.taeg) },
    ]
  }
  if (row.type === 'LEA') {
    return [
      { label: 'Duration', value: fmtMonthsShort(row.durationMonths) },
      { label: 'Monthly installment (gross)', value: fmtEuro(row.monthlyInstallmentGross) },
      { label: 'Monthly installment (net)', value: fmtEuro(row.monthlyInstallmentNet) },
      { label: 'Estimated total lease cost', value: fmtEuro(row.estimatedTotalLeaseCost) },
      { label: 'Annual mileage limit', value: fmtKm(row.annualMileageLimit) },
      { label: 'Total mileage (contract)', value: fmtKm(row.totalMileageContract) },
    ]
  }
  if (row.type === 'LTR') {
    const included = []
    for (const s of row.servicesIncluded || []) {
      if (s.included) included.push(s.label)
    }
    for (const s of row.customServices || []) {
      if (s.included !== false && String(s.label || '').trim()) included.push(s.label)
    }
    const servicesVal = included.length ? included.join(', ') : '--'
    return [
      { label: 'Monthly installment (gross)', value: fmtEuro(row.monthlyInstallmentGross) },
      { label: 'Monthly installment (net)', value: fmtEuro(row.monthlyInstallmentNet) },
      { label: 'Estimated total rental cost', value: fmtEuro(row.estimatedTotalRentalCost) },
      { label: 'Services included', value: servicesVal },
    ]
  }
  return []
})

const expandedCellsR3 = computed(() => {
  const row = m.value
  const dates = [
    { label: 'Starting date', value: dash(row.startingDate) },
    { label: 'Expiring date', value: dash(row.expiringDate) },
  ]
  if (row.type === 'LEA') {
    return [
      ...dates,
      { label: 'Leasing type', value: dash(row.leasingType) },
      { label: 'Provider type', value: providerLabel.value },
      { label: 'Provider name', value: dash(row.providerName) },
      { label: 'Financial product name', value: dash(row.financialProductName) },
    ]
  }
  if (row.type === 'LTR') {
    return [
      ...dates,
      { label: 'Rental type', value: dash(row.rentalType) },
      { label: 'Provider type', value: providerLabel.value },
      { label: 'Provider name', value: dash(row.providerName) },
      { label: 'Financial product name', value: dash(row.financialProductName) },
    ]
  }
  return [
    ...dates,
    { label: 'Provider type', value: providerLabel.value },
    { label: 'Provider name', value: dash(row.providerName) },
    { label: 'Financial product name', value: dash(row.financialProductName) },
  ]
})

const expandedCellsNotes = computed(() => {
  const n = String(m.value.notes || '').trim()
  return n || null
})
</script>
