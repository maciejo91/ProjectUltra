import { computed, reactive, ref, unref } from 'vue'
import {
  ACCESSORIES,
  ACCESSORY_LINE_ITEMS,
  COLOURS,
  createTaxExtraCostLinesFromSeeds,
  EQUIPMENT,
  PROMOS,
  PURCHASE_METHODS,
  TAXES,
  TRADE_IN_MOCK_VALUE,
  VERSION_INCLUDED_EQUIPMENT,
  VERSIONS,
  findColour,
  findEquipment,
  findPromo,
  findVersion,
  promoIdsForTrimLabel,
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

  const userDiscounts = ref([])
  /** User-entered accessory / service lines (gross €); not tied to Equipment tab. */
  const userAccessoryLines = ref([])
  const userCampaigns = ref([])
  const tradeInApplied = ref(false)
  const selectedPurchaseMethodId = ref('')
  const roundPriceApplied = ref(false)
  const roundPriceAdjustment = ref(0)

  const extraCostLines = ref(createTaxExtraCostLinesFromSeeds())

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

  const activePromoIds = computed(() => activePromos.value.map((p) => p.id))

  const disabledPromoIds = computed(() => {
    const active = new Set(activePromoIds.value)
    const disabled = new Set()

    for (const promoId of active) {
      const promo = findPromo(promoId)
      const list = Array.isArray(promo?.incompatibleWith) ? promo.incompatibleWith : []
      for (const blockedId of list) {
        if (!active.has(blockedId)) disabled.add(blockedId)
      }
    }

    return Array.from(disabled)
  })
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
    userAccessoryLines.value.reduce((sum, row) => sum + Math.max(0, Number(row.price || 0)), 0)
  )

  const equipmentTotal = computed(() => {
    if (!readShowNetPrices()) return equipmentTotalGross.value
    return selectedEquipment.value.reduce((sum, item) => sum + toNet(Number(item.price || 0)), 0)
  })
  const accessoriesTotal = computed(() => {
    if (!readShowNetPrices()) return accessoriesTotalGross.value
    return userAccessoryLines.value.reduce(
      (sum, row) => sum + toNet(Math.max(0, Number(row.price || 0))),
      0
    )
  })
  const promoTotal = computed(() =>
    activePromos.value.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  )
  // Sum of discount magnitudes (stored rows are negative).
  const discountsTotalNet = computed(() =>
    userDiscounts.value.reduce((sum, item) => sum + Math.abs(Number(item.netAmount ?? item.amount ?? 0)), 0)
  )
  const discountsTotalGross = computed(() =>
    userDiscounts.value.reduce((sum, item) => sum + Math.abs(Number(item.grossAmount ?? item.amount ?? 0)), 0)
  )
  const discountsTotal = computed(() => (readShowNetPrices() ? discountsTotalNet.value : discountsTotalGross.value))

  const campaignTotalNet = computed(() =>
    userCampaigns.value
      .filter((c) => c.active)
      .reduce((sum, c) => sum + Math.abs(Number(c.netAmount ?? c.amount ?? 0)), 0)
  )
  const campaignTotalGross = computed(() =>
    userCampaigns.value
      .filter((c) => c.active)
      .reduce((sum, c) => sum + Math.abs(Number(c.grossAmount ?? c.amount ?? 0)), 0)
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
      (readShowNetPrices() ? discountsTotalNet.value : discountsTotalGross.value) -
      (readShowNetPrices() ? campaignTotalNet.value : campaignTotalGross.value)
  )

  const vatAmount = computed(() => {
    const rate = readVatRate() / 100
    return Math.max(0, subtotal.value) * rate
  })

  const extraCostsLinesTotalGross = computed(() =>
    extraCostLines.value.reduce((sum, row) => sum + Math.max(0, Number(row.grossAmount || 0)), 0)
  )

  const taxesTotal = computed(() => vatAmount.value + extraCostsLinesTotalGross.value)

  function rowVatRate(row) {
    const r = Number(row?.vatRatePercent)
    if (Number.isFinite(r) && r >= 0) return r
    return readVatRate()
  }

  function alignExtraCostLineDerived(row) {
    const rate = rowVatRate(row)
    const factor = 1 + rate / 100
    if (readShowNetPrices()) {
      const net = Number(row.netAmount)
      const n = Number.isFinite(net) ? Math.max(0, net) : 0
      row.grossAmount = factor > 0 ? n * factor : n
      return
    }
    const gross = Number(row.grossAmount)
    const g = Number.isFinite(gross) ? Math.max(0, gross) : 0
    row.netAmount = factor > 0 ? g / factor : g
  }

  function addTaxExtraCostLine() {
    const next = {
      id: `tax-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: 'user',
      removable: true,
      description: '',
      descriptionEditable: true,
      amountsEditable: true,
      vatEditable: true,
      netAmount: 0,
      grossAmount: 0,
      vatRatePercent: readVatRate(),
    }
    alignExtraCostLineDerived(next)
    extraCostLines.value = [...extraCostLines.value, next]
  }

  function removeTaxExtraCostLine(id) {
    extraCostLines.value = extraCostLines.value.filter((row) => {
      if (row.id !== id) return true
      return row.kind === 'user' && row.removable
    })
  }

  function updateTaxExtraCostLine(id, patch = {}) {
    const list = extraCostLines.value
    const idx = list.findIndex((r) => r.id === id)
    if (idx < 0) return
    const row = list[idx]
    if (!row) return

    if (patch.description !== undefined && row.descriptionEditable) {
      row.description = String(patch.description || '')
    }
    if (patch.vatRatePercent !== undefined && row.vatEditable) {
      const n = Number(patch.vatRatePercent)
      row.vatRatePercent = Number.isFinite(n) ? Math.max(0, n) : readVatRate()
    }

    if (row.amountsEditable) {
      if (readShowNetPrices() && patch.netAmount !== undefined && patch.netAmount !== null) {
        const n = Number(patch.netAmount)
        row.netAmount = Number.isFinite(n) ? Math.max(0, n) : 0
      } else if (!readShowNetPrices() && patch.grossAmount !== undefined && patch.grossAmount !== null) {
        const g = Number(patch.grossAmount)
        row.grossAmount = Number.isFinite(g) ? Math.max(0, g) : 0
      }
    }

    alignExtraCostLineDerived(row)
    extraCostLines.value = [...list]
  }

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
    applyDefaultPromosForVersion(selectedVersion.value)
  }

  function extractTrimLabelFromVersionName(versionName) {
    const name = String(versionName || '').trim()
    if (!name) return ''
    // Heuristic: the trim label is the first two tokens in our mock data (e.g. "Identity black 30 TFSI S").
    const parts = name.split(/\s+/).filter(Boolean)
    return parts.slice(0, 2).join(' ')
  }

  function applyDefaultPromosForVersion(version) {
    const trimLabel = extractTrimLabelFromVersionName(version?.name)
    const linkedPromoIds = promoIdsForTrimLabel(trimLabel)

    for (const promo of PROMOS) {
      promoSelection[promo.id] = !!promo.defaultActive
    }
    for (const id of linkedPromoIds) {
      if (id in promoSelection) promoSelection[id] = true
    }
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
    const next = value === undefined ? !promoSelection[id] : !!value
    if (next === true && disabledPromoIds.value.includes(id)) return

    if (next === true) {
      for (const otherId of activePromoIds.value) {
        if (otherId === id) continue
        const other = findPromo(otherId)
        const incompatible = Array.isArray(other?.incompatibleWith) ? other.incompatibleWith : []
        if (incompatible.includes(id)) promoSelection[otherId] = false
      }
    }
    promoSelection[id] = next
  }

  function addAccessoryLine({ description = '', price = 0 } = {}) {
    const next = {
      id: `as-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      description: String(description || '').trim(),
      price: Math.max(0, Number(price) || 0),
    }
    userAccessoryLines.value = [...userAccessoryLines.value, next]
  }

  function updateAccessoryLine(id, patch = {}) {
    const list = userAccessoryLines.value
    const idx = list.findIndex((row) => row.id === id)
    if (idx < 0) return
    const current = { ...list[idx] }
    if (patch.description !== undefined) {
      current.description = String(patch.description ?? '').trim()
    }
    if (patch.price !== undefined) {
      const n = Number(patch.price)
      current.price = Number.isFinite(n) ? Math.max(0, n) : 0
    }
    const next = [...list]
    next[idx] = current
    userAccessoryLines.value = next
  }

  function removeAccessoryLine(id) {
    userAccessoryLines.value = userAccessoryLines.value.filter((row) => row.id !== id)
  }

  const discountBaseGross = computed(() => {
    // Vehicle discounts apply to the vehicle price net of applied promotions (excluding taxes and accessories).
    const base = Number(vehicleBasePriceGross.value || 0) - Number(promoTotal.value || 0)
    return Number.isFinite(base) ? Math.max(0, base) : 0
  })

  const discountBaseNet = computed(() => toNet(discountBaseGross.value))

  function discountVatRate(discount) {
    const row = Number(discount?.vatRatePercent)
    if (Number.isFinite(row) && row >= 0) return row
    return readVatRate()
  }

  function alignDiscountFromPercent(discount) {
    const base = readShowNetPrices() ? discountBaseNet.value : discountBaseGross.value
    const percent = Number(discount?.percent || 0)
    const p = Number.isFinite(percent) ? percent : 0
    const percentNegative = -Math.abs(p)
    const amount = base > 0 ? (base * percentNegative) / 100 : 0
    discount.percent = percentNegative
    const aligned = -Math.abs(amount)
    if (readShowNetPrices()) {
      discount.netAmount = aligned
      discount.grossAmount = aligned * (1 + discountVatRate(discount) / 100)
      discount.amount = discount.netAmount
      return
    }
    discount.grossAmount = aligned
    discount.netAmount = aligned / (1 + discountVatRate(discount) / 100)
    discount.amount = discount.grossAmount
  }

  function alignDiscountFromAmount(discount) {
    const base = readShowNetPrices() ? discountBaseNet.value : discountBaseGross.value
    const amount = Number(discount?.amount || 0)
    const a = Number.isFinite(amount) ? amount : 0
    const amountNegative = -Math.abs(a)
    const percent = base > 0 ? (amountNegative / base) * 100 : 0
    if (readShowNetPrices()) {
      discount.netAmount = amountNegative
      discount.grossAmount = amountNegative * (1 + discountVatRate(discount) / 100)
      discount.amount = discount.netAmount
    } else {
      discount.grossAmount = amountNegative
      discount.netAmount = amountNegative / (1 + discountVatRate(discount) / 100)
      discount.amount = discount.grossAmount
    }
    discount.percent = -Math.abs(percent)
  }

  function addDiscount({ description = '', percent = 0, amount = 0 } = {}) {
    const next = {
      id: `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      description: String(description || '').trim(),
      percent: Number(percent) || 0,
      amount: Number(amount) || 0,
      netAmount: 0,
      grossAmount: 0,
      vatRatePercent: readVatRate(),
    }
    // Default: if user typed percent, we recompute amount; otherwise keep amount as-is.
    if (Number(next.percent || 0) !== 0) {
      alignDiscountFromPercent(next)
    } else {
      alignDiscountFromAmount(next)
    }
    userDiscounts.value = [...userDiscounts.value, next]
  }

  function updateDiscount(id, patch = {}) {
    const list = userDiscounts.value
    const idx = list.findIndex((d) => d.id === id)
    if (idx < 0) return
    const current = list[idx]
    if (!current) return

    if (patch.description !== undefined) current.description = String(patch.description || '')
    const hasPercent = patch.percent !== undefined && patch.percent !== null
    const hasAmount = patch.amount !== undefined && patch.amount !== null

    if (hasPercent) {
      const n = Number(patch.percent)
      current.percent = Number.isFinite(n) ? -Math.abs(n) : 0
      alignDiscountFromPercent(current)
    } else if (hasAmount) {
      const n = Number(patch.amount)
      current.amount = Number.isFinite(n) ? -Math.abs(n) : 0
      alignDiscountFromAmount(current)
    }

    userDiscounts.value = [...list]
  }

  function updateDiscountVat(id, vatRatePercent) {
    const list = userDiscounts.value
    const idx = list.findIndex((d) => d.id === id)
    if (idx < 0) return
    const current = list[idx]
    if (!current) return

    const n = Number(vatRatePercent)
    current.vatRatePercent = Number.isFinite(n) ? Math.max(0, n) : readVatRate()

    // Recompute derived amounts keeping the currently edited mode stable.
    if (readShowNetPrices()) {
      const net = -Math.abs(Number(current.netAmount ?? current.amount ?? 0))
      current.netAmount = net
      current.grossAmount = net * (1 + discountVatRate(current) / 100)
      current.amount = current.netAmount
    } else {
      const gross = -Math.abs(Number(current.grossAmount ?? current.amount ?? 0))
      current.grossAmount = gross
      current.netAmount = gross / (1 + discountVatRate(current) / 100)
      current.amount = current.grossAmount
    }

    userDiscounts.value = [...list]
  }

  function removeDiscount(id) {
    userDiscounts.value = userDiscounts.value.filter((d) => d.id !== id)
  }

  function campaignVatRate(row) {
    const r = Number(row?.vatRatePercent)
    if (Number.isFinite(r) && r >= 0) return r
    return readVatRate()
  }

  function alignCampaignFromPercent(row) {
    const base = readShowNetPrices() ? discountBaseNet.value : discountBaseGross.value
    const percent = Number(row?.percent || 0)
    const p = Number.isFinite(percent) ? percent : 0
    const percentNegative = -Math.abs(p)
    const amount = base > 0 ? (base * percentNegative) / 100 : 0
    row.percent = percentNegative
    const aligned = -Math.abs(amount)
    if (readShowNetPrices()) {
      row.netAmount = aligned
      row.grossAmount = aligned * (1 + campaignVatRate(row) / 100)
      row.amount = row.netAmount
      return
    }
    row.grossAmount = aligned
    row.netAmount = aligned / (1 + campaignVatRate(row) / 100)
    row.amount = row.grossAmount
  }

  function alignCampaignFromAmount(row) {
    const base = readShowNetPrices() ? discountBaseNet.value : discountBaseGross.value
    const amount = Number(row?.amount || 0)
    const a = Number.isFinite(amount) ? amount : 0
    const amountNegative = -Math.abs(a)
    const percent = base > 0 ? (amountNegative / base) * 100 : 0
    if (readShowNetPrices()) {
      row.netAmount = amountNegative
      row.grossAmount = amountNegative * (1 + campaignVatRate(row) / 100)
      row.amount = row.netAmount
    } else {
      row.grossAmount = amountNegative
      row.netAmount = amountNegative / (1 + campaignVatRate(row) / 100)
      row.amount = row.grossAmount
    }
    row.percent = -Math.abs(percent)
  }

  function addCampaign({ description = '', percent = 0, amount = 0, active = true } = {}) {
    const next = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      description: String(description || '').trim(),
      active: !!active,
      percent: Number(percent) || 0,
      amount: Number(amount) || 0,
      netAmount: 0,
      grossAmount: 0,
      vatRatePercent: readVatRate(),
    }
    if (Number(next.percent || 0) !== 0) {
      alignCampaignFromPercent(next)
    } else {
      alignCampaignFromAmount(next)
    }
    userCampaigns.value = [...userCampaigns.value, next]
  }

  function updateCampaign(id, patch = {}) {
    const list = userCampaigns.value
    const idx = list.findIndex((c) => c.id === id)
    if (idx < 0) return
    const current = list[idx]
    if (!current) return

    if (patch.description !== undefined) current.description = String(patch.description || '')
    if (patch.active !== undefined) current.active = !!patch.active
    const hasPercent = patch.percent !== undefined && patch.percent !== null
    const hasAmount = patch.amount !== undefined && patch.amount !== null

    if (hasPercent) {
      const n = Number(patch.percent)
      current.percent = Number.isFinite(n) ? -Math.abs(n) : 0
      alignCampaignFromPercent(current)
    } else if (hasAmount) {
      const n = Number(patch.amount)
      current.amount = Number.isFinite(n) ? -Math.abs(n) : 0
      alignCampaignFromAmount(current)
    }

    userCampaigns.value = [...list]
  }

  function updateCampaignVat(id, vatRatePercent) {
    const list = userCampaigns.value
    const idx = list.findIndex((c) => c.id === id)
    if (idx < 0) return
    const current = list[idx]
    if (!current) return

    const n = Number(vatRatePercent)
    current.vatRatePercent = Number.isFinite(n) ? Math.max(0, n) : readVatRate()

    if (readShowNetPrices()) {
      const net = -Math.abs(Number(current.netAmount ?? current.amount ?? 0))
      current.netAmount = net
      current.grossAmount = net * (1 + campaignVatRate(current) / 100)
      current.amount = current.netAmount
    } else {
      const gross = -Math.abs(Number(current.grossAmount ?? current.amount ?? 0))
      current.grossAmount = gross
      current.netAmount = gross / (1 + campaignVatRate(current) / 100)
      current.amount = current.grossAmount
    }

    userCampaigns.value = [...list]
  }

  function removeCampaign(id) {
    userCampaigns.value = userCampaigns.value.filter((c) => c.id !== id)
  }

  function toggleCampaignActive(id, value) {
    const list = userCampaigns.value
    const idx = list.findIndex((c) => c.id === id)
    if (idx < 0) return
    const current = list[idx]
    if (!current) return
    current.active = value === undefined ? !current.active : !!value
    userCampaigns.value = [...list]
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
    userAccessoryLines.value = []
    userDiscounts.value = []
    userCampaigns.value = []
    tradeInApplied.value = false
    selectedPurchaseMethodId.value = ''
    roundPriceApplied.value = false
    roundPriceAdjustment.value = 0
    extraCostLines.value = createTaxExtraCostLinesFromSeeds()
  }

  return {
    catalog: { VERSIONS, COLOURS, EQUIPMENT, PROMOS, ACCESSORIES, ACCESSORY_LINE_ITEMS, PURCHASE_METHODS, TAXES },
    selectedVersionId,
    selectedColourId,
    selectedInteriorColourId,
    equipmentSelection,
    lockedEquipmentIds,
    promoSelection,
    disabledPromoIds,
    userDiscounts,
    userAccessoryLines,
    userCampaigns,
    discountBaseGross,
    discountBaseNet,
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
    vehicleBasePrice,
    versionPriceDelta,
    colourPriceDelta,
    interiorColourPriceDelta,
    equipmentTotal,
    accessoriesTotal,
    promoTotal,
    discountsTotal,
    campaignTotalNet,
    campaignTotalGross,
    tradeInValue,
    subtotal,
    vatAmount,
    extraCostLines,
    taxesTotal,
    addTaxExtraCostLine,
    removeTaxExtraCostLine,
    updateTaxExtraCostLine,
    grandTotalRaw,
    grandTotal,
    isReadyToSave,
    summaryLine,
    specificationLine,
    configuredImageUrl,
    payload,
    findEquipment,
    findPromo,
    selectVersion,
    selectColour,
    selectInteriorColour,
    toggleEquipment,
    togglePromo,
    addDiscount,
    addAccessoryLine,
    updateAccessoryLine,
    removeAccessoryLine,
    updateDiscount,
    updateDiscountVat,
    removeDiscount,
    addCampaign,
    updateCampaign,
    updateCampaignVat,
    removeCampaign,
    toggleCampaignActive,
    setTradeInApplied,
    selectPurchaseMethod,
    applyRoundPrice,
    updateRoundPriceAdjustment,
    resetRoundPrice,
    toggleRoundPrice,
    reset,
  }
}
