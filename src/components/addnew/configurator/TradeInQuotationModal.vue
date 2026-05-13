<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>{{ mode === 'edit' ? 'Edit trade-in vehicle' : 'Add trade-in vehicle' }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-6">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">Vehicle class</Label>
              <Select
                :model-value="form.vehicleClass"
                @update:model-value="(v) => (form.vehicleClass = String(v || 'car'))"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="c in vehicleClassOptions" :key="c.value" :value="c.value">
                    {{ c.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">
                Brand <span class="text-destructive">*</span>
              </Label>
              <Select
                :model-value="form.brand"
                @update:model-value="onBrandChange"
              >
                <SelectTrigger class="w-full" :class="{ 'border-destructive': errors.brand }">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="b in brandOptions" :key="b" :value="b">
                    {{ b }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.brand" class="text-sm text-destructive">{{ errors.brand }}</p>
            </div>
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">
                Model <span class="text-destructive">*</span>
              </Label>
              <Select
                :model-value="form.model"
                :disabled="!form.brand"
                @update:model-value="(v) => (form.model = String(v ?? ''))"
              >
                <SelectTrigger class="w-full" :class="{ 'border-destructive': errors.model }">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="m in modelOptions" :key="m" :value="m">
                    {{ m }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.model" class="text-sm text-destructive">{{ errors.model }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">Version</Label>
              <Input
                v-model="form.version"
                type="text"
                placeholder="Version"
                class="w-full border-border bg-background"
              />
            </div>
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">
                Fuel type <span class="text-destructive">*</span>
              </Label>
              <Select :model-value="form.fuelType" @update:model-value="(v) => (form.fuelType = String(v ?? ''))">
                <SelectTrigger class="w-full" :class="{ 'border-destructive': errors.fuelType }">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="f in fuelOptions" :key="f" :value="f">
                    {{ f }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.fuelType" class="text-sm text-destructive">{{ errors.fuelType }}</p>
            </div>
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">
                Gear type <span class="text-destructive">*</span>
              </Label>
              <Select :model-value="form.gearType" @update:model-value="(v) => (form.gearType = String(v ?? ''))">
                <SelectTrigger class="w-full" :class="{ 'border-destructive': errors.gearType }">
                  <SelectValue placeholder="Select gear type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="g in gearOptions" :key="g" :value="g">
                    {{ g }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors.gearType" class="text-sm text-destructive">{{ errors.gearType }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">
                Registration year <span class="text-destructive">*</span>
              </Label>
              <MiniCalendarDateField
                v-model="form.registrationYear"
                aria-label="Registration date"
                :input-class="registrationYearInputClass"
                calendar-button-class="rounded-md"
                popover-content-class="z-[110]"
              />
              <p v-if="errors.registrationYear" class="text-sm text-destructive">{{ errors.registrationYear }}</p>
            </div>
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">Mileage</Label>
              <Input
                v-model="form.mileage"
                type="text"
                placeholder="Km"
                class="w-full border-border bg-background"
              />
            </div>
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">Plate</Label>
              <Input
                v-model="form.plate"
                type="text"
                placeholder="Plate"
                class="w-full border-border bg-background uppercase"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="space-y-2">
              <Label class="block text-sm font-medium text-foreground">
                Evaluation <span class="text-destructive">*</span>
              </Label>
              <div class="relative">
                <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  €
                </span>
                <Input
                  v-model="form.evaluation"
                  type="text"
                  inputmode="decimal"
                  class="w-full border-border bg-background pl-7 text-right"
                  :class="{ 'border-destructive': errors.evaluation }"
                />
              </div>
              <p v-if="errors.evaluation" class="text-sm text-destructive">{{ errors.evaluation }}</p>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-1.5">
                <Label class="block text-sm font-medium text-foreground">
                  Main offer evaluation <span class="text-destructive">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <button
                      type="button"
                      class="rounded-sm text-muted-foreground hover:text-foreground"
                      aria-label="About main offer evaluation"
                    >
                      <Info class="size-4 shrink-0" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    class="max-w-sm rounded-md border border-border bg-background p-3 text-sm text-foreground shadow-md"
                  >
                    <p class="leading-normal">
                      Evaluation applied to this offer. It may differ from the initial estimate.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div class="relative">
                <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  €
                </span>
                <Input
                  v-model="form.mainOfferEvaluation"
                  type="text"
                  inputmode="decimal"
                  class="w-full border-border bg-background pl-7 text-right"
                  :class="{ 'border-destructive': errors.mainOfferEvaluation }"
                />
              </div>
              <p v-if="errors.mainOfferEvaluation" class="text-sm text-destructive">{{ errors.mainOfferEvaluation }}</p>
            </div>
            <div class="hidden md:block" aria-hidden="true" />
          </div>

          <div class="overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-2 bg-muted px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
              @click="moreDetailsOpen = !moreDetailsOpen"
            >
              More details
              <ChevronDown
                class="size-4 shrink-0 text-muted-foreground transition-transform duration-200"
                :class="{ 'rotate-180': moreDetailsOpen }"
              />
            </button>
            <div v-show="moreDetailsOpen" class="border-t border-border p-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Colour</Label>
                  <Input
                    v-model="form.colour"
                    type="text"
                    placeholder="Colour"
                    class="w-full border-border bg-background"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">Owner</Label>
                  <Input
                    v-model="form.owner"
                    type="text"
                    placeholder="Owner"
                    class="w-full border-border bg-background"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="block text-sm font-medium text-foreground">VAT deductible</Label>
                  <RadioGroup
                    :model-value="form.vatDeductible ? 'yes' : 'no'"
                    class="flex flex-wrap gap-6 pt-1"
                    aria-label="VAT deductible"
                    @update:model-value="(v) => (form.vatDeductible = v === 'yes')"
                  >
                    <div class="flex items-center gap-2">
                      <RadioGroupItem id="ti-tradein-vat-yes" value="yes" />
                      <Label for="ti-tradein-vat-yes" class="text-sm font-normal text-foreground">Yes</Label>
                    </div>
                    <div class="flex items-center gap-2">
                      <RadioGroupItem id="ti-tradein-vat-no" value="no" />
                      <Label for="ti-tradein-vat-no" class="text-sm font-normal text-foreground">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button variant="outline" class="rounded-sm w-full sm:w-auto" type="button" @click="handleCancel">
            Cancel
          </Button>
          <Button variant="default" class="rounded-sm w-full sm:w-auto" type="button" @click="handleSave">
            Save trade-in
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ChevronDown, Info } from 'lucide-vue-next'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@motork/component-library/future/primitives'
import MiniCalendarDateField from '@/components/shared/forms/MiniCalendarDateField.vue'

const vehicleClassOptions = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike' },
  { value: 'truck', label: 'Truck' },
  { value: 'other', label: 'Other' },
]

function normalizeVehicleClass(raw) {
  const s = String(raw || '').trim().toLowerCase()
  if (['car', 'bike', 'truck', 'other'].includes(s)) return s
  if (s === 'motorcycle' || s === 'motorbike') return 'bike'
  if (s === 'van') return 'truck'
  return 'car'
}

const brandOptions = ['Fiat', 'Audi', 'BMW', 'Volkswagen', 'Mercedes-Benz', 'Ford', 'Toyota', 'Peugeot', 'Renault']

const modelsByBrand = {
  Fiat: ['500', 'Panda', 'Tipo', '500X'],
  Audi: ['A3', 'A4', 'A6', 'Q3', 'Q5'],
  BMW: ['1 Series', '3 Series', '5 Series', 'X1', 'X3'],
  Volkswagen: ['Golf', 'Polo', 'Tiguan', 'Passat'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'GLA', 'GLC'],
  Ford: ['Fiesta', 'Focus', 'Puma', 'Kuga'],
  Toyota: ['Yaris', 'Corolla', 'C-HR', 'RAV4'],
  Peugeot: ['208', '308', '3008', '5008'],
  Renault: ['Clio', 'Captur', 'Megane', 'Austral'],
}

const fuelOptions = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in hybrid', 'LPG']
const gearOptions = ['Manual', 'Automatic']

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'add' },
  initial: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['update:open', 'save'])

const moreDetailsOpen = ref(false)

const form = reactive({
  vehicleClass: 'car',
  brand: '',
  model: '',
  version: '',
  registrationYear: '',
  mileage: '',
  plate: '',
  evaluation: '',
  mainOfferEvaluation: '',
  fuelType: '',
  gearType: '',
  colour: '',
  owner: '',
  vatDeductible: false,
})

const errors = reactive({
  brand: '',
  model: '',
  registrationYear: '',
  evaluation: '',
  mainOfferEvaluation: '',
  fuelType: '',
  gearType: '',
})

const modelOptions = computed(() => {
  const b = String(form.brand || '')
  return modelsByBrand[b] || []
})

const registrationYearInputClass = computed(() => {
  const base = 'h-10 w-full min-w-0 border-border bg-background'
  return errors.registrationYear ? `${base} border-destructive` : base
})

function emptyForm() {
  form.vehicleClass = 'car'
  form.brand = ''
  form.model = ''
  form.version = ''
  form.registrationYear = ''
  form.mileage = ''
  form.plate = ''
  form.evaluation = ''
  form.mainOfferEvaluation = ''
  form.fuelType = ''
  form.gearType = ''
  form.colour = ''
  form.owner = ''
  form.vatDeductible = false
  clearErrors()
}

function clearErrors() {
  errors.brand = ''
  errors.model = ''
  errors.registrationYear = ''
  errors.evaluation = ''
  errors.mainOfferEvaluation = ''
  errors.fuelType = ''
  errors.gearType = ''
}

function applyInitial(row) {
  emptyForm()
  const r = row && typeof row === 'object' ? row : {}
  form.vehicleClass = normalizeVehicleClass(r.vehicleClass)
  form.brand = String(r.brand || '').trim()
  form.model = String(r.model || '').trim()
  form.version = String(r.trimLine || r.version || '').trim()
  form.registrationYear = String(r.firstRegistration || '').trim()
  form.mileage = String(r.mileageLabel || r.mileage || '').trim()
  form.plate = String(r.licensePlate || r.plate || '').trim()
  const ev = Number(r.valuation)
  form.evaluation = Number.isFinite(ev) && ev !== 0 ? String(ev) : ''
  const mo = Number(r.mainOfferEvaluation)
  form.mainOfferEvaluation = Number.isFinite(mo) && mo !== 0 ? String(mo) : ''
  form.fuelType = String(r.fuelType || '').trim()
  form.gearType = String(r.gearType || '').trim()
  form.colour = String(r.colour || '').trim()
  form.owner = String(r.owner || '').trim()
  form.vatDeductible = r.vatDeductible === true
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    applyInitial(props.initial)
    moreDetailsOpen.value = false
  },
)

watch(
  () => props.initial,
  () => {
    if (!props.open) return
    applyInitial(props.initial)
  },
  { deep: true },
)

function onBrandChange(v) {
  form.brand = String(v ?? '')
  form.model = ''
}

function parseDecimalInput(raw) {
  const s = String(raw ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
  if (s === '' || s === '-' || s === '.' || s === '-.') return NaN
  return Number(s)
}

function validate() {
  clearErrors()
  let ok = true
  if (!String(form.brand || '').trim()) {
    errors.brand = 'Required'
    ok = false
  }
  if (!String(form.model || '').trim()) {
    errors.model = 'Required'
    ok = false
  }
  if (!String(form.registrationYear || '').trim()) {
    errors.registrationYear = 'Required'
    ok = false
  }
  const ev = parseDecimalInput(form.evaluation)
  if (!Number.isFinite(ev) || ev < 0) {
    errors.evaluation = 'Enter a valid amount'
    ok = false
  }
  const mainEv = parseDecimalInput(form.mainOfferEvaluation)
  if (!Number.isFinite(mainEv) || mainEv < 0) {
    errors.mainOfferEvaluation = 'Enter a valid amount'
    ok = false
  }
  if (!String(form.fuelType || '').trim()) {
    errors.fuelType = 'Required'
    ok = false
  }
  if (!String(form.gearType || '').trim()) {
    errors.gearType = 'Required'
    ok = false
  }
  return ok
}

function buildPayload() {
  const ev = parseDecimalInput(form.evaluation)
  const mainEv = parseDecimalInput(form.mainOfferEvaluation)
  const brand = String(form.brand || '').trim()
  const model = String(form.model || '').trim()
  const title = [brand, model].filter(Boolean).join(' ').trim() || 'Trade-in'
  const version = String(form.version || '').trim()
  return {
    vehicleClass: String(form.vehicleClass || 'car'),
    brand,
    model,
    title,
    version,
    trimLine: version,
    firstRegistration: String(form.registrationYear || '').trim(),
    mileageLabel: String(form.mileage || '').trim(),
    licensePlate: String(form.plate || '').trim(),
    valuation: Number.isFinite(ev) ? Math.max(0, ev) : 0,
    mainOfferEvaluation: Number.isFinite(mainEv) ? Math.max(0, mainEv) : 0,
    fuelType: String(form.fuelType || '').trim(),
    gearType: String(form.gearType || '').trim(),
    colour: String(form.colour || '').trim(),
    owner: String(form.owner || '').trim(),
    vatDeductible: form.vatDeductible === true,
  }
}

function handleSave() {
  if (!validate()) return
  emit('save', buildPayload())
  emit('update:open', false)
}

function handleCancel() {
  emit('update:open', false)
}

function handleOpenChange(isOpen) {
  if (!isOpen) emit('update:open', false)
}
</script>
