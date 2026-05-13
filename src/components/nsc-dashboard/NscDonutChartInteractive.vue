<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NscChartContainer from './NscChartContainer.vue'

const { t } = useI18n()

const props = defineProps({
  data: { type: Array, required: true },
  config: { type: Object, required: true },
  size: { type: Number, default: 320 },
  colors: { type: Array, default: () => [] },
  valueLabel: { type: String, default: 'Value' },
  total: { type: Number, required: true },
  subtitle: { type: String, required: true },
  innerRadius: { type: Number, default: 0.6 }
})

const fallbackColors = ['#3B82F6', '#14B8A6', '#0EA5E9', '#8B5CF6', '#EC4899', '#F97316', '#EF4444', '#10B981']
const hoveredIndex = ref(null)
const hoverPosition = ref(null)
const outerRadius = computed(() => Math.round(props.size * 0.40625))
const innerRadiusValue = computed(() => outerRadius.value * props.innerRadius)
const center = computed(() => props.size / 2)

const getColor = (item, index) =>
  props.config[item.name]?.color ||
  (props.colors.length > 0 ? props.colors[index % props.colors.length] : fallbackColors[index % fallbackColors.length])

const chartPaths = computed(() => {
  const total = props.data.reduce((sum, item) => sum + item.value, 0)
  if (total <= 0) return []

  let currentAngle = -90

  return props.data.map((item, index) => {
    const percent = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180
    const outerX1 = center.value + outerRadius.value * Math.cos(startAngleRad)
    const outerY1 = center.value + outerRadius.value * Math.sin(startAngleRad)
    const outerX2 = center.value + outerRadius.value * Math.cos(endAngleRad)
    const outerY2 = center.value + outerRadius.value * Math.sin(endAngleRad)
    const innerX1 = center.value + innerRadiusValue.value * Math.cos(startAngleRad)
    const innerY1 = center.value + innerRadiusValue.value * Math.sin(startAngleRad)
    const innerX2 = center.value + innerRadiusValue.value * Math.cos(endAngleRad)
    const innerY2 = center.value + innerRadiusValue.value * Math.sin(endAngleRad)
    const largeArcFlag = angle > 180 ? 1 : 0

    currentAngle = endAngle

    return {
      path: `M ${outerX1} ${outerY1} A ${outerRadius.value} ${outerRadius.value} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2} L ${innerX2} ${innerY2} A ${innerRadiusValue.value} ${innerRadiusValue.value} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1} Z`,
      color: getColor(item, index),
      name: item.name,
      value: item.value,
      percent
    }
  })
})

const activeSegment = computed(() => {
  if (hoveredIndex.value === null) return null
  return chartPaths.value[hoveredIndex.value]
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
    <div class="relative flex items-center justify-center">
      <svg :width="size" :height="size" class="shrink-0">
        <g v-for="(segment, index) in chartPaths" :key="`${segment.name}-${index}`">
          <path
            :d="segment.path"
            :fill="segment.color"
            class="cursor-pointer transition-opacity duration-300"
            :class="hoveredIndex !== null && hoveredIndex !== index ? 'opacity-30' : 'opacity-100'"
            @mouseenter="(event) => setHover(index, event)"
            @mousemove="(event) => hoveredIndex === index && setHover(index, event)"
            @mouseleave="clearHover"
          />
        </g>
      </svg>
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div class="text-xl font-semibold leading-none text-greys-900">{{ total.toLocaleString() }}</div>
        <div class="mt-1 text-sm text-greys-500">{{ subtitle }}</div>
      </div>
    </div>

    <div
      v-if="activeSegment && hoverPosition"
      class="pointer-events-none fixed"
      style="z-index: 9999"
      :style="{ left: `${hoverPosition.x + 10}px`, top: `${hoverPosition.y + 10}px`, transform: 'translateY(-50%)' }"
    >
      <div class="min-w-[200px] rounded-lg border border-greys-700 bg-greys-900 p-4 shadow-2xl" style="background-color: rgb(17, 24, 39)">
        <h3 class="mb-3 text-sm font-medium text-white">{{ activeSegment.name }}</h3>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 shrink-0 rounded-sm bg-greys-600" />
            <span class="text-sm text-white">{{ valueLabel }}:</span>
            <span class="ml-auto text-sm font-medium text-white">{{ activeSegment.value }}</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 shrink-0 rounded-sm bg-greys-600" />
            <span class="text-sm text-white">{{ t('home.nscDashboard.percentage') }}:</span>
            <span class="ml-auto text-sm font-medium text-white">{{ activeSegment.percent.toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </NscChartContainer>
</template>
