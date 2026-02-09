import { createDateOffset, createDateString, createDateTimeOffset } from '@/utils/mockDataHelpers'

export const mockOpportunities = [
  // 1. Opportunity - Awaiting Appointment (Qualified, no scheduled appointment)
  {
    id: 100,
    customerId: 1,
    requestedCar: { 
      brand: 'BMW', 
      model: '3 Series', 
      year: 2024, 
      price: 45000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 5,
      requestMessage: 'What are the financing options for the 3 Series?',
      vin: 'WBA3B1C50EK123456'
    },
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
    scheduledAppointment: null,
    tradeIns: [
      { id: 't1', label: '2015 Mercedes', valuation: 8000 },
      { id: 't2', label: '2018 VW', valuation: 6000 }
    ],
    financingOptions: [
      { id: 'f1', label: 'Cash' },
      { id: 'f2', label: 'Loan 48 months', termMonths: 48 },
      { id: 'f3', label: 'Leasing 36 months', termMonths: 36 }
    ],
    taskStatusBadge: 'Active now on website'
  },

  // 2. Opportunity - In Negotiation, appointment TODAY (not "Appointment Scheduled" status); Manage Appointment card shows last
  {
    id: 1,
    customerId: 2,
    requestedCar: { 
      brand: 'Audi', 
      model: 'A4', 
      year: 2024, 
      price: 42000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 8,
      requestMessage: 'What is the warranty coverage on this vehicle?',
      vin: 'WAUZZZ8V9KA123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-1',
        createdAt: createDateOffset(-3),
        vehicleBrand: 'Audi',
        vehicleModel: 'A4',
        vehicleYear: 2024,
        price: 42000,
        status: 'active',
        data: {
          brand: 'Audi',
          model: 'A4',
          year: 2024,
          price: 42000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: [],
    value: 42000,
    expectedCloseDate: createDateString(25),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-5),
    lastActivity: createDateOffset(-2),
    scheduledAppointment: {
      id: 10,
      start: createDateTimeOffset(0, 14, 0),
      end: createDateTimeOffset(0, 15, 0),
      type: 'Test Drive',
      assignee: 'Sarah Jenkins',
      customerId: 2,
      opportunityId: 1,
      duration: 60,
      status: 'confirmed',
      noShowCount: 0,
      lastNoShowDate: null
    },
    tradeIns: [
      { id: 't1', label: '2015 Mercedes', valuation: 8000 },
      { id: 't2', label: '2018 VW', valuation: 6000 }
    ],
    financingOptions: [
      { id: 'f1', label: 'Cash' },
      { id: 'f2', label: 'Loan 48 months', termMonths: 48 },
      { id: 'f3', label: 'Leasing 36 months', termMonths: 36 }
    ],
    taskStatusBadge: 'Active Campaign - Summer Deals'
  },

  // 3. Opportunity - 1st No Show
  {
    id: 3,
    customerId: 3,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'C-Class', 
      year: 2023, 
      price: 48000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 5000,
      status: 'Used',
      stockDays: 20,
      vin: 'WDDWF4KB0KR123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Premium'],
    value: 48000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 20)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'David Miller',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    scheduledAppointment: {
      id: 20,
      start: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 3)
        date.setHours(10, 0, 0, 0)
        return date.toISOString()
      })(),
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 3)
        date.setHours(11, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'Consultation',
      assignee: 'David Miller',
      customerId: 3,
      opportunityId: 3,
      duration: 60,
      status: 'confirmed',
      noShowCount: 1,
      lastNoShowDate: (() => {
        const date = new Date()
        date.setDate(date.getDate() - 5)
        return date.toISOString()
      })()
    },
    tradeIns: [
      { id: 't1', label: '2014 BMW 3 Series', valuation: 11000 },
      { id: 't2', label: '2017 Mercedes A-Class', valuation: 8500 }
    ],
    financingOptions: [
      { id: 'f1', label: 'Cash' },
      { id: 'f2', label: 'Loan 48 months', termMonths: 48 },
      { id: 'f3', label: 'Leasing 36 months', termMonths: 36 }
    ]
  },

  // 4. Opportunity - Closed Lost (had offers, went with competitor)
  {
    id: 16,
    customerId: 5,
    requestedCar: { 
      brand: 'Porsche', 
      model: 'Cayenne', 
      year: 2024, 
      price: 95000,
      image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 30,
      vin: 'WP0ZZZ9XZPS123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Lost',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-lost-16-1',
        createdAt: createDateOffset(-12),
        vehicleBrand: 'Porsche',
        vehicleModel: 'Cayenne',
        vehicleYear: 2024,
        price: 95000,
        status: 'archived',
        data: {
          brand: 'Porsche',
          model: 'Cayenne',
          year: 2024,
          price: 95000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-lost-16-2',
        createdAt: createDateOffset(-18),
        vehicleBrand: 'Porsche',
        vehicleModel: 'Cayenne',
        vehicleYear: 2024,
        price: 92000,
        status: 'archived',
        data: {
          brand: 'Porsche',
          model: 'Cayenne',
          year: 2024,
          price: 92000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Premium'],
    value: 95000,
    lostReason: 'Went with competitor',
    expectedCloseDate: null,
    assignee: 'David Miller',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      return date.toISOString()
    })(),
    closedDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      return date.toISOString()
    })(),
    tradeIns: [
      { id: 't1', label: '2018 Porsche Macan', valuation: 42000 },
      { id: 't2', label: '2020 Audi Q5', valuation: 35000 }
    ],
    financingOptions: [
      { id: 'f1', label: 'Cash' },
      { id: 'f2', label: 'Loan 48 months', termMonths: 48 },
      { id: 'f3', label: 'Leasing 36 months', termMonths: 36 }
    ]
  },

  // 7. Opportunity - In Negotiation - Offer Sent; appointment TODAY (not "Appointment Scheduled"); Manage Appointment last
  {
    id: 33,
    customerId: 7,
    requestedCar: { 
      brand: 'BMW', 
      model: 'X5', 
      year: 2024, 
      price: 75000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 12,
      vin: 'WBA5R7C05NG123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-2',
        createdAt: createDateOffset(-4),
        vehicleBrand: 'BMW',
        vehicleModel: 'X5',
        vehicleYear: 2024,
        price: 75000,
        status: 'active',
        data: {
          brand: 'BMW',
          model: 'X5',
          year: 2024,
          price: 75000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-2-archived-1',
        createdAt: createDateOffset(-7),
        vehicleBrand: 'BMW',
        vehicleModel: 'X5',
        vehicleYear: 2024,
        price: 78000,
        status: 'archived',
        data: {
          brand: 'BMW',
          model: 'X5',
          year: 2024,
          price: 78000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Premium'],
    value: 75000,
    expectedCloseDate: createDateString(15),
    assignee: 'David Miller',
    createdAt: createDateOffset(-12),
    lastActivity: createDateOffset(-6),
    scheduledAppointment: {
      id: 331,
      start: createDateTimeOffset(0, 10, 0),
      end: createDateTimeOffset(0, 11, 0),
      type: 'Consultation',
      assignee: 'David Miller',
      customerId: 7,
      opportunityId: 33,
      duration: 60,
      status: 'confirmed',
      noShowCount: 0,
      lastNoShowDate: null
    },
    tradeIns: [
      { id: 't1', label: '2019 BMW X3', valuation: 28000 },
      { id: 't2', label: '2020 VW Tiguan', valuation: 19500 }
    ],
    financingOptions: [
      { id: 'f1', label: 'Cash' },
      { id: 'f2', label: 'Loan 48 months', termMonths: 48 },
      { id: 'f3', label: 'Leasing 36 months', termMonths: 36 }
    ]
  },

  // 7. Opportunity - In Negotiation - Contract Pending - Awaiting Contract Feedback (contract date 7+ days ago)
  {
    id: 22,
    customerId: 9,
    requestedCar: { 
      brand: 'Porsche', 
      model: '911', 
      year: 2024, 
      price: 125000,
      image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Manual',
      kilometers: 0,
      status: 'New',
      stockDays: 8,
      vin: 'WP0ZZZ99ZPS234567'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent', // Contract Pending is determined by contractDate presence in stage mapper
    offers: [
      {
        id: 'offer-4',
        createdAt: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 20)
          return date.toISOString()
        })(),
        vehicleBrand: 'Porsche',
        vehicleModel: '911',
        vehicleYear: 2024,
        price: 125000,
        status: 'accepted',
        data: {
          brand: 'Porsche',
          model: '911',
          year: 2024,
          price: 125000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Premium', 'Performance'],
    value: 125000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'David Miller',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 35)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 8)
      return date.toISOString()
    })(),
    contractDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 8)
      return date.toISOString()
    })(),
    scheduledAppointment: null
  },

  // 8. Opportunity - Closed Won - Delivered (contract signed, delivered, awaiting feedback)
  {
    id: 10,
    customerId: 11,
    requestedCar: { 
      brand: 'Porsche', 
model: 'Macan',
      year: 2024,
      price: 85000,
      image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 0,
      vin: 'WP0ZZZ9YZPS345678'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Delivered',
    offers: [
      {
        id: 'offer-10-1',
        createdAt: createDateOffset(-25),
        vehicleBrand: 'Porsche',
        vehicleModel: 'Macan',
        vehicleYear: 2024,
        price: 85000,
        status: 'accepted',
        data: {
          brand: 'Porsche',
          model: 'Macan',
          year: 2024,
          price: 85000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-10-archived',
        createdAt: createDateOffset(-30),
        vehicleBrand: 'Porsche',
        vehicleModel: 'Macan',
        vehicleYear: 2024,
        price: 88000,
        status: 'archived',
        data: {
          brand: 'Porsche',
          model: 'Macan',
          year: 2024,
          price: 88000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-10-1',
        contractDate: createDateOffset(-22),
        contractNotes: 'Final contract signed by customer.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-22),
        version: 2,
        status: 'signed'
      },
      {
        id: 'contract-10-v1',
        contractDate: createDateOffset(-25),
        contractNotes: 'Initial draft, replaced by version 2.',
        contractSigned: false,
        version: 1,
        status: 'void'
      }
    ],
    tags: ['Premium'],
    value: 85000,
    expectedCloseDate: null,
    assignee: 'David Miller',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 60)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    closedDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 20)
      return date.toISOString()
    })(),
    contractDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 22)
      return date.toISOString()
    })(),
    deliveryDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    deliveredDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    scheduledAppointment: null
  },

  // 11. Opportunity - In Negotiation - Offer Sent (multiple offers, 6+ days old)
  {
    id: 36,
    customerId: 13,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'E-Class', 
      year: 2024, 
      price: 62000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 18,
      vin: 'WDD2GA4E78K123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-5',
        createdAt: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 6)
          return date.toISOString()
        })(),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'E-Class',
        vehicleYear: 2024,
        price: 62000,
        status: 'active',
        data: {
          brand: 'Mercedes-Benz',
          model: 'E-Class',
          year: 2024,
          price: 62000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-5-archived-1',
        createdAt: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 10)
          return date.toISOString()
        })(),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'E-Class',
        vehicleYear: 2024,
        price: 64000,
        status: 'archived',
        data: {
          brand: 'Mercedes-Benz',
          model: 'E-Class',
          year: 2024,
          price: 64000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-5-archived-2',
        createdAt: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 12)
          return date.toISOString()
        })(),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'E-Class',
        vehicleYear: 2024,
        price: 65000,
        status: 'archived',
        data: {
          brand: 'Mercedes-Benz',
          model: 'E-Class',
          year: 2024,
          price: 65000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: [],
    value: 62000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 22)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'David Miller',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 20)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 6)
      return date.toISOString()
    })(),
    scheduledAppointment: null
  },

  // 12. Opportunity - Abandoned (inactive for 30+ days)
  {
    id: 37,
    customerId: 14,
    requestedCar: { 
      brand: 'Jaguar', 
      model: 'F-Pace', 
      year: 2024, 
      price: 72000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'London',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 25,
      vin: 'SALWA2FK4LA123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 72000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 35)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'Sarah Jenkins',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 45)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 35)
      return date.toISOString()
    })(),
    scheduledAppointment: null
  },

  // 13. Opportunity - Closed Won - Awaiting Delivery (contract signed, delivery scheduled)
  {
    id: 38,
    customerId: 15,
    requestedCar: { 
      brand: 'Audi', 
      model: 'A6', 
      year: 2024, 
      price: 58000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 3,
      vin: 'WAUZZZ4G5EN123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Awaiting Delivery',
    offers: [
      {
        id: 'offer-6',
        createdAt: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 25)
          return date.toISOString()
        })(),
        vehicleBrand: 'Audi',
        vehicleModel: 'A6',
        vehicleYear: 2024,
        price: 58000,
        status: 'accepted',
        data: {
          brand: 'Audi',
          model: 'A6',
          year: 2024,
          price: 58000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-6-archived',
        createdAt: createDateOffset(-30),
        vehicleBrand: 'Audi',
        vehicleModel: 'A6',
        vehicleYear: 2024,
        price: 60000,
        status: 'archived',
        data: {
          brand: 'Audi',
          model: 'A6',
          year: 2024,
          price: 60000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-38-1',
        contractDate: createDateOffset(-10),
        contractNotes: 'Final signed contract.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-10),
        version: 2,
        status: 'signed'
      },
      {
        id: 'contract-38-v1',
        contractDate: createDateOffset(-15),
        contractNotes: 'Draft version.',
        contractSigned: false,
        version: 1,
        status: 'void'
      }
    ],
    tags: [],
    value: 58000,
    expectedCloseDate: null,
    assignee: 'Sarah Jenkins',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 50)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    closedDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    contractDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    deliveryDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      return date.toISOString().split('T')[0]
    })(),
    scheduledAppointment: null
  },

  // 14. Opportunity - Closed Won - No Delivery Date (contract signed, awaiting delivery scheduling)
  {
    id: 39,
    customerId: 16,
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'Golf', 
      year: 2024, 
      price: 32000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Hamburg',
      fuelType: 'Petrol',
      gearType: 'Manual',
      kilometers: 0,
      status: 'New',
      stockDays: 7,
      vin: 'WVWZZZ3CZWE123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: null,
    offers: [
      {
        id: 'offer-7',
        createdAt: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 5)
          return date.toISOString()
        })(),
        vehicleBrand: 'Volkswagen',
        vehicleModel: 'Golf',
        vehicleYear: 2024,
        price: 32000,
        status: 'accepted',
        data: {
          brand: 'Volkswagen',
          model: 'Golf',
          year: 2024,
          price: 32000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-7-archived',
        createdAt: createDateOffset(-10),
        vehicleBrand: 'Volkswagen',
        vehicleModel: 'Golf',
        vehicleYear: 2024,
        price: 34000,
        status: 'archived',
        data: {
          brand: 'Volkswagen',
          model: 'Golf',
          year: 2024,
          price: 34000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-39-1',
        contractDate: createDateOffset(-3),
        contractNotes: 'Signed at the dealership.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-3),
        version: 1,
        status: 'signed'
      },
      {
        id: 'contract-39-preview',
        contractDate: createDateOffset(-5),
        contractNotes: 'Initial preview.',
        contractSigned: false,
        version: 0,
        status: 'void'
      }
    ],
    tags: [],
    value: 32000,
    expectedCloseDate: null,
    assignee: 'Sarah Jenkins',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    closedDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    contractDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    deliveryDate: null,
    scheduledAppointment: null
  },

  // 15. Opportunity - Qualified with recent appointment (just scheduled)
  {
    id: 40,
    customerId: 17,
    requestedCar: { 
      brand: 'Tesla', 
      model: 'Model 3', 
      year: 2024, 
      price: 45000,
      image: 'https://images.unsplash.com/photo-1560955129-430f661a81ed?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 2,
      vin: '5YJ3E1EA1NF123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Electric', 'Hot'],
    value: 45000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 20)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'Sarah Jenkins',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 2)
      return date.toISOString()
    })(),
    scheduledAppointment: {
      id: 40,
      start: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        date.setHours(10, 0, 0, 0)
        return date.toISOString()
      })(),
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 1)
        date.setHours(11, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'Test Drive',
      assignee: 'Sarah Jenkins',
      customerId: 17,
      opportunityId: 40,
      duration: 60,
      status: 'confirmed',
      noShowCount: 0,
      lastNoShowDate: null
    }
  },

  // 16. Opportunity - In Negotiation - Offer Sent (recent offer, just created)
  {
    id: 41,
    customerId: 18,
    requestedCar: { 
      brand: 'Volvo', 
      model: 'XC60', 
      year: 2024, 
      price: 55000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stockholm',
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 10,
      vin: 'YV1LS56A1X1123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-8',
        createdAt: (() => {
          const date = new Date()
          date.setHours(date.getHours() - 2)
          return date.toISOString()
        })(),
        vehicleBrand: 'Volvo',
        vehicleModel: 'XC60',
        vehicleYear: 2024,
        price: 55000,
        status: 'active',
        data: {
          brand: 'Volvo',
          model: 'XC60',
          year: 2024,
          price: 55000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Premium'],
    value: 55000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 18)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'David Miller',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 2)
      return date.toISOString()
    })(),
    scheduledAppointment: null
  },

  // 17. Opportunity - In Negotiation - Contract Pending (recent contract, just created)
  {
    id: 42,
    customerId: 19,
    requestedCar: { 
      brand: 'Lexus', 
      model: 'RX', 
      year: 2024, 
      price: 68000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Tokyo',
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 4,
      vin: 'JTJHY7AX0K4123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-9',
        createdAt: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 10)
          return date.toISOString()
        })(),
        vehicleBrand: 'Lexus',
        vehicleModel: 'RX',
        vehicleYear: 2024,
        price: 68000,
        status: 'accepted',
        acceptance_status: 'accepted',
        data: {
          brand: 'Lexus',
          model: 'RX',
          year: 2024,
          price: 68000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Premium', 'Luxury'],
    value: 68000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'Sarah Jenkins',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 20)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 1)
      return date.toISOString()
    })(),
    contractDate: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 1)
      return date.toISOString()
    })(),
    scheduledAppointment: null
  },

  // 18. Opportunity - Closed Won - Awaiting Delivery (delivery date in past, should trigger DFB)
  {
    id: 43,
    customerId: 20,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'S-Class', 
      year: 2024, 
      price: 120000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 0,
      vin: 'WBA3B1C50EK654321'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Awaiting Delivery',
    offers: [
      {
        id: 'offer-10',
        createdAt: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 30)
          return date.toISOString()
        })(),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'S-Class',
        vehicleYear: 2024,
        price: 120000,
        status: 'accepted',
        data: {
          brand: 'Mercedes-Benz',
          model: 'S-Class',
          year: 2024,
          price: 120000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-10-alt',
        createdAt: createDateOffset(-35),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'S-Class',
        vehicleYear: 2024,
        price: 125000,
        status: 'archived',
        data: {
          brand: 'Mercedes-Benz',
          model: 'S-Class',
          year: 2024,
          price: 125000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-43-1',
        contractDate: createDateOffset(-15),
        contractNotes: 'Premium service contract included.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-15),
        version: 1,
        status: 'signed'
      },
      {
        id: 'contract-43-draft',
        contractDate: createDateOffset(-20),
        contractNotes: 'Draft with initial terms.',
        contractSigned: false,
        version: 0.5,
        status: 'void'
      }
    ],
    tags: ['Premium', 'Luxury'],
    value: 120000,
    expectedCloseDate: null,
    assignee: 'David Miller',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 60)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 4)
      return date.toISOString()
    })(),
    closedDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 15)
      return date.toISOString()
    })(),
    contractDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 15)
      return date.toISOString()
    })(),
    deliveryDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 4)
      return date.toISOString().split('T')[0]
    })(),
    scheduledAppointment: null
  },

  // ============================================
  // ACCOUNT-LEVEL OPPORTUNITIES (for nested relationship demo)
  // ============================================
  
  // Opportunity for Ferrari Dealership Group (account-level, references Marco Rossini)
  {
    id: 201,
    customerId: 6, // Account ID
    account_id: 100,
    accountId: 100,
    contactId: 101, // Marco Rossini (master contact)
    contactName: 'Marco Rossini',
    requestedCar: {
      brand: 'Ferrari',
      model: 'F8 Tributo',
      year: 2024,
      price: 280000,
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&auto=format&fit=crop&q=60',
      dealership: 'Bologna',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 0,
      vin: 'ZFF79RHA5R1234567'
    },
    vehicle: {
      brand: 'Ferrari',
      model: 'F8 Tributo',
      year: 2024,
      price: 280000,
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0
    },
    selectedVehicle: {
      brand: 'Ferrari',
      model: 'F8 Tributo',
      year: 2024,
      price: 280000
    },
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-201',
        createdAt: createDateOffset(-3),
        vehicleBrand: 'Ferrari',
        vehicleModel: 'F8 Tributo',
        vehicleYear: 2024,
        price: 280000,
        status: 'active',
        data: {
          brand: 'Ferrari',
          model: 'F8 Tributo',
          year: 2024,
          price: 280000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Corporate', 'Fleet', 'Premium'],
    value: 280000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 15)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
    createdAt: '2025-03-10T10:00:00',
    lastActivity: '2025-03-25T14:00:00',
    scheduledAppointment: {
      id: 'appt-201',
      start: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 3)
        date.setHours(14, 0, 0, 0)
        return date.toISOString()
      })(),
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 3)
        date.setHours(15, 30, 0, 0)
        return date.toISOString()
      })(),
      type: 'test-drive',
      vehicle: 'Ferrari F8 Tributo'
    }
  },
  
  // Opportunity for Tech Solutions GmbH (account-level, references Thomas Schneider)
  {
    id: 202,
    customerId: 300, // Account ID
    account_id: 300,
    accountId: 300,
    contactId: 301, // Thomas Schneider (master contact)
    contactName: 'Thomas Schneider',
    requestedCar: {
      brand: 'BMW',
      model: '5 Series',
      year: 2024,
      price: 65000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 0,
      vin: 'ZFF79RHA5R1234567'
    },
    vehicle: {
      brand: 'BMW',
      model: '5 Series',
      year: 2024,
      price: 65000,
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      kilometers: 0
    },
    selectedVehicle: {
      brand: 'BMW',
      model: '5 Series',
      year: 2024,
      price: 65000
    },
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Corporate', 'Fleet'],
    value: 65000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 30)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'David Miller',
    assigneeInitials: 'DM',
    createdAt: '2025-03-15T09:00:00',
    lastActivity: '2025-03-24T16:00:00',
    scheduledAppointment: null
  },
  
  // Opportunity for Ferrari Dealership Group (account-level, references Giovanni Rossi)
  {
    id: 203,
    customerId: 6, // Account ID
    account_id: 100,
    accountId: 100,
    contactId: 102, // Giovanni Rossi (finance manager)
    contactName: 'Giovanni Rossi',
    requestedCar: {
      brand: 'Ferrari',
      model: 'SF90 Stradale',
      year: 2024,
      price: 450000,
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&auto=format&fit=crop&q=60',
      dealership: 'Bologna',
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 0,
      vin: 'ZFF79RHA5R1234567'
    },
    vehicle: {
      brand: 'Ferrari',
      model: 'SF90 Stradale',
      year: 2024,
      price: 450000,
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      kilometers: 0
    },
    selectedVehicle: {
      brand: 'Ferrari',
      model: 'SF90 Stradale',
      year: 2024,
      price: 450000
    },
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-203',
        createdAt: createDateOffset(-4),
        vehicleBrand: 'Ferrari',
        vehicleModel: 'SF90 Stradale',
        vehicleYear: 2024,
        price: 440000,
        status: 'active',
        data: {
          brand: 'Ferrari',
          model: 'SF90 Stradale',
          year: 2024,
          price: 440000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Corporate', 'Fleet', 'Premium', 'High-Value'],
    value: 450000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 20)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
    createdAt: '2025-03-12T10:00:00',
    lastActivity: '2025-03-24T16:00:00',
    scheduledAppointment: null
  },
  
  // ========================================
  // COMPREHENSIVE COVERAGE - All Stage/Date/Assignment Combinations
  // IDs 200-299 for systematic coverage
  // ========================================
  
  // 200-209: Qualified Stage Variations
  {
    id: 200,
    customerId: 1,
    requestedCar: { 
      brand: 'BMW', 
      model: '3 Series', 
      year: 2024, 
      price: 45000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 5,
      vin: 'WBA3B1C50EK789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 45000,
    expectedCloseDate: createDateString(-7), // Past date
    assignee: 'Salsabeel Khaleel',
    createdAt: createDateOffset(-10),
    lastActivity: createDateOffset(-7),
    scheduledAppointment: null
  },
  {
    id: 201,
    customerId: 2,
    requestedCar: { 
      brand: 'Audi', 
      model: 'A4', 
      year: 2024, 
      price: 42000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 8,
      vin: 'WAUZZZ8V9KA789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 42000,
    expectedCloseDate: createDateString(0), // Today
    assignee: null, // Unassigned
    createdAt: createDateOffset(-5),
    lastActivity: createDateOffset(-1),
    scheduledAppointment: null
  },
  {
    id: 202,
    customerId: 3,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'C-Class', 
      year: 2024, 
      price: 48000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 10,
      vin: 'YV1LS56A1X1123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 48000,
    expectedCloseDate: createDateString(14), // Future date
    assignee: 'David Miller',
    createdAt: createDateOffset(-3),
    lastActivity: createDateOffset(-1),
    scheduledAppointment: null
  },
  {
    id: 203,
    customerId: 4,
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'Golf', 
      year: 2024, 
      price: 32000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Hamburg',
      fuelType: 'Petrol',
      gearType: 'Manual',
      kilometers: 0,
      status: 'New',
      stockDays: 7,
      vin: 'WVWZZZ3CZWE123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 32000,
    expectedCloseDate: createDateString(30), // Future date
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-10), // 10 days ago - triggers OOFB (7-13 days)
    lastActivity: createDateOffset(-10),
    scheduledAppointment: null
  },
  {
    id: 204,
    customerId: 5,
    requestedCar: { 
      brand: 'BMW', 
      model: 'X3', 
      year: 2024, 
      price: 55000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 12,
      vin: 'WBA5R7C05NG789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 55000,
    expectedCloseDate: createDateString(45), // Future date
    assignee: 'Michael Thomas',
    createdAt: createDateOffset(-20), // 20 days ago - triggers UFB (14+ days)
    lastActivity: createDateOffset(-20),
    scheduledAppointment: null
  },
  {
    id: 205,
    customerId: 6,
    requestedCar: { 
      brand: 'Audi', 
      model: 'Q5', 
      year: 2024, 
      price: 60000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 15,
      vin: 'WAUZZZ4G8EN789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 60000,
    expectedCloseDate: createDateString(20), // Future date
    assignee: 'Salsabeel Khaleel',
    createdAt: createDateOffset(-2),
    lastActivity: createDateOffset(-1),
    scheduledAppointment: {
      id: 205,
      title: 'Test Drive Appointment',
      start: createDateOffset(3), // Future appointment
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 3)
        date.setHours(15, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'Audi Q5',
      assignee: 'Salsabeel Khaleel',
      assigneeId: 1,
      dealership: 'Frankfurt',
      team: 'Sales (New)',
      status: 'confirmed',
      noShowCount: 0
    }
  },
  {
    id: 206,
    customerId: 7,
    requestedCar: { 
      brand: 'Porsche', 
      model: 'Cayenne', 
      year: 2024, 
      price: 95000,
      image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 8,
      vin: 'WAUZZZ8V9KA789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Premium'],
    value: 95000,
    expectedCloseDate: createDateString(25), // Future date
    assignee: null, // Unassigned
    createdAt: createDateOffset(-1),
    lastActivity: createDateOffset(-1),
    scheduledAppointment: {
      id: 206,
      title: 'Consultation',
      start: createDateOffset(0), // Today appointment
      end: (() => {
        const date = new Date()
        date.setHours(15, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'Porsche Cayenne',
      assignee: null,
      assigneeId: null,
      dealership: 'Munich',
      team: 'Sales (New)',
      status: 'confirmed',
      noShowCount: 0
    }
  },
  {
    id: 207,
    customerId: 8,
    requestedCar: { 
      brand: 'BMW', 
      model: '5 Series', 
      year: 2024, 
      price: 65000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 6,
      vin: 'WBA5R9C08NG789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 65000,
    expectedCloseDate: createDateString(-5), // Past date
    assignee: 'David Miller',
    createdAt: createDateOffset(-8),
    lastActivity: createDateOffset(-3),
    scheduledAppointment: {
      id: 207,
      title: 'Past Appointment',
      start: createDateOffset(-5), // Past appointment
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() - 5)
        date.setHours(14, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'BMW 5 Series',
      assignee: 'David Miller',
      assigneeId: 3,
      dealership: 'Berlin',
      team: 'Sales (New)',
      status: 'no-show',
      noShowCount: 1
    }
  },
  
  // 210-219: Appointment Scheduled Variations
  {
    id: 210,
    customerId: 11,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'E-Class', 
      year: 2024, 
      price: 62000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 9,
      vin: 'WDD2GA4E79K789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 62000,
    expectedCloseDate: createDateString(20), // Future date
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-5),
    lastActivity: createDateOffset(-2),
    scheduledAppointment: {
      id: 210,
      title: 'Future Appointment',
      start: createDateOffset(5), // Future appointment
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 5)
        date.setHours(10, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'Mercedes-Benz E-Class',
      assignee: 'Sarah Jenkins',
      assigneeId: 2,
      dealership: 'Stuttgart',
      team: 'Sales (New)',
      status: 'confirmed',
      noShowCount: 0
    }
  },
  {
    id: 211,
    customerId: 12,
    requestedCar: { 
      brand: 'Audi', 
      model: 'A6', 
      year: 2024, 
      price: 58000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 11,
      vin: 'WAUZZZ4G5EN789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 58000,
    expectedCloseDate: createDateString(-10), // Past date
    assignee: null, // Unassigned
    createdAt: createDateOffset(-15),
    lastActivity: createDateOffset(-10),
    scheduledAppointment: {
      id: 211,
      title: 'Past No-Show Appointment',
      start: createDateOffset(-3), // Past appointment
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() - 3)
        date.setHours(11, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'Audi A6',
      assignee: null,
      assigneeId: null,
      dealership: 'Berlin',
      team: 'Sales (New)',
      status: 'no-show',
      noShowCount: 1,
      nsTaskCreatedAt: createDateOffset(-3)
    }
  },
  {
    id: 212,
    customerId: 13,
    requestedCar: { 
      brand: 'BMW', 
      model: 'X5', 
      year: 2024, 
      price: 75000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 14,
      vin: 'WBA5R7C05NG654321'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Premium'],
    value: 75000,
    expectedCloseDate: createDateString(0), // Today
    assignee: 'David Miller',
    createdAt: createDateOffset(-7),
    lastActivity: createDateOffset(-1),
    scheduledAppointment: {
      id: 212,
      title: 'Today Appointment',
      start: createDateOffset(0), // Today
      end: (() => {
        const date = new Date()
        date.setHours(14, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'BMW X5',
      assignee: 'David Miller',
      assigneeId: 3,
      dealership: 'Munich',
      team: 'Sales (New)',
      status: 'confirmed',
      noShowCount: 0
    }
  },
  {
    id: 213,
    customerId: 14,
    requestedCar: { 
      brand: 'Porsche', 
      model: 'Macan', 
      year: 2024, 
      price: 85000,
      image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 3,
      vin: 'WAUZZZ4G5EN123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Premium'],
    value: 85000,
    expectedCloseDate: createDateString(15), // Future date
    assignee: 'Salsabeel Khaleel',
    createdAt: createDateOffset(-12),
    lastActivity: createDateOffset(-5),
    scheduledAppointment: {
      id: 213,
      title: 'NS2 Appointment',
      start: createDateOffset(-8), // Past appointment
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() - 8)
        date.setHours(13, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'Porsche Macan',
      assignee: 'Salsabeel Khaleel',
      assigneeId: 1,
      dealership: 'Frankfurt',
      team: 'Sales (New)',
      status: 'no-show',
      noShowCount: 2,
      lastNoShowDate: createDateOffset(-8)
    }
  },
  {
    id: 214,
    customerId: 15,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'S-Class', 
      year: 2024, 
      price: 120000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 1,
      vin: '5YJ3E1EA1NF789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: ['Premium', 'Luxury'],
    value: 120000,
    expectedCloseDate: createDateString(10), // Future date
    assignee: 'David Miller',
    createdAt: createDateOffset(-20),
    lastActivity: createDateOffset(-10),
    scheduledAppointment: {
      id: 214,
      title: 'NS3 Appointment - Should Auto-Close',
      start: createDateOffset(-12), // Past appointment
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() - 12)
        date.setHours(15, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'Mercedes-Benz S-Class',
      assignee: 'David Miller',
      assigneeId: 3,
      dealership: 'Stuttgart',
      team: 'Sales (New)',
      status: 'no-show',
      noShowCount: 3,
      lastNoShowDate: createDateOffset(-12)
    }
  },
  
  // 220-229: In Negotiation - Offer Sent Variations
  {
    id: 220,
    customerId: 21,
    requestedCar: { 
      brand: 'BMW', 
      model: 'i4', 
      year: 2024, 
      price: 65000,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=60',
      dealership: 'Milano',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 10,
      vin: 'YV1LS56A1X1123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-220-1',
        createdAt: createDateOffset(-2), // < 3 days old
        vehicleBrand: 'BMW',
        vehicleModel: 'i4',
        vehicleYear: 2024,
        price: 65000,
        status: 'active',
        data: {
          brand: 'BMW',
          model: 'i4',
          year: 2024,
          price: 65000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: [],
    value: 65000,
    expectedCloseDate: createDateString(20), // Future date
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-5),
    lastActivity: createDateOffset(-2),
    scheduledAppointment: null
  },
  {
    id: 221,
    customerId: 22,
    requestedCar: { 
      brand: 'Audi', 
      model: 'e-tron', 
      year: 2024, 
      price: 75000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 8,
      vin: 'WAUZZZ8V9KA789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-221-1',
        createdAt: createDateOffset(-1), // < 3 days old
        vehicleBrand: 'Audi',
        vehicleModel: 'e-tron',
        vehicleYear: 2024,
        price: 75000,
        status: 'active',
        data: {
          brand: 'Audi',
          model: 'e-tron',
          year: 2024,
          price: 75000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: [],
    value: 75000,
    expectedCloseDate: createDateString(-5), // Past date
    assignee: null, // Unassigned
    createdAt: createDateOffset(-10),
    lastActivity: createDateOffset(-1),
    scheduledAppointment: null
  },
  {
    id: 222,
    customerId: 23,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'EQC', 
      year: 2024, 
      price: 70000,
      image: 'https://images.unsplash.com/photo-1605822102629-918beea85679?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 12,
      vin: 'WBA5R7C05NG789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-222-1',
        createdAt: createDateOffset(-2),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'EQC',
        vehicleYear: 2024,
        price: 70000,
        status: 'active',
        data: {
          brand: 'Mercedes-Benz',
          model: 'EQC',
          year: 2024,
          price: 70000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1605822102629-918beea85679?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-222-2',
        createdAt: createDateOffset(-5),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'EQC',
        vehicleYear: 2024,
        price: 72000,
        status: 'archived',
        data: {
          brand: 'Mercedes-Benz',
          model: 'EQC',
          year: 2024,
          price: 72000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1605822102629-918beea85679?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: [],
    value: 70000,
    expectedCloseDate: createDateString(0), // Today
    assignee: 'David Miller',
    createdAt: createDateOffset(-8),
    lastActivity: createDateOffset(-2),
    scheduledAppointment: null
  },
  {
    id: 223,
    customerId: 24,
    requestedCar: { 
      brand: 'Tesla', 
      model: 'Model 3', 
      year: 2024, 
      price: 45000,
      image: 'https://images.unsplash.com/photo-1560955129-430f661a81ed?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 2,
      vin: '5YJ3E1EA1NF123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-223-1',
        createdAt: createDateOffset(-1),
        vehicleBrand: 'Tesla',
        vehicleModel: 'Model 3',
        vehicleYear: 2024,
        price: 45000,
        status: 'active',
        data: {
          brand: 'Tesla',
          model: 'Model 3',
          year: 2024,
          price: 45000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1560955129-430f661a81ed?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Electric'],
    value: 45000,
    expectedCloseDate: createDateString(18), // Future date
    assignee: 'Michael Thomas',
    createdAt: createDateOffset(-4),
    lastActivity: createDateOffset(-1),
    scheduledAppointment: {
      id: 223,
      title: 'Test Drive',
      start: createDateOffset(2), // Future appointment
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 2)
        date.setHours(11, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'Tesla Model 3',
      assignee: 'Michael Thomas',
      assigneeId: 4,
      dealership: 'Berlin',
      team: 'Sales (New)',
      status: 'confirmed',
      noShowCount: 0
    }
  },
  
  // 230-239: In Negotiation - Offer Under Review Variations
  {
    id: 230,
    customerId: 31,
    requestedCar: { 
      brand: 'BMW', 
      model: 'X3', 
      year: 2024, 
      price: 55000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 13,
      vin: 'WP0ZZZ9XZPS789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Under Review',
    offers: [
      {
        id: 'offer-230-1',
        createdAt: createDateOffset(-5), // 5 days old - triggers OFB (5+ days)
        vehicleBrand: 'BMW',
        vehicleModel: 'X3',
        vehicleYear: 2024,
        price: 55000,
        status: 'active',
        data: {
          brand: 'BMW',
          model: 'X3',
          year: 2024,
          price: 55000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: [],
    value: 55000,
    expectedCloseDate: createDateString(25), // Future date
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-10),
    lastActivity: createDateOffset(-5),
    scheduledAppointment: null
  },
  {
    id: 231,
    customerId: 32,
    requestedCar: { 
      brand: 'Audi', 
      model: 'Q7', 
      year: 2024, 
      price: 85000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 7,
      vin: 'WVWZZZ3CZWE123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Under Review',
    offers: [
      {
        id: 'offer-231-1',
        createdAt: createDateOffset(-4), // 4 days old
        vehicleBrand: 'Audi',
        vehicleModel: 'Q7',
        vehicleYear: 2024,
        price: 85000,
        status: 'active',
        data: {
          brand: 'Audi',
          model: 'Q7',
          year: 2024,
          price: 85000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-231-2',
        createdAt: createDateOffset(-8),
        vehicleBrand: 'Audi',
        vehicleModel: 'Q7',
        vehicleYear: 2024,
        price: 87000,
        status: 'archived',
        data: {
          brand: 'Audi',
          model: 'Q7',
          year: 2024,
          price: 87000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Premium'],
    value: 85000,
    expectedCloseDate: createDateString(-8), // Past date
    assignee: null, // Unassigned
    createdAt: createDateOffset(-15),
    lastActivity: createDateOffset(-4),
    scheduledAppointment: null
  },
  {
    id: 232,
    customerId: 33,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'GLE', 
      year: 2024, 
      price: 78000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 9,
      vin: 'WDD2GA4E79K789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Under Review',
    offers: [
      {
        id: 'offer-232-1',
        createdAt: createDateOffset(-6), // 6 days old - triggers OFB
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'GLE',
        vehicleYear: 2024,
        price: 78000,
        status: 'active',
        data: {
          brand: 'Mercedes-Benz',
          model: 'GLE',
          year: 2024,
          price: 78000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: [],
    value: 78000,
    expectedCloseDate: createDateString(0), // Today
    assignee: 'David Miller',
    createdAt: createDateOffset(-12),
    lastActivity: createDateOffset(-6),
    scheduledAppointment: {
      id: 232,
      title: 'Follow-up Appointment',
      start: createDateOffset(7), // Future appointment
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        date.setHours(10, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Test Customer',
      vehicle: 'Mercedes-Benz GLE',
      assignee: 'David Miller',
      assigneeId: 3,
      dealership: 'Stuttgart',
      team: 'Sales (New)',
      status: 'confirmed',
      noShowCount: 0
    }
  },
  
  // 240-249: In Negotiation - Offer Accepted Variations
  {
    id: 240,
    customerId: 41,
    requestedCar: { 
      brand: 'Porsche', 
      model: '911', 
      year: 2024, 
      price: 150000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Manual',
      kilometers: 0,
      status: 'New',
      stockDays: 2,
      vin: '5YJ3E1EA1NF123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Accepted',
    offers: [
      {
        id: 'offer-240-1',
        createdAt: createDateOffset(-10),
        vehicleBrand: 'Porsche',
        vehicleModel: '911',
        vehicleYear: 2024,
        price: 150000,
        status: 'accepted',
        acceptance_status: 'accepted',
        acceptance_date: createDateOffset(-2),
        acceptance_method: 'manual',
        data: {
          brand: 'Porsche',
          model: '911',
          year: 2024,
          price: 150000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Premium', 'Performance'],
    value: 150000,
    expectedCloseDate: createDateString(10), // Future date
    assignee: 'Salsabeel Khaleel',
    createdAt: createDateOffset(-20),
    lastActivity: createDateOffset(-2),
    scheduledAppointment: null
  },
  {
    id: 241,
    customerId: 42,
    requestedCar: { 
      brand: 'BMW', 
      model: 'M5', 
      year: 2024, 
      price: 130000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 1,
      vin: '5YJ3E1EA1NF789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Accepted',
    offers: [
      {
        id: 'offer-241-1',
        createdAt: createDateOffset(-15),
        vehicleBrand: 'BMW',
        vehicleModel: 'M5',
        vehicleYear: 2024,
        price: 130000,
        status: 'accepted',
        acceptance_status: 'accepted',
        acceptance_date: createDateOffset(-5),
        acceptance_method: 'manual',
        data: {
          brand: 'BMW',
          model: 'M5',
          year: 2024,
          price: 130000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-241-2',
        createdAt: createDateOffset(-20),
        vehicleBrand: 'BMW',
        vehicleModel: 'M5',
        vehicleYear: 2024,
        price: 135000,
        status: 'archived',
        data: {
          brand: 'BMW',
          model: 'M5',
          year: 2024,
          price: 135000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: ['Premium', 'Performance'],
    value: 130000,
    expectedCloseDate: createDateString(-3), // Past date
    assignee: null, // Unassigned
    createdAt: createDateOffset(-25),
    lastActivity: createDateOffset(-5),
    scheduledAppointment: null
  },
  
  // 250-259: In Negotiation - Contract Pending Variations
  {
    id: 250,
    customerId: 6,
    requestedCar: { 
      brand: 'Audi', 
      model: 'A8', 
      year: 2024, 
      price: 110000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 4,
      vin: 'JTJHY7AX0K4123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent', // Contract Pending determined by contractDate
    offers: [
      {
        id: 'offer-250-1',
        createdAt: createDateOffset(-12),
        vehicleBrand: 'Audi',
        vehicleModel: 'A8',
        vehicleYear: 2024,
        price: 110000,
        status: 'accepted',
        data: {
          brand: 'Audi',
          model: 'A8',
          year: 2024,
          price: 110000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-250-1',
        contractDate: createDateOffset(-8), // 8 days ago - triggers CFB (7+ days)
        contractNotes: 'Contract pending.',
        contractSigned: false,
        version: 1,
        status: 'pending'
      }
    ],
    tags: ['Premium', 'Luxury'],
    value: 110000,
    expectedCloseDate: createDateString(5), // Future date
    assignee: 'Salsabeel Khaleel',
    createdAt: createDateOffset(-20),
    lastActivity: createDateOffset(-8),
    contractDate: createDateOffset(-8),
    scheduledAppointment: null
  },
  {
    id: 251,
    customerId: 7,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'S-Class', 
      year: 2024, 
      price: 120000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 0,
      vin: 'WBA3B1C50EK654321'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-251-1',
        createdAt: createDateOffset(-10),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'S-Class',
        vehicleYear: 2024,
        price: 120000,
        status: 'accepted',
        data: {
          brand: 'Mercedes-Benz',
          model: 'S-Class',
          year: 2024,
          price: 120000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-251-1',
        contractDate: createDateOffset(-1), // Recent contract
        contractNotes: 'Contract prepared.',
        contractSigned: false,
        version: 1,
        status: 'pending'
      },
      {
        id: 'contract-251-draft',
        contractDate: createDateOffset(-3),
        contractNotes: 'Draft.',
        contractSigned: false,
        version: 0.5,
        status: 'void'
      }
    ],
    tags: ['Premium', 'Luxury'],
    value: 120000,
    expectedCloseDate: createDateString(-2), // Past date
    assignee: null, // Unassigned
    createdAt: createDateOffset(-15),
    lastActivity: createDateOffset(-1),
    contractDate: createDateOffset(-1),
    scheduledAppointment: null
  },
  {
    id: 252,
    customerId: 8,
    requestedCar: { 
      brand: 'BMW', 
      model: '7 Series', 
      year: 2024, 
      price: 115000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 3,
      vin: 'WAUZZZ4G5EN123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-252-1',
        createdAt: createDateOffset(-8),
        vehicleBrand: 'BMW',
        vehicleModel: '7 Series',
        vehicleYear: 2024,
        price: 115000,
        status: 'accepted',
        data: {
          brand: 'BMW',
          model: '7 Series',
          year: 2024,
          price: 115000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-252-1',
        contractDate: createDateOffset(0), // Today
        contractNotes: 'Contract created today.',
        contractSigned: false,
        version: 1,
        status: 'pending'
      }
    ],
    tags: ['Premium'],
    value: 115000,
    expectedCloseDate: createDateString(0), // Today
    assignee: 'David Miller',
    createdAt: createDateOffset(-12),
    lastActivity: createDateOffset(0),
    contractDate: createDateOffset(0),
    scheduledAppointment: null
  },
  
  // 260-269: Closed Won - None (no delivery tracking)
  {
    id: 260,
    customerId: 16,
    requestedCar: { 
      brand: 'Porsche', 
      model: 'Cayenne', 
      year: 2024, 
      price: 95000,
      image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 5,
      vin: 'WBA5R9C08NG123457'
    },
    vehicle: { 
      brand: 'Porsche', 
      model: 'Cayenne', 
      year: 2024, 
      price: 95000,
      image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 5
    },
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: null,
    offers: [
      {
        id: 'offer-260-1',
        createdAt: createDateOffset(-20),
        vehicleBrand: 'Porsche',
        vehicleModel: 'Cayenne',
        vehicleYear: 2024,
        price: 95000,
        status: 'accepted',
        data: {
          brand: 'Porsche',
          model: 'Cayenne',
          year: 2024,
          price: 95000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-260-1',
        contractDate: createDateOffset(-15),
        contractNotes: 'Contract signed.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-15),
        version: 1,
        status: 'signed'
      }
    ],
    tags: ['Premium'],
    value: 95000,
    expectedCloseDate: createDateString(-15), // Past date
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-30),
    lastActivity: createDateOffset(-15),
    contractDate: createDateOffset(-15),
    deliveryDate: null,
    scheduledAppointment: null
  },
  {
    id: 261,
    customerId: 17,
    requestedCar: { 
      brand: 'BMW', 
      model: 'X7', 
      year: 2024, 
      price: 105000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 6,
      vin: 'WBA5R9C08NG123458'
    },
    vehicle: { 
      brand: 'BMW', 
      model: 'X7', 
      year: 2024, 
      price: 105000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 6
    },
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: null,
    offers: [
      {
        id: 'offer-261-1',
        createdAt: createDateOffset(-25),
        vehicleBrand: 'BMW',
        vehicleModel: 'X7',
        vehicleYear: 2024,
        price: 105000,
        status: 'accepted',
        data: {
          brand: 'BMW',
          model: 'X7',
          year: 2024,
          price: 105000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-261-2',
        createdAt: createDateOffset(-30),
        vehicleBrand: 'BMW',
        vehicleModel: 'X7',
        vehicleYear: 2024,
        price: 108000,
        status: 'archived',
        data: {
          brand: 'BMW',
          model: 'X7',
          year: 2024,
          price: 108000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-261-1',
        contractDate: createDateOffset(-10),
        contractNotes: 'Contract signed.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-10),
        version: 1,
        status: 'signed'
      },
      {
        id: 'contract-261-draft',
        contractDate: createDateOffset(-12),
        contractNotes: 'Draft.',
        contractSigned: false,
        version: 0.8,
        status: 'void'
      }
    ],
    tags: ['Premium'],
    value: 105000,
    expectedCloseDate: createDateString(0), // Today
    assignee: null, // Unassigned
    createdAt: createDateOffset(-35),
    lastActivity: createDateOffset(-10),
    contractDate: createDateOffset(-10),
    deliveryDate: null,
    scheduledAppointment: null
  },
  
  // 270-279: Closed Won - Awaiting Delivery Variations
  {
    id: 270,
    customerId: 26,
    requestedCar: { 
      brand: 'Audi', 
      model: 'Q8', 
      year: 2024, 
      price: 98000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 4,
      vin: 'JTJHY7AX0K4123457'
    },
    vehicle: { 
      brand: 'Audi', 
      model: 'Q8', 
      year: 2024, 
      price: 98000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 4
    },
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Awaiting Delivery',
    offers: [
      {
        id: 'offer-270-1',
        createdAt: createDateOffset(-18),
        vehicleBrand: 'Audi',
        vehicleModel: 'Q8',
        vehicleYear: 2024,
        price: 98000,
        status: 'accepted',
        data: {
          brand: 'Audi',
          model: 'Q8',
          year: 2024,
          price: 98000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-270-1',
        contractDate: createDateOffset(-12),
        contractNotes: 'Contract signed.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-12),
        version: 1,
        status: 'signed'
      }
    ],
    tags: ['Premium'],
    value: 98000,
    expectedCloseDate: createDateString(5), // Future date
    assignee: 'David Miller',
    createdAt: createDateOffset(-25),
    lastActivity: createDateOffset(-5),
    contractDate: createDateOffset(-12),
    deliveryDate: createDateString(5), // Future delivery date
    scheduledAppointment: null
  },
  {
    id: 271,
    customerId: 27,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'GLS', 
      year: 2024, 
      price: 112000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 2,
      vin: '5YJ3E1EA1NF123457'
    },
    vehicle: { 
      brand: 'Mercedes-Benz', 
      model: 'GLS', 
      year: 2024, 
      price: 112000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 2
    },
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Awaiting Delivery',
    offers: [
      {
        id: 'offer-271-1',
        createdAt: createDateOffset(-22),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'GLS',
        vehicleYear: 2024,
        price: 112000,
        status: 'accepted',
        data: {
          brand: 'Mercedes-Benz',
          model: 'GLS',
          year: 2024,
          price: 112000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-271-1',
        contractDate: createDateOffset(-15),
        contractNotes: 'Contract signed.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-15),
        version: 1,
        status: 'signed'
      }
    ],
    tags: ['Premium', 'Luxury'],
    value: 112000,
    expectedCloseDate: createDateString(-8), // Past date
    assignee: null, // Unassigned
    createdAt: createDateOffset(-30),
    lastActivity: createDateOffset(-3),
    contractDate: createDateOffset(-15),
    deliveryDate: createDateString(3), // Future delivery date
    scheduledAppointment: null
  },
  
  // 280-289: Closed Won - Delivered Variations
  {
    id: 280,
    customerId: 36,
    requestedCar: { 
      brand: 'BMW', 
      model: 'iX', 
      year: 2024, 
      price: 105000,
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 1,
      vin: '5YJ3E1EA1NF123458'
    },
    vehicle: { 
      brand: 'BMW', 
      model: 'iX', 
      year: 2024, 
      price: 105000,
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 1
    },
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Delivered',
    offers: [
      {
        id: 'offer-280-1',
        createdAt: createDateOffset(-30),
        vehicleBrand: 'BMW',
        vehicleModel: 'iX',
        vehicleYear: 2024,
        price: 105000,
        status: 'accepted',
        data: {
          brand: 'BMW',
          model: 'iX',
          year: 2024,
          price: 105000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-280-1',
        contractDate: createDateOffset(-25),
        contractNotes: 'Contract signed.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-25),
        version: 1,
        status: 'signed'
      }
    ],
    tags: ['Premium', 'Electric'],
    value: 105000,
    expectedCloseDate: createDateString(-25), // Past date
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-40),
    lastActivity: createDateOffset(-5), // 5 days after delivery - triggers DFB (3+ days)
    contractDate: createDateOffset(-25),
    deliveryDate: createDateString(-5), // Past delivery date
    scheduledAppointment: null
  },
  {
    id: 281,
    customerId: 37,
    requestedCar: { 
      brand: 'Porsche', 
      model: 'Taycan', 
      year: 2024, 
      price: 120000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 0,
      vin: 'ZFF79RHA5R1234567'
    },
    vehicle: { 
      brand: 'Porsche', 
      model: 'Taycan', 
      year: 2024, 
      price: 120000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 0
    },
    selectedVehicle: null,
    stage: 'Closed Won',
    negotiationSubstatus: null,
    deliverySubstatus: 'Delivered',
    offers: [
      {
        id: 'offer-281-1',
        createdAt: createDateOffset(-28),
        vehicleBrand: 'Porsche',
        vehicleModel: 'Taycan',
        vehicleYear: 2024,
        price: 120000,
        status: 'accepted',
        data: {
          brand: 'Porsche',
          model: 'Taycan',
          year: 2024,
          price: 120000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-281-2',
        createdAt: createDateOffset(-35),
        vehicleBrand: 'Porsche',
        vehicleModel: 'Taycan',
        vehicleYear: 2024,
        price: 125000,
        status: 'archived',
        data: {
          brand: 'Porsche',
          model: 'Taycan',
          year: 2024,
          price: 125000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-281-1',
        contractDate: createDateOffset(-22),
        contractNotes: 'Contract signed.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-22),
        version: 1,
        status: 'signed'
      }
    ],
    tags: ['Premium', 'Electric', 'Performance'],
    value: 120000,
    expectedCloseDate: createDateString(0), // Today
    assignee: null, // Unassigned
    createdAt: createDateOffset(-45),
    lastActivity: createDateOffset(-4), // 4 days after delivery - triggers DFB
    contractDate: createDateOffset(-22),
    deliveryDate: createDateString(-4), // Past delivery date
    scheduledAppointment: null
  },
  
  // 290-299: Closed Lost and Abandoned Variations
  // 290: Closed Lost with offers + unsigned contract (customer chose competitor)
  {
    id: 290,
    customerId: 1,
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'ID.3', 
      year: 2024, 
      price: 35000,
      image: 'https://images.unsplash.com/photo-1607853203100-69829c08b88e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Hamburg',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 10,
      vin: 'YV1LS56A1X1123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Lost',
    negotiationSubstatus: 'Contract Pending',
    offers: [
      {
        id: 'offer-lost-290-1',
        createdAt: createDateOffset(-14),
        vehicleBrand: 'Volkswagen',
        vehicleModel: 'ID.3',
        vehicleYear: 2024,
        price: 35000,
        status: 'archived',
        data: {
          brand: 'Volkswagen',
          model: 'ID.3',
          year: 2024,
          price: 35000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1607853203100-69829c08b88e?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-lost-290-1',
        contractDate: createDateOffset(-8),
        contractNotes: 'Draft sent; customer went with competitor before signing.',
        contractSigned: false,
        version: 1,
        status: 'void'
      }
    ],
    tags: [],
    value: 35000,
    expectedCloseDate: null,
    assignee: 'Michael Thomas',
    createdAt: createDateOffset(-20),
    lastActivity: createDateOffset(-5),
    contractDate: null,
    closedReason: 'Customer chose competitor',
    closedDate: createDateOffset(-5), // Past closed date
    scheduledAppointment: null
  },
  // 291: Closed Lost with offers (no longer interested after negotiation)
  {
    id: 291,
    customerId: 2,
    requestedCar: { 
      brand: 'Audi', 
      model: 'A3', 
      year: 2024, 
      price: 38000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 7,
      vin: 'WVWZZZ3CZWE123456'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Lost',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-lost-291-1',
        createdAt: createDateOffset(-10),
        vehicleBrand: 'Audi',
        vehicleModel: 'A3',
        vehicleYear: 2024,
        price: 38000,
        status: 'archived',
        data: {
          brand: 'Audi',
          model: 'A3',
          year: 2024,
          price: 38000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    tags: [],
    value: 38000,
    expectedCloseDate: null,
    assignee: null, // Unassigned
    createdAt: createDateOffset(-15),
    lastActivity: createDateOffset(0), // Today closed
    contractDate: null,
    closedReason: 'No longer interested',
    closedDate: createDateOffset(0), // Today
    scheduledAppointment: null
  },
  // 292: Closed Lost, no offers (NS3 - third no-show before offers sent)
  {
    id: 292,
    customerId: 3,
    requestedCar: { 
      brand: 'BMW', 
      model: '1 Series', 
      year: 2024, 
      price: 32000,
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Petrol',
      gearType: 'Manual',
      kilometers: 0,
      status: 'New',
      stockDays: 12,
      vin: 'WBA5R7C05NG789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Closed Lost',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 32000,
    expectedCloseDate: null,
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-25),
    lastActivity: createDateOffset(-10),
    contractDate: null,
    closedReason: 'NS3 - Third No-Show',
    closedDate: createDateOffset(-10), // Past closed date
    scheduledAppointment: null
  },
  {
    id: 293,
    customerId: 4,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'A-Class', 
      year: 2024, 
      price: 36000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      dealership: 'Stuttgart',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 9,
      vin: 'WDD2GA4E79K789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 36000,
    expectedCloseDate: createDateString(-35), // Past date
    assignee: 'David Miller',
    createdAt: createDateOffset(-50), // 50 days ago
    lastActivity: createDateOffset(-35), // 35 days inactive - triggers Abandoned
    scheduledAppointment: null
  },
  {
    id: 294,
    customerId: 5,
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'Passat', 
      year: 2024, 
      price: 40000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Hamburg',
      fuelType: 'Diesel',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 11,
      vin: 'WAUZZZ4G5EN789012'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    negotiationSubstatus: null,
    offers: [],
    tags: [],
    value: 40000,
    expectedCloseDate: createDateString(-40), // Past date
    assignee: null, // Unassigned
    createdAt: createDateOffset(-45), // 45 days ago
    lastActivity: createDateOffset(-32), // 32 days inactive - triggers Abandoned
    scheduledAppointment: null
  }
]
