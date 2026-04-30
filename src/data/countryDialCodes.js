/**
 * ISO2 + ITU-T dial (digits only, no +). Names in English for the picker.
 * Same dial may appear for multiple ISO2 (e.g. US/CA +1); parsing picks first match in dial-length order.
 */
export const COUNTRY_DIAL_CODES = [
  { iso2: 'IT', dial: '39', name: 'Italy' },
  { iso2: 'VA', dial: '39', name: 'Vatican City' },
  { iso2: 'SM', dial: '378', name: 'San Marino' },
  { iso2: 'FR', dial: '33', name: 'France' },
  { iso2: 'DE', dial: '49', name: 'Germany' },
  { iso2: 'ES', dial: '34', name: 'Spain' },
  { iso2: 'PT', dial: '351', name: 'Portugal' },
  { iso2: 'GB', dial: '44', name: 'United Kingdom' },
  { iso2: 'IE', dial: '353', name: 'Ireland' },
  { iso2: 'NL', dial: '31', name: 'Netherlands' },
  { iso2: 'BE', dial: '32', name: 'Belgium' },
  { iso2: 'LU', dial: '352', name: 'Luxembourg' },
  { iso2: 'CH', dial: '41', name: 'Switzerland' },
  { iso2: 'AT', dial: '43', name: 'Austria' },
  { iso2: 'PL', dial: '48', name: 'Poland' },
  { iso2: 'CZ', dial: '420', name: 'Czech Republic' },
  { iso2: 'SK', dial: '421', name: 'Slovakia' },
  { iso2: 'HU', dial: '36', name: 'Hungary' },
  { iso2: 'RO', dial: '40', name: 'Romania' },
  { iso2: 'BG', dial: '359', name: 'Bulgaria' },
  { iso2: 'GR', dial: '30', name: 'Greece' },
  { iso2: 'HR', dial: '385', name: 'Croatia' },
  { iso2: 'SI', dial: '386', name: 'Slovenia' },
  { iso2: 'RS', dial: '381', name: 'Serbia' },
  { iso2: 'BA', dial: '387', name: 'Bosnia and Herzegovina' },
  { iso2: 'ME', dial: '382', name: 'Montenegro' },
  { iso2: 'AL', dial: '355', name: 'Albania' },
  { iso2: 'MK', dial: '389', name: 'North Macedonia' },
  { iso2: 'SE', dial: '46', name: 'Sweden' },
  { iso2: 'NO', dial: '47', name: 'Norway' },
  { iso2: 'DK', dial: '45', name: 'Denmark' },
  { iso2: 'FI', dial: '358', name: 'Finland' },
  { iso2: 'IS', dial: '354', name: 'Iceland' },
  { iso2: 'EE', dial: '372', name: 'Estonia' },
  { iso2: 'LV', dial: '371', name: 'Latvia' },
  { iso2: 'LT', dial: '370', name: 'Lithuania' },
  { iso2: 'UA', dial: '380', name: 'Ukraine' },
  { iso2: 'MD', dial: '373', name: 'Moldova' },
  { iso2: 'US', dial: '1', name: 'United States' },
  { iso2: 'CA', dial: '1', name: 'Canada' },
  { iso2: 'MX', dial: '52', name: 'Mexico' },
  { iso2: 'BR', dial: '55', name: 'Brazil' },
  { iso2: 'AR', dial: '54', name: 'Argentina' },
  { iso2: 'CL', dial: '56', name: 'Chile' },
  { iso2: 'CO', dial: '57', name: 'Colombia' },
  { iso2: 'PE', dial: '51', name: 'Peru' },
  { iso2: 'JP', dial: '81', name: 'Japan' },
  { iso2: 'KR', dial: '82', name: 'South Korea' },
  { iso2: 'CN', dial: '86', name: 'China' },
  { iso2: 'IN', dial: '91', name: 'India' },
  { iso2: 'AU', dial: '61', name: 'Australia' },
  { iso2: 'NZ', dial: '64', name: 'New Zealand' },
  { iso2: 'ZA', dial: '27', name: 'South Africa' },
  { iso2: 'EG', dial: '20', name: 'Egypt' },
  { iso2: 'MA', dial: '212', name: 'Morocco' },
  { iso2: 'DZ', dial: '213', name: 'Algeria' },
  { iso2: 'TN', dial: '216', name: 'Tunisia' },
  { iso2: 'IL', dial: '972', name: 'Israel' },
  { iso2: 'AE', dial: '971', name: 'United Arab Emirates' },
  { iso2: 'SA', dial: '966', name: 'Saudi Arabia' },
  { iso2: 'TR', dial: '90', name: 'Turkey' },
  { iso2: 'RU', dial: '7', name: 'Russia' },
  { iso2: 'KZ', dial: '7', name: 'Kazakhstan' },
  { iso2: 'AD', dial: '376', name: 'Andorra' },
  { iso2: 'MC', dial: '377', name: 'Monaco' },
  { iso2: 'LI', dial: '423', name: 'Liechtenstein' },
  { iso2: 'MT', dial: '356', name: 'Malta' },
  { iso2: 'CY', dial: '357', name: 'Cyprus' },
]

function dedupeByIso2(list) {
  const seen = new Set()
  return list.filter((c) => {
    if (seen.has(c.iso2)) return false
    seen.add(c.iso2)
    return true
  })
}

const UNIQUE = dedupeByIso2(COUNTRY_DIAL_CODES)

export function countryByIso2(iso2) {
  const u = String(iso2 || 'IT').toUpperCase()
  return UNIQUE.find((c) => c.iso2 === u) || UNIQUE.find((c) => c.iso2 === 'IT')
}

/** Same dial can map to multiple ISO2; first match wins — prefer primary territory for +39, +1, +7. */
export function countriesSortedByDialLength() {
  const tie = (a, b) => {
    if (a.dial === '39' && b.dial === '39') {
      const o = { IT: 0, VA: 1, SM: 2 }
      return (o[a.iso2] ?? 9) - (o[b.iso2] ?? 9)
    }
    if (a.dial === '1' && b.dial === '1') {
      const o = { US: 0, CA: 1 }
      return (o[a.iso2] ?? 9) - (o[b.iso2] ?? 9)
    }
    if (a.dial === '7' && b.dial === '7') {
      const o = { RU: 0, KZ: 1 }
      return (o[a.iso2] ?? 9) - (o[b.iso2] ?? 9)
    }
    return a.iso2.localeCompare(b.iso2)
  }
  return [...UNIQUE].sort((a, b) => {
    if (b.dial.length !== a.dial.length) return b.dial.length - a.dial.length
    return tie(a, b)
  })
}

export function countriesForPicker() {
  return [...UNIQUE].sort((a, b) => a.name.localeCompare(b.name, 'en'))
}

export function parseInternationalParts(full, defaultIso2) {
  const def = countryByIso2(defaultIso2)
  const sorted = countriesSortedByDialLength()
  const t = (full || '').trim()
  if (!t) return { country: def, nationalDigits: '' }
  const digits = t.replace(/\D/g, '')
  if (!digits) return { country: def, nationalDigits: '' }
  for (const c of sorted) {
    if (digits.startsWith(c.dial)) {
      const nat = digits.slice(c.dial.length)
      return { country: c, nationalDigits: nat }
    }
  }
  return { country: def, nationalDigits: digits }
}

export function composeInternational(country, nationalDigits) {
  const c = country || countryByIso2('IT')
  const nd = String(nationalDigits || '').replace(/\D/g, '')
  const base = `+${c.dial}`
  return nd ? `${base} ${nd}` : `${base} `
}
