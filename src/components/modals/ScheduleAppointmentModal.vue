<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col bg-muted">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Schedule Appointment</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-4 py-4 w-full">
          <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden">
            <div class="p-6">
              <OpportunityScheduleForm
                v-if="opportunity || lead"
                :key="formKey"
                :opportunity="opportunity || lead"
                :mode="mode"
                :initial-appointment="initialAppointment"
                @submit="handleSubmit"
                @cancel="handleCancel"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import OpportunityScheduleForm from '@/components/tasks/opportunity/OpportunityScheduleForm.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  opportunity: {
    type: Object,
    required: false,
    default: null
  },
  lead: {
    type: Object,
    required: false,
    default: null
  },
  mode: {
    type: String,
    validator: (v) => ['schedule', 'reschedule'].includes(v),
    default: 'schedule'
  },
  initialAppointment: {
    type: Object,
    default: null
  },
  preselectedAssignee: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel', 'confirm', 'close'])

const formKey = ref(0)

watch(() => props.show, (val) => {
  if (val) formKey.value += 1
})

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    handleCancel()
  }
}

const handleSubmit = (payload) => {
  emit('submit', payload)
  emit('confirm', payload) // Also emit confirm for lead compatibility
}

const handleCancel = () => {
  emit('cancel')
  emit('close') // Also emit close for lead compatibility
}
</script>
