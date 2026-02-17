import { formatDeadlineFull, getDeadlineStatus, getStageBadgeClass } from '@/utils/formatters'

/**
 * Composable for task helper functions
 * Provides utility functions for task display and formatting
 */
export function useTaskHelpers() {
  // Helper function to display date with conditional logic (relative if today, absolute if future)
  const getDateDisplay = (isoTimestamp) => {
    if (!isoTimestamp) return 'No deadline'
    
    const deadlineStatus = getDeadlineStatus(isoTimestamp)
    
    // If overdue, show "OVERDUE"
    if (deadlineStatus.type === 'overdue') {
      return 'OVERDUE'
    }
    
    // If today or urgent (within 2 hours), show relative time
    if (deadlineStatus.type === 'today' || deadlineStatus.type === 'urgent') {
      return deadlineStatus.relativeTime
    }
    
    // For future dates (normal), show absolute date/time
    return formatDeadlineFull(isoTimestamp)
  }

  // Helper function to get vehicle type from task
  const getVehicleType = (task) => {
    const vehicle = task.type === 'lead' ? task.requestedCar : task.vehicle
    if (!vehicle || !vehicle.type) return null
    
    // Map the type from mockData to display format
    const typeMap = {
      'New': { type: 'new', label: 'New' },
      'New 0km': { type: '0km', label: 'New 0km' },
      'Used': { type: 'used', label: 'Used' },
      'Demo': { type: 'demo', label: 'Demo' }
    }
    
    return typeMap[vehicle.type] || { type: vehicle.type.toLowerCase(), label: vehicle.type }
  }

  // Helper function to get vehicle type badge class
  const getVehicleTypeBadgeClass = (vehicleType) => {
    if (!vehicleType) return ''
    
    const classes = {
      'new': 'bg-green-50 text-green-700',
      '0km': 'bg-blue-50 text-blue-700',
      'used': 'bg-orange-50 text-orange-700',
      'demo': 'bg-purple-50 text-purple-700'
    }
    
    return classes[vehicleType.type] || 'bg-gray-50 text-gray-700'
  }

  // Helper function to get owner info (name and initials)
  const getOwnerInfo = (task) => {
    if (!task || !task.assignee) {
      return { name: 'Unassigned', initials: '?' }
    }
    
    // Get initials from assigneeInitials if available, otherwise generate
    const initials = task.assigneeInitials || task.assignee.split(' ').map(n => n[0]).join('')
    
    return {
      name: task.assignee,
      initials: initials
    }
  }

  // Helper function to extract city from customer address
  const getCustomerCity = (task) => {
    if (!task || !task.customer || !task.customer.address) {
      return null
    }
    
    const address = task.customer.address
    // Address format: "Street, PostalCode City" or "Street, City"
    // Extract city (last part after comma)
    const parts = address.split(',')
    if (parts.length > 1) {
      const cityPart = parts[parts.length - 1].trim()
      // Remove postal code if present (numbers at start)
      const city = cityPart.replace(/^\d+\s*/, '').trim()
      return city || null
    }
    return null
  }

  // Helper function to get assignee initials
  const getAssigneeInitials = (assigneeName) => {
    if (!assigneeName) return '?'
    const parts = assigneeName.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return assigneeName.substring(0, 2).toUpperCase()
  }

  // Helper function to get location display (city • source)
  const getLocationDisplay = (task) => {
    const city = getCustomerCity(task)
    const source = task.source || 'Unknown'
    
    if (city) {
      return `${city} • ${source}`
    }
    return source
  }

  // Helper function to get task status for display (leads: status, opportunities: stage)
  const getTaskStatusDisplay = (task) => {
    if (task.type === 'lead') {
      return task.status || 'Unknown'
    } else {
      return task.stage || 'Unknown'
    }
  }

  // Helper function to format vehicle status (type / kilometers)
  const getVehicleStatusDisplay = (task) => {
    const vehicle = task.type === 'lead' ? task.requestedCar : task.vehicle
    if (!vehicle) {
      return 'No vehicle'
    }
    
    const vehicleType = getVehicleType(task)
    const typeLabel = vehicleType ? vehicleType.label : (vehicle.type || 'Unknown')
    
    // Format kilometers
    let kmDisplay = ''
    if (vehicle.kilometers !== undefined && vehicle.kilometers !== null) {
      if (vehicle.kilometers >= 1000) {
        kmDisplay = `${(vehicle.kilometers / 1000).toFixed(0)}k`
      } else {
        kmDisplay = `${vehicle.kilometers}`
      }
    }
    
    if (kmDisplay) {
      return `${typeLabel} / ${kmDisplay}`
    }
    return typeLabel
  }


  // Helper function to get unselected class for task cards
  const getUnselectedClass = (task) => {
    if (task.type === 'lead') {
      return 'bg-white hover:border-blue-300'
    }
    return 'bg-white hover:border-purple-300'
  }

  return {
    getDateDisplay,
    getVehicleType,
    getVehicleTypeBadgeClass,
    getOwnerInfo,
    getCustomerCity,
    getLocationDisplay,
    getAssigneeInitials,
    getVehicleStatusDisplay,
    getTaskStatusDisplay,
    getStageBadgeClass,
    getUnselectedClass
  }
}

