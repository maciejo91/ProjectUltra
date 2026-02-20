<template>
  <div class="bg-white border border-border rounded-xl p-4 shadow-nsc-card flex gap-4 animate-fade-in mb-4 feed-item">
    <div 
      class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border"
      :class="getItemIconClass(item.type)"
    >
      <component :is="getLucideIcon(getItemIcon(item.type))" class="w-4 h-4 shrink-0" />
    </div>
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm font-bold text-foreground">{{ customerInitials }}</span>
        <span class="text-sm text-muted-foreground">{{ item.action || 'added' }}</span>
        <span class="text-sm text-muted-foreground">• {{ formatTime(item.timestamp) }}</span>
        <span v-if="item.autoDetected" class="bg-blue-50 text-blue-600 text-sm px-1 py-0.5 rounded border border-blue-100">Auto-detected</span>
        <div class="ml-auto relative">
          <button 
            @click.stop="showMenu = !showMenu"
            class="text-gray-400 hover:text-muted-foreground transition-colors p-1"
            title="More actions"
          >
            <MoreVertical class="w-4 h-4 shrink-0" />
          </button>
          
          <!-- Dropdown Menu -->
          <div 
            v-if="showMenu"
            v-click-outside="() => showMenu = false"
            class="absolute right-0 top-full mt-1 z-10"
          >
            <DropdownMenu :items="menuItems" className="w-32" />
          </div>
        </div>
      </div>
      <div v-if="item.content" class="text-sm text-muted-foreground">{{ item.content }}</div>
      <div v-if="item.fileName" class="text-sm text-muted-foreground flex items-center gap-2">
        <Paperclip class="w-4 h-4 shrink-0 text-muted-foreground" />
        <span>{{ item.fileName }}</span>
      </div>
      <div v-if="item.data" class="mt-2">
        <div v-if="item.type === 'appointment'">
          <AppointmentWidget :appointment-data="item.data" />
        </div>
        <div v-else class="bg-white border border-border rounded-lg p-3">
          <div v-if="item.type === 'tradein'">
              <h4 class="text-sm font-bold text-foreground">{{ item.data.brand }} {{ item.data.model }}</h4>
              <p v-if="item.data.version" class="text-sm text-muted-foreground mt-0.5">{{ item.data.version }}</p>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
              <div v-if="item.data.year">
                <Calendar class="w-4 h-4 shrink-0 mr-1 inline" />{{ item.data.year }}
              </div>
              <div v-if="item.data.km">
                <Car class="w-4 h-4 shrink-0 mr-1 inline" />{{ item.data.km }} km
              </div>
              <div v-if="item.data.plate">
                <UserCircle class="w-4 h-4 shrink-0 mr-1 inline" />{{ item.data.plate }}
              </div>
              <div v-if="item.data.date">
                <CalendarCheck class="w-4 h-4 shrink-0 mr-1 inline" />{{ formatDate(item.data.date) }}
              </div>
              <div v-if="item.data.class">
                <Car class="w-4 h-4 shrink-0 mr-1 inline" />{{ item.data.class }}
              </div>
            </div>
          </div>
          <div v-else-if="item.type === 'financing'">
              <h4 class="text-sm font-bold text-foreground mb-2">{{ item.data.product }}</h4>
              <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div v-if="item.data.provider">
                <span class="text-muted-foreground">Provider:</span>
                <span class="text-muted-foreground font-medium ml-1">{{ item.data.provider }}</span>
              </div>
              <div v-if="item.data.total">
                <span class="text-muted-foreground">Total:</span>
                <span class="text-muted-foreground font-medium ml-1">€{{ formatCurrency(item.data.total) }}</span>
              </div>
              <div v-if="item.data.monthly">
                <span class="text-muted-foreground">Monthly:</span>
                <span class="text-muted-foreground font-medium ml-1">€{{ formatCurrency(item.data.monthly) }}</span>
              </div>
              <div v-if="item.data.deposit">
                <span class="text-muted-foreground">Deposit:</span>
                <span class="text-muted-foreground font-medium ml-1">€{{ formatCurrency(item.data.deposit) }}</span>
              </div>
              <div v-if="item.data.startDate">
                <span class="text-muted-foreground">Start:</span>
                <span class="text-muted-foreground font-medium ml-1">{{ formatDate(item.data.startDate) }}</span>
              </div>
              <div v-if="item.data.expDate">
                <span class="text-muted-foreground">Expires:</span>
                <span class="text-muted-foreground font-medium ml-1">{{ formatDate(item.data.expDate) }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="item.type === 'offer'">
            <OfferCarousel
              :offers="[item.data]"
              :opportunity-id="item.opportunityId || item.leadId || ''"
              hide-add
            />
            <span v-if="item.data.isMainOffer" class="inline-block mt-2 bg-purple-600 text-white text-xs font-bold px-1 py-0.5 rounded">Main Offer</span>
          </div>
          <div v-else-if="item.type === 'purchase'" class="flex items-center gap-3">
            <div class="flex-1">
              <h4 class="text-sm font-bold text-foreground">{{ item.data.brand }} {{ item.data.model }} ({{ item.data.year }})</h4>
              <p class="text-sm text-muted-foreground">€ {{ formatCurrency(item.data.price) }}</p>
              <p v-if="item.data.purchaseDate" class="text-sm text-muted-foreground mt-1">Purchased: {{ formatDate(item.data.purchaseDate) }}</p>
              <p v-if="item.data.notes" class="text-sm text-muted-foreground mt-1">{{ item.data.notes }}</p>
            </div>
          </div>
          <div v-else-if="item.type === 'purchase-method'">
            <h4 class="text-sm font-bold text-foreground mb-2">{{ item.data.typeLabel || item.data.type }}</h4>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <div v-if="item.data.monthlyInstalment">
                <span class="text-muted-foreground">Monthly:</span>
                <span class="text-muted-foreground font-medium ml-1">€{{ formatCurrency(item.data.monthlyInstalment) }}</span>
              </div>
              <div v-if="item.data.duration">
                <span class="text-muted-foreground">Duration:</span>
                <span class="text-muted-foreground font-medium ml-1">{{ item.data.duration }} months</span>
              </div>
              <div v-if="item.data.downPayment">
                <span class="text-muted-foreground">Down Payment:</span>
                <span class="text-muted-foreground font-medium ml-1">€{{ formatCurrency(item.data.downPayment) }}</span>
              </div>
              <div v-if="item.data.interestRate">
                <span class="text-muted-foreground">Interest Rate:</span>
                <span class="text-muted-foreground font-medium ml-1">{{ item.data.interestRate }}%</span>
              </div>
              <div v-if="item.data.mileageLimit">
                <span class="text-muted-foreground">Mileage Limit:</span>
                <span class="text-muted-foreground font-medium ml-1">{{ formatCurrency(item.data.mileageLimit) }} km/year</span>
              </div>
              <div v-if="item.data.customerType">
                <span class="text-muted-foreground">Customer Type:</span>
                <span class="text-muted-foreground font-medium ml-1">{{ item.data.customerType }}</span>
              </div>
            </div>
            <div v-if="item.data.insuranceIncluded || item.data.maintenanceIncluded || item.data.registrationTaxesIncluded" class="flex flex-wrap gap-2 mt-2">
              <span v-if="item.data.insuranceIncluded" class="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded border border-green-100">Insurance</span>
              <span v-if="item.data.maintenanceIncluded" class="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100">Maintenance</span>
              <span v-if="item.data.registrationTaxesIncluded" class="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded border border-purple-100">Registration/Taxes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { MoreVertical, Paperclip, Calendar, Car, UserCircle, CalendarCheck } from 'lucide-vue-next'
import { getLucideIcon } from '@/utils/lucideIcons'
import { DropdownMenu } from '@motork/component-library/future/primitives'
import AppointmentWidget from '@/components/customer/activities/AppointmentWidget.vue'
import OfferCarousel from '@/components/shared/OfferCarousel.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  taskType: {
    type: String,
    default: 'lead'
  },
  customerInitials: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const showMenu = ref(false)

const menuItems = computed(() => ([
  { key: 'edit', label: 'Edit', onClick: handleEdit },
  { key: 'delete', label: 'Delete', onClick: handleDelete }
]))

const getItemIcon = (type) => {
  const icons = {
    'note': 'fa-regular fa-note-sticky',
    'communication': 'fa-solid fa-comment-dots',
    'email': 'fa-regular fa-envelope',
    'whatsapp': 'fa-brands fa-whatsapp',
    'sms': 'fa-solid fa-comment-dots',
    'attachment': 'fa-solid fa-paperclip',
    'tradein': 'fa-solid fa-car-side',
    'financing': 'fa-solid fa-file-invoice-dollar',
    'offer': 'fa-solid fa-handshake',
    'purchase': 'fa-solid fa-shopping-cart',
    'purchase-method': 'fa-solid fa-credit-card',
    'appointment': 'fa-solid fa-calendar'
  }
  return icons[type] || 'fa-solid fa-circle'
}

const getItemIconClass = (type) => {
  const classes = {
    'note': 'bg-orange-100 text-orange-600 border-orange-200',
    'communication': 'bg-muted text-muted-foreground border',
    'email': 'bg-blue-100 text-blue-600 border-blue-200',
    'whatsapp': 'bg-green-100 text-green-600 border-green-200',
    'sms': 'bg-muted text-muted-foreground border',
    'attachment': 'bg-blue-50 text-blue-600 border-blue-100',
    'tradein': 'bg-green-50 text-green-600 border-green-100',
    'financing': 'bg-purple-50 text-purple-600 border-purple-100',
    'offer': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'purchase': 'bg-teal-50 text-teal-600 border-teal-100',
    'purchase-method': 'bg-amber-50 text-amber-600 border-amber-100',
    'appointment': 'bg-purple-100 text-purple-600 border-purple-200'
  }
  return classes[type] || 'bg-muted text-muted-foreground border'
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'Just now'
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatCurrency = (value) => {
  if (!value) return '0'
  return new Intl.NumberFormat('en-US').format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const handleEdit = () => {
  showMenu.value = false
  emit('edit', props.item)
}

const handleDelete = () => {
  showMenu.value = false
  if (confirm('Are you sure you want to delete this item?')) {
    emit('delete', props.item)
  }
}
</script>

