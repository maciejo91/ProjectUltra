<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-nsc-card p-4 md:p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-bold text-gray-900">Full funnel</h3>
      <Filter class="w-4 h-4 shrink-0 text-muted-foreground" />
    </div>

    <div class="flex flex-col md:flex-row gap-6 items-start">
      <!-- Funnel Visualization -->
      <div class="flex-1">
        <!-- Funnel Bars -->
        <div class="mb-6">
          <div class="flex items-end gap-0 h-24">
            <div
              v-for="(stage, index) in stages"
              :key="stage.name"
              class="relative transition-all"
              :style="{ 
                width: `${stage.percentage}%`,
                height: '100%'
              }"
            >
              <div
                class="h-full flex items-center justify-center transition-all relative"
                :class="getStageColorClass(stage.color)"
                :style="{
                  clipPath: index === 0 ? 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 12px 100%)' :
                           index === stages.length - 1 ? 'polygon(12px 0, 100% 0, 100% 100%, 0 100%)' :
                           'polygon(12px 0, calc(100% - 12px) 0, calc(100% - 12px) 100%, 12px 100%)'
                }"
              >
                <span class="text-gray-900 text-sm font-bold z-10">{{ stage.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stage Labels with Counts -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div
            v-for="stage in stages"
            :key="stage.name"
            class="text-center"
          >
            <div
              class="h-1 mb-2 rounded"
              :class="getStageColorClass(stage.color)"
            ></div>
            <div class="text-2xl font-bold text-gray-900">{{ formatNumber(stage.count) }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ stage.name }}</div>
          </div>
        </div>
      </div>

      <!-- Conversion Rate Gauge -->
      <div class="flex flex-col items-center justify-center md:ml-6">
        <div class="relative w-24 h-24 md:w-32 md:h-32">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <!-- Background circle -->
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              stroke-width="8"
            />
            <!-- Progress circle -->
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#10b981"
              stroke-width="8"
              :stroke-dasharray="`${conversionRate * 2.827} 283`"
              stroke-linecap="round"
              class="transition-all duration-700"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-xl md:text-2xl font-bold text-gray-900">{{ conversionRate }}%</div>
            </div>
          </div>
        </div>
        <div class="text-sm text-gray-500 mt-2 text-center">Conversion rate</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Filter } from 'lucide-vue-next'

const props = defineProps({
  stages: {
    type: Array,
    required: true
  },
  conversionRate: {
    type: Number,
    required: true
  }
})

const getStageColorClass = (color) => {
  const colorMap = {
    'red': 'bg-red-600',
    'orange': 'bg-orange-600',
    'blue': 'bg-primary',
    'gray': 'bg-gray-600'
  }
  return colorMap[color] || 'bg-gray-600'
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

