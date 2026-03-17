<template>
  <div v-if="!buttonOnly && !chipsOnly" class="flex flex-col gap-2">
    <div class="flex items-center gap-1.5 flex-wrap">
      <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            class="relative w-8 h-8"
            :aria-label="t('common.tasks.filterAria')"
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
            @select="(e) => { e.preventDefault(); handleFilterOptionSelect(option); }"
            class="flex items-center gap-2 cursor-pointer"
          >
            <Check v-if="(option.key === 'show-closed' ? showClosed : activeFilters.includes(option.key))" class="w-4 h-4 shrink-0" />
            <span v-else class="w-4 h-4 shrink-0" aria-hidden="true"></span>
            <span>{{ option.label }}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu :modal="false">
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="icon"
            class="relative w-8 h-8"
            :aria-label="t('common.tasks.sortAria')"
          >
            <ArrowUpDown class="w-4 h-4 shrink-0" />
            <span
              v-if="hasActiveSort"
              class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-primary"
            ></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56" align="start">
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

  <div v-else-if="buttonOnly" class="flex items-center gap-2 shrink-0">
    <DropdownMenu :modal="false">
      <DropdownMenuTrigger as-child>
        <Button
          variant="outline"
          size="icon"
          class="relative w-8 h-8"
          :aria-label="t('common.tasks.filterAria')"
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
          @select="(e) => { e.preventDefault(); handleFilterOptionSelect(option); }"
          class="flex items-center gap-2 cursor-pointer"
        >
          <Check v-if="(option.key === 'show-closed' ? showClosed : activeFilters.includes(option.key))" class="w-4 h-4 shrink-0" />
          <span v-else class="w-4 h-4 shrink-0" aria-hidden="true"></span>
          <span>{{ option.label }}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu :modal="false">
      <DropdownMenuTrigger as-child>
        <Button
          variant="outline"
          size="icon"
          class="relative w-8 h-8"
          :aria-label="t('common.tasks.sortAria')"
        >
          <ArrowUpDown class="w-4 h-4 shrink-0" />
          <span
            v-if="hasActiveSort"
            class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-primary"
          ></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56" align="end">
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

  <template v-else-if="chipsOnly"></template>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Filter, ArrowUpDown, Check } from 'lucide-vue-next'
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@motork/component-library/future/primitives'

const { t } = useI18n()

const props = defineProps({
  activeFilters: { type: Array, default: () => [] },
  sortOption: { type: String, default: '' },
  showClosed: { type: Boolean, default: false },
  buttonOnly: { type: Boolean, default: false },
  chipsOnly: { type: Boolean, default: false }
})

const emit = defineEmits(['filter-change', 'sort-change', 'toggle-closed'])

const hasActiveFilters = computed(() => props.activeFilters.length > 0 || props.showClosed)

const hasActiveSort = computed(() =>
  Boolean(props.sortOption && props.sortOption !== '' && props.sortOption !== 'none')
)

const filterOptions = computed(() => [
  { key: 'lead', label: t('common.tasks.filters.lead'), type: 'type' },
  { key: 'opportunity', label: t('common.tasks.filters.opportunity'), type: 'type' },
  { key: 'due-in-24h', label: t('common.tasks.filters.dueIn24h'), type: 'date' },
  { key: 'recall-appointment', label: t('common.tasks.filters.recallAppointment'), type: 'status' },
  { key: 'final-attempt', label: t('common.tasks.filters.finalAttempt'), type: 'status' },
  { key: 'leads-1h', label: t('common.tasks.filters.leads1h'), type: 'date' },
  { key: 'assigned-to-me', label: t('common.tasks.filters.assignedToMe'), type: 'assignee' },
  { key: 'assigned-to-my-team', label: t('common.tasks.filters.assignedToMyTeam'), type: 'assignee' },
  { key: 'show-closed', label: t('common.tasks.showClosed'), type: 'toggle' }
])

function handleFilterOptionSelect(option) {
  if (option.key === 'show-closed') {
    emit('toggle-closed')
    return
  }
  toggleFilter(option.key)
}

const toggleFilter = (filterKey) => {
  const currentFilters = [...props.activeFilters]
  const index = currentFilters.indexOf(filterKey)
  if (index > -1) {
    currentFilters.splice(index, 1)
  } else {
    currentFilters.push(filterKey)
  }
  emit('filter-change', currentFilters)
}

const selectSort = (option) => {
  emit('sort-change', option)
}

const sortMenuItems = computed(() => [
  { key: 'none', label: t('common.tasks.sort.none') },
  { key: 'recent-first', label: t('common.tasks.sort.mostRecentFirst') },
  { key: 'oldest-first', label: t('common.tasks.sort.oldestFirst') }
])
</script>
