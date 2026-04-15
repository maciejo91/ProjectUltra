<template>
  <div class="flex flex-col gap-3">
    <template v-for="group in groups" :key="group.key">
      <p class="text-sm font-medium text-foreground">
        {{ groupHeading(group.key, group.items.length) }}
      </p>
      <div class="flex flex-col gap-1.5">
        <button
          v-for="item in group.items"
          :key="item.compositeId"
          type="button"
          class="flex w-full min-w-0 items-start justify-between gap-2 rounded-md border border-border bg-muted/20 p-2 text-left transition-colors hover:bg-muted/40"
          @click="emit('select', item)"
        >
          <div class="min-w-0 flex-1">
            <span class="text-sm font-medium leading-tight text-foreground">{{ item.title }}</span>
            <span v-if="item.subtitle" class="mt-0.5 block text-sm text-muted-foreground">{{
              item.subtitle
            }}</span>
          </div>
          <div class="flex shrink-0 flex-col items-end gap-0.5 text-right">
            <Badge
              variant="secondary"
              class="h-5 px-1.5 py-0 text-sm font-medium leading-none"
              :class="badgeClass(item.type)"
            >
              {{ badgeLabel(item.type) }}
            </Badge>
            <span class="text-sm leading-none text-muted-foreground">{{ item.stage }}</span>
          </div>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Badge } from '@motork/component-library/future/primitives'
import { buildContactHistoryGroups } from '@/composables/contactHistoryGroups'

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select'])

const { t } = useI18n()

const groups = computed(() => buildContactHistoryGroups(props.rows))

function groupHeading(key, count) {
  if (key === 'lead') return t('customerProfile.rightColumn.groupLeads', { count })
  if (key === 'opportunity') {
    return t('customerProfile.rightColumn.groupOpportunities', { count })
  }
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
</script>
