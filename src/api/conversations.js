import {
  listConversationThreads,
  getThreadMessages,
  parseThreadId,
  outboundActivityTypeForChannel,
  outboundActionLabelForChannel
} from '@/services/conversationService'

const delayMs = import.meta.env.DEV ? 0 : 50
const delay = (ms = delayMs) => (ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)))

export const fetchConversationThreads = async () => {
  await delay()
  return listConversationThreads()
}

export const fetchThreadMessages = async (threadId) => {
  await delay()
  return getThreadMessages(threadId)
}

export { parseThreadId, outboundActivityTypeForChannel, outboundActionLabelForChannel }
