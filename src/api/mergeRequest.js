/**
 * Merge a duplicate request into the primary request.
 * Closes the duplicate and copies its activities to the primary.
 */
import * as leadsApi from '@/api/leads'
import * as opportunitiesApi from '@/api/opportunities'
import { API_STATUSES } from '@/utils/stageMapper'

function getVehicleSummary(task) {
  const v = task.requestedCar || task.vehicle
  if (!v) return 'No vehicle'
  const parts = [v.brand, v.model, v.year].filter(Boolean)
  return parts.join(' ') || '—'
}

/**
 * Merge duplicate into primary. Same type only (lead→lead, opp→opp).
 * @param {Object} primary - Primary request (current)
 * @param {Object} duplicate - Duplicate request to close
 * @returns {Promise<void>}
 */
export async function mergeRequestIntoPrimary(primary, duplicate) {
  const primaryType = primary.type
  const duplicateType = duplicate.type
  if (primaryType !== duplicateType) {
    throw new Error('Cannot merge different request types')
  }

  const isLead = primaryType === 'lead'

  const fetchActivities = isLead ? leadsApi.fetchLeadActivities : opportunitiesApi.fetchOpportunityActivities
  const addActivity = isLead ? leadsApi.addLeadActivity : opportunitiesApi.addOpportunityActivity
  const updateEntity = isLead ? leadsApi.updateLead : opportunitiesApi.updateOpportunity

  const activities = await fetchActivities(duplicate.id)
  for (const a of activities) {
    await addActivity(primary.id, {
      type: a.type,
      user: a.user,
      action: a.action,
      content: a.content,
      data: a.data,
      timestamp: a.timestamp || new Date().toISOString()
    })
  }

  await updateEntity(duplicate.id, {
    isDisqualified: true,
    isDuplicate: true,
    duplicateOfId: primary.id,
    stage: API_STATUSES.CLOSED_FAILED,
    status: API_STATUSES.CLOSED_FAILED,
    disqualifyReason: 'Duplicate',
    disqualifyCategory: 'Duplicate'
  })
}

export { getVehicleSummary }
