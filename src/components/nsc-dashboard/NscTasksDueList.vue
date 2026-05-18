<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Avatar, AvatarFallback, Badge } from '@motork/component-library/future/primitives'
import { formatDueDateRelative, getDeadlineStatus } from '@/utils/formatters'
import { getTaskDisplayTitle } from '@/utils/taskActionTitle'
import { useHideNavigation } from '@/composables/useHideNavigation'

const { t } = useI18n()
const { hideNavigation } = useHideNavigation()

const props = defineProps({
  tasks: { type: Array, required: true },
  title: { type: String, default: undefined },
  limit: { type: Number, default: 5 }
})

const limitedTasks = computed(() => props.tasks.slice(0, props.limit))
const getInitials = (name) =>
  (name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const getTaskDueDate = (task) =>
  task.type === 'opportunity' && task.expectedCloseDate
    ? task.expectedCloseDate
    : task.nextActionDue ?? task.dueDate

const getTaskRoute = (task) => ({
  path: `/requests/${task.id}`,
  query: { type: task.type, from: 'home' }
})

const getTaskTitle = (task) => getTaskDisplayTitle(task) || t('home.nscDashboard.taskFallback')

const getCustomerName = (task) =>
  task.customer?.name || task.customer?.email?.split('@')[0] || t('home.nscDashboard.unknownCustomer')

const getVehicleLabel = (task) => {
  const vehicle = task.type === 'lead' ? task.requestedCar : task.vehicle || task.requestedCar
  if (!vehicle) return t('home.nscDashboard.noVehicle')
  return [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || t('home.nscDashboard.noVehicle')
}

const getAssigneeName = (task) => task.assignee || t('dataTable.tasks.values.unassigned')

const isOverdue = (task) => {
  const dueDate = getTaskDueDate(task)
  return dueDate ? getDeadlineStatus(dueDate).type === 'overdue' : false
}

const getDueDateLabel = (task) => {
  const dueDate = getTaskDueDate(task)
  return dueDate ? formatDueDateRelative(dueDate) : t('dataTable.tasks.values.notSet')
}

const rowClass = (index) =>
  [
    'flex items-start gap-4 px-4 py-3',
    index < limitedTasks.value.length - 1 ? 'border-b border-black/5' : ''
  ].join(' ')
</script>

<template>
  <div class="flex flex-col" data-section="tasks-due">
    <div class="flex flex-col rounded-lg bg-white shadow-mk-dashboard-card">
      <div class="flex items-center justify-between px-4 py-4">
        <h3 class="text-lg font-medium leading-5 text-greys-500">
          {{ title || t('home.nscDashboard.tasksDue') }}
        </h3>
      </div>

      <div class="flex flex-col">
        <template v-for="(task, index) in limitedTasks" :key="task.id">
          <RouterLink
            v-if="!hideNavigation"
            :to="getTaskRoute(task)"
            :class="rowClass(index)"
          >
            <Avatar class="h-8 w-8 shrink-0">
              <AvatarFallback class="bg-greys-300! text-greys-900">
                {{ getInitials(getCustomerName(task)) }}
              </AvatarFallback>
            </Avatar>

            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <div class="flex items-center gap-2">
                <p class="truncate text-sm font-semibold text-greys-900">{{ getTaskTitle(task) }}</p>
                <Badge v-if="isOverdue(task)" variant="error" size="sm">
                  {{ t('dataTable.tasks.statuses.overdue') }}
                </Badge>
              </div>
              <p class="truncate text-sm text-greys-700">{{ getCustomerName(task) }} · {{ getVehicleLabel(task) }}</p>
              <p class="truncate text-sm text-greys-500">{{ getAssigneeName(task) }}</p>
            </div>

            <div class="flex shrink-0 flex-col items-end gap-0.5">
              <div class="max-w-24 text-right text-sm font-medium text-greys-900">{{ getDueDateLabel(task) }}</div>
              <div class="text-xs text-greys-500">{{ task.type === 'lead' ? t('home.nscDashboard.lead') : t('home.nscDashboard.opportunity') }}</div>
            </div>
          </RouterLink>
          <div
            v-else
            :class="rowClass(index)"
          >
            <Avatar class="h-8 w-8 shrink-0">
              <AvatarFallback class="bg-greys-300! text-greys-900">
                {{ getInitials(getCustomerName(task)) }}
              </AvatarFallback>
            </Avatar>

            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <div class="flex items-center gap-2">
                <p class="truncate text-sm font-semibold text-greys-900">{{ getTaskTitle(task) }}</p>
                <Badge v-if="isOverdue(task)" variant="error" size="sm">
                  {{ t('dataTable.tasks.statuses.overdue') }}
                </Badge>
              </div>
              <p class="truncate text-sm text-greys-700">{{ getCustomerName(task) }} · {{ getVehicleLabel(task) }}</p>
              <p class="truncate text-sm text-greys-500">{{ getAssigneeName(task) }}</p>
            </div>

            <div class="flex shrink-0 flex-col items-end gap-0.5">
              <div class="max-w-24 text-right text-sm font-medium text-greys-900">{{ getDueDateLabel(task) }}</div>
              <div class="text-xs text-greys-500">{{ task.type === 'lead' ? t('home.nscDashboard.lead') : t('home.nscDashboard.opportunity') }}</div>
            </div>
          </div>
        </template>

        <div v-if="limitedTasks.length === 0" class="px-4 py-6 text-sm text-greys-500">
          {{ t('home.nscDashboard.noTasksDue') }}
        </div>
      </div>
    </div>
  </div>
</template>
