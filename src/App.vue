<template>
  <MkApp :locale="motorkLocale">
    <div id="app" class="flex h-dvh min-h-0 flex-col overflow-hidden">
      <router-view class="min-h-0 flex-1 overflow-hidden" />
      <Toast :notifications="toastStore.notifications" :delay="toastStore.defaultDelayMs" />
    </div>
  </MkApp>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Toast } from '@motork/component-library'
import { MkApp } from '@motork/component-library/future/components'
import { en as motorkEn, it as motorkIt } from '@motork/component-library/future/locale'
import { useToastStore } from '@/stores/toast'
import { useTheme } from '@/composables/useTheme'

const toastStore = useToastStore()
const { locale } = useI18n()
const motorkLocale = computed(() => (locale.value === 'it' ? motorkIt : motorkEn))

// Initialize theme on app load
useTheme()
</script>
