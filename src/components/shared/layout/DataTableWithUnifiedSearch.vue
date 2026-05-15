<template>
  <div
    class="datatable-unified-shell bg-background"
    :class="[
      fillHeight ? 'datatable-fill-height flex flex-col flex-1 min-h-0 h-full' : '',
      !fillHeight && includeMarginBottom ? 'mb-8' : ''
    ]"
  >
    <slot name="before-search" />
    <div class="mb-1 shrink-0">
      <UnifiedSearchBar
        :active-tab="activeTab"
        :placeholder="placeholder"
        :global-filter="globalFilter"
        :pagination="pagination"
        :assignee-options="assigneeOptions"
        :volvo-model-options="volvoModelOptions"
        :brand-options="brandOptions"
        :request-type-options="requestTypeOptions"
        :status-options="statusOptions"
        :source-options="sourceOptions"
        :priority-options="priorityOptions"
        :type-options="typeOptions"
        :requested-car-brand-options="requestedCarBrandOptions"
        :account-type-options="accountTypeOptions"
        @update:global-filter="emit('update:globalFilter', $event)"
        @update:column-filters="emit('update:columnFilters', $event)"
        @update:pagination="emit('update:pagination', $event)"
      >
        <template v-if="sortMenuItems.length > 0" #trailing>
          <Select v-model="sortSelectModel">
            <SelectTrigger :aria-label="t('dataTable.sortSelectAriaLabel')">
              <SelectValue :placeholder="t('dataTable.sortOptions.custom.summary')">
                {{ currentSortSummary }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" align="end" :side-offset="4">
              <SelectItem
                v-for="item in sortMenuItems"
                :key="item.value"
                :value="item.value"
              >
                {{ t(`dataTable.sortOptions.${item.optionId}.menu`) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </template>
      </UnifiedSearchBar>
    </div>
    <div
      ref="tableScrollContainer"
      class="data-table-inner table-search-wrapper"
      :class="fillHeight ? 'flex flex-1 flex-col min-h-0' : ''"
      @click="emit('wrapperClick', $event)"
    >
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@motork/component-library/future/primitives'
import UnifiedSearchBar from '@/components/shared/UnifiedSearchBar.vue'
import { DEFAULT_TABLE_PAGE_SIZE } from '@/constants/dataTable'

const { t } = useI18n()

const props = defineProps({
  activeTab: { type: String, default: 'opportunities' },
  placeholder: { type: String, default: '' },
  pagination: { type: Object, default: () => ({ pageIndex: 0, pageSize: DEFAULT_TABLE_PAGE_SIZE }) },
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
  includeMarginBottom: { type: Boolean, default: true },
  fillHeight: { type: Boolean, default: true },
  sortMenuItems: { type: Array, default: () => [] },
  globalFilter: { type: String, default: undefined },
})

const sorting = defineModel('sorting', { type: Array, default: () => [] })

const emit = defineEmits(['update:globalFilter', 'update:columnFilters', 'update:pagination', 'wrapperClick'])

function normalizeSort (sort) {
  return (sort ?? []).map((s) => ({
    id: s.id,
    desc: Boolean(s.desc),
  }))
}

function sortsEqual (a, b) {
  return JSON.stringify(normalizeSort(a)) === JSON.stringify(normalizeSort(b))
}

const currentSortSummary = computed(() => {
  const match = props.sortMenuItems.find((it) => sortsEqual(it.sorting, sorting.value))
  if (match) return t(`dataTable.sortOptions.${match.optionId}.summary`)
  return t('dataTable.sortOptions.custom.summary')
})

const sortSelectModel = computed({
  get () {
    const match = props.sortMenuItems.find((it) => sortsEqual(it.sorting, sorting.value))
    return match?.value ?? undefined
  },
  set (value) {
    if (value == null || value === '') return
    const item = props.sortMenuItems.find((it) => it.value === value)
    if (item) sorting.value = normalizeSort(item.sorting)
  },
})

const tableScrollContainer = ref(null)

defineExpose({ tableScrollContainer })
</script>
