<template>
  <div v-if="!inline" class="space-y-4">
    <!-- Channel Selector -->
    <div class="followup-channel-toggle-group flex flex-wrap gap-2">
      <Toggle
        v-for="channel in channels"
        :key="channel.id"
        variant="outline"
        :model-value="selectedChannel === channel.id"
        @update:model-value="(p) => p && setSelectedChannel(channel.id)"
        class="followup-toggle-item"
      >
        <component :is="getLucideIcon(channel.icon)" class="w-3 h-3 shrink-0" />
        <span>{{ channel.label }}</span>
      </Toggle>
    </div>
    
    <!-- Call form: same width as selection card -->
    <template v-if="selectedChannel === 'call'">
      <div class="w-full min-w-0">
        <CallForm
          :phone-number="phoneNumber"
          :contact-name="contactName"
          @call="handleCall"
          @cancel="handleCancel"
        />
      </div>
    </template>
    <div v-else-if="selectedChannel" class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <EmailForm
        v-if="selectedChannel === 'email'"
        :initial-template="initialTemplate"
        :initial-message="initialMessage"
        @send="handleSend"
        @cancel="handleCancel"
      />
      
      <SMSForm
        v-else-if="selectedChannel === 'sms'"
        :initial-template="initialTemplate"
        :initial-message="initialMessage"
        @send="handleSend"
        @cancel="handleCancel"
      />
      
      <WhatsAppForm
        v-else-if="selectedChannel === 'whatsapp'"
        :initial-template="initialTemplate"
        :initial-message="initialMessage"
        @send="handleSend"
        @cancel="handleCancel"
      />
    </div>
  </div>

  <!-- Inline version: selection card + form card below (form not inside selection card) -->
  <div v-else class="space-y-4">
    <!-- Card 1: Channel selection only -->
    <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <div v-if="selectionCardTitle || selectionCardDescription" class="space-y-1.5 mb-4">
        <h2 v-if="selectionCardTitle" class="text-sm font-semibold leading-5 text-foreground">{{ selectionCardTitle }}</h2>
        <p v-if="selectionCardDescription" class="text-sm text-muted-foreground">{{ selectionCardDescription }}</p>
      </div>
      <div class="followup-channel-toggle-group flex flex-wrap gap-2">
        <Toggle
          v-for="channel in channels"
          :key="channel.id"
          variant="outline"
          :model-value="selectedChannel === channel.id"
          @update:model-value="(p) => p && setSelectedChannel(channel.id)"
          class="followup-toggle-item"
        >
          <component :is="getLucideIcon(channel.icon)" class="w-3 h-3 shrink-0" />
          <span>{{ channel.label }}</span>
        </Toggle>
      </div>
    </div>

    <!-- Call form: same width as selection card above -->
    <template v-if="selectedChannel === 'call'">
      <div class="w-full min-w-0">
        <CallForm
          :phone-number="phoneNumber"
          :contact-name="contactName"
          @call="handleCall"
          @cancel="handleCancel"
        />
      </div>
    </template>
    <div v-else-if="selectedChannel" class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
      <EmailForm
        v-if="selectedChannel === 'email'"
        :initial-template="initialTemplate"
        :initial-message="initialMessage"
        @send="handleSend"
        @cancel="handleCancel"
      />
      
      <SMSForm
        v-else-if="selectedChannel === 'sms'"
        :initial-template="initialTemplate"
        :initial-message="initialMessage"
        @send="handleSend"
        @cancel="handleCancel"
      />
      
      <WhatsAppForm
        v-else-if="selectedChannel === 'whatsapp'"
        :initial-template="initialTemplate"
        :initial-message="initialMessage"
        @send="handleSend"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Toggle } from '@motork/component-library/future/primitives'
import { getLucideIcon } from '@/utils/lucideIcons'
import EmailForm from '@/components/shared/communication/EmailForm.vue'
import SMSForm from '@/components/shared/communication/SMSForm.vue'
import WhatsAppForm from '@/components/shared/communication/WhatsAppForm.vue'
import CallForm from '@/components/shared/communication/CallForm.vue'

const props = defineProps({
  type: {
    type: String,
    default: null
  },
  taskType: {
    type: String,
    default: 'lead'
  },
  taskId: {
    type: [Number, String],
    default: null
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  contactName: {
    type: String,
    default: 'Customer'
  },
  showArrow: {
    type: Boolean,
    default: true
  },
  inline: {
    type: Boolean,
    default: false
  },
  selectionCardTitle: {
    type: String,
    default: ''
  },
  selectionCardDescription: {
    type: String,
    default: ''
  },
  initialTemplate: {
    type: String,
    default: ''
  },
  initialMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['save', 'cancel', 'send'])

const channels = [
  { id: 'call', label: 'Call', icon: 'fa-solid fa-phone' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'fa-brands fa-whatsapp' },
  { id: 'email', label: 'Email', icon: 'fa-solid fa-envelope' },
  { id: 'sms', label: 'SMS', icon: 'fa-solid fa-message' }
]

// Initialize selected channel from prop; default to 'call' when not specified (e.g. Communicate tab)
const selectedChannel = ref(props.type ?? 'call')

// Watch for prop changes to update selected channel
watch(() => props.type, (newType) => {
  selectedChannel.value = newType ?? 'call'
})

// Reset selection when task changes (e.g. navigate to different entity)
watch(() => props.taskId, () => {
  selectedChannel.value = props.type ?? 'call'
})

function setSelectedChannel(id) {
  selectedChannel.value = id
}

const handleSend = (data) => {
  // Emit both 'save' (for customer profile) and 'send' (for compatibility)
  emit('save', {
    type: 'communication',
    action: `sent via ${data.type}`,
    content: data.message,
    communicationType: data.type,
    template: data.template,
    subject: data.subject // For emails
  })
  
  // Also emit 'send' for compatibility with CommunicationSelector usage
  emit('send', data)
}

const handleCall = (data) => {
  const action =
    data.option === 'log' && data.outcome
      ? `Logged call (${data.outcome === 'answer' ? 'Answer' : data.outcome === 'no-answer' ? 'No answer' : 'Not valid'})`
      : `called via ${data.option}`
  emit('save', {
    type: 'communication',
    action,
    content: data.notes || 'Call attempt logged',
    communicationType: 'call',
    callOption: data.option,
    outcome: data.outcome ?? undefined,
    callLogDateTime: data.callLogDateTime ?? undefined,
    timestamp: data.callLogDateTime ? new Date(data.callLogDateTime).toISOString() : undefined
  })

  emit('send', {
    type: 'call',
    option: data.option,
    phoneNumber: data.phoneNumber,
    notes: data.notes,
    outcome: data.outcome,
    callLogDateTime: data.callLogDateTime
  })
}

const handleCancel = () => {
  selectedChannel.value = 'call'
  emit('cancel')
}
</script>
