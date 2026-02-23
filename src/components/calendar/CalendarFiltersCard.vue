<script setup>
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@motork/component-library/future/primitives'
import { Checkbox } from '@motork/component-library/future/primitives'

const props = defineProps({
  filters: { type: Object, required: true },
  dealerships: { type: Array, default: () => [] },
  teams: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:filters'])

const update = (key, value) => {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>

<template>
  <div class="bg-background rounded-lg shadow-mk-dashboard-card p-4 flex flex-col gap-3">
    <p class="text-sm font-medium text-foreground">Filters</p>
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium text-muted-foreground">Dealership</label>
        <Select :model-value="filters.dealership || '__all__'" @update:model-value="(v) => update('dealership', v === '__all__' ? '' : v)">
          <SelectTrigger class="h-9">
            <SelectValue placeholder="All dealerships" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All dealerships</SelectItem>
            <SelectItem v-for="d in dealerships" :key="d" :value="d">
              {{ d }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-medium text-muted-foreground">Team members</label>
        <Select :model-value="filters.team || '__all__'" @update:model-value="(v) => update('team', v === '__all__' ? '' : v)">
          <SelectTrigger class="h-9">
            <SelectValue placeholder="All team members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All team members</SelectItem>
            <SelectItem v-for="t in teams" :key="t" :value="t">
              {{ t }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="h-px bg-border" />
      <div class="flex flex-col gap-2">
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm text-foreground">Most relevant only</span>
          <Checkbox
            :model-value="filters.mostRelevant"
            @update:model-value="(v) => update('mostRelevant', v)"
          />
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm text-foreground">Include cancelled</span>
          <Checkbox
            :model-value="filters.includeCancelled"
            @update:model-value="(v) => update('includeCancelled', v)"
          />
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm text-foreground">No-shows only</span>
          <Checkbox
            :model-value="filters.noShowsOnly"
            @update:model-value="(v) => update('noShowsOnly', v)"
          />
        </label>
      </div>
    </div>
  </div>
</template>
