<template>
  <div class="space-y-4">
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
      <span class="w-8 shrink-0 select-none text-xs leading-none text-muted-foreground opacity-0">
        .
      </span>
    </div>

    <!-- VAT on taxable subtotal (computed) -->
    <div class="flex flex-wrap items-center gap-2.5">
      <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg bg-muted px-2.5 py-1">
        <p class="truncate text-sm text-muted-foreground">{{ vatSubtotalLabel }}</p>
      </div>
      <template v-if="showNetPrices">
        <div
          class="flex h-8 w-32 shrink-0 items-center justify-end rounded-lg bg-muted px-2.5 text-sm text-muted-foreground"
        >
          —
        </div>
        <VehicleDetailVatStub :label="modalVatLabel" />
        <QuotationReadOnlyAmount
          width-class="w-32 shrink-0"
          :amount="vatAmount"
        />
        <span class="w-8 shrink-0" aria-hidden="true" />
      </template>
      <template v-else>
        <QuotationReadOnlyAmount
          width-class="w-40 shrink-0"
          :amount="vatAmount"
        />
        <span class="w-8 shrink-0" aria-hidden="true" />
      </template>
    </div>

    <div
      v-for="row in lines"
      :key="row.id"
      class="flex flex-wrap items-center gap-2.5"
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
          <p class="truncate text-sm text-muted-foreground">{{ row.description }}</p>
        </template>
      </div>

      <template v-if="showNetPrices">
        <template v-if="row.amountsEditable">
          <QuotationEditableAmount
            width-class="w-32 shrink-0"
            :model-value="netInputString(row)"
            :muted="false"
            @update:model-value="(v) => onPrimaryAmount(row, v)"
          />
        </template>
        <template v-else>
          <QuotationReadOnlyAmount width-class="w-32 shrink-0" :amount="row.netAmount" />
        </template>

        <template v-if="row.vatEditable">
          <Select
            class="w-40 shrink-0"
            :model-value="String(rowVatPercent(row))"
            @update:model-value="(v) => emit('update-line', row.id, { vatRatePercent: Number(v) })"
          >
            <SelectTrigger
              class="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm"
            >
              <SelectValue :placeholder="vatOptionLabel(row)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="opt in vatOptions"
                :key="opt.id ?? String(opt.rate)"
                :value="String(opt.rate)"
              >
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </template>
        <template v-else>
          <VehicleDetailVatStub :label="vatOptionLabel(row)" />
        </template>

        <QuotationReadOnlyAmount width-class="w-32 shrink-0" :amount="row.grossAmount" />
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

      <Button
        v-if="row.removable"
        type="button"
        variant="ghost"
        size="icon-sm"
        class="shrink-0 rounded-md"
        @click="emit('remove-line', row.id)"
      >
        <Trash2 class="size-4" />
        <span class="sr-only">Remove line</span>
      </Button>
      <span v-else class="w-8 shrink-0" aria-hidden="true" />
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@motork/component-library/future/primitives'
import QuotationEditableAmount from '@/components/addnew/configurator/QuotationEditableAmount.vue'
import QuotationReadOnlyAmount from '@/components/addnew/configurator/QuotationReadOnlyAmount.vue'
import VehicleDetailVatStub from '@/components/addnew/configurator/VehicleDetailVatStub.vue'

const props = defineProps({
  lines: { type: Array, required: true },
  showNetPrices: { type: Boolean, default: false },
  vatAmount: { type: Number, default: 0 },
  modalVatRatePercent: { type: Number, default: 0 },
  vatOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['add-line', 'remove-line', 'update-line'])

const vatSubtotalLabel = computed(() => {
  const p = Number(props.modalVatRatePercent)
  if (!Number.isFinite(p) || p <= 0) return 'VAT on configuration'
  const label = Number.isInteger(p) ? String(p) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `VAT on configuration (${label}%)`
})

const modalVatLabel = computed(() => {
  const p = Number(props.modalVatRatePercent)
  if (!Number.isFinite(p) || p <= 0) return '0% VAT'
  const label = Number.isInteger(p) ? String(p) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `${label}% VAT`
})

function descriptionCellClass(row) {
  if (!row.descriptionEditable) return 'bg-muted'
  return 'border border-input bg-background'
}

function rowVatPercent(row) {
  const r = Number(row?.vatRatePercent)
  return Number.isFinite(r) ? r : Number(props.modalVatRatePercent) || 0
}

function vatOptionLabel(row) {
  const p = rowVatPercent(row)
  if (!Number.isFinite(p) || p <= 0) return '0% VAT'
  const label = Number.isInteger(p) ? String(p) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `${label}% VAT`
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
