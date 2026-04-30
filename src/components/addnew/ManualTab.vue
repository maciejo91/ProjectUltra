<template>
  <div class="flex flex-1 flex-col min-h-0">
    <UnifiedAddForm
      ref="formRef"
      class="min-h-0 w-full min-w-0 flex-1 flex flex-col"
      @submit="$emit('submit', $event)"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UnifiedAddForm from '@/components/addnew/UnifiedAddForm.vue'

defineEmits(['submit'])

const formRef = ref(null)

defineExpose({
  resetSubmitting: () => formRef.value?.resetSubmitting(),
  submit: () => formRef.value?.submit(),
  clear: () => formRef.value?.clear(),
  canSubmit: () => formRef.value?.canSubmit,
  isSubmitting: () => formRef.value?.isSubmitting
})
</script>
