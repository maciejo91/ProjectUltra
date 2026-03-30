<template>
  <div
    v-if="showCard"
    class="flex w-full min-w-0 shrink-0 flex-col gap-0 overflow-hidden rounded-xl bg-muted p-1"
  >
    <div
      class="flex w-full shrink-0 items-center justify-between gap-2 px-4 py-1"
    >
      <p class="min-w-0 flex-1 text-xs font-normal leading-normal text-muted-foreground">
        {{ titleLabel }}
      </p>
      <div class="flex shrink-0 items-center gap-0.5">
        <span
          class="inline-flex size-6 items-center justify-center rounded-full bg-green-100 text-xs font-normal leading-none text-green-600"
          aria-hidden
        >
          {{ assigneeInitials }}
        </span>
        <DropdownMenu :modal="false">
          <DropdownMenuTrigger as-child>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="size-6 shrink-0 rounded-md text-muted-foreground"
              :aria-label="taskOptionsAria"
            >
              <ChevronDown class="size-3 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="min-w-48 p-1.5">
            <DropdownMenuItem
              class="cursor-pointer rounded-sm px-2 py-1.5 text-sm"
              @select="$emit('open-full-task')"
            >
              {{ openFullTaskLabel }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <div
      class="flex w-full shrink-0 flex-col gap-0 overflow-hidden rounded-lg border border-primary bg-background p-4 shadow-nsc-card"
    >
      <div
        class="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2"
      >
        <p class="min-w-0 flex-1 text-base font-medium leading-normal text-foreground">
          {{ teaserLine }}
        </p>
        <div
          class="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center"
        >
          <Button
            variant="default"
            class="h-9 w-full rounded-sm sm:w-40"
            @click="$emit('manage-task')"
          >
            {{ manageLabel }}
          </Button>
          <Button
            variant="secondary"
            class="h-9 w-full rounded-sm sm:w-auto"
            @click="$emit('not-now')"
          >
            {{ notNowLabel }}
          </Button>
        </div>
      </div>
    </div>
    <div
      v-if="$slots.outcome || $slots['next-attempt']"
      class="flex w-full min-w-0 shrink-0 flex-col gap-4 px-4 pb-4 pt-4"
    >
      <div v-if="$slots.outcome" class="min-w-0">
        <slot name="outcome" />
      </div>
      <div v-if="$slots['next-attempt']" class="min-w-0">
        <slot name="next-attempt" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@motork/component-library/future/primitives'

const props = defineProps({
  showTeaser: {
    type: Boolean,
    default: false
  },
  dismissed: {
    type: Boolean,
    default: false
  },
  teaserLine: {
    type: String,
    default: ''
  },
  assigneeInitials: {
    type: String,
    default: ''
  }
})

defineEmits(['manage-task', 'not-now', 'open-full-task'])

const { t } = useI18n()

const showCard = computed(() => props.showTeaser && !props.dismissed && props.teaserLine)

const titleLabel = computed(() => t('requestDetail.lqfTask.title'))
const manageLabel = computed(() => t('requestDetail.lqfTask.manageTask'))
const notNowLabel = computed(() => t('requestDetail.lqfTask.notNow'))
const openFullTaskLabel = computed(() => t('requestDetail.lqfTask.openFullTaskView'))
const taskOptionsAria = computed(() => t('requestDetail.lqfTask.taskOptionsAria'))
</script>
