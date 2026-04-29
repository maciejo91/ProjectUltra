<template>
  <div
    class="flex size-6 shrink-0 items-center justify-center rounded-full"
    :class="badgeClass"
    aria-hidden="true"
  >
    <component :is="icon" :size="16" class="shrink-0" :class="iconClass" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  StickyNote,
  PhoneOutgoing,
  Mail,
  MessageCircle,
  Sparkles,
  Calendar,
  Info,
  FileText
} from 'lucide-vue-next'
import { getActivityIconKind } from '@/composables/useActivityTimelinePresentation'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const kind = computed(() => getActivityIconKind(props.activity))

const icon = computed(() => {
  switch (kind.value) {
    case 'note':
      return StickyNote
    case 'call':
      return PhoneOutgoing
    case 'email':
      return Mail
    case 'message':
      return MessageCircle
    case 'messageGreen':
      return MessageCircle
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
      return 'bg-orange-50'
    case 'call':
      return 'bg-green-50'
    case 'email':
      return 'bg-blue-50'
    case 'message':
      return 'bg-blue-50'
    case 'messageGreen':
      return 'bg-green-50'
    case 'ai':
      return 'bg-purple-50'
    case 'appointment':
      return 'bg-purple-50'
    case 'system':
      return 'bg-muted'
    default:
      return 'bg-muted'
  }
})

const iconClass = computed(() => {
  switch (kind.value) {
    case 'note':
      return 'text-orange-600'
    case 'call':
      return 'text-green-600'
    case 'email':
      return 'text-blue-600'
    case 'message':
      return 'text-blue-600'
    case 'messageGreen':
      return 'text-green-600'
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
