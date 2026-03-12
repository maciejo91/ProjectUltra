/**
 * useMergeFields – field definitions and comparison logic for merge modals.
 * Used by MergeCustomerConfirmModal and MergeConfirmModal.
 */
import { computed } from 'vue'

function get(obj, path) {
  if (!obj) return null
  const keys = path.split('.')
  let cur = obj
  for (const k of keys) {
    cur = cur?.[k]
    if (cur === undefined) return null
  }
  return cur
}

function formatVal(val) {
  if (val == null || val === '') return '—'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (Array.isArray(val)) return val.length ? val.join(', ') : '—'
  if (val instanceof Date) return val.toLocaleString()
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

/** Customer/contact field definitions: { key, label, path, section } */
export const CUSTOMER_FIELD_SECTIONS = [
  { section: 'Account info', fields: [
    { key: 'name', label: 'Name', path: 'name' },
    { key: 'email', label: 'Email', path: 'email' },
    { key: 'phone', label: 'Phone', path: 'phone' },
    { key: 'address', label: 'Address', path: 'address' },
    { key: 'company', label: 'Company', path: 'company' },
    { key: 'source', label: 'Source', path: 'source' },
    { key: 'tags', label: 'Tags', path: 'tags' }
  ]},
  { section: 'Details', fields: [
    { key: 'summary', label: 'Summary', path: 'summary' },
    { key: 'interestScore', label: 'Interest score', path: 'interestScore' },
    { key: 'preferredVehicleType', label: 'Preferred vehicle type', path: 'preferredVehicleType' },
    { key: 'preferredChannel', label: 'Preferred channel', path: 'preferredChannel' },
    { key: 'budgetRange', label: 'Budget range', path: 'budgetRange' },
    { key: 'createdAt', label: 'Created at', path: 'createdAt' },
    { key: 'lastContact', label: 'Last contact', path: 'lastContact' }
  ]}
]

/** Request (lead/opportunity) field definitions */
export const REQUEST_FIELD_SECTIONS = [
  { section: 'Request details', fields: [
    { key: 'status', label: 'Status', path: 'status' },
    { key: 'stage', label: 'Stage', path: 'stage' },
    { key: 'requestType', label: 'Request type', path: 'requestType' },
    { key: 'source', label: 'Source', path: 'source' },
    { key: 'assignee', label: 'Assignee', path: 'assignee' },
    { key: 'createdAt', label: 'Created at', path: 'createdAt' },
    { key: 'value', label: 'Value', path: 'value' }
  ]},
  { section: 'Main offer', fields: [
    { key: 'brand', label: 'Brand', path: 'requestedCar.brand' },
    { key: 'model', label: 'Model', path: 'requestedCar.model' },
    { key: 'year', label: 'Year', path: 'requestedCar.year' },
    { key: 'price', label: 'Price', path: 'requestedCar.price' },
    { key: 'vin', label: 'VIN', path: 'requestedCar.vin' }
  ]}
]

export function useMergeFields(primaryRef, otherRef, fieldSections) {
  const rows = computed(() => {
    const primary = primaryRef.value
    const other = otherRef.value
    const out = []
    for (const { section, fields } of fieldSections) {
      for (const f of fields) {
        const pVal = get(primary, f.path)
        const oVal = get(other, f.path)
        const pStr = formatVal(pVal)
        const oStr = formatVal(oVal)
        const differs = pStr !== oStr
        out.push({
          ...f,
          section,
          primaryVal: pStr,
          otherVal: oStr,
          differs
        })
      }
    }
    return out
  })

  const rowsWithDiff = computed(() => rows.value.filter((r) => r.differs))
  const hasAnyDiff = computed(() => rowsWithDiff.value.length > 0)

  return { rows, rowsWithDiff, hasAnyDiff, formatVal, get }
}
