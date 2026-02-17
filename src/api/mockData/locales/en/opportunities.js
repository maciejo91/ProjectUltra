import { createDateOffset, createDateString, createDateTimeOffset } from '@/utils/mockDataHelpers'

/**
 * English mock opportunities – one per display stage/status for the state machine.
 * No duplicates; simplified set for default (EN) mock.
 */

const baseRequestedCar = (brand, model, year, price, vin = 'WBA3B1C50EK123456') => ({
  brand,
  model,
  year,
  price,
  image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
  dealership: 'Munich',
  fuelType: 'Petrol',
  gearType: 'Automatic',
  kilometers: 0,
  status: 'New',
  stockDays: 5,
  vin
})

export const mockOpportunities = [
  // 1. Awaiting Appointment – Qualified, no appointment
  {
    id: 1,
    customerId: 1,
    requestedCar: baseRequestedCar('BMW', '3 Series', 2024, 45000),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Hot'],
    value: 45000,
    expectedCloseDate: createDateString(30),
    assignee: 'Salsabeel Khaleel',
    createdAt: createDateOffset(-2),
    lastActivity: createDateOffset(-1),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: null
  },

  // 2. Appointment Scheduled – Qualified, appointment confirmed
  {
    id: 2,
    customerId: 2,
    requestedCar: baseRequestedCar('Audi', 'A4', 2024, 42000, 'WAUZZZ8V9KA123456'),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 42000,
    expectedCloseDate: createDateString(25),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-5),
    lastActivity: createDateOffset(-2),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: {
      id: 2,
      start: createDateTimeOffset(5, 10, 0),
      end: createDateTimeOffset(5, 11, 0),
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
    requestedCar: baseRequestedCar('Mercedes-Benz', 'C-Class', 2024, 48000, 'WDDWF4KB0KR123456'),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-3',
        createdAt: createDateOffset(-3),
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
    expectedCloseDate: createDateString(20),
    assignee: 'David Miller',
    createdAt: createDateOffset(-10),
    lastActivity: createDateOffset(-2),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: null
  },

  // 4. In Negotiation - Contract Pending (Set Delivery Date step)
  {
    id: 4,
    customerId: 4,
    requestedCar: baseRequestedCar('Porsche', '911', 2024, 125000, 'WP0ZZZ99ZPS234567'),
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
    expectedCloseDate: createDateString(14),
    assignee: 'David Miller',
    createdAt: createDateOffset(-20),
    lastActivity: createDateOffset(-5),
    nextActionDue: createDateOffset(1),
    contractDate: createDateOffset(-5),
    scheduledAppointment: null
  },

  // 5. Closed Won – no delivery date (Schedule Delivery)
  {
    id: 5,
    customerId: 5,
    requestedCar: baseRequestedCar('Volkswagen', 'Golf', 2024, 32000, 'WVWZZZ3CZWE123456'),
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
    createdAt: createDateOffset(-30),
    lastActivity: createDateOffset(-1),
    nextActionDue: createDateOffset(1),
    closedDate: createDateOffset(-3),
    contractDate: createDateOffset(-3),
    deliveryDate: null,
    scheduledAppointment: null
  },

  // 6. Closed Lost
  {
    id: 8,
    customerId: 8,
    requestedCar: baseRequestedCar('Porsche', 'Cayenne', 2024, 95000, 'WP0ZZZ9XZPS123456'),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Lost',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-8',
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
    createdAt: createDateOffset(-30),
    lastActivity: createDateOffset(-5),
    nextActionDue: createDateOffset(1),
    closedDate: createDateOffset(-5),
    scheduledAppointment: null
  },

  // 7. Abandoned
  {
    id: 9,
    customerId: 9,
    requestedCar: baseRequestedCar('Jaguar', 'F-Pace', 2024, 72000, 'SALWA2FK4LA123456'),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Abandoned',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 72000,
    expectedCloseDate: createDateString(35),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-45),
    lastActivity: createDateOffset(-35),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: null
  }
]
