<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-lg max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="shrink-0">
          <DialogTitle class="text-lg">{{ title || 'Reassign' }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full">
          <p class="text-sm text-muted-foreground mb-4">
            Select a user or team to assign:
          </p>

          <div class="mb-4 w-full">
            <Input
              v-model="searchQuery"
              type="text"
              :placeholder="t('common.assignee.searchPlaceholder')"
              class="w-full h-10 min-h-10"
            />
          </div>

          <div class="space-y-0.5 max-h-96 overflow-y-auto mb-4">
            <button
              v-for="item in filteredAssignees"
              :key="`${item.type}-${item.id}`"
              type="button"
              @click="handleSelect(item)"
              class="w-full flex items-center gap-3 p-3 rounded-md transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/40 focus-visible:ring-offset-2"
              :class="selectedAssignee?.type === item.type && selectedAssignee?.id === item.id
                ? 'bg-muted/80'
                : 'hover:bg-muted/80'"
            >
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                :class="item.type === 'team' ? getTeamAvatarClass(item.name) : getTeamAvatarClass(item.team) || getRoleAvatarClass(item.role)"
              >
                <Users v-if="item.type === 'team'" class="w-4 h-4 shrink-0" />
                <span v-else>{{ item.initials }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm text-foreground truncate">{{ item.name }}</p>
                <p class="text-sm text-muted-foreground truncate capitalize">
                  {{ item.type === 'team' ? t('common.assignee.teamsLabel') : `${item.role} • ${item.email}` }}
                </p>
              </div>
              <Check v-if="selectedAssignee?.type === item.type && selectedAssignee?.id === item.id" class="w-4 h-4 shrink-0 text-muted-foreground" />
            </button>

            <div v-if="filteredAssignees.length === 0" class="text-center py-8">
              <Search class="w-8 h-8 shrink-0 text-muted-foreground mb-2" />
              <p class="text-sm text-muted-foreground">{{ t('common.assignee.noAssigneesFound') }}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            @click="$emit('close')"
          >
            {{ t('common.buttons.cancel') }}
          </Button>
          <Button
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            @click="handleRemoveAssignee"
          >
            {{ t('common.assignee.removeAssignee') }}
          </Button>
          <Button
            variant="default"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            :disabled="!selectedAssignee"
            @click="handleConfirm"
          >
            {{ confirmLabel || 'Reassign' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Users, Check, Search } from 'lucide-vue-next'
import { Button, Input } from '@motork/component-library/future/primitives'
import { useUsersStore } from '@/stores/users'
import { getTeamAvatarClass } from '@/composables/useTeamAvatarColor'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Reassign'
  },
  confirmLabel: {
    type: String,
    default: 'Reassign'
  }
})

const emit = defineEmits(['close', 'confirm'])
const { t } = useI18n()

defineOptions({
  inheritAttrs: false
})

const usersStore = useUsersStore()
const selectedAssignee = ref(null)
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

const allAssignees = computed(() => {
  const teams = uniqueTeamsByName.value.map((team) => ({
    ...team,
    type: 'team'
  }))
  const users = assignableUsers.value.map((user) => ({
    ...user,
    type: 'user'
  }))
  return [...teams, ...users]
})

// Filter based on search query
const filteredAssignees = computed(() => {
  if (!searchQuery.value.trim()) {
    return allAssignees.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return allAssignees.value.filter(item => {
    const name = item.name.toLowerCase()
    const email = item.email?.toLowerCase() || ''
    const role = item.role?.toLowerCase() || ''
    const type = item.type.toLowerCase()
    
    return name.includes(query) || 
           email.includes(query) || 
           role.includes(query) ||
           type.includes(query)
  })
})

const getRoleAvatarClass = (role) => {
  const classes = {
    manager: 'bg-primary/10 text-primary',
    salesman: 'bg-muted text-foreground',
    operator: 'bg-muted text-muted-foreground'
  }
  return classes[role] || 'bg-muted text-muted-foreground'
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}

watch(() => props.show, (newVal) => {
  if (!newVal) {
    selectedAssignee.value = null
    searchQuery.value = ''
  }
})

const handleSelect = (assignee) => {
  selectedAssignee.value = assignee
}

const handleConfirm = () => {
  if (selectedAssignee.value) {
    emit('confirm', selectedAssignee.value)
    selectedAssignee.value = null
    searchQuery.value = ''
  }
}

const handleRemoveAssignee = () => {
  emit('confirm', null)
  selectedAssignee.value = null
  searchQuery.value = ''
  emit('close')
}
</script>

