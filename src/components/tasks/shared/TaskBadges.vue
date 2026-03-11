<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Type Badge (Lead/Opportunity) -->
    <span 
      class="px-1.5 py-0.5 rounded text-xs font-medium uppercase leading-none"
      :class="typeBadgeClass"
    >
      {{ typeLabel }}
    </span>

    <!-- Attempts (call attempts indicator; hidden when shown under card title) -->
    <span
      v-if="!attemptsShownElsewhere && callAttemptsCount > 0"
      class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground leading-none shrink-0"
    >
      <Phone class="shrink-0 size-2.5" aria-hidden />
      {{ callAttemptsValue }}
    </span>
    
    <!-- Hot Priority Badge (when urgency disabled and not shown elsewhere e.g. next to name on card) -->
    <span 
      v-if="showHotPriorityBadge && !urgencyShownElsewhere"
      class="px-1.5 py-0.5 rounded text-xs font-medium uppercase bg-badge-red text-red-700 leading-none"
    >
      Hot
    </span>
    
    <!-- Base Status Badge (shown when there's a substatus) -->
    <span 
      v-if="baseStatus && hasSubstatus"
      class="px-1.5 py-0.5 rounded text-xs font-medium uppercase leading-none"
      :class="getStageColorClass(baseStatus)"
    >
      {{ baseStatus }}
    </span>
    
    <!-- Substatus Badge (or single status if no substatus) -->
    <span 
      v-if="displayStatus"
      class="px-1.5 py-0.5 rounded text-xs font-medium uppercase leading-none"
      :class="getStageColorClass(displayStatus)"
    >
      {{ displayStatus }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Phone } from 'lucide-vue-next'
import { getDisplayStage as getCalculatedDisplayStageFromMapper, getStageColor as getStageColorFromMapper } from '@/utils/stageMapper'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

/** For leads: use calculated display stage (New, To be called back, Valid - to be called back, etc.), not raw API status (Open, Validated). */
const getLeadDisplayStage = (task) => {
  if (!task || task.type !== 'lead') return null
  try {
    return getCalculatedDisplayStageFromMapper(task, 'lead')
  } catch (e) {
    return task.displayStage || task.stage || null
  }
}

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  /** When true (e.g. on TaskCard), urgency/hot is shown next to customer name so we hide it here to avoid duplicate. */
  urgencyShownElsewhere: {
    type: Boolean,
    default: false
  },
  /** When true (e.g. on TaskCard), call attempts are shown under the title so we hide them here. */
  attemptsShownElsewhere: {
    type: Boolean,
    default: false
  }
})

const maxContactAttempts = computed(() => settingsStore.getSetting('maxContactAttempts') ?? 5)
const callAttemptsCount = computed(() => props.task?.contactAttempts?.length ?? 0)
const callAttemptsValue = computed(() => `${callAttemptsCount.value}/${maxContactAttempts.value}`)

const urgencyEnabled = computed(() => settingsStore.getSetting('urgencyEnabled') !== false)
const showHotPriorityBadge = computed(() =>
  props.task?.priority === 'Hot' && !urgencyEnabled.value
)
const typeLabel = computed(() => {
  return props.task.type === 'lead' ? 'Lead' : 'Opportunity'
})

const typeBadgeClass = computed(() => {
  return props.task.type === 'lead' 
    ? 'bg-badge-green text-emerald-700' 
    : 'bg-purple-50 text-purple-700'
})

const getBaseStage = (task) => {
  if (!task) return ''
  return task.stage || task.currentStage || 'New'
}

const getCalculatedDisplayStage = (task) => {
  if (!task || task.type !== 'opportunity') return null
  try {
    return getCalculatedDisplayStageFromMapper(task, 'opportunity')
  } catch (e) {
    return task.displayStage || task.stage || null
  }
}

const baseStatus = computed(() => {
  if (!props.task || props.task.type !== 'opportunity') return null
  return getBaseStage(props.task)
})

const displayStage = computed(() => {
  if (!props.task) return ''
  
  if (props.task.type === 'opportunity') {
    return getCalculatedDisplayStage(props.task) || getBaseStage(props.task) || 'New'
  }
  // Leads: use calculated display stage (New, To be called back, Valid - to be called back, etc.), not raw status (Open, Validated)
  return getLeadDisplayStage(props.task) || props.task.displayStage || props.task.stage || props.task.currentStage || 'New'
})

const substatus = computed(() => {
  if (!props.task || props.task.type !== 'opportunity') return null
  
  const base = baseStatus.value
  const display = displayStage.value
  
  if (!display || !base || display === base) return null
  
  // Extract substatus from display stage (everything after " - ")
  const baseLower = base.toLowerCase().trim()
  const displayLower = display.toLowerCase().trim()
  
  if (displayLower.startsWith(baseLower + ' - ')) {
    const prefix = base + ' - '
    if (display.startsWith(prefix)) {
      return display.substring(prefix.length)
    }
  }
  
  return null
})

const hasSubstatus = computed(() => {
  return !!substatus.value
})

const displayStatus = computed(() => {
  // If there's a substatus, show it; otherwise show the full display stage
  return substatus.value || displayStage.value
})

const getStageColorClass = (stage) => {
  if (!stage) return 'bg-gray-50 text-gray-700 border-gray-200'
  
  // For opportunities, use the stage mapper color
  if (props.task.type === 'opportunity') {
    try {
      const baseColor = getStageColorFromMapper(stage, 'opportunity')
      return baseColor
    } catch (e) {
      // Fallback to stage-based colors
    }
  }
  
  // Fallback colors for leads or when stage mapper fails (New = green per screenshot)
  const stageLower = stage.toLowerCase()
  if (stageLower.includes('new')) return 'bg-badge-green text-emerald-700'
  if (stageLower.includes('qualif')) return 'bg-badge-green text-green-600'
  if (stageLower.includes('negotiat')) return 'bg-purple-50 text-purple-600'
  if (stageLower.includes('close')) return 'bg-muted text-muted-foreground'
  return 'bg-gray-50 text-gray-700'
}
</script>
