<template>
  <div v-if="!buttonOnly && !chipsOnly" class="flex flex-col gap-2">
    <!-- Filter Dropdown and Chips Row -->
    <div class="flex items-center gap-1.5 flex-wrap">
      <!-- Filter Dropdown: same button as Activity tab (Filter icon + blue dot) -->
      <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            class="relative w-8 h-8"
            aria-label="Filter tasks"
          >
            <Filter class="w-4 h-4 shrink-0" />
            <span
              v-if="hasActiveFilters"
              class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-primary"
            ></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56" align="start">
          <DropdownMenuItem
            v-for="option in filterOptions"
            :key="option.key"
            @select="(e) => { e.preventDefault(); toggleFilter(option.key); }"
            class="flex items-center gap-2 cursor-pointer"
          >
            <Check v-if="activeFilters.includes(option.key)" class="w-4 h-4 shrink-0" />
            <span v-else class="w-4 h-4 shrink-0" aria-hidden="true"></span>
            <span>{{ option.label }}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            v-for="sortItem in sortMenuItems"
            :key="sortItem.key"
            @select="() => selectSort(sortItem.key)"
            class="flex items-center gap-2 cursor-pointer"
          >
            <Check v-if="sortItem.key === sortOption" class="w-4 h-4 shrink-0" />
            <span v-else class="w-4 h-4 shrink-0" aria-hidden="true"></span>
            <span>{{ sortItem.label }}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
  
  <!-- Button Only Mode (e.g. next to search) -->
  <div v-else-if="buttonOnly">
    <DropdownMenu :modal="false">
      <DropdownMenuTrigger as-child>
        <Button
          variant="outline"
          size="icon"
          class="relative w-8 h-8"
          aria-label="Filter tasks"
        >
          <Filter class="w-4 h-4 shrink-0" />
          <span
            v-if="hasActiveFilters"
            class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-primary"
          ></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="end">
        <DropdownMenuItem
          v-for="option in filterOptions"
          :key="option.key"
          @select="(e) => { e.preventDefault(); toggleFilter(option.key); }"
          class="flex items-center gap-2 cursor-pointer"
        >
          <Check v-if="activeFilters.includes(option.key)" class="w-4 h-4 shrink-0" />
          <span v-else class="w-4 h-4 shrink-0" aria-hidden="true"></span>
          <span>{{ option.label }}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          v-for="sortItem in sortMenuItems"
          :key="sortItem.key"
          @select="() => selectSort(sortItem.key)"
          class="flex items-center gap-2 cursor-pointer"
        >
          <Check v-if="sortItem.key === sortOption" class="w-4 h-4 shrink-0" />
          <span v-else class="w-4 h-4 shrink-0" aria-hidden="true"></span>
          <span>{{ sortItem.label }}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  
  <!-- Chips hidden: only the blue dot on the filter button indicates active filters -->
  <template v-else-if="chipsOnly"></template>
</template>

<script setup>
import { computed } from 'vue'
import { Filter, Check } from 'lucide-vue-next'
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@motork/component-library/future/primitives'

const props = defineProps({
  activeFilters: { type: Array, default: () => [] },
  sortOption: { type: String, default: '' },
  showClosed: { type: Boolean, default: false },
  buttonOnly: { type: Boolean, default: false },
  chipsOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['filter-change', 'sort-change', 'toggle-closed'])

const hasActiveFilters = computed(() => {
  const hasFilters = props.activeFilters.length > 0
  const hasSort = props.sortOption && props.sortOption !== '' && props.sortOption !== 'none'
  return hasFilters || hasSort
})

// Filter options configuration
const filterOptions = [
  { key: 'lead', label: 'Leads', type: 'type' },
  { key: 'opportunity', label: 'Opportunities', type: 'type' },
  { key: 'due-in-24h', label: 'Due in 24 hours', type: 'date' },
  { key: 'to-be-called', label: 'To be called again', type: 'status' },
  { key: 'leads-1h', label: 'Leads created 1 hour ago', type: 'date' },
  { key: 'assigned-to-me', label: 'Assigned to me', type: 'assignee' }
]

// Toggle filter on/off
const toggleFilter = (filterKey) => {
  const currentFilters = [...props.activeFilters]
  const index = currentFilters.indexOf(filterKey)
  
  if (index > -1) {
    // Remove filter
    currentFilters.splice(index, 1)
  } else {
    // Add filter
    currentFilters.push(filterKey)
  }
  
  emit('filter-change', currentFilters)
}

const selectSort = (option) => {
  emit('sort-change', option)
}

// Build sort menu items
const sortMenuItems = computed(() => {
  const hasLeads = props.activeFilters.includes('lead')
  return [
    { key: 'recent-first', label: 'Most Recent First' },
    ...(hasLeads ? [{ key: 'urgent-first', label: 'Urgent first' }] : []),
    { key: 'assigned-to-me', label: 'Assigned to me' },
    { key: 'assigned-to-my-team', label: 'Assigned to my team' }
  ]
})

</script>
