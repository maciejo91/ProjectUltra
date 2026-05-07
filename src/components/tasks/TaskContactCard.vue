<template>
  <div
    class="overflow-hidden"
    :class="embeddedInCard ? '' : 'rounded-lg bg-background'"
  >
    <div class="group/card flex flex-col gap-2 px-4 py-4">
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
                  class="min-w-0 flex flex-1 flex-wrap items-baseline gap-x-1 gap-y-1 px-1.5 text-base font-medium leading-5 text-foreground wrap-break-word"
                >
                  <span>{{ nameParts.primary || '—' }}</span>
                  <span class="inline-flex flex-wrap items-center gap-1.5">
                    <span
                      v-if="customerLocationSuffix"
                      class="text-muted-foreground"
                    >{{ ' ' }}{{ customerLocationSuffix }}</span>
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
                    <Button
                      v-if="task.customer && !showEditCustomerModal"
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      class="shrink-0 opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100"
                      :aria-label="t('requestDetail.contactCard.editCustomer')"
                      @click.stop="showEditCustomerModal = true"
                    >
                      <Pencil class="size-3 opacity-70" />
                    </Button>
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
                    <Popover
                      v-else-if="item.kind === 'phone-actions'"
                      :open="callActionsOpen"
                      @update:open="(v) => (callActionsOpen = v)"
                    >
                      <PopoverTrigger as-child>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          class="shrink-0 rounded-md"
                          :aria-label="item.label"
                        >
                          <component :is="item.icon" class="size-4 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" class="w-56 p-1">
                        <div class="flex flex-col">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            class="w-full justify-start"
                            @click="handleCallCustomerClick"
                          >
                            {{ t('common.call.callCustomer') }}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            class="w-full justify-start"
                            @click="handleLogCallManuallyClick"
                          >
                            {{ t('common.call.logCallManually') }}
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
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
              <ContactHistoryGroupedList
                :rows="pastRequestRows"
                @select="handleContactHistorySelect"
              />
            </div>
          </Transition>
        </div>
      </div>

    <EditCustomerDetailsModal
      :show="showEditCustomerModal"
      :customer="task.customer"
      :saving="savingCustomerModal"
      @update:open="(v) => (showEditCustomerModal = v)"
      @save="handleSaveCustomerDetails"
    />

    <Dialog :open="logCallDialogOpen" @update:open="(v) => (logCallDialogOpen = v)">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
        <DialogContent
          class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col"
          :show-close-button="true"
        >
          <DialogHeader class="shrink-0">
            <DialogTitle>{{ t('common.call.logCallManually') }}</DialogTitle>
          </DialogHeader>
          <div class="flex-1 overflow-y-auto py-4 w-full">
            <CallForm
              v-if="phoneDisplay"
              :phone-number="phoneDisplay"
              :contact-name="props.task.customer?.name || ''"
              @call="handleManualCallLogged"
              @cancel="logCallDialogOpen = false"
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toast'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import { useCustomersStore } from '@/stores/customers'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useRequestNavigationStore } from '@/stores/requestNavigation'
import { useCustomerDuplicateDetection } from '@/composables/useCustomerDuplicateDetection'
import { getCustomerCityLabel, getCustomerNameParts } from '@/utils/customerDisplay'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  StickyNote,
  User
} from 'lucide-vue-next'
import TagPillWithPopover from '@/components/shared/TagPillWithPopover.vue'
import MessagingQuickActionPopover from '@/components/shared/MessagingQuickActionPopover.vue'
import EditCustomerDetailsModal from '@/components/modals/EditCustomerDetailsModal.vue'
import ContactHistoryGroupedList from '@/components/shared/ContactHistoryGroupedList.vue'
import CallForm from '@/components/shared/communication/CallForm.vue'

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
  relatedServices: {
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
const usersStore = useUsersStore()
const showEditCustomerModal = ref(false)
const savingCustomerModal = ref(false)
const pastRequestsOpen = ref(false)
const pastRequestsPanelId = 'task-contact-past-requests-panel'
const callActionsOpen = ref(false)
const logCallDialogOpen = ref(false)

const nameParts = computed(() => getCustomerNameParts(props.task.customer?.name))
const customerCityLabel = computed(() => getCustomerCityLabel(props.task.customer))
const customerLocationSuffix = computed(() =>
  customerCityLabel.value ? `(${customerCityLabel.value})` : ''
)

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

function getAssigneeDisplay(assigneeName, original) {
  if (!assigneeName) return 'Unassigned'
  const user = usersStore.users.find((u) => u.name === assigneeName)
  if (!user) return assigneeName
  const line2 = [user.team, user.dealership].filter(Boolean).join(' - ')
  if (line2) return `${assigneeName} (${line2})`
  const fallbackLine2 = [original?.assigneeTeam, original?.assigneeDealership].filter(Boolean).join(' - ')
  return fallbackLine2 ? `${assigneeName} (${fallbackLine2})` : assigneeName
}

function buildVehicleLine(original, fallbackTitle) {
  const r = original || {}
  const car = r.requestedCar || r.vehicle || {}
  const vehicleTitle =
    [car.brand, car.model].filter(Boolean).join(' ') ||
    (typeof fallbackTitle === 'string' ? fallbackTitle : '') ||
    '—'
  const year = car.year != null && car.year !== '' ? String(car.year) : ''
  const dealership = car.dealership || r.dealership || ''
  const assignee = getAssigneeDisplay(r.assignee, r)
  return [vehicleTitle, year, dealership, assignee].filter(Boolean).join(' · ')
}

function resolveDealership(original) {
  const r = original || {}
  const car = r.requestedCar || r.vehicle || {}
  return car.dealership || r.dealership || ''
}

function resolveYear(original) {
  const r = original || {}
  const car = r.requestedCar || r.vehicle || {}
  return car.year != null && car.year !== '' ? String(car.year) : ''
}

function formatMonthYear(dateString) {
  if (!dateString) return ''
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${mm}/${yyyy}`
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
    const fallbackTitle = l.requestedCar
      ? `${l.requestedCar.brand} ${l.requestedCar.model}`
      : t('customerProfile.rightColumn.fallbackLeadTitle')
    rows.push({
      id: l.id,
      type: 'lead',
      compositeId: `lead-${l.id}`,
      stage: l.stage || 'Open',
      title: fallbackTitle,
      titleWithYear: fallbackTitle,
      subtitle: l.requestedCar?.year ? String(l.requestedCar.year) : '',
      dealership: resolveDealership(l),
      assigneeName: l.assignee || '',
      createdMonthYear: formatMonthYear(l.createdAt),
      sortTime: interactionSortTime(l),
      customer: l.customer || l
    })
  })
  ;(props.relatedOpportunities || []).forEach((o) => {
    if (Number.isFinite(exId) && exType === 'opportunity' && o.id === exId) return
    const fallbackTitle = o.requestedCar
      ? `${o.requestedCar.brand} ${o.requestedCar.model}`
      : t('customerProfile.rightColumn.fallbackOpportunityTitle')
    rows.push({
      id: o.id,
      type: 'opportunity',
      compositeId: `opportunity-${o.id}`,
      stage: o.stage || 'Open',
      title: fallbackTitle,
      titleWithYear: fallbackTitle,
      subtitle: o.requestedCar?.year ? String(o.requestedCar.year) : '',
      dealership: resolveDealership(o),
      assigneeName: o.assignee || '',
      createdMonthYear: formatMonthYear(o.createdAt),
      sortTime: interactionSortTime(o),
      customer: o.customer || o
    })
  })
  ;(props.relatedServices || []).forEach((s) => {
    rows.push({
      id: s.id,
      type: 'service',
      compositeId: `service-${s.id}`,
      stage: s.stage || 'Open',
      title: s.title || t('customerProfile.rightColumn.fallbackServiceTitle'),
      titleWithYear: s.title || t('customerProfile.rightColumn.fallbackServiceTitle'),
      subtitle: (s.subtitle && String(s.subtitle).trim()) || '',
      dealership: '',
      assigneeName: '',
      createdMonthYear: formatMonthYear(s.createdAt),
      sortTime: interactionSortTime(s),
      customer: props.task.customer || null
    })
  })
  return rows
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

function handleContactHistorySelect(item) {
  if (item.type === 'service') {
    toastStore.pushToast('info', t('customerProfile.rightColumn.serviceDetailDemo'))
    return
  }
  handlePastRequestClick(item)
}

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
    callActionsOpen.value = false
    logCallDialogOpen.value = false
  }
)

const quickActionItems = computed(() => [
  { kind: 'phone-actions', icon: PhoneCall, label: t('requestDetail.quickActions.phone') },
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

function handleCallCustomerClick() {
  callActionsOpen.value = false
  if (!phoneDisplay.value) return
  window.location.href = `tel:${phoneDisplay.value}`
}

function handleLogCallManuallyClick() {
  callActionsOpen.value = false
  logCallDialogOpen.value = true
}

function handleManualCallLogged() {
  logCallDialogOpen.value = false
  toastStore.pushToast('success', t('common.call.loggedCallSuccess'))
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

async function handleSaveCustomerDetails(payload) {
  const customerId = props.task.customer?.id || props.customerId
  const leadId = props.task.id
  if (!customerId || !payload?.name?.trim()) return
  const hadNoPhone =
    props.taskType === 'lead' && !(props.task.customer?.phone ?? '').trim()
  const phoneAdded = !!(payload.phone ?? '').trim()
  savingCustomerModal.value = true
  try {
    await customersStore.modifyContact(customerId, {
      name: payload.name.trim(),
      phone: payload.phone,
      email: payload.email,
      address: payload.address,
      tags: payload.tags
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
    showEditCustomerModal.value = false
    toastStore.pushToast('success', t('requestDetail.contactCard.customerUpdated'))
  } catch {
    toastStore.pushToast('error', t('requestDetail.contactCard.saveFailed'))
  } finally {
    savingCustomerModal.value = false
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
