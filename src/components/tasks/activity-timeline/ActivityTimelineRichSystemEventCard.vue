<template>
  <div class="flex w-full min-w-0 flex-col gap-2">
    <p v-if="summary" class="text-sm leading-relaxed text-muted-foreground wrap-break-word">
      {{ summary }}
    </p>

    <p
      v-if="!expanded && previewSectionTitle"
      class="text-sm font-medium leading-snug text-foreground wrap-break-word"
    >
      {{ previewSectionTitle }}
    </p>

    <template v-if="expanded && sections.length > 0">
      <div
        v-for="(section, sectionIndex) in sections"
        :key="`${section.title}-${sectionIndex}`"
        class="flex flex-col gap-2"
        :class="{ 'border-t border-border/60 pt-2': sectionIndex > 0 }"
      >
        <p
          v-if="section.title"
          class="text-sm font-medium leading-snug text-foreground wrap-break-word"
        >
          {{ section.title }}
        </p>
        <dl v-if="section.fields?.length" class="flex flex-col gap-1.5">
          <div
            v-for="field in section.fields"
            :key="`${field.label}-${field.value}`"
            class="grid min-w-0 grid-cols-1 gap-0.5 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)] sm:gap-x-4"
          >
            <dt class="text-sm font-medium leading-snug text-foreground">
              {{ field.label }}
            </dt>
            <dd class="text-sm leading-snug text-muted-foreground wrap-break-word">
              {{ field.value }}
            </dd>
          </div>
        </dl>
      </div>
    </template>

    <div v-if="canToggle" class="flex flex-wrap gap-2 mt-2">
      <Button
        variant="link"
        size="sm"
        class="h-auto gap-2 px-0 py-0 font-medium text-primary"
        @click.stop="expanded = !expanded"
      >
        <span>
          {{ expanded ? t('entities.activity.timeline.seeLess') : t('entities.activity.timeline.seeMore') }}
        </span>
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@motork/component-library/future/primitives'
import { translateText } from '@/api/mockData/locales/translations.js'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const { t, locale } = useI18n()

const expanded = ref(false)

const eventData = computed(() => props.activity?.data || {})

function localize(text) {
  if (!text || typeof text !== 'string') return text ?? ''
  return translateText(text, locale.value)
}

const summary = computed(() =>
  localize(eventData.value.summary || props.activity?.content || '')
)

const sections = computed(() => {
  const raw = eventData.value.sections
  if (!Array.isArray(raw)) return []
  return raw.map((section) => ({
    title: section?.title ? localize(section.title) : '',
    fields: (section?.fields || []).map((field) => ({
      label: localize(field?.label || ''),
      value: localize(field?.value || '')
    }))
  }))
})

const previewSectionTitle = computed(() => {
  const titled = eventData.value.sectionsTitle || sections.value[0]?.title || ''
  return titled ? localize(titled) : ''
})

const canToggle = computed(
  () => sections.value.length > 0 || (summary.value && summary.value.length > 120)
)
</script>
