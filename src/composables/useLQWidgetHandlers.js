import { LEAD_STAGES } from '@/utils/stageMapper'

/**
 * Composable for LQWidget handler functions
 * Coordinates between call and outcome composables
 * @param {Object} currentUserRef - optional ref to current user for "Updated by" in success state
 */
export function useLQWidgetHandlers(emit, callState, outcomeState, lead, contactAttemptsRef, maxContactAttemptsRef, leadsStore, currentUserRef, enrichLeadDataRef = null) {
  const { callData, extractedData, isCallActive, callEnded } = callState
  const {
    showOutcomeSelection,
    selectedOutcome,
    selectedNextStep,
    outcomeLabel,
    nextStepLabel,
    followupChannel,
    followUpChannelLabel,
    assignment,
    preferences,
    cancelOutcome,
    calculateNextCallDate,
    showScheduleAppointmentModal,
    surveyCompleted,
    surveyResponses,
    showSurvey,
    initCallLogForm,
    callLogDateTime,
    callLogAssignee,
    successState,
    successPerformedAt,
    rescheduleTime,
    aiSuggestionData,
    customDate,
    customTime,
    markAsScheduledRecall,
    qualificationMethod,
    qualificationEventType,
    qualificationDurationValue,
    qualificationSelectedDate,
    qualificationSelectedSlot,
    qualificationSelectedTeam,
    qualificationSelectedSalesman,
    communicationPreferences,
    restorePostponedInterestedState,
    clearSuccessState,
    resetOutcomeState
  } = outcomeState

  const buildAttempt = (outcome, overrides = {}) => ({
    timestamp: callLogDateTime.value ? new Date(callLogDateTime.value).toISOString() : new Date().toISOString(),
    outcome,
    channel: callData.value?.channel || 'phone',
    notes: callData.value?.notes || '',
    transcription: callData.value?.transcription || null,
    duration: callData.value?.duration ?? null,
    outcomeLabel: outcomeLabel.value || overrides.outcomeLabel,
    nextStep: nextStepLabel.value || overrides.nextStep,
    followUpChannel: followUpChannelLabel.value || overrides.followUpChannel || null,
    ...overrides
  })

  const actorName = () => (currentUserRef?.value?.name) || 'Unknown'

  const getNextCallLabel = () => {
    if (rescheduleTime.value === 'tomorrow-9am') return 'Tomorrow 9:00 AM'
    if (rescheduleTime.value === 'monday' && aiSuggestionData.value) {
      return `${aiSuggestionData.value.formattedDate} at ${aiSuggestionData.value.time}`
    }
    if (rescheduleTime.value === 'monday') return 'Monday'
    if (rescheduleTime.value === 'custom' && customDate.value && customTime.value) {
      return `${customDate.value} ${customTime.value}`
    }
    return 'selected time'
  }

  const logManualCall = () => {
    callData.value = {
      channel: 'external',
      notes: '',
      transcription: null
    }
    // Show the call log form first with datetime and assignee, and show outcome selection immediately
    initCallLogForm(true)
  }

  const handleScheduleAppointmentConfirm = async (appointmentData) => {
    showScheduleAppointmentModal.value = false
    emit('appointment-scheduled', appointmentData)
  }

  const handleQualify = async () => {
    const attempt = buildAttempt('answer', { nextStep: 'Interested' })

    emit('call-attempt-logged', attempt)
    emit('validated', { scheduleFollowUp: false })

    // Determine assignee name based on method (team or salesperson from form, or assignment for assign-only fallback)
    let assigneeName = 'Unassigned'
    const formAssignee = qualificationSelectedSalesman.value?.name || qualificationSelectedTeam.value?.name
    if (qualificationMethod.value === 'assign-and-schedule') {
      assigneeName = formAssignee || 'Unassigned'
    } else {
      assigneeName = formAssignee || assignment.value?.assignee?.name || 'Unassigned'
    }

    let meeting = null
    let scheduleAppointment = false
    let appointmentData = null

    if (qualificationMethod.value === 'assign-and-schedule' && qualificationSelectedDate.value && qualificationSelectedSlot.value) {
      const d = qualificationSelectedDate.value
      const dateStr = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
      const eventTypeLabel = { 'test-drive': 'Test Drive', 'in-store-visit': 'In-Store Visit' }[qualificationEventType.value] || qualificationEventType.value
      scheduleAppointment = true
      
      // Format date as YYYY-MM-DD for appointmentData
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateFormatted = `${year}-${month}-${day}`
      
      appointmentData = {
        datetime: d,
        date: dateFormatted,
        time: qualificationSelectedSlot.value,
        type: eventTypeLabel,
        assignee: assigneeName,
        assigneeId: qualificationSelectedSalesman.value?.id || qualificationSelectedTeam.value?.id || null,
        assigneeType: qualificationSelectedSalesman.value ? 'user' : 'team',
        duration: qualificationDurationValue.value,
        team: qualificationSelectedTeam.value?.name || null,
        teamId: qualificationSelectedTeam.value?.id || null,
        salesperson: qualificationSelectedSalesman.value?.name || null,
        salespersonId: qualificationSelectedSalesman.value?.id || null
      }
      meeting = {
        date: dateStr,
        time: qualificationSelectedSlot.value,
        title: eventTypeLabel,
        name: lead.value?.customer?.name || '',
        location: assigneeName
      }
      emit('appointment-scheduled', appointmentData)

      // Send communications if enabled
      if (communicationPreferences.value) {
        const comms = communicationPreferences.value
        
        // Send immediate confirmations
        if (comms.immediateConfirmation?.enabled && comms.immediateConfirmation?.channels?.length > 0) {
          for (const channel of comms.immediateConfirmation.channels) {
            // Create activity for each communication sent
            if (leadsStore && lead.value?.id) {
              try {
                await leadsStore.addActivity(lead.value.id, {
                  type: channel,
                  user: actorName(),
                  action: `sent ${channel} confirmation`,
                  content: `Appointment confirmed: ${eventTypeLabel} on ${dateStr} at ${qualificationSelectedSlot.value}`,
                  timestamp: new Date().toISOString()
                })
              } catch (error) {
                console.error(`Failed to log ${channel} confirmation:`, error)
              }
            }
          }
        }

        // Schedule reminder (day before)
        if (comms.reminder?.enabled && comms.reminder?.channels?.length > 0) {
          const appointmentDate = new Date(d)
          appointmentDate.setDate(appointmentDate.getDate() - 1)
          const reminderDateStr = appointmentDate.toISOString().split('T')[0]
          
          // In a real implementation, this would schedule the reminder
          // For now, we'll just log it as an activity
          if (leadsStore && lead.value?.id) {
            try {
              await leadsStore.addActivity(lead.value.id, {
                type: 'reminder-scheduled',
                user: actorName(),
                action: 'scheduled reminder',
                content: `Reminder scheduled for ${reminderDateStr} via ${comms.reminder.channels.join(', ')}`,
                timestamp: new Date().toISOString(),
                data: {
                  reminderDate: reminderDateStr,
                  channels: comms.reminder.channels
                }
              })
            } catch (error) {
              console.error('Failed to schedule reminder:', error)
            }
          }
        }

        // Send salesperson/team notification
        if (comms.salespersonNotification?.enabled) {
          const notifyTarget = qualificationSelectedSalesman.value?.name || qualificationSelectedTeam.value?.name || 'Team'
          if (leadsStore && lead.value?.id) {
            try {
              await leadsStore.addActivity(lead.value.id, {
                type: 'notification',
                user: actorName(),
                action: 'sent notification',
                content: `Notification sent to ${notifyTarget} about appointment`,
                timestamp: new Date().toISOString()
              })
            } catch (error) {
              console.error('Failed to send notification:', error)
            }
          }
        }
      }
    }

    // Update assignment.value for assign-and-schedule method
    if (qualificationMethod.value === 'assign-and-schedule') {
      // Set assignment to selected salesperson if available, otherwise to team
      if (qualificationSelectedSalesman.value) {
        assignment.value = {
          ...assignment.value,
          assignee: {
            ...qualificationSelectedSalesman.value,
            type: 'user'
          },
          assigneeId: qualificationSelectedSalesman.value.id,
          salesperson: qualificationSelectedSalesman.value
        }
      } else if (qualificationSelectedTeam.value) {
        assignment.value = {
          ...assignment.value,
          assignee: {
            ...qualificationSelectedTeam.value,
            type: 'team'
          },
          team: qualificationSelectedTeam.value
        }
      }
    }

    // Prepare assignment data for qualified event
    const assignmentData = qualificationMethod.value === 'assign-and-schedule' 
      ? {
          assignee: qualificationSelectedSalesman.value || qualificationSelectedTeam.value,
          salesperson: qualificationSelectedSalesman.value || null,
          team: qualificationSelectedTeam.value || null
        }
      : assignment.value

    // Prepare survey/enrich data from enrichLeadData if available, otherwise fall back to surveyResponses
    let enrichData = null
    if (enrichLeadDataRef?.value) {
      const data = enrichLeadDataRef.value
      enrichData = {
        interestLevel: data.interestLevel,
        purchaseTimeline: data.purchaseTimeline,
        budgetRange: data.budgetRange,
        hasTradeIn: data.hasTradeIn,
        tradeInModel: data.tradeInModel,
        financingOption: data.financingOption,
        additionalNotes: data.additionalNotes
      }
    } else if (surveyCompleted.value && surveyResponses.value) {
      enrichData = surveyResponses.value
    }

    emit('qualified', {
      assignment: assignmentData,
      preferences: preferences.value,
      scheduleAppointment,
      appointmentData,
      surveyData: enrichData
    })
    // Do NOT set successState for qualified – lead converts to opportunity and navigates away
  }

  const handleSurveyCompleted = async (responses) => {
    surveyResponses.value = responses
    surveyCompleted.value = true
    showSurvey.value = false
    
    // Create survey activity
    if (leadsStore && lead.value?.id) {
      try {
        await leadsStore.addActivity(lead.value.id, {
          type: 'survey',
          action: 'Lead Qualification Survey',
          content: JSON.stringify(responses),
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Failed to save survey activity:', error)
      }
    }
    
    emit('survey-completed', { lead: lead.value, responses })
  }

  const handleSurveyRefused = async () => {
    showSurvey.value = false
    
    // Log survey refusal as activity
    if (leadsStore && lead.value?.id) {
      try {
        await leadsStore.addActivity(lead.value.id, {
          type: 'survey',
          action: 'Lead Qualification Survey',
          content: 'Customer refused to complete survey',
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Failed to save survey refusal activity:', error)
      }
    }
    
    emit('survey-refused', { lead: lead.value })
  }

  const handleNotResponding = async () => {
    showSurvey.value = false
    
    // Log not responding as activity
    if (leadsStore && lead.value?.id) {
      try {
        await leadsStore.addActivity(lead.value.id, {
          type: 'survey',
          action: 'Lead Qualification Survey',
          content: 'Customer not responding to survey',
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error('Failed to save survey not responding activity:', error)
      }
    }
    
    emit('not-responding', { lead: lead.value })
  }

  const handleDisqualifyFromInterested = () => {
    const attempt = buildAttempt('answer', { nextStep: 'Not interested' })
    emit('call-attempt-logged', attempt)
    selectedOutcome.value = 'answer'
    selectedNextStep.value = 'not-interested'
  }

  const handleNoAnswerConfirm = async () => {
    const attempt = buildAttempt('no-answer')
    emit('call-attempt-logged', attempt)
    
    const nextCallDate = calculateNextCallDate()
    const appointmentDate = nextCallDate.split('T')[0]
    const appointmentTime = new Date(nextCallDate).toTimeString().slice(0, 5)
    
    if (leadsStore && lead.value?.id) {
      try {
        await leadsStore.updateLead(lead.value.id, {
          nextActionDue: nextCallDate,
          status: 'Pending'
        })
      } catch (error) {
        console.error('Failed to update lead status to "to be called back":', error)
      }
    }
    
    emit('postponed', {
      date: appointmentDate,
      time: appointmentTime,
      createAppointment: true
    })
    
    if (contactAttemptsRef?.value + 1 >= maxContactAttemptsRef?.value) {
      emit('disqualified', {
        category: 'Not Interested',
        reason: 'Unreachable'
      })
    }

    const nextLabel = getNextCallLabel()
    successState.value = { kind: 'no-answer', statusText: `Message sent - Rescheduled to ${nextLabel}`, actorName: actorName() }
    successPerformedAt.value = new Date()
    cancelOutcome()
  }

  const handleNoAnswerCloseLead = async () => {
    const attempt = buildAttempt('no-answer', { nextStep: 'Close lead' })
    emit('call-attempt-logged', attempt)
    const reason = outcomeState.disqualifyReason.value || 'Unreachable'
    const category = outcomeState.disqualifyCategory.value || 'Not Interested'
    emit('disqualified', { category, reason })
    successState.value = { kind: 'no-answer', statusText: `Closed - ${reason}`, reason, actorName: actorName() }
    successPerformedAt.value = new Date()
    cancelOutcome()
  }

  const handlePostponeFromInterested = async () => {
    const attempt = buildAttempt('answer', { outcome: 'postponed-interested', nextStep: 'Postpone' })
    emit('call-attempt-logged', attempt)

    const nextCallDate = calculateNextCallDate()
    const appointmentDate = nextCallDate.split('T')[0]
    const appointmentTime = new Date(nextCallDate).toTimeString().slice(0, 5)

    const draft = {
      enrichLeadData: enrichLeadDataRef?.value ? { ...enrichLeadDataRef.value } : {},
      qualificationMethod: qualificationMethod.value,
      qualificationEventType: qualificationEventType.value,
      qualificationSelectedDate: qualificationSelectedDate.value ? qualificationSelectedDate.value.toISOString() : null,
      qualificationSelectedSlot: qualificationSelectedSlot.value ?? '',
      qualificationSelectedTeam: qualificationSelectedTeam.value ?? null,
      qualificationSelectedSalesman: qualificationSelectedSalesman.value ?? null,
      assignment: assignment.value ? { ...assignment.value } : {},
      callLogDateTime: callLogDateTime.value ?? ''
    }

    const leadUpdates = {
      nextActionDue: nextCallDate,
      stage: LEAD_STAGES.VALID_TO_BE_CALLED_BACK,
      status: 'Pending',
      postponedInterestedState: draft,
      scheduledRecallAppointment: markAsScheduledRecall?.value
        ? { date: appointmentDate, time: appointmentTime }
        : null
    }

    if (leadsStore && lead.value?.id) {
      try {
        await leadsStore.updateLead(lead.value.id, leadUpdates)
      } catch (error) {
        console.error('Failed to update lead (postpone from interested):', error)
      }
    }

    const postponedPayload = {
      date: appointmentDate,
      time: appointmentTime,
      createAppointment: true,
      fromInterested: true
    }
    if (markAsScheduledRecall?.value) {
      postponedPayload.scheduledRecallAppointment = { date: appointmentDate, time: appointmentTime }
    }
    emit('postponed', postponedPayload)

    // Keep form visible with filled data (status is Valid - to be called back, not closed)
    // Do not set successState or cancelOutcome so the user still sees the form
  }

  const handleNotValidConfirm = () => {
    const attempt = buildAttempt('not-valid')
    emit('call-attempt-logged', attempt)
    emit('disqualified', {
      category: outcomeState.disqualifyCategory.value,
      reason: outcomeState.disqualifyReason.value
    })

    successState.value = {
      kind: 'not-interested',
      statusText: 'Closed - Not interested',
      reason: outcomeState.disqualifyReason.value || null,
      actorName: actorName()
    }
    successPerformedAt.value = new Date()
    cancelOutcome()
  }

  const handleNoteSave = (noteData) => {
    outcomeState.showNoteModal.value = false
    emit('note-saved', noteData)
  }

  const handleReopen = () => {
    clearSuccessState()
    const draft = lead.value?.postponedInterestedState
    if (draft) {
      restorePostponedInterestedState(draft)
      if (enrichLeadDataRef?.value && draft.enrichLeadData && typeof draft.enrichLeadData === 'object') {
        enrichLeadDataRef.value.interestLevel = draft.enrichLeadData.interestLevel ?? ''
        enrichLeadDataRef.value.purchaseTimeline = draft.enrichLeadData.purchaseTimeline ?? ''
        enrichLeadDataRef.value.budgetRange = draft.enrichLeadData.budgetRange ?? ''
        enrichLeadDataRef.value.additionalNotes = draft.enrichLeadData.additionalNotes ?? ''
      }
    } else {
      resetOutcomeState()
    }
  }

  return {
    logManualCall,
    handleScheduleAppointmentConfirm,
    handleQualify,
    handleDisqualifyFromInterested,
    handleNoAnswerConfirm,
    handleNoAnswerCloseLead,
    handlePostponeFromInterested,
    handleNotValidConfirm,
    handleNoteSave,
    handleSurveyCompleted,
    handleSurveyRefused,
    handleNotResponding,
    handleReopen
  }
}

