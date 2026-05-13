<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, ArrowUp } from 'lucide-vue-next'
import { Badge } from '@motork/component-library/future/primitives'

const { t } = useI18n()

const props = defineProps({
  title: { type: String, required: true },
  value: { type: Number, required: true },
  change: { type: Number, required: true },
  changeType: { type: String, required: true },
  breakdown: { type: Array, default: () => [] }
})

const hasBreakdown = computed(() => props.breakdown.length > 0)
</script>

<template>
  <div class="h-full rounded-lg bg-white p-4 shadow-mk-dashboard-card">
    <div class="flex h-full flex-col gap-2">
      <h4 class="text-sm font-medium leading-5 text-greys-500">{{ title }}</h4>

      <div class="flex flex-1 items-stretch justify-between gap-4">
        <div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <div class="flex items-baseline gap-2 whitespace-nowrap">
            <h2 class="text-xl font-semibold leading-none text-greys-900">{{ value }}</h2>
            <Badge :variant="changeType === 'increase' ? 'success' : 'error'" size="sm" class="inline-flex shrink-0 items-center gap-1">
              <ArrowUp v-if="changeType === 'increase'" :size="12" />
              <ArrowDown v-else :size="12" />
              <span>{{ changeType === 'increase' ? '+' : '-' }}{{ change }}%</span>
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground">{{ t('home.nscDashboard.vsLastMonth') }}</p>
        </div>

        <div v-if="hasBreakdown" class="flex w-28 shrink-0 flex-col justify-center border-l border-black/5 pl-3">
          <div v-for="item in breakdown" :key="item.label" class="flex items-center justify-between gap-2 py-1">
            <span class="text-xs leading-none text-muted-foreground">{{ item.label }}</span>
            <span class="text-sm leading-none text-muted-foreground">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
