<script setup>
import { computed, ref } from 'vue'
import NscChartContainer from './NscChartContainer.vue'

const props = defineProps({
  data: { type: Array, required: true },
  config: { type: Object, required: true },
  width: { type: Number, default: 800 },
  height: { type: Number, default: 400 },
  colors: { type: Array, default: () => [] },
  valueLabel: { type: String, default: 'Value' },
  barWidth: { type: Number, default: 56 },
  barGap: { type: Number, default: 20 },
  orientation: { type: String, default: 'vertical' }
})

const fallbackColors = ['#3B82F6', '#14B8A6', '#0EA5E9', '#8B5CF6', '#EC4899', '#F97316', '#EF4444', '#10B981']
const hoveredIndex = ref(null)
const hoverPosition = ref(null)
const maxValue = computed(() => Math.max(...props.data.map((item) => item.value), 1))
const padding = computed(() =>
  props.orientation === 'horizontal'
    ? { top: 20, right: 60, bottom: 20, left: 120 }
    : { top: 20, right: 20, bottom: 60, left: 20 }
)

const getColor = (item, index) =>
  props.config[item.name]?.color ||
  (props.colors.length > 0 ? props.colors[index % props.colors.length] : fallbackColors[index % fallbackColors.length])

const barData = computed(() => {
  if (props.orientation === 'horizontal') {
    const availableHeight = props.height - padding.value.top - padding.value.bottom
    const totalGaps = (props.data.length - 1) * props.barGap
    const totalBarsHeight = props.data.length * props.barWidth
    const startY = padding.value.top + (availableHeight - totalBarsHeight - totalGaps) / 2

    return props.data.map((item, index) => ({
      name: item.name,
      value: item.value,
      barWidth: (item.value / maxValue.value) * (props.width - padding.value.left - padding.value.right),
      barHeight: props.barWidth,
      x: padding.value.left,
      y: startY + index * (props.barWidth + props.barGap),
      color: getColor(item, index)
    }))
  }

  const availableWidth = props.width - padding.value.left - padding.value.right
  const totalGaps = (props.data.length - 1) * props.barGap
  const totalBarsWidth = props.data.length * props.barWidth
  const startX = padding.value.left + (availableWidth - totalBarsWidth - totalGaps) / 2

  return props.data.map((item, index) => {
    const barHeight = (item.value / maxValue.value) * (props.height - padding.value.top - padding.value.bottom)
    return {
      name: item.name,
      value: item.value,
      barWidth: props.barWidth,
      barHeight,
      x: startX + index * (props.barWidth + props.barGap),
      y: padding.value.top + (props.height - padding.value.top - padding.value.bottom) - barHeight,
      color: getColor(item, index)
    }
  })
})

const gridLines = computed(() => {
  const numLines = 5
  const lines = []

  if (props.orientation === 'horizontal') {
    const chartWidth = props.width - padding.value.left - padding.value.right
    const step = chartWidth / numLines
    const valueStep = maxValue.value / numLines
    for (let i = 0; i <= numLines; i++) {
      lines.push({ x: padding.value.left + i * step, value: Math.round(i * valueStep) })
    }
    return lines
  }

  const chartHeight = props.height - padding.value.top - padding.value.bottom
  const step = chartHeight / numLines
  const valueStep = maxValue.value / numLines
  for (let i = 0; i <= numLines; i++) {
    lines.push({ y: padding.value.top + i * step, value: Math.round(maxValue.value - i * valueStep) })
  }
  return lines
})

const activeBar = computed(() => {
  if (hoveredIndex.value === null) return null
  return barData.value[hoveredIndex.value]
})

const setHover = (index, event) => {
  hoveredIndex.value = index
  hoverPosition.value = { x: event.clientX, y: event.clientY }
}

const clearHover = () => {
  hoveredIndex.value = null
  hoverPosition.value = null
}
</script>

<template>
  <NscChartContainer :config="config" class="relative py-4">
    <div class="flex w-full items-center justify-center">
      <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" class="h-auto w-full">
        <g v-if="orientation === 'horizontal'">
          <line
            v-for="(line, index) in gridLines"
            :key="`grid-${index}`"
            :x1="line.x"
            :y1="padding.top"
            :x2="line.x"
            :y2="height - padding.bottom"
            stroke="#E5E7EB"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </g>
        <g v-else>
          <line
            v-for="(line, index) in gridLines"
            :key="`grid-${index}`"
            :x1="padding.left"
            :y1="line.y"
            :x2="width - padding.right"
            :y2="line.y"
            stroke="#E5E7EB"
            stroke-width="1"
            vector-effect="non-scaling-stroke"
          />
        </g>

        <g v-for="(bar, index) in barData" :key="`bar-${index}`">
          <rect
            :x="bar.x"
            :y="bar.y"
            :width="bar.barWidth"
            :height="bar.barHeight"
            :fill="bar.color"
            rx="4"
            ry="4"
            class="cursor-pointer transition-opacity duration-300"
            :class="hoveredIndex !== null && hoveredIndex !== index ? 'opacity-30' : 'opacity-100'"
            @mouseenter="(event) => setHover(index, event)"
            @mousemove="(event) => hoveredIndex === index && setHover(index, event)"
            @mouseleave="clearHover"
          />
        </g>

        <g v-if="orientation === 'horizontal'">
          <text
            v-for="(bar, index) in barData"
            :key="`label-${index}`"
            :x="padding.left - 12"
            :y="bar.y + bar.barHeight / 2"
            text-anchor="end"
            dominant-baseline="middle"
            class="fill-greys-700 text-sm"
          >
            {{ bar.name }}
          </text>
        </g>
        <g v-else>
          <text
            v-for="(bar, index) in barData"
            :key="`label-${index}`"
            :x="bar.x + bar.barWidth / 2"
            :y="height - padding.bottom + 20"
            text-anchor="middle"
            dominant-baseline="middle"
            class="fill-greys-700 text-sm"
          >
            {{ bar.name }}
          </text>
        </g>
      </svg>
    </div>

    <div
      v-if="activeBar && hoverPosition"
      class="pointer-events-none fixed"
      style="z-index: 9999"
      :style="{ left: `${hoverPosition.x + 10}px`, top: `${hoverPosition.y + 10}px`, transform: 'translateY(-50%)' }"
    >
      <div class="min-w-[200px] rounded-lg border border-greys-700 bg-greys-900 p-4 shadow-2xl" style="background-color: rgb(17, 24, 39)">
        <h3 class="mb-3 text-sm font-medium text-white">{{ activeBar.name }}</h3>
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 shrink-0 rounded-sm bg-greys-600" />
          <span class="text-sm text-white">{{ valueLabel }}:</span>
          <span class="ml-auto text-sm font-medium text-white">{{ activeBar.value }}</span>
        </div>
      </div>
    </div>
  </NscChartContainer>
</template>
