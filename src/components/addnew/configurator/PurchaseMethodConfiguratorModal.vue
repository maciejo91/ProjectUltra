<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>Purchase method</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-4">
          <RadioGroup
            :model-value="form.type"
            class="grid w-full grid-cols-1 gap-3 sm:grid-cols-3"
            aria-label="Purchase method type"
            @update:model-value="selectType"
          >
            <div
              v-for="opt in purchaseMethodTypeOptions"
              :key="opt.value"
              :class="[
                'flex min-h-10 w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                form.type === opt.value
                  ? 'border-primary bg-muted ring-1 ring-primary'
                  : 'border-border bg-background',
              ]"
            >
              <RadioGroupItem :id="opt.id" :value="opt.value" class="shrink-0" />
              <Label
                :for="opt.id"
                class="min-w-0 flex-1 cursor-pointer text-sm font-medium leading-none text-foreground"
              >
                {{ opt.label }}
              </Label>
            </div>
          </RadioGroup>

          <div v-if="form.type" class="space-y-4">
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">
                Name <span class="text-destructive">*</span>
              </Label>
              <Input
                v-model="form.name"
                type="text"
                placeholder="Insert a name for the configuration"
                class="w-full border-border bg-background"
                :class="{ 'border-destructive': errors.name }"
                @update:model-value="errors.name = ''"
              />
              <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
            </div>

            <!-- Configuration -->
            <div class="rounded-lg border border-border p-4 space-y-4">
              <p class="text-sm font-medium text-muted-foreground">Configuration</p>

              <div v-if="form.type !== 'LTR'" class="space-y-2">
                <Label class="block text-sm font-medium text-foreground">Vehicle price</Label>
                <div class="relative">
                  <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    €
                  </span>
                  <Input
                    v-model="form.vehiclePrice"
                    type="text"
                    inputmode="decimal"
                    class="w-full border-border bg-background pl-7"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Down payment</Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      €
                    </span>
                    <Input
                      v-model="form.downPayment"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-7"
                    />
                  </div>
                </div>
                <div v-if="form.type !== 'LTR'" class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Financed amount</Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      €
                    </span>
                    <Input
                      v-model="form.financedAmount"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-7"
                    />
                  </div>
                </div>
                <div v-if="form.type === 'FIN'" class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Balloon payment</Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      €
                    </span>
                    <Input
                      v-model="form.balloonPayment"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-7"
                    />
                  </div>
                </div>
                <div v-if="form.type === 'LEA'" class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Residual value</Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      €
                    </span>
                    <Input
                      v-model="form.residualValue"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-7"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Duration (months)</Label>
                  <Select
                    :model-value="form.durationMonths || undefined"
                    @update:model-value="(v) => (form.durationMonths = v != null ? String(v) : '')"
                  >
                    <SelectTrigger class="w-full border-border bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="m in durationOptions" :key="m" :value="String(m)">
                        {{ m }} months
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div v-if="form.type !== 'FIN'" class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Annual mileage limit</Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      Km
                    </span>
                    <Input
                      v-model="form.annualMileageLimit"
                      type="text"
                      inputmode="numeric"
                      class="w-full border-border bg-background pl-10"
                    />
                  </div>
                </div>
                <div v-if="form.type !== 'FIN'" class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Total mileage (contract)</Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      Km
                    </span>
                    <Input
                      v-model="form.totalMileageContract"
                      type="text"
                      inputmode="numeric"
                      class="w-full border-border bg-background pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial details -->
            <div class="rounded-lg border border-border p-4 space-y-4">
              <p class="text-sm font-medium text-muted-foreground">Financial details and costs</p>

              <div v-if="form.type === 'FIN'" class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Monthly installment</Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      €
                    </span>
                    <Input
                      v-model="form.monthlyInstallment"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-7"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">TAN</Label>
                  <div class="relative">
                    <Input
                      v-model="form.tan"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-8"
                    />
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">TAEG</Label>
                  <div class="relative">
                    <Input
                      v-model="form.taeg"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-8"
                    />
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Monthly installment (gross)</Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      €
                    </span>
                    <Input
                      v-model="form.monthlyInstallmentGross"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-7"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Monthly installment (net)</Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      €
                    </span>
                    <Input
                      v-model="form.monthlyInstallmentNet"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-7"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">
                    {{ form.type === 'LEA' ? 'Estimated total lease cost' : 'Estimated total rental cost' }}
                  </Label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      €
                    </span>
                    <Input
                      v-if="form.type === 'LEA'"
                      v-model="form.estimatedTotalLeaseCost"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-7"
                    />
                    <Input
                      v-else
                      v-model="form.estimatedTotalRentalCost"
                      type="text"
                      inputmode="decimal"
                      class="w-full border-border bg-background pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Services included (LTR only) -->
            <div v-if="form.type === 'LTR'" class="rounded-lg border border-border p-4 space-y-4">
              <p class="text-sm font-medium text-muted-foreground">Services included</p>
              <div class="space-y-3">
                <div v-for="s in form.servicesIncluded" :key="s.id" class="flex items-center gap-2">
                  <Checkbox
                    :id="`svc-${s.id}`"
                    :model-value="s.included"
                    @update:model-value="(v) => (s.included = !!v)"
                  />
                  <Label :for="`svc-${s.id}`" class="text-sm font-normal text-foreground cursor-pointer">
                    {{ s.label }}
                  </Label>
                </div>
                <div v-for="s in form.customServices" :key="s.id" class="flex items-start gap-2">
                  <Checkbox
                    :id="`csv-${s.id}`"
                    class="mt-0.5"
                    :model-value="s.included"
                    @update:model-value="(v) => (s.included = !!v)"
                  />
                  <div class="min-w-0 flex-1 space-y-1">
                    <Label :for="`csv-${s.id}`" class="sr-only">Custom service</Label>
                    <Input
                      :id="`csv-${s.id}`"
                      v-model="s.label"
                      type="text"
                      placeholder="Service name"
                      class="w-full border-border bg-background"
                    />
                  </div>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" class="rounded-md" @click="addCustomService">
                <Plus class="size-4 mr-1.5" />
                Add
              </Button>
            </div>

            <!-- Timing and provider -->
            <div class="rounded-lg border border-border p-4 space-y-4">
              <p class="text-sm font-medium text-muted-foreground">Timing and provider</p>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Starting date</Label>
                  <MiniCalendarDateField
                    v-model="form.startingDate"
                    aria-label="Starting date"
                    group-class="rounded-md"
                    input-class="min-w-0"
                    popover-content-class="z-[110]"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Expiring date</Label>
                  <MiniCalendarDateField
                    v-model="form.expiringDate"
                    aria-label="Expiring date"
                    group-class="rounded-md"
                    input-class="min-w-0"
                    popover-content-class="z-[110]"
                  />
                </div>
                <div v-if="form.type === 'LEA'" class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Leasing type</Label>
                  <Select
                    :model-value="form.leasingType || undefined"
                    @update:model-value="(v) => (form.leasingType = String(v ?? ''))"
                  >
                    <SelectTrigger class="w-full border-border bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="opt in leasingTypeOptions" :key="opt" :value="opt">
                        {{ opt }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div v-if="form.type === 'LTR'" class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Rental type</Label>
                  <Select
                    :model-value="form.rentalType || undefined"
                    @update:model-value="(v) => (form.rentalType = String(v ?? ''))"
                  >
                    <SelectTrigger class="w-full border-border bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="opt in rentalTypeOptions" :key="opt" :value="opt">
                        {{ opt }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2 md:col-span-1">
                  <Label class="block text-sm font-medium text-foreground">Provider type</Label>
                  <RadioGroup
                    :model-value="form.providerType"
                    class="flex flex-wrap gap-3 pt-1"
                    aria-label="Provider type"
                    @update:model-value="(v) => (form.providerType = v === 'independent' ? 'independent' : 'captive')"
                  >
                    <div class="flex items-center gap-2">
                      <RadioGroupItem id="pm-prov-captive" value="captive" />
                      <Label for="pm-prov-captive" class="text-sm font-normal text-foreground">Captive</Label>
                    </div>
                    <div class="flex items-center gap-2">
                      <RadioGroupItem id="pm-prov-independent" value="independent" />
                      <Label for="pm-prov-independent" class="text-sm font-normal text-foreground">Independent</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Provider name</Label>
                  <Input
                    v-model="form.providerName"
                    type="text"
                    placeholder="Insert"
                    class="w-full border-border bg-background"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Financial product name</Label>
                  <Input
                    v-model="form.financialProductName"
                    type="text"
                    placeholder="Insert"
                    class="w-full border-border bg-background"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">Notes</Label>
              <Textarea
                v-model="form.notes"
                placeholder="Type your notes here..."
                class="min-h-24 w-full border-border bg-background"
              />
            </div>
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button variant="outline" class="rounded-sm w-full sm:w-auto" type="button" @click="handleCancel">
            Cancel
          </Button>
          <Button variant="default" class="rounded-sm w-full sm:w-auto" type="button" :disabled="!form.type" @click="handleSave">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { Plus } from 'lucide-vue-next'
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@motork/component-library/future/primitives'
import MiniCalendarDateField from '@/components/shared/forms/MiniCalendarDateField.vue'
import {
  LTR_SERVICE_PRESETS,
  PURCHASE_METHOD_TYPE_LABELS,
  createEmptyConfiguratorPurchaseMethod,
  durationMonthOptions,
  formToRow,
  normalizeConfiguratorPurchaseMethod,
  rowToForm,
} from '@/utils/purchaseMethodConfiguratorForm.js'
import {
  parseDdMmYyyy,
  parseIsoYyyyMmDd,
  formatMotorkDateFieldEu,
} from '@/utils/motorkDateField.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'add' },
  initial: { type: Object, default: () => ({}) },
  /** Prefills vehicle price (and new row default) */
  defaultVehiclePrice: { type: Number, default: 0 },
  editingId: { type: String, default: '' },
})

const emit = defineEmits(['update:open', 'save'])

const purchaseMethodTypeOptions = [
  { id: 'pm-type-fin', value: 'FIN', label: 'Financing' },
  { id: 'pm-type-lea', value: 'LEA', label: 'Leasing' },
  { id: 'pm-type-ltr', value: 'LTR', label: 'Long term rent' },
]

const leasingTypeOptions = ['Financial leasing', 'Operating lease']
const rentalTypeOptions = ['Full service', 'Mileage-based']

function newCustomServiceId() {
  return `csv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function emptyForm() {
  const row = createEmptyConfiguratorPurchaseMethod({
    type: 'FIN',
    defaultVehiclePrice: props.defaultVehiclePrice,
  })
  return rowToForm(row)
}

const form = reactive(emptyForm())
const errors = reactive({ name: '' })
const suppressExpiringAutoSync = ref(false)

const durationOptions = computed(() => durationMonthOptions(form.type))

function parseFlexibleStartDate(s) {
  return parseIsoYyyyMmDd(s) || parseDdMmYyyy(s)
}

function readDurationMonthsFromForm() {
  const s = String(form.durationMonths ?? '').trim()
  if (!s) return null
  const n = parseInt(s, 10)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function syncExpiringFromStartAndDuration() {
  const months = readDurationMonthsFromForm()
  if (months == null) return
  const start = parseFlexibleStartDate(form.startingDate)
  if (!start) return
  const end = new Date(start.getFullYear(), start.getMonth() + months, start.getDate())
  end.setHours(0, 0, 0, 0)
  form.expiringDate = formatMotorkDateFieldEu(end)
}

function applyInitial() {
  suppressExpiringAutoSync.value = true
  errors.name = ''
  if (props.mode === 'edit' && props.initial && typeof props.initial === 'object') {
    const merged = rowToForm(normalizeConfiguratorPurchaseMethod(props.initial))
    Object.assign(form, merged)
    if (!Array.isArray(form.customServices)) form.customServices = []
    if (!Array.isArray(form.servicesIncluded)) form.servicesIncluded = []
    nextTick(() => {
      suppressExpiringAutoSync.value = false
    })
    return
  }
  Object.assign(form, emptyForm())
  nextTick(() => {
    suppressExpiringAutoSync.value = false
  })
}

watch(
  () => [props.open, props.mode, props.editingId, props.initial, props.defaultVehiclePrice],
  () => {
    if (props.open) applyInitial()
  },
  { deep: true },
)

watch(
  () => [form.startingDate, form.durationMonths],
  () => {
    if (suppressExpiringAutoSync.value) return
    syncExpiringFromStartAndDuration()
  },
)

function selectType(next) {
  const prev = form.type
  form.type = next
  if (next === 'LTR' && prev !== 'LTR') {
    form.servicesIncluded = LTR_SERVICE_PRESETS.map((p) => ({
      id: p.id,
      label: p.label,
      included: false,
    }))
    form.customServices = []
  }
  if (next !== 'LTR') {
    form.customServices = []
  }
  if (next === 'LTR') {
    form.financedAmount = ''
    form.balloonPayment = ''
    form.residualValue = ''
    form.monthlyInstallment = ''
    form.tan = ''
    form.taeg = ''
    form.estimatedTotalLeaseCost = ''
    form.vehiclePrice = ''
  }
  if (next === 'FIN') {
    form.residualValue = ''
    form.monthlyInstallmentGross = ''
    form.monthlyInstallmentNet = ''
    form.estimatedTotalLeaseCost = ''
    form.estimatedTotalRentalCost = ''
    const vp = Number(props.defaultVehiclePrice)
    form.vehiclePrice = Number.isFinite(vp) ? String(vp) : ''
  }
  if (next === 'LEA') {
    form.balloonPayment = ''
    form.monthlyInstallment = ''
    form.tan = ''
    form.taeg = ''
    form.estimatedTotalRentalCost = ''
    const vp = Number(props.defaultVehiclePrice)
    form.vehiclePrice = Number.isFinite(vp) ? String(vp) : ''
  }
  form.name = PURCHASE_METHOD_TYPE_LABELS[next] || String(next)
}

function addCustomService() {
  form.customServices.push({
    id: newCustomServiceId(),
    label: '',
    included: true,
  })
}

function handleOpenChange(v) {
  if (!v) emit('update:open', false)
}

function handleCancel() {
  emit('update:open', false)
}

function handleSave() {
  errors.name = ''
  if (!String(form.name || '').trim()) {
    errors.name = 'Required'
    return
  }
  const row = formToRow(form, {
    id: props.mode === 'edit' && props.editingId ? props.editingId : undefined,
    defaultVehiclePrice: props.defaultVehiclePrice,
  })
  emit('save', row)
  emit('update:open', false)
}
</script>
