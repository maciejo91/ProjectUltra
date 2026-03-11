import { mockCampaignInteractions } from './mockData/campaigns'

const delayMs = import.meta.env.DEV ? 0 : 50
const delay = (ms = delayMs) =>
  ms <= 0 ? Promise.resolve() : new Promise((resolve) => setTimeout(resolve, ms))

// Mutable copy for link operations (mock has no persistence)
let interactions = [...mockCampaignInteractions]

export const fetchCampaignInteractions = async () => {
  await delay()
  return { data: [...interactions], total: interactions.length }
}

export const linkCampaignToLead = async (interactionId, leadId) => {
  await delay()
  const item = interactions.find((i) => i.id === parseInt(interactionId, 10))
  if (!item) throw new Error('Campaign interaction not found')
  item.leadId = leadId ? parseInt(leadId, 10) : null
  return item
}

export const linkCampaignToOpportunity = async (interactionId, opportunityId) => {
  await delay()
  const item = interactions.find((i) => i.id === parseInt(interactionId, 10))
  if (!item) throw new Error('Campaign interaction not found')
  item.opportunityId = opportunityId ? parseInt(opportunityId, 10) : null
  return item
}
