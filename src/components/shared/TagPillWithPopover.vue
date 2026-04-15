<template>
  <Popover :open="open" @update:open="(v) => (open = v)">
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverContent
      class="z-50 w-auto min-w-36 rounded-md border border-border bg-background p-1 shadow-md"
      align="start"
      side="bottom"
      :side-offset="6"
    >
      <div class="flex flex-col gap-0.5">
        <Button
          type="button"
          variant="ghost"
          class="h-9 w-full justify-start gap-2 rounded-sm px-2 text-sm font-normal"
          @click="onEdit"
        >
          <Pencil class="size-3.5 shrink-0 text-muted-foreground" />
          {{ t('requestDetail.tagPopover.edit') }}
        </Button>
        <Button
          type="button"
          variant="ghost"
          class="h-9 w-full justify-start gap-2 rounded-sm px-2 text-sm font-normal text-destructive hover:text-destructive"
          @click="onDelete"
        >
          <Trash2 class="size-3.5 shrink-0" />
          {{ t('requestDetail.tagPopover.delete') }}
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Pencil, Trash2 } from 'lucide-vue-next'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@motork/component-library/future/primitives'

const props = defineProps({
  tag: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const { t } = useI18n()
const open = ref(false)

function onEdit() {
  open.value = false
  emit('edit', props.tag)
}

function onDelete() {
  open.value = false
  emit('delete', props.tag)
}
</script>
