<template>
  <div class="space-y-4 w-full min-w-0">
    <!-- LSK call simulation panel -->
    <CallInterface
      v-if="showCallPanel"
      :hide-button="true"
      :show-mute-button="false"
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

    <div class="space-y-4 w-full">
      <div class="space-y-2">
        <Label class="text-sm font-medium text-foreground">{{ t('common.call.direction') }}</Label>
        <div class="outcome-toggle-group flex flex-wrap gap-3">
          <Toggle
            variant="outline"
            :model-value="callDirection === 'outbound'"
            class="outcome-toggle-item h-10"
            @update:model-value="(p) => (callDirection = p ? 'outbound' : null)"
          >
            {{ t('common.call.directionOutbound') }}
          </Toggle>
          <Toggle
            variant="outline"
            :model-value="callDirection === 'inbound'"
            class="outcome-toggle-item h-10"
            @update:model-value="(p) => (callDirection = p ? 'inbound' : null)"
          >
            {{ t('common.call.directionInbound') }}
          </Toggle>
        </div>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium text-foreground">{{ t('common.call.time') }}</Label>
        <Popover :open="timePickerOpen" @update:open="(v) => (timePickerOpen = v)">
          <PopoverTrigger as-child>
            <Button variant="outline" type="button" class="w-full justify-between h-10">
              <span class="truncate">
                {{ callTime || t('common.call.timePlaceholder') }}
              </span>
              <ChevronDown class="size-3 shrink-0 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" class="w-72 p-3">
            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">{{ t('common.call.time') }}</Label>
              <Input type="time" v-model="callTime" class="h-10 w-full" />
              <div class="flex justify-end">
                <Button type="button" variant="secondary" size="sm" class="rounded-sm" @click="timePickerOpen = false">
                  {{ t('common.buttons.close') }}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium text-foreground">{{ t('common.call.outcome') }}</Label>
        <Select v-model="callOutcome">
          <SelectTrigger class="h-10 w-full">
            <SelectValue :placeholder="t('common.call.outcomePlaceholder')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="answer">{{ t('common.call.outcomeAnswer') }}</SelectItem>
            <SelectItem value="no-answer">{{ t('common.call.outcomeNoAnswer') }}</SelectItem>
            <SelectItem value="not-interested">{{ t('common.call.outcomeNotInterested') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label class="text-sm font-medium text-foreground">{{ t('common.call.notes') }}</Label>
        <Textarea
          v-model="notes"
          class="w-full"
          rows="4"
          :placeholder="t('common.call.notesPlaceholder')"
        />
      </div>

      <div class="flex justify-end gap-2 pt-2 w-full">
        <Button variant="secondary" type="button" @click="$emit('cancel')">
          {{ t('common.buttons.cancel') }}
        </Button>
        <Button variant="default" type="button" class="rounded-sm" :disabled="!callOutcome" @click="submitLogCall">
          {{ t('common.call.logCallManually') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Toggle
} from '@motork/component-library/future/primitives'
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

const emit = defineEmits(['call', 'cancel', 'call-panel-closed'])

const { t } = useI18n()

const notes = ref('')
const showCallPanel = ref(false)
const callOutcome = ref(null)
const callDirection = ref(null)
const callTime = ref('')
const timePickerOpen = ref(false)
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
  callOutcome.value = 'answer'
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
  const now = new Date()
  callTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  extractedThenClosing.value = true
}

function onCallClose() {
  resetCall()
  showCallPanel.value = false
  extractedThenClosing.value = false
  emit('call-panel-closed')
}

function submitLogCall() {
  if (!callOutcome.value) return
  emit('call', {
    type: 'call',
    option: 'log',
    phoneNumber: props.phoneNumber,
    direction: callDirection.value || null,
    outcome: callOutcome.value,
    callTime: callTime.value || null,
    notes: notes.value || ''
  })
}

defineExpose({ startOutboundCall })
</script>
