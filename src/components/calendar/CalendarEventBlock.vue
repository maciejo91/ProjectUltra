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
    class="absolute inset-x-0 left-1 right-1 rounded-md px-3 py-2 cursor-pointer overflow-hidden text-left"
    :class="event.cssClass || 'calendar-event-other'"
    @click="$emit('click', event.id)"
  >
    <p class="text-sm sm:text-sm font-semibold text-foreground truncate">
      {{ event.title }}
    </p>
    <p v-if="event.location" class="text-sm text-muted-foreground truncate">
      {{ event.location }}
    </p>
  </button>
</template>
