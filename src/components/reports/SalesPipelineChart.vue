<template>
  <div class="bg-muted rounded-xl p-1 flex flex-col shrink-0">
    <div class="bg-white rounded-lg shadow-nsc-card flex flex-col">
      <!-- Loading Skeleton -->
      <template v-if="loading">
        <div class="px-4 py-4 flex items-center justify-between shrink-0">
          <div class="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div class="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      <div class="px-4 pb-4 border-b border">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div v-for="n in 4" :key="`stage-${n}`" class="flex items-center gap-2">
            <div class="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div class="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
            <div class="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        </div>
      </div>
      <div class="px-4 pb-4">
        <div class="h-40 md:h-48 lg:h-56 bg-gray-100 rounded animate-pulse"></div>
      </div>
      <div class="px-4 pb-4 flex flex-wrap gap-4">
        <div v-for="n in 4" :key="`legend-${n}`" class="flex items-center gap-2">
          <div class="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
          <div class="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      </div>
      <div class="px-4 pb-4 flex flex-wrap items-center gap-6 pt-4 border-t border">
        <div v-for="n in 4" :key="`time-${n}`" class="flex items-center gap-2">
          <div class="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
          <div class="h-4 bg-gray-200 rounded w-8 animate-pulse"></div>
          <div class="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        </div>
      </template>
      
      <!-- Actual Content -->
      <template v-else>
        <!-- Title Section -->
        <div class="px-4 py-4 shrink-0">
          <div class="flex items-center gap-2">
            <TrendingUp :size="16" class="text-foreground" />
            <h3 class="text-lg font-medium text-foreground leading-5">Sales Pipeline</h3>
          </div>
        </div>

        <div class="flex flex-col gap-6 px-4 pb-4">
          <!-- Stage Labels and Percentages Above -->
          <div class="flex items-center justify-between shrink-0">
            <div
              v-for="stage in pipeline.stages"
              :key="`${stage.name}-header`"
              class="flex flex-col items-center text-center"
              :style="{ width: `${100 / pipeline.stages.length}%` }"
            >
              <p class="text-sm font-medium text-muted-foreground mb-1">{{ stage.name }}</p>
              <p
                v-if="stage.percentage"
                class="text-xl font-semibold text-foreground leading-none"
              >
                {{ stage.percentage }}%
              </p>
            </div>
          </div>

          <!-- Pipeline Visualization -->
          <div
            class="relative shrink-0 bg-muted rounded-lg overflow-hidden"
            style="height: 320px"
          >
            <!-- Area Chart using SVG -->
            <svg class="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
              <!-- Background grid lines -->
              <defs>
                <linearGradient v-for="source in pipeline.leadSources" :key="`gradient-${source.name}`" :id="`gradient-${getGradientId(source.name)}`" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" :style="`stop-color:${getSourceColor(source.color)};stop-opacity:0.8`" />
                  <stop offset="100%" :style="`stop-color:${getSourceColor(source.color)};stop-opacity:0.1`" />
                </linearGradient>
              </defs>
              
              <!-- Area paths for each source (stacked) -->
              <path
                v-for="(source, idx) in pipeline.leadSources"
                :key="source.name"
                :d="generateAreaPath(source.data, idx)"
                :fill="`url(#gradient-${getGradientId(source.name)})`"
                opacity="0.7"
              />
            </svg>
          </div>

          <!-- Lead Source Legend -->
          <div class="flex flex-wrap gap-4">
            <div
              v-for="source in pipeline.leadSources"
              :key="source.name"
              class="flex items-center gap-2"
            >
              <div
                class="w-3 h-3 rounded-full"
                :class="{
                  'bg-red-500': source.color === 'red',
                  'bg-orange-500': source.color === 'orange',
                  'bg-blue-500': source.color === 'blue',
                  'bg-gray-500': source.color === 'gray'
                }"
              ></div>
              <span class="text-xs text-muted-foreground">{{ source.name }}</span>
            </div>
          </div>

          <!-- Average Times per Lead Source -->
          <div class="flex flex-wrap items-center gap-6 pt-4 border-t border-border">
            <div
              v-for="source in pipeline.leadSources"
              :key="source.name"
              class="flex items-center gap-2"
            >
              <Clock class="w-3 h-3 shrink-0 text-muted-foreground" />
              <span class="text-sm font-bold text-foreground">{{ getSourceAvgTime(source.name) }}</span>
              <span class="text-xs text-muted-foreground">on avg.</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { TrendingUp, Clock } from 'lucide-vue-next'

const props = defineProps({
  pipeline: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const getGradientId = (name) => {
  return name.toLowerCase().replace('.', '').replace(' ', '-')
}

const getSourceColor = (color) => {
  const colors = {
    red: 'var(--brand-red)',
    orange: '#f97316', // Orange-500 - no CSS variable available in theme
    blue: 'var(--brand-blue)',
    gray: 'var(--brand-slate)'
  }
  return colors[color] || 'var(--brand-slate)'
}

const getSourceAvgTime = (sourceName) => {
  const avgTimes = {
    'Coches.net': '12h',
    'Autoscout24': '12h',
    'OLX': '7d 9h',
    'Cars.com': '12h'
  }
  return avgTimes[sourceName] || '12h'
}

const generateAreaPath = (data, index) => {
  const width = 800
  const height = 300
  const maxValue = Math.max(...props.pipeline.leadSources[0].data)
  const pointsCount = data.length
  const stepX = width / (pointsCount - 1)
  
  // Calculate cumulative values for stacking
  let cumulativeBottom = Array(pointsCount).fill(height)
  for (let i = 0; i < index; i++) {
    const prevData = props.pipeline.leadSources[i].data
    for (let j = 0; j < pointsCount; j++) {
      cumulativeBottom[j] -= (prevData[j] / maxValue) * height
    }
  }
  
  const yTopPositions = data.map((value, i) => {
    return cumulativeBottom[i] - (value / maxValue) * height
  })

  // Generate smooth top path using cubic bezier
  let path = `M 0,${yTopPositions[0]}`
  for (let i = 0; i < pointsCount - 1; i++) {
    const currX = i * stepX
    const nextX = (i + 1) * stepX
    const cp1x = currX + (nextX - currX) / 2
    const cp2x = currX + (nextX - currX) / 2
    path += ` C ${cp1x},${yTopPositions[i]} ${cp2x},${yTopPositions[i+1]} ${nextX},${yTopPositions[i+1]}`
  }

  // Connect to bottom and go back
  path += ` L ${width},${cumulativeBottom[pointsCount-1]}`
  
  // Generate smooth bottom path (going backwards)
  for (let i = pointsCount - 1; i > 0; i--) {
    const currX = i * stepX
    const prevX = (i - 1) * stepX
    const cp1x = currX - (currX - prevX) / 2
    const cp2x = currX - (currX - prevX) / 2
    path += ` C ${cp1x},${cumulativeBottom[i]} ${cp2x},${cumulativeBottom[i-1]} ${prevX},${cumulativeBottom[i-1]}`
  }
  
  path += ' Z'
  return path
}
</script>

