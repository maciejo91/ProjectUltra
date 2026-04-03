<template>
  <div>
    <!-- Call Action Buttons Row (hidden when hideButton is true or call is already active; stays visible after call ends for Call Again) -->
    <div
      v-if="!hideButton && !isCallActive"
      class="flex items-center justify-between gap-3"
      :class="inline ? 'shrink-0' : 'mb-1 w-full'"
    >
      <Button
        variant="default"
        :disabled="isCallActive"
        class="inline-flex items-center gap-2 shrink-0"
        @click="$emit('start-call')"
      >
        <Phone :size="16" class="shrink-0" aria-hidden="true" />
        {{ contactAttempts > 0 ? 'Call Again' : 'Initiate Call' }}
      </Button>
      <div
        v-if="contactAttempts > 0"
        class="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-lg bg-muted border border-border text-sm text-muted-foreground"
        :title="contactAttempts >= maxContactAttempts - 1 ? 'One more attempt before auto-disqualification' : undefined"
      >
        <AlertTriangle
          v-if="contactAttempts >= maxContactAttempts - 1"
          :size="14"
          class="shrink-0 text-orange-600"
          aria-hidden="true"
        />
        <Phone v-else :size="14" class="shrink-0" aria-hidden="true" />
        <span class="font-medium tabular-nums">{{ contactAttempts }} / {{ maxContactAttempts }}</span>
      </div>
    </div>

    <!-- Floating Call Panel (when call is active or ended) -->
    <Teleport to="body">
      <div
        v-if="isCallActive || callEnded"
        ref="floatingPanelRef"
        class="fixed z-50 px-4 pb-3 select-none"
        :style="floatingPanelStyle"
        @mousedown="onDragStart"
      >
        <div
          class="bg-greys-900 text-white rounded-2xl shadow-2xl w-full overflow-hidden"
          style="max-width: 33.6rem; width: 100%;"
        >
          <!-- Top section (details, collapsible) -->
          <div
            class="px-6 pt-2 pb-2 transition-colors cursor-grab active:cursor-grabbing"
            :class="detailsVisible ? 'pt-3' : ''"
            style="background-color: rgb(31, 41, 55);"
          >
            <div class="flex items-center justify-between gap-2">
              <button
                type="button"
                class="flex items-center gap-2 min-w-0 text-left cursor-pointer"
                @click.stop="detailsVisible = !detailsVisible"
              >
                <template v-if="callEnded">
                  <span class="text-greys-400 text-sm shrink-0">
                    Call ended
                  </span>
                </template>
                <template v-else-if="detailsVisible">
                  <span class="text-greys-400 text-sm hover:text-white transition-colors shrink-0">
                    {{ 'Hide details' }}
                  </span>
                </template>
                <template v-else>
                  <span
                    v-if="isCallActive"
                    class="inline-flex items-center gap-2 text-sm animate-pulse truncate shrink-0"
                  >
                    <Sparkles
                      :size="16"
                      class="shrink-0 text-ai-gradient-start"
                      aria-hidden="true"
                    />
                    <span class="text-ai-gradient">Transcribing in progress...</span>
                  </span>
                  <span
                    v-else
                    class="text-sm text-greys-400 truncate"
                  >
                    Call summary
                  </span>
                </template>
              </button>
            </div>
            <!-- Summary (hidden for call simulation)
            <p v-if="detailsVisible && leadSummary" class="text-sm text-white leading-relaxed mt-2 mb-2">
              {{ leadSummary }}
            </p>
            -->

            <!-- Details: scrollable transcript block + fixed Extract button row -->
            <div
              v-if="detailsVisible"
              class="mt-3 pt-3 border-t flex flex-col"
              style="border-color: rgba(55, 65, 81, 0.5);"
              @mousedown.stop
            >
              <!-- Scrollable: log, summary, transcript only (keeps Extract button visible below) -->
              <div class="shrink-0 space-y-4">
                <!-- Log when call has ended -->
                <div v-if="callEnded && !isCallActive" class="text-sm text-muted-foreground">
                  {{ t('common.call.madeACall', { name: assignedPersonName || t('common.call.user') }) }}
                </div>

                <!-- Summary when call has ended (hidden for call simulation)
                <div v-if="callEnded && !isCallActive" class="space-y-1">
                  <h4 class="text-sm font-bold uppercase tracking-wider text-greys-400">Summary</h4>
                  <p class="text-sm text-white">
                    Lead confirmed their details and the call covered the main inquiry discussed in the transcript below.
                  </p>
                </div>
                -->

                <!-- Transcript (grey card, 3 lines with expand/collapse) - hidden for call simulation
                <div class="bg-greys-800 rounded-lg p-3 space-y-2 border border-greys-700">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{{ t('common.call.transcript') }}</span>
                    <button
                      v-if="transcriptLines.length > transcriptPreviewCount"
                      type="button"
                      class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      @click="transcriptExpanded = !transcriptExpanded"
                    >
                      {{ transcriptExpanded ? t('common.call.collapseTranscript') : t('common.call.expandTranscript') }}
                    </button>
                  </div>
                  <div class="space-y-1.5 text-sm font-mono">
                    <div
                      v-for="(line, idx) in visibleTranscriptLines"
                      :key="idx"
                      class="flex gap-2"
                    >
                      <span :class="line.speaker === 'Lead' ? 'text-emerald-600 font-semibold shrink-0' : 'text-green-400 font-semibold shrink-0'">{{ line.speaker }}:</span>
                      <span class="text-white wrap-break-word">{{ line.text }}</span>
                    </div>
                  </div>
                </div>
                -->
              </div>

            </div>
          </div>

          <!-- Bottom section (caller bar) -->
          <div
            class="px-6 py-3 flex items-center justify-between"
            style="background-color: rgb(17, 24, 39); border-top: 1px solid rgba(55, 65, 81, 0.5);"
            @mousedown.stop
          >
            <div class="flex flex-col justify-center gap-0.5">
              <h3 class="text-lg font-medium text-white m-0 leading-tight">
                {{ callerName || 'Caller' }}
              </h3>
              <p class="text-sm m-0 leading-tight" style="color: #9ca3af">
                {{ isCallActive ? t('common.call.inProgress') : t('common.call.ended') }} - {{ formattedCallDuration }}
              </p>
            </div>
            <div class="flex items-center gap-3">
              <Button
                v-if="isCallActive && showMuteButton"
                type="button"
                variant="outline"
                size="icon"
                class="call-popup-mic-btn w-10 h-10 rounded-full shrink-0 bg-greys-800 hover:bg-greys-800 border-0 text-white"
                :aria-label="isMuted ? 'Unmute' : 'Mute'"
                @click="$emit('toggle-mute')"
              >
                <MicOff v-if="isMuted" :size="20" aria-hidden="true" />
                <Mic v-else :size="20" aria-hidden="true" />
              </Button>
              <Button
                v-if="isCallActive"
                type="button"
                variant="outline"
                size="icon"
                class="w-10 h-10 rounded-full shrink-0 bg-red-600 hover:bg-red-700 border-0 text-white"
                :aria-label="t('common.call.endCall')"
                @click="onEndCallClick"
              >
                <PhoneOff :size="20" aria-hidden="true" />
              </Button>
              <template v-if="callEnded && !isCallActive">
                <AIButton
                  label="Extract with AI"
                  size="small"
                  class="extract-with-ai-btn shrink-0"
                  :loading="extractLoading"
                  @click="onExtractAndClose"
                />
                <Button
                  type="button"
                  variant="outline"
                  class="shrink-0 rounded-sm bg-greys-800 border border-greys-700 text-white hover:bg-greys-700 hover:text-white"
                  @click="emit('close')"
                >
                  {{ t('common.buttons.close') }}
                </Button>
              </template>
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
import { Phone, Sparkles, Mic, MicOff, PhoneOff, AlertTriangle } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
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
  /** When true, wrapper does not take full width so it can sit on same line as task action text */
  inline: {
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
  },
  /** When false, mute button is hidden (e.g. call simulation) */
  showMuteButton: {
    type: Boolean,
    default: true
  },
  assignedPersonName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['start-call', 'end-call', 'close', 'toggle-mute', 'log-manual-call', 'extract-information', 'update:call-notes', 'copy-number'])

const { t } = useI18n()
const detailsVisible = ref(false)
const transcriptExpanded = ref(true)
const transcriptPreviewCount = 3

const transcriptLines = computed(() => {
  const lead = props.mockTranscription?.leadLines ?? []
  const sales = props.mockTranscription?.salesLines ?? []
  const lines = []
  const maxLen = Math.max(lead.length, sales.length)
  for (let i = 0; i < maxLen; i++) {
    if (lead[i]) lines.push({ speaker: 'Lead', text: lead[i] })
    if (sales[i]) lines.push({ speaker: 'Sales', text: sales[i] })
  }
  return lines
})

const visibleTranscriptLines = computed(() => {
  if (transcriptExpanded.value) return transcriptLines.value
  return transcriptLines.value.slice(0, transcriptPreviewCount)
})
const showCloseConfirm = ref(false)
const extractLoading = ref(false)
const floatingPanelRef = ref(null)

// Draggable state
const position = ref({ x: null, bottom: null })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

const floatingPanelStyle = computed(() => {
  const base = {
    width: '33.6rem',
    maxWidth: 'calc(100% - 2rem)'
  }
  if (position.value.x !== null && position.value.bottom !== null) {
    return {
      ...base,
      left: `${position.value.x}px`,
      bottom: `${position.value.bottom}px`,
      transform: 'none',
      top: 'auto',
      right: 'auto'
    }
  }
  return {
    ...base,
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    top: 'auto',
    right: 'auto'
  }
})

// Keep call ended state collapsed (no expansion), same as transcribing

function onCloseClick() {
  if (props.isCallActive) {
    showCloseConfirm.value = true
  } else {
    emit('close')
  }
}

function onEndCallClick() {
  emit('end-call')
}

function onExtractAndClose() {
  extractLoading.value = true
  emit('extract-information')
  const simulatedDelayMs = 1500
  setTimeout(() => {
    extractLoading.value = false
    emit('close')
  }, simulatedDelayMs)
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
      if (position.value.x === null || position.value.bottom === null) {
        position.value = {
          x: rect.left,
          bottom: window.innerHeight - rect.bottom
        }
      }
      isDragging.value = true
      dragStart.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
  }
}

function onMouseMove(e) {
  if (!isDragging.value) return
  const rect = floatingPanelRef.value?.getBoundingClientRect()
  if (!rect) return
  let x = e.clientX - dragStart.value.x
  const panelBottom = window.innerHeight - (e.clientY - dragStart.value.y + rect.height)
  const maxX = window.innerWidth - 100
  x = Math.max(0, Math.min(x, maxX))
  const minBottom = 0
  const maxBottom = window.innerHeight - 100
  const bottom = Math.max(minBottom, Math.min(maxBottom, panelBottom))
  position.value = { x, bottom }
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

</script>

<style scoped>
.call-popup-mic-btn:hover,
.call-popup-mic-btn:hover :deep(svg) {
  color: white;
}
</style>
