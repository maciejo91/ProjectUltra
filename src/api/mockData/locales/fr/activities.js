export const mockActivities = [
  // Opportunity 2 activities
  {
    id: 8,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'made a call',
    content: 'Discussed color preferences. Customer is interested in black or white Taycan.',
    timestamp: '2025-03-25T11:30:00',
    opportunityId: 1
  },
  {
    id: 9,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'added a note',
    content: 'Customer is waiting for specific color availability. Follow up in 2 weeks.',
    timestamp: '2025-03-23T16:20:00',
    opportunityId: 1
  },
  {
    id: 23,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'added a note',
    content: 'Customer prefers black exterior with beige interior. Checking availability.',
    timestamp: '2025-03-24T09:00:00',
    opportunityId: 1
  },
  {
    id: 10,
    type: 'email',
    user: 'Sarah Jenkins',
    action: 'sent an email',
    content: 'Sent available color options and pricing information.',
    timestamp: '2025-03-15T10:00:00',
    opportunityId: 1
  },
  {
    id: 1850,
    type: 'customer-email',
    user: 'Emma Watson',
    action: 'sent an email',
    content: 'Hi Sarah, thank you for the color options. I would like to schedule a test drive for the black Taycan next week if possible. Best, Emma',
    timestamp: '2025-03-16T14:20:00',
    opportunityId: 1
  },
  {
    id: 11,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: '2025-03-01T09:00:00',
    opportunityId: 1
  },
  // Opportunity 3 activities (DFB - Delivery completed, 3+ days ago)
  {
    id: 12,
    type: 'delivery',
    user: 'David Miller',
    action: 'completed delivery',
    content: 'Vehicle delivered successfully. Customer satisfied with the purchase.',
    timestamp: '2024-12-25T16:45:00', // 3+ days ago - perfect for DFB
    opportunityId: 3
  },
  {
    id: 13,
    type: 'note',
    user: 'David Miller',
    action: 'added a note',
    content: 'Final paperwork completed. Payment received in full.',
    timestamp: '2024-12-25T14:00:00',
    opportunityId: 3
  },
  {
    id: 24,
    type: 'note',
    user: 'David Miller',
    action: 'added a note',
    content: 'Customer very satisfied with the purchase process. Potential referral opportunity.',
    timestamp: '2024-12-24T11:00:00',
    opportunityId: 3
  },
  {
    id: 14,
    type: 'call',
    user: 'David Miller',
    action: 'made a call',
    content: 'Confirmed delivery date and time. Customer will pick up at dealership.',
    timestamp: '2024-12-23T10:30:00',
    opportunityId: 3
  },
  {
    id: 1852,
    type: 'customer-whatsapp',
    user: 'Liam Johnson',
    action: 'sent a WhatsApp message',
    content: 'Thanks for the EQS brochure. When can I come in for a test drive? I am free this weekend.',
    timestamp: '2024-12-22T16:00:00',
    opportunityId: 3
  },
  {
    id: 15,
    type: 'opportunity-won',
    user: 'David Miller',
    action: 'marked opportunity as won',
    timestamp: '2024-12-20T15:00:00', // Contract signed date
    opportunityId: 3
  },
  {
    id: 16,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from showroom visit',
    timestamp: '2024-11-15T10:00:00',
    opportunityId: 3
  },
  // Opportunity 4 activities
  {
    id: 17,
    type: 'call',
    user: 'Salsabeel Khaleel',
    action: 'made a call',
    content: 'Discussed financing options and trade-in value. Customer is negotiating final price.',
    timestamp: '2025-03-26T14:20:00',
    opportunityId: 100
  },
  {
    id: 18,
    type: 'note',
    user: 'Salsabeel Khaleel',
    action: 'added a note',
    content: 'Customer requested additional discount. Preparing counter-offer.',
    timestamp: '2025-03-25T11:00:00',
    opportunityId: 100
  },
  {
    id: 25,
    type: 'note',
    user: 'Salsabeel Khaleel',
    action: 'added a note',
    content: 'Customer interested in extended warranty and maintenance package. Discussing options.',
    timestamp: '2025-03-24T15:30:00',
    opportunityId: 100
  },
  {
    id: 19,
    type: 'email',
    user: 'Salsabeel Khaleel',
    action: 'sent an email',
    content: 'Sent detailed financing options and vehicle specifications.',
    timestamp: '2025-03-22T09:30:00',
    opportunityId: 100
  },
  {
    id: 20,
    type: 'meeting',
    user: 'Salsabeel Khaleel',
    action: 'scheduled a meeting',
    content: 'Test drive scheduled for next week. Customer will visit dealership.',
    timestamp: '2025-03-20T15:00:00',
    opportunityId: 100
  },
  {
    id: 21,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: '2025-03-15T11:00:00',
    opportunityId: 100
  },
  // Opportunity 5 activities (OOFB - Open for 7+ days without offers)
  {
    id: 26,
    type: 'note',
    user: 'Michael Thomas',
    action: 'added a note',
    content: 'Initial contact made. Customer interested in EQS features.',
    timestamp: '2024-12-20T10:30:00',
    opportunityId: 204
  },
  {
    id: 27,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: '2024-12-20T10:00:00',
    opportunityId: 204
  },
  // Opportunity 6 activities (UFB - Open for 14+ days without offers)
  {
    id: 28,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'made a call',
    content: 'Initial call. Customer asked about ID.4 availability.',
    timestamp: '2024-12-10T09:30:00',
    opportunityId: 37
  },
  {
    id: 29,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from marketing campaign',
    timestamp: '2024-12-10T09:00:00',
    opportunityId: 37
  },
  // Opportunity 7 activities (OFB - In Negotiation for 5+ days without contract)
  {
    id: 30,
    type: 'offer',
    user: 'David Miller',
    action: 'created an offer',
    content: 'Initial offer sent for BMW i4',
    timestamp: '2024-12-20T14:00:00',
    opportunityId: 36
  },
  {
    id: 31,
    type: 'call',
    user: 'David Miller',
    action: 'made a call',
    content: 'Discussed offer details. Customer reviewing financing options.',
    timestamp: '2024-12-19T11:00:00',
    opportunityId: 36
  },
  {
    id: 32,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: '2024-12-15T11:00:00',
    opportunityId: 36
  },
  // Opportunity 8 activities (NFU - In Negotiation with no contract date)
  {
    id: 33,
    type: 'offer',
    user: 'Michael Thomas',
    action: 'created an offer',
    content: 'Offer sent for Audi Q4 e-tron',
    timestamp: '2024-12-25T15:00:00',
    opportunityId: 223
  },
  {
    id: 34,
    type: 'email',
    user: 'Michael Thomas',
    action: 'sent an email',
    content: 'Sent offer details and specifications.',
    timestamp: '2024-12-24T10:00:00',
    opportunityId: 223
  },
  {
    id: 35,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from marketing campaign',
    timestamp: '2024-12-18T10:00:00',
    opportunityId: 223
  },
  // Opportunity 9 activities (CFB - Contract signed but not delivered)
  {
    id: 36,
    type: 'opportunity-won',
    user: 'Sarah Jenkins',
    action: 'marked opportunity as won',
    content: 'Contract signed. Vehicle preparation in progress.',
    timestamp: '2024-12-22T16:00:00',
    opportunityId: 38
  },
  {
    id: 37,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'added a note',
    content: 'Contract finalized. Payment received. Preparing vehicle for delivery.',
    timestamp: '2024-12-22T14:00:00',
    opportunityId: 38
  },
  {
    id: 38,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'created an offer',
    content: 'Final offer accepted for Macan Electric',
    timestamp: '2024-12-20T11:00:00',
    opportunityId: 38
  },
  {
    id: 39,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: '2024-12-01T09:00:00',
    opportunityId: 38
  },
  // Opportunity 16 activities (UFB - In Negotiation for 10+ days without contract)
  {
    id: 40,
    type: 'offer',
    user: 'David Miller',
    action: 'created an offer',
    content: 'Initial offer sent for Mercedes-Benz EQC',
    timestamp: '2024-12-15T11:00:00',
    opportunityId: 16
  },
  {
    id: 41,
    type: 'call',
    user: 'David Miller',
    action: 'made a call',
    content: 'Discussed offer details. Customer reviewing terms.',
    timestamp: '2024-12-14T10:00:00',
    opportunityId: 16
  },
  {
    id: 42,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: '2024-12-05T10:00:00',
    opportunityId: 16
  },
  // Opportunity 11 activities (In Negotiation with contract date - no task widgets)
  {
    id: 43,
    type: 'opportunity-won',
    user: 'Michael Thomas',
    action: 'marked opportunity as won',
    content: 'Contract signed. Vehicle preparation in progress.',
    timestamp: '2024-12-20T14:00:00',
    opportunityId: 223
  },
  {
    id: 44,
    type: 'offer',
    user: 'Michael Thomas',
    action: 'created an offer',
    content: 'Final offer accepted for BMW iX3',
    timestamp: '2024-12-18T11:00:00',
    opportunityId: 223
  },
  {
    id: 45,
    type: 'note',
    user: 'Michael Thomas',
    action: 'added a note',
    content: 'Customer satisfied with offer. Contract terms agreed upon.',
    timestamp: '2024-12-19T15:00:00',
    opportunityId: 223
  },
  {
    id: 46,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from marketing campaign',
    timestamp: '2024-12-10T09:00:00',
    opportunityId: 223
  },
  // Opportunity 12 activities (In Negotiation with future appointment - no NFU)
  {
    id: 47,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'created an offer',
    content: 'Initial offer sent for Audi A6 e-tron',
    timestamp: '2024-12-18T10:00:00',
    opportunityId: 39
  },
  {
    id: 48,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'made a call',
    content: 'Discussed offer and scheduled test drive for next month.',
    timestamp: '2024-12-17T14:00:00',
    opportunityId: 39
  },
  {
    id: 49,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'added a note',
    content: 'Customer interested in test drive. Appointment scheduled.',
    timestamp: '2024-12-16T11:00:00',
    opportunityId: 39
  },
  {
    id: 50,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: '2024-12-12T11:00:00',
    opportunityId: 39
  },
  // Opportunity 13 activities (Open for 14+ days - stale but no task widget)
  {
    id: 51,
    type: 'note',
    user: 'David Miller',
    action: 'added a note',
    content: 'Initial contact made. Customer interested in ID.3 features.',
    timestamp: '2024-12-01T08:30:00',
    opportunityId: 51
  },
  {
    id: 52,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from marketing campaign',
    timestamp: '2024-12-01T08:00:00',
    opportunityId: 51
  },
  // Opportunity 18 activities (Awaiting Appointment - has future appointment)
  {
    id: 53,
    type: 'appointment',
    user: 'Salsabeel Khaleel',
    action: 'scheduled an appointment',
    content: 'Appointment scheduled for Audi A4 test drive',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    opportunityId: 18
  },
  {
    id: 54,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    opportunityId: 18
  },
  // Opportunity 20 activities (Offer Sent - offer less than 3 days old)
  {
    id: 57,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'created an offer',
    content: 'Initial offer sent for Mercedes-Benz C-Class',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1) // 1 day ago (less than 3 days)
      return date.toISOString()
    })(),
    opportunityId: 10
  },
  {
    id: 58,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    opportunityId: 10
  },
  // Opportunity 21 activities (Awaiting Response - offer 3+ days old)
  {
    id: 59,
    type: 'offer',
    user: 'Michael Thomas',
    action: 'created an offer',
    content: 'Initial offer sent for BMW 3 Series',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 4) // 4 days ago (3+ days)
      return date.toISOString()
    })(),
    opportunityId: 223
  },
  {
    id: 60,
    type: 'note',
    user: 'Michael Thomas',
    action: 'added a note',
    content: 'Customer reviewing offer. Waiting for response.',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    opportunityId: 223
  },
  {
    id: 61,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from marketing campaign',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 15)
      return date.toISOString()
    })(),
    opportunityId: 223
  },
  // Opportunity 22 activities (Contract Pending - has contractDate)
  {
    id: 62,
    type: 'contract',
    user: 'Salsabeel Khaleel',
    action: 'contract date set',
    content: 'Contract date set for Porsche 911',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    opportunityId: 39
  },
  {
    id: 63,
    type: 'offer',
    user: 'Salsabeel Khaleel',
    action: 'created an offer',
    content: 'Final offer accepted for Porsche 911',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      return date.toISOString()
    })(),
    opportunityId: 39
  },
  {
    id: 64,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 20)
      return date.toISOString()
    })(),
    opportunityId: 39
  },
  // Opportunity 23 activities (Closed Won - Awaiting Delivery - has deliveryDate but no delivery activity)
  {
    id: 65,
    type: 'opportunity-won',
    user: 'David Miller',
    action: 'marked opportunity as won',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    opportunityId: 51
  },
  {
    id: 66,
    type: 'contract',
    user: 'David Miller',
    action: 'contract signed',
    content: 'Contract signed for Tesla Model Y',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    opportunityId: 51
  },
  {
    id: 67,
    type: 'note',
    user: 'David Miller',
    action: 'added a note',
    content: 'Delivery scheduled for 5 days from now.',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    opportunityId: 51
  },
  {
    id: 68,
    type: 'opportunity-created',
    user: 'System',
    action: 'Opportunity was created from website inquiry',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date.toISOString()
    })(),
    opportunityId: 51
  },
  
  // ========== LEAD ACTIVITIES (1 customer message per lead when in progress) ==========
  {
    id: 69,
    type: 'customer-whatsapp',
    user: 'Emma Watson',
    action: 'sent a WhatsApp message',
    content: 'Hi, I am still interested in the EQS. Can we schedule a test drive after 2 PM?',
    timestamp: '2025-03-26T10:15:00',
    leadId: 2
  },
  {
    id: 70,
    type: 'customer-email',
    user: 'Liam Johnson',
    action: 'sent an email',
    content: 'When can I visit the Milano dealership to see the EQS?',
    timestamp: '2025-03-25T11:00:00',
    leadId: 3
  },
  {
    id: 71,
    type: 'customer-whatsapp',
    user: 'Sophie Mueller',
    action: 'sent a WhatsApp message',
    content: 'Thanks for the X5 info. I would like to see the M Sport package this week.',
    timestamp: '2025-03-26T14:00:00',
    leadId: 4
  },
  {
    id: 72,
    type: 'customer-email',
    user: 'Marco Rossi',
    action: 'sent an email',
    content: 'Do you have charging times for the ID.4? Interested in test drive.',
    timestamp: '2025-03-25T09:30:00',
    leadId: 5
  },
  {
    id: 73,
    type: 'customer-whatsapp',
    user: 'Klaus Schmidt',
    action: 'sent a WhatsApp message',
    content: 'I would like the Sport Chrono package. Can you send the config?',
    timestamp: '2025-03-25T15:00:00',
    leadId: 6
  },
  {
    id: 74,
    type: 'customer-email',
    user: 'Anna Becker',
    action: 'sent an email',
    content: 'Confirming Friday 3 PM for the Model 3 test drive. Thanks!',
    timestamp: '2025-03-26T11:00:00',
    leadId: 7
  },
  {
    id: 75,
    type: 'customer-whatsapp',
    user: 'Thomas Weber',
    action: 'sent a WhatsApp message',
    content: 'Is the Daytona Gray e-tron GT still available? I can visit tomorrow.',
    timestamp: '2025-03-25T16:00:00',
    leadId: 8
  },
  {
    id: 76,
    type: 'customer-email',
    user: 'Julia Fischer',
    action: 'sent an email',
    content: 'We need the 7-seater GLE. When can we see it?',
    timestamp: '2025-03-26T09:00:00',
    leadId: 9
  },
  {
    id: 77,
    type: 'customer-whatsapp',
    user: 'Michael Hoffmann',
    action: 'sent a WhatsApp message',
    content: 'Interested in the iX. Please call me back to arrange a test drive.',
    timestamp: '2025-03-25T10:00:00',
    leadId: 10
  },
  {
    id: 78,
    type: 'customer-email',
    user: 'Laura Zimmermann',
    action: 'sent an email',
    content: 'I would like to see the Cayenne S when it arrives. Keep me posted.',
    timestamp: '2025-03-26T12:00:00',
    leadId: 11
  },
  {
    id: 79,
    type: 'customer-whatsapp',
    user: 'Stefan Braun',
    action: 'sent a WhatsApp message',
    content: 'Still interested in the Macan. Can you send financing options?',
    timestamp: '2025-03-25T14:00:00',
    leadId: 12
  },
  {
    id: 80,
    type: 'customer-email',
    user: 'Nina Keller',
    action: 'sent an email',
    content: 'I need the e-tron GT for an event next week. Is 5 PM today possible?',
    timestamp: '2025-03-26T15:00:00',
    leadId: 13
  },
  {
    id: 81,
    type: 'customer-whatsapp',
    user: 'Oliver Lang',
    action: 'sent a WhatsApp message',
    content: 'Can you send the C-Class hybrid comparison? Interested in fuel economy.',
    timestamp: '2025-03-26T10:00:00',
    leadId: 14
  },
  {
    id: 82,
    type: 'customer-email',
    user: 'Petra Schulz',
    action: 'sent an email',
    content: 'Confirming ID.4 test drive tomorrow 11 AM. See you then!',
    timestamp: '2025-03-26T16:00:00',
    leadId: 15
  },
  {
    id: 83,
    type: 'customer-whatsapp',
    user: 'Robert Klein',
    action: 'sent a WhatsApp message',
    content: 'I want the M4 with M xDrive. When can I see the performance data?',
    timestamp: '2025-03-25T12:00:00',
    leadId: 16
  },
  {
    id: 84,
    type: 'customer-email',
    user: 'Sabine Vogel',
    action: 'sent an email',
    content: 'Is the Q5 45 TFSI still available? I can visit this week.',
    timestamp: '2025-03-26T11:30:00',
    leadId: 17
  },
  {
    id: 85,
    type: 'customer-whatsapp',
    user: 'Dr. Andreas Werner',
    action: 'sent a WhatsApp message',
    content: 'Please send Taycan Turbo S specs and color options. Ready to proceed.',
    timestamp: '2025-03-26T08:30:00',
    leadId: 18
  },
  {
    id: 86,
    type: 'customer-email',
    user: 'Christina Bauer',
    action: 'sent an email',
    content: 'We have two kids. Can you arrange a test drive with car seats?',
    timestamp: '2025-03-25T14:00:00',
    leadId: 19
  },
  {
    id: 87,
    type: 'customer-whatsapp',
    user: 'Martin Richter',
    action: 'sent a WhatsApp message',
    content: 'I want the M4 Competition in Isle of Man Green. When can I see it?',
    timestamp: '2025-03-26T14:00:00',
    leadId: 20
  },
  
  // ========== OPPORTUNITY ACTIVITIES - MISSING TYPES ==========
  
  // Opportunity 1 activities removed - empty for demo
  
  // Opportunity 2 (Oliver Brown) - Add financing and SMS
  {
    id: 113,
    type: 'financing',
    user: 'Salsabeel Khaleel',
    action: 'submitted financing request',
    content: 'Financing approved: 60-month term at 3.5% APR',
    data: {
      term: 60,
      apr: 3.5,
      amount: 120000,
      downPayment: 30000,
      monthlyPayment: 1635,
      status: 'approved'
    },
    timestamp: '2025-03-24T14:00:00',
    opportunityId: 1
  },
  {
    id: 114,
    type: 'sms',
    user: 'Salsabeel Khaleel',
    action: 'sent an SMS',
    content: 'Oliver, your financing is approved! Ready to finalize the Taycan purchase.',
    timestamp: '2025-03-24T15:00:00',
    opportunityId: 1
  },
  {
    id: 115,
    type: 'attachment',
    user: 'Salsabeel Khaleel',
    action: 'uploaded an attachment',
    content: 'Financing approval letter and payment schedule',
    fileName: 'Financing_Approval_Oliver_Brown.pdf',
    timestamp: '2025-03-24T14:30:00',
    opportunityId: 1
  },
  
  // Opportunity 3 (Sophia Martinez) - Add WhatsApp and attachment
  {
    id: 116,
    type: 'whatsapp',
    user: 'David Miller',
    action: 'sent a WhatsApp message',
    content: 'Sophia, your BMW iX was delivered! Hope you love it. Let me know if you need anything!',
    timestamp: '2024-12-26T09:00:00',
    opportunityId: 3
  },
  {
    id: 117,
    type: 'attachment',
    user: 'David Miller',
    action: 'uploaded an attachment',
    content: 'Delivery receipt and vehicle handover checklist',
    fileName: 'Delivery_Receipt_Sophia_Martinez.pdf',
    timestamp: '2024-12-25T17:00:00',
    opportunityId: 3
  },
  {
    id: 118,
    type: 'sms',
    user: 'David Miller',
    action: 'sent an SMS',
    content: 'Delivery confirmed for tomorrow at 4 PM. All paperwork ready!',
    timestamp: '2024-12-24T16:00:00',
    opportunityId: 3
  },
  
  // Opportunity 4 (Alexander Chen) - Add trade-in and financing
  {
    id: 119,
    type: 'tradein',
    user: 'Salsabeel Khaleel',
    action: 'added trade-in information',
    content: 'Customer trade-in: 2019 Tesla Model S, valued at €45,000',
    data: {
      make: 'Tesla',
      model: 'Model S',
      year: 2019,
      mileage: 38000,
      condition: 'Very Good',
      value: 45000
    },
    timestamp: '2025-03-25T10:00:00',
    opportunityId: 100
  },
  {
    id: 120,
    type: 'financing',
    user: 'Salsabeel Khaleel',
    action: 'submitted financing request',
    content: 'Financing request: 48-month term at 3.9% APR',
    data: {
      term: 48,
      apr: 3.9,
      amount: 50000,
      downPayment: 45000,
      monthlyPayment: 1130,
      status: 'pending'
    },
    timestamp: '2025-03-25T11:00:00',
    opportunityId: 100
  },
  {
    id: 121,
    type: 'attachment',
    user: 'Salsabeel Khaleel',
    action: 'uploaded an attachment',
    content: 'Trade-in valuation report and inspection photos',
    fileName: 'TradeIn_Valuation_Tesla_ModelS.pdf',
    timestamp: '2025-03-25T09:30:00',
    opportunityId: 100
  },
  
  // Opportunity 5 (Emma Wilson) - Add attachment and SMS
  {
    id: 122,
    type: 'attachment',
    user: 'Michael Thomas',
    action: 'uploaded an attachment',
    content: 'Insurance documents and registration papers',
    fileName: 'Insurance_Registration_Emma_Wilson.pdf',
    timestamp: '2025-03-24T13:00:00',
    opportunityId: 204
  },
  {
    id: 123,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'sent an SMS',
    content: 'Emma, reminder: Your Mercedes EQE delivery is scheduled for Friday at 10 AM!',
    timestamp: '2025-03-23T15:00:00',
    opportunityId: 204
  },
  {
    id: 124,
    type: 'whatsapp',
    user: 'Michael Thomas',
    action: 'sent a WhatsApp message',
    content: 'All documents are ready! Looking forward to handing over your new EQE.',
    timestamp: '2025-03-22T11:00:00',
    opportunityId: 204
  },
  
  // Opportunity 6 (Robert Taylor) - Full activity history
  {
    id: 125,
    type: 'call',
    user: 'Sarah Jenkins',
    action: 'made a call',
    content: 'Discussed BMW X7 features and luxury options.',
    timestamp: '2025-03-26T10:00:00',
    opportunityId: 37
  },
  {
    id: 126,
    type: 'note',
    user: 'Sarah Jenkins',
    action: 'added a note',
    content: 'Customer wants X7 M60i with Executive Drive Pro package.',
    timestamp: '2025-03-25T14:00:00',
    opportunityId: 37
  },
  {
    id: 127,
    type: 'email',
    user: 'Sarah Jenkins',
    action: 'sent an email',
    content: 'Sent X7 M60i configuration with all requested options.',
    timestamp: '2025-03-24T11:00:00',
    opportunityId: 37
  },
  {
    id: 128,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'uploaded an attachment',
    content: 'BMW X7 M60i detailed specification sheet',
    fileName: 'BMW_X7_M60i_Specs.pdf',
    timestamp: '2025-03-23T15:00:00',
    opportunityId: 37
  },
  {
    id: 129,
    type: 'tradein',
    user: 'Sarah Jenkins',
    action: 'added trade-in information',
    content: 'Customer trade-in: 2021 BMW X5, valued at €55,000',
    data: {
      make: 'BMW',
      model: 'X5',
      year: 2021,
      mileage: 28000,
      condition: 'Excellent',
      value: 55000
    },
    timestamp: '2025-03-22T10:00:00',
    opportunityId: 37
  },
  {
    id: 130,
    type: 'financing',
    user: 'Sarah Jenkins',
    action: 'submitted financing request',
    content: 'Financing approved: 36-month term at 2.9% APR',
    data: {
      term: 36,
      apr: 2.9,
      amount: 65000,
      downPayment: 55000,
      monthlyPayment: 1890,
      status: 'approved'
    },
    timestamp: '2025-03-21T14:00:00',
    opportunityId: 37
  },
  {
    id: 131,
    type: 'sms',
    user: 'Sarah Jenkins',
    action: 'sent an SMS',
    content: 'Robert, great news! Your financing is approved. Ready to order your X7!',
    timestamp: '2025-03-21T15:00:00',
    opportunityId: 37
  },
  {
    id: 132,
    type: 'whatsapp',
    user: 'Sarah Jenkins',
    action: 'sent a WhatsApp message',
    content: 'I found the perfect X7 in Tanzanite Blue. Want to see photos?',
    timestamp: '2025-03-20T12:00:00',
    opportunityId: 37
  },
  
  // Opportunity 7 (Lisa Anderson) - Add missing types
  {
    id: 133,
    type: 'attachment',
    user: 'Michael Thomas',
    action: 'uploaded an attachment',
    content: 'Audi Q8 e-tron brochure and pricing',
    fileName: 'Audi_Q8_etron_Brochure.pdf',
    timestamp: '2025-03-24T10:00:00',
    opportunityId: 36
  },
  {
    id: 134,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'sent an SMS',
    content: 'Lisa, your Q8 e-tron test drive is confirmed for Saturday at 11 AM!',
    timestamp: '2025-03-23T16:00:00',
    opportunityId: 36
  },
  {
    id: 135,
    type: 'whatsapp',
    user: 'Michael Thomas',
    action: 'sent a WhatsApp message',
    content: 'The Q8 e-tron you liked is still available. Let me know if you want to proceed!',
    timestamp: '2025-03-22T14:00:00',
    opportunityId: 36
  },
  
  // Opportunity 8 (James White) - Add missing types
  {
    id: 136,
    type: 'financing',
    user: 'Michael Thomas',
    action: 'submitted financing request',
    content: 'Financing pending: 48-month term at 4.2% APR',
    data: {
      term: 48,
      apr: 4.2,
      amount: 78000,
      downPayment: 15000,
      monthlyPayment: 1445,
      status: 'pending'
    },
    timestamp: '2024-12-24T11:00:00',
    opportunityId: 223
  },
  {
    id: 137,
    type: 'attachment',
    user: 'Michael Thomas',
    action: 'uploaded an attachment',
    content: 'Audi Q4 e-tron financing options comparison',
    fileName: 'Q4_Financing_Options.pdf',
    timestamp: '2024-12-23T15:00:00',
    opportunityId: 223
  },
  {
    id: 138,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'sent an SMS',
    content: 'James, I submitted your financing application. Should hear back in 24-48 hours.',
    timestamp: '2024-12-24T12:00:00',
    opportunityId: 223
  },
  
  // Opportunity 9 (Maria Garcia) - Add missing types
  {
    id: 139,
    type: 'tradein',
    user: 'Sarah Jenkins',
    action: 'added trade-in information',
    content: 'Customer trade-in: 2018 Porsche Cayenne, valued at €48,000',
    data: {
      make: 'Porsche',
      model: 'Cayenne',
      year: 2018,
      mileage: 52000,
      condition: 'Good',
      value: 48000
    },
    timestamp: '2024-12-21T10:00:00',
    opportunityId: 38
  },
  {
    id: 140,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'uploaded an attachment',
    content: 'Final contract and delivery schedule',
    fileName: 'Contract_Maria_Garcia.pdf',
    timestamp: '2024-12-22T15:00:00',
    opportunityId: 38
  },
  {
    id: 141,
    type: 'whatsapp',
    user: 'Sarah Jenkins',
    action: 'sent a WhatsApp message',
    content: 'Maria, your Macan Electric is being prepared for delivery. So exciting!',
    timestamp: '2024-12-21T14:00:00',
    opportunityId: 38
  },
  
  // Opportunity 11 (Jennifer Lee) - Add missing types
  {
    id: 142,
    type: 'attachment',
    user: 'Michael Thomas',
    action: 'uploaded an attachment',
    content: 'BMW iX3 warranty and service package details',
    fileName: 'BMW_iX3_Warranty.pdf',
    timestamp: '2024-12-19T11:00:00',
    opportunityId: 223
  },
  {
    id: 143,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'sent an SMS',
    content: 'Jennifer, your iX3 contract is ready for signature. Can you come by this week?',
    timestamp: '2024-12-18T15:00:00',
    opportunityId: 223
  },
  {
    id: 144,
    type: 'whatsapp',
    user: 'Michael Thomas',
    action: 'sent a WhatsApp message',
    content: 'Great news! We secured the iX3 in your preferred Sophisto Gray color!',
    timestamp: '2024-12-17T10:00:00',
    opportunityId: 223
  },
  
  // Opportunity 12 (Daniel Kim) - Add missing types
  {
    id: 145,
    type: 'tradein',
    user: 'Sarah Jenkins',
    action: 'added trade-in information',
    content: 'Customer trade-in: 2020 Audi A4, valued at €28,000',
    data: {
      make: 'Audi',
      model: 'A4',
      year: 2020,
      mileage: 42000,
      condition: 'Very Good',
      value: 28000
    },
    timestamp: '2024-12-17T14:00:00',
    opportunityId: 39
  },
  {
    id: 146,
    type: 'financing',
    user: 'Sarah Jenkins',
    action: 'submitted financing request',
    content: 'Financing approved: 60-month term at 3.8% APR',
    data: {
      term: 60,
      apr: 3.8,
      amount: 62000,
      downPayment: 28000,
      monthlyPayment: 1140,
      status: 'approved'
    },
    timestamp: '2024-12-17T15:00:00',
    opportunityId: 39
  },
  {
    id: 147,
    type: 'attachment',
    user: 'Sarah Jenkins',
    action: 'uploaded an attachment',
    content: 'A6 e-tron configuration and financing summary',
    fileName: 'A6_etron_Config_Daniel_Kim.pdf',
    timestamp: '2024-12-16T13:00:00',
    opportunityId: 39
  },
  
  // Opportunity 13 (Rachel Green) - Add missing types
  {
    id: 148,
    type: 'attachment',
    user: 'David Miller',
    action: 'uploaded an attachment',
    content: 'VW ID.3 charging guide and home charger installation info',
    fileName: 'ID3_Charging_Guide.pdf',
    timestamp: '2024-12-01T09:00:00',
    opportunityId: 51
  },
  {
    id: 149,
    type: 'sms',
    user: 'David Miller',
    action: 'sent an SMS',
    content: 'Rachel, the ID.3 is available for test drive. When would you like to visit?',
    timestamp: '2024-12-01T10:00:00',
    opportunityId: 51
  },
  
  // Opportunity 14 (Monica Geller) - Communication-focused
  {
    id: 150,
    type: 'call',
    user: 'Michael Thomas',
    action: 'made a call',
    content: 'Discussed Tesla Model 3 features and Autopilot capabilities.',
    timestamp: '2025-03-16T10:00:00',
    opportunityId: 14
  },
  {
    id: 151,
    type: 'email',
    user: 'Michael Thomas',
    action: 'sent an email',
    content: 'Sent Model 3 comparison with other electric sedans.',
    timestamp: '2025-03-15T15:00:00',
    opportunityId: 14
  },
  {
    id: 152,
    type: 'whatsapp',
    user: 'Michael Thomas',
    action: 'sent a WhatsApp message',
    content: 'Monica, the Model 3 you test drove is still available. Ready to move forward?',
    timestamp: '2025-03-14T11:00:00',
    opportunityId: 14
  },
  {
    id: 153,
    type: 'sms',
    user: 'Michael Thomas',
    action: 'sent an SMS',
    content: 'Following up on your Model 3 interest. Let me know if you have questions!',
    timestamp: '2025-03-13T14:00:00',
    opportunityId: 14
  },
  {
    id: 154,
    type: 'note',
    user: 'Michael Thomas',
    action: 'added a note',
    content: 'Customer loved the test drive. Considering white vs blue exterior.',
    timestamp: '2025-03-12T16:00:00',
    opportunityId: 14
  },
  
  // Opportunity 15 (Ross Geller) - Document-focused
  {
    id: 155,
    type: 'attachment',
    user: 'David Miller',
    action: 'uploaded an attachment',
    content: 'Mercedes-Benz GLC detailed specifications',
    fileName: 'Mercedes_GLC_Specs.pdf',
    timestamp: '2025-03-20T10:00:00',
    opportunityId: 15
  },
  {
    id: 156,
    type: 'attachment',
    user: 'David Miller',
    action: 'uploaded an attachment',
    content: 'GLC financing options and payment calculator',
    fileName: 'GLC_Financing_Calculator.pdf',
    timestamp: '2025-03-19T14:00:00',
    opportunityId: 15
  },
  {
    id: 157,
    type: 'attachment',
    user: 'David Miller',
    action: 'uploaded an attachment',
    content: 'GLC warranty and maintenance package details',
    fileName: 'GLC_Warranty_Package.pdf',
    timestamp: '2025-03-18T11:00:00',
    opportunityId: 15
  },
  {
    id: 158,
    type: 'note',
    user: 'David Miller',
    action: 'added a note',
    content: 'Customer requested all documentation before making decision.',
    timestamp: '2025-03-17T15:00:00',
    opportunityId: 15
  },
  {
    id: 159,
    type: 'email',
    user: 'David Miller',
    action: 'sent an email',
    content: 'Sent comprehensive GLC information package as requested.',
    timestamp: '2025-03-17T16:00:00',
    opportunityId: 15
  },
  
  // Opportunity 16 (Thomas Anderson - formerly duplicate 10) - Add missing types
  {
    id: 160,
    type: 'financing',
    user: 'David Miller',
    action: 'submitted financing request',
    content: 'Financing pending: 48-month term at 4.5% APR',
    data: {
      term: 48,
      apr: 4.5,
      amount: 75000,
      downPayment: 0,
      monthlyPayment: 1715,
      status: 'pending'
    },
    timestamp: '2024-12-14T11:00:00',
    opportunityId: 16
  },
  {
    id: 161,
    type: 'attachment',
    user: 'David Miller',
    action: 'uploaded an attachment',
    content: 'Mercedes EQC charging infrastructure guide',
    fileName: 'EQC_Charging_Guide.pdf',
    timestamp: '2024-12-13T15:00:00',
    opportunityId: 16
  },
  {
    id: 162,
    type: 'whatsapp',
    user: 'David Miller',
    action: 'sent a WhatsApp message',
    content: 'Thomas, I submitted your financing application. Fingers crossed!',
    timestamp: '2024-12-14T12:00:00',
    opportunityId: 16
  },
  
  // Purchase activities (for closed/won opportunities)
  {
    id: 163,
    type: 'purchase',
    user: 'David Miller',
    action: 'completed a purchase',
    data: {
      brand: 'Mercedes-Benz',
      model: 'GLE 450',
      year: 2024,
      price: 78500,
      purchaseDate: '2025-12-18',
      notes: 'Full payment received. Customer opted for premium package with panoramic sunroof.'
    },
    timestamp: '2025-12-18T16:30:00',
    opportunityId: 3
  },
  {
    id: 164,
    type: 'purchase',
    user: 'Sarah Jenkins',
    action: 'completed a purchase',
    data: {
      brand: 'Audi',
      model: 'e-tron GT',
      year: 2024,
      price: 125000,
      purchaseDate: '2025-12-20',
      notes: 'Customer very satisfied with final negotiations. Trade-in processed successfully.'
    },
    timestamp: '2025-12-20T14:00:00',
    opportunityId: 38
  },
  {
    id: 165,
    type: 'purchase',
    user: 'Michael Thomas',
    action: 'completed a purchase',
    data: {
      brand: 'BMW',
      model: 'iX xDrive50',
      year: 2024,
      price: 89900,
      purchaseDate: '2025-12-22',
      notes: 'Contract finalized. Customer selected midnight blue metallic paint.'
    },
    timestamp: '2025-12-22T11:15:00',
    opportunityId: 223
  },
  // Offer activities for new opportunities (with vehicle data for carousel)
  {
    id: 100,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'created an offer',
    content: 'Initial offer sent for Audi Q5',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    opportunityId: 30,
    data: {
      vehicle: {
        brand: 'Audi',
        model: 'Q5',
        year: 2024,
        price: 55000,
        image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
        dealership: 'Milan',
        fuelType: 'Petrol',
        gearType: 'Automatic',
        kilometers: 0,
      status: 'New',
        stockDays: 10
      }
    }
  },
  {
    id: 101,
    type: 'offer',
    user: 'David Miller',
    action: 'created an offer',
    content: 'Follow-up offer sent for Audi Q5 Premium',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    opportunityId: 30,
    data: {
      vehicle: {
        brand: 'Audi',
        model: 'Q5 Premium',
        year: 2024,
        price: 58000,
        image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
        dealership: 'Milan',
        fuelType: 'Petrol',
        gearType: 'Automatic',
        kilometers: 0,
      status: 'New',
        stockDays: 5
      }
    }
  },
  {
    id: 102,
    type: 'offer',
    user: 'Sarah Jenkins',
    action: 'created an offer',
    content: 'Initial offer sent for Volkswagen Touran',
    timestamp: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    opportunityId: 33,
    data: {
      vehicle: {
        brand: 'Volkswagen',
        model: 'Touran',
        year: 2023,
        price: 35000,
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
        dealership: 'Berlin',
        fuelType: 'Petrol',
        gearType: 'Automatic',
        kilometers: 10,
      status: 'Used',
        stockDays: 100
      }
    }
  }
]

// Dashboard Mock Data
