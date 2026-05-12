/**
 * Shared mock catalog used by the VehicleConfiguratorModal Step 3 (Configuration).
 * Same data is used for every model — the catalog is intentionally generic
 * (per-brand and per-model catalogs are out of scope for this iteration).
 */

const SHARED_CONFIGURED_IMAGE_URL =
  'https://cdn-datak.motork.net/configurator-icon/cars/it/400/AUDI/A1-SPORTBACK/32536_BERLINA-5-PORTE/audi-a1-sportback-2018-icona.png'

export const VERSIONS = [
  {
    id: 'v-30-tfsi-s',
    name: 'Identity black 30 TFSI S',
    engine: '30 TFSI',
    fuel: 'Petrol',
    gearbox: 'Manual',
    drivetrain: 'front-wheel',
    kw: 81,
    hp: 110,
    co2Gkm: 129,
    consumptionL100km: 5.5,
    doors: 5,
    priceDelta: 0,
    imageUrl: SHARED_CONFIGURED_IMAGE_URL,
  },
  {
    id: 'v-35-tfsi-auto',
    name: 'Identity black 35 TFSI S tronic',
    engine: '35 TFSI',
    fuel: 'Petrol',
    gearbox: 'Automatic',
    drivetrain: 'front-wheel',
    kw: 110,
    hp: 150,
    co2Gkm: 130,
    consumptionL100km: 5.7,
    doors: 5,
    priceDelta: 2_500,
    imageUrl: SHARED_CONFIGURED_IMAGE_URL,
  },
  {
    id: 'v-30-tdi-s',
    name: 'Business 30 TDI',
    engine: '30 TDI',
    fuel: 'Diesel',
    gearbox: 'Manual',
    drivetrain: 'front-wheel',
    kw: 85,
    hp: 116,
    co2Gkm: 118,
    consumptionL100km: 4.6,
    doors: 5,
    priceDelta: 1_800,
    imageUrl: SHARED_CONFIGURED_IMAGE_URL,
  },
  {
    id: 'v-35-tdi-auto',
    name: 'S line 35 TDI S tronic',
    engine: '35 TDI',
    fuel: 'Diesel',
    gearbox: 'Automatic',
    drivetrain: 'front-wheel',
    kw: 110,
    hp: 150,
    co2Gkm: 123,
    consumptionL100km: 4.9,
    doors: 5,
    priceDelta: 4_900,
    imageUrl: SHARED_CONFIGURED_IMAGE_URL,
  },
  {
    id: 'v-40-tfsi-e',
    name: 'S line 40 TFSI e plug-in hybrid',
    engine: '40 TFSI e',
    fuel: 'Hybrid',
    gearbox: 'Automatic',
    drivetrain: 'front-wheel',
    kw: 150,
    hp: 204,
    co2Gkm: 39,
    consumptionL100km: 1.8,
    doors: 5,
    priceDelta: 7_400,
    imageUrl: SHARED_CONFIGURED_IMAGE_URL,
  },
]

export const COLOURS = [
  {
    id: 'c-ibis-white',
    name: 'Ibis white',
    hex: '#F4F4F2',
    finish: 'Solid',
    category: 'exterior',
    subgroup: 'Solid',
    priceDelta: 0,
  },
  {
    id: 'c-mythos-black',
    name: 'Mythos black',
    hex: '#1A1A1A',
    finish: 'Metallic',
    category: 'exterior',
    subgroup: 'Metallic',
    priceDelta: 600,
  },
  {
    id: 'c-glacier-white',
    name: 'Glacier white',
    hex: '#E9E9E1',
    finish: 'Metallic',
    category: 'exterior',
    subgroup: 'Metallic',
    priceDelta: 600,
  },
  {
    id: 'c-floret-silver',
    name: 'Floret silver',
    hex: '#B7B9B6',
    finish: 'Metallic',
    category: 'exterior',
    subgroup: 'Metallic',
    priceDelta: 600,
  },
  {
    id: 'c-manhattan-grey',
    name: 'Manhattan grey',
    hex: '#5C5E62',
    finish: 'Metallic',
    category: 'exterior',
    subgroup: 'Metallic',
    priceDelta: 600,
  },
  {
    id: 'c-zinc-pearl',
    name: 'Gray zinc pearl',
    hex: '#7A7E83',
    finish: 'Pearl',
    category: 'exterior',
    subgroup: 'Pearl',
    priceDelta: 900,
  },
  {
    id: 'c-tango-red',
    name: 'Tango red',
    hex: '#A12217',
    finish: 'Metallic',
    category: 'exterior',
    subgroup: 'Metallic',
    priceDelta: 600,
  },
  {
    id: 'c-navarra-blue',
    name: 'Navarra blue',
    hex: '#1E3A6B',
    finish: 'Pearl',
    category: 'exterior',
    subgroup: 'Pearl',
    priceDelta: 900,
  },
  {
    id: 'i-cloth-black',
    name: 'Black cloth',
    hex: '#1B1B1B',
    finish: 'Cloth',
    category: 'interior',
    subgroup: 'Cloth',
    priceDelta: 0,
  },
  {
    id: 'i-cloth-grey',
    name: 'Steel grey cloth',
    hex: '#5C5E62',
    finish: 'Cloth',
    category: 'interior',
    subgroup: 'Cloth',
    priceDelta: 0,
  },
  {
    id: 'i-leather-black',
    name: 'Black leather',
    hex: '#0F0F0F',
    finish: 'Leather',
    category: 'interior',
    subgroup: 'Leather',
    priceDelta: 1_200,
  },
  {
    id: 'i-leather-cognac',
    name: 'Cognac leather',
    hex: '#7B3F1F',
    finish: 'Leather',
    category: 'interior',
    subgroup: 'Leather',
    priceDelta: 1_400,
  },
  {
    id: 'i-pastel-cream',
    name: 'Pastel cream',
    hex: '#E9DCC4',
    finish: 'Pastel',
    category: 'interior',
    subgroup: 'Pastel',
    priceDelta: 800,
  },
  {
    id: 'i-pastel-rose',
    name: 'Pastel rose',
    hex: '#D9B7B0',
    finish: 'Pastel',
    category: 'interior',
    subgroup: 'Pastel',
    priceDelta: 800,
  },
]

export const EQUIPMENT_GROUPS = ['Comfort', 'Safety', 'Exterior', 'Engine', 'Wheels', 'Other']

export const EQUIPMENT = [
  { id: 'e-led-lights', name: 'LED headlights', group: 'Safety', price: 0, included: true },
  { id: 'e-lane-assist', name: 'Lane assist', group: 'Safety', price: 0, included: true },
  { id: 'e-climate', name: 'Automatic climate control', group: 'Comfort', price: 0, included: true },
  { id: 'e-pano', name: 'Panoramic sunroof', group: 'Exterior', price: 1_400, included: false },
  { id: 'e-sport-seats', name: 'Sport seats with leather', group: 'Comfort', price: 1_900, included: false },
  { id: 'e-heated-seats', name: 'Heated front seats', group: 'Comfort', price: 450, included: false },
  { id: 'e-acc', name: 'Adaptive cruise control', group: 'Safety', price: 800, included: false },
  { id: 'e-blind-spot', name: 'Blind spot assist', group: 'Safety', price: 550, included: false },
  { id: 'e-park-assist', name: 'Park assist plus + 360° camera', group: 'Safety', price: 1_100, included: false },
  { id: 'e-virtual-cockpit', name: 'Virtual cockpit plus', group: 'Other', price: 700, included: false },
  { id: 'e-bo-sound', name: 'Bang & Olufsen premium sound', group: 'Other', price: 1_200, included: false },
  { id: 'e-wheels-18', name: '18\" alloy wheels', group: 'Wheels', price: 600, included: false },
  { id: 'e-wheels-19', name: '19\" S line alloy wheels', group: 'Wheels', price: 1_300, included: false },
  { id: 'e-sport-exhaust', name: 'Sport exhaust system', group: 'Engine', price: 950, included: false },
]

/**
 * Mock mapping: which equipment is included/locked by selected version.
 * In a real integration this should come from backend catalog/version config.
 */
export const VERSION_INCLUDED_EQUIPMENT = {
  'v-30-tfsi-s': ['e-led-lights', 'e-lane-assist', 'e-climate'],
  'v-35-tfsi-auto': ['e-led-lights', 'e-lane-assist', 'e-climate', 'e-virtual-cockpit'],
  'v-30-tdi-s': ['e-led-lights', 'e-lane-assist', 'e-climate'],
  'v-35-tdi-auto': ['e-led-lights', 'e-lane-assist', 'e-climate', 'e-park-assist'],
  'v-40-tfsi-e': ['e-led-lights', 'e-lane-assist', 'e-climate', 'e-virtual-cockpit', 'e-bo-sound'],
}

export const PROMOS = [
  {
    id: 'p-spring-2026',
    label: 'Spring campaign 2026',
    description: 'Seasonal discount applied at the dealership level.',
    expiresAt: '2026-06-30',
    amount: 1_500,
    discountType: 'amount',
    defaultActive: true,
    incompatibleWith: ['p-loyalty'],
  },
  {
    id: 'p-loyalty',
    label: 'Loyalty bonus',
    description: 'Reserved for returning customers.',
    expiresAt: '2026-12-31',
    amount: 750,
    discountType: 'amount',
    defaultActive: false,
    incompatibleWith: ['p-spring-2026'],
  },
  {
    id: 'p-trade-in-bonus',
    label: 'Trade-in incentive',
    description: 'Extra percentage off when a trade-in vehicle is provided.',
    expiresAt: '2026-03-31',
    amount: 0,
    discountType: 'percent',
    discountPercent: 3,
    defaultActive: false,
  },
]

export const DISCOUNT_ITEMS = [
  { id: 'di-fleet', label: 'Fleet discount', percent: -2 },
  { id: 'di-trade', label: 'Trade-in bonus', percent: -3.5 },
  { id: 'di-loyalty', label: 'Loyalty discount', percent: -1.5 },
]

export const CAMPAIGN_ITEMS = [
  { id: 'c-winter-tyres', label: 'Winter tyres campaign', amount: 0 },
  { id: 'c-end-of-year', label: 'End-of-year bonus', percent: -2 },
  { id: 'c-loyalty-dealer', label: 'Dealer loyalty bonus', amount: 250 },
]

export function findDiscountItem(id) {
  return DISCOUNT_ITEMS.find((d) => d.id === id) || null
}

export function findCampaignItem(id) {
  return CAMPAIGN_ITEMS.find((c) => c.id === id) || null
}

function normalizeTrimLabel(label) {
  return String(label || '').trim().toLowerCase()
}

const TRIM_PROMO_IDS = {
  [normalizeTrimLabel('Identity black')]: ['p-spring-2026'],
}

export function promoIdsForTrimLabel(label) {
  const key = normalizeTrimLabel(label)
  const list = TRIM_PROMO_IDS[key]
  return Array.isArray(list) ? list.filter(Boolean) : []
}

export function formatPromoDiscount(promo) {
  if (!promo) return ''
  if (promo.discountType === 'percent') {
    return `- ${promo.discountPercent}%`
  }
  return `- € ${Number(promo.amount || 0).toLocaleString()}`
}

export const ACCESSORIES = [
  { id: 'a-winter-tyres', name: 'Winter tyres set (4)', price: 720 },
  { id: 'a-extended-warranty', name: 'Extended warranty (24 months)', price: 950 },
  { id: 'a-paint-protection', name: 'Paint protection film', price: 480 },
  { id: 'a-floor-mats', name: 'Premium floor mats', price: 180 },
  { id: 'a-roof-rack', name: 'Roof rack system', price: 360 },
]

/** Quick-add templates for quotation search (services / extras), same pattern as DISCOUNT_ITEMS. */
export const ACCESSORY_LINE_ITEMS = [
  { id: 'as-roadside', name: 'Roadside assistance (12 months)', price: 120 },
  { id: 'as-delivery', name: 'Home delivery service', price: 250 },
  { id: 'as-detailing', name: 'Interior & exterior detailing', price: 180 },
]

export function findAccessoryLineItem(id) {
  return ACCESSORY_LINE_ITEMS.find((a) => a.id === id) || null
}

/** Default VAT % for the configurator when the modal has no override. */
export const TAXES = {
  vatRatePercent: 22,
}

/**
 * Seed rows for "Taxes and extra-costs" (quotation tab). Extra totals are derived from these lines.
 * @typedef {Object} TaxExtraCostSeed
 * @property {string} id
 * @property {'system'|'user'} kind
 * @property {string} description
 * @property {number} grossAmount
 * @property {number} vatRatePercent
 * @property {boolean} [descriptionEditable]
 * @property {boolean} [amountsEditable]
 * @property {boolean} [vatEditable]
 */
export const TAX_EXTRA_COST_LINE_SEEDS = [
  {
    id: 'sys-road-prep',
    kind: 'system',
    description: 'Messa su strada',
    grossAmount: 180,
    vatRatePercent: 22,
    descriptionEditable: false,
    amountsEditable: false,
    vatEditable: false,
  },
  {
    id: 'sys-registration',
    kind: 'system',
    description: 'Vehicle registration',
    grossAmount: 562.98,
    vatRatePercent: 22,
    descriptionEditable: true,
    amountsEditable: true,
    vatEditable: true,
  },
  {
    id: 'sys-eco-pfu',
    kind: 'system',
    description: 'PFU / Eco tax',
    grossAmount: 300,
    vatRatePercent: 22,
    descriptionEditable: false,
    amountsEditable: false,
    vatEditable: false,
  },
]

/** Builds working tax extra-cost line objects (net + gross aligned to VAT rate). */
export function createTaxExtraCostLinesFromSeeds() {
  return TAX_EXTRA_COST_LINE_SEEDS.map((s) => {
    const rate = Number(s.vatRatePercent) || 0
    const gross = Math.max(0, Number(s.grossAmount) || 0)
    const factor = 1 + rate / 100
    const net = factor > 0 ? gross / factor : gross
    return {
      id: s.id,
      kind: s.kind,
      removable: s.kind === 'user',
      description: String(s.description || ''),
      descriptionEditable: !!s.descriptionEditable,
      amountsEditable: !!s.amountsEditable,
      vatEditable: !!s.vatEditable,
      netAmount: net,
      grossAmount: gross,
      vatRatePercent: rate,
    }
  })
}

export const VAT_OPTIONS = [
  { id: 'vat-22', label: '22% VAT', shortLabel: 'VAT 22%', rate: 22 },
  { id: 'vat-4', label: '4% VAT (Law 104)', shortLabel: 'VAT 4% (Law 104)', rate: 4 },
  { id: 'vat-0', label: '0% VAT', shortLabel: 'VAT 0%', rate: 0 },
  { id: 'vat-na', label: 'VAT Not Applicable', shortLabel: 'VAT n/a', rate: 0, notApplicable: true },
]

export const DEFAULT_VAT_OPTION_ID = 'vat-22'

export const PURCHASE_METHODS = [
  { id: 'pm-cash', label: 'Cash' },
  { id: 'pm-financing', label: 'Financing' },
  { id: 'pm-leasing', label: 'Leasing' },
]

export const TRADE_IN_MOCK_VALUE = 4_000

export function findVersion(id) {
  return VERSIONS.find((v) => v.id === id) || null
}

export function findColour(id) {
  return COLOURS.find((c) => c.id === id) || null
}

export function findEquipment(id) {
  return EQUIPMENT.find((e) => e.id === id) || null
}

export function findPromo(id) {
  return PROMOS.find((p) => p.id === id) || null
}

export function promosForTrimLabel(label) {
  const ids = TRIM_PROMO_IDS[normalizeTrimLabel(label)] || []
  return ids.map(findPromo).filter(Boolean)
}

export function findAccessory(id) {
  return ACCESSORIES.find((a) => a.id === id) || null
}
