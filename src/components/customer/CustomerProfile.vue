<template>
  <div class="mb-6 flex h-full flex-col overflow-hidden bg-muted">
    <header
      v-if="showCloseButton || from"
      class="customer-profile-drawer-header shrink-0 px-4 sm:px-6"
    >
      <div class="customer-profile-drawer-header-content">
        <Button
          v-if="from"
          variant="ghost"
          size="icon"
          class="-ml-0.5 shrink-0 rounded-sm"
          :aria-label="t('customerProfile.header.backAria')"
          @click="emit('close')"
        >
          <ChevronLeft :size="16" class="text-muted-foreground" />
        </Button>
        <div class="flex min-h-0 min-w-0 flex-1 items-center">
          <h3 class="truncate text-sm font-semibold leading-tight text-foreground sm:text-base">
            {{ customerDisplayName || t('customerProfile.header.fallbackName') }}
          </h3>
        </div>
        <div class="customer-profile-drawer-header-actions shrink-0">
          <Button
            variant="secondary"
            size="icon"
            class="rounded-sm"
            aria-label="Previous"
            :disabled="!hasPrevious"
            @click="emit('customer-navigate', 'previous')"
          >
            <ChevronLeft :size="16" class="text-muted-foreground" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            class="rounded-sm"
            aria-label="Next"
            :disabled="!hasNext"
            @click="emit('customer-navigate', 'next')"
          >
            <ChevronRight :size="16" class="text-muted-foreground" />
          </Button>
          <Button
            v-if="!from"
            variant="secondary"
            size="icon"
            class="ml-0.5 rounded-sm sm:ml-1"
            aria-label="Close"
            @click="emit('close')"
          >
            <X :size="16" class="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>

    <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div class="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
        <div
          class="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overscroll-contain p-4 lg:min-h-0 lg:flex-row lg:items-stretch lg:gap-4 lg:overflow-hidden"
        >
          <div
            class="order-1 relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-muted lg:min-h-0 lg:min-w-0 lg:shrink-0"
          >
            <div class="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
              <div
                class="flex min-w-0 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-background"
              >
                <TaskContactCard
                  v-if="customer"
                  embedded-in-card
                  :task="taskForContactCard"
                  task-type="contact"
                  :customer-id="customerId"
                  @add-tag="showAddTagModal = true"
                  @quick-action="handleContactQuickAction"
                  @action="handleContactQuickAction"
                />
              </div>
              <div
                class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-background"
              >
                <div class="shrink-0 px-4 pt-2">
                  <RequestMainTabs class="shrink-0" v-model="activeTab" :tabs="mainTabs" />
                </div>
                <div class="flex min-h-0 flex-1 flex-col gap-4 border-t border-border p-4">
                  <CustomerDuplicateDetectedCard
                    v-if="customer && potentialDuplicates.length"
                    :potential-duplicates="potentialDuplicates"
                    :merge-loading="mergeLoading"
                    class="shrink-0"
                    @merge="handleMergeClick"
                    @customer-navigate="handleDuplicateCustomerNavigate"
                  />
                  <CustomerProfileContent
                    :active-tab="activeTab"
                    :summary="customerSummary"
                    :activities="customerActivities"
                    :leads="customerLeads"
                    :opportunities="customerOpportunities"
                    @send-message="handleSendMessage"
                  />
                </div>
              </div>
            </div>
          </div>

          <CustomerProfileRightColumn
            :customer="customerData"
            :account="accountData"
            :cars="customerCars"
            :appointments="customerAppointments"
            :activities="customerActivities"
            :leads="customerLeads"
            :opportunities="customerOpportunities"
            :requests-loading="loadingLeads || loadingOpportunities"
            :loading="loadingCustomer"
            @add-appointment="showCreateAppointmentModal = true"
            @add-activity="handleAddActivity"
          />
        </div>
      </div>
    </div>

    <AddLeadOpportunityModal
      v-if="customer"
      :show="showAddModal"
      :type="addModalType"
      :contact="getContactForModal"
      @close="showAddModal = false"
      @save="handleAddModalSave"
    />

    <CreateEventModal
      v-if="showCreateAppointmentModal"
      :show="showCreateAppointmentModal"
      :customer="customer"
      :assignee="currentUser"
      :disabled-fields="['customer']"
      @create="handleAppointmentCreated"
      @cancel="showCreateAppointmentModal = false"
    />

    <AddTagModal
      :show="showAddTagModal"
      :existing-tags="customerData?.tags || []"
      @close="showAddTagModal = false"
      @add="handleAddTag"
    />

    <ComingSoonModal
      :show="showComingSoonModal"
      :title="comingSoonTitle"
      @close="showComingSoonModal = false"
    />

    <MergeCustomerConfirmModal
      :show="showMergeModal"
      :primary="customer"
      :duplicate="duplicateToMerge"
      :duplicate-summary="mergeDuplicateSummary"
      :loading="mergeLoading"
      @close="showMergeModal = false; duplicateToMerge = null"
      @confirm="handleMergeConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@motork/component-library/future/primitives'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useCustomersStore } from '@/stores/customers'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import TaskContactCard from '@/components/tasks/TaskContactCard.vue'
import RequestMainTabs from '@/components/requests/RequestMainTabs.vue'
import CustomerProfileContent from '@/components/customer/profile/CustomerProfileContent.vue'
import CustomerProfileRightColumn from '@/components/customer/profile/CustomerProfileRightColumn.vue'
import AddLeadOpportunityModal from '@/components/modals/AddLeadOpportunityModal.vue'
import CreateEventModal from '@/components/modals/CreateEventModal.vue'
import AddTagModal from '@/components/modals/AddTagModal.vue'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import CustomerDuplicateDetectedCard from '@/components/customer/CustomerDuplicateDetectedCard.vue'
import MergeCustomerConfirmModal from '@/components/modals/MergeCustomerConfirmModal.vue'
import { useCustomerDuplicateDetection } from '@/composables/useCustomerDuplicateDetection'
import { getCustomerSummary } from '@/api/mergeCustomer'
import { fetchLeadsByCustomerId, fetchOpportunitiesByCustomerId, fetchCustomerCars, fetchTasksByCustomerId } from '@/api/contacts'
import { fetchAccountById } from '@/api/accounts'
import { fetchLeadActivities } from '@/api/leads'
import { fetchOpportunityActivities } from '@/api/opportunities'
import { fetchAppointmentsByCustomerId, createCalendarEvent } from '@/api/calendar'

const props = defineProps({
  customerId: {
    type: Number,
    required: true
  },
  customerType: {
    type: String,
    default: 'contact',
    validator: (value) => ['contact', 'account'].includes(value)
  },
  showCloseButton: {
    type: Boolean,
    default: false
  },
  closeOnConvert: {
    type: Boolean,
    default: false
  },
  filteredCustomerRows: {
    type: Array,
    default: () => []
  },
  from: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'customer-navigate', 'navigate-to-customer'])

const { t } = useI18n()
const customersStore = useCustomersStore()
const userStore = useUserStore()
const toastStore = useToastStore()

const loadingCustomer = ref(false)
const loadingAccount = ref(false)
const loadingLeads = ref(false)
const loadingOpportunities = ref(false)
const loadingActivities = ref(false)
const loadingAppointments = ref(false)
const error = ref(null)

const customerData = ref(null)
const accountData = ref(null)
const customerLeads = ref([])
const customerOpportunities = ref([])
const customerActivities = ref([])
const customerAppointments = ref([])
const customerTasks = ref([])
const customerCars = ref([])

const showMergeModal = ref(false)
const duplicateToMerge = ref(null)
const mergeLoading = ref(false)

const showAddModal = ref(false)
const addModalType = ref('lead')
const showCreateAppointmentModal = ref(false)
const showAddTagModal = ref(false)
const showComingSoonModal = ref(false)
const comingSoonTitle = ref('')

const activeTab = ref('overview')

const currentUser = computed(() => userStore.currentUser)

const customer = computed(() => customerData.value || customersStore.currentCustomer)

const taskForContactCard = computed(() => {
  const c = customer.value
  if (!c) {
    return { customer: null, activities: [] }
  }
  return {
    id: null,
    customer: { ...c, tags: c.tags || [] },
    activities: customerActivities.value || []
  }
})

const hideTabCounts = computed(() => !!(props.showCloseButton || props.from))

const communicationActivitiesCount = computed(() => {
  return customerActivities.value.filter(
    (a) =>
      a.type === 'customer-email' ||
      a.type === 'customer-whatsapp' ||
      a.type === 'email' ||
      a.type === 'whatsapp'
  ).length
})

const mainTabs = computed(() => {
  const overview = { key: 'overview', label: t('customerProfile.tabs.overview') }
  const requests = { key: 'requests', label: t('customerProfile.tabs.requests') }
  const communication = { key: 'communication', label: t('customerProfile.tabs.communication') }
  if (hideTabCounts.value) {
    return [overview, requests, communication]
  }
  return [
    overview,
    { ...requests, count: customerLeads.value.length + customerOpportunities.value.length },
    { ...communication, count: communicationActivitiesCount.value }
  ]
})

const customerForDuplicateDetection = computed(() => {
  const c = customer.value
  if (!c) return null
  return { ...c, type: c.type || (c.company && c.company !== '' ? 'account' : 'contact') }
})

const { potentialDuplicates } = useCustomerDuplicateDetection(customerForDuplicateDetection)

const mergeDuplicateSummary = computed(() => {
  const d = duplicateToMerge.value
  if (!d) return ''
  return getCustomerSummary(d)
})

const customerSummary = computed(() => {
  return customerData.value?.summary || ''
})

const customerDisplayName = computed(() => {
  const c = customer.value
  if (!c) return ''
  return c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || ''
})

const currentCustomerIndex = computed(() => {
  const rows = props.filteredCustomerRows || []
  if (!rows.length || props.customerId == null) return -1
  const id = Number(props.customerId)
  return rows.findIndex((r) => (r.customerId ?? parseInt(String(r.id).replace('customer-', ''), 10)) === id)
})
const hasPrevious = computed(() => currentCustomerIndex.value > 0)
const hasNext = computed(() => {
  const idx = currentCustomerIndex.value
  const rows = props.filteredCustomerRows || []
  return idx >= 0 && idx < rows.length - 1
})

const getContactForModal = computed(() => {
  if (!customer.value) {
    return { id: null, name: 'Unknown', email: '', phone: '', initials: '?' }
  }
  const cust = customer.value
  return {
    id: cust.id,
    name: cust.name || 'Unknown',
    email: cust.email || '',
    phone: cust.phone || '',
    initials: cust.initials || '?'
  }
})

const loadCustomerData = async () => {
  if (!props.customerId) return

  try {
    loadingCustomer.value = true
    loadingLeads.value = true
    loadingOpportunities.value = true
    loadingActivities.value = true
    loadingAppointments.value = true

    const customerRow = await customersStore.fetchCustomerById(props.customerId, props.customerType)
    customerData.value = customerRow || customersStore.currentCustomer
    loadingCustomer.value = false

    const accountId = customerData.value?.accountId || customerData.value?.account_id

    const [leadsResult, oppsResult, tasksResult, appointmentsResult, carsResult] = await Promise.all([
      fetchLeadsByCustomerId(props.customerId, accountId),
      fetchOpportunitiesByCustomerId(props.customerId, accountId),
      fetchTasksByCustomerId(props.customerId),
      fetchAppointmentsByCustomerId(props.customerId),
      fetchCustomerCars(accountId || props.customerId)
    ])

    customerLeads.value = leadsResult.data || []
    customerOpportunities.value = oppsResult.data || []
    customerTasks.value = tasksResult.data || []
    customerAppointments.value = appointmentsResult || []
    customerCars.value = carsResult.data || []

    loadingLeads.value = false
    loadingOpportunities.value = false
    loadingAppointments.value = false

    if (customerData.value?.accountId) {
      loadingAccount.value = true
      try {
        accountData.value = await fetchAccountById(customerData.value.accountId)
      } catch (e) {
        console.error('Failed to load account', e)
      } finally {
        loadingAccount.value = false
      }
    } else {
      accountData.value = null
    }

    const allActivities = []
    for (const lead of customerLeads.value) {
      try {
        const acts = await fetchLeadActivities(lead.id)
        allActivities.push(...acts)
      } catch (e) {}
    }
    for (const opp of customerOpportunities.value) {
      try {
        const acts = await fetchOpportunityActivities(opp.id)
        allActivities.push(...acts)
      } catch (e) {}
    }
    customerActivities.value = allActivities
    loadingActivities.value = false
  } catch (err) {
    console.error('Error loading customer data:', err)
    error.value = err.message
    loadingCustomer.value = false
    loadingLeads.value = false
    loadingOpportunities.value = false
    loadingActivities.value = false
    loadingAppointments.value = false
  }
}

function handleAddActivity() {
  comingSoonTitle.value = 'Add Activity'
  showComingSoonModal.value = true
}

function handleContactQuickAction() {
  comingSoonTitle.value = 'Quick action'
  showComingSoonModal.value = true
}

function handleSendMessage() {
  comingSoonTitle.value = t('customerProfile.sendMessage')
  showComingSoonModal.value = true
}

const handleAppointmentCreated = async (eventData) => {
  const payload = {
    ...eventData,
    customerId: props.customerId,
    customer: customerData.value?.name
  }
  try {
    await createCalendarEvent(payload)
    await loadCustomerData()
  } catch (e) {
    console.error(e)
  }
  showCreateAppointmentModal.value = false
}

const handleAddTag = async (tag) => {
  const tagName = typeof tag === 'string' ? tag : tag.name
  const currentTags = customerData.value?.tags || []
  if (!currentTags.includes(tagName)) {
    const newTags = [...currentTags, tagName]
    try {
      await customersStore.updateCustomer(props.customerId, { tags: newTags }, props.customerType)
      await loadCustomerData()
    } catch (e) {
      console.error(e)
    }
  }
  showAddTagModal.value = false
}

const handleAddModalSave = async () => {
  if (addModalType.value === 'lead') {
    await customersStore.convertToLead(props.customerId)
  } else {
    await customersStore.convertToOpportunity(props.customerId)
  }
  showAddModal.value = false
  await loadCustomerData()
}

function handleMergeClick(duplicate) {
  duplicateToMerge.value = duplicate
  showMergeModal.value = true
}

async function handleMergeConfirm(payload) {
  const master = payload?.master ?? customer.value
  const toMerge = payload?.toMerge ?? duplicateToMerge.value
  if (!master?.id || !toMerge) return
  mergeLoading.value = true
  try {
    await customersStore.mergeCustomer(master, toMerge)
    toastStore.pushToast('success', 'Customer merged successfully')
    showMergeModal.value = false
    duplicateToMerge.value = null
    await customersStore.fetchCustomers()
    await loadCustomerData()
  } catch (err) {
    toastStore.pushToast('error', err?.message || 'Failed to merge customer')
  } finally {
    mergeLoading.value = false
  }
}

function handleDuplicateCustomerNavigate(dupId, dupType) {
  emit('navigate-to-customer', dupId, dupType)
}

onMounted(() => {
  customersStore.fetchCustomers()
  loadCustomerData()
})

watch(
  () => props.customerId,
  () => {
    activeTab.value = 'overview'
    loadCustomerData()
  }
)
</script>

<style scoped>
.customer-profile-drawer-header {
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
  height: 3rem;
  min-height: 3rem;
  display: flex;
  align-items: center;
}

.customer-profile-drawer-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
}

.customer-profile-drawer-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
