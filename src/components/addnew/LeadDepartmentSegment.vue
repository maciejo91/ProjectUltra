<template>
  <SegmentedControl
    :model-value="modelValue"
    :options="[
      { value: 'sales', label: 'Sales' },
      { value: 'service', label: 'Service' },
    ]"
    :aria-label="ariaLabel"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <template #sales><slot name="sales" /></template>
    <template #service><slot name="service" /></template>
  </SegmentedControl>
</template>

<script setup>
import SegmentedControl from '@/components/shared/SegmentedControl.vue'

defineProps({
  modelValue: {
    type: String,
    required: true,
    validator: (v) => v === 'sales' || v === 'service',
  },
  ariaLabel: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])
</script>

