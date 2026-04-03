<template>
  <div class="flex flex-col space-y-6">
    <div v-if="activeTab === 'overview'" class="space-y-6">
      <HighlightsBox :summary="summary" />

      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-foreground">{{ t('customerProfile.activeRequests') }}</h3>
        <RequestsList :leads="leads" :opportunities="opportunities" @click="handleRequestClick" />
      </div>
    </div>

    <div v-else-if="activeTab === 'requests'">
      <RequestsList :leads="leads" :opportunities="opportunities" @click="handleRequestClick" />
    </div>

    <div v-else-if="activeTab === 'communication'" class="min-w-0">
      <RequestConversationsTabContent
        :activities="conversationActivities"
        @send-message="$emit('send-message')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useRequestNavigationStore } from '@/stores/requestNavigation'
import HighlightsBox from './HighlightsBox.vue'
import RequestsList from './RequestsList.vue'
import RequestConversationsTabContent from '@/components/requests/RequestConversationsTabContent.vue'

const props = defineProps({
  activeTab: { type: String, default: 'overview' },
  summary: String,
  activities: { type: Array, default: () => [] },
  leads: { type: Array, default: () => [] },
  opportunities: { type: Array, default: () => [] }
})

defineEmits(['send-message'])

const { t } = useI18n()
const router = useRouter()
const requestNavigationStore = useRequestNavigationStore()

const conversationActivities = computed(() => {
  const list = (props.activities || []).filter(
    (a) =>
      a.type === 'customer-email' ||
      a.type === 'customer-whatsapp' ||
      a.type === 'email' ||
      a.type === 'whatsapp'
  )
  return [...list].sort(
    (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
  )
})

const customerRequestRows = computed(() => {
  const rows = []
  ;(props.leads || []).forEach((l) => {
    rows.push({
      id: l.id,
      type: 'lead',
      compositeId: `lead-${l.id}`,
      displayStage: l.stage || 'New',
      customer: l.customer || l
    })
  })
  ;(props.opportunities || []).forEach((o) => {
    rows.push({
      id: o.id,
      type: 'opportunity',
      compositeId: `opportunity-${o.id}`,
      displayStage: o.stage || 'Qualified',
      customer: o.customer || o
    })
  })
  return rows
})

function handleRequestClick(item, filteredItemsFromList) {
  const id = item.id
  const type = item.type
  const rows = (filteredItemsFromList?.length ? filteredItemsFromList : customerRequestRows.value).map(
    (r) => ({
      id: r.id,
      type: r.type,
      compositeId: r.compositeId,
      displayStage: r.displayStage ?? r.original?.stage,
      customer: r.customer ?? r.original?.customer
    })
  )
  requestNavigationStore.setRequestRows(rows)
  router.push({
    path: `/requests/${id}`,
    query: { type, from: 'customer' },
    state: { requestRows: rows }
  })
}
</script>
