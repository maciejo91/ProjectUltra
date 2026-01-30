<template>
  <div>
    <!-- Call Action Buttons Row (hidden when hideButton is true or call is already active) -->
    <div v-if="!hideButton && !isCallActive && !callEnded" class="flex gap-2 items-center mb-4">
      <Button
        variant="default"
        :disabled="isCallActive"
        class="inline-flex items-center gap-2"
        @click="$emit('start-call')"
      >
        <Phone :size="16" class="shrink-0" aria-hidden="true" />
        {{ contactAttempts > 0 ? 'Call Again' : 'Initiate Call' }}
      </Button>
    </div>

    <!-- Floating Call Panel (when call is active or ended) -->
    <Teleport to="body">
      <div
        v-if="isCallActive || callEnded"
        ref="floatingPanelRef"
        class="fixed z-50 px-4 pb-4 select-none"
        :style="floatingPanelStyle"
        @mousedown="onDragStart"
      >
        <div class="bg-greys-900 text-white rounded-2xl shadow-2xl w-full overflow-hidden" style="max-width: 42rem; width: 100%;">
          <!-- Top section (details, collapsible) -->
          <div
            class="px-6 pt-4 pb-3 transition-colors cursor-grab active:cursor-grabbing"
            style="background-color: rgb(31, 41, 55);"
          >
            <div class="flex items-center justify-between mb-3">
              <button
                type="button"
                class="text-greys-400 text-sm hover:text-white transition-colors cursor-pointer"
                @click.stop="detailsVisible = !detailsVisible"
              >
                {{ detailsVisible ? 'Hide details' : 'Show details' }}
              </button>
              <button
                type="button"
                class="text-greys-400 hover:text-white transition-colors cursor-pointer p-1"
                aria-label="Close"
                @click.stop="onCloseClick"
              >
                <X :size="headerIconSize" class="shrink-0" aria-hidden="true" />
              </button>
            </div>
            <p v-if="leadSummary" class="text-sm text-white leading-relaxed mb-3">
              {{ leadSummary }}
            </p>
            <div class="flex items-center justify-between gap-2 mt-3">
              <div class="flex items-center gap-2">
                <Sparkles
                  v-if="isCallActive"
                  :size="16"
                  class="text-orange-500 shrink-0"
                  aria-hidden="true"
                />
                <span
                  v-if="isCallActive"
                  class="text-sm text-orange-500 animate-pulse"
                >
                  Transcribing in progress...
                </span>
                <span
                  v-else
                  class="text-sm text-greys-400"
                >
                  Call summary
                </span>
              </div>
              <button
                type="button"
                class="text-greys-400 hover:text-white transition-colors cursor-pointer p-1"
                :aria-label="detailsVisible ? 'Collapse details' : 'Expand details'"
                @click.stop="detailsVisible = !detailsVisible"
              >
                <ChevronDown
                  :size="headerIconSize"
                  class="transition-transform shrink-0"
                  :class="{ 'rotate-180': detailsVisible }"
                  aria-hidden="true"
                />
              </button>
            </div>

            <!-- Merged content: transcript, quick note, summary, Extract information (single scrollable block when details expanded) -->
            <div
              v-if="detailsVisible"
              class="mt-4 pt-4 border-t overflow-y-auto space-y-4 max-h-64"
              style="border-color: rgba(55, 65, 81, 0.5);"
              @mousedown.stop
            >
              <!-- Summary when call has ended -->
              <div v-if="callEnded && !isCallActive" class="space-y-1">
                <h4 class="text-xs font-bold uppercase tracking-wider text-greys-400">Summary</h4>
                <p class="text-sm text-white">
                  Lead confirmed their details and the call covered the main inquiry discussed in the transcript below.
                </p>
              </div>

              <!-- Mock Transcription -->
              <div class="space-y-3 text-sm font-mono">
                <div>
                  <span class="text-blue-400 font-semibold">Lead:</span>
                  <span class="ml-2 text-white">{{ mockTranscription.leadLines[0] }}</span>
                </div>
                <div>
                  <span class="text-green-400 font-semibold">Sales:</span>
                  <span class="ml-2 text-white">{{ mockTranscription.salesLines[0] }}</span>
                </div>
                <div v-if="callDuration >= 5">
                  <span class="text-blue-400 font-semibold">Lead:</span>
                  <span class="ml-2 text-white">{{ mockTranscription.leadLines[1] }}</span>
                </div>
                <div v-if="callDuration >= 8">
                  <span class="text-green-400 font-semibold">Sales:</span>
                  <span class="ml-2 text-white">{{ mockTranscription.salesLines[1] }}</span>
                </div>
                <div v-if="callDuration >= 12">
                  <span class="text-blue-400 font-semibold">Lead:</span>
                  <span class="ml-2 text-white">{{ mockTranscription.leadLines[2] }}</span>
                </div>
              </div>

              <!-- Quick Note (only while call is active) -->
              <div v-if="isCallActive" class="pt-4 border-t" style="border-color: rgba(55, 65, 81, 0.5);">
                <textarea
                  :model-value="callNotes"
                  placeholder="Add a quick note about this call..."
                  class="w-full p-3 bg-greys-800 border rounded-sm text-white text-sm placeholder-greys-500 focus:outline-none focus:border-primary resize-none"
                  style="border-color: rgba(55, 65, 81, 0.5);"
                  rows="3"
                  @update:model-value="$emit('update:call-notes', $event)"
                  @mousedown.stop
                />
              </div>

              <!-- Extract information (when call ended) -->
              <div v-if="callEnded && !isCallActive" class="pt-4">
                <AIButton
                  label="Extract information"
                  size="small"
                  @click="$emit('extract-information')"
                />
              </div>
            </div>
          </div>

          <!-- Bottom section (caller bar) -->
          <div
            class="px-6 py-4 flex items-center justify-between min-h-[80px]"
            style="background-color: rgb(17, 24, 39); border-top: 1px solid rgba(55, 65, 81, 0.5);"
            @mousedown.stop
          >
            <div class="flex flex-col">
              <h3 class="text-lg font-medium text-white">
                {{ callerName || 'Caller' }}
              </h3>
              <p class="text-sm text-greys-400">
                {{ isCallActive ? 'Call in progress' : 'Call ended' }} - {{ formattedCallDuration }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <Button
                v-if="isCallActive"
                type="button"
                variant="outline"
                size="icon"
                class="w-10 h-10 rounded-full shrink-0 bg-greys-800 hover:bg-greys-700 border-0 text-white"
                :aria-label="isMuted ? 'Unmute' : 'Mute'"
                @click="$emit('toggle-mute')"
              >
                <Mic :size="20" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                class="w-10 h-10 rounded-full shrink-0 bg-red-600 hover:bg-red-700 border-0 text-white"
                aria-label="End call"
                @click="$emit('end-call')"
              >
                <PhoneOff :size="20" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm end call dialog (when closing while call is in progress) -->
    <Dialog :open="showCloseConfirm" @update:open="showCloseConfirm = $event">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
        <DialogContent class="w-full sm:max-w-md" :show-close-button="true">
          <DialogHeader class="shrink-0">
            <DialogTitle>End call?</DialogTitle>
            <DialogDescription>
              The call is still in progress. Are you sure you want to end the call and close?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
            <Button
              variant="outline"
              class="rounded-sm w-full sm:w-auto"
              @click="showCloseConfirm = false"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              class="rounded-sm w-full sm:w-auto"
              @click="confirmClose"
            >
              End call
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  </div>
</template>

<script setup>
import { Phone, ChevronDown, Sparkles, Mic, PhoneOff, X } from 'lucide-vue-next'
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import AIButton from '@/components/shared/AIButton.vue'

const props = defineProps({
  isCallActive: {
    type: Boolean,
    required: true
  },
  callEnded: {
    type: Boolean,
    required: true
  },
  callDuration: {
    type: Number,
    required: true
  },
  callNotes: {
    type: String,
    required: true
  },
  formattedCallDuration: {
    type: String,
    required: true
  },
  mockTranscription: {
    type: Object,
    required: true
  },
  contactAttempts: {
    type: Number,
    required: true
  },
  maxContactAttempts: {
    type: Number,
    required: true
  },
  hideButton: {
    type: Boolean,
    default: false
  },
  leadSummary: {
    type: String,
    default: ''
  },
  callerName: {
    type: String,
    default: ''
  },
  isMuted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['start-call', 'end-call', 'close', 'toggle-mute', 'log-manual-call', 'extract-information', 'update:call-notes', 'copy-number'])

const headerIconSize = 20
const detailsVisible = ref(false)
const showCloseConfirm = ref(false)
const floatingPanelRef = ref(null)

// Draggable state
const position = ref({ x: null, y: null })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const floatingPanelStyle = computed(() => {
  const base = {
    width: '42rem',
    maxWidth: 'calc(100% - 2rem)'
  }
  if (position.value.x !== null && position.value.y !== null) {
    return {
      ...base,
      left: `${position.value.x}px`,
      top: `${position.value.y}px`,
      transform: 'none',
      bottom: 'auto',
      right: 'auto'
    }
  }
  return {
    ...base,
    left: '50%',
    bottom: '1rem',
    transform: 'translateX(-50%)',
    top: 'auto',
    right: 'auto'
  }
})

function onCloseClick() {
  if (props.isCallActive) {
    showCloseConfirm.value = true
  } else {
    emit('close')
  }
}

function confirmClose() {
  showCloseConfirm.value = false
  emit('end-call')
  emit('close')
}

function onDragStart(e) {
  if (!e.target.closest('button') && !e.target.closest('textarea') && !e.target.closest('a')) {
    const rect = floatingPanelRef.value?.getBoundingClientRect()
    if (rect) {
      if (position.value.x === null || position.value.y === null) {
        position.value = { x: rect.left, y: rect.top }
      }
      isDragging.value = true
      dragStart.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
  }
}

function onMouseMove(e) {
  if (!isDragging.value) return
  let x = e.clientX - dragStart.value.x
  let y = e.clientY - dragStart.value.y
  const maxX = window.innerWidth - 100
  const maxY = window.innerHeight - 100
  x = Math.max(0, Math.min(x, maxX))
  y = Math.max(0, Math.min(y, maxY))
  position.value = { x, y }
}

function onMouseUp() {
  isDragging.value = false
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})

watch(
  () => props.isCallActive,
  (isActive, wasActive) => {
    if (isActive && !wasActive) {
      detailsVisible.value = true
    }
  }
)
</script>
