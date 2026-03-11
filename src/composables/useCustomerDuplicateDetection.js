/**
 * useCustomerDuplicateDetection – find potential duplicate customers
 *
 * API-ready: backend can provide customer.potentialDuplicates later.
 * Frontend logic (mock phase): same type (contact→contact, account→account)
 * and matching email OR phone.
 */
import { computed } from 'vue'
import { useCustomersStore } from '@/stores/customers'

function sameEmailOrPhone(a, b) {
  const emailA = (a.email || '').trim().toLowerCase()
  const emailB = (b.email || '').trim().toLowerCase()
  const phoneA = (a.phone || '').replace(/\D/g, '')
  const phoneB = (b.phone || '').replace(/\D/g, '')
  if (emailA && emailB && emailA === emailB) return true
  if (phoneA && phoneB && phoneA === phoneB) return true
  return false
}

function getCustomerType(c) {
  return c?.company && c.company !== '' ? 'account' : 'contact'
}

/**
 * @param {import('vue').ComputedRef<Object|null>} customerRef - Current customer
 * @returns {{ potentialDuplicates: import('vue').ComputedRef<Array> }}
 */
export function useCustomerDuplicateDetection(customerRef) {
  const customersStore = useCustomersStore()

  const potentialDuplicates = computed(() => {
    const customer = customerRef?.value
    if (!customer?.id) return []

    if (Array.isArray(customer.potentialDuplicates) && customer.potentialDuplicates.length > 0) {
      return customer.potentialDuplicates
    }

    const currentType = customer.type || getCustomerType(customer)
    const candidates = customersStore.customers || []

    return candidates.filter((c) => {
      if (c.id === customer.id) return false
      if (c.isMerged) return false
      const cType = c.type || getCustomerType(c)
      if (cType !== currentType) return false
      return sameEmailOrPhone(customer, c)
    })
  })

  return { potentialDuplicates }
}
