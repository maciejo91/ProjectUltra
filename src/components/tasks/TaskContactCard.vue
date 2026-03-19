<template>
  <div class="overflow-hidden p-4 rounded-lg border border-border bg-background shadow-nsc-card">
    <div class="flex items-center gap-3 min-w-0 mb-2">
      <div
        class="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-semibold shrink-0"
      >
        {{ customerInitials }}
      </div>
      <div class="flex-1 flex flex-col gap-1 min-w-0">
        <div class="flex items-center gap-1.5 min-w-0">
          <h3 class="text-base font-medium text-foreground leading-6 truncate min-w-0">
            {{ task.customer?.name || 'Unknown' }}
          </h3>
          <Button
            v-if="task.customer?.id"
            variant="ghost"
            size="icon"
            class="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Open customer profile"
            @click="openCustomerProfileInNewTab"
          >
            <ExternalLink class="size-4" />
          </Button>
        </div>
        <div v-if="task.customer?.isBusiness || (task.customer?.tags?.length > 0)" class="flex flex-wrap gap-1.5 items-center min-w-0">
          <span
            v-if="task.customer?.isBusiness"
            class="inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-semibold uppercase leading-none badge-ui bg-muted text-muted-foreground"
          >
            Business
          </span>
          <span
            v-for="tag in (task.customer?.tags || [])"
            :key="tag"
            class="inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-semibold leading-none badge-ui bg-muted text-muted-foreground"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      <Button
        v-if="task.customer?.id && !isEditing"
        variant="ghost"
        size="icon"
        class="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Edit customer"
        @click="startEditing"
      >
        <Pencil class="size-3.5" />
      </Button>
    </div>

    <!-- View mode -->
    <template v-if="!isEditing">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2 min-w-0 min-h-8 select-none">
          <Mail class="size-4 shrink-0 text-muted-foreground" />
          <span class="text-sm text-foreground truncate min-w-0">{{ emailDisplay || '—' }}</span>
        </div>

        <div class="flex items-center gap-2 min-w-0 min-h-8">
          <Phone class="size-4 shrink-0 text-muted-foreground" />
          <template v-if="phoneDisplay">
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
          </template>
          <span v-else class="text-sm text-muted-foreground">—</span>
        </div>

        <div class="flex items-center gap-2 min-w-0 min-h-8">
          <MapPin class="size-4 shrink-0 text-muted-foreground" />
          <span class="text-sm text-foreground wrap-break-word min-w-0">{{ addressDisplay || '—' }}</span>
        </div>
      </div>
    </template>

    <!-- Edit mode: inline form for all fields -->
    <div v-else class="flex flex-col gap-3">
      <div class="space-y-2">
        <Label class="text-xs font-medium text-muted-foreground">Name</Label>
        <Input
          v-model="editForm.name"
          type="text"
          placeholder="Customer name"
          class="h-8 text-sm"
        />
      </div>
      <div class="space-y-2">
        <Label class="text-xs font-medium text-muted-foreground">Email</Label>
        <Input
          v-model="editForm.email"
          type="email"
          placeholder="email@example.com"
          class="h-8 text-sm"
          autocomplete="email"
        />
      </div>
      <div class="space-y-2">
        <Label class="text-xs font-medium text-muted-foreground">Phone</Label>
        <Input
          v-model="editForm.phone"
          type="tel"
          placeholder="+49..."
          class="h-8 text-sm"
          autocomplete="tel"
        />
      </div>
      <div class="space-y-2">
        <Label class="text-xs font-medium text-muted-foreground">Address</Label>
        <Input
          v-model="editForm.address"
          type="text"
          placeholder="Address"
          class="h-8 text-sm"
        />
      </div>
      <div class="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="small"
          class="flex-1"
          @click="cancelEditing"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          size="small"
          class="flex-1"
          :disabled="saveDisabled || saving"
          @click="saveEdit"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { useCustomersStore } from '@/stores/customers'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { Button, Input, Label } from '@motork/component-library/future/primitives'
import { Copy, ExternalLink, Mail, MapPin, Pencil, Phone } from 'lucide-vue-next'

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
const userStore = useUserStore()
const router = useRouter()
const customersStore = useCustomersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const isEditing = ref(false)
const saving = ref(false)
const editForm = ref({ name: '', phone: '', email: '', address: '' })

watch(
  () => props.task.customer,
  (customer) => {
    if (customer && !isEditing.value) {
      const addr = customer.address
      const addressStr =
        typeof addr === 'string'
          ? addr
          : addr
            ? [
                addr.streetLine1 || addr.streetAddress || addr.street,
                addr.streetLine2,
                [addr.city, addr.region, addr.postalCode].filter(Boolean).join(', '),
                addr.country
              ]
                .filter(Boolean)
                .join(', ')
            : ''
      editForm.value = {
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: addressStr
      }
    }
  },
  { immediate: true }
)

const saveDisabled = computed(() => !(editForm.value.name ?? '').trim())

const customerInitials = computed(() => {
  const name = props.task.customer?.name || ''
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})

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

function startEditing() {
  const c = props.task.customer
  if (!c) return
  const addr = c.address
  const addressStr =
    typeof addr === 'string'
      ? addr
      : addr
        ? [
            addr.streetLine1 || addr.streetAddress || addr.street,
            addr.streetLine2,
            [addr.city, addr.region, addr.postalCode].filter(Boolean).join(', '),
            addr.country
          ]
            .filter(Boolean)
            .join(', ')
        : ''
  editForm.value = {
    name: c.name || '',
    phone: c.phone || '',
    email: c.email || '',
    address: addressStr
  }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

async function saveEdit() {
  const customerId = props.task.customer?.id || props.customerId
  const leadId = props.task.id
  if (!customerId || saveDisabled.value) return
  const hadNoPhone =
    props.taskType === 'lead' && !(props.task.customer?.phone ?? '').trim()
  const phoneAdded = !!(editForm.value.phone ?? '').trim()
  saving.value = true
  try {
    await customersStore.modifyContact(customerId, {
      name: (editForm.value.name ?? '').trim(),
      phone: (editForm.value.phone ?? '').trim() || null,
      email: (editForm.value.email ?? '').trim() || null,
      address: (editForm.value.address ?? '').trim() || null
    })
    if (leadId) {
      if (props.taskType === 'lead') {
        await leadsStore.fetchLeadById(leadId)
        if (hadNoPhone && phoneAdded) {
          await leadsStore.addActivity(leadId, {
            type: 'note',
            user: userStore.currentUser?.name || 'You',
            content:
              'Phone number added. Lead moved from email qualification to call verification. Previous email conversations are recorded in activity history.',
            timestamp: new Date().toISOString()
          })
        }
      } else if (props.taskType === 'opportunity') {
        await opportunitiesStore.fetchOpportunityById(leadId)
      }
    }
    isEditing.value = false
    toastStore.pushToast('success', 'Customer updated')
  } catch {
    toastStore.pushToast('error', 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

