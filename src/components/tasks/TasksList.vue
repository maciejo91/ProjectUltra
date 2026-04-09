<template>
  <div
    ref="scrollContainer"
    class="tasks-list-container flex w-full shrink-0 flex-col border-border border-r bg-muted lg:w-80"
  >
    <!-- Search: same Motork InputGroup as DataTable; inner input border removed so only group border shows -->
    <div class="px-2 py-3 tasks-list-search">
      <div class="flex items-center gap-2">
        <div class="flex-1 min-w-0">
          <InputGroup class="tasks-list-search-group bg-white rounded-lg overflow-hidden">
            <InputGroupInput
              v-model="searchQuery"
              :placeholder="searchPlaceholder"
              class="bg-white border-0 rounded-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <InputGroupAddon>
              <Search :size="18" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <TaskFilters
          :active-filters="activeFilters"
          :sort-option="currentSort"
          :show-closed="showClosed"
          :button-only="true"
          @filter-change="$emit('filter-change', $event)"
          @sort-change="selectSort"
          @toggle-closed="$emit('toggle-closed')"
        />
      </div>
    </div>
    
    <div class="task-list-cards px-2 space-y-2 pt-2 pb-6">
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
import { Search } from 'lucide-vue-next'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@motork/component-library/future/primitives'
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
  viewMode: { type: String, default: 'card' },
  showClosed: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'filter-change', 'sort-change', 'toggle-closed', 'close', 'view-change'])

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
.tasks-list-search :deep(.tasks-list-search-group input) {
  border: none;
  box-shadow: none;
}
</style>

