<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent
      class="w-[90vw] max-w-screen-2xl h-[80vh] max-h-[calc(100vh-4rem)] flex flex-col gap-0 overflow-hidden p-0"
      :show-close-button="false"
    >
      <TooltipProvider :delay-duration="200">
        <DialogHeader
          class="shrink-0 px-6 py-4 border-b border-border overflow-hidden"
          style="border-bottom-color: var(--color-neutral-300)"
        >
          <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
            <div class="min-w-0">
              <div v-if="quotationStepRequired" class="flex flex-wrap items-center gap-2">
                <DialogTitle class="text-xl font-medium text-foreground">
                  {{ t('forms.addNew.leadDetails.vehicle.stockOfferModalTitle') }}
                </DialogTitle>
                <Badge
                  variant="outline"
                  size="lg"
                  class="border-dashed border-destructive text-destructive uppercase tracking-widest font-semibold shadow-sm rotate-3"
                >
                  {{ t('forms.addNew.leadDetails.vehicle.stockOfferDraftBadge') }}
                </Badge>
              </div>
              <DialogTitle v-else class="text-xl font-medium text-foreground">{{ modalTitle }}</DialogTitle>
              <p class="text-sm text-muted-foreground">{{ headerSubtitle }}</p>
            </div>

            <div v-if="quotationStepRequired" class="w-52 flex justify-center pt-3">
              <div class="relative h-11 w-full max-w-xs">
                <div class="absolute top-3 left-8 right-8 h-px bg-border" aria-hidden="true" />
                <div class="absolute inset-x-0 top-0 flex items-start justify-between px-2">
                  <div class="flex flex-col items-center gap-1">
                    <div
                      class="size-6 rounded-full flex items-center justify-center text-sm font-medium"
                      :class="stepClasses(1).bubble"
                    >
                      <Check v-if="step > 1" class="size-4" />
                      <span v-else>1</span>
                    </div>
                    <span class="text-xs font-medium" :class="stepClasses(1).label">
                      {{ t('forms.addNew.leadDetails.vehicle.stockStepVehicle') }}
                    </span>
                  </div>
                  <div class="flex flex-col items-center gap-1">
                    <div
                      class="size-6 rounded-full flex items-center justify-center text-sm font-medium"
                      :class="stepClasses(2).bubble"
                    >
                      <span>2</span>
                    </div>
                    <span class="text-xs font-medium" :class="stepClasses(2).label">
                      {{ t('forms.addNew.leadDetails.vehicle.stockStepQuotation') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="w-52 shrink-0" aria-hidden="true" />

            <div class="flex justify-end">
              <Button type="button" variant="ghost" size="icon-sm" class="rounded-md" @click="handleOpenChange(false)">
                <X class="size-4" />
                <span class="sr-only">{{ t('common.buttons.close') }}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div class="flex-1 min-h-0 overflow-y-auto bg-muted px-6 pb-6 pt-0 border-0">
          <div v-if="step === 1" class="min-h-0 pt-4">
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

          <div v-else class="w-full flex flex-col min-h-0">
            <div class="shrink-0 bg-muted py-4 flex items-center justify-between gap-4">
              <div class="relative flex-1 w-full max-w-xl">
                <div
                  role="button"
                  tabindex="0"
                  class="flex h-8 min-h-8 w-full min-w-0 max-w-full cursor-pointer items-center gap-1.5 rounded-[10px] border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[220px] sm:max-w-[220px] sm:shrink-0"
                  @click="openQuotationSearch"
                  @keydown.enter.prevent="openQuotationSearch"
                >
                  <Search class="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span class="min-w-0 flex-1 truncate text-left text-muted-foreground">
                    {{ t('forms.addNew.leadDetails.vehicle.quotationSearchItemsPlaceholder') }}
                  </span>
                  <kbd
                    class="inline-flex h-5 shrink-0 items-center justify-center rounded-md bg-muted px-1 text-xs font-medium leading-none text-muted-foreground"
                  >
                    {{ keyboardShortcutLabel }}
                  </kbd>
                </div>
              </div>
              <div class="shrink-0 flex items-center gap-4">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-medium text-foreground">
                    {{ t('forms.addNew.leadDetails.vehicle.showNetPrices') }}
                  </span>
                  <Switch
                    :model-value="showNetPrices === true"
                    @update:model-value="(v) => (showNetPrices = v === true)"
                  />
                </div>
                <DropdownMenu :modal="false">
                  <DropdownMenuTrigger as-child>
                    <Button type="button" variant="outline" size="sm" class="rounded-md">
                      {{ selectedVatOption.shortLabel }}
                      <ChevronDown class="size-4 ml-1.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent class="w-56" align="end">
                    <DropdownMenuItem
                      v-for="opt in VAT_OPTIONS"
                      :key="opt.id"
                      :class="opt.id === selectedVatId ? 'bg-muted font-medium' : ''"
                      @select="selectedVatId = opt.id"
                    >
                      {{ opt.label }}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto py-0">
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <div class="space-y-4 pt-4">
                  <QuotationPanel
                    ref="quotationPanelRef"
                    :vehicle-line="quotationVehicleLine"
                    :vehicle-base-total="configurator.vehicleBasePriceGross.value"
                    :colour-label="configurator.selectedColour.value?.name || ''"
                    :colour-price-delta="configurator.colourPriceDelta.value"
                    :interior-colour-label="configurator.selectedInteriorColour.value?.name || ''"
                    :interior-colour-price-delta="configurator.interiorColourPriceDelta.value"
                    :selected-equipment="configurator.selectedEquipment.value"
                    :show-net-prices="showNetPrices === true"
                    :vat-rate-percent="currentVatRate"
                    :discount-pairing-base="showNetPrices ? configurator.discountBaseNet.value : configurator.discountBaseGross.value"
                    :promos="configurator.catalog.PROMOS"
                    :promo-selection="configurator.promoSelection"
                    :disabled-promo-ids="configurator.disabledPromoIds.value"
                    :user-campaigns="configurator.userCampaigns.value"
                    :vat-options="VAT_OPTIONS"
                    :user-discounts="configurator.userDiscounts.value"
                    :user-accessory-lines="configurator.userAccessoryLines.value"
                    :user-trade-in-lines="configurator.userTradeInLines.value"
                    :tax-extra-cost-lines="configurator.extraCostLines.value"
                    :vat-amount="configurator.vatAmount.value"
                    :user-purchase-methods="configurator.userPurchaseMethods.value"
                    :selected-purchase-method-ids="configurator.selectedPurchaseMethodIds.value"
                    :quotation-notes="configurator.quotationNotes.value"
                    :quotation-offer-valid-until="configurator.quotationOfferValidUntil.value"
                    @toggle-promo="(id, v) => configurator.togglePromo(id, v)"
                    @add-campaign="(c) => configurator.addCampaign(c)"
                    @update-campaign="(id, patch) => configurator.updateCampaign(id, patch)"
                    @update-campaign-vat="(id, vat) => configurator.updateCampaignVat(id, vat)"
                    @remove-campaign="(id) => configurator.removeCampaign(id)"
                    @toggle-campaign-active="(id, v) => configurator.toggleCampaignActive(id, v)"
                    @add-discount="(d) => configurator.addDiscount(d)"
                    @update-discount="(id, patch) => configurator.updateDiscount(id, patch)"
                    @update-discount-vat="(id, vat) => configurator.updateDiscountVat(id, vat)"
                    @remove-discount="(id) => configurator.removeDiscount(id)"
                    @add-accessory-line="(p) => configurator.addAccessoryLine(p)"
                    @update-accessory-line="(id, patch) => configurator.updateAccessoryLine(id, patch)"
                    @remove-accessory-line="(id) => configurator.removeAccessoryLine(id)"
                    @add-trade-in-line="(p) => configurator.addTradeInLine(p)"
                    @update-trade-in-line="(id, patch) => configurator.updateTradeInLine(id, patch)"
                    @remove-trade-in-line="(id) => configurator.removeTradeInLine(id)"
                    @add-purchase-method="(row) => configurator.addPurchaseMethod(row)"
                    @replace-purchase-method="(row) => configurator.replacePurchaseMethod(row)"
                    @remove-purchase-method="(id) => configurator.removePurchaseMethod(id)"
                    @toggle-purchase-method-selected="(id, v) => configurator.togglePurchaseMethodSelected(id, v)"
                    @add-tax-line="configurator.addTaxExtraCostLine"
                    @remove-tax-line="(id) => configurator.removeTaxExtraCostLine(id)"
                    @update-tax-line="(id, patch) => configurator.updateTaxExtraCostLine(id, patch)"
                    @update:quotation-notes="(v) => (configurator.quotationNotes.value = String(v ?? ''))"
                    @update:quotation-offer-valid-until="(v) => (configurator.quotationOfferValidUntil.value = String(v ?? ''))"
                  />
                </div>
                <div class="self-start lg:sticky lg:top-0">
                  <ConfigurationSummary
                    :brand-label="stockBrandLabel"
                    :model-title="stockModelTitlePrimary"
                    :version-name="stockModelSubtitle"
                    :colour-name="''"
                    :interior-colour-name="''"
                    :colour-hex="''"
                    :configured-image-url="stockHeroImageUrl"
                    :vehicle-display-price="offerSummaryVehicleDisplayPrice"
                    :equipment-total="configurator.equipmentTotal.value"
                    :accessories-total="configurator.accessoriesTotal.value"
                    :promo-total="configurator.offerSummaryPromoTotal.value"
                    :discounts-total="configurator.discountsTotal.value"
                    :subtotal="configurator.offerSummarySubtotalBeforeAccessories.value"
                    :taxes-total="configurator.extraCostsLinesTotalGross.value"
                    :taxes-total-net="offerSummaryTaxesAndExtraCostsNet"
                    :trade-in-value="configurator.tradeInValue.value"
                    :grand-total-raw="configurator.grandTotalRaw.value"
                    :grand-total="configurator.grandTotal.value"
                    :offer-summary-tax-breakdown-net="configurator.offerSummaryTaxBreakdownNet.value"
                    :offer-summary-tax-breakdown-vat="configurator.offerSummaryTaxBreakdownVat.value"
                    :offer-summary-tax-breakdown-gross="configurator.offerSummaryTaxBreakdownGross.value"
                    :vat-rate-percent="currentVatRate"
                    :show-net-prices="showNetPrices === true"
                    :round-price-applied="configurator.roundPriceApplied.value"
                    :round-price-adjustment="configurator.roundPriceAdjustment.value"
                    :condition-label="stockConditionSummaryLabel"
                    :hide-version-colour-section="true"
                    :plate-label="stockPlateSummary"
                    :vin-label="stockVinSummary"
                    @toggle-round-price="configurator.toggleRoundPrice()"
                    @update-round-price-adjustment="(value) => configurator.updateRoundPriceAdjustment(value)"
                    @reset-round-price="configurator.resetRoundPrice()"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog :open="quotationSearchOpen" @update:open="(v) => (quotationSearchOpen = v)">
          <DialogContent class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col">
            <DialogHeader class="shrink-0">
              <DialogTitle>{{ t('forms.addNew.leadDetails.vehicle.quotationSearchDialogTitle') }}</DialogTitle>
            </DialogHeader>
            <div class="flex-1 overflow-y-auto py-4 w-full space-y-4">
              <Input
                :model-value="quotationSearchQuery"
                type="text"
                :placeholder="t('forms.addNew.leadDetails.vehicle.quotationSearchDialogInputPlaceholder')"
                class="bg-background border-border"
                @update:model-value="(v) => (quotationSearchQuery = String(v ?? ''))"
              />
              <div class="rounded-lg border border-border bg-background overflow-hidden">
                <button
                  v-for="item in filteredQuotationSearchItems"
                  :key="item.key"
                  type="button"
                  class="w-full px-4 py-2 flex items-center justify-between gap-4 text-left hover:bg-muted/40 transition-colors"
                  @click="selectQuotationSearchItem(item)"
                >
                  <TruncatingTooltip :text="item.label" wrapper-class="min-w-0 flex-1">
                    <span class="text-sm text-foreground truncate">{{ item.label }}</span>
                  </TruncatingTooltip>
                  <span class="text-sm text-muted-foreground shrink-0">{{ item.groupLabel }}</span>
                </button>
                <div v-if="filteredQuotationSearchItems.length === 0" class="px-4 py-8 text-center">
                  <p class="text-sm text-muted-foreground">{{ t('forms.addNew.leadDetails.vehicle.quotationSearchNoItems') }}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <DialogFooter
          class="shrink-0 border-t border-border px-6 py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3"
          style="border-top-color: var(--color-neutral-300)"
        >
          <div v-if="!quotationStepRequired || step === 1" class="flex w-full justify-end">
            <Button type="button" variant="outline" class="rounded-sm w-full sm:w-auto" @click="handleOpenChange(false)">
              {{ t('common.buttons.cancel') }}
            </Button>
          </div>
          <div v-else class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 w-full">
            <Button type="button" variant="ghost" class="rounded-sm w-full sm:w-auto justify-start" @click="backToVehicleList">
              <ArrowLeft class="size-4 mr-2" />
              {{ t('forms.addNew.leadDetails.vehicle.stockBackToVehicles') }}
            </Button>
            <Button
              type="button"
              variant="default"
              class="rounded-sm w-full sm:w-auto"
              :disabled="!configurator.isReadyToSave.value"
              @click="handleSaveAndClose"
            >
              {{ t('forms.addNew.leadDetails.vehicle.stockSaveAndClose') }}
            </Button>
          </div>
        </DialogFooter>
      </TooltipProvider>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, Check, ChevronDown, Search, X } from 'lucide-vue-next'
import { useVehiclesStore } from '@/stores/vehicles'
import { getNestedProperty, useDataTableData } from '@/composables/useDataTableData'
import { useTableRowClick } from '@/composables/useTableRowClick'
import { useVehicleConfigurator } from '@/composables/useVehicleConfigurator'
import { useQuotationItemSearch } from '@/composables/useQuotationItemSearch'
import DataTableWithUnifiedSearch from '@/components/shared/layout/DataTableWithUnifiedSearch.vue'
import VehicleGrid from '@/components/vehicles/VehicleGrid.vue'
import QuotationPanel from '@/components/addnew/configurator/QuotationPanel.vue'
import ConfigurationSummary from '@/components/addnew/configurator/ConfigurationSummary.vue'
import TruncatingTooltip from '@/components/shared/TruncatingTooltip.vue'
import {
  getInventoryTypeColumnFilters,
  getVehicleInventoryTypeFilterValue,
  normalizeVehicleInventoryTableRow,
} from '@/utils/vehicleInventoryTable'
import { getVehicleConditionLabel } from '@/utils/vehicleHelpers'
import { DEFAULT_VAT_OPTION_ID, VAT_OPTIONS } from '@/constants/vehicleConfiguratorCatalog'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Switch,
  TooltipProvider,
} from '@motork/component-library/future/primitives'

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
  /** Sales opportunity: require quotation step before confirming stock vehicle. */
  quotationStepRequired: { type: Boolean, default: false },
  /** Restore step 2 + snapshot (edit from card). */
  resumeDraft: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'select', 'insert-manually', 'save', 'resume-draft-consumed'])

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

const pendingStockVehicle = ref(null)
const step = ref(1)
const showNetPrices = ref(false)
const selectedVatId = ref(DEFAULT_VAT_OPTION_ID)
const quotationPanelRef = ref(null)

const isMac = computed(() => {
  if (typeof navigator === 'undefined') return true
  const platform = String(navigator.platform || '')
  return /mac|iphone|ipad|ipod/i.test(platform)
})
const keyboardShortcutLabel = computed(() => (isMac.value ? '⌘K' : 'Ctrl+K'))
const selectedVatOption = computed(
  () => VAT_OPTIONS.find((v) => v.id === selectedVatId.value) || VAT_OPTIONS[0],
)
const currentVatRate = computed(() => Number(selectedVatOption.value?.rate || 0))

const stockBrandLabel = computed(() => String(pendingStockVehicle.value?.brand || '').trim())
const stockModelTitlePrimary = computed(() => {
  const v = pendingStockVehicle.value
  if (!v) return ''
  const m = String(v.model || '').trim()
  const y = v.year != null ? String(v.year) : ''
  return [m, y].filter(Boolean).join(' ').trim()
})
const stockModelSubtitle = computed(() => {
  const v = pendingStockVehicle.value
  if (!v) return ''
  return (v.trim || v.variant || v.engineLine || v.summary || '').toString().trim()
})
const stockSummaryForComposable = computed(() => stockModelSubtitle.value)
const stockSpecificationForComposable = computed(() => {
  const v = pendingStockVehicle.value
  if (!v) return ''
  const a = (v.fuelType || '').toString().trim()
  const b = (v.gearType || '').toString().trim()
  return [a, b].filter(Boolean).join(' – ')
})
const stockHeroImageUrl = computed(() => String(pendingStockVehicle.value?.image || '').trim())
const stockPlateSummary = computed(() => {
  const v = pendingStockVehicle.value
  if (!v) return ''
  return (v.plateNumber || v.plate || v.plates || '').toString().trim()
})
const stockVinSummary = computed(() => {
  const v = pendingStockVehicle.value
  if (!v) return ''
  return (v.vin || '').toString().trim()
})
const stockConditionSummaryLabel = computed(() => getVehicleConditionLabel(pendingStockVehicle.value) || '')

const quotationOnlyActive = computed(
  () => props.quotationStepRequired === true && step.value === 2 && !!pendingStockVehicle.value,
)

const stockListPrice = computed(() => {
  const n = Number(pendingStockVehicle.value?.price)
  return Number.isFinite(n) ? Math.max(0, n) : 0
})

const configurator = useVehicleConfigurator({
  brandLabel: stockBrandLabel,
  modelTitle: stockModelTitlePrimary,
  modelImageUrl: stockHeroImageUrl,
  modelBasePrice: stockListPrice,
  vatRatePercent: currentVatRate,
  showNetPrices,
  quotationOnly: quotationOnlyActive,
  stockSummaryLine: stockSummaryForComposable,
  stockSpecificationLine: stockSpecificationForComposable,
})

const offerSummaryTaxesAndExtraCostsNet = computed(() =>
  configurator.extraCostLines.value.reduce(
    (sum, row) => sum + Math.max(0, Number(row.netAmount || 0)),
    0,
  ),
)

const offerSummaryVehicleDisplayPrice = computed(() =>
  showNetPrices.value ? configurator.vehicleBasePriceNet.value : configurator.vehicleBasePriceGross.value,
)

const {
  quotationSearchOpen,
  quotationSearchQuery,
  filteredQuotationSearchItems,
  selectQuotationSearchItem,
  openQuotationSearch,
} = useQuotationItemSearch(configurator, quotationPanelRef)

const quotationVehicleLine = computed(() => {
  const v = pendingStockVehicle.value
  if (!v) return ''
  const base = [v.brand, v.model].filter(Boolean).join(' ').trim()
  const extra = stockModelSubtitle.value
  return extra ? `${base} – ${extra}` : base
})

const headerSubtitle = computed(() => {
  if (!props.quotationStepRequired) {
    return t('forms.addNew.leadDetails.vehicle.stockSearchSubtitle')
  }
  if (step.value === 1) return t('forms.addNew.leadDetails.vehicle.stockStep1Subtitle')
  return t('forms.addNew.leadDetails.vehicle.stockStep2Subtitle')
})

function stepClasses(stepNumber) {
  const isActive = step.value === stepNumber
  const isCompleted = step.value > stepNumber
  if (isCompleted) {
    return {
      bubble: 'border border-primary bg-primary text-primary-foreground',
      label: 'text-foreground',
    }
  }
  if (isActive) {
    return {
      bubble: 'border border-primary bg-primary/10 text-primary',
      label: 'text-primary',
    }
  }
  return {
    bubble: 'border border-border bg-background text-muted-foreground',
    label: 'text-muted-foreground',
  }
}

function resetState() {
  step.value = 1
  pendingStockVehicle.value = null
  showNetPrices.value = false
  selectedVatId.value = DEFAULT_VAT_OPTION_ID
  configurator.reset()
  quotationSearchQuery.value = ''
  quotationSearchOpen.value = false
}

function handleOpenChange(v) {
  if (!v) resetState()
  emit('update:open', v)
}

function backToVehicleList() {
  step.value = 1
}

function handleSaveAndClose() {
  if (!configurator.isReadyToSave.value) return
  emit('save', {
    stockVehicle: pendingStockVehicle.value,
    ...configurator.payload.value,
    resumeDraft: {
      stockVehicleId: pendingStockVehicle.value?.id ?? null,
      showNetPrices: showNetPrices.value === true,
      selectedVatId: selectedVatId.value,
      configuratorSnapshot: configurator.captureSnapshot(),
    },
  })
  handleOpenChange(false)
}

async function applyStockResumeDraft(draft) {
  const id = draft?.stockVehicleId
  const snap = draft?.configuratorSnapshot
  if (id == null || !snap || typeof snap !== 'object') return
  await nextTick()
  const row = vehiclesNormalized.value.find((v) => String(v?.id) === String(id))
  if (!row) return
  pendingStockVehicle.value = row
  showNetPrices.value = draft.showNetPrices === true
  const vatId = String(draft.selectedVatId || '')
  selectedVatId.value = VAT_OPTIONS.some((o) => o.id === vatId) ? vatId : DEFAULT_VAT_OPTION_ID
  configurator.applySnapshot(snap)
  step.value = 2
}

function onGlobalKeydown(e) {
  if (!props.open) return
  if (!props.quotationStepRequired || step.value !== 2) return
  if (quotationSearchOpen.value) return
  const key = String(e?.key || '').toLowerCase()
  const isCombo = isMac.value ? e.metaKey : e.ctrlKey
  if (!isCombo || key !== 'k') return
  e.preventDefault()
  openQuotationSearch()
}

function selectVehicle(vehicle) {
  if (!vehicle) return
  if (props.quotationStepRequired) {
    const id = vehicle?.id
    if (pendingStockVehicle.value?.id !== id) {
      configurator.reset()
    }
    pendingStockVehicle.value = vehicle
    step.value = 2
    return
  }
  emit('select', vehicle)
  emit('update:open', false)
}

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

function onInsertManuallyFromEmptyState() {
  emit('insert-manually')
  emit('update:open', false)
}

onMounted(() => {
  vehiclesStore.fetchVehicles()
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onGlobalKeydown)
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onGlobalKeydown)
  }
})

watch(
  () => props.open,
  (isOpen, wasOpen) => {
    if (!isOpen) {
      resetState()
      return
    }
    if (!props.quotationStepRequired || wasOpen !== false) return
    const hasResume =
      props.resumeDraft?.configuratorSnapshot &&
      props.resumeDraft?.stockVehicleId != null
    if (hasResume) return
    step.value = 1
    pendingStockVehicle.value = null
    configurator.reset()
    showNetPrices.value = false
    selectedVatId.value = DEFAULT_VAT_OPTION_ID
    quotationSearchQuery.value = ''
    quotationSearchOpen.value = false
  },
)

watch(
  () => [props.open, props.resumeDraft],
  async ([opened, draft]) => {
    if (!opened || !props.quotationStepRequired) return
    if (!draft?.configuratorSnapshot || draft?.stockVehicleId == null) return
    await nextTick()
    await applyStockResumeDraft(draft)
    emit('resume-draft-consumed')
  },
  { flush: 'post' },
)

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
      globalFilter.value = mode === 'in-stock' && trimmed ? trimmed : ''
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

