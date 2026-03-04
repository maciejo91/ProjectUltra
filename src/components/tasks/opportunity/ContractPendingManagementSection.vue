<template>
  <div class="flex flex-col">
    <!-- Main card: Add contract (no contracts) or Set Delivery Date (header + toggles only) -->
    <div
      v-if="!hasContracts"
      class="bg-white rounded-lg shadow-nsc-card overflow-visible"
    >
        <div class="p-6">
          <div class="mb-3">
            <h4 class="font-bold text-foreground text-sm">Add contract</h4>
            <p class="text-sm text-muted-foreground mt-0.5">
              Create a new contract to track versions. Use the + button on the carousel above to add a contract.
            </p>
          </div>
          <div class="flex flex-wrap gap-3 items-center justify-end">
            <SecondaryActionsDropdown
              :actions="contractPendingActions"
              @action-selected="$emit('contract-pending-action', $event)"
            />
          </div>
      </div>
    </div>

    <!-- Set Delivery Date card: only when at least one contract -->
    <div
      v-else
      class="bg-white rounded-lg shadow-nsc-card overflow-visible"
    >
        <div class="p-6">
          <div class="mb-3">
            <h4 class="font-bold text-foreground text-sm">Set Delivery Date</h4>
            <p class="text-sm text-muted-foreground mt-0.5">
              Schedule vehicle delivery with the customer. Set the delivery date, time, and location.
            </p>
          </div>
          <div class="flex flex-wrap gap-3 items-center justify-between">
            <div class="outcome-toggle-group flex flex-wrap gap-3">
              <Toggle
                v-if="!hasDeliveryDate"
                variant="outline"
                :model-value="showSetDeliveryDateSection"
                @update:model-value="$emit('update:show-set-delivery-date-section', $event)"
                class="outcome-toggle-item"
              >
                <Truck class="w-4 h-4 shrink-0" />
                <span>Set Delivery Date</span>
              </Toggle>
            </div>
            <SecondaryActionsDropdown
              :actions="contractPendingActions"
              class="ml-auto shrink-0"
              @action-selected="$emit('contract-pending-action', $event)"
            />
          </div>
        </div>
    </div>

    <!-- Expanded content: subcard for adding delivery date and saving (progresses state machine) -->
    <div class="mk-expanded-cards-area space-y-4">
      <div v-if="showSetDeliveryDateSection">
        <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
          <h5 class="font-semibold text-foreground text-sm mb-1">Add delivery date</h5>
          <p class="text-sm text-muted-foreground mb-4">
            Set the date and save to progress to the next step (Collect e-signatures).
          </p>
          <div class="space-y-4">
            <div>
              <Label class="form-label">Delivery Date <span class="text-red-600">*</span></Label>
              <Input
                type="date"
                :model-value="deliveryDateForm.deliveryDate"
                @update:model-value="$emit('update:delivery-date-form', { ...deliveryDateForm, deliveryDate: $event })"
                :min="minDeliveryDate"
                class="w-full"
              />
            </div>
            <div>
              <Label class="form-label">Time <span class="optional">(optional)</span></Label>
              <Input
                type="time"
                :model-value="deliveryDateForm.deliveryTime"
                @update:model-value="$emit('update:delivery-date-form', { ...deliveryDateForm, deliveryTime: $event })"
                class="w-full"
              />
            </div>
            <div>
              <Label class="form-label">Delivery Location</Label>
              <Select
                :model-value="deliveryDateForm.deliveryLocation"
                @update:model-value="$emit('update:delivery-date-form', { ...deliveryDateForm, deliveryLocation: $event })"
              >
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dealership">At Dealership</SelectItem>
                  <SelectItem value="Customer Address">Customer Address</SelectItem>
                  <SelectItem value="Other">Other Location</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label class="form-label">Notes <span class="optional">(optional)</span></Label>
              <Textarea
                :model-value="deliveryDateForm.notes"
                @update:model-value="$emit('update:delivery-date-form', { ...deliveryDateForm, notes: $event })"
                rows="3"
                placeholder="Add any relevant delivery details..."
                class="w-full"
              />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
            <Button variant="secondary" @click="$emit('cancel-set-delivery-date')">
              Cancel
            </Button>
            <Button
              variant="default"
              :disabled="!canSubmitSetDeliveryDate"
              @click="$emit('confirm-set-delivery-date')"
            >
              Save and continue
            </Button>
          </div>
        </div>
      </div>

      <!-- Inline Schedule Appointment Section -->
      <div v-if="showScheduleAppointmentContractPendingSection">
        <OpportunityScheduleForm
          ref="scheduleAppointmentContractPendingFormRef"
          :opportunity="opportunity"
          mode="schedule"
          @submit="$emit('schedule-appointment-contract-pending-submit', $event)"
          @cancel="$emit('cancel-schedule-appointment-contract-pending')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Truck } from 'lucide-vue-next'
import { Button, Toggle, Label, Input, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@motork/component-library/future/primitives'
import SecondaryActionsDropdown from '@/components/shared/SecondaryActionsDropdown.vue'
import OpportunityScheduleForm from '@/components/tasks/opportunity/OpportunityScheduleForm.vue'

const props = defineProps({
  opportunity: { type: Object, required: true },
  hasContracts: { type: Boolean, default: false },
  showScheduleAppointmentContractPendingSection: { type: Boolean, default: false },
  showSetDeliveryDateSection: { type: Boolean, default: false },
  deliveryDateForm: { type: Object, required: true },
  hasDeliveryDate: { type: Boolean, default: false },
  minDeliveryDate: { type: String, default: '' },
  canSubmitSetDeliveryDate: { type: Boolean, default: false },
  contractPendingActions: { type: Array, default: () => [] }
})

defineEmits([
  'update:show-schedule-appointment-contract-pending-section',
  'update:show-set-delivery-date-section',
  'update:delivery-date-form',
  'confirm-set-delivery-date',
  'cancel-set-delivery-date',
  'schedule-appointment-contract-pending-submit',
  'cancel-schedule-appointment-contract-pending',
  'contract-pending-action'
])

const scheduleAppointmentContractPendingFormRef = ref(null)

defineExpose({
  scheduleAppointmentContractPendingFormRef
})
</script>
