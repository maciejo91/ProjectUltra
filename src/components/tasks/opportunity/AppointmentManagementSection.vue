<template>
  <div class="flex flex-col">
    <!-- Main card: header + toggles only (same as LQTask) -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-visible">
      <div class="p-6">
        <div class="mb-3">
          <h4 class="font-bold text-foreground text-sm">Manage Appointment</h4>
          <p class="text-sm text-muted-foreground mt-0.5">
            Appointment scheduled for {{ scheduledAppointment?.start ? formatDateTime(scheduledAppointment.start) : 'TBD' }}
            <span v-if="opportunity.customer || opportunity.customerId" class="ml-2">
              with
              <a
                :href="customerProfileUrl"
                target="_blank"
                @click.stop="handleCustomerClick"
                class="text-primary hover:underline font-medium"
              >
                {{ customerName }}
              </a>
            </span>
          </p>
        </div>
        <div class="flex flex-wrap gap-3 items-center">
          <Button
            v-if="scheduledAppointment?.status === 'pending_confirmation'"
            variant="outline"
            @click="$emit('confirm-appointment')"
            class="inline-flex items-center gap-2 cursor-pointer"
          >
            <CalendarCheck class="w-4 h-4 shrink-0" />
            <span>Confirm appointment</span>
          </Button>
          <div class="outcome-toggle-group flex flex-wrap gap-3">
            <Toggle
              v-if="!isAppointmentToday"
              variant="outline"
              :model-value="showRescheduleSection"
              @update:model-value="(p) => {
                $emit('update:show-reschedule-section', p);
                if (p) {
                  $emit('update:show-ns-task-section', false);
                  $emit('update:show-offer-assignment-section', false);
                  activeSecondaryAction.value = null;
                }
              }"
              class="outcome-toggle-item"
            >
              <CalendarDays class="w-4 h-4 shrink-0" />
              <span>Reschedule</span>
            </Toggle>
            <Toggle
              v-if="isAppointmentToday"
              variant="outline"
              :model-value="showNsTaskSection"
              @update:model-value="(p) => {
                if (p) {
                  $emit('mark-no-show');
                  activeSecondaryAction.value = null;
                } else {
                  $emit('update:show-ns-task-section', false);
                }
              }"
              class="outcome-toggle-item"
            >
              <UserX class="w-4 h-4 shrink-0" />
              <span>Mark No-Show</span>
            </Toggle>
            <Toggle
              v-if="isAppointmentToday"
              variant="outline"
              :model-value="showOfferAssignmentSection"
              @update:model-value="(p) => {
                if (p) {
                  $emit('mark-showed-up');
                  activeSecondaryAction.value = null;
                } else {
                  $emit('update:show-offer-assignment-section', false);
                }
              }"
              class="outcome-toggle-item"
            >
              <UserCheck class="w-4 h-4 shrink-0" />
              <span>Mark Showed Up</span>
            </Toggle>
          </div>
          <SecondaryActionsDropdown
            v-if="secondaryActions && secondaryActions.length > 0"
            :actions="secondaryActions"
            class="ml-auto shrink-0"
            @action-selected="handleSecondaryActionSelected"
          />
        </div>
      </div>
    </div>

    <!-- Expanded content as cards below the main card (LQTask-style) -->
    <div class="mk-expanded-cards-area space-y-4">
      <div v-if="showRescheduleSection">
        <OpportunityScheduleForm
          ref="scheduleFormRef"
          :opportunity="opportunity"
          mode="reschedule"
          :initial-appointment="scheduledAppointment"
          @submit="$emit('reschedule-submit', $event)"
          @cancel="$emit('reschedule-cancel')"
        />
      </div>

      <div v-if="showNsTaskSection">
        <NS1Task
          v-if="nsTaskCount === 1"
          ref="ns1TaskRef"
          :opportunity="opportunity"
          :scheduled-appointment="scheduledAppointment"
          @assigned="$emit('ns-assigned', $event)"
          @cancel="$emit('ns-cancel')"
        />
        <NS2Task
          v-else-if="nsTaskCount === 2"
          ref="ns2TaskRef"
          :opportunity="opportunity"
          :scheduled-appointment="scheduledAppointment"
          @assigned="$emit('ns-assigned', $event)"
          @cancel="$emit('ns-cancel')"
        />
        <NS3Task
          v-else-if="nsTaskCount >= 3"
          ref="ns3TaskRef"
          :opportunity="opportunity"
          :scheduled-appointment="scheduledAppointment"
          @close-as-lost="$emit('ns-close-as-lost', $event)"
          @cancel="$emit('ns-cancel')"
        />
      </div>

      <div v-if="showNsTaskSection" class="flex justify-end gap-2">
        <Button
          variant="secondary"
          @click="$emit('ns-cancel')"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          :disabled="!canSubmitNsTask"
          @click="$emit('ns-confirm')"
          class="bg-primary"
        >
          {{ nsTaskButtonLabel }}
        </Button>
      </div>

      <transition name="expand">
        <div v-if="showOfferAssignmentSection" class="space-y-4">
          <OfferAssignmentTask
            ref="offerAssignmentTaskRef"
            :opportunity="opportunity"
            :scheduled-appointment="scheduledAppointment"
            @offer-created="$emit('offer-assignment-created', $event)"
            @cancel="$emit('offer-assignment-cancel')"
            @open-create-offer-modal="$emit('open-create-offer-modal')"
          />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CalendarCheck, CalendarDays, UserX, UserCheck } from 'lucide-vue-next'
import { Button, Toggle } from '@motork/component-library/future/primitives'
import { formatDateTime } from '@/utils/formatters'
import SecondaryActionsDropdown from '@/components/shared/SecondaryActionsDropdown.vue'
import OpportunityScheduleForm from '@/components/tasks/opportunity/OpportunityScheduleForm.vue'
import NS1Task from '@/components/tasks/opportunity/NS1Task.vue'
import NS2Task from '@/components/tasks/opportunity/NS2Task.vue'
import NS3Task from '@/components/tasks/opportunity/NS3Task.vue'
import OfferAssignmentTask from '@/components/tasks/opportunity/OfferAssignmentTask.vue'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  },
  scheduledAppointment: {
    type: Object,
    default: null
  },
  showRescheduleSection: {
    type: Boolean,
    default: false
  },
  showNsTaskSection: {
    type: Boolean,
    default: false
  },
  showOfferAssignmentSection: {
    type: Boolean,
    default: false
  },
  nsTaskCount: {
    type: Number,
    default: 0
  },
  canSubmitNsTask: {
    type: Boolean,
    default: false
  },
  nsTaskButtonLabel: {
    type: String,
    default: 'Assign'
  },
  canCreateOffer: {
    type: Boolean,
    default: false
  },
  secondaryActions: {
    type: Array,
    default: () => []
  },
  customerName: {
    type: String,
    default: ''
  },
  customerProfileUrl: {
    type: String,
    default: ''
  },
  isAppointmentToday: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'confirm-appointment',
  'update:show-reschedule-section',
  'update:show-ns-task-section',
  'update:show-offer-assignment-section',
  'mark-no-show',
  'mark-showed-up',
  'reschedule-submit',
  'reschedule-cancel',
  'ns-assigned',
  'ns-cancel',
  'ns-confirm',
  'ns-close-as-lost',
  'offer-assignment-created',
  'offer-assignment-cancel',
  'offer-assignment-confirm',
  'open-create-offer-modal',
  'secondary-action',
  'customer-click'
])

const scheduleFormRef = ref(null)
const ns1TaskRef = ref(null)
const ns2TaskRef = ref(null)
const ns3TaskRef = ref(null)
const offerAssignmentTaskRef = ref(null)

// Track which secondary action form is currently active (for forms that stay inline)
const activeSecondaryAction = ref(null)

function handleCustomerClick(event) {
  emit('customer-click', event)
}

function handleSecondaryActionSelected(action) {
  // Hide all inline sections (Reschedule, Mark No-Show, Mark Showed Up) so only the selected action's card shows
  emit('update:show-reschedule-section', false)
  emit('update:show-ns-task-section', false)
  emit('update:show-offer-assignment-section', false)
  activeSecondaryAction.value = null
  emit('secondary-action', action)
}

// Watch for prop changes to hide secondary action form when other sections are shown
watch(() => props.showRescheduleSection, (newVal) => {
  if (newVal) {
    activeSecondaryAction.value = null
  }
})

watch(() => props.showNsTaskSection, (newVal) => {
  if (newVal) {
    activeSecondaryAction.value = null
  }
})

watch(() => props.showOfferAssignmentSection, (newVal) => {
  if (newVal) {
    activeSecondaryAction.value = null
  }
})

// Expose refs for parent component
defineExpose({
  scheduleFormRef,
  ns1TaskRef,
  ns2TaskRef,
  ns3TaskRef,
  offerAssignmentTaskRef
})
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 5000px;
  opacity: 1;
}
</style>
