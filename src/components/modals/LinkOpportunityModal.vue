<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col" :show-close-button="true">
        <DialogHeader class="shrink-0">
          <DialogTitle>Link opportunity</DialogTitle>
          <DialogDescription v-if="customer?.name" class="text-muted-foreground">
            Select an opportunity to link with {{ customer.name }}
          </DialogDescription>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-4">
          <div class="relative w-full">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Search opportunities by customer, car..."
              class="w-full pl-9 bg-background border-border"
            />
          </div>

          <div class="space-y-0.5 max-h-80 overflow-y-auto">
            <button
              v-for="opp in filteredOpportunities"
              :key="opp.id"
              type="button"
              @click="handleSelect(opp)"
              class="w-full flex items-center gap-3 p-3 rounded-md transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              :class="selectedOpportunityId === opp.id ? 'bg-muted' : 'hover:bg-muted/80'"
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-foreground truncate">{{ opp.customer?.name || 'Unknown' }}</p>
                <p class="text-sm text-muted-foreground truncate">
                  {{ carLabel(opp) }}
                </p>
              </div>
              <Check v-if="selectedOpportunityId === opp.id" class="w-4 h-4 shrink-0 text-primary" />
            </button>

            <div v-if="filteredOpportunities.length === 0" class="text-center py-8">
              <Search class="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p class="text-sm text-muted-foreground">No opportunities found</p>
            </div>
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            @click="$emit('close')"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!selectedOpportunityId"
            @click="handleConfirm"
          >
            Link opportunity
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Check } from 'lucide-vue-next'
import { Button, Input } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { useOpportunitiesStore } from '@/stores/opportunities'

const props = defineProps({
  show: { type: Boolean, required: true },
  interactionId: { type: [Number, String], default: null },
  customer: { type: Object, default: null }
})

const emit = defineEmits(['close', 'linked'])

const opportunitiesStore = useOpportunitiesStore()
const searchQuery = ref('')
const selectedOpportunityId = ref(null)

const carLabel = (opp) => {
  const car = opp.vehicle || opp.requestedCar
  if (!car) return 'No car'
  const parts = [car.brand, car.model, car.year].filter(Boolean)
  return parts.length ? parts.join(' ') : 'No car'
}

const filteredOpportunities = computed(() => {
  const opps = opportunitiesStore.opportunities.filter((o) => o.stage !== 'Closed Lost')
  if (!searchQuery.value.trim()) return opps
  const q = searchQuery.value.toLowerCase()
  return opps.filter((opp) => {
    const name = (opp.customer?.name || '').toLowerCase()
    const car = carLabel(opp).toLowerCase()
    const email = (opp.customer?.email || '').toLowerCase()
    return name.includes(q) || car.includes(q) || email.includes(q)
  })
})

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      searchQuery.value = ''
      selectedOpportunityId.value = null
      if (!opportunitiesStore.opportunities.length) {
        opportunitiesStore.fetchOpportunities()
      }
    }
  }
)

const handleOpenChange = (isOpen) => {
  if (!isOpen) emit('close')
}

const handleSelect = (opp) => {
  selectedOpportunityId.value = opp.id
}

const handleConfirm = () => {
  if (selectedOpportunityId.value) {
    emit('linked', { interactionId: props.interactionId, opportunityId: selectedOpportunityId.value })
    emit('close')
  }
}
</script>
