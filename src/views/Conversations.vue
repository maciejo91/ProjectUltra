<template>
  <div class="flex h-full flex-col overflow-hidden bg-surface">
    <div v-if="useTeleport && teleportTargetsReady" class="size-0 shrink-0 overflow-hidden">
      <Teleport to="#conversations-list-teleport" :disabled="!useTeleport">
        <div class="flex h-full min-h-0 w-full flex-col overflow-hidden bg-surface">
          <ConversationListSidebar
            :threads="store.threads"
            :selected-thread-id="store.selectedThreadId"
            @select="goToThread"
          />
        </div>
      </Teleport>
      <Teleport to="#conversations-detail-teleport" :disabled="!useTeleport">
        <div class="flex h-full min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-background">
          <ConversationWorkspace
            v-if="store.selectedThreadId && activeThreadMeta"
            :key="store.selectedThreadId"
            :thread-id="store.selectedThreadId"
            :thread-meta="activeThreadMeta"
            :messages="store.messages"
            :loading-messages="store.loadingMessages"
            :sending="store.sending"
            @send="onSend"
          />
          <div
            v-else
            class="flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-2 p-8 text-center"
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
      </Teleport>
    </div>

    <div
      v-if="!useTeleport || !teleportTargetsReady"
      class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row lg:items-stretch"
    >
      <ConversationListSidebar
        class="min-h-0 flex-1 lg:h-full lg:w-80 lg:shrink-0 lg:flex-none"
        :class="store.selectedThreadId ? 'hidden lg:flex' : 'w-full'"
        :threads="store.threads"
        :selected-thread-id="store.selectedThreadId"
        @select="goToThread"
      />
      <div
        class="flex min-h-0 min-w-0 flex-1 flex-col border-border lg:border-l"
        :class="store.selectedThreadId ? 'flex' : 'hidden lg:flex'"
      >
        <div v-if="store.selectedThreadId" class="flex min-h-0 flex-1 flex-col lg:hidden">
          <button
            type="button"
            class="flex shrink-0 items-center gap-2 border-b border-border bg-background px-4 py-3 text-left text-sm font-medium text-primary"
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
          class="hidden min-h-[50vh] flex-1 flex-col items-center justify-center gap-2 p-8 text-center lg:flex"
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
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { MessageCircle, ChevronLeft } from 'lucide-vue-next'
import { useConversationsStore } from '@/stores/conversations'
import { useLayoutStore } from '@/stores/layout'
import { parseThreadId } from '@/api/conversations'
import ConversationListSidebar from '@/components/conversations/ConversationListSidebar.vue'
import ConversationWorkspace from '@/components/conversations/ConversationWorkspace.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const store = useConversationsStore()
const layoutStore = useLayoutStore()

const isDesktop = ref(typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches)
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(min-width: 768px)')
  mq.addEventListener('change', (e) => {
    isDesktop.value = e.matches
  })
}

const useTeleport = computed(
  () =>
    route.name === 'conversations' &&
    layoutStore.hideHeaderForConversations &&
    Boolean(route.params.threadId) &&
    isDesktop.value
)

const teleportTargetsReady = ref(false)

function updateTeleportTargetsReady() {
  teleportTargetsReady.value = !!(
    document.getElementById('conversations-list-teleport') &&
    document.getElementById('conversations-detail-teleport')
  )
}

watch(
  () => useTeleport.value,
  async () => {
    await nextTick()
    updateTeleportTargetsReady()
  },
  { immediate: true }
)

watch(
  () => [route.name, route.params.threadId],
  async () => {
    await nextTick()
    updateTeleportTargetsReady()
  }
)

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

watch(
  () => isDesktop.value && Boolean(route.params.threadId),
  (hide) => {
    layoutStore.setHideHeaderForConversations(hide)
  },
  { immediate: true }
)

onMounted(async () => {
  await store.loadThreads()
  updateTeleportTargetsReady()
  const id = route.params.threadId
  if (!id) return
  if (!parseThreadId(id) || !store.threads.some((x) => x.threadId === id)) {
    router.replace({ name: 'conversations', params: {} })
    return
  }
  await store.selectThread(id)
})

onBeforeUnmount(() => {
  layoutStore.setHideHeaderForConversations(false)
})
</script>
