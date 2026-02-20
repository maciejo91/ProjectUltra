<template>
  <div class="rounded-lg border border-border bg-card flex flex-col flex-1 min-h-0 overflow-hidden">
    <Tabs v-model="activeTab" class="flex flex-col flex-1 min-h-0">
      <TabsList class="flex shrink-0 border-b border-border bg-background rounded-none w-full flex-wrap">
        <TabsTrigger
          value="activity"
          class="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shrink-0"
        >
          Activity
        </TabsTrigger>
        <TabsTrigger
          v-if="showAssociatedTasks"
          value="other"
          class="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shrink-0"
        >
          Other requests
        </TabsTrigger>
      </TabsList>

      <TabsContent value="activity" class="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden flex flex-col min-h-0">
        <RequestActivityListCard :request="request" bare />
      </TabsContent>

      <TabsContent
        v-if="showAssociatedTasks"
        value="other"
        class="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden flex flex-col min-h-0"
      >
        <RequestAssociatedTasksCard :request="request" bare @request-navigate="$emit('request-navigate', $event)" />
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@motork/component-library/future/primitives'
import RequestActivityListCard from './RequestActivityListCard.vue'
import RequestAssociatedTasksCard from './RequestAssociatedTasksCard.vue'

const props = defineProps({
  request: {
    type: Object,
    default: null
  },
  showAssociatedTasks: {
    type: Boolean,
    default: false
  }
})

defineEmits(['request-navigate'])

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
