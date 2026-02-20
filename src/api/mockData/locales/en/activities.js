import { createDateOffset, createHourOffset } from '@/utils/mockDataHelpers'

export const mockActivities = [
  // Opportunity 1 – Awaiting Appointment
  {
    id: 1,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'made a call',
    content: 'Discussed color preferences. Customer interested in black or white.',
    timestamp: createHourOffset(-2),
    opportunityId: 1
  },
  {
    id: 2,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'added a note',
    content: 'Customer waiting for color availability. Follow up in 2 weeks.',
    timestamp: createHourOffset(-4),
    opportunityId: 1
  },
  {
    id: 3,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: createHourOffset(-48),
    opportunityId: 1
  },
  // Opportunity 2 – Appointment Scheduled
  {
    id: 4,
    type: 'financing',
    user: 'Salsabeel Khaleel',
    action: 'submitted financing request',
    content: 'Financing approved: 60-month term at 3.5% APR',
    data: { term: 60, apr: 3.5, amount: 120000, downPayment: 30000, monthlyPayment: 1635, status: 'approved' },
    timestamp: createHourOffset(-6),
    opportunityId: 2
  },
  {
    id: 5,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from showroom visit',
    timestamp: createHourOffset(-72),
    opportunityId: 2
  },
  // Opportunity 3 – In Negotiation - Offer Sent
  {
    id: 6,
    type: 'call',
    user: 'David Miller',
    action: 'made a call',
    content: 'Discussed offer details. Customer reviewing financing options.',
    timestamp: createHourOffset(-4),
    opportunityId: 3
  },
  {
    id: 7,
    type: 'note',
    user: 'David Miller',
    action: 'added a note',
    content: 'Customer requested additional discount. Preparing counter-offer.',
    timestamp: createHourOffset(-3),
    opportunityId: 3
  },
  {
    id: 8,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: createHourOffset(-120),
    opportunityId: 3
  },
  // Opportunity 4 – In Negotiation - Contract Pending
  {
    id: 9,
    type: 'tradein',
    user: 'Salsabeel Khaleel',
    action: 'added trade-in information',
    content: 'Customer trade-in: 2019 Tesla Model S, valued at €45,000',
    data: { make: 'Tesla', model: 'Model S', year: 2019, mileage: 38000, condition: 'Very Good', value: 45000 },
    timestamp: createHourOffset(-12),
    opportunityId: 4
  },
  {
    id: 10,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: createHourOffset(-168),
    opportunityId: 4
  },
  // Opportunity 5 – Closed Won
  {
    id: 11,
    type: 'opportunity-won',
    user: 'Sarah Jenkins',
    action: 'marked opportunity as won',
    timestamp: createDateOffset(-3),
    opportunityId: 5
  },
  {
    id: 12,
    type: 'delivery',
    user: 'Sarah Jenkins',
    action: 'completed delivery',
    content: 'Vehicle delivered successfully. Customer satisfied with purchase.',
    timestamp: createDateOffset(-2),
    opportunityId: 5
  },
  {
    id: 13,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from phone inquiry',
    timestamp: createDateOffset(-30),
    opportunityId: 5
  },
  // Opportunity 6 – Closed Lost (was id 8)
  {
    id: 14,
    type: 'call',
    user: 'David Miller',
    action: 'made a call',
    content: 'Customer chose competitor. Logged lost reason.',
    timestamp: createDateOffset(-5),
    opportunityId: 6
  },
  {
    id: 15,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from Facebook campaign',
    timestamp: createDateOffset(-20),
    opportunityId: 6
  },
  // Opportunity 7 – Abandoned (was id 9)
  {
    id: 16,
    type: 'tradein',
    user: 'Sarah Jenkins',
    action: 'added trade-in information',
    content: 'Customer trade-in: 2018 Porsche Cayenne, valued at €48,000',
    data: { make: 'Porsche', model: 'Cayenne', year: 2018, mileage: 52000, condition: 'Good', value: 48000 },
    timestamp: createDateOffset(-10),
    opportunityId: 7
  },
  {
    id: 17,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from lead aggregator',
    timestamp: createDateOffset(-15),
    opportunityId: 7
  },
  // Lead activities (ids 1-7)
  {
    id: 18,
    type: 'customer-email',
    user: 'Josh Adams',
    action: 'sent an email',
    content: 'Hi, I am interested in the Audi A6. Can we schedule a test drive?',
    timestamp: createHourOffset(-2),
    leadId: 1
  },
  {
    id: 19,
    type: 'customer-whatsapp',
    user: 'Emma Watson',
    action: 'sent a WhatsApp message',
    content: 'I am still interested in the ID.4. Can we schedule a callback after 2 PM?',
    timestamp: createHourOffset(-1),
    leadId: 2
  },
  {
    id: 20,
    type: 'customer-email',
    user: 'Liam Johnson',
    action: 'sent an email',
    content: 'When can I visit the Munich dealership to see the BMW iX?',
    timestamp: createHourOffset(-3),
    leadId: 3
  },
  {
    id: 21,
    type: 'customer-whatsapp',
    user: 'Sophie Mueller',
    action: 'sent a WhatsApp message',
    content: 'Thanks for the C-Class info. I would like to see it this week.',
    timestamp: createHourOffset(-4),
    leadId: 4
  }
]
