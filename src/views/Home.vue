<template>
  <div class="page-container flex flex-col min-h-0">
    <div class="flex-1 overflow-y-auto px-6 pb-8 md:pb-10 lg:pb-12 min-h-0">
      <!-- Main Content Grid - 2/3 vs 1/3 starting from top -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
        
        <!-- Left Column - Main Content (2/3 width) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Today Card -->
          <Card class="border border-border flex flex-col overflow-hidden shadow-mk-dashboard-card">
            <CardHeader class="shrink-0 flex flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <CardTitle class="text-sm font-medium leading-5">Today</CardTitle>
                <Badge
                  v-if="todayItems.length > 0"
                  :text="String(todayItems.length)"
                  size="small"
                  theme="blue"
                />
              </div>
              <div class="flex items-center gap-1">
                <Button
                  label="Tasks"
                  variant="ghost"
                  size="small"
                  @click="$router.push('/tasks')"
                  class="text-sm"
                />
                <Button
                  label="Calendar"
                  variant="ghost"
                  size="small"
                  @click="$router.push('/calendar')"
                  class="text-sm"
                />
              </div>
            </CardHeader>
            <CardContent class="pt-0">
              <TodayFeed :items="todayItems" :loading="loadingToday" />
            </CardContent>
          </Card>

          <!-- Quick Actions Widget -->
          <Card class="border border-border flex flex-col overflow-hidden shadow-mk-dashboard-card">
            <CardHeader class="shrink-0 flex flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <CardTitle class="text-sm font-medium leading-5">Quick Actions</CardTitle>
                <Badge
                  v-if="totalNotificationsCount > 0"
                  :text="String(totalNotificationsCount)"
                  size="small"
                  theme="blue"
                />
              </div>
              <Button
                v-if="totalNotificationsCount > 5"
                label="View all →"
                variant="ghost"
                size="small"
                @click="$router.push('/tasks')"
                class="text-sm"
              />
            </CardHeader>
            <CardContent class="flex flex-col pt-0">
              <div class="space-y-3">
                <!-- Loading Skeleton -->
                <template v-if="loadingNotifications">
                  <div v-for="n in 3" :key="`skeleton-${n}`" class="bg-muted border border-border rounded-lg p-4">
                    <div class="space-y-2">
                      <div class="h-4 bg-surfaceTertiary rounded w-3/4 animate-pulse"></div>
                      <div class="h-3 bg-surfaceTertiary rounded w-1/2 animate-pulse"></div>
                      <div class="flex gap-2 mt-3">
                        <div class="h-8 bg-surfaceTertiary rounded flex-1 animate-pulse"></div>
                        <div class="h-8 bg-surfaceTertiary rounded flex-1 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </template>
                
                <!-- Actual Content -->
                <template v-else>
                  <div v-if="notifications.length === 0" class="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                    <CheckCircle class="w-10 h-10 shrink-0 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p class="text-sm font-medium">All caught up!</p>
                    <p class="text-sm mt-1">No quick actions needed</p>
                  </div>
                  <ActionableQuestionCard
                    v-for="question in notifications.slice(0, 5)"
                    :key="question.id"
                    :question="question"
                    @answer-yes="handleAnswerYes"
                    @answer-no="handleAnswerNo"
                    @reassign="handleReassign"
                    @view-task="handleViewTask"
                    @dismiss="handleDismiss"
                  />
                </template>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <!-- Right Column - Sidebar (1/3 width) -->
        <div class="space-y-6">
          <PerformanceWidget />
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <ReassignUserModal
      :show="showReassignModal"
      @close="showReassignModal = false"
      @confirm="handleReassignConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue'
import { CheckCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useActionableQuestions } from '@/composables/useActionableQuestions'
import { useDashboard } from '@/composables/useDashboard'
import { createNSTask, updateOpportunityAssignee } from '@/api/opportunities'
import { saveDismissal } from '@/utils/dismissalStorage'
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@motork/component-library/future/primitives'
import ActionableQuestionCard from '@/components/home/ActionableQuestionCard.vue'
import ReassignUserModal from '@/components/modals/ReassignUserModal.vue'
import TodayFeed from '@/components/home/TodayFeed.vue'
import PerformanceWidget from '@/components/home/PerformanceWidget.vue'

const router = useRouter()
const userStore = useUserStore()
const headerActionsRef = inject('headerActionsRef', null)

const { dismissQuestion, addFollowUpQuestion } = useActionableQuestions()
const { 
  notifications, 
  totalNotificationsCount, 
  todayItems, 
  loadingNotifications,
  loadingToday,
  loadDashboard 
} = useDashboard()

const showReassignModal = ref(false)
const currentQuestion = ref(null)

onMounted(async () => {
  if (headerActionsRef) {
    headerActionsRef.value = {
      type: 'home',
      onRefresh: loadDashboard,
      isLoading: () => loadingNotifications.value || loadingToday.value
    }
  }
  await loadDashboard()
})

onBeforeUnmount(() => {
  if (headerActionsRef) headerActionsRef.value = null
})

const handleAnswerYes = async (question) => {
  if (question.type === 'appointment-followup') {
    dismissQuestion(question.id)
    
    addFollowUpQuestion({
      id: `offer-followup-${question.opportunityId}`,
      type: 'offer-followup',
      priority: 5,
      question: `What was the offer given to ${question.customer.name}?`,
      customer: question.customer,
      opportunityId: question.opportunityId,
      opportunity: question.opportunity,
      createdAt: new Date().toISOString()
    })
  } else if (question.type === 'ns-followup') {
    dismissQuestion(question.id)
  } else if (question.type === 'stuck-opportunity') {
    dismissQuestion(question.id)
  } else if (question.type === 'lead-qualification-urgency') {
    dismissQuestion(question.id)
  }
}

const handleAnswerNo = async (question) => {
  if (question.type === 'appointment-followup') {
    try {
      const assigneeId = userStore.currentUser?.id
      if (assigneeId) {
        await createNSTask(question.opportunityId, assigneeId)
        dismissQuestion(question.id)
        await loadDashboard()
      }
    } catch (error) {
      console.error('Error creating NS task:', error)
    }
  } else if (question.type === 'ns-followup') {
    dismissQuestion(question.id)
  } else if (question.type === 'stuck-opportunity') {
    router.push(`/tasks/${question.opportunityId}?type=opportunity`)
  } else if (question.type === 'lead-qualification-urgency') {
    router.push(`/tasks/${question.leadId}?type=lead`)
  }
}

const handleReassign = (question) => {
  currentQuestion.value = question
  showReassignModal.value = true
}

const handleReassignConfirm = async (newAssigneeId) => {
  if (!currentQuestion.value) return
  
  try {
    const entityId = currentQuestion.value.opportunityId || currentQuestion.value.leadId
    if (currentQuestion.value.opportunityId) {
      await updateOpportunityAssignee(entityId, newAssigneeId)
    }
    
    dismissQuestion(currentQuestion.value.id)
    showReassignModal.value = false
    currentQuestion.value = null
    await loadDashboard()
  } catch (error) {
    console.error('Error reassigning:', error)
  }
}

const handleViewTask = (question) => {
  if (question.opportunityId) {
    router.push(`/tasks/${question.opportunityId}?type=opportunity`)
  } else if (question.leadId) {
    router.push(`/tasks/${question.leadId}?type=lead`)
  }
}

const handleDismiss = (question) => {
  if (userStore.currentUser) {
    saveDismissal(question.id, userStore.currentUser.id)
  }
  dismissQuestion(question.id)
}
</script>
