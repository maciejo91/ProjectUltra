<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import NscBarChart from './NscBarChart.vue'
import NscDonutChartInteractive from './NscDonutChartInteractive.vue'

const { t } = useI18n()

const props = defineProps({
  leadsPerAreaData: { type: Array, required: true },
  contractsPerAreaData: { type: Array, required: true },
  modelsSoldData: { type: Array, required: true }
})

const totalLeads = computed(() => props.leadsPerAreaData.reduce((sum, item) => sum + item.value, 0))
const totalContracts = computed(() => props.contractsPerAreaData.reduce((sum, item) => sum + item.value, 0))

const getChartConfig = (data) => {
  const values = data.map((item) => item.value)
  const minValue = values.length > 0 ? Math.min(...values) : 0
  const maxValue = values.length > 0 ? Math.max(...values) : 0
  const config = {}

  data.forEach((item) => {
    const normalized = maxValue <= minValue ? 0.5 : (item.value - minValue) / (maxValue - minValue)
    const lightness = Math.round(92 - normalized * 28)
    config[item.name] = {
      label: item.name,
      color: `hsl(217 85% ${lightness}%)`
    }
  })

  return config
}
</script>

<template>
  <div class="flex shrink-0 flex-col gap-4">
    <div class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="relative overflow-hidden rounded-lg bg-white p-4 shadow-mk-dashboard-card">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-medium leading-5 text-greys-500">{{ t('home.nscDashboard.leadsByArea') }}</h4>
          <Button
            variant="ghost"
            size="sm"
            class="h-7 gap-1 rounded-lg bg-muted px-3 text-xs font-medium text-foreground shadow-none hover:bg-muted/80"
          >
            {{ t('home.nscDashboard.thisMonth') }}
            <ChevronDown :size="14" />
          </Button>
        </div>
        <div class="flex justify-center">
          <NscDonutChartInteractive
            :data="leadsPerAreaData"
            :config="getChartConfig(leadsPerAreaData)"
            :size="280"
            :total="totalLeads"
            :subtitle="t('home.nscDashboard.totalLeadsLabel')"
            :value-label="t('home.nscDashboard.columns.leads')"
          />
        </div>
      </div>

      <div class="relative overflow-hidden rounded-lg bg-white p-4 shadow-mk-dashboard-card">
        <div class="mb-3 flex items-center justify-between">
          <h4 class="text-sm font-medium leading-5 text-greys-500">{{ t('home.nscDashboard.contractsByArea') }}</h4>
          <Button
            variant="ghost"
            size="sm"
            class="h-7 gap-1 rounded-lg bg-muted px-3 text-xs font-medium text-foreground shadow-none hover:bg-muted/80"
          >
            {{ t('home.nscDashboard.thisMonth') }}
            <ChevronDown :size="14" />
          </Button>
        </div>
        <div class="flex justify-center">
          <NscDonutChartInteractive
            :data="contractsPerAreaData"
            :config="getChartConfig(contractsPerAreaData)"
            :size="280"
            :total="totalContracts"
            :subtitle="t('home.nscDashboard.totalContractsLabel')"
            :value-label="t('home.nscDashboard.columns.contracts')"
          />
        </div>
      </div>
    </div>

    <div class="relative w-full overflow-hidden rounded-lg bg-white p-4 shadow-mk-dashboard-card">
      <div class="mb-3 flex items-center justify-between">
        <h4 class="text-sm font-medium leading-5 text-greys-500">{{ t('home.nscDashboard.modelsSold') }}</h4>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 gap-1 rounded-lg bg-muted px-3 text-xs font-medium text-foreground shadow-none hover:bg-muted/80"
        >
          {{ t('home.nscDashboard.thisMonth') }}
          <ChevronDown :size="14" />
        </Button>
      </div>
      <div class="w-full">
        <NscBarChart
          :data="modelsSoldData"
          :config="getChartConfig(modelsSoldData)"
          :width="800"
          :height="320"
          orientation="vertical"
          :value-label="t('home.nscDashboard.unitsSoldLabel')"
        />
      </div>
    </div>
  </div>
</template>
