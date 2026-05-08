<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="w-full sm:max-w-2xl h-[80vh] max-h-[calc(100vh-4rem)] flex flex-col gap-0 overflow-hidden p-0" :show-close-button="false">
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
              'bg-background border border-border rounded-lg p-4 flex flex-col items-center gap-2 shadow-mk-dashboard-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
            <div class="text-sm font-medium text-foreground text-center w-full truncate">
              {{ b.label }}
            </div>
          </button>
        </div>

        <div v-else-if="step === 2" class="w-full h-full flex flex-col min-h-0">
          <div class="shrink-0 bg-muted px-6 py-4 flex items-center justify-between gap-4">
            <div class="relative flex-1">
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
                  size="sm"
                  :model-value="showNetPrices"
                  @update:model-value="(v) => (showNetPrices = v === true)"
                />
              </div>

              <Button type="button" variant="outline" size="sm" class="rounded-md">
                VAT 22%
              </Button>
            </div>
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <button
                v-for="m in filteredModels"
                :key="m.id"
                type="button"
                :class="[
                  'bg-background border border-border rounded-lg p-4 flex flex-col items-start text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
                  <img v-if="m.imageUrl" :src="m.imageUrl" alt="" class="h-full w-full object-cover" loading="lazy" />
                </div>

                <div class="w-full pt-4 space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-sm text-muted-foreground truncate">
                      {{ m.versionsLabel }}
                    </p>
                    <div
                      v-if="m.promoCount"
                      class="shrink-0 h-5 rounded-md bg-destructive text-destructive-foreground flex items-center gap-1.5 pl-1 pr-2 shadow-mk-dashboard-card"
                    >
                      <div class="h-3.5 min-w-3.5 rounded-sm bg-background text-destructive flex items-center justify-center px-1 text-xs leading-none">
                        {{ m.promoCount }}
                      </div>
                      <span class="promo-label text-xs font-semibold leading-none">PROMO</span>
                    </div>
                  </div>
                  <p class="text-sm text-foreground">
                    {{ m.priceLabel }}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="w-full h-full flex flex-col min-h-0">
          <div class="shrink-0 bg-muted px-6 py-4 flex items-center justify-between gap-4">
            <div class="relative flex-1">
              <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                v-model="itemSearchQuery"
                type="text"
                placeholder="Search items..."
                class="w-full pl-9 bg-background border-border"
              />
            </div>

            <div class="shrink-0 flex items-center gap-4">
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-foreground">Show net prices</span>
                <Switch
                  size="sm"
                  :model-value="showNetPrices"
                  @update:model-value="(v) => (showNetPrices = v === true)"
                />
              </div>

              <Button type="button" variant="outline" size="sm" class="rounded-md">
                VAT 22%
              </Button>
            </div>
          </div>

          <div class="shrink-0 px-6 pt-2">
            <Tabs :model-value="activeTab" @update:model-value="(v) => (activeTab = String(v || 'quotation'))">
              <TabsList class="bg-transparent p-0 h-auto gap-6 border-b border-border rounded-none w-full justify-start">
                <TabsTrigger value="version" class="rounded-none px-0 py-2 text-sm">
                  Version
                </TabsTrigger>
                <TabsTrigger value="colour" class="rounded-none px-0 py-2 text-sm">
                  Colour
                </TabsTrigger>
                <TabsTrigger value="equipment" class="rounded-none px-0 py-2 text-sm">
                  Equipment - Optional
                </TabsTrigger>
                <TabsTrigger value="quotation" class="rounded-none px-0 py-2 text-sm">
                  Quotation
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto px-6 py-4">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
              <div class="space-y-4">
                <div class="rounded-lg border border-border bg-background overflow-hidden">
                  <button type="button" class="w-full flex items-center justify-between px-4 py-3 text-left" @click="toggleSection('vehicleDetails')">
                    <span class="text-sm font-medium text-foreground">Vehicle details</span>
                    <ChevronDown class="size-4 text-muted-foreground" :class="sectionOpen.vehicleDetails ? 'rotate-180' : ''" />
                  </button>
                  <div v-show="sectionOpen.vehicleDetails" class="px-4 pb-4 space-y-2">
                    <div class="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2">
                      <p class="text-sm text-foreground truncate">{{ configuredVehicleLine }}</p>
                      <p class="text-sm text-foreground">{{ formatCurrency(configuredPrice) }}</p>
                    </div>
                    <div class="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2">
                      <p class="text-sm text-muted-foreground">Colour: {{ configuredColour }}</p>
                      <p class="text-sm text-muted-foreground">{{ formatCurrency(300) }}</p>
                    </div>
                  </div>
                </div>

                <div class="rounded-lg border border-border bg-background overflow-hidden">
                  <button type="button" class="w-full flex items-center justify-between px-4 py-3 text-left" @click="toggleSection('promoCampaigns')">
                    <span class="text-sm font-medium text-foreground">Promo and Campaigns</span>
                    <ChevronDown class="size-4 text-muted-foreground" :class="sectionOpen.promoCampaigns ? 'rotate-180' : ''" />
                  </button>
                </div>

                <div class="rounded-lg border border-border bg-background overflow-hidden">
                  <div class="w-full flex items-center justify-between px-4 py-3">
                    <span class="text-sm font-medium text-foreground">Discounts</span>
                    <Button type="button" variant="outline" size="sm" class="rounded-md">
                      <Plus class="size-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div class="rounded-lg border border-border bg-background overflow-hidden">
                  <button type="button" class="w-full flex items-center justify-between px-4 py-3 text-left" @click="toggleSection('accessories')">
                    <span class="text-sm font-medium text-foreground">Accessories and services</span>
                    <ChevronDown class="size-4 text-muted-foreground" :class="sectionOpen.accessories ? 'rotate-180' : ''" />
                  </button>
                </div>

                <div class="rounded-lg border border-border bg-background overflow-hidden">
                  <button type="button" class="w-full flex items-center justify-between px-4 py-3 text-left" @click="toggleSection('taxes')">
                    <span class="text-sm font-medium text-foreground">Taxes and extra-costs</span>
                    <ChevronDown class="size-4 text-muted-foreground" :class="sectionOpen.taxes ? 'rotate-180' : ''" />
                  </button>
                </div>

                <div class="rounded-lg border border-border bg-background overflow-hidden">
                  <button type="button" class="w-full flex items-center justify-between px-4 py-3 text-left" @click="toggleSection('tradeIn')">
                    <span class="text-sm font-medium text-foreground">Trade-in</span>
                    <ChevronDown class="size-4 text-muted-foreground" :class="sectionOpen.tradeIn ? 'rotate-180' : ''" />
                  </button>
                </div>

                <div class="rounded-lg border border-border bg-background overflow-hidden">
                  <div class="w-full flex items-center justify-between px-4 py-3">
                    <span class="text-sm font-medium text-foreground">Purchase methods</span>
                    <Button type="button" variant="outline" size="sm" class="rounded-md">
                      <Plus class="size-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div class="rounded-lg border border-border bg-background shadow-mk-dashboard-card overflow-hidden">
                <div class="p-4 space-y-3">
                  <div class="inline-flex items-center justify-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground w-fit">
                    New
                  </div>
                  <div>
                    <p class="text-sm font-medium text-foreground">{{ configuredBrandLabel }}</p>
                    <p class="text-base font-semibold text-foreground">{{ configuredModelTitle }}</p>
                    <p class="text-sm text-muted-foreground">{{ configuredSubline }}</p>
                    <div class="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                      <span class="size-2 rounded-full bg-muted-foreground/60" aria-hidden="true" />
                      {{ configuredColour }}
                    </div>
                  </div>
                </div>
                <div class="px-4 pb-4">
                  <div class="aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
                    <img v-if="configuredImageUrl" :src="configuredImageUrl" alt="" class="h-full w-full object-cover" loading="lazy" />
                  </div>
                </div>
                <div class="border-t border-border p-4 space-y-3">
                  <p class="text-sm font-semibold text-foreground">Offer summary</p>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">Vehicle</span>
                      <span class="text-foreground">{{ formatCurrency(configuredPrice + 600) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">Promo</span>
                      <span class="text-foreground">- {{ formatCurrency(1500) }}</span>
                    </div>
                    <div class="flex items-center justify-between pt-1 font-semibold">
                      <span class="text-foreground">Subtotal</span>
                      <span class="text-foreground">{{ formatCurrency(configuredPrice + 600 - 1500) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">Taxes and extra costs</span>
                      <span class="text-foreground">{{ formatCurrency(862.98) }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-muted-foreground">Trade-in</span>
                      <span class="text-foreground">- {{ formatCurrency(4000) }}</span>
                    </div>
                    <div class="flex items-center justify-between pt-2 text-base font-semibold">
                      <span class="text-foreground">Grand total</span>
                      <span class="text-foreground">{{ formatCurrency(configuredPrice + 600 - 1500 + 862.98 - 4000) }}</span>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" class="rounded-md w-full justify-start">
                    <CornerDownLeft class="size-4 mr-2" />
                    Round price
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          <Button type="button" variant="default" class="rounded-sm w-full sm:w-auto" @click="handleSaveAndClose">
            Save and close
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowLeft, Check, ChevronDown, CornerDownLeft, Plus, Search, X } from 'lucide-vue-next'
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Switch, Tabs, TabsList, TabsTrigger } from '@motork/component-library/future/primitives'

const props = defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['update:open', 'save'])

const step = ref(1)
const selectedBrand = ref('')
const selectedModel = ref('')

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
const modelSearchQuery = ref('')
const itemSearchQuery = ref('')

const activeTab = ref('quotation')

const sectionOpen = ref({
  vehicleDetails: true,
  promoCampaigns: false,
  accessories: false,
  taxes: false,
  tradeIn: false,
})

function makeModelCards({ brandId, count, seed }) {
  const baseImageUrl = 'https://www.figma.com/api/mcp/asset/b84d02b2-bdf4-4a4a-8d63-4e78d9b74111'
  return Array.from({ length: count }).map((_, idx) => {
    const n = seed + idx
    const promoCount = n % 7 === 0 ? 2 : n % 5 === 0 ? 1 : 0
    return {
      id: `${brandId}-model-${n}`,
      title: `A${(n % 8) + 1} Sportback Berlina 5 porte`,
      imageUrl: baseImageUrl,
      versionsLabel: `${10 + (n % 6)} versions`,
      promoCount,
      priceLabel: `from € ${28_000 + (n % 12) * 1_500}`,
    }
  })
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
const configuredImageUrl = computed(() => configuredModel.value?.imageUrl || '')
const configuredSubline = computed(() => 'Identity black 30 TFSI S')
const configuredColour = computed(() => 'Gray zinc pearl')
const configuredVehicleLine = computed(() => {
  const base = [configuredBrandLabel.value, configuredModelTitle.value].filter(Boolean).join(' ')
  return [base, configuredSubline.value].filter(Boolean).join(' - ')
})

const configuredPrice = computed(() => {
  const raw = String(configuredModel.value?.priceLabel || '')
  const m = raw.match(/(\d[\d_.]*)/)
  if (!m) return 0
  const n = Number(String(m[1]).replace(/[^\d]/g, ''))
  return Number.isFinite(n) ? n : 0
})

function formatCurrency(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString()}€`
}

function toggleSection(key) {
  sectionOpen.value = { ...sectionOpen.value, [key]: !sectionOpen.value[key] }
}

function resetState() {
  step.value = 1
  selectedBrand.value = ''
  selectedModel.value = ''
  brandLogoFailed.value = {}
  modelSearchQuery.value = ''
  itemSearchQuery.value = ''
  activeTab.value = 'quotation'
}

function selectBrand(brandId) {
  if (!brandId) return
  selectedBrand.value = brandId
  step.value = 2
}

function selectModel(modelId) {
  if (!modelId) return
  selectedModel.value = modelId
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

function handleSaveAndClose() {
  emit('save', {
    mode: 'configurator',
    brand: configuredBrandLabel.value,
    model: configuredModelTitle.value,
    label: [configuredBrandLabel.value, configuredModelTitle.value].filter(Boolean).join(' ').trim(),
    summary: configuredSubline.value,
    imageUrl: configuredImageUrl.value,
    quantity: 1,
    price: configuredPrice.value,
    specification: 'Petrol - Automatic',
    purchaseMethod: 'Leasing',
  })
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
  () => step.value,
  (s) => {
    if (s === 1) brandLogoFailed.value = {}
  }
)
</script>

<style scoped>
.promo-label {
  color: var(--color-white);
}
</style>
