import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUserStore } from '@/stores/user'
import { LEAD_STAGES } from '@/utils/stageMapper'
import { getTransitionHandler } from '@/composables/useLeadStateMachine'
import { formatDate, formatTime } from '@/utils/formatters'

/**
 * Composable for LeadManagementWidget handlers
 * @param {Object} options - Handler configuration
 * @param {Function} options.getLead - Function to get the current lead
 * @param {Object} options.leadState - Lead state machine reactive state
 * @param {Function} options.emit - Emit function for component events
 */
export function useLeadManagementHandlers({ getLead, leadState, emit }) {
  const router = useRouter()
  const leadsStore = useLeadsStore()
  const opportunitiesStore = useOpportunitiesStore()
  const userStore = useUserStore()
  const isConvertingToOpportunity = ref(false)

  async function handlePostponed(data) {
    const lead = getLead()
    if (!lead) return

    if (!leadState.canPostpone.value) {
      return
    }
    
    try {
      const dueDateTime = new Date(`${data.date}T${data.time}:00`)
      const isoTimestamp = dueDateTime.toISOString()
      
      const updates = {
        nextActionDue: isoTimestamp
      }
      if (data.scheduledRecallAppointment) {
        updates.scheduledRecallAppointment = data.scheduledRecallAppointment
      }

      // Add reassignment if provided
      if (data.assigneeId || data.teamId) {
        updates.assignee = data.assignee || null
        updates.assigneeId = data.assigneeId || null
        updates.assigneeType = data.assigneeType || 'user'
        updates.teamId = data.teamId || null
        updates.team = data.team || null
      }
      
      await leadsStore.updateLead(lead.id, updates)

      await leadsStore.addActivity(lead.id, {
        type: 'note',
        user: 'You',
        action: 'postponed lead qualification task',
        content: `Task postponed to ${formatDate(dueDateTime)} at ${formatTime(dueDateTime)}${data.assignee ? ` and reassigned to ${data.assignee}` : ''}`
      })
      
      await leadsStore.fetchLeadById(lead.id)
    } catch (err) {
      console.error('Failed to postpone lead task:', err)
    }
  }

  async function handleValidated(data) {
    const lead = getLead()
    if (!lead) return

    try {
      await leadsStore.updateLead(lead.id, {
        stage: 'Validated'
      })
      
      await leadsStore.addActivity(lead.id, {
        type: 'note',
        user: 'You',
        action: 'validated lead',
        content: 'Lead has been validated and is ready for follow-up'
      })
      
      if (data.scheduleFollowUp && data.appointmentData) {
        const appointmentDateTime = new Date(`${data.appointmentData.date}T${data.appointmentData.time}:00`)
        await leadsStore.updateLead(lead.id, { nextActionDue: appointmentDateTime.toISOString() })
        await leadsStore.addActivity(lead.id, {
          type: 'note',
          user: 'You',
          action: 'scheduled follow-up',
          content: `Follow-up scheduled for ${formatDate(appointmentDateTime)} at ${formatTime(appointmentDateTime)}`
        })
      }

      await leadsStore.fetchLeadById(lead.id)
    } catch (err) {
      console.error('Failed to validate lead:', err)
    }
  }

  async function handleQualified(data) {
    const lead = getLead()
    if (!lead) return

    const displayStage = leadState.displayStage.value
    if (displayStage !== LEAD_STAGES.VALID_TO_BE_CALLED_BACK && displayStage !== LEAD_STAGES.TO_BE_CALLED_BACK) {
      return
    }

    isConvertingToOpportunity.value = true
    try {
      // Update lead with assignment before converting to opportunity
      if (data?.assignment?.assignee) {
        const assignee = data.assignment.assignee
        const updates = {
          assignee: assignee.name || assignee.label || null,
          assigneeId: assignee.id || null,
          assigneeType: assignee.type || 'user'
        }
        
        // If it's a team assignment, also set team fields
        if (assignee.type === 'team') {
          updates.teamId = assignee.id || null
          updates.team = assignee.name || null
        }
        
        // If there's a salesperson in the assignment, set that too
        if (data.assignment.salesperson) {
          updates.assignee = data.assignment.salesperson.name || data.assignment.salesperson
          updates.assigneeId = data.assignment.salesperson.id || null
          updates.assigneeType = 'user'
          updates.teamId = assignee.id || null
          updates.team = assignee.name || null
        }
        
        await leadsStore.updateLead(lead.id, updates)
        
        // Log assignment activity
        const assigneeName = data.assignment.salesperson?.name || assignee.name || 'Unassigned'
        await leadsStore.addActivity(lead.id, {
          type: 'note',
          user: userStore.currentUser?.name || 'You',
          action: 'assigned lead',
          content: `Lead assigned to ${assigneeName}${data.assignment.salesperson && assignee.name ? ` (${assignee.name} team)` : ''}`,
          timestamp: new Date().toISOString()
        })
      }
      
      const opportunity = await leadsStore.convertLeadToOpportunity(lead.id, data)

      if (userStore.canAccessOpportunities()) {
        // Add opportunity to list so drawer can show it (do NOT refetch opportunities here –
        // background fetch would overwrite the list and can race with navigation)
        opportunitiesStore.addOpportunityToList(opportunity)
        
        // Wait for Vue to apply the new list so allTasks includes the opportunity
        await nextTick()
        await new Promise(resolve => setTimeout(resolve, 80))
        
        // Navigate BEFORE removing the lead – otherwise drawerTask becomes null when the lead disappears,
        // the drawer closes, and we never transition to the opportunity. By navigating first, the drawer
        // can find the opportunity in allTasks and stay open.
        router.push({ path: `/tasks/${opportunity.id}`, query: { type: 'opportunity' } })
        
        // Remove converted lead from list (convertLeadToOpportunity no longer does this)
        leadsStore.leads = leadsStore.leads.filter(l => l.id !== lead.id)
        
        // Refresh leads so list stays in sync
        await leadsStore.fetchLeads()
        
        // Refresh opportunities in background after a short delay so we don't overwrite before drawer opens
        setTimeout(() => {
          opportunitiesStore.fetchOpportunities().catch(() => {})
        }, 500)
      } else {
        router.push('/tasks')
      }
    } catch (err) {
      console.error('Failed to qualify lead:', err)
      alert(`Failed to qualify lead: ${err.message || 'Unknown error'}`)
    } finally {
      isConvertingToOpportunity.value = false
    }
  }

  async function handleCallAttemptLogged(attempt) {
    const lead = getLead()
    if (!lead) return

    try {
      const currentAttempts = lead.contactAttempts || []
      
      await leadsStore.updateLead(lead.id, {
        contactAttempts: [...currentAttempts, attempt],
        lastContactAttempt: attempt.timestamp,
        totalContactAttempts: currentAttempts.length + 1
      })

      const contentParts = []
      if (attempt.outcomeLabel) contentParts.push(`Outcome: ${attempt.outcomeLabel}`)
      if (attempt.nextStep) contentParts.push(`What's next: ${attempt.nextStep}`)
      if (attempt.followUpChannel) contentParts.push(`Follow-up: ${attempt.followUpChannel}`)
      const logContent = contentParts.length
        ? contentParts.join('. ')
        : (attempt.notes || `Call attempt via ${attempt.channel}`)
      
      await leadsStore.addActivity(lead.id, {
        type: 'call',
        user: 'You',
        action: `logged call attempt - ${attempt.outcomeLabel || attempt.outcome}`,
        content: logContent,
        data: {
          outcome: attempt.outcome,
          outcomeLabel: attempt.outcomeLabel,
          nextStep: attempt.nextStep,
          followUpChannel: attempt.followUpChannel,
          channel: attempt.channel,
          duration: attempt.duration,
          notes: attempt.notes,
          transcription: attempt.transcription
        }
      })
      
      await leadsStore.fetchLeadById(lead.id)
    } catch (err) {
      console.error('Failed to log call attempt:', err)
    }
  }

  async function handleNoteSaved(noteData) {
    const lead = getLead()
    if (!lead) return

    try {
      if (noteData.type === 'tradein' || noteData.type === 'purchase-method') {
        await leadsStore.fetchLeadById(lead.id)
        return
      }
      await leadsStore.addActivity(lead.id, {
        type: 'note',
        user: 'You',
        action: 'added a note',
        content: noteData.content || noteData.text || '',
        data: noteData
      })
      await leadsStore.fetchLeadById(lead.id)
    } catch (err) {
      console.error('Failed to save note:', err)
    }
  }

  function handleOpenPurchaseMethod() {
    emit('open-purchase-method')
  }

  function handleOpenTradeIn() {
    emit('open-trade-in')
  }

  // Scheduled appointments are only on opportunities; lead "schedule" is handled via nextActionDue in postpone/validate
  async function handleAppointmentScheduled() {
    // No-op: leads do not have scheduled appointments
  }

  async function handleDisqualified(data) {
    const lead = getLead()
    if (!lead) return

    // Use state machine to determine if disqualification is allowed
    if (leadState.isClosed.value && !data.force) {
      return
    }
    
    try {
      // Use state machine transition handler
      const currentStage = leadState.displayStage.value
      const targetStage = data.reason === 'Duplicate' ? LEAD_STAGES.CLOSED_DUPLICATE 
        : data.category === 'Not Interested' ? LEAD_STAGES.CLOSED_NOT_INTERESTED 
        : LEAD_STAGES.CLOSED_INVALID
      
      const transitionHandler = getTransitionHandler(currentStage, targetStage)
      
      if (transitionHandler) {
        const { updates, activities } = transitionHandler(lead, targetStage, data)
        
        // Apply updates
        await leadsStore.updateLead(lead.id, updates)
        
        // Log all activities
        for (const activity of activities) {
          await leadsStore.addActivity(lead.id, activity)
        }
      } else {
        // Fallback to direct update if no handler found
        const isDuplicate = data.reason === 'Duplicate'
        await leadsStore.updateLead(lead.id, {
          isDisqualified: true,
          disqualifyReason: data.reason,
          isDuplicate: isDuplicate,
          stage: isDuplicate ? 'Closed Failed' : 'Not Valid',
          status: 'Disqualified',
          scheduledAppointment: null,
          nextActionDue: null
        })
        
        await leadsStore.addActivity(lead.id, {
          type: 'note',
          user: 'You',
          action: 'disqualified lead',
          content: `Lead disqualified - Category: ${data.category}, Reason: ${data.reason}`
        })
      }

      await leadsStore.fetchLeadById(lead.id)
      // Do not close the drawer: keep task detail open so the user sees the outcome card with Reopen
    } catch (err) {
      console.error('Failed to disqualify lead:', err)
    }
  }

  async function handleReopen() {
    const lead = getLead()
    if (!lead) return

    try {
      // Use state machine transition handler
      const currentStage = leadState.displayStage.value
      const targetStage = LEAD_STAGES.NEW // Reopen to New stage
      
      const transitionHandler = getTransitionHandler(currentStage, targetStage)
      
      if (transitionHandler) {
        const { updates, activities } = transitionHandler(lead)
        
        // Apply updates
        await leadsStore.updateLead(lead.id, updates)
        
        // Log all activities
        for (const activity of activities) {
          await leadsStore.addActivity(lead.id, activity)
        }
      } else {
        // Fallback to direct update if no handler found
        await leadsStore.updateLead(lead.id, {
          isDisqualified: false,
          disqualifyReason: null,
          disqualifyCategory: null,
          isDuplicate: false,
          stage: 'Open',
          status: 'Open',
          nextActionDue: null, // Clear any old due dates
          scheduledAppointment: null // Clear any old appointments
        })
        
        await leadsStore.addActivity(lead.id, {
          type: 'note',
          user: 'You',
          action: 'reopened lead',
          content: 'Lead has been reopened for qualification'
        })
      }
      
      await leadsStore.fetchLeadById(lead.id)
    } catch (err) {
      console.error('Failed to reopen lead:', err)
    }
  }

  function viewOpportunity() {
    const lead = getLead()
    if (!lead) return

    if (lead.opportunityId) {
      router.push({ path: `/tasks/${lead.opportunityId}`, query: { type: 'opportunity' } })
    }
  }

  return {
    isConvertingToOpportunity,
    handlePostponed,
    handleValidated,
    handleQualified,
    handleCallAttemptLogged,
    handleNoteSaved,
    handleOpenPurchaseMethod,
    handleOpenTradeIn,
    handleAppointmentScheduled,
    handleDisqualified,
    handleReopen,
    viewOpportunity
  }
}

