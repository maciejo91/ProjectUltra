<template>
  <div class="page-container overflow-y-auto px-6 py-6 md:py-8">
    <h1 class="text-base font-medium text-foreground mb-2">{{ pageTitle }}</h1>
    <p class="text-muted-foreground">{{ t('common.pages.comingSoon') }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const pageTitle = computed(() => {
  const key = route.meta?.titleKey
  return key ? t(key) : ''
})
</script>
