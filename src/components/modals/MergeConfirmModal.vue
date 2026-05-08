<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>{{ title }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto py-4 w-full space-y-4">
          <div
            class="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 px-4 py-3 flex items-start gap-3"
          >
            <AlertTriangle class="size-5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
            <p class="text-sm text-foreground">
              Important: be careful, once the manual merging is done the process is not reversible!
            </p>
          </div>
          <p class="text-sm text-muted-foreground">
            {{ mergeInstructionText }}
          </p>
          <p v-if="primary && duplicate" class="text-sm text-muted-foreground">
            {{ itemsToReviewCount }} items to review
          </p>

          <div
            v-if="primary && duplicate"
            class="border border-border rounded-lg overflow-hidden"
          >
            <div class="grid grid-cols-[1fr_1fr_1fr] gap-0 bg-muted/50">
              <div class="px-4 py-2 text-sm font-medium text-muted-foreground">
                Field
              </div>
              <div
                :class="[
                  'px-4 py-2 text-sm font-medium',
                  isMasterPrimary ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'
                ]"
              >
                Master record
              </div>
              <div
                :class="[
                  'px-4 py-2 text-sm font-medium',
                  !isMasterPrimary ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'
                ]"
              >
                Other record
              </div>
            </div>
            <div class="grid grid-cols-[1fr_1fr_1fr] gap-0 divide-y divide-border">
              <div class="px-4 py-2 text-sm text-muted-foreground">
                —
              </div>
              <div
                :class="[
                  'px-4 py-3 flex flex-col gap-2',
                  isMasterPrimary ? 'bg-primary/5' : ''
                ]"
              >
                <span class="text-sm text-muted-foreground">{{ idLabel }}: {{ masterRecord?.id ?? '—' }}</span>
                <span class="text-sm font-medium text-foreground">Master record</span>
              </div>
              <div
                :class="[
                  'px-4 py-3 flex flex-col gap-2',
                  !isMasterPrimary ? 'bg-primary/5' : ''
                ]"
              >
                <span class="text-sm text-muted-foreground">{{ idLabel }}: {{ otherRecord?.id ?? '—' }}</span>
                <div class="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    class="rounded-sm w-fit"
                    @click="swapMaster"
                  >
                    Select as master
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="rounded-sm w-fit text-muted-foreground"
                    @click="handleDoNotMerge"
                  >
                    Do not merge
                  </Button>
                </div>
              </div>
            </div>
            <template v-for="(group, gIdx) in displayedRowsBySection" :key="gIdx">
              <div
                v-for="row in group.rows"
                :key="row.key"
                class="grid grid-cols-[1fr_1fr_1fr] gap-0 divide-x divide-border"
              >
                <div class="px-4 py-2 text-sm font-medium text-foreground">
                  {{ row.label }}
                </div>
                <div
                  :class="[
                    'px-4 py-2 flex items-center gap-2',
                    isMasterPrimary ? 'bg-primary/5' : ''
                  ]"
                >
                  <input
                    type="radio"
                    :name="`merge-req-${row.key}`"
                    :checked="fieldChoice[row.key] === 'master'"
                    class="rounded-full border-input"
                    @change="fieldChoice[row.key] = 'master'"
                  >
                  <span class="text-sm text-foreground">{{ masterVal(row) }}</span>
                  <AlertCircle
                    v-if="row.differs && fieldChoice[row.key] === 'other'"
                    class="size-4 shrink-0 text-destructive"
                  />
                </div>
                <div
                  :class="[
                    'px-4 py-2 flex items-center gap-2',
                    !isMasterPrimary ? 'bg-primary/5' : ''
                  ]"
                >
                  <input
                    type="radio"
                    :name="`merge-req-${row.key}`"
                    :checked="fieldChoice[row.key] === 'other'"
                    class="rounded-full border-input"
                    @change="fieldChoice[row.key] = 'other'"
                  >
                  <span class="text-sm text-foreground">{{ otherVal(row) }}</span>
                  <AlertCircle
                    v-if="row.differs && fieldChoice[row.key] === 'master'"
                    class="size-4 shrink-0 text-destructive"
                  />
                </div>
              </div>
            </template>
            <div class="border-t border-border px-4 py-2">
              <button
                type="button"
                class="text-sm text-primary hover:underline"
                @click="showAllFields = !showAllFields"
              >
                {{ showAllFields ? 'Show only differing values' : 'Show all fields' }}
              </button>
            </div>
          </div>
          <div v-else class="text-sm text-muted-foreground">
            Merge {{ duplicateSummary }} into this request? The duplicate will be closed and its activities will be merged.
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            class="rounded-sm w-full sm:w-auto"
            :disabled="loading"
            @click="handleClose"
          >
            {{ primary && duplicate ? 'Remove suggestions' : 'Cancel' }}
          </Button>
          <Button
            variant="default"
            class="rounded-sm w-full sm:w-auto"
            :disabled="loading"
            @click="handleConfirm"
          >
            {{ loading ? 'Merging…' : primaryMergeButtonLabel }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { AlertTriangle, AlertCircle } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { Button } from '@motork/component-library/future/primitives'
import { useMergeFields, REQUEST_FIELD_SECTIONS } from '@/composables/useMergeFields'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  primary: {
    type: Object,
    default: null
  },
  duplicate: {
    type: Object,
    default: null
  },
  duplicateSummary: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const isMasterPrimary = ref(true)
const showAllFields = ref(false)
const fieldChoice = ref({})

const primaryRef = computed(() => props.primary)
const otherRef = computed(() => props.duplicate)

const masterRecord = computed(() =>
  isMasterPrimary.value ? props.primary : props.duplicate
)

const requestType = computed(() => props.primary?.type || 'opportunity')
const title = computed(() =>
  requestType.value === 'lead' ? 'Merge leads' : 'Merge opportunities'
)
const idLabel = computed(() =>
  requestType.value === 'lead' ? 'Lead ID' : 'Opportunity ID'
)
const primaryMergeButtonLabel = computed(() =>
  requestType.value === 'lead' ? 'Merge leads' : 'Merge opportunities'
)
const itemsToReviewCount = computed(() =>
  props.primary && props.duplicate ? 2 : 0
)
const mergeInstructionText = computed(() => {
  const entity = requestType.value === 'lead' ? 'leads' : 'opportunities'
  const singular = requestType.value === 'lead' ? 'lead' : 'opportunity'
  return `To which master record would you like to merge the ${entity}? We will keep the ${singular} selected as master record and merge all the others. Records of offers will be kept from all the merged ${entity}. Contacts will be kept separated.`
})
const otherRecord = computed(() =>
  isMasterPrimary.value ? props.duplicate : props.primary
)

const { rows, rowsWithDiff } = useMergeFields(
  primaryRef,
  otherRef,
  REQUEST_FIELD_SECTIONS
)

const displayedRowsBySection = computed(() => {
  const list = showAllFields.value ? rows.value : rowsWithDiff.value
  const bySection = {}
  for (const r of list) {
    if (!bySection[r.section]) bySection[r.section] = { section: r.section, rows: [] }
    bySection[r.section].rows.push(r)
  }
  return Object.values(bySection)
})

function masterVal(row) {
  return isMasterPrimary.value ? row.primaryVal : row.otherVal
}
function otherVal(row) {
  return isMasterPrimary.value ? row.otherVal : row.primaryVal
}

function swapMaster() {
  isMasterPrimary.value = !isMasterPrimary.value
}

function handleDoNotMerge() {
  emit('close')
}

watch(
  () => [props.primary, props.duplicate, props.show],
  () => {
    if (!props.show) return
    isMasterPrimary.value = true
    const choices = {}
    for (const r of rows.value) {
      choices[r.key] = 'master'
    }
    fieldChoice.value = choices
  },
  { deep: true, immediate: true }
)

function handleOpenChange(isOpen) {
  if (!isOpen) emit('close')
}

function handleClose() {
  emit('close')
}

function handleConfirm() {
  if (props.primary && props.duplicate) {
    const master = isMasterPrimary.value ? props.primary : props.duplicate
    const toMerge = isMasterPrimary.value ? props.duplicate : props.primary
    emit('confirm', { master, toMerge })
  } else {
    emit('confirm')
  }
}
</script>
