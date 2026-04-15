<template>
  <Popover :open="open" @update:open="(v) => (open = v)">
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="shrink-0 rounded-md"
        :aria-label="t('requestDetail.quickActions.messagingMenuAria')"
      >
        <MessageCircle class="size-4 text-muted-foreground" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      class="z-50 w-auto min-w-36 rounded-md border border-border bg-background p-1 shadow-md"
      align="end"
      side="bottom"
      :side-offset="6"
    >
      <div class="flex flex-col gap-0.5">
        <Button
          type="button"
          variant="ghost"
          class="h-9 w-full justify-start rounded-sm px-2 text-sm font-normal"
          @click="pick('sms')"
        >
          {{ t('requestDetail.quickActions.sendSms') }}
        </Button>
        <Button
          type="button"
          variant="ghost"
          class="h-9 w-full justify-start rounded-sm px-2 text-sm font-normal"
          @click="pick('whatsapp')"
        >
          {{ t('requestDetail.quickActions.sendWhatsApp') }}
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessageCircle } from 'lucide-vue-next'
import { Button, Popover, PopoverContent, PopoverTrigger } from '@motork/component-library/future/primitives'

const emit = defineEmits(['select'])

const { t } = useI18n()
const open = ref(false)

function pick(channel) {
  open.value = false
  emit('select', channel)
}
</script>
