import { createDateOffset, createDateString, createDateTimeOffset, createHourOffset } from '@/utils/mockDataHelpers'

/**
 * English mock opportunities – one per display stage/status for the state machine.
 * No duplicates; simplified set for default (EN) mock.
 */

const baseRequestedCar = (brand, model, year, price, opts = {}) => {
  const defaults = {
    vin: 'WBA3B1C50EK123456',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
    dealership: 'Munich',
    fuelType: 'Petrol',
    gearType: 'Automatic',
    kilometers: 0,
    status: 'New',
    stockDays: 5,
    registration: '01/2024',
    requestMessage: `Interested in ${brand} ${model}. Ready to discuss pricing and availability.`,
    requestType: 'Quotation',
    adCampaign: 'Summer 2024',
    adMedium: 'Display',
    adSource: 'Google',
    expectedPurchaseDate: createDateString(30)
  }
  return { brand, model, year, price, ...defaults, ...opts }
}

export const mockOpportunities = [
  // 1. Awaiting Appointment – Qualified, no appointment
  {
    id: 1,
    customerId: 1,
    source: 'Walk-in',
    sourceDetails: 'Showroom visit',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('BMW', '3 Series', 2024, 45000),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Hot'],
    value: 45000,
    expectedCloseDate: createHourOffset(22),
    assignee: 'Salsabeel Khaleel',
    createdAt: createHourOffset(-2),
    lastActivity: createHourOffset(-1),
    nextActionDue: createHourOffset(4),
    scheduledAppointment: null
  },

  // 2. Appointment Scheduled – Qualified, appointment confirmed
  {
    id: 2,
    customerId: 2,
    source: 'Google Ads',
    sourceDetails: 'Summer Campaign 2024',
    fiscalEntity: 'MotorK',
    requestType: 'Test Drive',
    requestedCar: baseRequestedCar('Audi', 'A4', 2024, 42000, { vin: 'WAUZZZ8V9KA123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 42000,
    expectedCloseDate: createHourOffset(18),
    assignee: 'Sarah Jenkins',
    createdAt: createHourOffset(-4),
    lastActivity: createHourOffset(-2),
    nextActionDue: createHourOffset(6),
    scheduledAppointment: {
      id: 2,
      start: createHourOffset(8),
      end: createHourOffset(9),
      type: 'Consultation',
      assignee: 'Sarah Jenkins',
      customerId: 2,
      opportunityId: 2,
      duration: 60,
      status: 'confirmed',
      noShowCount: 0,
      lastNoShowDate: null
    }
  },

  // 3. In Negotiation - Offer Sent
  {
    id: 3,
    customerId: 3,
    source: 'Website',
    sourceDetails: 'Contact form',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Mercedes-Benz', 'C-Class', 2024, 48000, { vin: 'WDDWF4KB0KR123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-3',
        createdAt: createHourOffset(-3),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'C-Class',
        vehicleYear: 2024,
        price: 48000,
        status: 'active',
        data: { brand: 'Mercedes-Benz', model: 'C-Class', year: 2024, price: 48000, financingType: 'cash' }
      }
    ],
    tags: [],
    value: 48000,
    expectedCloseDate: createHourOffset(14),
    assignee: 'David Miller',
    createdAt: createHourOffset(-5),
    lastActivity: createHourOffset(-2),
    nextActionDue: createHourOffset(8),
    scheduledAppointment: null
  },

  // 4. In Negotiation - Contract Pending (Set Delivery Date step)
  {
    id: 4,
    customerId: 4,
    source: 'Walk-in',
    sourceDetails: 'Premium showroom',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Porsche', '911', 2024, 125000, { vin: 'WP0ZZZ99ZPS234567' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-4',
        createdAt: createDateOffset(-8),
        vehicleBrand: 'Porsche',
        vehicleModel: '911',
        vehicleYear: 2024,
        price: 125000,
        status: 'accepted',
        data: { brand: 'Porsche', model: '911', year: 2024, price: 125000, financingType: 'cash' }
      }
    ],
    contracts: [
      {
        id: 'contract-4-1',
        contractDate: createDateOffset(-5),
        contractNotes: 'Pending signature',
        contractSigned: false,
        version: 1,
        status: 'pending'
      }
    ],
    tags: ['Premium'],
    value: 125000,
    expectedCloseDate: createHourOffset(12),
    assignee: 'David Miller',
    createdAt: createHourOffset(-6),
    lastActivity: createHourOffset(-2),
    nextActionDue: createHourOffset(20),
    contractDate: createDateOffset(-5),
    scheduledAppointment: null
  },

  // 5. Closed Won – no delivery date (Schedule Delivery)
  {
    id: 5,
    customerId: 5,
    source: 'Phone',
    sourceDetails: '',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Volkswagen', 'Golf', 2024, 32000, { vin: 'WVWZZZ3CZWE123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: null,
    offers: [
      {
        id: 'offer-5',
        createdAt: createDateOffset(-15),
        vehicleBrand: 'Volkswagen',
        vehicleModel: 'Golf',
        vehicleYear: 2024,
        price: 32000,
        status: 'accepted',
        data: { brand: 'Volkswagen', model: 'Golf', year: 2024, price: 32000, financingType: 'cash' }
      }
    ],
    contracts: [
      {
        id: 'contract-5-1',
        contractDate: createDateOffset(-3),
        contractNotes: 'Signed',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-3),
        version: 1,
        status: 'signed'
      }
    ],
    tags: [],
    value: 32000,
    expectedCloseDate: null,
    assignee: 'Sarah Jenkins',
    createdAt: createHourOffset(-8),
    lastActivity: createHourOffset(-1),
    nextActionDue: createHourOffset(12),
    closedDate: createDateOffset(-3),
    contractDate: createDateOffset(-3),
    deliveryDate: null,
    scheduledAppointment: null
  },

  // 6. Closed Lost
  {
    id: 6,
    customerId: 8,
    source: 'Facebook',
    sourceDetails: 'Auto campaign',
    fiscalEntity: '',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Porsche', 'Cayenne', 2024, 95000, { vin: 'WP0ZZZ9XZPS123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Lost',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-6',
        createdAt: createDateOffset(-12),
        vehicleBrand: 'Porsche',
        vehicleModel: 'Cayenne',
        vehicleYear: 2024,
        price: 95000,
        status: 'archived',
        data: { brand: 'Porsche', model: 'Cayenne', year: 2024, price: 95000, financingType: 'financing' }
      }
    ],
    tags: ['Premium'],
    value: 95000,
    lostReason: 'Went with competitor',
    expectedCloseDate: null,
    assignee: 'David Miller',
    createdAt: createHourOffset(-10),
    lastActivity: createHourOffset(-3),
    nextActionDue: createHourOffset(6),
    closedDate: createDateOffset(-5),
    scheduledAppointment: null
  },

  // 7. Abandoned
  {
    id: 7,
    customerId: 9,
    source: '3rd Party',
    sourceDetails: 'Lead aggregator',
    fiscalEntity: '',
    requestType: 'Generic sales',
    requestedCar: baseRequestedCar('Jaguar', 'F-Pace', 2024, 72000, { vin: 'SALWA2FK4LA123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Abandoned',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 72000,
    expectedCloseDate: createHourOffset(24),
    assignee: 'Sarah Jenkins',
    createdAt: createHourOffset(-4),
    lastActivity: createHourOffset(-2),
    nextActionDue: createHourOffset(20),
    scheduledAppointment: null
  }
]
