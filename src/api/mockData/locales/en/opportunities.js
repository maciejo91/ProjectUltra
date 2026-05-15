import {
  createDateOffset,
  createDateString,
  createDateTimeOffset,
  createHourOffset,
  DEMO_CUSTOMER_REQUEST_MESSAGE
} from '@/utils/mockDataHelpers'
import { crmVehicleForLeadSlot, toRequestedCar } from '@/api/mockData/crmVehicles'

/**
 * English mock opportunities – one per display stage/status for the state machine.
 * No duplicates; simplified set for default (EN) mock.
 */

function oppRequestedCar(oppId, extra = {}) {
  return toRequestedCar(crmVehicleForLeadSlot(Number(oppId) - 1), {
    requestMessage: DEMO_CUSTOMER_REQUEST_MESSAGE,
    expectedPurchaseDate: createDateString(30),
    dealership: 'Munich Downtown',
    ...extra
  })
}

function offerVehicleFields(oppId) {
  const v = crmVehicleForLeadSlot(Number(oppId) - 1)
  const car = toRequestedCar(v)
  return {
    vehicleBrand: v.brand,
    vehicleModel: v.model,
    vehicleYear: v.year,
    price: v.price,
    data: {
      brand: v.brand,
      model: v.model,
      year: v.year,
      price: v.price,
      image: car.image
    }
  }
}

function buildOffer(oppId, offerId, status, financingType, createdAt) {
  const fields = offerVehicleFields(oppId)
  return {
    id: offerId,
    createdAt,
    ...fields,
    status,
    data: { ...fields.data, financingType }
  }
}

export function buildMockOpportunities() {
  return [
  // 1. Awaiting Appointment – Qualified, no appointment
  {
    id: 1,
    customerId: 1,
    source: 'Walk-in',
    channel: 'Showroom',
    sourceDetails: 'Showroom visit',
    fiscalEntity: 'MotorK',
    requestType: 'Quotation',
    requestedCar: oppRequestedCar(1),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Hot'],
    value: 18900,
    expectedCloseDate: createHourOffset(22),
    assignee: 'Matteo Greco',
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
    requestedCar: oppRequestedCar(2),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 14800,
    expectedCloseDate: createHourOffset(18),
    assignee: 'Sara Marino',
    createdAt: createHourOffset(-4),
    lastActivity: createHourOffset(-2),
    nextActionDue: createHourOffset(6),
    scheduledAppointment: {
      id: 2,
      start: createHourOffset(8),
      end: createHourOffset(9),
      type: 'Consultation',
      assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(12),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 14800,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Sara Marino',
    createdAt: createDateOffset(-2),
    lastActivity: createDateOffset(-1),
    nextActionDue: createDateTimeOffset(5, 10, 0),
    scheduledAppointment: {
      id: 12,
      start: createDateTimeOffset(5, 10, 0),
      end: createDateTimeOffset(5, 11, 0),
      type: 'Test Drive',
      assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(3),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        ...buildOffer(3, 'offer-3', 'active', 'cash', createDateOffset(-8))
      }
    ],
    tags: [],
    value: 14800,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(4),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        ...buildOffer(4, 'offer-4', 'accepted', 'cash', createDateOffset(-12))
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
    value: 46000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(5),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: null,
    offers: [
      {
        ...buildOffer(5, 'offer-5', 'accepted', 'cash', createDateOffset(-20))
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
    value: 24100,
    expectedCloseDate: null,
    assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(6),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Lost',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        ...buildOffer(6, 'offer-6', 'archived', 'financing', createDateOffset(-12))
      }
    ],
    tags: ['Premium'],
    value: 28400,
    lostReason: 'Went with competitor',
    expectedCloseDate: null,
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(7),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Abandoned',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 46000,
    expectedCloseDate: createHourOffset(24),
    assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(8),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Feedback',
    offers: [
      {
        ...buildOffer(8, 'offer-8', 'active', 'cash', createDateOffset(-10))
      }
    ],
    tags: [],
    value: 32500,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(14),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Awaiting Offer',
    offers: [],
    tags: [],
    value: 46000,
    expectedCloseDate: createDateOffset(10),
    assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(13),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Awaiting Offer',
    offers: [],
    tags: ['Hot'],
    value: 39500,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(9),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Feedback',
    offers: [
      {
        ...buildOffer(9, 'offer-9', 'active', 'cash', createDateOffset(-4)),
        acceptance_status: 'pending'
      }
    ],
    tags: [],
    value: 42100,
    expectedCloseDate: createDateOffset(14),
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(10),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Awaiting Delivery',
    offers: [
      {
        ...buildOffer(10, 'offer-10', 'accepted', 'cash', createDateOffset(-15))
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
    value: 28400,
    expectedCloseDate: null,
    assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(11),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Delivered',
    offers: [
      {
        ...buildOffer(11, 'offer-11', 'accepted', 'cash', createDateOffset(-25))
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
    value: 24900,
    expectedCloseDate: null,
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(15),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['EV'],
    value: 42100,
    expectedCloseDate: createDateOffset(14),
    assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(23),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 24100,
    expectedCloseDate: createDateOffset(14),
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(24),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 46000,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(16),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        ...buildOffer(16, 'offer-16', 'active', 'cash', createHourOffset(-4))
      }
    ],
    tags: [],
    value: 28400,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(17),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        ...buildOffer(17, 'offer-17', 'accepted', 'financing', createDateOffset(-6))
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
    value: 24900,
    expectedCloseDate: createDateOffset(5),
    assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(18),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: null,
    offers: [
      {
        ...buildOffer(18, 'offer-18', 'accepted', 'cash', createDateOffset(-20))
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
    value: 39500,
    expectedCloseDate: null,
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(19),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Lost',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        ...buildOffer(19, 'offer-19', 'archived', 'financing', createDateOffset(-10))
      }
    ],
    tags: [],
    value: 43800,
    lostReason: 'Financing fell through',
    expectedCloseDate: null,
    assignee: 'Sara Marino',
    createdAt: createDateOffset(-15),
    lastActivity: createDateOffset(-8),
    nextActionDue: null,
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
    requestedCar: oppRequestedCar(1),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 18900,
    expectedCloseDate: createDateOffset(14),
    assignee: 'Matteo Alpino',
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
    requestedCar: oppRequestedCar(2),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 14800,
    expectedCloseDate: createDateOffset(10),
    assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(25),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['EV'],
    value: 32500,
    expectedCloseDate: createDateOffset(7),
    assignee: 'Sara Marino',
    createdAt: createDateOffset(-5),
    lastActivity: createDateOffset(-2),
    nextActionDue: createDateOffset(1),
    scheduledAppointment: {
      id: 25,
      start: createDateTimeOffset(-1, 10, 0),
      end: createDateTimeOffset(-1, 11, 0),
      type: 'Test Drive',
      assignee: 'Sara Marino',
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
    requestedCar: oppRequestedCar(26),
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        ...buildOffer(26, 'offer-26', 'accepted', 'cash', createDateOffset(-12))
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
    value: 28400,
    expectedCloseDate: createDateOffset(3),
    assignee: 'Davide Rinaldi',
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
    requestedCar: oppRequestedCar(20),
    vehicle: null,
    selectedVehicle: null,
    stage: 'Abandoned',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 43800,
    expectedCloseDate: createHourOffset(48),
    assignee: 'Davide Rinaldi',
    createdAt: createHourOffset(-12),
    lastActivity: createHourOffset(-8),
    nextActionDue: createHourOffset(24),
    scheduledAppointment: null
  }
  ]
}
