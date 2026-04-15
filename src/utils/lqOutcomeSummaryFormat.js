/**
 * @param {Date|string|number|null|undefined} value
 * @returns {string} e.g. 15/04/2026 14:47
 */
export function opportunityIdFromCompositeId(compositeId) {
  if (compositeId == null || typeof compositeId !== 'string') return null
  const prefix = 'opportunity-'
  if (!compositeId.startsWith(prefix)) return null
  return compositeId.slice(prefix.length)
}

export function qualifySuccessMatchesOpportunityComposite(opportunityId, compositeId) {
  if (opportunityId == null || compositeId == null) return false
  const suffix = opportunityIdFromCompositeId(compositeId)
  if (suffix == null) return false
  return String(opportunityId) === String(suffix)
}

/**
 * Map persisted qualify payload to card props for the current task/request entity.
 * @param {{ type?: string, id: number|string, opportunityId?: number|string|null }|null} entity
 * @param {{ sourceLeadId: number|string, opportunityId: number|string|null, opportunity: object, actorName?: string, performedAt?: Date|string|number }|null} stored
 */
export function resolveStoredQualifyInlineSuccess(entity, stored) {
  if (!entity || !stored) return null
  const type = entity.type === 'opportunity' ? 'opportunity' : 'lead'
  if (type === 'lead') {
    if (Number(entity.id) === Number(stored.sourceLeadId)) {
      return {
        opportunity: stored.opportunity,
        actorName: stored.actorName || '',
        performedAt: stored.performedAt
      }
    }
    if (
      stored.opportunityId != null &&
      entity.opportunityId != null &&
      Number(entity.opportunityId) === Number(stored.opportunityId)
    ) {
      return {
        opportunity: stored.opportunity,
        actorName: stored.actorName || '',
        performedAt: stored.performedAt
      }
    }
    return null
  }
  if (Number(entity.id) === Number(stored.opportunityId)) {
    return {
      opportunity: stored.opportunity,
      actorName: stored.actorName || '',
      performedAt: stored.performedAt
    }
  }
  return null
}

export function formatLqPerformedAtLabel(value) {
  if (value == null || value === '') return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear())
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

/**
 * Build display strings for LQ terminal outcomes (i18n via t).
 * @param {import('vue-i18n').ComposerTranslation} t
 */
export function formatPostponedNextCallLine(meta, t) {
  if (!meta) return t('requestDetail.lqOutcome.nextCallSelected')
  const { rescheduleTime, customDate, customTime, aiSuggestionData } = meta
  if (rescheduleTime === 'tomorrow-9am') {
    return t('requestDetail.lqOutcome.nextCallTomorrow9')
  }
  if (rescheduleTime === 'monday' && aiSuggestionData?.formattedDate && aiSuggestionData?.time) {
    return t('requestDetail.lqOutcome.nextCallAiSuggestion', {
      date: aiSuggestionData.formattedDate,
      time: aiSuggestionData.time
    })
  }
  if (rescheduleTime === 'monday') {
    return t('requestDetail.lqOutcome.nextCallMonday')
  }
  if (rescheduleTime === 'custom' && customDate && customTime) {
    return t('requestDetail.lqOutcome.nextCallCustom', { date: customDate, time: customTime })
  }
  return t('requestDetail.lqOutcome.nextCallSelected')
}

export function followUpChannelDisplay(channel, t) {
  if (channel === 'whatsapp') return t('requestDetail.lqOutcome.channelWhatsapp')
  if (channel === 'sms') return t('requestDetail.lqOutcome.channelSms')
  if (channel === 'email') return t('requestDetail.lqOutcome.channelEmail')
  if (channel === 'dont-send') return t('requestDetail.lqOutcome.channelDontSend')
  return channel || ''
}

/**
 * @param {object} payload
 * @param {string} payload.kind
 * @param {string} [payload.reason]
 * @param {string} [payload.category]
 * @param {string} [payload.followUpChannel]
 * @param {object} [payload.postponeMeta]
 */
export function buildLqOutcomeSummaryDisplay(payload, t) {
  if (!payload || !payload.kind) {
    return { title: '', lines: [], reason: null }
  }

  const { kind, reason, followUpChannel, postponeMeta } = payload

  switch (kind) {
    case 'not-interested':
      return {
        title: t('requestDetail.lqOutcome.titleTaskComplete'),
        lines: [t('requestDetail.lqOutcome.lineClosedNotInterested')],
        reason: reason || null
      }
    case 'not-valid':
      return {
        title: t('requestDetail.lqOutcome.titleTaskComplete'),
        lines: [t('requestDetail.lqOutcome.lineClosedNotValid')],
        reason: reason || null
      }
    case 'no-answer-closed':
      return {
        title: t('requestDetail.lqOutcome.titleTaskComplete'),
        lines: [t('requestDetail.lqOutcome.lineClosedNoAnswer')],
        reason: reason || null
      }
    case 'no-answer-postponed': {
      const when = formatPostponedNextCallLine(postponeMeta, t)
      const lines = [t('requestDetail.lqOutcome.linePostponedNextAttempt', { when })]
      if (followUpChannel && followUpChannel !== 'dont-send') {
        const ch = followUpChannelDisplay(followUpChannel, t)
        lines.push(t('requestDetail.lqOutcome.linePostponedFollowUp', { channel: ch }))
      }
      return {
        title: t('requestDetail.lqOutcome.titleTaskPostponed'),
        lines,
        reason: null
      }
    }
    case 'interested-postponed': {
      const when = formatPostponedNextCallLine(postponeMeta, t)
      return {
        title: t('requestDetail.lqOutcome.titleTaskPostponed'),
        lines: [t('requestDetail.lqOutcome.lineInterestedPostponed', { when })],
        reason: null
      }
    }
    default:
      return { title: '', lines: [], reason: null }
  }
}

export function buildClosedLeadSummaryFromLead(lead, t) {
  if (!lead?.isDisqualified) {
    return { title: '', lines: [], reason: null }
  }
  const reason = lead.disqualifyReason || null
  const category = lead.disqualifyCategory || ''
  const reasonLower = (reason || '').toLowerCase()
  if (reasonLower.includes('converted') || reasonLower.includes('opportunity')) {
    return { title: '', lines: [], reason: null }
  }
  const unreachable =
    reason === 'Unreachable' || reasonLower === 'unreachable'
  if (category === 'Not Interested' && unreachable) {
    return buildLqOutcomeSummaryDisplay({ kind: 'no-answer-closed', reason }, t)
  }
  if (category === 'Not Interested' || String(lead.stage || '').includes('Not Interested')) {
    return buildLqOutcomeSummaryDisplay({ kind: 'not-interested', reason }, t)
  }
  return buildLqOutcomeSummaryDisplay({ kind: 'not-valid', reason }, t)
}
