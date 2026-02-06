<template>
  <div 
    class="tasks-list-container border-r border-border flex flex-col shrink-0 w-full lg:w-80 h-full"
  >
    <!-- Header: Title + View Toggle -->
    <header class="page-header shrink-0">
      <div class="page-header-main">
        <div class="page-header-content">
          <div class="page-header-title-container">
            <h1 class="page-header-title">{{ displayTitle }}</h1>
          </div>
          
          <!-- View Toggle: Cards (left) → Table (right); highlighted = current view -->
          <div class="page-header-actions">
            <div class="bg-white p-0.5 rounded-btn inline-flex gap-0.5">
              <Button
                variant="secondary"
                size="icon"
                @click="$emit('view-change', 'card')"
                :class="[
                  'h-7 w-7',
                  viewMode === 'card'
                    ? 'bg-brand-gray text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
                title="Card View"
                :aria-pressed="viewMode === 'card'"
              >
                <LayoutGrid :size="14" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                @click="$emit('view-change', 'table')"
                :class="[
                  'h-7 w-7',
                  viewMode === 'table'
                    ? 'bg-brand-gray text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
                title="Table View"
                :aria-pressed="viewMode === 'table'"
              >
                <Table :size="14" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    
    <!-- Search: same Motork InputGroup as DataTable, no custom styling -->
    <div class="px-5 py-3">
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0">
          <InputGroup>
            <InputGroupInput
              v-model="searchQuery"
              :placeholder="searchPlaceholder"
            />
            <InputGroupAddon>
              <Search :size="18" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <TaskFilters
          :active-filters="activeFilters"
          :sort-option="currentSort"
          :button-only="true"
          @filter-change="$emit('filter-change', $event)"
          @sort-change="selectSort"
        />
      </div>
    </div>
    
    <div ref="scrollContainer" class="task-list-cards flex-1 overflow-y-auto px-5 space-y-3 pt-4 pb-6 scrollbar-hide">
      <div
        v-for="item in filteredItems"
        :key="item.compositeId || `${item.type || 'task'}-${item.id}`"
        :data-composite-id="item.compositeId || `${item.type || 'task'}-${item.id}`"
        class="scroll-mt-2 scroll-mb-2"
      >
      <TaskCard
        :item="item"
        :selected="isSelected(item)"
        :selected-class="selectedClass"
        :unselected-class="unselectedClass"
        :getName="getName"
        @select="$emit('select', $event)"
      >
        <template #location="{ item }">
          <slot name="location" :item="item"></slot>
        </template>
        <template #source="{ item }">
          <slot name="source" :item="item"></slot>
        </template>
        <template #owner="{ item }">
          <slot name="owner" :item="item"></slot>
        </template>
        <template #dates="{ item }">
          <slot name="dates" :item="item"></slot>
        </template>
      </TaskCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { Table, LayoutGrid, Search } from 'lucide-vue-next'
import { Button, InputGroup, InputGroupInput, InputGroupAddon } from '@motork/component-library/future/primitives'
import TaskCard from '@/components/tasks/TaskCard.vue'
import TaskFilters from '@/components/tasks/TaskFilters.vue'

const props = defineProps({
  title: { type: String, default: 'Tasks' },
  items: { type: Array, default: () => [] },
  selectedId: { type: [String, Number], default: null },
  activeFilters: { type: Array, default: () => [] },
  initialSearchQuery: { type: String, default: '' },
  selectedClass: { type: [String, Function], default: '' },
  unselectedClass: { type: [String, Function], default: '' },
  getName: { type: Function, default: (item) => item.name || 'Unknown' },
  getVehicleInfo: { type: Function, default: () => 'No vehicle specified' },
  searchPlaceholder: { type: String, default: 'Search' },
  viewMode: { type: String, default: 'card' }
})

const emit = defineEmits(['select', 'filter-change', 'sort-change', 'close', 'view-change'])

const searchQuery = ref(props.initialSearchQuery)
const scrollContainer = ref(null)
const currentSort = ref('')

// Ensure title is always a string (handle case where function might be passed)
const displayTitle = computed(() => {
  if (typeof props.title === 'string') {
    return props.title
  }
  if (typeof props.title === 'function') {
    // If a function is passed, return the default title instead
    console.warn('TasksList: title prop received a function instead of a string. Using default title.')
    return 'Tasks'
  }
  return props.title || 'Tasks'
})

// Watch for initialSearchQuery changes
watch(() => props.initialSearchQuery, (newVal) => {
  searchQuery.value = newVal
})

// Scroll selected task into view when selection changes
watch(() => props.selectedId, async (selectedId) => {
  if (!selectedId || !scrollContainer.value) return
  await nextTick()
  const el = scrollContainer.value.querySelector(`[data-composite-id="${CSS.escape(String(selectedId))}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}, { immediate: true })

// Filter items based on search query and active filters
const filteredItems = computed(() => {
  let items = props.items
  
  // Apply type filters (lead/opportunity) if present
  const typeFilters = props.activeFilters.filter(f => f === 'lead' || f === 'opportunity')
  if (typeFilters.length > 0) {
    items = items.filter(item => {
      // Check if item has type property and matches filter
      if (item.type && typeFilters.includes(item.type)) {
        return true
      }
      return false
    })
  }
  
  // Apply search query filter
  if (!searchQuery.value.trim()) {
    return items
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return items.filter(item => {
    // Collect all searchable fields
    const searchableValues = [
      props.getName(item),
      props.getVehicleInfo(item),
      item.customer?.email,
      item.customer?.phone,
      item.customer?.city,
      item.customer?.location,
      item.status,
      item.stage,
      item.displayStage,
      item.type,
      item.source,
      item.sourceDetails,
      item.assignee,
      item.compositeId,
      item.urgencyLevel,
      item.requestMessage,
      item.requestedCar?.brand,
      item.requestedCar?.model,
      item.vehicle?.brand,
      item.vehicle?.model,
    ].filter(Boolean).map(v => String(v).toLowerCase())
    
    return searchableValues.some(value => value.includes(query))
  })
})

// Check if item is selected
const isSelected = (item) => {
  if (!props.selectedId) return false
  const itemId = item.compositeId || `${item.type || 'task'}-${item.id}`
  return String(itemId) === String(props.selectedId)
}

// Handle sort selection
const selectSort = (option) => {
  currentSort.value = option
  emit('sort-change', option)
}
</script>

<style scoped>
.tasks-list-container {
  background-color: var(--brand-gray) !important;
}

</style>
