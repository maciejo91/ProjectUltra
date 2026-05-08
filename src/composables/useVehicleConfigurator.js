import { computed, reactive, ref, unref } from 'vue'
import {
  ACCESSORIES,
  COLOURS,
  EQUIPMENT,
  PROMOS,
  PURCHASE_METHODS,
  TAXES,
  TRADE_IN_MOCK_VALUE,
  VERSION_INCLUDED_EQUIPMENT,
  VERSIONS,
  findAccessory,
  findColour,
  findEquipment,
  findPromo,
  findVersion,
} from '@/constants/vehicleConfiguratorCatalog'

/**
 * Single source of truth for Step 3 of the VehicleConfiguratorModal.
 *
 * @param {Object} ctx
 * @param {import('vue').Ref<string>|()=>string} ctx.brandLabel - Selected brand label (Step 1).
 * @param {import('vue').Ref<string>|()=>string} ctx.modelTitle - Selected model title (Step 2).
 * @param {import('vue').Ref<string>|()=>string} ctx.modelImageUrl - Selected model image URL.
 * @param {import('vue').Ref<number>|()=>number} ctx.modelBasePrice - Base price coming from Step 2 selection.
 * @param {import('vue').Ref<number>|()=>number} [ctx.vatRatePercent] - Modal-wide VAT rate (overrides catalog default).
 */
export function useVehicleConfigurator(ctx = {}) {
  const readBrand = () => String(unref(ctx.brandLabel) || '')
  const readModel = () => String(unref(ctx.modelTitle) || '')
  const readModelImage = () => String(unref(ctx.modelImageUrl) || '')
  const readShowNetPrices = () => Boolean(unref(ctx.showNetPrices))
  const readModelBase = () => {
    const n = Number(unref(ctx.modelBasePrice))
    return Number.isFinite(n) ? n : 0
  }
  const readVatRate = () => {
    if (ctx.vatRatePercent === undefined || ctx.vatRatePercent === null) {
      return Number(TAXES.vatRatePercent || 0)
    }
    const n = Number(unref(ctx.vatRatePercent))
    return Number.isFinite(n) ? n : Number(TAXES.vatRatePercent || 0)
  }

  function toNet(grossValue) {
    const gross = Number(grossValue)
    if (!Number.isFinite(gross)) return 0
    const rate = readVatRate() / 100
    if (rate <= 0) return gross
    return gross / (1 + rate)
  }

  const selectedVersionId = ref('')
  const selectedColourId = ref('')
  const selectedInteriorColourId = ref('')

  /** Reactive map keeps selection state simple to drive checkboxes. */
  const equipmentSelection = reactive({})
  EQUIPMENT.forEach((item) => {
    equipmentSelection[item.id] = false
  })

  const lockedEquipmentIds = ref([])
  const lockedEquipmentSet = computed(() => new Set(lockedEquipmentIds.value))

  function applyIncludedEquipmentForVersion(versionId) {
    const list = VERSION_INCLUDED_EQUIPMENT?.[versionId] || []
    const ids = Array.isArray(list) ? list.filter(Boolean) : []

    lockedEquipmentIds.value = ids
    for (const id of ids) {
      if (id in equipmentSelection) equipmentSelection[id] = true
    }
  }

  const promoSelection = reactive({})
  PROMOS.forEach((promo) => {
    promoSelection[promo.id] = !!promo.defaultActive
  })

  const accessorySelection = reactive({})
  ACCESSORIES.forEach((acc) => {
    accessorySelection[acc.id] = false
  })

  const userDiscounts = ref([])
  const tradeInApplied = ref(false)
  const selectedPurchaseMethodId = ref('')
  const roundPriceApplied = ref(false)
  const roundPriceAdjustment = ref(0)

  const selectedVersion = computed(() => findVersion(selectedVersionId.value))
  const selectedColour = computed(() => findColour(selectedColourId.value))
  const selectedInteriorColour = computed(() => findColour(selectedInteriorColourId.value))
  const selectedPurchaseMethod = computed(
    () => PURCHASE_METHODS.find((m) => m.id === selectedPurchaseMethodId.value) || null
  )

  const selectedEquipment = computed(() =>
    EQUIPMENT.filter((item) => equipmentSelection[item.id])
  )
  const activePromos = computed(() =>
    PROMOS.filter((promo) => promoSelection[promo.id])
  )
  const selectedAccessories = computed(() =>
    ACCESSORIES.filter((acc) => accessorySelection[acc.id])
  )

  const versionPriceDelta = computed(() => Number(selectedVersion.value?.priceDelta || 0))
  const colourPriceDelta = computed(() => Number(selectedColour.value?.priceDelta || 0))
  const interiorColourPriceDelta = computed(() =>
    Number(selectedInteriorColour.value?.priceDelta || 0)
  )

  const vehicleBasePriceGross = computed(
    () =>
      readModelBase() +
      versionPriceDelta.value +
      colourPriceDelta.value +
      interiorColourPriceDelta.value
  )

  const vehicleBasePrice = computed(() => {
    if (!readShowNetPrices()) return vehicleBasePriceGross.value
    return (
      toNet(readModelBase()) +
      toNet(versionPriceDelta.value) +
      toNet(colourPriceDelta.value) +
      toNet(interiorColourPriceDelta.value)
    )
  })

  const equipmentTotalGross = computed(() =>
    selectedEquipment.value.reduce((sum, item) => sum + Number(item.price || 0), 0)
  )
  const accessoriesTotalGross = computed(() =>
    selectedAccessories.value.reduce((sum, item) => sum + Number(item.price || 0), 0)
  )

  const equipmentTotal = computed(() => {
    if (!readShowNetPrices()) return equipmentTotalGross.value
    return selectedEquipment.value.reduce((sum, item) => sum + toNet(Number(item.price || 0)), 0)
  })
  const accessoriesTotal = computed(() => {
    if (!readShowNetPrices()) return accessoriesTotalGross.value
    return selectedAccessories.value.reduce((sum, item) => sum + toNet(Number(item.price || 0)), 0)
  })
  const promoTotal = computed(() =>
    activePromos.value.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  )
  const discountsTotal = computed(() =>
    userDiscounts.value.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  )

  const tradeInValue = computed(() => (tradeInApplied.value ? TRADE_IN_MOCK_VALUE : 0))

  /**
   * Subtotal: vehicle + equipment + accessories − promo − manual discounts.
   * VAT and registration taxes are applied on top to reach the grand total.
   */
  const subtotal = computed(
    () =>
      vehicleBasePrice.value +
      equipmentTotal.value +
      accessoriesTotal.value -
      (readShowNetPrices() ? toNet(promoTotal.value) : promoTotal.value) -
      (readShowNetPrices() ? toNet(discountsTotal.value) : discountsTotal.value)
  )

  const vatAmount = computed(() => {
    const rate = readVatRate() / 100
    return Math.max(0, subtotal.value) * rate
  })

  const taxesTotal = computed(
    () => vatAmount.value + Number(TAXES.registrationTax || 0) + Number(TAXES.ecoTax || 0)
  )

  const grandTotalRaw = computed(() => subtotal.value + taxesTotal.value - tradeInValue.value)

  const grandTotal = computed(() => {
    if (!roundPriceApplied.value) return grandTotalRaw.value
    return grandTotalRaw.value + roundPriceAdjustment.value
  })

  const isReadyToSave = computed(
    () =>
      Boolean(selectedVersionId.value) &&
      Boolean(selectedColourId.value) &&
      Boolean(selectedInteriorColourId.value)
  )

  const summaryLine = computed(() => {
    const parts = []
    if (selectedVersion.value?.name) parts.push(selectedVersion.value.name)
    if (selectedColour.value?.name) parts.push(selectedColour.value.name)
    if (selectedInteriorColour.value?.name) parts.push(selectedInteriorColour.value.name)
    return parts.join(' – ')
  })

  const specificationLine = computed(() => {
    const v = selectedVersion.value
    if (!v) return ''
    return [v.fuel, v.gearbox].filter(Boolean).join(' – ')
  })

  const configuredImageUrl = computed(
    () => selectedVersion.value?.imageUrl || readModelImage()
  )

  const payload = computed(() => {
    const brand = readBrand()
    const model = readModel()
    const label = [brand, model].filter(Boolean).join(' ').trim()
    return {
      mode: 'configurator',
      brand,
      model,
      label,
      summary: summaryLine.value,
      imageUrl: configuredImageUrl.value,
      quantity: 1,
      price: grandTotal.value,
      specification: specificationLine.value,
      purchaseMethod: selectedPurchaseMethod.value?.label || '',
      interiorColour: selectedInteriorColour.value?.name || '',
    }
  })

  function selectVersion(id) {
    selectedVersionId.value = id || ''
    applyIncludedEquipmentForVersion(selectedVersionId.value)
  }

  function selectColour(id) {
    selectedColourId.value = id || ''
  }

  function selectInteriorColour(id) {
    selectedInteriorColourId.value = id || ''
  }

  function toggleEquipment(id, value) {
    if (!(id in equipmentSelection)) return
    if (lockedEquipmentSet.value.has(id) && value === false) return
    equipmentSelection[id] = value === undefined ? !equipmentSelection[id] : !!value
  }

  function togglePromo(id, value) {
    if (!(id in promoSelection)) return
    promoSelection[id] = value === undefined ? !promoSelection[id] : !!value
  }

  function toggleAccessory(id, value) {
    if (!(id in accessorySelection)) return
    accessorySelection[id] = value === undefined ? !accessorySelection[id] : !!value
  }

  function addDiscount({ label = '', amount = 0 } = {}) {
    const numeric = Number(amount)
    if (!Number.isFinite(numeric) || numeric <= 0) return
    userDiscounts.value = [
      ...userDiscounts.value,
      {
        id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: String(label || 'Discount').trim(),
        amount: numeric,
      },
    ]
  }

  function removeDiscount(id) {
    userDiscounts.value = userDiscounts.value.filter((d) => d.id !== id)
  }

  function setTradeInApplied(value) {
    tradeInApplied.value = !!value
  }

  function selectPurchaseMethod(id) {
    selectedPurchaseMethodId.value = id || ''
  }

  function applyRoundPrice() {
    const raw = Number(grandTotalRaw.value)
    if (!Number.isFinite(raw)) {
      roundPriceAdjustment.value = 0
      roundPriceApplied.value = true
      return
    }

    const rounded = Math.floor(raw / 100) * 100
    roundPriceAdjustment.value = rounded - raw
    roundPriceApplied.value = true
  }

  function updateRoundPriceAdjustment(value) {
    const numeric = Number(value)
    roundPriceAdjustment.value = Number.isFinite(numeric) ? Math.min(0, numeric) : 0
    roundPriceApplied.value = true
  }

  function resetRoundPrice() {
    roundPriceAdjustment.value = 0
    roundPriceApplied.value = false
  }

  function toggleRoundPrice(value) {
    const next = value === undefined ? !roundPriceApplied.value : !!value
    if (next) {
      applyRoundPrice()
      return
    }
    resetRoundPrice()
  }

  function reset() {
    selectedVersionId.value = ''
    selectedColourId.value = ''
    selectedInteriorColourId.value = ''
    lockedEquipmentIds.value = []
    EQUIPMENT.forEach((item) => {
      equipmentSelection[item.id] = false
    })
    PROMOS.forEach((promo) => {
      promoSelection[promo.id] = !!promo.defaultActive
    })
    ACCESSORIES.forEach((acc) => {
      accessorySelection[acc.id] = false
    })
    userDiscounts.value = []
    tradeInApplied.value = false
    selectedPurchaseMethodId.value = ''
    roundPriceApplied.value = false
    roundPriceAdjustment.value = 0
  }

  return {
    catalog: { VERSIONS, COLOURS, EQUIPMENT, PROMOS, ACCESSORIES, PURCHASE_METHODS, TAXES },
    selectedVersionId,
    selectedColourId,
    selectedInteriorColourId,
    equipmentSelection,
    lockedEquipmentIds,
    promoSelection,
    accessorySelection,
    userDiscounts,
    tradeInApplied,
    selectedPurchaseMethodId,
    roundPriceApplied,
    roundPriceAdjustment,
    selectedVersion,
    selectedColour,
    selectedInteriorColour,
    selectedPurchaseMethod,
    selectedEquipment,
    activePromos,
    selectedAccessories,
    vehicleBasePrice,
    versionPriceDelta,
    colourPriceDelta,
    interiorColourPriceDelta,
    equipmentTotal,
    accessoriesTotal,
    promoTotal,
    discountsTotal,
    tradeInValue,
    subtotal,
    vatAmount,
    taxesTotal,
    grandTotalRaw,
    grandTotal,
    isReadyToSave,
    summaryLine,
    specificationLine,
    configuredImageUrl,
    payload,
    findEquipment,
    findPromo,
    findAccessory,
    selectVersion,
    selectColour,
    selectInteriorColour,
    toggleEquipment,
    togglePromo,
    toggleAccessory,
    addDiscount,
    removeDiscount,
    setTradeInApplied,
    selectPurchaseMethod,
    applyRoundPrice,
    updateRoundPriceAdjustment,
    resetRoundPrice,
    toggleRoundPrice,
    reset,
  }
}
