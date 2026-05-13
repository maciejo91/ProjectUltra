<script setup>
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Send } from 'lucide-vue-next'
import { Input } from '@motork/component-library/future/primitives'
import { useAIAssistant } from '@/composables/useAIAssistant'

const { t, locale } = useI18n()

const props = defineProps({
  getDataForAI: { type: Function, required: true },
  suggestions: {
    type: Array,
    default: undefined
  }
})

const {
  messages: chatMessages,
  isThinking,
  isTyping,
  sendMessage: sendAIMessage,
  addMessage
} = useAIAssistant(props.getDataForAI, () => locale.value)

const chatInput = ref('')
const chatError = ref(null)
const chatContainerRef = ref(null)
const isRevealingResponse = ref(false)
const suggestions = computed(() =>
  props.suggestions || [
    t('home.nscDashboard.ai.suggestions.newCarSellers'),
    t('home.nscDashboard.ai.suggestions.webSources'),
    t('home.nscDashboard.ai.suggestions.bdcAppointments')
  ]
)

const scrollToLastMessage = async (role) => {
  await nextTick()

  const container = chatContainerRef.value
  if (!container) return

  const messages = container.querySelectorAll(`[data-message-role="${role}"]`)
  const target = messages[messages.length - 1]
  if (!target) return

  const containerTop = container.getBoundingClientRect().top
  const targetTop = target.getBoundingClientRect().top
  container.scrollTo({
    top: targetTop - containerTop + container.scrollTop,
    behavior: 'smooth'
  })
}

const createRevealSegments = (content) => {
  const blocks = content.split(/(\n+)/)

  return blocks.flatMap((block) => {
    if (!block) return []
    if (/^\n+$/.test(block)) return block.split('').map((lineBreak) => lineBreak)

    return block.match(/\S+\s*/g) || [block]
  })
}

const revealAssistantMessage = async (message, content) => {
  const segments = createRevealSegments(content)
  isRevealingResponse.value = true
  message.content = ''
  message.revealSegments = []

  for (let index = 0; index < segments.length; index += 1) {
    message.revealSegments.push({
      id: `${message.id}-${index}`,
      text: segments[index]
    })
    await new Promise((resolve) => setTimeout(resolve, 24))
  }

  message.content = content
  message.revealSegments = null
  isRevealingResponse.value = false
}

const sendMessage = async () => {
  if (!chatInput.value.trim() || isTyping.value || isThinking.value || isRevealingResponse.value) return

  const userMessage = chatInput.value.trim()
  chatInput.value = ''
  chatError.value = null
  addMessage('user', userMessage)
  await scrollToLastMessage('user')

  try {
    const response = await sendAIMessage(userMessage)
    const assistantMessage = addMessage('assistant', '')
    await scrollToLastMessage('assistant')
    await revealAssistantMessage(assistantMessage, response)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : t('home.nscDashboard.ai.error')
    chatError.value = errorMessage
    const assistantMessage = addMessage('assistant', '')
    await scrollToLastMessage('assistant')
    await revealAssistantMessage(assistantMessage, errorMessage)
  }
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleSuggestionClick = async (suggestion) => {
  if (isTyping.value || isThinking.value || isRevealingResponse.value) return
  chatInput.value = suggestion
  await sendMessage()
}
</script>

<template>
  <div class="flex h-[528px] flex-col rounded-[12px] bg-linear-to-r from-[#40B3E9] via-[#8873FF] to-[#FF8B42] p-px" data-section="ai-assistant">
    <div class="flex h-full flex-col overflow-hidden rounded-[11px] bg-linear-to-r from-[#40B3E9] via-[#8873FF] to-[#FF8B42]">
      <div class="flex shrink-0 items-center justify-between px-4 py-4">
        <h3 class="text-lg font-medium leading-5 text-white">{{ t('home.nscDashboard.ai.title') }}</h3>
      </div>

      <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-white p-4 shadow-nsc-card">
        <div ref="chatContainerRef" class="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2">
          <div class="space-y-2">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              type="button"
              :disabled="isTyping || isThinking || isRevealingResponse"
              class="flex w-full cursor-pointer justify-end text-left disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleSuggestionClick(suggestion)"
            >
              <span class="inline-flex max-w-full rounded-lg rounded-br-sm border border-black/5 bg-background px-4 py-2.5 text-sm leading-relaxed text-foreground transition-colors hover:bg-muted/50">
                {{ suggestion }}
              </span>
            </button>
          </div>

          <div
            v-for="message in chatMessages"
            :key="message.id"
            :class="['flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start']"
            :data-message-role="message.role"
          >
            <div
              :class="[
                'rounded-lg px-4 py-2.5',
                message.role === 'user'
                  ? 'max-w-[80%] bg-muted text-foreground'
                  : 'max-w-full bg-greys-50 text-greys-900'
              ]"
            >
              <p v-if="message.revealSegments" class="whitespace-pre-wrap text-sm leading-relaxed">
                <span
                  v-for="segment in message.revealSegments"
                  :key="segment.id"
                  class="animate-in fade-in duration-300"
                >{{ segment.text }}</span>
              </p>
              <p v-else class="whitespace-pre-wrap text-sm leading-relaxed">{{ message.content }}</p>
            </div>
            <div v-if="message.role === 'user'" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
              <span class="text-xs font-medium text-purple-700">{{ t('home.nscDashboard.ai.you') }}</span>
            </div>
          </div>

          <div v-if="isThinking" class="flex justify-start gap-3">
            <div class="rounded-lg bg-greys-50 px-4 py-2.5 text-greys-900">
              <div class="flex animate-pulse items-center gap-2 text-sm italic text-greys-500">
                <span>{{ t('home.nscDashboard.ai.thinking') }}</span>
                <span class="flex gap-1">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-greys-400" />
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-greys-400" />
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-greys-400" />
                </span>
              </div>
            </div>
          </div>

          <div v-if="isTyping && !isThinking" class="flex justify-start gap-3">
            <div class="rounded-lg bg-greys-50 px-4 py-2.5">
              <div class="flex gap-1">
                <div class="h-2 w-2 animate-bounce rounded-full bg-greys-400" />
                <div class="h-2 w-2 animate-bounce rounded-full bg-greys-400" style="animation-delay: 0.2s" />
                <div class="h-2 w-2 animate-bounce rounded-full bg-greys-400" style="animation-delay: 0.4s" />
              </div>
            </div>
          </div>

          <div v-if="chatError && !isTyping && !isThinking" class="flex justify-start gap-3">
            <div class="max-w-[80%] rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-red-900">
              <p class="whitespace-pre-wrap text-sm leading-relaxed">{{ chatError }}</p>
            </div>
          </div>
        </div>

        <div class="shrink-0 border-t border-black/5 pt-4">
          <div class="relative">
            <Input
              v-model="chatInput"
              type="text"
              :placeholder="t('home.nscDashboard.ai.placeholder')"
              class="w-full pr-12 text-sm"
              @keypress="handleKeyPress"
            />
            <button
              :disabled="!chatInput.trim() || isTyping || isThinking || isRevealingResponse"
              class="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 transition-colors hover:bg-greys-100 disabled:cursor-not-allowed disabled:opacity-50"
              :class="chatInput.trim() && !isTyping && !isThinking && !isRevealingResponse ? 'text-purple-600' : 'text-greys-400'"
              @click="sendMessage"
            >
              <Send :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
