<template>
  <div v-if="offers && offers.length > 0">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold text-foreground text-sm">Offers ({{ offers.length }})</h3>
      </div>
    </div>
    <div class="relative">
      <div class="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory" style="scrollbar-width: thin;">
        <OfferCard
          v-for="offer in offers"
          :key="`offer-${offer.id}-${offer.status}-${offer.acceptance_status || 'none'}`"
          :offer="offer"
          variant="carousel"
          :menu-items="getMenuItems(offer)"
          :loading="loadingOffers.has(offer.id)"
          container-class="flex-none w-36 snap-start"
        />

        <!-- Add New Entry Card -->
        <button
          v-if="!hideAdd"
          class="flex-none w-36 h-[171px] snap-start bg-muted/50 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors group"
          @click="$emit('add')"
        >
          <div class="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors shadow-sm">
            <Plus :size="20" />
          </div>
          <span class="text-[10px] font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wider">New Offer</span>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Empty State: add card when !hideAdd -->
  <div v-else class="flex flex-col gap-2">
    <h3 class="font-semibold text-foreground text-sm">Offers (0)</h3>
    <button
      v-if="!hideAdd"
      class="w-full max-w-36 h-[171px] bg-muted/50 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors group"
      @click="$emit('add')"
    >
      <div class="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors shadow-sm">
        <Plus :size="20" />
      </div>
      <span class="text-[10px] font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wider">New Offer</span>
    </button>
    <div v-else class="text-center py-6 px-3 bg-muted border border-border rounded-lg">
      <FileText class="w-8 h-8 shrink-0 text-muted-foreground mx-auto mb-2" />
      <p class="text-sm font-medium text-muted-foreground">No offers created yet</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus, FileText } from 'lucide-vue-next'
import OfferCard from '@/components/shared/OfferCard.vue'

const props = defineProps({
  offers: {
    type: Array,
    default: () => []
  },
  opportunityId: {
    type: [Number, String],
    required: true
  },
  hideAdd: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['offer-accepted', 'generate-pdf', 'offer-activated', 'add'])

// Track loading state per offer
const loadingOffers = ref(new Set())

const setOfferLoading = (offerId, isLoading) => {
  if (isLoading) {
    loadingOffers.value.add(offerId)
  } else {
    loadingOffers.value.delete(offerId)
  }
}

const getMenuItems = (offer) => {
  const items = []
  const isAccepted = offer.status === 'accepted' || offer.acceptance_status === 'accepted'
  
  // Set active - always available (unless already active)
  if (offer.status !== 'active') {
    items.push({
      key: 'set-active',
      label: 'Set active',
      onClick: () => {
        setOfferLoading(offer.id, true)
        emit('offer-activated', offer)
      }
    })
  }
  
  // Set accepted / Remove acceptance - toggle based on current state
  if (isAccepted) {
    items.push({
      key: 'remove-accepted',
      label: 'Remove acceptance',
      onClick: () => {
        setOfferLoading(offer.id, true)
        emit('offer-accepted', offer, true) // Pass true to indicate removal
      }
    })
  } else {
    items.push({
      key: 'set-accepted',
      label: 'Set accepted',
      onClick: () => {
        setOfferLoading(offer.id, true)
        emit('offer-accepted', offer)
      }
    })
  }
  
  // Send Offer PDF - always available
  items.push({
    key: 'send-offer-pdf',
    label: 'Send Offer PDF',
    onClick: () => {
      emit('generate-pdf', offer)
    }
  })
  
  return items
}

// Expose method to clear loading state (called by parent after operation completes)
defineExpose({
  setOfferLoading
})
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
