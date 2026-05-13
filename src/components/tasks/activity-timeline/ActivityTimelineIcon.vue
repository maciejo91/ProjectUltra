<template>
  <div
    class="box-border flex size-6 shrink-0 items-center justify-center rounded-md"
    :class="badgeClass"
    aria-hidden="true"
  >
    <component :is="icon" :size="iconSize" class="shrink-0" :class="iconClass" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  StickyNote,
  Phone,
  PhoneOff,
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

const iconSize = computed(() => {
  if (kind.value === 'messageGreen' && isWhatsapp.value) return 17
  if (kind.value === 'system') return 16
  return 14
})

const icon = computed(() => {
  switch (kind.value) {
    case 'note':
      return StickyNote
    case 'call':
      return Phone
    case 'callMissed':
      return PhoneOff
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
      return 'bg-amber-600'
    case 'call':
    case 'callMissed':
      return 'bg-blue-600'
    case 'email':
      return 'bg-purple-600'
    case 'message':
      return 'bg-green-600'
    case 'messageGreen':
      return isWhatsapp.value ? 'bg-emerald-600' : 'bg-slate-600'
    case 'ai':
      return 'bg-violet-600'
    case 'appointment':
      return 'bg-indigo-600'
    case 'system':
      return 'bg-muted border border-border'
    default:
      return 'bg-muted border border-border'
  }
})

const iconClass = computed(() => {
  if (kind.value === 'system') return 'text-muted-foreground'
  if (kind.value === 'file') return 'text-foreground'
  return 'text-white'
})
</script>
