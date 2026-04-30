<template>
  <div class="space-y-4">
    <div v-if="!modelValue" class="flex min-w-0 items-center gap-4">
      <div ref="searchAnchorRef" class="relative min-w-0 flex-1">
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
              :placeholder="t('forms.addNew.selectAccount.searchPlaceholder')"
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
                :aria-label="t('forms.addNew.selectAccount.clearSearchAria')"
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
          <div v-if="loading" class="p-4 text-sm text-muted-foreground">
            {{ t('common.common.loading') }}
          </div>
          <div v-else-if="displayResults.length === 0" class="w-full p-4">
            <div class="flex w-full flex-col items-center gap-3">
              <p class="w-full text-center text-sm text-muted-foreground whitespace-normal break-words">
                {{ t('forms.addNew.selectAccount.noMatches') }}
              </p>
              <Button variant="secondary" size="sm" @click="emitSwitchToCreate">
                {{ t('forms.addNew.selectAccount.createCompany') }}
              </Button>
            </div>
          </div>

          <div v-else class="w-full p-1.5" role="list">
            <button
              v-for="a in displayResults"
              :key="a.id"
              type="button"
              role="option"
              class="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              @mousedown.prevent
              @click="selectAccount(a)"
            >
              <span class="block truncate">
                {{ accountTitle(a) }}
              </span>
            </button>
          </div>
        </div>
      </Teleport>

      <Button variant="secondary" size="sm" @click="emitSwitchToCreate">
        {{ t('forms.addNew.selectAccount.createCompany') }}
      </Button>
    </div>

    <div
      v-else
      class="overflow-hidden rounded-lg border border-border bg-card shadow-mk-dashboard-card"
    >
      <div class="flex items-start justify-between gap-4 p-4">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-foreground">
            {{ accountTitle(modelValue) }}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          class="h-8 w-8 shrink-0 p-0"
          :aria-label="t('forms.addNew.selectAccount.clearSelectionAria')"
          @click="clearSelection"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, X } from 'lucide-vue-next'
import { fetchAccounts } from '@/api/accounts'
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@motork/component-library/future/primitives'

const props = defineProps({
  modelValue: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'switchToCreate'])

const { t } = useI18n()

const open = ref(false)
const query = ref('')
const loading = ref(false)
const remoteResults = ref([])
const queryInputRef = ref(null)
const searchAnchorRef = ref(null)
const dropdownPanelRef = ref(null)
const dropdownPanelStyle = ref({})

function accountTitle(a) {
  if (!a) return ''
  return a.companyName || a.company || a.name || ''
}

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
  }
})

const maxResults = 12
const displayResults = computed(() => remoteResults.value.slice(0, maxResults))

watch([remoteResults, loading], () => {
  if (open.value) {
    nextTick(() => updateDropdownPosition())
  }
})

function clearSelection() {
  emit('update:modelValue', null)
}

function clearQuery() {
  query.value = ''
  remoteResults.value = []
  loading.value = false
  setOpen()
}

function emitSwitchToCreate() {
  open.value = false
  emit('switchToCreate')
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
    const input = dom?.querySelector?.('input,textarea,[contenteditable="true"]') || dom
    if (!input || typeof input.focus !== 'function') return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        input.focus()
      })
    })
  })
}

function selectAccount(a) {
  emit('update:modelValue', a ? { ...a } : null)
  open.value = false
}

let timer = null
async function loadAccounts() {
  const q = query.value.trim()
  loading.value = true
  try {
    const { data } = await fetchAccounts(q ? { search: q } : {})
    remoteResults.value = Array.isArray(data) ? data : []
  } catch {
    remoteResults.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => query.value,
  (q) => {
    if (timer) window.clearTimeout(timer)
    if (!q.trim()) {
      remoteResults.value = []
      loading.value = false
      return
    }
    timer = window.setTimeout(() => {
      loadAccounts().then(() => {
        if (open.value) setOpen()
      })
    }, 250)
  }
)

watch(open, (isOpen) => {
  if (isOpen && !query.value.trim() && !props.modelValue) {
    loadAccounts().then(() => nextTick(() => updateDropdownPosition()))
  }
})
</script>
