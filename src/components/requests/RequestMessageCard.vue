<template>
  <div
    class="flex flex-col gap-3 overflow-hidden rounded-lg bg-background p-4"
  >
    <h3 class="min-w-0 text-base font-medium leading-6 text-foreground">
      {{ title }}
    </h3>
    <div
      class="w-full min-w-0 overflow-hidden rounded-lg bg-muted p-3"
    >
      <p
        class="text-sm font-normal leading-5 text-muted-foreground whitespace-pre-wrap"
      >
        {{ displayBody }}
      </p>
    </div>
    <CollapsibleSection
      :title="t('requestDetail.messageCard.moreDetails')"
      title-class="text-sm font-normal leading-5 text-foreground"
      :is-expanded="moreExpanded"
      class="w-full min-w-0"
      @toggle="moreExpanded = !moreExpanded"
    >
      <div class="flex w-full flex-col gap-3 border-t border-border pt-3">
        <template v-if="hasAttributionContent">
          <div
            v-if="utmSource"
            class="flex w-full items-center justify-between gap-3"
          >
            <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
              t('requestDetail.messageCard.utmSource')
            }}</span>
            <span
              class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
              >{{ utmSource }}</span
            >
          </div>
          <div
            v-if="utmTerm"
            class="flex w-full items-center justify-between gap-3"
          >
            <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
              t('requestDetail.messageCard.utmTerm')
            }}</span>
            <span
              class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
              >{{ utmTerm }}</span
            >
          </div>
          <div
            v-if="utmCampaign"
            class="flex w-full items-center justify-between gap-3"
          >
            <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
              t('requestDetail.messageCard.utmCampaign')
            }}</span>
            <span
              class="min-w-0 truncate text-right text-sm leading-5 text-foreground"
              >{{ utmCampaign }}</span
            >
          </div>
          <div
            v-if="advertisementUrl"
            class="flex w-full items-center justify-between gap-3"
          >
            <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
              t('requestDetail.messageCard.advertisement')
            }}</span>
            <a
              :href="advertisementUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary underline underline-offset-2 hover:opacity-90"
            >
              {{ t('requestDetail.messageCard.linkVisit') }}
              <ArrowUpRight class="size-3 shrink-0 opacity-70" aria-hidden />
            </a>
          </div>
          <div
            v-if="originalEmailUrl"
            class="flex w-full items-center justify-between gap-3"
          >
            <span class="shrink-0 text-sm leading-5 text-muted-foreground">{{
              t('requestDetail.messageCard.originalEmail')
            }}</span>
            <a
              :href="originalEmailUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary underline underline-offset-2 hover:opacity-90"
            >
              {{ t('requestDetail.messageCard.linkCheck') }}
              <ArrowUpRight class="size-3 shrink-0 opacity-70" aria-hidden />
            </a>
          </div>
        </template>
        <p
          v-else
          class="text-sm leading-5 text-muted-foreground"
        >
          {{ t('requestDetail.messageCard.noMoreDetails') }}
        </p>
      </div>
    </CollapsibleSection>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight } from 'lucide-vue-next'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  utmSource: {
    type: String,
    default: ''
  },
  utmTerm: {
    type: String,
    default: ''
  },
  utmCampaign: {
    type: String,
    default: ''
  },
  advertisementUrl: {
    type: String,
    default: ''
  },
  originalEmailUrl: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
const moreExpanded = ref(true)

const displayBody = computed(() => {
  const m = (props.message || '').trim()
  if (m) return m
  return t('requestDetail.messageCard.empty')
})

const hasAttributionContent = computed(
  () =>
    !!(props.utmSource ||
      props.utmTerm ||
      props.utmCampaign ||
      props.advertisementUrl ||
      props.originalEmailUrl)
)
</script>
