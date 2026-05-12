<template>
  <QuotationReadOnlyAmount :amount="amount" />
</template>

<script setup>
import QuotationReadOnlyAmount from '@/components/addnew/configurator/QuotationReadOnlyAmount.vue'

defineProps({
  amount: { type: Number, default: NaN },
})
</script>
