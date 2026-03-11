import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as contactsApi from '@/api/contacts'
import * as accountsApi from '@/api/accounts'

export const useCustomersStore = defineStore('customers', () => {
  // State
  const customers = ref([]) // Unified list of contacts + accounts
  const currentCustomer = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  
  // Computed: separate contacts and accounts for filtering
  const contacts = computed(() => 
    customers.value.filter(c => c.type === 'contact')
  )
  
  const accounts = computed(() => 
    customers.value.filter(c => c.type === 'account')
  )
  
  const totalCustomers = computed(() => customers.value.length)
  const totalContacts = computed(() => contacts.value.length)
  const totalAccounts = computed(() => accounts.value.length)
  
  // Fetch all customers (contacts + accounts)
  const fetchCustomers = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      // Fetch from both APIs in parallel
      const [contactsResult, accountsResult] = await Promise.all([
        contactsApi.fetchContacts(filters),
        accountsApi.fetchAccounts(filters)
      ])
      
      // Merge and add type field
      const merged = [
        ...contactsResult.data.map(c => ({ ...c, type: 'contact' })),
        ...accountsResult.data.map(a => ({ ...a, type: 'account' }))
      ]
      
      customers.value = merged
      return { data: merged, total: merged.length }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Fetch customer by ID (checks both contacts and accounts)
  const fetchCustomerById = async (id, type = null) => {
    loading.value = true
    error.value = null
    try {
      // If type is known, fetch from specific API
      if (type === 'contact') {
        currentCustomer.value = { ...await contactsApi.fetchContactById(id), type: 'contact' }
      } else if (type === 'account') {
        currentCustomer.value = { ...await accountsApi.fetchAccountById(id), type: 'account' }
      } else {
        // Try both APIs
        try {
          const contact = await contactsApi.fetchContactById(id)
          currentCustomer.value = { ...contact, type: 'contact' }
        } catch {
          const account = await accountsApi.fetchAccountById(id)
          currentCustomer.value = { ...account, type: 'account' }
        }
      }
      return currentCustomer.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Create customer (routes to correct API based on type)
  const addCustomer = async (customerData) => {
    loading.value = true
    error.value = null
    try {
      const isAccount = customerData.company && customerData.company !== ''
      const newCustomer = await (isAccount 
        ? accountsApi.createAccount(customerData)
        : contactsApi.createContact(customerData)
      )
      
      const customerWithType = { ...newCustomer, type: isAccount ? 'account' : 'contact' }
      customers.value.unshift(customerWithType)
      return customerWithType
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Update customer (routes to correct API)
  const updateCustomer = async (id, updates, type) => {
    loading.value = true
    error.value = null
    try {
      const updated = await (type === 'account'
        ? accountsApi.updateAccount(id, updates)
        : contactsApi.updateContact(id, updates)
      )
      
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = { ...updated, type }
      }
      
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = { ...updated, type }
      }
      
      return { ...updated, type }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Delete customer
  const removeCustomer = async (id, type) => {
    loading.value = true
    error.value = null
    try {
      await (type === 'account'
        ? accountsApi.deleteAccount(id)
        : contactsApi.deleteContact(id)
      )
      
      customers.value = customers.value.filter(c => c.id !== id)
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = null
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Set search query
  function setSearchQuery(query) {
    searchQuery.value = query
    fetchCustomers({ search: query })
  }
  
  // Legacy methods for backward compatibility
  const addContact = async (contactData) => {
    return await addCustomer({ ...contactData, company: null })
  }
  
  const modifyContact = async (id, updates) => {
    return await updateCustomer(id, updates, 'contact')
  }
  
  const removeContact = async (id) => {
    return await removeCustomer(id, 'contact')
  }
  
  // Contact-specific methods (for backward compatibility)
  const addRequestedCar = async (customerId, carData) => {
    // Find customer to determine type
    const customer = customers.value.find(c => c.id === customerId)
    if (!customer) throw new Error('Customer not found')
    
    // This would need to be implemented in the API layer
    // For now, route to contacts API
    if (customer.type === 'contact') {
      return await contactsApi.addRequestedCarToContact(customerId, carData)
    }
    // Accounts might not have requested cars - handle as needed
    throw new Error('Requested cars not supported for accounts')
  }
  
  const convertToLead = async (customerId) => {
    const customer = customers.value.find(c => c.id === customerId)
    if (!customer) throw new Error('Customer not found')
    
    if (customer.type === 'contact') {
      const newLead = await contactsApi.convertContactToLead(customerId)
      // Remove from customers
      customers.value = customers.value.filter(c => c.id !== customerId)
      if (currentCustomer.value?.id === customerId) {
        currentCustomer.value = null
      }
      return newLead
    }
    throw new Error('Only contacts can be converted to leads')
  }
  
  const mergeCustomer = async (primary, duplicate) => {
    const { mergeCustomerIntoPrimary } = await import('@/api/mergeCustomer')
    await mergeCustomerIntoPrimary(primary, duplicate)
  }

  const convertToOpportunity = async (customerId) => {
    const customer = customers.value.find(c => c.id === customerId)
    if (!customer) throw new Error('Customer not found')
    
    if (customer.type === 'contact') {
      const newOpp = await contactsApi.convertContactToOpportunity(customerId)
      // Remove from customers
      customers.value = customers.value.filter(c => c.id !== customerId)
      if (currentCustomer.value?.id === customerId) {
        currentCustomer.value = null
      }
      return newOpp
    }
    throw new Error('Only contacts can be converted to opportunities')
  }
  
  return {
    // State
    customers,
    contacts,
    accounts,
    currentCustomer,
    loading,
    error,
    searchQuery,
    
    // Computed
    totalCustomers,
    totalContacts,
    totalAccounts,
    
    // Actions
    fetchCustomers,
    fetchCustomerById,
    addCustomer,
    updateCustomer,
    removeCustomer,
    setSearchQuery,
    
    // Legacy/backward compatibility
    addContact,
    modifyContact,
    removeContact,
    addRequestedCar,
    convertToLead,
    convertToOpportunity,
    mergeCustomer
  }
})


