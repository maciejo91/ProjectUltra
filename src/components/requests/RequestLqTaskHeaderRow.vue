<template>
  <div class="flex w-full shrink-0 items-start justify-between gap-2 px-4 py-1.5">
    <div
      v-if="subtitle || (titleCtaHref && titleCtaLabel)"
      ref="titleBlockRef"
      class="min-w-0 flex-1"
    >
      <div class="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-0.5">
        <p
          :id="titleId"
          :class="[
            'min-w-0 max-w-full text-sm font-medium leading-snug',
            onDarkSurface ? 'text-background' : 'text-foreground'
          ]"
        >
          {{ title }}
        </p>
        <a
          v-if="titleCtaHref && titleCtaLabel"
          :href="titleCtaHref"
          class="shrink-0 text-sm font-medium leading-snug underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          :class="
            onDarkSurface
              ? 'text-background hover:text-background/90'
              : 'text-primary hover:text-primary/90'
          "
          @click.stop
        >
          {{ titleCtaLabel }}
        </a>
      </div>
      <p
        v-if="subtitle"
        :class="[
          'mt-0.5 text-sm leading-snug',
          onDarkSurface ? 'text-background/80' : 'text-muted-foreground'
        ]"
      >
        {{ subtitle }}
      </p>
    </div>
    <p
      v-else
      ref="titleBlockRef"
      :id="titleId"
      :class="[
        'min-w-0 flex-1 self-center text-sm font-medium leading-none',
        onDarkSurface ? 'text-background' : 'text-foreground'
      ]"
    >
      {{ title }}
    </p>
    <div class="flex shrink-0 items-center gap-2 self-center">
      <span
        role="timer"
        aria-live="polite"
        :class="[
          'inline-flex h-7 min-h-7 shrink-0 select-none items-center gap-1.5 rounded-full border px-2.5 text-sm font-medium tabular-nums',
          onDarkSurface
            ? 'border-transparent bg-background text-foreground'
            : 'border-border bg-background text-foreground'
        ]"
        :aria-label="timerAria"
        :title="timerTitle"
      >
        <Clock class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span class="leading-none">{{ countdownLabel }}</span>
      </span>
      <Popover
        v-if="assignmentLeadId != null && assignmentLeadId !== ''"
        :open="assignPopoverOpen"
        @update:open="(v) => (assignPopoverOpen = v)"
      >
        <PopoverTrigger as-child>
          <button
            type="button"
            class="flex items-center gap-1.5 shrink-0 rounded-sm text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            :class="
              onDarkSurface
                ? 'text-background/80 hover:text-background'
                : 'text-muted-foreground hover:text-foreground'
            "
            :aria-label="t('requestDetail.lqfTask.assignTaskTitle')"
            @click.stop
          >
            <span class="text-sm leading-none whitespace-nowrap">
              {{ t('common.assignee.assignedTo') }}
            </span>
            <span
              :class="[
                'inline-flex size-7 items-center justify-center rounded-full text-sm font-normal leading-none',
                onDarkSurface
                  ? 'bg-background text-foreground'
                  : 'bg-green-100 text-green-600'
              ]"
              aria-hidden="true"
            >
              {{ assigneeInitials }}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          class="z-50 w-full min-w-80 max-w-md overflow-hidden border border-border bg-background p-0 shadow-nsc-card rounded-xl"
          side="bottom"
          align="end"
          :side-offset="6"
          @click.stop
        >
          <LqTeaserAssignTaskPopoverContent
            :lead-id="assignmentLeadId"
            @assigned="onAssignTaskCompleted"
          />
        </PopoverContent>
      </Popover>
      <div v-else class="flex items-center gap-1.5 shrink-0">
        <span
          class="text-sm leading-none whitespace-nowrap"
          :class="onDarkSurface ? 'text-background/80' : 'text-muted-foreground'"
        >
          {{ t('common.assignee.assignedTo') }}
        </span>
        <span
          :class="[
            'inline-flex size-7 items-center justify-center rounded-full text-sm font-normal leading-none',
            onDarkSurface
              ? 'bg-background text-foreground'
              : 'bg-green-100 text-green-600'
          ]"
          aria-hidden="true"
        >
          {{ assigneeInitials }}
        </span>
      </div>
      <Button
        v-if="showChevron"
        type="button"
        variant="ghost"
        size="icon"
        :class="[
          'size-7 shrink-0 rounded-sm',
          onDarkSurface && 'text-background hover:bg-background/10 hover:text-background'
        ]"
        :aria-label="chevronAriaLabel"
        @click.stop="emit('chevron-click')"
      >
        <ChevronUp v-if="chevronDirection === 'up'" class="size-4" />
        <X v-else class="size-4" />
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronUp, Clock, X } from 'lucide-vue-next'
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@motork/component-library/future/primitives'
import LqTeaserAssignTaskPopoverContent from './LqTeaserAssignTaskPopoverContent.vue'

const { t } = useI18n()

const assignPopoverOpen = ref(false)

defineProps({
  title: {
    type: String,
    required: true
  },
  titleId: {
    type: String,
    default: undefined
  },
  assigneeInitials: {
    type: String,
    default: ''
  },
  countdownLabel: {
    type: String,
    required: true
  },
  timerAria: {
    type: String,
    required: true
  },
  timerTitle: {
    type: String,
    required: true
  },
  showChevron: {
    type: Boolean,
    default: false
  },
  chevronDirection: {
    type: String,
    default: 'down'
  },
  chevronAriaLabel: {
    type: String,
    default: ''
  },
  onDarkSurface: {
    type: Boolean,
    default: false
  },
  subtitle: {
    type: String,
    default: ''
  },
  titleCtaLabel: {
    type: String,
    default: ''
  },
  titleCtaHref: {
    type: String,
    default: ''
  },
  assignmentLeadId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['chevron-click', 'reassigned'])

const titleBlockRef = ref(null)

function focusForPanelTrap() {
  const el = titleBlockRef.value
  if (!el || typeof el.focus !== 'function') return
  el.setAttribute('tabindex', '-1')
  el.focus()
}

function onAssignTaskCompleted() {
  assignPopoverOpen.value = false
  emit('reassigned')
}

defineExpose({ focusForPanelTrap })
</script>
