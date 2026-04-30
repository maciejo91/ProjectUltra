/**
 * Shared rules for Vehicles page and vehicle picker modals (inventory scope + owner label for filters).
 */

/**
 * @param {Record<string, unknown>} v
 * @returns {string}
 */
export function normalizeVehicleInventoryType(v) {
  if (!v || typeof v !== 'object') return 'customer-vehicles'
  if (v.inventoryType != null && v.inventoryType !== '') return String(v.inventoryType)
  return v.stockDays !== null && v.stockDays !== undefined ? 'in-stock' : 'customer-vehicles'
}

/**
 * Owner string for table filtering/sorting (matches VehicleFromStockModal / picker behavior).
 * @param {Record<string, unknown>} vehicle
 * @returns {string}
 */
export function getVehicleTableOwnerLabel(vehicle) {
  const v = vehicle || {}
  const trim = (s) => String(s ?? '').trim()
  if (trim(v.soldTo)) return trim(v.soldTo)
  if (trim(v.ownerName)) return trim(v.ownerName)
  if (trim(v.customerName)) return trim(v.customerName)
  if (trim(v.owner)) return trim(v.owner)
  if (Array.isArray(v.requestedBy) && v.requestedBy.length > 0) {
    const first = trim(v.requestedBy[0])
    if (first) return first
  }
  return ''
}

/**
 * Row shape for data tables that filter by inventoryType and owner.
 * @param {Record<string, unknown>} v
 * @returns {Record<string, unknown>}
 */
export function normalizeVehicleInventoryTableRow(v) {
  const inventoryType = normalizeVehicleInventoryType(v)
  const base = { ...v, inventoryType }
  return { ...base, owner: getVehicleTableOwnerLabel(base) }
}

/**
 * Value used for `inventoryType` column filters and tab counts.
 * Rows tagged `sold` (sold to a customer) belong in the same bucket as `customer-vehicles`
 * so owner pickers and the "Customers' vehicles" view are not empty.
 * @param {Record<string, unknown>} row
 * @returns {string}
 */
export function getVehicleInventoryTypeFilterValue(row) {
  const t = normalizeVehicleInventoryType(row)
  if (t === 'sold') return 'customer-vehicles'
  return t
}

/**
 * Pinned column filter rows for inventory tab (same shape as Vehicles.vue).
 * @param {'in-stock' | 'customer-vehicles'} chip
 * @returns {Array<{ id: string, field: string, value: string, operator: string, pinned: boolean }>}
 */
export function getInventoryTypeColumnFilters(chip) {
  return [{ id: 'inventoryType-1', field: 'inventoryType', value: chip, operator: 'eq', pinned: true }]
}
