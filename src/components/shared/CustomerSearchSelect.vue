<template>
  <div v-click-outside="() => (showResults = false)" class="relative space-y-3">
    <Label v-if="label" class="block text-sm font-semibold text-foreground">{{ label }}</Label>
    <div class="relative w-full">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 shrink-0 text-muted-foreground z-10" />
      <Input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name, email, phone, or company..."
        class="pl-9 w-full h-10"
        @focus="showResults = true"
      />
    </div>

    <Card
      v-if="showResults && filteredOptions.length > 0"
      class="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto shadow-lg"
    >
      <CardContent class="p-0">
        <div
          v-for="contact in filteredOptions"
          :key="contact.id"
          class="flex items-center gap-2 p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 transition-colors"
          @click="selectContact(contact)"
        >
          <div class="w-8 h-8 rounded-full bg-muted text-primary flex items-center justify-center text-sm font-bold shrink-0">
            {{ contact.initials || getInitials(contact) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-foreground truncate">{{ contact.name || [contact.firstName, contact.lastName].filter(Boolean).join(' ') }}</div>
            <div class="text-sm text-muted-foreground truncate">{{ contact.email }}</div>
          </div>
          <ChevronRight class="w-3 h-3 shrink-0 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>

    <Card v-if="modelValue" class="bg-muted border-border">
      <CardContent class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-background text-primary flex items-center justify-center text-sm font-bold border border-border shrink-0">
              {{ modelValue.initials || getInitials(modelValue) }}
            </div>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-foreground truncate">{{ modelValue.name || [modelValue.firstName, modelValue.lastName].filter(Boolean).join(' ') }}</div>
              <div class="text-sm text-muted-foreground truncate">{{ modelValue.email }}</div>
            </div>
          </div>
          <Button
            v-if="showClear"
            variant="ghost"
            size="small"
            class="h-8 w-8 p-0 shrink-0"
            aria-label="Clear selection"
            @click="clearSelection"
          >
            <X class="w-4 h-4 shrink-0" />
          </Button>
          <Button
            v-else-if="changeLabel"
            variant="ghost"
            size="sm"
            class="shrink-0"
            @click="clearSelection"
          >
            {{ changeLabel }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Search, ChevronRight, X } from 'lucide-vue-next'
import { Button, Card, CardContent, Input, Label } from '@motork/component-library/future/primitives'
import { useCustomersStore } from '@/stores/customers'
import { dedupeCustomersForPicker } from '@/utils/dedupeCustomersForPicker'

const props = defineProps({
  modelValue: { type: Object, default: null },
  label: { type: String, default: 'Search Customer' },
  /** When true, only show contacts (for flows that require contact id, e.g. createOpportunityFromContact) */
  contactsOnly: { type: Boolean, default: false },
  /** Show X button to clear. When false and changeLabel is set, show that button instead. */
  showClear: { type: Boolean, default: true },
  /** Alternative to clear: show "Change" button with this label */
  changeLabel: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const customersStore = useCustomersStore()
const searchQuery = ref('')
const showResults = ref(false)

const sourceList = computed(() =>
  props.contactsOnly ? customersStore.contacts : customersStore.customers
)

const filteredOptions = computed(() => {
  const list = dedupeCustomersForPicker(sourceList.value)
  if (!searchQuery.value.trim()) return list.slice(0, 10)
  const q = searchQuery.value.toLowerCase()
  return list
    .filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q)
    )
    .slice(0, 10)
})

function getInitials(c) {
  const name = c.name || [c.firstName, c.lastName].filter(Boolean).join(' ')
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
}

function selectContact(contact) {
  emit('update:modelValue', contact)
  searchQuery.value = contact.name || [contact.firstName, contact.lastName].filter(Boolean).join(' ')
  showResults.value = false
}

function clearSelection() {
  emit('update:modelValue', null)
  searchQuery.value = ''
  showResults.value = false
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) searchQuery.value = v.name || [v.firstName, v.lastName].filter(Boolean).join(' ')
    else searchQuery.value = ''
  },
  { immediate: true }
)

onMounted(() => {
  if (customersStore.customers.length === 0) {
    customersStore.fetchCustomers()
  }
})
</script>
