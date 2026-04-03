<template>
  <Tabs :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <TabsList class="flex shrink-0 border-b border-border bg-white rounded-none w-full relative h-full">
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.key"
        :value="tab.key"
        class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
        :class="modelValue === tab.key 
          ? 'text-foreground' 
          : 'text-muted-foreground hover:text-muted-foreground'"
      >
        <span>{{ tab.label }}</span>
        <span 
          v-if="!hideCounts && tab.count !== undefined && tab.count > 0"
          class="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-sm font-bold leading-none"
          :class="modelValue === tab.key 
            ? 'bg-primary text-white' 
            : 'bg-gray-200 text-foreground'"
        >
          {{ tab.count }}
        </span>
        <span 
          v-if="modelValue === tab.key"
          class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
        ></span>
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>

<script setup>
import { Tabs, TabsList, TabsTrigger } from '@motork/component-library/future/primitives'

defineProps({
  modelValue: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    required: true
  },
  hideCounts: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
/* Tab styling to match TaskDetailView */
:deep([role="tablist"]) {
  border: none !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
  height: auto !important;
  min-height: 48px !important;
}

:deep([role="tab"]) {
  background: transparent !important;
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  margin: 0 !important;
  padding: 8px 16px 12px 16px !important;
  position: relative !important;
  box-shadow: none !important;
  height: 100% !important;
  min-height: 48px !important;
}

:deep([role="tab"]:not(:last-child)) {
  border-right: none !important;
}

:deep([role="tab"]::before),
:deep([role="tab"]::after) {
  display: none !important;
  box-shadow: none !important;
}

:deep([role="tab"] *) {
  box-shadow: none !important;
}

:deep([role="tab"][data-state="active"]) {
  color: var(--color-text-foreground) !important;
  box-shadow: none !important;
}

:deep([role="tab"][data-state="inactive"]) {
  color: var(--color-text-muted-foreground) !important;
  box-shadow: none !important;
}
</style>
