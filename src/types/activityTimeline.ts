/**
 * Activity records shown in CRM task/request timelines (mock + store shape).
 */

export type ActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'customer-email'
  | 'sms'
  | 'whatsapp'
  | 'customer-whatsapp'
  | 'ai-summary'
  | 'appointment'
  | 'created'
  | 'system'
  | 'status'
  | 'transcription'
  | 'opportunity-created'
  | string

export interface ActivityTranscription {
  leadLines?: string[]
  salesLines?: string[]
}

export interface ActivityData {
  summary?: string
  transcription?: ActivityTranscription
  /** Email channel: sender and recipient addresses */
  from?: string
  to?: string
  /** SMS / WhatsApp: sender and recipient phone numbers (E.164 or display format) */
  fromPhone?: string
  toPhone?: string
  contactName?: string
  /** Optional thread identifier for grouping messages */
  threadId?: string
}

export interface ActivityRecord {
  id?: string | number
  type: ActivityType
  user?: string
  action?: string
  message?: string
  content?: string
  timestamp?: string
  createdAt?: string
  time?: string
  title?: string
  location?: string
  customerName?: string
  vehicle?: string
  transcription?: ActivityTranscription
  data?: ActivityData
  leadId?: number
  opportunityId?: number
  threadId?: string
}

export type ActivityTimelineCardAccent =
  | 'note'
  | 'message'
  | 'messageGreen'
  | 'sms'
  | 'email'
  | 'call'
  | 'ai'
  | 'appointment'
  | 'default'

export interface ActivityTimelineHeadlineParts {
  primary: string
  secondary: string | null
}

export type ActivityTimelineIconKind =
  | 'note'
  | 'call'
  | 'callMissed'
  | 'email'
  | 'message'
  | 'messageGreen'
  | 'ai'
  | 'appointment'
  | 'system'
  | 'file'
