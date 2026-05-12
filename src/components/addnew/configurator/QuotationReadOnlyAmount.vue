<template>
  <div class="relative shrink-0" :class="widthClass">
    <div class="flex h-8 items-center rounded-lg bg-muted px-2.5 py-1 pl-7">
      <span
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
      >
        €
      </span>
      <p class="min-w-0 flex-1 truncate text-right text-sm text-muted-foreground">
        {{ formatted }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  amount: { type: Number, default: NaN },
  /** Tailwind width class for column alignment (e.g. w-32, w-40) */
  widthClass: { type: String, default: 'w-32' },
})

const formatted = computed(() => {
  const x = Number(props.amount)
  if (!Number.isFinite(x)) return '—'
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})
</script>
