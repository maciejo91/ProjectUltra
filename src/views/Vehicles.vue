<template>
  <div class="page-container relative flex flex-col overflow-hidden h-full bg-surface">
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto px-6 pb-4 md:pb-8 scrollbar-hide min-h-0">
        <div class="mb-8 flex flex-col gap-2 md:gap-3">
          <div class="shrink-0 overflow-visible pb-2 pt-1">
            <RequestMainTabs v-model="selectedInventoryChip" :tabs="filterChips" />
          </div>
          <div class="bg-background min-w-0 w-full">
            <DataTableWithUnifiedSearch
              active-tab="vehicles"
              placeholder="Search vehicles..."
              :pagination="pagination"
              :status-options="vehicleStatusOptions"
              :volvo-model-options="volvoModelOptions"
              :brand-options="vehicleBrandOptions"
              :include-margin-bottom="false"
              @update:global-filter="globalFilter = $event"
              @update:column-filters="columnFilters = $event"
              @update:pagination="pagination = $event"
            >
              <VehicleGrid
                :filtered-vehicles="paginatedData"
                :row-count="totalFilteredCount"
                :columns="columns"
                :loading="vehiclesStore.loading"
                :table-meta="tableMeta"
                :filter-definitions="filterDefinitions"
                v-model:pagination="pagination"
                v-model:global-filter="globalFilter"
                v-model:sorting="sorting"
                v-model:column-filters="columnFilters"
                v-model:column-visibility="columnVisibility"
                @row-click="handleRowClick"
              />
            </DataTableWithUnifiedSearch>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Vehicle Drawer -->
    <DrawerContainer :show="showAddModal" @close="handleCloseModal">
      <div class="h-full flex flex-col overflow-hidden bg-background">
        <header class="shrink-0 flex items-center justify-between gap-4 border-b border-border px-4 py-3 md:px-6">
          <h2 class="text-base font-medium text-foreground">Add Vehicle</h2>
          <button
            type="button"
            class="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
            @click="handleCloseModal"
          >
            <X class="w-5 h-5 shrink-0" />
          </button>
        </header>
        <div class="flex-1 overflow-y-auto py-4 px-4 md:px-6 w-full">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="w-full">
                <Label class="form-label text-foreground">Brand</Label>
                <Input
                  v-model="newVehicle.brand"
                  type="text"
                  placeholder="e.g., Volkswagen"
                  class="w-full"
                  required
                />
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Model</Label>
                <Input
                  v-model="newVehicle.model"
                  type="text"
                  placeholder="e.g., ID.4"
                  class="w-full"
                  required
                />
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Year</Label>
                <Input
                  v-model="newVehicle.year"
                  type="number"
                  placeholder="e.g., 2024"
                  :min="1900"
                  :max="new Date().getFullYear() + 1"
                  class="w-full"
                  required
                />
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">VIN</Label>
                <Input
                  v-model="newVehicle.vin"
                  type="text"
                  placeholder="Vehicle Identification Number"
                  class="w-full"
                />
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Plates</Label>
                <Input
                  v-model="newVehicle.plates"
                  type="text"
                  placeholder="License plate number"
                  class="w-full"
                />
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Fuel Type</Label>
                <Select v-model="newVehicle.fuelType">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select fuel type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Gear Type</Label>
                <Select v-model="newVehicle.gearType">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select gear type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Mileage (km)</Label>
                <Input
                  v-model.number="newVehicle.kilometers"
                  type="number"
                  placeholder="0"
                  :min="0"
                  class="w-full"
                />
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Registered At</Label>
                <Input
                  v-model="newVehicle.registration"
                  type="text"
                  placeholder="MM/YYYY (e.g., 01/2024)"
                  class="w-full"
                />
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Owned Since</Label>
                <Input
                  v-model="newVehicle.ownedSince"
                  type="text"
                  placeholder="MM/YYYY (e.g., 01/2024)"
                  class="w-full"
                />
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Owner</Label>
                <Input
                  v-model="newVehicle.owner"
                  type="text"
                  placeholder="Owner name"
                  class="w-full"
                />
              </div>
              <div class="w-full">
                <Label class="form-label text-foreground">Ownership Type</Label>
                <Select v-model="newVehicle.ownershipType">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select ownership type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Company">Company</SelectItem>
                    <SelectItem value="Lease">Lease</SelectItem>
                    <SelectItem value="Fleet">Fleet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="w-full md:col-span-2">
                <Label class="form-label text-foreground">Warranty Info</Label>
                <Textarea
                  v-model="newVehicle.warrantyInfo"
                  :rows="3"
                  placeholder="Warranty information..."
                  class="w-full"
                />
              </div>
            </div>
          </form>
        </div>
        <footer class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 border-t border-border px-4 py-3 md:px-6">
          <Button
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            @click="handleCloseModal"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            @click="handleSubmit"
          >
            Add Vehicle
          </Button>
        </footer>
      </div>
    </DrawerContainer>

    <AddOfferModal
      v-if="showAddOfferModal"
      :show="showAddOfferModal"
      :preselected-vehicle="selectedVehicleForOffer"
      :show-customer-step="true"
      @confirm="handleAddOfferConfirm"
      @cancel="showAddOfferModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, inject, h } from 'vue'
import { X, FilePlus } from 'lucide-vue-next'
import { useVehiclesStore } from '@/stores/vehicles'
import { Badge, Button, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea } from '@motork/component-library/future/primitives'
import DrawerContainer from '@/components/shared/DrawerContainer.vue'
import RequestMainTabs from '@/components/requests/RequestMainTabs.vue'
import VehicleGrid from '@/components/vehicles/VehicleGrid.vue'
import AddOfferModal from '@/components/modals/AddOfferModal.vue'
import DataTableWithUnifiedSearch from '@/components/shared/layout/DataTableWithUnifiedSearch.vue'
import { useVehicleDetail } from '@/composables/useVehicleDetail'
import { useDataTableData } from '@/composables/useDataTableData'

const headerActionsRef = inject('headerActionsRef', null)
const vehiclesStore = useVehiclesStore()
const showAddOfferModal = ref(false)
const selectedVehicleForOffer = ref(null)

function openAddOfferModal(vehicle) {
  selectedVehicleForOffer.value = vehicle
  showAddOfferModal.value = true
}

async function handleAddOfferConfirm(payload) {
  const vehicle = selectedVehicleForOffer.value
  const contactId = payload.selectedCustomerId
  if (!vehicle || !contactId) return
  try {
    const { useOpportunitiesStore } = await import('@/stores/opportunities')
    const { useUserStore } = await import('@/stores/user')
    const opportunitiesStore = useOpportunitiesStore()
    const userStore = useUserStore()
    const carData = {
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price ?? 0,
      image: vehicle.image,
      vin: vehicle.vin,
      plates: vehicle.plates,
      fuelType: vehicle.fuelType,
      gearType: vehicle.gearType,
      kilometers: vehicle.kilometers,
      source: 'Direct'
    }
    const { createOpportunityFromContact } = await import('@/api/opportunities')
    const newOpp = await createOpportunityFromContact(contactId, carData)
    await opportunitiesStore.addOffer(newOpp.id, {
      vehicleBrand: payload.data?.brand || vehicle.brand,
      vehicleModel: payload.data?.model || vehicle.model,
      vehicleYear: payload.data?.year || vehicle.year,
      price: payload.data?.price ?? vehicle.price ?? 0,
      data: payload.data
    })
    await opportunitiesStore.addActivity(newOpp.id, {
      type: 'offer',
      user: userStore.currentUser?.name || 'You',
      action: 'created an offer',
      content: `Offer created: ${vehicle.brand} ${vehicle.model} (${vehicle.year}) - € ${(payload.data?.price ?? vehicle.price ?? 0).toLocaleString()}`,
      data: payload.data,
      timestamp: new Date().toISOString()
    })
    showAddOfferModal.value = false
    selectedVehicleForOffer.value = null
  } catch (err) {
    console.error('Failed to create offer:', err)
  }
}

// DataTable state management
const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})

const globalFilter = ref('')
const sorting = ref([])
const selectedInventoryChip = ref('in-stock')

function getInventoryTypeFilter(chip) {
  return [{ id: 'inventoryType-1', field: 'inventoryType', value: chip, operator: 'eq', pinned: true }]
}

function replaceInventoryFilter(filters, chip) {
  const without = (Array.isArray(filters) ? filters : []).filter(
    f => (f.key || f.field || f.id) !== 'inventoryType'
  )
  return [...getInventoryTypeFilter(chip), ...without]
}

const defaultColumnFilters = () => [
  ...getInventoryTypeFilter(selectedInventoryChip.value),
  { id: 'status-1', field: 'status', value: '', operator: 'eq', pinned: true }
]
const columnFilters = ref(defaultColumnFilters())

// Column visibility: hide columns with mostly empty/N/A data (column selector lets users show them)
const columnVisibility = ref({
  engine: false,
  stockDays: false,
  dealership: false,
  ownershipType: false,
  ownedSince: false,
  warrantyInfo: false
})

// All vehicles with inventoryType for filtering (one merged table)
const vehiclesWithType = computed(() =>
  vehiclesStore.vehicles.map((v) => ({
    ...v,
    inventoryType: v.inventoryType ?? (v.stockDays !== null && v.stockDays !== undefined ? 'in-stock' : 'customer-vehicles')
  }))
)

const filterChips = computed(() => {
  const list = vehiclesWithType.value
  const inStock = list.filter((v) => v.inventoryType === 'in-stock').length
  const customerVehicles = list.filter((v) => v.inventoryType === 'customer-vehicles').length
  const sold = list.filter((v) => v.inventoryType === 'sold').length
  return [
    { key: 'in-stock', label: 'In stock', count: inStock },
    { key: 'customer-vehicles', label: "Customers' vehicles", count: customerVehicles },
    { key: 'sold', label: 'Sold', count: sold }
  ]
})

watch(selectedInventoryChip, (chip) => {
  columnFilters.value = replaceInventoryFilter(columnFilters.value, chip)
}, { immediate: true })

// Use composable for vehicle detail modal logic
const { showAddModal, newVehicle, handleCloseModal, handleSubmit } = useVehicleDetail()

// Filter definitions - dynamic options from vehicles data
const filterDefinitions = computed(() => {
  const vehicles = vehiclesWithType.value ?? []
  const uniqueBrands = [...new Set(vehicles.map(v => v.brand).filter(Boolean))].sort()
  const uniqueModels = [...new Set(vehicles.map(v => v.model).filter(Boolean))].sort()
  const uniqueStatuses = [...new Set(vehicles.map(v => v.status).filter(Boolean))].sort()
  const statusOptions = uniqueStatuses.length > 0
    ? uniqueStatuses.map(s => ({ value: s, label: s }))
    : [
        { value: 'New', label: 'New' },
        { value: 'Used', label: 'Used' }
      ]
  const brandOptions = uniqueBrands.length > 0
    ? uniqueBrands.map(b => ({ value: b, label: b }))
    : [
        { value: 'Volkswagen', label: 'Volkswagen' },
        { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
        { value: 'Audi', label: 'Audi' },
        { value: 'Porsche', label: 'Porsche' }
      ]
  const modelOptions = uniqueModels.length > 0
    ? uniqueModels.map(m => ({ value: m, label: m }))
    : [
        { value: 'XC90', label: 'XC90' },
        { value: 'XC60', label: 'XC60' },
        { value: 'XC40', label: 'XC40' },
        { value: 'ID.4', label: 'ID.4' },
        { value: 'ID.5', label: 'ID.5' },
        { value: 'Golf', label: 'Golf' },
        { value: 'Tiguan', label: 'Tiguan' }
      ]
  return [
    {
      key: 'inventoryType',
      label: 'Type',
      type: 'select',
      operators: [
        { value: 'eq', label: 'is' },
        { value: 'ne', label: 'is not' }
      ],
      options: [
        { value: 'in-stock', label: 'In stock' },
        { value: 'customer-vehicles', label: "Customers' vehicles" },
        { value: 'sold', label: 'Sold' }
      ],
      aiHint: 'Inventory type: in stock or customer vehicle',
      pinned: true
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      operators: [
        { value: 'eq', label: 'is' },
        { value: 'ne', label: 'is not' }
      ],
      options: statusOptions,
      aiHint: 'Vehicle status (New or Used)',
      pinned: true
    },
    {
      key: 'brand',
      label: 'Brand',
      type: 'multiselect',
      operators: [
        { value: 'in', label: 'is any of' },
        { value: 'notIn', label: 'is none of' }
      ],
      options: brandOptions,
      aiHint: 'Car manufacturer brand'
    },
    {
      key: 'model',
      label: 'Model',
      type: 'select',
      operators: [
        { value: 'eq', label: 'is' },
        { value: 'ne', label: 'is not' }
      ],
      options: modelOptions,
      aiHint: 'Vehicle model'
    },
    {
      key: 'price',
      label: 'Price',
      type: 'inputrange',
      inputType: 'number',
      operators: [
        { value: 'between', label: 'is between' },
        { value: 'gte', label: 'is at least' },
        { value: 'lte', label: 'is at most' }
      ],
      prefix: '€',
      aiHint: 'Vehicle price in euros'
    },
    {
      key: 'stockDays',
      label: 'Stock Days',
      type: 'inputrange',
      inputType: 'number',
      operators: [
        { value: 'between', label: 'is between' },
        { value: 'gte', label: 'is at least' },
        { value: 'lte', label: 'is at most' }
      ],
      aiHint: 'Number of days in stock'
    }
  ]
})

const vehicleStatusOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'status')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})
const volvoModelOptions = computed(() => [
  { value: 'XC90', label: 'XC90' },
  { value: 'XC60', label: 'XC60' },
  { value: 'XC40', label: 'XC40' },
  { value: 'V90', label: 'V90' },
  { value: 'V60', label: 'V60' },
  { value: 'V40', label: 'V40' },
  { value: 'S90', label: 'S90' },
  { value: 'S60', label: 'S60' }
])
const vehicleBrandOptions = computed(() => {
  const def = filterDefinitions.value?.find(d => d.key === 'brand')
  return def?.options?.map(o => ({ value: o.value, label: o.label })) ?? []
})

onMounted(() => {
  if (headerActionsRef) {
    headerActionsRef.value = {
      type: 'vehicles',
      addLabelKey: 'common.actions.newVehicle',
      onAddNew: () => { showAddModal.value = true }
    }
  }
  vehiclesStore.fetchVehicles()
})

onBeforeUnmount(() => {
  if (headerActionsRef) headerActionsRef.value = null
})

// Handle row click - navigate to vehicle detail or show vehicle info
const handleRowClick = (row) => {
  const vehicle = row.original || row
  // For now, we can navigate to a vehicle detail page if it exists
  // Or you could open a modal with vehicle details
  // Since there's no vehicle detail route yet, we'll just log it
  // You can add navigation here when vehicle detail page is created
  // router.push({ path: `/vehicles/${vehicle.id}` })
}


const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US').format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value)
}

// Table meta for row styling
const tableMeta = computed(() => ({
  class: {
    tr: () => 'cursor-pointer hover:bg-muted transition-colors'
  }
}))

// Helper to get vehicle type
const getVehicleType = (vehicle) => {
  if (vehicle.kilometers === 0) {
    return vehicle.year === new Date().getFullYear() ? 'New' : 'New 0km'
  }
  // Could check other conditions for Demo, but for now use Used
  return 'Used'
}

// Helper to format registration date
const formatRegistration = (registration) => {
  if (!registration) return 'N/A'
  // If it's already formatted (MM/YYYY), return as is
  if (typeof registration === 'string' && registration.includes('/')) {
    return registration
  }
  // Otherwise try to format
  return registration
}

// Single merged table: all columns, Inventory type as first data column
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
    cell: ({ row }) => {
      const vehicle = row.original
      return h('span', { class: 'text-meta' }, getVehicleType(vehicle))
    }
  },
  {
    accessorKey: 'inventoryType',
    header: 'Inventory',
    meta: { title: 'Inventory' },
    cell: ({ row }) => {
      const type = row.original.inventoryType
      const label = type === 'in-stock' ? 'In stock' : type === 'sold' ? 'Sold' : "Customers' vehicles"
      return h('span', { class: 'text-meta' }, label)
    }
  },
  {
    accessorKey: 'engine',
    header: 'Engine',
    meta: { title: 'Engine' },
    cell: () => h('span', { class: 'text-meta' }, 'N/A')
  },
  {
    accessorKey: 'fuelType',
    header: 'Fuel type',
    meta: { title: 'Fuel type' },
    cell: ({ row }) => h('span', { class: 'text-meta' }, row.original.fuelType || 'N/A')
  },
  {
    accessorKey: 'gearType',
    header: 'Gear type',
    meta: { title: 'Gear type' },
    cell: ({ row }) => h('span', { class: 'text-meta' }, row.original.gearType || 'N/A')
  },
  {
    accessorKey: 'registration',
    header: 'Registered at',
    meta: { title: 'Registered at' },
    cell: ({ row }) => h('span', { class: 'text-meta' }, formatRegistration(row.original.registration) || 'N/A')
  },
  {
    accessorKey: 'kilometers',
    header: 'Mileage',
    meta: { title: 'Mileage' },
    cell: ({ row }) => h('span', { class: 'text-meta' }, `${formatNumber(row.original.kilometers)} km`)
  },
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
    accessorKey: 'status',
    header: 'Availability',
    meta: { title: 'Availability' },
    cell: ({ row }) => {
      const status = row.original.status
      if (status == null) return h('span', { class: 'text-meta' }, '—')
      const theme = status === 'New' ? 'green' : status === 'Used' ? 'gray' : 'blue'
      return h(Badge, { text: status, size: 'small', theme })
    }
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
    accessorKey: 'owner',
    header: 'Owner',
    meta: { title: 'Owner' },
    cell: ({ row }) => {
      const vehicle = row.original
      const owner = vehicle.inventoryType === 'sold'
        ? (vehicle.soldTo || 'N/A')
        : (vehicle.owner || (vehicle.requestedBy && vehicle.requestedBy.length > 0 ? vehicle.requestedBy[0] : null) || 'N/A')
      return h('span', { class: 'text-meta' }, owner)
    }
  },
  {
    accessorKey: 'ownershipType',
    header: 'Ownership type',
    meta: { title: 'Ownership type' },
    cell: () => h('span', { class: 'text-meta' }, 'N/A')
  },
  {
    accessorKey: 'ownedSince',
    header: 'Owned since',
    meta: { title: 'Owned since' },
    cell: ({ row }) => h('span', { class: 'text-meta' }, formatRegistration(row.original.registration) || 'N/A')
  },
  {
    accessorKey: 'warrantyInfo',
    header: 'Warranty info',
    meta: { title: 'Warranty info' },
    cell: () => h('span', { class: 'text-meta' }, 'N/A')
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    meta: { title: 'Actions' },
    cell: ({ row }) => {
      const vehicle = row.original
      if (vehicle.inventoryType === 'sold') {
        return h('span', { class: 'text-meta' }, '—')
      }
      return h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          class: 'rounded-sm shrink-0',
          onClick: (e) => {
            e.stopPropagation()
            openAddOfferModal(vehicle)
          }
        },
        () => [h(FilePlus, { class: 'w-4 h-4 shrink-0 mr-1.5' }), 'Add offer']
      )
    }
  }
]

// Filter → sort → paginate for DataTable (guide pattern)
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
    row.inventoryType,
    row.soldTo,
    row.brand,
    row.model,
    row.vin,
    row.status,
    getVehicleType(row),
    row.year,
    row.fuelType,
    row.gearType,
    row.registration,
    row.kilometers != null ? String(row.kilometers) : null,
    row.stockDays != null ? String(row.stockDays) : null,
    row.dealership,
    row.plates,
    row.owner,
    row.price != null ? String(row.price) : null
  ]
})
</script>
