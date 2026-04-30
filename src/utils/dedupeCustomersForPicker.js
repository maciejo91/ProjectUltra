/**
 * Deduplicate customer/contact rows for search pickers: one row per email (first wins).
 * Rows with no email are all kept (no merge key).
 *
 * @param {Array<Record<string, unknown>>} list
 * @returns {Array<Record<string, unknown>>}
 */
export function dedupeCustomersForPicker(list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const seenEmails = new Set()
  const out = []
  for (const c of list) {
    const email = String(c?.email ?? '')
      .trim()
      .toLowerCase()
    if (email) {
      if (seenEmails.has(email)) continue
      seenEmails.add(email)
    }
    out.push(c)
  }
  return out
}
