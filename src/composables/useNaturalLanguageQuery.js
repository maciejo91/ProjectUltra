/**
 * Composable for parsing natural language queries into structured column filters.
 * Used by UnifiedSearchBar in AI mode.
 *
 * @param {Object} options - Optional filter options (arrays of { value, label })
 * @param {string} [options.context] - 'vehicles' | 'leads' | 'opportunities' | 'tasks' | 'requests' | 'customers' | 'reports'
 * @param {Array} options.assigneeOptions
 * @param {Array} options.volvoModelOptions
 * @param {Array} options.brandOptions - For vehicles (Volkswagen, Audi, etc.)
 * @param {Array} options.requestTypeOptions
 * @param {Array} options.statusOptions
 * @param {Array} options.sourceOptions
 * @param {Array} options.priorityOptions
 * @param {Array} options.typeOptions
 * @param {Array} options.requestedCarBrandOptions
 * @param {Array} options.accountTypeOptions
 * @returns {{ processQuery: (query: string) => { filters: Array, error: string | null, globalFilterFallback?: string } }}
 */
const VOLVO_MODELS = ['XC90', 'XC60', 'XC40', 'V90', 'V60', 'V40', 'S90', 'S60']

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
]

function toLower (s) {
  return (s || '').toLowerCase().trim()
}

function matchAssignee (q, assigneeOptions) {
  if (!assigneeOptions?.length) return null
  const trimmed = q.trim()
  const words = trimmed.split(/\s+/)

  const patterns = [
    /(?:assigned to|assigned to)\s+([a-z'\s]+?)(?:\s|$|\.|,)/i,
    /([a-z]+)'s\s+(?:leads?|cars?|opportunities?)/i,
    /(?:managed by|handled by)\s+([a-z'\s]+?)(?:\s|$|\.|,)/i,
    /(?:leads?|cars?|opportunities?)\s+(?:managed by|handled by)\s+([a-z'\s]+)/i,
    /(?:all\s+)?(?:new\s+)?(?:cars?|leads?)\s+assigned to\s+([a-z'\s]+)/i
  ]
  for (const re of patterns) {
    const m = q.match(re)
    if (!m) continue
    const name = m[1].trim()
    const first = name.split(/\s+/)[0]
    for (const opt of assigneeOptions) {
      const v = (opt.value || opt.label || '').toString()
      const l = (opt.label || opt.value || '').toString().toLowerCase()
      if (l.includes(first.toLowerCase()) || toLower(v) === toLower(name) || toLower(v) === toLower(first)) {
        return { id: 'assignee', value: v, operator: 'eq' }
      }
    }
  }
  if (words.length <= 2) {
    const first = words[0]
    for (const opt of assigneeOptions) {
      const v = (opt.value || opt.label || '').toString()
      const l = (opt.label || opt.value || '').toString().toLowerCase()
      const optFirst = v.split(/\s+/)[0]?.toLowerCase()
      if (l === toLower(first) || toLower(v) === toLower(trimmed) || optFirst === first.toLowerCase()) {
        return { id: 'assignee', value: v, operator: 'eq' }
      }
    }
  }
  return null
}

function parseDateRange (q) {
  const lower = toLower(q)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (/\btoday\b/i.test(lower)) {
    const d = today.toISOString().slice(0, 10)
    return { from: d, to: d, operator: 'between' }
  }
  if (/\byesterday\b/i.test(lower)) {
    const from = new Date(today)
    from.setDate(from.getDate() - 1)
    const d = from.toISOString().slice(0, 10)
    return { from: d, to: d, operator: 'between' }
  }
  if (/\bthis\s+week\b/i.test(lower)) {
    const day = today.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const from = new Date(today)
    from.setDate(today.getDate() + mondayOffset)
    return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10), operator: 'between' }
  }

  const lastNDays = lower.match(/last\s+(\d+)\s+days?/i)
  if (lastNDays) {
    const n = Math.min(365, parseInt(lastNDays[1], 10) || 1)
    const from = new Date(today)
    from.setDate(from.getDate() - n)
    return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10), operator: 'between' }
  }

  if (/\blast\s+week\b/i.test(lower)) {
    const from = new Date(today)
    from.setDate(from.getDate() - 7)
    return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10), operator: 'between' }
  }
  if (/\blast\s+month\b/i.test(lower)) {
    const from = new Date(today)
    from.setMonth(from.getMonth() - 1)
    return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10), operator: 'between' }
  }
  if (/\bthis\s+month\b/i.test(lower)) {
    const from = new Date(today.getFullYear(), today.getMonth(), 1)
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), operator: 'between' }
  }
  if (/\bnext\s+month\b/i.test(lower)) {
    const from = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const to = new Date(today.getFullYear(), today.getMonth() + 2, 0)
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), operator: 'between' }
  }

  const inMonthYear = lower.match(/(?:created\s+)?in\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})?/i)
  if (inMonthYear) {
    const monthName = inMonthYear[1]
    const year = inMonthYear[2] ? parseInt(inMonthYear[2], 10) : today.getFullYear()
    const monthIndex = MONTH_NAMES.indexOf(monthName.toLowerCase())
    if (monthIndex === -1) return null
    const from = new Date(year, monthIndex, 1)
    const to = new Date(year, monthIndex + 1, 0)
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), operator: 'between' }
  }

  const inMonthOnly = lower.match(/\bin\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i)
  if (inMonthOnly) {
    const monthName = inMonthOnly[1]
    const monthIndex = MONTH_NAMES.indexOf(monthName.toLowerCase())
    if (monthIndex === -1) return null
    const from = new Date(today.getFullYear(), monthIndex, 1)
    const to = new Date(today.getFullYear(), monthIndex + 1, 0)
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), operator: 'between' }
  }

  if (/\bcreated\s+last\s+\d+\s+days?\b/i.test(lower) || /\blast\s+\d+\s+days?\b/i.test(lower)) {
    const nMatch = lower.match(/(\d+)\s+days?/i)
    const n = nMatch ? Math.min(365, parseInt(nMatch[1], 10)) : 3
    const from = new Date(today)
    from.setDate(from.getDate() - n)
    return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10), operator: 'between' }
  }

  return null
}

function matchCarStatus (q, context) {
  const lower = toLower(q)
  if (/\bnew\s+cars?\b/i.test(lower) || /\ball\s+new\s+cars?\b/i.test(lower)) {
    // Vehicles mock data uses status 'New'/'Used'; leads use carStatus 'In Stock'/'Out of Stock'
    return { id: context === 'vehicles' ? 'status' : 'carStatus', value: context === 'vehicles' ? 'New' : 'In Stock', operator: 'eq' }
  }
  if (/\bused\s+cars?\b/i.test(lower) || /\ball\s+used\s+cars?\b/i.test(lower)) {
    return { id: context === 'vehicles' ? 'status' : 'carStatus', value: context === 'vehicles' ? 'Used' : 'Out of Stock', operator: 'eq' }
  }
  if (context === 'vehicles' && (/\bin\s+stock\b/i.test(lower) || /\bavailable\b/i.test(lower))) {
    return { id: 'status', value: 'New', operator: 'eq' } // Mock uses New for available stock
  }
  if (context === 'vehicles' && /\bsold\b/i.test(lower)) {
    return { id: 'status', value: 'Used', operator: 'eq' } // Mock uses Used for sold
  }
  return null
}

function matchVolvoModel (q, volvoModelOptions, context) {
  const list = (volvoModelOptions && volvoModelOptions.length)
    ? volvoModelOptions.map(o => (o.value || o.label || '').toString())
    : VOLVO_MODELS
  const lower = toLower(q)
  const field = context === 'vehicles' ? 'model' : 'car'
  for (const model of list) {
    if (lower.includes(model.toLowerCase())) {
      return { id: field, value: model, operator: context === 'vehicles' ? 'eq' : 'includes' }
    }
  }
  for (const model of VOLVO_MODELS) {
    if (lower.includes(model.toLowerCase())) {
      return { id: field, value: model, operator: context === 'vehicles' ? 'eq' : 'includes' }
    }
  }
  return null
}

function matchRequestType (q, requestTypeOptions) {
  const lower = toLower(q)
  const options = requestTypeOptions || [
    { value: 'Test Drive', label: 'Test Drive' },
    { value: 'Quotation', label: 'Quotation' },
    { value: 'Generic sales', label: 'Generic sales' }
  ]
  if (options.length) {
    const trimmed = q.trim()
    for (const opt of options) {
      const v = (opt.value || opt.label || '').toString()
      if (toLower(trimmed) === toLower(v) || lower.includes(toLower(v))) {
        return { id: 'requestType', value: v, operator: 'eq' }
      }
    }
  }
  const negate = /\bnot\s+test\s+drives?\b/i.test(lower) ||
    /\bexcept\s+(?:test\s+drives?|quotations?)\b/i.test(lower) ||
    /\bnot\s+quotations?\b/i.test(lower) ||
    /\bexcept\s+quotations?\b/i.test(lower)

  const values = []
  if (/\btest\s+drives?\b/i.test(lower) && !/\bnot\s+test\s+drives?\b/i.test(lower) && !/\bexcept\s+test\s+drives?\b/i.test(lower)) {
    const v = options.find(o => toLower(String(o.value || o.label)) === 'test drive')?.value || 'Test Drive'
    values.push(v)
  }
  if (/\bquotations?\b/i.test(lower) && !/\bnot\s+quotations?\b/i.test(lower) && !/\bexcept\s+quotations?\b/i.test(lower)) {
    const v = options.find(o => toLower(String(o.value || o.label)).includes('quotation'))?.value || 'Quotation'
    values.push(v)
  }
  if (/\b(?:generic\s+)?sales\b/i.test(lower)) {
    const v = options.find(o => toLower(String(o.value || o.label)).includes('sales'))?.value || 'Generic sales'
    values.push(v)
  }

  if (negate && values.length === 0) {
    if (/\bexcept\s+quotations?\b|\bnot\s+quotations?\b/i.test(lower)) {
      const all = options.map(o => o.value || o.label)
      const rest = all.filter(x => !toLower(String(x)).includes('quotation'))
      if (rest.length) return { id: 'requestType', value: rest, operator: 'in' }
    }
    if (/\bnot\s+test\s+drives?\b|\bexcept\s+test\s+drives?\b/i.test(lower)) {
      const all = options.map(o => o.value || o.label)
      const rest = all.filter(x => toLower(String(x)) !== 'test drive')
      if (rest.length) return { id: 'requestType', value: rest, operator: 'in' }
    }
  }

  if (values.length) {
    return { id: 'requestType', value: values.length === 1 ? values[0] : values, operator: values.length === 1 ? 'eq' : 'in' }
  }
  return null
}

function matchStatus (q, statusOptions) {
  const lower = toLower(q)
  const trimmed = q.trim()
  const options = statusOptions || [
    { value: 'Valid', label: 'Valid' },
    { value: 'Not valid', label: 'Not valid' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Not interested', label: 'Not interested' }
  ]
  if (options.length) {
    for (const opt of options) {
      const v = (opt.value || opt.label || '').toString()
      if (toLower(trimmed) === toLower(v) || lower === toLower(v)) {
        return { id: 'status', value: v, operator: 'eq' }
      }
    }
    for (const opt of options) {
      const v = (opt.value || opt.label || '').toString()
      const vLower = toLower(v)
      if (lower.includes(vLower) || new RegExp(`\\b${vLower.replace(/\s+/g, '\\s+')}\\b`).test(lower)) {
        return { id: 'status', value: v, operator: 'eq' }
      }
    }
  }
  const phraseMap = [
    [/^open\s+leads?$/i, 'Open'],
    [/^open\s+opportunities?$/i, 'Open'],
    [/\bopen\b/i, 'Open'],
    [/\bwon\b/i, 'Won'],
    [/\blost\b/i, 'Lost'],
    [/\bin\s+negotiation\b/i, 'In Negotiation'],
    [/\bdisqualified\b/i, 'Disqualified'],
    [/\bvalid\s+leads?\b/i, 'Valid'],
    [/\bqualified\b/i, 'Qualified'],
    [/\bnot\s+valid\b/i, 'Not valid'],
    [/\bnot\s+interested\b/i, 'Not interested'],
    [/\bclosed\s+won\b/i, 'Won'],
    [/\bclosed\s+lost\b/i, 'Lost']
  ]
  for (const [re, val] of phraseMap) {
    if (re.test(lower)) {
      const v = options.find(o => toLower(String(o.value || o.label)) === toLower(val))?.value ?? val
      return { id: 'status', value: v, operator: 'eq' }
    }
  }
  return null
}

function matchSource (q, sourceOptions) {
  const lower = toLower(q)
  const trimmed = q.trim()
  const options = sourceOptions || [
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Direct', label: 'Direct' }
  ]
  if (options.length) {
    for (const opt of options) {
      const v = (opt.value || opt.label || '').toString()
      if (toLower(trimmed) === toLower(v) || lower === toLower(v)) {
        return { id: 'source', value: v, operator: 'eq' }
      }
    }
    for (const opt of options) {
      const v = (opt.value || opt.label || '').toString()
      const vLower = toLower(v)
      if (lower.includes(vLower)) {
        return { id: 'source', value: v, operator: 'eq' }
      }
    }
  }
  const synonymMap = [
    [/\b(?:google\s+ads?|ads?|google)\b/i, 'Google Ads'],
    [/\b(?:social|facebook)\b/i, 'Facebook'],
    [/\bwalk[- ]?in\b/i, 'Walk-in'],
    [/\breferral(s)?\b/i, 'Referral'],
    [/\b(?:website|web)\b/i, 'Website'],
    [/\b(?:from\s+)?marketing\b|\bmarketing\s+leads?\b/i, 'Marketing'],
    [/\b(?:from\s+)?sales\b|\bsales\s+leads?\b/i, 'Sales'],
    [/\b(?:from\s+)?website\b|\bwebsite\s+leads?\b/i, 'Website']
  ]
  for (const [re, val] of synonymMap) {
    if (re.test(lower)) {
      const v = options.find(o => toLower(String(o.value || o.label)) === toLower(val))?.value ?? val
      return { id: 'source', value: v, operator: 'eq' }
    }
  }
  return null
}

function matchPriority (q, priorityOptions) {
  const lower = toLower(q)
  const trimmed = q.trim()
  const options = priorityOptions || [
    { value: 'Hot', label: 'Hot' },
    { value: 'Normal', label: 'Normal' }
  ]
  if (options.length) {
    for (const opt of options) {
      const v = (opt.value || opt.label || '').toString()
      if (toLower(trimmed) === toLower(v)) {
        return { id: 'priority', value: v, operator: 'eq' }
      }
    }
  }
  if (/\bhot\b/i.test(lower) || /\bhigh\s+priority\b/i.test(lower) || /\bhot\s+leads?\b/i.test(lower)) {
    const v = options.find(o => toLower(String(o.value || o.label)) === 'hot')?.value || 'Hot'
    return { id: 'priority', value: v, operator: 'eq' }
  }
  if (/\bnormal\b/i.test(lower) || /\bnormal\s+priority\b/i.test(lower) || /\bnormal\s+leads?\b/i.test(lower)) {
    const v = options.find(o => toLower(String(o.value || o.label)) === 'normal')?.value || 'Normal'
    return { id: 'priority', value: v, operator: 'eq' }
  }
  return null
}

function matchType (q, typeOptions) {
  const lower = toLower(q)
  const options = typeOptions || [
    { value: 'lead', label: 'Lead' },
    { value: 'opportunity', label: 'Opportunity' }
  ]
  if (/\bleads?\b/i.test(lower) && !/\bopportunities?\b/i.test(lower)) {
    const v = options.find(o => toLower(String(o.value || o.label)) === 'lead')?.value || 'lead'
    return { id: 'type', value: v, operator: 'eq' }
  }
  if (/\bopportunities?\b/i.test(lower) && !/\bleads?\b/i.test(lower)) {
    const v = options.find(o => toLower(String(o.value || o.label)) === 'opportunity')?.value || 'opportunity'
    return { id: 'type', value: v, operator: 'eq' }
  }
  return null
}

function matchAccountType (q, accountTypeOptions) {
  const lower = toLower(q)
  const options = accountTypeOptions || [
    { value: 'Contact', label: 'Contact' },
    { value: 'Account', label: 'Account' }
  ]
  
  // Match exact option values first
  if (options.length) {
    for (const opt of options) {
      const v = (opt.value || opt.label || '').toString()
      if (toLower(q.trim()) === toLower(v)) {
        return { id: 'accountType', value: v, operator: 'eq' }
      }
    }
  }
  
  // Match common patterns for contacts
  if (/\bcontacts?\b/i.test(lower) || /\bindividuals?\b/i.test(lower) || /\bpeople\b/i.test(lower)) {
    const v = options.find(o => toLower(String(o.value || o.label)) === 'contact')?.value || 'Contact'
    return { id: 'accountType', value: v, operator: 'eq' }
  }
  
  // Match common patterns for accounts
  if (/\baccounts?\b/i.test(lower) || /\bcompan(?:y|ies)\b/i.test(lower) || /\bbusiness(?:es)?\b/i.test(lower) || /\borganizations?\b/i.test(lower)) {
    const v = options.find(o => toLower(String(o.value || o.label)) === 'account')?.value || 'Account'
    return { id: 'accountType', value: v, operator: 'eq' }
  }
  
  return null
}

function matchRequestedCarBrand (q, requestedCarBrandOptions) {
  if (!requestedCarBrandOptions?.length) return null
  const lower = toLower(q)
  const trimmed = q.trim()
  for (const opt of requestedCarBrandOptions) {
    const v = (opt.value || opt.label || '').toString()
    if (toLower(trimmed) === toLower(v) || lower.includes(toLower(v))) {
      return { id: 'requestedCarBrand', value: v, operator: 'eq' }
    }
  }
  const synonyms = { vw: 'Volkswagen', volkswagen: 'Volkswagen', bmw: 'BMW', audi: 'Audi', mercedes: 'Mercedes-Benz', porsche: 'Porsche' }
  for (const [key, brand] of Object.entries(synonyms)) {
    if (lower.includes(key)) {
      const v = requestedCarBrandOptions.find(o => toLower(String(o.value || o.label)).includes(brand.toLowerCase()))?.value
      if (v) return { id: 'requestedCarBrand', value: v, operator: 'eq' }
    }
  }
  return null
}

function matchVehicleBrand (q, brandOptions) {
  const options = brandOptions ?? [
    { value: 'Volkswagen', label: 'Volkswagen' },
    { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
    { value: 'Audi', label: 'Audi' },
    { value: 'Porsche', label: 'Porsche' }
  ]
  const lower = toLower(q)
  const synonyms = { vw: 'Volkswagen', volkswagen: 'Volkswagen', bmw: 'BMW', audi: 'Audi', mercedes: 'Mercedes-Benz', porsche: 'Porsche' }
  for (const [key, brand] of Object.entries(synonyms)) {
    if (lower.includes(key)) {
      const v = options.find(o => toLower(String(o.value || o.label)).includes(brand.toLowerCase()))?.value
      if (v) return { id: 'brand', value: v, operator: 'eq' }
    }
  }
  for (const opt of options) {
    const v = (opt.value || opt.label || '').toString()
    if (lower.includes(toLower(v))) {
      return { id: 'brand', value: v, operator: 'eq' }
    }
  }
  return null
}

function matchVehiclePrice (q) {
  const lower = toLower(q)
  const underMatch = lower.match(/(?:under|below|less than)\s*€?\s*(\d+(?:[.,]\d+)?)\s*k?/i) ||
    lower.match(/€?\s*(\d+(?:[.,]\d+)?)\s*k?\s*(?:and\s+)?(?:under|below|less)/i)
  if (underMatch) {
    let max = parseFloat(String(underMatch[1]).replace(',', ''))
    if (/\d+\s*k\b/i.test(q)) max *= 1000
    return { id: 'price', value: max, operator: 'lte' }
  }
  const overMatch = lower.match(/(?:over|above|more than)\s*€?\s*(\d+(?:[.,]\d+)?)\s*k?/i)
  if (overMatch) {
    let min = parseFloat(String(overMatch[1]).replace(',', ''))
    if (/\d+\s*k\b/i.test(q)) min *= 1000
    return { id: 'price', value: min, operator: 'gte' }
  }
  return null
}

export function useNaturalLanguageQuery (options = {}) {
  const context = options.context ?? ''
  const assigneeOptions = options.assigneeOptions ?? []
  const volvoModelOptions = options.volvoModelOptions ?? []
  const brandOptions = options.brandOptions ?? []
  const requestTypeOptions = options.requestTypeOptions ?? []
  const statusOptions = options.statusOptions ?? []
  const sourceOptions = options.sourceOptions ?? []
  const priorityOptions = options.priorityOptions ?? []
  const typeOptions = options.typeOptions ?? []
  const requestedCarBrandOptions = options.requestedCarBrandOptions ?? []
  const accountTypeOptions = options.accountTypeOptions ?? []

  function processQuery (query) {
    if (!query || typeof query !== 'string') {
      return { filters: [], error: null, globalFilterFallback: (query || '').trim() || undefined }
    }
    let q = query.trim()
    q = q.replace(/\s+and\s+/gi, ' ').replace(/\s*&\s*/g, ' ').replace(/\s+/g, ' ').trim()
    if (!q) return { filters: [], error: null, globalFilterFallback: undefined }

    const filters = []

    if (context === 'vehicles') {
      // Vehicles-specific parsing
      const carStatus = matchCarStatus(q, context)
      if (carStatus) filters.push(carStatus)
      const volvo = matchVolvoModel(q, volvoModelOptions, context)
      if (volvo) filters.push(volvo)
      const brand = matchVehicleBrand(q, brandOptions)
      if (brand) filters.push(brand)
      const price = matchVehiclePrice(q)
      if (price) filters.push(price)
      // Only add status from matchStatus if carStatus didn't already add one (avoids duplicate for "new cars")
      if (!carStatus) {
        const status = matchStatus(q, statusOptions)
        if (status) filters.push(status)
      }
    } else if (context === 'customers') {
      const source = matchSource(q, sourceOptions)
      if (source) filters.push(source)
      const accountType = matchAccountType(q, accountTypeOptions)
      if (accountType) filters.push(accountType)
    } else {
      // leads, opportunities, tasks, requests, reports – shared parsing
      const dateRange = parseDateRange(q)
      if (dateRange) {
        filters.push({
          id: dateRange.operator === 'between' ? 'createdAt' : 'createdAt',
          value: dateRange.operator === 'between' ? { from: dateRange.from, to: dateRange.to } : dateRange.from,
          operator: dateRange.operator
        })
      }
      const assignee = matchAssignee(q, assigneeOptions)
      if (assignee) filters.push(assignee)
      const carStatus = matchCarStatus(q, context)
      if (carStatus) filters.push(carStatus)
      const volvo = matchVolvoModel(q, volvoModelOptions, context)
      if (volvo) filters.push(volvo)
      const requestType = matchRequestType(q, requestTypeOptions)
      if (requestType) filters.push(requestType)
      const status = matchStatus(q, statusOptions)
      if (status) filters.push(status)
      const source = matchSource(q, sourceOptions)
      if (source) filters.push(source)
      const priority = matchPriority(q, priorityOptions)
      if (priority) filters.push(priority)
      const type = matchType(q, typeOptions)
      if (type) filters.push(type)
      const accountType = matchAccountType(q, accountTypeOptions)
      if (accountType) filters.push(accountType)
      const requestedCarBrand = matchRequestedCarBrand(q, requestedCarBrandOptions)
      if (requestedCarBrand) filters.push(requestedCarBrand)
    }

    if (filters.length > 0) {
      return { filters, error: null }
    }
    const assigneeFallbackMatch = q.match(/(?:assigned to|managed by|handled by)\s+([a-z'\s]+?)(?:\s*$|\s+and\s|\.|,)/i) ||
      q.match(/([a-z]+)'s\s+(?:leads?|cars?|opportunities?)/i)
    const fallbackSearch = assigneeFallbackMatch ? assigneeFallbackMatch[1].trim() : q
    return { filters: [], error: null, globalFilterFallback: fallbackSearch || q }
  }

  return { processQuery }
}
