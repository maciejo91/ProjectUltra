<template>
  <div
    :class="[
      'bg-white border rounded-lg shadow-nsc-card overflow-visible transition-shadow relative',
      getContractBorderClass(contract),
      getContractOpacityClass(contract),
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
      v-if="showStatusBadge && !(isSigned && showSignedBadge)"
      class="absolute top-1 left-1 z-10 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider"
      :class="getStatusBadgeClass(contract.status)"
    >
      {{ getStatusLabel(contract.status) }}
    </div>
    
    <!-- 3-dot Menu Button -->
    <div v-if="showMenu" class="absolute top-1 right-1 z-30">
      <button
        :ref="el => setButtonRef(contractId, el)"
        @click.stop="toggleMenu(contractId)"
        title="Contract actions"
        class="relative z-30 w-6 h-6 flex items-center justify-center text-foreground hover:bg-black/10 bg-white/60 backdrop-blur-sm rounded-md transition-colors shadow-sm border border-black/5"
      >
        <MoreVertical :size="14" />
      </button>
    </div>
    
    <!-- Dropdown Menu (Teleported outside to avoid clipping) -->
    <teleport to="body" v-if="showMenu">
      <div 
        v-if="openMenuId === contractId && menuPosition[contractId]"
        v-click-outside="closeMenu"
        class="fixed z-[9999] bg-white border border-black/10 rounded-lg shadow-nsc-card py-1"
        :style="{
          top: `${menuPosition[contractId].top}px`,
          left: `${menuPosition[contractId].left}px`,
          width: `${menuPosition[contractId].width}px`,
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
    
    <!-- Contract Icon/Preview Section -->
    <div :class="['w-full bg-muted flex items-center justify-center overflow-hidden', imageHeightClass]">
      <FileSignature class="w-4 h-4 shrink-0 text-muted-foreground" />
    </div>
    
    <!-- Contract Details -->
    <div :class="['flex flex-col', detailsPaddingClass, detailsHeightClass, { 'pb-10': isSigned }]">
      <!-- Contract Version Info -->
      <div class="flex-1 space-y-1">
        <h4 :class="['font-bold text-foreground leading-tight line-clamp-2', titleSizeClass]">
          {{ getContractDisplayName(contract) }}
        </h4>
        <div class="flex flex-col">
          <p v-if="contract.contractNotes" class="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-tight">
            {{ contract.contractNotes }}
          </p>
          
          <!-- Locked Terms Section -->
          <div v-if="contract.lockedTradeInLabel || contract.lockedFinancingLabel" class="mt-2 p-1.5 bg-muted/50 rounded border border-border/50">
            <div class="flex items-center gap-1 mb-1">
              <Lock :size="8" class="text-amber-600" />
              <span class="text-[8px] font-bold text-amber-700 uppercase tracking-tighter">Locked Terms</span>
            </div>
            <div class="space-y-0.5">
              <div v-if="contract.lockedFinancingLabel" class="flex items-center gap-1 text-[9px] text-foreground font-medium">
                <BadgePercent :size="8" class="text-purple-600" />
                <span class="line-clamp-1">{{ contract.lockedFinancingLabel }}</span>
              </div>
              <div v-if="contract.lockedTradeInLabel" class="flex items-center gap-1 text-[9px] text-foreground font-medium">
                <CarFront :size="8" class="text-blue-600" />
                <span class="line-clamp-1">{{ contract.lockedTradeInLabel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Date at bottom -->
      <div class="mt-auto pt-1">
        <p v-if="showDate && contract.contractDate && !(isSigned && showSignedBadge)" :class="['text-muted-foreground', dateSizeClass]">
          {{ formatDate(contract.contractDate) }}
        </p>
      </div>
    </div>
    
    <!-- Signed Badge (bottom overlay, if signed) -->
    <div
      v-if="showSignedBadge && isSigned"
      class="absolute bottom-0 left-0 right-0 z-10 bg-green-600/90 text-white text-[10px] font-medium px-2 py-1.5 flex items-center justify-between pointer-events-none"
    >
      <span class="flex items-center gap-1">
        <CheckCircle class="w-4 h-4 shrink-0" />
        Signed
      </span>
      <span v-if="contract.esignatureCollectedDate" class="opacity-90">
        {{ formatDate(contract.esignatureCollectedDate) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed } from 'vue'
import { MoreVertical, Lock, CarFront, BadgePercent, FileSignature, CheckCircle } from 'lucide-vue-next'

const props = defineProps({
  contract: {
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
  showSignedBadge: {
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

// Generate a unique ID for the contract
const contractId = computed(() => {
  return props.contract.id || props.contract.contractDate || `contract-${Math.random()}`
})

const openMenuId = ref(null)
const buttonRefs = ref({})
const menuPosition = ref({})

const isSigned = computed(() => props.contract.contractSigned || props.contract.esignatureCollectedDate)

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

const dateSizeClass = computed(() => {
  return props.variant === 'carousel' ? 'text-sm' : 'text-sm'
})

const setButtonRef = (contractId, el) => {
  if (el) {
    buttonRefs.value[contractId] = el
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

const updateMenuPosition = (id) => {
  const button = buttonRefs.value[id]
  if (!button) return
  
  const rect = button.getBoundingClientRect()
  const menuWidth = calculateMenuWidth()
  
  menuPosition.value[id] = {
    top: rect.bottom + 4,
    left: rect.right - menuWidth,
    width: menuWidth
  }
}

const toggleMenu = async (id) => {
  if (openMenuId.value === id) {
    openMenuId.value = null
    delete menuPosition.value[id]
  } else {
    openMenuId.value = id
    await nextTick()
    updateMenuPosition(id)
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
    'signed': 'Signed',
    'draft': 'Draft',
    'archived': 'Archived'
  }
  return labels[status] || 'Active'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'active': 'bg-blue-600',
    'signed': 'bg-green-600',
    'draft': 'bg-gray-500',
    'archived': 'bg-gray-600'
  }
  return classes[status] || 'bg-gray-600'
}

const getContractBorderClass = (contract) => {
  if (isSigned.value) {
    return 'border-green-500 border-2'
  }
  return 'border-border'
}

const getContractOpacityClass = (contract) => {
  if (contract.status === 'archived') {
    return 'opacity-60'
  }
  return ''
}

const getContractDisplayName = (contract) => {
  if (contract.version) {
    return `Contract v${contract.version}`
  }
  if (contract.contractDate) {
    const date = new Date(contract.contractDate)
    return `Contract - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }
  return 'Contract'
}
</script>
