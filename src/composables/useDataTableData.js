import { computed, watch } from 'vue'
import { DEFAULT_TABLE_PAGE_SIZE } from '@/constants/dataTable'

/**
 * Get a nested property from an object by dot path (e.g. 'customer.name').
 * @param {Record<string, unknown>} obj
 * @param {string} path
 * @returns {unknown}
 */
export function getNestedProperty(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined
  try {
    return path.split('.').reduce((current, prop) => {
      if (current != null && typeof current === 'object' && prop in current) {
        return current[prop]
      }
      return undefined
    }, obj)
  } catch {
    return undefined
  }
}

/**
 * Normalize columnFilters to array of { key, value, operator }.
 * Handles both array and object shapes from Motork DataTable.
 * @param {unknown} columnFilters
 * @returns {{ key: string, value: unknown, operator: string }[]}
 */
function normalizeColumnFilters(columnFilters) {
  if (Array.isArray(columnFilters)) {
    return columnFilters
      .map((f) => {
        const key = f.field ?? f.key ?? f.id ?? f.columnId
        if (!key) return null
        let value = f.value
        if (value != null && typeof value === 'object' && 'value' in value) {
          value = value.value
        }
        const operator = f.operator ?? 'eq'
        return { key, value, operator }
      })
      .filter(Boolean)
  }
  if (columnFilters && typeof columnFilters === 'object') {
    return Object.entries(columnFilters).map(([key, val]) => {
      let value = val
      if (value != null && typeof value === 'object' && 'value' in value) {
        value = value.value
      }
      const operator =
        val && typeof val === 'object' && 'operator' in val ? val.operator : 'eq'
      return { key, value, operator }
    })
  }
  return []
}

/**
 * Check if a row matches a single column filter.
 * Supports operators: eq, ne, in, notIn, between, gte, lte, exists, notExists.
 * @param {Record<string, unknown>} row
 * @param {{ key: string, value: unknown, operator: string }} filter
 * @param {{ key: string, type?: string, inputType?: string } | undefined} filterDef
 * @param {(row: Record<string, unknown>, key: string) => unknown} getFilterValue
 * @returns {boolean}
 */
export function matchesColumnFilter(row, filter, filterDef, getFilterValue) {
  if (!filterDef) return true

  let filterValue = filter.value
  if (filterValue != null && typeof filterValue === 'object' && 'value' in filterValue) {
    filterValue = filterValue.value
  }

  const isEmpty =
    filterValue === null ||
    filterValue === undefined ||
    (typeof filterValue === 'string' && filterValue.trim() === '') ||
    (Array.isArray(filterValue) && filterValue.length === 0)
  if (isEmpty) return true

  const rowValue = getFilterValue(row, filterDef.key)
  const operator = filter.operator || 'eq'

  if (rowValue === null || rowValue === undefined) {
    if (operator === 'exists') return false
    if (operator === 'notExists') return true
    return operator === 'ne'
  }

  if (filterDef.type === 'boolean') {
    if (operator === 'exists') return rowValue != null && rowValue !== ''
    if (operator === 'notExists') return rowValue == null || rowValue === ''
    return true
  }

  if (filterDef.type === 'multiselect') {
    const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue]
    const normalized = filterValues.map((fv) =>
      fv != null && typeof fv === 'object' && 'value' in fv ? fv.value : fv
    )
    const rowStr = String(rowValue).toLowerCase()
    const match = normalized.some((fv) => String(fv).toLowerCase() === rowStr)
    if (operator === 'in') return match
    if (operator === 'notIn') return !match
    return true
  }

  if (
    (filterDef.type === 'inputrange' || filterDef.type === 'daterange') &&
    (filterDef.inputType === 'date' || filterDef.type === 'daterange')
  ) {
    const rowDate = new Date(String(rowValue)).getTime()
    if (operator === 'between') {
      let from = null
      let to = null
      if (Array.isArray(filterValue) && filterValue.length >= 2) {
        from = filterValue[0] ? new Date(filterValue[0]).getTime() : null
        to = filterValue[1] ? new Date(filterValue[1]).getTime() : null
      } else if (filterValue && typeof filterValue === 'object' && ('from' in filterValue || 'to' in filterValue)) {
        from = filterValue.from ? new Date(filterValue.from).getTime() : null
        to = filterValue.to ? new Date(filterValue.to).getTime() : null
      }
      if (from != null && !Number.isNaN(from) && rowDate < from) return false
      if (to != null && !Number.isNaN(to) && rowDate > to) return false
      return true
    }
    if (operator === 'gte') {
      const from = filterValue ? new Date(filterValue).getTime() : null
      return from == null || Number.isNaN(from) || rowDate >= from
    }
    if (operator === 'lte') {
      const to = filterValue ? new Date(filterValue).getTime() : null
      return to == null || Number.isNaN(to) || rowDate <= to
    }
  }

  if (
    filterDef.type === 'inputrange' &&
    (filterDef.inputType === 'number' || filterDef.inputType === undefined)
  ) {
    const rowNum = Number(rowValue)
    if (Number.isNaN(rowNum)) return operator === 'ne'
    if (operator === 'between' && Array.isArray(filterValue) && filterValue.length >= 2) {
      const low = Number(filterValue[0])
      const high = Number(filterValue[1])
      if (!Number.isNaN(low) && rowNum < low) return false
      if (!Number.isNaN(high) && rowNum > high) return false
      return true
    }
    if (operator === 'gte') {
      const min = Number(filterValue)
      return Number.isNaN(min) || rowNum >= min
    }
    if (operator === 'lte') {
      const max = Number(filterValue)
      return Number.isNaN(max) || rowNum <= max
    }
  }

  const rowStr = String(rowValue).toLowerCase().trim()
  const filterStr = String(filterValue).toLowerCase().trim()
  if (operator === 'eq') return rowStr === filterStr
  if (operator === 'ne') return rowStr !== filterStr
  if (operator === 'includes') return rowStr.includes(filterStr)
  return true
}

const GLOBAL_FILTER_STOPWORDS = new Set(['to', 'the', 'and', 'a', 'an', 'in', 'on', 'at', 'for'])

/**
 * Get searchable text values from a row (for multi-word matching).
 * @param {Record<string, unknown>} row
 * @param {((row: Record<string, unknown>) => (string | number | null | undefined)[]) | string[]} searchableFields
 * @returns {string[]}
 */
function getSearchableValues(row, searchableFields) {
  const values =
    typeof searchableFields === 'function'
      ? searchableFields(row)
      : searchableFields.map((path) => getNestedProperty(row, path))
  return values
    .filter((v) => v != null && String(v).trim() !== '')
    .map((v) => String(v).toLowerCase())
}

/**
 * Check if a row matches a phrase with AND logic: phrase is split into words (stopwords removed),
 * row must contain every word in at least one searchable value.
 * @param {Record<string, unknown>} row
 * @param {string} phrase
 * @param {((row: Record<string, unknown>) => (string | number | null | undefined)[]) | string[]} searchableFields
 * @returns {boolean}
 */
export function matchesGlobalFilterPhraseAnd(row, phrase, searchableFields) {
  const words = phrase
    .trim()
    .split(/\s+/)
    .map((w) => w.toLowerCase().trim())
    .filter((w) => w.length > 0 && !GLOBAL_FILTER_STOPWORDS.has(w))
  if (words.length === 0) return true
  const values = getSearchableValues(row, searchableFields)
  if (values.length === 0) return false
  const combined = values.join(' ')
  return words.every((word) => combined.includes(word))
}

/**
 * Check if a row matches global search across given field paths or getter.
 * Single term: row matches if any searchable value contains the term.
 * @param {Record<string, unknown>} row
 * @param {string} searchTerm
 * @param {((row: Record<string, unknown>) => (string | number | null | undefined)[]) | string[]} searchableFields - array of key paths, or function returning values to search
 * @returns {boolean}
 */
export function matchesGlobalFilter(row, searchTerm, searchableFields) {
  const term = searchTerm.trim().toLowerCase()
  if (!term) return true
  const values = getSearchableValues(row, searchableFields)
  if (values.length === 0) return false
  const combined = values.join(' ')
  return combined.includes(term)
}

/**
 * Get sort value for a row/column (using column accessorFn or accessorKey).
 * @param {Record<string, unknown>} row
 * @param {string} columnId
 * @param {Array<{ accessorKey?: string, accessorFn?: (row: unknown, index: number) => unknown }>} columns
 * @param {(row: Record<string, unknown>, key: string) => unknown} getNested
 * @returns {unknown}
 */
export function getSortValue(row, columnId, columns, getNested) {
  const col = columns.find((c) => (c.id ?? c.accessorKey) === columnId)
  if (col?.accessorFn && typeof col.accessorFn === 'function') {
    try {
      return col.accessorFn(row, 0)
    } catch {
      return null
    }
  }
  const key = col?.accessorKey ?? columnId
  return getNested(row, key)
}

/**
 * Composable: filter → sort → paginate raw data for Motork DataTable.
 * Resets pageIndex to 0 when globalFilter or columnFilters change.
 *
 * @param {Object} params
 * @param {import('vue').Ref<any[]> | import('vue').ComputedRef<any[]>} params.rawData - Raw rows
 * @param {import('vue').Ref<any[]> | import('vue').ComputedRef<any[]>} params.columns - Column definitions (for sort accessors)
 * @param {import('vue').Ref<string>} params.globalFilter
 * @param {import('vue').Ref<unknown>} params.columnFilters
 * @param {import('vue').Ref<{ id: string, desc?: boolean }[]>} params.sorting
 * @param {import('vue').Ref<{ pageIndex: number, pageSize: number }>} params.pagination
 * @param {import('vue').Ref<any[]> | import('vue').ComputedRef<any[]>} params.filterDefs - FilterDefinition[] (key, type, operators, etc.)
 * @param {((row: any) => (string|number|null|undefined)[]) | string[]} [params.searchableFields] - For global search: paths or getter
 * @param {(row: Record<string, unknown>, filterKey: string) => unknown} [params.getFilterValue] - Override value for filtering (e.g. requestedCarBrand -> car.brand)
 */
export function useDataTableData({
  rawData,
  columns,
  globalFilter,
  columnFilters,
  sorting,
  pagination,
  filterDefs,
  searchableFields = [],
  getFilterValue = (row, key) => getNestedProperty(row, key),
}) {
  const getDefByKey = (key) => {
    const defs = filterDefs.value ?? []
    return defs.find((d) => d.key === key)
  }

  const filteredData = computed(() => {
    let result = [...(rawData.value ?? [])]
    const term = globalFilter.value?.trim?.() ?? ''
    if (term) {
      const orSegments = term.split(/\s+or\s+/i).map((s) => s.trim()).filter(Boolean)
      if (orSegments.length > 1) {
        result = result.filter((row) =>
          orSegments.some((segment) =>
            matchesGlobalFilterPhraseAnd(row, segment, searchableFields)
          )
        )
      } else {
        result = result.filter((row) =>
          matchesGlobalFilterPhraseAnd(row, term, searchableFields)
        )
      }
    }
    const filters = normalizeColumnFilters(columnFilters.value)
    if (filters.length > 0) {
      result = result.filter((row) =>
        filters.every((f) => {
          const def = getDefByKey(f.key)
          if (def?.externalFilter === true || f.key === 'showClosed') return true
          return matchesColumnFilter(row, f, def, getFilterValue)
        })
      )
    }
    return result
  })

  const sortedData = computed(() => {
    const sortState = sorting.value ?? []
    if (sortState.length === 0) return filteredData.value
    const cols = columns.value ?? []
    const sorted = [...filteredData.value]
    sorted.sort((a, b) => {
      for (const s of sortState) {
        if (!s.id) continue
        const aVal = getSortValue(a, s.id, cols, (row, key) => getFilterValue(row, key))
        const bVal = getSortValue(b, s.id, cols, (row, key) => getFilterValue(row, key))
        let cmp = 0
        if (aVal == null) cmp = 1
        else if (bVal == null) cmp = -1
        else if (typeof aVal === 'string' && typeof bVal === 'string') {
          cmp = aVal.toLowerCase().localeCompare(bVal.toLowerCase())
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          cmp = aVal - bVal
        } else {
          cmp = String(aVal).localeCompare(String(bVal))
        }
        if (cmp !== 0) return s.desc ? -cmp : cmp
      }
      return 0
    })
    return sorted
  })

  const totalFilteredCount = computed(() => sortedData.value.length)

  const paginatedData = computed(() => {
    const pageSize = Math.max(1, pagination.value?.pageSize ?? DEFAULT_TABLE_PAGE_SIZE)
    const pageIndex = Math.max(0, pagination.value?.pageIndex ?? 0)
    const start = pageIndex * pageSize
    return sortedData.value.slice(start, start + pageSize)
  })

  watch(
    [columnFilters, globalFilter],
    () => {
      if (pagination.value && typeof pagination.value === 'object') {
        pagination.value.pageIndex = 0
      }
    },
    { deep: true }
  )

  return {
    filteredData,
    sortedData,
    paginatedData,
    totalFilteredCount,
    getNestedProperty,
    matchesColumnFilter,
    matchesGlobalFilter,
    getSortValue,
  }
}
