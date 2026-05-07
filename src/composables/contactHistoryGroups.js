const GROUP_ORDER = ['sales', 'service']

export function buildContactHistoryGroups(rows) {
  const list = Array.isArray(rows) ? rows : []
  const byType = { sales: [], service: [] }
  const salesLeads = []
  const salesOpps = []
  for (const r of list) {
    if (r?.type === 'service') {
      byType.service.push(r)
      continue
    }
    if (r?.type === 'lead') salesLeads.push(r)
    else salesOpps.push(r)
  }
  salesLeads.sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0))
  salesOpps.sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0))
  byType.sales = [...salesLeads, ...salesOpps]
  byType.service.sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0))
  return GROUP_ORDER.map((key) => ({ key, items: byType[key] })).filter(
    (g) => g.items.length > 0
  )
}
