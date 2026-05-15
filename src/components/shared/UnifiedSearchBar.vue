<template>
  <div class="mb-0 w-full min-w-0 overflow-visible">
    <div class="relative w-full min-w-0 overflow-visible">
      <Transition name="ai-overlay-fade">
        <div
          v-if="showAiOverlay"
          class="absolute left-0 right-0 top-0 z-30 flex min-h-12 w-full min-w-0 items-stretch pointer-events-auto"
          role="dialog"
          :aria-label="t('dataTable.askAI')"
        >
          <div class="w-full min-w-0 rounded-lg p-px shadow-lg bg-ai-gradient">
            <div class="ai-overlay-inner min-h-12 w-full min-w-0 overflow-hidden rounded-lg bg-background">
              <InputGroup class="h-full min-h-12 min-w-0 border-0 bg-transparent px-2 py-1 shadow-none">
                <InputGroupInput
                  ref="aiInputRef"
                  v-model="aiQuery"
                  class="min-h-10 flex-1 border-0 bg-transparent text-fluid-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  :placeholder="aiPlaceholder"
                  :disabled="isProcessingQuery"
                  autocomplete="off"
                  @keydown.enter.prevent="handleAiEnter"
                  @keydown.escape.prevent="closeAiOverlay"
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="default"
                    class="gap-1.5"
                    :disabled="isProcessingQuery || !aiQuery.trim()"
                    @click="submitAiQuery"
                  >
                    {{ t('dataTable.go') }}
                    <ArrowRight :size="16" class="shrink-0" aria-hidden="true" />
                  </Button>
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    :aria-label="t('dataTable.closeAiOverlay')"
                    @click="closeAiOverlay"
                  >
                    <X :size="18" class="shrink-0 text-muted-foreground" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </div>
      </Transition>

      <div
        class="flex w-full min-w-0 items-stretch justify-between gap-2 overflow-visible transition-opacity"
        :class="showAiOverlay ? 'pointer-events-none opacity-0' : 'opacity-100'"
      >
        <div class="flex w-full min-w-0 items-stretch gap-2 sm:max-w-md">
          <div class="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-muted px-1.5 py-0.5">
            <Switch
              size="sm"
              :model-value="aiModeEnabled"
              :disabled="isProcessingQuery"
              :aria-label="t('dataTable.aiMode')"
              @update:model-value="setAiMode"
            />
            <Sparkles
              :size="16"
              class="shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span class="text-fluid-sm font-medium text-muted-foreground select-none leading-none">
              {{ aiModeEnabled ? t('dataTable.aiModeOn') : t('dataTable.aiModeOff') }}
            </span>
          </div>

          <InputGroup class="min-w-0 flex-1">
            <InputGroupAddon>
              <Search :size="16" class="shrink-0 text-muted-foreground" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              ref="searchInputRef"
              v-model="searchQuery"
              :placeholder="computedPlaceholder"
              :disabled="showAiOverlay || isProcessingQuery"
              @keydown.enter="handleSearchKeyDown"
            />
          </InputGroup>
        </div>

        <div class="shrink-0">
          <slot name="trailing" />
        </div>
      </div>
    </div>

    <div v-if="queryError" class="mt-0.5 text-fluid-xs text-muted-foreground">
      {{ queryError }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sparkles, X, ArrowRight, Search } from 'lucide-vue-next'
import { Button, Switch, InputGroup, InputGroupAddon, InputGroupInput } from '@motork/component-library/future/primitives'
import { useNaturalLanguageQuery } from '@/composables/useNaturalLanguageQuery'
import { DEFAULT_TABLE_PAGE_SIZE } from '@/constants/dataTable'

const { t } = useI18n()

const props = defineProps({
  activeTab: { type: String, default: 'opportunities' },
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
  pagination: { type: Object, default: () => ({ pageIndex: 0, pageSize: DEFAULT_TABLE_PAGE_SIZE }) },
  /** When set, keeps the input in sync with parent `globalFilter` (e.g. programmatic clear). */
  globalFilter: { type: String, default: undefined },
})

const emit = defineEmits([
  'update:globalFilter',
  'update:columnFilters',
  'update:pagination',
])

const searchQuery = ref('')
const aiQuery = ref('')
const aiModeEnabled = ref(false)
const showAiOverlay = ref(false)
const queryError = ref(null)
const isProcessingQuery = ref(false)
const searchInputRef = ref(null)
const aiInputRef = ref(null)
const exampleIndex = ref(0)
let exampleIntervalId = null

function getContext () {
  const tab = props.activeTab || ''
  if (tab === 'vehicles') return 'vehicles'
  if (tab === 'customers') return 'customers'
  if (tab === 'leads' || tab === 'open-leads') return 'leads'
  if (tab === 'opportunities' || tab === 'open-opportunities' || tab === 'won' || tab === 'lost' || tab === 'in-negotiation') {
    return 'opportunities'
  }
  if (tab === 'tasks') return 'tasks'
  if (tab === 'requests') return 'requests'
  if (tab === 'reports') return 'reports'
  if (tab === 'campaigns') return 'campaigns'
  return tab || 'opportunities'
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

const placeholderKeyByContext = {
  vehicles: 'searchVehicles',
  customers: 'searchCustomers',
  leads: 'searchLeads',
  opportunities: 'searchOpportunities',
  tasks: 'searchTasks',
  requests: 'searchRequests',
  reports: 'searchReports',
  campaigns: 'searchCampaigns',
}

const computedPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder
  const ctx = getContext()
  const key = placeholderKeyByContext[ctx] || 'searchOpportunities'
  return t(`dataTable.${key}`)
})

const rotationExamples = computed(() => {
  if (getContext() === 'tasks') {
    return [
      t('dataTable.aiExampleTasks1'),
      t('dataTable.aiExampleTasks2'),
      t('dataTable.aiExampleTasks3'),
    ]
  }
  return [
    t('dataTable.aiExampleGeneric1'),
    t('dataTable.aiExampleGeneric2'),
    t('dataTable.aiExampleGeneric3'),
  ]
})

watch(
  () => props.globalFilter,
  (v) => {
    if (v === undefined) return
    if (showAiOverlay.value) return
    const next = v ?? ''
    if (searchQuery.value !== next) {
      searchQuery.value = next
    }
  },
)

const currentRotationExample = computed(() => {
  const list = rotationExamples.value
  if (!list.length) return ''
  return list[exampleIndex.value % list.length]
})

const aiPlaceholder = computed(() => {
  if (aiQuery.value.trim()) return ''
  return currentRotationExample.value || t('dataTable.aiExampleGeneric1')
})

function focusInputRef (inputRef) {
  nextTick(() => {
    const el = inputRef.value
    const dom =
      el instanceof HTMLElement
        ? el
        : el?.$el instanceof HTMLElement
          ? el.$el
          : null
    const input = dom?.querySelector?.('input,textarea,[contenteditable="true"]') || dom
    if (input && typeof input.focus === 'function') {
      input.focus()
    }
  })
}

function clearExampleRotation () {
  if (exampleIntervalId != null) {
    clearInterval(exampleIntervalId)
    exampleIntervalId = null
  }
}

function startExampleRotation () {
  clearExampleRotation()
  exampleIntervalId = setInterval(() => {
    if (!showAiOverlay.value || aiQuery.value.trim()) return
    const len = rotationExamples.value.length
    if (len) exampleIndex.value = (exampleIndex.value + 1) % len
  }, 2600)
}

watch(showAiOverlay, (open) => {
  if (open) {
    exampleIndex.value = 0
    startExampleRotation()
    focusInputRef(aiInputRef)
  } else {
    clearExampleRotation()
  }
})

function setAiMode (enabled) {
  const next = Boolean(enabled)
  aiModeEnabled.value = next
  queryError.value = null
  showAiOverlay.value = next
  if (!next) {
    aiQuery.value = ''
    focusInputRef(searchInputRef)
  }
}

watch(
  () => props.activeTab,
  () => {
    exampleIndex.value = 0
  }
)

watch(searchQuery, (newValue) => {
  if (!showAiOverlay.value) {
    emit('update:globalFilter', newValue)
  } else if (!newValue?.trim()) {
    emit('update:globalFilter', '')
    emit('update:columnFilters', [])
    emit('update:pagination', { ...props.pagination, pageIndex: 0 })
  }
})

watch(aiQuery, (val) => {
  if (!val?.trim()) {
    queryError.value = null
  }
})

onUnmounted(() => {
  clearExampleRotation()
})

function openAiOverlay () {
  queryError.value = null
  aiModeEnabled.value = true
  showAiOverlay.value = true
}

function closeAiOverlay () {
  showAiOverlay.value = false
  aiModeEnabled.value = false
  aiQuery.value = ''
  queryError.value = null
  focusInputRef(searchInputRef)
}

async function submitAiQuery () {
  const trimmed = aiQuery.value.trim()
  if (!trimmed || isProcessingQuery.value) return

  isProcessingQuery.value = true
  queryError.value = null
  await new Promise((resolve) => setTimeout(resolve, 600))

  const { filters, error, globalFilterFallback } = getProcessQuery()(trimmed)

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
}

function handleSearch () {
  if (!searchQuery.value.trim() || isProcessingQuery.value) return
  emit('update:globalFilter', searchQuery.value)
  emit('update:columnFilters', [])
  emit('update:pagination', { ...props.pagination, pageIndex: 0 })
}

function handleSearchKeyDown (event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    event.stopPropagation()
    handleSearch()
  }
}

function handleAiEnter () {
  submitAiQuery()
}
</script>

<style scoped>
.ai-overlay-inner :deep([data-slot='input-group']) {
  @apply border-0 shadow-none;
}

.ai-overlay-inner :deep([data-slot='input-group']:focus-within) {
  @apply border-0 shadow-none ring-0 ring-offset-0;
}

.ai-overlay-fade-enter-active,
.ai-overlay-fade-leave-active {
  transition: opacity 0.15s ease;
}

.ai-overlay-fade-enter-from,
.ai-overlay-fade-leave-to {
  opacity: 0;
}
</style>
