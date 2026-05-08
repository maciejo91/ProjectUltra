<template>
  <div class="space-y-4">
    <div class="shrink-0 overflow-visible pb-2 pt-1">
      <AppTabs v-model="selectedFilter" :tabs="filterChips" />
    </div>

    <div v-if="filteredItems.length === 0" class="text-muted-foreground text-sm italic">
      No requests.
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="item in filteredItems"
        :key="item.compositeId"
        class="flex cursor-pointer items-start gap-4 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/50"
        @click="$emit('click', item, filteredItems)"
      >
        <!-- Car Image or Icon -->
        <div class="w-24 h-16 bg-muted rounded overflow-hidden flex items-center justify-center shrink-0">
          <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" alt="" />
          <Car v-else class="w-8 h-8 text-muted-foreground" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <Badge variant="secondary" :class="item.type === 'lead' ? 'bg-badge-green text-emerald-700' : 'bg-purple-50 text-purple-700'">
              {{ item.type === 'lead' ? 'Lead' : 'Opportunity' }}
            </Badge>
            <Badge variant="secondary" :class="getStatusClass(item.status)">{{ item.status }}</Badge>
          </div>
          <h4 class="font-medium text-foreground truncate">{{ item.title }}</h4>
          <div class="text-sm text-muted-foreground mt-1">{{ item.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Badge } from '@motork/component-library/future/primitives'
import AppTabs from '@/components/shared/AppTabs.vue'
import { Car } from 'lucide-vue-next'
import { DEFAULT_CAR_IMAGE } from '@/utils/mockDataHelpers'

const FILTER_LEADS = 'leads'
const FILTER_OPPORTUNITIES = 'opportunities'

const props = defineProps({
  leads: { type: Array, default: () => [] },
  opportunities: { type: Array, default: () => [] }
})

defineEmits(['click'])

const selectedFilter = ref(FILTER_OPPORTUNITIES)

const allItems = computed(() => {
  const list = []
  props.leads.forEach((l) => {
    list.push({
      id: l.id,
      type: 'lead',
      compositeId: `lead-${l.id}`,
      status: l.stage || 'Open',
      title: l.requestedCar ? `${l.requestedCar.brand} ${l.requestedCar.model}` : 'New Lead',
      subtitle: l.requestedCar?.year || '',
      image: l.requestedCar?.image || (l.requestedCar ? DEFAULT_CAR_IMAGE : null),
      original: l
    })
  })
  props.opportunities.forEach((o) => {
    list.push({
      id: o.id,
      type: 'opportunity',
      compositeId: `opportunity-${o.id}`,
      status: o.stage || 'Open',
      title: o.requestedCar ? `${o.requestedCar.brand} ${o.requestedCar.model}` : 'Opportunity',
      subtitle: o.requestedCar?.year || '',
      image: o.requestedCar?.image || (o.requestedCar ? DEFAULT_CAR_IMAGE : null),
      original: o
    })
  })
  return list
})

const filterChips = computed(() => [
  { key: FILTER_LEADS, label: 'Leads', count: props.leads.length },
  { key: FILTER_OPPORTUNITIES, label: 'Opportunities', count: props.opportunities.length }
])

const filteredItems = computed(() => {
  if (selectedFilter.value === FILTER_LEADS) {
    return allItems.value.filter((i) => i.type === 'lead')
  }
  if (selectedFilter.value === FILTER_OPPORTUNITIES) {
    return allItems.value.filter((i) => i.type === 'opportunity')
  }
  return allItems.value
})

const getStatusClass = (status) => {
  if (['In progress', 'Open', 'Negotiation'].includes(status)) {
    return 'bg-green-100 text-green-700 hover:bg-green-200 border-transparent'
  }
  return 'bg-muted text-muted-foreground border-transparent'
}
</script>
