<template>
  <div class="bg-white rounded-lg p-4 shadow-nsc-card">
    <h5 class="font-semibold text-foreground text-sm mb-4">{{ t('forms.schedule.communications.title') }}</h5>
    
    <div class="space-y-4">
      <!-- Immediate Confirmation -->
      <div class="flex items-center gap-3">
        <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors flex-1">
          <Checkbox
            id="immediate-confirmation"
            v-model="communications.immediateConfirmationEnabled"
          />
          <span class="text-sm font-medium text-foreground">{{ t('forms.schedule.communications.immediateConfirmation') }}</span>
        </Label>
        <SelectMenu
          v-if="communications.immediateConfirmationEnabled"
          v-model="communications.immediateConfirmationChannels"
          :items="channelOptions"
          :multiple="true"
          :placeholder="t('forms.schedule.communications.selectChannels')"
          class="w-48"
        />
      </div>

      <!-- Reminder -->
      <div class="flex items-center gap-3">
        <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors flex-1">
          <Checkbox
            id="reminder"
            v-model="communications.reminderEnabled"
          />
          <span class="text-sm font-medium text-foreground">{{ t('forms.schedule.communications.reminderBeforeAppointment') }}</span>
        </Label>
        <SelectMenu
          v-if="communications.reminderEnabled"
          v-model="communications.reminderChannels"
          :items="channelOptions"
          :multiple="true"
          :placeholder="t('forms.schedule.communications.selectChannels')"
          class="w-48"
        />
      </div>

      <!-- Salesperson/Team Notification -->
      <Label class="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-muted/50 transition-colors">
        <Checkbox
          id="salesperson-notification"
          v-model="communications.salespersonNotification"
        />
        <span class="text-sm font-medium text-foreground">
          {{ salespersonNotificationLabel }}
        </span>
      </Label>
    </div>
    
    <!-- Action Buttons Slot -->
    <slot name="actions"></slot>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Checkbox, Label } from '@motork/component-library/future/primitives'
import { SelectMenu } from '@motork/component-library/future/components'

const { t } = useI18n()

const props = defineProps({
  appointment: {
    type: Object,
    required: true
  },
  customer: {
    type: Object,
    required: true
  },
  salesperson: {
    type: Object,
    default: null
  },
  team: {
    type: Object,
    default: null
  },
  dealership: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update'])

const channelOptions = computed(() => [
  { value: 'email', label: t('forms.schedule.communications.channels.email') },
  { value: 'sms', label: t('forms.schedule.communications.channels.sms') },
  { value: 'whatsapp', label: t('forms.schedule.communications.channels.whatsapp') }
])

const salespersonNotificationLabel = computed(() => {
  const name = props.salesperson?.name || props.team?.name || t('forms.schedule.communications.salespersonFallback')
  return t('forms.schedule.communications.salespersonNotification', { name })
})

const communications = ref({
  immediateConfirmationEnabled: true,
  immediateConfirmationChannels: ['email'],
  reminderEnabled: true,
  reminderChannels: ['email'],
  salespersonNotification: true
})

// Watch for changes and emit updates
watch(communications, (newVal) => {
  // Convert to nested structure for handler compatibility
  const nested = {
    immediateConfirmation: {
      enabled: newVal.immediateConfirmationEnabled,
      channels: newVal.immediateConfirmationEnabled && newVal.immediateConfirmationChannels?.length > 0
        ? newVal.immediateConfirmationChannels
        : []
    },
    reminder: {
      enabled: newVal.reminderEnabled,
      channels: newVal.reminderEnabled && newVal.reminderChannels?.length > 0
        ? newVal.reminderChannels
        : []
    },
    salespersonNotification: {
      enabled: newVal.salespersonNotification
    }
  }
  
  emit('update', nested)
}, { deep: true })
</script>

