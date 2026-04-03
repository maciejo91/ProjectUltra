<template>
  <Card class="mb-6 shadow-mk-dashboard-card">
    <CardHeader class="border-b border-border bg-muted/50 p-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <i v-if="icon" :class="[icon, 'text-muted-foreground text-sm']"></i>
          <CardTitle class="text-sm font-medium text-foreground">{{ title }}</CardTitle>
          <Badge
            v-if="count !== undefined && count > 0"
            :text="String(count)"
            size="small"
            :class="countColorClass"
          />
        </div>
        <div class="flex items-center gap-2">
          <slot name="header-actions" />
          <Button
            v-if="showAddButton"
            @click.stop="$emit('add')"
            variant="ghost"
            size="small"
            class="flex items-center gap-1"
            :class="addButtonColorClass"
          >
            <PlusCircle class="w-3 h-3 shrink-0" />
            {{ addButtonLabel || 'Add' }}
          </Button>
        </div>
      </div>
    </CardHeader>
    
    <CardContent v-if="hasEmptyState" class="p-6 text-center text-muted-foreground">
      <slot name="empty-state">
        <Inbox class="w-6 h-6 shrink-0 mb-2 text-muted-foreground opacity-50" />
        <p class="text-base text-muted-foreground">{{ emptyStateMessage || 'No items found' }}</p>
      </slot>
    </CardContent>
    
    <CardContent v-else class="p-4">
      <slot name="content" />
    </CardContent>
  </Card>
</template>

<script setup>
import { PlusCircle, Inbox } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@motork/component-library/future/primitives'

defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  count: {
    type: Number,
    default: undefined
  },
  countColorClass: {
    type: String,
    default: ''
  },
  showAddButton: {
    type: Boolean,
    default: false
  },
  addButtonLabel: {
    type: String,
    default: 'Add'
  },
  addButtonColorClass: {
    type: String,
    default: ''
  },
  emptyStateMessage: {
    type: String,
    default: ''
  },
  hasEmptyState: {
    type: Boolean,
    default: false
  }
})

defineEmits(['add'])
</script>
