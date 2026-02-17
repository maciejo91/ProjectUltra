<template>
  <div class="h-full flex flex-col overflow-hidden bg-surface">
    <!-- Drawer header (matches TaskDetailHeader when in drawer) -->
    <header
      v-if="showCloseButton"
      class="customer-profile-drawer-header shrink-0 px-4 sm:px-6"
    >
      <div class="customer-profile-drawer-header-content">
        <div class="min-w-0 flex-1 flex items-center min-h-0">
          <h3 class="text-sm sm:text-base font-semibold text-foreground truncate leading-tight">
            {{ customerDisplayName || 'Customer' }}
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
            variant="secondary"
            size="icon"
            class="rounded-sm ml-0.5 sm:ml-1"
            aria-label="Close"
            @click="emit('close')"
          >
            <X :size="16" class="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
    <div class="flex-1 flex min-h-0 overflow-hidden">
    <!-- Left Sidebar: Customer Profile Card -->
    <div class="w-[350px] shrink-0 border-r border-border h-full overflow-y-auto bg-white">
      <CustomerProfileSidebar
        :customer="customerData"
        :account="accountData"
        :cars="customerCars"
        :loading="loadingCustomer"
        :show-open-in-new-tab="showCloseButton"
        :customer-id="customerId"
        :customer-type="customerType"
        @add-tag="showAddTagModal = true"
        @action="handleSidebarAction"
      />
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-muted/30">
      <CustomerProfileContent
        v-model:active-tab="activeTab"
        :summary="customerSummary"
        :activities="customerActivities"
        :appointments="customerAppointments"
        :leads="customerLeads"
        :opportunities="customerOpportunities"
        :loading="loadingActivities"
        :phone-number="customer?.phone || ''"
        :customer-id="customerId"
        :customer-initials="customer?.initials || '?'"
        :hide-tab-counts="showCloseButton"
        @add-activity="handleAddActivity"
        @add-appointment="showCreateAppointmentModal = true"
        @communication-save="handleCommunicationSave"
        @note-save="handleNoteSave"
        @note-delete="handleNoteDelete"
        @attachment-save="handleAttachmentSave"
        @attachment-delete="handleAttachmentDelete"
      />
    </div>
    </div>

    <!-- Modals -->
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
    
    <!-- Placeholder modals for actions -->
    <ComingSoonModal
      :show="showComingSoonModal"
      :title="comingSoonTitle"
      @close="showComingSoonModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@motork/component-library/future/primitives'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useCustomersStore } from '@/stores/customers'
import { useUserStore } from '@/stores/user'
import CustomerProfileSidebar from '@/components/customer/profile/CustomerProfileSidebar.vue'
import CustomerProfileContent from '@/components/customer/profile/CustomerProfileContent.vue'
import AddLeadOpportunityModal from '@/components/modals/AddLeadOpportunityModal.vue'
import CreateEventModal from '@/components/modals/CreateEventModal.vue'
import AddTagModal from '@/components/modals/AddTagModal.vue'
import ComingSoonModal from '@/components/modals/ComingSoonModal.vue'
import { fetchLeadsByCustomerId, fetchOpportunitiesByCustomerId, fetchCustomerCars, fetchTasksByCustomerId, fetchContactsByAccountId } from '@/api/contacts'
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
  }
})

const emit = defineEmits(['close', 'customer-navigate'])

const router = useRouter()
const customersStore = useCustomersStore()
const userStore = useUserStore()

// Loading states
const loadingCustomer = ref(false)
const loadingAccount = ref(false)
const loadingLeads = ref(false)
const loadingOpportunities = ref(false)
const loadingActivities = ref(false)
const loadingAppointments = ref(false)
const error = ref(null)

// Data
const customerData = ref(null)
const accountData = ref(null)
const customerLeads = ref([])
const customerOpportunities = ref([])
const customerActivities = ref([])
const customerAppointments = ref([])
const customerTasks = ref([])
const customerCars = ref([])

// Modals
const showAddModal = ref(false)
const addModalType = ref('lead')
const showCreateAppointmentModal = ref(false)
const showAddTagModal = ref(false)
const showComingSoonModal = ref(false)
const comingSoonTitle = ref('')

const activeTab = ref('overview')

const currentUser = computed(() => userStore.currentUser)

const customer = computed(() => customerData.value || customersStore.currentCustomer)

const customerSummary = computed(() => {
   return customerData.value?.summary || ''
})

const customerDisplayName = computed(() => {
  const c = customer.value
  if (!c) return ''
  return c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Customer'
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
    
    // Fetch customer
    const customer = await customersStore.fetchCustomerById(props.customerId, props.customerType)
    customerData.value = customer || customersStore.currentCustomer
    loadingCustomer.value = false

    const accountId = customerData.value?.accountId || customerData.value?.account_id
    
    // Fetch related data in parallel
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
    
    // Fetch account if exists
    if (customerData.value?.accountId) {
      loadingAccount.value = true
      try {
        accountData.value = await fetchAccountById(customerData.value.accountId)
      } catch (e) {
        console.error('Failed to load account', e)
      } finally {
        loadingAccount.value = false
      }
    }

    // Fetch activities (aggregate from leads/opps)
    const allActivities = []
    // Add logic to fetch activities... simplified for now
    // In a real app, you'd likely have an endpoint for customer activities
    // For now, let's mock or use what we have
    // Reuse logic from original file:
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
  }
}

const handleSidebarAction = (action) => {
  if (action === 'call' || action === 'email') {
    activeTab.value = 'communicate'
  } else if (action === 'note') {
    activeTab.value = 'notes'
  } else if (action === 'appointment') {
    activeTab.value = 'appointments'
  } else {
    comingSoonTitle.value = 'More Actions'
    showComingSoonModal.value = true
  }
}

const handleAddActivity = () => {
  comingSoonTitle.value = 'Add Activity'
  showComingSoonModal.value = true
}

const handleCommunicationSave = (data) => {
  const user = userStore.currentUser?.name || 'You'
  const activityType = data.communicationType || data.type || 'communication'
  const timestamp = data.timestamp && !Number.isNaN(Date.parse(data.timestamp))
    ? data.timestamp
    : new Date().toISOString()
  customerActivities.value = [
    {
      id: `comm-${Date.now()}`,
      type: activityType,
      user,
      action: data.action || `logged ${activityType}`,
      content: data.content || '',
      timestamp
    },
    ...customerActivities.value
  ]
}

const handleNoteSave = (data) => {
  const user = userStore.currentUser?.name || 'You'
  const activity = {
    id: data.id || `note-${Date.now()}`,
    type: 'note',
    user,
    action: data.action || 'added a note',
    content: data.content || data.message || '',
    timestamp: data.timestamp || new Date().toISOString()
  }
  if (data.isEdit) {
    customerActivities.value = customerActivities.value.map((a) =>
      String(a.id) === String(activity.id) ? activity : a
    )
  } else {
    customerActivities.value = [activity, ...customerActivities.value]
  }
}

const handleNoteDelete = (item) => {
  customerActivities.value = customerActivities.value.filter((a) => a.id !== item.id)
}

const handleAttachmentSave = (data) => {
  const user = userStore.currentUser?.name || 'You'
  const activity = {
    id: data.id || `att-${Date.now()}`,
    type: 'attachment',
    user,
    action: data.action || 'uploaded an attachment',
    fileName: data.fileName || '',
    content: data.fileName ? `Attachment: ${data.fileName}` : '',
    timestamp: data.timestamp || new Date().toISOString()
  }
  if (data.isEdit) {
    customerActivities.value = customerActivities.value.map((a) =>
      String(a.id) === String(activity.id) ? activity : a
    )
  } else {
    customerActivities.value = [activity, ...customerActivities.value]
  }
}

const handleAttachmentDelete = (item) => {
  customerActivities.value = customerActivities.value.filter((a) => a.id !== item.id)
}


const handleAppointmentCreated = async (eventData) => {
  // Create appointment logic
  const payload = {
    ...eventData,
    customerId: props.customerId,
    customer: customerData.value?.name
  }
  try {
    await createCalendarEvent(payload)
    await loadCustomerData() // reload
  } catch (e) {
    console.error(e)
  }
  showCreateAppointmentModal.value = false
}

const handleAddTag = async (tag) => {
  // Tag logic
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
  // Logic from original file
  if (addModalType.value === 'lead') {
    await customersStore.convertToLead(props.customerId)
  } else {
    await customersStore.convertToOpportunity(props.customerId)
  }
  showAddModal.value = false
  await loadCustomerData()
}

onMounted(() => {
  loadCustomerData()
})

watch(() => props.customerId, () => {
  loadCustomerData()
})
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
  gap: 0.75rem;
  width: 100%;
}

.customer-profile-drawer-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
