<template>
  <div class="w-full min-w-0 shrink-0 pt-1">
    <div
      class="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
        >
          <Check class="size-4 shrink-0 text-primary" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-foreground">
            {{ title }}
          </p>
          <p
            v-for="(line, idx) in lines"
            :key="idx"
            class="mt-1 text-sm text-muted-foreground"
          >
            {{ line }}
          </p>
          <p v-if="reason" class="mt-2 text-sm text-muted-foreground">
            {{ t('requestDetail.lqOutcome.reasonLabel', { reason }) }}
          </p>
          <div v-if="showReopen" class="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="small"
              class="inline-flex cursor-pointer items-center gap-2 rounded-sm"
              @click="$emit('reopen')"
            >
              <RotateCcw class="size-3.5 shrink-0" aria-hidden="true" />
              {{ t('requestDetail.lqOutcome.reopen') }}
            </Button>
          </div>
        </div>
      </div>
      <div
        v-if="actorName || performedAtLabel"
        class="flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground"
      >
        <span v-if="actorName">{{ t('requestDetail.lqOutcome.updatedBy', { name: actorName }) }}</span>
        <span v-if="performedAtLabel" class="tabular-nums">{{ performedAtLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RotateCcw, Check } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import { useI18n } from 'vue-i18n'

defineProps({
  title: { type: String, required: true },
  lines: { type: Array, default: () => [] },
  reason: { type: String, default: null },
  actorName: { type: String, default: '' },
  performedAtLabel: { type: String, default: '' },
  showReopen: { type: Boolean, default: false }
})

defineEmits(['reopen'])

const { t } = useI18n()
</script>
