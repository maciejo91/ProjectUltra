export const mockDashboardKPIs = [
  {
    id: 1,
    title: 'Deals closed this month',
    value: 12,
    change: 20,
    changeType: 'increase',
    trend: [8, 9, 10, 11, 12, 11, 12]
  },
  {
    id: 2,
    title: 'Negotiations this month',
    value: 320,
    change: 11,
    changeType: 'increase',
    trend: [280, 290, 300, 310, 315, 318, 320]
  },
  {
    id: 3,
    title: 'New leads today',
    value: 79,
    change: 11,
    changeType: 'decrease',
    trend: [90, 88, 85, 82, 80, 79, 79]
  },
  {
    id: 4,
    title: 'New opportunities today',
    value: 23,
    change: 17,
    changeType: 'increase',
    trend: [18, 19, 20, 21, 22, 22, 23]
  }
]

export const mockSalesPipeline = {
  stages: [
    { name: 'New leads', percentage: 100 },
    { name: 'Qualification', percentage: 84.5, avgTime: '11h on avg.' },
    { name: 'Contacted', percentage: 61.8, avgTime: '13h on avg.' },
    { name: 'In negotiation', percentage: 19.3, avgTime: '6d 14h on avg.' },
    { name: 'Won', percentage: 12.7, avgTime: '14h on avg.' }
  ],
  leadSources: [
    { name: 'Volvocars.com', color: 'gray', data: [320, 276, 207, 62, 44] },
    { name: 'Facebook', color: 'blue', data: [285, 235, 167, 48, 32] },
    { name: 'Volvo Winter Campaign', color: 'orange', data: [245, 219, 168, 55, 35] }
  ]
}

export const mockTeamPerformance = [
  { name: 'Davide Martino', leads: 198, qualifiedLeads: 94, qualifiedPercentage: 47, opportunities: 51, contracts: 28 },
  { name: 'Sofia De Luca', leads: 189, qualifiedLeads: 91, qualifiedPercentage: 48, opportunities: 49, contracts: 26 },
  { name: 'Tommaso Romano', leads: 182, qualifiedLeads: 89, qualifiedPercentage: 49, opportunities: 48, contracts: 25 },
  { name: 'Maria Marchetti', leads: 171, qualifiedLeads: 85, qualifiedPercentage: 49, opportunities: 42, contracts: 23 },
  { name: 'Giacomo Colombo', leads: 167, qualifiedLeads: 82, qualifiedPercentage: 49, opportunities: 44, contracts: 22 },
  { name: 'Camilla Bernardi', leads: 159, qualifiedLeads: 73, qualifiedPercentage: 46, opportunities: 41, contracts: 21 },
  { name: 'Emilia Bruno', leads: 156, qualifiedLeads: 78, qualifiedPercentage: 50, opportunities: 45, contracts: 24 },
  { name: 'Pietro Morelli', leads: 145, qualifiedLeads: 62, qualifiedPercentage: 43, opportunities: 38, contracts: 19 },
  { name: 'Roberto Fontana', leads: 143, qualifiedLeads: 65, qualifiedPercentage: 45, opportunities: 37, contracts: 18 },
  { name: 'Giulia Martino', leads: 134, qualifiedLeads: 59, qualifiedPercentage: 44, opportunities: 35, contracts: 17 }
]

export const mockActionableQuestions = [
  {
    id: 'mock-appt-followup-1',
    type: 'appointment-followup',
    priority: 4,
    question: 'You had an appointment yesterday with Gianni De Luca but no offer is added so far. Did they show up to the appointment?',
    customer: { name: 'Gianni De Luca' },
    opportunityId: 1,
    opportunity: { id: 1, assignee: 'Matteo Greco', customer: { name: 'Gianni De Luca' } },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    appointmentDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'mock-stuck-opportunity-1',
    type: 'stuck-opportunity',
    priority: 1,
    question: 'This opportunity with Sara Mancini has been inactive for 16 days. Are they still interested in purchasing?',
    customer: { name: 'Sara Mancini' },
    opportunityId: 1,
    opportunity: { id: 1, assignee: 'Matteo Alpino', customer: { name: 'Sara Mancini' } },
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    daysInactive: 16
  },
  {
    id: 'mock-lead-qualification-urgency-1',
    type: 'lead-qualification-urgency',
    priority: 2,
    question: 'Lead from Michele Bruno is 10 days old and still unqualified. Should we prioritise qualification?',
    customer: { name: 'Michele Bruno' },
    leadId: 1,
    opportunityId: null,
    opportunity: null,
    lead: { id: 1, assignee: 'Matteo Greco', customer: { name: 'Michele Bruno' } },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const mockTodaysEvents = [
  { id: 1, date: 'February 14th', time: '09:30-10:30', title: 'Dealership visit', type: 'Dealership visit', name: 'Gianni De Luca', location: 'Volvo Paris' },
  { id: 2, date: 'February 14th', time: '11:00-12:00', title: 'Test drive', type: 'Test drive', name: 'Sara Mancini', location: 'Volvo Lyon' },
  { id: 3, date: 'February 14th', time: '13:15-13:45', title: 'Call', type: 'Call', name: 'Michele Bruno', location: 'Virtual Meeting' },
  { id: 4, date: 'February 14th', time: '14:30-15:30', title: 'Delivery', type: 'Delivery', name: 'Maria Ferrari', location: 'Volvo Marseille' },
  { id: 5, date: 'February 14th', time: '15:45-16:45', title: 'Recall', type: 'Recall', name: 'Davide Martino', location: 'Volvo Nice' }
]

export const mockPageViewsByVehicle = [
  { id: 1, brand: 'BMW', model: 'X5', views: 102, change: 15.3, changeType: 'increase', avgPerDay: 3.4, trend: [85, 88, 92, 95, 98, 100, 102] },
  { id: 2, brand: 'Mercedes-Benz', model: 'GLE', views: 81, change: 12.0, changeType: 'increase', avgPerDay: 2.7, trend: [70, 72, 75, 77, 79, 80, 81] },
  { id: 3, brand: 'Audi', model: 'Q7', views: 72, change: 2.7, changeType: 'decrease', avgPerDay: 2.4, trend: [74, 73, 73, 72, 72, 72, 72] },
  { id: 4, brand: 'Porsche', model: 'Cayenne', views: 68, change: 8.0, changeType: 'increase', avgPerDay: 2.3, trend: [60, 62, 64, 65, 66, 67, 68] },
  { id: 5, brand: 'Tesla', model: 'Model Y', views: 60, change: 8.0, changeType: 'decrease', avgPerDay: 2.0, trend: [65, 64, 63, 62, 61, 60, 60] }
]

export const mockPageViewsOrganicPaid = [
  { day: '1', organic: 120, paid: 45 },
  { day: '2', organic: 135, paid: 52 },
  { day: '3', organic: 98, paid: 38 },
  { day: '4', organic: 145, paid: 60 },
  { day: '5', organic: 160, paid: 68 },
  { day: '6', organic: 185, paid: 75 },
  { day: '7', organic: 155, paid: 62 },
  { day: '8', organic: 125, paid: 48 },
  { day: '9', organic: 142, paid: 55 },
  { day: '10', organic: 110, paid: 42 },
  { day: '11', organic: 138, paid: 58 },
  { day: '12', organic: 168, paid: 72 },
  { day: '13', organic: 195, paid: 82 },
  { day: '14', organic: 165, paid: 70 },
  { day: '15', organic: 132, paid: 50 },
  { day: '16', organic: 148, paid: 60 },
  { day: '17', organic: 115, paid: 45 },
  { day: '18', organic: 152, paid: 65 },
  { day: '19', organic: 175, paid: 78 },
  { day: '20', organic: 205, paid: 88 },
  { day: '21', organic: 172, paid: 75 },
  { day: '22', organic: 140, paid: 55 },
  { day: '23', organic: 155, paid: 65 },
  { day: '24', organic: 122, paid: 48 },
  { day: '25', organic: 158, paid: 68 },
  { day: '26', organic: 182, paid: 82 },
  { day: '27', organic: 215, paid: 92 },
  { day: '28', organic: 180, paid: 80 },
  { day: '29', organic: 145, paid: 58 },
  { day: '30', organic: 162, paid: 70 }
]

// Performance Metrics Mock Data
export const mockBDCOperatorMetrics = {
  slaCompliance: {
    completed: 142,
    total: 158,
    percentage: 89.9,
    withinSLA: 142,
    trend: [85.2, 86.5, 87.1, 88.3, 88.9, 89.5, 89.9]
  },
  managedLeadTasks: {
    total: 210,
    dailyAvg: 35,
    target: 40,
    trend: [28, 30, 32, 34, 35, 34, 35]
  },
  handledNoShowTasks: {
    total: 12,
    dailyAvg: 2,
    trend: [1, 1, 2, 2, 2, 2, 2]
  },
  followUpTasks: {
    total: 48,
    dailyAvg: 8,
    target: 10,
    trend: [6, 6, 7, 7, 8, 8, 8]
  },
  appointmentsReserved: 28,
  appointmentsReservedTrend: [22, 24, 26, 25, 27, 28],
  leadToOpportunityConversion: 24.5,
  leadToOpportunityConversionTrend: [20, 21, 23, 24, 24.2, 24.5]
}

export const mockBDCOperatorMetricsWeek = {
  slaCompliance: {
    completed: 33,
    total: 36,
    percentage: 91.7,
    withinSLA: 33,
    trend: [88, 89, 90, 90.5, 91, 91.5, 91.7]
  },
  managedLeadTasks: {
    total: 48,
    dailyAvg: 8,
    target: 10,
    trend: [6, 7, 7, 8, 8, 8, 8]
  },
  handledNoShowTasks: {
    total: 3,
    dailyAvg: 0.5,
    trend: [0, 1, 1, 1, 1, 1, 1]
  },
  followUpTasks: {
    total: 11,
    dailyAvg: 2,
    target: 10,
    trend: [1, 1, 2, 2, 2, 2, 2]
  },
  appointmentsReserved: 6,
  appointmentsReservedTrend: [4, 5, 5, 6, 6, 6, 6],
  leadToOpportunityConversion: 25.2,
  leadToOpportunityConversionTrend: [23, 23.5, 24, 24.5, 24.8, 25, 25.2]
}

export const mockSalespersonMetrics = {
  contractsClosed: {
    week: 3,
    weekTrend: [2, 2, 2, 3, 3, 3, 3],
    month: 12,
    monthTrend: [8, 9, 10, 10, 11, 11, 12],
    quarter: 34,
    quarterTrend: [28, 30, 31, 32, 33, 33, 34],
    year: 128,
    yearTrend: [118, 120, 122, 124, 125, 126, 128]
  },
  revenue: {
    week: 290000,
    weekTrend: [240000, 250000, 260000, 270000, 275000, 282000, 290000],
    month: 1250000,
    monthTrend: [1080000, 1120000, 1150000, 1180000, 1200000, 1220000, 1250000],
    quarter: 3450000,
    quarterTrend: [3100000, 3180000, 3220000, 3280000, 3320000, 3380000, 3450000],
    year: 12800000,
    yearTrend: [11800000, 12000000, 12200000, 12300000, 12400000, 12600000, 12800000]
  },
  revenueTargets: {
    week: 350000,
    month: 1500000,
    quarter: 4000000,
    year: 15000000
  },
  pipelineValue: 3200000,
  pipelineValueTrend: [2800000, 2900000, 3000000, 3100000, 3150000, 3180000, 3200000],
  winRate: 68.5,
  winRateTrend: [64, 65, 66, 67, 68, 68.2, 68.5],
  newOpportunities: {
    week: 5,
    weekTrend: [3, 4, 4, 4, 5, 5, 5],
    month: 23,
    monthTrend: [18, 19, 20, 21, 22, 22, 23],
    quarter: 67,
    quarterTrend: [58, 60, 62, 64, 65, 66, 67],
    year: 245,
    yearTrend: [220, 225, 230, 235, 238, 242, 245]
  },
  dormantOpportunities: 8,
  dormantOpportunitiesTrend: [10, 9, 9, 8, 8, 8, 8],
  opportunitiesInNegotiation: 4,
  nudges: [
    { id: 'dormant', text: '2 dormant opportunities – re-engage to unlock €480k', priority: 1 },
    { id: 'target', text: '3 more contracts to hit monthly target', priority: 2 }
  ]
}

export const mockManagerFunnelMetrics = {
  stages: [
    { name: 'Total leads', count: 1332, percentage: 100, colorCode: '#eab308', trend: [1200, 1250, 1280, 1300, 1315, 1325, 1332] },
    { name: 'Assigned leads', count: 1037, percentage: 78, colorCode: '#b45309', trend: [950, 980, 1000, 1015, 1025, 1030, 1037] },
    { name: 'Managed leads', count: 982, percentage: 74, colorCode: '#22c55e', trend: [920, 940, 960, 970, 975, 980, 982] },
    { name: 'Qualified leads', count: 372, percentage: 28, colorCode: '#16a34a', trend: [340, 350, 360, 365, 368, 370, 372] },
    { name: 'Managed opportunities', count: 316, percentage: 24, colorCode: '#7e22ce', trend: [290, 300, 308, 312, 314, 315, 316] },
    { name: 'Won opportunities', count: 211, percentage: 16, colorCode: '#0470e9', trend: [195, 200, 205, 208, 210, 210, 211] }
  ],
  conversionRate: 16,
  conversionRateTrend: [14.2, 14.8, 15.2, 15.5, 15.7, 15.9, 16],
  taskCompletion: {
    completed: 892,
    total: 1037,
    overdueCount: 47
  },
  dealsReport: {
    won: 211,
    lost: 105,
    wonRate: 66.8
  }
}

export const mockManagerFunnelMetricsWeek = {
  stages: [
    { name: 'Total leads', count: 312, percentage: 100, colorCode: '#eab308', trend: [280, 290, 298, 302, 306, 310, 312] },
    { name: 'Assigned leads', count: 244, percentage: 78, colorCode: '#b45309', trend: [220, 228, 232, 236, 240, 242, 244] },
    { name: 'Managed leads', count: 231, percentage: 74, colorCode: '#22c55e', trend: [210, 215, 218, 222, 226, 229, 231] },
    { name: 'Qualified leads', count: 88, percentage: 28, colorCode: '#16a34a', trend: [78, 80, 82, 84, 85, 86, 88] },
    { name: 'Managed opportunities', count: 75, percentage: 24, colorCode: '#7e22ce', trend: [68, 70, 71, 72, 73, 74, 75] },
    { name: 'Won opportunities', count: 50, percentage: 16, colorCode: '#0470e9', trend: [44, 46, 47, 48, 49, 49, 50] }
  ],
  conversionRate: 16.2,
  conversionRateTrend: [15.0, 15.2, 15.4, 15.6, 15.8, 16.0, 16.2],
  taskCompletion: {
    completed: 218,
    total: 252,
    overdueCount: 12
  },
  dealsReport: {
    won: 50,
    lost: 24,
    wonRate: 67.6
  }
}
