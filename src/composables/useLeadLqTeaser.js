import { computed, toValue } from 'vue'
import { useLeadActions } from '@/composables/useLeadActions'
import { mergeContactIntoDescription, getNoPhoneContactDescription } from '@/utils/taskActionTitle'

/**
 * Teaser copy for request detail Overview (matches LQTask contact line without mounting LQTask).
 */
export function useLeadLqTeaser(leadRef) {
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

  return {
    showTeaser,
    teaserLine,
    leadActions
  }
}
