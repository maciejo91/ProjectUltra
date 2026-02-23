<script setup>
import { computed } from 'vue'
import { Toggle } from '@motork/component-library/future/primitives'
import { getEventTypeCssClass } from '@/utils/calendarHelpers'

const props = defineProps({
  eventTypes: { type: Array, default: () => [] },
  activeTypeIds: { type: Array, required: true },
})

const emit = defineEmits(['update:activeTypeIds'])

const selectedTypesLabel = computed(() => {
  const total = props.eventTypes.length
  const active = props.activeTypeIds.length
  if (active === total) return 'All types'
  if (active === 0) return 'No types'
  if (active === 1) {
    const t = props.eventTypes.find((x) => x.value === props.activeTypeIds[0])
    return t?.label || '1 selected'
  }
  return `${active} selected`
})

const isActive = (id) => props.activeTypeIds.includes(id)

const toggle = (id) => {
  if (isActive(id)) {
    emit('update:activeTypeIds', props.activeTypeIds.filter((x) => x !== id))
  } else {
    emit('update:activeTypeIds', [...props.activeTypeIds, id])
  }
}

const toggleAll = () => {
  if (props.activeTypeIds.length === props.eventTypes.length) {
    emit('update:activeTypeIds', [])
  } else {
    emit('update:activeTypeIds', props.eventTypes.map((t) => t.value))
  }
}
</script>

<template>
  <div class="bg-background rounded-lg shadow-mk-dashboard-card p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium text-foreground">Event types</p>
      <button
        type="button"
        class="text-xs text-muted-foreground underline underline-offset-2 cursor-pointer hover:text-foreground"
        @click="toggleAll"
      >
        {{ selectedTypesLabel }}
      </button>
    </div>
    <div class="flex flex-col gap-2">
      <button
        v-for="t in eventTypes"
        :key="t.value"
        type="button"
        class="group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors hover:bg-muted"
        :class="{ 'bg-muted': isActive(t.value) }"
        @click="toggle(t.value)"
      >
        <div class="flex items-center gap-2">
          <span
            class="inline-flex h-4 w-4 shrink-0 rounded-sm border-2"
            :class="[
              getEventTypeCssClass(t.value),
              isActive(t.value) ? 'border-foreground/40' : 'border-border',
            ]"
          />
          <span class="text-sm text-foreground">{{ t.label }}</span>
        </div>
      </button>
    </div>
  </div>
</template>
