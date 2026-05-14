import { ref, computed, watch } from 'vue'
import { normalizeMotorkDateFieldToIso } from '@/utils/motorkDateField.js'

/**
 * Composable for LQWidget outcome selection logic
 * Manages outcome selection state, assignment, preferences, and related handlers
 */
/** Human-readable outcome labels for logging */
const OUTCOME_LABELS = { answer: 'Answer', 'no-answer': 'No answer', 'not-valid': 'Not valid' }

/** Human-readable next-step labels for logging */
const NEXT_STEP_LABELS = {
  postpone: 'Postpone',
  'close-lead': 'Close lead',
  interested: 'Interested',
  'not-interested': 'Not interested'
}

export function useLQWidgetOutcomes(lead, callDataRef, extractedDataRef, contactAttemptsRef, maxContactAttemptsRef, currentUserRef) {
  const showOutcomeSelection = ref(true)
  const selectedOutcome = ref(null) // 'answer' | 'no-answer' | 'not-valid'
  const selectedNextStep = ref(null)   // no-answer: 'postpone'|'close-lead'; answer: 'interested'|'not-interested'|'postpone'; not-valid: none
  const showNoteModal = ref(false)
  const showScheduleAppointmentModal = ref(false)
  
  // Call log form state (shown before outcome selection)
  const showCallLogForm = ref(false)
  const callLogDateTime = ref('')
  const callLogAssignee = ref(null)

  // Next attempt assignee (reassign) – who will handle the next call attempt; defaults to current assignee
  const nextAttemptAssignee = ref(null)

  // No Answer state
  const followupChannels = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'sms', label: 'SMS' },
    { value: 'email', label: 'Email' },
    { value: 'dont-send', label: "Don't send" }
  ]
  const followupChannel = ref('dont-send')
  const selectedTemplate = ref('followup-1')
  const rescheduleTime = ref(null)
  const customDate = ref('')
  const customTime = ref('09:00')
  const aiSuggestionData = ref(null)

  // Mark selected postpone time as scheduled recall appointment (Answer + Postpone)
  const markAsScheduledRecall = ref(false)

  // Not Valid state
  const disqualifyCategory = ref('Not Interested')
  const disqualifyReason = ref('')

  // Assignment state
  const assignment = ref({
    dealership: lead.value?.requestedCar?.dealership || 'Barcelona',
    team: 'Audi Sales (New)',
    assigneeId: currentUserRef?.value?.id || null
  })

  // Team selection state (for scheduling flow)
  const qualificationSelectedTeam = ref(null)
  const qualificationSelectedSalesman = ref(null)
  
  // Communication preferences state
  const communicationPreferences = ref({
    immediateConfirmation: {
      enabled: true,
      channels: ['email']
    },
    reminder: {
      enabled: true,
      channels: ['email']
    },
    salespersonNotification: {
      enabled: true
    }
  })
  
  // Suggested team based on vehicle
  const suggestedTeam = computed(() => {
    if (!lead.value?.requestedCar) return null
    
    const condition = lead.value.requestedCar.condition?.toLowerCase()
    // Map vehicle condition to team
    // Used vehicles → Sales (Used) team (id: 7)
    // New vehicles → Sales (New) team (id: 5)
    if (condition === 'used') {
      return { id: 7, name: 'Sales (Used)', dealershipId: 2, dealership: 'Firenze' }
    } else if (condition === 'new') {
      return { id: 5, name: 'Sales (New)', dealershipId: 3, dealership: 'Milano' }
    }
    return null
  })

  const preferences = ref({
    tradeIn: false,
    financing: false,
    contactAvailability: false
  })

  // Survey state
  const surveyCompleted = ref(false)
  const surveyResponses = ref(null)
  const showSurvey = ref(true) // Show by default when Interested selected

  // Success state (post qualify/disqualify/no-answer)
  const successState = ref(null) // { kind: 'qualified'|'no-answer'|'not-interested', statusText, meeting? }
  const successPerformedAt = ref(null) // Date

  const qualificationMethod = ref('assign-and-schedule')
  const qualificationEventType = ref('')
  const qualificationDurationMinutes = ref(null) // 30 | 60 | null
  const qualificationCustomDuration = ref('')
  
  // Date range selection
  const qualificationDateRange = ref(null) // 'this-week', 'tomorrow', 'custom'
  const qualificationCustomDateStart = ref('')
  const qualificationCustomDateEnd = ref('')
  const qualificationSelectedDate = ref(null) // Will be set based on range
  const qualificationSelectedSlot = ref('')
  const qualificationScheduleDepartment = ref('')
  const qualificationScheduleDealership = ref('')
  const qualificationScheduleTeamId = ref(null)
  const qualificationScheduleAssigneeFilter = ref('')

  const setQualificationSelectedSlot = (slot) => {
    qualificationSelectedSlot.value = slot
  }

  const qualificationScheduleSlotOptions = computed(() => {
    const slots = []
    for (let m = 9 * 60; m <= 18 * 60; m += 30) {
      const h = String(Math.floor(m / 60)).padStart(2, '0')
      const min = String(m % 60).padStart(2, '0')
      slots.push(`${h}:${min}`)
    }
    return slots
  })

  const qualificationDurationValue = computed(() => {
    if (qualificationDurationMinutes.value != null) return qualificationDurationMinutes.value
    const n = parseInt(qualificationCustomDuration.value, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  })
  
  // Available dates for selected range
  const availableDatesForRange = computed(() => {
    if (!qualificationDateRange.value) return []
    
    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (qualificationDateRange.value === 'tomorrow') {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      // Only add if it's a weekday (Mon-Fri)
      if (tomorrow.getDay() !== 0 && tomorrow.getDay() !== 6) {
        dates.push(tomorrow)
      }
    } else if (qualificationDateRange.value === 'this-week') {
      // Get Monday of this week
      const dayOfWeek = today.getDay()
      const monday = new Date(today)
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      
      // Add all weekdays (Mon-Fri) of this week
      for (let i = 0; i < 5; i++) {
        const date = new Date(monday)
        date.setDate(monday.getDate() + i)
        if (date >= today) {
          dates.push(date)
        }
      }
    } else if (qualificationDateRange.value === 'custom' && qualificationCustomDateStart.value && qualificationCustomDateEnd.value) {
      const start = new Date(qualificationCustomDateStart.value)
      const end = new Date(qualificationCustomDateEnd.value)
      const current = new Date(start)
      while (current <= end) {
        // Only add weekdays
        if (current.getDay() !== 0 && current.getDay() !== 6) {
          dates.push(new Date(current))
        }
        current.setDate(current.getDate() + 1)
      }
    }
    
    return dates
  })

  // Template bodies with placeholders: {{customer_name}}, {{car_brand}}, {{car_model}}, {{next_call_date}}, {{dealership}}
  const TEMPLATES_WITH_PLACEHOLDERS = {
    'followup-1': 'Hi {{customer_name}}! I tried calling you earlier but couldn\'t reach you. When would be a good time to discuss the {{car_brand}} {{car_model}}?',
    'followup-2': 'Hello {{customer_name}}, this is regarding your inquiry about the {{car_brand}} {{car_model}}. Please let me know when you\'re available for a call.',
    custom: ''
  }

  const messageTemplates = computed(() => ({
    'followup-1': TEMPLATES_WITH_PLACEHOLDERS['followup-1'],
    'followup-2': TEMPLATES_WITH_PLACEHOLDERS['followup-2'],
    custom: TEMPLATES_WITH_PLACEHOLDERS.custom
  }))

  // Editable message body (template with placeholders); user can edit in the multiline input
  const followupMessageBody = ref('')

  const messagePreview = computed(() => followupMessageBody.value)

  /**
   * Resolve placeholders in the message body using lead data and next call date.
   * Placeholders: {{customer_name}}, {{car_brand}}, {{car_model}}, {{next_call_date}}, {{dealership}}
   */
  const resolveFollowupMessage = (body, nextCallDateIso = null) => {
    if (!body || typeof body !== 'string') return ''
    const customerName = lead.value?.customer?.name?.split(' ')[0] || ''
    const carBrand = lead.value?.requestedCar?.brand || ''
    const carModel = lead.value?.requestedCar?.model || ''
    const dealership = lead.value?.requestedCar?.dealership || lead.value?.customer?.dealership || ''
    const nextCallDate = nextCallDateIso != null
      ? (() => {
          try {
            const d = new Date(nextCallDateIso)
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
          } catch {
            return ''
          }
        })()
      : (() => {
          try {
            const iso = calculateNextCallDate()
            if (!iso) return ''
            const d = new Date(iso)
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
          } catch {
            return ''
          }
        })()
    return body
      .replace(/\{\{customer_name\}\}/g, customerName)
      .replace(/\{\{car_brand\}\}/g, carBrand)
      .replace(/\{\{car_model\}\}/g, carModel)
      .replace(/\{\{next_call_date\}\}/g, nextCallDate)
      .replace(/\{\{dealership\}\}/g, dealership)
  }

  // Scheduled appointments are only on opportunities, not leads
  const hasExistingAppointment = computed(() => false)

  const calculateAISuggestion = () => {
    // AI logic: Suggest best time based on lead characteristics
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate suggested date and time
    let suggestedDate = new Date()
    let suggestedTime = '10:00'
    let reason = ''
    
    // If it's Friday afternoon or weekend, suggest Monday morning
    if (dayOfWeek === 5 && hour >= 15) { // Friday after 3 PM
      suggestedDate.setDate(now.getDate() + 3) // Monday
      suggestedTime = '10:00'
      reason = 'Optimal time after weekend, customer likely refreshed'
    } else if (dayOfWeek === 6 || dayOfWeek === 0) { // Weekend
      suggestedDate.setDate(now.getDate() + (dayOfWeek === 6 ? 2 : 1)) // Monday
      suggestedTime = '10:00'
      reason = 'Weekend follow-up avoided, better response rate on weekdays'
    } else if (hour >= 17) { // After 5 PM on weekday
      suggestedDate.setDate(now.getDate() + 1)
      suggestedTime = '10:00'
      reason = 'Business hours preferred, higher engagement rate'
    } else if (hour < 9) { // Before 9 AM
      suggestedDate = new Date(now)
      suggestedDate.setHours(10, 0, 0, 0)
      suggestedTime = '10:00'
      reason = 'Peak response time, customers more available mid-morning'
    } else {
      // Same day, suggest 2 hours later or next day morning
      if (hour < 14) {
        suggestedDate = new Date(now)
        const nextHour = hour + 2
        suggestedDate.setHours(nextHour, 0, 0, 0)
        suggestedTime = `${String(nextHour).padStart(2, '0')}:00`
        reason = 'Follow-up within same day increases conversion likelihood'
      } else {
        suggestedDate.setDate(now.getDate() + 1)
        suggestedDate.setHours(10, 0, 0, 0)
        suggestedTime = '10:00'
        reason = 'Next morning follow-up maintains momentum'
      }
    }
    
    // Format date
    const dateStr = suggestedDate.toISOString().split('T')[0]
    const dateTimeStr = `${dateStr}T${suggestedTime}:00`
    
    return {
      date: dateStr,
      time: suggestedTime,
      dateTime: dateTimeStr,
      reason: reason,
      formattedDate: suggestedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  const calculateNextCallDate = () => {
    if (rescheduleTime.value === 'tomorrow-9am') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      return tomorrow.toISOString()
    } else if (rescheduleTime.value === 'monday') {
      // Use AI suggestion data if available
      if (aiSuggestionData.value) {
        return new Date(aiSuggestionData.value.dateTime).toISOString()
      }
      const monday = new Date()
      const daysUntilMonday = (8 - monday.getDay()) % 7 || 7
      monday.setDate(monday.getDate() + daysUntilMonday)
      monday.setHours(9, 0, 0, 0)
      return monday.toISOString()
    } else if (rescheduleTime.value === 'custom' && customDate.value && customTime.value) {
      const isoDate = normalizeMotorkDateFieldToIso(String(customDate.value).trim())
      if (!isoDate) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(9, 0, 0, 0)
        return tomorrow.toISOString()
      }
      const dateTime = new Date(`${isoDate}T${customTime.value}:00`)
      if (Number.isNaN(dateTime.getTime())) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(9, 0, 0, 0)
        return tomorrow.toISOString()
      }
      return dateTime.toISOString()
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow.toISOString()
  }

  // Sync editable body when template selection changes; fill placeholders from lead data when available
  watch(selectedTemplate, (templateId) => {
    const raw = TEMPLATES_WITH_PLACEHOLDERS[templateId] ?? ''
    followupMessageBody.value = raw ? resolveFollowupMessage(raw, calculateNextCallDate() || null) : ''
  }, { immediate: true })

  const setNextStep = (step) => {
    selectedNextStep.value = step
  }

  const selectOutcome = (outcome) => {
    selectedOutcome.value = outcome
    // Reset next step; default no-answer to postpone so content shows
    if (outcome === 'no-answer') {
      selectedNextStep.value = 'postpone'
    } else if (outcome === 'answer' || outcome === 'not-valid') {
      selectedNextStep.value = null
    }

    // Initialize datetime to "now" when an outcome is selected
    if (!callLogDateTime.value) {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      callLogDateTime.value = `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    // Auto-assign to current user if not already assigned
    if (!callLogAssignee.value && currentUserRef?.value) {
      callLogAssignee.value = currentUserRef.value
    }

    // Autofill next attempt assignee (reassign) with current assignee when no-answer is selected
    if (outcome === 'no-answer' && callLogAssignee.value) {
      nextAttemptAssignee.value = { ...callLogAssignee.value, type: 'user' }
    }

    if (outcome === 'answer') {
      // Reset survey state when selecting answer -> interested path
      surveyCompleted.value = false
      surveyResponses.value = null
      showSurvey.value = true
      
      // Pre-populate from extracted data
      if (extractedDataRef?.value) {
        preferences.value.tradeIn = extractedDataRef.value.tradeIn || false
        preferences.value.financing = extractedDataRef.value.financing || false
      }
    }
  }

  // Labels for logging (human-readable)
  const outcomeLabel = computed(() => selectedOutcome.value ? OUTCOME_LABELS[selectedOutcome.value] || selectedOutcome.value : null)
  const nextStepLabel = computed(() => selectedNextStep.value ? NEXT_STEP_LABELS[selectedNextStep.value] || selectedNextStep.value : null)
  const followUpChannelLabel = computed(() => {
    if (followupChannel.value === 'dont-send') return "Don't send"
    if (followupChannel.value === 'whatsapp') return 'WhatsApp'
    if (followupChannel.value === 'sms') return 'SMS'
    if (followupChannel.value === 'email') return 'Email'
    return followupChannel.value || null
  })

  // Watch for AI suggestion selection
  const handleAISuggestionClick = () => {
    rescheduleTime.value = 'monday'
    aiSuggestionData.value = calculateAISuggestion()
  }

  const cancelOutcome = () => {
    selectedOutcome.value = null
    selectedNextStep.value = null
    showCallLogForm.value = false
  }

  const resetOutcomeState = () => {
    selectedOutcome.value = null
    selectedNextStep.value = null
    showOutcomeSelection.value = true
    followupChannel.value = 'dont-send'
    selectedTemplate.value = 'followup-1'
    rescheduleTime.value = null
    customDate.value = ''
    customTime.value = '09:00'
    markAsScheduledRecall.value = false
    disqualifyCategory.value = 'Not Interested'
    disqualifyReason.value = ''
    surveyCompleted.value = false
    surveyResponses.value = null
    showSurvey.value = true
    aiSuggestionData.value = null
    showCallLogForm.value = false
    callLogDateTime.value = ''
    callLogAssignee.value = null
    nextAttemptAssignee.value = null
    successState.value = null
    successPerformedAt.value = null
    qualificationMethod.value = 'assign-and-schedule'
    qualificationEventType.value = ''
    qualificationDateRange.value = null
    qualificationCustomDateStart.value = ''
    qualificationCustomDateEnd.value = ''
    qualificationSelectedDate.value = null
    qualificationSelectedSlot.value = ''
    qualificationScheduleDepartment.value = ''
    qualificationScheduleDealership.value = ''
    qualificationScheduleTeamId.value = null
    qualificationScheduleAssigneeFilter.value = ''
    qualificationSelectedTeam.value = null
    qualificationSelectedSalesman.value = null
    qualificationDurationMinutes.value = null
    qualificationCustomDuration.value = ''
  }

  const clearSuccessState = () => {
    successState.value = null
    successPerformedAt.value = null
  }

  /**
   * Restore outcome and qualification form state from a postponed-interested draft (e.g. lead.postponedInterestedState).
   * Call when opening a task that was postponed from the interested flow.
   * @param {Object} draft - Saved draft: enrichLeadData, qualificationMethod, qualificationEventType, qualificationScheduleDealership, qualificationScheduleTeamId, qualificationScheduleAssigneeFilter, qualificationSelectedDate (ISO string), qualificationSelectedSlot, qualificationScheduleDepartment, qualificationSelectedTeam, qualificationSelectedSalesman, assignment, callLogDateTime
   */
  const restorePostponedInterestedState = (draft) => {
    if (!draft) return
    successState.value = null
    successPerformedAt.value = null
    selectedOutcome.value = 'answer'
    selectedNextStep.value = 'interested'
    showOutcomeSelection.value = true
    qualificationMethod.value =
      draft.qualificationMethod === 'assign-only' ? 'assign-and-schedule' : (draft.qualificationMethod ?? 'assign-and-schedule')
    qualificationEventType.value = draft.qualificationEventType ?? ''
    qualificationSelectedDate.value = draft.qualificationSelectedDate ? new Date(draft.qualificationSelectedDate) : null
    qualificationSelectedSlot.value = draft.qualificationSelectedSlot ?? ''
    qualificationScheduleDepartment.value = draft.qualificationScheduleDepartment ?? ''
    qualificationScheduleDealership.value = draft.qualificationScheduleDealership ?? ''
    const rawTeamId = draft.qualificationScheduleTeamId
    let scheduleTeamId = null
    if (rawTeamId != null && rawTeamId !== '') {
      const n = typeof rawTeamId === 'number' ? rawTeamId : parseInt(String(rawTeamId), 10)
      scheduleTeamId = Number.isFinite(n) ? n : null
    }
    qualificationScheduleTeamId.value = scheduleTeamId
    qualificationScheduleAssigneeFilter.value =
      typeof draft.qualificationScheduleAssigneeFilter === 'string'
        ? draft.qualificationScheduleAssigneeFilter
        : ''
    qualificationSelectedTeam.value = draft.qualificationSelectedTeam ?? null
    qualificationSelectedSalesman.value = draft.qualificationSelectedSalesman ?? null
    if (draft.assignment?.assignee) {
      assignment.value = { ...assignment.value, ...draft.assignment }
    }
    callLogDateTime.value = draft.callLogDateTime ?? ''
    if (currentUserRef?.value && !callLogAssignee.value) {
      callLogAssignee.value = currentUserRef.value
    }
    rescheduleTime.value = null
    customDate.value = ''
    customTime.value = '09:00'
    aiSuggestionData.value = null
    markAsScheduledRecall.value = false
  }
  
  // Initialize call log form with current datetime and auto-assign to current user
  const initCallLogForm = (showOutcomeImmediately = false) => {
    // Don't reinitialize if there's already a success state
    if (successState.value) return
    
    // Set current datetime in local timezone format for datetime-local input
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    callLogDateTime.value = `${year}-${month}-${day}T${hours}:${minutes}`
    
    // Auto-assign to current user
    if (currentUserRef?.value) {
      callLogAssignee.value = currentUserRef.value
    }
    
    showCallLogForm.value = true
    // Outcome selection is always visible now, no need to set it
  }
  
  const confirmCallLogForm = () => {
    // Outcome selection is always visible now, no need to set it
  }
  
  const cancelCallLogForm = () => {
    showCallLogForm.value = false
    callLogDateTime.value = ''
    callLogAssignee.value = null
  }

  return {
    // State
    showOutcomeSelection,
    selectedOutcome,
    selectedNextStep,
    setNextStep,
    outcomeLabel,
    nextStepLabel,
    followUpChannelLabel,
    showNoteModal,
    showScheduleAppointmentModal,
    followupChannels,
    followupChannel,
    selectedTemplate,
    rescheduleTime,
    customDate,
    customTime,
    markAsScheduledRecall,
    disqualifyCategory,
    disqualifyReason,
    assignment,
    preferences,
    surveyCompleted,
    surveyResponses,
    showSurvey,
    aiSuggestionData,
    // Call log form state
    showCallLogForm,
    callLogDateTime,
    callLogAssignee,
    nextAttemptAssignee,
    // Team selection state
    qualificationSelectedTeam,
    qualificationSelectedSalesman,
    suggestedTeam,
    // Communication preferences
    communicationPreferences,
    // Computed
    messageTemplates,
    messagePreview,
    followupMessageBody,
    resolveFollowupMessage,
    hasExistingAppointment,
    // Methods
    selectOutcome,
    cancelOutcome,
    calculateNextCallDate,
    calculateAISuggestion,
    handleAISuggestionClick,
    resetOutcomeState,
    initCallLogForm,
    confirmCallLogForm,
    cancelCallLogForm,
    clearSuccessState,
    restorePostponedInterestedState,
    successState,
    successPerformedAt,
    qualificationMethod,
    qualificationEventType,
    qualificationDurationMinutes,
    qualificationCustomDuration,
    qualificationDateRange,
    qualificationCustomDateStart,
    qualificationCustomDateEnd,
    availableDatesForRange,
    qualificationSelectedDate,
    qualificationSelectedSlot,
    qualificationScheduleDepartment,
    qualificationScheduleDealership,
    qualificationScheduleTeamId,
    qualificationScheduleAssigneeFilter,
    setQualificationSelectedSlot,
    qualificationScheduleSlotOptions,
    qualificationDurationValue
  }
}

