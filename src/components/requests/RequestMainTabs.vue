<template>
  <Tabs :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <div class="relative w-full shrink-0">
      <TabsList
        class="request-main-tabs-list relative z-10 inline-flex w-fit max-w-full min-w-0 flex-nowrap items-end justify-start gap-1 overflow-x-auto border-0 bg-background p-0 shadow-none ring-0"
      >
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.key"
          :value="tab.key"
          class="request-main-tabs-trigger inline-flex w-auto max-w-none flex-none shrink-0 items-center gap-1.5 rounded-none bg-transparent px-1.5 py-1.5 text-sm outline-none transition-colors whitespace-nowrap"
          :class="
            modelValue === tab.key
              ? 'border-b-2 border-primary font-semibold text-foreground'
              : 'border-b-2 border-transparent font-medium text-muted-foreground hover:text-foreground'
          "
        >
          <span class="truncate">{{ tab.label }}</span>
          <span
            v-if="tab.count !== undefined && tab.count > 0"
            class="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-xs font-medium leading-none"
            :class="
              modelValue === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            "
          >
            {{ tab.count }}
          </span>
        </TabsTrigger>
      </TabsList>
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-px bg-border"
        aria-hidden="true"
      />
    </div>
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
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
:deep(.request-main-tabs-list[role='tablist']) {
  padding: 0 !important;
  margin: 0 !important;
  min-height: 0 !important;
  width: fit-content !important;
  max-width: 100% !important;
  gap: 0.25rem !important;
}

:deep(.request-main-tabs-trigger[role='tab']) {
  flex: 0 0 auto !important;
  width: auto !important;
  max-width: none !important;
  margin-bottom: -2px !important;
  box-shadow: none !important;
}

:deep(.request-main-tabs-trigger[role='tab']::before),
:deep(.request-main-tabs-trigger[role='tab']::after) {
  display: none !important;
  content: none !important;
  box-shadow: none !important;
}
</style>
