import { getDisplayStage, getDeliverySubstatus } from '@/utils/stageMapper'
import { LEAD_STATE_CONFIG } from '@/composables/useLeadStateMachine'
import { OPPORTUNITY_STATE_CONFIG } from '@/composables/useOpportunityStateMachine'

const customerName = (item) => item?.customer?.name ?? ''
const customerPhone = (item) => item?.customer?.phone ?? ''

/**
 * Merge customer name and phone into a task title in natural language
 * @param {string} baseTitle - Raw action title
 * @param {string} name - Customer name
 * @param {string} phone - Customer phone
 * @returns {string} Title with contact merged in, or baseTitle if no contact
 */
export function mergeContactIntoTitle(baseTitle, name, phone) {
  if (!baseTitle) return baseTitle
  const hasName = !!name?.trim()
  const hasPhone = !!phone?.trim()
  if (!hasName && !hasPhone) return baseTitle

  const who = hasName ? name : 'the customer'
  if (baseTitle.includes('Call to Verify') || baseTitle === 'Call to Verify Contact Details') {
    return hasPhone ? `Call ${who} to Verify Contact Details on ${phone}` : `Call ${who} to Verify Contact Details`
  }
  if (baseTitle.includes('Call Prospect') || baseTitle === 'Call Prospect') {
    return hasPhone ? `Call ${who} on ${phone}` : `Call ${who}`
  }
  if (baseTitle.includes('to be called back') || baseTitle === 'Valid - to be called back') {
    return hasPhone ? `Call ${who} back on ${phone}` : `Call ${who} back`
  }
  const parts = [who, phone].filter(Boolean)
  return parts.length ? `${baseTitle} – ${parts.join(', ')}` : baseTitle
}

/**
 * Merge customer name and phone into a task description in natural language
 * @param {string} baseDescription - Raw action description
 * @param {string} name - Customer name
 * @param {string} phone - Customer phone
 * @returns {string} Description with contact merged in, or baseDescription if no contact
 */
export function mergeContactIntoDescription(baseDescription, name, phone) {
  if (!baseDescription) return baseDescription
  const hasName = !!name?.trim()
  const hasPhone = !!phone?.trim()
  if (!hasName && !hasPhone) return baseDescription

  const who = hasName ? name : 'the customer'
  if (baseDescription.includes('verifying customer contact information') || baseDescription.includes('Begin lead qualification')) {
    return hasPhone ? `Begin lead qualification by calling ${who} on ${phone}.` : `Begin lead qualification by calling ${who}.`
  }
  if (baseDescription.includes('Customer requested a callback') || baseDescription.includes('Make the call at scheduled time')) {
    return hasPhone ? `Customer requested a callback. Call ${who} at scheduled time on ${phone}.` : `Customer requested a callback. Call ${who} at scheduled time.`
  }
  if (baseDescription.includes('Call was interrupted') || baseDescription.includes('Complete qualification or call back')) {
    return hasPhone ? `Call was interrupted after interest. Call ${who} back on ${phone} at scheduled time.` : `Call was interrupted after interest. Call ${who} back at scheduled time.`
  }
  const parts = [who, phone].filter(Boolean)
  return parts.length ? `${baseDescription} – ${parts.join(', ')}` : baseDescription
}

/**
 * Get the descriptive action title for a task card based on the next primary action.
 * Never returns null/empty for lead or opportunity; uses stage + customer name fallback.
 * @param {Object} item - Lead or Opportunity item
 * @returns {string|null} Action title text, or null only when item is null
 */
export function getTaskActionTitle(item) {
  if (!item) return null

  const safeFallback = (entityType, namePart = '') => {
    const name = (item?.customer?.name?.trim() || namePart || 'Customer').trim()
    return name ? `${entityType} – ${name}` : entityType
  }

  try {
    // If item explicitly has a title (like a specific Task entity), use it
    if (item.title && String(item.title).trim()) return String(item.title).trim()

    const type = item.type || (item.customer ? 'opportunity' : 'lead')
    let displayStage
    try {
      displayStage = getDisplayStage(item, type)
    } catch (_) {
      displayStage = item.stage || item.displayStage || null
    }

    const name = item?.customer?.name?.trim() || ''

    if (type === 'lead') {
      const config = displayStage && LEAD_STATE_CONFIG[displayStage]
      if (config && config.primaryAction) {
        const primaryAction = config.primaryAction
        const context = { lead: item, displayStage }
        const action = typeof primaryAction === 'function'
          ? primaryAction(context)
          : primaryAction

        if (action) {
          const label = typeof action.label === 'function' ? action.label(context) : action.label
          const title = typeof action.title === 'function' ? action.title(context) : action.title
          const resolved = (label || title || '').toString().trim()
          if (resolved) return resolved
        }
      }

      const leadName = name || 'Lead'
      return displayStage ? `${displayStage} – ${leadName}` : leadName
    }

    if (type === 'opportunity') {
      if (item.scheduledAppointment && item.scheduledAppointment.title) {
        const t = String(item.scheduledAppointment.title).trim()
        if (t) return t
      }

      const config = displayStage && OPPORTUNITY_STATE_CONFIG[displayStage]
      const context = {
        deliverySubstatus: item.deliverySubstatus || getDeliverySubstatus(item, item.activities || []),
        hasOffers: !!(item.offers && item.offers.length > 0) || !!(item.activities && item.activities.some(a => a.type === 'offer')),
        scheduledAppointment: item.scheduledAppointment,
        opportunity: item,
        formatDateTime: (date) => new Date(date).toLocaleDateString()
      }

      if (config && config.primaryAction) {
        const primaryAction = config.primaryAction
        const action = typeof primaryAction === 'function'
          ? primaryAction(context)
          : primaryAction

        if (action) {
          const label = typeof action.label === 'function' ? action.label(context) : action.label
          const title = typeof action.title === 'function' ? action.title(context) : action.title
          const resolved = (label || title || '').toString().trim()
          if (resolved) return resolved
        }
      }

      const oppName = name || 'Customer'
      return displayStage ? `${displayStage} – ${oppName}` : `Opportunity – ${oppName}`
    }

    // Unknown type: still show something
    return displayStage ? `${displayStage} – ${name || 'Task'}` : safeFallback('Task', String(item.id || ''))
  } catch (_) {
    const entityType = item.type === 'lead' ? 'Lead' : item.type === 'opportunity' ? 'Opportunity' : 'Task'
    return safeFallback(entityType, String(item.id || ''))
  }
}

/** Normalize title: at most one dash separator, no double dashes. */
function normalizeTitleDashes(str) {
  if (!str || typeof str !== 'string') return str
  return str
    .replace(/\s*[–—]\s*[–—]\s*/g, ' – ')
    .replace(/\s*[–—]\s*$/, '')
    .replace(/^\s*[–—]\s*/, '')
    .trim()
}

/**
 * Task display title including customer name when available.
 * Use this for card titles, table "Task title" column, and detail header.
 * Avoids double dashes: if the action title already contains " – ", customer name is not appended.
 * @param {Object} item - Lead or Opportunity item
 * @returns {string|null} Title with customer name appended when possible
 */
export function getTaskDisplayTitle(item) {
  let title = getTaskActionTitle(item)
  if (!title) return null
  const name = item?.customer?.name?.trim()
  if (!name) return normalizeTitleDashes(title)
  if (title.includes(name)) return normalizeTitleDashes(title)
  if (title.includes(' – ')) return normalizeTitleDashes(title)
  return normalizeTitleDashes(`${title} – ${name}`)
}
