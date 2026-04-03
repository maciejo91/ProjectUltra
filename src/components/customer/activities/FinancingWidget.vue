<template>
  <div class="animate-fade-in">
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Start date</Label>
          <Input type="date" v-model="financingData.startDate" />
        </div>
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Expiration date</Label>
          <Input type="date" v-model="financingData.expDate" />
        </div>
      </div>
      <div>
        <Label class="text-sm font-medium text-muted-foreground mb-1">Financial product name</Label>
        <Input type="text" v-model="financingData.productName" placeholder="Enter product name" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Deposit</Label>
          <Input type="number" v-model="financingData.deposit" placeholder="0" />
        </div>
        <div>
          <Label class="text-sm font-medium text-muted-foreground mb-1">Total loan amount</Label>
          <Input type="number" v-model="financingData.loanAmount" placeholder="0" />
        </div>
      </div>
    </div>
    <div v-if="!hideActions" class="flex justify-end gap-2 mt-6 border-t border-border pt-4">
      <Button
        label="Cancel"
        variant="outline"
        size="small"
        class="rounded-sm"
        @click="$emit('cancel')"
      />
      <Button
        label="Save"
        variant="primary"
        size="small"
        class="rounded-sm !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
        :disabled="!financingData.productName"
        @click="handleSave"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Button, Input, Label } from '@motork/component-library/future/primitives'

const props = defineProps({
  item: {
    type: Object,
    default: null
  },
  taskType: {
    type: String,
    default: 'lead'
  },
  taskId: {
    type: [String, Number],
    required: true
  },
  hideActions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const financingData = ref({
  startDate: '',
  expDate: '',
  productName: '',
  deposit: '',
  loanAmount: ''
})

onMounted(() => {
  if (props.item && props.item.data) {
    financingData.value = {
      startDate: props.item.data.startDate || '',
      expDate: props.item.data.expDate || '',
      productName: props.item.data.product || props.item.data.productName || '',
      deposit: props.item.data.deposit || '',
      loanAmount: props.item.data.total || props.item.data.loanAmount || ''
    }
  }
})

const handleSave = () => {
  if (!financingData.value.productName) return
  
  emit('save', {
    id: props.item?.id || Date.now(),
    type: 'financing',
    action: props.item ? 'updated a financing proposal' : 'added a financing proposal',
    data: {
      product: financingData.value.productName,
      provider: 'Audi Financial',
      total: financingData.value.loanAmount || '0',
      monthly: Math.round((parseFloat(financingData.value.loanAmount || 0) / 36)).toString(),
      startDate: financingData.value.startDate,
      expDate: financingData.value.expDate,
      deposit: financingData.value.deposit
    },
    timestamp: props.item?.timestamp || new Date().toISOString(),
    isEdit: !!props.item
  })
}

defineExpose({
  submit: handleSave,
  isValid: computed(() => !!financingData.value.productName)
})
</script>
