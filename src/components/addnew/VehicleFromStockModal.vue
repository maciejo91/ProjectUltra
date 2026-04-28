<template>
  <!-- DialogContent already includes DialogPortal + DialogOverlay (Motork primitives). Do not nest another portal/overlay. -->
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent
      class="w-[90vw] max-w-[1440px] h-[80vh] max-h-[calc(100vh-4rem)] flex flex-col p-0"
      :show-close-button="true"
    >
      <DialogHeader class="shrink-0 px-6 pt-5">
        <DialogTitle>{{ modalTitle }}</DialogTitle>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
        <div class="min-h-0 overflow-hidden rounded-lg bg-background">
          <DataTableWithUnifiedSearch
            active-tab="vehicles"
            :placeholder="searchBarPlaceholder"
            :global-filter="globalFilter"
            :pagination="pagination"
            :status-options="vehicleStatusOptions"
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
              @row-click="onVehicleRowClick"
            >
              <template v-if="props.inventoryMode === 'customer-vehicles'" #empty-state>
                <div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <p class="text-sm text-muted-foreground">No vehicles found</p>
                  <Button type="button" variant="secondary" class="rounded-sm" @click="onInsertManuallyFromEmptyState">
                    {{ t('forms.addNew.leadDetails.vehicle.insertManually') }}
                  </Button>
                </div>
              </template>
            </VehicleGrid>
          </DataTableWithUnifiedSearch>
        </div>
      </div>

      <DialogFooter class="shrink-0 px-6 pb-5 pt-0">
        <Button type="button" variant="outline" @click="emit('update:open', false)">
          {{ t('common.buttons.cancel') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed, h, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVehiclesStore } from '@/stores/vehicles'
import { getNestedProperty, useDataTableData } from '@/composables/useDataTableData'
import { useTableRowClick } from '@/composables/useTableRowClick'
import DataTableWithUnifiedSearch from '@/components/shared/layout/DataTableWithUnifiedSearch.vue'
import VehicleGrid from '@/components/vehicles/VehicleGrid.vue'
import {
  getInventoryTypeColumnFilters,
  getVehicleInventoryTypeFilterValue,
  normalizeVehicleInventoryTableRow,
} from '@/utils/vehicleInventoryTable'
import { Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@motork/component-library/future/primitives'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** Mirrors Vehicles page: `in-stock` vs `customer-vehicles`. */
  inventoryMode: {
    type: String,
    default: 'in-stock',
    validator: (v) => v === 'in-stock' || v === 'customer-vehicles',
  },
  /** When opening customer-vehicles picker: seed unified search (e.g. existing contact name). */
  prefillSearch: { type: String, default: '' },
})

const emit = defineEmits(['update:open', 'select', 'insert-manually'])

const { t } = useI18n()
const vehiclesStore = useVehiclesStore()

// DataTable state: inventory scope matches Vehicles.vue via pinned `inventoryType` column filter
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const globalFilter = ref('')
const sorting = ref([])

function statusFilterRow() {
  return { id: 'status-1', field: 'status', value: '', operator: 'eq', pinned: true }
}

const columnFilters = ref([...getInventoryTypeColumnFilters('in-stock'), statusFilterRow()])

/** Tracks whether an owner column filter was active, so clearing it can reset unified search. */
const hadOwnerColumnFilter = ref(false)

function isOwnerFilterRow(f) {
  const field = f.field ?? f.key ?? f.columnId
  if (field === 'owner') return true
  const id = String(f.id ?? '')
  return id === 'owner-1' || id.startsWith('owner')
}

function getActiveOwnerFilterValue(filters) {
  const arr = Array.isArray(filters) ? filters : []
  for (const f of arr) {
    if (!isOwnerFilterRow(f)) continue
    let value = f.value
    if (value != null && typeof value === 'object' && 'value' in value) {
      value = value.value
    }
    if (value == null || (typeof value === 'string' && value.trim() === '')) continue
    return String(value).trim()
  }
  return null
}

const modalTitle = computed(() =>
  props.inventoryMode === 'customer-vehicles'
    ? t('forms.addNew.leadDetails.vehicle.searchModalTitleCustomerVehicles')
    : t('forms.addNew.leadDetails.vehicle.searchModalTitle'),
)

const searchBarPlaceholder = computed(() =>
  props.inventoryMode === 'customer-vehicles'
    ? t('forms.addNew.leadDetails.vehicle.searchCustomerVehiclesModalPlaceholder')
    : t('forms.addNew.leadDetails.vehicle.searchInStockPlaceholder'),
)

const columnVisibility = ref({
  owner: true,
  engine: false,
  stockDays: false,
  dealership: false,
  ownershipType: false,
  ownedSince: false,
  warrantyInfo: false,
})

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

/** Same normalized rows as Vehicles.vue (`inventoryType` + `owner` for filters). */
const vehiclesNormalized = computed(() =>
  (vehiclesStore.vehicles || []).map((v) => normalizeVehicleInventoryTableRow(v)),
)

// Columns: same as Vehicles.vue, minus Actions; Owner always on for operator context
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
  {
    accessorKey: 'owner',
    accessorFn: (row) => String(row?.owner ?? '').trim(),
    header: 'Owner',
    meta: { title: 'Owner' },
    cell: ({ row }) =>
      h('span', { class: 'text-meta min-w-[6rem] truncate' }, row.original.owner || 'N/A'),
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
            class: 'rounded-md shrink-0',
            onClick: (e) => {
              e.stopPropagation()
              selectVehicle(vehicle)
            },
          },
          { default: () => 'Select' },
        )
      )
    }
  },
]

const filterDefinitions = computed(() => {
  const vehicles = vehiclesNormalized.value ?? []
  const uniqueBrands = [...new Set(vehicles.map((v) => v.brand).filter(Boolean))].sort()
  const uniqueModels = [...new Set(vehicles.map((v) => v.model).filter(Boolean))].sort()
  const uniqueStatuses = [...new Set(vehicles.map((v) => v.status).filter(Boolean))].sort()
  const statusOptions =
    uniqueStatuses.length > 0
      ? uniqueStatuses.map((s) => ({ value: s, label: s }))
      : [
          { value: 'New', label: 'New' },
          { value: 'Used', label: 'Used' },
        ]
  const brandOptions =
    uniqueBrands.length > 0
      ? uniqueBrands.map((b) => ({ value: b, label: b }))
      : [
          { value: 'Volkswagen', label: 'Volkswagen' },
          { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
          { value: 'Audi', label: 'Audi' },
          { value: 'Porsche', label: 'Porsche' },
        ]

  const modelOptions =
    uniqueModels.length > 0
      ? uniqueModels.map((m) => ({ value: m, label: m }))
      : [
          { value: 'XC90', label: 'XC90' },
          { value: 'XC60', label: 'XC60' },
          { value: 'XC40', label: 'XC40' },
        ]

  const ownerNames = new Set(vehicles.map((v) => v.owner).filter(Boolean))
  const prefill = String(props.prefillSearch || '').trim()
  if (prefill) ownerNames.add(prefill)
  const ownerOptions = [...ownerNames].sort().map((o) => ({ value: o, label: o }))

  return [
    {
      key: 'inventoryType',
      label: 'Type',
      type: 'select',
      operators: [
        { value: 'eq', label: 'is' },
        { value: 'ne', label: 'is not' },
      ],
      options: [
        { value: 'in-stock', label: 'In stock' },
        { value: 'customer-vehicles', label: "Customers' vehicles" },
      ],
      aiHint: 'Inventory type: in stock or customer vehicle',
      pinned: true,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      operators: [
        { value: 'eq', label: 'is' },
        { value: 'ne', label: 'is not' },
      ],
      options: statusOptions,
      aiHint: 'Vehicle status (New or Used)',
      pinned: true,
    },
    {
      key: 'owner',
      label: t('forms.addNew.leadDetails.vehicle.filterOwner'),
      type: 'select',
      operators: [{ value: 'eq', label: 'is' }, { value: 'ne', label: 'is not' }],
      options: ownerOptions,
      aiHint: 'Vehicle owner or registered customer name',
    },
    {
      key: 'brand',
      label: 'Brand',
      type: 'select',
      operators: [{ value: 'eq', label: 'is' }, { value: 'ne', label: 'is not' }],
      options: brandOptions,
    },
    {
      key: 'model',
      label: 'Model',
      type: 'select',
      operators: [{ value: 'eq', label: 'is' }, { value: 'ne', label: 'is not' }],
      options: modelOptions,
    },
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

const vehicleStatusOptions = computed(() => {
  const def = filterDefinitions.value?.find((d) => d.key === 'status')
  return def?.options?.map((o) => ({ value: o.value, label: o.label })) ?? []
})

const tableMeta = computed(() => ({
  class: {
    tr: () => 'group cursor-pointer hover:bg-muted transition-colors'
  }
}))

const filterDefsRef = computed(() => filterDefinitions.value)
const columnsRef = computed(() => columns)
const { paginatedData, totalFilteredCount } = useDataTableData({
  rawData: vehiclesNormalized,
  columns: columnsRef,
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  filterDefs: filterDefsRef,
  getFilterValue: (row, key) =>
    key === 'inventoryType' ? getVehicleInventoryTypeFilterValue(row) : getNestedProperty(row, key),
  searchableFields: (row) => [
    row.inventoryType,
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
    row.plateNumber,
    row.price != null ? String(row.price) : null,
    row.soldTo,
    row.ownerName,
    row.customerName,
    row.owner,
    Array.isArray(row.requestedBy) ? row.requestedBy.join(' ') : row.requestedBy,
  ],
})

/** Primary: DataTable @row-click; fallback: wrapper delegation (CustomersTab pattern). */
const { onTableContainerClick } = useTableRowClick(paginatedData, selectVehicle)

function onVehicleRowClick(row) {
  const vehicle = row?.original ?? row
  selectVehicle(vehicle)
}

function selectVehicle(vehicle) {
  if (!vehicle) return
  emit('select', vehicle)
  emit('update:open', false)
}

function onInsertManuallyFromEmptyState() {
  emit('insert-manually')
  emit('update:open', false)
}

onMounted(() => {
  vehiclesStore.fetchVehicles()
})

watch(
  () => [props.open, props.inventoryMode, props.prefillSearch],
  ([isOpen, mode, prefill]) => {
    if (!isOpen) {
      hadOwnerColumnFilter.value = false
      return
    }
    const statusFilter = statusFilterRow()
    const invFilters = getInventoryTypeColumnFilters(mode)
    const trimmed = typeof prefill === 'string' ? prefill.trim() : ''
    if (mode === 'customer-vehicles' && trimmed) {
      hadOwnerColumnFilter.value = true
      columnFilters.value = [
        ...invFilters,
        {
          id: 'owner-1',
          field: 'owner',
          value: trimmed,
          operator: 'eq',
          pinned: true,
        },
        statusFilter,
      ]
      // Owner column filter alone defines the list; avoid AND with global search (same string).
      globalFilter.value = ''
    } else {
      hadOwnerColumnFilter.value = false
      columnFilters.value = [...invFilters, statusFilter]
      globalFilter.value = ''
    }
    pagination.value = { ...pagination.value, pageIndex: 0 }
  },
)

watch(
  () => columnFilters.value,
  (filters) => {
    if (!props.open) return
    const ownerVal = getActiveOwnerFilterValue(filters)
    if (ownerVal != null) {
      hadOwnerColumnFilter.value = true
      return
    }
    if (hadOwnerColumnFilter.value) {
      hadOwnerColumnFilter.value = false
      globalFilter.value = ''
    }
  },
  { deep: true, flush: 'post' },
)
</script>

