export const VEHICLE_BRANDS = [
  'Alfa Romeo',
  'Audi',
  'BMW',
  'Citroën',
  'Cupra',
  'Dacia',
  'DS',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Jaguar',
  'Jeep',
  'Kia',
  'Land Rover',
  'Lexus',
  'Mazda',
  'Mercedes-Benz',
  'MG',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot',
  'Porsche',
  'Renault',
  'Seat',
  'Skoda',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo'
]

export const VEHICLE_MODELS_BY_BRAND = {
  'Volkswagen': ['ID.4', 'ID.3', 'ID.5', 'Golf', 'Polo', 'T-Roc', 'Tiguan', 'Passat', 'Touran', 'Touareg', 'Arteon', 'Caddy', 'Transporter'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A8', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'e-tron', 'e-tron GT', 'TT', 'RS e-tron GT'],
  'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', 'i3', 'i4', 'i5', 'i7', 'iX1', 'iX2', 'iX3', 'iX', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7'],
  'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
  'Peugeot': ['208', '308', '408', '508', '2008', '3008', '5008', 'e-208', 'e-2008', 'e-308', 'e-3008'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Arkana', 'Austral', 'Scenic', 'Espace', 'Zoe', 'Megane E-Tech', 'Scenic E-Tech'],
  'Ford': ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Mustang', 'Mustang Mach-E', 'Explorer', 'Transit'],
  'Toyota': ['Yaris', 'Corolla', 'Camry', 'C-HR', 'RAV4', 'bZ4X', 'Land Cruiser', 'Hilux', 'Proace'],
  'Hyundai': ['i20', 'i30', 'Tucson', 'Santa Fe', 'Kona', 'Kona Electric', 'Ioniq 5', 'Ioniq 6', 'Bayon'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Niro', 'Niro EV', 'Sportage', 'Sorento', 'EV6', 'EV9', 'Stonic', 'Xceed'],
  'Skoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq', 'Enyaq Coupe'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco', 'Born'],
  'Cupra': ['Leon', 'Formentor', 'Born', 'Tavascan', 'Terra'],
  'Volvo': ['XC40', 'XC60', 'XC90', 'V60', 'V90', 'S60', 'S90', 'C40', 'EX30', 'EX90'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Ariya', 'Leaf', 'Navara'],
  'Opel': ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'Combo', 'Vivaro', 'Zafira'],
  'Citroën': ['C3', 'C4', 'C5 X', 'C3 Aircross', 'C5 Aircross', 'Berlingo', 'ë-C4', 'ë-C4 X'],
  'Dacia': ['Sandero', 'Duster', 'Jogger', 'Spring', 'Logan'],
  'Fiat': ['500', '500e', 'Panda', 'Tipo', '500X', 'Ducato'],
  'Porsche': ['911', '718', 'Taycan', 'Panamera', 'Macan', 'Cayenne', 'Cayenne Coupe'],
  'Jeep': ['Renegade', 'Compass', 'Avenger', 'Wagoneer', 'Grand Cherokee'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque'],
  'Lexus': ['UX', 'NX', 'RX', 'RZ', 'ES', 'LS', 'LBX'],
  'Honda': ['Jazz', 'Civic', 'HR-V', 'ZR-V', 'CR-V', 'e'],
  'Mazda': ['Mazda2', 'Mazda3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'MX-30'],
  'Mini': ['Hatch', 'Clubman', 'Countryman', 'Electric', 'Aceman'],
  'Alfa Romeo': ['MiTo', 'Giulietta', 'Giulia', 'Stelvio', 'Tonale'],
  'DS': ['DS 3', 'DS 4', 'DS 7', 'DS 9'],
  'MG': ['MG4', 'MG5', 'ZS', 'HS', 'Marvel R']
}

export function getModelsForBrand(brand) {
  if (!brand || typeof brand !== 'string') return []
  const key = VEHICLE_BRANDS.find(b => b.toLowerCase() === brand.trim().toLowerCase())
  return key ? (VEHICLE_MODELS_BY_BRAND[key] || []) : []
}

export function getAllModels() {
  return [...new Set(Object.values(VEHICLE_MODELS_BY_BRAND).flat())].sort()
}
