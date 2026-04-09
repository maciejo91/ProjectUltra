<script setup>
defineProps({
  event: {
    type: Object,
    required: true,
  },
})
defineEmits(['click'])
</script>

<template>
  <button
    type="button"
    class="absolute inset-x-0 left-1 right-1 rounded-md px-2 py-1 cursor-pointer overflow-hidden text-left"
    :class="event.cssClass || 'calendar-event-other'"
    @click="$emit('click', event.id)"
  >
    <p class="text-xs font-semibold text-foreground truncate leading-tight">
      {{ event.title }}
    </p>
    <p v-if="event.location" class="text-xs text-muted-foreground truncate leading-tight">
      {{ event.location }}
    </p>
  </button>
</template>
