<template>
  <div
    class="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-muted lg:flex-row lg:items-stretch"
  >
    <ConversationListSidebar
      class="min-h-0 w-full shrink-0 lg:h-full lg:w-80 lg:flex-none"
      :class="store.selectedThreadId ? 'hidden lg:flex' : 'flex'"
      :threads="store.threads"
      :selected-thread-id="store.selectedThreadId"
      @select="goToThread"
    />
    <div
      class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted lg:min-w-0"
      :class="store.selectedThreadId ? 'flex' : 'hidden lg:flex'"
    >
      <div v-if="store.selectedThreadId" class="flex shrink-0 flex-col lg:hidden">
        <button
          type="button"
          class="flex items-center gap-2 border-b border-border bg-muted px-4 py-3 text-left text-sm font-medium text-primary"
          @click="clearThread"
        >
          <ChevronLeft class="size-4 shrink-0" />
          {{ t('common.conversations.mobile.backToList') }}
        </button>
      </div>
      <ConversationWorkspace
        v-if="store.selectedThreadId && activeThreadMeta"
        class="min-h-0 flex-1"
        :thread-id="store.selectedThreadId"
        :thread-meta="activeThreadMeta"
        :messages="store.messages"
        :loading-messages="store.loadingMessages"
        :sending="store.sending"
        @send="onSend"
      />
      <div
        v-else
        class="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-8 text-center"
      >
        <MessageCircle class="size-10 shrink-0 text-muted-foreground" />
        <p class="text-sm font-medium text-foreground">
          {{ t('common.conversations.empty.noSelectionTitle') }}
        </p>
        <p class="max-w-sm text-sm text-muted-foreground">
          {{ t('common.conversations.empty.noSelectionHint') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { MessageCircle, ChevronLeft } from 'lucide-vue-next'
import { useConversationsStore } from '@/stores/conversations'
import { parseThreadId } from '@/api/conversations'
import ConversationListSidebar from '@/components/conversations/ConversationListSidebar.vue'
import ConversationWorkspace from '@/components/conversations/ConversationWorkspace.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = useConversationsStore()

const activeThreadMeta = computed(() => {
  const id = store.selectedThreadId
  if (!id) return null
  return store.threads.find((x) => x.threadId === id) || store.selectedThread
})

function goToThread(threadId) {
  router.push({ name: 'conversations', params: { threadId } })
}

function clearThread() {
  router.push({ name: 'conversations', params: {} })
}

async function onSend(text) {
  if (!store.selectedThreadId) return
  await store.sendReply(store.selectedThreadId, text)
}

watch(
  () => route.params.threadId,
  async (threadId) => {
    if (!threadId) {
      store.setSelectedThreadId(null)
      store.messages = []
      return
    }
    if (!parseThreadId(threadId)) {
      router.replace({ name: 'conversations', params: {} })
      return
    }
    await store.selectThread(threadId)
    if (!store.loadingThreads && !store.threads.some((x) => x.threadId === threadId)) {
      router.replace({ name: 'conversations', params: {} })
    }
  }
)

onMounted(async () => {
  await store.loadThreads()
  const id = route.params.threadId
  if (!id) return
  if (!parseThreadId(id) || !store.threads.some((x) => x.threadId === id)) {
    router.replace({ name: 'conversations', params: {} })
    return
  }
  await store.selectThread(id)
})
</script>
