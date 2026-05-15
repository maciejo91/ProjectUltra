import { createDateOffset, createHourOffset } from '@/utils/mockDataHelpers'

export const mockActivities = [
  // Opportunity 1 – Awaiting Appointment
  {
    id: 1,
    type: 'call',
    user: 'Sara Marino',
    action: 'made a call',
    content: 'Discussed color preferences. Customer interested in black or white.',
    timestamp: createHourOffset(-2),
    opportunityId: 1
  },
  {
    id: 2,
    type: 'note',
    user: 'Sara Marino',
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
    user: 'Matteo Greco',
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
    user: 'Davide Rinaldi',
    action: 'made a call',
    content: 'Discussed offer details. Customer reviewing financing options.',
    timestamp: createHourOffset(-4),
    opportunityId: 3
  },
  {
    id: 7,
    type: 'note',
    user: 'Davide Rinaldi',
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
    user: 'Matteo Alpino',
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
    user: 'Sara Marino',
    action: 'marked opportunity as won',
    timestamp: createDateOffset(-3),
    opportunityId: 5
  },
  {
    id: 12,
    type: 'delivery',
    user: 'Sara Marino',
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
    user: 'Davide Rinaldi',
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
    user: 'Sara Marino',
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
    id: 19,
    type: 'customer-whatsapp',
    user: 'Chiara Moretti',
    action: 'sent a WhatsApp message',
    content: 'I am still interested in the Fiat 500 Hybrid. Can we schedule a callback after 2 PM?',
    data: {
      fromPhone: '+49 170 555 0142',
      toPhone: '+49 89 555 0199'
    },
    timestamp: createHourOffset(-1),
    leadId: 2
  },
  {
    id: 20,
    type: 'customer-email',
    user: 'Matteo Bianchi',
    action: 'sent an email',
    content: 'When can I visit the Milano dealership to see the Toyota Yaris?',
    data: {
      from: 'matteo.bianchi@example.com',
      to: 'munich@motork.io'
    },
    timestamp: createHourOffset(-3),
    leadId: 3
  },
  {
    id: 21,
    type: 'customer-email',
    user: 'Giulia Conti',
    action: 'sent an email',
    content: 'Thanks for the Toyota RAV4 info. I would like to see it this week.',
    data: {
      from: 'giulia.conti@example.com',
      to: 'sales@motork.io'
    },
    timestamp: createHourOffset(-4),
    leadId: 4
  },
  {
    id: 21.1,
    type: 'email',
    user: 'Davide Rinaldi',
    action: 'sent an email',
    content:
      'Hi Giulia — happy to help. We have a Toyota RAV4 available. Would you prefer Wed 12:30 or Thu 13:00 for a quick viewing in Bologna?',
    data: {
      threadId: 'lead-4-email',
      from: 'davide.rinaldi@motork.io',
      to: 'giulia.conti@example.com'
    },
    timestamp: createHourOffset(-3.7),
    leadId: 4
  },
  {
    id: 21.2,
    type: 'customer-whatsapp',
    user: 'Giulia Conti',
    action: 'sent a WhatsApp message',
    content: 'Thu 13:00 works. Can you also confirm the car has the advanced driver assistance package?',
    data: {
      threadId: 'lead-4-whatsapp',
      fromPhone: '+49 151 555 0404',
      toPhone: '+49 89 555 0101'
    },
    timestamp: createHourOffset(-3.2),
    leadId: 4
  },
  {
    id: 21.3,
    type: 'whatsapp',
    user: 'Davide Rinaldi',
    action: 'sent a WhatsApp message',
    content:
      'Confirmed. It includes the assistance package + parking camera. I can book Thu 13:00 — shall I reserve it under your name?',
    data: {
      threadId: 'lead-4-whatsapp',
      fromPhone: '+49 89 555 0101',
      toPhone: '+49 151 555 0404'
    },
    timestamp: createHourOffset(-3),
    leadId: 4
  },
  {
    id: 21.4,
    type: 'customer-email',
    user: 'Giulia Conti',
    action: 'sent an email',
    content:
      'Please reserve it for Thu 13:00. Also, could you send a detailed quote incl. delivery time and warranty options?',
    data: {
      threadId: 'lead-4-email',
      from: 'giulia.conti@example.com',
      to: 'sales@motork.io'
    },
    timestamp: createHourOffset(-2.7),
    leadId: 4
  },
  {
    id: 21.5,
    type: 'note',
    user: 'Davide Rinaldi',
    action: 'added a note',
    content: 'Customer prefers email, no phone on file. Prepare quote + warranty options before appointment.',
    timestamp: createHourOffset(-2.3),
    leadId: 4
  },
  {
    id: 21.6,
    type: 'email',
    user: 'Davide Rinaldi',
    action: 'sent an email',
    content:
      'Quote attached for the Toyota RAV4 including warranty options. Delivery time is 7–10 days after confirmation. See you Thu 13:00 in Bologna.',
    data: {
      threadId: 'lead-4-email',
      from: 'davide.rinaldi@motork.io',
      to: 'giulia.conti@example.com'
    },
    timestamp: createHourOffset(-1.9),
    leadId: 4
  },
  {
    id: 21.7,
    type: 'customer-sms',
    user: 'Giulia Conti',
    action: 'sent an SMS',
    content: 'Got it, thanks. Is parking available at the showroom?',
    data: {
      fromPhone: '+49 151 555 0404',
      toPhone: '+49 89 555 0101'
    },
    timestamp: createHourOffset(-1.6),
    leadId: 4
  },
  {
    id: 21.8,
    type: 'sms',
    user: 'Davide Rinaldi',
    action: 'sent an SMS',
    content: 'Yes — customer parking is available on site. Ask for “Giulia Conti” at reception.',
    data: {
      fromPhone: '+49 89 555 0101',
      toPhone: '+49 151 555 0404'
    },
    timestamp: createHourOffset(-1.5),
    leadId: 4
  },
  {
    id: 21.9,
    type: 'lead-updated',
    user: 'System',
    action: 'Appointment scheduled: Thu 13:00 (Milano)',
    message: 'Appointment scheduled: Thu 13:00 (Milano)',
    timestamp: createHourOffset(-1.4),
    leadId: 4
  },
  {
    id: 21.91,
    type: 'call',
    user: 'Davide Rinaldi',
    action: 'attempted call',
    message: 'No answer · voicemail left',
    content: 'No answer · voicemail left',
    data: {
      direction: 'outbound',
      summary: 'No answer · voicemail left'
    },
    timestamp: createHourOffset(-1.2),
    leadId: 4
  },
  {
    id: 21.92,
    type: 'call',
    user: 'Davide Rinaldi',
    action: 'call completed',
    message: 'Answered · 3m 12s',
    content: 'Answered · 3m 12s',
    data: {
      direction: 'outbound',
      summary: 'Answered · 3m 12s'
    },
    timestamp: createHourOffset(-1.05),
    leadId: 4
  },
  {
    id: 21.93,
    type: 'call',
    user: 'Davide Rinaldi',
    action: 'attempted call',
    message: 'No answer · voicemail left',
    content: 'No answer · voicemail left',
    data: {
      direction: 'outbound',
      summary: 'No answer · voicemail left'
    },
    timestamp: createHourOffset(-0.8),
    leadId: 4
  },
  {
    id: 21.94,
    type: 'call',
    user: 'Giulia Conti',
    action: 'inbound call',
    message: 'Answered · 1m 08s',
    content: 'Answered · 1m 08s',
    data: {
      direction: 'inbound',
      summary: 'Answered · 1m 08s'
    },
    timestamp: createHourOffset(-0.6),
    leadId: 4
  },
  {
    id: 21.95,
    type: 'call',
    user: 'Davide Rinaldi',
    action: 'missed inbound call',
    message: 'No answer · missed inbound call',
    content: 'No answer · missed inbound call',
    data: {
      direction: 'inbound',
      summary: 'No answer · missed inbound call'
    },
    timestamp: createHourOffset(-0.45),
    leadId: 4
  },
  // Opportunity customer replies (for Conversations tab)
  {
    id: 22,
    type: 'customer-email',
    user: 'Giovanni Sarti',
    action: 'sent an email',
    content: 'I received the quote. Can we confirm the black exterior is still available?',
    data: {
      from: 'giovanni.sarti@example.com',
      to: 'sara.marino@motork.io'
    },
    timestamp: createHourOffset(-5),
    opportunityId: 1
  },
  {
    id: 23,
    type: 'customer-whatsapp',
    user: 'Davide Rinaldi',
    action: 'sent a WhatsApp message',
    content: 'Happy to proceed with the counter-offer. When can we sign?',
    data: {
      fromPhone: '+49 151 555 0288',
      toPhone: '+49 89 555 0277'
    },
    timestamp: createHourOffset(-2),
    opportunityId: 3
  },
  // Outbound communications for Conversations tab
  {
    id: 24,
    type: 'email',
    user: 'Sara Marino',
    action: 'sent an email',
    content: 'Here is the quote for the Fiat Panda Hybrid you requested. Let me know if you have questions.',
    data: {
      from: 'sara.marino@motork.io',
      to: 'giovanni.sarti@example.com'
    },
    timestamp: createHourOffset(-6),
    opportunityId: 1
  },
  {
    id: 25,
    type: 'whatsapp',
    user: 'Davide Rinaldi',
    action: 'sent a WhatsApp message',
    content: 'I have prepared a counter-offer with a 5% discount. Sending it now.',
    data: {
      fromPhone: '+49 89 555 0277',
      toPhone: '+49 151 555 0288'
    },
    timestamp: createHourOffset(-3),
    opportunityId: 3
  },
  {
    id: 27,
    type: 'whatsapp',
    user: 'Chiara Moretti',
    action: 'sent a WhatsApp message',
    content: 'Hi Chiara, I tried calling you. I will call again after 2 PM as requested.',
    data: {
      fromPhone: '+49 89 555 0199',
      toPhone: '+49 170 555 0142'
    },
    timestamp: createHourOffset(-0.5),
    leadId: 2
  },
  {
    id: 28,
    type: 'ai-summary',
    user: 'MotorKAI',
    action: 'summarized recent interactions',
    message:
      'Clear intent on the Fiat 500 Hybrid; customer asked for an afternoon callback after WhatsApp. Keep momentum before the scheduled recall—confirm stock, pricing, and options in one short call.',
    content:
      'Clear intent on the Fiat 500 Hybrid; customer asked for an afternoon callback after WhatsApp. Keep momentum before the scheduled recall—confirm stock, pricing, and options in one short call.',
    timestamp: createHourOffset(-0.2),
    leadId: 2
  },
  {
    id: 29,
    type: 'customer-sms',
    user: 'Matteo Bianchi',
    action: 'sent an SMS',
    content: 'Can you confirm the Toyota Yaris is still available for a test drive this Saturday?',
    data: {
      fromPhone: '+49 170 555 0311',
      toPhone: '+49 89 555 0200'
    },
    timestamp: createHourOffset(-2.5),
    leadId: 3
  },
  {
    id: 30,
    type: 'sms',
    user: 'Sara Marino',
    action: 'sent an SMS',
    content: 'Yes, Saturday works. I will reserve the Yaris for 11:00. See you at the Milano showroom.',
    data: {
      fromPhone: '+49 89 555 0200',
      toPhone: '+49 170 555 0311'
    },
    timestamp: createHourOffset(-2.2),
    leadId: 3
  },
  {
    id: 31,
    type: 'customer-sms',
    user: 'Matteo Greco',
    action: 'sent an SMS',
    content: 'Running 10 min late for the appointment — still OK?',
    data: {
      fromPhone: '+49 89 555 0188',
      toPhone: '+49 151 555 0299'
    },
    timestamp: createHourOffset(-8),
    opportunityId: 2
  },
  {
    id: 32,
    type: 'sms',
    user: 'Davide Rinaldi',
    action: 'sent an SMS',
    content: 'No problem, we will hold the bay. Drive safe.',
    data: {
      fromPhone: '+49 151 555 0299',
      toPhone: '+49 89 555 0188'
    },
    timestamp: createHourOffset(-7.5),
    opportunityId: 2
  },
  // Lead 1 (Luca De Santis) – system logs + inbound email, unsuccessful call, follow-up note
  {
    id: 33,
    type: 'note',
    user: 'Sara Marino',
    action: 'added a note',
    message: 'After call attempt: no answer, left VM with Wed / Thu test drive options.',
    content: 'After call attempt: no answer, left VM with Wed / Thu test drive options.',
    timestamp: createHourOffset(-1),
    leadId: 1
  },
  {
    id: 34,
    type: 'call',
    user: 'Sara Marino',
    action: 'attempted call',
    message: 'No answer · voicemail left',
    content: 'No answer · voicemail left',
    data: {
      summary: 'No answer · voicemail left'
    },
    timestamp: createHourOffset(-2),
    leadId: 1
  },
  {
    id: 34.5,
    type: 'call',
    user: 'Sara Marino',
    action: 'call completed',
    message: 'Answered · 2m 37s',
    content: 'Answered · 2m 37s',
    data: {
      summary: 'Answered · 2m 37s'
    },
    timestamp: createHourOffset(-2.25),
    leadId: 1
  },
  {
    id: 35,
    type: 'customer-email',
    user: 'Luca De Santis',
    action: 'sent an email',
    content: 'Hi, I am interested in the Fiat Panda Hybrid. Can we schedule a test drive?',
    data: {
      threadId: 'lead-1-email',
      from: 'luca.desantis@example.com',
      to: 'inbox@madrid.motork.io'
    },
    timestamp: createHourOffset(-6),
    leadId: 1
  },
  {
    id: 36,
    type: 'lead-created',
    user: 'System',
    action: 'Lead was created from Autoscout24.es (Web)',
    message: 'Lead was created from Autoscout24.es (Web)',
    timestamp: createHourOffset(-72),
    leadId: 1
  },
  {
    id: 37,
    type: 'lead-assigned',
    user: 'System',
    action: 'Lead was assigned to Sara Marino',
    message: 'Lead was assigned to Sara Marino',
    timestamp: createHourOffset(-71.5),
    leadId: 1
  },
  // Lead 1 – inbound + outbound WhatsApp pair (shows left/right chat pattern)
  {
    id: 38,
    type: 'customer-whatsapp',
    user: 'Luca De Santis',
    action: 'sent a WhatsApp message',
    content: 'Hi, I can do Wed after 16:00 or Thu morning. What works best for a test drive?',
    data: {
      threadId: 'lead-1-whatsapp',
      fromPhone: '+34 600 555 0101',
      toPhone: '+34 910 555 0199'
    },
    timestamp: createHourOffset(-1.8),
    leadId: 1
  },
  {
    id: 39,
    type: 'whatsapp',
    user: 'Sara Marino',
    action: 'sent a WhatsApp message',
    content: 'Thu 11:00 is available. Shall I book the Fiat Panda Hybrid for you at 11:00 at Roma showroom?',
    data: {
      threadId: 'lead-1-whatsapp',
      fromPhone: '+34 910 555 0199',
      toPhone: '+34 600 555 0101'
    },
    timestamp: createHourOffset(-1.6),
    leadId: 1
  }
]
