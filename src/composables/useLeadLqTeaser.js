import { computed, toValue } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLeadActions } from '@/composables/useLeadActions'
import {
  mergeContactIntoDescription,
  getNoPhoneContactDescription,
  getTaskDisplayTitle
} from '@/utils/taskActionTitle'
import { getRequestedVehicleDisplayLabel } from '@/utils/vehicleHelpers'

/**
 * Teaser copy for request detail Overview (matches LQTask contact line without mounting LQTask).
 */
export function useLeadLqTeaser(leadRef) {
  const { t } = useI18n()
  const leadActions = useLeadActions(leadRef, {})

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

  const headerTaskTitle = computed(() => {
    const lead = toValue(leadRef)
    if (!lead) return ''
    return getTaskDisplayTitle(lead) || ''
  })

  const headerContactSubline = computed(() => {
    const lead = toValue(leadRef)
    if (!lead) return ''
    const name = (lead.customer?.name ?? '').trim()
    const phone = (lead.customer?.phone ?? '').trim()
    if (!name && !phone) return ''
    if (name && phone) return `${name} · ${phone}`
    return name || phone
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
    const name = (lead.customer?.name ?? '').trim()
    const vehicleLabel = getRequestedVehicleDisplayLabel(lead.requestedCar || lead.vehicle)
    const displayName = name || t('requestDetail.floatingLq.callingNameFallback')
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
    callingSessionTitle
  }
}
