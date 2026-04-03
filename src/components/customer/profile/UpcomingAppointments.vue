<template>
  <div class="w-full overflow-hidden rounded-lg bg-muted p-3">
    <div class="mb-2 flex items-start justify-between gap-2">
      <div class="flex min-w-0 items-center gap-2">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-md bg-background">
          <Calendar class="size-4 text-muted-foreground" />
        </div>
        <div class="min-w-0">
          <h4 class="text-sm font-medium leading-5 text-foreground">{{ title }}</h4>
          <div class="text-sm leading-4 text-muted-foreground">{{ date }}</div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <span class="flex min-w-0 items-center gap-1.5">
        <MapPin class="size-3.5 shrink-0" />
        {{ location || '—' }}
      </span>
      <span class="flex min-w-0 items-center gap-1.5">
        <User class="size-3.5 shrink-0" />
        {{ customerName || '—' }}
      </span>
      <span v-if="vehicle" class="flex min-w-0 items-center gap-1.5">
        <Car class="size-3.5 shrink-0" />
        {{ vehicle }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { Calendar, MapPin, User, Car } from 'lucide-vue-next'

defineProps({
  title: String,
  date: String,
  location: String,
  customerName: String,
  vehicle: String
})
</script>
