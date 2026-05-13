<template>
  <div class="bg-white rounded-lg p-4 shadow-nsc-card">
    <div>
      <Label class="block text-sm font-medium text-muted-foreground mb-1.5">{{ t('requestDetail.closeAsLost.reason') }}</Label>
      <Select v-model="reason">
        <SelectTrigger class="w-full">
          <SelectValue :placeholder="t('requestDetail.closeAsLost.selectReason')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-if="showMultipleNoShows" value="Multiple no shows">{{ t('requestDetail.closeAsLost.reasons.multipleNoShows') }}</SelectItem>
          <SelectItem value="Data cleanup">{{ t('requestDetail.closeAsLost.reasons.dataCleanup') }}</SelectItem>
          <SelectItem value="Unreachable">{{ t('requestDetail.closeAsLost.reasons.unreachable') }}</SelectItem>
          <SelectItem value="Purchase postponed">{{ t('requestDetail.closeAsLost.reasons.purchasePostponed') }}</SelectItem>
          <SelectItem value="Vehicle sold">{{ t('requestDetail.closeAsLost.reasons.vehicleSold') }}</SelectItem>
          <SelectItem value="Out of budget">{{ t('requestDetail.closeAsLost.reasons.outOfBudget') }}</SelectItem>
          <SelectItem value="Financing rejected">{{ t('requestDetail.closeAsLost.reasons.financingRejected') }}</SelectItem>
          <SelectItem value="Duplicate">{{ t('requestDetail.closeAsLost.reasons.duplicate') }}</SelectItem>
          <SelectItem value="Bought elsewhere">{{ t('requestDetail.closeAsLost.reasons.boughtElsewhere') }}</SelectItem>
          <SelectItem value="Not interested">{{ t('requestDetail.closeAsLost.reasons.notInterested') }}</SelectItem>
          <SelectItem value="Budget constraints">{{ t('requestDetail.closeAsLost.reasons.budgetConstraints') }}</SelectItem>
          <SelectItem value="Found better price">{{ t('requestDetail.closeAsLost.reasons.foundBetterPrice') }}</SelectItem>
          <SelectItem value="No response">{{ t('requestDetail.closeAsLost.reasons.noResponse') }}</SelectItem>
          <SelectItem value="Wrong timing">{{ t('requestDetail.closeAsLost.reasons.wrongTiming') }}</SelectItem>
          <SelectItem value="Other">{{ t('requestDetail.closeAsLost.reasons.other') }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@motork/component-library/future/primitives'

const { t } = useI18n()

const props = defineProps({
  showMultipleNoShows: {
    type: Boolean,
    default: false
  },
  preselectedReason: {
    type: String,
    default: ''
  },
  closeButtonLabel: {
    type: String,
    default: 'Close'
  }
})

const emit = defineEmits(['close', 'cancel', 'update:reason'])

const reason = ref(props.preselectedReason || '')

watch(() => props.preselectedReason, (newVal) => {
  if (newVal) {
    reason.value = newVal
  }
})

watch(reason, (v) => {
  emit('update:reason', v)
})

// Validation
const canSubmit = computed(() => !!reason.value)

// Submit method - called by parent
function submit() {
  if (!canSubmit.value) return
  emit('close', reason.value)
}

// Expose values for parent component access
defineExpose({
  reason,
  canSubmit,
  submit
})
</script>
