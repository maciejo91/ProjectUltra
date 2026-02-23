<template>
  <div
    class="rounded-lg relative transition-all duration-300 border overflow-hidden"
    :class="[colorScheme.background, colorScheme.border]"
  >
    <slot name="header" />
    <div class="p-4">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h4 class="font-bold text-foreground text-sm">{{ cardTitle }}</h4>
        <p class="text-xs text-muted-foreground mt-0.5">{{ cardDescription }}</p>
      </div>
    </div>
    <div class="flex gap-3 flex-wrap">
      <button
        v-for="(item, index) in ctaActions"
        :key="item.key || index"
        type="button"
        :class="item.buttonClass || 'bg-primary hover:opacity-90 text-white'"
        class="font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors shadow-sm"
        @click="item.handler ? item.handler() : $emit('action-clicked', item)"
      >
        <component :is="getLucideIcon(item.icon)" class="w-4 h-4 shrink-0" />
        {{ item.label }}
      </button>
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getLucideIcon } from '@/utils/lucideIcons'

const props = defineProps({
  action: { type: Object, default: null },
  colorScheme: { type: Object, default: () => ({ background: 'bg-muted', border: 'border-border' }) },
  /** When set, merges multiple CTAs in one card (same priority). Each item: { key, label, icon, buttonClass?, handler } */
  actions: { type: Array, default: null }
})

defineEmits(['action-clicked'])

const ctaActions = computed(() => {
  if (props.actions && props.actions.length > 0) {
    return props.actions
  }
  if (props.action) {
    return [props.action]
  }
  return []
})

const cardTitle = computed(() => {
  if (props.actions && props.actions.length > 0 && props.actions[0].title) {
    return props.actions[0].title
  }
  return props.action?.title ?? 'Next steps'
})

const cardDescription = computed(() => {
  if (props.actions && props.actions.length > 0 && props.actions[0].description) {
    return props.actions[0].description
  }
  return props.action?.description ?? 'Choose an action to continue'
})
</script>



