<template>
  <div class="rounded-lg border border-border bg-card overflow-hidden shadow-mk-dashboard-card h-full flex flex-col">
    <div v-if="customer" class="p-4 flex flex-col">
      <!-- Top row: Avatar + Name + Location -->
      <div class="flex items-start gap-3 min-w-0">
        <div
          class="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white text-sm font-semibold shrink-0"
        >
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-base font-semibold text-foreground leading-tight truncate">
            {{ customerName }}
          </h2>
          <div v-if="location" class="mt-1.5">
            <span class="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground">
              {{ location }}
            </span>
          </div>
        </div>
        <Button
          v-if="customerId"
          variant="ghost"
          size="icon"
          class="w-8 h-8 shrink-0 text-muted-foreground hover:text-foreground"
          title="View profile"
          @click="openProfile"
        >
          <ExternalLink class="size-3 text-muted-foreground" />
        </Button>
      </div>

      <!-- Full-width separator -->
      <div class="border-t border-border my-4 w-full" />

      <!-- Contact details below -->
      <div class="flex flex-col gap-1.5">
        <a
          v-if="email"
          :href="`mailto:${email}`"
          class="text-sm text-foreground hover:text-primary hover:underline truncate flex items-center gap-2"
        >
          <Mail class="size-4 shrink-0 text-muted-foreground" />
          <span class="truncate">{{ email }}</span>
        </a>
        <CallInterface
          v-if="showCallPanel"
          :hide-button="true"
          :show-mute-button="false"
          :is-call-active="isCallActive"
          :call-ended="callEnded"
          :call-duration="callDuration"
          :call-notes="callNotes"
          :formatted-call-duration="formattedCallDuration"
          :mock-transcription="mockTranscription"
          :contact-attempts="0"
          :max-contact-attempts="3"
          :lead-summary="''"
          :caller-name="customerName"
          :assigned-person-name="assignedPersonName"
          :is-muted="isMuted"
          @start-call="startCall"
          @end-call="endCall"
          @close="onCallClose"
          @toggle-mute="toggleMute"
          @extract-information="() => {}"
          @update:call-notes="updateCallNotes"
          @copy-number="copyPhone"
        />
        <div v-if="phone" class="flex items-center gap-2 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            class="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            :aria-label="t('common.call.startAria')"
            @click="openCallWidget"
          >
            <Phone class="size-4" />
          </Button>
          <a
            :href="`tel:${phone}`"
            class="text-sm text-foreground hover:text-primary hover:underline truncate flex items-center gap-2 min-w-0"
          >
            <span class="truncate">{{ phone }}</span>
          </a>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Copy phone number"
            @click="copyPhone"
          >
            <Copy class="size-4" />
          </Button>
        </div>
        <p
          v-if="!email && !phone"
          class="text-sm text-muted-foreground"
        >
          No contact details
        </p>
      </div>
    </div>
    <p v-else class="p-4 text-sm text-muted-foreground">No customer info</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Button } from '@motork/component-library/future/primitives'
import { Copy, ExternalLink, Mail, Phone } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import CallInterface from '@/components/tasks/lead/CallInterface.vue'
import { useLQWidgetCall } from '@/composables/useLQWidgetCall'

const props = defineProps({
  request: {
    type: Object,
    default: null
  }
})

const { t } = useI18n()
const router = useRouter()
const toastStore = useToastStore()
const userStore = useUserStore()

const customer = computed(() => props.request?.customer || null)

const customerId = computed(() => {
  const id = props.request?.customerId ?? customer.value?.id
  return id != null ? parseInt(id, 10) : null
})

const customerName = computed(() => {
  const c = customer.value
  if (!c) return '—'
  if (c.name) return c.name
  if (c.firstName || c.lastName) return [c.firstName, c.lastName].filter(Boolean).join(' ').trim()
  if (c.email) return c.email.split('@')[0] || '—'
  return '—'
})

const initials = computed(() => {
  const c = customer.value
  if (c?.initials) return c.initials
  const name = customerName.value
  if (!name || name === '—') return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
})

const email = computed(() => customer.value?.email || '')

const phone = computed(() => customer.value?.phone || '')

const location = computed(() => {
  const c = customer.value
  if (!c) return ''
  const addr = c.address
  if (typeof addr === 'string') return addr
  if (typeof addr === 'object' && addr) {
    return [addr.streetLine1, addr.city, addr.country].filter(Boolean).join(', ')
  }
  return c.city || c.location || ''
})

async function copyPhone() {
  if (!phone.value) return
  try {
    await navigator.clipboard.writeText(phone.value)
    toastStore.pushToast('success', 'Phone number copied')
  } catch {
    toastStore.pushToast('error', 'Failed to copy')
  }
}

const showCallPanel = ref(false)
const assignedPersonName = computed(() => userStore.currentUser?.name ?? '')

const callState = useLQWidgetCall()
const {
  isCallActive,
  callEnded,
  callDuration,
  callNotes,
  isMuted,
  mockTranscription,
  formattedCallDuration,
  startCall,
  endCall,
  toggleMute,
  resetCall
} = callState

function openCallWidget() {
  if (!phone.value) return
  showCallPanel.value = true
  startCall()
}

function updateCallNotes(value) {
  callNotes.value = value
}

function onCallClose() {
  resetCall()
  showCallPanel.value = false
}

function openProfile() {
  if (!customerId.value) return
  const route = router.resolve({
    path: `/customer/${customerId.value}`,
    query: { type: 'contact' }
  })
  window.open(route.href, '_blank')
}
</script>
