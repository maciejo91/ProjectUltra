<script setup>
import NscKPICard from './NscKPICard.vue'

defineProps({
  kpiCards: { type: Array, required: true }
})
</script>

<template>
  <div class="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <NscKPICard
      v-for="kpi in kpiCards"
      :key="kpi.id"
      :title="kpi.title"
      :value="kpi.value"
      :change="kpi.change"
      :change-type="kpi.changeType"
      :breakdown="kpi.breakdown"
    />
  </div>
</template>
