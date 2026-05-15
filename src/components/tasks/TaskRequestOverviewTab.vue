<template>
  <div class="rounded-lg flex flex-col h-full bg-muted">
    <!-- Title Section -->
    <div class="px-4 py-4 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2">
        <Car class="w-4 h-4 shrink-0 text-foreground" />
        <h2 class="text-base font-medium text-foreground leading-6">Requested Car</h2>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground font-medium">Owner:</span>
        <button 
          @click="$emit('reassign')"
          class="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          {{ task.assignee }}
        </button>
      </div>
    </div>

    <!-- Card Content -->
    <div class="bg-white rounded-lg p-4 shadow-nsc-card flex flex-col flex-1">

      <!-- Badges Row -->
      <div class="flex items-center gap-2 flex-wrap mb-3">
        <span 
          class="px-2 py-1 rounded text-sm font-medium border"
          :class="entityType === 'lead' 
            ? 'bg-blue-50 text-blue-700 border-blue-200' 
            : 'bg-purple-50 text-purple-700 border-purple-200'"
        >
          {{ entityType === 'lead' ? 'Lead' : 'Opportunity' }}
        </span>
        <span 
          class="px-2 py-1 rounded text-sm font-medium border"
          :class="stageColorClass"
        >
          {{ task.displayStage || task.stage }}
        </span>
        <Badge
          v-if="task.deliverySubstatus"
          :text="task.deliverySubstatus"
          size="small"
          :theme="substatusTheme"
        />
        <Badge
          v-if="negotiationBadge"
          :text="negotiationBadge.label"
          size="small"
          :theme="negotiationBadge.theme"
        />
      </div>

      <!-- Vehicle Info (if available) -->
      <div v-if="hasCar" class="space-y-3">
        <div class="flex items-center gap-3">
          <div
            class="w-32 aspect-4/3 rounded-lg overflow-hidden shrink-0"
            :class="usesLogoImage ? 'flex items-center justify-center border border-black/5 bg-white' : 'bg-surfaceTertiary'"
          >
            <img
              v-if="carImage"
              :src="carImage"
              alt="Car"
              :class="usesLogoImage ? 'size-16 object-contain' : 'w-full h-full object-cover'"
            >
            <Car v-else class="size-9 shrink-0 text-muted-foreground" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span
                v-if="carCondition"
                class="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-sm font-medium leading-5 text-foreground"
                :class="carConditionBadgeClass"
              >
                {{ carCondition }}
              </span>
              <span class="font-bold text-foreground text-sm">{{ carBrand }} {{ carModel }} ({{ carYear }})</span>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <div 
                v-if="stockDays !== undefined && stockDays !== null"
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-sm font-semibold rounded"
              >
                <div class="w-1 h-1 bg-green-500 rounded-full"></div> In stock ({{ stockDays }} days)
              </div>
              <div 
                v-else
                class="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-sm font-semibold rounded"
              >
                <div class="w-1 h-1 bg-orange-500 rounded-full"></div> Out of stock
              </div>
            </div>
            <div
              v-if="carMileage !== null || carFuelType || carGearType"
              class="flex gap-3 mt-0.5 text-sm text-muted-foreground"
            >
              <span v-if="carMileage !== null">{{ formatMileage(carMileage) }} km</span>
              <span v-if="carFuelType">{{ carFuelType }}</span>
              <span v-if="carGearType">{{ carGearType }}</span>
            </div>
          </div>
          <div v-if="carPrice" class="text-right">
            <div class="text-sm text-muted-foreground font-medium">Price</div>
            <div class="font-bold text-foreground text-sm">€ {{ formatCurrency(carPrice) }}</div>
          </div>
        </div>
        <div class="flex justify-end pt-2">
          <Button
            :label="task.requestedCar ? '+ Add or update' : '+ Add or update'"
            variant="outline"
            size="small"
            @click="$emit('add-requested-car')"
            class="text-sm"
          />
        </div>
      </div>
      
      <!-- No car message with add button -->
      <div v-else class="flex flex-col items-center justify-center py-8 text-center">
        <Car class="w-12 h-12 shrink-0 text-muted-foreground mb-3" />
        <p class="text-sm text-muted-foreground mb-4">No requested car added yet</p>
        <Button
          label="+ Add or update"
          variant="outline"
          size="small"
          @click="$emit('add-requested-car')"
        />
      </div>

      <!-- Same card as request details page: Generic sales, Source, Channel, Fiscal entity, Dealership, Created date -->
      <LeadOpportunityDetailsCard
        :request="task"
        :show-assignee-bar="false"
        class="mt-3"
      />
      <RequestMessageCard
        v-if="showRequestMessageCard"
        class="mt-3"
        :title="t('requestDetail.messageCard.title')"
        :message="task.requestMessage || task.requestedCar?.requestMessage || ''"
        :utm-source="requestAttribution.utmSource"
        :utm-term="requestAttribution.utmTerm"
        :utm-campaign="requestAttribution.utmCampaign"
        :web-spark-campaign="requestAttribution.webSparkCampaign"
        :advertisement-url="requestAttribution.advertisementUrl"
        :original-email-url="requestAttribution.originalEmailUrl"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Car } from 'lucide-vue-next'
import { Badge, Button } from '@motork/component-library/future/primitives'
import LeadOpportunityDetailsCard from '@/components/shared/LeadOpportunityDetailsCard.vue'
import RequestMessageCard from '@/components/requests/RequestMessageCard.vue'
import { getRequestAttributionProps } from '@/utils/requestAttribution'
import { getCarImageUrl, getVehicleConditionBadgeClass, getVehicleConditionLabel } from '@/utils/vehicleHelpers'
import { getStageColor } from '@/utils/stageMapper'
import { calculateDaysSince } from '@/utils/formatters'
import { getLatestOffer } from '@/utils/activityHelpers'

const { t } = useI18n()

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  entityType: {
    type: String,
    default: 'opportunity' // 'lead' or 'opportunity'
  },
  activities: {
    type: Array,
    default: () => []
  }
})

defineEmits(['reassign', 'add-requested-car'])

// Computed properties for car data
const hasCar = computed(() => {
  return props.task.requestedCar && props.task.requestedCar.brand && props.task.requestedCar.model
})

const carBrand = computed(() => props.task.requestedCar?.brand || '')
const carModel = computed(() => props.task.requestedCar?.model || '')
const carYear = computed(() => props.task.requestedCar?.year || '')
const carCondition = computed(() => getVehicleConditionLabel(props.task.requestedCar))

const isBmwNewVehicle = computed(
  () =>
    String(carCondition.value || '').toLowerCase() === 'new' &&
    String(props.task.requestedCar?.brand || '').toLowerCase() === 'bmw'
)

const usesLogoImage = computed(
  () =>
    isBmwNewVehicle.value ||
    props.task.requestedCar?.imageDisplayMode === 'logo' ||
    props.task.requestedCar?.imageType === 'logo'
)

const carImage = computed(() => getCarImageUrl(props.task.requestedCar) || '')
const carPrice = computed(() => props.task.requestedCar?.price || null)
const stockDays = computed(() => props.task.requestedCar?.stockDays !== undefined ? props.task.requestedCar.stockDays : null)

const requestAttribution = computed(() => getRequestAttributionProps(props.task))

const showRequestMessageCard = computed(() => {
  const r = props.task
  if (!r) return false
  const msg = (r.requestMessage || r.requestedCar?.requestMessage || '').trim()
  if (msg) return true
  if (r.utmSource || r.utmTerm || r.utmCampaign || r.webSparkCampaign) return true
  if (r.originalMessageUrl) return true
  if (r.requestedCar?.listingUrl || r.sourceUrl) return true
  if (r.requestedCar?.adSource || r.requestedCar?.adCampaign) return true
  if (r.requestedCar?.adMedium || r.requestedCar?.webSparkCampaign) return true
  return false
})

// Mileage - support both kilometers (mock) and mileage
const carMileage = computed(() => {
  const v = props.task.requestedCar
  const val = v?.kilometers ?? v?.mileage
  return val !== undefined && val !== null ? val : null
})

const carConditionBadgeClass = computed(() => getVehicleConditionBadgeClass(carCondition.value))

const carFuelType = computed(() => props.task.requestedCar?.fuelType || '')
const carGearType = computed(() => props.task.requestedCar?.gearType || '')

// Stage color class
const stageColorClass = computed(() => {
  return getStageColor(props.task.displayStage || props.task.stage, props.entityType)
})

// Delivery substatus theme
const substatusTheme = computed(() => {
  if (!props.task.deliverySubstatus) return 'gray'
  if (props.task.deliverySubstatus === 'Delivered') return 'green'
  if (props.task.deliverySubstatus === 'Awaiting Delivery') return 'blue'
  return 'gray'
})

// Compute negotiation badge for "In Negotiation" stage
const negotiationBadge = computed(() => {
  if ((props.task.displayStage || props.task.stage) !== 'In Negotiation') return null
  
  const latestOffer = getLatestOffer(props.activities)
  if (!latestOffer) return null
  
  const daysSinceOffer = calculateDaysSince(latestOffer.timestamp)
  
  if (daysSinceOffer < 1) {
    return {
      label: 'New Offer',
      theme: 'orange'
    }
  } else if (daysSinceOffer < 3) {
    return {
      label: 'Active',
      theme: 'yellow'
    }
  }
  
  return null
})

// Formatting functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US').format(value)
}

const formatMileage = (mileage) => {
  if (mileage == null) return '0'
  const num = typeof mileage === 'string' ? parseFloat(mileage) : mileage
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)
}
</script>
