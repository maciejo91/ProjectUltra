// Calendar event type helpers and formatters

export const getEventTypeLabel = (type) => {
  const typeMap = {
    'test-drive': 'Test Drive',
    'appointment': 'Dealership Visit',
    'offsite': 'Offsite Visit',
    'workshop': 'Workshop',
    'call': 'Call',
    'delivery': 'Delivery',
    'meeting': 'Meeting',
    'training': 'Training',
    'marketing': 'Marketing Event',
    'leave': 'Leave',
    'memo': 'Memo',
    'recall': 'Recall',
    'absence': 'Absence',
    'other': 'Other'
  }
  return typeMap[type] || type
}

export const getEventTypeHeaderClass = (type) => {
  const colorMap = {
    'test-drive': 'bg-blue-50 border-b border-blue-200',
    'appointment': 'bg-green-50 border-b border-green-200',
    'offsite': 'bg-emerald-50 border-b border-emerald-200',
    'workshop': 'bg-indigo-50 border-b border-indigo-200',
    'call': 'bg-orange-50 border-b border-orange-200',
    'delivery': 'bg-teal-50 border-b border-teal-200',
    'meeting': 'bg-purple-50 border-b border-purple-200',
    'training': 'bg-pink-50 border-b border-pink-200',
    'marketing': 'bg-yellow-50 border-b border-yellow-200',
    'leave': 'bg-red-50 border-b border-red-200',
    'memo': 'bg-gray-50 border-b border-gray-200',
    'recall': 'bg-cyan-50 border-b border-cyan-200',
    'absence': 'bg-rose-50 border-b border-rose-200',
    'other': 'bg-slate-50 border-b border-slate-200'
  }
  return colorMap[type] || 'bg-blue-50 border-b border-blue-200'
}

export const getEventTypeBadgeClass = (type) => {
  const colorMap = {
    'test-drive': 'bg-blue-100 text-blue-700 border-blue-200',
    'appointment': 'bg-green-100 text-green-700 border-green-200',
    'offsite': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'workshop': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'call': 'bg-orange-100 text-orange-700 border-orange-200',
    'delivery': 'bg-teal-100 text-teal-700 border-teal-200',
    'meeting': 'bg-purple-100 text-purple-700 border-purple-200',
    'training': 'bg-pink-100 text-pink-700 border-pink-200',
    'marketing': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'leave': 'bg-red-100 text-red-700 border-red-200',
    'memo': 'bg-gray-100 text-gray-700 border-gray-200',
    'recall': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'absence': 'bg-rose-100 text-rose-700 border-rose-200',
    'other': 'bg-slate-100 text-slate-700 border-slate-200'
  }
  return colorMap[type] || 'bg-blue-100 text-blue-700 border-blue-200'
}

export const getEventTypeTextClass = (type) => {
  const colorMap = {
    'test-drive': 'text-blue-900',
    'appointment': 'text-green-900',
    'offsite': 'text-emerald-900',
    'workshop': 'text-indigo-900',
    'call': 'text-orange-900',
    'delivery': 'text-teal-900',
    'meeting': 'text-purple-900',
    'training': 'text-pink-900',
    'marketing': 'text-yellow-900',
    'leave': 'text-red-900',
    'memo': 'text-gray-900',
    'recall': 'text-cyan-900',
    'absence': 'text-rose-900',
    'other': 'text-gray-900'
  }
  return colorMap[type] || 'text-blue-900'
}

/** Returns theme CSS class for calendar event chip background (e.g. calendar-event-test-drive). */
export const getEventTypeCssClass = (type) => {
  const typeMap = {
    'test-drive': 'calendar-event-test-drive',
    'appointment': 'calendar-event-appointment',
    'dealership-visit': 'calendar-event-appointment',
    'offsite': 'calendar-event-offsite',
    'workshop': 'calendar-event-workshop',
    'call': 'calendar-event-call',
    'delivery': 'calendar-event-delivery',
    'meeting': 'calendar-event-meeting',
    'meeting-at-customers': 'calendar-event-meeting',
    'training': 'calendar-event-training',
    'marketing': 'calendar-event-marketing',
    'leave': 'calendar-event-leave',
    'memo': 'calendar-event-memo',
    'recall': 'calendar-event-recall',
    'absence': 'calendar-event-absence',
    'internal-meeting': 'calendar-event-internal',
    'other': 'calendar-event-other',
  }
  return typeMap[type] || 'calendar-event-other'
}

export const formatEventDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export const formatEventTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Invalid Time'
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  })
}

