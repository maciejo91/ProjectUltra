import { createDateOffset, createHourOffset } from '@/utils/mockDataHelpers'

export const mockTasks = [
  {
    id: 1,
    title: 'Follow up on test drive request',
    description: 'Customer requested test drive for Audi A6 Allroad. Schedule appointment.',
    status: 'active',
    priority: 'high',
    dueDate: createHourOffset(24),
    customerId: 1,
    leadId: 21,
    opportunityId: null,
    assignee: 'Salsabeel Khaleel',
    createdAt: createHourOffset(-4)
  },
  {
    id: 2,
    title: 'Send quotation for Mercedes EQS',
    description: 'Prepare and send detailed quotation for EQS model.',
    status: 'active',
    priority: 'normal',
    dueDate: createHourOffset(48),
    customerId: 2,
    leadId: 2,
    opportunityId: null,
    assignee: 'Sarah Jenkins',
    createdAt: createHourOffset(-5)
  },
  {
    id: 3,
    title: 'Review financing options',
    description: 'Customer needs financing information for Audi e-tron GT purchase.',
    status: 'active',
    priority: 'high',
    dueDate: createHourOffset(72),
    customerId: 21,
    leadId: null,
    opportunityId: 1,
    assignee: 'Salsabeel Khaleel',
    createdAt: createHourOffset(-3)
  },
  {
    id: 4,
    title: 'Schedule delivery date',
    description: 'Coordinate delivery date for Porsche Taycan purchase.',
    status: 'active',
    priority: 'normal',
    dueDate: createDateOffset(5),
    customerId: 30,
    leadId: null,
    opportunityId: 3,
    assignee: 'Salsabeel Khaleel',
    createdAt: createHourOffset(-2)
  },
  {
    id: 5,
    title: 'Customer contact verification',
    description: 'Verify customer contact details and preferred communication method.',
    status: 'active',
    priority: 'normal',
    dueDate: createHourOffset(4),
    customerId: 3,
    leadId: 3,
    opportunityId: null,
    assignee: 'David Miller',
    createdAt: createHourOffset(-1)
  },
  {
    id: 6,
    title: 'Prepare trade-in evaluation',
    description: 'Customer wants to trade in their current vehicle. Schedule evaluation.',
    status: 'active',
    priority: 'normal',
    dueDate: createDateOffset(7),
    customerId: 4,
    leadId: null,
    opportunityId: null,
    assignee: 'Sarah Jenkins',
    createdAt: createHourOffset(-12)
  },
  {
    id: 7,
    title: 'Follow up on offer response',
    description: 'Customer received offer for BMW iX. Follow up on their response.',
    status: 'active',
    priority: 'high',
    dueDate: createHourOffset(24),
    customerId: 30,
    leadId: null,
    opportunityId: 2,
    assignee: 'Salsabeel Khaleel',
    createdAt: createHourOffset(-3)
  },
  {
    id: 8,
    title: 'Complete paperwork',
    description: 'Complete all necessary paperwork for Tesla Model S purchase.',
    status: 'active',
    priority: 'normal',
    dueDate: createDateOffset(4),
    customerId: 31,
    leadId: null,
    opportunityId: 4,
    assignee: 'Salsabeel Khaleel',
    createdAt: createHourOffset(-6)
  }
]
