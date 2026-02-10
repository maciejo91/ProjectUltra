import { useSettingsStore } from '@/stores/settings'
import type {
  LeadForScoring,
  LeadScoringSettings,
  ScoredLead,
  ScoreBreakdown,
  VehicleForMatch
} from '@/types/leadScoring'

const DEFAULT_WEIGHTS = {
  freshness: 25,
  proximity: 20,
  vehicleMatch: 25,
  sourceQuality: 15,
  engagement: 15
}

const PROXIMITY_MAX_KM = 10
const PROXIMITY_ZERO_KM = 100
const PROXIMITY_MISSING_SCORE = 0.5 // 50% when distanceKm not provided
const VEHICLE_NO_MATCH_SCORE = 0.2 // 20% when no inventory match
const ENGAGEMENT_OUTCOME = 'spoke-to-customer'

function getHoursSince(isoDate: string): number {
  return (Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60)
}

function scoreFreshness(createdAt: string): number {
  const hours = getHoursSince(createdAt)
  if (hours < 24) return 1
  if (hours < 48) return 0.5
  return 0.1
}

function scoreProximity(distanceKm: number | null | undefined): number {
  if (distanceKm == null) return PROXIMITY_MISSING_SCORE
  if (distanceKm <= PROXIMITY_MAX_KM) return 1
  if (distanceKm >= PROXIMITY_ZERO_KM) return 0
  return 1 - (distanceKm - PROXIMITY_MAX_KM) / (PROXIMITY_ZERO_KM - PROXIMITY_MAX_KM)
}

function findMatchingVehicle(
  lead: LeadForScoring,
  inventory: VehicleForMatch[]
): VehicleForMatch | undefined {
  const car = lead.requestedCar
  if (!car?.brand || !car?.model) return undefined
  return inventory.find((v) => {
    const brandMatch = (v.brand || '').toLowerCase() === (car.brand || '').toLowerCase()
    const modelMatch = (v.model || '').toLowerCase() === (car.model || '').toLowerCase()
    const yearMatch = car.year == null || v.year === car.year
    const vinMatch = car.vin && v.vin ? (v.vin || '').toLowerCase() === (car.vin || '').toLowerCase() : true
    return (brandMatch && modelMatch && yearMatch) || (car.vin && vinMatch)
  })
}

function scoreVehicleMatch(
  lead: LeadForScoring,
  inventory: VehicleForMatch[],
  prioritizeOldStock: boolean,
  agingFactor: number
): number {
  const vehicle = findMatchingVehicle(lead, inventory)
  if (!vehicle) return VEHICLE_NO_MATCH_SCORE
  const baseScore = 1
  const daysInStock = vehicle.stockDays ?? lead.requestedCar?.stockDays ?? 0
  if (!prioritizeOldStock) return baseScore
  const agingBonus = Math.min(daysInStock * (agingFactor / 100), 50) / 100
  return baseScore + agingBonus
}

function scoreSourceQuality(source: string | undefined, sourcePriority: string[]): number {
  if (!source || sourcePriority.length === 0) return 0
  const index = sourcePriority.findIndex(
    (s) => s.toLowerCase() === (source || '').toLowerCase()
  )
  if (index === -1) return 0
  return 1 - index / Math.max(sourcePriority.length - 1, 1)
}

function hasReplied(lead: LeadForScoring): boolean {
  const attempts = lead.contactAttempts || []
  return attempts.some(
    (c) => (c.outcome || '').toLowerCase() === ENGAGEMENT_OUTCOME.toLowerCase()
  )
}

function scoreEngagement(lead: LeadForScoring): number {
  return hasReplied(lead) ? 1 : 0
}

function normalizeWeights(weights: LeadScoringSettings['weights']): LeadScoringSettings['weights'] {
  const sum =
    (weights.freshness || 0) +
    (weights.proximity || 0) +
    (weights.vehicleMatch || 0) +
    (weights.sourceQuality || 0) +
    (weights.engagement || 0)
  if (sum <= 0) return { ...DEFAULT_WEIGHTS }
  return {
    freshness: (weights.freshness || 0) / sum,
    proximity: (weights.proximity || 0) / sum,
    vehicleMatch: (weights.vehicleMatch || 0) / sum,
    sourceQuality: (weights.sourceQuality || 0) / sum,
    engagement: (weights.engagement || 0) / sum
  }
}

/**
 * Compute opportunity score for a single lead.
 */
export function calculateLeadScore(
  lead: LeadForScoring,
  settings: LeadScoringSettings,
  inventory: VehicleForMatch[] = []
): { score: number; breakdown: ScoreBreakdown } {
  const w = normalizeWeights(settings.weights)
  const agingFactor = settings.agingFactor ?? 0.5

  const freshness = scoreFreshness(lead.createdAt)
  const proximity = scoreProximity(lead.distanceKm)
  const vehicleMatch = scoreVehicleMatch(
    lead,
    inventory,
    settings.prioritizeOldStock,
    agingFactor
  )
  const sourceQuality = scoreSourceQuality(lead.source, settings.sourcePriority)
  const engagement = scoreEngagement(lead)

  const score =
    freshness * w.freshness +
    proximity * w.proximity +
    vehicleMatch * w.vehicleMatch +
    sourceQuality * w.sourceQuality +
    engagement * w.engagement

  const totalWeight = w.freshness + w.proximity + w.vehicleMatch + w.sourceQuality + w.engagement
  const scale = totalWeight > 0 ? 1 / totalWeight : 1
  const normalizedScore = score * scale * 100

  return {
    score: Math.round(normalizedScore * 10) / 10,
    breakdown: {
      freshness: Math.round(freshness * 1000) / 1000,
      proximity: Math.round(proximity * 1000) / 1000,
      vehicleMatch: Math.round(vehicleMatch * 1000) / 1000,
      sourceQuality: Math.round(sourceQuality * 1000) / 1000,
      engagement: Math.round(engagement * 1000) / 1000
    }
  }
}

/**
 * Sort leads by opportunity score (highest first).
 * Accepts leads and optional settings/inventory; uses store defaults when not provided.
 */
export function useLeadScoring(
  leads: LeadForScoring[],
  options?: {
    settings?: LeadScoringSettings
    inventory?: VehicleForMatch[]
  }
): { sortedLeads: ScoredLead[]; scoredLeads: ScoredLead[] } {
  const settingsStore = useSettingsStore()
  const settings: LeadScoringSettings =
    options?.settings || settingsStore.getSetting('leadScoring') || {
      weights: DEFAULT_WEIGHTS,
      sourcePriority: [],
      prioritizeOldStock: true,
      agingFactor: 0.5
    }
  const inventory = options?.inventory || []

  const scoredLeads: ScoredLead[] = leads.map((lead) => {
    const { score, breakdown } = calculateLeadScore(lead, settings, inventory)
    return { lead, score, breakdown }
  })

  const sortedLeads = [...scoredLeads].sort((a, b) => b.score - a.score)

  return { sortedLeads, scoredLeads }
}
