import { mockCustomers } from './mockData'

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * In-memory company rows for the company search dropdown (demo / fake data only).
 * Not inserted into `mockCustomers` to avoid id collisions; merged only in getAccounts().
 */
const MOCK_COMPANY_SEARCH_ONLY = [
  { id: 9901, name: 'Sunrise Automotive SpA', company: 'Sunrise Automotive SpA', email: 'info@sunrise-auto.test' },
  { id: 9902, name: 'Metro Fleet Italia', company: 'Metro Fleet Italia', email: 'sales@metro-fleet.test' },
  { id: 9903, name: 'Bergmann Premium Cars', company: 'Bergmann Premium Cars', email: 'hello@bergmann-cars.test' },
  { id: 9904, name: 'Coastal Motors Group', company: 'Coastal Motors Group', email: 'contact@coastal.test' },
  { id: 9905, name: 'Verona Auto Center', company: 'Verona Auto Center', email: 'info@verona-auto.test' },
  { id: 9906, name: 'Delta Mobility Solutions', company: 'Delta Mobility Solutions', email: 'office@delta-mobility.test' },
  { id: 9907, name: 'North Star Leasing S.r.l.', company: 'North Star Leasing S.r.l.', email: 'lease@northstar.test' },
]

// Filter accounts (customers with company field) + demo company list for search
const getAccounts = () => {
  const fromCustomers = mockCustomers.filter((c) => c.company && c.company !== '')
  return [...fromCustomers, ...MOCK_COMPANY_SEARCH_ONLY]
}

export const fetchAccounts = async (filters = {}) => {
  await delay()
  
  let results = getAccounts()
  
  if (filters.search) {
    const search = filters.search.toLowerCase()
    results = results.filter((account) => {
      const name = (account.name || '').toLowerCase()
      const email = (account.email || '').toLowerCase()
      return (
        name.includes(search) ||
        email.includes(search) ||
        (account.company && account.company.toLowerCase().includes(search)) ||
        (account.vat && String(account.vat).toLowerCase().includes(search)) ||
        (account.vatNumber && String(account.vatNumber).toLowerCase().includes(search))
      )
    })
  }

  const companyLabel = (a) => (a.company || a.name || '').toString()
  results = [...results].sort((a, b) =>
    companyLabel(a).localeCompare(companyLabel(b), undefined, { sensitivity: 'base' })
  )

  return { data: results, total: results.length }
}

export const fetchAccountById = async (id) => {
  await delay()
  const accounts = getAccounts()
  const account = accounts.find(a => a.id === parseInt(id))
  if (!account) throw new Error('Account not found')
  
  // Ensure account has all required fields with defaults
  return {
    ...account,
    id: account.id,
    name: account.name || account.companyName || account.company || '',
    companyName: account.companyName || account.company || account.name || '',
    type: account.type || (account.company ? 'Company' : 'Private'),
    vat: account.vat || account.vatNumber || null,
    vatNumber: account.vatNumber || account.vat || null,
    taxCode: account.taxCode || account.fiscalCode || null,
    fiscalCode: account.fiscalCode || account.taxCode || null,
    accountOwner: account.accountOwner || account.owner || null,
    owner: account.owner || account.accountOwner || null,
    masterContactId: account.masterContactId || account.masterContact?.id || null,
    masterContact: account.masterContact || (account.masterContactId ? { id: account.masterContactId } : null),
    description: account.description || account.notes || null,
    notes: account.notes || account.description || null,
    numberOfEmployees: account.numberOfEmployees || null,
    isDealer: account.isDealer === true
  }
}

export const createAccount = async (accountData) => {
  await delay()
  const company = (accountData.company || accountData.name || '').trim()
  const vat =
    (accountData.vat || accountData.vatNumber || accountData.companyVat || '').toString().trim() || null
  let numberOfEmployees = accountData.numberOfEmployees
  if (numberOfEmployees === undefined || numberOfEmployees === null || numberOfEmployees === '') {
    const raw = accountData.companyEmployeeCount
    if (raw != null && String(raw).trim() !== '') {
      const n = parseInt(String(raw).trim(), 10)
      numberOfEmployees = Number.isNaN(n) ? null : n
    } else {
      numberOfEmployees = null
    }
  }
  const isDealer =
    accountData.isDealer !== undefined
      ? Boolean(accountData.isDealer)
      : Boolean(accountData.companyIsDealer)
  const newAccount = {
    ...accountData,
    id: mockCustomers.length + 1,
    company: company || accountData.company,
    name: (accountData.name || company).trim() || company,
    vat,
    vatNumber: vat,
    numberOfEmployees: numberOfEmployees ?? null,
    isDealer,
    type: accountData.type || 'Company',
    createdAt: new Date().toISOString(),
    lastContact: new Date().toISOString()
  }
  mockCustomers.push(newAccount)
  return newAccount
}

export const updateAccount = async (id, updates) => {
  await delay()
  const accounts = getAccounts()
  const index = accounts.findIndex(a => a.id === parseInt(id))
  if (index === -1) throw new Error('Account not found')
  
  const customerIndex = mockCustomers.findIndex(c => c.id === parseInt(id))
  if (customerIndex !== -1) {
    mockCustomers[customerIndex] = { ...mockCustomers[customerIndex], ...updates }
  }
  
  return mockCustomers[customerIndex]
}

export const deleteAccount = async (id) => {
  await delay()
  const index = mockCustomers.findIndex(c => c.id === parseInt(id))
  if (index === -1) throw new Error('Account not found')
  
  mockCustomers.splice(index, 1)
  return { success: true }
}




