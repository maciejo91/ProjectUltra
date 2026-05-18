<template>
  <div class="flex flex-col gap-6">
    <template v-for="group in groups" :key="group.key">
      <div class="flex flex-col gap-2" :class="group.key === 'sales' ? 'mt-2' : ''">
        <p class="text-sm font-medium text-foreground">
          {{ groupHeading(group.key, group.items.length) }}
        </p>
        <div class="flex flex-col gap-1.5">
          <component
            :is="interactive ? 'button' : 'div'"
            v-for="item in group.items"
            :key="item.compositeId"
            :type="interactive ? 'button' : undefined"
            class="w-full min-w-0 rounded-md border border-border bg-muted/20 p-2 text-left"
            :class="interactive ? 'transition-colors hover:bg-muted/40' : ''"
            @click="interactive && emit('select', item)"
          >
            <div class="flex w-full min-w-0 items-center gap-2">
              <div class="flex shrink-0 flex-wrap items-center gap-1.5">
                <Badge
                  variant="secondary"
                  class="h-5 px-1.5 py-0 text-sm font-medium leading-none"
                  :class="badgeClass(item.type)"
                >
                  {{ badgeLabel(item.type) }}
                </Badge>
                <Badge
                  v-if="isSales(item.type) && item.stage"
                  variant="secondary"
                  class="h-5 px-1.5 py-0 text-sm font-medium leading-none"
                  :class="stageBadgeClass(item.stage)"
                >
                  {{ formatStageLabel(item.stage) }}
                </Badge>
              </div>

              <span
                v-if="isSales(item.type) && sourceDisplay(item)"
                class="max-w-28 min-w-0 shrink truncate text-sm leading-none text-muted-foreground sm:max-w-40"
              >
                {{ sourceDisplay(item) }}
              </span>

              <div class="min-w-0 flex-1">
                <span class="block min-w-0 truncate text-sm leading-none text-muted-foreground">
                  {{ primaryVehicleLine(item) }}
                </span>
              </div>

              <div class="hidden min-w-0 shrink truncate text-sm leading-none text-muted-foreground/80 sm:block">
                <span v-if="item.dealership">{{ item.dealership }}</span>
                <span v-else>—</span>
                <span aria-hidden="true" class="mx-2 text-muted-foreground/60">·</span>
                <span class="tabular-nums">{{ item.createdMonthYear || '—' }}</span>
              </div>

              <div
                class="flex min-w-0 shrink items-center gap-2 text-sm leading-none text-muted-foreground/80 sm:hidden"
              >
                <span v-if="item.dealership" class="min-w-0 max-w-full truncate">{{ item.dealership }}</span>
                <span v-else class="shrink-0">—</span>
                <span aria-hidden="true" class="shrink-0 text-muted-foreground/60">·</span>
                <span class="shrink-0 tabular-nums">{{ item.createdMonthYear || '—' }}</span>
              </div>

              <div class="shrink-0">
                <TooltipProvider v-if="item.assigneeName" :delay-duration="200">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <div
                        class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 p-0.5 cursor-default"
                        :class="assigneeAvatarClass(item.assigneeName, item)"
                        aria-label="Assignee"
                      >
                        <span class="text-[10px] font-medium leading-none">
                          {{ assigneeInitials(item.assigneeName) }}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end" class="max-w-xs">
                      {{ assigneeTooltip(item.assigneeName, item) }}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div
                  v-else
                  class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 p-0.5 bg-muted text-muted-foreground"
                  aria-label="Unassigned"
                >
                  <span class="text-[10px] font-medium leading-none">—</span>
                </div>
              </div>
            </div>
          </component>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@motork/component-library/future/primitives'
import { buildContactHistoryGroups } from '@/composables/contactHistoryGroups'
import { useUsersStore } from '@/stores/users'

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  interactive: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['select'])

const { t } = useI18n()
const usersStore = useUsersStore()

const groups = computed(() => buildContactHistoryGroups(props.rows))

function groupHeading(key, count) {
  if (key === 'sales') return t('customerProfile.rightColumn.groupSales', { count })
  return t('customerProfile.rightColumn.groupServices', { count })
}

function badgeLabel(type) {
  if (type === 'lead') return t('customerProfile.rightColumn.typeLead')
  if (type === 'service') return t('customerProfile.rightColumn.typeService')
  return t('customerProfile.rightColumn.typeOpportunity')
}

function badgeClass(type) {
  if (type === 'lead') return 'bg-badge-green text-emerald-700'
  if (type === 'service') return 'bg-muted text-foreground'
  return 'bg-purple-50 text-purple-700'
}

function assigneeInitials(name) {
  if (!name) return '?'
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function resolveAssigneeTeam(assigneeName, item) {
  const user = usersStore.users?.find((u) => u.name === assigneeName)
  return user?.team || item?.assigneeTeam || item?.team || ''
}

function resolveAssigneeRole(assigneeName, item) {
  const user = usersStore.users?.find((u) => u.name === assigneeName)
  return user?.role || item?.assigneeRole || 'salesman'
}

function assigneeAvatarClass(assigneeName, item) {
  const role = resolveAssigneeRole(assigneeName, item)
  const classes = {
    manager: 'bg-blue-100 text-blue-700',
    salesman: 'bg-purple-100 text-purple-700',
    operator: 'bg-orange-100 text-orange-700'
  }
  return classes[role] || 'bg-muted text-muted-foreground'
}

function assigneeTooltip(assigneeName, item) {
  const team = resolveAssigneeTeam(assigneeName, item)
  return team ? `${assigneeName} • ${team}` : assigneeName
}

const STAGE_I18N_KEYS = {
  Open: 'open',
  Qualified: 'qualified',
  Validated: 'validated',
  'Not Valid': 'notValid',
  'Not Interested': 'notInterested',
  'Closed Failed': 'closedFailed',
  'In Negotiation': 'inNegotiation',
  'Closed Won': 'closedWon',
  'Closed Lost': 'closedLost',
  Abandoned: 'abandoned'
}

function isSales(type) {
  return type === 'lead' || type === 'opportunity'
}

function formatStageLabel(stage) {
  const key = STAGE_I18N_KEYS[stage]
  if (key) return t(`customerProfile.rightColumn.stages.${key}`)
  return stage
}

function stageBadgeClass(stage) {
  if (!stage) return 'bg-muted text-muted-foreground'
  const slug = STAGE_I18N_KEYS[stage]
  if (slug === 'qualified' || slug === 'validated') {
    return 'bg-primary/10 text-primary border border-primary/20'
  }
  if (slug === 'inNegotiation') {
    return 'bg-muted text-foreground border border-border'
  }
  return 'bg-muted text-muted-foreground border border-transparent'
}

function sourceDisplay(item) {
  const s = item?.sourceDetail
  return typeof s === 'string' && s.trim() ? s.trim() : ''
}

function primaryVehicleLine(item) {
  if (item?.vehicleDisplayLine) return item.vehicleDisplayLine
  const base = item?.titleWithYear || item?.title || '—'
  if (isSales(item?.type) && item?.subtitle) {
    return `${base} · ${item.subtitle}`
  }
  return base
}
</script>
