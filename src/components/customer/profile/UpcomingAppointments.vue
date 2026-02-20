<template>
  <div class="border rounded-lg bg-white shadow-sm p-3">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <Calendar class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-sm font-semibold">{{ title }}</h4>
          <div class="text-xs text-muted-foreground">{{ date }}</div>
        </div>
      </div>
      <Button variant="outline" size="sm">Details</Button>
    </div>
    
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      <span class="flex items-center gap-1.5 shrink-0">
        <MapPin class="size-3.5 shrink-0" />
        {{ location || 'Unknown location' }}
      </span>
      <span class="flex items-center gap-1.5 shrink-0">
        <User class="size-3.5 shrink-0" />
        {{ customerName || 'Unknown customer' }}
      </span>
      <span v-if="vehicle" class="flex items-center gap-1.5 shrink-0">
        <Car class="size-3.5 shrink-0" />
        {{ vehicle }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { Calendar, MapPin, User, Car } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'

defineProps({
  title: String,
  date: String,
  location: String,
  customerName: String,
  vehicle: String
})
</script>
