import { computed, ref } from 'vue'
import {
  ACCESSORY_LINE_ITEMS,
  CAMPAIGN_ITEMS,
  DISCOUNT_ITEMS,
  findAccessory,
  findAccessoryLineItem,
  findCampaignItem,
  findDiscountItem,
} from '@/constants/vehicleConfiguratorCatalog'

/**
 * Quotation “Search items…” dialog: item list + apply handlers (shared by configurator + stock modals).
 *
 * @param {import('vue').ComputedRef<object>|object} configurator - Return value of useVehicleConfigurator (or reactive proxy).
 * @param {import('vue').Ref} quotationPanelRef - Ref to QuotationPanel instance.
 */
export function useQuotationItemSearch(configurator, quotationPanelRef) {
  const quotationSearchOpen = ref(false)
  const quotationSearchQuery = ref('')

  function openQuotationSearch() {
    quotationSearchOpen.value = true
  }

  const quotationSearchItems = computed(() => {
    const cfg = configurator?.value ?? configurator
    const out = []

    const promos = Array.isArray(cfg?.catalog?.PROMOS) ? cfg.catalog.PROMOS : []
    for (const p of promos) {
      if (!p) continue
      out.push({
        key: `promo:${p.id ?? p.label}`,
        label: String(p.label ?? '').trim(),
        groupKey: 'promoCampaigns',
        groupLabel: 'Promo and campaigns',
      })
    }

    const discounts = Array.isArray(cfg?.userDiscounts?.value) ? cfg.userDiscounts.value : []
    for (const d of discounts) {
      if (!d) continue
      out.push({
        key: `discount:${d.id ?? d.label}`,
        label: String(d.label ?? 'Discount').trim(),
        groupKey: 'discounts',
        groupLabel: 'Discount',
      })
    }

    for (const item of DISCOUNT_ITEMS) {
      if (!item) continue
      out.push({
        key: `discountItem:${item.id ?? item.label}`,
        label: String(item.label ?? '').trim(),
        groupKey: 'discounts',
        groupLabel: 'Discount',
      })
    }

    for (const item of CAMPAIGN_ITEMS) {
      if (!item) continue
      out.push({
        key: `campaignItem:${item.id ?? item.label}`,
        label: String(item.label ?? '').trim(),
        groupKey: 'promoCampaigns',
        groupLabel: 'Promo and campaigns',
      })
    }

    for (const item of ACCESSORY_LINE_ITEMS) {
      if (!item) continue
      out.push({
        key: `accessoryItem:${item.id}`,
        label: String(item.name ?? '').trim(),
        groupKey: 'accessories',
        groupLabel: 'Accessories and services',
      })
    }

    const userAccessoryLines = Array.isArray(cfg?.userAccessoryLines?.value) ? cfg.userAccessoryLines.value : []
    for (const row of userAccessoryLines) {
      if (!row) continue
      const label = String(row.description || '').trim()
      if (!label) continue
      out.push({
        key: `accessoryLine:${row.id}`,
        label,
        groupKey: 'accessories',
        groupLabel: 'Accessories and services',
      })
    }

    const accessories = Array.isArray(cfg?.catalog?.ACCESSORIES) ? cfg.catalog.ACCESSORIES : []
    for (const a of accessories) {
      if (!a) continue
      out.push({
        key: `accessory:${a.id ?? a.name}`,
        label: String(a.name ?? '').trim(),
        groupKey: 'accessories',
        groupLabel: 'Accessories and services',
      })
    }

    out.push({
      key: 'purchaseMethod:add',
      label: 'Add purchase method',
      groupKey: 'purchaseMethod',
      groupLabel: 'Purchase method',
    })

    const userPurchaseMethods = Array.isArray(cfg?.userPurchaseMethods?.value) ? cfg.userPurchaseMethods.value : []
    for (const row of userPurchaseMethods) {
      if (!row) continue
      const label = String(row.name || '').trim()
      if (!label) continue
      out.push({
        key: `userPurchaseMethod:${row.id}`,
        label,
        groupKey: 'purchaseMethod',
        groupLabel: 'Purchase method',
      })
    }

    const vatRate = Number(cfg?.catalog?.TAXES?.vatRatePercent)
    if (Number.isFinite(vatRate)) {
      out.push({
        key: 'tax:vat',
        label: `VAT (${vatRate}%)`,
        groupKey: 'taxes',
        groupLabel: 'Taxes and extra costs',
      })
    }

    const taxLines = cfg?.extraCostLines?.value
    if (Array.isArray(taxLines)) {
      for (const line of taxLines) {
        if (!line) continue
        const label = String(line.description || '').trim()
        if (!label) continue
        out.push({
          key: `taxLine:${line.id}`,
          label,
          groupKey: 'taxes',
          groupLabel: 'Taxes and extra costs',
        })
      }
    }

    out.push({
      key: 'tradeIn:add',
      label: 'Trade-in vehicle',
      groupKey: 'tradeIn',
      groupLabel: 'Trade-in',
    })

    const userTradeInLines = Array.isArray(cfg?.userTradeInLines?.value) ? cfg.userTradeInLines.value : []
    for (const row of userTradeInLines) {
      if (!row) continue
      const label = String(row.title || '').trim() || 'Trade-in'
      out.push({
        key: `tradeInLine:${row.id}`,
        label,
        groupKey: 'tradeIn',
        groupLabel: 'Trade-in',
      })
    }

    return out.filter((i) => i.label)
  })

  const filteredQuotationSearchItems = computed(() => {
    const q = quotationSearchQuery.value.trim().toLowerCase()
    const list = quotationSearchItems.value
    if (!q) return list
    return list.filter((i) => i.label.toLowerCase().includes(q))
  })

  function selectQuotationSearchItem(item) {
    if (!item) return
    quotationSearchOpen.value = false
    quotationSearchQuery.value = ''
    const key = String(item.key || '')
    if (item.groupKey === 'discounts' && key.startsWith('discountItem:')) {
      const id = key.slice('discountItem:'.length)
      const discount = findDiscountItem(id)
      const percent = Number(discount?.percent)
      quotationPanelRef.value?.addDiscountFromSearch?.({
        description: String(item.label || '').trim(),
        percent: Number.isFinite(percent) ? percent : -2,
      })
      return
    }
    if (item.groupKey === 'promoCampaigns' && key.startsWith('campaignItem:')) {
      const id = key.slice('campaignItem:'.length)
      const tpl = findCampaignItem(id)
      quotationPanelRef.value?.addCampaignFromSearch?.({
        description: String(item.label || '').trim(),
        percent: Number(tpl?.percent) || 0,
        amount: Number(tpl?.amount) || 0,
      })
      return
    }
    if (item.groupKey === 'accessories' && key.startsWith('accessoryItem:')) {
      const id = key.slice('accessoryItem:'.length)
      const tpl = findAccessoryLineItem(id)
      quotationPanelRef.value?.addAccessoryFromSearch?.({
        description: String(tpl?.name || item.label || '').trim(),
        price: Number(tpl?.price) || 0,
      })
      return
    }
    if (item.groupKey === 'accessories' && key.startsWith('accessory:')) {
      const id = key.slice('accessory:'.length)
      const acc = findAccessory(id)
      quotationPanelRef.value?.addAccessoryFromSearch?.({
        description: String(acc?.name || item.label || '').trim(),
        price: Math.max(0, Number(acc?.price) || 0),
      })
      return
    }
    if (item.groupKey === 'purchaseMethod' && key === 'purchaseMethod:add') {
      quotationPanelRef.value?.addPurchaseMethodFromSearch?.()
      return
    }
    if (item.groupKey === 'purchaseMethod' && key.startsWith('userPurchaseMethod:')) {
      quotationPanelRef.value?.openSection?.('purchaseMethod')
      return
    }
    if (item.groupKey === 'tradeIn' && key === 'tradeIn:add') {
      quotationPanelRef.value?.addTradeInFromSearch?.({})
      return
    }
    if (item.groupKey === 'tradeIn' && key.startsWith('tradeInLine:')) {
      quotationPanelRef.value?.openSection?.('tradeIn')
      return
    }
    quotationPanelRef.value?.openSection?.(item.groupKey)
  }

  return {
    quotationSearchOpen,
    quotationSearchQuery,
    quotationSearchItems,
    filteredQuotationSearchItems,
    selectQuotationSearchItem,
    openQuotationSearch,
  }
}
