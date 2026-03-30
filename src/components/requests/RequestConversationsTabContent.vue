<template>
  <div class="space-y-6">
    <div v-if="activities.length > 0" class="space-y-3 pb-6">
      <ConversationItem
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
      />
    </div>

    <RequestTabEmptyState
      v-else
      :icon="MessageCircle"
      :title="t('requestDetail.emptyStates.conversations.title')"
      :description="t('requestDetail.emptyStates.conversations.description')"
      :action-label="t('requestDetail.emptyStates.conversations.action')"
      @action="$emit('send-message')"
    />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { MessageCircle } from 'lucide-vue-next'
import ConversationItem from './ConversationItem.vue'
import RequestTabEmptyState from './RequestTabEmptyState.vue'

defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})

defineEmits(['send-message'])

const { t } = useI18n()
</script>
