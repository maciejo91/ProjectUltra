/**
 * Opportunity State Machine Configuration
 * 
 * Pure configuration defining what actions and widgets exist for each stage.
 * No business logic - just data structure.
 */

export const OPPORTUNITY_STATE_CONFIG = {
  'Qualified': {
    primaryAction: {
      key: 'schedule-appointment',
      title: 'Schedule First Appointment',
      description: 'Begin the sales process by scheduling an appointment with the customer',
      label: 'Schedule Appointment',
      icon: 'fa-solid fa-calendar-plus',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      colorScheme: { background: 'bg-blue-50/50', border: 'border-blue-100' }
    },
    secondaryActions: [
      {
        key: 'select-vehicle',
        label: 'Select Vehicle',
        icon: 'fa-solid fa-car',
        description: 'Choose a vehicle for this opportunity'
      },
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'close-lost',
        label: 'Close as Lost',
        icon: 'fa-solid fa-xmark'
      }
    ],
    taskWidgets: [
      { type: 'OOFB', condition: 'qualified-no-offers-7-13-days' },
      { type: 'UFB', condition: 'qualified-no-offers-14-plus-days' }
    ]
  },

  'Awaiting Appointment': {
    primaryAction: (context) => {
      // If appointment is scheduled, show management options
      if (context.scheduledAppointment && context.scheduledAppointment.start) {
        return {
          key: 'manage-appointment',
          title: 'Manage Appointment',
          description: (context) => {
            const appointmentDate = new Date(context.scheduledAppointment.start)
            return `Appointment scheduled for ${context.formatDateTime ? context.formatDateTime(context.scheduledAppointment.start) : appointmentDate.toLocaleString()}`
          },
          label: 'Manage Appointment',
          icon: 'fa-solid fa-calendar-check',
          buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
          colorScheme: { background: 'bg-purple-50/50', border: 'border-purple-100' }
        }
      }
      // No appointment scheduled - show schedule option
      return {
        key: 'schedule-appointment',
        title: 'Schedule Appointment',
        description: 'An appointment needs to be scheduled to move forward with this opportunity',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        colorScheme: { background: 'bg-blue-50/50', border: 'border-blue-100' }
      }
    },
    secondaryActions: [
      {
        key: 'reschedule',
        label: 'Reschedule',
        icon: 'fa-solid fa-calendar-days',
        description: 'Change appointment date/time',
        conditional: 'has-appointment'
      },
      {
        key: 'cancel-appointment',
        label: 'Cancel Appointment',
        icon: 'fa-solid fa-calendar-xmark',
        description: 'Cancel the scheduled appointment',
        conditional: 'has-appointment'
      },
      {
        key: 'mark-no-show',
        label: 'Mark as No-Show',
        icon: 'fa-solid fa-user-slash',
        description: 'Mark appointment as no-show and create NS task',
        conditional: 'appointment-past-not-completed'
      },
      {
        key: 'create-offer',
        label: 'Create Offer',
        icon: 'fa-solid fa-file-lines',
        description: 'Skip appointment and create an offer directly',
        conditional: 'no-appointment'
      },
      {
        key: 'select-vehicle',
        label: 'Select Vehicle',
        icon: 'fa-solid fa-car',
        description: 'Choose a vehicle for this opportunity'
      },
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'close-lost',
        label: 'Close as Lost',
        icon: 'fa-solid fa-xmark'
      }
    ],
    taskWidgets: [
      { type: 'OOFB', condition: 'qualified-no-offers-7-13-days' },
      { type: 'UFB', condition: 'qualified-no-offers-14-plus-days' }
    ]
  },

  'Appointment Scheduled': {
    primaryAction: {
      key: 'reschedule',
      title: 'Reschedule Appointment',
      description: (context) => {
        if (context.scheduledAppointment && context.scheduledAppointment.start) {
          return `Scheduled for ${context.formatDateTime ? context.formatDateTime(context.scheduledAppointment.start) : new Date(context.scheduledAppointment.start).toLocaleString()}`
        }
        return 'Schedule an appointment to move forward'
      },
      label: 'Reschedule',
      icon: 'fa-solid fa-calendar-days',
      buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      colorScheme: { background: 'bg-purple-50/50', border: 'border-purple-100' }
    },
    secondaryActions: [
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'cancel-appointment',
        label: 'Cancel Appointment',
        icon: 'fa-solid fa-calendar-xmark'
      },
      {
        key: 'close-lost',
        label: 'Close as Lost',
        icon: 'fa-solid fa-xmark'
      }
    ],
    taskWidgets: [
      { type: 'NS', condition: 'appointment-past-not-completed' }
    ]
  },

  'In Negotiation - Awaiting Offer': {
    primaryAction: {
      key: 'create-offer',
      title: 'Create Offer',
      description: 'Create initial offer to begin negotiation',
      label: 'Create Offer',
      icon: 'fa-solid fa-file-invoice-dollar',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      colorScheme: { background: 'bg-yellow-50/50', border: 'border-yellow-100' }
    },
    secondaryActions: [
      { key: 'schedule-appointment', label: 'Schedule Appointment', icon: 'fa-solid fa-calendar-plus', description: 'Schedule a new appointment' },
      { key: 'close-lost', label: 'Close as Lost', icon: 'fa-solid fa-xmark' }
    ]
  },

  'In Negotiation': {
    primaryAction: (context) => {
      // Default: No offers yet - show create offer action
      if (!context.hasOffers) {
        return {
          key: 'create-offer',
          title: 'Create Offer',
          description: 'Create initial offer to begin negotiation',
          label: 'Create Offer',
          icon: 'fa-solid fa-file-invoice-dollar',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          colorScheme: { background: 'bg-yellow-50/50', border: 'border-yellow-100' }
        }
      }
      
      // Has offers but no substatus or unknown substatus - default to Offer Sent behavior
      return null
    },
    secondaryActions: [
      {
        key: 'reassign',
        label: 'Reassign',
        icon: 'fa-solid fa-user-group',
        description: 'Assign this opportunity to another sales rep'
      },
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'close-lost',
        label: 'Close as Lost',
        icon: 'fa-solid fa-xmark'
      }
    ],
    taskWidgets: [
      { type: 'NFU', condition: 'negotiation-offer-feedback-5-plus-days-no-appointment' }
    ]
  },

  'In Negotiation - Offer Sent': {
    // With scheduled appointment: Manage appointment is primary. Without: Manage Offers & Follow Up is primary (never both).
    primaryAction: (context) => {
      if (context.scheduledAppointment && context.scheduledAppointment.start) {
        return {
          key: 'manage-appointment',
          title: 'Manage Appointment',
          description: (ctx) => {
            const appointmentDate = new Date(ctx.scheduledAppointment.start)
            return `Appointment scheduled for ${ctx.formatDateTime ? ctx.formatDateTime(ctx.scheduledAppointment.start) : appointmentDate.toLocaleString()}`
          },
          label: 'Manage Appointment',
          icon: 'fa-solid fa-calendar-check',
          buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
          colorScheme: { background: 'bg-purple-50/50', border: 'border-purple-100' }
        }
      }
      return {
        key: 'manage-offers-follow-up',
        title: 'Manage Offers & Follow Up',
        description: 'Send and manage offers, request feedback, and follow up with the customer',
        label: 'Manage Offers & Follow Up',
        icon: 'fa-solid fa-file-invoice-dollar',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        colorScheme: { background: 'bg-yellow-50/50', border: 'border-yellow-100' }
      }
    },
    secondaryActions: [
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'close-lost',
        label: 'Close as Lost',
        icon: 'fa-solid fa-xmark'
      }
    ],
    taskWidgets: []
  },

  'In Negotiation - Offer Feedback': {
    primaryAction: (context) => {
      if (context.scheduledAppointment && context.scheduledAppointment.start) {
        return {
          key: 'manage-appointment',
          title: 'Manage Appointment',
          description: (ctx) => {
            const appointmentDate = new Date(ctx.scheduledAppointment.start)
            return `Appointment scheduled for ${ctx.formatDateTime ? ctx.formatDateTime(ctx.scheduledAppointment.start) : appointmentDate.toLocaleString()}`
          },
          label: 'Manage Appointment',
          icon: 'fa-solid fa-calendar-check',
          buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
          colorScheme: { background: 'bg-purple-50/50', border: 'border-purple-100' }
        }
      }
      return {
        key: 'manage-offers-follow-up',
        title: 'Manage Offers & Follow Up',
        description: 'Request feedback from customer and follow up on offers',
        label: 'Manage Offers & Follow Up',
        icon: 'fa-solid fa-file-invoice-dollar',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        colorScheme: { background: 'bg-yellow-50/50', border: 'border-yellow-100' }
      }
    },
    secondaryActions: [
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'close-lost',
        label: 'Close as Lost',
        icon: 'fa-solid fa-xmark'
      }
    ],
    taskWidgets: [
      { type: 'NFU', condition: 'negotiation-offer-feedback-5-plus-days-no-appointment' }
    ]
  },

  'In Negotiation - Contract Pending': {
    // Sequential primary actions: Step 1 (Set Delivery Date) → Step 2 (Collect e-signatures)
    primaryAction: (context) => {
      const opp = context.opportunity
      const hasDeliveryDate = !!opp.deliveryDate
      const hasESignature = !!opp.contractSigned || !!opp.esignatureCollectedDate
      
      // Step 2: Collect e-signatures (only shows after Step 1 is done)
      if (hasDeliveryDate && !hasESignature) {
        return {
          key: 'collect-esignatures',
          title: 'Collect e-signatures',
          description: 'Get the formal contract signed electronically by the customer',
          label: 'Collect e-signatures',
          icon: 'fa-solid fa-file-signature',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          colorScheme: { background: 'bg-blue-50/50', border: 'border-blue-100' }
        }
      }
      
      // Step 1: Set Delivery Date (shows first)
      if (!hasDeliveryDate) {
        return {
          key: 'set-delivery-date',
          title: 'Set Delivery Date',
          description: 'Schedule the delivery date for the vehicle',
          label: 'Set Delivery Date',
          icon: 'fa-solid fa-truck',
          buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
          colorScheme: { background: 'bg-green-50/50', border: 'border-green-100' }
        }
      }
      
      // Both completed - should auto-transition (handled in store)
      return null
    },
    secondaryActions: [
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'close-lost',
        label: 'Close as Lost',
        icon: 'fa-solid fa-xmark'
      }
    ],
    // NOTE: CFB (Contract Feedback Task) is ONLY in Contract Pending stage
    // DFB (Delivery Feedback Task) is NOT in Contract Pending - it only appears in Closed Won stage
    taskWidgets: [
      { type: 'CFB', condition: 'contract-pending-5-plus-days' }
    ]
  },



  'Closed Won': {
    // Primary action varies based on delivery substatus
    primaryAction: (context) => {
      const substatus = context.deliverySubstatus
      
      // Delivered: Show both Collect Feedback and Complete Checklist options
      if (substatus === 'Delivered') {
        // Default to Collect Feedback, but Complete Checklist can be accessed via secondary
        return {
          key: 'collect-feedback',
          title: 'Post-Delivery Follow-up',
          description: 'Vehicle delivered. Collect customer feedback or complete delivery checklist',
          label: 'Confirm Satisfaction',
          icon: 'fa-solid fa-comment',
          buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
          colorScheme: { background: 'bg-green-50/50', border: 'border-green-100' }
        }
      }
      
      // Awaiting Delivery: Confirm delivery
      if (substatus === 'Awaiting Delivery') {
        return {
          key: 'confirm-delivery',
          title: 'Confirm Delivery Details',
          description: 'Delivery scheduled. Confirm date/time with customer',
          label: 'Confirm Delivery',
          icon: 'fa-solid fa-calendar-check',
          buttonClass: 'bg-teal-600 hover:bg-teal-700 text-white',
          colorScheme: { background: 'bg-teal-50/50', border: 'border-teal-100' }
        }
      }
      
      // No delivery scheduled yet: Schedule delivery
      return {
        key: 'schedule-delivery',
        title: 'Set Delivery Date',
        description: 'Contract signed! Schedule vehicle delivery with the customer',
        label: 'Schedule Delivery',
        icon: 'fa-solid fa-truck',
        buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
        colorScheme: { background: 'bg-green-50/50', border: 'border-green-100' }
      }
    },
    secondaryActions: [
      {
        key: 'collect-feedback',
        label: 'Request Feedback',
        icon: 'fa-solid fa-comment',
        conditional: 'is-delivered',
        description: 'Collect customer feedback about delivery experience'
      },
      {
        key: 'complete-checklist',
        label: 'Complete Checklist',
        icon: 'fa-solid fa-clipboard-check',
        conditional: 'is-delivered',
        description: 'Complete post-delivery checklist and documentation'
      },
      {
        key: 'reschedule-delivery',
        label: 'Reschedule',
        icon: 'fa-solid fa-calendar-days',
        conditional: 'is-awaiting-delivery',
        description: 'Reschedule the delivery date'
      },
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'archive',
        label: 'Archive',
        icon: 'fa-solid fa-archive',
        conditional: 'is-delivered',
        description: 'Archive this completed opportunity'
      },
      {
        key: 'close-lost',
        label: 'Close as Lost',
        icon: 'fa-solid fa-xmark'
      }
    ],
    // NOTE: Task widgets for Closed Won:
    // - CFB (Contract Feedback) shows if contract exists and is 5+ days old
    // - "Awaiting Delivery" substatus: Shows DFB (delivery delay feedback)
    // - "Delivered" substatus: Shows DFB (post-delivery feedback)
    taskWidgets: [
      { type: 'CFB', condition: 'closed-won-contract-feedback' },
      { type: 'DFB', condition: 'delivery-delay-feedback-required' },
      { type: 'DFB', condition: 'delivery-feedback-required' }
    ]
  },

  'Closed Lost': {
    primaryAction: {
      key: 'reopen',
      title: 'Reopen Opportunity',
      description: 'This opportunity was closed as lost. Reopen it to continue the sales process.',
      label: 'Reopen Opportunity',
      icon: 'fa-solid fa-rotate-left',
      buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
      colorScheme: { background: 'bg-gray-50/50', border: 'border-gray-100' }
    },
    secondaryActions: [
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'requalify',
        label: 'Requalify as Lead',
        icon: 'fa-solid fa-arrow-left',
        description: 'Convert back to a lead'
      }
    ],
    taskWidgets: []
  },

  'Abandoned': {
    primaryAction: {
      key: 'reopen',
      title: 'Opportunity Abandoned',
      description: 'This opportunity has been inactive for an extended period. Reopen it to continue the sales process.',
      label: 'Reopen Opportunity',
      icon: 'fa-solid fa-rotate-left',
      buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
      colorScheme: { background: 'bg-gray-50/50', border: 'border-gray-100' }
    },
    secondaryActions: [
      {
        key: 'schedule-appointment',
        label: 'Schedule Appointment',
        icon: 'fa-solid fa-calendar-plus',
        description: 'Schedule a new appointment'
      },
      {
        key: 'close-lost',
        label: 'Close as Lost',
        icon: 'fa-solid fa-xmark',
        description: 'Mark this opportunity as lost'
      },
      {
        key: 'requalify',
        label: 'Requalify as Lead',
        icon: 'fa-solid fa-arrow-left',
        description: 'Convert back to a lead'
      }
    ],
    taskWidgets: [
      { type: 'ABANDONED', condition: 'opportunity-abandoned' }
    ]
  }
}

// Special actions for closed opportunities
export const CLOSED_OPPORTUNITY_ACTIONS = {
  reopen: {
    key: 'reopen',
    label: 'Reopen Opportunity',
    icon: 'fa-solid fa-rotate-left',
    description: 'Restart the management process'
  },
  requalify: {
    key: 'requalify',
    label: 'Requalify as Lead',
    icon: 'fa-solid fa-arrow-left',
    description: 'Convert back to a lead'
  },
  closeLost: {
    key: 'close-lost',
    label: 'Close as Lost',
    icon: 'fa-solid fa-xmark'
  }
}

