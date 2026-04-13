<template>
  <div class="h-full overflow-hidden bg-muted">
    <CustomerProfile
      :customer-id="customerId"
      :customer-type="customerType"
      :show-close-button="false"
      :close-on-convert="false"
      :from="route.query.from"
      :filtered-customer-rows="customerRowsFromState"
      @close="handleBack"
      @customer-navigate="handleCustomerNavigate"
      @navigate-to-customer="handleNavigateToCustomer"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CustomerProfile from '@/components/customer/CustomerProfile.vue'

const route = useRoute()
const router = useRouter()

const customerId = computed(() => parseInt(route.params.id))
const customerType = computed(() => route.query.type === 'account' ? 'account' : 'contact')

const customerRowsFromState = computed(() => {
  const state = window.history?.state
  return state?.customerRows ?? []
})

function handleBack() {
  if (route.query.from === 'request') {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push({ path: '/requests' })
    return
  }
  const query = route.query.from === 'customers' && customerId.value
    ? { highlight: `customer-${customerId.value}` }
    : {}
  router.push({ path: '/customers', query })
}

function handleNavigateToCustomer(id, type) {
  const query = type === 'account' ? { type: 'account' } : {}
  router.push({ path: `/customer/${id}`, query: { from: 'customers', ...query }, state: { customerRows: [] } })
}

function handleCustomerNavigate(direction) {
  const rows = customerRowsFromState.value
  if (!rows.length || customerId.value == null) return
  const id = Number(customerId.value)
  const index = rows.findIndex((r) => (r.customerId ?? parseInt(String(r.id).replace('customer-', ''), 10)) === id)
  if (index === -1) return
  if (direction === 'previous' && index > 0) {
    const prev = rows[index - 1]
    const prevId = prev.customerId ?? parseInt(String(prev.id).replace('customer-', ''), 10)
    router.push({ path: `/customer/${prevId}`, query: { from: 'customers' }, state: { customerRows: rows } })
  } else if (direction === 'next' && index < rows.length - 1) {
    const next = rows[index + 1]
    const nextId = next.customerId ?? parseInt(String(next.id).replace('customer-', ''), 10)
    router.push({ path: `/customer/${nextId}`, query: { from: 'customers' }, state: { customerRows: rows } })
  }
}
</script>
