<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />

      <DialogContent
        class="flex max-h-[90vh] w-[90vw] max-w-[1440px] flex-col overflow-hidden p-0"
      >
        <DialogHeader class="px-6 pt-5">
          <DialogTitle>{{ t('forms.addNew.leadDetails.vehicle.searchModalTitle') }}</DialogTitle>
        </DialogHeader>

        <div class="min-h-0 flex-1 overflow-hidden px-6 pb-6">
          <div class="h-full min-h-0 overflow-hidden rounded-lg bg-background">
            <DataTableWithUnifiedSearch
              active-tab="vehicles"
              :placeholder="t('forms.addNew.leadDetails.vehicle.searchInStockPlaceholder')"
              :pagination="pagination"
              :volvo-model-options="volvoModelOptions"
              :brand-options="vehicleBrandOptions"
              :include-margin-bottom="false"
              @update:global-filter="globalFilter = $event"
              @update:column-filters="columnFilters = $event"
              @update:pagination="pagination = $event"
              @wrapper-click="onTableContainerClick"
            >
              <VehicleGrid
                :filtered-vehicles="paginatedData"
                :row-count="totalFilteredCount"
                :columns="columns"
                :loading="vehiclesStore.loading"
                :table-meta="tableMeta"
                :filter-definitions="filterDefinitions"
                :enable-row-selection="false"
                v-model:pagination="pagination"
                v-model:global-filter="globalFilter"
                v-model:sorting="sorting"
                v-model:column-filters="columnFilters"
                v-model:column-visibility="columnVisibility"
              />
            </DataTableWithUnifiedSearch>
          </div>
        </div>

        <DialogFooter class="px-6 pb-5 pt-0">
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            {{ t('common.buttons.cancel') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { computed, h, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVehiclesStore } from '@/stores/vehicles'
import { useDataTableData } from '@/composables/useDataTableData'
import { useTableRowClick } from '@/composables/useTableRowClick'
import DataTableWithUnifiedSearch from '@/components/shared/layout/DataTableWithUnifiedSearch.vue'
import VehicleGrid from '@/components/vehicles/VehicleGrid.vue'
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@motork/component-library/future/primitives'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'select'])

const { t } = useI18n()
const vehiclesStore = useVehiclesStore()

// DataTable state (mirrors Vehicles.vue but pinned to in-stock)
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const globalFilter = ref('')
const sorting = ref([])

function getInventoryTypeFilter() {
  return [{ id: 'inventoryType-1', field: 'inventoryType', value: 'in-stock', operator: 'eq', pinned: true }]
}

const columnFilters = ref([
  ...getInventoryTypeFilter(),
  { id: 'status-1', field: 'status', value: '', operator: 'eq', pinned: true }
])

const columnVisibility = ref({
  engine: false,
  stockDays: false,
  dealership: false,
  ownershipType: false,
  ownedSince: false,
  warrantyInfo: false
})

const vehiclesWithType = computed(() =>
  (vehiclesStore.vehicles || []).map((v) => ({
    ...v,
    inventoryType: v.inventoryType ?? (v.stockDays !== null && v.stockDays !== undefined ? 'in-stock' : 'customer-vehicles')
  }))
)

const formatCurrency = (value) => new Intl.NumberFormat('en-US').format(value)
const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value)

const getVehicleType = (vehicle) => {
  if (vehicle.kilometers === 0) return vehicle.year === new Date().getFullYear() ? 'New' : 'New 0km'
  return 'Used'
}

const formatRegistration = (registration) => {
  if (!registration) return 'N/A'
  if (typeof registration === 'string' && registration.includes('/')) return registration
  return registration
}

// Columns: same as Vehicles.vue, minus Actions
const columns = [
  {
    accessorKey: 'image',
    header: 'Photo',
    meta: { title: 'Photo' },
    cell: ({ row }) => {
      const vehicle = row.original
      if (vehicle.image) {
        return h('img', {
          src: vehicle.image,
          alt: `${vehicle.brand} ${vehicle.model}`,
          class: 'w-16 h-16 object-cover rounded-md'
        })
      }
      return h('div', { class: 'w-16 h-16 bg-surface border border-border rounded-md flex items-center justify-center shrink-0' }, [
        h('i', { class: 'fa-solid fa-car text-2xl text-muted-foreground' })
      ])
    }
  },
  {
    accessorKey: 'brand',
    header: 'Vehicle',
    meta: { title: 'Vehicle' },
    cell: ({ row }) => {
      const vehicle = row.original
      return h('div', { class: 'flex flex-col min-w-0' }, [
        h('div', { class: 'text-content font-medium text-foreground truncate' }, `${vehicle.brand} ${vehicle.model}`),
        h('div', { class: 'text-meta' }, vehicle.year)
      ])
    }
  },
  {
    accessorKey: 'type',
    header: 'Type',
    meta: { title: 'Type' },
    cell: ({ row }) => h('span', { class: 'text-meta' }, getVehicleType(row.original))
  },
  { accessorKey: 'engine', header: 'Engine', meta: { title: 'Engine' }, cell: () => h('span', { class: 'text-meta' }, 'N/A') },
  { accessorKey: 'fuelType', header: 'Fuel type', meta: { title: 'Fuel type' }, cell: ({ row }) => h('span', { class: 'text-meta' }, row.original.fuelType || 'N/A') },
  { accessorKey: 'gearType', header: 'Gear type', meta: { title: 'Gear type' }, cell: ({ row }) => h('span', { class: 'text-meta' }, row.original.gearType || 'N/A') },
  { accessorKey: 'registration', header: 'Registered at', meta: { title: 'Registered at' }, cell: ({ row }) => h('span', { class: 'text-meta' }, formatRegistration(row.original.registration) || 'N/A') },
  { accessorKey: 'kilometers', header: 'Mileage', meta: { title: 'Mileage' }, cell: ({ row }) => h('span', { class: 'text-meta' }, `${formatNumber(row.original.kilometers)} km`) },
  {
    accessorKey: 'stockDays',
    header: 'Days in stock',
    meta: { title: 'Days in stock' },
    cell: ({ row }) => {
      const stockDays = row.original.stockDays
      if (stockDays == null) return h('span', { class: 'text-meta' }, '—')
      const textClass = stockDays > 300 ? 'text-destructive' : 'text-muted-foreground'
      return h('span', { class: `text-content font-medium ${textClass}` }, `${stockDays} days`)
    }
  },
  {
    accessorKey: 'dealership',
    header: 'Dealership',
    meta: { title: 'Dealership' },
    cell: ({ row }) => h('span', { class: 'text-meta' }, row.original.dealership || 'N/A')
  },
  {
    accessorKey: 'plates',
    header: 'Plates',
    meta: { title: 'Plates' },
    cell: ({ row }) => {
      const vehicle = row.original
      const plates = vehicle.plates || (vehicle.vin ? vehicle.vin.slice(-6) : null) || 'N/A'
      return h('span', { class: 'text-meta' }, plates)
    }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    meta: { title: 'Price' },
    cell: ({ row }) => h('span', { class: 'text-meta' }, row.original.price != null ? `€ ${formatCurrency(row.original.price)}` : 'N/A')
  },
  {
    id: 'select',
    header: '',
    meta: { title: '' },
    cell: ({ row }) => {
      const vehicle = row.original
      return h(
        'div',
        { class: 'flex justify-end pr-2' },
        h(
          Button,
          {
            type: 'button',
            variant: 'outline',
            size: 'sm',
            class: 'opacity-0 group-hover:opacity-100 transition-opacity rounded-md',
            onClick: (e) => {
              e.stopPropagation()
              selectVehicle(vehicle)
            }
          },
          () => 'Select'
        )
      )
    }
  },
]

const filterDefinitions = computed(() => {
  const vehicles = vehiclesWithType.value ?? []
  const uniqueBrands = [...new Set(vehicles.map(v => v.brand).filter(Boolean))].sort()
  const uniqueModels = [...new Set(vehicles.map(v => v.model).filter(Boolean))].sort()
  const brandOptions = uniqueBrands.length > 0
    ? uniqueBrands.map(b => ({ value: b, label: b }))
    : [{ value: 'Volkswagen', label: 'Volkswagen' }, { value: 'Mercedes-Benz', label: 'Mercedes-Benz' }, { value: 'Audi', label: 'Audi' }, { value: 'Porsche', label: 'Porsche' }]

  const modelOptions = uniqueModels.length > 0
    ? uniqueModels.map(m => ({ value: m, label: m }))
    : [{ value: 'XC90', label: 'XC90' }, { value: 'XC60', label: 'XC60' }, { value: 'XC40', label: 'XC40' }]

  return [
    {
      key: 'inventoryType',
      label: 'Type',
      type: 'select',
      operators: [{ value: 'eq', label: 'is' }, { value: 'ne', label: 'is not' }],
      options: [{ value: 'in-stock', label: 'In stock' }],
      aiHint: 'Inventory type: in stock',
      pinned: true
    },
    { key: 'brand', label: 'Brand', type: 'select', operators: [{ value: 'eq', label: 'is' }, { value: 'ne', label: 'is not' }], options: brandOptions },
    { key: 'model', label: 'Model', type: 'select', operators: [{ value: 'eq', label: 'is' }, { value: 'ne', label: 'is not' }], options: modelOptions },
  ]
})

const vehicleBrandOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'brand')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})
const volvoModelOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'model')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})

const tableMeta = computed(() => ({
  class: {
    tr: () => 'group cursor-pointer hover:bg-muted transition-colors'
  }
}))

const filterDefsRef = computed(() => filterDefinitions.value)
const columnsRef = computed(() => columns)
const { paginatedData, totalFilteredCount } = useDataTableData({
  rawData: vehiclesWithType,
  columns: columnsRef,
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  filterDefs: filterDefsRef,
  searchableFields: (row) => [
    row.brand,
    row.model,
    row.vin,
    getVehicleType(row),
    row.year,
    row.fuelType,
    row.gearType,
    row.registration,
    row.kilometers != null ? String(row.kilometers) : null,
    row.stockDays != null ? String(row.stockDays) : null,
    row.dealership,
    row.plates,
    row.price != null ? String(row.price) : null
  ]
})

/** Motork DataTable does not emit row-click; delegate from the shell like CustomersTab. */
const { onTableContainerClick } = useTableRowClick(paginatedData, selectVehicle)

function selectVehicle(vehicle) {
  if (!vehicle) return
  emit('select', vehicle)
  emit('update:open', false)
}

onMounted(() => {
  vehiclesStore.fetchVehicles()
})

watch(
  () => props.open,
  (o) => {
    if (!o) return
    // Ensure the pinned inventory filter is always present
    const hasPinned = (columnFilters.value || []).some(f => (f.field || f.key || f.id) === 'inventoryType')
    if (!hasPinned) {
      columnFilters.value = [...getInventoryTypeFilter(), ...(Array.isArray(columnFilters.value) ? columnFilters.value : [])]
    }
  }
)
</script>

