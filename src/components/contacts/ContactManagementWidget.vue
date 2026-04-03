<template>
  <div
    v-if="contact"
    class="bg-surface border border-border rounded-xl shadow-nsc-card overflow-hidden"
  >
    <div class="p-4 border-b border bg-gray-50/50 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <UserCircle class="w-3 h-3 shrink-0 text-muted-foreground" />
        <h3 class="font-bold text-gray-900 text-sm">Manage next steps</h3>
      </div>
    </div>

    <div class="p-5 space-y-4">
      <!-- Warning if no requested car -->
      <div 
        v-if="!contact.requestedCar"
        class="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3"
      >
        <AlertTriangle class="w-5 h-5 shrink-0 text-orange-600 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-semibold text-orange-900 mb-1">No Requested Car</p>
          <p class="text-sm text-orange-700">
            Add a requested car to this contact before converting to a lead or opportunity.
          </p>
        </div>
      </div>

      <!-- Success message if car exists -->
      <div 
        v-else
        class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
      >
        <CheckCircle class="w-5 h-5 shrink-0 text-green-600 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-semibold text-green-900 mb-1">Requested Car Added</p>
          <p class="text-sm text-green-700">
            {{ contact.requestedCar.brand }} {{ contact.requestedCar.model }} ({{ contact.requestedCar.year }})
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <!-- Add/Edit Requested Car -->
        <button 
          @click="showAddCarModal = true"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Car class="w-4 h-4 shrink-0" />
          {{ contact.requestedCar ? 'Edit Requested Car' : 'Add Requested Car' }}
        </button>

        <div class="flex gap-3">
          <!-- Convert to Lead -->
          <button 
            @click="handleConvertToLead"
            :disabled="!contact.requestedCar || converting"
            :title="!contact.requestedCar ? 'Add a requested car first' : ''"
            class="flex-1 bg-surface hover:bg-gray-50 border-2 border-blue-600 text-blue-600 font-medium px-4 py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
          >
            <UserPlus class="w-4 h-4 shrink-0" />
            Convert to Lead
          </button>
          
          <!-- Convert to Opportunity -->
          <button 
            @click="handleConvertToOpportunity"
            :disabled="!contact.requestedCar || converting"
            :title="!contact.requestedCar ? 'Add a requested car first' : ''"
            class="flex-1 bg-surface hover:bg-gray-50 border-2 border-purple-600 text-purple-600 font-medium px-4 py-3 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
          >
            <Briefcase class="w-4 h-4 shrink-0" />
            Convert to Opportunity
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add Requested Car Modal -->
    <RequestedCarModal 
      :show="showAddCarModal"
      :contact="contact"
      @close="showAddCarModal = false"
      @saved="handleCarAdded"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { UserCircle, AlertTriangle, CheckCircle, Car, UserPlus, Briefcase } from 'lucide-vue-next'
import RequestedCarModal from '@/components/modals/RequestedCarModal.vue'

const props = defineProps({
  contact: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['car-added', 'convert-to-lead', 'convert-to-opportunity'])

const showAddCarModal = ref(false)
const converting = ref(false)

const handleCarAdded = (carData) => {
  emit('car-added', carData)
  showAddCarModal.value = false
}

const handleConvertToLead = () => {
  if (!props.contact.requestedCar || converting.value) return
  converting.value = true
  emit('convert-to-lead')
}

const handleConvertToOpportunity = () => {
  if (!props.contact.requestedCar || converting.value) return
  converting.value = true
  emit('convert-to-opportunity')
}
</script>

