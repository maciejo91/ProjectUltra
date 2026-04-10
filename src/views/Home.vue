<template>
  <div class="page-container flex flex-col min-h-0">
    <div class="flex-1 overflow-y-auto px-6 pb-8 md:pb-10 lg:pb-12 min-h-0">
      <div class="rounded-lg border border-border bg-card overflow-hidden shadow-mk-dashboard-card p-4 md:p-6 mb-6">
        <h1 class="text-base font-semibold text-foreground">
          {{ greetingLine }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ formattedToday }}
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          {{ summaryLine }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div class="lg:col-span-8 space-y-6">
          <Card class="border border-border flex flex-col overflow-hidden shadow-mk-dashboard-card">
            <CardHeader class="shrink-0 flex flex-row items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-border">
              <div class="flex items-center gap-2 min-w-0">
                <CardTitle class="text-sm font-medium leading-5 truncate">
                  {{ t('home.importantToday.title') }}
                </CardTitle>
                <Badge
                  v-if="importantTodayTasks.length > 0"
                  :text="String(importantTodayTasks.length)"
                  size="small"
                  theme="blue"
                />
              </div>
              <Button
                :label="t('home.importantToday.openTasks')"
                variant="ghost"
                size="small"
                class="text-sm shrink-0"
                @click="router.push('/tasks')"
              />
            </CardHeader>
            <CardContent class="flex flex-col pt-0 px-4 md:px-6 pb-4 md:pb-6">
              <template v-if="loadingToday">
                <div v-for="n in 3" :key="`imp-sk-${n}`" class="py-3 border-b border-border last:border-0">
                  <div class="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  <div class="h-3 bg-muted rounded w-1/2 mt-2 animate-pulse" />
                </div>
              </template>
              <div
                v-else-if="importantTodayTasks.length === 0"
                class="rounded-lg border border-border bg-muted/50 p-8 text-center text-sm text-muted-foreground"
              >
                {{ t('home.importantToday.empty') }}
              </div>
              <div v-else class="divide-y divide-border">
                <button
                  v-for="row in importantTodayTasks"
                  :key="row.id"
                  type="button"
                  class="group flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg"
                  @click="goTask(row)"
                >
                  <span class="text-sm font-medium tabular-nums text-muted-foreground w-14 shrink-0 pt-0.5">
                    {{ row.time }}
                  </span>
                  <div class="flex min-w-0 flex-1 flex-col gap-1">
                    <p class="truncate text-sm font-medium text-foreground">
                      {{ row.title }}
                    </p>
                    <p class="truncate text-sm text-muted-foreground">
                      {{ row.subtitle }}
                    </p>
                    <div class="flex flex-wrap gap-1.5">
                      <Badge
                        :text="row.typeLabel"
                        size="small"
                        variant="outline"
                        :theme="row.typeTheme"
                      />
                      <Badge
                        v-if="row.extraLabel"
                        :text="row.extraLabel"
                        size="small"
                        :theme="row.extraTheme"
                      />
                    </div>
                  </div>
                  <ChevronRight class="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card class="border border-border flex flex-col overflow-hidden shadow-mk-dashboard-card">
            <CardHeader class="shrink-0 flex flex-row items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-border">
              <div class="flex items-center gap-2 min-w-0">
                <CardTitle class="text-sm font-medium leading-5 truncate">
                  {{ t('home.newInbound.title') }}
                </CardTitle>
                <Badge
                  v-if="recentInboundItems.length > 0"
                  :text="String(recentInboundItems.length)"
                  size="small"
                  theme="blue"
                />
              </div>
              <Button
                :label="t('home.importantToday.openTasks')"
                variant="ghost"
                size="small"
                class="text-sm shrink-0"
                @click="router.push('/tasks')"
              />
            </CardHeader>
            <CardContent class="flex flex-col pt-0 px-4 md:px-6 pb-4 md:pb-6">
              <template v-if="loadingRecent">
                <div v-for="n in 3" :key="`new-sk-${n}`" class="py-3 border-b border-border last:border-0">
                  <div class="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  <div class="h-3 bg-muted rounded w-1/2 mt-2 animate-pulse" />
                </div>
              </template>
              <div
                v-else-if="recentInboundItems.length === 0"
                class="rounded-lg border border-border bg-muted/50 p-8 text-center text-sm text-muted-foreground"
              >
                {{ t('home.newInbound.empty') }}
              </div>
              <div v-else class="divide-y divide-border">
                <button
                  v-for="row in recentInboundItems"
                  :key="row.id"
                  type="button"
                  class="group flex w-full items-start gap-3 py-3 text-left transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg"
                  @click="goTask(row)"
                >
                  <span class="text-xs font-medium tabular-nums text-muted-foreground w-24 shrink-0 pt-0.5">
                    {{ row.time }}
                  </span>
                  <div class="flex min-w-0 flex-1 flex-col gap-1">
                    <p class="truncate text-sm font-medium text-foreground">
                      {{ row.title }}
                    </p>
                    <p class="truncate text-sm text-muted-foreground">
                      {{ row.subtitle }}
                    </p>
                    <Badge
                      :text="row.typeLabel"
                      size="small"
                      variant="outline"
                      :theme="row.typeTheme"
                    />
                  </div>
                  <ChevronRight class="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card class="border border-border flex flex-col overflow-hidden shadow-mk-dashboard-card">
            <CardHeader class="shrink-0 flex flex-row items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-border">
              <div class="flex items-center gap-2 min-w-0">
                <CardTitle class="text-sm font-medium leading-5 truncate">
                  {{ t('home.needsAttention.title') }}
                </CardTitle>
                <Badge
                  v-if="totalNotificationsCount > 0"
                  :text="String(totalNotificationsCount)"
                  size="small"
                  theme="blue"
                />
              </div>
              <Button
                v-if="totalNotificationsCount > 5"
                :label="t('home.needsAttention.viewAll')"
                variant="ghost"
                size="small"
                class="text-sm shrink-0"
                @click="router.push('/tasks')"
              />
            </CardHeader>
            <CardContent class="flex flex-col pt-0 px-4 md:px-6 pb-4 md:pb-6">
              <div class="space-y-3">
                <template v-if="loadingNotifications">
                  <div v-for="n in 3" :key="`sk-${n}`" class="bg-muted border border-border rounded-lg p-4">
                    <div class="space-y-2">
                      <div class="h-4 bg-surfaceTertiary rounded w-3/4 animate-pulse" />
                      <div class="h-3 bg-surfaceTertiary rounded w-1/2 animate-pulse" />
                      <div class="flex gap-2 mt-3">
                        <div class="h-8 bg-surfaceTertiary rounded flex-1 animate-pulse" />
                        <div class="h-8 bg-surfaceTertiary rounded flex-1 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    v-if="notifications.length === 0"
                    class="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg border border-border"
                  >
                    <CheckCircle class="w-10 h-10 shrink-0 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p class="text-sm font-medium">
                      {{ t('home.needsAttention.caughtUpTitle') }}
                    </p>
                    <p class="text-sm mt-1">
                      {{ t('home.needsAttention.caughtUpSubtitle') }}
                    </p>
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

        <div class="lg:col-span-4 space-y-6">
          <Card class="border border-border flex flex-col overflow-hidden shadow-mk-dashboard-card">
            <CardHeader class="shrink-0 flex flex-row items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-border">
              <div class="flex items-center gap-2 min-w-0">
                <CardTitle class="text-sm font-medium leading-5 truncate">
                  {{ t('home.schedule.title') }}
                </CardTitle>
                <Badge
                  v-if="todayAppointmentItems.length > 0"
                  :text="String(todayAppointmentItems.length)"
                  size="small"
                  theme="blue"
                />
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <Button
                  :label="t('home.schedule.openTasks')"
                  variant="ghost"
                  size="small"
                  class="text-sm"
                  @click="router.push('/tasks')"
                />
                <Button
                  :label="t('home.schedule.openCalendar')"
                  variant="ghost"
                  size="small"
                  class="text-sm"
                  @click="router.push('/calendar')"
                />
              </div>
            </CardHeader>
            <CardContent class="pt-0 px-4 md:px-6 pb-4 md:pb-6">
              <TodayFeed
                :items="todayAppointmentItems"
                :loading="loadingToday"
                :empty-title="t('home.schedule.emptyTitle')"
              />
            </CardContent>
          </Card>

          <PerformanceWidget default-period="week" />
        </div>
      </div>
    </div>

    <ReassignUserModal
      :show="showReassignModal"
      @close="showReassignModal = false"
      @confirm="handleReassignConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue'
import { CheckCircle, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useDashboard } from '@/composables/useDashboard'
import { createNSTask, updateOpportunityAssignee } from '@/api/opportunities'
import { saveDismissal } from '@/utils/dismissalStorage'
import { Button, Badge, Card, CardHeader, CardTitle, CardContent } from '@motork/component-library/future/primitives'
import ActionableQuestionCard from '@/components/home/ActionableQuestionCard.vue'
import ReassignUserModal from '@/components/modals/ReassignUserModal.vue'
import TodayFeed from '@/components/home/TodayFeed.vue'
import PerformanceWidget from '@/components/home/PerformanceWidget.vue'

const router = useRouter()
const { t, locale } = useI18n()
const userStore = useUserStore()
const headerActionsRef = inject('headerActionsRef', null)

const {
  notifications,
  totalNotificationsCount,
  todayAppointmentItems,
  importantTodayTasks,
  recentInboundItems,
  loadingNotifications,
  loadingToday,
  loadingRecent,
  loadDashboard,
  dismissQuestion,
  addFollowUpQuestion
} = useDashboard()

const showReassignModal = ref(false)
const currentQuestion = ref(null)

const greetingLine = computed(() =>
  t('home.greeting', { name: userStore.currentUser?.name || '' })
)

const formattedToday = computed(() =>
  new Intl.DateTimeFormat(locale.value || undefined, { dateStyle: 'full' }).format(new Date())
)

const summaryLine = computed(() =>
  t('home.summary', {
    important: importantTodayTasks.value.length,
    recent: recentInboundItems.value.length,
    appointments: todayAppointmentItems.value.length
  })
)

function goTask(row) {
  router.push({
    path: `/requests/${row.entityId}`,
    query: { type: row.entityType, from: 'home' }
  })
}

onMounted(async () => {
  if (headerActionsRef) {
    headerActionsRef.value = {
      type: 'home',
      onRefresh: loadDashboard,
      isLoading: () =>
        loadingNotifications.value || loadingToday.value || loadingRecent.value
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
    const assigneeId = userStore.currentUser?.id
    if (assigneeId) {
      await createNSTask(question.opportunityId, assigneeId)
      dismissQuestion(question.id)
      await loadDashboard()
    }
  } else if (question.type === 'ns-followup') {
    dismissQuestion(question.id)
  } else if (question.type === 'stuck-opportunity') {
    router.push({
      path: `/requests/${question.opportunityId}`,
      query: { type: 'opportunity', from: 'home' }
    })
  } else if (question.type === 'lead-qualification-urgency') {
    router.push({
      path: `/requests/${question.leadId}`,
      query: { type: 'lead', from: 'home' }
    })
  }
}

const handleReassign = (question) => {
  currentQuestion.value = question
  showReassignModal.value = true
}

const handleReassignConfirm = async (newAssigneeId) => {
  if (!currentQuestion.value) return

  const entityId = currentQuestion.value.opportunityId || currentQuestion.value.leadId
  if (currentQuestion.value.opportunityId) {
    await updateOpportunityAssignee(entityId, newAssigneeId)
  }

  dismissQuestion(currentQuestion.value.id)
  showReassignModal.value = false
  currentQuestion.value = null
  await loadDashboard()
}

const handleViewTask = (question) => {
  if (question.opportunityId) {
    router.push({
      path: `/requests/${question.opportunityId}`,
      query: { type: 'opportunity', from: 'home' }
    })
  } else if (question.leadId) {
    router.push({
      path: `/requests/${question.leadId}`,
      query: { type: 'lead', from: 'home' }
    })
  }
}

const handleDismiss = (question) => {
  if (userStore.currentUser) {
    saveDismissal(question.id, userStore.currentUser.id)
  }
  dismissQuestion(question.id)
}
</script>
