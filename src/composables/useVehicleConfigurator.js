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
  taxExtraCostLineIsRemovable,
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
  /** User trade-in rows (valuation € deducted from grand total). */
  const userTradeInLines = ref([])
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

  function accessoryLineVatRate(row) {
    const r = Number(row?.vatRatePercent)
    if (Number.isFinite(r) && r >= 0) return r
    return readVatRate()
  }

  const equipmentTotal = computed(() => {
    if (!readShowNetPrices()) return equipmentTotalGross.value
    return selectedEquipment.value.reduce((sum, item) => sum + toNet(Number(item.price || 0)), 0)
  })
  const accessoriesTotal = computed(() => {
    if (!readShowNetPrices()) return accessoriesTotalGross.value
    return userAccessoryLines.value.reduce((sum, row) => {
      const gross = Math.max(0, Number(row.price || 0))
      const r = accessoryLineVatRate(row) / 100
      if (r <= 0) return sum + gross
      return sum + gross / (1 + r)
    }, 0)
  })
  /** Fixed EUR OEM promos only; percent-based OEM lines use amount 0 in catalog. */
  const oemAmountPromoTotalGross = computed(() =>
    activePromos.value.reduce((sum, item) => {
      if (item.discountType === 'percent') return sum
      return sum + Math.abs(Number(item.amount || 0))
    }, 0)
  )

  const discountBaseGross = computed(() => {
    // Matches QuotationPanel: % OEM and manual discounts apply to vehicle minus fixed OEM promos.
    const base = Number(vehicleBasePriceGross.value || 0) - oemAmountPromoTotalGross.value
    return Number.isFinite(base) ? Math.max(0, base) : 0
  })

  const discountBaseNet = computed(() => toNet(discountBaseGross.value))

  /** Total OEM promo reduction (gross €): fixed amounts + % of discountBaseGross per active percent promo. */
  const promoTotal = computed(() => {
    const fixed = oemAmountPromoTotalGross.value
    const base = discountBaseGross.value
    const fromPercent = activePromos.value
      .filter((p) => p.discountType === 'percent')
      .reduce((sum, p) => {
        const pct = Math.abs(Number(p.discountPercent))
        if (!Number.isFinite(pct) || base <= 0) return sum
        return sum + (base * pct) / 100
      }, 0)
    return fixed + fromPercent
  })

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

  /** OEM promos + active dealer campaigns, same net/gross basis as row amounts in the offer summary. */
  const offerSummaryPromoTotal = computed(() => {
    const oem = readShowNetPrices() ? toNet(promoTotal.value) : promoTotal.value
    const campaigns = readShowNetPrices() ? campaignTotalNet.value : campaignTotalGross.value
    return oem + campaigns
  })

  const tradeInApplied = computed(() => userTradeInLines.value.length > 0)

  const tradeInValue = computed(() =>
    userTradeInLines.value.reduce((sum, row) => sum + Math.max(0, Number(row?.valuation || 0)), 0),
  )

  /** Vehicle + equipment − promos/campaigns − discounts (excludes accessories; used in offer summary layout). */
  const offerSummarySubtotalBeforeAccessories = computed(
    () =>
      vehicleBasePrice.value +
      equipmentTotal.value -
      offerSummaryPromoTotal.value -
      (readShowNetPrices() ? discountsTotalNet.value : discountsTotalGross.value)
  )

  /**
   * Taxable subtotal: vehicle + equipment + accessories − promo − campaigns − discounts.
   * VAT and registration taxes are applied on top to reach the grand total.
   */
  const subtotal = computed(() => offerSummarySubtotalBeforeAccessories.value + accessoriesTotal.value)

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
      description: '',
      descriptionEditable: true,
      amountsEditable: true,
      vatEditable: true,
      netAmount: 0,
      grossAmount: 0,
      vatRatePercent: readVatRate(),
      vatOptionId: 'vat-22',
    }
    alignExtraCostLineDerived(next)
    next.removable = taxExtraCostLineIsRemovable(next)
    extraCostLines.value = [...extraCostLines.value, next]
  }

  function removeTaxExtraCostLine(id) {
    extraCostLines.value = extraCostLines.value.filter((row) => {
      if (row.id !== id) return true
      return !taxExtraCostLineIsRemovable(row)
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
    if (patch.vatOptionId !== undefined && row.vatEditable) {
      row.vatOptionId = String(patch.vatOptionId || '')
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
      vatRatePercent: readVatRate(),
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
    if (patch.vatRatePercent !== undefined) {
      const oldRate = accessoryLineVatRate(current)
      let newV = Number(patch.vatRatePercent)
      if (!Number.isFinite(newV) || newV < 0) newV = readVatRate()
      current.vatRatePercent = newV
      if (readShowNetPrices()) {
        const gross = Math.max(0, Number(current.price || 0))
        const oldFactor = 1 + oldRate / 100
        const net = oldFactor > 0 ? gross / oldFactor : gross
        const newFactor = 1 + accessoryLineVatRate(current) / 100
        current.price = newFactor > 0 ? net * newFactor : net
      }
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

  function addTradeInLine(payload = {}) {
    const p = payload && typeof payload === 'object' ? payload : {}
    const valNum = Number(p.valuation)
    const valuation =
      p.valuation !== undefined && p.valuation !== null && String(p.valuation).trim() !== '' && Number.isFinite(valNum)
        ? Math.max(0, valNum)
        : TRADE_IN_MOCK_VALUE
    const mainNum = Number(p.mainOfferEvaluation)
    const mainOfferEvaluation =
      p.mainOfferEvaluation !== undefined &&
      p.mainOfferEvaluation !== null &&
      String(p.mainOfferEvaluation).trim() !== '' &&
      Number.isFinite(mainNum)
        ? Math.max(0, mainNum)
        : 0

    const brand = String(p.brand || '').trim()
    const model = String(p.model || '').trim()
    const title =
      String(p.title || '').trim() ||
      (brand && model ? `${brand} ${model}`.trim() : '') ||
      String(p.description || '').trim() ||
      'Trade-in'

    const trimLine = String(p.trimLine || p.version || '').trim()
    const next = {
      id: `ti-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      vehicleClass: String(p.vehicleClass || 'car'),
      brand,
      model,
      title,
      version: trimLine,
      trimLine,
      firstRegistration: String(p.firstRegistration || '').trim(),
      mileageLabel: String(p.mileageLabel || '').trim(),
      licensePlate: String(p.licensePlate || '').trim(),
      valuation: Number.isFinite(valuation) ? valuation : TRADE_IN_MOCK_VALUE,
      mainOfferEvaluation: Number.isFinite(mainOfferEvaluation) ? mainOfferEvaluation : 0,
      fuelType: String(p.fuelType || '').trim(),
      gearType: String(p.gearType || '').trim(),
      colour: String(p.colour || '').trim(),
      owner: String(p.owner || '').trim(),
      vatDeductible: p.vatDeductible === true,
    }
    userTradeInLines.value = [...userTradeInLines.value, next]
  }

  function updateTradeInLine(id, patch = {}) {
    const list = userTradeInLines.value
    const idx = list.findIndex((row) => row.id === id)
    if (idx < 0) return
    const current = { ...list[idx] }
    if (patch.vehicleClass !== undefined) current.vehicleClass = String(patch.vehicleClass || 'car')
    if (patch.brand !== undefined) current.brand = String(patch.brand ?? '').trim()
    if (patch.model !== undefined) current.model = String(patch.model ?? '').trim()
    if (patch.title !== undefined) current.title = String(patch.title ?? '').trim()
    if (patch.trimLine !== undefined || patch.version !== undefined) {
      const trim =
        patch.trimLine !== undefined
          ? String(patch.trimLine ?? '').trim()
          : String(current.trimLine ?? '').trim()
      const ver =
        patch.version !== undefined
          ? String(patch.version ?? '').trim()
          : String(current.version ?? current.trimLine ?? '').trim()
      const v = String(trim || ver || '').trim()
      current.trimLine = v
      current.version = v
    }
    if (patch.firstRegistration !== undefined) {
      current.firstRegistration = String(patch.firstRegistration ?? '').trim()
    }
    if (patch.mileageLabel !== undefined) current.mileageLabel = String(patch.mileageLabel ?? '').trim()
    if (patch.licensePlate !== undefined) current.licensePlate = String(patch.licensePlate ?? '').trim()
    if (patch.valuation !== undefined) {
      const n = Number(patch.valuation)
      current.valuation = Number.isFinite(n) ? Math.max(0, n) : 0
    }
    if (patch.mainOfferEvaluation !== undefined) {
      const n = Number(patch.mainOfferEvaluation)
      current.mainOfferEvaluation = Number.isFinite(n) ? Math.max(0, n) : 0
    }
    if (patch.fuelType !== undefined) current.fuelType = String(patch.fuelType ?? '').trim()
    if (patch.gearType !== undefined) current.gearType = String(patch.gearType ?? '').trim()
    if (patch.colour !== undefined) current.colour = String(patch.colour ?? '').trim()
    if (patch.owner !== undefined) current.owner = String(patch.owner ?? '').trim()
    if (patch.vatDeductible !== undefined) current.vatDeductible = patch.vatDeductible === true

    if (patch.brand !== undefined || patch.model !== undefined || patch.title !== undefined) {
      const b = String(current.brand || '').trim()
      const m = String(current.model || '').trim()
      const t = String(current.title || '').trim()
      current.title = t || (b && m ? `${b} ${m}`.trim() : '') || 'Trade-in'
    }

    const next = [...list]
    next[idx] = current
    userTradeInLines.value = next
  }

  function removeTradeInLine(id) {
    userTradeInLines.value = userTradeInLines.value.filter((row) => row.id !== id)
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
    userTradeInLines.value = []
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
    userTradeInLines,
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
    offerSummaryPromoTotal,
    discountsTotal,
    campaignTotalNet,
    campaignTotalGross,
    offerSummarySubtotalBeforeAccessories,
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
    addTradeInLine,
    updateTradeInLine,
    removeTradeInLine,
    selectPurchaseMethod,
    applyRoundPrice,
    updateRoundPriceAdjustment,
    resetRoundPrice,
    toggleRoundPrice,
    reset,
  }
}
