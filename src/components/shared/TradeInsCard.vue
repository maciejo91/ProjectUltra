<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-nsc-card p-4 flex flex-col gap-4 w-full">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-base font-medium text-foreground leading-6">
        {{ t('requestDetail.purchaseDetails.tradeIns') }}
      </h3>
      <Button
        variant="secondary"
        size="sm"
        class="gap-1.5 shrink-0 inline-flex items-center"
        :disabled="addLoading"
        @click="$emit('open-add')"
      >
        <Spinner v-if="addLoading" class="size-3.5 shrink-0" aria-hidden />
        <Plus v-else class="size-3.5" />
        {{ t('requestDetail.purchaseDetails.add') }}
      </Button>
    </div>
    <ul v-if="items.length" class="space-y-1.5">
      <li
        v-for="t in items"
        :key="t.id"
        class="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg border border-border bg-muted/50 text-sm cursor-pointer hover:bg-muted transition-colors"
        @click="$emit('open-edit', t)"
      >
        <span class="font-medium text-foreground">{{ t.label }}</span>
        <span v-if="t.valuation != null" class="text-muted-foreground shrink-0 text-sm">€ {{ formatCurrency(t.valuation) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { Plus } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button, Spinner } from '@motork/component-library/future/primitives'

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  /** When true, the Add button shows a loading spinner and is disabled (e.g. while saving a trade-in). */
  addLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['open-add', 'open-edit'])

const { t } = useI18n()

function formatCurrency(val) {
  if (val == null) return '0'
  const n = typeof val === 'string' ? parseFloat(val) : val
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
</script>
