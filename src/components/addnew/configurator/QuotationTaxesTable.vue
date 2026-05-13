<template>
  <div class="space-y-2.5">
    <div
      v-if="showNetPrices"
      class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5"
    >
      <span class="min-w-0 flex-1 select-none text-xs leading-none text-muted-foreground invisible">
        Item description
      </span>
      <div class="flex shrink-0 flex-nowrap items-center gap-2.5">
        <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">Net price</span>
        <span class="w-40 shrink-0 text-xs leading-none text-muted-foreground">VAT (%)</span>
        <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">Price VAT incl.</span>
        <span class="w-8 shrink-0" aria-hidden="true" />
      </div>
    </div>

    <div
      v-for="row in lines"
      :key="row.id"
      class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5"
    >
      <div
        class="flex h-8 min-w-0 flex-1 items-center rounded-lg px-2.5 py-1"
        :class="descriptionCellClass(row)"
      >
        <template v-if="row.descriptionEditable">
          <Input
            :model-value="row.description"
            type="text"
            placeholder="Item description"
            class="h-7 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-foreground shadow-none focus-visible:ring-0"
            @update:model-value="(v) => emit('update-line', row.id, { description: v })"
          />
        </template>
        <template v-else>
          <TruncatingTooltip :text="row.description" wrapper-class="min-w-0 flex-1">
            <p class="truncate text-sm leading-normal text-muted-foreground">{{ row.description }}</p>
          </TruncatingTooltip>
        </template>
      </div>

      <div class="flex shrink-0 flex-nowrap items-center gap-2.5">
        <template v-if="showNetPrices">
          <template v-if="row.amountsEditable">
            <QuotationEditableAmount
              width-class="w-32 shrink-0"
              :model-value="netInputString(row)"
              :muted="false"
              @update:model-value="(v) => onPrimaryAmount(row, v)"
            />
          </template>
          <VehicleDetailAmountPill v-else :amount="Number(row.netAmount)" />

          <TruncatingCatalogSelect
            v-if="row.vatEditable"
            :model-value="rowVatOptionId(row)"
            :display-label="vatOptionCatalogLabel(row)"
            :options="vatSelectOptions"
            @update:model-value="(v) => onVatOptionChange(row, v)"
          />
          <TruncatingTooltip
            v-else
            :text="vatOptionCatalogLabel(row)"
            wrapper-class="w-40 shrink-0 min-w-0"
          >
            <VehicleDetailVatStub :label="vatOptionCatalogLabel(row)" />
          </TruncatingTooltip>

          <VehicleDetailAmountPill :amount="Number(row.grossAmount)" />
        </template>

        <template v-else>
          <template v-if="row.amountsEditable">
            <QuotationEditableAmount
              width-class="w-40 shrink-0"
              :model-value="grossInputString(row)"
              :muted="false"
              @update:model-value="(v) => onPrimaryAmount(row, v)"
            />
          </template>
          <template v-else>
            <QuotationReadOnlyAmount width-class="w-40 shrink-0" :amount="row.grossAmount" />
          </template>
        </template>

        <div class="flex w-8 shrink-0 items-center justify-end">
          <Button
            v-if="taxExtraCostLineIsRemovable(row)"
            type="button"
            variant="ghost"
            size="icon"
            class="size-8 shrink-0 rounded-md"
            @click="emit('remove-line', row.id)"
          >
            <Trash2 class="size-4" />
            <span class="sr-only">Remove line</span>
          </Button>
        </div>
      </div>
    </div>

    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        class="rounded-md"
        @click="emit('add-line')"
      >
        <Plus class="size-4 mr-1" />
        Add
      </Button>
    </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import {
  Button,
  Input,
} from '@motork/component-library/future/primitives'
import QuotationEditableAmount from '@/components/addnew/configurator/QuotationEditableAmount.vue'
import QuotationReadOnlyAmount from '@/components/addnew/configurator/QuotationReadOnlyAmount.vue'
import TruncatingCatalogSelect from '@/components/shared/TruncatingCatalogSelect.vue'
import VehicleDetailAmountPill from '@/components/addnew/configurator/VehicleDetailAmountPill.vue'
import VehicleDetailVatStub from '@/components/addnew/configurator/VehicleDetailVatStub.vue'
import TruncatingTooltip from '@/components/shared/TruncatingTooltip.vue'
import { taxExtraCostLineIsRemovable } from '@/constants/vehicleConfiguratorCatalog'

const props = defineProps({
  lines: { type: Array, required: true },
  showNetPrices: { type: Boolean, default: false },
  vatAmount: { type: Number, default: 0 },
  modalVatRatePercent: { type: Number, default: 0 },
  vatOptions: { type: Array, default: () => [] },
})

const vatSelectOptions = computed(() =>
  props.vatOptions.map((o) => ({
    value: String(o?.id ?? ''),
    label: String(o?.label ?? ''),
  })),
)

const emit = defineEmits(['add-line', 'remove-line', 'update-line'])

function descriptionCellClass(row) {
  if (!row.descriptionEditable) return 'bg-muted'
  return 'border border-input bg-background'
}

function rowVatOptionId(row) {
  const id = String(row?.vatOptionId || '')
  if (id) return id
  const rate = Number(row?.vatRatePercent)
  if (Number.isFinite(rate)) {
    const found = props.vatOptions.find((o) => Number(o?.rate) === rate && !o?.notApplicable)
    if (found?.id) return String(found.id)
  }
  return 'vat-22'
}

function vatOptionLabel(row) {
  const id = rowVatOptionId(row)
  if (id === 'vat-na') return 'Not applicable'
  if (id === 'vat-0') return '0% VAT'
  const opt = props.vatOptions.find((o) => String(o?.id) === id)
  const p = Number(opt?.rate)
  if (!Number.isFinite(p) || p <= 0) return '0% VAT'
  const label = Number.isInteger(p) ? String(p) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `${label}% VAT`
}

/** Full catalog label (matches SelectItem text); use for display + tooltip. */
function vatOptionCatalogLabel(row) {
  const id = rowVatOptionId(row)
  const opt = props.vatOptions.find((o) => String(o?.id) === id)
  if (opt?.label) return String(opt.label)
  return vatOptionLabel(row)
}

function onVatOptionChange(row, vatOptionId) {
  const id = String(vatOptionId || '')
  const opt = props.vatOptions.find((o) => String(o?.id) === id)
  const rate = Number(opt?.rate)
  emit('update-line', row.id, {
    vatOptionId: id,
    vatRatePercent: Number.isFinite(rate) ? Math.max(0, rate) : 0,
  })
}

function netInputString(row) {
  const n = Number(row.netAmount)
  return Number.isFinite(n) && n !== 0 ? String(n) : ''
}

function grossInputString(row) {
  const n = Number(row.grossAmount)
  return Number.isFinite(n) && n !== 0 ? String(n) : ''
}

function onPrimaryAmount(row, v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return
  if (props.showNetPrices) {
    emit('update-line', row.id, { netAmount: Math.max(0, n) })
  } else {
    emit('update-line', row.id, { grossAmount: Math.max(0, n) })
  }
}
</script>
