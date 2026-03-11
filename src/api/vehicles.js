import { mockVehicles } from './mockData'

// Simulate API delay (0 in dev for instant feedback; 50ms in prod)
const delayMs = import.meta.env.DEV ? 0 : 50
const delay = (ms = delayMs) => ms <= 0 ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, ms))

export const fetchVehicles = async (filters = {}) => {
  await delay()
  
  let results = [...mockVehicles]
  
  if (filters.status) {
    results = results.filter(vehicle => vehicle.status === filters.status)
  }
  if (filters.brand) {
    results = results.filter(vehicle => vehicle.brand === filters.brand)
  }
  if (filters.search) {
    const search = filters.search.toLowerCase()
    results = results.filter(vehicle => {
      const matchBrand = vehicle.brand?.toLowerCase().includes(search)
      const matchModel = vehicle.model?.toLowerCase().includes(search)
      const matchVin = vehicle.vin?.toLowerCase().includes(search)
      const matchPlate = vehicle.plateNumber?.toLowerCase().includes(search)
      return matchBrand || matchModel || matchVin || matchPlate
    })
  }

  return { data: results, total: results.length }
}

const PLACEHOLDER_VALUES = ['unknown', 'n/a', '']

function isPlaceholderValue(val) {
  if (!val || typeof val !== 'string') return true
  const normalized = val.trim().toLowerCase()
  return PLACEHOLDER_VALUES.some(p => p === normalized) || normalized === ''
}

/**
 * Search vehicles by VIN and/or plate number.
 * Ignores placeholder values (unknown, n/a, empty).
 * @param {Object} params
 * @param {string} [params.vin] - VIN to search
 * @param {string} [params.plate] - Plate number to search
 * @returns {Promise<{ data: Array }>} Matched vehicles with ownership info (soldTo, etc.)
 */
export const searchVehiclesByVinOrPlate = async ({ vin, plate } = {}) => {
  await delay()

  const hasVin = vin && !isPlaceholderValue(vin)
  const hasPlate = plate && !isPlaceholderValue(plate)
  if (!hasVin && !hasPlate) return { data: [] }

  let results = [...mockVehicles]

  if (hasVin && hasPlate) {
    results = results.filter(
      v =>
        (v.vin && v.vin.toLowerCase() === vin.trim().toLowerCase()) ||
        (v.plateNumber && v.plateNumber.toLowerCase() === plate.trim().toLowerCase())
    )
  } else if (hasVin) {
    results = results.filter(v => v.vin && v.vin.toLowerCase() === vin.trim().toLowerCase())
  } else {
    results = results.filter(
      v => v.plateNumber && v.plateNumber.toLowerCase() === plate.trim().toLowerCase()
    )
  }

  return { data: results, total: results.length }
}

export const fetchVehicleById = async (id) => {
  await delay()
  const vehicle = mockVehicles.find(v => v.id === parseInt(id))
  if (!vehicle) throw new Error('Vehicle not found')
  return vehicle
}

export const createVehicle = async (vehicleData) => {
  await delay()
  const newVehicle = {
    id: mockVehicles.length + 1,
    ...vehicleData,
    stockDays: 0
  }
  mockVehicles.push(newVehicle)
  return newVehicle
}

export const updateVehicle = async (id, updates) => {
  await delay()
  const index = mockVehicles.findIndex(v => v.id === parseInt(id))
  if (index === -1) throw new Error('Vehicle not found')
  
  mockVehicles[index] = { ...mockVehicles[index], ...updates }
  return mockVehicles[index]
}

export const deleteVehicle = async (id) => {
  await delay()
  const index = mockVehicles.findIndex(v => v.id === parseInt(id))
  if (index === -1) throw new Error('Vehicle not found')
  
  mockVehicles.splice(index, 1)
  return { success: true }
}