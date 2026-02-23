// Mock data index - re-exports all mock data from organized files
// This file provides a centralized export point for all mock data.
// Locale-aware data (opportunities, leads, customers, activities) is read via getMockData()
// so the app always uses the same source as OpportunityRepository and other repositories.

import { getMockData } from './localeLoader.js'

// Re-export so consumers can get fresh locale-aware data (e.g. after locale change)
export { getMockData } from './localeLoader.js'

// Snapshot at load time for backward compatibility; for locale-aware data prefer getMockData()
const mockData = getMockData()

export const {
  mockUsers,
  mockCustomers,
  mockLeads,
  mockOpportunities,
  mockTasks,
  mockContacts,
  mockVehicles,
  mockCalendarEvents,
  mockActivities,
  calendarEventTypes,
  calendarDealerships,
  calendarTeams,
  mockDashboardKPIs,
  mockSalesPipeline,
  mockTeamPerformance,
  mockTodaysEvents,
  mockActionableQuestions,
  mockPageViewsByVehicle,
  mockPageViewsOrganicPaid,
  mockBDCOperatorMetrics,
  mockSalespersonMetrics,
  mockManagerFunnelMetrics
} = mockData


