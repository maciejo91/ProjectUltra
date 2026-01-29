export const mockLeads = [
  {
    id: 1,
    customerId: 1,
    status: 'Open',
    priority: 'Hot',
    requestedCar: { 
      brand: 'Audi', 
      model: 'A6 Allroad', 
      year: 2023, 
      price: 19000, 
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      vin: '7015733W8749',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Manual',
      registration: '03/2016',
      dealership: 'Firenze',
      stockDays: 412,
      requestMessage: 'Hello, I would like to know the details about the car: What is the suspension?'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: 'MotorK',
    sourceDetails: 'ADD 2024',
    assignee: 'Salsabeel Khaleel', // Assign to manager so it shows up
    assigneeInitials: 'SK',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1) // 1 day ago - too new for urgency banner
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 2) // 2 hours in the future - urgent, not overdue
      return date.toISOString()
    })(),
    tags: ['Premium', 'Automation'],
    stage: 'Open', // Maps to "New" - Brand new lead, no contact attempts yet
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: [], // Zero contact attempts - needs initial call
    tradeIns: [
      { id: 't1', label: '2015 Mercedes', valuation: 8000 },
      { id: 't2', label: '2018 VW', valuation: 6000 }
    ],
    financingOptions: [
      { id: 'f1', label: 'Cash' },
      { id: 'f2', label: 'Loan 48 months', termMonths: 48 },
      { id: 'f3', label: 'Leasing 36 months', termMonths: 36 }
    ]
  },
  // GROUP A: Validated Stage Leads
  {
    id: 4,
    customerId: 4,
    status: 'Open',
    priority: 'Hot',
    requestedCar: { 
      brand: 'BMW', 
      model: 'iX xDrive50', 
      year: 2024, 
      price: 105000, 
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60',
      vin: 'BMW1234567890',
      kilometers: 0,
      status: 'New',
      fuelType: 'Electric',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Munich',
      stockDays: 5,
      requestMessage: 'Interested in BMW iX. Ready for test drive this week.'
    },
    carStatus: 'In Stock',
    requestType: 'Test Drive',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Salsabeel Khaleel', // Assign to manager
    assigneeInitials: 'SK',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 10) // 10 days ago - within 7-14 day urgency window
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    nextActionDue: null, // No next action due
    tags: ['Premium'],
    stage: 'Open', // Changed to Open to trigger urgency banner
    isDisqualified: false,
    disqualifyReason: null,
    disqualifyCategory: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 3)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Customer confirmed interest, validated contact details, scheduled test drive',
        transcription: null
      }
    ],
    tradeIns: [
      { id: 't1', label: '2015 Mercedes', valuation: 8000 },
      { id: 't2', label: '2018 VW', valuation: 6000 }
    ],
    financingOptions: [
      { id: 'f1', label: 'Cash' },
      { id: 'f2', label: 'Loan 48 months', termMonths: 48 },
      { id: 'f3', label: 'Leasing 36 months', termMonths: 36 }
    ]
  },
  {
    id: 5,
    customerId: 5,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Audi', 
      model: 'Q4 e-tron', 
      year: 2024, 
      price: 55000, 
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      vin: 'AUDI9876543210',
      kilometers: 0,
      status: 'New',
      fuelType: 'Electric',
      gearType: 'Automatic',
      registration: '02/2024',
      dealership: 'Firenze',
      stockDays: 12,
      requestMessage: 'Looking for Q4 e-tron information and pricing.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Facebook',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Salsabeel Khaleel',
    assigneeInitials: 'SK',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 4)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 6) // Due in 6 hours
      return date.toISOString()
    })(),
    tags: [],
    stage: 'Validated', // Validated but NO appointment scheduled - needs follow-up to schedule
    isDisqualified: false,
    disqualifyReason: null,
    disqualifyCategory: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 2)
          return date.toISOString()
        })(),
        outcome: 'no-answer',
        channel: 'phone',
        notes: 'First call - no answer',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setHours(date.getHours() - 4)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Validated lead, customer interested. Needs to check calendar for appointment',
        transcription: null
      }
    ],
    tradeIns: [
      { id: 't1', label: '2016 Audi A3', valuation: 9500 },
      { id: 't2', label: '2019 VW Golf', valuation: 7200 }
    ],
    financingOptions: [
      { id: 'f1', label: 'Cash' },
      { id: 'f2', label: 'Loan 48 months', termMonths: 48 },
      { id: 'f3', label: 'Leasing 36 months', termMonths: 36 }
    ]
  },
  // GROUP B: Disqualified States
  {
    id: 6,
    customerId: 6,
    status: 'Disqualified',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'ID.4', 
      year: 2023, 
      price: 45000, 
      image: 'https://images.unsplash.com/photo-1622353219448-46a009f0d44f?w=900&auto=format&fit=crop&q=60',
      vin: 'VW1234567890',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Electric',
      gearType: 'Automatic',
      registration: '05/2023',
      dealership: 'Berlin',
      stockDays: 45,
      requestMessage: 'Interested in ID.4 but need to check budget first.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 15)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    nextActionDue: null,
    tags: [],
    stage: 'Not Valid',
    isDisqualified: true,
    disqualifyReason: 'Data cleanup',
    disqualifyCategory: 'Not Valid',
    scheduledAppointment: null,
    contactAttempts: [],
    tradeIns: [
      { id: 't1', label: '2020 VW Golf', valuation: 14000 }
    ],
    financingOptions: [
      { id: 'f1', label: 'Cash' },
      { id: 'f2', label: 'Loan 48 months', termMonths: 48 }
    ]
  },
  {
    id: 7,
    customerId: 7,
    status: 'Disqualified',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'GLC 300', 
      year: 2024, 
      price: 68000, 
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      vin: 'MB9876543210',
      kilometers: 0,
      status: 'New',
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Hamburg',
      stockDays: 8,
      requestMessage: 'Looking for GLC but considering other brands too.'
    },
    carStatus: 'In Stock',
    requestType: 'Test Drive',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'David Miller',
    assigneeInitials: 'DM',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 8)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    nextActionDue: null,
    tags: [],
    stage: 'Not Interested',
    isDisqualified: true,
    disqualifyReason: 'Bought elsewhere',
    disqualifyCategory: 'Not Interested',
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 5)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Customer informed us they purchased from competitor',
        transcription: null
      }
    ]
  },
  {
    id: 8,
    customerId: 1, // Same customer as Lead 1 - making it a duplicate
    status: 'Disqualified',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Audi', 
      model: 'A6 Allroad', 
      year: 2023, 
      price: 19000, 
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      vin: '7015733W8749',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Manual',
      registration: '03/2016',
      dealership: 'Firenze',
      stockDays: 412,
      requestMessage: 'Duplicate inquiry - same customer as Lead 1'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: 'MotorK',
    sourceDetails: 'ADD 2024',
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 18)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    nextActionDue: null,
    tags: [],
    stage: 'Closed Failed',
    isDisqualified: true,
    isDuplicate: true,
    disqualifyReason: 'Duplicate',
    disqualifyCategory: 'Not Valid',
    scheduledAppointment: null,
    contactAttempts: []
  },
  {
    id: 10,
    customerId: 10,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'BMW', 
      model: '3 Series', 
      year: 2023, 
      price: 48000, 
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&auto=format&fit=crop&q=60',
      vin: 'BMW3456789012',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '06/2023',
      dealership: 'Munich',
      stockDays: 20,
      requestMessage: 'Interested in pre-owned 3 Series.'
    },
    carStatus: 'In Stock',
    requestType: 'Test Drive',
    source: 'Facebook',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Salsabeel Khaleel', // Assign to manager
    assigneeInitials: 'SK',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 8) // Due in 8 hours
      date.setMinutes(0, 0, 0)
      return date.toISOString()
    })(),
    callbackDate: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 8) // Callback scheduled in 8 hours
      date.setMinutes(0, 0, 0)
      return date.toISOString()
    })(),
    callbackScheduled: true,
    tags: [],
    stage: 'Open', // Will map to "To be called back" due to callbackDate - customer requested specific callback time
    isDisqualified: false,
    disqualifyReason: null,
    disqualifyCategory: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 5)
          return date.toISOString()
        })(),
        outcome: 'no-answer',
        channel: 'phone',
        notes: 'No answer on first attempt',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 3)
          return date.toISOString()
        })(),
        outcome: 'voicemail',
        channel: 'phone',
        notes: 'Left voicemail with callback request',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 1)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Customer interested, requested callback tomorrow afternoon at 2 PM',
        transcription: null
      }
    ]
  },
  // Lead 11 - Open Lead with 1 contact attempt (no answer)
  {
    id: 11,
    customerId: 11,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Porsche', 
      model: 'Cayenne', 
      year: 2024, 
      price: 85000, 
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      vin: 'PORSCHE123456',
      kilometers: 0,
      status: 'New',
      fuelType: 'Hybrid',
      gearType: 'Automatic',
      registration: '03/2024',
      dealership: 'Berlin',
      stockDays: 8,
      requestMessage: 'Looking for Cayenne Hybrid. Need urgent purchase for family.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Walk-in',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Salsabeel Khaleel', // Assign to manager
    assigneeInitials: 'SK',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      date.setHours(10, 0, 0, 0)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      date.setHours(11, 0, 0, 0)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 2) // OVERDUE by 2 hours
      return date.toISOString()
    })(),
    tags: ['Urgent'],
    stage: 'Open', // NEW state with 1 failed contact attempt - OVERDUE
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 1)
          date.setHours(11, 0, 0, 0)
          return date.toISOString()
        })(),
        outcome: 'no-answer',
        channel: 'phone',
        notes: 'Walk-in customer left details. Called but no answer.',
        transcription: null
      }
    ]
  },
  // Lead 12 - Open Lead with 2 contact attempts (close to auto-disqualify threshold)
  {
    id: 12,
    customerId: 12,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Porsche', 
      model: 'Macan', 
      year: 2023, 
      price: 62000, 
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      vin: 'PORSCHE789012',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '05/2023',
      dealership: 'Hamburg',
      stockDays: 45,
      requestMessage: 'Interested in pre-owned Macan. Please contact me.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: 'Facebook Ads Campaign',
    assignee: 'Salsabeel Khaleel', // Assign to manager
    assigneeInitials: 'SK',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 6)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1) // OVERDUE by 1 day
      return date.toISOString()
    })(),
    tags: [],
    stage: 'Open', // NEW state with 2 contact attempts - one more attempt before auto-disqualify
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 5)
          return date.toISOString()
        })(),
        outcome: 'no-answer',
        channel: 'phone',
        notes: 'First attempt - no answer',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 2)
          return date.toISOString()
        })(),
        outcome: 'voicemail',
        channel: 'phone',
        notes: 'Second attempt - left voicemail. No response yet.',
        transcription: null
      }
    ]
  },
  // Additional leads for showcasing carousel - Customer 1 (Josh Adams)
  {
    id: 13,
    customerId: 1,
    status: 'Open',
    priority: 'Hot',
    requestedCar: { 
      brand: 'Audi', 
      model: 'Q7', 
      year: 2024, 
      price: 75000, 
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      vin: 'AUDI123456789',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Milan',
      stockDays: 8,
      requestMessage: 'Looking for a spacious SUV for family trips'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: 'MotorK',
    sourceDetails: 'ADD 2024',
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
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
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString()
    })(),
    tags: ['Premium'],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Customer 2 (Emma Watson) - Lead
  {
    id: 14,
    customerId: 2,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'Golf', 
      year: 2023, 
      price: 28000, 
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      vin: 'VW987654321',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Manual',
      registration: '06/2023',
      dealership: 'Berlin',
      stockDays: 120,
      requestMessage: 'First car purchase - need reliable hatchback'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Instagram',
    assignee: 'David Miller',
    assigneeInitials: 'DM',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 3)
      return date.toISOString()
    })(),
    tags: [],
    stage: 'Validated',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 2)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Customer confirmed interest in Golf. First-time buyer, needs guidance on financing options. Validated contact details.',
        transcription: null
      }
    ]
  },
  // Customer 3 (Liam Johnson) - Lead
  {
    id: 15,
    customerId: 3,
    status: 'Open',
    priority: 'Hot',
    requestedCar: { 
      brand: 'BMW', 
      model: 'M4 Coupe', 
      year: 2024, 
      price: 85000, 
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60',
      vin: 'BMW456789012',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '02/2024',
      dealership: 'Berlin',
      stockDays: 15,
      requestMessage: 'Sporty coupe for weekend drives'
    },
    carStatus: 'In Stock',
    requestType: 'Test Drive',
    source: 'Immo-scout',
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
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
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString()
    })(),
    tags: ['Performance'],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Customer 4 (Sophie Mueller) - Lead
  {
    id: 16,
    customerId: 4,
    status: 'Open',
    priority: 'Hot',
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'GLE 350', 
      year: 2024, 
      price: 72000, 
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      vin: 'MB789012345',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Munich',
      stockDays: 5,
      requestMessage: 'Premium SUV for family of 4'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Instagram',
    assignee: 'Salsabeel Khaleel',
    assigneeInitials: 'SK',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 4)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      return date.toISOString()
    })(),
    tags: ['Premium'],
    stage: 'Validated',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 1)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Customer very interested in GLE 350. Premium buyer, validated contact details. Needs pricing and financing information. Ready to move forward.',
        transcription: null
      }
    ]
  },
  // Customer 5 (Marco Rossi) - Lead
  {
    id: 17,
    customerId: 5,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Fiat', 
      model: '500X', 
      year: 2023, 
      price: 24000, 
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      vin: 'FIAT123456789',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Manual',
      registration: '04/2023',
      dealership: 'Florence',
      stockDays: 90,
      requestMessage: 'Italian brand preference - family vehicle'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Facebook',
    assignee: 'David Miller',
    assigneeInitials: 'DM',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 6)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 3)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      return date.toISOString()
    })(),
    tags: [],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Customer 11 (Laura Zimmermann) - Lead
  {
    id: 18,
    customerId: 11,
    status: 'Open',
    priority: 'Urgent',
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'Tiguan', 
      year: 2023, 
      price: 32000, 
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      vin: 'VWTIGUAN123',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '03/2023',
      dealership: 'Berlin',
      stockDays: 60,
      requestMessage: 'Urgent need - compact SUV with safety features'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Walk-in',
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
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
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 4)
      return date.toISOString()
    })(),
    tags: ['Urgent'],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Customer 13 (Nina Keller) - Lead
  {
    id: 19,
    customerId: 13,
    status: 'Open',
    priority: 'Hot',
    requestedCar: { 
      brand: 'Mini', 
      model: 'Cooper S', 
      year: 2024, 
      price: 35000, 
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60',
      vin: 'MINI987654321',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Frankfurt',
      stockDays: 3,
      requestMessage: 'Stylish compact car for city driving'
    },
    carStatus: 'In Stock',
    requestType: 'Test Drive',
    source: 'Facebook',
    assignee: 'Salsabeel Khaleel',
    assigneeInitials: 'SK',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 6)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString()
    })(),
    tags: ['VIP'],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Customer 18 (Dr. Andreas Werner) - Lead
  {
    id: 20,
    customerId: 18,
    status: 'Open',
    priority: 'Hot',
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'S-Class', 
      year: 2024, 
      price: 120000, 
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      vin: 'MBS123456789',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Düsseldorf',
      stockDays: 2,
      requestMessage: 'Executive vehicle for company car program'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Facebook',
    assignee: 'Salsabeel Khaleel',
    assigneeInitials: 'SK',
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
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString()
    })(),
    tags: ['VIP', 'Premium'],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Lead 21 - To be called back with OVERDUE callback
  {
    id: 21,
    customerId: 9,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Audi', 
      model: 'A4', 
      year: 2023, 
      price: 42000, 
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      vin: 'AUDI456789012',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '07/2023',
      dealership: 'Berlin',
      stockDays: 80,
      requestMessage: 'Looking for A4 sedan. Need to schedule callback.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'David Miller',
    assigneeInitials: 'DM',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 4)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 3) // OVERDUE callback by 3 hours
      return date.toISOString()
    })(),
    callbackDate: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 3) // Callback was scheduled 3 hours ago - OVERDUE
      return date.toISOString()
    })(),
    callbackScheduled: true,
    tags: [],
    stage: 'Open', // Will map to "To be called back" due to callbackDate
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 3)
          return date.toISOString()
        })(),
        outcome: 'no-answer',
        channel: 'phone',
        notes: 'No answer on initial call',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 2)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Customer requested callback at specific time. Scheduled for today.',
        transcription: null
      }
    ]
  },
  // Lead 22 - To be called back with URGENT upcoming callback
  {
    id: 22,
    customerId: 14,
    status: 'Open',
    priority: 'Hot',
    requestedCar: { 
      brand: 'BMW', 
      model: 'X3', 
      year: 2024, 
      price: 52000, 
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60',
      vin: 'BMW789012345',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '02/2024',
      dealership: 'Munich',
      stockDays: 25,
      requestMessage: 'Interested in X3. Call me back tomorrow morning.'
    },
    carStatus: 'In Stock',
    requestType: 'Test Drive',
    source: 'Facebook',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Salsabeel Khaleel',
    assigneeInitials: 'SK',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 12)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 2) // URGENT - callback in 2 hours
      return date.toISOString()
    })(),
    callbackDate: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 2) // Callback scheduled in 2 hours - URGENT
      return date.toISOString()
    })(),
    callbackScheduled: true,
    tags: ['Hot'],
    stage: 'Open', // Will map to "To be called back" due to callbackDate
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setHours(date.getHours() - 12)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Customer very interested. Requested urgent callback tomorrow morning at 10 AM.',
        transcription: null
      }
    ]
  },
  // Lead 23 - Validated with multiple contact attempts before validation
  {
    id: 23,
    customerId: 15,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Mercedes-Benz', 
      model: 'C-Class', 
      year: 2024, 
      price: 48000, 
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=60',
      vin: 'MBC123456789',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Hamburg',
      stockDays: 10,
      requestMessage: 'Looking for C-Class sedan. Multiple attempts needed to reach me.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 7)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      return date.toISOString()
    })(),
    tags: [],
    stage: 'Validated',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 6)
          return date.toISOString()
        })(),
        outcome: 'no-answer',
        channel: 'phone',
        notes: 'First attempt - no answer',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 5)
          return date.toISOString()
        })(),
        outcome: 'voicemail',
        channel: 'phone',
        notes: 'Second attempt - left voicemail',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 3)
          return date.toISOString()
        })(),
        outcome: 'no-answer',
        channel: 'phone',
        notes: 'Third attempt - no answer',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 1)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Finally reached customer. Very interested in C-Class. Validated contact details and requirements. Ready to proceed.',
        transcription: null
      }
    ]
  },
  // Lead 24 - Closed - Invalid with contact attempts showing why it's invalid
  {
    id: 24,
    customerId: 19,
    status: 'Disqualified',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'Passat', 
      year: 2023, 
      price: 35000, 
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      vin: 'VWPASSAT123',
      kilometers: 10,
      status: 'Used',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '08/2023',
      dealership: 'Berlin',
      stockDays: 150,
      requestMessage: 'Interested in Passat but vehicle was already sold.'
    },
    carStatus: 'Sold',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'David Miller',
    assigneeInitials: 'DM',
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
    nextActionDue: null,
    tags: [],
    stage: 'Not Valid',
    isDisqualified: true,
    disqualifyReason: 'Vehicle sold',
    disqualifyCategory: 'Not Valid',
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 8)
          return date.toISOString()
        })(),
        outcome: 'no-answer',
        channel: 'phone',
        notes: 'First attempt - no answer',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 5)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Reached customer. Vehicle they requested was already sold. Customer not interested in alternatives. Disqualified as invalid.',
        transcription: null
      }
    ]
  },
  // Lead 25 - Closed - Not Interested with conversation history
  {
    id: 25,
    customerId: 20,
    status: 'Disqualified',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Audi', 
      model: 'Q5', 
      year: 2024, 
      price: 58000, 
      image: 'https://images.unsplash.com/photo-1589536672709-a5d34b12466d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGF1ZGl8ZW58MHx8MHx8fDA%3D',
      vin: 'AUDIQ5123456',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Firenze',
      stockDays: 12,
      requestMessage: 'Interested in Q5 but decided to postpone purchase.'
    },
    carStatus: 'In Stock',
    requestType: 'Test Drive',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 12)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    nextActionDue: null,
    tags: [],
    stage: 'Not Interested',
    isDisqualified: true,
    disqualifyReason: 'Purchase postponed',
    disqualifyCategory: 'Not Interested',
    scheduledAppointment: null,
    contactAttempts: [
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 10)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Initial contact - customer showed interest in Q5. Scheduled test drive.',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 5)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Follow-up call. Customer mentioned financial constraints and decided to postpone purchase for 6-12 months.',
        transcription: null
      },
      {
        timestamp: (() => {
          const date = new Date()
          date.setDate(date.getDate() - 2)
          return date.toISOString()
        })(),
        outcome: 'spoke-to-customer',
        channel: 'phone',
        notes: 'Final confirmation call. Customer confirmed decision to postpone. Not interested at this time. Disqualified.',
        transcription: null
      }
    ]
  },
  // Lead 26 - New lead with upcoming deadline (not urgent, not overdue)
  {
    id: 26,
    customerId: 21,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'BMW', 
      model: '1 Series', 
      year: 2024, 
      price: 32000, 
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60',
      vin: 'BMW1SERIES123',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Munich',
      stockDays: 18,
      requestMessage: 'Looking for compact BMW 1 Series. Standard follow-up timeline.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'David Miller',
    assigneeInitials: 'DM',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2) // Upcoming deadline in 2 days - not urgent, not overdue
      return date.toISOString()
    })(),
    tags: [],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Lead 27 - New lead with no deadline yet (very fresh, just created)
  {
    id: 27,
    customerId: 22,
    status: 'Open',
    priority: 'Normal',
    requestedCar: { 
      brand: 'Volkswagen', 
      model: 'Polo', 
      year: 2024, 
      price: 22000, 
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      vin: 'VWPOLO2024',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Manual',
      registration: '01/2024',
      dealership: 'Berlin',
      stockDays: 5,
      requestMessage: 'Just submitted inquiry. Very fresh lead with no deadline set yet.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Natalia Sung',
    assigneeInitials: 'NS',
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 1) // Created 1 hour ago - very fresh
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 1)
      return date.toISOString()
    })(),
    nextActionDue: null, // No deadline set yet - very fresh lead
    tags: [],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Lead for customer 2
  {
    id: 28,
    customerId: 2,
    status: 'Open',
    priority: 'Normal',
    requestedCar: {
      brand: 'Mercedes-Benz',
      model: 'EQS',
      year: 2024,
      price: 95000,
      image: 'https://images.unsplash.com/photo-1546518071-fddcdda7580a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVyY2VkZXN8ZW58MHx8MHx8fDA%3D',
      vin: '8912345X6789',
      kilometers: 0,
      status: 'New',
      fuelType: 'Electric',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Berlin Mitte',
      stockDays: 42,
      requestMessage: 'Interested in electric vehicles. Looking for reliable and fuel-efficient options.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 4)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 6)
      return date.toISOString()
    })(),
    tags: [],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Lead for customer 3
  {
    id: 29,
    customerId: 3,
    status: 'Open',
    priority: 'Hot',
    requestedCar: {
      brand: 'BMW',
      model: 'M4 Coupe',
      year: 2024,
      price: 85000,
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=60',
      vin: 'BMW456789012',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '02/2024',
      dealership: 'Berlin',
      stockDays: 15,
      requestMessage: 'Interested in sporty coupes. Looking for performance vehicles.'
    },
    carStatus: 'In Stock',
    requestType: 'Test Drive',
    source: 'Google Ads',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'David Miller',
    assigneeInitials: 'DM',
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
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 4)
      return date.toISOString()
    })(),
    tags: ['Hot'],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Lead for customer 8
  {
    id: 30,
    customerId: 8,
    status: 'Open',
    priority: 'Normal',
    requestedCar: {
      brand: 'Audi',
      model: 'A6',
      year: 2024,
      price: 65000,
      image: 'https://images.unsplash.com/photo-1613246922662-c0b007a418d5?w=900&auto=format&fit=crop&q=60',
      vin: 'AUDI789012345',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Düsseldorf',
      stockDays: 8,
      requestMessage: 'Looking for premium sedan for business use.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Walk-in',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Michael Thomas',
    assigneeInitials: 'MT',
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
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 8)
      return date.toISOString()
    })(),
    tags: [],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Lead for customer 16
  {
    id: 31,
    customerId: 16,
    status: 'Open',
    priority: 'Normal',
    requestedCar: {
      brand: 'BMW',
      model: '5 Series',
      year: 2024,
      price: 70000,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGJtd3xlbnwwfHwwfHx8MA%3D%3D',
      vin: 'BMW567890123',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Automatic',
      registration: '01/2024',
      dealership: 'Hamburg',
      stockDays: 12,
      requestMessage: 'Corporate fleet inquiry. Need executive sedans for company.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Google Ads',
    fiscalEntity: 'Klein GmbH',
    sourceDetails: '',
    assignee: 'David Miller',
    assigneeInitials: 'DM',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 5)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 12)
      return date.toISOString()
    })(),
    tags: ['Corporate'],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  },
  // Lead for customer 17
  {
    id: 32,
    customerId: 17,
    status: 'Open',
    priority: 'Normal',
    requestedCar: {
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2024,
      price: 28000,
      image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&auto=format&fit=crop&q=60',
      vin: 'VW987654321',
      kilometers: 0,
      status: 'New',
      fuelType: 'Petrol',
      gearType: 'Manual',
      registration: '01/2024',
      dealership: 'Frankfurt',
      stockDays: 20,
      requestMessage: 'Looking for reliable family vehicle with good fuel economy.'
    },
    carStatus: 'In Stock',
    requestType: 'Quotation',
    source: 'Walk-in',
    fiscalEntity: '',
    sourceDetails: '',
    assignee: 'Sarah Jenkins',
    assigneeInitials: 'SJ',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })(),
    lastActivity: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 3)
      return date.toISOString()
    })(),
    nextActionDue: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 6)
      return date.toISOString()
    })(),
    tags: [],
    stage: 'Open',
    isDisqualified: false,
    disqualifyReason: null,
    scheduledAppointment: null,
    contactAttempts: []
  }
]



