<template>
  <div class="today-feed">
    <template v-if="loading">
      <div v-for="n in 3" :key="`skeleton-${n}`" class="flex items-start gap-3 py-3">
        <div class="timeline-slot shrink-0">
          <div class="h-9 w-14 shrink-0 rounded bg-muted/80 animate-pulse" />
        </div>
        <div class="flex-1 min-w-0 rounded-lg border border-border bg-muted p-4">
          <div class="space-y-2">
            <div class="h-4 w-3/4 rounded bg-muted-foreground/20 animate-pulse" />
            <div class="h-3 w-1/2 rounded bg-muted-foreground/20 animate-pulse" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div
        v-if="items.length === 0"
        class="rounded-lg border border-border bg-muted/50 p-8 text-center"
      >
        <CalendarClock class="mx-auto mb-2 size-10 shrink-0 text-muted-foreground/50" />
        <p class="text-sm font-medium text-muted-foreground">Nothing scheduled for today</p>
      </div>

      <div v-else class="relative">
        <!-- Timeline vertical line (centered through the dot column) -->
        <div
          class="timeline-track absolute left-7 top-4 bottom-4 w-px -translate-x-1/2 bg-border"
          aria-hidden="true"
        />
        <div class="space-y-0">
          <button
            v-for="(item, idx) in items"
            :key="item.id"
            type="button"
            class="group flex w-full items-start gap-3 rounded-lg py-3 text-left transition-colors hover:bg-muted/30 -mx-2 px-2"
            :class="{ 'rounded-t-none': idx === 0 && items.length > 1 }"
            @click="handleClick(item)"
          >
            <div class="timeline-slot relative z-10 flex shrink-0 flex-col items-center gap-0.5 w-14">
              <span
                class="text-xs font-medium tabular-nums text-muted-foreground"
              >
                {{ item.time }}
              </span>
              <div
                class="mt-1 size-3 shrink-0 rounded-full border-2 border-background ring-2"
                :class="getNodeRingClass(item)"
              />
            </div>
            <div class="flex min-w-0 flex-1 flex-col gap-1">
              <div class="flex items-center gap-2">
                <component
                  :is="item.kind === 'appointment' ? CalendarCheck : ListTodo"
                  class="size-3.5 shrink-0 text-muted-foreground"
                />
                <p class="truncate text-sm font-medium text-foreground">
                  {{ item.title }}
                </p>
              </div>
              <p class="truncate text-xs text-muted-foreground">
                {{ item.subtitle }}
              </p>
              <div class="flex flex-wrap gap-1.5">
                <Badge
                  :text="item.typeLabel"
                  size="small"
                  variant="outline"
                  :theme="item.typeTheme"
                />
                <Badge
                  v-if="item.extraLabel"
                  :text="item.extraLabel"
                  size="small"
                  :theme="item.extraTheme"
                />
              </div>
            </div>
            <ChevronRight class="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { CalendarClock, CalendarCheck, ListTodo, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { Badge } from '@motork/component-library/future/primitives'

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

function getNodeRingClass(item) {
  const now = Date.now()
  const itemTime = item.sortTime || 0
  const hoursUntil = (itemTime - now) / (1000 * 60 * 60)
  if (item.isOverdue || hoursUntil < 0) return 'ring-destructive/60 bg-destructive'
  if (hoursUntil < 2) return 'ring-orange-500/60 bg-orange-500'
  return 'ring-primary/50 bg-primary'
}

function handleClick(item) {
  if (item.kind === 'appointment') {
    if (item.opportunityId) {
      router.push(`/tasks/${item.opportunityId}?type=opportunity`)
    } else if (item.leadId) {
      router.push(`/tasks/${item.leadId}?type=lead`)
    } else {
      router.push('/calendar')
    }
  } else {
    router.push(`/tasks/${item.id}?type=${item.type}`)
  }
}
</script>
