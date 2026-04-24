<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="flex max-h-[min(90vh,640px)] w-full flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ t('forms.addNew.leadDetails.vehicle.searchModalTitle') }}</DialogTitle>
        </DialogHeader>
        <div class="flex min-h-0 flex-1 flex-col gap-3">
          <div
            class="flex w-full items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring/50"
          >
            <InputGroup class="h-9 w-full border-0 shadow-none">
              <InputGroupAddon align="inline-start">
                <Search class="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                v-model="query"
                class="border-0 shadow-none focus-visible:ring-0"
                :placeholder="t('forms.addNew.leadDetails.vehicle.searchInStockPlaceholder')"
                autocomplete="off"
                @keydown.enter.prevent="runSearch"
              />
            </InputGroup>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto rounded-md border border-border">
            <div v-if="loading" class="p-4 text-sm text-muted-foreground">{{ t('common.common.loading') }}</div>
            <ul v-else-if="results.length" class="divide-y divide-border" role="listbox">
              <li
                v-for="v in results"
                :key="v.id"
                class="cursor-pointer px-3 py-2.5 text-sm hover:bg-muted/60"
                role="option"
                @click="selectVehicle(v)"
              >
                <div class="font-medium text-foreground">{{ v.brand }} {{ v.model }}</div>
                <div class="text-xs text-muted-foreground">
                  {{ v.year }} · {{ v.vin || '—' }} · {{ v.plateNumber || '—' }}
                </div>
              </li>
            </ul>
            <p v-else class="p-4 text-sm text-muted-foreground">
              {{ t('forms.addNew.leadDetails.vehicle.noVehicles') }}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            {{ t('common.buttons.cancel') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from 'lucide-vue-next'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@motork/component-library/future/primitives'
import { fetchVehicles } from '@/api/vehicles'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'select'])

const { t } = useI18n()
const query = ref('')
const loading = ref(false)
const results = ref([])

async function runSearch() {
  loading.value = true
  try {
    const { data } = await fetchVehicles({ search: query.value || undefined })
    results.value = data || []
  } finally {
    loading.value = false
  }
}

function selectVehicle(v) {
  emit('select', v)
  emit('update:open', false)
}

watch(
  () => props.open,
  (o) => {
    if (o) {
      query.value = ''
      runSearch()
    }
  }
)
</script>
