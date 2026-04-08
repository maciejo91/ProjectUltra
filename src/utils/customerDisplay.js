export function getCustomerNameParts(name) {
  const raw = typeof name === 'string' ? name : ''
  const match = raw.match(/^(.*?)\s*(\([^)]+\))\s*$/)
  if (match && match[1].trim()) {
    return { primary: match[1].trim(), location: match[2] }
  }
  return { primary: raw.trim(), location: '' }
}
