<script setup>
import { computed, h, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import { DataTable } from '@motork/component-library/future/components'
import { Avatar, AvatarFallback, Button } from '@motork/component-library/future/primitives'

const { t } = useI18n()

const props = defineProps({
  data: { type: Array, required: true },
  title: { type: String, default: undefined }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const sorting = ref([{ id: 'leads', desc: true }])

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const columns = computed(() => [
  {
    accessorKey: 'name',
    header: () => t('home.nscDashboard.columns.name'),
    meta: { title: t('home.nscDashboard.columns.name') },
    cell: ({ row }) => {
      const performer = row.original
      return h('div', { class: 'flex items-center gap-3' }, [
        h(
          Avatar,
          { class: 'h-8 w-8' },
          {
            default: () =>
              h(
                AvatarFallback,
                { class: 'bg-greys-300! text-greys-900' },
                { default: () => getInitials(performer.name) }
              )
          }
        ),
        h('div', { class: 'flex min-w-0 flex-col' }, [
          h('span', { class: 'truncate text-sm font-medium text-greys-900' }, performer.name),
          h('span', { class: 'truncate text-xs text-greys-500' }, performer.team || performer.city)
        ])
      ])
    },
    size: 400
  },
  {
    accessorKey: 'leads',
    header: () => h('div', { class: 'text-sm' }, t('home.nscDashboard.columns.leads')),
    meta: { title: t('home.nscDashboard.columns.leads') },
    cell: ({ row }) => h('div', { class: 'text-sm text-greys-900' }, row.original.leads.toString()),
    size: 70
  },
  {
    accessorKey: 'qualifiedPercentage',
    header: () => h('div', { class: 'text-sm' }, t('home.nscDashboard.columns.qualifiedLeadsPercent')),
    meta: { title: t('home.nscDashboard.columns.qualifiedLeadsPercent') },
    cell: ({ row }) =>
      h('div', { class: 'text-sm text-greys-900' }, `${row.original.qualifiedPercentage}%`),
    size: 80
  },
  {
    accessorKey: 'opportunities',
    header: () => h('div', { class: 'text-sm' }, t('home.nscDashboard.columns.opportunities')),
    meta: { title: t('home.nscDashboard.columns.opportunities') },
    cell: ({ row }) =>
      h('div', { class: 'text-sm text-greys-900' }, row.original.opportunities.toString()),
    size: 75
  },
  {
    accessorKey: 'contracts',
    header: () => h('div', { class: 'text-sm' }, t('home.nscDashboard.columns.contracts')),
    meta: { title: t('home.nscDashboard.columns.contracts') },
    cell: ({ row }) => h('div', { class: 'text-sm text-greys-900' }, row.original.contracts.toString()),
    size: 70
  },
  {
    accessorKey: 'conversionRate',
    header: () => h('div', { class: 'text-sm' }, t('home.nscDashboard.columns.conversionRate')),
    meta: { title: t('home.nscDashboard.columns.conversionRate') },
    cell: ({ row }) => {
      const item = row.original
      const conversionRate = item.leads > 0 ? ((item.contracts / item.leads) * 100).toFixed(1) : '0.0'
      return h('div', { class: 'text-sm text-greys-900' }, `${conversionRate}%`)
    },
    size: 85
  }
])

const sortedData = computed(() =>
  [...props.data]
    .sort((a, b) => {
      const sort = sorting.value[0]
      if (!sort) return b.leads - a.leads

      const getValue = (item) => {
        if (sort.id === 'conversionRate') {
          return item.leads > 0 ? (item.contracts / item.leads) * 100 : 0
        }
        return Number(item[sort.id] ?? 0)
      }

      return sort.desc ? getValue(b) - getValue(a) : getValue(a) - getValue(b)
    })
    .map((item) => ({
      ...item,
      conversionRate: item.leads > 0 ? ((item.contracts / item.leads) * 100).toFixed(1) : '0.0'
    }))
)

const paginatedData = computed(() => {
  const pageSize = pagination.value.pageSize || 10
  const pageIndex = Math.max(0, pagination.value.pageIndex || 0)
  const start = pageIndex * pageSize
  return sortedData.value.slice(start, start + pageSize)
})
</script>

<template>
  <div class="flex flex-col" data-section="best-performers">
    <div class="flex flex-col overflow-hidden rounded-lg bg-white shadow-mk-dashboard-card">
      <div class="flex items-center justify-between px-4 py-3">
        <h3 class="text-lg font-medium leading-5 text-greys-500">
          {{ title || t('home.nscDashboard.bestPerformers') }}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 gap-1 rounded-lg bg-muted px-3 text-xs font-medium text-foreground shadow-none hover:bg-muted/80"
        >
          {{ t('home.nscDashboard.thisMonth') }}
          <ChevronDown :size="14" />
        </Button>
      </div>

      <div class="px-2 pb-2">
        <DataTable
          v-model:pagination="pagination"
          v-model:sorting="sorting"
          :data="paginatedData"
          :columns="columns"
          :pagination-options="{
            rowCount: sortedData.length,
            pageSizeOptions: [10, 20, 50]
          }"
        />
      </div>
    </div>
  </div>
</template>
