<template>
  <div
    class="flex size-8 shrink-0 items-center justify-center rounded-lg"
    :class="badgeClass"
    aria-hidden="true"
  >
    <component :is="icon" :size="18" class="shrink-0" :class="iconClass" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  StickyNote,
  PhoneIncoming,
  PhoneOutgoing,
  Mail,
  MessageCircle,
  Sparkles,
  Calendar,
  Info,
  FileText
} from 'lucide-vue-next'
import { getActivityIconKind } from '@/composables/useActivityTimelinePresentation'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon.vue'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const kind = computed(() => getActivityIconKind(props.activity))

const isWhatsapp = computed(() => ['whatsapp', 'customer-whatsapp'].includes(props.activity?.type))

const isInboundCall = computed(() => {
  const a = props.activity
  const explicit = String(a?.data?.direction || '').toLowerCase()
  if (explicit === 'inbound') return true
  if (explicit === 'outbound') return false
  const action = `${a?.action ?? ''} ${a?.message ?? ''} ${a?.content ?? ''}`.toLowerCase()
  if (action.includes('inbound')) return true
  if (action.includes('outbound')) return false
  return false
})

const icon = computed(() => {
  switch (kind.value) {
    case 'note':
      return StickyNote
    case 'call':
      return isInboundCall.value ? PhoneIncoming : PhoneOutgoing
    case 'callMissed':
      return isInboundCall.value ? PhoneIncoming : PhoneOutgoing
    case 'email':
      return Mail
    case 'message':
      return MessageCircle
    case 'messageGreen':
      return isWhatsapp.value ? WhatsAppIcon : MessageCircle
    case 'ai':
      return Sparkles
    case 'appointment':
      return Calendar
    case 'system':
      return Info
    default:
      return FileText
  }
})

const badgeClass = computed(() => {
  switch (kind.value) {
    case 'note':
      return 'bg-amber-100'
    case 'call':
      return 'bg-blue-100/60'
    case 'callMissed':
      return 'bg-blue-100/60'
    case 'email':
      return 'bg-purple-100'
    case 'message':
      return 'bg-green-100'
    case 'messageGreen':
      return isWhatsapp.value ? 'bg-green-100' : 'bg-slate-100'
    case 'ai':
      return 'bg-purple-100'
    case 'appointment':
      return 'bg-purple-100'
    case 'system':
      return 'bg-muted'
    default:
      return 'bg-muted'
  }
})

const iconClass = computed(() => {
  switch (kind.value) {
    case 'note':
      return 'text-amber-700'
    case 'call':
      return 'text-blue-600'
    case 'callMissed':
      return 'text-blue-600'
    case 'email':
      return 'text-purple-600'
    case 'message':
      return 'text-green-600'
    case 'messageGreen':
      return isWhatsapp.value ? 'text-green-600' : 'text-slate-700'
    case 'ai':
      return 'text-purple-600'
    case 'appointment':
      return 'text-purple-600'
    case 'system':
      return 'text-muted-foreground'
    default:
      return 'text-foreground'
  }
})
</script>
