<template>
  <div class="mb-0 unified-search-bar">
    <div
      class="relative flex items-center rounded-lg transition-all duration-300 ease-in-out"
      :class="[
        isAIMode
          ? 'p-px bg-gradient-to-r from-[#40B3E9] via-[#8873FF] to-[#FF8B42] w-full'
          : 'w-full',
        !fullWidth && (isAIMode ? 'max-w-2xl' : 'max-w-md'),
      ]"
    >
      <div
        class="absolute left-3 flex items-center pointer-events-none z-10 transition-opacity duration-300"
      >
        <Sparkles v-if="isAIMode" :size="14" class="text-muted-foreground" />
        <Search v-else :size="14" class="text-muted-foreground" />
      </div>

      <input
        v-model="searchQuery"
        type="text"
        :placeholder="computedPlaceholder"
        :class="[
          'w-full pl-9 py-2 rounded-lg text-fluid-sm bg-background focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300',
          isAIMode ? 'border-0' : 'border border-border',
        ]"
        :style="{ paddingRight: 'calc(2px + 2px + 80px)' }"
        :disabled="isProcessingQuery"
        @keydown.enter="handleSearchKeyDown"
      />

      <Button
        type="button"
        @click="toggleAIMode"
        :variant="isAIMode ? undefined : 'secondary'"
        :class="[
          'absolute rounded-lg right-[2px] my-[2px] px-3 py-2 text-sm flex items-center gap-2',
          isAIMode ? 'mk-ai-mode-active' : '',
        ]"
      >
        <Sparkles
          :size="12"
          :fill="isAIMode ? 'white' : 'currentColor'"
          :stroke="isAIMode ? 'none' : 'currentColor'"
          :stroke-width="isAIMode ? 0 : 1.5"
          :class="['shrink-0', isAIMode && 'text-white']"
        />
        AI Mode
      </Button>
    </div>

    <div v-if="queryError" class="text-fluid-xs text-muted-foreground mt-0.5">
      {{ queryError }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Sparkles } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { useNaturalLanguageQuery } from '@/composables/useNaturalLanguageQuery'

const props = defineProps({
  activeTab: { type: String, default: 'opportunities' },
  fullWidth: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  assigneeOptions: { type: Array, default: () => [] },
  volvoModelOptions: { type: Array, default: () => [] },
  brandOptions: { type: Array, default: () => [] },
  requestTypeOptions: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
  sourceOptions: { type: Array, default: () => [] },
  priorityOptions: { type: Array, default: () => [] },
  typeOptions: { type: Array, default: () => [] },
  requestedCarBrandOptions: { type: Array, default: () => [] },
  accountTypeOptions: { type: Array, default: () => [] },
  pagination: { type: Object, default: () => ({ pageIndex: 0, pageSize: 10 }) },
})

const emit = defineEmits([
  'update:globalFilter',
  'update:columnFilters',
  'update:pagination',
])

const searchQuery = ref('')
const isAIMode = ref(false)
const queryError = ref(null)
const isProcessingQuery = ref(false)

function getContext () {
  const t = props.activeTab || ''
  if (t === 'vehicles') return 'vehicles'
  if (t === 'customers') return 'customers'
  if (t === 'leads' || t === 'open-leads') return 'leads'
  if (t === 'opportunities' || t === 'open-opportunities' || t === 'won' || t === 'lost' || t === 'in-negotiation') return 'opportunities'
  if (t === 'tasks') return 'tasks'
  if (t === 'requests') return 'requests'
  if (t === 'reports') return 'reports'
  if (t === 'campaigns') return 'campaigns'
  return t || 'opportunities'
}

function getProcessQuery () {
  return useNaturalLanguageQuery({
    context: getContext(),
    assigneeOptions: props.assigneeOptions,
    volvoModelOptions: props.volvoModelOptions,
    brandOptions: props.brandOptions,
    requestTypeOptions: props.requestTypeOptions,
    statusOptions: props.statusOptions,
    sourceOptions: props.sourceOptions,
    priorityOptions: props.priorityOptions,
    typeOptions: props.typeOptions,
    requestedCarBrandOptions: props.requestedCarBrandOptions,
    accountTypeOptions: props.accountTypeOptions,
  }).processQuery
}

const AI_PLACEHOLDERS = {
  vehicles: 'Ask anything... (e.g., XC90 available, Volkswagen under €50k)',
  leads: 'Ask anything... (e.g., All new cars assigned to Josh, leads created last 3 days)',
  opportunities: 'Ask anything... (e.g., Test drives from marketing, qualified opportunities)',
  tasks: 'Ask anything... (e.g., Tasks assigned to me, hot leads due this week)',
  requests: 'Ask anything... (e.g., Assigned to Sarah, valid requests)',
  customers: 'Ask anything... (e.g., Contacts from marketing, companies)',
  reports: 'Search team performance...',
  campaigns: 'Ask anything... (e.g., Email from last week, WhatsApp inbound)',
}

const computedPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder
  if (isAIMode.value) {
    const ctx = getContext()
    return AI_PLACEHOLDERS[ctx] ?? 'Ask anything... (e.g., All new cars assigned to Josh)'
  }
  return props.activeTab === 'opportunities' ? 'Search opportunities...' : 'Search leads...'
})

// Keep input and filter in sync: typing (including clearing) updates filter; never clear input on Enter
watch(searchQuery, (newValue) => {
  if (!isAIMode.value) {
    emit('update:globalFilter', newValue)
  } else if (!newValue?.trim()) {
    // In AI mode, clearing the input removes filtration
    emit('update:globalFilter', '')
    emit('update:columnFilters', [])
    emit('update:pagination', { ...props.pagination, pageIndex: 0 })
  }
})

async function handleSearch () {
  if (!searchQuery.value.trim() || isProcessingQuery.value) return

  if (isAIMode.value) {
    isProcessingQuery.value = true
    queryError.value = null
    await new Promise((resolve) => setTimeout(resolve, 600))

    const { filters, error, globalFilterFallback } = getProcessQuery()(searchQuery.value.trim())

    if (error) {
      queryError.value = error
      isProcessingQuery.value = false
      return
    }

    if (globalFilterFallback) {
      emit('update:globalFilter', globalFilterFallback)
      emit('update:columnFilters', [])
      emit('update:pagination', { ...props.pagination, pageIndex: 0 })
    } else {
      emit('update:globalFilter', '')
      emit('update:columnFilters', filters)
      emit('update:pagination', { ...props.pagination, pageIndex: 0 })
    }
    isProcessingQuery.value = false
  } else {
    emit('update:globalFilter', searchQuery.value)
    emit('update:columnFilters', [])
    emit('update:pagination', { ...props.pagination, pageIndex: 0 })
  }
}

function handleSearchKeyDown (event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    event.stopPropagation()
    handleSearch()
    // Do not clear searchQuery: keep the text in the input
  }
}

function toggleAIMode () {
  isAIMode.value = !isAIMode.value
  searchQuery.value = ''
  queryError.value = null
  emit('update:globalFilter', '')
  emit('update:columnFilters', [])
}
</script>

