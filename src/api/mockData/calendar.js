export const calendarEventTypes = [
  { value: 'test-drive', label: 'Test Drive', category: 'negotiation' },
  { value: 'appointment', label: 'Dealership Visit', category: 'negotiation' },
  { value: 'offsite', label: 'Offsite Visit', category: 'negotiation' },
  { value: 'workshop', label: 'Workshop', category: 'negotiation' },
  { value: 'call', label: 'Call', category: 'negotiation' },
  { value: 'delivery', label: 'Delivery', category: 'negotiation' },
  { value: 'recall', label: 'Recall', category: 'negotiation' },
  { value: 'absence', label: 'Absence', category: 'reminder' },
  { value: 'leave', label: 'Leave', category: 'reminder' },
  { value: 'marketing', label: 'Marketing Event', category: 'reminder' },
  { value: 'memo', label: 'Memo', category: 'reminder' },
  { value: 'training', label: 'Training', category: 'reminder' },
  { value: 'meeting', label: 'Meeting', category: 'negotiation' },
  { value: 'other', label: 'Other', category: 'reminder' }
]

export const calendarDealerships = [
  { id: 1, name: 'Bari' },
  { id: 2, name: 'Firenze' },
  { id: 3, name: 'Milano' },
  { id: 4, name: 'Roma' },
  { id: 5, name: 'Trento' }
]

export const calendarTeams = [
  { id: 1, name: 'BDC', dealershipId: 3, dealership: 'Milano' },
  { id: 2, name: 'Call Center', dealershipId: 3, dealership: 'Milano' },
  { id: 3, name: 'General', dealershipId: 3, dealership: 'Milano' },
  { id: 4, name: 'Service', dealershipId: 2, dealership: 'Firenze' },
  { id: 5, name: 'Sales (New)', dealershipId: 3, dealership: 'Milano' },
  { id: 6, name: 'Sales (Rent)', dealershipId: 2, dealership: 'Firenze' },
  { id: 7, name: 'Sales (Used)', dealershipId: 2, dealership: 'Firenze' },
  { id: 8, name: 'Sales (New)', dealershipId: 2, dealership: 'Firenze' },
  { id: 9, name: 'Service', dealershipId: 1, dealership: 'Bari' },
  { id: 10, name: 'Sales (New)', dealershipId: 1, dealership: 'Bari' },
  { id: 11, name: 'BDC', dealershipId: 4, dealership: 'Roma' },
  { id: 12, name: 'Sales (New)', dealershipId: 4, dealership: 'Roma' },
  { id: 13, name: 'Service', dealershipId: 4, dealership: 'Roma' },
  { id: 14, name: 'Sales (New)', dealershipId: 5, dealership: 'Trento' },
  { id: 15, name: 'Service', dealershipId: 5, dealership: 'Trento' },
  { id: 16, name: 'General', dealershipId: 2, dealership: 'Firenze' },
  { id: 17, name: 'General', dealershipId: 1, dealership: 'Bari' },
  { id: 18, name: 'General', dealershipId: 4, dealership: 'Roma' },
  { id: 19, name: 'General', dealershipId: 5, dealership: 'Trento' }
]

export const mockCalendarEvents = [
  {
    id: 4,
    title: 'Meeting - Oliver Brown',
    start: '2025-12-20T11:00:00',
    end: '2025-12-20T12:00:00',
    type: 'meeting',
    customer: 'Oliver Brown',
    customerId: 5,
    opportunityId: 2,
    vehicle: 'Porsche Taycan',
    assignee: 'Sarah Jenkins',
    assigneeId: 2,
    dealership: 'Milano',
    team: 'Sales (New)',
    status: 'confirmed',
    noShowCount: 0,
    previousAppointmentId: null
  },
  {
    id: 5,
    title: 'Test Drive - Emma Wilson',
    start: '2025-12-21T13:00:00',
    end: '2025-12-21T14:00:00',
    type: 'test-drive',
    customer: 'Emma Wilson',
    customerId: 1,
    opportunityId: 1,
    vehicle: 'Audi e-tron GT',
    assignee: 'Salsabeel Khaleel',
    assigneeId: 1,
    dealership: 'Firenze',
    team: 'Sales (New)',
    status: 'confirmed',
    noShowCount: 0,
    previousAppointmentId: null
  },
  {
    id: 6,
    title: 'Dealership Visit - Sophia Martinez',
    start: '2025-12-22T10:00:00',
    end: '2025-12-22T11:00:00',
    type: 'appointment',
    customer: 'Sophia Martinez',
    customerId: 6,
    vehicle: 'BMW iX',
    assignee: 'David Miller',
    assigneeId: 3,
    dealership: 'Roma',
    team: 'Sales (New)',
    status: 'cancelled',
    noShowCount: 0
  },
  {
    id: 7,
    title: 'Follow-up Call - Josh Adams',
    start: '2025-12-23T15:00:00',
    end: '2025-12-23T15:30:00',
    type: 'call',
    customer: 'Josh Adams',
    customerId: 1,
    assignee: 'Salsabeel Khaleel',
    assigneeId: 1,
    dealership: 'Firenze',
    team: 'BDC',
    status: 'no-show',
    noShowCount: 1
  },
  {
    id: 8,
    title: 'Test Drive - Emma Watson',
    start: '2025-12-26T09:00:00',
    end: '2025-12-26T10:00:00',
    type: 'test-drive',
    customer: 'Emma Watson',
    customerId: 2,
    vehicle: 'Mercedes-Benz EQS',
    assignee: 'Sarah Jenkins',
    assigneeId: 2,
    dealership: 'Milano',
    team: 'Sales (New)',
    status: 'confirmed',
    noShowCount: 0
  },
  {
    id: 9,
    title: 'Meeting - Oliver Brown',
    start: '2025-12-27T14:00:00',
    end: '2025-12-27T15:30:00',
    type: 'meeting',
    customer: 'Oliver Brown',
    customerId: 5,
    vehicle: 'Porsche Taycan',
    assignee: 'Sarah Jenkins',
    assigneeId: 2,
    dealership: 'Milano',
    team: 'Sales (New)',
    status: 'confirmed',
    noShowCount: 0
  },
  {
    id: 10,
    title: 'Dealership Visit - Emma Wilson',
    start: '2025-12-28T11:00:00',
    end: '2025-12-28T12:00:00',
    type: 'appointment',
    customer: 'Emma Wilson',
    customerId: 1,
    opportunityId: 1,
    vehicle: 'Audi e-tron GT',
    assignee: 'Salsabeel Khaleel',
    assigneeId: 1,
    dealership: 'Firenze',
    team: 'Sales (New)',
    status: 'confirmed',
    noShowCount: 0,
    previousAppointmentId: null
  },
  {
    id: 11,
    title: 'Workshop - Vehicle Inspection',
    start: '2025-12-29T09:00:00',
    end: '2025-12-29T12:00:00',
    type: 'workshop',
    customer: 'Josh Adams',
    customerId: 1,
    vehicle: 'Audi A6 Allroad',
    assignee: 'David Miller',
    assigneeId: 3,
    dealership: 'Firenze',
    team: 'Service',
    status: 'confirmed',
    noShowCount: 0
  },
  {
    id: 12,
    title: 'Delivery - BMW iX',
    start: '2025-12-30T14:00:00',
    end: '2025-12-30T15:00:00',
    type: 'delivery',
    customer: 'Sophia Martinez',
    customerId: 6,
    vehicle: 'BMW iX',
    assignee: 'David Miller',
    assigneeId: 3,
    dealership: 'Roma',
    team: 'Sales (New)',
    status: 'confirmed',
    noShowCount: 0
  },
  {
    id: 13,
    title: 'Training - New CRM Features',
    start: '2026-01-02T10:00:00',
    end: '2026-01-02T12:00:00',
    type: 'training',
    assignee: 'Salsabeel Khaleel',
    assigneeId: 1,
    dealership: 'Milano',
    team: 'General',
    status: 'confirmed'
  },
  {
    id: 14,
    title: 'Marketing Event - New Year Sale Launch',
    start: '2026-01-03T09:00:00',
    end: '2026-01-03T18:00:00',
    type: 'marketing',
    assignee: 'Sarah Jenkins',
    assigneeId: 2,
    dealership: 'Milano',
    team: 'General',
    status: 'confirmed'
  },
  {
    id: 15,
    title: 'Offsite Visit - Liam Johnson',
    start: '2026-01-06T11:00:00',
    end: '2026-01-06T12:30:00',
    type: 'offsite',
    customer: 'Liam Johnson',
    customerId: 3,
    vehicle: 'Mercedes-Benz EQS',
    assignee: 'Natalia Sung',
    assigneeId: 4,
    dealership: 'Bari',
    team: 'Sales (New)',
    status: 'confirmed'
  },
  {
    id: 16,
    title: 'Leave - Winter Vacation',
    start: '2026-01-07T00:00:00',
    end: '2026-01-10T23:59:59',
    type: 'leave',
    assignee: 'Sarah Jenkins',
    assigneeId: 2,
    team: 'Sales (New)',
    status: 'confirmed'
  },
  {
    id: 17,
    title: 'Call - Follow-up Emma Wilson',
    start: '2026-01-08T10:00:00',
    end: '2026-01-08T10:30:00',
    type: 'call',
    customer: 'Emma Wilson',
    customerId: 1,
    assignee: 'Salsabeel Khaleel',
    assigneeId: 1,
    dealership: 'Firenze',
    team: 'BDC',
    status: 'confirmed'
  },
  {
    id: 18,
    title: 'Test Drive - Marco Rossi',
    start: '2026-01-09T15:00:00',
    end: '2026-01-09T16:00:00',
    type: 'test-drive',
    customer: 'Marco Rossi',
    vehicle: 'Volkswagen ID.4',
    assignee: 'Natalia Sung',
    assigneeId: 4,
    dealership: 'Trento',
    team: 'Sales (New)',
    status: 'confirmed'
  },
  {
    id: 19,
    title: 'Memo - Q1 Targets Review',
    start: '2026-01-13T09:00:00',
    end: '2026-01-13T09:30:00',
    type: 'memo',
    assignee: 'David Miller',
    assigneeId: 3,
    team: 'General',
    status: 'confirmed'
  },
  {
    id: 20,
    title: 'Recall - Safety Check',
    start: '2026-01-15T08:00:00',
    end: '2026-01-15T17:00:00',
    type: 'recall',
    vehicle: 'Various Models',
    assignee: 'David Miller',
    assigneeId: 3,
    dealership: 'Roma',
    team: 'Service',
    status: 'confirmed'
  },
  // Test-drive events for showcasing carousel - Customers 1-20
  {
    id: 25,
    title: 'Test Drive - Josh Adams',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      date.setHours(14, 0, 0, 0)
      return date.toISOString()
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      date.setHours(15, 0, 0, 0)
      return date.toISOString()
    })(),
    type: 'test-drive',
    customer: 'Josh Adams',
    customerId: 1,
    opportunityId: 3,
    vehicle: 'Audi Q5',
    assignee: 'Sarah Jenkins',
    assigneeId: 2,
    dealership: 'Milan',
    team: 'Sales (New)',
    status: 'confirmed',
    noShowCount: 0,
    previousAppointmentId: null
  },
  {
    id: 26,
    title: 'Test Drive - Liam Johnson',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      date.setHours(10, 0, 0, 0)
      return date.toISOString()
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      date.setHours(11, 0, 0, 0)
      return date.toISOString()
    })(),
    type: 'test-drive',
    customer: 'Liam Johnson',
    customerId: 3,
    vehicle: 'BMW M4 Coupe',
    assignee: 'Sarah Jenkins',
    assigneeId: 2,
    dealership: 'Berlin',
    team: 'Sales (New)',
    status: 'confirmed',
    noShowCount: 0,
    previousAppointmentId: null
  },
  {
    id: 27,
    title: 'Test Drive - Nina Keller',
    start: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      date.setHours(16, 0, 0, 0)
      return date.toISOString()
    })(),
    end: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      date.setHours(17, 0, 0, 0)
      return date.toISOString()
    })(),
    type: 'test-drive',
    customer: 'Nina Keller',
    customerId: 3,
    opportunityId: 2,
    vehicle: 'Audi A3',
    assignee: 'Salsabeel Khaleel',
    assigneeId: 1,
    dealership: 'Frankfurt',
    team: 'Sales (New)',
    status: 'confirmed',
    noShowCount: 0,
    previousAppointmentId: null
  }
]

