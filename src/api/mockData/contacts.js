export const mockContacts = [
  {
    id: 1,
    customerId: 1,
    name: 'Josh Adams',
    initials: 'JA',
    email: 'josh.adams@example.com',
    phone: '+4901564879300',
    address: 'Via Torino 56, 20123 Milan',
    company: 'Tech Solutions GmbH',
    source: 'Google Ads',
    tags: ['Premium', 'Automation'],
    createdAt: '2025-03-21T08:17:00',
    lastContact: '2025-03-25T14:30:00',
    requestedCar: null
  },
  {
    id: 2,
    customerId: 2,
    name: 'Emma Watson',
    initials: 'EW',
    email: 'emma.watson@example.com',
    phone: '+4901234567890',
    address: 'Hauptstraße 12, 10115 Berlin',
    company: 'Fashion International',
    source: 'Google Ads',
    tags: [],
    createdAt: '2025-03-20T10:15:00',
    lastContact: '2025-03-24T16:20:00',
    requestedCar: null
  },
  {
    id: 999,
    customerId: 999,
    name: 'Test Contact with Car',
    initials: 'TC',
    email: 'test.contact@example.com',
    phone: '+4901234567999',
    address: 'Test Street 123, 10115 Berlin',
    company: null,
    source: 'Immo-scout',
    tags: ['Test'],
    createdAt: '2025-01-04T10:00:00',
    lastContact: '2025-01-04T10:00:00',
    requestedCar: {
      brand: 'BMW',
      model: '3 Series',
      year: 2024,
      price: 45000,
      requestType: 'Quotation',
      requestMessage: 'Interested in this model for company fleet',
      staffNote: '',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500'
    }
  }
]

