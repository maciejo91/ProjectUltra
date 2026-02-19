<template>
  <div class="overflow-hidden p-4 rounded-lg border border-border bg-background shadow-nsc-card">
    <div class="flex items-center justify-between gap-2 mb-2">
      <h3 class="text-base font-medium text-foreground leading-6 truncate min-w-0">
        {{ task.customer?.name || 'Unknown' }}
      </h3>
      <Button
        v-if="task.customer?.id"
        variant="ghost"
        size="icon"
        class="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Open customer profile"
        @click="openCustomerProfileInNewTab"
      >
        <ExternalLink :size="14" />
      </Button>
    </div>

    <div class="flex flex-col gap-1">
      <div v-if="phoneDisplay" class="flex items-center gap-2 min-w-0 min-h-8">
        <Phone class="size-4 shrink-0 text-muted-foreground" />
        <span class="text-sm text-foreground truncate min-w-0">{{ phoneDisplay }}</span>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Copy phone number"
          @click="copyToClipboard(task.customer.phone, 'phone')"
        >
          <Copy class="size-4" />
        </Button>
      </div>

      <div v-if="emailDisplay" class="flex items-center gap-2 min-w-0 min-h-8 select-none">
        <Mail class="size-4 shrink-0 text-muted-foreground" />
        <span class="text-sm text-foreground truncate min-w-0">{{ emailDisplay }}</span>
      </div>

      <div v-if="addressDisplay" class="flex items-center gap-2 min-w-0 min-h-8">
        <MapPin class="size-4 shrink-0 text-muted-foreground" />
        <span class="text-sm text-foreground wrap-break-word min-w-0">{{ addressDisplay }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { Button } from '@motork/component-library/future/primitives'
import { Copy, ExternalLink, Mail, MapPin, Phone } from 'lucide-vue-next'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  taskType: {
    type: String,
    default: 'lead'
  },
  customerId: {
    type: [Number, String],
    default: null
  }
})

const toastStore = useToastStore()
const router = useRouter()

const phoneDisplay = computed(() => props.task.customer?.phone || null)
const emailDisplay = computed(() => props.task.customer?.email || null)
const addressDisplay = computed(() => {
  const addr = props.task.customer?.address
  if (!addr) return null
  if (typeof addr === 'string') return addr
  const parts = [
    addr.streetLine1 || addr.streetAddress || addr.street,
    addr.streetLine2,
    [addr.city, addr.region, addr.postalCode].filter(Boolean).join(', '),
    addr.country
  ].filter(Boolean)
  return parts.join(', ') || null
})

async function copyToClipboard(text, field) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toastStore.pushToast('success', `${field === 'email' ? 'Email' : 'Phone'} copied!`)
  } catch {
    toastStore.pushToast('error', 'Failed to copy')
  }
}

function openCustomerProfileInNewTab() {
  const customerId = props.task.customer?.id || props.customerId
  if (customerId) {
    const url = router.resolve(`/customer/${customerId}`).href
    window.open(url, '_blank')
  }
}
</script>

