<template>
  <div class="flex max-h-96 min-h-0 flex-col overflow-hidden">
    <div
      class="flex shrink-0 items-center justify-between gap-3 px-4 py-3"
    >
      <p class="min-w-0 text-left text-base font-semibold leading-tight text-foreground">
        {{ t('requestDetail.lqfTask.assignTaskTitle') }}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        class="shrink-0 rounded-sm"
        :disabled="!currentUser || applying"
        @click="assignToSelf"
      >
        {{ t('common.assignee.assignToMe') }}
      </Button>
    </div>
    <div class="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-4">
      <div class="flex flex-col gap-4">
        <div>
          <Label class="form-label mb-2">{{ t('forms.schedule.team.label') }}</Label>
          <SelectMenu
            v-model="selectedTeamValue"
            :items="teamSelectItems"
            :placeholder="t('forms.schedule.team.placeholder')"
            value-key="value"
            class="w-full"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
        </div>
        <div>
          <Label class="form-label mb-2">{{ t('forms.schedule.assignee.label') }}</Label>
          <SelectMenu
            v-model="selectedAssigneeValue"
            :items="assigneeSelectItems"
            :placeholder="t('requestDetail.lqfTask.assigneeSelectPlaceholder')"
            value-key="value"
            class="w-full"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
        </div>
      </div>
      <Button
        type="button"
        variant="default"
        class="w-full rounded-sm"
        :disabled="!canApply || applying"
        @click="applySelection"
      >
        {{ t('requestDetail.lqfTask.applyAssignment') }}
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Label } from '@motork/component-library/future/primitives'
import { SelectMenu } from '@motork/component-library/future/components'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import { useLeadsStore } from '@/stores/leads'

const TEAM_ALL = '__all__'

const props = defineProps({
  leadId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['assigned'])

const { t } = useI18n()
const userStore = useUserStore()
const usersStore = useUsersStore()
const leadsStore = useLeadsStore()

const currentUser = computed(() => userStore.currentUser)
const assignableTeams = computed(() => usersStore.assignableTeams || [])
const assignableUsers = computed(() => usersStore.assignableUsers || [])

const selectedTeamValue = ref(TEAM_ALL)
const selectedAssigneeValue = ref(undefined)
const applying = ref(false)

const teamSelectItems = computed(() => {
  const teams = [...assignableTeams.value].sort((a, b) => a.name.localeCompare(b.name))
  return [
    { label: t('forms.schedule.team.all'), value: TEAM_ALL },
    ...teams.map((team) => ({
      label: team.dealership ? `${team.name} · ${team.dealership}` : team.name,
      value: String(team.id)
    }))
  ]
})

const assigneeSelectItems = computed(() => {
  const teamVal = selectedTeamValue.value
  const teams = assignableTeams.value
  const users = assignableUsers.value
  let selectedTeam = null
  let filtered = users
  if (teamVal && teamVal !== TEAM_ALL) {
    selectedTeam = teams.find((t) => String(t.id) === String(teamVal))
    if (selectedTeam) {
      filtered = users.filter(
        (u) => u.team === selectedTeam.name || u.teamId === selectedTeam.id
      )
    }
  }
  const opts = []
  if (selectedTeam) {
    opts.push({
      label: t('requestDetail.lqfTask.assignWholeTeam'),
      value: '__team__'
    })
  }
  const showTeamInLabel = teamVal === TEAM_ALL
  for (const u of [...filtered].sort((a, b) => a.name.localeCompare(b.name))) {
    opts.push({
      label: showTeamInLabel && u.team ? `${u.name} · ${u.team}` : u.name,
      value: `user-${u.id}`
    })
  }
  return opts
})

const canApply = computed(() => {
  const teamVal = selectedTeamValue.value
  const assignee = selectedAssigneeValue.value
  if (assignee && String(assignee).startsWith('user-')) return true
  if (assignee === '__team__') return true
  const assigneeEmpty = assignee == null || assignee === ''
  if (assigneeEmpty && teamVal && teamVal !== TEAM_ALL) return true
  return false
})

function resolveTeamForUser(user) {
  if (!user) return null
  const teams = assignableTeams.value
  return (
    teams.find((t) => t.id === user.teamId) ||
    teams.find((t) => t.name === user.team) ||
    null
  )
}

watch(selectedAssigneeValue, (v) => {
  if (v == null || v === '' || v === '__team__') return
  if (!String(v).startsWith('user-')) return
  const id = parseInt(String(v).replace(/^user-/, ''), 10)
  if (!Number.isFinite(id)) return
  const user = assignableUsers.value.find((u) => u.id === id)
  const team = resolveTeamForUser(user)
  if (team) selectedTeamValue.value = String(team.id)
})

watch(selectedTeamValue, (teamVal) => {
  const a = selectedAssigneeValue.value
  if (teamVal === TEAM_ALL) {
    if (a === '__team__') selectedAssigneeValue.value = undefined
    return
  }
  if (a == null || a === '' || a === '__team__') return
  if (!String(a).startsWith('user-')) return
  const id = parseInt(String(a).replace(/^user-/, ''), 10)
  const user = assignableUsers.value.find((u) => u.id === id)
  if (!user) {
    selectedAssigneeValue.value = undefined
    return
  }
  const team = assignableTeams.value.find((t) => String(t.id) === String(teamVal))
  if (!team) return
  const inTeam = user.team === team.name || user.teamId === team.id
  if (!inTeam) selectedAssigneeValue.value = undefined
})

function initialsFromAssigneeLabel(name) {
  if (!name || typeof name !== 'string') return '?'
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function resetForm() {
  selectedTeamValue.value = TEAM_ALL
  selectedAssigneeValue.value = undefined
}

async function assignToSelf() {
  if (!currentUser.value || applying.value) return
  applying.value = true
  try {
    const name = currentUser.value.name
    await leadsStore.updateLead(props.leadId, {
      assignee: name,
      assigneeType: 'user',
      assigneeTeam: currentUser.value.team,
      assigneeDealership: currentUser.value.dealership,
      assigneeRole: currentUser.value.role,
      assigneeInitials: initialsFromAssigneeLabel(name),
      teamId: null
    })
    resetForm()
    emit('assigned')
  } catch (err) {
    console.error('Error assigning lead to self:', err)
  } finally {
    applying.value = false
  }
}

async function assignUser(user) {
  await leadsStore.updateLead(props.leadId, {
    assignee: user.name,
    assigneeType: 'user',
    assigneeTeam: user.team,
    assigneeDealership: user.dealership,
    assigneeRole: user.role,
    assigneeInitials: initialsFromAssigneeLabel(user.name),
    teamId: null
  })
}

async function assignTeam(team) {
  await leadsStore.updateLead(props.leadId, {
    assignee: team.name,
    assigneeType: 'team',
    assigneeTeam: team.name,
    assigneeDealership: team.dealership ?? null,
    assigneeRole: null,
    assigneeInitials: initialsFromAssigneeLabel(team.name),
    teamId: team.id
  })
}

async function applySelection() {
  if (!canApply.value || applying.value) return
  const assignee = selectedAssigneeValue.value
  const teamVal = selectedTeamValue.value
  applying.value = true
  try {
    if (assignee && String(assignee).startsWith('user-')) {
      const id = parseInt(String(assignee).replace(/^user-/, ''), 10)
      const user = assignableUsers.value.find((u) => u.id === id)
      if (user) await assignUser(user)
    } else if (
      assignee === '__team__' ||
      ((assignee == null || assignee === '') && teamVal && teamVal !== TEAM_ALL)
    ) {
      const team = assignableTeams.value.find((t) => String(t.id) === String(teamVal))
      if (team) await assignTeam(team)
    }
    resetForm()
    emit('assigned')
  } catch (err) {
    console.error('Error assigning lead:', err)
  } finally {
    applying.value = false
  }
}
</script>
