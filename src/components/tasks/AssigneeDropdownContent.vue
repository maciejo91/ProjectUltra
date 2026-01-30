<template>
  <div class="flex flex-col min-w-64 max-w-sm w-full bg-background rounded-lg shadow-nsc-card overflow-hidden">
    <div v-if="showRemoveAssignee" class="p-2 shrink-0 border-b border-border">
      <button
        type="button"
        @click="handleRemoveAssignee"
        class="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/80 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/40 focus-visible:ring-offset-2 text-muted-foreground hover:text-foreground"
      >
        <UserMinus class="w-5 h-5 shrink-0" aria-hidden="true" />
        <span class="text-sm font-medium">{{ t('common.assignee.removeAssignee') }}</span>
      </button>
    </div>
    <div class="p-2 shrink-0">
      <Input
        v-model="searchQuery"
        type="text"
        :placeholder="t('common.assignee.searchPlaceholder')"
        class="w-full h-10 min-h-10"
      />
    </div>
    <div class="max-h-96 overflow-y-auto p-2">
      <template v-if="hasAnyResults">
        <div
          v-for="section in filteredSections"
          :key="section.key"
          class="mb-3 last:mb-0"
        >
          <p class="text-xs font-medium text-muted-foreground normal-case px-2 py-1 mb-1">
            {{ section.key === 'teams' ? t('common.assignee.teamsLabel') : section.label }}
          </p>
          <div class="space-y-0.5">
            <button
              v-for="item in section.items"
              :key="`${item.type}-${item.id}`"
              type="button"
              @click="handleSelect(item)"
              class="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/80 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/40 focus-visible:ring-offset-2"
            >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
              :class="item.type === 'team' ? getTeamAvatarClass(item.name) : getTeamAvatarClass(item.team) || getRoleAvatarClass(item.role)"
            >
              <Users v-if="item.type === 'team'" class="w-3 h-3 shrink-0" />
              <span v-else>{{ item.initials || '?' }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-sm text-foreground truncate">{{ item.name }}</p>
              <p v-if="item.type === 'user'" class="text-xs text-muted-foreground truncate capitalize">
                {{ item.role }} • {{ item.email }}
              </p>
            </div>
          </button>
          </div>
        </div>
      </template>
      <div v-else class="text-center py-8">
        <Search class="w-8 h-8 shrink-0 text-muted-foreground mb-2" />
        <p class="text-sm text-muted-foreground">{{ t('common.assignee.noAssigneesFound') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Users, Search, UserMinus } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Input } from '@motork/component-library/future/primitives'
import { useUsersStore } from '@/stores/users'
import { getTeamAvatarClass } from '@/composables/useTeamAvatarColor'

const props = defineProps({
  showRemoveAssignee: {
    type: Boolean,
    default: false
  }
})
const { t } = useI18n()
const emit = defineEmits(['select'])

const usersStore = useUsersStore()
const searchQuery = ref('')

const assignableUsers = computed(() => usersStore.assignableUsers || [])
const assignableTeams = computed(() => usersStore.assignableTeams || [])

const uniqueTeamsByName = computed(() => {
  const seen = new Set()
  return assignableTeams.value.filter((team) => {
    if (seen.has(team.name)) return false
    seen.add(team.name)
    return true
  })
})

const teamNamesInOrder = computed(() => {
  const fromTeams = uniqueTeamsByName.value.map((t) => t.name)
  const fromUsers = [...new Set(assignableUsers.value.map((u) => u.team).filter(Boolean))]
  const seen = new Set(fromTeams)
  fromUsers.forEach((name) => {
    if (!seen.has(name)) {
      seen.add(name)
      fromTeams.push(name)
    }
  })
  return fromTeams
})

const sectionsWithItems = computed(() => {
  const sections = []
  const teamsAsAssignees = uniqueTeamsByName.value.map((team) => ({
    ...team,
    type: 'team',
    team: team.name
  }))
  if (teamsAsAssignees.length > 0) {
    sections.push({ key: 'teams', label: 'Teams', items: teamsAsAssignees })
  }
  teamNamesInOrder.value.forEach((teamName) => {
    const users = assignableUsers.value.filter((u) => u.team === teamName)
    if (users.length > 0) {
      sections.push({
        key: `team-${teamName}`,
        label: teamName,
        items: users.map((u) => ({ ...u, type: 'user' }))
      })
    }
  })
  return sections
})

const matchesSearch = (item, query) => {
  const q = query.toLowerCase()
  const name = (item.name || '').toLowerCase()
  const email = (item.email || '').toLowerCase()
  const role = (item.role || '').toLowerCase()
  const team = (item.team || '').toLowerCase()
  return name.includes(q) || email.includes(q) || role.includes(q) || team.includes(q)
}

const filteredSections = computed(() => {
  const q = searchQuery.value.trim()
  if (!q) return sectionsWithItems.value
  return sectionsWithItems.value
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => matchesSearch(item, q))
    }))
    .filter((section) => section.items.length > 0)
})

const hasAnyResults = computed(() => filteredSections.value.some((s) => s.items.length > 0))

function getRoleAvatarClass(role) {
  const classes = {
    manager: 'bg-primary/10 text-primary',
    salesman: 'bg-muted text-foreground',
    operator: 'bg-muted text-muted-foreground'
  }
  return classes[role] || 'bg-muted text-muted-foreground'
}

function handleRemoveAssignee() {
  emit('select', null)
}

function handleSelect(assignee) {
  const payload = assignee.type === 'team'
    ? { ...assignee, team: assignee.name, role: undefined, email: undefined, initials: undefined }
    : assignee
  emit('select', payload)
}
</script>
