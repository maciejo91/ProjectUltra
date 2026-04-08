<template>
  <div id="app" class="flex h-dvh min-h-0 flex-col overflow-hidden">
    <router-view class="min-h-0 flex-1 overflow-hidden" />
    <Toast :notifications="toastStore.notifications" :delay="toastStore.defaultDelayMs" />
  </div>
</template>

<script setup>
import { Toast } from '@motork/component-library'
import { useToastStore } from '@/stores/toast'
import { useTheme } from '@/composables/useTheme'

const toastStore = useToastStore()

// Initialize theme on app load
useTheme()
</script>
