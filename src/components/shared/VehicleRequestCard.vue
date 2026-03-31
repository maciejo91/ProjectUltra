<template>
  <div
    class="flex flex-col gap-4 overflow-hidden rounded-lg bg-background p-4 shadow-nsc-card"
  >
    <div class="flex w-full min-w-0 items-center gap-2">
      <h3 class="min-w-0 flex-1 text-base font-medium leading-6 text-foreground">
        {{ displayHeading }}
      </h3>
      <div class="flex shrink-0 items-center gap-1">
        <Button
          v-if="!isEditing && showLandingRow"
          type="button"
          variant="outline"
          size="small"
          class="h-7 shrink-0 gap-1 rounded-md px-2 text-xs font-medium"
          @click="handleVisitLanding"
        >
          {{ t('requestDetail.vehicleCard.visit') }}
          <ArrowUpRight class="size-3" />
        </Button>
        <Button
          v-if="!isEditing"
          variant="secondary"
          size="icon-sm"
          class="shrink-0 rounded-md"
          :aria-label="t('requestDetail.vehicleCard.editAria')"
          @click="startEditing"
        >
          <Pencil class="size-4 text-muted-foreground" />
        </Button>
      </div>
    </div>

    <template v-if="!isEditing">
      <div class="flex w-full items-start gap-2">
        <div class="h-9 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
          <img
            v-if="imageUrl && !imageError"
            :src="imageUrl"
            :alt="titleLine"
            class="h-full w-full object-cover"
            @error="handleImageError"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <Car class="size-6 text-muted-foreground" />
          </div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <div class="flex w-full items-center gap-1 text-sm leading-5 text-foreground">
            <p class="min-w-0 flex-1 truncate">{{ titleLine }}</p>
            <p class="shrink-0 whitespace-nowrap text-right">{{ priceLine }}</p>
          </div>
          <p
            v-if="subtitleLine"
            class="w-full text-xs leading-4 text-muted-foreground"
          >
            {{ subtitleLine }}
          </p>
        </div>
      </div>

      <div
        v-if="plateDisplay || vinDisplay"
        class="flex w-full flex-wrap items-center gap-4"
      >
        <div
          v-if="plateDisplay"
          class="inline-flex max-w-full items-center gap-1 overflow-hidden rounded-sm border border-border bg-background py-0.5 pl-0.5 pr-1 shadow-nsc-card"
        >
          <span
            class="h-4 w-1.5 shrink-0 rounded-bl-sm rounded-tl-sm bg-[#0470e9]"
            aria-hidden
          />
          <span class="text-xs font-semibold leading-4 text-foreground whitespace-nowrap">
            {{ plateDisplay }}
          </span>
        </div>
        <p
          v-if="vinDisplay"
          class="min-w-0 max-w-full truncate text-xs text-muted-foreground"
        >
          {{ vinDisplay }}
        </p>
      </div>

      <div
        v-if="conditionBadge || fuelLabel || mileageBadgeShort"
        class="flex w-full flex-wrap items-center gap-2"
      >
        <span
          v-if="conditionBadge"
          class="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-sm leading-5 text-foreground"
          :class="conditionBadgeClass"
        >
          {{ conditionBadge }}
        </span>
        <span
          v-if="fuelLabel"
          class="inline-flex items-center justify-center rounded-md bg-muted px-2 py-0.5 text-sm leading-5 text-muted-foreground"
        >
          {{ fuelLabel }}
        </span>
        <span
          v-if="mileageBadgeShort"
          class="inline-flex items-center justify-center rounded-md bg-muted px-2 py-0.5 text-sm leading-5 text-muted-foreground"
        >
          {{ mileageBadgeShort }}
        </span>
      </div>

      <div class="flex w-full flex-col gap-2">
        <div
          v-if="registrationDateDisplay"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground"
            >{{ t('requestDetail.vehicleCard.registrationDate') }}</span
          >
          <span
            class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
            >{{ registrationDateDisplay }}</span
          >
        </div>
        <div
          v-if="vehicleLocationDisplay"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground"
            >{{ t('requestDetail.vehicleCard.carLocation') }}</span
          >
          <span
            class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
            >{{ vehicleLocationDisplay }}</span
          >
        </div>
        <div
          v-if="mileageDetailLine"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground"
            >{{ t('requestDetail.vehicleCard.mileage') }}</span
          >
          <span
            class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
            >{{ mileageDetailLine }}</span
          >
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
          <div v-if="source" class="flex shrink-0 items-center text-xs">
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
              class="h-auto p-0 text-xs font-medium text-primary underline underline-offset-2 hover:opacity-90"
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
          <Label class="text-xs font-medium text-muted-foreground">Brand</Label>
          <Input
            v-model="editForm.brand"
            type="text"
            placeholder="e.g. BMW"
            class="h-8 text-sm"
          />
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-medium text-muted-foreground">Model</Label>
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
          <Label class="text-xs font-medium text-muted-foreground">Year</Label>
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
          <Label class="text-xs font-medium text-muted-foreground">Price (€)</Label>
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
          <Label class="text-xs font-medium text-muted-foreground">Condition</Label>
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
          <Label class="text-xs font-medium text-muted-foreground">Mileage (km)</Label>
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
import { ArrowUpRight, Car, Pencil } from 'lucide-vue-next'

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

const subtitleLine = computed(() => {
  const v = props.vehicle
  return v?.variant || v?.trim || v?.engineLine || ''
})

const priceLine = computed(() => {
  const p = props.vehicle.price
  if (p == null || p === '') return '—'
  const n = typeof p === 'string' ? parseFloat(p) : p
  if (Number.isNaN(n)) return '—'
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(n)}€`
})

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

const fuelLabel = computed(() => props.vehicle.fuelType || '')

const mileageBadgeShort = computed(() => {
  const v = props.vehicle
  if (v.stockDistanceKm != null && v.stockDistanceKm !== '') {
    return `${Number(v.stockDistanceKm)} km`
  }
  const km = v.kilometers ?? v.mileage
  if (km == null || km === '') return ''
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Number(km))} km`
})

const showLandingRow = computed(
  () => !!(props.sourceUrl || props.vehicle.listingUrl || props.source)
)

function handleVisitLanding() {
  const url = props.sourceUrl || props.vehicle.listingUrl
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  } else {
    emit('open-ad')
  }
}

const handleImageError = () => {
  imageError.value = true
}
</script>
