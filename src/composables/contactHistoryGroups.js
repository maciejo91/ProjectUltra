const GROUP_ORDER = ['lead', 'opportunity', 'service']

export function buildContactHistoryGroups(rows) {
  const list = Array.isArray(rows) ? rows : []
  const byType = { lead: [], opportunity: [], service: [] }
  for (const r of list) {
    const t =
      r.type === 'lead' ? 'lead' : r.type === 'service' ? 'service' : 'opportunity'
    byType[t].push(r)
  }
  for (const key of GROUP_ORDER) {
    byType[key].sort((a, b) => (b.sortTime || 0) - (a.sortTime || 0))
  }
  return GROUP_ORDER.map((key) => ({ key, items: byType[key] })).filter(
    (g) => g.items.length > 0
  )
}
