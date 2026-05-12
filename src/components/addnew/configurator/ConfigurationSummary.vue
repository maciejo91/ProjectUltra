<template>
  <div class="rounded-lg border border-border bg-background shadow-mk-dashboard-card overflow-hidden">
    <div class="p-4 space-y-3">
      <span
        class="inline-flex w-fit shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-sm font-normal leading-5 text-foreground"
        :class="conditionBadgeClass"
      >
        {{ CONDITION_LABEL }}
      </span>
      <div>
        <p class="text-base leading-none font-semibold text-foreground">{{ brandLabel }}</p>
        <p class="text-base font-semibold text-foreground">{{ modelTitle }}</p>
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
          <span class="text-foreground">{{ formatCurrency(vehicleBasePrice) }}</span>
        </div>
        <div v-if="equipmentTotal > 0" class="flex items-center justify-between">
          <span class="text-muted-foreground">Equipment</span>
          <span class="text-foreground">{{ formatCurrency(equipmentTotal) }}</span>
        </div>
        <div v-if="accessoriesTotal > 0" class="flex items-center justify-between">
          <span class="text-muted-foreground">Accessories</span>
          <span class="text-foreground">{{ formatCurrency(accessoriesTotal) }}</span>
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

        <div class="border-t border-border" aria-hidden="true" />

        <div class="flex items-center justify-between">
          <span class="text-muted-foreground">Taxes and extra costs</span>
          <span class="text-foreground">{{ formatCurrency(taxesTotal) }}</span>
        </div>
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
            <span class="text-sm font-normal text-muted-foreground">{{ vatSummaryLabel }}</span>
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
            <span class="text-sm font-normal text-muted-foreground">{{ vatSummaryLabel }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowDown, RotateCcw } from 'lucide-vue-next'
import { Button, Input } from '@motork/component-library/future/primitives'
import { getVehicleConditionBadgeClass } from '@/utils/vehicleHelpers'

const props = defineProps({
  brandLabel: { type: String, default: '' },
  modelTitle: { type: String, default: '' },
  versionName: { type: String, default: '' },
  colourName: { type: String, default: '' },
  interiorColourName: { type: String, default: '' },
  colourHex: { type: String, default: '' },
  configuredImageUrl: { type: String, default: '' },
  vehicleBasePrice: { type: Number, default: 0 },
  equipmentTotal: { type: Number, default: 0 },
  accessoriesTotal: { type: Number, default: 0 },
  promoTotal: { type: Number, default: 0 },
  discountsTotal: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  taxesTotal: { type: Number, default: 0 },
  tradeInValue: { type: Number, default: 0 },
  grandTotalRaw: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  showNetPrices: { type: Boolean, default: false },
  roundPriceApplied: { type: Boolean, default: false },
  roundPriceAdjustment: { type: Number, default: 0 },
})

const emit = defineEmits(['toggle-round-price', 'update-round-price-adjustment', 'reset-round-price'])

const CONDITION_LABEL = 'New'
const conditionBadgeClass = computed(() => getVehicleConditionBadgeClass(CONDITION_LABEL))
const vatSummaryLabel = computed(() => (props.showNetPrices ? 'VAT excl.' : 'VAT incl.'))
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
