<template>
  <Card class="border-0 gap-4 shadow-none">
    <CardHeader>
      <CardTitle>{{ t('forms.addNew.selectContact.title') }}</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <div
        v-if="!modelValue"
        class="relative w-full overflow-hidden rounded-lg border border-sky-500 bg-linear-to-r from-sky-500/20 to-background dark:from-sky-500/15"
      >
        <div class="relative z-10 flex w-full items-center gap-2 py-2 pl-2 pr-4">
          <div class="flex min-w-0 flex-1 items-center gap-2">
            <div class="flex shrink-0 items-center justify-center rounded-md bg-sky-500 p-1.5 text-white" aria-hidden="true">
              <Info class="size-3" stroke-width="2" />
            </div>
            <p class="min-w-0 flex-1 text-sm leading-5 text-foreground">
              <span class="font-normal">{{ t('forms.addNew.selectContact.banner.before') }}</span>
              <span class="font-semibold">{{ duplicateCount }} {{ t('forms.addNew.selectContact.banner.duplicates') }}</span>
              <span class="font-normal">{{ t('forms.addNew.selectContact.banner.after') }}</span>
            </p>
          </div>
        </div>
      </div>

      <div v-if="!modelValue" class="flex items-center gap-4">
        <!--
          Custom anchored panel instead of Popover: Reka/Radix dismiss layers treat the input
          as “outside” the portaled content and close immediately. Same pattern as CustomerSearchSelect.
        -->
        <div ref="searchAnchorRef" class="relative w-full max-w-sm">
          <div
            class="flex w-full items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2 focus-within:ring-offset-background"
          >
            <InputGroup class="h-8 w-full border-0 shadow-none">
              <InputGroupAddon align="inline-start">
                <Search class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                ref="queryInputRef"
                v-model="query"
                class="border-0 shadow-none focus-visible:ring-0"
                :placeholder="t('forms.addNew.selectContact.searchPlaceholder')"
                autocomplete="off"
                role="combobox"
                :aria-expanded="open"
                aria-haspopup="listbox"
                @focus="setOpen"
                @click="setOpen"
                @keydown.down.prevent="setOpen"
                @keydown.esc.stop.prevent="closePopover"
              />
              <InputGroupAddon v-if="query" align="inline-end">
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  :aria-label="t('forms.addNew.selectContact.clearSearchAria')"
                  @click="clearQuery"
                >
                  <X class="h-4 w-4" aria-hidden="true" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>

        <Teleport to="body">
          <div
            v-show="open"
            ref="dropdownPanelRef"
            class="overflow-y-auto rounded-md border border-border bg-background shadow-md"
            :style="dropdownPanelStyle"
            role="listbox"
          >
            <div v-if="!loading && results.length === 0" class="w-full p-4">
              <div class="flex w-full flex-col items-center gap-3">
                <p class="w-full text-center text-sm text-muted-foreground whitespace-normal break-words">
                  {{ t('forms.addNew.selectContact.noMatches') }}
                </p>
                <Button variant="secondary" size="sm" @click="handleCreateContactClick">
                  {{ t('forms.addNew.selectContact.createContact') }}
                </Button>
              </div>
            </div>

            <div v-else class="w-full p-2">
              <button
                v-for="c in results"
                :key="c.id"
                type="button"
                role="option"
                class="flex w-full items-center gap-2 rounded-[10px] bg-white px-4 py-2 text-left transition-colors hover:bg-[var(--base-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                @mousedown.prevent
                @click="selectContact(c)"
              >
                <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User class="size-4" aria-hidden="true" />
                </div>

                <div class="min-w-0 flex-1 flex flex-col gap-0.5">
                  <div class="flex min-w-0 items-start gap-0.5 text-sm leading-5 whitespace-nowrap">
                    <span class="truncate font-medium text-foreground">{{ displayName(c) }}</span>
                    <span v-if="contactCity(c)" class="shrink-0 font-normal text-muted-foreground">
                      ({{ contactCity(c) }})
                    </span>
                  </div>

                  <div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm font-normal leading-5 text-muted-foreground">
                    <div v-if="c.email" class="flex min-w-0 max-w-full items-center gap-1">
                      <Mail class="size-4 shrink-0" aria-hidden="true" />
                      <span class="truncate">{{ c.email }}</span>
                    </div>
                    <div v-if="c.phone" class="flex min-w-0 max-w-full items-center gap-1">
                      <Phone class="size-4 shrink-0" aria-hidden="true" />
                      <span class="truncate">{{ c.phone }}</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </Teleport>

        <Button variant="secondary" size="sm" @click="handleCreateContactClick">
          {{ t('forms.addNew.selectContact.createContact') }}
        </Button>
      </div>

      <div
        v-if="modelValue"
        class="rounded-lg border border-border bg-card overflow-hidden shadow-mk-dashboard-card"
      >
        <div class="flex items-start justify-between gap-4 p-4">
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <Avatar size="sm" class="bg-muted">
              <AvatarFallback class="text-muted-foreground">
                <User class="h-4 w-4" aria-hidden="true" />
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1 min-w-0">
                <p class="text-sm font-medium text-foreground truncate">
                  {{ displayName(modelValue) }}
                </p>
                <p v-if="contactCity(modelValue)" class="text-sm text-muted-foreground shrink-0">
                  ({{ contactCity(modelValue) }})
                </p>
              </div>
              <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <div v-if="modelValue.email" class="flex items-center gap-1 min-w-0">
                  <Mail class="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <p class="text-sm text-muted-foreground truncate">{{ modelValue.email }}</p>
                </div>
                <div v-if="modelValue.phone" class="flex items-center gap-1 min-w-0">
                  <Phone class="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                  <p class="text-sm text-muted-foreground truncate">{{ modelValue.phone }}</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            class="h-8 w-8 p-0 shrink-0"
            :aria-label="t('forms.addNew.selectContact.clearSelectionAria')"
            @click="clearSelection"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Info, Mail, Phone, Search, User, X } from 'lucide-vue-next'
import { useCustomersStore } from '@/stores/customers'
import { dedupeCustomersForPicker } from '@/utils/dedupeCustomersForPicker'
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@motork/component-library/future/primitives'

const props = defineProps({
  modelValue: { type: Object, default: null },
  duplicateCount: { type: Number, default: 150 }
})

const emit = defineEmits(['update:modelValue', 'create-contact'])

const { t } = useI18n()

const customersStore = useCustomersStore()

const open = ref(false)
const query = ref('')
const loading = ref(false)
const remoteResults = ref([])
const queryInputRef = ref(null)
const searchAnchorRef = ref(null)
const dropdownPanelRef = ref(null)
/** Fixed layer in `document.body` so parent `overflow-y-auto` cannot clip the list */
const dropdownPanelStyle = ref({})

function updateDropdownPosition() {
  const el = searchAnchorRef.value
  if (!(el instanceof HTMLElement)) return
  const r = el.getBoundingClientRect()
  const gap = 4
  const pad = 12
  const spaceBelow = window.innerHeight - r.bottom - gap - pad
  const maxListPx = 256
  const maxH = Math.max(120, Math.min(maxListPx, spaceBelow))
  dropdownPanelStyle.value = {
    position: 'fixed',
    top: `${r.bottom + gap}px`,
    left: `${r.left}px`,
    width: `${Math.max(r.width, 240)}px`,
    maxHeight: `${maxH}px`,
    zIndex: 250,
  }
}

function onDocPointerDownCapture(ev) {
  if (!open.value) return
  const anchor = searchAnchorRef.value
  const panel = dropdownPanelRef.value
  const t = ev.target
  if (!(t instanceof Node)) return
  if (anchor instanceof HTMLElement && anchor.contains(t)) return
  if (panel instanceof HTMLElement && panel.contains(t)) return
  open.value = false
}

let docPointerDownBound = false

watch(open, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    updateDropdownPosition()
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('resize', updateDropdownPosition)
    setTimeout(() => {
      document.addEventListener('pointerdown', onDocPointerDownCapture, true)
      docPointerDownBound = true
    }, 0)
  } else {
    window.removeEventListener('scroll', updateDropdownPosition, true)
    window.removeEventListener('resize', updateDropdownPosition)
    if (docPointerDownBound) {
      document.removeEventListener('pointerdown', onDocPointerDownCapture, true)
      docPointerDownBound = false
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
  if (docPointerDownBound) {
    document.removeEventListener('pointerdown', onDocPointerDownCapture, true)
    docPointerDownBound = false
  }
})

const localResults = computed(() => {
  const list = dedupeCustomersForPicker(customersStore.customers || [])
  const q = query.value.trim().toLowerCase()
  if (!q) return list.slice(0, 8)
  return list
    .filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q)
    )
    .slice(0, 8)
})

watch(
  () => customersStore.customers?.length,
  (len) => {
    if (!len) customersStore.fetchCustomers()
  },
  { immediate: true }
)

const results = computed(() => {
  if (!query.value.trim()) return localResults.value
  return remoteResults.value.length > 0 ? remoteResults.value : localResults.value
})

watch([results, loading], () => {
  if (open.value) {
    nextTick(() => updateDropdownPosition())
  }
})

function displayName(c) {
  const raw = c?.name || [c?.firstName, c?.lastName].filter(Boolean).join(' ') || ''
  // Mock/legacy data can include "(duplicate)" in the name; in the search UI we show city instead.
  return raw.replace(/\s*\(duplicate\)\s*$/i, '')
}

/** City for display: explicit field or parsed from trailing address segment (mock customers use `address` only). */
function contactCity(c) {
  if (!c) return ''
  const direct = c.city || c.town
  if (direct && String(direct).trim()) return String(direct).trim()
  const addr = c.address
  if (!addr || typeof addr !== 'string') return ''
  const tail = addr.split(',').pop()?.trim() || ''
  if (!tail) return ''
  return tail.replace(/^\d{4,6}\s+/, '').trim() || tail
}

function clearSelection() {
  emit('update:modelValue', null)
}

function clearQuery() {
  query.value = ''
  remoteResults.value = []
  loading.value = false
  setOpen()
}

function handleCreateContactClick() {
  open.value = false
  emit('create-contact')
}

function setOpen() {
  open.value = true
  focusQueryInputSoon()
}

function closePopover() {
  open.value = false
}

function focusQueryInputSoon() {
  nextTick(() => {
    const el = queryInputRef.value
    const dom =
      el instanceof HTMLElement
        ? el
        : el?.$el instanceof HTMLElement
          ? el.$el
          : null
    const input = dom?.querySelector?.('input,textarea,[contenteditable=\"true\"]') || dom
    if (!input || typeof input.focus !== 'function') return

    // Command/Popover internals may try to move focus to the first item after open.
    // Defer our focus to the end of the current frame to keep typing in the input.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        input.focus()
      })
    })
  })
}

function selectContact(c) {
  emit('update:modelValue', c)
  open.value = false
}

let timer = null
watch(
  () => query.value,
  (q) => {
    if (timer) window.clearTimeout(timer)
    if (!q.trim()) {
      remoteResults.value = []
      loading.value = false
      return
    }

    loading.value = true
    timer = window.setTimeout(() => {
      remoteResults.value = localResults.value
      loading.value = false
      setOpen()
    }, 250)
  }
)

</script>

