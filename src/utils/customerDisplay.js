export function getCustomerNameParts(name) {
  const raw = typeof name === 'string' ? name : ''
  const match = raw.match(/^(.*?)\s*(\([^)]+\))\s*$/)
  if (match && match[1].trim()) {
    return { primary: match[1].trim(), location: match[2] }
  }
  return { primary: raw.trim(), location: '' }
}

export function getCustomerCityLabel(customer) {
  if (!customer) return ''
  const direct = customer.city
  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  const addr = customer.address
  if (addr && typeof addr === 'object' && addr.city) {
    return String(addr.city).trim()
  }
  if (typeof addr === 'string' && addr.trim()) {
    const parts = addr.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length === 0) return ''
    const last = parts[parts.length - 1]
    return last.replace(/^\d{4,6}\s+/, '').trim()
  }
  return ''
}
