import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as conversationsApi from '@/api/conversations'
import * as leadsApi from '@/api/leads'
import * as opportunitiesApi from '@/api/opportunities'
import { useUserStore } from '@/stores/user'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'

export const useConversationsStore = defineStore('conversations', () => {
  const leadsStore = useLeadsStore()
  const opportunitiesStore = useOpportunitiesStore()

  const threads = ref([])
  const messages = ref([])
  const selectedThreadId = ref(null)
  const loadingThreads = ref(false)
  const loadingMessages = ref(false)
  const sending = ref(false)
  const error = ref(null)

  const selectedThread = computed(() =>
    threads.value.find((t) => t.threadId === selectedThreadId.value) ?? null
  )

  async function loadThreads() {
    loadingThreads.value = true
    error.value = null
    try {
      threads.value = await conversationsApi.fetchConversationThreads()
    } catch (e) {
      error.value = e
      threads.value = []
    } finally {
      loadingThreads.value = false
    }
  }

  async function loadThreadMessages(threadId) {
    if (!threadId) {
      messages.value = []
      return
    }
    loadingMessages.value = true
    error.value = null
    try {
      messages.value = await conversationsApi.fetchThreadMessages(threadId)
    } catch (e) {
      error.value = e
      messages.value = []
    } finally {
      loadingMessages.value = false
    }
  }

  function setSelectedThreadId(threadId) {
    selectedThreadId.value = threadId
  }

  async function selectThread(threadId) {
    setSelectedThreadId(threadId)
    const parsed = conversationsApi.parseThreadId(threadId)
    if (parsed) {
      if (parsed.entityType === 'lead') {
        await leadsStore.fetchLeadById(parsed.entityId)
      } else {
        await opportunitiesStore.fetchOpportunityById(parsed.entityId)
      }
    }
    await loadThreadMessages(threadId)
  }

  async function sendReply(threadId, body) {
    const trimmed = (body || '').trim()
    if (!trimmed || !threadId) return null

    const parsed = conversationsApi.parseThreadId(threadId)
    if (!parsed) return null

    const userStore = useUserStore()
    const userName = userStore.currentUser?.name || 'You'
    const type = conversationsApi.outboundActivityTypeForChannel(parsed.channel)
    const action = conversationsApi.outboundActionLabelForChannel(parsed.channel)

    sending.value = true
    error.value = null
    try {
      const payload = {
        type,
        user: userName,
        action,
        content: trimmed
      }
      if (parsed.entityType === 'lead') {
        await leadsApi.addLeadActivity(parsed.entityId, payload)
      } else {
        await opportunitiesApi.addOpportunityActivity(parsed.entityId, payload)
      }
      await Promise.all([loadThreadMessages(threadId), loadThreads()])
      return true
    } catch (e) {
      error.value = e
      return false
    } finally {
      sending.value = false
    }
  }

  return {
    threads,
    messages,
    selectedThreadId,
    loadingThreads,
    loadingMessages,
    sending,
    error,
    selectedThread,
    loadThreads,
    loadThreadMessages,
    setSelectedThreadId,
    selectThread,
    sendReply
  }
})
