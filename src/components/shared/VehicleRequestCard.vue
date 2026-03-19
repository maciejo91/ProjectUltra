<template>
  <div class="overflow-hidden p-4 rounded-lg bg-white shadow-nsc-card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-medium text-foreground leading-6">Requested Car</h3>
      <Button
        v-if="!isEditing"
        variant="ghost"
        size="icon"
        class="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Edit requested car"
        @click="startEditing"
      >
        <Pencil class="size-3.5" />
      </Button>
    </div>

    <!-- View mode -->
    <template v-if="!isEditing">
      <div class="flex gap-4">
        <div
          class="w-24 shrink-0 aspect-3/2 rounded-lg overflow-hidden bg-muted"
        >
          <img
            v-if="imageUrl && !imageError"
            :src="imageUrl"
            :alt="`${vehicle.brand} ${vehicle.model}`"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
          >
            <Car :size="32" class="text-muted-foreground" />
          </div>
        </div>

        <div class="min-w-0 flex-1 flex flex-col justify-center">
          <p class="text-sm font-semibold text-foreground truncate">
            {{ vehicleNameWithYear }}
          </p>
          <div
            v-if="vehicle.price"
            class="flex items-center gap-2 mt-1 text-sm text-foreground flex-wrap"
          >
            <span v-if="vehicle.price" class="font-semibold">
              €{{ formatPrice(vehicle.price) }}
            </span>
          </div>
          <div
            v-if="vehicleCondition || displayMileage || vehicle.fuelType || vehicle.gearType"
            class="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground"
          >
            <span
              v-if="vehicleCondition"
              class="inline-flex px-2 py-0.5 rounded font-medium bg-muted text-muted-foreground"
            >
              {{ vehicleCondition }}
            </span>
            <span v-if="vehicle.fuelType">{{ vehicle.fuelType }}</span>
            <span v-if="vehicle.gearType">{{ vehicle.gearType }}</span>
            <span v-if="displayMileage">{{ formatMileage(displayMileage) }} km</span>
          </div>
        </div>
      </div>

      <!-- Request message with source link -->
      <div v-if="requestMessage || source" class="mt-4 pt-4 border-t border-border">
        <div class="flex items-start gap-2 flex-wrap">
          <p v-if="requestMessage" class="text-sm text-foreground leading-5 flex-1 min-w-0">
            "{{ requestMessage }}"
          </p>
          <div v-if="source" class="flex items-center shrink-0 text-xs">
            <a
              v-if="sourceUrl"
              :href="sourceUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary underline underline-offset-2 hover:opacity-90 font-medium"
            >
              {{ source }}
            </a>
            <Button
              v-else
              variant="link"
              size="small"
              class="text-primary underline underline-offset-2 hover:opacity-90 p-0 h-auto font-medium text-xs"
              @click="$emit('open-ad')"
            >
              {{ source }}
            </Button>
          </div>
        </div>
      </div>
    </template>

    <!-- Edit mode: inline form -->
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
        <Button
          variant="outline"
          size="small"
          class="flex-1"
          @click="cancelEditing"
        >
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
import { Car, Pencil } from 'lucide-vue-next'

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
  /** Optional URL for the source; when set, source is rendered as a real link opening in new tab */
  sourceUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  /** Optional: async function to persist requested car; card awaits and keeps saving state until done */
  saveRequestedCar: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['open-ad', 'more-actions', 'edit-vehicle', 'remove-vehicle', 'save'])

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
    carData.kilometers = editForm.value.kilometers != null ? Number(editForm.value.kilometers) : 0
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

const vehicleName = computed(() => {
  const parts = []
  if (props.vehicle.brand) parts.push(props.vehicle.brand)
  if (props.vehicle.model) parts.push(props.vehicle.model)
  if (props.vehicle.variant) parts.push(props.vehicle.variant)
  return parts.join(' ') || 'Vehicle Details'
})

const vehicleNameWithYear = computed(() => {
  const name = vehicleName.value
  return props.vehicle.year ? `${name} (${props.vehicle.year})` : name
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

const displayMileage = computed(() => {
  const v = props.vehicle
  return v?.kilometers ?? v?.mileage
})

const formatPrice = (price) => {
  if (!price) return '0'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numPrice)
}

const formatMileage = (mileage) => {
  if (!mileage) return '0'
  const numMileage = typeof mileage === 'string' ? parseFloat(mileage) : mileage
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numMileage)
}

const handleImageError = () => {
  imageError.value = true
}
</script>
