<template>
  <div
    class="order-2 flex min-h-0 min-w-0 w-full shrink-0 flex-col gap-4 overflow-x-hidden lg:sticky lg:top-0 lg:w-1/4 lg:shrink-0 lg:self-start lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:overscroll-contain"
  >
    <CustomerContactDetailsCard
      :customer="customer"
      :account="account"
      :cars="cars"
      :leads="leads"
      :opportunities="opportunities"
      :requests-loading="requestsLoading"
      :loading="loading"
    />

    <div
      class="flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-background p-4"
    >
      <div class="flex w-full min-w-0 items-center gap-2">
        <h3 class="min-w-0 flex-1 text-base font-medium leading-6 text-foreground">
          {{ t('customerProfile.rightColumn.appointments') }}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="small"
          class="h-7 shrink-0 gap-1 rounded-md px-2 text-sm font-medium"
          @click="$emit('add-appointment')"
        >
          {{ t('customerProfile.rightColumn.addAppointment') }}
        </Button>
      </div>
      <div class="flex flex-col gap-2">
        <template v-if="upcomingAppointmentsList.length">
          <UpcomingAppointments
            v-for="app in upcomingAppointmentsList"
            :key="app.id"
            :title="app.title"
            :date="formatDate(app.start)"
            :location="app.location"
            :customer-name="app.customerName || app.customer"
            :vehicle="app.vehicle"
          />
        </template>
        <p v-else class="w-full rounded-lg bg-muted p-2 text-sm leading-5 text-muted-foreground">
          {{ t('customerProfile.rightColumn.noAppointments') }}
        </p>
      </div>
    </div>

    <div
      class="flex flex-col gap-3 overflow-hidden rounded-lg border border-border bg-background p-4"
    >
      <div class="flex w-full min-w-0 items-center gap-2">
        <h3 class="min-w-0 flex-1 text-base font-medium leading-6 text-foreground">
          {{ t('customerProfile.rightColumn.recentActivity') }}
        </h3>
        <Button
          type="button"
          variant="outline"
          size="small"
          class="h-7 shrink-0 gap-1 rounded-md px-2 text-sm font-medium"
          @click="$emit('add-activity')"
        >
          {{ t('customerProfile.activityFeed.add') }}
        </Button>
      </div>
      <ActivityFeed :activities="activities" variant="nested" :show-heading="false" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@motork/component-library/future/primitives'
import CustomerContactDetailsCard from './CustomerContactDetailsCard.vue'
import UpcomingAppointments from './UpcomingAppointments.vue'
import ActivityFeed from './ActivityFeed.vue'

const props = defineProps({
  customer: { type: Object, default: null },
  account: { type: Object, default: null },
  cars: { type: Array, default: () => [] },
  appointments: { type: Array, default: () => [] },
  activities: { type: Array, default: () => [] },
  leads: { type: Array, default: () => [] },
  opportunities: { type: Array, default: () => [] },
  requestsLoading: { type: Boolean, default: false },
  loading: { type: Boolean, default: false }
})

defineEmits(['add-appointment', 'add-activity'])

const { t } = useI18n()

const upcomingAppointmentsList = computed(() => {
  const now = new Date()
  return [...(props.appointments || [])]
    .filter((app) => new Date(app.start || 0) >= now)
    .sort((a, b) => new Date(a.start || 0).getTime() - new Date(b.start || 0).getTime())
})

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}
</script>
