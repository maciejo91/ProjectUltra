<template>
  <div class="flex flex-col gap-4">
    <div class="mb-6">
      <Filters
        :filters="filtersState"
        :definitions="filterDefinitions"
        @update:filters="handleFiltersUpdate"
      />
    </div>

    <div v-if="trimGroups.length" class="flex flex-col gap-6">
      <div class="flex flex-col gap-2">
        <p class="text-sm leading-none font-medium text-foreground">Trim</p>
        <ul class="grid gap-3 sm:grid-cols-3 mb-4">
          <li v-for="t in trimGroups" :key="t.key">
            <button
              type="button"
              class="w-full bg-background border rounded-lg p-4 text-left flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              :class="selectedTrim === t.key ? 'border-primary' : 'border-border hover:border-primary/40'"
              @click="selectTrim(t.key)"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-center gap-3 min-w-0">
                  <span
                    class="shrink-0 size-5 rounded-full border flex items-center justify-center"
                    :class="selectedTrim === t.key ? 'border-primary' : 'border-border'"
                    aria-hidden="true"
                  >
                    <span v-if="selectedTrim === t.key" class="size-2.5 rounded-full bg-primary" />
                  </span>
                  <p class="text-base leading-none font-semibold text-foreground truncate">
                    {{ t.label }}
                  </p>
                </div>
                <PromoBadge :promos="t.promos" />
              </div>
              <p class="text-sm leading-normal font-normal text-muted-foreground">
                {{ t.enginesCount }} engines
              </p>
              <Separator class="my-1" />
              <p class="text-sm leading-none font-normal text-foreground">
                from {{ formatFromPrice(t.fromPrice) }}
              </p>
            </button>
          </li>
        </ul>
      </div>

    </div>

    <p class="text-sm leading-none font-medium text-foreground">Engine</p>
    <ul class="grid gap-3 sm:grid-cols-3 mb-4">
      <li v-for="v in filteredVersions" :key="v.id">
        <button
          type="button"
          class="w-full bg-background border rounded-lg p-4 text-left flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
          :class="
            modelValue === v.id
              ? 'border-primary ring-2 ring-primary'
              : 'border-border hover:border-primary/40'
          "
          @click="$emit('update:modelValue', v.id)"
        >
          <div class="flex flex-col gap-4">
            <p class="text-sm leading-none font-normal text-muted-foreground">
              {{ formatTrimTitle(getTrimLabel(v)) }}
            </p>

            <div class="flex items-center gap-4">
              <span
                class="shrink-0 size-6 rounded-full border flex items-center justify-center"
                :class="modelValue === v.id ? 'border-primary' : 'border-border'"
                aria-hidden="true"
              >
                <span v-if="modelValue === v.id" class="size-3 rounded-full bg-primary" />
              </span>

            <p class="text-base leading-none font-semibold text-foreground truncate">
                {{ versionTitle(v) }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <Badge variant="secondary" class="rounded-full">
                <Fuel class="size-4" data-icon="inline-start" />
                {{ v.fuel }}
              </Badge>
              <Badge variant="secondary" class="rounded-full">
                <User class="size-4" data-icon="inline-start" />
                {{ v.gearbox }}
              </Badge>
              <Badge variant="secondary" class="rounded-full">
                <Settings2 class="size-4" data-icon="inline-start" />
                {{ v.drivetrain }}
              </Badge>
            </div>
          </div>

          <dl class="flex flex-col gap-2">
            <div class="flex flex-col gap-1">
              <dt class="text-xs leading-normal font-normal text-muted-foreground">Power</dt>
              <dd class="text-sm leading-normal font-normal text-muted-foreground">
                {{ formatPower(v) }}
              </dd>
            </div>

            <div class="flex flex-col gap-1">
              <dt class="text-xs leading-normal font-normal text-muted-foreground">CO2 emissions combined</dt>
              <dd class="text-sm leading-normal font-normal text-muted-foreground">
                {{ formatCo2(v) }}
              </dd>
            </div>

            <div class="flex flex-col gap-1">
              <dt class="text-xs leading-normal font-normal text-muted-foreground">Fuel consumption combined</dt>
              <dd class="text-sm leading-normal font-normal text-muted-foreground">
                {{ formatConsumption(v) }}
              </dd>
            </div>
          </dl>

          <Separator class="my-1" />
          <p class="text-sm leading-normal font-normal text-foreground">
            from {{ formatFromPrice(props.basePrice + Number(v.priceDelta || 0)) }}
          </p>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Fuel, Settings2, User } from 'lucide-vue-next'
import { Filters } from '@motork/component-library/future/components'
import { Badge, Separator } from '@motork/component-library/future/primitives'
import PromoBadge from '@/components/shared/PromoBadge.vue'
import { promosForTrimLabel } from '@/constants/vehicleConfiguratorCatalog'

const props = defineProps({
  modelValue: { type: String, default: '' },
  versions: { type: Array, required: true },
  basePrice: { type: Number, default: 0 },
  showNetPrices: { type: Boolean, default: false },
  vatRatePercent: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue'])

const fuelOptions = computed(() => {
  const values = props.versions.map((v) => v?.fuel).filter(Boolean)
  return Array.from(new Set(values)).sort((a, b) => String(a).localeCompare(String(b)))
})

const gearboxOptions = computed(() => {
  const values = props.versions.map((v) => v?.gearbox).filter(Boolean)
  return Array.from(new Set(values)).sort((a, b) => String(a).localeCompare(String(b)))
})

const filterDefinitions = computed(() => {
  const selectOperators = [{ value: 'is', label: 'is' }]
  return [
    {
      key: 'fuel',
      label: 'Fuel type',
      type: 'select',
      operators: selectOperators,
      options: fuelOptions.value.map((v) => ({ value: v, label: v })),
    },
    {
      key: 'gearbox',
      label: 'Gear box',
      type: 'select',
      operators: selectOperators,
      options: gearboxOptions.value.map((v) => ({ value: v, label: v })),
    },
  ]
})

function normalizePinnedFilter(f) {
  const hasValue = typeof f?.value === 'string' ? Boolean(f.value) : Array.isArray(f?.value) ? f.value.length > 0 : Boolean(f?.value)
  return { ...f, hideValue: !hasValue }
}

const filtersState = ref([
  normalizePinnedFilter({ id: 'fuel', field: 'fuel', operator: 'is', pinned: true, value: '' }),
  normalizePinnedFilter({ id: 'gearbox', field: 'gearbox', operator: 'is', pinned: true, value: '' }),
])

const selectedFuel = computed(() => {
  const f = filtersState.value.find((x) => x.field === 'fuel')
  return typeof f?.value === 'string' ? f.value : ''
})

const selectedGearbox = computed(() => {
  const f = filtersState.value.find((x) => x.field === 'gearbox')
  return typeof f?.value === 'string' ? f.value : ''
})

function handleFiltersUpdate(next) {
  filtersState.value = (next ?? []).map((f) => (f?.pinned ? normalizePinnedFilter(f) : f))
}

const versionsAfterPills = computed(() => {
  const fuel = selectedFuel.value
  const gearbox = selectedGearbox.value
  return props.versions.filter((v) => {
    if (fuel && v?.fuel !== fuel) return false
    if (gearbox && v?.gearbox !== gearbox) return false
    return true
  })
})

function getTrimLabel(v) {
  const name = String(v?.name || '').trim()
  const engine = String(v?.engine || '').trim()
  if (!name) return ''
  if (!engine) return name
  const prefix = name.split(engine)[0]?.trim()
  return prefix || name
}

function formatCurrency(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${Math.round(n).toLocaleString()}€`
}

function toNet(grossValue) {
  const gross = Number(grossValue)
  if (!Number.isFinite(gross)) return 0
  const rate = Number(props.vatRatePercent || 0) / 100
  if (rate <= 0) return gross
  return gross / (1 + rate)
}

function formatFromPrice(grossValue) {
  const value = props.showNetPrices ? toNet(grossValue) : grossValue
  const formatted = formatCurrency(value)
  return props.showNetPrices ? `${formatted} VAT excl.` : formatted
}

const selectedTrim = ref('')

const trimGroups = computed(() => {
  const list = versionsAfterPills.value
  const byTrim = new Map()

  for (const v of list) {
    const trim = getTrimLabel(v)
    if (!trim) continue

    const curr = byTrim.get(trim) ?? {
      key: trim,
      label: trim,
      engines: new Set(),
      minDelta: Infinity,
      promos: promosForTrimLabel(trim),
    }
    curr.engines.add(String(v?.engine || '').trim())
    curr.minDelta = Math.min(curr.minDelta, Number(v?.priceDelta) || 0)
    byTrim.set(trim, curr)
  }

  return Array.from(byTrim.values())
    .map((t) => ({
      key: t.key,
      label: t.label,
      enginesCount: Array.from(t.engines).filter(Boolean).length,
      fromPrice: props.basePrice + (Number.isFinite(t.minDelta) ? t.minDelta : 0),
      promos: t.promos,
      minDelta: t.minDelta,
    }))
    .sort((a, b) => a.fromPrice - b.fromPrice || a.label.localeCompare(b.label))
})

const filteredVersions = computed(() => {
  const trim = selectedTrim.value
  return versionsAfterPills.value.filter((v) => {
    if (trim && getTrimLabel(v) !== trim) return false
    return true
  })
})

function cheapestEngineIdForTrim(trimKey) {
  const candidates = versionsAfterPills.value.filter((v) => getTrimLabel(v) === trimKey)
  if (!candidates.length) return ''
  const sorted = candidates.slice().sort((a, b) => {
    const da = Number(a?.priceDelta) || 0
    const db = Number(b?.priceDelta) || 0
    if (da !== db) return da - db
    return String(a?.engine || a?.name || '').localeCompare(String(b?.engine || b?.name || ''))
  })
  return String(sorted[0]?.id || '')
}

function autoPickEngineForTrim(trimKey) {
  if (!trimKey) return
  const currentId = String(props.modelValue || '')
  const currentBelongs = props.versions.some(
    (v) => String(v?.id) === currentId && getTrimLabel(v) === trimKey
  )
  if (currentBelongs && filteredVersions.value.some((v) => String(v?.id) === currentId)) {
    return
  }
  const next = cheapestEngineIdForTrim(trimKey)
  if (next && next !== currentId) {
    emit('update:modelValue', next)
  }
}

function cheapestTrimKey() {
  return trimGroups.value[0]?.key || ''
}

function selectTrim(key) {
  if (!key) return
  selectedTrim.value = key
  autoPickEngineForTrim(key)
}

watch(
  trimGroups,
  (list) => {
    const keys = new Set((list ?? []).map((t) => t.key))
    if (!selectedTrim.value || !keys.has(selectedTrim.value)) {
      const nextTrim = cheapestTrimKey()
      if (nextTrim) {
        selectedTrim.value = nextTrim
      }
    }
    if (selectedTrim.value) {
      autoPickEngineForTrim(selectedTrim.value)
    }
  },
  { immediate: true }
)

watch(
  filteredVersions,
  () => {
    if (selectedTrim.value) {
      autoPickEngineForTrim(selectedTrim.value)
    }
  },
  { immediate: true }
)

function formatTrimTitle(label) {
  const s = String(label || '').trim()
  if (!s) return ''
  return s
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

function versionTitle(v) {
  const name = String(v?.name || '').trim()
  const trim = String(getTrimLabel(v) || '').trim()
  if (!trim) return name
  const next = name.replace(trim, '').trim()
  return next || name
}

function formatEuro(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `€ ${Math.round(n).toLocaleString('it-IT')}`
}

function formatPower(v) {
  const hp = Number(v?.hp)
  const kw = Number(v?.kw)
  const hasHp = Number.isFinite(hp) && hp > 0
  const hasKw = Number.isFinite(kw) && kw > 0
  if (!hasHp && !hasKw) return '—'
  const left = hasHp ? `${Math.round(hp)} HP` : ''
  const right = hasKw ? `${Math.round(kw)} kW` : ''
  return [left, right].filter(Boolean).join('/')
}

function formatCo2(v) {
  const n = Number(v?.co2Gkm)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return `${Math.round(n)} g/km`
}

function formatConsumption(v) {
  const n = Number(v?.consumptionL100km)
  if (!Number.isFinite(n) || n <= 0) return '—'
  const formatted = n.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return `${formatted} l/100 km`
}
</script>
