<template>
  <div class="overflow-hidden rounded-lg bg-white shadow-nsc-card p-4 flex flex-col gap-4 w-full">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-base font-medium text-foreground leading-6">Financing options</h3>
      <Button
        variant="secondary"
        size="sm"
        class="gap-1.5 shrink-0"
        @click="$emit('open-add')"
      >
        <Plus class="size-3.5" />
        Add
      </Button>
    </div>
    <ul v-if="items.length" class="space-y-1.5">
      <li
        v-for="f in items"
        :key="f.id"
        class="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg border border-border bg-muted/50 text-sm cursor-pointer hover:bg-muted transition-colors"
        @click="$emit('open-edit', f)"
      >
        <span class="font-medium text-foreground">{{ f.label }}</span>
        <span v-if="f.termMonths" class="text-muted-foreground shrink-0 text-sm">{{ f.termMonths }} months</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { Plus } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'

defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

defineEmits(['open-add', 'open-edit'])
</script>
