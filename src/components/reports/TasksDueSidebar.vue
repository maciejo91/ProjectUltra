<template>
  <div class="bg-muted rounded-xl p-1 flex flex-col">
    <div class="bg-white rounded-lg shadow-nsc-card flex flex-col">
      <!-- Loading Skeleton -->
      <template v-if="loading">
        <div class="px-4 py-4 pb-4">
          <div class="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div class="flex flex-col">
          <div
            v-for="n in 5"
            :key="`skeleton-${n}`"
            class="flex items-start gap-4 px-4 py-3 border-b border-border last:border-0"
          >
            <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse shrink-0"></div>
            <div class="flex-1 min-w-0 space-y-2">
              <div class="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div class="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div class="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
            </div>
            <div class="shrink-0 space-y-1">
              <div class="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
              <div class="h-2 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Actual Content -->
      <template v-else>
        <!-- Title Section -->
        <div class="px-4 py-4 flex items-center gap-2 shrink-0">
          <CheckSquare :size="16" class="text-foreground" />
          <h3 class="text-lg font-medium text-foreground leading-5">Tasks due</h3>
        </div>
        
        <div class="flex flex-col">
          <div
            v-for="(task, index) in tasks"
            :key="task.id"
            class="flex items-start gap-4 px-4 py-3"
            :class="index < tasks.length - 1 ? 'border-b border-border' : ''"
          >
            <!-- Dealership Avatar -->
            <Avatar class="h-8 w-8 shrink-0">
              <AvatarFallback class="bg-greys-300 text-foreground text-sm">
                {{ getInitials(task.dealershipName) }}
              </AvatarFallback>
            </Avatar>

            <!-- Task Details -->
            <div class="flex flex-col gap-1 min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-foreground">{{ task.customerName }}</p>
                <Badge v-if="task.isExpired" variant="error" size="sm">Expired</Badge>
              </div>
              <p class="text-sm text-foreground">{{ task.car }}</p>
              <p class="text-sm text-muted-foreground">{{ task.dealershipName }}</p>
            </div>

            <!-- Due Time -->
            <div class="shrink-0 text-right">
              <div class="text-sm font-medium text-foreground">{{ task.dueTime }}</div>
              <div class="text-sm text-muted-foreground">{{ formatDate(task.dueDate) }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { CheckSquare } from 'lucide-vue-next'
import { Avatar, AvatarFallback, Badge } from '@motork/component-library/future/primitives'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (dateString) => {
  // Format: "14 FEB" from date string
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
  return `${day} ${month}`
}
</script>
