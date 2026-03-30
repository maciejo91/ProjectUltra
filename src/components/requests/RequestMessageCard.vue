<template>
  <div
    class="flex flex-col gap-3 overflow-hidden rounded-lg bg-background p-4 shadow-nsc-card"
  >
    <div class="flex w-full min-w-0 items-center gap-2">
      <h3 class="min-w-0 flex-1 text-base font-medium leading-6 text-foreground">
        {{ title }}
      </h3>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        class="size-7 shrink-0 rounded-md"
        :aria-expanded="expanded"
        :aria-label="expanded ? collapseLabel : expandLabel"
        @click="expanded = !expanded"
      >
        <ChevronUp v-if="expanded" class="size-4 shrink-0 text-muted-foreground" />
        <ChevronDown v-else class="size-4 shrink-0 text-muted-foreground" />
      </Button>
    </div>
    <div
      v-show="expanded"
      class="w-full min-w-0 overflow-hidden rounded-lg bg-muted p-2"
    >
      <p
        class="text-sm font-normal leading-5 text-muted-foreground whitespace-pre-wrap"
      >
        {{ displayBody }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
const expanded = ref(true)

const displayBody = computed(() => {
  const m = (props.message || '').trim()
  if (m) return m
  return t('requestDetail.messageCard.empty')
})

const expandLabel = computed(() => t('requestDetail.messageCard.expandAria'))
const collapseLabel = computed(() => t('requestDetail.messageCard.collapseAria'))
</script>
