import { mockDashboardKPIs, mockSalesPipeline, mockTeamPerformance, mockTodaysEvents, mockPageViewsByVehicle, mockPageViewsOrganicPaid } from './mockData'
import {
  mockBDCOperatorMetrics,
  mockBDCOperatorMetricsWeek,
  mockSalespersonMetrics,
  mockManagerFunnelMetrics,
  mockManagerFunnelMetricsWeek
} from './mockData/dashboard.js'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const fetchDashboardKPIs = async () => {
  await delay()
  return mockDashboardKPIs
}

export const fetchSalesPipeline = async () => {
  await delay()
  return mockSalesPipeline
}

export const fetchTeamPerformance = async () => {
  await delay()
  return mockTeamPerformance
}

export const fetchTodaysEvents = async () => {
  await delay()
  return mockTodaysEvents
}

export const fetchPageViewsByVehicle = async () => {
  await delay()
  return mockPageViewsByVehicle
}

export const fetchPageViewsOrganicPaid = async () => {
  await delay()
  return mockPageViewsOrganicPaid
}

export const fetchBDCOperatorMetrics = async (userId, period = 'month') => {
  await delay()
  return period === 'week' ? mockBDCOperatorMetricsWeek : mockBDCOperatorMetrics
}

export const fetchSalespersonMetrics = async (userId, period = 'month') => {
  await delay()
  return mockSalespersonMetrics
}

export const fetchManagerFunnelMetrics = async (period = 'month') => {
  await delay()
  return period === 'week' ? mockManagerFunnelMetricsWeek : mockManagerFunnelMetrics
}

export const fetchTasksDue = async () => {
  await delay(800)
  
  // Return mock data matching screenshot structure
  return [
    {
      id: '1',
      dealershipName: 'David Martin',
      customerName: 'Jean-Pierre Dubois',
      car: 'Volvo XC90',
      dueTime: '10:00',
      dueDate: '2024-02-14',
      isExpired: true
    },
    {
      id: '2',
      dealershipName: 'Sophie Dubois',
      customerName: 'Marie Lefebvre',
      car: 'Volvo V60',
      dueTime: '14:30',
      dueDate: '2024-02-14',
      isExpired: false
    },
    {
      id: '3',
      dealershipName: 'Thomas Anderson',
      customerName: 'Pierre Moreau',
      car: 'Volvo S90',
      dueTime: '16:00',
      dueDate: '2024-02-14',
      isExpired: false
    },
    {
      id: '4',
      dealershipName: 'Marie Leclerc',
      customerName: 'Sarah Johnson',
      car: 'Volvo XC60',
      dueTime: '09:00',
      dueDate: '2024-02-15',
      isExpired: false
    },
    {
      id: '5',
      dealershipName: 'James Wilson',
      customerName: 'Michael Brown',
      car: 'Volvo C40',
      dueTime: '15:00',
      dueDate: '2024-02-15',
      isExpired: true
    }
  ]
}


