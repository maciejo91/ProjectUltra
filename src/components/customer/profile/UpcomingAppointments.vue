<template>
  <div class="border rounded-lg bg-white shadow-sm p-4">
    <div class="flex items-center justify-between mb-3">
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
    
    <div class="space-y-2 text-sm">
      <div class="flex items-center gap-2 text-muted-foreground">
        <MapPin class="w-4 h-4" />
        <span>{{ location || 'Unknown location' }}</span>
      </div>
      <div class="flex items-center gap-2 text-muted-foreground">
        <User class="w-4 h-4" />
        <span>{{ customerName || 'Unknown customer' }}</span>
      </div>
      <div v-if="vehicle" class="flex items-center gap-2 text-muted-foreground">
        <Car class="w-4 h-4" />
        <span>{{ vehicle }}</span>
      </div>
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
