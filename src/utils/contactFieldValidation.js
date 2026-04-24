/**
 * Basic email shape check (not full RFC 5322).
 */
export function validateEmailFormat(email) {
  const e = (email || '').trim()
  if (!e) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

/**
 * International-style phone: 8–15 digits, optional single leading +, no letters.
 * Allows spaces, dashes, and parentheses between digits.
 */
export function validateInternationalPhone(phone) {
  const t = (phone || '').trim()
  if (!t) return true
  if (/[a-zA-Z]/.test(t)) return false
  const plusMatches = t.match(/\+/g)
  if (plusMatches && plusMatches.length > 1) return false
  if (plusMatches?.length === 1 && !t.startsWith('+')) return false
  const digits = t.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15
}
