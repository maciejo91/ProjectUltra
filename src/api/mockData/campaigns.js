import { createDateTimeOffset, createHourOffset } from '@/utils/mockDataHelpers'

/**
 * Campaign interactions - customer communications via Email and WhatsApp
 * Each row represents a conversation thread with link options for lead/opportunity
 */
export const mockCampaignInteractions = [
  {
    id: 1,
    customerId: 1,
    customer: { id: 1, name: 'Luca Amadio', initials: 'LA' },
    status: 'New',
    channel: 'Email',
    direction: 'Inbound',
    lastMessageDate: createDateTimeOffset(-2, 12, 24),
    lastMessage: 'VETTURA VENDUTA IN ATTESA DI CONFERMA. Vorrei sapere quando posso ritirare.',
    leadId: null,
    opportunityId: 3,
    messages: [
      { id: 1, type: 'email', user: 'Sales Team', timestamp: createDateTimeOffset(-3, 9, 0), content: 'Your vehicle is ready for pickup. Please confirm your preferred date.' },
      { id: 2, type: 'customer-email', user: 'Luca Amadio', timestamp: createDateTimeOffset(-2, 12, 24), content: 'VETTURA VENDUTA IN ATTESA DI CONFERMA. Vorrei sapere quando posso ritirare.' }
    ]
  },
  {
    id: 2,
    customerId: 2,
    customer: { id: 2, name: 'Daniele Mussi', initials: 'DM' },
    status: 'New',
    channel: 'Email',
    direction: 'Inbound',
    lastMessageDate: createDateTimeOffset(-2, 14, 1),
    lastMessage: 'Buongiorno, sono interessato alla Volkswagen ID.4. Potrei avere un preventivo?',
    leadId: 2,
    opportunityId: null,
    messages: [
      { id: 1, type: 'customer-email', user: 'Daniele Mussi', timestamp: createDateTimeOffset(-2, 14, 1), content: 'Buongiorno, sono interessato alla Volkswagen ID.4. Potrei avere un preventivo?' }
    ]
  },
  {
    id: 3,
    customerId: 3,
    customer: { id: 3, name: 'Domenico Palmieri', initials: 'DP' },
    status: 'Active',
    channel: 'WhatsApp Business',
    direction: 'Inbound',
    lastMessageDate: createDateTimeOffset(-2, 14, 1),
    lastMessage: 'Domenico Palmieri: Grazie mille per le informazioni.',
    leadId: null,
    opportunityId: null,
    messages: [
      { id: 1, type: 'whatsapp', user: 'Sales Team', timestamp: createDateTimeOffset(-2, 10, 0), content: 'We have several ID.4 options in stock. Would you like to schedule a test drive?' },
      { id: 2, type: 'customer-whatsapp', user: 'Domenico Palmieri', timestamp: createDateTimeOffset(-2, 14, 1), content: 'Domenico Palmieri: Grazie mille per le informazioni.' }
    ]
  },
  {
    id: 4,
    customerId: 4,
    customer: { id: 4, name: 'Vincenzo', initials: 'V' },
    status: 'Active',
    channel: 'WhatsApp Business',
    direction: 'Outbound',
    lastMessageDate: createDateTimeOffset(-2, 13, 45),
    lastMessage: 'Vincenzo: Quella di Caserta e quella di Napoli sono vicine?',
    leadId: 1,
    opportunityId: 2,
    messages: [
      { id: 1, type: 'whatsapp', user: 'Sales Team', timestamp: createDateTimeOffset(-2, 9, 30), content: 'We have showrooms in both Caserta and Naples. Which would you prefer to visit?' },
      { id: 2, type: 'customer-whatsapp', user: 'Vincenzo', timestamp: createDateTimeOffset(-2, 13, 45), content: 'Vincenzo: Quella di Caserta e quella di Napoli sono vicine?' }
    ]
  },
  {
    id: 5,
    customerId: 5,
    customer: { id: 5, name: 'Lorenzo', initials: 'L' },
    status: 'New',
    channel: 'WhatsApp Business',
    direction: 'Inbound',
    lastMessageDate: createDateTimeOffset(-2, 14, 22),
    lastMessage: 'Giusy: 14.900 € prezzo senza partita IVA.',
    leadId: null,
    opportunityId: null,
    messages: [
      { id: 1, type: 'customer-whatsapp', user: 'Lorenzo', timestamp: createDateTimeOffset(-2, 14, 22), content: 'Giusy: 14.900 € prezzo senza partita IVA.' }
    ]
  },
  {
    id: 6,
    customerId: 6,
    customer: { id: 6, name: 'Tiziana De Masi', initials: 'TD' },
    status: 'Active',
    channel: 'Email',
    direction: 'Outbound',
    lastMessageDate: createDateTimeOffset(-3, 10, 15),
    lastMessage: 'Simona: Benvenuto! 🙂 Grazie per il tuo interesse nel nostro servizio.',
    leadId: 3,
    opportunityId: null,
    messages: [
      { id: 1, type: 'email', user: 'Simona', timestamp: createDateTimeOffset(-3, 10, 15), content: 'Simona: Benvenuto! 🙂 Grazie per il tuo interesse nel nostro servizio.' }
    ]
  },
  {
    id: 7,
    customerId: 7,
    customer: { id: 7, name: 'Pietro Del Prete', initials: 'PP' },
    status: 'New',
    channel: 'Email',
    direction: 'Inbound',
    lastMessageDate: createDateTimeOffset(-1, 9, 30),
    lastMessage: 'Vorrei fissare un test drive per il modello BMW 3 Series.',
    leadId: null,
    opportunityId: 5,
    messages: [
      { id: 1, type: 'customer-email', user: 'Pietro Del Prete', timestamp: createDateTimeOffset(-1, 9, 30), content: 'Vorrei fissare un test drive per il modello BMW 3 Series.' }
    ]
  },
  {
    id: 8,
    customerId: 8,
    customer: { id: 8, name: 'Giulia Rossi', initials: 'GR' },
    status: 'Active',
    channel: 'WhatsApp Business',
    direction: 'Inbound',
    lastMessageDate: createDateTimeOffset(-1, 16, 45),
    lastMessage: 'Giulia Rossi: Perfetto, allora ci vediamo domani alle 10.',
    leadId: 4,
    opportunityId: 4,
    messages: [
      { id: 1, type: 'whatsapp', user: 'Sales Team', timestamp: createDateTimeOffset(-1, 14, 0), content: 'Your test drive is confirmed for tomorrow at 10:00. See you then!' },
      { id: 2, type: 'customer-whatsapp', user: 'Giulia Rossi', timestamp: createDateTimeOffset(-1, 16, 45), content: 'Giulia Rossi: Perfetto, allora ci vediamo domani alle 10.' }
    ]
  }
]
