<template>
  <div class="space-y-4 w-full min-w-0">
    <!-- LSK call simulation panel -->
    <CallInterface
      v-if="showCallPanel"
      :hide-button="true"
      :is-call-active="isCallActive"
      :call-ended="callEnded"
      :call-duration="callDuration"
      :call-notes="callNotes"
      :formatted-call-duration="formattedCallDuration"
      :mock-transcription="mockTranscription"
      :contact-attempts="0"
      :max-contact-attempts="3"
      :lead-summary="''"
      :caller-name="contactName"
      :assigned-person-name="assignedPersonName"
      :is-muted="isMuted"
      @start-call="startCall"
      @end-call="onEndCall"
      @close="onCallClose"
      @toggle-mute="toggleMute"
      @extract-information="handleExtractInformation"
      @update:call-notes="updateCallNotes"
      @copy-number="copyNumber"
    />

    <!-- Initiate call button -->
    <div class="w-full px-6">
      <Button
        variant="default"
        :disabled="isCallActive"
        class="inline-flex items-center gap-2 shrink-0"
        @click="startOutboundCall"
      >
        <Phone :size="16" class="shrink-0" aria-hidden="true" />
        Initiate call
      </Button>
    </div>

    <!-- Outcome area: label grouped with Answer / No answer toggles -->
    <div class="mk-expanded-cards-area space-y-3 px-6 pt-4">
      <div class="space-y-4">
        <p class="text-sm font-medium text-foreground leading-normal mb-3">What's the outcome?</p>
        <div class="outcome-toggle-group grid grid-cols-3 gap-3">
          <Toggle
            variant="outline"
            :model-value="logCallOutcome === 'answer'"
            @update:model-value="(p) => logCallOutcome = p ? 'answer' : null"
            class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
          >
            <span class="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
              <Phone :size="14" class="text-muted-foreground" />
            </span>
            <span>Answer</span>
          </Toggle>
          <Toggle
            variant="outline"
            :model-value="logCallOutcome === 'no-answer'"
            @update:model-value="(p) => logCallOutcome = p ? 'no-answer' : null"
            class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
          >
            <span class="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
              <PhoneOff :size="14" class="text-muted-foreground" />
            </span>
            <span>No answer</span>
          </Toggle>
        </div>

        <div class="bg-white rounded-lg p-4 shadow-nsc-card">
          <Label class="form-label">When did you call?</Label>
          <Input
            type="datetime-local"
            v-model="logCallDateTime"
            class="w-full"
          />
        </div>

        <div class="bg-white rounded-lg p-4 shadow-nsc-card">
          <Label class="form-label">Call notes</Label>
          <Textarea
            v-model="notes"
            class="w-full"
            rows="4"
            placeholder="Add notes about the call..."
          />
        </div>

        <div class="flex justify-end gap-2 pt-3 w-full">
          <Button variant="secondary" @click="$emit('cancel')">
            Cancel
          </Button>
          <Button
            variant="default"
            :disabled="!logCallOutcome"
            @click="submitLogCall"
          >
            Log call
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Phone, PhoneOff } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { Button, Label, Textarea, Input, Toggle } from '@motork/component-library/future/primitives'
import CallInterface from '@/components/tasks/lead/CallInterface.vue'
import { useLQWidgetCall } from '@/composables/useLQWidgetCall'
import { useUserStore } from '@/stores/user'
import { simulateCallExtraction } from '@/simulation/callExtractionSimulation'

const props = defineProps({
  phoneNumber: {
    type: String,
    required: true
  },
  contactName: {
    type: String,
    default: 'Customer'
  }
})

const emit = defineEmits(['call', 'cancel'])

const notes = ref('')
const showCallPanel = ref(false)
const logCallOutcome = ref(null)
const logCallDateTime = ref('')
const extractedThenClosing = ref(false)

const userStore = useUserStore()
const assignedPersonName = computed(() => userStore.currentUser?.name ?? '')

const callState = useLQWidgetCall()
const {
  isCallActive,
  callEnded,
  callDuration,
  callNotes,
  isMuted,
  callData,
  mockTranscription,
  formattedCallDuration,
  startCall: startCallFromComposable,
  endCall: endCallFromComposable,
  toggleMute,
  copyNumber: copyNumberFromComposable,
  resetCall
} = callState

function startCall() {
  startCallFromComposable()
}

function startOutboundCall() {
  showCallPanel.value = true
  startCallFromComposable()
}

function onEndCall() {
  endCallFromComposable()
}

function updateCallNotes(value) {
  callNotes.value = value
}

function copyNumber() {
  copyNumberFromComposable(props.phoneNumber)
}

function formatDateTimeLocal(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day}T${h}:${min}`
}

function handleExtractInformation() {
  const data = callData.value
  logCallOutcome.value = 'answer'
  const transcription = data?.transcription
  const leadLines = transcription?.leadLines ?? []
  if (leadLines.length) {
    try {
      const result = simulateCallExtraction(data)
      notes.value = result.additionalNotes || notes.value
    } catch {
      notes.value = leadLines.join(' ')
    }
  } else {
    notes.value = callNotes.value || 'Call summary extracted from transcript.'
  }
  logCallDateTime.value = formatDateTimeLocal(new Date())
  extractedThenClosing.value = true
}

function onCallClose() {
  resetCall()
  showCallPanel.value = false
  extractedThenClosing.value = false
}

function submitLogCall() {
  if (!logCallOutcome.value) return
  emit('call', {
    type: 'call',
    option: 'log',
    phoneNumber: props.phoneNumber,
    outcome: logCallOutcome.value,
    callLogDateTime: logCallDateTime.value || null,
    notes: notes.value
  })
}
</script>
