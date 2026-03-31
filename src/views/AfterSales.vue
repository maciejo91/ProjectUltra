<template>
  <div class="page-container relative flex flex-col overflow-hidden h-full bg-surface">
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide min-h-0">
        <div class="bg-card border border-border rounded-lg p-6 shadow-mk-dashboard-card">
          <h2 class="text-title mb-2">{{ t('common.navigation.afterSales') }}</h2>
          <p class="text-meta text-muted-foreground">{{ t('common.pages.comingSoon') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
