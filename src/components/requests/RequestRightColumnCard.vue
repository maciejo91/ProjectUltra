<template>
  <div class="flex flex-col">
    <Tabs v-model="activeTab" class="flex flex-col gap-0">
      <TabsList class="flex shrink-0 border-0 bg-muted rounded-none w-full relative h-full">
        <TabsTrigger
          value="activity"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'activity' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Activity</span>
          <span
            v-if="activeTab === 'activity'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
        <TabsTrigger
          v-if="showAssociatedTasks"
          value="other"
          class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
          :class="activeTab === 'other' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
        >
          <span>Other requests</span>
          <span
            v-if="activeTab === 'other'"
            class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
          />
        </TabsTrigger>
      </TabsList>

      <div class="flex flex-col">
        <TabsContent value="activity" class="mt-0 data-[state=inactive]:hidden py-2 px-1">
          <TaskActivityCard
            :activities="activities"
            :expanded-summaries="expandedSummaries"
            :show-add-appointment="false"
            @activity-click="$emit('activity-click', $event)"
            @toggle-summary-expanded="$emit('toggle-summary-expanded', $event)"
            @add-activity="$emit('add-activity', $event)"
          />
        </TabsContent>

        <TabsContent
          v-if="showAssociatedTasks"
          value="other"
          class="mt-0 data-[state=inactive]:hidden py-2 px-1"
        >
          <OtherCustomerRequestsCard :task="request" link-to="request" />
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@motork/component-library/future/primitives'
import TaskActivityCard from '@/components/tasks/TaskActivityCard.vue'
import OtherCustomerRequestsCard from '@/components/tasks/OtherCustomerRequestsCard.vue'

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  showAssociatedTasks: {
    type: Boolean,
    default: false
  },
  activities: {
    type: Array,
    default: () => []
  },
  expandedSummaries: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['request-navigate', 'activity-click', 'toggle-summary-expanded', 'add-activity'])

const activeTab = ref('activity')

watch(
  () => props.showAssociatedTasks,
  (show) => {
    if (!show && activeTab.value === 'other') {
      activeTab.value = 'activity'
    }
  }
)
</script>

<style scoped>
/* Tab styling to match task detail page */
:deep([role="tablist"]) {
  border: none !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
  height: auto !important;
  min-height: 40px !important;
}

:deep([role="tab"]) {
  background: transparent !important;
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  margin: 0 !important;
  padding: 8px 16px !important;
  position: relative !important;
  box-shadow: none !important;
  height: 100% !important;
  min-height: 40px !important;
}

:deep([role="tab"]::before),
:deep([role="tab"]::after) {
  display: none !important;
  box-shadow: none !important;
}

:deep([role="tab"] *) {
  box-shadow: none !important;
}

:deep([role="tab"][data-state="active"]) {
  color: var(--color-text-foreground) !important;
  box-shadow: none !important;
}

:deep([role="tab"][data-state="inactive"]) {
  color: var(--color-text-muted-foreground) !important;
  box-shadow: none !important;
}
</style>
