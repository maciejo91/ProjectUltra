<template>
  <div v-if="contracts && contracts.length > 0">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold text-foreground text-sm">Contracts ({{ contracts.length }})</h3>
      </div>
    </div>
    <div class="relative">
      <div class="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory" style="scrollbar-width: thin;">
        <ContractCard
          v-for="contract in contracts"
          :key="`contract-${contract.id || contract.contractDate}-${contract.version || 'v1'}`"
          :contract="contract"
          variant="carousel"
          :menu-items="getMenuItems(contract)"
          :loading="loadingContracts.has(contract.id || contract.contractDate)"
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
          <span class="text-[10px] font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wider">New Contract</span>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Empty State: add card when !hideAdd -->
  <div v-else class="flex flex-col gap-2">
    <h3 class="font-semibold text-foreground text-sm">Contracts (0)</h3>
    <button
      v-if="!hideAdd"
      class="w-full max-w-36 h-[171px] bg-muted/50 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/80 transition-colors group"
      @click="$emit('add')"
    >
      <div class="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors shadow-sm">
        <Plus :size="20" />
      </div>
      <span class="text-[10px] font-medium text-muted-foreground group-hover:text-foreground uppercase tracking-wider">New Contract</span>
    </button>
    <div v-else class="text-center py-6 px-3 bg-muted border border-border rounded-lg">
      <FileCheck class="w-8 h-8 shrink-0 text-muted-foreground mx-auto mb-2" />
      <p class="text-sm font-medium text-muted-foreground">No contracts created yet</p>
    </div>
  </div>
  
  <!-- Collect E-Signatures Modal -->
  <CollectESignaturesModal
    :show="showCollectESignaturesModal"
    :contract="selectedContract"
    :max-contract-date="maxContractDate"
    @confirm="handleCollectESignaturesConfirm"
    @cancel="handleCollectESignaturesCancel"
  />
</template>

<script setup>
import { ref } from 'vue'
import { Plus, FileCheck } from 'lucide-vue-next'
import ContractCard from '@/components/shared/ContractCard.vue'
import CollectESignaturesModal from '@/components/modals/CollectESignaturesModal.vue'

const props = defineProps({
  contracts: {
    type: Array,
    default: () => []
  },
  opportunityId: {
    type: [Number, String],
    required: true
  },
  maxContractDate: {
    type: String,
    default: ''
  },
  hideAdd: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['generate-pdf', 'contract-activated', 'collect-esignatures', 'add'])

// Track loading state per contract
const loadingContracts = ref(new Set())

// Modal state
const showCollectESignaturesModal = ref(false)
const selectedContract = ref(null)

const setContractLoading = (contractId, isLoading) => {
  if (isLoading) {
    loadingContracts.value.add(contractId)
  } else {
    loadingContracts.value.delete(contractId)
  }
}

const getMenuItems = (contract) => {
  const items = []
  
  // Collect e-signatures - only if not signed
  if (!contract.contractSigned && !contract.esignatureCollectedDate) {
    items.push({
      key: 'collect-esignatures',
      label: 'Collect e-signatures',
      onClick: () => {
        selectedContract.value = contract
        showCollectESignaturesModal.value = true
      }
    })
  }
  
  // Generate Contract PDF - always available
  items.push({
    key: 'generate-contract-pdf',
    label: 'Generate Contract PDF',
    onClick: () => {
      emit('generate-pdf', contract)
    }
  })
  
  return items
}

const handleCollectESignaturesConfirm = (formData) => {
  if (selectedContract.value) {
    setContractLoading(selectedContract.value.id || selectedContract.value.contractDate, true)
    emit('collect-esignatures', {
      contract: selectedContract.value,
      formData
    })
  }
  showCollectESignaturesModal.value = false
  selectedContract.value = null
}

const handleCollectESignaturesCancel = () => {
  showCollectESignaturesModal.value = false
  selectedContract.value = null
}

// Expose method to clear loading state (called by parent after operation completes)
defineExpose({
  setContractLoading
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
