/** Step 3 configurator — purchase method row shape (UI + mock persistence; no pricing impact). */

export const PURCHASE_METHOD_TYPES = ['FIN', 'LTR', 'LEA']

export const PURCHASE_METHOD_TYPE_LABELS = {
  FIN: 'Financing',
  LTR: 'Long term rent',
  LEA: 'Leasing',
}

export const LTR_SERVICE_PRESETS = [
  { id: 'ltr-kasko', label: 'Kasko insurance' },
  { id: 'ltr-maintenance', label: 'Full Maintenance' },
  { id: 'ltr-assistance', label: 'Roadside Assistance' },
  { id: 'ltr-claims', label: 'Claims & Fines Management' },
]

export function durationMonthOptions(type) {
  if (type === 'FIN') return [12, 24, 36, 48, 60, 72]
  if (type === 'LEA') return [24, 36, 48, 60]
  if (type === 'LTR') return [12, 24, 36, 48, 60]
  return []
}

function newId(prefix = 'pm') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function cloneLtrServices() {
  return LTR_SERVICE_PRESETS.map((p) => ({
    id: p.id,
    label: p.label,
    included: false,
  }))
}

/**
 * @param {Object} opts
 * @param {string} [opts.id]
 * @param {'FIN'|'LEA'|'LTR'} [opts.type]
 * @param {number} [opts.defaultVehiclePrice]
 */
export function createEmptyConfiguratorPurchaseMethod(opts = {}) {
  const type = PURCHASE_METHOD_TYPES.includes(opts.type) ? opts.type : 'FIN'
  const id = opts.id || newId()
  const vp =
    opts.defaultVehiclePrice !== undefined && Number.isFinite(Number(opts.defaultVehiclePrice))
      ? Number(opts.defaultVehiclePrice)
      : null

  return {
    id,
    type,
    name: PURCHASE_METHOD_TYPE_LABELS[type] || '',
    vehiclePrice: vp,
    downPayment: null,
    financedAmount: null,
    balloonPayment: null,
    residualValue: null,
    durationMonths: null,
    annualMileageLimit: null,
    totalMileageContract: null,
    monthlyInstallment: null,
    monthlyInstallmentGross: null,
    monthlyInstallmentNet: null,
    estimatedTotalLeaseCost: null,
    estimatedTotalRentalCost: null,
    tan: null,
    taeg: null,
    startingDate: '',
    expiringDate: '',
    leasingType: '',
    rentalType: '',
    providerType: 'captive',
    providerName: '',
    financialProductName: '',
    notes: '',
    servicesIncluded: type === 'LTR' ? cloneLtrServices() : [],
    customServices: [],
  }
}

/** @param {unknown} row */
export function normalizeConfiguratorPurchaseMethod(row) {
  const r = row && typeof row === 'object' ? { ...row } : createEmptyConfiguratorPurchaseMethod()
  if (!PURCHASE_METHOD_TYPES.includes(r.type)) r.type = 'FIN'
  if (!r.id) r.id = newId()
  if (!Array.isArray(r.servicesIncluded)) r.servicesIncluded = []
  if (!Array.isArray(r.customServices)) r.customServices = []
  if (r.type === 'LTR' && r.servicesIncluded.length === 0) {
    r.servicesIncluded = cloneLtrServices()
  }
  if (!String(r.name ?? '').trim()) {
    r.name = PURCHASE_METHOD_TYPE_LABELS[r.type] || ''
  }
  return r
}

/**
 * Map row to form object for modal (all string-friendly fields for inputs).
 * @param {object} row
 */
export function rowToForm(row) {
  const r = normalizeConfiguratorPurchaseMethod(row)
  const numOrEmpty = (n) => (n !== null && n !== undefined && Number.isFinite(Number(n)) ? String(n) : '')

  return {
    type: r.type,
    name: String(r.name ?? ''),
    vehiclePrice: numOrEmpty(r.vehiclePrice),
    downPayment: numOrEmpty(r.downPayment),
    financedAmount: numOrEmpty(r.financedAmount),
    balloonPayment: numOrEmpty(r.balloonPayment),
    residualValue: numOrEmpty(r.residualValue),
    durationMonths: r.durationMonths != null && r.durationMonths !== '' ? String(r.durationMonths) : '',
    annualMileageLimit: numOrEmpty(r.annualMileageLimit),
    totalMileageContract: numOrEmpty(r.totalMileageContract),
    monthlyInstallment: numOrEmpty(r.monthlyInstallment),
    monthlyInstallmentGross: numOrEmpty(r.monthlyInstallmentGross),
    monthlyInstallmentNet: numOrEmpty(r.monthlyInstallmentNet),
    estimatedTotalLeaseCost: numOrEmpty(r.estimatedTotalLeaseCost),
    estimatedTotalRentalCost: numOrEmpty(r.estimatedTotalRentalCost),
    tan: numOrEmpty(r.tan),
    taeg: numOrEmpty(r.taeg),
    startingDate: String(r.startingDate ?? ''),
    expiringDate: String(r.expiringDate ?? ''),
    leasingType: String(r.leasingType ?? ''),
    rentalType: String(r.rentalType ?? ''),
    providerType: r.providerType === 'independent' ? 'independent' : 'captive',
    providerName: String(r.providerName ?? ''),
    financialProductName: String(r.financialProductName ?? ''),
    notes: String(r.notes ?? ''),
    servicesIncluded: (r.servicesIncluded || []).map((s) => ({
      id: String(s.id || newId('svc')),
      label: String(s.label ?? ''),
      included: !!s.included,
    })),
    customServices: (r.customServices || []).map((s) => ({
      id: String(s.id || newId('csv')),
      label: String(s.label ?? ''),
      included: s.included !== false,
    })),
  }
}

function parseOptionalNumber(raw) {
  let s = String(raw ?? '')
    .trim()
    .replace(/\s/g, '')
  if (!s) return null
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.')
  }
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/**
 * @param {object} form from rowToForm structure
 * @param {object} opts
 * @param {string} [opts.id]
 * @param {number} [opts.defaultVehiclePrice]
 */
export function formToRow(form, opts = {}) {
  const type = PURCHASE_METHOD_TYPES.includes(form.type) ? form.type : 'FIN'
  const base = createEmptyConfiguratorPurchaseMethod({
    id: opts.id,
    type,
    defaultVehiclePrice: opts.defaultVehiclePrice,
  })

  const vehiclePriceRaw = parseOptionalNumber(form.vehiclePrice)
  const row = {
    ...base,
    id: opts.id || base.id,
    type,
    name: String(form.name ?? '').trim(),
    vehiclePrice: vehiclePriceRaw,
    downPayment: parseOptionalNumber(form.downPayment),
    financedAmount: parseOptionalNumber(form.financedAmount),
    balloonPayment: parseOptionalNumber(form.balloonPayment),
    residualValue: parseOptionalNumber(form.residualValue),
    durationMonths: (() => {
      const s = String(form.durationMonths ?? '').trim()
      if (!s) return null
      const n = parseInt(s, 10)
      return Number.isFinite(n) ? n : null
    })(),
    annualMileageLimit: parseOptionalNumber(form.annualMileageLimit),
    totalMileageContract: parseOptionalNumber(form.totalMileageContract),
    monthlyInstallment: parseOptionalNumber(form.monthlyInstallment),
    monthlyInstallmentGross: parseOptionalNumber(form.monthlyInstallmentGross),
    monthlyInstallmentNet: parseOptionalNumber(form.monthlyInstallmentNet),
    estimatedTotalLeaseCost: parseOptionalNumber(form.estimatedTotalLeaseCost),
    estimatedTotalRentalCost: parseOptionalNumber(form.estimatedTotalRentalCost),
    tan: parseOptionalNumber(form.tan),
    taeg: parseOptionalNumber(form.taeg),
    startingDate: String(form.startingDate ?? '').trim(),
    expiringDate: String(form.expiringDate ?? '').trim(),
    leasingType: String(form.leasingType ?? '').trim(),
    rentalType: String(form.rentalType ?? '').trim(),
    providerType: form.providerType === 'independent' ? 'independent' : 'captive',
    providerName: String(form.providerName ?? '').trim(),
    financialProductName: String(form.financialProductName ?? '').trim(),
    notes: String(form.notes ?? '').trim(),
    servicesIncluded:
      type === 'LTR'
        ? (form.servicesIncluded || []).map((s) => ({
            id: String(s.id || newId('svc')),
            label: String(s.label ?? '').trim(),
            included: !!s.included,
          }))
        : [],
    customServices:
      type === 'LTR'
        ? (form.customServices || [])
            .filter((s) => String(s.label ?? '').trim())
            .map((s) => ({
              id: String(s.id || newId('csv')),
              label: String(s.label ?? '').trim(),
              included: s.included !== false,
            }))
        : [],
  }

  return normalizeConfiguratorPurchaseMethod(row)
}

/**
 * Ensure saved name is unique among existing configurator rows (append " (1)", " (2)", …).
 * @param {string} name
 * @param {Array<{ id?: string, name?: string }>} existingRows
 * @param {string|null|undefined} excludeId - ignore this row id (e.g. when editing)
 */
export function dedupePurchaseMethodName(name, existingRows, excludeId) {
  const base = String(name ?? '').trim()
  if (!base) return base
  const exclude = excludeId != null && excludeId !== '' ? String(excludeId) : null
  const taken = new Set(
    (existingRows || [])
      .filter((r) => exclude == null || String(r?.id ?? '') !== exclude)
      .map((r) => String(r?.name ?? '').trim())
      .filter(Boolean),
  )
  if (!taken.has(base)) return base
  let n = 1
  let candidate = `${base} (${n})`
  while (taken.has(candidate)) {
    n += 1
    candidate = `${base} (${n})`
  }
  return candidate
}
