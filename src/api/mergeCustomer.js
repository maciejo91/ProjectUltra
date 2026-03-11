/**
 * Merge a duplicate customer into the primary.
 * Reassigns leads and opportunities to the primary; marks duplicate as merged.
 */
import { getMockData } from './mockData/localeLoader'
import * as leadsApi from '@/api/leads'
import * as opportunitiesApi from '@/api/opportunities'
import * as contactsApi from '@/api/contacts'
import * as accountsApi from '@/api/accounts'

const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms))

export function getCustomerSummary(customer) {
  return customer?.name || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || customer?.email || '—'
}

/**
 * Merge duplicate customer into primary.
 * @param {Object} primary - Primary customer (current)
 * @param {Object} duplicate - Duplicate customer to merge
 * @returns {Promise<void>}
 */
export async function mergeCustomerIntoPrimary(primary, duplicate) {
  const primaryId = Number(primary.id)
  const duplicateId = Number(duplicate.id)
  if (primaryId === duplicateId) throw new Error('Cannot merge customer with itself')

  await delay()

  const data = getMockData()
  const leads = data.mockLeads || []
  const opps = data.mockOpportunities || []
  const events = data.mockCalendarEvents || []

  for (const lead of leads) {
    if (Number(lead.customerId) === duplicateId) {
      await leadsApi.updateLead(lead.id, { customerId: primaryId })
    }
  }

  for (const opp of opps) {
    if (Number(opp.customerId) === duplicateId) {
      await opportunitiesApi.updateOpportunity(opp.id, { customerId: primaryId })
    }
  }

  for (const ev of events) {
    if (Number(ev.customerId) === duplicateId) {
      ev.customerId = primaryId
    }
  }

  const isAccount = duplicate.company && duplicate.company !== ''
  if (isAccount) {
    await accountsApi.updateAccount(duplicateId, { mergedIntoId: primaryId, isMerged: true })
  } else {
    await contactsApi.updateContact(duplicateId, { mergedIntoId: primaryId, isMerged: true })
  }
}
