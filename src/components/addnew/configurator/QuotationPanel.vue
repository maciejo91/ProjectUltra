<template>
  <div class="space-y-4">
    <div class="flex items-center justify-end gap-4">
      <button
        type="button"
        class="text-xs font-medium text-muted-foreground hover:text-foreground"
        @click="toggleAll"
      >
        {{ noneExpanded ? 'Expand all' : 'Collapse all' }}
      </button>
    </div>

    <div ref="sectionEls.vehicleDetails">
      <CollapsibleSection
        title="Vehicle details"
        :is-expanded="open.vehicleDetails"
        card-style
        @toggle="toggleSection('vehicleDetails')"
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2">
            <p class="text-sm text-foreground truncate">{{ vehicleLine }}</p>
            <p class="text-sm text-foreground shrink-0">{{ formatCurrency(vehicleBaseTotal) }}</p>
          </div>
          <div
            v-if="colourLabel"
            class="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2"
          >
            <p class="text-sm text-muted-foreground truncate">Colour: {{ colourLabel }}</p>
            <p class="text-sm text-muted-foreground shrink-0">
              {{ colourPriceDelta > 0 ? `+ ${formatCurrency(colourPriceDelta)}` : 'Included' }}
            </p>
          </div>
          <div
            v-if="interiorColourLabel"
            class="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2"
          >
            <p class="text-sm text-muted-foreground truncate">Interior: {{ interiorColourLabel }}</p>
            <p class="text-sm text-muted-foreground shrink-0">
              {{
                interiorColourPriceDelta > 0
                  ? `+ ${formatCurrency(interiorColourPriceDelta)}`
                  : 'Included'
              }}
            </p>
          </div>
          <div
            v-if="selectedEquipment.length"
            class="rounded-md bg-muted px-3 py-2 space-y-1.5"
          >
            <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Selected equipment
            </p>
            <div
              v-for="item in selectedEquipment"
              :key="item.id"
              class="flex items-center justify-between gap-3 text-sm"
            >
              <span class="text-foreground truncate">{{ item.name }}</span>
              <span class="text-foreground shrink-0">+ {{ formatCurrency(item.price) }}</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.promoCampaigns">
      <CollapsibleSection
        title="Promo and Campaigns"
        :is-expanded="open.promoCampaigns"
        card-style
        @toggle="toggleSection('promoCampaigns')"
      >
      <ul class="space-y-2">
        <li
          v-for="promo in promos"
          :key="promo.id"
          class="rounded-md border border-border px-3 py-2 flex items-start justify-between gap-3"
        >
          <label
            class="flex items-start gap-3 cursor-pointer min-w-0 flex-1"
            :for="`promo-${promo.id}`"
          >
            <Checkbox
              :id="`promo-${promo.id}`"
              :model-value="!!promoSelection[promo.id]"
              @update:model-value="(v) => emit('toggle-promo', promo.id, v)"
            />
            <span class="min-w-0">
              <span class="block text-sm font-medium text-foreground">{{ promo.label }}</span>
              <span class="block text-xs text-muted-foreground">{{ promo.description }}</span>
            </span>
          </label>
          <span class="shrink-0 text-sm font-medium text-mk-green-600">
            {{ formatPromoDiscountDisplay(promo) }}
          </span>
        </li>
      </ul>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.discounts">
      <CollapsibleSection
        title="Discounts"
        :is-expanded="open.discounts"
        card-style
        @toggle="toggleSection('discounts')"
      >
      <div class="space-y-3">
        <ul v-if="userDiscounts.length" class="space-y-2">
          <li
            v-for="d in userDiscounts"
            :key="d.id"
            class="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2"
          >
            <span class="text-sm text-foreground truncate">{{ d.label }}</span>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-sm font-medium text-mk-green-600">
                - {{ formatCurrency(d.amount) }}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                class="rounded-md"
                @click="emit('remove-discount', d.id)"
              >
                <X class="size-4" />
                <span class="sr-only">Remove discount</span>
              </Button>
            </div>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">No manual discounts added yet.</p>

        <div class="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div class="flex-1 flex flex-col gap-1">
            <label class="text-xs font-medium text-muted-foreground" for="discount-label">
              Label
            </label>
            <Input
              id="discount-label"
              v-model="newDiscountLabel"
              type="text"
              placeholder="e.g. Loyalty bonus"
              class="bg-background border-border"
            />
          </div>
          <div class="w-full sm:w-32 flex flex-col gap-1">
            <label class="text-xs font-medium text-muted-foreground" for="discount-amount">
              Amount (€)
            </label>
            <Input
              id="discount-amount"
              v-model="newDiscountAmount"
              type="number"
              min="0"
              placeholder="0"
              class="bg-background border-border"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="rounded-md sm:self-end"
            :disabled="!canAddDiscount"
            @click="handleAddDiscount"
          >
            <Plus class="size-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.accessories">
      <CollapsibleSection
        title="Accessories and services"
        :is-expanded="open.accessories"
        card-style
        @toggle="toggleSection('accessories')"
      >
      <ul class="space-y-2">
        <li
          v-for="acc in accessories"
          :key="acc.id"
          class="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
        >
          <label
            class="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
            :for="`acc-${acc.id}`"
          >
            <Checkbox
              :id="`acc-${acc.id}`"
              :model-value="!!accessorySelection[acc.id]"
              @update:model-value="(v) => emit('toggle-accessory', acc.id, v)"
            />
            <span class="text-sm text-foreground truncate">{{ acc.name }}</span>
          </label>
          <span class="shrink-0 text-sm font-medium text-foreground">
            + {{ formatCurrency(acc.price) }}
          </span>
        </li>
      </ul>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.taxes">
      <CollapsibleSection
        title="Taxes and extra-costs"
        :is-expanded="open.taxes"
        card-style
        @toggle="toggleSection('taxes')"
      >
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2">
          <p class="text-sm text-foreground">VAT ({{ taxes.vatRatePercent }}%)</p>
          <p class="text-sm text-foreground">{{ formatCurrency(vatAmount) }}</p>
        </div>
        <div class="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2">
          <p class="text-sm text-foreground">Registration tax</p>
          <p class="text-sm text-foreground">{{ formatCurrency(taxes.registrationTax) }}</p>
        </div>
        <div class="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2">
          <p class="text-sm text-foreground">Eco tax</p>
          <p class="text-sm text-foreground">{{ formatCurrency(taxes.ecoTax) }}</p>
        </div>
      </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.tradeIn">
      <CollapsibleSection
        title="Trade-in"
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
</template>

<script setup>
import { reactive, ref, computed, nextTick } from 'vue'
import { Plus, X } from 'lucide-vue-next'
import { Button, Checkbox, Input, Toggle } from '@motork/component-library/future/primitives'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'
import { formatPromoDiscount } from '@/constants/vehicleConfiguratorCatalog'

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
  userDiscounts: { type: Array, default: () => [] },
  accessories: { type: Array, required: true },
  accessorySelection: { type: Object, required: true },
  taxes: { type: Object, required: true },
  vatAmount: { type: Number, default: 0 },
  tradeInApplied: { type: Boolean, default: false },
  tradeInMockValue: { type: Number, default: 0 },
  purchaseMethods: { type: Array, required: true },
  selectedPurchaseMethodId: { type: String, default: '' },
})

const emit = defineEmits([
  'toggle-promo',
  'add-discount',
  'remove-discount',
  'toggle-accessory',
  'toggle-trade-in',
  'select-purchase-method',
])

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

defineExpose({ openSection })

const newDiscountLabel = ref('')
const newDiscountAmount = ref('')

const canAddDiscount = computed(() => {
  const amount = Number(newDiscountAmount.value)
  return Number.isFinite(amount) && amount > 0
})

function handleAddDiscount() {
  if (!canAddDiscount.value) return
  emit('add-discount', {
    label: newDiscountLabel.value.trim() || 'Discount',
    amount: Number(newDiscountAmount.value),
  })
  newDiscountLabel.value = ''
  newDiscountAmount.value = ''
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

function formatPromoDiscountDisplay(promo) {
  if (!promo) return ''
  if (promo.discountType === 'percent') {
    return formatPromoDiscount(promo)
  }
  const amount = displayValue(promo.amount || 0)
  if (!Number.isFinite(amount)) return ''
  return `- ${formatCurrency(amount)}`
}
</script>
