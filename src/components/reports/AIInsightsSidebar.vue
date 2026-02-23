<template>
  <div
    class="rounded-lg p-px flex flex-col shrink-0"
    style="background: linear-gradient(to right, #40B3E9, #8873FF, #FF8B42); height: 480px"
  >
    <div class="bg-muted rounded-lg flex flex-col h-full overflow-hidden">
      <!-- Title Section -->
      <div class="px-4 py-4 flex items-center justify-between shrink-0">
        <h3 class="text-lg font-medium text-foreground leading-5">Insights powered by AI</h3>
      </div>

      <!-- Card Content -->
      <div
        class="bg-white rounded-lg p-4 shadow-nsc-card flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        <div ref="chatContainerRef" class="flex-1 overflow-y-auto space-y-4 min-h-0 pr-2">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start',
            ]"
          >
            <div
              v-if="message.role === 'assistant'"
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style="background: linear-gradient(to bottom right, #40B3E9, #8873FF, #FF8B42);"
            >
              <Sparkles :size="14" class="text-white" />
            </div>
            <div
              :class="[
                'rounded-lg px-4 py-2.5 max-w-[80%]',
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-muted text-foreground border border-border',
              ]"
            >
              <p class="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {{ message.content }}
              </p>
            </div>
            <div
              v-if="message.role === 'user'"
              class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0"
            >
              <span class="text-xs font-medium text-purple-700">You</span>
            </div>
          </div>

          <div v-if="isThinking" class="flex gap-3 justify-start">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style="background: linear-gradient(to bottom right, #40B3E9, #8873FF, #FF8B42);"
            >
              <Sparkles :size="14" class="text-white" />
            </div>
            <div class="bg-muted text-foreground border border-border rounded-lg px-4 py-2.5">
              <p class="text-sm text-muted-foreground italic">Thinking...</p>
            </div>
          </div>

          <div v-if="isTyping && !isThinking" class="flex gap-3 justify-start">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style="background: linear-gradient(to bottom right, #40B3E9, #8873FF, #FF8B42);"
            >
              <Sparkles :size="14" class="text-white" />
            </div>
            <div class="bg-muted text-foreground border border-border rounded-lg px-4 py-2.5">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0s" />
                <span class="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0.2s" />
                <span class="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style="animation-delay: 0.4s" />
              </div>
            </div>
          </div>

          <div v-if="chatError && !isTyping && !isThinking" class="flex gap-3 justify-start">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style="background: linear-gradient(to bottom right, #40B3E9, #8873FF, #FF8B42);"
            >
              <Sparkles :size="14" class="text-white" />
            </div>
            <div class="bg-red-50 text-red-900 border border-red-200 rounded-lg px-4 py-2.5 max-w-[80%]">
              <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ chatError }}</p>
            </div>
          </div>
        </div>

        <div class="border-t border-border shrink-0 pt-4">
          <div
            v-if="messages.length === 0 && !isTyping && !isThinking"
            class="mb-3 flex flex-wrap gap-2"
          >
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              type="button"
              @click="handleSuggestionClick(suggestion)"
              class="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 border border-border rounded-lg text-foreground transition-colors cursor-pointer"
            >
              {{ suggestion }}
            </button>
          </div>
          <div class="relative">
            <input
              v-model="questionInput"
              type="text"
              placeholder="Ask anything..."
              class="w-full pr-12 text-sm rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              :disabled="isTyping || isThinking"
              @keypress="handleKeyPress"
            />
            <button
              type="button"
              :disabled="!questionInput.trim() || isTyping || isThinking"
              @click="handleAsk"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
              :class="questionInput.trim() && !isTyping && !isThinking ? 'text-purple-600' : 'text-muted-foreground'"
            >
              <Send :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Send, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isThinking: {
    type: Boolean,
    default: false
  },
  isTyping: {
    type: Boolean,
    default: false
  },
  chatError: {
    type: String,
    default: null
  },
  suggestions: {
    type: Array,
    default: () => ["Who's performing best?", "How many deals were closed?", "What's the conversion rate?"]
  }
})

const emit = defineEmits(['send'])

const questionInput = ref('')
const chatContainerRef = ref(null)

const handleSuggestionClick = (suggestion) => {
  if (props.isTyping || props.isThinking) return
  questionInput.value = suggestion
  handleAsk()
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleAsk()
  }
}

const handleAsk = () => {
  const text = questionInput.value?.trim()
  if (!text || props.isTyping || props.isThinking) return
  emit('send', text)
  questionInput.value = ''
}

watch(
  () => [...props.messages, props.isThinking, props.isTyping],
  () => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  },
  { flush: 'post' }
)
</script>
