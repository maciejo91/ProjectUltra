<template>
  <div class="space-y-4">
    <Card class="border-border">
      <CardHeader>
        <CardTitle>Map Columns</CardTitle>
      </CardHeader>
      <CardContent class="space-y-6">
        <p class="text-muted-foreground text-sm">
          Map file columns to {{ entityType }} fields. <span class="text-brand-red">*</span> Required.
        </p>

        <!-- Required Fields -->
        <div v-if="availableFields.required.length > 0" class="space-y-4">
          <h4 class="text-sm font-bold uppercase text-muted-foreground tracking-wider">Required Fields</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="field in availableFields.required"
              :key="field"
              class="space-y-2"
            >
              <Label class="block text-sm font-semibold text-foreground">
                {{ formatFieldName(field) }} <span class="text-brand-red">*</span>
              </Label>
              <Select
                :model-value="mapping[field] || ''"
                @update:model-value="setMapping(field, $event)"
              >
                <SelectTrigger class="w-full h-10" :class="{ 'border-brand-red': errors[field] }">
                  <SelectValue placeholder="-- Select column --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="column in fileColumns"
                    :key="column"
                    :value="column"
                  >
                    {{ column }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p v-if="errors[field]" class="text-brand-red text-sm mt-1">{{ errors[field] }}</p>
            </div>
          </div>
        </div>

        <!-- Optional Fields -->
        <div v-if="availableFields.optional.length > 0" class="space-y-4">
          <h4 class="text-sm font-bold uppercase text-muted-foreground tracking-wider">Optional Fields</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="field in availableFields.optional"
              :key="field"
              class="space-y-2"
            >
              <Label class="block text-sm font-semibold text-foreground">
                {{ formatFieldName(field) }}
              </Label>
              <Select
                :model-value="mapping[field] || ''"
                @update:model-value="setMapping(field, $event)"
              >
                <SelectTrigger class="w-full h-10">
                  <SelectValue placeholder="-- Select column --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="column in fileColumns"
                    :key="column"
                    :value="column"
                  >
                    {{ column }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <!-- Mapping Summary -->
        <Card v-if="summary" class="bg-muted border-border">
          <CardContent>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-1">Mapping Progress</p>
                <p class="text-foreground font-bold text-sm">
                  {{ summary.mappedFields }} / {{ summary.totalFields }} fields mapped
                </p>
              </div>
              <Badge
                :text="`${summary.requiredMapped}/${summary.requiredTotal} required`"
                :theme="summary.requiredMapped === summary.requiredTotal ? 'green' : 'red'"
                size="small"
              />
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Badge, Card, CardHeader, CardTitle, CardContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label } from '@motork/component-library/future/primitives'
import { useColumnMapping } from '@/composables/useColumnMapping'

const props = defineProps({
  entityType: {
    type: String,
    required: true,
    validator: (value) => ['contacts', 'leads', 'opportunities'].includes(value)
  },
  fileColumns: {
    type: Array,
    default: () => []
  },
  mapping: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:mapping'])

const {
  availableFields,
  errors,
  isValid,
  setMapping: setMappingInternal,
  validateMapping,
  getMappingSummary,
  initializeMapping
} = useColumnMapping(computed(() => props.entityType), props.fileColumns)

// Initialize mapping when file columns are available and mapping is empty
watch([() => props.fileColumns, () => props.entityType], ([columns, entityType]) => {
  if (columns && columns.length > 0 && entityType && Object.keys(props.mapping).length === 0) {
    initializeMapping()
    const fields = availableFields.value
    const allFields = [...fields.required, ...fields.optional]
    const initialMapping = {}
    allFields.forEach(field => {
      initialMapping[field] = ''
    })
    emit('update:mapping', initialMapping)
  }
}, { immediate: true })

const summary = computed(() => {
  return getMappingSummary()
})

const setMapping = (field, fileColumn) => {
  setMappingInternal(field, fileColumn)
  emit('update:mapping', { ...props.mapping, [field]: fileColumn })
}

const formatFieldName = (field) => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

defineExpose({
  isValid,
  validateMapping
})
</script>
