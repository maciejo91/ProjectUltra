export const mockTasks = [
  {
    id: 1,
    title: 'Follow up on test drive request',
    description: 'Customer requested test drive for Audi A6 Allroad. Schedule appointment.',
    status: 'active',
    priority: 'high',
    dueDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString()
    })(),
    customerId: 1,
    leadId: 21,
    opportunityId: null,
    assignee: 'Salsabeel Khaleel',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })()
  },
  {
    id: 2,
    title: 'Send quotation for Mercedes EQS',
    description: 'Prepare and send detailed quotation for EQS model.',
    status: 'active',
    priority: 'normal',
    dueDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 2)
      return date.toISOString()
    })(),
    customerId: 2,
    leadId: 2,
    opportunityId: null,
    assignee: 'Sarah Jenkins',
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 5)
      return date.toISOString()
    })()
  },
  {
    id: 3,
    title: 'Review financing options',
    description: 'Customer needs financing information for Audi e-tron GT purchase.',
    status: 'active',
    priority: 'high',
    dueDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 3)
      return date.toISOString()
    })(),
    customerId: 21,
    leadId: null,
    opportunityId: 1,
    assignee: 'Salsabeel Khaleel',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })()
  },
  {
    id: 4,
    title: 'Schedule delivery date',
    description: 'Coordinate delivery date for Porsche Taycan purchase.',
    status: 'active',
    priority: 'normal',
    dueDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 5)
      return date.toISOString()
    })(),
    customerId: 30,
    leadId: null,
    opportunityId: 3,
    assignee: 'Salsabeel Khaleel',
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 2)
      return date.toISOString()
    })()
  },
  {
    id: 5,
    title: 'Customer contact verification',
    description: 'Verify customer contact details and preferred communication method.',
    status: 'active',
    priority: 'normal',
    dueDate: (() => {
      const date = new Date()
      date.setHours(date.getHours() + 4)
      return date.toISOString()
    })(),
    customerId: 3,
    leadId: 3,
    opportunityId: null,
    assignee: 'David Miller',
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 1)
      return date.toISOString()
    })()
  },
  {
    id: 6,
    title: 'Prepare trade-in evaluation',
    description: 'Customer wants to trade in their current vehicle. Schedule evaluation.',
    status: 'active',
    priority: 'normal',
    dueDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 7)
      return date.toISOString()
    })(),
    customerId: 4,
    leadId: null,
    opportunityId: null,
    assignee: 'Sarah Jenkins',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 2)
      return date.toISOString()
    })()
  },
  {
    id: 7,
    title: 'Follow up on offer response',
    description: 'Customer received offer for BMW iX. Follow up on their response.',
    status: 'active',
    priority: 'high',
    dueDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString()
    })(),
    customerId: 30,
    leadId: null,
    opportunityId: 2,
    assignee: 'Salsabeel Khaleel',
    createdAt: (() => {
      const date = new Date()
      date.setHours(date.getHours() - 3)
      return date.toISOString()
    })()
  },
  {
    id: 8,
    title: 'Complete paperwork',
    description: 'Complete all necessary paperwork for Tesla Model S purchase.',
    status: 'active',
    priority: 'normal',
    dueDate: (() => {
      const date = new Date()
      date.setDate(date.getDate() + 4)
      return date.toISOString()
    })(),
    customerId: 31,
    leadId: null,
    opportunityId: 4,
    assignee: 'Salsabeel Khaleel',
    createdAt: (() => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date.toISOString()
    })()
  }
]
