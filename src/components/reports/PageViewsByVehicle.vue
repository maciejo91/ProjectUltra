<template>
  <div class="bg-muted rounded-xl p-1 flex flex-col shrink-0">
    <div class="bg-white rounded-lg p-4 shadow-nsc-card flex flex-col">
    <!-- Loading Skeleton -->
    <template v-if="loading">
      <div class="flex items-center justify-between mb-4">
        <div class="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div class="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div
          v-for="n in 5"
          :key="`skeleton-${n}`"
          class="bg-muted rounded-lg border border-border p-3"
        >
          <div class="mb-2">
            <div class="h-3 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div class="flex items-baseline gap-1.5">
              <div class="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div class="h-3 bg-gray-200 rounded w-10 animate-pulse"></div>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <div class="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
            <div class="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div class="h-8 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    </template>
    
    <!-- Actual Content -->
    <template v-else>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-muted-foreground leading-5">Page Views by Vehicle</h3>
        <select class="input !py-1.5 !px-3 text-sm w-auto">
          <option>This month</option>
          <option>Last month</option>
        </select>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        class="bg-muted rounded-lg border border-border p-3"
      >
        <div class="mb-2">
          <h4 class="text-sm font-medium text-foreground truncate mb-0.5">{{ vehicle.brand }} {{ vehicle.model }}</h4>
          <div class="flex items-baseline gap-1.5">
            <span class="text-sm font-semibold text-foreground leading-tight">{{ vehicle.views }}</span>
            <span class="text-sm text-muted-foreground">views</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2 mb-2">
          <span
            class="text-sm font-medium flex items-center gap-0.5"
            :class="vehicle.changeType === 'increase' ? 'text-green-600' : 'text-red-600'"
          >
            <ArrowUp v-if="vehicle.changeType === 'increase'" class="w-3 h-3 shrink-0" />
            <ArrowDown v-else class="w-3 h-3 shrink-0" />
            {{ Math.abs(vehicle.change) }}%
          </span>
          <span class="text-sm text-muted-foreground">{{ vehicle.avgPerDay }} avg/day</span>
        </div>
        
        <!-- Mini Line Chart with Smooth Curves and Gradient -->
        <div class="h-8 relative">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient :id="`gradient-v-${vehicle.id}`" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :style="`stop-color:${vehicle.changeType === 'increase' ? 'var(--color-success)' : 'var(--brand-red)'};stop-opacity:0.2`" />
                <stop offset="100%" :style="`stop-color:${vehicle.changeType === 'increase' ? 'var(--color-success)' : 'var(--brand-red)'};stop-opacity:0`" />
              </linearGradient>
            </defs>
            
            <!-- Area Fill -->
            <path
              :d="generateAreaPath(vehicle.trend)"
              :fill="`url(#gradient-v-${vehicle.id})`"
              class="transition-all duration-700"
            />
            
            <!-- Smooth Line -->
            <path
              :d="generateSmoothPath(vehicle.trend)"
              :stroke="vehicle.changeType === 'increase' ? 'var(--color-success)' : 'var(--brand-red)'"
              stroke-width="2.5"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="transition-all duration-700"
            />
          </svg>
        </div>
      </div>
    </div>
    </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowUp, ArrowDown } from 'lucide-vue-next'

const props = defineProps({
  vehicles: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const generateSmoothPath = (data) => {
  if (!data || data.length === 0) return ''
  
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1
  
  const width = 100
  const height = 40
  const padding = 2
  
  const points = data.map((value, index) => {
    return {
      x: (index / (data.length - 1)) * (width - padding * 2) + padding,
      y: height - padding - ((value - minValue) / range) * (height - padding * 2)
    }
  })
  
  if (points.length < 2) return ''
  
  let path = `M ${points[0].x},${points[0].y}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const cp1x = curr.x + (next.x - curr.x) / 2
    const cp2x = curr.x + (next.x - curr.x) / 2
    path += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`
  }
  
  return path
}

const generateAreaPath = (data) => {
  const smoothLine = generateSmoothPath(data)
  if (!smoothLine) return ''
  
  const width = 100
  const height = 40
  const padding = 2
  
  const firstPointX = padding
  const lastPointX = width - padding
  
  return `${smoothLine} L ${lastPointX},${height} L ${firstPointX},${height} Z`
}
</script>

