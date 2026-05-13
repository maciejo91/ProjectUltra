function splitTrailingParentheticalName(raw) {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s || s[s.length - 1] !== ')') return { core: s, inner: '' }
  const closeIdx = s.length - 1
  const openIdx = s.lastIndexOf('(', closeIdx - 1)
  if (openIdx === -1) return { core: s, inner: '' }
  const inner = s.slice(openIdx + 1, closeIdx).trim()
  const core = s.slice(0, openIdx).trim()
  if (!inner || !core) return { core: s, inner: '' }
  return { core, inner }
}

const italianCityFallbacks = {
  berlin: 'Milano',
  frankfurt: 'Roma',
  'frankfurt am main': 'Roma',
  stuttgart: 'Milano',
  munich: 'Milano',
  münchen: 'Milano',
  hamburg: 'Roma',
  düsseldorf: 'Milano',
  dusseldorf: 'Milano',
  cologne: 'Milano',
  köln: 'Milano',
  paris: 'Milano',
  amsterdam: 'Milano',
  vienna: 'Milano',
  copenhagen: 'Milano',
  milan: 'Milano',
  florence: 'Firenze'
}

function toItalianCityLabel(value) {
  const city = typeof value === 'string' ? value.trim() : ''
  if (!city) return ''
  return italianCityFallbacks[city.toLowerCase()] || city
}

export function getCustomerNameParts(name) {
  const raw = typeof name === 'string' ? name : ''
  const { core, inner } = splitTrailingParentheticalName(raw.trim())
  if (!inner) {
    return { primary: core, location: '' }
  }
  return { primary: core, location: `(${inner})` }
}

export function splitPrimaryCustomerName(primary) {
  const p = typeof primary === 'string' ? primary.trim() : ''
  if (!p) return { firstName: '', surname: '' }
  const tokens = p.split(/\s+/).filter(Boolean)
  if (tokens.length === 1) return { firstName: tokens[0], surname: '' }
  return { firstName: tokens[0], surname: tokens.slice(1).join(' ') }
}

export function parseCustomerNameForEdit(fullName) {
  const raw = typeof fullName === 'string' ? fullName : ''
  const { core, inner } = splitTrailingParentheticalName(raw)
  const { firstName, surname } = splitPrimaryCustomerName(core)
  return { firstName, surname, location: inner }
}

export function buildCustomerDisplayName({ firstName, surname, location }) {
  const core = [firstName, surname].map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean).join(' ')
  if (!core) return ''
  const loc = typeof location === 'string' ? location.trim() : ''
  return loc ? `${core} (${loc})` : core
}

export function getCustomerCityLabel(customer) {
  if (!customer) return ''
  const direct = customer.city
  if (typeof direct === 'string' && direct.trim()) return toItalianCityLabel(direct)
  const addr = customer.address
  if (addr && typeof addr === 'object' && addr.city) {
    return toItalianCityLabel(String(addr.city).trim())
  }
  if (typeof addr === 'string' && addr.trim()) {
    const parts = addr.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length === 0) return ''
    const last = parts[parts.length - 1]
    return toItalianCityLabel(last.replace(/^\d{4,6}\s+/, '').trim())
  }
  return ''
}
