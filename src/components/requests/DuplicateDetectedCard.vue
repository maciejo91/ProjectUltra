<template>
  <div
    v-if="potentialDuplicates.length > 0"
    class="relative w-full overflow-hidden rounded-lg border border-yellow-500 bg-linear-to-r from-yellow-500/20 to-background dark:from-yellow-500/15"
  >
    <div
      class="relative z-10 flex w-full items-center gap-1.5 px-1.5 py-0.5"
    >
      <div class="flex min-w-0 flex-1 items-center gap-1.5">
        <div
          class="flex shrink-0 items-center justify-center rounded-md bg-yellow-500 p-1 text-white"
          aria-hidden="true"
        >
          <TriangleAlert class="size-3" stroke-width="2" />
        </div>
        <p class="m-0 min-w-0 flex-1 text-sm leading-5 text-foreground">
          <span class="font-semibold">{{ t('requestDetail.duplicates.conflictsLabel') }}</span>
          <span class="font-normal">{{ ' ' }}{{ bodyMessage }}</span>
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-0">
        <Button
          variant="ghost"
          size="icon"
          class="size-6 shrink-0 text-foreground hover:bg-muted hover:text-foreground"
          :aria-label="t('requestDetail.duplicates.openDuplicateAria')"
          @click="emit('request-navigate', potentialDuplicates[0].compositeId)"
        >
          <ArrowUpRight class="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="size-6 shrink-0 text-foreground hover:bg-muted hover:text-foreground"
          :aria-label="t('requestDetail.duplicates.dismissAria')"
          @click="emit('dismiss')"
        >
          <X class="size-3.5" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@motork/component-library/future/primitives'
import { ArrowUpRight, TriangleAlert, X } from 'lucide-vue-next'

const props = defineProps({
  potentialDuplicates: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['request-navigate', 'dismiss'])

const { t } = useI18n()

const bodyMessage = computed(() => {
  const n = props.potentialDuplicates.length
  if (n === 1) return t('requestDetail.duplicates.bodyOne')
  return t('requestDetail.duplicates.bodyOther', { count: n })
})
</script>
