<template>
  <div v-if="cars.length > 0" class="mb-8">
    <div class="flex items-center gap-2 mb-4">
      <Pin class="w-3 h-3 shrink-0 text-muted-foreground" />
      <h3 class="font-bold text-foreground text-sm">Cars</h3>
    </div>
    <div class="relative">
      <!-- scrollbar-width: thin is Firefox-specific and has no Tailwind equivalent -->
      <div class="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory" style="scrollbar-width: thin;">
        <div
          v-for="(car, index) in cars"
          :key="car.id"
          class="flex-none w-64 snap-start bg-surface border border-border rounded-xl shadow-nsc-card overflow-hidden transition-shadow cursor-pointer relative"
          @click="handleCarClick(car)"
        >
          <!-- Type Badge -->
          <div
            class="absolute top-2 right-2 z-10 text-white text-sm font-bold px-2 py-1 rounded-md shadow-sm"
            :class="getTypeBadgeClass(car.type)"
          >
            {{ getTypeLabel(car.type) }}
          </div>
          
          <div class="w-full h-36 bg-surfaceTertiary flex items-center justify-center overflow-hidden">
            <img 
              v-if="car.image" 
              :src="car.image" 
              alt="Car" 
              class="w-full h-full object-cover"
            >
            <Car v-else class="w-10 h-10 shrink-0 text-muted-foreground" />
          </div>
          <div class="p-6">
            <h4 class="font-bold text-foreground text-sm mb-1">{{ car.brand }} {{ car.model }} ({{ car.year }})</h4>
            <p v-if="car.price" class="text-sm text-muted-foreground mb-2">€ {{ formatCurrency(car.price) }}</p>
            <div 
              v-if="car.stockDays !== null && car.stockDays !== undefined"
              class="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 text-sm font-semibold rounded-md mb-2"
            >
              <div class="w-1 h-1 bg-green-500 rounded-full"></div> In stock ({{ car.stockDays }} days)
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Coming Soon Modal -->
    <ComingSoonModal
      :show="showModal"
      title="Car Details"
      @close="showModal = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Pin, Car } from 'lucide-vue-next'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'

const props = defineProps({
  cars: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['car-click'])

const showModal = ref(false)

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US').format(value)
}

const getTypeLabel = (type) => {
  const labels = {
    'requested': 'Requested',
    'offered': 'Offered',
    'drove': 'Drove',
    'purchased': 'Purchased'
  }
  return labels[type] || 'Car'
}

const getTypeBadgeClass = (type) => {
  const classes = {
    'requested': 'bg-blue-600',
    'offered': 'bg-purple-600',
    'drove': 'bg-green-600',
    'purchased': 'bg-teal-600'
  }
  return classes[type] || 'bg-gray-600'
}

const handleCarClick = (car) => {
  emit('car-click', car)
  showModal.value = true
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>


