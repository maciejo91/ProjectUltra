<template>
  <div
    v-if="potentialDuplicates.length > 0"
    class="relative overflow-hidden rounded-lg"
  >
    <div
      class="duplicate-banner-inner relative z-10 m-px flex items-center gap-4 rounded-lg bg-destructive/10 px-4 py-2"
    >
      <div class="flex flex-1 min-w-0 items-center gap-3">
        <div
          class="flex shrink-0 items-center justify-center rounded-md bg-destructive p-1.5 text-white"
          aria-hidden="true"
        >
          <TriangleAlert class="size-3.5" stroke-width="2" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm leading-5 text-foreground">
            <span class="font-semibold">{{ t('requestDetail.duplicates.important') }}</span>
            <span class="font-normal">
              {{ ' ' }}{{ bodyMessage }}
            </span>
          </p>
        </div>
      </div>
      <div class="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:pl-2">
        <Button
          variant="ghost"
          size="icon"
          class="size-7 shrink-0 text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground"
          :aria-label="t('requestDetail.duplicates.openDuplicateAria')"
          @click="emit('request-navigate', potentialDuplicates[0].compositeId)"
        >
          <ArrowUpRight class="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="size-7 shrink-0 text-muted-foreground hover:text-foreground"
          :aria-label="t('requestDetail.duplicates.dismissAria')"
          @click="emit('dismiss')"
        >
          <X class="size-4" />
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

<style scoped>
</style>
