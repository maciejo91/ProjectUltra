<template>
  <div class="space-y-4">
    <div v-if="items.length === 0" class="text-muted-foreground text-sm italic">
      No active negotiations.
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div 
        v-for="item in items" 
        :key="item.id" 
        class="border rounded-lg p-4 bg-white shadow-sm flex items-start gap-4 cursor-pointer hover:shadow-md transition-shadow"
        @click="$emit('click', item)"
      >
        <!-- Car Image or Icon -->
        <div class="w-24 h-16 bg-muted rounded overflow-hidden flex items-center justify-center shrink-0">
           <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
           <Car v-else class="w-8 h-8 text-muted-foreground" />
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <Badge variant="secondary" class="text-xs bg-gray-100 text-gray-700">{{ item.type === 'lead' ? 'Lead' : 'Opportunity' }}</Badge>
            <Badge variant="secondary" :class="getStatusClass(item.status)">{{ item.status }}</Badge>
          </div>
          <h4 class="font-medium text-foreground truncate">{{ item.title }}</h4>
          <div class="text-xs text-muted-foreground mt-1">{{ item.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Badge } from '@motork/component-library/future/primitives'
import { Car } from 'lucide-vue-next'

const props = defineProps({
  leads: { type: Array, default: () => [] },
  opportunities: { type: Array, default: () => [] }
})

defineEmits(['click'])

const items = computed(() => {
  const list = []
  
  // Leads
  props.leads.forEach(l => {
    list.push({
      id: l.id,
      type: 'lead',
      status: l.stage || 'Open',
      title: l.requestedCar ? `${l.requestedCar.brand} ${l.requestedCar.model}` : 'New Lead',
      subtitle: l.requestedCar?.year || '',
      image: l.requestedCar?.image,
      original: l
    })
  })
  
  // Opportunities
  props.opportunities.forEach(o => {
    list.push({
      id: o.id,
      type: 'opportunity',
      status: o.stage || 'Open',
      title: o.requestedCar ? `${o.requestedCar.brand} ${o.requestedCar.model}` : 'Opportunity',
      subtitle: o.requestedCar?.year || '',
      image: o.requestedCar?.image,
      original: o
    })
  })
  
  return list
})

const getStatusClass = (status) => {
  if (['In progress', 'Open', 'Negotiation'].includes(status)) {
    return 'bg-green-100 text-green-700 hover:bg-green-200 border-transparent'
  }
  return 'bg-gray-100 text-gray-700 border-transparent'
}
</script>
