<template>
  <div class="flex flex-col gap-4">
    <section class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-2">
        <h2 class="text-lg font-semibold text-foreground">{{ t('requestDetail.insights.title') }}</h2>
        <p class="text-sm text-muted-foreground">{{ t('requestDetail.insights.description') }}</p>
        <p class="text-xs font-medium text-foreground">{{ t('requestDetail.insights.leadEmail') }}</p>
      </div>

      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:min-w-96">
        <div v-for="stat in headerStats" :key="stat.label" class="space-y-1">
          <dt class="text-xs font-medium text-muted-foreground">{{ stat.label }}</dt>
          <dd class="text-sm font-semibold text-foreground">{{ stat.value }}</dd>
          <p v-if="stat.caption" class="text-xs text-muted-foreground">{{ stat.caption }}</p>
        </div>
      </dl>
    </section>

    <div class="flex flex-wrap gap-2">
      <Badge
        v-for="filter in filters"
        :key="filter"
        variant="secondary"
        class="gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground"
      >
        <Plus class="size-3" />
        {{ filter }}
      </Badge>
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
      <Card class="gap-0 overflow-hidden border-border bg-background pb-3 pt-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border px-4 pb-2 pt-0">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <Tag class="size-4" />
            {{ t('requestDetail.insights.cards.tags') }}
          </CardTitle>
          <MoreHorizontal class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="px-4 pb-0 pt-3">
          <div class="flex flex-wrap gap-x-2 gap-y-1.5">
            <Badge
              v-for="tag in tags"
              :key="tag"
              variant="secondary"
              class="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {{ tag }}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 overflow-hidden border-border bg-background pb-3 pt-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border px-4 pb-2 pt-0">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <MousePointerClick class="size-4" />
            {{ t('requestDetail.insights.cards.peakActivity') }}
          </CardTitle>
          <Badge variant="outline" class="rounded-sm text-xs">{{ t('requestDetail.insights.period') }}</Badge>
        </CardHeader>
        <CardContent class="px-4 pb-0 pt-3">
          <div class="flex h-36 items-end gap-5 border-b border-border px-3">
            <div v-for="bar in peakActivity" :key="bar.label" class="flex flex-1 flex-col items-center gap-2">
              <div :class="['w-full rounded-t-sm bg-blue-500', bar.height]" />
              <span class="text-xs text-muted-foreground">{{ bar.label }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 overflow-hidden border-border bg-background pb-3 pt-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border px-4 pb-2 pt-0">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <Megaphone class="size-4" />
            {{ t('requestDetail.insights.cards.latestMarketingCommunications') }}
          </CardTitle>
          <MoreHorizontal class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="divide-y divide-border p-0">
          <div v-for="item in marketingCommunications" :key="item.title" class="flex items-center justify-between px-4 py-2.5">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-foreground">{{ item.title }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ item.meta }}</p>
            </div>
            <Badge variant="secondary" class="shrink-0 rounded-md bg-muted text-xs font-medium text-muted-foreground">
              {{ t('requestDetail.insights.actions.sent') }}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 overflow-hidden border-border bg-background pb-3 pt-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border px-4 pb-2 pt-0">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <Eye class="size-4" />
            {{ t('requestDetail.insights.cards.latestPagesViewed') }}
          </CardTitle>
          <MoreHorizontal class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="divide-y divide-border p-0">
          <div v-for="item in pagesViewed" :key="item.title" class="flex items-center justify-between gap-3 px-4 py-2.5">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-foreground">{{ item.title }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ item.meta }}</p>
            </div>
            <Badge variant="secondary" class="shrink-0 rounded-md bg-muted text-xs text-muted-foreground">{{ item.badge }}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 overflow-hidden border-border bg-background pb-3 pt-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border px-4 pb-2 pt-0">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <Funnel class="size-4" />
            {{ t('requestDetail.insights.cards.latestLeads') }}
          </CardTitle>
          <MoreHorizontal class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="divide-y divide-border p-0">
          <div v-for="item in latestLeads" :key="item.title" class="flex items-center justify-between gap-3 px-4 py-2.5">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-foreground">{{ item.title }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ item.meta }}</p>
            </div>
            <Badge :class="['shrink-0 rounded-md text-xs', item.className]">{{ item.status }}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 overflow-hidden border-border bg-background pb-3 pt-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border px-4 pb-2 pt-0">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <Bookmark class="size-4" />
            {{ t('requestDetail.insights.cards.latestOpportunities') }}
          </CardTitle>
          <MoreHorizontal class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="divide-y divide-border p-0">
          <div v-for="item in latestOpportunities" :key="item.title" class="flex items-center justify-between gap-3 px-4 py-2.5">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-foreground">{{ item.title }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ item.meta }}</p>
            </div>
            <Badge variant="outline" class="shrink-0 rounded-md text-xs">{{ item.status }}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 overflow-hidden border-border bg-background pb-3 pt-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border px-4 pb-2 pt-0">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <Star class="size-4" />
            {{ t('requestDetail.insights.cards.latestReviews') }}
          </CardTitle>
          <MoreHorizontal class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="px-4 pb-0 pt-3">
          <p class="text-sm font-medium text-foreground">{{ t('requestDetail.insights.review.title') }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ t('requestDetail.insights.review.meta') }}</p>
          <div class="mt-3 flex gap-1 text-amber-400">
            <Star v-for="star in 5" :key="star" class="size-4 fill-current" />
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 overflow-hidden border-border bg-background pb-3 pt-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border px-4 pb-2 pt-0">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <Files class="size-4" />
            {{ t('requestDetail.insights.cards.sources') }}
          </CardTitle>
          <MoreHorizontal class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="px-4 pb-0 pt-3">
          <div class="flex flex-wrap gap-2">
            <Badge v-for="source in sources" :key="source.label" :class="['rounded-md text-xs font-medium', source.className]">
              {{ source.label }}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 overflow-hidden border-border bg-background pb-3 pt-2 shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between border-b border-border px-4 pb-2 pt-0">
          <CardTitle class="flex items-center gap-2 text-sm font-semibold">
            <Phone class="size-4" />
            {{ t('requestDetail.insights.cards.associatedContacts') }}
          </CardTitle>
          <MoreHorizontal class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent class="divide-y divide-border p-0">
          <div v-for="contact in associatedContacts" :key="contact.phone" class="flex items-start justify-between gap-3 px-4 py-2.5">
            <div class="min-w-0 space-y-1">
              <p class="text-sm font-medium text-foreground">{{ contact.name }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ contact.email }}</p>
              <p class="text-xs text-muted-foreground">{{ contact.phone }}</p>
            </div>
            <Button variant="ghost" size="xs" class="shrink-0 text-purple-600 hover:text-purple-700">
              {{ t('requestDetail.insights.actions.call') }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Bookmark,
  Eye,
  Files,
  Funnel,
  Megaphone,
  MoreHorizontal,
  MousePointerClick,
  Phone,
  Plus,
  Star,
  Tag
} from 'lucide-vue-next'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@motork/component-library/future/primitives'

const { t } = useI18n()

const filters = computed(() => [
  t('requestDetail.insights.filters.tags'),
  t('requestDetail.insights.filters.peakActivity'),
  t('requestDetail.insights.filters.latestMarketingCommunications'),
  t('requestDetail.insights.filters.latestPagesViewed'),
  t('requestDetail.insights.filters.latestLeads'),
  t('requestDetail.insights.filters.latestOpportunities'),
  t('requestDetail.insights.filters.latestReviews'),
  t('requestDetail.insights.filters.sources'),
  t('requestDetail.insights.filters.associatedContacts')
])

const headerStats = computed(() => [
  {
    label: t('requestDetail.insights.stats.firstEvent'),
    value: t('requestDetail.insights.stats.firstEventValue'),
    caption: t('requestDetail.insights.stats.campaignCommunicationSent')
  },
  {
    label: t('requestDetail.insights.stats.lastEvent'),
    value: t('requestDetail.insights.stats.lastEventValue'),
    caption: t('requestDetail.insights.stats.leadQualified')
  },
  {
    label: t('requestDetail.insights.stats.trackedEvents'),
    value: t('requestDetail.insights.stats.trackedEventsValue'),
    caption: ''
  }
])

const tags = computed(() => [
  t('requestDetail.insights.tags.apiResponse'),
  t('requestDetail.insights.tags.hasActiveLead'),
  t('requestDetail.insights.tags.hasActiveOpportunity'),
  t('requestDetail.insights.tags.newLeadBuyer'),
  t('requestDetail.insights.tags.usedCar'),
  t('requestDetail.insights.tags.webVisit'),
  t('requestDetail.insights.tags.requestScore'),
  t('requestDetail.insights.tags.privateCustomer'),
  t('requestDetail.insights.tags.afterSales'),
  t('requestDetail.insights.tags.tradeIn'),
  t('requestDetail.insights.tags.remoteLead'),
  t('requestDetail.insights.tags.appointmentSet')
])

const peakActivity = [
  { label: '0-3', height: 'h-0' },
  { label: '4-7', height: 'h-1' },
  { label: '8-11', height: 'h-24' },
  { label: '12-15', height: 'h-12' },
  { label: '16-19', height: 'h-10' },
  { label: '20-23', height: 'h-0' }
]

const marketingCommunications = computed(() => [
  { title: t('requestDetail.insights.marketing.first.title'), meta: t('requestDetail.insights.marketing.first.meta') },
  { title: t('requestDetail.insights.marketing.second.title'), meta: t('requestDetail.insights.marketing.second.meta') }
])

const pagesViewed = computed(() => [
  { title: t('requestDetail.insights.pages.first.title'), meta: t('requestDetail.insights.pages.first.meta'), badge: t('requestDetail.insights.pages.first.badge') },
  { title: t('requestDetail.insights.pages.second.title'), meta: t('requestDetail.insights.pages.second.meta'), badge: t('requestDetail.insights.pages.second.badge') },
  { title: t('requestDetail.insights.pages.third.title'), meta: t('requestDetail.insights.pages.third.meta'), badge: t('requestDetail.insights.pages.third.badge') },
  { title: t('requestDetail.insights.pages.fourth.title'), meta: t('requestDetail.insights.pages.fourth.meta'), badge: t('requestDetail.insights.pages.fourth.badge') }
])

const latestLeads = computed(() => [
  { title: t('requestDetail.insights.leads.first.title'), meta: t('requestDetail.insights.leads.first.meta'), status: t('requestDetail.insights.status.qualified'), className: 'bg-green-100 text-green-700' },
  { title: t('requestDetail.insights.leads.second.title'), meta: t('requestDetail.insights.leads.second.meta'), status: t('requestDetail.insights.status.valid'), className: 'bg-muted text-muted-foreground' },
  { title: t('requestDetail.insights.leads.third.title'), meta: t('requestDetail.insights.leads.third.meta'), status: t('requestDetail.insights.status.qualified'), className: 'bg-green-100 text-green-700' },
  { title: t('requestDetail.insights.leads.fourth.title'), meta: t('requestDetail.insights.leads.fourth.meta'), status: t('requestDetail.insights.status.valid'), className: 'bg-muted text-muted-foreground' }
])

const latestOpportunities = computed(() => [
  { title: t('requestDetail.insights.opportunities.first.title'), meta: t('requestDetail.insights.opportunities.first.meta'), status: t('requestDetail.insights.status.open') },
  { title: t('requestDetail.insights.opportunities.second.title'), meta: t('requestDetail.insights.opportunities.second.meta'), status: t('requestDetail.insights.status.open') },
  { title: t('requestDetail.insights.opportunities.third.title'), meta: t('requestDetail.insights.opportunities.third.meta'), status: t('requestDetail.insights.status.open') },
  { title: t('requestDetail.insights.opportunities.fourth.title'), meta: t('requestDetail.insights.opportunities.fourth.meta'), status: t('requestDetail.insights.status.open') }
])

const sources = computed(() => [
  { label: t('requestDetail.insights.sources.callSpark'), className: 'bg-purple-100 text-purple-700' },
  { label: t('requestDetail.insights.sources.fidSpark'), className: 'bg-orange-100 text-amber-700' },
  { label: t('requestDetail.insights.sources.leadSpark'), className: 'bg-orange-100 text-orange-700' },
  { label: t('requestDetail.insights.sources.predictSpark'), className: 'bg-green-100 text-green-700' },
  { label: t('requestDetail.insights.sources.webSpark'), className: 'bg-lime-100 text-lime-700' }
])

const associatedContacts = computed(() => [
  { name: t('requestDetail.insights.contacts.first.name'), email: t('requestDetail.insights.contacts.first.email'), phone: t('requestDetail.insights.contacts.first.phone') },
  { name: t('requestDetail.insights.contacts.second.name'), email: t('requestDetail.insights.contacts.second.email'), phone: t('requestDetail.insights.contacts.second.phone') },
  { name: t('requestDetail.insights.contacts.third.name'), email: t('requestDetail.insights.contacts.third.email'), phone: t('requestDetail.insights.contacts.third.phone') }
])
</script>
