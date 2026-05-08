<template>
  <div class="space-y-4 pt-2">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-foreground">Show standard equipment</span>
        <Switch
          :model-value="showStandardEquipmentLocal === true"
          @update:model-value="onShowStandardEquipmentChange"
        />
      </div>

      <button
        type="button"
        class="text-xs font-medium text-muted-foreground hover:text-foreground"
        @click="toggleAll"
      >
        {{ noneExpanded ? 'Expand all' : 'Collapse all' }}
      </button>
    </div>

    <div class="space-y-3">
      <CollapsibleSection
        v-for="group in equipmentByGroup"
        :key="group.name"
        :title="group.name"
        :is-expanded="isExpanded(group.name)"
        @toggle="toggleGroup(group.name)"
      >
        <ul v-if="group.items.length" class="divide-y divide-border">
          <li
            v-for="item in group.items"
            :key="item.id"
            class="flex items-center justify-between gap-3 py-3"
          >
            <label class="flex items-center gap-3 min-w-0 flex-1" :class="isLocked(item) ? 'cursor-not-allowed' : 'cursor-pointer'" :for="`equip-${item.id}`">
              <Checkbox
                :id="`equip-${item.id}`"
                :model-value="!!selection[item.id]"
                :disabled="isLocked(item)"
                @update:model-value="(v) => emit('toggle', item.id, v)"
              />
              <span class="text-sm text-foreground truncate">{{ item.name }}</span>
            </label>

            <span
              class="shrink-0 text-sm font-medium"
              :class="isIncluded(item) ? 'text-mk-green-600' : 'text-foreground'"
            >
              {{ isIncluded(item) ? 'Included' : `+ ${formatAmount(item.price)}` }}
            </span>
          </li>
        </ul>

        <p v-else class="pt-3 text-sm text-muted-foreground">
          No equipment available in this category.
        </p>
      </CollapsibleSection>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Checkbox, Switch } from '@motork/component-library/future/primitives'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'

const props = defineProps({
  equipment: { type: Array, required: true },
  selection: { type: Object, required: true },
  lockedIds: { type: Array, default: () => [] },
  groups: { type: Array, required: true },
  showNetPrices: { type: Boolean, default: false },
  vatRatePercent: { type: Number, default: 0 },
  showStandardEquipment: { type: Boolean, default: true },
})

const emit = defineEmits(['toggle', 'update:show-standard-equipment'])

const showStandardEquipmentLocal = ref(props.showStandardEquipment === true)

watch(
  () => props.showStandardEquipment,
  (v) => {
    showStandardEquipmentLocal.value = v === true
  }
)

function onShowStandardEquipmentChange(v) {
  showStandardEquipmentLocal.value = v === true
  emit('update:show-standard-equipment', showStandardEquipmentLocal.value)
}

const expandedGroups = reactive({})

const allExpanded = computed(() => props.groups.every((name) => expandedGroups[name] !== false))
const noneExpanded = computed(() => props.groups.every((name) => isExpanded(name) === false))

function isExpanded(name) {
  if (!name) return true
  return expandedGroups[name] !== false
}

function toggleGroup(name) {
  expandedGroups[name] = !isExpanded(name)
}

function toggleAll() {
  const next = noneExpanded.value
  for (const name of props.groups) {
    expandedGroups[name] = next
  }
}

const lockedSet = computed(() => new Set(Array.isArray(props.lockedIds) ? props.lockedIds : []))

function isLocked(item) {
  return lockedSet.value.has(item?.id)
}

function isIncluded(item) {
  return Boolean(item?.included) || isLocked(item)
}

const visibleEquipment = computed(() => {
  const list = props.equipment ?? []
  if (!Array.isArray(list)) return []
  if (showStandardEquipmentLocal.value) return list
  return list.filter((item) => !isIncluded(item))
})

const equipmentByGroup = computed(() =>
  props.groups
    .map((name) => ({
      name,
      items: visibleEquipment.value.filter((item) => item.group === name),
    }))
)

function formatAmount(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  const rate = Number(props.vatRatePercent || 0) / 100
  const net = props.showNetPrices && rate > 0 ? n / (1 + rate) : n
  const formatted = `${Math.round(net).toLocaleString()}€`
  return props.showNetPrices ? `${formatted} VAT excl.` : formatted
}
</script>
