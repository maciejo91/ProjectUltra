/**
 * useDuplicateDetection – find potential duplicate requests (leads/opportunities)
 *
 * API-ready shape: returns { potentialDuplicates } so backend can provide
 * request.potentialDuplicates directly later.
 *
 * Frontend logic (mock phase): same customer (email or phone) AND similar
 * vehicle (brand + model match). Same-type only: lead→lead, opp→opp.
 */
import { computed } from 'vue'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { getDisplayStage } from '@/utils/stageMapper'

function getVehicleKey(task) {
  const v = task.requestedCar || task.vehicle
  if (!v || (!v.brand && !v.model)) return ''
  const brand = (v.brand || '').toLowerCase().trim()
  const model = (v.model || '').toLowerCase().trim()
  return `${brand}|${model}`
}

function sameCustomer(a, b) {
  const custA = a.customer || a
  const custB = b.customer || b
  const emailA = (custA.email || '').trim().toLowerCase()
  const emailB = (custB.email || '').trim().toLowerCase()
  const phoneA = (custA.phone || '').replace(/\D/g, '')
  const phoneB = (custB.phone || '').replace(/\D/g, '')
  if (emailA && emailB && emailA === emailB) return true
  if (phoneA && phoneB && phoneA === phoneB) return true
  if (a.customerId && b.customerId && a.customerId === b.customerId) return true
  return false
}

function toRequestShape(item, type) {
  return {
    ...item,
    type,
    compositeId: `${type}-${item.id}`,
    displayStage: getDisplayStage(item, type),
    customer: item.customer || item
  }
}

/**
 * @param {import('vue').ComputedRef<Object|null>} requestRef - Current request (lead or opportunity)
 * @returns {{ potentialDuplicates: import('vue').ComputedRef<Array> }}
 */
export function useDuplicateDetection(requestRef) {
  const leadsStore = useLeadsStore()
  const opportunitiesStore = useOpportunitiesStore()

  const potentialDuplicates = computed(() => {
    const request = requestRef?.value
    if (!request?.id || !request?.type) return []

    // API swap: if backend provides potentialDuplicates, use them
    if (Array.isArray(request.potentialDuplicates) && request.potentialDuplicates.length > 0) {
      return request.potentialDuplicates
    }

    const currentCompositeId = request.compositeId || `${request.type}-${request.id}`
    const currentVehicleKey = getVehicleKey(request)
    if (!currentVehicleKey) return []

    const type = request.type
    const isLead = type === 'lead'

    const candidates = isLead
      ? (leadsStore.leads || []).map((l) => toRequestShape(l, 'lead'))
      : (opportunitiesStore.opportunities || []).map((o) => toRequestShape(o, 'opportunity'))

    return candidates.filter((task) => {
      if (task.compositeId === currentCompositeId) return false
      if (task.isDisqualified || task.isDuplicate) return false
      if (!sameCustomer(request, task)) return false
      const taskVehicleKey = getVehicleKey(task)
      return taskVehicleKey && taskVehicleKey === currentVehicleKey
    })
  })

  return { potentialDuplicates }
}
