<script setup>
const props = defineProps({
  config: { type: Object, required: true },
  class: { type: String, default: '' }
})
</script>

<template>
  <div :class="['relative', props.class]">
    <slot />
  </div>
</template>
