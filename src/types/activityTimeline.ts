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
  | 'ai-agent-action'
  | 'appointment'
  | 'calendar-event'
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
  /** Calendar-event timeline rows */
  calendarEventId?: number
  start?: string
  end?: string
  bookedAt?: string
  eventType?: string
  status?: string
  team?: string
  assignee?: string
  /** AgentSparK action channel */
  agentAction?: 'call' | 'email' | 'whatsapp' | 'sms'
  /** Expandable system event (merge, reconciliation, etc.) */
  richSystemEvent?: boolean
  systemIcon?: 'info' | 'merge'
  sectionsTitle?: string
  summary?: string
  sections?: Array<{
    title?: string
    fields?: Array<{ label: string; value: string }>
  }>
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
  | 'calendarEvent'
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
  | 'calendarEvent'
  | 'system'
  | 'file'
