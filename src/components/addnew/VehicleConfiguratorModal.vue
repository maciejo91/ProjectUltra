<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="w-[90vw] max-w-screen-2xl h-[80vh] max-h-[calc(100vh-4rem)] flex flex-col gap-0 overflow-hidden p-0" :show-close-button="false">
      <TooltipProvider :delay-duration="200">
      <DialogHeader class="shrink-0 px-6 py-4 border-b border-border overflow-hidden" style="border-bottom-color: var(--color-neutral-300);">
        <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <DialogTitle class="text-xl font-medium text-foreground">Offer creation</DialogTitle>
              <Badge
                variant="outline"
                size="lg"
                class="border-dashed border-destructive text-destructive uppercase tracking-widest font-semibold shadow-sm rotate-3"
              >
                DRAFT
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ headerSubtitle }}
            </p>
          </div>

          <div class="w-52 flex justify-center pt-3">
            <div class="relative h-11 w-full">
              <div class="absolute top-3 left-6 right-6 h-px bg-border" aria-hidden="true" />

              <div class="absolute inset-x-0 top-0 flex items-start justify-between">
                <div class="flex flex-col items-center gap-1">
                  <div
                    class="size-6 rounded-full flex items-center justify-center text-sm font-medium"
                    :class="stepClasses(1).bubble"
                  >
                    <Check v-if="step > 1" class="size-4" />
                    <span v-else>1</span>
                  </div>
                  <span class="text-xs font-medium" :class="stepClasses(1).label">Brand</span>
                </div>

                <div class="flex flex-col items-center gap-1">
                  <div
                    class="size-6 rounded-full flex items-center justify-center text-sm font-medium"
                    :class="stepClasses(2).bubble"
                  >
                    <Check v-if="step > 2" class="size-4" />
                    <span v-else>2</span>
                  </div>
                  <span class="text-xs font-medium" :class="stepClasses(2).label">Model</span>
                </div>

                <div class="flex flex-col items-center gap-1">
                  <div
                    class="size-6 rounded-full flex items-center justify-center text-sm font-medium"
                    :class="stepClasses(3).bubble"
                  >
                    <Check v-if="step > 3" class="size-4" />
                    <span v-else>3</span>
                  </div>
                  <span class="text-xs font-medium" :class="stepClasses(3).label">Configuration</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <Button type="button" variant="ghost" size="icon-sm" class="rounded-md" @click="handleOpenChange(false)">
              <X class="size-4" />
              <span class="sr-only">Close</span>
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-y-auto bg-muted px-6 pb-6 pt-0 border-0">
        <div v-if="step === 1" class="w-full h-full flex items-center justify-center gap-2.5">
          <button
            v-for="b in brands"
            :key="b.id"
            type="button"
            :class="[
              'bg-background border border-border rounded-lg p-4 flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selectedBrand === b.id ? 'ring-2 ring-primary border-primary' : ''
            ]"
            @click="selectBrand(b.id)"
          >
            <div class="flex h-[60px] w-32 items-center justify-center">
              <img
                v-if="getBrandLogoUrl(b) && !brandLogoFailed[b.id]"
                :key="`${b.id}-${logoRenderKey}`"
                :src="getBrandLogoUrl(b)"
                :alt="`${b.label} logo`"
                class="h-full w-auto max-w-full object-contain"
                loading="lazy"
                @error="onBrandLogoError(b.id)"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center rounded-md border border-border bg-muted text-xs font-semibold text-muted-foreground"
                aria-hidden="true"
              >
                {{ getBrandInitials(b.label) }}
              </div>
            </div>
            <TruncatingTooltip :text="b.label" wrapper-class="w-full min-w-0">
              <div class="text-sm font-medium text-foreground text-center w-full truncate">
                {{ b.label }}
              </div>
            </TruncatingTooltip>
          </button>
        </div>

        <div v-else-if="step === 2" class="w-full h-full flex flex-col min-h-0">
          <div class="shrink-0 bg-muted px-6 py-4 flex items-center justify-between gap-4">
            <div class="relative flex-1 w-full max-w-xl">
              <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="modelSearchQuery"
                type="text"
                placeholder="Search..."
                class="w-full pl-9 bg-background border-border"
              />
            </div>

            <div class="shrink-0 flex items-center gap-4">
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-foreground">Show net prices</span>
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

          <div class="flex-1 min-h-0 overflow-y-auto px-6 py-0">
            <div class="grid py-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <button
                v-for="m in filteredModels"
                :key="m.id"
                type="button"
                :class="[
                  'bg-background border border-border rounded-lg p-4 flex flex-col items-start text-left gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selectedModel === m.id ? 'ring-2 ring-primary border-primary' : ''
                ]"
                @click="selectModel(m.id)"
              >
                <div class="w-full min-h-12">
                  <p class="text-base font-semibold text-foreground line-clamp-2">
                    {{ m.title }}
                  </p>
                </div>

                <div class="w-full aspect-[16/9] overflow-hidden rounded-md bg-muted">
                  <img
                    v-if="m.imageUrl"
                    :src="m.imageUrl"
                    alt=""
                    class="h-full w-full object-cover"
                    loading="lazy"
                    @error="onModelImageError"
                  />
                </div>

                <div class="w-full pt-4 space-y-1">
                  <div class="flex items-center justify-between gap-2">
                  <TruncatingTooltip :text="m.versionsLabel" wrapper-class="min-w-0 flex-1">
                    <p class="text-sm text-muted-foreground truncate">
                      {{ m.versionsLabel }}
                    </p>
                  </TruncatingTooltip>
                    <PromoBadge :promos="modelPromos(m)" />
                  </div>
                  <p class="text-sm text-foreground">
                    from {{ formatCurrency(modelDisplayPrice(m)) }}
                    <span v-if="showNetPrices"> VAT excl.</span>
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

          <div v-else class="w-full h-full flex flex-col min-h-0">
          <div class="shrink-0 bg-muted px-6 py-4 flex items-center justify-between gap-4">
            <div class="relative flex-1 w-full max-w-xl">
              <template v-if="activeTab !== 'quotation'">
                <Search
                  class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  v-model="itemSearchQuery"
                  type="text"
                  placeholder="Search..."
                  class="w-full pl-9 bg-background border-border"
                />
              </template>
              <div
                v-else
                role="button"
                tabindex="0"
                class="flex h-8 min-h-8 w-full min-w-0 max-w-full cursor-pointer items-center gap-1.5 rounded-[10px] border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[220px] sm:max-w-[220px] sm:shrink-0"
                @click="openQuotationSearch"
                @keydown.enter.prevent="openQuotationSearch"
              >
                <Search class="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span class="min-w-0 flex-1 truncate text-left text-muted-foreground">Search items...</span>
                <kbd
                  class="inline-flex h-5 shrink-0 items-center justify-center rounded-md bg-muted px-1 text-xs font-medium leading-none text-muted-foreground"
                >
                  {{ keyboardShortcutLabel }}
                </kbd>
              </div>
            </div>

            <div class="shrink-0 flex items-center gap-4">
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-foreground">Show net prices</span>
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

          <div class="flex-1 min-h-0 overflow-y-auto px-6 py-0">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <div class="space-y-4 pt-4">
                <AppTabs
                  :model-value="activeTab"
                  :tabs="configuratorTabs"
                  divider="touching"
                  @update:model-value="(v) => (activeTab = String(v || 'version'))"
                />

                <VersionPanel
                  v-if="activeTab === 'version'"
                  :model-value="configurator.selectedVersionId.value"
                  :versions="filteredVersions"
                  :base-price="configuredModelBasePrice"
                  :show-net-prices="showNetPrices === true"
                  :vat-rate-percent="currentVatRate"
                  @update:model-value="onVersionPicked"
                />
                <ColourPanel
                  v-else-if="activeTab === 'colour'"
                  :exterior-id="configurator.selectedColourId.value"
                  :interior-id="configurator.selectedInteriorColourId.value"
                  :colours="filteredColours"
                  :show-net-prices="showNetPrices === true"
                  :vat-rate-percent="currentVatRate"
                  @update:exterior-id="onExteriorColourPicked"
                  @update:interior-id="onInteriorColourPicked"
                />
                <EquipmentPanel
                  v-else-if="activeTab === 'equipment'"
                  :equipment="filteredEquipment"
                  :selection="configurator.equipmentSelection"
                  :locked-ids="configurator.lockedEquipmentIds.value"
                  :groups="EQUIPMENT_GROUPS"
                  :show-net-prices="showNetPrices === true"
                  :vat-rate-percent="currentVatRate"
                  :show-standard-equipment="showStandardEquipment"
                  @update:show-standard-equipment="(v) => (showStandardEquipment = v === true)"
                  @toggle="(id, v) => configurator.toggleEquipment(id, v)"
                />
                <QuotationPanel
                  v-else
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
                  :brand-label="configuredBrandLabel"
                  :model-title="configuredModelTitle"
                  :version-name="configurator.selectedVersion.value?.name || ''"
                  :colour-name="configurator.selectedColour.value?.name || ''"
                  :interior-colour-name="configurator.selectedInteriorColour.value?.name || ''"
                  :colour-hex="configurator.selectedColour.value?.hex || ''"
                  :configured-image-url="configurator.configuredImageUrl.value"
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
            <DialogTitle>Search quotation items</DialogTitle>
          </DialogHeader>

          <div class="flex-1 overflow-y-auto py-4 w-full space-y-4">
            <Input
              :model-value="quotationSearchQuery"
              type="text"
              placeholder="Type the item name..."
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
                <p class="text-sm text-muted-foreground">No items found</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DialogFooter class="shrink-0 border-t border-border px-6 py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3" style="border-top-color: var(--color-neutral-300);">
        <div v-if="step === 1" class="flex w-full justify-end">
          <Button type="button" variant="default" class="rounded-sm w-full sm:w-auto" disabled>
            Save and close
          </Button>
        </div>

        <div v-else-if="step === 2" class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 w-full">
          <Button type="button" variant="ghost" class="rounded-sm w-full sm:w-auto justify-start" @click="backToBrandSelection">
            <ArrowLeft class="size-4 mr-2" />
            Back to brand
          </Button>
          <Button type="button" variant="default" class="rounded-sm w-full sm:w-auto" disabled>
            Save and close
          </Button>
        </div>

        <div v-else class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 w-full">
          <Button type="button" variant="ghost" class="rounded-sm w-full sm:w-auto justify-start" @click="step = 2">
            <ArrowLeft class="size-4 mr-2" />
            Back to models
          </Button>
          <Button
            type="button"
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!configurator.isReadyToSave.value"
            @click="handleSaveAndClose"
          >
            Save and close
          </Button>
        </div>
      </DialogFooter>
      </TooltipProvider>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowLeft, Check, ChevronDown, Search, X } from 'lucide-vue-next'
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Input, Switch, TooltipProvider } from '@motork/component-library/future/primitives'
import AppTabs from '@/components/shared/AppTabs.vue'
import VersionPanel from '@/components/addnew/configurator/VersionPanel.vue'
import ColourPanel from '@/components/addnew/configurator/ColourPanel.vue'
import EquipmentPanel from '@/components/addnew/configurator/EquipmentPanel.vue'
import QuotationPanel from '@/components/addnew/configurator/QuotationPanel.vue'
import ConfigurationSummary from '@/components/addnew/configurator/ConfigurationSummary.vue'
import TruncatingTooltip from '@/components/shared/TruncatingTooltip.vue'
import PromoBadge from '@/components/shared/PromoBadge.vue'
import { useVehicleConfigurator } from '@/composables/useVehicleConfigurator'
import { useQuotationItemSearch } from '@/composables/useQuotationItemSearch'
import {
  DEFAULT_VAT_OPTION_ID,
  EQUIPMENT_GROUPS,
  VAT_OPTIONS,
  findPromo,
} from '@/constants/vehicleConfiguratorCatalog'

const props = defineProps({
  open: { type: Boolean, default: false },
  /** When set while opening, restores step 3 + quotation snapshot (edit-from-card flow). */
  resumeDraft: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'save', 'resume-draft-consumed'])

const STEP_THREE_TAB_KEYS = new Set(['version', 'colour', 'equipment', 'quotation'])

const step = ref(1)
const selectedBrand = ref('')
const selectedModel = ref('')

const quotationPanelRef = ref(null)

const isMac = computed(() => {
  if (typeof navigator === 'undefined') return true
  const platform = String(navigator.platform || '')
  return /mac|iphone|ipad|ipod/i.test(platform)
})

const keyboardShortcutLabel = computed(() => (isMac.value ? '⌘K' : 'Ctrl+K'))

function onGlobalKeydown(e) {
  if (!props.open) return
  if (step.value !== 3) return
  if (activeTab.value !== 'quotation') return
  if (quotationSearchOpen.value) return

  const key = String(e?.key || '').toLowerCase()
  const isCombo = isMac.value ? e.metaKey : e.ctrlKey
  if (!isCombo || key !== 'k') return

  e.preventDefault()
  openQuotationSearch()
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})

const brands = [
  {
    id: 'audi',
    label: 'Audi',
    logoUrl: 'https://cdn.dealerk.it/cars/make/brand/160/audi.png',
  },
  {
    id: 'bmw',
    label: 'BMW',
    logoUrl: 'https://cdn.dealerk.it/cars/make/brand/160/bmw.png',
  },
  {
    id: 'volkswagen',
    label: 'Volkswagen',
    logoUrl: 'https://cdn.dealerk.it/cars/make/brand/160/volkswagen.png',
  },
  {
    id: 'omoda',
    label: 'Omoda',
    logoUrl: 'https://cdn.dealerk.it/cars/make/brand/160/omoda.png',
  },
]

const brandLogoFailed = ref({})
const logoRenderKey = ref(0)

const showNetPrices = ref(false)
const showStandardEquipment = ref(true)
const modelSearchQuery = ref('')
const itemSearchQuery = ref('')

const activeTab = ref('version')

const selectedVatId = ref(DEFAULT_VAT_OPTION_ID)
const selectedVatOption = computed(
  () => VAT_OPTIONS.find((v) => v.id === selectedVatId.value) || VAT_OPTIONS[0]
)
const currentVatRate = computed(() => Number(selectedVatOption.value?.rate || 0))

function makeModelCards({ brandId, count, seed }) {
  const baseImageUrl =
    'https://cdn-datak.motork.net/configurator-icon/cars/it/400/AUDI/A1-SPORTBACK/32536_BERLINA-5-PORTE/audi-a1-sportback-2018-icona.png'
  return Array.from({ length: count }).map((_, idx) => {
    const n = seed + idx
    const promoIds =
      n % 7 === 0
        ? ['p-spring-2026', 'p-loyalty']
        : n % 5 === 0
          ? ['p-spring-2026']
          : []
    return {
      id: `${brandId}-model-${n}`,
      title: `A${(n % 8) + 1} Sportback Berlina 5 porte`,
      imageUrl: baseImageUrl,
      versionsLabel: `${10 + (n % 6)} versions`,
      promoIds,
      fromPrice: 28_000 + (n % 12) * 1_500,
    }
  })
}

function onModelImageError(e) {
  const img = e?.target
  if (!img) return
  const fallback = '/vehicle-placeholder.svg'
  const current = String(img.getAttribute?.('src') || '')
  if (current === fallback) return
  img.setAttribute?.('src', fallback)
}

function modelPromos(model) {
  return (model?.promoIds || []).map(findPromo).filter(Boolean)
}

function formatCurrency(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${Math.round(n).toLocaleString()}€`
}

function modelDisplayPrice(model) {
  const gross = Number(model?.fromPrice) || 0
  if (!showNetPrices.value) return gross
  const rate = currentVatRate.value / 100
  if (selectedVatOption.value?.notApplicable || rate <= 0) return gross
  return gross / (1 + rate)
}

const modelsByBrand = {
  audi: makeModelCards({ brandId: 'audi', count: 20, seed: 1 }),
  bmw: makeModelCards({ brandId: 'bmw', count: 20, seed: 101 }),
  volkswagen: makeModelCards({ brandId: 'volkswagen', count: 20, seed: 201 }),
  omoda: makeModelCards({ brandId: 'omoda', count: 20, seed: 301 }),
}

const filteredModels = computed(() => {
  const brand = selectedBrand.value
  const list = modelsByBrand[brand] ?? []
  const q = modelSearchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((m) => String(m.title || '').toLowerCase().includes(q))
})

function getBrandLogoUrl(brand) {
  const id = brand?.id
  if (!id) return ''
  const remote = typeof brand?.logoUrl === 'string' ? brand.logoUrl.trim() : ''
  if (remote) return remote
  return `/brands/${id}.png`
}

function onBrandLogoError(brandId) {
  if (!brandId) return
  brandLogoFailed.value = { ...brandLogoFailed.value, [brandId]: true }
}

function getBrandInitials(label) {
  const text = String(label || '').trim()
  if (!text) return ''
  if (text.toLowerCase() === 'volkswagen') return 'VW'
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

const headerSubtitle = computed(() =>
  step.value === 1
    ? 'Select the brand to configure'
    : step.value === 2
      ? 'Select the model to configure'
      : 'Complete the configuration e define the pricing'
)

const configuredBrandLabel = computed(() => brands.find((b) => b.id === selectedBrand.value)?.label || '')
const configuredModel = computed(() => (modelsByBrand[selectedBrand.value] ?? []).find((m) => m.id === selectedModel.value) || null)
const configuredModelTitle = computed(() => configuredModel.value?.title || '')
const configuredModelImageUrl = computed(() => configuredModel.value?.imageUrl || '')

const configuredModelBasePrice = computed(
  () => Number(configuredModel.value?.fromPrice) || 0
)

const configurator = useVehicleConfigurator({
  brandLabel: configuredBrandLabel,
  modelTitle: configuredModelTitle,
  modelImageUrl: configuredModelImageUrl,
  modelBasePrice: configuredModelBasePrice,
  vatRatePercent: currentVatRate,
  showNetPrices,
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
  quotationSearchItems,
  filteredQuotationSearchItems,
  selectQuotationSearchItem,
  openQuotationSearch,
} = useQuotationItemSearch(configurator, quotationPanelRef)

const quotationVehicleLine = computed(() => {
  const base = [configuredBrandLabel.value, configuredModelTitle.value].filter(Boolean).join(' ')
  const versionName = configurator.selectedVersion.value?.name || ''
  return [base, versionName].filter(Boolean).join(' – ')
})

const configuratorTabs = computed(() => [
  { key: 'version', label: 'Version' },
  { key: 'colour', label: 'Colour' },
  {
    key: 'equipment',
    label: 'Equipment - Optional',
    count: configurator.selectedEquipment.value.length,
  },
  { key: 'quotation', label: 'Quotation' },
])

/** Filter Step-3 catalog content by the in-tab search box. */
const filteredVersions = computed(() => {
  const list = configurator.catalog.VERSIONS
  const q = itemSearchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((v) => `${v.name} ${v.engine} ${v.fuel} ${v.gearbox}`.toLowerCase().includes(q))
})

const filteredColours = computed(() => {
  const list = configurator.catalog.COLOURS
  const q = itemSearchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((c) =>
    `${c.name} ${c.finish} ${c.category || ''} ${c.subgroup || ''}`.toLowerCase().includes(q)
  )
})

const filteredEquipment = computed(() => {
  const list = configurator.catalog.EQUIPMENT
  const q = itemSearchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((e) => `${e.name} ${e.group}`.toLowerCase().includes(q))
})

function onVersionPicked(id) {
  configurator.selectVersion(id)
}

function onExteriorColourPicked(id) {
  configurator.selectColour(id)
}

function onInteriorColourPicked(id) {
  configurator.selectInteriorColour(id)
}

function ensureDefaultColoursSelected() {
  const colours = configurator.catalog?.COLOURS ?? []
  if (!Array.isArray(colours) || !colours.length) return

  const firstExteriorIncluded =
    colours.find((c) => c?.category === 'exterior' && Number(c?.priceDelta || 0) === 0) ||
    colours.find((c) => c?.category === 'exterior') ||
    null

  const firstInteriorIncluded =
    colours.find((c) => c?.category === 'interior' && Number(c?.priceDelta || 0) === 0) ||
    colours.find((c) => c?.category === 'interior') ||
    null

  if (!configurator.selectedColourId.value && firstExteriorIncluded?.id) {
    configurator.selectColour(firstExteriorIncluded.id)
  }

  if (!configurator.selectedInteriorColourId.value && firstInteriorIncluded?.id) {
    configurator.selectInteriorColour(firstInteriorIncluded.id)
  }
}

function resetState() {
  step.value = 1
  selectedBrand.value = ''
  selectedModel.value = ''
  brandLogoFailed.value = {}
  modelSearchQuery.value = ''
  itemSearchQuery.value = ''
  activeTab.value = 'version'
  selectedVatId.value = DEFAULT_VAT_OPTION_ID
  showNetPrices.value = false
  configurator.reset()
}

function selectBrand(brandId) {
  if (!brandId) return
  selectedBrand.value = brandId
  step.value = 2
}

function selectModel(modelId) {
  if (!modelId) return
  selectedModel.value = modelId
  configurator.reset()
  itemSearchQuery.value = ''
  activeTab.value = 'version'
  const firstVersionId = configurator?.catalog?.VERSIONS?.[0]?.id
  if (firstVersionId) {
    configurator.selectVersion(firstVersionId)
  }
  ensureDefaultColoursSelected()
  step.value = 3
}

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

function handleOpenChange(v) {
  if (!v) resetState()
  emit('update:open', v)
}

function backToBrandSelection() {
  step.value = 1
  selectedBrand.value = ''
  selectedModel.value = ''
  modelSearchQuery.value = ''
  brandLogoFailed.value = {}
}

function buildResumeDraft() {
  return {
    brandId: selectedBrand.value,
    modelId: selectedModel.value,
    showNetPrices: showNetPrices.value === true,
    selectedVatId: selectedVatId.value,
    showStandardEquipment: showStandardEquipment.value === true,
    activeTab: activeTab.value,
    itemSearchQuery: itemSearchQuery.value,
    configuratorSnapshot: configurator.captureSnapshot(),
  }
}

function applyResumeDraft(draft) {
  const snapshot = draft?.configuratorSnapshot
  if (!snapshot || typeof snapshot !== 'object') return

  selectedBrand.value = String(draft.brandId || '')
  selectedModel.value = String(draft.modelId || '')
  step.value = 3

  showNetPrices.value = draft.showNetPrices === true

  const vatId = String(draft.selectedVatId || '')
  selectedVatId.value = VAT_OPTIONS.some((o) => o.id === vatId) ? vatId : DEFAULT_VAT_OPTION_ID

  showStandardEquipment.value = draft.showStandardEquipment !== false

  itemSearchQuery.value = String(draft.itemSearchQuery || '')
  modelSearchQuery.value = ''

  brandLogoFailed.value = {}
  logoRenderKey.value += 1

  configurator.applySnapshot(snapshot)

  const tab = String(draft.activeTab || 'version')
  activeTab.value = STEP_THREE_TAB_KEYS.has(tab) ? tab : 'version'
}

function handleSaveAndClose() {
  if (!configurator.isReadyToSave.value) return
  emit('save', { ...configurator.payload.value, resumeDraft: buildResumeDraft() })
  handleOpenChange(false)
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      brandLogoFailed.value = {}
      logoRenderKey.value += 1
      return
    }
    resetState()
  }
)

watch(
  () => [props.open, props.resumeDraft],
  async ([opened, draft]) => {
    if (!opened || !draft?.configuratorSnapshot) return
    await nextTick()
    applyResumeDraft(draft)
    emit('resume-draft-consumed')
  },
  { flush: 'post' }
)

watch(
  () => activeTab.value,
  (tab) => {
    if (tab === 'colour') {
      ensureDefaultColoursSelected()
    }
  }
)

watch(
  () => step.value,
  (s, prev) => {
    if (s === 1) brandLogoFailed.value = {}
    if (prev === 3 && s !== 3) {
      configurator.reset()
      itemSearchQuery.value = ''
    }
  }
)
</script>

<style scoped>
:deep(button.bg-background) {
  border-color: var(--figma-border);
}
</style>
