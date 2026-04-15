import { computed, toValue } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/settings'
import { useLeadActions } from '@/composables/useLeadActions'
import {
  mergeContactIntoDescription,
  getNoPhoneContactDescription,
  getTaskDisplayTitle
} from '@/utils/taskActionTitle'
import { getRequestedVehicleDisplayLabel } from '@/utils/vehicleHelpers'
import { getDisplayStage, LEAD_STAGES } from '@/utils/stageMapper'

/**
 * Teaser copy for request detail Overview (matches LQTask contact line without mounting LQTask).
 */
export function useLeadLqTeaser(leadRef) {
  const { t } = useI18n()
  const settingsStore = useSettingsStore()
  const leadActions = useLeadActions(leadRef, {})

  const isAwaitingScheduledCallback = computed(() => {
    const lead = toValue(leadRef)
    if (!lead) return false
    const stage = getDisplayStage(lead, 'lead')
    return stage === LEAD_STAGES.TO_BE_CALLED_BACK || stage === LEAD_STAGES.VALID_TO_BE_CALLED_BACK
  })

  const hasPhone = computed(() => {
    const lead = toValue(leadRef)
    return !!(lead?.customer?.phone ?? '').trim()
  })

  const teaserLine = computed(() => {
    const lead = toValue(leadRef)
    if (!lead) return ''
    const base =
      leadActions.primaryAction.value?.description ||
      'Begin lead qualification by verifying customer contact information.'
    const name = lead.customer?.name ?? ''
    const phone = lead.customer?.phone ?? ''
    if (!hasPhone.value) return getNoPhoneContactDescription(name)
    return mergeContactIntoDescription(base, name, phone)
  })

  const showTeaser = computed(() => {
    const lead = toValue(leadRef)
    if (!lead || lead.type !== 'lead') return false
    return leadActions.showLQWidget.value && !leadActions.isClosed.value
  })

  const contactAttemptsCount = computed(() => {
    const lead = toValue(leadRef)
    return lead?.contactAttempts?.length ?? 0
  })

  const maxContactAttemptsLimit = computed(
    () => settingsStore.getSetting('maxContactAttempts') ?? 5
  )

  const CALL_ATTEMPT_ORDINAL_KEYS = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
    'tenth'
  ]

  function callAttemptOrdinalKey(nextAttemptNumber) {
    const n = Math.floor(Number(nextAttemptNumber)) || 1
    const clamped = Math.min(Math.max(n, 1), CALL_ATTEMPT_ORDINAL_KEYS.length)
    return CALL_ATTEMPT_ORDINAL_KEYS[clamped - 1]
  }

  const primaryActionKeysWithCallAttemptTitle = ['call-to-verify', 'call-prospect']

  const headerTaskTitle = computed(() => {
    const lead = toValue(leadRef)
    if (!lead) return ''
    const actionKey = leadActions.primaryAction.value?.key
    if (primaryActionKeysWithCallAttemptTitle.includes(actionKey)) {
      const nextAttempt = contactAttemptsCount.value + 1
      const ordinalKey = callAttemptOrdinalKey(nextAttempt)
      return t('requestDetail.lqfTask.makeOrdinalCallAttempt', {
        ordinal: t(`requestDetail.lqfTask.callAttemptOrdinal.${ordinalKey}`)
      })
    }
    return getTaskDisplayTitle(lead) || ''
  })

  const headerContactSubline = computed(() => {
    const lead = toValue(leadRef)
    if (!lead) return ''
    const name = (lead.customer?.name ?? '').trim()
    const phone = (lead.customer?.phone ?? '').trim()
    const email = (lead.customer?.email ?? '').trim()
    if (!name && !phone && !email) return ''
    if (name && phone) return `${name} · ${phone}`
    if (!hasPhone.value && leadActions.primaryAction.value?.key === 'call-to-verify') {
      return email
    }
    return name || phone || email
  })

  const callNowTelHref = computed(() => {
    const lead = toValue(leadRef)
    const phone = (lead.customer?.phone ?? '').trim()
    if (!phone) return ''
    return `tel:${phone}`
  })

  const callingSessionTitle = computed(() => {
    const lead = toValue(leadRef)
    if (!lead) return ''
    if (isAwaitingScheduledCallback.value) return ''
    const name = (lead.customer?.name ?? '').trim()
    const vehicleLabel = getRequestedVehicleDisplayLabel(lead.requestedCar || lead.vehicle)
    const displayName = name || t('requestDetail.floatingLq.callingNameFallback')
    const isEmailVerifyFlow =
      !hasPhone.value && leadActions.primaryAction.value?.key === 'call-to-verify'
    if (isEmailVerifyFlow) {
      if (vehicleLabel) {
        return t('requestDetail.floatingLq.emailSessionWithVehicle', {
          name: displayName,
          vehicle: vehicleLabel
        })
      }
      return t('requestDetail.floatingLq.emailSessionWithoutVehicle', { name: displayName })
    }
    if (vehicleLabel) {
      return t('requestDetail.floatingLq.callingWithVehicle', {
        name: displayName,
        vehicle: vehicleLabel
      })
    }
    return t('requestDetail.floatingLq.callingWithoutVehicle', { name: displayName })
  })

  return {
    showTeaser,
    teaserLine,
    leadActions,
    headerTaskTitle,
    headerContactSubline,
    callNowTelHref,
    callingSessionTitle,
    contactAttemptsCount,
    maxContactAttemptsLimit
  }
}
