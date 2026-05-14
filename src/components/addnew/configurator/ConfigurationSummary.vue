<template>
  <div class="rounded-lg border border-border bg-background shadow-mk-dashboard-card overflow-hidden">
    <div class="p-4 space-y-3">
      <span
        class="inline-flex w-fit shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-sm font-normal leading-5 text-foreground"
        :class="conditionBadgeClass"
      >
        {{ conditionBadgeLabel }}
      </span>
      <div>
        <p class="text-base leading-none font-semibold text-foreground">{{ brandLabel }}</p>
        <p class="text-base font-semibold text-foreground">{{ modelTitle }}</p>
        <template v-if="hideVersionColourSection">
          <p v-if="versionName" class="text-sm text-muted-foreground pt-0.5">{{ versionName }}</p>
          <div v-if="plateLabel || vinLabel" class="flex min-w-0 flex-wrap items-center gap-2 pt-2">
            <span
              v-if="plateLabel"
              class="inline-flex max-w-full items-center gap-1 overflow-hidden rounded-sm border border-border bg-background px-2 py-0.5 text-sm text-muted-foreground"
            >
              {{ plateLabel }}
            </span>
            <span
              v-if="vinLabel"
              class="inline-flex min-w-0 max-w-full items-center overflow-hidden rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-sm text-muted-foreground"
            >
              <span class="truncate">{{ vinLabel }}</span>
            </span>
          </div>
        </template>
        <template v-else>
          <p v-if="versionName" class="text-sm text-muted-foreground">{{ versionName }}</p>
          <p v-else class="text-sm text-muted-foreground italic">Select a version</p>
          <div class="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
            <span
              class="size-3 rounded-full border border-border"
              :style="colourSwatchStyle"
              aria-hidden="true"
            />
            <span v-if="colourName">{{ colourName }}</span>
            <span v-else class="italic">Select a colour</span>
          </div>
        </template>
      </div>
    </div>

    <div class="px-4 pb-4">
      <div class="aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
        <img
          v-if="configuredImageUrl"
          :src="configuredImageUrl"
          alt=""
          class="h-full w-full object-cover"
          loading="lazy"
          @error="onVehicleImageError"
        />
      </div>
    </div>

    <div class="p-4 space-y-3">
      <p class="text-base font-semibold text-foreground">Offer summary</p>
      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Vehicle</span>
          <span class="text-foreground">{{ formatCurrency(vehicleDisplayPrice) }}</span>
        </div>
        <div v-if="equipmentTotal > 0" class="flex items-center justify-between">
          <span class="text-muted-foreground">Equipment</span>
          <span class="text-foreground">{{ formatCurrency(equipmentTotal) }}</span>
        </div>
        <div v-if="promoTotal > 0" class="flex items-center justify-between">
          <span class="text-muted-foreground">Promo</span>
          <span class="text-foreground">- {{ formatCurrency(promoTotal) }}</span>
        </div>
        <div v-if="discountsTotal > 0" class="flex items-center justify-between">
          <span class="text-muted-foreground">Discounts</span>
          <span class="text-foreground">- {{ formatCurrency(discountsTotal) }}</span>
        </div>

        <div class="flex items-center justify-between pt-1 font-semibold border-t border-border mt-2">
          <span class="text-foreground pt-2">Subtotal</span>
          <span class="text-foreground pt-2">{{ formatCurrency(subtotal) }}</span>
        </div>
        <div
          v-if="accessoriesTotal > 0"
          class="flex items-center justify-between border-t border-border pt-2 mt-2"
        >
          <span class="text-muted-foreground">Accessories and services</span>
          <span class="text-foreground">{{ formatCurrency(accessoriesTotal) }}</span>
        </div>

        <div
          class="flex items-center justify-between"
          :class="accessoriesTotal <= 0 ? 'border-t border-border pt-2 mt-2' : ''"
        >
          <span class="text-muted-foreground">Taxes and extra costs</span>
          <span class="text-foreground">{{ formatCurrency(taxesRowDisplay) }}</span>
        </div>
        <template v-if="isNetPricesView">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{
              t('forms.addNew.leadDetails.vehicle.quotation.offerSummaryTaxBreakdownTotalNet')
            }}</span>
            <span class="text-foreground">{{ formatCurrency(offerSummaryTaxBreakdownNet) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{
              t('forms.addNew.leadDetails.vehicle.quotation.offerSummaryTaxBreakdownTotalVat', {
                percent: vatPercentLabel,
              })
            }}</span>
            <span class="text-foreground">{{ formatCurrency(offerSummaryTaxBreakdownVat) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">{{
              t('forms.addNew.leadDetails.vehicle.quotation.offerSummaryTaxBreakdownTotalGross')
            }}</span>
            <span class="text-foreground">{{ formatCurrency(offerSummaryTaxBreakdownGross) }}</span>
          </div>
        </template>
        <div v-if="tradeInValue > 0" class="flex items-center justify-between">
          <span class="text-muted-foreground">Trade-in</span>
          <span class="text-foreground">- {{ formatCurrency(tradeInValue) }}</span>
        </div>

      </div>

      <div v-if="!roundPriceApplied" class="border-t border-border pt-3 space-y-3">
        <div class="flex items-start justify-between gap-4 text-base font-semibold">
          <span class="text-foreground">Grand total</span>
          <span class="flex flex-col items-end text-foreground">
            <span>{{ formatCurrency(grandTotal) }}</span>
            <span class="text-sm font-normal text-muted-foreground">{{
              t('forms.addNew.leadDetails.vehicle.quotation.offerSummaryGrandTotalVatIncl')
            }}</span>
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          class="rounded-md w-fit justify-start"
          @click="$emit('toggle-round-price')"
        >
          <ArrowDown class="size-4 mr-2" />
          Round price
        </Button>
      </div>

      <div v-else class="border-t border-border pt-3">
        <div class="grid grid-cols-2 items-start gap-x-4 gap-y-3">
          <span class="text-base font-semibold text-foreground">Grand total</span>
          <span class="justify-self-end text-base text-muted-foreground line-through">
            {{ formatCurrency(grandTotalRaw) }}
          </span>

          <div class="flex h-full items-end justify-start gap-2">
            <div class="relative w-28">
              <span
                class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                aria-hidden="true"
              >
                €
              </span>
              <Input
                :model-value="roundPriceAdjustmentInput"
                type="text"
                inputmode="decimal"
                class="h-9 rounded-md pl-8 pr-3 text-right"
                aria-label="Rounded price adjustment"
                @update:model-value="handleRoundPriceAdjustmentInput"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              class="rounded-md"
              aria-label="Reset rounded price"
              @click="$emit('reset-round-price')"
            >
              <RotateCcw class="size-4" />
            </Button>
          </div>

          <span class="flex flex-col items-end text-base font-semibold text-foreground">
            <span>{{ formatCurrency(grandTotal) }}</span>
            <span class="text-sm font-normal text-muted-foreground">{{
              t('forms.addNew.leadDetails.vehicle.quotation.offerSummaryGrandTotalVatIncl')
            }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, RotateCcw } from 'lucide-vue-next'
import { Button, Input } from '@motork/component-library/future/primitives'
import { getVehicleConditionBadgeClass } from '@/utils/vehicleHelpers'

const { t } = useI18n()

const props = defineProps({
  brandLabel: { type: String, default: '' },
  modelTitle: { type: String, default: '' },
  versionName: { type: String, default: '' },
  colourName: { type: String, default: '' },
  interiorColourName: { type: String, default: '' },
  colourHex: { type: String, default: '' },
  configuredImageUrl: { type: String, default: '' },
  /** Vehicle row amount: net when showNetPrices, gross otherwise (single source for offer summary row 1). */
  vehicleDisplayPrice: { type: Number, default: 0 },
  equipmentTotal: { type: Number, default: 0 },
  accessoriesTotal: { type: Number, default: 0 },
  promoTotal: { type: Number, default: 0 },
  discountsTotal: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  /** Gross sum for “Taxes and extra costs” when Show net prices is off. */
  taxesTotal: { type: Number, default: 0 },
  /** Net sum of extra-cost lines when Show net prices is on. */
  taxesTotalNet: { type: Number, default: 0 },
  tradeInValue: { type: Number, default: 0 },
  grandTotalRaw: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  offerSummaryTaxBreakdownNet: { type: Number, default: 0 },
  offerSummaryTaxBreakdownVat: { type: Number, default: 0 },
  offerSummaryTaxBreakdownGross: { type: Number, default: 0 },
  /** VAT % for “Total VAT (x%)” label (modal catalog rate). */
  vatRatePercent: { type: Number, default: 0 },
  showNetPrices: { type: Boolean, default: false },
  roundPriceApplied: { type: Boolean, default: false },
  roundPriceAdjustment: { type: Number, default: 0 },
  /** When set, overrides default factory-order “New” badge (e.g. inventory Used/New). */
  conditionLabel: { type: String, default: '' },
  /** Stock / simplified header: hide version + colour row; optional subtitle uses `versionName`; show plate/VIN chips. */
  hideVersionColourSection: { type: Boolean, default: false },
  plateLabel: { type: String, default: '' },
  vinLabel: { type: String, default: '' },
})

const emit = defineEmits(['toggle-round-price', 'update-round-price-adjustment', 'reset-round-price'])

const conditionBadgeLabel = computed(() => {
  const s = String(props.conditionLabel || '').trim()
  return s || 'New'
})
const conditionBadgeClass = computed(() => getVehicleConditionBadgeClass(conditionBadgeLabel.value))

/** Strict net view (boolean or rare string/number coercion from bindings). */
const isNetPricesView = computed(() => {
  const v = props.showNetPrices
  return v === true || v === 1 || v === 'true' || v === '1'
})

const taxesRowDisplay = computed(() =>
  isNetPricesView.value ? props.taxesTotalNet : props.taxesTotal,
)

const vatPercentLabel = computed(() => {
  const n = Number(props.vatRatePercent)
  if (!Number.isFinite(n) || n <= 0) return '0'
  const rounded = Math.round(n * 100) / 100
  if (Math.abs(rounded - Math.round(rounded)) < 1e-9) return String(Math.round(rounded))
  return String(rounded)
})
const roundPriceAdjustmentInput = ref(formatAdjustmentInput(props.roundPriceAdjustment))

const colourSwatchStyle = computed(() => {
  if (!props.colourHex) return { backgroundColor: 'var(--muted)' }
  return { backgroundColor: props.colourHex }
})

function onVehicleImageError(e) {
  const img = e?.target
  if (!img) return
  const fallback = '/vehicle-placeholder.svg'
  const current = String(img.getAttribute?.('src') || '')
  if (current === fallback) return
  img.setAttribute?.('src', fallback)
}

function formatCurrency(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`
}

function formatAdjustmentInput(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0,00'
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseAdjustmentInput(value) {
  const normalized = String(value ?? '').trim().replace(/\s/g, '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}

function handleRoundPriceAdjustmentInput(value) {
  roundPriceAdjustmentInput.value = String(value ?? '')
  emit('update-round-price-adjustment', parseAdjustmentInput(value))
}

watch(
  () => props.roundPriceAdjustment,
  (value) => {
    roundPriceAdjustmentInput.value = formatAdjustmentInput(value)
  }
)
</script>
