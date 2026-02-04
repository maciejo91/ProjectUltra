import { createDateOffset, createDateString } from '@/utils/mockDataHelpers'

// Additional opportunities for showcasing carousel - Customers 1-20
// Defined before mockOpportunities to avoid initialization error
const additionalOpportunitiesForCarousel = [
  // Customer 2 (Emma Watson) - Qualified
  {
    id: 31,
    customerId: 2,
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'Polo', 
      year: 2023, 
      price: 22000, 
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Petrol',
      gearType: 'Manual',
      kilometers: 10,
      status: 'Used',
      stockDays: 150
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    tags: [],
    value: 22000,
    expectedCloseDate: createDateString(45),
    assignee: 'David Miller',
    createdAt: createDateOffset(-7),
    lastActivity: createDateOffset(-2),
    scheduledAppointment: null
  },
  // Customer 4 (Sophie Mueller) - Closed Won (Purchased)
  {
    id: 32,
    customerId: 4,
    requestedCar: { 
      brand: 'BMW', 
      model: 'X5', 
      year: 2023, 
      price: 85000, 
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 10,
      status: 'Used',
      stockDays: 200
    },
    vehicle: { 
      brand: 'BMW', 
      model: 'X5', 
      year: 2023, 
      price: 85000, 
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60',
      dealership: 'Munich',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 10,
      status: 'Used',
      stockDays: 200
    },
    selectedVehicle: null,
    stage: 'Closed Won',
    tags: ['Premium'],
    value: 85000,
    offers: [
      {
        id: 'offer-32-1',
        createdAt: createDateOffset(-35),
        vehicleBrand: 'BMW',
        vehicleModel: 'X5',
        vehicleYear: 2023,
        price: 85000,
        status: 'accepted',
        data: {
          brand: 'BMW',
          model: 'X5',
          year: 2023,
          price: 85000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-32-2',
        createdAt: createDateOffset(-40),
        vehicleBrand: 'BMW',
        vehicleModel: 'X5',
        vehicleYear: 2023,
        price: 87000,
        status: 'archived',
        data: {
          brand: 'BMW',
          model: 'X5',
          year: 2023,
          price: 87000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-32-1',
        contractDate: createDateOffset(-30),
        contractNotes: 'Abgeschlossener Vertrag.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-30),
        version: 1,
        status: 'signed'
      },
      {
        id: 'contract-32-draft',
        contractDate: createDateOffset(-35),
        contractNotes: 'Entwurf.',
        contractSigned: false,
        version: 0.1,
        status: 'void'
      }
    ],
    expectedCloseDate: createDateString(-30),
    contractDate: createDateOffset(-30),
    assignee: 'Salsabeel Khaleel',
    createdAt: createDateOffset(-60),
    lastActivity: createDateOffset(-30),
    scheduledAppointment: null
  },
  // Customer 11 (Laura Zimmermann) - In Negotiation
  {
    id: 33,
    customerId: 11,
    requestedCar: { 
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
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'In Negotiation',
    tags: ['Urgent'],
    value: 35000,
    expectedCloseDate: createDateString(7),
    assignee: 'Sarah Jenkins',
    createdAt: createDateOffset(-5),
    lastActivity: createDateOffset(-1),
    scheduledAppointment: null
  },
  // Customer 13 (Nina Keller) - Qualified
  {
    id: 34,
    customerId: 13,
    requestedCar: { 
      brand: 'Audi', 
      model: 'A3', 
      year: 2024, 
      price: 38000, 
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      dealership: 'Frankfurt',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 5
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    tags: ['VIP'],
    value: 38000,
    expectedCloseDate: createDateString(30),
    assignee: 'Salsabeel Khaleel',
    createdAt: createDateOffset(-3),
    lastActivity: createDateOffset(-1),
    scheduledAppointment: null
  },
  // Customer 18 (Dr. Andreas Werner) - Closed Won (Purchased)
  {
    id: 35,
    customerId: 18,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'E-Class', 
      year: 2024, 
      price: 65000, 
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      dealership: 'Düsseldorf',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 12
    },
    vehicle: { 
      brand: 'Mercedes-Benz', 
      model: 'E-Class', 
      year: 2024, 
      price: 65000, 
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      dealership: 'Düsseldorf',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 12
    },
    selectedVehicle: null,
    stage: 'Closed Won',
    tags: ['VIP', 'Premium'],
    value: 65000,
    offers: [
      {
        id: 'offer-35-1',
        createdAt: createDateOffset(-20),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'E-Class',
        vehicleYear: 2024,
        price: 65000,
        status: 'accepted',
        data: {
          brand: 'Mercedes-Benz',
          model: 'E-Class',
          year: 2024,
          price: 65000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-35-2',
        createdAt: createDateOffset(-25),
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'E-Class',
        vehicleYear: 2024,
        price: 67000,
        status: 'archived',
        data: {
          brand: 'Mercedes-Benz',
          model: 'E-Class',
          year: 2024,
          price: 67000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-35-1',
        contractDate: createDateOffset(-15),
        contractNotes: 'VIP-Vertrag.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-15),
        version: 1,
        status: 'signed'
      },
      {
        id: 'contract-35-draft',
        contractDate: createDateOffset(-20),
        contractNotes: 'Entwurf.',
        contractSigned: false,
        version: 0.5,
        status: 'void'
      }
    ],
    expectedCloseDate: createDateString(-15),
    contractDate: createDateOffset(-15),
    assignee: 'Salsabeel Khaleel',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 45)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 15)
      return date.toISOString()
    })(),
    scheduledAppointment: null
  },
  // Customer 20 (Martin Richter) - Closed Won (Purchased)
  {
    id: 36,
    customerId: 20,
    requestedCar: { 
      brand: 'Porsche', 
      model: '911 Carrera', 
      year: 2024, 
      price: 135000, 
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      dealership: 'Hamburg',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 1
    },
    vehicle: { 
      brand: 'Porsche', 
      model: '911 Carrera', 
      year: 2024, 
      price: 135000, 
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      dealership: 'Hamburg',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 1
    },
    selectedVehicle: null,
    stage: 'Closed Won',
    tags: ['Performance', 'Hot'],
    value: 135000,
    offers: [
      {
        id: 'offer-36-1',
        createdAt: createDateOffset(-15),
        vehicleBrand: 'Porsche',
        vehicleModel: '911 Carrera',
        vehicleYear: 2024,
        price: 135000,
        status: 'accepted',
        data: {
          brand: 'Porsche',
          model: '911 Carrera',
          year: 2024,
          price: 135000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-36-2',
        createdAt: createDateOffset(-20),
        vehicleBrand: 'Porsche',
        vehicleModel: '911 Carrera',
        vehicleYear: 2024,
        price: 140000,
        status: 'archived',
        data: {
          brand: 'Porsche',
          model: '911 Carrera',
          year: 2024,
          price: 140000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-36-1',
        contractDate: createDateOffset(-10),
        contractNotes: 'Unterschrieben.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-10),
        version: 1,
        status: 'signed'
      },
      {
        id: 'contract-36-draft',
        contractDate: createDateOffset(-12),
        contractNotes: 'Entwurf.',
        contractSigned: false,
        version: 0.9,
        status: 'void'
      }
    ],
    expectedCloseDate: createDateString(-10),
    contractDate: createDateOffset(-10),
    assignee: 'Salsabeel Khaleel',
    createdAt: createDateOffset(-30),
    lastActivity: createDateOffset(-10),
    scheduledAppointment: null
  }
]

export const mockOpportunities = [
  {
    id: 1,
    customerId: 21,
    requestedCar: { 
      brand: 'Audi', 
      model: 'e-tron GT', 
      year: 2024,
      price: 98000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      dealership: 'Firenze',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 12,
      requestMessage: 'Looking for a new e-tron GT. What are the financing options?'
    },
    vehicle: { 
      brand: 'Audi', 
      model: 'e-tron GT', 
      year: 2024,
      price: 98000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      dealership: 'Firenze',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 12,
      requestMessage: 'Looking for a new e-tron GT. What are the financing options?'
    },
    selectedVehicle: null, // Vehicle selected for offer (can differ from requested)
    stage: 'Qualified',
    tags: ['Premium'],
    value: 98000,
    expectedCloseDate: createDateString(30), // 30 days in the future
    assignee: 'Salsabeel Khaleel', // Assign to manager so it shows up
    createdAt: createDateOffset(-1), // 1 day ago - fresh opportunity
    lastActivity: createDateOffset(-1),
    scheduledAppointment: {
      id: 10,
      title: 'Dealership Visit - Emma Wilson',
      start: (() => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 2) // 2 days ago to trigger action item
        yesterday.setHours(11, 0, 0, 0)
        return yesterday.toISOString()
      })(),
      end: (() => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 2)
        yesterday.setHours(12, 0, 0, 0)
        return yesterday.toISOString()
      })(),
      type: 'appointment',
      customer: 'Emma Wilson',
      vehicle: 'Audi e-tron GT',
      assignee: 'Salsabeel Khaleel',
      assigneeId: 1,
      dealership: 'Firenze',
      team: 'Sales (New)',
      status: 'confirmed',
      noShowCount: 0
    },
    taskStatusBadge: 'Active now on website'
  },
  // REMOVED ID 2 - Duplicate of Qualified stage (ID 1)
  {
    id: 3,
    customerId: 30,
    requestedCar: { 
      brand: 'Porsche', 
      model: 'Taycan', 
      year: 2024,
      price: 120000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjQzfHxjYXJ8ZW58MHx8MHx8fDA%3D',
      dealership: 'Milano',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: null,
      requestMessage: 'Interested in a Taycan. Do you have any in a specific color?'
    },
    vehicle: { 
      brand: 'Porsche', 
      model: 'Taycan', 
      year: 2024,
      price: 120000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjQzfHxjYXJ8ZW58MHx8MHx8fDA%3D',
      dealership: 'Milano',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: null,
      requestMessage: 'Interested in a Taycan. Do you have any in a specific color?'
    },
    stage: 'Qualified',
    tags: [],
    value: 120000,
    expectedCloseDate: '2025-05-15',
    assignee: 'Salsabeel Khaleel', // Assign to manager so it shows up
    createdAt: '2025-03-01T09:00:00',
    lastActivity: '2025-03-25T11:30:00',
    scheduledAppointment: {
      id: 20,
      title: 'Meeting - Oliver Brown',
      start: (() => {
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
        threeDaysAgo.setHours(14, 0, 0, 0)
        return threeDaysAgo.toISOString()
      })(),
      end: (() => {
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
        threeDaysAgo.setHours(15, 30, 0, 0)
        return threeDaysAgo.toISOString()
      })(),
      type: 'appointment',
      customer: 'Oliver Brown',
      vehicle: 'Porsche Taycan',
      assignee: 'Salsabeel Khaleel',
      assigneeId: 1,
      dealership: 'Milano',
      team: 'Sales (New)',
      status: 'no-show',
      noShowCount: 1,
      nsTaskCreatedAt: (() => {
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
        threeDaysAgo.setHours(16, 0, 0, 0)
        return threeDaysAgo.toISOString()
      })()
    }
  },
  {
    id: 2,
    customerId: 30,
    requestedCar: { 
      brand: 'BMW', 
      model: 'iX', 
      year: 2024,
      price: 105000,
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJtd3xlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Roma',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 15,
      requestMessage: 'Looking for an iX. What are the delivery times?'
    },
    vehicle: { 
      brand: 'BMW', 
      model: 'iX', 
      year: 2024,
      price: 105000,
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJtd3xlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Roma',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 15,
      requestMessage: 'Looking for an iX. What are the delivery times?'
    },
    stage: 'Closed Won',
    tags: ['Automation'],
    value: 105000,
    offers: [
      {
        id: 'offer-2-1',
        createdAt: '2024-12-15T10:00:00',
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
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-2-2',
        createdAt: '2024-12-10T10:00:00',
        vehicleBrand: 'BMW',
        vehicleModel: 'iX',
        vehicleYear: 2024,
        price: 108000,
        status: 'archived',
        data: {
          brand: 'BMW',
          model: 'iX',
          year: 2024,
          price: 108000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-2-1',
        contractDate: '2024-12-20T15:00:00',
        contractNotes: 'Abgeschlossen.',
        contractSigned: true,
        esignatureCollectedDate: '2024-12-20T15:00:00',
        version: 1,
        status: 'signed'
      },
      {
        id: 'contract-2-v0',
        contractDate: '2024-12-18T15:00:00',
        contractNotes: 'Vorläufiger Entwurf.',
        contractSigned: false,
        version: 0.1,
        status: 'void'
      }
    ],
    expectedCloseDate: '2025-03-20',
    assignee: 'David Miller',
    createdAt: '2024-11-15T10:00:00',
    lastActivity: '2024-12-25T16:45:00', // Delivery date - matches delivery activity
    contractDate: '2024-12-20T15:00:00' // Contract signed before delivery - perfect for DFB
  },
  {
    id: 4,
    customerId: 31,
    requestedCar: { 
      brand: 'Tesla', 
      model: 'Model S', 
      year: 2024,
      price: 95000,
      image: 'https://images.unsplash.com/photo-1648413653819-7c0fd93e8e6a?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      vin: 'TSLA2024MODELS123',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Electric',
      gearType: 'Automatic',
      registration: '04/2024',
      dealership: 'Milano',
      stockDays: 8,
      requestMessage: 'Interested in purchasing a Model S. What are the available financing options and delivery timeline?',
      fiscalEntity: 'MotorK',
      sourceDetails: 'Website Inquiry'
    },
    vehicle: { 
      brand: 'Tesla', 
      model: 'Model S', 
      year: 2024,
      price: 95000,
      image: 'https://images.unsplash.com/photo-1648413653819-7c0fd93e8e6a?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      vin: 'TSLA2024MODELS123',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Electric',
      gearType: 'Automatic',
      registration: '04/2024',
      dealership: 'Milano',
      stockDays: 8,
      requestMessage: 'Interested in purchasing a Model S. What are the available financing options and delivery timeline?',
      fiscalEntity: 'MotorK',
      sourceDetails: 'Website Inquiry'
    },
    stage: 'In Negotiation',
    tags: ['Premium'],
    value: 95000,
    expectedCloseDate: '2025-05-01',
    assignee: 'Salsabeel Khaleel', // Assign to manager so it shows up
    source: 'Google Ads',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 9) // 9 days ago
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 9) // 9 days ago - no recent activity (triggers Stuck Opportunity)
      return date.toISOString()
    })(),
    scheduledAppointment: null // No appointment scheduled
  },
  // REMOVED ID 5 - Duplicate of Qualified stage (ID 1)
  // REMOVED ID 6 - Duplicate of Qualified stage (ID 1)
  // REMOVED ID 7 - Duplicate of Awaiting Response stage (keeping ID 7 for this stage - actually keeping it)
  {
    id: 7,
    customerId: 32,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'EQS', 
      year: 2024,
      price: 110000,
      image: 'https://images.unsplash.com/photo-1599912027765-a69c78bfa3aa?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fG1lcmNlZGVzfGVufDB8fDB8fHww',
      dealership: 'Firenze',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 20,
      requestMessage: 'Interested in EQS. Need more information about features.'
    },
    vehicle: { 
      brand: 'Mercedes-Benz', 
      model: 'EQS', 
      year: 2024,
      price: 110000,
      image: 'https://images.unsplash.com/photo-1599912027765-a69c78bfa3aa?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fG1lcmNlZGVzfGVufDB8fDB8fHww',
      dealership: 'Firenze',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 20,
      requestMessage: 'Interested in EQS. Need more information about features.'
    },
    stage: 'Qualified',
    tags: [],
    value: 110000,
    expectedCloseDate: '2025-06-01',
    assignee: 'Michael Thomas',
    source: 'Google Ads',
    createdAt: '2024-12-20T10:00:00', // 7+ days ago (OOFB criteria)
    lastActivity: '2024-12-20T10:00:00'
    // No offers, no appointment - perfect for OOFB
  },
  // REMOVED ID 6 - Duplicate of Qualified stage (ID 1)
  {
    id: 5,
    customerId: 22,
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'ID.4', 
      year: 2024,
      price: 45000,
      image: 'https://images.unsplash.com/photo-1607853203100-69829c08b88e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dm9sa3N3YWdlbnxlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Roma',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: null,
      requestMessage: 'Looking for an ID.4. What are the available options?'
    },
    vehicle: { 
      brand: 'Volkswagen', 
      model: 'ID.4', 
      year: 2024,
      price: 45000,
      image: 'https://images.unsplash.com/photo-1607853203100-69829c08b88e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dm9sa3N3YWdlbnxlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Roma',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: null,
      requestMessage: 'Looking for an ID.4. What are the available options?'
    },
    stage: 'Qualified',
    tags: [],
    value: 45000,
    expectedCloseDate: '2025-07-01',
    assignee: 'Sarah Jenkins',
    source: 'Google Ads',
    createdAt: '2024-12-10T09:00:00', // 14+ days ago (UFB criteria)
    lastActivity: '2024-12-10T09:00:00'
    // No offers, no appointment - perfect for UFB
  },
  {
    id: 8,
    customerId: 33,
    requestedCar: { 
      brand: 'BMW', 
      model: 'i4', 
      year: 2024,
      price: 65000,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGNhcnxlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Milano',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 10,
      requestMessage: 'Interested in BMW i4. Need financing details.'
    },
    vehicle: { 
      brand: 'BMW', 
      model: 'i4', 
      year: 2024,
      price: 65000,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGNhcnxlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Milano',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 10,
      requestMessage: 'Interested in BMW i4. Need financing details.'
    },
    stage: 'In Negotiation',
    tags: ['Premium'],
    value: 65000,
    expectedCloseDate: '2025-04-15',
    assignee: 'David Miller',
    source: 'Google Ads',
    createdAt: '2024-12-15T11:00:00',
    lastActivity: '2024-12-20T14:00:00' // 5+ days in negotiation (OFB criteria)
    // Has offers (stage is In Negotiation) but no contract - perfect for OFB
  },
  {
    id: 9,
    customerId: 34,
    requestedCar: { 
      brand: 'Audi', 
      model: 'Q4 e-tron', 
      year: 2024,
      price: 55000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      dealership: 'Firenze',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 18,
      requestMessage: 'Interested in Q4 e-tron. When can I test drive?'
    },
    vehicle: { 
      brand: 'Audi', 
      model: 'Q4 e-tron', 
      year: 2024,
      price: 55000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      dealership: 'Firenze',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 18,
      requestMessage: 'Interested in Q4 e-tron. When can I test drive?'
    },
    stage: 'In Negotiation',
    tags: [],
    value: 55000,
    expectedCloseDate: '2025-05-20',
    assignee: 'Michael Thomas',
    source: 'Google Ads',
    createdAt: '2024-12-18T10:00:00',
    lastActivity: '2024-12-25T15:00:00',
    contractDate: null // No contract date - perfect for NFU
    // In Negotiation, no contract date, no appointment - perfect for NFU
  },
  {
    id: 10,
    customerId: 34,
    requestedCar: { 
      brand: 'Porsche', 
      model: 'Macan Electric', 
      year: 2024,
      price: 85000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjQzfHxjYXJ8ZW58MHx8MHx8fDA%3D',
      dealership: 'Milano',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 5,
      requestMessage: 'Interested in Macan Electric. Ready to proceed.'
    },
    vehicle: { 
      brand: 'Porsche', 
      model: 'Macan Electric', 
      year: 2024,
      price: 85000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjQzfHxjYXJ8ZW58MHx8MHx8fDA%3D',
      dealership: 'Milano',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 5,
      requestMessage: 'Interested in Macan Electric. Ready to proceed.'
    },
    stage: 'Closed Won',
    tags: ['Premium'],
    value: 85000,
    offers: [
      {
        id: 'offer-10-1',
        createdAt: '2024-12-10T09:00:00',
        vehicleBrand: 'Porsche',
        vehicleModel: 'Macan Electric',
        vehicleYear: 2024,
        price: 85000,
        status: 'accepted',
        data: {
          brand: 'Porsche',
          model: 'Macan Electric',
          year: 2024,
          price: 85000,
          financingType: 'cash',
          image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60'
        }
      },
      {
        id: 'offer-10-2',
        createdAt: '2024-12-05T09:00:00',
        vehicleBrand: 'Porsche',
        vehicleModel: 'Macan Electric',
        vehicleYear: 2024,
        price: 88000,
        status: 'archived',
        data: {
          brand: 'Porsche',
          model: 'Macan Electric',
          year: 2024,
          price: 88000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60'
        }
      }
    ],
    contracts: [
      {
        id: 'contract-10-1',
        contractDate: '2024-12-22T16:00:00',
        contractNotes: 'Unterschrieben, wartet auf Lieferung.',
        contractSigned: true,
        esignatureCollectedDate: '2024-12-22T16:00:00',
        version: 1,
        status: 'signed'
      },
      {
        id: 'contract-10-v0',
        contractDate: '2024-12-15T16:00:00',
        contractNotes: 'Erster Entwurf.',
        contractSigned: false,
        version: 0.5,
        status: 'void'
      }
    ],
    expectedCloseDate: '2025-01-15',
    assignee: 'Sarah Jenkins',
    source: 'Google Ads',
    createdAt: '2024-12-01T09:00:00',
    lastActivity: '2024-12-22T16:00:00',
    contractDate: '2024-12-22T16:00:00', // Contract signed date - perfect for CFB
    // Closed Won (contract signed) but not delivered yet - perfect for CFB
  },
  {
    id: 24,
    customerId: 23,
    requestedCar: {
      brand: 'Mercedes-Benz', 
      model: 'EQC', 
      year: 2024,
      price: 75000,
      image: 'https://images.unsplash.com/photo-1605822102629-918beea85679?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fGJtd3xlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Roma',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 14,
      requestMessage: 'Interested in EQC. Need information about charging infrastructure.'
    },
    vehicle: { 
      brand: 'Mercedes-Benz', 
      model: 'EQC', 
      year: 2024,
      price: 75000,
      image: 'https://images.unsplash.com/photo-1605822102629-918beea85679?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fGJtd3xlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Roma',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 14,
      requestMessage: 'Interested in EQC. Need information about charging infrastructure.'
    },
    stage: 'In Negotiation',
    tags: [],
    value: 75000,
    expectedCloseDate: '2025-05-10',
    assignee: 'David Miller',
    source: 'Google Ads',
    createdAt: '2024-12-05T10:00:00',
    lastActivity: '2024-12-15T11:00:00', // 10+ days in negotiation (UFB criteria)
    contractDate: null, // No contract date - perfect for UFB (In Negotiation)
    // In Negotiation for 10+ days without contract - perfect for UFB
  },
  // REMOVED ID 12 - Duplicate of Awaiting Response stage (keeping ID 7 for this stage)
  // REMOVED ID 13 - Duplicate of Qualified stage (ID 1)
  // REMOVED ID 14 - Duplicate of Qualified stage (ID 1)
  // Opportunity 15 (Daniel Kim)
  {
    id: 15,
    customerId: 24,
    requestedCar: { 
      brand: 'Audi', 
      model: 'A6 e-tron', 
      year: 2024,
      price: 90000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60',
      dealership: 'Milano',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: null,
      requestMessage: 'Interested in A6 e-tron. When can I schedule a test drive?'
    },
    vehicle: { 
      brand: 'Audi', 
      model: 'A6 e-tron', 
      year: 2024,
      price: 90000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60',
      dealership: 'Milano',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: null,
      requestMessage: 'Interested in A6 e-tron. When can I schedule a test drive?'
    },
    stage: 'In Negotiation',
    tags: [],
    value: 90000,
    expectedCloseDate: '2025-05-05',
    assignee: 'Sarah Jenkins',
    source: 'Google Ads',
    createdAt: '2024-12-12T11:00:00',
    lastActivity: '2024-12-18T10:00:00',
    contractDate: null, // No contract date
    scheduledAppointment: {
      id: 21,
      title: 'Test Drive - Daniel Kim',
      start: '2026-01-10T14:00:00', // Future appointment
      end: '2026-01-10T15:00:00',
      type: 'appointment',
      customer: 'Daniel Kim',
      vehicle: 'Audi A6 e-tron',
      assignee: 'Sarah Jenkins',
      assigneeId: 2,
      dealership: 'Milano',
      team: 'Sales (New)',
      status: 'confirmed'
    }
    // In Negotiation with future appointment - should NOT show NFU
  },
  // REMOVED ID 13 - Duplicate of Qualified stage (ID 1)
  // REMOVED ID 14 - Duplicate of Qualified stage (ID 1)
  {
    id: 16,
    customerId: 36,
    requestedCar: { 
      brand: 'BMW', 
      model: 'i5', 
      year: 2024,
      price: 72000,
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJtd3xlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Firenze',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: null,
      requestMessage: 'Looking for BMW i5. Interested in test drive.'
    },
    vehicle: { 
      brand: 'BMW', 
      model: 'i5', 
      year: 2024,
      price: 72000,
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJtd3xlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Firenze',
      fuelType: 'Electric',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: null,
      requestMessage: 'Looking for BMW i5. Interested in test drive.'
    },
    stage: 'Closed Lost',
    negotiationSubstatus: 'Offer Sent',
    offers: [
      {
        id: 'offer-lost-16-1',
        createdAt: createDateOffset(-12),
        vehicleBrand: 'BMW',
        vehicleModel: 'i5',
        vehicleYear: 2024,
        price: 72000,
        status: 'archived',
        data: {
          brand: 'BMW',
          model: 'i5',
          year: 2024,
          price: 72000,
          financingType: 'financing',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJtd3xlbnwwfHwwfHx8MA%3D%3D'
        }
      }
    ],
    tags: [],
    value: 72000,
    expectedCloseDate: null,
    assignee: 'Sarah Jenkins',
    source: 'Google Ads',
    createdAt: '2025-02-10T09:00:00',
    lastActivity: '2025-03-01T15:00:00',
    contractDate: null,
    closedReason: 'Customer found better price at competitor',
    closedDate: '2025-03-01T15:00:00'
    // Closed Lost - terminal state, no widgets should appear
  },
  // ========================================
  // STATE MACHINE COVERAGE - All Stage Permutations
  // ========================================
  {
    id: 18,
    customerId: 37,
    requestedCar: { 
      brand: 'Audi', 
      model: 'A4', 
      year: 2024,
      price: 52000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      dealership: 'Firenze',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 7,
      requestMessage: 'Interested in Audi A4. Scheduled appointment.'
    },
    vehicle: { 
      brand: 'Audi', 
      model: 'A4', 
      year: 2024,
      price: 52000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      dealership: 'Firenze',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 7,
      requestMessage: 'Interested in Audi A4. Scheduled appointment.'
    },
    stage: 'Qualified',
    tags: [],
    value: 52000,
    expectedCloseDate: '2025-04-20',
    assignee: 'Salsabeel Khaleel',
    source: 'Google Ads',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    scheduledAppointment: {
      id: 23,
      title: 'Appointment - Rachel Green',
      start: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 2) // Future appointment
        date.setHours(14, 0, 0, 0)
        return date.toISOString()
      })(),
      end: (() => {
        const date = new Date()
        date.setDate(date.getDate() + 2)
        date.setHours(15, 0, 0, 0)
        return date.toISOString()
      })(),
      type: 'appointment',
      customer: 'Rachel Green',
      vehicle: 'Audi A4',
      assignee: 'Salsabeel Khaleel',
      assigneeId: 1,
      dealership: 'Firenze',
      team: 'Sales (New)',
      status: 'confirmed',
      noShowCount: 0
    }
    // STAGE: Awaiting Appointment (has future scheduledAppointment)
  },
  // REMOVED ID 20 - Duplicate of Offer Sent stage (keeping ID 8 for this stage)
  // REMOVED ID 21 - Duplicate of Awaiting Response stage (keeping ID 7 for this stage)
  // REMOVED ID 22 - Duplicate of Contract Pending stage (keeping ID 11 for this stage)
  {
    id: 25,
    customerId: 28,
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'C-Class', 
      year: 2024,
      price: 58000,
      image: 'https://images.unsplash.com/photo-1599912027765-a69c78bfa3aa?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fG1lcmNlZGVzfGVufDB8fDB8fHww',
      dealership: 'Milano',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 9,
      requestMessage: 'Interested in C-Class. Offer sent recently.'
    },
    vehicle: { 
      brand: 'Mercedes-Benz', 
      model: 'C-Class', 
      year: 2024,
      price: 58000,
      image: 'https://images.unsplash.com/photo-1599912027765-a69c78bfa3aa?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fG1lcmNlZGVzfGVufDB8fDB8fHww',
      dealership: 'Milano',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 9,
      requestMessage: 'Interested in C-Class. Offer sent recently.'
    },
    stage: 'In Negotiation',
    tags: [],
    value: 58000,
    expectedCloseDate: '2025-04-15',
    assignee: 'Sarah Jenkins',
    source: 'Google Ads',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1) // Offer sent 1 day ago (less than 3 days)
      return date.toISOString()
    })()
    // STAGE: In Negotiation (has offer activity less than 3 days old - will be calculated by stageMapper)
  },
  // REMOVED ID 21 - Duplicate of Awaiting Response stage (keeping ID 7 for this stage)
  {
    id: 28,
    customerId: 29,
    requestedCar: { 
      brand: 'BMW', 
      model: '3 Series', 
      year: 2024,
      price: 50000,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGNhcnxlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Firenze',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 11,
      requestMessage: 'Interested in 3 Series. Offer pending review.'
    },
    vehicle: { 
      brand: 'BMW', 
      model: '3 Series', 
      year: 2024,
      price: 50000,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGNhcnxlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Firenze',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 11,
      requestMessage: 'Interested in 3 Series. Offer pending review.'
    },
    stage: 'In Negotiation',
    tags: [],
    value: 50000,
    expectedCloseDate: '2025-04-20',
    assignee: 'Michael Thomas',
    source: 'Google Ads',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 15)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 4) // Offer sent 4 days ago (3+ days)
      return date.toISOString()
    })()
    // STAGE: Awaiting Response (has offer activity 3+ days old - will be calculated by stageMapper)
  },
  {
    id: 22,
    customerId: 26,
    requestedCar: {
      brand: 'BMW', 
      model: '3 Series', 
      year: 2024,
      price: 50000,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGNhcnxlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Firenze',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 11,
      requestMessage: 'Interested in 3 Series. Offer pending review.'
    },
    vehicle: { 
      brand: 'BMW', 
      model: '3 Series', 
      year: 2024,
      price: 50000,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGNhcnxlbnwwfHwwfHx8MA%3D%3D',
      dealership: 'Firenze',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 11,
      requestMessage: 'Interested in 3 Series. Offer pending review.'
    },
    stage: 'In Negotiation',
    tags: [],
    value: 50000,
    expectedCloseDate: '2025-04-20',
    assignee: 'Michael Thomas',
    source: 'Google Ads',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 15)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 4) // Offer sent 4 days ago (3+ days)
      return date.toISOString()
    })()
    // STAGE: Awaiting Response (has offer activity 3+ days old - will be calculated by stageMapper)
  },
  // REMOVED ID 22 - Duplicate of Contract Pending stage (keeping ID 11 for this stage)
  {
    id: 23,
    customerId: 27,
    requestedCar: { 
      brand: 'Porsche', 
      model: '911', 
      year: 2024,
      price: 150000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjQzfHxjYXJ8ZW58MHx8MHx8fDA%3D',
      dealership: 'Milano',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 3,
      requestMessage: 'Interested in 911. Contract pending.'
    },
    vehicle: { 
      brand: 'Porsche', 
      model: '911', 
      year: 2024,
      price: 150000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjQzfHxjYXJ8ZW58MHx8MHx8fDA%3D',
      dealership: 'Milano',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 3,
      requestMessage: 'Interested in 911. Contract pending.'
    },
    stage: 'In Negotiation',
    tags: ['Premium'],
    value: 150000,
    expectedCloseDate: '2025-03-25',
    assignee: 'Salsabeel Khaleel',
    source: 'Google Ads',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 20)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      return date.toISOString()
    })(),
    contractDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2) // Contract date set 2 days ago
      return date.toISOString()
    })()
    // STAGE: Contract Pending (has contractDate but stage is In Negotiation - will be calculated by stageMapper)
  },
  // Opportunity for customer 3
  {
    id: 100,
    customerId: 3,
    requestedCar: {
      brand: 'BMW',
      model: 'M4 Coupe',
      year: 2024,
      price: 85000,
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 15,
      requestMessage: 'Interested in sporty coupes for weekend driving.'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    tags: ['Hot'],
    value: 85000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 30)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'David Miller',
    source: 'Google Ads',
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
  // Opportunity for customer 6
  {
    id: 102,
    customerId: 6,
    requestedCar: {
      brand: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2024,
      price: 45000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      dealership: 'Berlin',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 8,
      requestMessage: 'Looking for reliable sedan for daily commute.'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    tags: [],
    value: 45000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 40)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'Michael Thomas',
    source: 'Google Ads',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 6)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    scheduledAppointment: null
  },
  // Opportunity for customer 7
  {
    id: 103,
    customerId: 7,
    requestedCar: {
      brand: 'Volkswagen',
      model: 'Tiguan',
      year: 2024,
      price: 38000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      dealership: 'Hamburg',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 10,
      requestMessage: 'Family buyer seeking spacious SUV.'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    tags: [],
    value: 38000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 45)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'Sarah Jenkins',
    source: 'Google Ads',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 4)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 5)
      return date.toISOString()
    })(),
    scheduledAppointment: null
  },
  // Opportunity for customer 8
  {
    id: 104,
    customerId: 8,
    requestedCar: {
      brand: 'Audi',
      model: 'A6',
      year: 2024,
      price: 65000,
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      dealership: 'Düsseldorf',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      kilometers: 0,
      status: 'New',
      stockDays: 8,
      requestMessage: 'Executive looking for premium sedan for business use.'
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    tags: [],
    value: 65000,
    expectedCloseDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 50)
      return date.toISOString().split('T')[0]
    })(),
    assignee: 'Michael Thomas',
    source: 'Walk-in',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
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
      stockDays: 5
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 8
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 10
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 7
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 12
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 15
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 8
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 6
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 9
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 11
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 14
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 3
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 1
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 10
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
      stockDays: 8
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
      stockDays: 12
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
      stockDays: 2
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
      stockDays: 13
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
      stockDays: 7
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
      stockDays: 9
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
      stockDays: 2
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
      stockDays: 1
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
      stockDays: 4
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
        contractNotes: 'Vertrag ausstehend.',
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
      stockDays: 0
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
        contractNotes: 'Vertrag vorbereitet.',
        contractSigned: false,
        version: 1,
        status: 'pending'
      },
      {
        id: 'contract-251-draft',
        contractDate: createDateOffset(-3),
        contractNotes: 'Entwurf.',
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
      stockDays: 3
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
        contractNotes: 'Vertrag heute erstellt.',
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
      stockDays: 5
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
        contractNotes: 'Vertrag unterzeichnet.',
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
      stockDays: 6
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
        contractNotes: 'Vertrag unterzeichnet.',
        contractSigned: true,
        esignatureCollectedDate: createDateOffset(-10),
        version: 1,
        status: 'signed'
      },
      {
        id: 'contract-261-draft',
        contractDate: createDateOffset(-12),
        contractNotes: 'Entwurf.',
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
      stockDays: 4
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
        contractNotes: 'Vertrag unterzeichnet.',
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
      stockDays: 2
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
        contractNotes: 'Vertrag unterzeichnet.',
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
      stockDays: 1
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
        contractNotes: 'Vertrag unterzeichnet.',
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
      stockDays: 0
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
        contractNotes: 'Vertrag unterzeichnet.',
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
      stockDays: 10
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
    closedReason: 'Kunde hat sich für Konkurrenz entschieden',
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
      stockDays: 7
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
    closedReason: 'Nicht mehr interessiert',
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
      stockDays: 12
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
    closedReason: 'NS3 - Dritter No-Show',
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
      stockDays: 9
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
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
      stockDays: 11
    },
    vehicle: null,
    selectedVehicle: null,
    stage: 'Qualified',
    tags: [],
    value: 40000,
    expectedCloseDate: createDateString(-40), // Past date
    assignee: null, // Unassigned
    createdAt: createDateOffset(-45), // 45 days ago
    lastActivity: createDateOffset(-32), // 32 days inactive - triggers Abandoned
    scheduledAppointment: null
  },
  
  // Additional opportunities for showcasing carousel - Customers 1-20
  ...additionalOpportunitiesForCarousel
]

// Tasks are separate entities that can be associated with customers, leads, or opportunities
