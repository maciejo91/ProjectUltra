<template>
  <div
    class="flex flex-col gap-4 overflow-hidden rounded-lg bg-background p-4"
  >
    <div class="flex w-full min-w-0 items-center gap-2">
      <h3 class="min-w-0 flex-1 text-base font-medium leading-6 text-foreground">
        {{ displayHeading }}
      </h3>
      <Button
        v-if="!isEditing"
        type="button"
        variant="secondary"
        size="icon-sm"
        class="shrink-0"
        :aria-label="t('requestDetail.vehicleCard.editAria')"
        @click="startEditing"
      >
        <Pencil class="size-3 opacity-70" />
      </Button>
    </div>

    <template v-if="!isEditing">
      <div class="flex w-full min-w-0 items-start gap-3">
        <div
          class="w-[90px] shrink-0 overflow-hidden rounded-md bg-muted aspect-4/3"
        >
          <img
            v-if="imageUrl && !imageError"
            :src="imageUrl"
            :alt="titleLine"
            class="h-full w-full object-cover"
            @error="handleImageError"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <Car class="size-10 text-muted-foreground" />
          </div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <a
              v-if="listingHref"
              :href="listingHref"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-w-0 max-w-full items-center gap-1 rounded-sm text-sm font-medium leading-5 text-primary outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span class="min-w-0 truncate">{{ titleLine }}</span>
              <span
                class="inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-primary hover:bg-muted"
                aria-hidden
              >
                <ArrowUpRight class="size-4 opacity-80" />
              </span>
            </a>
            <p
              v-else
              class="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-foreground"
            >
              {{ titleLine }}
            </p>
            <span
              v-if="conditionBadge"
              class="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-sm leading-5 text-foreground"
              :class="conditionBadgeClass"
            >
              {{ conditionBadge }}
            </span>
          </div>
          <p
            v-if="trimLine"
            class="w-full text-sm leading-4 text-muted-foreground"
          >
            {{ trimLine }}
          </p>
        </div>
      </div>

      <div class="flex w-full flex-col gap-2">
        <div
          v-if="stockStatusDisplay"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
            t('requestDetail.vehicleCard.status')
          }}</span>
          <span
            class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
            >{{ stockStatusDisplay }}</span
          >
        </div>
        <div
          v-if="vehicleLocationDisplay"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
            t('requestDetail.vehicleCard.dealership')
          }}</span>
          <span
            class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
            >{{ vehicleLocationDisplay }}</span
          >
        </div>
        <div class="flex w-full items-center justify-between gap-3">
          <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
            t('requestDetail.vehicleCard.price')
          }}</span>
          <span
            class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
            >{{ priceLine }}</span
          >
        </div>
        <div
          v-if="specificationLine"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
            t('requestDetail.vehicleCard.specification')
          }}</span>
          <span
            class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
            >{{ specificationLine }}</span
          >
        </div>
        <div
          v-if="mileageDetailLine"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
            t('requestDetail.vehicleCard.mileage')
          }}</span>
          <span
            class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
            >{{ mileageDetailLine }}</span
          >
        </div>
        <div
          v-if="registrationDateDisplay"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
            t('requestDetail.vehicleCard.registrationDate')
          }}</span>
          <span
            class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
            >{{ registrationDateDisplay }}</span
          >
        </div>
        <div
          v-if="hasInteractionMetrics"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
            t('requestDetail.vehicleCard.interactions')
          }}</span>
          <div
            class="flex shrink-0 flex-wrap items-center justify-end gap-4 text-sm leading-5 text-foreground"
          >
            <span
              v-if="metricsFunnelCount != null"
              class="inline-flex items-center gap-1"
            >
              <Filter class="size-4 shrink-0 text-muted-foreground" aria-hidden />
              {{ metricsFunnelCount }}
            </span>
            <span
              v-if="metricsTagCount != null"
              class="inline-flex items-center gap-1"
            >
              <Tag class="size-4 shrink-0 text-muted-foreground" aria-hidden />
              {{ metricsTagCount }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="plateDisplay || vinDisplay"
        class="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
      >
        <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
          t('requestDetail.vehicleCard.identity')
        }}</span>
        <div
          class="flex min-w-0 w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-1"
        >
          <div
            v-if="plateDisplay"
            class="inline-flex max-w-full items-center gap-1 overflow-hidden rounded-sm border border-border bg-background py-0.5 pl-0.5 pr-2"
          >
            <span
              class="h-4 w-1.5 shrink-0 rounded-bl-sm rounded-tl-sm bg-primary"
              aria-hidden
            />
            <span
              class="whitespace-nowrap text-sm font-semibold leading-4 text-foreground"
            >
              {{ plateDisplay }}
            </span>
          </div>
          <div
            v-if="vinDisplay"
            class="inline-flex min-w-0 max-w-full items-center overflow-hidden rounded-sm border border-border bg-background px-2 py-0.5"
          >
            <span
              class="truncate font-mono text-sm leading-4 text-foreground"
              >{{ vinDisplay }}</span
            >
          </div>
        </div>
      </div>

      <div
        v-if="!hideRequestMessage && (requestMessage || source)"
        class="flex flex-col gap-2 border-t border-border pt-4"
      >
        <div class="flex flex-wrap items-start gap-2">
          <p
            v-if="requestMessage"
            class="min-w-0 flex-1 text-sm leading-5 text-foreground"
          >
            "{{ requestMessage }}"
          </p>
          <div v-if="source" class="flex shrink-0 items-center text-sm">
            <a
              v-if="sourceUrl"
              :href="sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="font-medium text-primary underline underline-offset-2 hover:opacity-90"
            >
              {{ source }}
            </a>
            <Button
              v-else
              variant="link"
              size="small"
              class="h-auto p-0 text-sm font-medium text-primary underline underline-offset-2 hover:opacity-90"
              @click="$emit('open-ad')"
            >
              {{ source }}
            </Button>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col gap-3">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">Brand</Label>
          <Input
            v-model="editForm.brand"
            type="text"
            placeholder="e.g. BMW"
            class="h-8 text-sm"
          />
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">Model</Label>
          <Input
            v-model="editForm.model"
            type="text"
            placeholder="e.g. 3 Series"
            class="h-8 text-sm"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">Year</Label>
          <Input
            v-model.number="editForm.year"
            type="number"
            min="1900"
            :max="new Date().getFullYear() + 1"
            placeholder="2024"
            class="h-8 text-sm"
          />
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">Price (€)</Label>
          <Input
            v-model.number="editForm.price"
            type="number"
            min="0"
            step="1000"
            placeholder="Optional"
            class="h-8 text-sm"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">Condition</Label>
          <Select v-model="editForm.condition">
            <SelectTrigger class="h-8 text-sm">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Km0">Km0</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Used">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-muted-foreground">Mileage (km)</Label>
          <Input
            v-model.number="editForm.kilometers"
            type="number"
            min="0"
            placeholder="0"
            class="h-8 text-sm"
          />
        </div>
      </div>
      <div class="flex gap-2 pt-1">
        <Button variant="outline" size="small" class="flex-1" @click="cancelEditing">
          Cancel
        </Button>
        <Button
          variant="default"
          size="small"
          class="flex-1"
          :disabled="saveDisabled || saving"
          @click="saveEdit"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@motork/component-library/future/primitives'
import { ArrowUpRight, Car, Filter, Pencil, Tag } from 'lucide-vue-next'

const props = defineProps({
  vehicle: {
    type: Object,
    required: true
  },
  requestMessage: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: ''
  },
  sourceUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  saveRequestedCar: {
    type: Function,
    default: null
  },
  hideRequestMessage: {
    type: Boolean,
    default: false
  },
  heading: {
    type: String,
    default: ''
  },
  stockStatus: {
    type: String,
    default: ''
  },
  metricsFunnelCount: {
    type: Number,
    default: undefined
  },
  metricsTagCount: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits(['open-ad', 'more-actions', 'edit-vehicle', 'remove-vehicle', 'save'])

const { t } = useI18n()

const displayHeading = computed(
  () => props.heading || t('requestDetail.vehicleCard.title')
)

const imageError = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const editForm = ref({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  price: null,
  condition: 'Used',
  kilometers: null
})

watch(
  () => [props.vehicle, props.requestMessage],
  () => {
    if (!isEditing.value) resetEditForm()
  },
  { immediate: true }
)

function getConditionFromVehicle(v) {
  if (!v) return 'Used'
  const km = v.kilometers ?? v.mileage
  const status = (v.status || '').toLowerCase()
  if (km === 0 || (typeof km === 'number' && km < 1)) return 'Km0'
  if (status === 'new') return 'New'
  return 'Used'
}

function resetEditForm() {
  const v = props.vehicle
  editForm.value = {
    brand: v?.brand || '',
    model: v?.model || '',
    year: v?.year ?? new Date().getFullYear(),
    price: v?.price ?? null,
    condition: getConditionFromVehicle(v),
    kilometers: v?.kilometers ?? v?.mileage ?? null
  }
}

const saveDisabled = computed(
  () =>
    !(editForm.value.brand ?? '').trim() ||
    !(editForm.value.model ?? '').trim() ||
    !editForm.value.year ||
    editForm.value.year < 1900
)

function startEditing() {
  resetEditForm()
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

async function saveEdit() {
  if (saveDisabled.value) return
  const carData = {
    brand: (editForm.value.brand ?? '').trim(),
    model: (editForm.value.model ?? '').trim(),
    year: editForm.value.year,
    requestType: props.vehicle?.requestType || 'Quotation'
  }
  if (editForm.value.price != null && editForm.value.price !== '') carData.price = Number(editForm.value.price)
  if (props.vehicle?.requestMessage) carData.requestMessage = props.vehicle.requestMessage
  if (props.vehicle?.image) carData.image = props.vehicle.image
  const cond = editForm.value.condition || 'Used'
  if (cond === 'Km0' || cond === 'New') {
    carData.status = 'New'
    carData.kilometers = 0
  } else {
    carData.status = 'Used'
    carData.kilometers =
      editForm.value.kilometers != null ? Number(editForm.value.kilometers) : 0
  }

  saving.value = true
  try {
    if (props.saveRequestedCar) {
      await props.saveRequestedCar(carData)
      isEditing.value = false
    } else {
      emit('save', carData)
      isEditing.value = false
    }
  } finally {
    saving.value = false
  }
}

const titleLine = computed(() => {
  const parts = []
  if (props.vehicle.brand) parts.push(props.vehicle.brand)
  if (props.vehicle.model) parts.push(props.vehicle.model)
  return parts.join(' ') || '—'
})

const trimLine = computed(() => {
  const v = props.vehicle
  const line = v?.trim || v?.variant || v?.engineLine || ''
  return typeof line === 'string' ? line.trim() : ''
})

const priceLine = computed(() => {
  const p = props.vehicle.price
  if (p == null || p === '') return '—'
  const n = typeof p === 'string' ? parseFloat(p) : p
  if (Number.isNaN(n)) return '—'
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(n)}€`
})

const listingHref = computed(
  () => props.sourceUrl || props.vehicle?.listingUrl || ''
)

const stockStatusDisplay = computed(() => {
  const raw = (props.stockStatus || props.vehicle?.carStatus || '').trim()
  if (!raw) return ''
  const key = raw.toLowerCase().replace(/\s+/g, '')
  if (key === 'instock')
    return t('requestDetail.vehicleCard.stockInStock')
  if (key === 'notinstock')
    return t('requestDetail.vehicleCard.stockNotInStock')
  return raw
})

const specificationLine = computed(() => {
  const v = props.vehicle
  const fuel = (v?.fuelType || '').trim()
  const gear = (v?.gearType || v?.transmission || '').trim()
  if (fuel && gear) return `${fuel} - ${gear}`
  return fuel || gear || ''
})

const hasInteractionMetrics = computed(
  () =>
    props.metricsFunnelCount != null || props.metricsTagCount != null
)

const plateDisplay = computed(
  () => props.vehicle.plateNumber || props.vehicle.plate || ''
)

const vinDisplay = computed(() => props.vehicle.vin || '')

const registrationDateDisplay = computed(() => {
  const r =
    props.vehicle.registrationDate ||
    props.vehicle.registration ||
    props.vehicle.firstRegistration
  return r || ''
})

const vehicleLocationDisplay = computed(
  () =>
    props.vehicle.dealership ||
    props.vehicle.location ||
    props.vehicle.city ||
    ''
)

const mileageDetailLine = computed(() => {
  const km = props.vehicle.kilometers ?? props.vehicle.mileage
  if (km == null || km === '') return ''
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Number(km))} km`
})

const vehicleCondition = computed(() => {
  const v = props.vehicle
  if (!v) return null
  const status = (v.status || '').toLowerCase()
  const km = v.kilometers ?? v.mileage
  if (km === 0 || (typeof km === 'number' && km < 1) || status === 'new') {
    return status === 'new' || km === 0 ? 'Km0' : 'New'
  }
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Used'
})

const conditionBadge = computed(() => vehicleCondition.value)

const conditionBadgeClass = computed(() => {
  const c = (conditionBadge.value || '').toLowerCase()
  if (c === 'used') return 'bg-yellow-400 text-foreground'
  if (c === 'km0' || c === 'new') return 'bg-emerald-100 text-emerald-900'
  return 'bg-muted text-muted-foreground'
})

const handleImageError = () => {
  imageError.value = true
}
</script>
