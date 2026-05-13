<template>
  <div class="flex min-h-full flex-col bg-muted">
    <div
      v-if="request"
      class="flex min-h-full flex-col bg-muted"
    >
      <slot />
    </div>

    <div v-else class="flex flex-1 items-center justify-center bg-muted p-8">
      <p class="text-muted-foreground">No request selected</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  request: {
    type: Object,
    default: null
  }
})
</script>
