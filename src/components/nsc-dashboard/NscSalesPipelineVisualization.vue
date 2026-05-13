<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@motork/component-library/future/primitives'
import { useNscSalesPipeline } from '@/composables/useNscSalesPipeline'

const { t } = useI18n()

const props = defineProps({
  pipelineStages: { type: Array, required: true },
  leadSources: { type: Array, required: true },
  selectedTimeRange: { type: String, default: 'last90Days' }
})

const emit = defineEmits(['update:selectedTimeRange'])
const timeRangeOptions = ['last30Days', 'last90Days', 'last180Days', 'lastYear']
const timeRangeSelectOptions = computed(() =>
  timeRangeOptions.map((value) => ({
    value,
    label: t(`home.nscDashboard.timeRanges.${value}`)
  }))
)
const hoveredLayer = ref(null)
const hoverCardPosition = ref(null)
const pipelineStagesRef = computed(() => props.pipelineStages)
const { svgViewBox, stageCount, createContinuousPath } = useNscSalesPipeline(
  pipelineStagesRef,
  props.leadSources
)

const getLayerGradientId = (layerIndex) => `nsc-pipeline-gradient-${layerIndex}`
const getLayerGradientFill = (layerIndex) => `url(#${getLayerGradientId(layerIndex)})`

const setHover = (layerIndex, event) => {
  hoveredLayer.value = layerIndex
  hoverCardPosition.value = { x: event.clientX, y: event.clientY }
}

const clearHover = () => {
  hoveredLayer.value = null
  hoverCardPosition.value = null
}
</script>

<template>
  <div class="flex shrink-0 flex-col" data-section="sales-pipeline">
    <div class="flex flex-col rounded-lg bg-white p-4 shadow-mk-dashboard-card">
      <div class="flex items-center justify-between pb-4">
        <h3 class="text-lg font-medium leading-5 text-greys-500">{{ t('home.nscDashboard.salesPipeline') }}</h3>
        <Select :model-value="selectedTimeRange" @update:model-value="emit('update:selectedTimeRange', $event)">
          <SelectTrigger
            size="sm"
            class="h-7 rounded-lg border-0 bg-muted px-3 text-xs font-medium text-foreground shadow-none hover:bg-muted/80 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" class="rounded-lg border-border">
            <SelectItem v-for="option in timeRangeSelectOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex flex-col gap-6">
        <div class="flex shrink-0 items-center justify-between">
          <div
            v-for="stage in pipelineStages"
            :key="`${stage.name}-header`"
            class="flex flex-col items-center text-center"
            :style="{ width: `${100 / stageCount}%` }"
          >
            <p class="mb-1 text-sm font-medium text-greys-500">{{ stage.name }}</p>
            <p v-if="stage.percentage" class="text-xl font-semibold leading-none text-greys-900">{{ stage.percentage }}%</p>
          </div>
        </div>

        <div class="relative h-80 shrink-0 overflow-hidden rounded-lg bg-[#F9FAFB]">
          <svg
            width="100%"
            height="100%"
            :viewBox="`0 0 ${svgViewBox.width} ${svgViewBox.height}`"
            preserveAspectRatio="xMidYMid meet"
            class="absolute inset-0"
            shape-rendering="geometricPrecision"
          >
            <defs>
              <linearGradient
                v-for="(source, layerIndex) in leadSources"
                :id="getLayerGradientId(layerIndex)"
                :key="`gradient-${source.name}`"
                gradientUnits="userSpaceOnUse"
                :x1="0"
                :y1="0"
                :x2="svgViewBox.width"
                :y2="0"
              >
                <stop offset="0%" :stop-color="source.color" stop-opacity="0.72" />
                <stop offset="18%" :stop-color="source.color" stop-opacity="0.96" />
                <stop offset="58%" :stop-color="source.color" stop-opacity="1" />
                <stop offset="100%" :stop-color="source.color" stop-opacity="0.82" />
              </linearGradient>
            </defs>

            <g
              v-for="(source, layerIndex) in leadSources"
              :key="`layer-${source.name}`"
              :opacity="hoveredLayer !== null && hoveredLayer !== layerIndex ? 0.2 : 1"
              class="transition-opacity duration-300"
            >
              <path
                :d="createContinuousPath(layerIndex)"
                :fill="getLayerGradientFill(layerIndex)"
                stroke="none"
                class="cursor-pointer transition-all duration-300"
                @mouseenter="(event) => setHover(layerIndex, event)"
                @mousemove="(event) => hoveredLayer === layerIndex && setHover(layerIndex, event)"
                @mouseleave="clearHover"
              />
            </g>

            <line
              v-for="i in 4"
              :key="`divider-${i}`"
              :x1="(svgViewBox.width / stageCount) * i"
              :x2="(svgViewBox.width / stageCount) * i"
              y1="0"
              :y2="svgViewBox.height"
              stroke="#E5E7EB"
              stroke-width="1"
              stroke-dasharray="4,4"
            />
          </svg>
        </div>

        <div class="flex shrink-0 items-center justify-between">
          <div
            v-for="stage in pipelineStages"
            :key="`${stage.name}-time`"
            class="flex flex-col items-center text-center"
            :style="{ width: `${100 / stageCount}%` }"
          >
            <TooltipProvider v-if="stage.avgTime && stage.highlight" :delay-duration="200">
              <Tooltip>
                <TooltipTrigger as-child>
                  <div
                    class="flex cursor-default items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-red-600 transition-all"
                  >
                    <Clock :size="16" class="shrink-0 text-red-600" />
                    <span>{{ stage.avgTime }}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" class="max-w-xs">
                  {{ t('home.nscDashboard.averageTime.worseThanLastMonth') }}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div
              v-else-if="stage.avgTime"
              class="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-greys-500 transition-all"
            >
              <Clock :size="16" class="shrink-0 text-greys-500" />
              <span>{{ stage.avgTime }}</span>
            </div>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-4 border-t border-black/5 pt-4">
          <p class="shrink-0 text-sm text-greys-500">{{ t('home.nscDashboard.leadSources') }}:</p>
          <div class="flex flex-wrap items-center gap-4">
            <button
              v-for="(source, index) in leadSources"
              :key="source.name"
              class="relative flex shrink-0 cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-all duration-300"
              :class="hoveredLayer !== null && hoveredLayer !== index ? 'opacity-30' : hoveredLayer === index ? 'bg-greys-100 opacity-100' : 'opacity-100'"
              @mouseenter="(event) => setHover(index, event)"
              @mousemove="(event) => hoveredLayer === index && setHover(index, event)"
              @mouseleave="clearHover"
            >
              <div class="h-3 w-3 shrink-0 rounded-full transition-all duration-300" :class="hoveredLayer === index ? 'scale-125' : ''" :style="{ backgroundColor: source.color }" />
              <span class="whitespace-nowrap text-sm transition-all duration-300" :class="hoveredLayer === index ? 'font-medium text-greys-900' : 'text-greys-900'">
                {{ source.name }}
              </span>
            </button>
          </div>
        </div>

        <div
          v-if="hoveredLayer !== null && hoverCardPosition && leadSources[hoveredLayer]"
          class="pointer-events-none fixed"
          style="z-index: 9999"
          :style="{ left: `${hoverCardPosition.x + 10}px`, top: `${hoverCardPosition.y + 10}px`, transform: 'translateY(-50%)' }"
        >
          <div class="min-w-[200px] rounded-lg border border-greys-700 bg-greys-900 p-4 shadow-2xl" style="background-color: rgb(17, 24, 39)">
            <h3 class="mb-3 text-sm font-medium text-white">{{ leadSources[hoveredLayer]?.name }}</h3>
            <div class="flex flex-col gap-2">
              <div v-for="stage in leadSources[hoveredLayer]?.pipelineData || []" :key="stage.stage" class="flex items-center gap-2">
                <div class="h-2 w-2 shrink-0 rounded-sm bg-greys-600" />
                <span class="text-sm text-white">{{ stage.stage }}:</span>
                <span class="ml-auto text-sm font-medium text-white">{{ stage.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
