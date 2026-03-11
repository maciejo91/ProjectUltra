<template>
  <div class="space-y-4">
    <h5 class="font-semibold text-foreground text-sm mb-1">Add delivery date</h5>
    <p class="text-sm text-muted-foreground mb-4">
      Set the date and save to progress to the next step (Collect e-signatures).
    </p>
    <div class="space-y-4">
      <div>
        <Label class="form-label">Delivery Date <span class="text-red-600">*</span></Label>
        <Input
          type="date"
          :model-value="form.deliveryDate"
          @update:model-value="$emit('update:form', { ...form, deliveryDate: $event })"
          :min="minDeliveryDate"
          class="w-full"
        />
      </div>
      <div>
        <Label class="form-label">Time <span class="optional">(optional)</span></Label>
        <Input
          type="time"
          :model-value="form.deliveryTime"
          @update:model-value="$emit('update:form', { ...form, deliveryTime: $event })"
          class="w-full"
        />
      </div>
      <div>
        <Label class="form-label">VIN <span class="optional">(optional, recommended)</span></Label>
        <Input
          type="text"
          :model-value="form.vin"
          @update:model-value="$emit('update:form', { ...form, vin: $event })"
          placeholder="Enter VIN if known"
          class="w-full"
        />
      </div>
      <div>
        <Label class="form-label">Plate number <span class="optional">(optional, recommended)</span></Label>
        <Input
          type="text"
          :model-value="form.plateNumber"
          @update:model-value="$emit('update:form', { ...form, plateNumber: $event })"
          placeholder="Enter plate number if known"
          class="w-full"
        />
      </div>
      <p class="text-xs text-muted-foreground -mt-2">
        At least one of VIN or plate number is required.
      </p>
      <div>
        <Label class="form-label">Driver / owner <span class="optional">(optional)</span></Label>
        <Select
          :model-value="form.driverOwnerId"
          @update:model-value="$emit('update:form', { ...form, driverOwnerId: $event })"
        >
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select driver or owner..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="opt in driverOwnerOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </SelectItem>
            <SelectItem value="unknown">Unknown / N/A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label class="form-label">Delivery Location</Label>
        <Select
          :model-value="form.deliveryLocation"
          @update:model-value="$emit('update:form', { ...form, deliveryLocation: $event })"
        >
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select location..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Dealership">At Dealership</SelectItem>
            <SelectItem value="Customer Address">Customer Address</SelectItem>
            <SelectItem value="Other">Other Location</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label class="form-label">Notes <span class="optional">(optional)</span></Label>
        <Textarea
          :model-value="form.notes"
          @update:model-value="$emit('update:form', { ...form, notes: $event })"
          rows="3"
          placeholder="Add any relevant delivery details..."
          class="w-full"
        />
      </div>
    </div>
    <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
      <Button variant="secondary" @click="$emit('cancel')">
        Cancel
      </Button>
      <Button
        variant="default"
        :disabled="!canSubmit"
        @click="$emit('confirm')"
      >
        Save and continue
      </Button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Button, Label, Input, Textarea, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@motork/component-library/future/primitives'

const props = defineProps({
  form: { type: Object, required: true },
  minDeliveryDate: { type: String, default: '' },
  canSubmit: { type: Boolean, default: false },
  opportunity: { type: Object, default: null }
})

defineEmits(['update:form', 'confirm', 'cancel'])

const driverOwnerOptions = computed(() => {
  const opts = []
  const customer = props.opportunity?.customer
  if (customer?.name) {
    opts.push({ value: String(customer.id || 'customer'), label: customer.name })
  }
  return opts
})
</script>
