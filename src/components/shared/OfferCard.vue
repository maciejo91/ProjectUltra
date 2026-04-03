<template>
  <div
    :class="[
      'bg-white border rounded-lg shadow-nsc-card overflow-visible transition-shadow relative',
      getOfferBorderClass(offer),
      getOfferOpacityClass(offer),
      containerClass,
      { 'pointer-events-none opacity-60': loading }
    ]"
  >
    <!-- Loading Overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-muted-foreground">Updating...</span>
      </div>
    </div>
    <!-- Status Badge -->
    <div
      v-if="showStatusBadge && !(isAccepted && showAcceptanceBadge)"
      class="absolute top-1 left-1 z-10 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider"
      :class="getStatusBadgeClass(offer.status)"
    >
      {{ getStatusLabel(offer.status) }}
    </div>
    
    <!-- 3-dot Menu Button -->
    <div v-if="showMenu" class="absolute top-1 right-1 z-30">
      <button
        :ref="el => setButtonRef(offer.id, el)"
        @click.stop="toggleMenu(offer.id)"
        title="Offer actions"
        class="relative z-30 w-6 h-6 flex items-center justify-center text-foreground hover:bg-black/10 bg-white/60 backdrop-blur-sm rounded-md transition-colors shadow-sm border border-black/5"
      >
        <MoreVertical :size="14" />
      </button>
    </div>
    
    <!-- Dropdown Menu (Teleported outside to avoid clipping) -->
    <teleport to="body" v-if="showMenu">
      <div 
        v-if="openMenuId === offer.id && menuPosition[offer.id]"
        v-click-outside="closeMenu"
        class="fixed z-[9999] bg-white border border-black/10 rounded-lg shadow-nsc-card py-1"
        :style="{
          top: `${menuPosition[offer.id].top}px`,
          left: `${menuPosition[offer.id].left}px`,
          width: `${menuPosition[offer.id].width}px`,
          minWidth: '120px'
        }"
        @click.stop
      >
        <button
          v-for="menuItem in menuItems"
          :key="menuItem.key"
          @click="() => { menuItem.onClick(); closeMenu(); }"
          class="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
          style="font-size: 0.75rem; line-height: 1.5;"
        >
          {{ menuItem.label }}
        </button>
      </div>
    </teleport>
    
    <!-- Vehicle Image -->
    <div :class="['w-full bg-muted flex items-center justify-center overflow-hidden', imageHeightClass]">
      <img 
        v-if="offer.data?.image || offer.image" 
        :src="offer.data?.image || offer.image" 
        alt="Vehicle" 
        class="w-full h-full object-cover"
      >
      <Car v-else class="w-4 h-4 shrink-0 text-muted-foreground" />
    </div>
    
    <!-- Offer Details -->
    <div :class="['flex flex-col', detailsPaddingClass, detailsHeightClass, { 'pb-10': isAccepted }]">
      <!-- Vehicle Info -->
      <div class="flex-1 space-y-1">
        <h4 :class="['font-bold text-foreground leading-tight line-clamp-2', titleSizeClass]">
          {{ getVehicleDisplayName(offer) }}
        </h4>
        <p :class="['font-bold text-foreground', priceSizeClass]">€ {{ formatCurrency(getOfferPrice(offer)) }}</p>
        
        <!-- Ingredient Badges -->
        <div class="flex flex-wrap gap-1 mt-1">
          <div v-if="offer.data?.selectedFinancingLabel" class="flex items-center gap-0.5 px-1 py-0.5 bg-purple-50 text-purple-700 text-[8px] font-bold rounded border border-purple-100 uppercase tracking-tighter" :title="offer.data.selectedFinancingLabel">
            <BadgePercent :size="8" />
            <span>Financing</span>
          </div>
          <div v-if="offer.data?.tradeIn?.valuation > 0" class="flex items-center gap-0.5 px-1 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-bold rounded border border-blue-100 uppercase tracking-tighter" :title="offer.data.selectedTradeInLabel || 'Trade-in'">
            <CarFront :size="8" />
            <span>Trade-in</span>
          </div>
        </div>
      </div>
      
      <!-- Date & Acceptance info at bottom -->
      <div class="mt-auto pt-1">
        <p v-if="showDate && offer.createdAt && !(isAccepted && showAcceptanceBadge)" :class="['text-muted-foreground', dateSizeClass]">
          {{ formatDate(offer.createdAt) }}
        </p>
      </div>
    </div>
    
    <!-- Acceptance Badge (bottom overlay, if accepted) -->
    <div
      v-if="showAcceptanceBadge && isAccepted"
      class="absolute bottom-0 left-0 right-0 z-10 bg-green-600/90 text-white text-[10px] font-medium px-2 py-1.5 flex items-center justify-between pointer-events-none"
    >
      <span class="flex items-center gap-1">
        <CheckCircle class="w-4 h-4 shrink-0" />
        Accepted
      </span>
      <span v-if="getAcceptanceDate()" class="opacity-90">
        {{ formatDate(getAcceptanceDate()) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import { MoreVertical, Wallet, CarFront, BadgePercent, Car, CheckCircle } from 'lucide-vue-next'

const props = defineProps({
  offer: {
    type: Object,
    required: true
  },
  // Display options
  variant: {
    type: String,
    default: 'carousel', // 'carousel' | 'feed'
    validator: (value) => ['carousel', 'feed'].includes(value)
  },
  showStatusBadge: {
    type: Boolean,
    default: true
  },
  showMenu: {
    type: Boolean,
    default: true
  },
  showDate: {
    type: Boolean,
    default: true
  },
  showAcceptanceInfo: {
    type: Boolean,
    default: true
  },
  showAcceptanceBadge: {
    type: Boolean,
    default: true
  },
  // Menu configuration
  menuItems: {
    type: Array,
    default: () => []
  },
  // Custom classes
  containerClass: {
    type: String,
    default: ''
  },
  // Loading state
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['menu-action'])

const openMenuId = ref(null)
const buttonRefs = ref({})
const menuPosition = ref({})

const isAccepted = computed(() => props.offer.status === 'accepted' || props.offer.acceptance_status === 'accepted')

// Computed classes based on variant
const imageHeightClass = computed(() => {
  return props.variant === 'carousel' ? 'h-16' : 'h-16'
})

const detailsPaddingClass = computed(() => {
  return props.variant === 'carousel' ? 'p-2' : 'p-3'
})

const detailsHeightClass = computed(() => {
  return props.variant === 'carousel' ? 'h-[105px]' : ''
})

const titleSizeClass = computed(() => {
  return props.variant === 'carousel' ? 'text-sm' : 'text-sm'
})

const priceSizeClass = computed(() => {
  return props.variant === 'carousel' ? 'text-sm' : 'text-sm'
})

const dateSizeClass = computed(() => {
  return props.variant === 'carousel' ? 'text-sm' : 'text-sm'
})

const setButtonRef = (offerId, el) => {
  if (el) {
    buttonRefs.value[offerId] = el
  }
}

const calculateMenuWidth = () => {
  if (props.menuItems.length === 0) return 120
  
  const tempEl = document.createElement('span')
  tempEl.style.visibility = 'hidden'
  tempEl.style.position = 'absolute'
  tempEl.style.fontSize = '0.75rem'
  tempEl.style.padding = '0 12px'
  tempEl.style.whiteSpace = 'nowrap'
  document.body.appendChild(tempEl)
  
  let maxWidth = 0
  props.menuItems.forEach(item => {
    tempEl.textContent = item.label
    const width = tempEl.offsetWidth
    if (width > maxWidth) {
      maxWidth = width
    }
  })
  
  document.body.removeChild(tempEl)
  
  return Math.max(maxWidth + 24, 120)
}

const updateMenuPosition = (offerId) => {
  const button = buttonRefs.value[offerId]
  if (!button) return
  
  const rect = button.getBoundingClientRect()
  const menuWidth = calculateMenuWidth()
  
  menuPosition.value[offerId] = {
    top: rect.bottom + 4,
    left: rect.right - menuWidth,
    width: menuWidth
  }
}

const toggleMenu = async (offerId) => {
  if (openMenuId.value === offerId) {
    openMenuId.value = null
    delete menuPosition.value[offerId]
  } else {
    openMenuId.value = offerId
    await nextTick()
    updateMenuPosition(offerId)
  }
}

const closeMenu = () => {
  openMenuId.value = null
  menuPosition.value = {}
}

// Update position on scroll/resize when menu is open
let scrollHandler = null
let resizeHandler = null

watch(openMenuId, (newId) => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler, true)
    window.removeEventListener('resize', resizeHandler)
    scrollHandler = null
    resizeHandler = null
  }
  
  if (newId) {
    const updatePosition = () => {
      if (newId && buttonRefs.value[newId]) {
        updateMenuPosition(newId)
      }
    }
    
    scrollHandler = updatePosition
    resizeHandler = updatePosition
    
    window.addEventListener('scroll', scrollHandler, true)
    window.addEventListener('resize', resizeHandler)
  }
})

const formatCurrency = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Active',
    'accepted': 'Accepted',
    'archived': 'Archived'
  }
  return labels[status] || 'Active'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'active': 'bg-blue-600',
    'accepted': 'bg-green-600',
    'archived': 'bg-gray-600'
  }
  return classes[status] || 'bg-gray-600'
}

const getOfferBorderClass = (offer) => {
  if (isAccepted.value) {
    return 'border-green-500 border-2'
  }
  return 'border-border'
}

const getOfferOpacityClass = (offer) => {
  if (offer.status === 'archived') {
    return 'opacity-60'
  }
  return ''
}

const getVehicleDisplayName = (offer) => {
  const brand = offer.vehicleBrand || ''
  const model = offer.vehicleModel || ''
  const year = offer.vehicleYear || ''
  
  if (brand && model && year) {
    return `${brand} ${model} (${year})`
  }
  if (brand && model) {
    return `${brand} ${model}`
  }
  return 'Vehicle'
}

const getOfferPrice = (offer) => {
  return offer.price || 0
}

const getAcceptanceDate = () => {
  // Check multiple possible fields for acceptance date, similar to ContractCard pattern
  return props.offer.acceptance_date || props.offer.acceptedAt || props.offer.accepted_at || null
}
</script>
