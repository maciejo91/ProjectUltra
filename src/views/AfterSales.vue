<template>
  <div class="page-container relative flex flex-col overflow-hidden h-full bg-surface">
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-y-auto px-6 pb-4 md:pb-8 scrollbar-hide min-h-0">
        <div class="bg-card border border-border rounded-lg p-6 shadow-mk-dashboard-card">
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
