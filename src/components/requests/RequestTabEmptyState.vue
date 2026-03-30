<template>
  <div
    class="flex min-h-48 flex-col items-center justify-center rounded-lg border border-border bg-background px-6 py-12 text-center md:py-16"
  >
    <div
      class="mb-4 flex size-12 shrink-0 items-center justify-center rounded-full bg-muted"
      aria-hidden="true"
    >
      <component :is="icon" class="size-6 text-muted-foreground" />
    </div>
    <h3 class="mb-1 text-base font-semibold text-foreground">
      {{ title }}
    </h3>
    <p class="mb-6 max-w-md text-sm text-muted-foreground">
      {{ description }}
    </p>
    <Button
      v-if="actionLabel"
      variant="default"
      class="rounded-sm w-full sm:w-auto"
      type="button"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </Button>
  </div>
</template>

<script setup>
import { Button } from '@motork/component-library/future/primitives'

defineProps({
  icon: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  actionLabel: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>
