<template>
  <div
    class="flex flex-col gap-4 overflow-hidden rounded-lg bg-background p-4 shadow-mk-dashboard-card"
  >
    <div class="flex w-full min-w-0 flex-col-reverse items-start gap-3 sm:flex-row-reverse">
        <div
          class="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-md sm:w-2/5 lg:w-1/2"
          :class="usesLogoImage ? 'flex items-center justify-center border border-black/5 bg-white' : 'bg-muted'"
        >
          <img
            v-if="resolvedImageUrl && !imageError"
            :src="resolvedImageUrl"
            :alt="titleLine"
            :class="usesLogoImage ? 'size-24 bg-white object-contain' : 'h-full w-full object-cover'"
            @error="handleImageError"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <Car class="size-10 text-muted-foreground" />
          </div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
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
          <div class="mt-auto flex min-w-0 flex-col gap-1.5">
            <span
              v-if="conditionBadge"
              class="inline-flex w-fit shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-sm leading-5 text-foreground"
              :class="conditionBadgeClass"
            >
              {{ conditionBadge }}
            </span>
            <div class="flex min-w-0 flex-wrap items-center gap-2">
              <a
                v-if="listingHref && !isNewVehicle"
                :href="listingHref"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-w-0 max-w-full items-center gap-1 rounded-sm text-base font-medium leading-5 text-primary outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <span class="min-w-0 truncate">{{ titleLine }}</span>
              </a>
              <p
                v-else
                class="min-w-0 max-w-full truncate text-base font-medium leading-5"
                :class="isNewVehicle ? 'text-foreground' : 'text-primary'"
              >
                {{ titleLine }}
              </p>
            </div>
            <p
              v-if="trimLine && !isNewVehicle"
              class="w-full text-sm leading-4 text-muted-foreground"
            >
              {{ trimLine }}
            </p>
            <div
              v-if="plateDisplay && !isNewVehicle"
              class="mt-1 flex max-w-full flex-wrap items-center gap-2"
            >
              <div
                class="inline-flex w-fit max-w-full self-start items-center gap-1 overflow-hidden rounded-sm border border-black/5 bg-background py-0.5 pl-0.5 pr-2 shadow-sm"
              >
                <span
                  class="h-4 w-1.5 shrink-0 rounded-bl-sm rounded-tl-sm bg-primary"
                  aria-hidden
                />
                <span
                  class="truncate whitespace-nowrap text-sm font-semibold leading-4 text-foreground"
                >
                  {{ plateDisplay }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="savedStaffNoteText && !isNewVehicle"
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

      <div class="flex w-full flex-col gap-2 pt-2">
        <div
          v-if="vehicleLocationDisplay && !isNewVehicle"
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
          v-if="mileageDetailLine && !isNewVehicle"
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
          v-if="registrationDateDisplay && !isNewVehicle"
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
          v-if="hasInteractionMetrics && !isNewVehicle"
          class="flex w-full items-center justify-between gap-3"
        >
          <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
            t('requestDetail.vehicleCard.interactions')
          }}</span>
          <TooltipProvider :delay-duration="200">
            <Tooltip>
              <TooltipTrigger as-child>
                <div
                  class="group flex shrink-0 cursor-help flex-wrap items-center justify-end gap-4 rounded-sm px-1 py-0.5 text-sm leading-5 text-foreground outline-none transition-colors hover:bg-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  tabindex="0"
                  :aria-label="interactionMetricsTooltip"
                >
                  <span
                    v-if="metricsFunnelCount != null"
                    class="inline-flex items-center gap-1"
                  >
                    <Filter class="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                    {{ metricsFunnelCount }}
                  </span>
                  <span
                    v-if="metricsTagCount != null"
                    class="inline-flex items-center gap-1"
                  >
                    <Tag class="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                    {{ metricsTagCount }}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="end" class="max-w-xs">
                {{ interactionMetricsTooltip }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div
        v-if="!isNewVehicle && !hideRequestMessage && (requestMessage || source)"
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
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@motork/component-library/future/primitives'
import { Car, Filter, Pencil, Tag } from 'lucide-vue-next'
import EditRequestedVehicleModal from '@/components/modals/EditRequestedVehicleModal.vue'
import {
  getCarImageUrl,
  getVehicleConditionBadgeClass,
  getVehicleConditionLabel,
  translateVehicleConditionLabel
} from '@/utils/vehicleHelpers'

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

watch(
  () => [props.vehicle, props.imageUrl],
  () => {
    imageError.value = false
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

const conditionBadgeRaw = computed(() => getVehicleConditionLabel(props.vehicle))

const conditionBadge = computed(() =>
  translateVehicleConditionLabel(conditionBadgeRaw.value, t)
)

const conditionBadgeClass = computed(() =>
  getVehicleConditionBadgeClass(conditionBadgeRaw.value)
)

const isNewVehicle = computed(
  () => String(conditionBadgeRaw.value || '').toLowerCase() === 'new'
)

const isBmwNewVehicle = computed(
  () =>
    isNewVehicle.value && String(props.vehicle.brand || '').toLowerCase() === 'bmw'
)

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
  if (isNewVehicle.value) return t('requestDetail.vehicleCard.stockToBeOrder')
  const raw = (props.stockStatus || props.vehicle?.carStatus || '').trim()
  if (!raw) return ''
  const key = raw.toLowerCase().replace(/\s+/g, '')
  if (key === 'instock')
    return t('requestDetail.vehicleCard.stockInStock')
  if (key === 'notinstock')
    return t('requestDetail.vehicleCard.stockNotInStock')
  if (key === 'tobeorder' || key === 'tobeordered' || key === 'toorder')
    return t('requestDetail.vehicleCard.stockToBeOrder')
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

const interactionMetricsTooltip = computed(() =>
  t('requestDetail.vehicleCard.interactionMetricsTooltip', {
    leads: props.metricsFunnelCount ?? 0,
    opportunities: props.metricsTagCount ?? 0
  })
)

const plateDisplay = computed(
  () => props.vehicle.plateNumber || props.vehicle.plate || props.vehicle.plates || ''
)

const usesLogoImage = computed(
  () =>
    isBmwNewVehicle.value ||
    props.vehicle.imageDisplayMode === 'logo' ||
    props.vehicle.imageType === 'logo'
)

const resolvedImageUrl = computed(() => {
  if (usesLogoImage.value) {
    return props.imageUrl || getCarImageUrl(props.vehicle) || '/brands/bmw-white.svg'
  }
  return props.imageUrl || getCarImageUrl(props.vehicle)
})

const registrationDateDisplay = computed(() => {
  const r =
    props.vehicle.registrationDate ||
    props.vehicle.registration ||
    props.vehicle.firstRegistration
  return r || ''
})

const vehicleLocationDisplay = computed(() => {
  return props.vehicle.dealership || props.vehicle.location || props.vehicle.city || ''
})

const mileageDetailLine = computed(() => {
  const km = props.vehicle.kilometers ?? props.vehicle.mileage
  if (km == null || km === '') return ''
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Number(km))} km`
})

const handleImageError = () => {
  imageError.value = true
}
</script>
