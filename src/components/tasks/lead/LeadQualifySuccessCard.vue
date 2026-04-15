<template>
  <div class="w-full min-w-0 shrink-0 pt-1">
    <div
      class="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 shadow-sm"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
        >
          <Check class="size-4 shrink-0 text-primary" aria-hidden="true" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-foreground">
            {{ t('requestDetail.qualifySuccess.title') }}
          </p>
          <p
            v-for="(line, idx) in bodyLines"
            :key="idx"
            class="mt-1 text-sm text-muted-foreground"
          >
            {{ line }}
          </p>
          <div class="mt-4 flex justify-end">
            <RouterLink
              class="inline-flex text-sm font-medium text-primary hover:underline"
              :to="opportunityDetailRoute"
            >
              {{ t('requestDetail.qualifySuccess.viewOpportunity') }}
            </RouterLink>
          </div>
        </div>
      </div>
      <div
        v-if="actorName || performedAtLabel"
        class="flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground"
      >
        <span v-if="actorName">{{ t('requestDetail.lqOutcome.updatedBy', { name: actorName }) }}</span>
        <span v-if="performedAtLabel" class="tabular-nums">{{ performedAtLabel }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Check } from 'lucide-vue-next'
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { formatDate, formatTime } from '@/utils/formatters'
import { formatLqPerformedAtLabel } from '@/utils/lqOutcomeSummaryFormat'

const props = defineProps({
  opportunity: {
    type: Object,
    required: true
  },
  actorName: {
    type: String,
    default: ''
  },
  performedAt: {
    type: [Date, String, Number],
    default: null
  }
})

const route = useRoute()
const { t } = useI18n()

function vehicleLabelFromOpportunity(opp) {
  const car = opp?.requestedCar || opp?.vehicle
  if (!car) return t('requestDetail.duplicates.noVehicle')
  const label = `${car.brand || ''} ${car.model || ''}`.trim()
  return label || t('requestDetail.duplicates.noVehicle')
}

const recapLines = computed(() => {
  const opp = props.opportunity
  if (!opp) return []
  const vehicle = vehicleLabelFromOpportunity(opp)
  const lines = [t('requestDetail.qualifySuccess.recapVehicle', { vehicle })]
  const sa = opp.scheduledAppointment
  const start = sa?.start
  if (start) {
    const d = new Date(start)
    lines.push(
      t('requestDetail.qualifySuccess.recapAppointment', {
        date: formatDate(d),
        time: formatTime(d)
      })
    )
  }
  if (sa?.type) {
    lines.push(t('requestDetail.qualifySuccess.recapMeetingType', { type: sa.type }))
  }
  let withName = ''
  if (sa) {
    if (typeof sa.salesperson === 'string' && sa.salesperson) {
      withName = sa.salesperson
    } else if (sa.salesperson && typeof sa.salesperson === 'object' && sa.salesperson.name) {
      withName = sa.salesperson.name
    }
    if (!withName) {
      withName =
        (typeof sa.assignee === 'string' && sa.assignee) || sa.team || ''
    }
  }
  if (withName) {
    lines.push(t('requestDetail.qualifySuccess.recapMeetingWith', { name: withName }))
  }
  return lines
})

const bodyLines = computed(() => [
  t('requestDetail.qualifySuccess.subtitle'),
  ...recapLines.value
])

const performedAtLabel = computed(() => formatLqPerformedAtLabel(props.performedAt))

const opportunityDetailRoute = computed(() => {
  const id = props.opportunity?.id
  const fromQ = route.query.from
  const from = fromQ != null && String(fromQ) !== '' ? String(fromQ) : 'requests'
  if (id == null) {
    return { path: '/requests', query: { type: 'opportunity', from } }
  }
  return {
    path: `/requests/${id}`,
    query: { type: 'opportunity', from }
  }
})
</script>
