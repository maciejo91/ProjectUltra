<template>
  <div class="page-container flex h-full flex-col overflow-hidden bg-surface">
    <div class="shrink-0 border-b border-border bg-background px-6 py-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" class="rounded-md" @click="goBackToList">
            <ArrowLeft class="size-4 mr-2 shrink-0" aria-hidden="true" />
            {{ t('forms.addNew.leadDetails.vehicle.stockBackToVehicles') }}
          </Button>
        </div>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto px-6 py-8">
      <div v-if="loading" class="flex flex-1 items-center justify-center py-16">
        <p class="text-sm text-muted-foreground">{{ t('messages.info.loading') }}</p>
      </div>
      <div v-else-if="loadError || !vehicle" class="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
        <p class="text-sm text-muted-foreground">{{ t('forms.addNew.leadDetails.vehicle.vehicleDetailNotFound') }}</p>
        <Button type="button" variant="outline" size="sm" class="rounded-md mt-2" @click="goBackToList">
          {{ t('forms.addNew.leadDetails.vehicle.stockBackToVehicles') }}
        </Button>
      </div>
      <div v-else class="mx-auto max-w-4xl space-y-6">
        <div class="flex flex-col gap-4 md:flex-row md:items-start">
          <div class="aspect-video w-full overflow-hidden rounded-lg bg-muted md:max-w-md md:shrink-0 md:basis-[min(42%,24rem)]">
            <img
              v-if="vehicle.image"
              :src="vehicle.image"
              alt=""
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="min-w-0 flex-1 space-y-2">
            <h1 class="text-xl font-semibold text-foreground">
              {{ vehicle.brand }} {{ vehicle.model }}
            </h1>
            <p class="text-sm text-muted-foreground">{{ vehicle.year }}</p>
            <div v-if="vehicle.vin || vehicle.plateNumber" class="flex flex-wrap gap-2 pt-2 text-sm">
              <span
                v-if="vehicle.plateNumber"
                class="inline-flex rounded-sm border border-border bg-background px-2 py-0.5 text-muted-foreground"
              >
                {{ vehicle.plateNumber }}
              </span>
              <span
                v-if="vehicle.vin"
                class="inline-flex max-w-full min-w-0 rounded-sm border border-border bg-background px-2 py-0.5 font-mono text-muted-foreground"
              >
                <span class="truncate">{{ vehicle.vin }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { fetchVehicleById } from '@/api/vehicles'

const props = defineProps({
  id: { type: String, required: true },
})

const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const loadError = ref(false)
const vehicle = ref(null)

function goBackToList() {
  router.push({ name: 'vehicles' })
}

onMounted(async () => {
  loading.value = true
  loadError.value = false
  vehicle.value = null
  try {
    vehicle.value = await fetchVehicleById(props.id)
  } catch {
    loadError.value = true
    vehicle.value = null
  } finally {
    loading.value = false
  }
})
</script>
