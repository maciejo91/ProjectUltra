/**
 * useVehicleMatch – search vehicles by VIN and/or plate for conflict detection.
 * Used by Delivery Date widget to detect when entered VIN/plate matches existing vehicles.
 * Placeholder values (unknown, n/a, empty) are ignored.
 */
import { ref } from 'vue'
import { searchVehiclesByVinOrPlate } from '@/api/vehicles'

/**
 * @param {Object} options
 * @param {import('vue').Ref<string>} [options.vin]
 * @param {import('vue').Ref<string>} [options.plate]
 * @returns {{ matches: import('vue').Ref<Array>, search: () => Promise<Array>, loading: import('vue').Ref<boolean> }}
 */
export function useVehicleMatch({ vin, plate } = {}) {
  const matches = ref([])
  const loading = ref(false)

  async function search(vinVal, plateVal) {
    const v = vinVal ?? vin?.value ?? ''
    const p = plateVal ?? plate?.value ?? ''
    loading.value = true
    matches.value = []
    try {
      const { data } = await searchVehiclesByVinOrPlate({ vin: v, plate: p })
      matches.value = data || []
      return matches.value
    } finally {
      loading.value = false
    }
  }

  return { matches, search, loading }
}
