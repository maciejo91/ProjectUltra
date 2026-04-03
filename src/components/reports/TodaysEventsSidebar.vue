<template>
  <div class="bg-muted rounded-xl p-1 flex flex-col shrink-0">
    <div class="bg-white rounded-lg shadow-nsc-card flex flex-col">
      <!-- Loading Skeleton -->
      <template v-if="loading">
        <div class="px-4 py-4 shrink-0">
          <div class="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div class="px-4 pb-4 space-y-3">
          <div
            v-for="n in 5"
            :key="`skeleton-${n}`"
            class="pb-3 border-b border-gray-50 last:border-0 last:pb-0"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-gray-200 rounded-lg animate-pulse shrink-0"></div>
              <div class="flex-1 min-w-0 space-y-2">
                <div class="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div class="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div class="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Actual Content -->
      <template v-else>
        <!-- Title Section -->
        <div class="px-4 py-4 shrink-0">
          <h3 class="text-lg font-medium text-foreground leading-5">Today's events</h3>
        </div>
        <div class="flex flex-col">
          <div
            v-for="(event, index) in events"
            :key="event.id"
            class="flex items-start gap-4 px-4 py-3"
            :class="index < events.length - 1 ? 'border-b border-border' : ''"
          >
            <!-- Date block: day + month (e.g. 14 FEB) -->
            <div
              class="w-14 h-14 rounded-lg bg-muted border border-border flex flex-col items-center justify-center shrink-0 text-center"
            >
              <span class="text-lg font-semibold text-foreground leading-none">{{ parseEventDate(event.date).day }}</span>
              <span class="text-sm font-medium text-muted-foreground leading-none mt-0.5">{{ parseEventDate(event.date).month }}</span>
            </div>
            <div class="flex-1 min-w-0 flex flex-col gap-0.5">
              <p class="text-sm font-semibold text-foreground">{{ event.title || event.type }}</p>
              <p class="text-sm text-muted-foreground">{{ event.name || event.customer }}</p>
              <p v-if="event.location" class="text-sm text-muted-foreground">{{ event.location }}</p>
            </div>
            <div class="shrink-0 text-sm text-muted-foreground">
              {{ event.time }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  events: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const parseEventDate = (dateString) => {
  if (!dateString) return { day: '', month: '' }
  const monthMap = {
    January: 'JAN',
    February: 'FEB',
    March: 'MAR',
    April: 'APR',
    May: 'MAY',
    June: 'JUN',
    July: 'JUL',
    August: 'AUG',
    September: 'SEP',
    October: 'OCT',
    November: 'NOV',
    December: 'DEC',
  }
  const match = String(dateString).match(/(\w+)\s+(\d+)/)
  if (match?.[1] && match?.[2]) {
    const monthName = match[1]
    const month = monthMap[monthName] || monthName.substring(0, 3).toUpperCase()
    const day = match[2]
    return { day, month }
  }
  return { day: '', month: '' }
}
</script>
