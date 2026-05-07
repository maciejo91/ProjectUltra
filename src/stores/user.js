import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as usersApi from '@/api/users'

export const useUserStore = defineStore('user', () => {
  // State - Initialize with mock data to prevent null access errors
  // This will be replaced when real authentication is implemented
  const currentUser = ref({
    id: 1,
    name: 'Maciej Ogonowski',
    email: 'maciej.ogonowski@example.com',
    phone: '+1 555 010 020',
    role: 'manager',
    initials: 'MO',
    /** Default fiscal entity for create-contact flows (mock; API would supply this) */
    fiscalEntityId: 'company-a',
  })
  const isAuthenticated = ref(true)
  
  // Load full user data from API
  const initializeUser = async () => {
    try {
      const users = await usersApi.fetchUsers()
      if (users && users.length > 0) {
        currentUser.value = users[0] // Default: First user (Salsabeel Khaleel - manager)
        isAuthenticated.value = true
      }
    } catch (error) {
      // Keep default user if API fails
      console.error('Failed to initialize user:', error)
    }
  }
  
  // Auto-initialize on store creation (async, won't block)
  initializeUser()
  
  // Getters
  const userRole = () => currentUser.value.role
  const isSalesman = () => currentUser.value.role === 'salesman'
  const isOperator = () => currentUser.value.role === 'operator'
  const isManager = () => currentUser.value.role === 'manager'
  
  // Permission getters
  const canAccessLeads = () => {
    const role = currentUser.value.role
    return role === 'operator' || role === 'manager'
  }
  
  const canAccessOpportunities = () => {
    const role = currentUser.value.role
    return role === 'salesman' || role === 'manager'
  }
  
  const canAccessReports = () => currentUser.value.role === 'manager'
  const canAccessSettings = () => currentUser.value.role === 'manager'
  
  // Actions
  function setUser(user) {
    currentUser.value = user
  }
  
  async function switchRole(role) {
    const user = await usersApi.fetchUserByRole(role)
    if (user) {
      currentUser.value = user
    }
  }
  
  function logout() {
    isAuthenticated.value = false
    currentUser.value = null
  }
  
  return {
    currentUser,
    isAuthenticated,
    userRole,
    isSalesman,
    isOperator,
    isManager,
    canAccessLeads,
    canAccessOpportunities,
    canAccessReports,
    canAccessSettings,
    setUser,
    switchRole,
    logout
  }
})
