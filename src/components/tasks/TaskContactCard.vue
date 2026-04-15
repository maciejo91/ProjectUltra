<template>
  <div
    class="overflow-hidden"
    :class="embeddedInCard ? '' : 'rounded-lg bg-background'"
  >
    <template v-if="!isEditing">
      <div class="flex flex-col gap-2 px-4 py-4">
        <div class="flex w-full min-w-0 items-start justify-between gap-3">
          <div class="flex min-w-0 flex-1 gap-2">
            <TooltipProvider :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <Avatar
                    class="size-10 shrink-0 cursor-default rounded-full bg-muted"
                    :aria-label="t('requestDetail.contactCard.privateCustomerTooltip')"
                  >
                    <AvatarFallback class="bg-muted text-muted-foreground">
                      <User class="size-5" aria-hidden />
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" class="max-w-xs">
                  {{ t('requestDetail.contactCard.privateCustomerTooltip') }}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div class="min-w-0 flex-1">
              <div class="flex min-w-0 items-center justify-between gap-2">
                <p
                  class="min-w-0 flex flex-wrap items-baseline gap-x-1 gap-y-1 px-1.5 text-base font-medium leading-5 text-foreground wrap-break-word"
                >
                  <span>{{ nameParts.primary || '—' }}</span>
                  <span
                    v-if="nameParts.location || showContactDuplicateWarning"
                    class="inline-flex flex-wrap items-center gap-1.5 text-muted-foreground"
                  >
                    <span v-if="nameParts.location">{{ ' ' }}{{ nameParts.location }}</span>
                    <TooltipProvider v-if="showContactDuplicateWarning" :delay-duration="200">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <button
                            type="button"
                            class="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-destructive shadow-sm"
                            :aria-label="t('requestDetail.contactCard.openDuplicateContactsProfileAria')"
                            @click.stop="navigateToCustomerDuplicateProfile"
                          >
                            <AlertTriangle class="size-3.5 shrink-0 pointer-events-none" aria-hidden />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start" class="max-w-xs">
                          {{ t('requestDetail.contactCard.possibleContactDuplicates') }}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </p>

                <div
                  v-if="showQuickActions"
                  class="shrink-0 flex flex-wrap items-center justify-end gap-0.5"
                >
                  <template v-for="item in quickActionItems" :key="item.kind || item.key">
                    <MessagingQuickActionPopover
                      v-if="item.kind === 'messaging'"
                      @select="emitQuick($event)"
                    />
                    <Button
                      v-else
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      class="shrink-0 rounded-md"
                      :aria-label="item.label"
                      @click="emitQuick(item.key)"
                    >
                      <component :is="item.icon" class="size-4 text-muted-foreground" />
                    </Button>
                  </template>
                </div>
              </div>

              <div class="mt-0 flex flex-wrap items-center gap-x-2 gap-y-1">
                <div class="flex min-w-0 max-w-full items-center gap-0">
                  <span
                    class="inline-flex size-6 shrink-0 items-center justify-center rounded-md"
                    aria-hidden
                  >
                    <Mail class="size-3.5 text-muted-foreground" />
                  </span>
                  <span class="min-w-0 truncate text-sm text-muted-foreground">{{
                    emailDisplay || '—'
                  }}</span>
                </div>
                <div class="flex min-w-0 max-w-full items-center gap-0">
                  <span
                    class="inline-flex size-6 shrink-0 items-center justify-center rounded-md"
                    aria-hidden
                  >
                    <Phone class="size-3.5 text-muted-foreground" />
                  </span>
                  <span class="min-w-0 truncate text-sm text-muted-foreground">{{
                    phoneDisplay || '—'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showTagsOrMetaRow" class="flex w-full min-w-0 flex-col gap-2">
          <div class="flex w-full min-w-0 flex-wrap items-center gap-2">
            <div
              v-if="task.customer"
              class="flex min-w-0 flex-1 flex-wrap items-center gap-1 pl-12"
            >
              <span
                v-if="task.customer?.isBusiness"
                class="badge-ui inline-flex w-fit items-center rounded-md px-2 py-0.5 text-sm font-medium leading-none bg-muted text-muted-foreground"
              >
                {{ t('requestDetail.contactCard.businessTag') }}
              </span>
              <TagPillWithPopover
                v-for="(tag, tagIdx) in normalizedCustomerTags"
                :key="`${tag.name}-${tagIdx}`"
                :tag="tag"
                @edit="emit('edit-customer-tag', $event)"
                @delete="emit('delete-customer-tag', $event)"
              >
                <template #trigger>
                  <button
                    v-if="tag.color"
                    type="button"
                    class="badge-ui inline-flex w-fit max-w-full min-w-0 cursor-pointer items-center truncate rounded-md border-0 px-2 py-0.5 text-sm font-medium leading-none"
                    :class="isLightTagColor(tag.color) ? 'text-foreground' : 'text-white'"
                    :style="{ backgroundColor: tag.color }"
                  >
                    {{ tag.name }}
                  </button>
                  <button
                    v-else
                    type="button"
                    class="badge-ui inline-flex w-fit cursor-pointer items-center rounded-md border-0 px-2 py-0.5 text-sm font-medium leading-none"
                    :class="tagBadgeClass(tag.name)"
                  >
                    {{ tag.name }}
                  </button>
                </template>
              </TagPillWithPopover>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="size-6 rounded-md text-muted-foreground"
                :aria-label="t('requestDetail.contactCard.addTag')"
                @click="emit('add-tag')"
              >
                <Plus class="size-3" />
              </Button>
            </div>
            <div v-else class="min-w-0 flex-1" />

            <div class="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              <div v-if="showQuickActions && interactionCount > 0" class="shrink-0">
                <DropdownMenu :modal="false">
                  <DropdownMenuTrigger as-child>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      class="max-w-full shrink-0 gap-1 text-sm"
                    >
                      <span class="truncate">{{ activityMenuLabel }}</span>
                      <ChevronDown class="size-3 shrink-0 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="min-w-56 p-1.5">
                    <DropdownMenuItem
                      v-for="act in recentInteractions"
                      :key="interactionKey(act)"
                      class="cursor-pointer rounded-sm px-2 py-1.5 text-sm"
                      @select="emit('open-activity', act)"
                    >
                      {{ formatActivityLine(act) }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                v-if="showPastRequestsSection"
                type="button"
                variant="secondary"
                size="sm"
                class="max-w-full shrink-0 justify-between gap-1 text-left text-sm"
                :aria-expanded="pastRequestsOpen"
                :aria-controls="pastRequestsPanelId"
                @click="pastRequestsOpen = !pastRequestsOpen"
              >
                <span class="min-w-0 truncate">{{
                  t('customerProfile.rightColumn.otherInteractions', { count: pastRequestRows.length })
                }}</span>
                <ChevronDown
                  class="size-3 shrink-0 opacity-70 transition-transform duration-200"
                  :class="{ 'rotate-180': pastRequestsOpen }"
                />
              </Button>
            </div>
          </div>

          <Transition name="task-contact-past-requests">
            <div
              v-if="showPastRequestsSection && pastRequestsOpen"
              :id="pastRequestsPanelId"
              class="flex flex-col gap-1.5 border-t border-border pt-2 pl-12 pr-0"
              role="region"
              :aria-label="t('customerProfile.rightColumn.otherInteractionsRegion')"
            >
              <button
                v-for="item in pastRequestRows"
                :key="item.compositeId"
                type="button"
                class="flex w-full min-w-0 items-start justify-between gap-2 rounded-md border border-border bg-muted/20 p-2 text-left transition-colors hover:bg-muted/40"
                @click="handlePastRequestClick(item)"
              >
                <div class="min-w-0 flex-1">
                  <span class="text-sm font-medium leading-tight text-foreground">{{ item.title }}</span>
                  <span v-if="item.subtitle" class="mt-0.5 block text-sm text-muted-foreground">{{
                    item.subtitle
                  }}</span>
                </div>
                <div class="flex shrink-0 flex-col items-end gap-0.5 text-right">
                  <Badge
                    variant="secondary"
                    class="h-5 px-1.5 py-0 text-sm font-medium leading-none"
                    :class="
                      item.type === 'lead'
                        ? 'bg-badge-green text-emerald-700'
                        : 'bg-purple-50 text-purple-700'
                    "
                  >
                    {{
                      item.type === 'lead'
                        ? t('customerProfile.rightColumn.typeLead')
                        : t('customerProfile.rightColumn.typeOpportunity')
                    }}
                  </Badge>
                  <span class="text-sm leading-none text-muted-foreground">{{ item.stage }}</span>
                </div>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col gap-3">
      <div class="space-y-2">
        <Label class="text-sm font-medium text-muted-foreground">{{
          t('requestDetail.contactCard.fields.name')
        }}</Label>
        <Input
          v-model="editForm.name"
          type="text"
          class="h-8 text-sm"
          :placeholder="t('requestDetail.contactCard.placeholders.name')"
        />
      </div>
      <div class="space-y-2">
        <Label class="text-sm font-medium text-muted-foreground">{{
          t('requestDetail.contactCard.fields.email')
        }}</Label>
        <Input
          v-model="editForm.email"
          type="email"
          class="h-8 text-sm"
          :placeholder="t('requestDetail.contactCard.placeholders.email')"
          autocomplete="email"
        />
      </div>
      <div class="space-y-2">
        <Label class="text-sm font-medium text-muted-foreground">{{
          t('requestDetail.contactCard.fields.phone')
        }}</Label>
        <Input
          v-model="editForm.phone"
          type="tel"
          class="h-8 text-sm"
          :placeholder="t('requestDetail.contactCard.placeholders.phone')"
          autocomplete="tel"
        />
      </div>
      <div class="space-y-2">
        <Label class="text-sm font-medium text-muted-foreground">{{
          t('requestDetail.contactCard.fields.address')
        }}</Label>
        <Input
          v-model="editForm.address"
          type="text"
          class="h-8 text-sm"
          :placeholder="t('requestDetail.contactCard.placeholders.address')"
        />
      </div>
      <div class="flex gap-2 pt-1">
        <Button variant="outline" size="small" class="flex-1" @click="cancelEditing">
          {{ t('common.buttons.cancel') }}
        </Button>
        <Button
          variant="default"
          size="small"
          class="flex-1"
          :disabled="saveDisabled || saving"
          @click="saveEdit"
        >
          {{ saving ? t('requestDetail.contactCard.saving') : t('common.buttons.save') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { useCustomersStore } from '@/stores/customers'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useRequestNavigationStore } from '@/stores/requestNavigation'
import { useCustomerDuplicateDetection } from '@/composables/useCustomerDuplicateDetection'
import { getCustomerNameParts } from '@/utils/customerDisplay'
import {
  Badge,
  Button,
  Input,
  Label,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@motork/component-library/future/primitives'
import {
  AlertTriangle,
  ChevronDown,
  Mail,
  Phone,
  PhoneCall,
  Plus,
  StickyNote,
  User
} from 'lucide-vue-next'
import TagPillWithPopover from '@/components/shared/TagPillWithPopover.vue'
import MessagingQuickActionPopover from '@/components/shared/MessagingQuickActionPopover.vue'

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
  },
  showQuickActions: {
    type: Boolean,
    default: true
  },
  relatedLeads: {
    type: Array,
    default: () => []
  },
  relatedOpportunities: {
    type: Array,
    default: () => []
  },
  relatedRequestsLoading: {
    type: Boolean,
    default: false
  },
  excludeRequestId: {
    type: [Number, String],
    default: null
  },
  excludeRequestType: {
    type: String,
    default: ''
  },
  embeddedInCard: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'quick-action',
  'action',
  'add-tag',
  'open-activity',
  'edit-customer-tag',
  'delete-customer-tag'
])

const { t } = useI18n()
const toastStore = useToastStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const customersStore = useCustomersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const requestNavigationStore = useRequestNavigationStore()
const isEditing = ref(false)
const pastRequestsOpen = ref(false)
const pastRequestsPanelId = 'task-contact-past-requests-panel'
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

const nameParts = computed(() => getCustomerNameParts(props.task.customer?.name))

const customerForDuplicateDetection = computed(() => props.task?.customer || null)
const { potentialDuplicates: potentialContactDuplicates } =
  useCustomerDuplicateDetection(customerForDuplicateDetection)
const showContactDuplicateWarning = computed(
  () => potentialContactDuplicates.value.length > 0
)

onMounted(() => {
  if (!customersStore.customers?.length) {
    customersStore.fetchCustomers().catch(() => {})
  }
})

const phoneDisplay = computed(() => props.task.customer?.phone || null)
const emailDisplay = computed(() => props.task.customer?.email || null)

const recentInteractions = computed(() => (props.task.activities || []).slice(0, 8))

const interactionCount = computed(() => (props.task.activities || []).length)

const showTagsAndInteractionsRow = computed(
  () =>
    !!props.task.customer ||
    (props.showQuickActions && interactionCount.value > 0)
)

const activityMenuLabel = computed(() =>
  t('requestDetail.contactCard.activityMenu', { count: interactionCount.value })
)

function interactionSortTime(raw) {
  const t1 = raw?.lastActivity || raw?.updatedAt || raw?.createdAt
  return t1 ? new Date(t1).getTime() : 0
}

const pastRequestRows = computed(() => {
  const rows = []
  const exId =
    props.excludeRequestId != null && props.excludeRequestId !== ''
      ? parseInt(String(props.excludeRequestId), 10)
      : null
  const exType = props.excludeRequestType || ''

  ;(props.relatedLeads || []).forEach((l) => {
    if (Number.isFinite(exId) && exType === 'lead' && l.id === exId) return
    rows.push({
      id: l.id,
      type: 'lead',
      compositeId: `lead-${l.id}`,
      stage: l.stage || 'Open',
      title: l.requestedCar
        ? `${l.requestedCar.brand} ${l.requestedCar.model}`
        : t('customerProfile.rightColumn.fallbackLeadTitle'),
      subtitle: l.requestedCar?.year ? String(l.requestedCar.year) : '',
      sortTime: interactionSortTime(l),
      customer: l.customer || l
    })
  })
  ;(props.relatedOpportunities || []).forEach((o) => {
    if (Number.isFinite(exId) && exType === 'opportunity' && o.id === exId) return
    rows.push({
      id: o.id,
      type: 'opportunity',
      compositeId: `opportunity-${o.id}`,
      stage: o.stage || 'Open',
      title: o.requestedCar
        ? `${o.requestedCar.brand} ${o.requestedCar.model}`
        : t('customerProfile.rightColumn.fallbackOpportunityTitle'),
      subtitle: o.requestedCar?.year ? String(o.requestedCar.year) : '',
      sortTime: interactionSortTime(o),
      customer: o.customer || o
    })
  })
  return rows.sort((a, b) => b.sortTime - a.sortTime)
})

const showPastRequestsSection = computed(
  () => !props.relatedRequestsLoading && pastRequestRows.value.length > 0
)

const showTagsOrMetaRow = computed(
  () => showTagsAndInteractionsRow.value || showPastRequestsSection.value
)

const allRelatedRequestNavigationRows = computed(() => {
  const rows = []
  ;(props.relatedLeads || []).forEach((l) => {
    rows.push({
      id: l.id,
      type: 'lead',
      compositeId: `lead-${l.id}`,
      displayStage: l.stage || 'Open',
      customer: l.customer || l
    })
  })
  ;(props.relatedOpportunities || []).forEach((o) => {
    rows.push({
      id: o.id,
      type: 'opportunity',
      compositeId: `opportunity-${o.id}`,
      displayStage: o.stage || 'Open',
      customer: o.customer || o
    })
  })
  return rows
})

function handlePastRequestClick(item) {
  const rows = allRelatedRequestNavigationRows.value
  requestNavigationStore.setRequestRows(rows)
  router.push({
    path: `/requests/${item.id}`,
    query: { type: item.type, from: 'customer' },
    state: { requestRows: rows }
  })
}

watch(
  () => [props.task?.customer?.id, props.customerId, props.excludeRequestId],
  () => {
    pastRequestsOpen.value = false
  }
)

const quickActionItems = computed(() => [
  { key: 'phone', icon: PhoneCall, label: t('requestDetail.quickActions.phone') },
  { key: 'email', icon: Mail, label: t('requestDetail.quickActions.email') },
  { kind: 'messaging' },
  { key: 'note', icon: StickyNote, label: t('requestDetail.quickActions.addNote') }
])

function emitQuick(key) {
  emit('quick-action', key)
  let actionKey = key
  if (key === 'phone') actionKey = 'call'
  emit('action', actionKey)
}

const normalizedCustomerTags = computed(() => {
  const tags = props.task.customer?.tags || []
  return tags.map((t) =>
    typeof t === 'string' ? { name: t, color: null } : { name: t.name, color: t.color || null }
  )
})

function isLightTagColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const m = hex.replace(/^#/, '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return false
  const r = parseInt(m[1], 16) / 255
  const g = parseInt(m[2], 16) / 255
  const b = parseInt(m[3], 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.5
}

function tagBadgeClass(tag) {
  const s = String(tag).toLowerCase()
  if (s.includes('vip')) {
    return 'bg-purple-100 text-purple-600'
  }
  if (s.includes('green') || s.includes('eco') || s.includes('electric')) {
    return 'bg-green-100 text-green-600'
  }
  return 'bg-muted text-muted-foreground'
}

function interactionKey(act) {
  return act.id ?? act.timestamp ?? JSON.stringify(act)
}

function formatActivityLine(act) {
  const type = act.type || act.activityType || 'activity'
  const ts = act.timestamp || act.createdAt
  let time = ''
  if (ts) {
    try {
      time = new Date(ts).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      time = ''
    }
  }
  return time ? `${type} · ${time}` : String(type)
}

function openCustomerProfileInNewTab() {
  const customerId = props.task.customer?.id || props.customerId
  if (customerId) {
    const url = router.resolve(`/customer/${customerId}`).href
    window.open(url, '_blank')
  }
}

function resolveCustomerDuplicateReturnFrom() {
  const path = route.path || ''
  if (path.startsWith('/requests')) return 'request'
  if (path.startsWith('/customer')) {
    const qFrom = route.query.from
    if (typeof qFrom === 'string' && qFrom) return qFrom
    return 'customers'
  }
  return 'request'
}

function navigateToCustomerDuplicateProfile() {
  const rawId = props.customerId ?? props.task?.customer?.id
  if (rawId == null || rawId === '') return
  const id = Number(rawId)
  if (!Number.isFinite(id)) return
  const c = props.task?.customer
  const isAccount = !!(c?.company && String(c.company).trim() !== '')
  router.push({
    path: `/customer/${id}`,
    query: {
      type: isAccount ? 'account' : 'contact',
      from: resolveCustomerDuplicateReturnFrom(),
      highlight: 'duplicates'
    }
  })
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
    toastStore.pushToast('success', t('requestDetail.contactCard.customerUpdated'))
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.task-contact-past-requests-enter-active,
.task-contact-past-requests-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  overflow: hidden;
}

.task-contact-past-requests-enter-from,
.task-contact-past-requests-leave-to {
  max-height: 0;
  opacity: 0;
}

.task-contact-past-requests-enter-to,
.task-contact-past-requests-leave-from {
  max-height: 24rem;
  opacity: 1;
}
</style>
