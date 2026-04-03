<template>
  <div class="bg-muted rounded-xl p-1 flex flex-col shrink-0">
    <div class="bg-white rounded-lg p-4 shadow-nsc-card flex flex-col">
    <!-- Loading Skeleton -->
    <template v-if="loading">
      <div class="flex items-center justify-between mb-4">
        <div class="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div class="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div class="space-y-4">
        <div class="flex items-end gap-1 h-64 overflow-x-auto pb-2">
          <div v-for="n in 30" :key="`bar-${n}`" class="flex flex-col items-center gap-1 min-w-5">
            <div class="w-full flex items-end justify-center h-full gap-0.5">
              <div class="bg-gray-200 rounded-t w-2 h-full animate-pulse"></div>
              <div class="bg-gray-200 rounded-t w-2 h-3/4 animate-pulse"></div>
            </div>
            <div class="h-3 bg-gray-200 rounded w-2 animate-pulse"></div>
          </div>
        </div>
        <div class="flex items-center justify-center gap-6 pt-4 border-t border">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div class="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Actual Content -->
    <template v-else>
      <div class="flex items-center justify-between mb-4">
        <h2 class="heading-sub">Page Views: Organic vs. Paid</h2>
        <select class="input text-sm w-auto">
          <option>This month</option>
          <option>Last month</option>
          <option>This quarter</option>
        </select>
      </div>
      
      <div class="space-y-4">
      <!-- Chart -->
      <div class="flex items-end gap-1 h-64 overflow-x-auto pb-2">
        <div
          v-for="(day, index) in data"
          :key="index"
          class="flex flex-col items-center gap-1 min-w-5"
        >
          <div class="w-full flex items-end justify-center h-full gap-0.5">
            <!-- Organic bar -->
            <div
              class="bg-blue-600 rounded-t w-2"
              :style="{ height: `${(day.organic / maxValue) * 100}%`, minHeight: '2px' }"
              :title="`Organic: ${day.organic}`"
            ></div>
            <!-- Paid bar -->
            <div
              class="bg-orange-500 rounded-t w-2"
              :style="{ height: `${(day.paid / maxValue) * 100}%`, minHeight: '2px' }"
              :title="`Paid: ${day.paid}`"
            ></div>
          </div>
          <span class="text-sm text-muted-foreground mt-1">{{ index + 1 }}</span>
        </div>
      </div>
      
      <!-- Legend -->
      <div class="flex items-center justify-center gap-6 pt-4 border-t border-border">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-600 rounded"></div>
          <span class="text-sm text-muted-foreground">Organic</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-orange-500 rounded"></div>
          <span class="text-sm text-muted-foreground">Paid</span>
        </div>
      </div>
    </div>
    </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const maxValue = computed(() => {
  return Math.max(...props.data.map(day => day.organic + day.paid))
})
</script>

