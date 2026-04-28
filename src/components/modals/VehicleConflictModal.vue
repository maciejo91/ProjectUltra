<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle class="text-foreground">Vehicle already in system</DialogTitle>
          <DialogDescription class="text-muted-foreground">
            The VIN or plate matches existing vehicles. Link to one or add as new.
          </DialogDescription>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-4">
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <button
              v-for="vehicle in matchedVehicles"
              :key="vehicle.id"
              type="button"
              @click="handleSelectVehicle(vehicle)"
              class="w-full flex items-center gap-3 p-3 rounded-md transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 border border-border"
              :class="selectedVehicleId === vehicle.id ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-muted/80'"
            >
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-foreground">
                  {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.year }})
                </p>
                <p class="text-sm text-muted-foreground mt-0.5">
                  VIN: {{ vehicle.vin }} · Plate: {{ vehicle.plateNumber || '—' }}
                </p>
                <p v-if="vehicle.soldTo" class="text-sm text-muted-foreground mt-0.5">
                  Owner: {{ vehicle.soldTo }}
                </p>
              </div>
              <Check v-if="selectedVehicleId === vehicle.id" class="w-4 h-4 shrink-0 text-primary" />
            </button>
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            @click="handleCreateNew"
          >
            Add as new vehicle
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!selectedVehicleId"
            @click="handleLinkExisting"
          >
            Link to selected vehicle
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Check } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'

const props = defineProps({
  show: { type: Boolean, required: true },
  matchedVehicles: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'link-existing', 'create-new'])

const selectedVehicleId = ref(null)

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      selectedVehicleId.value = props.matchedVehicles?.length ? props.matchedVehicles[0]?.id ?? null : null
    }
  },
  { immediate: true }
)

function handleOpenChange(isOpen) {
  if (!isOpen) emit('close')
}

function handleSelectVehicle(vehicle) {
  selectedVehicleId.value = vehicle.id
}

function handleLinkExisting() {
  const vehicle = props.matchedVehicles?.find(v => v.id === selectedVehicleId.value)
  if (vehicle) {
    emit('link-existing', vehicle)
    emit('close')
  }
}

function handleCreateNew() {
  emit('create-new')
  emit('close')
}
</script>
