<template>
  <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-4">
    <EmailForm
      :initial-from="userStore.currentUser?.email || ''"
      :initial-to="lead.customer?.email || ''"
      :recipient-customer-id="lead.customerId ?? lead.customer?.id ?? null"
      :initial-template="initialTemplate"
      :initial-message="initialMessage"
      :recent-attachments="recentAttachments"
      @send="handleSend"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EmailForm from '@/components/shared/communication/EmailForm.vue'
import { useLeadsStore } from '@/stores/leads'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  lead: {
    type: Object,
    required: true
  },
  contactName: {
    type: String,
    default: 'the customer'
  },
  initialTemplate: {
    type: String,
    default: ''
  },
  initialMessage: {
    type: String,
    default: ''
  },
  recentAttachments: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['email-sent'])

const leadsStore = useLeadsStore()
const userStore = useUserStore()
const sending = ref(false)

async function handleSend(data) {
  if (!props.lead?.id) return
  sending.value = true
  try {
    const activity = {
      type: 'email',
      user: userStore.currentUser?.name || 'You',
      action: 'sent an email',
      content: data.message || 'Email sent',
      subject: data.subject,
      template: data.template,
      attachments: data.attachments,
      timestamp: new Date().toISOString()
    }
    await leadsStore.addActivity(props.lead.id, activity)
    await leadsStore.fetchLeadById(props.lead.id)
    emit('email-sent')
  } finally {
    sending.value = false
  }
}
</script>
