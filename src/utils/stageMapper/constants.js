/**
 * Stage Constants
 * 
 * Centralized stage definitions for leads and opportunities
 */

export const OPPORTUNITY_STAGES = {
  QUALIFIED: 'Qualified',
  AWAITING_APPOINTMENT: 'Awaiting Appointment',
  APPOINTMENT_SCHEDULED: 'Appointment Scheduled',
  IN_NEGOTIATION: 'In Negotiation',
  CONTRACT_PENDING: 'In Negotiation - Contract Pending',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
  ABANDONED: 'Abandoned'
}

// Delivery Substatus - used within Closed Won stage
export const DELIVERY_SUBSTATUS = {
  NONE: null,
  AWAITING_DELIVERY: 'Awaiting Delivery',
  DELIVERED: 'Delivered'
}

export const LEAD_STAGES = {
  NEW: 'New',
  TO_BE_CALLED_BACK: 'To be called back',
  VALID_TO_BE_CALLED_BACK: 'Valid - to be called back',
  VALID: 'Valid',
  CLOSED_INVALID: 'Closed - Invalid',
  CLOSED_NOT_INTERESTED: 'Closed - Not Interested',
  CLOSED_DUPLICATE: 'Closed - Duplicate'
}

export const API_STATUSES = {
  OPEN: 'Open',
  QUALIFIED: 'Qualified',
  IN_NEGOTIATION: 'In Negotiation',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
  REGISTRATION: 'Registration',
  OPEN_LEAD: 'Open',
  VALIDATED: 'Validated',
  CLOSED_FAILED: 'Closed Failed',
  NOT_VALID: 'Not Valid',
  NOT_INTERESTED: 'Not Interested'
}



