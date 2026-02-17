<template>
  <div class="page-container overflow-y-auto">
    <Tabs v-model="activeTab">
      <PageHeader title="Add New Customer">
        <template #bottom>
          <div class="pb-0">
            <TabsList class="flex shrink-0 border-0 bg-background rounded-none w-full relative h-full">
              <TabsTrigger
                v-for="tab in tabs"
                :key="tab.key"
                :value="tab.key"
                class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
                :class="activeTab === tab.key ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
              >
                <span class="whitespace-nowrap">{{ tab.label }}</span>
                <span
                  v-if="activeTab === tab.key"
                  class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
                />
              </TabsTrigger>
            </TabsList>
          </div>
        </template>
      </PageHeader>

      <div class="pt-2 px-4 pb-8 md:pt-3 md:px-6 md:pb-10 lg:pt-4 lg:px-8 lg:pb-12">
        <div class="max-w-6xl mx-auto">
          <TabsContent value="manual" class="add-new-manual data-[state=inactive]:hidden">
            <ManualTab ref="manualTabRef" @submit="handleSubmit" />
          </TabsContent>

          <TabsContent value="upload" class="data-[state=inactive]:hidden">
            <UploadTab />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@motork/component-library/future/primitives'
import PageHeader from '@/components/layout/PageHeader.vue'
import ManualTab from '@/components/addnew/ManualTab.vue'
import UploadTab from '@/components/addnew/UploadTab.vue'
import { useTabPersistence } from '@/composables/useTabPersistence'

const router = useRouter()
const customersStore = useCustomersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()

const manualTabRef = ref(null)
const { activeTab } = useTabPersistence('add-new-active-tab', 'manual')

// Ensure manual is automatically selected on mount
onMounted(() => {
  if (!activeTab.value || !['manual', 'upload'].includes(activeTab.value)) {
    activeTab.value = 'manual'
  }
})

const tabs = [
  { key: 'manual', label: 'Manual' },
  { key: 'upload', label: 'Upload' }
]

const handleSubmit = async (formData) => {
  try {
    const { contactMode, selectedContact, contactData, vehicleData, markAsLead, markAsOpportunity } = formData
    
    // Step 1: Get or create customer (contact or account)
    let contact = selectedContact
    if (contactMode === 'new') {
      contact = await customersStore.addCustomer({
        ...contactData,
        initials: contactData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        source: 'Direct',
        tags: [],
        company: contactData.company || null // Will determine if it's account or contact
      })
    }
    
    // Step 2: Determine action based on task checkboxes
    if (markAsLead) {
      // Create lead
      const leadData = {
        customer: {
          id: contact.id,
          name: contact.name,
          initials: contact.initials,
          email: contact.email,
          phone: contact.phone,
          address: contact.address || ''
        },
        status: 'Open',
        stage: 'Open',
        priority: 'Normal',
        source: vehicleData?.source || 'Direct',
        assignee: null,
        assigneeInitials: '',
        isDisqualified: false,
        disqualifyReason: null,
        scheduledAppointment: null,
        contactAttempts: []
      }
      
      // Only add requestedCar if vehicle data exists
      if (vehicleData && Object.keys(vehicleData).length > 0) {
        leadData.requestedCar = vehicleData
      }
      
      const newLead = await leadsStore.createLead(leadData)
      
      router.push({ 
        path: '/customers', 
        query: { tab: 'open-leads', highlight: `lead-${newLead.id}` }
      })
    } else if (markAsOpportunity) {
      // Create opportunity
      const oppData = {
        customer: {
          id: contact.id,
          name: contact.name,
          initials: contact.initials,
          email: contact.email,
          phone: contact.phone,
          address: contact.address || ''
        },
        stage: 'Qualified',
        priority: 'Normal',
        source: vehicleData?.source || 'Direct',
        assignee: null,
        assigneeInitials: ''
      }
      
      // Only add vehicle if vehicle data exists
      if (vehicleData && Object.keys(vehicleData).length > 0) {
        oppData.vehicle = vehicleData
      }
      
      const newOpp = await opportunitiesStore.createOpportunity(oppData)
      
      router.push({ 
        path: '/customers', 
        query: { tab: 'open-opportunities', highlight: `opp-${newOpp.id}` }
      })
    } else {
      // Neither checkbox checked
      if (vehicleData && Object.keys(vehicleData).length > 0) {
        // Save vehicle to customer
        await customersStore.addRequestedCar(contact.id, vehicleData)
      }
      
      // Just redirect to customers (contact already created/selected)
      router.push({ 
        path: '/customers', 
        query: { tab: 'customers', highlight: `contact-${contact.id}` }
      })
    }
  } catch (error) {
    console.error('Error saving data:', error)
    alert('Failed to save. Please try again.')
    
    // Reset submitting state
    if (manualTabRef.value) {
      manualTabRef.value.resetSubmitting()
    }
  }
}
</script>

<style scoped>
/* Tab styling to match Settings.vue */
:deep([role="tablist"]) {
  border: none !important;
  border-bottom: 1px solid var(--color-border) !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
  height: auto !important;
  min-height: 48px !important;
}

:deep([role="tab"]) {
  background: transparent !important;
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  margin: 0 !important;
  padding: 12px 16px !important;
  position: relative !important;
  box-shadow: none !important;
  height: 100% !important;
  min-height: 48px !important;
}

:deep([role="tab"]:not(:last-child)) {
  border-right: none !important;
}

:deep([role="tab"]::before),
:deep([role="tab"]::after) {
  display: none !important;
  box-shadow: none !important;
}

:deep([role="tab"] *) {
  box-shadow: none !important;
}

:deep([role="tab"][data-state="active"]) {
  color: var(--color-text-foreground) !important;
  box-shadow: none !important;
}

:deep([role="tab"][data-state="inactive"]) {
  color: var(--color-text-muted-foreground) !important;
  box-shadow: none !important;
}
</style>
