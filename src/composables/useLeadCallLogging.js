import { ref, computed, onUnmounted } from 'vue'
import { useToastStore } from '@/stores/toast'

/**
 * Composable for lead call logging logic
 * Handles call state management, transcription, and call logging
 * 
 * @param {Object} params - Parameters object
 * @param {Function} params.onCallEnded - Callback when call ends
 * @param {Function} params.onExtractInformation - Callback when information is extracted
 * @param {Function} params.onShowOutcomeSelection - Callback to show outcome selection
 * @returns {Object} Object containing call state and handlers
 */
export function useLeadCallLogging({ onCallEnded, onExtractInformation, onShowOutcomeSelection }) {
  const toastStore = useToastStore()
  const isCallActive = ref(false)
  const callEnded = ref(false)
  const callDuration = ref(0)
  const callNotes = ref('')
  const callInterval = ref(null)
  const callData = ref({})
  const extractedData = ref(null)

  const mockTranscription = {
    leadLines: [
      "Yes, this is Luca De Santis speaking.",
      "Oh, hi Matteo! Yes, I was waiting for your call.",
      "That sounds great. I'm definitely interested in seeing it."
    ],
    salesLines: [
      "Hi Luca, Matteo here regarding your Audi A6 inquiry.",
      "Great. I see you're interested in the Allroad. Do you have a vehicle you'd like to trade in?"
    ]
  }

  const formattedCallDuration = computed(() => {
    const minutes = Math.floor(callDuration.value / 60)
    const seconds = callDuration.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })

  const startCall = () => {
    isCallActive.value = true
    callDuration.value = 0
    callEnded.value = false
    callNotes.value = ''
    
    // Simulate call duration
    callInterval.value = setInterval(() => {
      callDuration.value++
      // Auto-end call after 20 seconds for demo
      if (callDuration.value >= 20) {
        endCall()
      }
    }, 1000)
  }

  const endCall = () => {
    if (callInterval.value) {
      clearInterval(callInterval.value)
      callInterval.value = null
    }
    isCallActive.value = false
    callEnded.value = true
    
    callData.value = {
      duration: callDuration.value,
      notes: callNotes.value,
      transcription: mockTranscription,
      channel: 'phone'
    }
    
    if (onCallEnded) {
      onCallEnded(callData.value)
    }
  }

  const logManualCall = () => {
    callData.value = {
      channel: 'external',
      notes: '',
      transcription: null
    }
    if (onShowOutcomeSelection) {
      onShowOutcomeSelection()
    }
  }

  const extractInformation = () => {
    extractedData.value = {
      tradeIn: mockTranscription.leadLines.some(line => 
        line.toLowerCase().includes('trade') || line.toLowerCase().includes('exchange')
      ) || false,
      financing: mockTranscription.leadLines.some(line => 
        line.toLowerCase().includes('financ') || line.toLowerCase().includes('payment') || line.toLowerCase().includes('loan')
      ) || false
    }
    
    if (onExtractInformation) {
      onExtractInformation(extractedData.value)
    }
  }

  const copyNumber = async (phoneNumber) => {
    try {
      await navigator.clipboard.writeText(phoneNumber)
      toastStore.pushToast('success', 'Phone number copied to clipboard!')
    } catch (err) {
      toastStore.pushToast('error', 'Failed to copy phone number')
    }
  }

  onUnmounted(() => {
    if (callInterval.value) {
      clearInterval(callInterval.value)
    }
  })

  return {
    // State
    isCallActive,
    callEnded,
    callDuration,
    callNotes,
    callData,
    extractedData,
    mockTranscription,
    formattedCallDuration,
    // Actions
    startCall,
    endCall,
    logManualCall,
    extractInformation,
    copyNumber
  }
}

