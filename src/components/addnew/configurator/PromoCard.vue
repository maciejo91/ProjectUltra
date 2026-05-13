<template>
  <!-- Dealer campaign: single card, Figma row (checkbox + description + info + %/€ [+ net] + trash) -->
  <div
    v-if="isDealerLayout"
    class="w-full rounded-md border p-4"
    :class="[
      selected ? 'border-primary bg-background' : 'border-border bg-background',
    ]"
  >
    <div
      v-if="showNetPrices"
      class="mb-2.5 flex w-full flex-wrap justify-end gap-2.5"
    >
      <span class="w-60 min-w-0 text-xs leading-none text-muted-foreground">Net discount</span>
      <span class="w-40 shrink-0 text-xs leading-none text-muted-foreground">VAT (%)</span>
      <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">
        Discount VAT incl.
      </span>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
      <Checkbox
        :id="checkboxId"
        :model-value="selected"
        :disabled="checkboxDisabled"
        class="mt-0.5 shrink-0 self-start sm:mt-0 sm:self-center"
        @update:model-value="(v) => emit('toggle', v)"
      />

      <div class="flex min-w-0 flex-1 items-center gap-2">
        <Input
          :id="dealerDescriptionInputId"
          :model-value="dealerDescription"
          type="text"
          :disabled="!selected || checkboxDisabled"
          placeholder="Item description"
          class="h-8 min-w-0 flex-1 text-sm shadow-none focus-visible:ring-0"
          :class="dealerDescriptionFieldClass"
          @update:model-value="onDealerDescriptionInput"
        />
        <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                class="inline-flex shrink-0 rounded-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                :aria-label="promoInfoAriaLabel"
                @click.stop
              >
                <Info class="size-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              class="max-w-sm rounded-md border border-border bg-background p-4 text-foreground shadow-md"
            >
              <div class="flex w-full flex-col gap-2 text-balance">
                <p class="text-base font-semibold leading-normal text-foreground">{{ label }}</p>
                <p
                  v-if="formattedExpiresAt"
                  class="text-sm font-normal leading-normal text-muted-foreground"
                >
                  Expires {{ formattedExpiresAt }}
                </p>
                <p
                  v-if="showDetailsSection"
                  class="text-sm font-normal leading-normal text-foreground"
                >
                  {{ infoDetailsText }}
                </p>
              </div>
            </TooltipContent>
        </Tooltip>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2 sm:ml-auto sm:shrink-0">
        <div
          class="flex h-8 shrink-0 overflow-hidden rounded-lg border"
          :class="dealerBidirectionalOuterClass"
        >
          <div
            class="relative w-24 min-w-0 shrink-0 border-r px-2.5 pl-7"
            :class="dealerMutedFields ? 'border-border bg-muted' : 'border-input bg-background'"
          >
            <template v-if="editable">
              <Input
                :model-value="dealerPercentInput"
                type="number"
                step="any"
                :disabled="!selected || checkboxDisabled"
                class="h-7 min-w-0 border-0 bg-transparent p-0 text-right text-sm shadow-none focus-visible:ring-0"
                :class="dealerBidirectionalInputTextClass"
                @update:model-value="onDealerPercentInput"
              />
            </template>
            <template v-else>
              <TruncatingTooltip :text="formatPercent(percentValue)" wrapper-class="min-w-0 flex-1">
                <p class="min-w-0 flex-1 truncate py-1 text-right text-sm text-muted-foreground">
                  {{ formatPercent(percentValue) }}
                </p>
              </TruncatingTooltip>
            </template>
            <span
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            >
              %
            </span>
          </div>
          <div
            class="relative w-40 min-w-0 shrink-0 px-2.5 pl-7"
            :class="dealerMutedFields ? 'bg-muted' : 'bg-background'"
          >
            <template v-if="editable">
              <Input
                :model-value="dealerAmountInput"
                type="number"
                step="any"
                min="0"
                :disabled="!selected || checkboxDisabled"
                class="h-7 min-w-0 border-0 bg-transparent p-0 text-right text-sm shadow-none focus-visible:ring-0"
                :class="dealerBidirectionalInputTextClass"
                @update:model-value="onDealerAmountInput"
              />
            </template>
            <template v-else>
              <TruncatingTooltip :text="formatMoney(pairedDiscountAmount)" wrapper-class="min-w-0 flex-1">
                <p class="min-w-0 flex-1 truncate py-1 text-right text-sm text-muted-foreground">
                  {{ formatMoney(pairedDiscountAmount) }}
                </p>
              </TruncatingTooltip>
            </template>
            <span
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
            >
              €
            </span>
          </div>
        </div>

        <template v-if="showNetPrices">
          <template v-if="editable && campaign">
            <TruncatingCatalogSelect
              select-class="w-40 shrink-0"
              :model-value="String(selectVatPercent)"
              :display-label="promoVatSelectDisplayLabel"
              :options="promoVatSelectOptions"
              :disabled="!selected || checkboxDisabled"
              trigger-class="flex h-8 min-w-0 w-full shrink-0 items-center justify-between gap-1.5 overflow-hidden rounded-lg border border-input bg-background px-2.5 py-2 text-sm text-foreground shadow-none"
              @update:model-value="(v) => emit('update:vatRatePercent', Number(v))"
            />
            <QuotationReadOnlyAmount
              class="shrink-0"
              width-class="w-32 shrink-0"
              :amount="grossDiscountValue"
            />
          </template>
          <template v-else>
            <TruncatingTooltip :text="vatSelectLabelComputed" wrapper-class="w-40 shrink-0 min-w-0">
              <VehicleDetailVatStub :label="vatSelectLabelComputed" />
            </TruncatingTooltip>
            <QuotationReadOnlyAmount
              class="shrink-0"
              width-class="w-32 shrink-0"
              :amount="grossDiscountValue"
            />
          </template>
        </template>

        <Button
          v-if="removable"
          type="button"
          variant="ghost"
          size="icon-sm"
          class="shrink-0 rounded-md"
          @click="emit('remove')"
        >
          <Trash2 class="size-4" />
          <span class="sr-only">Remove campaign</span>
        </Button>
      </div>
    </div>
  </div>

  <!-- OEM promo -->
  <div
    v-else
    class="flex w-full flex-col gap-4 sm:flex-row sm:items-start"
  >
    <div
      class="flex min-w-0 flex-1 flex-wrap items-center gap-4 rounded-md border p-4 lg:gap-8"
      :class="[
        selected ? 'border-primary bg-background' : 'border-border bg-background',
        isDisabledUi ? 'opacity-60' : '',
      ]"
    >
      <div class="flex min-w-0 flex-1 items-center gap-2">
        <Checkbox
          :id="checkboxId"
          :model-value="selected"
          :disabled="checkboxDisabled"
          class="mt-1 shrink-0"
          @update:model-value="(v) => emit('toggle', v)"
        />
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <label
            :for="checkboxId"
            class="min-w-0 flex-1 cursor-pointer"
            :class="checkboxDisabled ? 'cursor-default' : ''"
          >
            <TruncatingTooltip :text="label" wrapper-class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium leading-none text-foreground">{{ label }}</span>
            </TruncatingTooltip>
          </label>
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                class="inline-flex shrink-0 rounded-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                :aria-label="promoInfoAriaLabel"
                @click.stop
              >
                <Info class="size-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              align="start"
              class="max-w-sm rounded-md border border-border bg-background p-4 text-foreground shadow-md"
            >
              <div class="flex w-full flex-col gap-2 text-balance">
                <p class="text-base font-semibold leading-normal text-foreground">{{ label }}</p>
                <p
                  v-if="formattedExpiresAt"
                  class="text-sm font-normal leading-normal text-muted-foreground"
                >
                  Expires {{ formattedExpiresAt }}
                </p>
                <p
                  v-if="showDetailsSection"
                  class="text-sm font-normal leading-normal text-foreground"
                >
                  {{ infoDetailsText }}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div class="flex w-full flex-col gap-2.5 sm:w-auto sm:shrink-0 sm:items-end">
        <div
          v-if="showNetPrices"
          class="flex w-full flex-wrap justify-end gap-2.5"
        >
          <span class="w-60 min-w-0 text-xs leading-none text-muted-foreground">Net discount</span>
          <span class="w-40 shrink-0 text-xs leading-none text-muted-foreground">VAT (%)</span>
          <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">
            Discount VAT incl.
          </span>
        </div>

        <div class="flex w-full flex-wrap items-center justify-end gap-2.5">
          <div class="flex shrink-0 flex-wrap items-center justify-end gap-2.5">
            <div class="flex shrink-0 items-center">
              <template v-if="editable">
                <div class="relative w-24">
                  <div
                    class="flex h-8 items-center rounded-l-lg border border-r-0 border-border bg-muted px-2.5 pl-7"
                  >
                    <Input
                      :model-value="dealerPercentInput"
                      type="number"
                      step="any"
                      class="h-7 min-w-0 border-0 bg-transparent p-0 text-right text-sm text-muted-foreground shadow-none focus-visible:ring-0"
                      @update:model-value="onDealerPercentInput"
                    />
                  </div>
                  <span
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    %
                  </span>
                </div>
                <div class="relative w-40">
                  <div class="flex h-8 items-center rounded-r-lg border border-border bg-muted px-2.5 pl-7">
                    <Input
                      :model-value="dealerAmountInput"
                      type="number"
                      step="any"
                      min="0"
                      class="h-7 min-w-0 border-0 bg-transparent p-0 text-right text-sm text-muted-foreground shadow-none focus-visible:ring-0"
                      @update:model-value="onDealerAmountInput"
                    />
                  </div>
                  <span
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    €
                  </span>
                </div>
              </template>
              <template v-else>
                <div class="relative w-24">
                  <div
                    class="flex h-8 items-center rounded-l-lg border border-r-0 border-border bg-muted px-2.5 py-1 pl-7"
                  >
                    <TruncatingTooltip :text="formatPercent(percentValue)" wrapper-class="min-w-0 flex-1">
                      <p class="min-w-0 flex-1 truncate text-right text-sm text-muted-foreground">
                        {{ formatPercent(percentValue) }}
                      </p>
                    </TruncatingTooltip>
                  </div>
                  <span
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    %
                  </span>
                </div>
                <div class="relative w-40">
                  <div class="flex h-8 items-center rounded-r-lg border border-border bg-muted px-2.5 py-1 pl-7">
                    <TruncatingTooltip :text="formatMoney(pairedDiscountAmount)" wrapper-class="min-w-0 flex-1">
                      <p class="min-w-0 flex-1 truncate text-right text-sm text-muted-foreground">
                        {{ formatMoney(pairedDiscountAmount) }}
                      </p>
                    </TruncatingTooltip>
                  </div>
                  <span
                    class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  >
                    €
                  </span>
                </div>
              </template>
            </div>

            <template v-if="showNetPrices">
              <template v-if="editable && campaign">
                <TruncatingCatalogSelect
                  select-class="w-40 shrink-0"
                  :model-value="String(selectVatPercent)"
                  :display-label="promoVatSelectDisplayLabel"
                  :options="promoVatSelectOptions"
                  trigger-class="flex h-8 min-w-0 w-full shrink-0 items-center justify-between gap-1.5 overflow-hidden rounded-lg border border-input bg-background px-2.5 py-2 text-sm text-foreground shadow-none"
                  @update:model-value="(v) => emit('update:vatRatePercent', Number(v))"
                />
                <QuotationReadOnlyAmount
                  class="shrink-0"
                  width-class="w-32 shrink-0"
                  :amount="grossDiscountValue"
                />
              </template>
              <template v-else>
                <TruncatingTooltip :text="vatSelectLabelComputed" wrapper-class="w-40 shrink-0 min-w-0">
                  <VehicleDetailVatStub :label="vatSelectLabelComputed" />
                </TruncatingTooltip>
                <QuotationReadOnlyAmount
                  class="shrink-0"
                  width-class="w-32 shrink-0"
                  :amount="grossDiscountValue"
                />
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Info, Trash2 } from 'lucide-vue-next'
import {
  Button,
  Checkbox,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@motork/component-library/future/primitives'
import QuotationReadOnlyAmount from '@/components/addnew/configurator/QuotationReadOnlyAmount.vue'
import VehicleDetailVatStub from '@/components/addnew/configurator/VehicleDetailVatStub.vue'
import TruncatingCatalogSelect from '@/components/shared/TruncatingCatalogSelect.vue'
import TruncatingTooltip from '@/components/shared/TruncatingTooltip.vue'

const props = defineProps({
  kind: { type: String, required: true },
  checkboxId: { type: String, required: true },
  selected: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' },
  description: { type: String, default: '' },
  editable: { type: Boolean, default: false },
  removable: { type: Boolean, default: false },
  showNetPrices: { type: Boolean, default: false },
  vatOptions: { type: Array, default: () => [] },
  oemPercent: { type: Number, default: 0 },
  oemAmountGross: { type: Number, default: 0 },
  oemAmountNet: { type: Number, default: 0 },
  modalVatRatePercent: { type: Number, default: 0 },
  campaign: { type: Object, default: null },
  /** ISO date string (e.g. 2026-06-30); shown in info tooltip when valid */
  expiresAt: { type: String, default: '' },
})

const emit = defineEmits([
  'toggle',
  'remove',
  'update:percent',
  'update:amount',
  'update:vatRatePercent',
  'update:description',
])

const isDealerLayout = computed(() => props.removable && props.kind === 'dealer')

const infoDetailsText = computed(() => {
  const fromProp = String(props.description || '').trim()
  if (fromProp) return fromProp
  const notes = props.campaign && String(props.campaign.notes || '').trim()
  return notes || ''
})

const showDetailsSection = computed(() => {
  const d = infoDetailsText.value
  if (!d) return false
  return d !== String(props.label || '').trim()
})

function formatExpiresAtDisplay(iso) {
  const s = String(iso || '').trim()
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d)
}

const formattedExpiresAt = computed(() => {
  const fromProp = formatExpiresAtDisplay(props.expiresAt)
  if (fromProp) return fromProp
  const c = props.campaign
  if (c && c.expiresAt) return formatExpiresAtDisplay(String(c.expiresAt))
  return ''
})

const promoInfoAriaLabel = computed(() => {
  const name = String(props.label || '').trim()
  return name ? `More about ${name}` : 'Promo details'
})

const dealerDescriptionInputId = computed(() => `${props.checkboxId}-description`)

const dealerDescription = computed(() => String(props.campaign?.description ?? props.label ?? ''))

const dealerMutedFields = computed(() => !props.selected)

const dealerDescriptionFieldClass = computed(() =>
  dealerMutedFields.value
    ? 'rounded-lg border-0 bg-muted px-2.5 text-muted-foreground'
    : 'rounded-lg border border-input bg-background px-2.5 text-foreground'
)

const dealerBidirectionalOuterClass = computed(() =>
  dealerMutedFields.value ? 'border-border' : 'border-input'
)

const dealerBidirectionalInputTextClass = computed(() =>
  dealerMutedFields.value ? 'text-muted-foreground' : 'text-foreground'
)

const isDisabledUi = computed(() => props.kind === 'oem' && props.disabled)
const checkboxDisabled = computed(() => props.kind === 'oem' && props.disabled)

const percentValue = computed(() => {
  if (props.kind === 'oem') return props.oemPercent
  const p = Number(props.campaign?.percent)
  return Number.isFinite(p) ? p : 0
})

const pairedDiscountAmount = computed(() => {
  if (props.kind === 'oem') {
    return props.showNetPrices ? props.oemAmountNet : props.oemAmountGross
  }
  if (!props.campaign) return 0
  if (props.showNetPrices) {
    return Number(props.campaign.netAmount ?? props.campaign.amount ?? 0)
  }
  return Number(props.campaign.grossAmount ?? props.campaign.amount ?? 0)
})

const grossDiscountValue = computed(() => {
  if (props.kind === 'oem') return props.oemAmountGross
  if (!props.campaign) return 0
  return Number(props.campaign.grossAmount ?? props.campaign.amount ?? 0)
})

const selectVatPercent = computed(() => {
  if (props.campaign) return Number(props.campaign.vatRatePercent)
  return Number(props.modalVatRatePercent)
})

const vatSelectLabelComputed = computed(() => {
  const p = Number(
    props.kind === 'oem' ? props.modalVatRatePercent : props.campaign?.vatRatePercent ?? 0
  )
  if (!Number.isFinite(p) || p <= 0) return '0% VAT'
  return `${Number.isInteger(p) ? String(p) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })}% VAT`
})

const promoVatSelectOptions = computed(() =>
  props.vatOptions.map((o) => ({
    value: String(o?.rate ?? ''),
    label: String(o?.label ?? ''),
  })),
)

const promoVatSelectDisplayLabel = computed(() => {
  const rate = selectVatPercent.value
  const opt = props.vatOptions.find((o) => Number(o?.rate) === Number(rate))
  if (opt?.label) return String(opt.label)
  return vatSelectLabelComputed.value
})

const dealerPercentInput = computed(() => {
  if (!props.campaign) return ''
  const n = Number(props.campaign.percent)
  if (!Number.isFinite(n) || n === 0) return ''
  return String(Math.abs(n))
})

const dealerAmountInput = computed(() => {
  if (!props.campaign) return ''
  if (props.showNetPrices) {
    const n = Number(props.campaign.netAmount ?? props.campaign.amount ?? 0)
    return Number.isFinite(n) && n !== 0 ? String(Math.abs(n)) : ''
  }
  const n = Number(props.campaign.grossAmount ?? props.campaign.amount ?? 0)
  return Number.isFinite(n) && n !== 0 ? String(Math.abs(n)) : ''
})

function onDealerDescriptionInput(v) {
  emit('update:description', String(v ?? ''))
}

function onDealerPercentInput(v) {
  const n = Number(v)
  if (!Number.isFinite(n) || n === 0) {
    emit('update:percent', 0)
    return
  }
  emit('update:percent', -Math.abs(n))
}

function onDealerAmountInput(v) {
  const n = Number(v)
  if (!Number.isFinite(n) || n === 0) {
    emit('update:amount', 0)
    return
  }
  emit('update:amount', -Math.abs(n))
}

function formatPercent(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '—'
  return String(x).replace('.', ',')
}

function formatMoney(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '—'
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>
