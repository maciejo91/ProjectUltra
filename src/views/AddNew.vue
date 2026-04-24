<template>
  <div class="page-container flex h-full min-h-0 flex-1 flex-col overflow-hidden">
    <Tabs v-model="activeTab" class="flex h-full min-h-0 flex-1 flex-col">
      <PageHeader title="">
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

      <div
        :class="[
          'px-6 text-sm w-full flex-1 min-h-0 flex flex-col overflow-hidden',
          isTablePageLayout ? 'pt-1 md:pt-2 lg:pt-3' : 'pt-2 md:pt-3 lg:pt-4',
          { 'bg-white': activeTab === 'campaigns' }
        ]"
      >
        <TabsContent value="manual" class="add-new-manual data-[state=inactive]:hidden w-full flex-1 flex flex-col min-h-0">
          <ManualTab ref="manualTabRef" @submit="handleSubmit" />
        </TabsContent>

        <TabsContent value="upload" class="data-[state=inactive]:hidden w-full flex-1 flex flex-col min-h-0">
          <UploadTab />
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCustomersStore } from '@/stores/customers'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@motork/component-library/future/primitives'
import PageHeader from '@/components/layout/PageHeader.vue'
import ManualTab from '@/components/addnew/ManualTab.vue'
import UploadTab from '@/components/addnew/UploadTab.vue'
import { useTabPersistence } from '@/composables/useTabPersistence'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const route = useRoute()
const isTablePageLayout = computed(() => Boolean(route.meta?.tablePageLayout))
const customersStore = useCustomersStore()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const toastStore = useToastStore()

const manualTabRef = ref(null)
const { activeTab } = useTabPersistence('add-new-active-tab', 'manual')

// Ensure manual is automatically selected on mount
onMounted(() => {
  if (!activeTab.value || !['manual', 'upload'].includes(activeTab.value)) {
    activeTab.value = 'manual'
  }
})

const tabs = [
  { key: 'manual', label: 'Manual enter' },
  { key: 'upload', label: 'Upload' }
]

const handleSubmit = async (formData) => {
  try {
    const { intent, contactMode, selectedContact, contactData, vehicleData } = formData
    
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
    
    if (intent === 'proceed_to_qualification') {
      // Proceed to qualification: create lead and redirect to its detail page
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

      toastStore.pushToast('success', 'Saved')
      router.push({
        path: `/requests/${newLead.id}`,
        query: { type: 'lead', from: 'add-new' }
      })
    } else {
      // Save and close: toast, then reset form + scroll to initial state (like a fresh visit)
      toastStore.pushToast('success', 'Saved')
      await nextTick()
      await manualTabRef.value?.clear?.()
    }

    manualTabRef.value?.resetSubmitting?.()
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

:deep(.add-new-manual .cn-card) {
  box-shadow: none !important;
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
