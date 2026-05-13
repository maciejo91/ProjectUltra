<template>
  <div class="flex flex-col gap-8">
    <section class="flex flex-col gap-4 mt-2">
      <p class="text-base leading-none font-semibold text-foreground">Exterior</p>
      <div v-for="[subgroupLabel, items] in exteriorGroups" :key="`ext-${subgroupLabel}`" class="flex flex-col gap-3">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {{ subgroupLabel }}
        </p>
        <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <li v-for="c in items" :key="c.id">
            <button
              type="button"
              class="w-full bg-background border rounded-lg p-4 text-left flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              :class="
                isSelected(c)
                  ? 'border-primary ring-2 ring-primary'
                  : 'border-border hover:border-primary/40'
              "
              @click="emitFor(c)"
            >
              <div class="flex items-center justify-between gap-3">
                <span
                  class="shrink-0 size-5 rounded-full border flex items-center justify-center"
                  :class="isSelected(c) ? 'border-primary' : 'border-border'"
                  aria-hidden="true"
                >
                  <span v-if="isSelected(c)" class="size-2.5 rounded-full bg-primary" />
                </span>
                <span
                  class="size-8 rounded-full border border-border shadow-mk-dashboard-card"
                  :style="{ backgroundColor: c.hex }"
                  aria-hidden="true"
                />
              </div>

              <div class="space-y-1">
                <TruncatingTooltip :text="c.name" wrapper-class="min-w-0 w-full">
                  <p class="text-base font-semibold text-foreground truncate">{{ c.name }}</p>
                </TruncatingTooltip>
                <p class="text-sm text-muted-foreground">{{ c.finish }}</p>
              </div>

              <div class="flex items-start justify-start gap-2 pt-2 border-t border-border">
                <span class="text-sm font-medium text-foreground">
                  {{ formatPriceDelta(c.priceDelta) }}
                </span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </section>

    <section class="flex flex-col gap-4 mt-2">
      <p class="text-base leading-none font-semibold text-foreground">Interior</p>
      <div v-for="[subgroupLabel, items] in interiorGroups" :key="`int-${subgroupLabel}`" class="flex flex-col gap-3">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {{ subgroupLabel }}
        </p>
        <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <li v-for="c in items" :key="c.id">
            <button
              type="button"
              class="w-full bg-background border rounded-lg p-4 text-left flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              :class="
                isSelected(c)
                  ? 'border-primary ring-2 ring-primary'
                  : 'border-border hover:border-primary/40'
              "
              @click="emitFor(c)"
            >
              <div class="flex items-center justify-between gap-3">
                <span
                  class="shrink-0 size-5 rounded-full border flex items-center justify-center"
                  :class="isSelected(c) ? 'border-primary' : 'border-border'"
                  aria-hidden="true"
                >
                  <span v-if="isSelected(c)" class="size-2.5 rounded-full bg-primary" />
                </span>
                <span
                  class="size-8 rounded-full border border-border shadow-mk-dashboard-card"
                  :style="{ backgroundColor: c.hex }"
                  aria-hidden="true"
                />
              </div>

              <div class="space-y-1">
                <TruncatingTooltip :text="c.name" wrapper-class="min-w-0 w-full">
                  <p class="text-base font-semibold text-foreground truncate">{{ c.name }}</p>
                </TruncatingTooltip>
                <p class="text-sm text-muted-foreground">{{ c.finish }}</p>
              </div>

              <div class="flex items-start justify-start gap-2 pt-2 border-t border-border">
                <span class="text-sm font-medium text-foreground">
                  {{ formatPriceDelta(c.priceDelta) }}
                </span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TruncatingTooltip from '@/components/shared/TruncatingTooltip.vue'

const props = defineProps({
  exteriorId: { type: String, default: '' },
  interiorId: { type: String, default: '' },
  colours: { type: Array, required: true },
  showNetPrices: { type: Boolean, default: false },
  vatRatePercent: { type: Number, default: 0 },
})

const emit = defineEmits(['update:exteriorId', 'update:interiorId'])

function groupBySubgroup(list) {
  const map = new Map()
  for (const c of list) {
    const key = String(c?.subgroup || c?.finish || 'Other').trim() || 'Other'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(c)
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}

const exteriorGroups = computed(() =>
  groupBySubgroup(props.colours.filter((c) => c?.category === 'exterior'))
)

const interiorGroups = computed(() =>
  groupBySubgroup(props.colours.filter((c) => c?.category === 'interior'))
)

function isSelected(c) {
  if (c?.category === 'interior') return props.interiorId === c.id
  return props.exteriorId === c.id
}

function emitFor(c) {
  if (c?.category === 'interior') {
    emit('update:interiorId', c.id)
  } else {
    emit('update:exteriorId', c.id)
  }
}

function formatPriceDelta(delta) {
  const n = Number(delta)
  if (!Number.isFinite(n) || n === 0) {
    return props.showNetPrices ? '€ 0.00 VAT excl.' : '€ 0.00'
  }
  const rate = Number(props.vatRatePercent || 0) / 100
  const gross = Math.abs(n)
  const value = props.showNetPrices && rate > 0 ? gross / (1 + rate) : gross
  const formatted = `${Math.round(value).toLocaleString()}€`
  return `+ ${formatted}${props.showNetPrices ? ' VAT excl.' : ''}`
}
</script>
