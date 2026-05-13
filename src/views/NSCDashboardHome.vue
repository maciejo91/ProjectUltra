<template>
  <div class="page-container flex min-w-0 flex-col bg-muted">
    <div class="px-6 pb-4 md:pb-8">
      <div class="flex w-full flex-col gap-4 sm:gap-5 md:gap-6 lg:flex-row">
        <div class="flex min-w-0 flex-1 flex-col gap-6">
          <NscKPICardGrid :kpi-cards="kpiCards" />

          <NscSalesPipelineVisualization
            v-model:selected-time-range="selectedTimeRange"
            :pipeline-stages="pipelineStages"
            :lead-sources="leadSources"
          />

          <NscTeamPerformanceTable :data="salesReps" />

        </div>

        <aside class="flex w-full shrink-0 flex-col gap-6 lg:w-80 xl:w-88">
          <NscAIChatInterface :get-data-for-a-i="getDataForAI" />
          <NscTasksDueList :tasks="tasksDue" />
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskFilters } from '@/composables/useTaskFilters'
import { useLeadsStore } from '@/stores/leads'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { useUsersStore } from '@/stores/users'
import NscAIChatInterface from '@/components/nsc-dashboard/NscAIChatInterface.vue'
import NscKPICardGrid from '@/components/nsc-dashboard/NscKPICardGrid.vue'
import NscSalesPipelineVisualization from '@/components/nsc-dashboard/NscSalesPipelineVisualization.vue'
import NscTasksDueList from '@/components/nsc-dashboard/NscTasksDueList.vue'
import NscTeamPerformanceTable from '@/components/nsc-dashboard/NscTeamPerformanceTable.vue'

const { t } = useI18n()
const leadsStore = useLeadsStore()
const opportunitiesStore = useOpportunitiesStore()
const usersStore = useUsersStore()
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const splitByWalkInShare = (total) => {
  const walkIns = Math.round(total * (randomBetween(70, 75) / 100))
  return {
    leads: total - walkIns,
    walkIns
  }
}

const createKpiCards = () => {
  const dealsClosed = randomBetween(50, 200)
  const dealsChange = randomBetween(-25, 35)
  const offersGenerated = randomBetween(500, 2000)
  const offersGeneratedChange = randomBetween(-25, 35)
  const newLeads = randomBetween(100, 500)
  const leadsChange = randomBetween(-25, 35)
  const walkInOffersProduced = randomBetween(30, 150)
  const walkInOffersProducedChange = randomBetween(-25, 35)
  const offersGeneratedBreakdown = splitByWalkInShare(offersGenerated)
  const dealsClosedBreakdown = splitByWalkInShare(dealsClosed)

  return [
    {
      id: '1',
      title: t('home.nscDashboard.kpis.newLeadsToday'),
      value: newLeads,
      change: Math.abs(leadsChange),
      changeType: leadsChange >= 0 ? 'increase' : 'decrease'
    },
    {
      id: '2',
      title: t('home.nscDashboard.kpis.walkInOffersProducedToday'),
      value: walkInOffersProduced,
      change: Math.abs(walkInOffersProducedChange),
      changeType: walkInOffersProducedChange >= 0 ? 'increase' : 'decrease'
    },
    {
      id: '3',
      title: t('home.nscDashboard.kpis.offersGeneratedThisMonth'),
      value: offersGenerated,
      change: Math.abs(offersGeneratedChange),
      changeType: offersGeneratedChange >= 0 ? 'increase' : 'decrease',
      breakdown: [
        { label: t('home.nscDashboard.kpis.breakdown.leads'), value: offersGeneratedBreakdown.leads },
        { label: t('home.nscDashboard.kpis.breakdown.walkIns'), value: offersGeneratedBreakdown.walkIns }
      ]
    },
    {
      id: '4',
      title: t('home.nscDashboard.kpis.dealsClosedThisMonth'),
      value: dealsClosed,
      change: Math.abs(dealsChange),
      changeType: dealsChange >= 0 ? 'increase' : 'decrease',
      breakdown: [
        { label: t('home.nscDashboard.kpis.breakdown.leads'), value: dealsClosedBreakdown.leads },
        { label: t('home.nscDashboard.kpis.breakdown.walkIns'), value: dealsClosedBreakdown.walkIns }
      ]
    }
  ]
}

const generatePipelineData = (baseValue, conversionRates) => [
  { stage: t('home.nscDashboard.stages.lead'), value: baseValue },
  { stage: t('home.nscDashboard.stages.takeInCharge'), value: Math.round(baseValue * ((conversionRates[1] || 0) / 100)) },
  { stage: t('home.nscDashboard.stages.qualified'), value: Math.round(baseValue * ((conversionRates[2] || 0) / 100)) },
  { stage: t('home.nscDashboard.stages.offerCreated'), value: Math.round(baseValue * ((conversionRates[3] || 0) / 100)) },
  { stage: t('home.nscDashboard.stages.deal'), value: Math.round(baseValue * ((conversionRates[4] || 0) / 100)) }
]

const generateConversionRates = () => [
  100,
  randomBetween(80, 90),
  randomBetween(55, 70),
  randomBetween(18, 25),
  randomBetween(11, 16)
]

const createLeadSources = () => {
  const totalLeads = randomBetween(1400, 2200)
  const sourceDefinitions = [
    { name: 'WebSpark', volume: 0.25, color: '#B8C5D6' },
    { name: 'Meta', volume: 0.4, color: '#1E4976' },
    { name: 'Autoscout24', volume: 0.15, color: '#FFB366' },
    { name: 'Mini-sito OEM', volume: 0.125, color: '#D6E0EA' },
    { name: 'Automation tool', volume: 0.075, color: '#6F8EA8' }
  ]

  return sourceDefinitions.map((source) => {
    const base = Math.round(totalLeads * source.volume)
    const rates = generateConversionRates()

    return {
      name: source.name,
      color: source.color,
      volume: source.volume,
      conversionRates: rates,
      pipelineData: generatePipelineData(base, rates)
    }
  })
}

const createBdcAppointmentSummaryYesterday = () => {
  const booked = randomBetween(28, 42)
  const confirmed = randomBetween(22, booked)
  const showed = randomBetween(Math.round(confirmed * 0.68), Math.round(confirmed * 0.82))
  const remainingAfterShow = confirmed - showed
  const rescheduled = Math.min(randomBetween(2, 5), remainingAfterShow)
  const noShows = remainingAfterShow - rescheduled

  return {
    booked,
    confirmed,
    showed,
    noShows,
    rescheduled,
    showRate: parseFloat(((showed / confirmed) * 100).toFixed(1)),
    targetShowRate: 72
  }
}

const createDealerships = () => {
  const dealershipList = [
    { id: '1', name: 'Volvo London', city: 'London', region: 'Greater London' },
    { id: '2', name: 'Volvo Manchester', city: 'Manchester', region: 'North West' },
    { id: '3', name: 'Volvo Birmingham', city: 'Birmingham', region: 'West Midlands' },
    { id: '4', name: 'Volvo Leeds', city: 'Leeds', region: 'Yorkshire' },
    { id: '5', name: 'Volvo Bristol', city: 'Bristol', region: 'South West' },
    { id: '6', name: 'Volvo Edinburgh', city: 'Edinburgh', region: 'Scotland' },
    { id: '7', name: 'Volvo Glasgow', city: 'Glasgow', region: 'Scotland' },
    { id: '8', name: 'Volvo Liverpool', city: 'Liverpool', region: 'North West' },
    { id: '9', name: 'Volvo Newcastle', city: 'Newcastle', region: 'North East' },
    { id: '10', name: 'Volvo Sheffield', city: 'Sheffield', region: 'Yorkshire' }
  ]

  return dealershipList.map((dealer) => {
    const leads = randomBetween(500, 3000)
    const qualifiedPercentage = randomBetween(40, 55)
    const qualifiedLeads = Math.round(leads * (qualifiedPercentage / 100))
    const opportunities = Math.round(qualifiedLeads * (randomBetween(40, 60) / 100))
    const contracts = Math.round(opportunities * (randomBetween(50, 70) / 100))
    return { ...dealer, leads, qualifiedLeads, qualifiedPercentage, opportunities, contracts }
  })
}

const fallbackSalesReps = [
  { id: 2, name: 'Sara Marino', team: 'Sales (New)', dealership: 'Milano' },
  { id: 5, name: 'Marco Rossi', team: 'Sales (New)', dealership: 'Firenze' },
  { id: 6, name: 'Giulia Bianchi', team: 'Sales (New)', dealership: 'Roma' },
  { id: 8, name: 'Sofia Romano', team: 'Sales (New)', dealership: 'Trento' },
  { id: 10, name: 'Francesca Moretti', team: 'Sales (Rent)', dealership: 'Firenze' },
  { id: 12, name: 'Elena Marchetti', team: 'Sales (Used)', dealership: 'Firenze' },
  { id: 14, name: 'Chiara De Luca', team: 'Sales (New)', dealership: 'Milano' },
  { id: 16, name: 'Michele Tomasi', team: 'Sales (New)', dealership: 'Milano' }
]

const createSalesReps = (users) => {
  const reps = users.filter((user) => user.role === 'salesman')
  const source = reps.length > 0 ? reps : fallbackSalesReps

  return source.map((rep) => {
    const leads = randomBetween(250, 900)
    const qualifiedPercentage = randomBetween(40, 65)
    const qualifiedLeads = Math.round(leads * (qualifiedPercentage / 100))
    const opportunities = Math.round(qualifiedLeads * (randomBetween(45, 65) / 100))
    const contracts = Math.round(opportunities * (randomBetween(45, 75) / 100))
    const isNewCarSales = String(rep.team || '').toLowerCase().includes('new')
    const newCarsSoldThisQuarter = isNewCarSales
      ? Math.round(contracts * (randomBetween(240, 320) / 100))
      : Math.round(contracts * (randomBetween(20, 60) / 100))

    return {
      id: rep.id.toString(),
      name: rep.name,
      team: rep.team,
      city: rep.dealership,
      leads,
      qualifiedLeads,
      qualifiedPercentage,
      opportunities,
      contracts,
      newCarsSoldThisQuarter
    }
  })
}

const kpiCards = ref(createKpiCards())
const hoursOnAverage = (hours) => t('home.nscDashboard.averageTime.hours', { hours })
const daysHoursOnAverage = (days, hours) =>
  t('home.nscDashboard.averageTime.daysHours', { days, hours })

const pipelineStages = ref([
  { name: t('home.nscDashboard.stages.lead') },
  {
    name: t('home.nscDashboard.stages.takeInCharge'),
    percentage: 92,
    avgTime: hoursOnAverage(randomBetween(8, 14))
  },
  {
    name: t('home.nscDashboard.stages.qualified'),
    percentage: 68,
    avgTime: hoursOnAverage(randomBetween(10, 16))
  },
  {
    name: t('home.nscDashboard.stages.offerCreated'),
    percentage: 51,
    avgTime: daysHoursOnAverage(randomBetween(5, 8), randomBetween(10, 18)),
    highlight: true
  },
  {
    name: t('home.nscDashboard.stages.deal'),
    percentage: 13,
    avgTime: hoursOnAverage(randomBetween(12, 18))
  }
])
const leadSources = ref(createLeadSources())
const bdcAppointmentSummaryYesterday = ref(createBdcAppointmentSummaryYesterday())
const selectedTimeRange = ref('last90Days')
const dealerships = ref(createDealerships())
const salesReps = computed(() => createSalesReps(usersStore.users))
const showClosedTasks = ref(false)
const { allTasks } = useTaskFilters(showClosedTasks)

const leadsPerAreaData = computed(() => {
  const regionMap = new Map()
  dealerships.value.forEach((dealership) => {
    regionMap.set(dealership.region, (regionMap.get(dealership.region) || 0) + dealership.leads)
  })
  return Array.from(regionMap.entries()).map(([name, value]) => ({ name, value }))
})

const contractsPerAreaData = computed(() => {
  const regionMap = new Map()
  dealerships.value.forEach((dealership) => {
    regionMap.set(dealership.region, (regionMap.get(dealership.region) || 0) + dealership.contracts)
  })
  return Array.from(regionMap.entries()).map(([name, value]) => ({ name, value }))
})

const volvoModelsSoldData = computed(() =>
  [
    { name: 'XC60', value: randomBetween(300, 500) },
    { name: 'XC40', value: randomBetween(250, 450) },
    { name: 'XC90', value: randomBetween(150, 300) },
    { name: 'V60', value: randomBetween(120, 250) },
    { name: 'S90', value: randomBetween(80, 180) },
    { name: 'C40', value: randomBetween(50, 120) },
    { name: 'V90', value: randomBetween(50, 100) },
    { name: 'XC40 Recharge', value: randomBetween(50, 90) }
  ].sort((a, b) => b.value - a.value)
)

const getTaskDueDate = (task) =>
  task.type === 'opportunity' && task.expectedCloseDate
    ? task.expectedCloseDate
    : task.nextActionDue ?? task.dueDate

const tasksDue = computed(() =>
  allTasks.value
    .filter((task) => getTaskDueDate(task))
    .sort((a, b) => new Date(getTaskDueDate(a)).getTime() - new Date(getTaskDueDate(b)).getTime())
)

onMounted(() => {
  if (leadsStore.leads.length === 0) {
    leadsStore.fetchLeads()
  }
  if (opportunitiesStore.opportunities.length === 0) {
    opportunitiesStore.fetchOpportunities()
  }
})

const getDataForAI = () => {
  const teamPerformance = salesReps.value.map((rep) => ({
    name: rep.name,
    team: rep.team,
    city: rep.city,
    leads: rep.leads,
    qualifiedLeads: rep.qualifiedLeads,
    qualifiedPercentage: rep.qualifiedPercentage,
    opportunities: rep.opportunities,
    contracts: rep.contracts,
    newCarsSoldThisQuarter: rep.newCarsSoldThisQuarter,
    conversionRate: rep.leads > 0 ? parseFloat(((rep.contracts / rep.leads) * 100).toFixed(1)) : 0
  }))
  const newCarSalesTeam = teamPerformance.filter((rep) =>
    String(rep.team || '').toLowerCase().includes('new')
  )
  const newCarSellerSource = newCarSalesTeam.length > 0 ? newCarSalesTeam : teamPerformance
  const newCarSellersThisQuarter = [...newCarSellerSource]
    .sort((a, b) => b.newCarsSoldThisQuarter - a.newCarsSoldThisQuarter)
    .slice(0, 5)
  const webSourcesForAI = [
    ...leadSources.value.map((source) => ({
      name: source.name,
      conversionRate: source.conversionRates[4] || 0,
      totalLeads: source.pipelineData[0]?.value || 0,
      wonDeals: source.pipelineData[4]?.value || 0,
      conversionRates: {
        lead: source.conversionRates[0] || 0,
        takeInCharge: source.conversionRates[1] || 0,
        qualified: source.conversionRates[2] || 0,
        offerCreated: source.conversionRates[3] || 0,
        deal: source.conversionRates[4] || 0
      }
    }))
  ]

  return {
    kpis: kpiCards.value.map(({ title, value, change, changeType, breakdown }) => ({ title, value, change, changeType, breakdown })),
    teamPerformance,
    newCarSellersThisQuarter,
    topPerformers: [...teamPerformance].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 3),
    leadSources: webSourcesForAI,
    pipeline: pipelineStages.value.map(({ name, percentage, avgTime }) => ({ name, percentage, avgTime })),
    areaPerformance: {
      leadsPerArea: leadsPerAreaData.value,
      contractsPerArea: contractsPerAreaData.value
    },
    modelsSold: volvoModelsSoldData.value,
    bdcAppointmentSummaryYesterday: bdcAppointmentSummaryYesterday.value
  }
}
</script>
