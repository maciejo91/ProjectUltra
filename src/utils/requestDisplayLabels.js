const REQUEST_TYPE_KEYS = {
  'generic sales': 'genericSales',
  'generic sale': 'genericSales',
  'generic_sales': 'genericSales',
  'generic-sales': 'genericSales',
  quotation: 'quotation',
  quote: 'quotation',
  'test drive': 'testDrive',
  testdrive: 'testDrive',
  financing: 'financing',
  finance: 'financing',
  'trade in': 'tradeIn',
  'trade-in': 'tradeIn',
  tradein: 'tradeIn'
}

const SOURCE_KEYS = {
  website: 'web',
  web: 'web',
  webspark: 'webSpark',
  websparks: 'webSpark',
  'web spark': 'webSpark',
  'walk-in': 'walkIn',
  walkin: 'walkIn',
  showroom: 'walkIn',
  'google ads': 'googleAds',
  googleads: 'googleAds',
  autoscout: 'autoscout',
  'autoscout24.es': 'autoscout',
  phone: 'phone',
  referral: 'referral'
}

function normalizeLabelKey(value) {
  return String(value || '').trim().toLowerCase()
}

export function getRequestTypeLabel(value, t) {
  const raw = String(value || '').trim()
  if (!raw) return '—'
  const key = REQUEST_TYPE_KEYS[normalizeLabelKey(raw)]
  return key ? t(`requestDetail.editVehicleModal.requestTypes.${key}`) : raw
}

export function getRequestSourceLabel(value, t) {
  const raw = String(value || '').trim()
  if (!raw) return '—'
  const key = SOURCE_KEYS[normalizeLabelKey(raw)]
  return key ? t(`requestDetail.editVehicleModal.origins.${key}`) : raw
}
