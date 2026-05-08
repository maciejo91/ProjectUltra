<template>
  <Popover v-if="promos.length" :open="open" @update:open="open = $event">
    <PopoverTrigger as-child>
      <div
        :class="[
          'shrink-0 h-5 rounded-md bg-destructive text-destructive-foreground flex items-center gap-1.5 pr-2 shadow-mk-dashboard-card cursor-default',
          promos.length > 1 ? 'pl-1' : 'pl-2',
        ]"
        @mouseenter="handleEnter"
        @mouseleave="handleLeave"
        @focusin="handleEnter"
        @focusout="handleLeave"
      >
        <div
          v-if="promos.length > 1"
          class="h-3.5 min-w-3.5 rounded-sm bg-background text-destructive flex items-center justify-center px-1 text-xs leading-none"
        >
          {{ promos.length }}
        </div>
        <span class="text-xs font-semibold leading-none promo-label">PROMO</span>
      </div>
    </PopoverTrigger>
    <PopoverContent
      side="top"
      align="start"
      :side-offset="6"
      class="bg-background text-foreground border border-border rounded-md shadow-md p-4 w-auto min-w-[12rem]"
      @mouseenter="handleEnter"
      @mouseleave="handleLeave"
      @open-auto-focus.prevent
    >
      <div class="flex flex-col gap-2">
        <template v-for="(promo, idx) in promos" :key="promo.id">
          <div v-if="idx > 0" class="h-px w-full bg-border" aria-hidden="true" />
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-foreground">{{ promo.label }}</span>
            <span class="text-sm text-muted-foreground">
              {{ formatPromoDiscount(promo) }} discount
            </span>
          </div>
        </template>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@motork/component-library/future/primitives'
import { formatPromoDiscount } from '@/constants/vehicleConfiguratorCatalog'

defineProps({
  promos: { type: Array, default: () => [] },
})

const open = ref(false)
let leaveTimer = null

function handleEnter() {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  open.value = true
}

function handleLeave() {
  if (leaveTimer) clearTimeout(leaveTimer)
  leaveTimer = setTimeout(() => {
    open.value = false
    leaveTimer = null
  }, 100)
}

onBeforeUnmount(() => {
  if (leaveTimer) clearTimeout(leaveTimer)
})
</script>

<style scoped>
.promo-label {
  color: var(--color-white);
}
</style>
