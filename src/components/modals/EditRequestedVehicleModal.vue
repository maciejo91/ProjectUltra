<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[100] bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col z-[100]"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>{{ t('requestDetail.editVehicleModal.title') }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-6">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                <span class="text-destructive">*</span>
                {{ t('requestDetail.editVehicleModal.requestType') }}
              </Label>
              <Select v-model="form.requestType">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('requestDetail.editVehicleModal.placeholders.select')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in requestTypeValues"
                    :key="opt"
                    :value="opt"
                  >
                    {{ requestTypeLabel(opt) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                {{ t('requestDetail.editVehicleModal.vehicleType') }}
              </Label>
              <Select v-model="form.vehicleType">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('requestDetail.editVehicleModal.placeholders.select')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">{{ t('requestDetail.editVehicleModal.vehicleTypes.new') }}</SelectItem>
                  <SelectItem value="Used">{{ t('requestDetail.editVehicleModal.vehicleTypes.used') }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                {{ t('requestDetail.editVehicleModal.requestPrice') }}
              </Label>
              <Input
                v-model="form.price"
                type="number"
                min="0"
                step="1"
                class="w-full"
                :placeholder="t('requestDetail.editVehicleModal.placeholders.price')"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                <span class="text-destructive">*</span>
                {{ t('requestDetail.editVehicleModal.quantity') }}
              </Label>
              <Input
                v-model.number="form.quantity"
                type="number"
                min="1"
                step="1"
                class="w-full"
                required
              />
            </div>
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                {{ t('requestDetail.editVehicleModal.vehicleClass') }}
              </Label>
              <Select v-model="form.vehicleClass">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('requestDetail.editVehicleModal.placeholders.select')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Car">{{ t('requestDetail.editVehicleModal.vehicleClasses.car') }}</SelectItem>
                  <SelectItem value="Motorcycle">{{ t('requestDetail.editVehicleModal.vehicleClasses.motorcycle') }}</SelectItem>
                  <SelectItem value="Van">{{ t('requestDetail.editVehicleModal.vehicleClasses.van') }}</SelectItem>
                  <SelectItem value="Commercial">{{ t('requestDetail.editVehicleModal.vehicleClasses.commercial') }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                <span class="text-destructive">*</span>
                {{ t('requestDetail.editVehicleModal.vehicleBrand') }}
              </Label>
              <Popover :open="brandOpen" @update:open="(v) => (brandOpen = v)">
                <PopoverAnchor class="block w-full">
                  <Input
                    v-model="form.brand"
                    type="text"
                    class="w-full"
                    required
                    @focus="brandOpen = true"
                  />
                </PopoverAnchor>
                <PopoverContent
                  class="z-[110] w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
                  align="start"
                  @open-auto-focus.prevent
                >
                  <Command class="rounded-md border border-border bg-background" :filter-disabled="true">
                    <CommandList class="max-h-64 overflow-y-auto">
                      <CommandEmpty class="py-4 text-center text-sm text-muted-foreground">
                        {{ t('requestDetail.editVehicleModal.noBrandFound') }}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          v-for="b in filteredBrands"
                          :key="b"
                          :value="b"
                          class="cursor-pointer"
                          @select="selectBrand(b)"
                        >
                          {{ b }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                <span class="text-destructive">*</span>
                {{ t('requestDetail.editVehicleModal.model') }}
              </Label>
              <Popover :open="modelOpen" @update:open="(v) => (modelOpen = v)">
                <PopoverAnchor class="block w-full">
                  <Input
                    v-model="form.model"
                    type="text"
                    class="w-full"
                    required
                    @focus="modelOpen = true"
                  />
                </PopoverAnchor>
                <PopoverContent
                  class="z-[110] w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width) p-0"
                  align="start"
                  @open-auto-focus.prevent
                >
                  <Command class="rounded-md border border-border bg-background" :filter-disabled="true">
                    <CommandList class="max-h-64 overflow-y-auto">
                      <CommandEmpty class="py-4 text-center text-sm text-muted-foreground">
                        {{ t('requestDetail.editVehicleModal.noModelFound') }}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          v-for="m in filteredModels"
                          :key="m"
                          :value="m"
                          class="cursor-pointer"
                          @select="selectModel(m)"
                        >
                          {{ m }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                {{ t('requestDetail.editVehicleModal.version') }}
              </Label>
              <Input
                v-model="form.version"
                type="text"
                class="w-full"
                :placeholder="t('requestDetail.editVehicleModal.placeholders.version')"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                <span class="text-destructive">*</span>
                {{ t('requestDetail.editVehicleModal.channel') }}
              </Label>
              <Select v-model="form.channel">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('requestDetail.editVehicleModal.placeholders.select')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in channelValues"
                    :key="opt"
                    :value="opt"
                  >
                    {{ channelLabel(opt) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                <span class="text-destructive">*</span>
                {{ t('requestDetail.editVehicleModal.origin') }}
              </Label>
              <Select v-model="form.origin">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('requestDetail.editVehicleModal.placeholders.select')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in originValues"
                    :key="opt"
                    :value="opt"
                  >
                    {{ originLabel(opt) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                {{ t('requestDetail.editVehicleModal.originDetail') }}
              </Label>
              <Select v-model="form.originDetail">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('requestDetail.editVehicleModal.placeholders.selectOptional')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="ORIGIN_DETAIL_NONE">
                    {{ t('requestDetail.editVehicleModal.none') }}
                  </SelectItem>
                  <SelectItem
                    v-for="opt in originDetailValues"
                    :key="opt"
                    :value="opt"
                  >
                    {{ originDetailLabel(opt) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="space-y-2 md:col-span-1">
              <Label class="block text-sm font-semibold text-foreground">
                <span class="text-destructive">*</span>
                {{ t('requestDetail.editVehicleModal.fiscalEntity') }}
              </Label>
              <Select v-model="form.fiscalEntity">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('requestDetail.editVehicleModal.placeholders.select')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in fiscalEntityValues"
                    :key="opt"
                    :value="opt"
                  >
                    {{ fiscalEntityLabel(opt) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2 md:col-span-1">
              <div class="flex items-center gap-1.5">
                <Label class="block text-sm font-semibold text-foreground">
                  <span class="text-destructive">*</span>
                  {{ t('requestDetail.editVehicleModal.dealership') }}
                </Label>
                <AlertTriangle
                  v-if="dealershipNeedsWarning"
                  class="size-4 shrink-0 text-amber-500"
                  :aria-label="t('requestDetail.editVehicleModal.dealershipWarningAria')"
                />
              </div>
              <Select v-model="form.dealership">
                <SelectTrigger class="w-full">
                  <SelectValue :placeholder="t('requestDetail.editVehicleModal.placeholders.select')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in dealershipValues"
                    :key="opt"
                    :value="opt"
                  >
                    {{ dealershipLabel(opt) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-2">
            <Label class="block text-sm font-semibold text-foreground">
              {{ t('requestDetail.editVehicleModal.staffNote') }}
            </Label>
            <Textarea
              v-model="form.staffNote"
              rows="3"
              class="min-h-20 w-full resize-y text-sm"
              :placeholder="t('requestDetail.editVehicleModal.placeholders.staffNote')"
            />
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            class="rounded-sm w-full sm:w-auto"
            :disabled="saving"
            @click="handleBack"
          >
            {{ t('requestDetail.editVehicleModal.back') }}
          </Button>
          <Button
            type="button"
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!isValid || saving"
            @click="handleSave"
          >
            {{ saving ? t('requestDetail.editVehicleModal.saving') : t('requestDetail.editVehicleModal.save') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AlertTriangle } from 'lucide-vue-next'
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Input,
  Label,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@motork/component-library/future/primitives'
import { VEHICLE_BRANDS, getModelsForBrand } from '@/constants/vehicleSuggestions'

const REQUEST_TYPE_VALUES = [
  'Generic sales',
  'Quotation',
  'Test Drive',
  'Financing',
  'Trade-in'
]

const ORIGIN_DETAIL_NONE = '__none__'

const CHANNEL_VALUES = [
  'Manual import',
  'Web',
  'Paid',
  'Showroom',
  'Organic',
  'Email',
  'WhatsApp'
]

const ORIGIN_VALUES = [
  'Web',
  'Walk-in',
  'Google Ads',
  'Autoscout24.es',
  'Phone',
  'Referral'
]

const ORIGIN_DETAIL_VALUES = ['Webspark', 'Showroom visit', 'Summer Campaign 2024', 'Organic search']

const FISCAL_ENTITY_VALUES = ['MotorK', 'MotorK EU', 'MotorK Iberia']

const DEALERSHIP_VALUES = ['Barcelona', 'Madrid', 'Munich', 'Rome', 'Paris', 'Amsterdam', 'Berlin']

const props = defineProps({
  show: { type: Boolean, required: true },
  vehicle: { type: Object, default: () => ({}) },
  requestContext: { type: Object, default: () => ({}) },
  requestMessage: { type: String, default: '' },
  dealershipNeedsWarning: { type: Boolean, default: false },
  saving: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'save'])

const { t } = useI18n()

const brandOpen = ref(false)
const modelOpen = ref(false)

const form = ref({
  requestType: '',
  vehicleType: 'New',
  price: '',
  quantity: 1,
  vehicleClass: 'Car',
  brand: '',
  model: '',
  version: '',
  channel: '',
  origin: '',
  originDetail: '',
  fiscalEntity: '',
  dealership: '',
  staffNote: ''
})

const requestTypeValues = computed(() => {
  const fromCtx = props.requestContext?.requestType
  const fromVehicle = props.vehicle?.requestType
  const extra = [fromCtx, fromVehicle].filter(Boolean)
  return [...new Set([...REQUEST_TYPE_VALUES, ...extra])]
})

const channelValues = computed(() => {
  const c = props.requestContext?.channel
  return c && !CHANNEL_VALUES.includes(c) ? [...CHANNEL_VALUES, c] : CHANNEL_VALUES
})

const originValues = computed(() => {
  const s = props.requestContext?.source
  return s && !ORIGIN_VALUES.includes(s) ? [...ORIGIN_VALUES, s] : ORIGIN_VALUES
})

const originDetailValues = computed(() => {
  const d = props.requestContext?.sourceDetails
  return d && !ORIGIN_DETAIL_VALUES.includes(d)
    ? [...ORIGIN_DETAIL_VALUES, d]
    : ORIGIN_DETAIL_VALUES
})

const fiscalEntityValues = computed(() => {
  const f = props.requestContext?.fiscalEntity
  return f && !FISCAL_ENTITY_VALUES.includes(f) ? [...FISCAL_ENTITY_VALUES, f] : FISCAL_ENTITY_VALUES
})

const dealershipValues = computed(() => {
  const d = props.vehicle?.dealership || props.requestContext?.dealership
  return d && !DEALERSHIP_VALUES.includes(d) ? [...DEALERSHIP_VALUES, d] : DEALERSHIP_VALUES
})

function requestTypeLabel(value) {
  const norm = String(value).toLowerCase().replace(/\s+/g, '')
  const map = {
    genericsales: 'requestDetail.editVehicleModal.requestTypes.genericSales',
    quotation: 'requestDetail.editVehicleModal.requestTypes.quotation',
    testdrive: 'requestDetail.editVehicleModal.requestTypes.testDrive',
    financing: 'requestDetail.editVehicleModal.requestTypes.financing',
    tradein: 'requestDetail.editVehicleModal.requestTypes.tradeIn'
  }
  const k = map[norm]
  return k ? t(k) : value
}

function channelLabel(value) {
  const keys = {
    'Manual import': 'requestDetail.editVehicleModal.channels.manualImport',
    Web: 'requestDetail.editVehicleModal.channels.web',
    Paid: 'requestDetail.editVehicleModal.channels.paid',
    Showroom: 'requestDetail.editVehicleModal.channels.showroom',
    Organic: 'requestDetail.editVehicleModal.channels.organic',
    Email: 'requestDetail.editVehicleModal.channels.email',
    WhatsApp: 'requestDetail.editVehicleModal.channels.whatsapp'
  }
  const k = keys[value]
  return k ? t(k) : value
}

function originLabel(value) {
  const keys = {
    Web: 'requestDetail.editVehicleModal.origins.web',
    'Walk-in': 'requestDetail.editVehicleModal.origins.walkIn',
    'Google Ads': 'requestDetail.editVehicleModal.origins.googleAds',
    'Autoscout24.es': 'requestDetail.editVehicleModal.origins.autoscout',
    Phone: 'requestDetail.editVehicleModal.origins.phone',
    Referral: 'requestDetail.editVehicleModal.origins.referral'
  }
  const k = keys[value]
  return k ? t(k) : value
}

function originDetailLabel(value) {
  const keys = {
    Webspark: 'requestDetail.editVehicleModal.originDetails.webspark',
    'Showroom visit': 'requestDetail.editVehicleModal.originDetails.showroomVisit',
    'Summer Campaign 2024': 'requestDetail.editVehicleModal.originDetails.summerCampaign',
    'Organic search': 'requestDetail.editVehicleModal.originDetails.organicSearch'
  }
  const k = keys[value]
  return k ? t(k) : value
}

function fiscalEntityLabel(value) {
  if (value === 'MotorK') return t('requestDetail.editVehicleModal.fiscalEntities.motorK')
  if (value === 'MotorK EU') return t('requestDetail.editVehicleModal.fiscalEntities.motorKEu')
  if (value === 'MotorK Iberia') return t('requestDetail.editVehicleModal.fiscalEntities.motorKIberia')
  return value
}

function dealershipLabel(value) {
  return value
}

const filteredBrands = computed(() => {
  const q = (form.value.brand || '').trim().toLowerCase()
  if (!q) return VEHICLE_BRANDS
  return VEHICLE_BRANDS.filter((b) => b.toLowerCase().includes(q))
})

const filteredModels = computed(() => {
  const brand = (form.value.brand || '').trim()
  const models = brand ? getModelsForBrand(brand) : []
  const q = (form.value.model || '').trim().toLowerCase()
  if (!q) return models
  return models.filter((m) => m.toLowerCase().includes(q))
})

function selectBrand(b) {
  form.value.brand = b
  brandOpen.value = false
}

function selectModel(m) {
  form.value.model = m
  modelOpen.value = false
}

function syncFormFromProps() {
  const v = props.vehicle || {}
  const r = props.requestContext || {}
  const status = String(v.status || '').toLowerCase()
  const vehicleType = status === 'used' ? 'Used' : 'New'
  const rawDetail = (r.sourceDetails || '').trim()
  form.value = {
    requestType: r.requestType || v.requestType || '',
    vehicleType,
    price: v.price != null && v.price !== '' ? String(v.price) : '',
    quantity: v.quantity != null && v.quantity !== '' ? Number(v.quantity) : 1,
    vehicleClass: v.vehicleClass || 'Car',
    brand: (v.brand || '').trim(),
    model: (v.model || '').trim(),
    version: String(v.variant || v.trim || v.engineLine || '').trim(),
    channel: r.channel || '',
    origin: r.source || '',
    originDetail: rawDetail || ORIGIN_DETAIL_NONE,
    fiscalEntity: r.fiscalEntity || '',
    dealership: (v.dealership || r.dealership || '').trim(),
    staffNote: (v.staffNote || '').trim()
  }
}

watch(
  () => [props.show, props.vehicle, props.requestContext],
  () => {
    if (props.show) syncFormFromProps()
  },
  { deep: true }
)

const isValid = computed(() => {
  const f = form.value
  const qty = Number(f.quantity)
  return (
    !!(f.requestType || '').trim() &&
    Number.isFinite(qty) &&
    qty >= 1 &&
    !!(f.brand || '').trim() &&
    !!(f.model || '').trim() &&
    !!(f.channel || '').trim() &&
    !!(f.origin || '').trim() &&
    !!(f.fiscalEntity || '').trim() &&
    !!(f.dealership || '').trim()
  )
})

function handleOpenChange(open) {
  emit('update:open', open)
}

function handleBack() {
  emit('update:open', false)
}

function buildPayload() {
  const v = props.vehicle || {}
  const f = form.value
  const preservedRequestMessage = (props.requestMessage || v.requestMessage || '').trim()
  const isNew = f.vehicleType === 'New'
  const priceNum = f.price === '' || f.price == null ? null : Number(f.price)
  const carData = {
    ...v,
    brand: f.brand.trim(),
    model: f.model.trim(),
    variant: f.version.trim() || undefined,
    trim: f.version.trim() || undefined,
    quantity: Number(f.quantity) || 1,
    vehicleClass: f.vehicleClass,
    requestType: f.requestType,
    requestMessage: preservedRequestMessage,
    staffNote: f.staffNote.trim(),
    dealership: f.dealership.trim(),
    status: isNew ? 'New' : 'Used',
    kilometers: isNew ? 0 : Number(v.kilometers ?? v.mileage ?? 0) || 0
  }
  if (priceNum != null && !Number.isNaN(priceNum)) carData.price = priceNum
  else delete carData.price
  if (!f.version.trim()) {
    delete carData.variant
    delete carData.trim
  }
  return {
    requestedCar: carData,
    channel: f.channel,
    source: f.origin,
    sourceDetails:
      !f.originDetail || f.originDetail === ORIGIN_DETAIL_NONE ? '' : f.originDetail,
    fiscalEntity: f.fiscalEntity,
    requestType: f.requestType,
    requestMessage: preservedRequestMessage
  }
}

function handleSave() {
  if (!isValid.value) return
  emit('save', buildPayload())
}
</script>
