<template>
  <Card class="w-full mb-6 shadow-mk-dashboard-card">
    <CardHeader class="px-4 md:px-6 py-3 border-b border-border">
        <div class="flex flex-row items-center justify-between gap-2 md:gap-4">
          <!-- Left: Request title with chips (when request data exists) -->
          <div v-if="showRequestSection" class="flex items-center gap-2 shrink-0 flex-wrap">
            <div class="flex items-center gap-2">
              <Pin class="w-3 h-3 shrink-0 text-muted-foreground" />
              <h3 class="font-bold text-foreground text-sm">Request</h3>
            </div>
            <div class="flex items-center gap-1.5">
              <span 
                class="px-2 py-0.5 rounded text-xs font-medium border"
                :class="entityType === 'lead' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-purple-50 text-purple-700 border-purple-200'"
              >
                {{ entityType === 'lead' ? 'Lead' : 'Opportunity' }}
              </span>
              <span 
                class="px-2 py-0.5 rounded text-xs font-medium border"
                :class="stageColorClass"
              >
                {{ stage }}
              </span>
              <Badge
                v-if="deliverySubstatus"
                :text="deliverySubstatus"
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
          </div>
          <div v-else></div>

          <!-- Right: Owner -->
          <div class="flex items-center gap-2">
            <span class="hidden md:inline text-xs text-muted-foreground font-medium">Owner</span>
            <Button
              @click="$emit('reassign')"
              variant="link"
              size="small"
              class="text-xs font-bold"
            >
              {{ owner }}
            </Button>
          </div>
        </div>
    </CardHeader>

    <!-- Request Details Section (shown when request data exists) -->
    <CardContent v-if="showRequestSection" class="p-4 md:p-6">
        <!-- Car details (if car exists) -->
        <div v-if="hasCar" class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-20 h-14 bg-surfaceTertiary rounded-lg overflow-hidden shrink-0 border border-border">
                <img v-if="carImage" :src="carImage" alt="Car" class="w-full h-full object-cover">
                <Car v-else class="w-8 h-8 shrink-0 text-muted-foreground" />
              </div>
              <div>
                <div class="font-bold text-foreground text-base md:text-lg mb-2">{{ carBrand }} {{ carModel }} ({{ carYear }})</div>
                <div class="flex items-center gap-2 flex-wrap">
                  <div 
                    v-if="stockDays !== undefined && stockDays !== null"
                    class="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-md"
                  >
                    <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div> In stock ({{ stockDays }} days)
                  </div>
                  <div 
                    v-else-if="hasCar"
                    class="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-md"
                  >
                    <div class="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Out of stock
                  </div>
                  <div
                    v-if="vehicleCondition"
                    class="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-md"
                  >
                    {{ vehicleCondition }}
                  </div>
                  <div
                    v-if="vin"
                    class="inline-flex items-center min-w-0 max-w-36 px-2 py-1 bg-muted text-muted-foreground text-xs font-mono rounded-md"
                    :title="`VIN: ${vin}`"
                  >
                    <span class="truncate block min-w-0">VIN: {{ vin }}</span>
                  </div>
                  <!-- Source next to stock availability -->
                  <div v-if="source" class="inline-flex items-center gap-1.5 px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-md">
                    <span class="text-xs text-muted-foreground font-medium">Source:</span>
                    <span class="text-xs font-bold text-foreground">{{ source }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="carPrice" class="text-right">
              <div class="text-xs text-muted-foreground font-medium mb-1">Price</div>
              <div class="font-bold text-foreground text-lg">€ {{ formatCurrency(carPrice) }}</div>
            </div>
          </div>

          <!-- Request message (when car exists) -->
          <div v-if="requestMessage" class="pt-2">
            <div class="text-xs text-muted-foreground font-medium mb-2">Request Message</div>
            <div class="bg-muted border border-border rounded-lg p-3">
              <p class="text-sm text-muted-foreground leading-relaxed">{{ requestMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Request-only display (no car but request data exists) -->
        <div v-else class="space-y-3">
          <div v-if="requestMessage" class="bg-muted border border-border rounded-lg p-3">
            <div class="text-xs text-muted-foreground font-medium mb-2">Request Message</div>
            <p class="text-sm text-muted-foreground leading-relaxed">{{ requestMessage }}</p>
          </div>
        </div>
      
      <!-- Separator and toggle button (only show if there are expandable details) -->
      <div v-if="hasExpandableDetails" class="border-t border-border">
        <button
          @click="isExpanded = !isExpanded"
          class="w-full p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <span class="font-medium">{{ isExpanded ? 'Hide' : 'View' }} Details</span>
          <ChevronDown 
            class="w-3 h-3 shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': isExpanded }"
          />
        </button>
      </div>
      
      <!-- Expandable details -->
      <div v-if="isExpanded && hasExpandableDetails" class="border-t border-border p-6 bg-muted/30 text-sm animate-fade-in">
        <!-- REQUEST DETAILS -->
        <div class="mb-6">
          <h4 class="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-4">REQUEST DETAILS</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
            <div v-if="source">
              <div class="text-xs text-muted-foreground mb-1">Source</div>
              <div class="font-medium text-muted-foreground">{{ source }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">Source details</div>
              <div class="font-medium" :class="sourceDetails ? 'text-muted-foreground' : 'text-muted-foreground'">{{ sourceDetails || '--' }}</div>
            </div>
            <div v-if="dealership">
              <div class="text-xs text-muted-foreground mb-1">Dealership</div>
              <div class="font-medium text-muted-foreground">{{ dealership }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">Channel</div>
              <div class="font-medium text-muted-foreground">{{ channel || 'Email' }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">AdCampaign</div>
              <div class="font-medium" :class="adCampaign ? 'text-muted-foreground' : 'text-muted-foreground'">{{ adCampaign || '--' }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">AdMedium</div>
              <div class="font-medium" :class="adMedium ? 'text-muted-foreground' : 'text-muted-foreground'">{{ adMedium || '--' }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">AdSource</div>
              <div class="font-medium" :class="adSource ? 'text-muted-foreground' : 'text-muted-foreground'">{{ adSource || '--' }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">Expected purchase date</div>
              <div class="font-medium" :class="expectedPurchaseDate ? 'text-muted-foreground' : 'text-muted-foreground'">{{ expectedPurchaseDate || '--' }}</div>
            </div>
            <div>
              <div class="text-xs text-muted-foreground mb-1">Fiscal entity</div>
              <div class="font-medium" :class="fiscalEntity ? 'text-muted-foreground' : 'text-muted-foreground'">{{ fiscalEntity || '--' }}</div>
            </div>
          </div>
        </div>
        
        <!-- VEHICLE DETAILS (only if car exists) -->
        <div v-if="hasCar">
          <div class="border-t border my-4"></div>
          <div>
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-xs font-bold uppercase text-muted-foreground tracking-wider">VEHICLE DETAILS</h4>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
              <div v-if="registration">
                <div class="text-xs text-muted-foreground mb-1">Registration</div>
                <div class="font-medium text-muted-foreground">{{ registration }}</div>
              </div>
              <div v-if="kilometers !== undefined && kilometers !== null">
                <div class="text-xs text-muted-foreground mb-1">Kilometers</div>
                <div class="font-medium text-muted-foreground">{{ formatNumber(kilometers) }} Km</div>
              </div>
              <div v-if="fuelType">
                <div class="text-xs text-muted-foreground mb-1">Fuel type</div>
                <div class="font-medium text-muted-foreground">{{ fuelType }}</div>
              </div>
              <div v-if="gearType">
                <div class="text-xs text-muted-foreground mb-1">Gear type</div>
                <div class="font-medium text-muted-foreground">{{ gearType }}</div>
              </div>
              <div v-if="vin">
                <div class="text-xs text-muted-foreground mb-1">VIN Number</div>
                <div class="font-mono text-xs bg-surface border border-border px-2 py-1 rounded inline-block text-muted-foreground">
                  {{ vin }}
                </div>
              </div>
              <div v-if="dealership">
                <div class="text-xs text-muted-foreground mb-1">Dealership</div>
                <div class="font-medium text-muted-foreground">{{ dealership }}</div>
              </div>
            </div>
            <div v-if="showTechnicalSpecs" class="mt-6 flex justify-end">
              <Button
                variant="outline"
                size="small"
                class="flex items-center gap-2"
              >
                <ListChecks class="w-3 h-3 shrink-0 inline" /> View technical specs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { Pin, Car, ListChecks, ChevronDown } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { Badge, Button, Card, CardHeader, CardContent } from '@motork/component-library/future/primitives'
import { getDeliverySubstatusColor, getStageColor } from '@/utils/stageMapper'
import { DEFAULT_CAR_IMAGE } from '@/utils/mockDataHelpers'
import { calculateDaysSince } from '@/utils/formatters'
import { getLatestOffer } from '@/utils/activityHelpers'

const props = defineProps({
  // Stage/Owner/Source props
  stage: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: ''
  },
  deliverySubstatus: {
    type: String,
    default: null
  },
  activities: {
    type: Array,
    default: () => []
  },
  entityType: {
    type: String,
    default: 'opportunity' // 'lead' or 'opportunity'
  },
  // Request/Vehicle props
  requestType: {
    type: String,
    default: ''
  },
  requestMessage: {
    type: String,
    default: ''
  },
  requestedCar: {
    type: Object,
    default: null
  },
  task: {
    type: Object,
    default: null
  }
})

defineEmits(['reassign'])

const isExpanded = ref(false)

// Computed properties for Stage/Owner/Source functionality
const substatusColorClass = computed(() => {
  if (!props.deliverySubstatus) return ''
  return getDeliverySubstatusColor(props.deliverySubstatus)
})

const substatusTheme = computed(() => {
  if (!props.deliverySubstatus) return 'gray'
  if (props.deliverySubstatus === 'Delivered') return 'green'
  if (props.deliverySubstatus === 'Awaiting Delivery') return 'blue'
  return 'gray'
})

const stageColorClass = computed(() => {
  return getStageColor(props.stage, props.entityType)
})

// Compute negotiation badge for "In Negotiation" stage
const negotiationBadge = computed(() => {
  if (props.stage !== 'In Negotiation') return null
  
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

// Computed properties for request/vehicle data
const hasCar = computed(() => {
  return props.requestedCar && props.requestedCar.brand && props.requestedCar.model
})

const showRequestSection = computed(() => {
  return props.requestType || props.requestMessage || hasCar.value
})

const carBrand = computed(() => {
  return props.requestedCar?.brand || ''
})

const carModel = computed(() => {
  return props.requestedCar?.model || ''
})

const carYear = computed(() => {
  return props.requestedCar?.year || ''
})

const carImage = computed(() => {
  const img = props.requestedCar?.image || ''
  return img || (hasCar.value ? DEFAULT_CAR_IMAGE : '')
})

const carPrice = computed(() => {
  return props.requestedCar?.price || null
})

const stockDays = computed(() => {
  return props.requestedCar?.stockDays !== undefined ? props.requestedCar.stockDays : null
})

const dealership = computed(() => {
  return props.requestedCar?.dealership || props.task?.dealership || ''
})

const registration = computed(() => {
  return props.requestedCar?.registration || ''
})

const kilometers = computed(() => {
  return props.requestedCar?.kilometers !== undefined ? props.requestedCar.kilometers : null
})

const fuelType = computed(() => {
  return props.requestedCar?.fuelType || ''
})

const gearType = computed(() => {
  return props.requestedCar?.gearType || ''
})

const vin = computed(() => {
  return props.requestedCar?.vin || ''
})

// Vehicle condition display (same logic as TasksTableView: Km0, New, or Used)
const vehicleCondition = computed(() => {
  const v = props.requestedCar
  if (!v) return null
  const status = v.status || ''
  const km = v.kilometers
  if (km === 0 || (typeof km === 'number' && km < 1) || status === 'New') {
    return (status && status.toLowerCase() === 'new') || km === 0 ? 'Km0' : 'New'
  }
  return status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Used'
})

const channel = computed(() => {
  return 'Email' // Default, could be enhanced if task has channel field
})

const adCampaign = computed(() => {
  return props.task?.sourceDetails || props.requestedCar?.adCampaign || ''
})

const expectedPurchaseDate = computed(() => {
  return props.requestedCar?.expectedPurchaseDate || ''
})

const fiscalEntity = computed(() => {
  return props.task?.fiscalEntity || ''
})

const sourceDetails = computed(() => {
  return props.task?.sourceDetails || ''
})

const adMedium = computed(() => {
  return props.requestedCar?.adMedium || ''
})

const adSource = computed(() => {
  return props.requestedCar?.adSource || ''
})

const showOpenAd = computed(() => {
  return true
})

const showTechnicalSpecs = computed(() => {
  return true
})

const hasExpandableDetails = computed(() => {
  // Show expandable section if there are request details or vehicle details to show
  return hasCar.value || props.requestType || props.source || sourceDetails.value || 
         adCampaign.value || expectedPurchaseDate.value || fiscalEntity.value ||
         adMedium.value || adSource.value
})

// Formatting functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US').format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value)
}
</script>
