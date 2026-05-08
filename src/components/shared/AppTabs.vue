<template>
  <Tabs :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <div class="relative w-full shrink-0 box-content overflow-hidden">
      <TabsList
        class="app-tabs-list relative z-10 inline-flex w-fit max-w-full min-w-0 flex-nowrap items-end justify-start gap-1 overflow-x-auto rounded-none border-0 bg-transparent p-0 shadow-none ring-0"
        :class="tabsListSpacingClass"
      >
        <TabsTrigger
          v-for="tab in tabs"
          :key="tab.key"
          :value="tab.key"
          class="app-tabs-trigger inline-flex w-auto max-w-none flex-none shrink-0 items-center gap-1.5 rounded-none bg-transparent data-active:bg-transparent px-1.5 py-1.5 text-sm outline-none transition-colors whitespace-nowrap"
          :class="
            modelValue === tab.key
              ? 'border-b-2 border-primary font-semibold text-foreground'
              : 'border-b-2 border-transparent font-medium text-muted-foreground hover:text-foreground'
          "
        >
          <span class="truncate">{{ tab.label }}</span>
          <span
            v-if="tab.count !== undefined && tab.count > 0"
            class="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-sm font-medium leading-none"
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
        v-if="divider !== 'none'"
        class="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-px bg-border"
        aria-hidden="true"
      />
    </div>
  </Tabs>
</template>

<script setup>
import { computed } from 'vue'
import { Tabs, TabsList, TabsTrigger } from '@motork/component-library/future/primitives'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  tabs: {
    type: Array,
    required: true
  },
  divider: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'touching', 'none'].includes(String(v))
  }
})

defineEmits(['update:modelValue'])

const tabsListSpacingClass = computed(() => {
  if (props.divider === 'touching') return ''
  return '!mb-2'
})
</script>

<style scoped>
:deep(.app-tabs-list[role='tablist']) {
  padding: 0 !important;
  margin: 0;
  min-height: 0 !important;
  width: fit-content !important;
  max-width: 100% !important;
  gap: 0.25rem !important;
}

:deep(.app-tabs-trigger[role='tab']) {
  flex: 0 0 auto !important;
  width: auto !important;
  max-width: none !important;
  margin-bottom: -2px !important;
  box-shadow: none !important;
}

:deep(.app-tabs-trigger[role='tab']::before),
:deep(.app-tabs-trigger[role='tab']::after) {
  display: none !important;
  content: none !important;
  box-shadow: none !important;
}
</style>
