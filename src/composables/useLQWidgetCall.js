import { ref, computed, onUnmounted } from 'vue'
import { useToastStore } from '@/stores/toast'

/**
 * Composable for LQWidget call interface logic
 * Manages call state, duration, notes, and transcription
 */
export function useLQWidgetCall() {
  const toastStore = useToastStore()
  const isCallActive = ref(false)
  const callEnded = ref(false)
  const callDuration = ref(0)
  const callNotes = ref('')
  const isMuted = ref(false)
  const callInterval = ref(null)
  const callData = ref({})
  const extractedData = ref(null)

  const toggleMute = () => {
    isMuted.value = !isMuted.value
  }

  const mockTranscription = {
    leadLines: [
      "Yes, this is Josh Adams speaking.",
      "Oh, hi Michael! Yes, I was waiting for your call.",
      "That sounds great. I'm definitely interested in seeing it."
    ],
    salesLines: [
      "Hi Josh, Michael here regarding your Audi A6 inquiry.",
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
  }

  const copyNumber = async (phoneNumber) => {
    try {
      await navigator.clipboard.writeText(phoneNumber)
      toastStore.pushToast('success', 'Phone number copied to clipboard!')
    } catch (err) {
      toastStore.pushToast('error', 'Failed to copy phone number')
    }
  }

  const extractInformation = (preferencesRef) => {
    extractedData.value = {
      tradeIn: mockTranscription.leadLines.some(line => 
        line.toLowerCase().includes('trade') || line.toLowerCase().includes('exchange')
      ) || false,
      financing: mockTranscription.leadLines.some(line => 
        line.toLowerCase().includes('financ') || line.toLowerCase().includes('payment') || line.toLowerCase().includes('loan')
      ) || false
    }
    
    if (extractedData.value.tradeIn && preferencesRef) {
      preferencesRef.value.tradeIn = true
    }
    if (extractedData.value.financing && preferencesRef) {
      preferencesRef.value.financing = true
    }
    
    return extractedData.value
  }

  const resetCall = () => {
    isCallActive.value = false
    callEnded.value = false
    callDuration.value = 0
    callNotes.value = ''
    isMuted.value = false
    callData.value = {}
    if (callInterval.value) {
      clearInterval(callInterval.value)
      callInterval.value = null
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
    isMuted,
    callData,
    extractedData,
    mockTranscription,
    // Computed
    formattedCallDuration,
    // Methods
    startCall,
    endCall,
    toggleMute,
    copyNumber,
    extractInformation,
    resetCall
  }
}

