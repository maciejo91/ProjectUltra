/**
 * Formatters utility
 * Centralized formatting functions for dates, currency, etc.
 */

import { useSettingsStore } from '@/stores/settings'

/**
 * Calculate conversion rate from leads to opportunities
 * Optionally excludes "NOT VALID" leads based on settings
 * @param {Array} leads - Array of lead objects
 * @param {Array} opportunities - Array of opportunity objects
 * @returns {number} Conversion rate as a percentage (0-100)
 */
export function calculateConversionRate(leads, opportunities) {
  const settingsStore = useSettingsStore()
  const excludeNotValid = settingsStore.getSetting('excludeNotValidFromConversion')
  
  // Filter leads based on exclusion setting
  let validLeads = leads
  if (excludeNotValid) {
    validLeads = leads.filter(lead => {
      // Exclude "Closed - Invalid" stage and duplicates
      return lead.stage !== 'Closed - Invalid' && 
             lead.stage !== 'Not Valid' &&
             !lead.isDuplicate
    })
  }
  
  if (validLeads.length === 0) return 0
  
  // Count opportunities that were created from leads
  const convertedCount = opportunities.filter(opp => {
    // Check if opportunity has a leadId or was created from a lead
    return opp.leadId || opp.source === 'Lead'
  }).length
  
  return (convertedCount / validLeads.length) * 100
}

/**
 * Format a due date timestamp for display
 * @param {string} isoTimestamp - ISO timestamp string
 * @returns {string} Formatted string: "OVERDUE", "2h 30m", or "Dec 22"
 */
export function formatDueDate(isoTimestamp) {
  if (!isoTimestamp) return ''
  
  const dueDate = new Date(isoTimestamp)
  const now = new Date()
  
  // Check if overdue
  if (dueDate < now) {
    return 'OVERDUE'
  }
  
  // Check if it's today
  const isToday = dueDate.toDateString() === now.toDateString()
  
  if (isToday) {
    // Calculate remaining time
    const remaining = dueDate - now
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
  
  // Not today - return formatted date
  return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format a date for display
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date like "Dec 19, 2025"
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Format time for display
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted time like "02:30 PM"
 */
export function formatTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Format currency value
 * @param {number} value - Number to format
 * @returns {string} Formatted with thousand separators
 */
export function formatCurrency(value) {
  return value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0'
}

/**
 * Format full deadline with date and time
 * @param {string} isoTimestamp - ISO timestamp string
 * @returns {string} Formatted string: "Jan 5, 2:30 PM" or "OVERDUE"
 */
export function formatDeadlineFull(isoTimestamp) {
  if (!isoTimestamp) return 'No deadline'
  
  const dueDate = new Date(isoTimestamp)
  const now = new Date()
  
  // Check if overdue
  if (dueDate < now) {
    return 'OVERDUE'
  }
  
  // Format as "Jan 5, 2:30 PM"
  const dateStr = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timeStr = dueDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  
  return `${dateStr}, ${timeStr}`
}

/**
 * Get deadline status (overdue, urgent, normal)
 * @param {string} isoTimestamp - ISO timestamp string
 * @returns {object} Status object with type, styling, and relative time
 */
export function getDeadlineStatus(isoTimestamp) {
  if (!isoTimestamp) {
    return { 
      type: 'none', 
      color: 'gray', 
      icon: 'fa-clock',
      relativeTime: 'No deadline',
      statusText: 'No deadline',
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-700',
      borderClass: 'border-gray-200',
      iconClass: 'fa-solid fa-clock'
    }
  }
  
  const dueDate = new Date(isoTimestamp)
  const now = new Date()
  const hoursUntil = (dueDate - now) / (1000 * 60 * 60)
  
  if (hoursUntil < 0) {
    return { 
      type: 'overdue', 
      color: 'red', 
      icon: 'fa-exclamation-triangle',
      relativeTime: 'OVERDUE',
      statusText: 'OVERDUE',
      bgClass: 'bg-red-50',
      textClass: 'text-red-700',
      borderClass: 'border-red-200',
      iconClass: 'fa-solid fa-exclamation-triangle'
    }
  } else if (hoursUntil < 2) {
    const minutesUntil = Math.floor((dueDate - now) / (1000 * 60))
    const hours = Math.floor(minutesUntil / 60)
    const mins = minutesUntil % 60
    return { 
      type: 'urgent', 
      color: 'orange', 
      icon: 'fa-clock',
      relativeTime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
      statusText: 'URGENT',
      bgClass: 'bg-orange-50',
      textClass: 'text-orange-700',
      borderClass: 'border-orange-200',
      iconClass: 'fa-solid fa-clock'
    }
  } else if (hoursUntil < 24) {
    const hours = Math.floor(hoursUntil)
    const minutes = Math.floor((hoursUntil - hours) * 60)
    return { 
      type: 'today', 
      color: 'blue', 
      icon: 'fa-clock',
      relativeTime: `${hours}h ${minutes}m`,
      statusText: 'TODAY',
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-200',
      iconClass: 'fa-solid fa-clock'
    }
  } else {
    const daysUntil = Math.ceil(hoursUntil / 24)
    return { 
      type: 'normal', 
      color: 'gray', 
      icon: 'fa-calendar',
      relativeTime: `${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
      statusText: 'UPCOMING',
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-700',
      borderClass: 'border-gray-200',
      iconClass: 'fa-solid fa-calendar'
    }
  }
}

/**
 * Get stage badge class for styling
 * @param {string} stage - Stage or status string
 * @returns {string} Tailwind CSS classes for badge
 */
export function getStageBadgeClass(stage) {
  const classes = {
    // Opportunity stages
    'Open': 'bg-blue-50 text-blue-700',
    'Open Opportunities': 'bg-blue-50 text-blue-700',
    'Open opportunity': 'bg-blue-50 text-blue-700',
    'Qualified': 'bg-purple-50 text-purple-700',
    'In Negotiation': 'bg-orange-50 text-orange-700',
    'Opportunity in negotiation': 'bg-orange-50 text-orange-700',
    'Registration': 'bg-indigo-50 text-indigo-700',
    'Closed': 'bg-gray-100 text-gray-700',
    'Closed opportunity': 'bg-gray-100 text-gray-700',
    'Closed Lost': 'bg-red-50 text-red-700',
    'Closed Won': 'bg-green-50 text-green-700',
    'Won': 'bg-green-50 text-green-700',
    'Lost': 'bg-red-50 text-red-700',
    // Lead statuses
    'Valid': 'bg-green-50 text-green-700',
    'Not valid': 'bg-red-50 text-red-700',
    'To be validated': 'bg-yellow-50 text-yellow-700',
    'Not interested': 'bg-gray-100 text-gray-700'
  }
  return classes[stage] || 'bg-gray-100 text-gray-700'
}

/**
 * Format a past date as relative time (e.g. "Just now", "3m ago", "1h ago", "Yesterday")
 * @param {string|Date} dateInput - ISO date string or Date object
 * @returns {string} Relative time string
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay} days ago`
  return formatDate(date)
}

/**
 * Format date and time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted string like "Jan 5, 2:30 PM"
 */
export function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format expected close date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted string like "Jan 5, 2025"
 */
export function formatExpectedCloseDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}



