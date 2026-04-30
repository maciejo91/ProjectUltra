<template>
  <div
    class="flex flex-col gap-4 overflow-hidden rounded-lg border border-border bg-background p-4 shadow-mk-dashboard-card"
  >
    <div class="flex w-full min-w-0 items-center gap-2">
      <h3 class="min-w-0 flex-1 text-base font-medium leading-6 text-foreground">
        {{ displayHeading }}
      </h3>
      <Button
        v-if="canEditVehicle && !showEditModal"
        type="button"
        variant="secondary"
        size="icon-sm"
        class="shrink-0"
        :aria-label="t('requestDetail.vehicleCard.editAria')"
        @click="openVehicleEditModal"
      >
        <Pencil class="size-3 opacity-70" />
      </Button>
    </div>

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
            <span
              v-if="conditionBadge"
              class="inline-flex shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-sm leading-5 text-foreground"
              :class="conditionBadgeClass"
            >
              {{ conditionBadge }}
            </span>
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
          </div>
          <p
            v-if="trimLine"
            class="w-full text-sm leading-4 text-muted-foreground"
          >
            {{ trimLine }}
          </p>
        </div>
      </div>

      <div
        v-if="savedStaffNoteText"
        class="flex w-full min-w-0 flex-col gap-2 border-t border-border pt-3"
      >
        <div
          class="flex w-full min-w-0 flex-col gap-1.5 rounded-md bg-muted px-3 py-2.5"
          role="note"
        >
          <span class="text-sm font-medium text-muted-foreground">{{
            t('requestDetail.vehicleCard.staffNoteLabel')
          }}</span>
          <p
            class="text-sm leading-snug text-foreground wrap-break-word whitespace-pre-wrap"
            :class="noteExpanded ? '' : 'line-clamp-2'"
          >
            {{ savedStaffNoteText }}
          </p>
          <Button
            v-if="staffNoteNeedsExpandToggle"
            type="button"
            variant="link"
            size="sm"
            class="h-auto self-start p-0 text-sm font-medium text-primary"
            @click="noteExpanded = !noteExpanded"
          >
            {{
              noteExpanded
                ? t('requestDetail.vehicleCard.collapseNote')
                : t('requestDetail.vehicleCard.expandNote')
            }}
          </Button>
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

    <EditRequestedVehicleModal
      :show="showEditModal"
      :vehicle="vehicle"
      :request-context="requestContext"
      :request-message="resolvedRequestMessage"
      :dealership-needs-warning="dealershipNeedsWarning"
      :saving="vehicleModalSaving"
      @update:open="(v) => (showEditModal = v)"
      @save="handleEditModalSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@motork/component-library/future/primitives'
import { ArrowUpRight, Car, Filter, Pencil, Tag } from 'lucide-vue-next'
import EditRequestedVehicleModal from '@/components/modals/EditRequestedVehicleModal.vue'
import { getVehicleConditionBadgeClass, getVehicleConditionLabel } from '@/utils/vehicleHelpers'

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
  },
  requestContext: {
    type: Object,
    default: () => ({})
  },
  dealershipNeedsWarning: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['open-ad', 'more-actions', 'remove-vehicle', 'save'])

const { t } = useI18n()

const displayHeading = computed(
  () => props.heading || t('requestDetail.vehicleCard.title')
)

const imageError = ref(false)
const showEditModal = ref(false)
const vehicleModalSaving = ref(false)
const noteExpanded = ref(false)

const canEditVehicle = computed(() => typeof props.saveRequestedCar === 'function')

const resolvedRequestMessage = computed(() =>
  (props.requestMessage ?? props.vehicle?.requestMessage ?? '').trim()
)

const savedStaffNoteText = computed(() => (props.vehicle?.staffNote ?? '').trim())

const staffNoteNeedsExpandToggle = computed(() => {
  const s = savedStaffNoteText.value
  if (!s) return false
  if (s.length > 140) return true
  const lines = s.split(/\r?\n/)
  return lines.length > 2 || (lines.length === 2 && (lines[0].length > 70 || lines[1].length > 70))
})

watch(
  () => [props.vehicle, props.vehicle?.staffNote],
  () => {
    if (!staffNoteNeedsExpandToggle.value) {
      noteExpanded.value = false
    }
  },
  { immediate: true }
)

function openVehicleEditModal() {
  noteExpanded.value = false
  showEditModal.value = true
}

async function handleEditModalSave(payload) {
  vehicleModalSaving.value = true
  try {
    if (props.saveRequestedCar) {
      await props.saveRequestedCar(payload)
      showEditModal.value = false
      noteExpanded.value = false
    } else {
      emit('save', payload)
      showEditModal.value = false
      noteExpanded.value = false
    }
  } catch {
    // Parent handler shows error feedback
  } finally {
    vehicleModalSaving.value = false
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

const conditionBadge = computed(() => getVehicleConditionLabel(props.vehicle))

const conditionBadgeClass = computed(() =>
  getVehicleConditionBadgeClass(conditionBadge.value)
)

const handleImageError = () => {
  imageError.value = true
}
</script>
