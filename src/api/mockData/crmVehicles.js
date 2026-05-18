import fiatPandaHybridImage from '@/assets/images/mock-vehicles/fiat_panda_hybrid_new.jpeg'
import fiat500HybridImage from '@/assets/images/mock-vehicles/fiat_500hybrid_used.jpeg'
import toyotaYarisImage from '@/assets/images/mock-vehicles/toyota_yaris_new.jpeg'
import toyotaRav4Image from '@/assets/images/mock-vehicles/toyota_rav4_km0.jpeg'
import vwGolfImage from '@/assets/images/mock-vehicles/vw_golf_new.jpeg'
import vwTiguanImage from '@/assets/images/mock-vehicles/volkswagen-tiguan.png'
import jeepAvengerImage from '@/assets/images/mock-vehicles/jeep_avenger_new.jpeg'
import jeepCompassImage from '@/assets/images/mock-vehicles/jeep_compass_km0.jpeg'
import audiQ3Image from '@/assets/images/mock-vehicles/audi_q3_km0.jpeg'

const BMW_LOGO = '/brands/bmw-white.svg'

function parseSpecification(specification) {
  const parts = String(specification || '')
    .split(',')
    .map((s) => s.trim())
  return {
    fuelType: parts[0] || '',
    gearType: parts[1] || ''
  }
}

function normalizeStatus(csvCondition) {
  const c = String(csvCondition || '').toLowerCase()
  if (c === 'new') return 'New'
  if (c === 'km0' || c === 'km 0') return 'Km0'
  if (c === 'used') return 'Used'
  return csvCondition
}

function resolveImageAndStatus(row) {
  const rawStatus = normalizeStatus(row.condition)
  const isCsvNew = rawStatus === 'New'
  const isBmw = String(row.brand || '').toLowerCase() === 'bmw'

  if (isCsvNew && isBmw) {
    return {
      status: 'New',
      image: BMW_LOGO,
      imageDisplayMode: 'logo'
    }
  }

  if (isCsvNew) {
    return {
      status: 'Km0',
      image: row.image,
      imageDisplayMode: undefined
    }
  }

  return {
    status: rawStatus,
    image: row.image,
    imageDisplayMode: undefined
  }
}

const RAW_ROWS = [
  {
    id: '01',
    brand: 'Fiat',
    model: 'Panda Hybrid',
    condition: 'New',
    year: 2026,
    kilometers: 0,
    specification: 'Petrol/Mild Hybrid, Manual',
    plate: '-',
    price: 18900,
    image: fiatPandaHybridImage
  },
  {
    id: '03',
    brand: 'Fiat',
    model: '500 Hybrid',
    condition: 'Used',
    year: 2023,
    kilometers: 34000,
    specification: 'Petrol/Mild Hybrid, Manual',
    plate: 'GA 442 PL',
    price: 14800,
    image: fiat500HybridImage
  },
  {
    id: '05',
    brand: 'Toyota',
    model: 'Yaris',
    condition: 'New',
    year: 2026,
    kilometers: 0,
    specification: 'Hybrid, Automatic',
    plate: '-',
    price: 24100,
    image: toyotaYarisImage
  },
  {
    id: '07',
    brand: 'Toyota',
    model: 'RAV4',
    condition: 'Km0',
    year: 2025,
    kilometers: 80,
    specification: 'Plug-in Hybrid, Automatic',
    plate: 'HA 902 MG',
    price: 46000,
    image: toyotaRav4Image
  },
  {
    id: '08',
    brand: 'Volkswagen',
    model: 'Golf',
    condition: 'New',
    year: 2026,
    kilometers: 0,
    specification: 'Petrol/Mild Hybrid, DSG',
    plate: '-',
    price: 32500,
    image: vwGolfImage
  },
  {
    id: '10',
    brand: 'Volkswagen',
    model: 'Tiguan',
    condition: 'Used',
    year: 2025,
    kilometers: 27024,
    specification: 'Benzina, Automatico',
    plate: '-',
    price: 44650,
    image: vwTiguanImage
  },
  {
    id: '11',
    brand: 'Jeep',
    model: 'Avenger',
    condition: 'New',
    year: 2026,
    kilometers: 0,
    specification: 'Petrol, Manual',
    plate: '-',
    price: 24900,
    image: jeepAvengerImage
  },
  {
    id: '13',
    brand: 'Jeep',
    model: 'Compass',
    condition: 'Km0',
    year: 2025,
    kilometers: 110,
    specification: 'Plug-in Hybrid, Automatic',
    plate: 'HA 774 RN',
    price: 39500,
    image: jeepCompassImage
  },
  {
    id: '15',
    brand: 'Audi',
    model: 'Q3',
    condition: 'Km0',
    year: 2025,
    kilometers: 200,
    specification: 'Petrol, S-Tronic',
    plate: 'HB 556 AA',
    price: 42100,
    image: audiQ3Image
  },
  {
    id: '19',
    brand: 'BMW',
    model: 'X1',
    condition: 'New',
    year: 2026,
    kilometers: 0,
    specification: 'Hybrid, Automatic',
    plate: '-',
    price: 43800,
    image: BMW_LOGO
  }
]

export const CRM_VEHICLES = RAW_ROWS.map((row) => {
  const { fuelType, gearType } = parseSpecification(row.specification)
  const { status, image, imageDisplayMode } = resolveImageAndStatus(row)
  const plateNumber = row.plate === '-' ? '' : row.plate
  const isNew = status === 'New'
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    price: row.price,
    kilometers: isNew ? null : row.kilometers,
    mileage: isNew ? null : row.kilometers,
    status,
    fuelType,
    gearType,
    plateNumber,
    image,
    imageDisplayMode,
    specification: row.specification
  }
})

export const CRM_VEHICLE_BY_ID = Object.fromEntries(
  CRM_VEHICLES.map((v) => [v.id, v])
)

export function getCrmVehicleDisplayName(vehicle) {
  if (!vehicle) return ''
  return `${vehicle.brand} ${vehicle.model}`.trim()
}

export function crmVehicleForEntityId(entityId) {
  const padded = String(entityId).padStart(2, '0')
  if (CRM_VEHICLE_BY_ID[padded]) return CRM_VEHICLE_BY_ID[padded]
  return crmVehicleForLeadSlot(Number(entityId) - 1)
}

export function crmVehicleForLeadSlot(slotIndex) {
  const n = CRM_VEHICLES.length
  const idx = ((Number(slotIndex) % n) + n) % n
  return CRM_VEHICLES[idx]
}

export function carStatusFromVehicle(vehicle) {
  if (!vehicle) return 'In Stock'
  return vehicle.status === 'New' ? 'toBeOrder' : 'In Stock'
}

export function demoListingUrlForVehicle(vehicle) {
  const slug = `${(vehicle.brand || '').toLowerCase()}-${(vehicle.model || '').toLowerCase().replace(/\s+/g, '-')}-${vehicle.year}`
  return `https://www.example.com/inventory/${slug}`
}

export function toRequestedCar(vehicle, extra = {}) {
  const isNew = vehicle.status === 'New'
  const car = {
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    price: vehicle.price,
    plateNumber: vehicle.plateNumber || '',
    image: vehicle.image,
    vin: extra.vin || `DEMO${vehicle.id}${String(vehicle.year)}`,
    kilometers: vehicle.kilometers,
    mileage: vehicle.mileage,
    status: vehicle.status,
    fuelType: vehicle.fuelType,
    gearType: vehicle.gearType,
    dealership: extra.dealership || 'Milano',
    stockDays: extra.stockDays ?? (isNew ? null : 45),
    registration: extra.registration || (isNew ? '' : `01/${vehicle.year}`),
    listingUrl: extra.listingUrl || demoListingUrlForVehicle(vehicle),
    requestType: extra.requestType || 'Quotation',
    adCampaign: extra.adCampaign || 'Summer 2024',
    adMedium: extra.adMedium || 'Display',
    adSource: extra.adSource || 'Google',
    expectedPurchaseDate: extra.expectedPurchaseDate || '2025-04',
    staffNote: extra.staffNote || '',
    requestMessage: extra.requestMessage || '',
    variant: extra.variant || vehicle.specification || ''
  }
  if (vehicle.imageDisplayMode) {
    car.imageDisplayMode = vehicle.imageDisplayMode
  }
  return { ...car, ...extra, brand: vehicle.brand, model: vehicle.model, image: vehicle.image, status: vehicle.status }
}

export const CRM_VEHICLE_MENTION_NAMES = CRM_VEHICLES.map(getCrmVehicleDisplayName)
