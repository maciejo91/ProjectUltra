import { useSettingsStore } from '@/stores/settings'
import { useVehiclesStore } from '@/stores/vehicles'
import { calculateLeadScore } from '@/composables/useLeadScoring'
import type { LeadScoringSettings } from '@/types/leadScoring'

export type UrgencyLevel = 'HOT' | 'WARM' | 'STANDARD' | 'COLD'

export interface UrgencyWeights {
  intent: number
  behavioral: number
  temporal: number
}

export interface UrgencyThresholds {
  hot: number
  warm: number
  standard: number
}

export interface ScoreBreakdown {
  intent: number
  behavioral: number
  temporal: number
  quality: number
  total: number
}

export interface UrgencyResult {
  score: number
  level: UrgencyLevel
  breakdown: ScoreBreakdown
}

const DEFAULT_LEAD_SCORING: LeadScoringSettings = {
  weights: {
    freshness: 25,
    proximity: 20,
    vehicleMatch: 25,
    sourceQuality: 15,
    engagement: 15
  },
  sourcePriority: ['Walk-in', 'Phone', 'Website', 'Google Ads', 'Facebook', '3rd Party'],
  prioritizeOldStock: true,
  agingFactor: 0.5
}

const DEFAULT_THRESHOLDS: UrgencyThresholds = {
  hot: 80,
  warm: 50,
  standard: 20
}

/**
 * Calculates the urgency score and level for a lead using the Lead Scoring (Opportunity Score) engine.
 * Thresholds map the score to HOT/WARM/STANDARD/COLD.
 *
 * @param lead - The lead object (createdAt, source, requestedCar, distanceKm, contactAttempts, etc.)
 * @param _activities - Unused; kept for API compatibility. Engagement is derived from lead.contactAttempts.
 * @param _customWeights - Unused; kept for API compatibility. Uses leadScoring from settings.
 * @param customThresholds - Optional override for urgency level thresholds (defaults to settings).
 */
export function calculateLeadUrgency(
  lead: any,
  _activities: any[] = [],
  _customWeights?: UrgencyWeights,
  customThresholds?: UrgencyThresholds
): UrgencyResult {
  const settingsStore = useSettingsStore()
  const settings: LeadScoringSettings =
    settingsStore.getSetting('leadScoring') || DEFAULT_LEAD_SCORING
  const thresholds: UrgencyThresholds =
    customThresholds || settingsStore.getSetting('urgencyThresholds') || DEFAULT_THRESHOLDS

  const vehiclesStore = useVehiclesStore()
  const inventory = vehiclesStore.vehicles || []

  const { score, breakdown } = calculateLeadScore(lead, settings, inventory)

  let level: UrgencyLevel = 'COLD'
  if (score >= thresholds.hot) {
    level = 'HOT'
  } else if (score >= thresholds.warm) {
    level = 'WARM'
  } else if (score >= thresholds.standard) {
    level = 'STANDARD'
  }

  return {
    score,
    level,
    breakdown: {
      intent: Math.round((breakdown.freshness ?? 0) * 40 * 10) / 10,
      behavioral: Math.round((breakdown.engagement ?? 0) * 35 * 10) / 10,
      temporal: Math.round((breakdown.proximity ?? 0) * 25 * 10) / 10,
      quality: Math.round(((breakdown.sourceQuality ?? 0) + (breakdown.vehicleMatch ?? 0)) * 10 * 10) / 10,
      total: score
    }
  }
}

export const URGENCY_ICON_NAMES: Record<UrgencyLevel, string> = {
  HOT: 'Flame',
  WARM: 'Sun',
  STANDARD: 'CheckCircle',
  COLD: 'Circle'
}

export function getUrgencyIcon(level: UrgencyLevel): string {
  return URGENCY_ICON_NAMES[level] ?? 'Circle'
}

export function getUrgencyColorClass(level: UrgencyLevel): string {
  switch (level) {
    case 'HOT':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'WARM':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'STANDARD':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'COLD':
      return 'bg-gray-50 text-gray-700 border-gray-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

/** Text (and icon) color only, for icon+text urgency display (no chip). */
export function getUrgencyTextClass(level: UrgencyLevel): string {
  switch (level) {
    case 'HOT':
      return 'text-red-600'
    case 'WARM':
      return 'text-orange-600'
    case 'STANDARD':
      return 'text-green-600'
    case 'COLD':
      return 'text-muted-foreground'
    default:
      return 'text-muted-foreground'
  }
}

/** Background class for urgency dot (same palette as text; use with rounded-full). */
export function getUrgencyDotClass(level: UrgencyLevel): string {
  switch (level) {
    case 'HOT':
      return 'bg-red-500'
    case 'WARM':
      return 'bg-orange-500'
    case 'STANDARD':
      return 'bg-green-500'
    case 'COLD':
      return 'bg-gray-400'
    default:
      return 'bg-gray-400'
  }
}
