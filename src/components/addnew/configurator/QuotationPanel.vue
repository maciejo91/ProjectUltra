<template>
  <div>
    <div class="flex items-center justify-end gap-4">
      <button
        type="button"
        class="text-xs font-medium text-muted-foreground hover:text-foreground"
        @click="toggleAll"
      >
        {{ noneExpanded ? 'Expand all' : 'Collapse all' }}
      </button>
    </div>

    <div class="mt-4 space-y-2.5">
    <div ref="sectionEls.vehicleDetails">
      <CollapsibleSection
        title="Vehicle details"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.vehicleDetails"
        card-style
        @toggle="toggleSection('vehicleDetails')"
      >
        <div class="space-y-2.5">
          <div
            v-if="showNetPrices"
            class="flex flex-wrap items-center gap-2.5"
          >
            <span class="min-w-0 flex-1 select-none text-xs leading-none text-muted-foreground invisible">
              Item description
            </span>
            <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">Net price</span>
            <span class="w-40 shrink-0 text-xs leading-none text-muted-foreground">VAT (%)</span>
            <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">Price VAT incl.</span>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg bg-muted px-2.5 py-1">
              <p class="truncate text-sm leading-normal text-muted-foreground">{{ vehicleLine }}</p>
            </div>
            <template v-if="showNetPrices">
              <VehicleDetailAmountPill :amount="toNet(vehicleBaseTotal)" />
              <VehicleDetailVatStub :label="vatSelectLabel" />
              <VehicleDetailAmountPill :amount="Number(vehicleBaseTotal)" />
            </template>
            <VehicleDetailAmountPill v-else :amount="Number(vehicleBaseTotal)" />
          </div>

          <div
            v-if="colourLabel"
            class="flex flex-wrap items-center gap-2.5"
          >
            <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg bg-muted px-2.5 py-1">
              <p class="truncate text-sm leading-normal text-muted-foreground">
                Colour: {{ colourLabel }}
              </p>
            </div>
            <template v-if="showNetPrices">
              <VehicleDetailAmountPill
                v-if="colourPriceDelta > 0"
                :amount="toNet(colourPriceDelta)"
              />
              <div
                v-else
                class="flex h-8 w-32 shrink-0 items-center justify-end rounded-lg bg-muted px-2.5 py-1 text-sm text-muted-foreground"
              >
                —
              </div>
              <VehicleDetailVatStub :label="vatSelectLabel" />
              <VehicleDetailAmountPill v-if="colourPriceDelta > 0" :amount="colourPriceDelta" />
              <VehicleDetailAmountPill v-else :amount="0" />
            </template>
            <VehicleDetailAmountPill v-else-if="colourPriceDelta > 0" :amount="colourPriceDelta" />
            <VehicleDetailAmountPill v-else :amount="0" />
          </div>

          <div
            v-if="interiorColourLabel"
            class="flex flex-wrap items-center gap-2.5"
          >
            <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg bg-muted px-2.5 py-1">
              <p class="truncate text-sm leading-normal text-muted-foreground">
                Interior: {{ interiorColourLabel }}
              </p>
            </div>
            <template v-if="showNetPrices">
              <VehicleDetailAmountPill
                v-if="interiorColourPriceDelta > 0"
                :amount="toNet(interiorColourPriceDelta)"
              />
              <div
                v-else
                class="flex h-8 w-32 shrink-0 items-center justify-end rounded-lg bg-muted px-2.5 py-1 text-sm text-muted-foreground"
              >
                —
              </div>
              <VehicleDetailVatStub :label="vatSelectLabel" />
              <VehicleDetailAmountPill v-if="interiorColourPriceDelta > 0" :amount="interiorColourPriceDelta" />
              <VehicleDetailAmountPill v-else :amount="0" />
            </template>
            <VehicleDetailAmountPill v-else-if="interiorColourPriceDelta > 0" :amount="interiorColourPriceDelta" />
            <VehicleDetailAmountPill v-else :amount="0" />
          </div>

          <div
            v-if="selectedEquipment.length"
            class="space-y-2.5"
          >
            <p class="text-xs font-medium leading-none text-muted-foreground">
              Selected equipment
            </p>
            <div
              v-for="item in selectedEquipment"
              :key="item.id"
              class="flex flex-wrap items-center gap-2.5"
            >
              <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg bg-muted px-2.5 py-1">
                <p class="truncate text-sm leading-normal text-muted-foreground">{{ item.name }}</p>
              </div>
              <template v-if="showNetPrices">
                <VehicleDetailAmountPill :amount="toNet(item.price)" />
                <VehicleDetailVatStub :label="vatSelectLabel" />
                <VehicleDetailAmountPill :amount="Number(item.price)" />
              </template>
              <VehicleDetailAmountPill v-else :amount="Number(item.price)" />
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.promoCampaigns">
      <CollapsibleSection
        title="Promo and Campaigns"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.promoCampaigns"
        card-style
        @toggle="toggleSection('promoCampaigns')"
      >
        <div class="space-y-4">
          <section v-if="promos.length" class="space-y-2.5">
            <p class="text-sm font-normal text-muted-foreground">OEM promo</p>
            <div class="space-y-3">
              <PromoCard
                v-for="promo in promos"
                :key="promo.id"
                kind="oem"
                :checkbox-id="`promo-${promo.id}`"
                :selected="!!promoSelection[promo.id]"
                :disabled="disabledPromoIds.includes(promo.id)"
                :label="promo.label"
                :description="promo.description"
                :expires-at="promo.expiresAt || ''"
                :show-net-prices="showNetPrices"
                :vat-options="vatOptions"
                :modal-vat-rate-percent="Number(vatRatePercent)"
                :oem-percent="oemPercentForPromo(promo)"
                :oem-amount-gross="oemAmountGrossForPromo(promo)"
                :oem-amount-net="oemAmountNetForPromo(promo)"
                @toggle="(v) => emit('toggle-promo', promo.id, v)"
              />
            </div>
          </section>

          <section v-if="userCampaigns.length" class="space-y-2.5">
            <p class="text-xs font-medium text-muted-foreground">Dealer campaigns</p>
            <div class="space-y-3">
              <PromoCard
                v-for="c in userCampaigns"
                :key="c.id"
                kind="dealer"
                :checkbox-id="`campaign-${c.id}`"
                :selected="!!c.active"
                :label="c.description || 'Dealer campaign'"
                :description="c.description || ''"
                :expires-at="c.expiresAt || ''"
                :campaign="c"
                :show-net-prices="showNetPrices"
                :vat-options="vatOptions"
                :modal-vat-rate-percent="Number(vatRatePercent)"
                editable
                removable
                @toggle="(v) => emit('toggle-campaign-active', c.id, v)"
                @update:description="(t) => emit('update-campaign', c.id, { description: t })"
                @update:percent="(p) => emit('update-campaign', c.id, { percent: p })"
                @update:amount="(a) => emit('update-campaign', c.id, { amount: a })"
                @update:vat-rate-percent="(rate) => emit('update-campaign-vat', c.id, rate)"
                @remove="emit('remove-campaign', c.id)"
              />
            </div>
          </section>

          <div class="flex w-full flex-wrap items-center justify-start gap-2 py-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="rounded-md"
              @click="handleAddCampaign"
            >
              <Plus class="size-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.discounts">
      <CollapsibleSection
        v-if="userDiscounts.length === 0"
        title="Discounts"
        :title-class="collapsibleSectionTitleClass"
        static-header
        :show-chevron="false"
        card-style
        elevated
        header-class="!py-0 min-h-14"
      >
        <template #afterTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="ml-auto shrink-0 rounded-md font-medium"
            @click.stop="handleAddDiscount"
          >
            <Plus class="size-4 mr-1.5" />
            Add
          </Button>
        </template>
      </CollapsibleSection>

      <CollapsibleSection
        v-else
        title="Discounts"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.discounts"
        card-style
        elevated
        @toggle="toggleSection('discounts')"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2.5">
            <div
              v-for="d in userDiscounts"
              :key="d.id"
              class="flex flex-wrap items-center gap-2.5"
            >
              <Input
                type="text"
                :model-value="d.description || ''"
                placeholder="Item description"
                class="h-8 min-w-0 flex-1 bg-background border-border"
                @update:model-value="(v) => emit('update-discount', d.id, { description: String(v ?? '') })"
              />
              <div class="flex shrink-0 items-stretch">
                <div class="relative flex h-8 w-24 shrink-0 items-center rounded-l-lg border border-border bg-background">
                  <span
                    class="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground"
                    aria-hidden="true"
                  >
                    %
                  </span>
                  <Input
                    type="text"
                    inputmode="decimal"
                    :model-value="discountPercentInputValue(d)"
                    class="h-8 w-full min-w-0 border-0 bg-transparent pr-2.5 pl-7 text-right text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    @update:model-value="(v) => onDiscountPercentChange(d.id, v)"
                  />
                </div>
                <div class="relative -ml-px flex h-8 w-40 shrink-0 items-center rounded-r-lg border border-border bg-background">
                  <span
                    class="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground"
                    aria-hidden="true"
                  >
                    €
                  </span>
                  <Input
                    type="text"
                    inputmode="decimal"
                    :model-value="discountAmountInputValue(d)"
                    class="h-8 w-full min-w-0 border-0 bg-transparent pr-2.5 pl-7 text-right text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    @update:model-value="(v) => onDiscountAmountChange(d.id, v)"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="size-8 shrink-0 rounded-md"
                @click="emit('remove-discount', d.id)"
              >
                <Trash2 class="size-4" />
                <span class="sr-only">Remove discount</span>
              </Button>
            </div>
          </div>

          <div
            v-if="userDiscounts.length > 0"
            class="flex gap-2 py-1"
          >
            <Info class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p class="min-w-0 flex-1 text-xs leading-normal text-muted-foreground">
              The percentage discount is applied to the vehicle's price, net of applied promotions (excluding taxes and accessories).
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="rounded-md font-medium"
              @click="handleAddDiscount"
            >
              <Plus class="size-4 mr-1.5" />
              Add
            </Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.accessories">
      <CollapsibleSection
        v-if="!hasUserAccessoryLines"
        title="Accessories and services"
        :title-class="collapsibleSectionTitleClass"
        static-header
        :show-chevron="false"
        card-style
        elevated
        header-class="!py-0 min-h-14"
      >
        <template #afterTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="ml-auto shrink-0 rounded-md font-medium"
            @click.stop="handleAddAccessoryLine"
          >
            <Plus class="size-4 mr-1.5" />
            Add
          </Button>
        </template>
      </CollapsibleSection>

      <CollapsibleSection
        v-else
        title="Accessories and services"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.accessories"
        card-style
        elevated
        @toggle="toggleSection('accessories')"
      >
        <div class="flex flex-col gap-2.5">
          <div
            v-for="row in userAccessoryLines"
            :key="row.id"
            class="flex flex-wrap items-center gap-2.5"
          >
            <Input
              type="text"
              :model-value="row.description || ''"
              placeholder="Item description"
              class="h-8 min-w-0 flex-1 bg-background border-border"
              @update:model-value="(v) => emit('update-accessory-line', row.id, { description: String(v ?? '') })"
            />
            <div class="relative flex h-8 w-32 shrink-0 items-center rounded-lg border border-border bg-background">
              <span
                class="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground"
                aria-hidden="true"
              >
                €
              </span>
              <Input
                type="text"
                inputmode="decimal"
                :model-value="accessoryPriceInputValue(row)"
                class="h-8 w-full min-w-0 border-0 bg-transparent pr-2.5 pl-7 text-right text-sm text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                @update:model-value="(v) => onAccessoryPriceChange(row.id, v)"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-8 shrink-0 rounded-md"
              @click="emit('remove-accessory-line', row.id)"
            >
              <Trash2 class="size-4" />
              <span class="sr-only">Remove line</span>
            </Button>
          </div>

          <div class="flex flex-wrap gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              class="h-9 shrink-0 rounded-md px-4 font-medium"
              @click="handleAddAccessoryLine"
            >
              <Plus class="size-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.taxes">
      <CollapsibleSection
        title="Taxes and extra-costs"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.taxes"
        card-style
        @toggle="toggleSection('taxes')"
      >
      <div class="space-y-4">
        <QuotationTaxesTable
          :lines="taxExtraCostLines"
          :show-net-prices="showNetPrices"
          :vat-amount="vatAmount"
          :modal-vat-rate-percent="vatRatePercent"
          :vat-options="vatOptions"
          @add-line="emit('add-tax-line')"
          @remove-line="(id) => emit('remove-tax-line', id)"
          @update-line="(id, patch) => emit('update-tax-line', id, patch)"
        />
      </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.tradeIn">
      <CollapsibleSection
        title="Trade-in"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.tradeIn"
        card-style
        @toggle="toggleSection('tradeIn')"
      >
      <div
        class="rounded-md border border-border px-3 py-3 flex items-center justify-between gap-3"
      >
        <div class="min-w-0">
          <p class="text-sm font-medium text-foreground">
            {{ tradeInApplied ? 'Trade-in vehicle' : 'No trade-in attached' }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{
              tradeInApplied
                ? `Mock valuation applied to the offer (- ${formatCurrency(tradeInMockValue)}).`
                : 'Attach a trade-in to deduct its valuation from the grand total.'
            }}
          </p>
        </div>
        <Button
          v-if="!tradeInApplied"
          type="button"
          variant="outline"
          size="sm"
          class="rounded-md shrink-0"
          @click="emit('toggle-trade-in', true)"
        >
          <Plus class="size-4 mr-1" />
          Add trade-in
        </Button>
        <Button
          v-else
          type="button"
          variant="ghost"
          size="sm"
          class="rounded-md shrink-0"
          @click="emit('toggle-trade-in', false)"
        >
          Remove
        </Button>
      </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.purchaseMethod">
      <CollapsibleSection
        title="Purchase methods"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.purchaseMethod"
        card-style
        @toggle="toggleSection('purchaseMethod')"
      >
      <div class="outcome-toggle-group flex flex-wrap gap-3">
        <Toggle
          v-for="method in purchaseMethods"
          :key="method.id"
          variant="outline"
          class="outcome-toggle-item"
          :model-value="selectedPurchaseMethodId === method.id"
          @update:model-value="(p) => emit('select-purchase-method', p ? method.id : '')"
        >
          {{ method.label }}
        </Toggle>
      </div>
      </CollapsibleSection>
    </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick, watch } from 'vue'
import { Info, Plus, Trash2 } from 'lucide-vue-next'
import { Button, Input, Toggle } from '@motork/component-library/future/primitives'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'
import VehicleDetailAmountPill from '@/components/addnew/configurator/VehicleDetailAmountPill.vue'
import VehicleDetailVatStub from '@/components/addnew/configurator/VehicleDetailVatStub.vue'
import PromoCard from '@/components/addnew/configurator/PromoCard.vue'
import QuotationTaxesTable from '@/components/addnew/configurator/QuotationTaxesTable.vue'

const props = defineProps({
  vehicleLine: { type: String, default: '' },
  vehicleBaseTotal: { type: Number, default: 0 },
  colourLabel: { type: String, default: '' },
  colourPriceDelta: { type: Number, default: 0 },
  interiorColourLabel: { type: String, default: '' },
  interiorColourPriceDelta: { type: Number, default: 0 },
  selectedEquipment: { type: Array, default: () => [] },
  showNetPrices: { type: Boolean, default: false },
  vatRatePercent: { type: Number, default: 0 },
  promos: { type: Array, required: true },
  promoSelection: { type: Object, required: true },
  disabledPromoIds: { type: Array, default: () => [] },
  discountBaseGross: { type: Number, default: 0 },
  userCampaigns: { type: Array, default: () => [] },
  vatOptions: { type: Array, default: () => [] },
  userDiscounts: { type: Array, default: () => [] },
  userAccessoryLines: { type: Array, default: () => [] },
  taxExtraCostLines: { type: Array, required: true },
  vatAmount: { type: Number, default: 0 },
  tradeInApplied: { type: Boolean, default: false },
  tradeInMockValue: { type: Number, default: 0 },
  purchaseMethods: { type: Array, required: true },
  selectedPurchaseMethodId: { type: String, default: '' },
})

const emit = defineEmits([
  'toggle-promo',
  'add-discount',
  'update-discount',
  'remove-discount',
  'add-accessory-line',
  'update-accessory-line',
  'remove-accessory-line',
  'add-campaign',
  'update-campaign',
  'update-campaign-vat',
  'remove-campaign',
  'toggle-campaign-active',
  'toggle-trade-in',
  'select-purchase-method',
  'add-tax-line',
  'remove-tax-line',
  'update-tax-line',
])

const collapsibleSectionTitleClass = 'text-base font-semibold'

const vatSelectLabel = computed(() => {
  const p = Number(props.vatRatePercent)
  if (!Number.isFinite(p) || p <= 0) return '0% VAT'
  const label = Number.isInteger(p) ? String(p) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `${label}% VAT`
})

const hasUserAccessoryLines = computed(() => props.userAccessoryLines.length > 0)

watch(hasUserAccessoryLines, (next, prev) => {
  if (!next) open.accessories = false
  else if (next && !prev) open.accessories = true
})

const sectionKeys = [
  'vehicleDetails',
  'promoCampaigns',
  'discounts',
  'accessories',
  'taxes',
  'tradeIn',
  'purchaseMethod',
]

const sectionEls = {
  vehicleDetails: ref(null),
  promoCampaigns: ref(null),
  discounts: ref(null),
  accessories: ref(null),
  taxes: ref(null),
  tradeIn: ref(null),
  purchaseMethod: ref(null),
}

const open = reactive({
  vehicleDetails: true,
  promoCampaigns: false,
  discounts: false,
  accessories: false,
  taxes: false,
  tradeIn: false,
  purchaseMethod: false,
})

function toggleSection(key) {
  open[key] = !open[key]
}

const noneExpanded = computed(() => sectionKeys.every((key) => open[key] === false))

function toggleAll() {
  const next = noneExpanded.value
  for (const key of sectionKeys) {
    open[key] = next
  }
}

async function openSection(key) {
  if (!key || !(key in open)) return
  open[key] = true
  await nextTick()
  sectionEls[key]?.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
}

function addDiscountFromSearch(payload) {
  emit('add-discount', {
    description: String(payload?.description || '').trim() || 'Discount',
    percent: Number(payload?.percent) || 0,
    amount: Number(payload?.amount) || 0,
  })
  openSection('discounts')
}

function addCampaignFromSearch(payload) {
  emit('add-campaign', {
    description: String(payload?.description || '').trim() || 'Campaign',
    percent: Number(payload?.percent) || 0,
    amount: Number(payload?.amount) || 0,
  })
  openSection('promoCampaigns')
}

function addAccessoryFromSearch(payload) {
  emit('add-accessory-line', {
    description: String(payload?.description || '').trim(),
    price: Math.max(0, Number(payload?.price) || 0),
  })
  openSection('accessories')
}

function handleAddAccessoryLine() {
  emit('add-accessory-line', { description: '', price: 0 })
  open.accessories = true
}

function accessoryPriceInputValue(row) {
  const n = displayValue(Number(row?.price || 0))
  if (!Number.isFinite(n)) return '0'
  if (n === 0) return '0'
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function onAccessoryPriceChange(id, raw) {
  const n = parseDecimalInput(raw)
  if (!Number.isFinite(n) || n < 0) {
    emit('update-accessory-line', id, { price: 0 })
    return
  }
  const rate = Number(props.vatRatePercent || 0) / 100
  const gross = props.showNetPrices && rate > 0 ? n * (1 + rate) : n
  emit('update-accessory-line', id, { price: gross })
}

function parseDecimalInput(raw) {
  const s = String(raw ?? '').trim().replace(/\s/g, '').replace(',', '.')
  if (s === '' || s === '-' || s === '.' || s === '-.') return NaN
  return Number(s)
}

function discountPercentInputValue(d) {
  const p = Math.abs(Number(d?.percent || 0))
  if (!Number.isFinite(p) || p === 0) return '0'
  return String(p)
}

function discountAmountInputValue(d) {
  const raw = props.showNetPrices
    ? Number(d?.netAmount ?? d?.amount ?? 0)
    : Number(d?.grossAmount ?? d?.amount ?? 0)
  const abs = Math.abs(Number.isFinite(raw) ? raw : 0)
  if (abs === 0) return '0'
  return String(abs)
}

function onDiscountPercentChange(id, raw) {
  const n = parseDecimalInput(raw)
  if (!Number.isFinite(n) || n < 0) {
    emit('update-discount', id, { percent: 0 })
    return
  }
  emit('update-discount', id, { percent: n })
}

function onDiscountAmountChange(id, raw) {
  const n = parseDecimalInput(raw)
  if (!Number.isFinite(n) || n < 0) {
    emit('update-discount', id, { amount: 0 })
    return
  }
  emit('update-discount', id, { amount: n })
}

function handleAddDiscount() {
  emit('add-discount', {
    description: '',
    percent: 0,
    amount: 0,
  })
  open.discounts = true
}

function handleAddCampaign() {
  emit('add-campaign', {
    description: '',
    percent: 0,
    amount: 0,
  })
}

function oemPercentForPromo(promo) {
  const p = promo
  if (!p) return 0
  if (p.discountType === 'percent') return -Math.abs(Number(p.discountPercent))
  const base = Number(props.discountBaseGross)
  const amt = Math.abs(Number(p.amount || 0))
  if (!Number.isFinite(amt) || amt === 0 || !Number.isFinite(base) || base <= 0) return 0
  return -(amt / base) * 100
}

function oemAmountGrossForPromo(promo) {
  const p = promo
  if (!p) return 0
  if (p.discountType === 'percent') {
    const base = Number(props.discountBaseGross)
    const pct = Math.abs(Number(p.discountPercent))
    if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(pct)) return 0
    return -Math.abs((base * pct) / 100)
  }
  const amt = Number(p.amount || 0)
  return Number.isFinite(amt) ? -Math.abs(amt) : 0
}

function oemAmountNetForPromo(promo) {
  const g = oemAmountGrossForPromo(promo)
  if (!Number.isFinite(g) || g === 0) return 0
  return -Math.abs(toNet(Math.abs(g)))
}

function toNet(grossValue) {
  const gross = Number(grossValue)
  if (!Number.isFinite(gross)) return 0
  const rate = Number(props.vatRatePercent || 0) / 100
  if (rate <= 0) return gross
  return gross / (1 + rate)
}

function displayValue(value) {
  return props.showNetPrices ? toNet(value) : Number(value)
}

function formatCurrency(value) {
  const n = displayValue(value)
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`
}

defineExpose({ openSection, addDiscountFromSearch, addCampaignFromSearch, addAccessoryFromSearch })
</script>
