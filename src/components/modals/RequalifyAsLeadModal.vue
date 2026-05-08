<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-lg max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>Requalify as Lead</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full space-y-6">
      <div class="flex items-start gap-4 mb-6">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 rounded-sm bg-yellow-100 flex items-center justify-center border border-yellow-200">
            <AlertTriangle class="w-5 h-5 shrink-0 text-yellow-600" />
          </div>
        </div>
        <div class="flex-1">
          <p class="text-meta">
            Requalifying this opportunity will reset its stage and remove negotiation history.
          </p>
        </div>
      </div>
      <!-- What will be lost -->
      <div>
        <h4 class="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
          <X class="w-4 h-4 shrink-0" />
          What will be lost
        </h4>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Minus class="w-3 h-3 shrink-0 text-red-500 mt-1" />
            <span>Opportunity stage and expected close date</span>
          </li>
          <li class="flex items-start gap-2">
            <Minus class="w-3 h-3 shrink-0 text-red-500 mt-1" />
            <span>Opportunity value and negotiation history</span>
          </li>
          <li class="flex items-start gap-2">
            <Minus class="w-3 h-3 shrink-0 text-red-500 mt-1" />
            <span>Stock or configured vehicles added to the opportunity</span>
          </li>
          <li class="flex items-start gap-2">
            <Minus class="w-3 h-3 shrink-0 text-red-500 mt-1" />
            <span>Offer history and negotiation data</span>
          </li>
        </ul>
      </div>

      <!-- What will be kept -->
      <div>
        <h4 class="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
          <CheckCircle class="w-4 h-4 shrink-0" />
          What will be kept
        </h4>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex items-start gap-2">
            <Check class="w-3 h-3 shrink-0 text-green-500 mt-1" />
            <span>Customer information and contact details</span>
          </li>
          <li class="flex items-start gap-2">
            <Check class="w-3 h-3 shrink-0 text-green-500 mt-1" />
            <span>Original requested car details</span>
          </li>
          <li class="flex items-start gap-2">
            <Check class="w-3 h-3 shrink-0 text-green-500 mt-1" />
            <span>All activities (notes, calls, emails, etc.)</span>
          </li>
        </ul>
      </div>

      <!-- Warning notice -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-sm text-yellow-800">
          <Info class="w-4 h-4 shrink-0 mr-2 inline" />
          This action cannot be undone. The opportunity will be permanently removed and replaced with a new lead.
        </p>
      </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
          <Button
            label="Cancel"
            variant="outline"
            size="small"
            class="rounded-sm w-full sm:w-auto"
            @click="$emit('cancel')"
          />
          <Button
            label="Confirm Requalification"
            variant="primary"
            size="small"
            class="rounded-sm w-full sm:w-auto !bg-yellow-600 !hover:bg-yellow-700 !border-yellow-600"
            @click="$emit('confirm')"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { AlertTriangle, X, Minus, CheckCircle, Check, Info } from 'lucide-vue-next'
import { Button } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'

defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('cancel')
  }
}
</script>
