import { createDateOffset, createDateString, createDateTimeOffset, createHourOffset, DEFAULT_CAR_IMAGE } from '@/utils/mockDataHelpers'

/**
 * English mock opportunities – one per display stage/status for the state machine.
 * No duplicates; simplified set for default (EN) mock.
 */

const baseRequestedCar = (brand, model, year, price, opts = {}) => {
  const defaults = {
    vin: 'WBA3B1C50EK123456',
    image: DEFAULT_CAR_IMAGE,
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
    channel: 'Showroom',
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

  // 2. Appointment Scheduled – Qualified, appointment today (for today’s tasks)
  {
    id: 2,
    customerId: 2,
    source: 'Google Ads',
    channel: 'Paid',
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

  // 2b. Appointment Scheduled – Qualified, appointment NOT today
  {
    id: 12,
    customerId: 5,
    source: 'Website',
    sourceDetails: 'Lead form',
    fiscalEntity: 'MotorK',
    requestType: 'Test Drive',
    requestedCar: baseRequestedCar('Volkswagen', 'Passat', 2024, 38000, { vin: 'WVWZZZ3CZWE123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 38000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-2),
    lastActivity: createDateOffset(-1),
    nextActionDue: createDateTimeOffset(5, 10, 0),
    scheduledAppointment: {
      id: 12,
      start: createDateTimeOffset(5, 10, 0),
      end: createDateTimeOffset(5, 11, 0),
      type: 'Test Drive',
      assignee: 'Sarah Jenkins',
      customerId: 5,
      opportunityId: 12,
      duration: 60,
      status: 'confirmed',
      noShowCount: 0,
      lastNoShowDate: null
    }
  },

  // 3. OFB: In Negotiation - Offer Sent, 6+ days, no contract (banner showcase – expand Follow up → Complete Survey)
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
        createdAt: createDateOffset(-8),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'C-Class',
        vehicleYear: 2024,
        price: 48000,
        status: 'active',
        data: { brand: 'Mercedes-Benz', model: 'C-Class', year: 2024, price: 48000, financingType: 'cash', image: 'https://images.unsplash.com/photo-1546518071-fddcdda7580a?w=900&auto=format&fit=crop&q=60' }
      }
    ],
    tags: [],
    value: 48000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'David Miller',
    createdAt: createDateOffset(-10),
    lastActivity: createDateOffset(-6),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: null
  },

  // 4. CFB (Contract Pending): In Negotiation - contract signed 8 days ago, no delivery (banner showcase)
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
        createdAt: createDateOffset(-12),
        vehicleBrand: 'Porsche',
        vehicleModel: '911',
        vehicleYear: 2024,
        price: 125000,
        status: 'accepted',
        data: { brand: 'Porsche', model: '911', year: 2024, price: 125000, financingType: 'cash', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60' }
      }
    ],
    contracts: [
      {
        id: 'contract-4-1',
        contractDate: createDateOffset(-8),
        contractNotes: 'Signed',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-8),
        version: 1,
        status: 'signed'
      }
    ],
    tags: ['Premium'],
    value: 125000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'David Miller',
    createdAt: createDateOffset(-15),
    lastActivity: createDateOffset(-7),
    nextActionDue: createDateOffset(2),
    contractDate: createDateOffset(-8),
    deliveryDate: null,
    scheduledAppointment: null
  },

  // 5. CFB: Closed Won – contract signed 8 days ago, no delivery date (banner showcase)
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
        createdAt: createDateOffset(-20),
        vehicleBrand: 'Volkswagen',
        vehicleModel: 'Golf',
        vehicleYear: 2024,
        price: 32000,
        status: 'accepted',
        data: { brand: 'Volkswagen', model: 'Golf', year: 2024, price: 32000, financingType: 'cash', image: 'https://images.unsplash.com/photo-1607853203100-69829c08b88e?w=900&auto=format&fit=crop&q=60' }
      }
    ],
    contracts: [
      {
        id: 'contract-5-1',
        contractDate: createDateOffset(-8),
        contractNotes: 'Signed',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-8),
        version: 1,
        status: 'signed'
      }
    ],
    tags: [],
    value: 32000,
    expectedCloseDate: null,
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-25),
    lastActivity: createDateOffset(-7),
    nextActionDue: createDateOffset(1),
    closedDate: createDateOffset(-8),
    contractDate: createDateOffset(-8),
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
        data: { brand: 'Porsche', model: 'Cayenne', year: 2024, price: 95000, financingType: 'financing', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60' }
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
  },

  // 8. NFU / Offer Feedback Missing: In Negotiation - Offer Feedback, 6+ days, no appointment (banner showcase)
  {
    id: 8,
    customerId: 10,
    source: 'Website',
    sourceDetails: 'Contact form',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('BMW', 'iX xDrive50', 2024, 105000, { vin: 'WBA3B1C50EK789012' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Feedback',
    offers: [
      {
        id: 'offer-8',
        createdAt: createDateOffset(-10),
        vehicleBrand: 'BMW',
        vehicleModel: 'iX xDrive50',
        vehicleYear: 2024,
        price: 105000,
        status: 'active',
        data: { brand: 'BMW', model: 'iX xDrive50', year: 2024, price: 105000, financingType: 'cash', image: 'https://images.unsplash.com/photo-1605822102629-918beea85679?w=900&auto=format&fit=crop&q=60' }
      }
    ],
    tags: [],
    value: 105000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-10),
    lastActivity: createDateOffset(-6),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: null
  },

  // 9a. In Negotiation - Awaiting Offer (appointment done/skipped, no offer yet)
  {
    id: 14,
    customerId: 14,
    source: 'Website',
    sourceDetails: 'Contact form',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Volvo', 'XC60', 2024, 55000, { vin: 'YV1LFA2E2N1123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Awaiting Offer',
    offers: [],
    tags: [],
    value: 55000,
    expectedCloseDate: createDateOffset(10),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-2),
    lastActivity: createHourOffset(-4),
    nextActionDue: createDateOffset(2),
    scheduledAppointment: null
  },

  // 9b. In Negotiation - Awaiting Offer (another mock)
  {
    id: 13,
    customerId: 15,
    source: 'Walk-in',
    sourceDetails: 'Showroom visit',
    fiscalEntity: 'MotorK',
    requestType: 'Test Drive',
    requestedCar: baseRequestedCar('Mazda', 'CX-5', 2024, 42000, { vin: 'JM3KFBDM5N0123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Awaiting Offer',
    offers: [],
    tags: ['Hot'],
    value: 42000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'David Miller',
    createdAt: createDateOffset(-1),
    lastActivity: createHourOffset(-2),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: null
  },

  // 9. In Negotiation - Offer Feedback (offer 4+ days old, awaiting feedback)
  {
    id: 9,
    customerId: 11,
    source: 'Walk-in',
    sourceDetails: 'Showroom visit',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Lexus', 'ES 300h', 2024, 52000, { vin: 'JTHBK1EG3A2123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Feedback',
    offers: [
      {
        id: 'offer-9',
        createdAt: createDateOffset(-4),
        vehicleBrand: 'Lexus',
        vehicleModel: 'ES 300h',
        vehicleYear: 2024,
        price: 52000,
        status: 'active',
        acceptance_status: 'pending',
        data: { brand: 'Lexus', model: 'ES 300h', year: 2024, price: 52000, financingType: 'cash', image: DEFAULT_CAR_IMAGE }
      }
    ],
    tags: [],
    value: 52000,
    expectedCloseDate: createDateOffset(14),
    assignee: 'David Miller',
    createdAt: createDateOffset(-6),
    lastActivity: createDateOffset(-4),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: null
  },

  // 10. DFB (Awaiting Delivery): Closed Won - delivery date 5 days ago, not yet delivered (banner showcase)
  {
    id: 10,
    customerId: 12,
    source: 'Phone',
    sourceDetails: '',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Toyota', 'Camry', 2024, 38000, { vin: '4T1BF1FK0NU123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Awaiting Delivery',
    offers: [
      {
        id: 'offer-10',
        createdAt: createDateOffset(-15),
        vehicleBrand: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: 2024,
        price: 38000,
        status: 'accepted',
        data: { brand: 'Toyota', model: 'Camry', year: 2024, price: 38000, financingType: 'cash', image: DEFAULT_CAR_IMAGE }
      }
    ],
    contracts: [
      {
        id: 'contract-10-1',
        contractDate: createDateOffset(-10),
        contractNotes: 'Signed',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-10),
        version: 1,
        status: 'signed'
      }
    ],
    tags: [],
    value: 38000,
    expectedCloseDate: null,
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-20),
    lastActivity: createDateOffset(-4),
    nextActionDue: createDateOffset(1),
    closedDate: createDateOffset(-10),
    contractDate: createDateOffset(-10),
    deliveryDate: createDateOffset(-5),
    actualDeliveryDate: null,
    scheduledAppointment: null
  },

  // 11. DFB (Delivered): Closed Won - actual delivery 5 days ago (post-delivery survey, banner showcase)
  {
    id: 11,
    customerId: 13,
    source: 'Website',
    sourceDetails: 'Contact form',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Honda', 'Accord', 2024, 36000, { vin: '1HGCV1F12NA123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Delivered',
    offers: [
      {
        id: 'offer-11',
        createdAt: createDateOffset(-25),
        vehicleBrand: 'Honda',
        vehicleModel: 'Accord',
        vehicleYear: 2024,
        price: 36000,
        status: 'accepted',
        data: { brand: 'Honda', model: 'Accord', year: 2024, price: 36000, financingType: 'cash', image: DEFAULT_CAR_IMAGE }
      }
    ],
    contracts: [
      {
        id: 'contract-11-1',
        contractDate: createDateOffset(-20),
        contractNotes: 'Signed',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-20),
        version: 1,
        status: 'signed'
      }
    ],
    tags: [],
    value: 36000,
    expectedCloseDate: null,
    assignee: 'David Miller',
    createdAt: createDateOffset(-30),
    lastActivity: createDateOffset(-4),
    nextActionDue: null,
    closedDate: createDateOffset(-20),
    contractDate: createDateOffset(-20),
    deliveryDate: createDateOffset(-8),
    actualDeliveryDate: createDateOffset(-5),
    scheduledAppointment: null
  },

  // 15. Qualified – no appointment
  {
    id: 15,
    customerId: 17,
    source: 'Walk-in',
    sourceDetails: 'Showroom visit',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Genesis', 'GV60', 2024, 65000, { vin: 'WBADT43452G123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['EV'],
    value: 65000,
    expectedCloseDate: createDateOffset(14),
    assignee: 'Sarah Jenkins',
    createdAt: createHourOffset(-6),
    lastActivity: createHourOffset(-2),
    nextActionDue: createDateOffset(3),
    scheduledAppointment: null
  },

  // OOFB: Qualified, no offers, 10 days old (7–13 day threshold, banner showcase)
  {
    id: 23,
    customerId: 1,
    source: 'Website',
    sourceDetails: 'Contact form',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('BMW', '4 Series', 2024, 52000, { vin: 'WBA4B1C50FK123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 52000,
    expectedCloseDate: createDateOffset(14),
    assignee: 'David Miller',
    createdAt: createDateOffset(-10),
    lastActivity: createDateOffset(-9),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: null
  },

  // UFB: Qualified, no offers, 16 days old (14+ day threshold, banner showcase)
  {
    id: 24,
    customerId: 2,
    source: 'Google Ads',
    sourceDetails: 'Summer Campaign',
    fiscalEntity: 'MotorK',
    requestType: 'Test Drive',
    requestedCar: baseRequestedCar('Mercedes-Benz', 'E-Class', 2024, 62000, { vin: 'WDD2130411A123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 62000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-16),
    lastActivity: createDateOffset(-15),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: null
  },

  // 16. In Negotiation - Offer Sent (additional)
  {
    id: 16,
    customerId: 20,
    source: 'Google Ads',
    sourceDetails: 'Summer Campaign',
    fiscalEntity: 'MotorK',
    requestType: 'Test Drive',
    requestedCar: baseRequestedCar('Polestar', '2', 2024, 55000, { vin: 'YV1EZFA2XN5123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-16',
        createdAt: createHourOffset(-4),
        vehicleBrand: 'Polestar',
        vehicleModel: '2',
        vehicleYear: 2024,
        price: 55000,
        status: 'active',
        data: { brand: 'Polestar', model: '2', year: 2024, price: 55000, financingType: 'cash', image: DEFAULT_CAR_IMAGE }
      }
    ],
    tags: [],
    value: 55000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'David Miller',
    createdAt: createHourOffset(-8),
    lastActivity: createHourOffset(-1),
    nextActionDue: createDateOffset(2),
    scheduledAppointment: null
  },

  // 17. In Negotiation - Contract Pending (additional)
  {
    id: 17,
    customerId: 21,
    source: 'Website',
    sourceDetails: 'Contact form',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Audi', 'e-tron', 2024, 78000, { vin: 'WAUZZZ8V9LA123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-17',
        createdAt: createDateOffset(-6),
        vehicleBrand: 'Audi',
        vehicleModel: 'e-tron',
        vehicleYear: 2024,
        price: 78000,
        status: 'accepted',
        data: { brand: 'Audi', model: 'e-tron', year: 2024, price: 78000, financingType: 'financing', image: DEFAULT_CAR_IMAGE }
      }
    ],
    contracts: [
      {
        id: 'contract-17-1',
        contractDate: createDateOffset(-2),
        contractNotes: 'Pending customer signature',
        contractSigned: false,
        version: 1,
        status: 'pending'
      }
    ],
    tags: ['Premium'],
    value: 78000,
    expectedCloseDate: createDateOffset(5),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-12),
    lastActivity: createHourOffset(-2),
    nextActionDue: createDateOffset(1),
    contractDate: createDateOffset(-2),
    scheduledAppointment: null
  },

  // 18. Closed Won – no delivery date (additional)
  {
    id: 18,
    customerId: 22,
    source: 'Facebook',
    sourceDetails: 'Auto campaign',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Cupra', 'Formentor', 2024, 42000, { vin: 'WVWZZZ3CZWE123457' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: null,
    offers: [
      {
        id: 'offer-18',
        createdAt: createDateOffset(-20),
        vehicleBrand: 'Cupra',
        vehicleModel: 'Formentor',
        vehicleYear: 2024,
        price: 42000,
        status: 'accepted',
        data: { brand: 'Cupra', model: 'Formentor', year: 2024, price: 42000, financingType: 'cash', image: DEFAULT_CAR_IMAGE }
      }
    ],
    contracts: [
      {
        id: 'contract-18-1',
        contractDate: createDateOffset(-5),
        contractNotes: 'Signed',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-5),
        version: 1,
        status: 'signed'
      }
    ],
    tags: [],
    value: 42000,
    expectedCloseDate: null,
    assignee: 'David Miller',
    createdAt: createDateOffset(-25),
    lastActivity: createDateOffset(-4),
    nextActionDue: createDateOffset(2),
    closedDate: createDateOffset(-5),
    contractDate: createDateOffset(-5),
    deliveryDate: null,
    scheduledAppointment: null
  },

  // 19. Closed Lost (additional)
  {
    id: 19,
    customerId: 23,
    source: '3rd Party',
    sourceDetails: 'Aggregator',
    fiscalEntity: '',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Alfa Romeo', 'Giulia', 2024, 52000, { vin: 'ZARFAEEB0N7123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Lost',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-19',
        createdAt: createDateOffset(-10),
        vehicleBrand: 'Alfa Romeo',
        vehicleModel: 'Giulia',
        vehicleYear: 2024,
        price: 52000,
        status: 'archived',
        data: { brand: 'Alfa Romeo', model: 'Giulia', year: 2024, price: 52000, financingType: 'financing', image: DEFAULT_CAR_IMAGE }
      }
    ],
    tags: [],
    value: 52000,
    lostReason: 'Financing fell through',
    expectedCloseDate: null,
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-15),
    lastActivity: createDateOffset(-8),
    nextActionDue: createDateOffset(-5),
    closedDate: createDateOffset(-8),
    scheduledAppointment: null
  },

  // 20a. Duplicate candidate – same customer + same vehicle as Opp 1 (BMW 3 Series)
  {
    id: 21,
    customerId: 1,
    source: 'Website',
    sourceDetails: 'Contact form',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('BMW', '3 Series', 2024, 45000),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 45000,
    expectedCloseDate: createDateOffset(14),
    assignee: 'Salsabeel Khaleel',
    createdAt: createHourOffset(-1),
    lastActivity: createHourOffset(-1),
    nextActionDue: createHourOffset(8),
    scheduledAppointment: null
  },

  // 20b. Duplicate candidate – same customer + same vehicle as Opp 2 (Audi A4)
  {
    id: 22,
    customerId: 2,
    source: 'Website',
    sourceDetails: 'Lead form',
    fiscalEntity: 'MotorK',
    requestType: 'Test Drive',
    requestedCar: baseRequestedCar('Audi', 'A4', 2024, 42000, { vin: 'WAUZZZ8V9KA123457' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 42000,
    expectedCloseDate: createDateOffset(10),
    assignee: 'Sarah Jenkins',
    createdAt: createHourOffset(-2),
    lastActivity: createHourOffset(-2),
    nextActionDue: createHourOffset(12),
    scheduledAppointment: null
  },

  // 25. NS (No-Show): Appointment Scheduled – appointment in the past, not completed (Mark No-Show task)
  {
    id: 25,
    customerId: 25,
    source: 'Website',
    sourceDetails: 'Contact form',
    fiscalEntity: 'MotorK',
    requestType: 'Test Drive',
    requestedCar: baseRequestedCar('Hyundai', 'Ioniq 6', 2024, 48000, { vin: 'KM8J3CA46NU123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['EV'],
    value: 48000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-5),
    lastActivity: createDateOffset(-2),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: {
      id: 25,
      start: createDateTimeOffset(-1, 10, 0),
      end: createDateTimeOffset(-1, 11, 0),
      type: 'Test Drive',
      assignee: 'Sarah Jenkins',
      customerId: 25,
      opportunityId: 25,
      duration: 60,
      status: 'confirmed',
      noShowCount: 0,
      lastNoShowDate: null
    }
  },

  // 26. DFB (Contract Pending): delivery date set and passed – DFB task + Close Won action
  {
    id: 26,
    customerId: 26,
    source: 'Phone',
    sourceDetails: '',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: baseRequestedCar('Skoda', 'Octavia', 2024, 35000, { vin: 'TMBJJ9NE3N0123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-26',
        createdAt: createDateOffset(-12),
        vehicleBrand: 'Skoda',
        vehicleModel: 'Octavia',
        vehicleYear: 2024,
        price: 35000,
        status: 'accepted',
        data: { brand: 'Skoda', model: 'Octavia', year: 2024, price: 35000, financingType: 'cash', image: DEFAULT_CAR_IMAGE }
      }
    ],
    contracts: [
      {
        id: 'contract-26-1',
        contractDate: createDateOffset(-8),
        contractNotes: 'Signed',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-8),
        version: 1,
        status: 'signed'
      }
    ],
    tags: [],
    value: 35000,
    expectedCloseDate: createDateOffset(3),
    assignee: 'David Miller',
    createdAt: createDateOffset(-20),
    lastActivity: createDateOffset(-4),
    nextActionDue: createDateOffset(1),
    contractDate: createDateOffset(-8),
    deliveryDate: createDateTimeOffset(-5, 14, 0),
    deliveryLocation: 'At Dealership',
    deliveryNotes: 'Customer to collect',
    actualDeliveryDate: null,
    scheduledAppointment: null
  },

  // 20. Abandoned (additional)
  {
    id: 20,
    customerId: 24,
    source: 'Website',
    sourceDetails: 'Contact form',
    fiscalEntity: '',
    requestType: 'Generic sales',
    requestedCar: baseRequestedCar('DS', '4', 2024, 45000, { vin: 'VR3UHZKX1NM123456' }),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Abandoned',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 45000,
    expectedCloseDate: createHourOffset(48),
    assignee: 'David Miller',
    createdAt: createHourOffset(-12),
    lastActivity: createHourOffset(-8),
    nextActionDue: createHourOffset(24),
    scheduledAppointment: null
  }
]
