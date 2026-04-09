<template>
  <div
    class="flex flex-col gap-4 overflow-hidden rounded-lg border border-border bg-background p-4"
  >
    <div class="flex w-full min-w-0 items-center gap-2">
      <h3 class="min-w-0 flex-1 text-base font-medium leading-6 text-foreground">
        {{ t('customerProfile.rightColumn.contactDetails') }}
      </h3>
    </div>
    <div v-if="loading" class="space-y-3 animate-pulse">
      <div v-for="n in 6" :key="n" class="h-4 rounded bg-muted" />
    </div>
    <div v-else class="flex flex-col gap-3 text-sm">
      <div
        v-for="row in detailRows"
        :key="row.key"
        class="flex min-w-0 items-start justify-between gap-4"
      >
        <span class="shrink-0 text-muted-foreground">{{ row.label }}</span>
        <div class="flex min-w-0 flex-1 justify-end text-right font-medium text-foreground">
          <template v-if="row.key === 'email'">
            <a v-if="email" :href="`mailto:${email}`" class="hover:underline">{{ email }}</a>
            <span v-else>—</span>
          </template>
          <template v-else-if="row.key === 'phone'">
            <span class="inline-flex min-w-0 items-center justify-end gap-1">
              <a v-if="phone" :href="`tel:${phone}`" class="min-w-0 truncate hover:underline">{{
                phone
              }}</a>
              <span v-else>—</span>
              <Button
                v-if="phone"
                variant="ghost"
                size="icon-sm"
                class="shrink-0 rounded-md text-muted-foreground"
                :aria-label="t('customerProfile.details.copyPhoneAria')"
                @click="copyPhone"
              >
                <Copy class="size-3.5" />
              </Button>
            </span>
          </template>
          <span v-else class="wrap-break-word">{{ row.value }}</span>
        </div>
      </div>

      <div v-if="showOtherInteractionsBlock" class="flex flex-col gap-1.5 border-t border-border pt-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          class="w-full shrink-0 justify-between gap-1 text-left text-sm"
          :aria-expanded="otherInteractionsOpen"
          :aria-controls="otherInteractionsPanelId"
          @click="otherInteractionsOpen = !otherInteractionsOpen"
        >
          <span class="min-w-0 truncate">{{
            t('customerProfile.rightColumn.otherInteractions', { count: otherInteractionRows.length })
          }}</span>
          <ChevronDown
            class="size-3 shrink-0 opacity-70 transition-transform duration-200"
            :class="{ 'rotate-180': otherInteractionsOpen }"
          />
        </Button>
        <Transition name="other-interactions-expand">
          <div
            v-if="otherInteractionsOpen"
            :id="otherInteractionsPanelId"
            class="flex flex-col gap-1.5"
            role="region"
            :aria-label="t('customerProfile.rightColumn.otherInteractionsRegion')"
          >
            <button
              v-for="item in otherInteractionRows"
              :key="item.compositeId"
              type="button"
              class="flex w-full min-w-0 items-start justify-between gap-2 rounded-md border border-border bg-muted/20 p-2 text-left transition-colors hover:bg-muted/40"
              @click="handleInteractionClick(item)"
            >
              <div class="min-w-0 flex-1">
                <span class="text-sm font-medium leading-tight text-foreground">{{ item.title }}</span>
                <span v-if="item.subtitle" class="mt-0.5 block text-sm text-muted-foreground">{{
                  item.subtitle
                }}</span>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-0.5 text-right">
                <Badge
                  variant="secondary"
                  class="h-5 px-1.5 py-0 text-sm font-medium leading-none"
                  :class="
                    item.type === 'lead'
                      ? 'bg-badge-green text-emerald-700'
                      : 'bg-purple-50 text-purple-700'
                  "
                >
                  {{
                    item.type === 'lead'
                      ? t('customerProfile.rightColumn.typeLead')
                      : t('customerProfile.rightColumn.typeOpportunity')
                  }}
                </Badge>
                <span class="text-sm leading-none text-muted-foreground">{{ item.stage }}</span>
              </div>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Copy, ChevronDown } from 'lucide-vue-next'
import { Button, Badge } from '@motork/component-library/future/primitives'
import { useToastStore } from '@/stores/toast'
import { useRequestNavigationStore } from '@/stores/requestNavigation'

const props = defineProps({
  customer: { type: Object, default: null },
  account: { type: Object, default: null },
  cars: { type: Array, default: () => [] },
  leads: { type: Array, default: () => [] },
  opportunities: { type: Array, default: () => [] },
  requestsLoading: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showOtherInteractions: { type: Boolean, default: true }
})

const { t } = useI18n()
const router = useRouter()
const toastStore = useToastStore()
const requestNavigationStore = useRequestNavigationStore()

const otherInteractionsOpen = ref(false)
const otherInteractionsPanelId = 'customer-contact-details-other-interactions'

function interactionSortTime(raw) {
  const t1 = raw?.lastActivity || raw?.updatedAt || raw?.createdAt
  return t1 ? new Date(t1).getTime() : 0
}

const otherInteractionRows = computed(() => {
  const rows = []
  ;(props.leads || []).forEach((l) => {
    rows.push({
      id: l.id,
      type: 'lead',
      compositeId: `lead-${l.id}`,
      stage: l.stage || 'Open',
      title: l.requestedCar
        ? `${l.requestedCar.brand} ${l.requestedCar.model}`
        : t('customerProfile.rightColumn.fallbackLeadTitle'),
      subtitle: l.requestedCar?.year ? String(l.requestedCar.year) : '',
      sortTime: interactionSortTime(l),
      customer: l.customer || l
    })
  })
  ;(props.opportunities || []).forEach((o) => {
    rows.push({
      id: o.id,
      type: 'opportunity',
      compositeId: `opportunity-${o.id}`,
      stage: o.stage || 'Open',
      title: o.requestedCar
        ? `${o.requestedCar.brand} ${o.requestedCar.model}`
        : t('customerProfile.rightColumn.fallbackOpportunityTitle'),
      subtitle: o.requestedCar?.year ? String(o.requestedCar.year) : '',
      sortTime: interactionSortTime(o),
      customer: o.customer || o
    })
  })
  return rows.sort((a, b) => b.sortTime - a.sortTime)
})

const showOtherInteractionsBlock = computed(
  () =>
    props.showOtherInteractions &&
    !props.requestsLoading &&
    otherInteractionRows.value.length > 0
)

const navigationRows = computed(() =>
  otherInteractionRows.value.map((r) => ({
    id: r.id,
    type: r.type,
    compositeId: r.compositeId,
    displayStage: r.stage,
    customer: r.customer
  }))
)

function handleInteractionClick(item) {
  const rows = navigationRows.value
  requestNavigationStore.setRequestRows(rows)
  router.push({
    path: `/requests/${item.id}`,
    query: { type: item.type, from: 'customer' },
    state: { requestRows: rows }
  })
}

const displayName = computed(() => {
  const c = props.customer
  if (!c) return '—'
  return c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'
})

const accountName = computed(() => props.account?.name || props.customer?.accountName || '')
const email = computed(() => props.customer?.email || '')
const phone = computed(() => props.customer?.phone || '')
const address = computed(() => {
  const addr = props.customer?.address
  if (typeof addr === 'string') return addr
  if (typeof addr === 'object' && addr) {
    return [addr.streetLine1, addr.city].filter(Boolean).join(', ')
  }
  return ''
})

const language = computed(() => props.customer?.language || '')
const fiscalEntitiesLabel = computed(() => {
  const fe = props.account?.fiscalEntity?.name || props.account?.fiscal_entity?.name
  return fe || '—'
})

const drivenVehicle = computed(() => {
  if (props.cars?.length > 0) {
    const car = props.cars[0]
    return `${car.brand} ${car.model}`.trim()
  }
  return props.customer?.drivenVehicle || ''
})

const detailRows = computed(() => [
  { key: 'customerName', label: t('customerProfile.details.customerName'), value: displayName.value },
  { key: 'account', label: t('customerProfile.details.account'), value: accountName.value || '—' },
  { key: 'accountOwner', label: t('customerProfile.details.accountOwner'), value: '—' },
  { key: 'email', label: t('customerProfile.details.email'), value: email.value },
  { key: 'phone', label: t('customerProfile.details.phone'), value: phone.value },
  { key: 'address', label: t('customerProfile.details.address'), value: address.value || '—' },
  { key: 'language', label: t('customerProfile.details.language'), value: language.value || '—' },
  {
    key: 'fiscalEntities',
    label: t('customerProfile.details.fiscalEntities'),
    value: fiscalEntitiesLabel.value
  },
  {
    key: 'drivenVehicle',
    label: t('customerProfile.details.drivenVehicle'),
    value: drivenVehicle.value || '—'
  }
])

async function copyPhone() {
  if (!phone.value) return
  try {
    await navigator.clipboard.writeText(phone.value)
    toastStore.pushToast('success', t('customerProfile.details.phoneCopied'))
  } catch {
    toastStore.pushToast('error', t('customerProfile.details.phoneCopyFailed'))
  }
}

watch(
  () => props.customer?.id,
  () => {
    otherInteractionsOpen.value = false
  }
)
</script>

<style scoped>
.other-interactions-expand-enter-active,
.other-interactions-expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  overflow: hidden;
}

.other-interactions-expand-enter-from,
.other-interactions-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.other-interactions-expand-enter-to,
.other-interactions-expand-leave-from {
  max-height: 24rem;
  opacity: 1;
}
</style>
