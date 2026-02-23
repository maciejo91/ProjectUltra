import { computed } from 'vue'

/**
 * Transforms Reports page data (KPIs, team performance, sales pipeline) into
 * the shape expected by useAIAssistant for answering questions.
 */
export function useDashboardData(dashboardKPIs, teamPerformance, salesPipeline) {
  const getDataForAI = computed(() => {
    const kpis = (dashboardKPIs.value || []).map((kpi) => ({
      title: kpi.title,
      value: kpi.value,
      change: kpi.change,
      changeType: kpi.changeType,
    }))

    const team = (teamPerformance.value || []).map((member) => {
      const contracts = member.contracts ?? member.won ?? 0
      const conversionRate = member.leads > 0
        ? parseFloat(((contracts / member.leads) * 100).toFixed(1))
        : 0
      return {
        name: member.name,
        leads: member.leads,
        qualifiedLeads: member.qualifiedLeads,
        qualifiedPercentage: member.qualifiedPercentage,
        opportunities: member.opportunities,
        contracts,
        conversionRate,
      }
    })

    const pipeline = salesPipeline.value || {}
    const stages = pipeline.stages || []
    const leadSourceRaw = pipeline.leadSources || []

    const leadSources = leadSourceRaw.map((source) => {
      const data = source.data || []
      const totalLeads = data[0] || 0
      const wonDeals = data[data.length - 1] || 0
      const conversionRate = totalLeads > 0
        ? parseFloat(((wonDeals / totalLeads) * 100).toFixed(1))
        : 0
      const conversionRates = {
        leadGenerated: 100,
        contacted: data[1] && totalLeads ? (data[1] / totalLeads) * 100 : 0,
        qualified: data[2] && totalLeads ? (data[2] / totalLeads) * 100 : 0,
        offerCreated: data[3] && totalLeads ? (data[3] / totalLeads) * 100 : 0,
        won: conversionRate,
      }
      return {
        name: source.name,
        conversionRate,
        totalLeads,
        wonDeals,
        conversionRates,
      }
    })

    const pipelineData = stages.map((stage) => ({
      name: stage.name,
      percentage: stage.percentage,
      avgTime: stage.avgTime,
    }))

    const sortedByConversion = [...team].sort((a, b) => b.conversionRate - a.conversionRate)

    return {
      kpis,
      teamPerformance: team,
      topPerformers: sortedByConversion.slice(0, 3),
      leadSources,
      pipeline: pipelineData,
      areaPerformance: { leadsPerArea: [], contractsPerArea: [] },
      modelsSold: [],
    }
  })

  return { getDataForAI }
}
