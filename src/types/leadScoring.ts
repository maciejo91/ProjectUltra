/**
 * Types for Lead Scoring (Opportunity Score) used for sorting leads.
 */

export interface LeadForScoring {
  id: number | string
  createdAt: string
  source?: string
  requestedCar?: {
    brand?: string
    model?: string
    year?: number
    vin?: string
    stockDays?: number
  }
  distanceKm?: number | null
  contactAttempts?: Array<{ outcome?: string }>
}

export interface LeadScoringWeights {
  freshness: number
  proximity: number
  vehicleMatch: number
  sourceQuality: number
  engagement: number
}

export interface LeadScoringSettings {
  weights: LeadScoringWeights
  sourcePriority: string[]
  prioritizeOldStock: boolean
  agingFactor?: number
}

export interface VehicleForMatch {
  id: number | string
  brand: string
  model: string
  year?: number
  vin?: string
  stockDays?: number
}

export interface ScoreBreakdown {
  freshness: number
  proximity: number
  vehicleMatch: number
  sourceQuality: number
  engagement: number
}

export interface ScoredLead {
  lead: LeadForScoring
  score: number
  breakdown?: ScoreBreakdown
}
