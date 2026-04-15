<template>
  <div
    class="flex flex-col items-center justify-center rounded-lg px-6 py-12 text-center transition-colors md:py-16"
    :class="
      fileDrop
        ? [
            'min-h-56 gap-4 border-2 border-dashed md:min-h-64',
            isFileDragActive
              ? 'border-primary bg-primary/10 shadow-sm'
              : 'border-primary/35 bg-muted/50'
          ]
        : 'min-h-48 border border-border bg-background'
    "
    v-bind="
      fileDrop
        ? {
            onDragenter: onFileDragEnter,
            onDragleave: onFileDragLeave,
            onDragover: onFileDragOver,
            onDrop: onFileDrop
          }
        : {}
    "
  >
    <template v-if="fileDrop">
      <div
        class="mb-4 flex size-12 shrink-0 items-center justify-center rounded-full bg-muted"
        aria-hidden="true"
      >
        <component :is="icon" class="size-6 text-muted-foreground" />
      </div>
      <h3 class="mb-1 text-base font-semibold text-foreground">
        {{
          isFileDragActive
            ? dropHeadlineActive || dropHeadline || title
            : dropHeadline || title
        }}
      </h3>
      <div class="mb-6 max-w-md space-y-2 text-sm text-muted-foreground">
        <p>{{ description }}</p>
        <p v-if="dropHint">{{ dropHint }}</p>
      </div>
      <Button
        v-if="actionLabel"
        variant="outline"
        class="rounded-sm w-full sm:w-auto"
        type="button"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </Button>
    </template>
    <template v-else>
      <div
        class="mb-4 flex size-12 shrink-0 items-center justify-center rounded-full bg-muted"
        aria-hidden="true"
      >
        <component :is="icon" class="size-6 text-muted-foreground" />
      </div>
      <h3 class="mb-1 text-base font-semibold text-foreground">
        {{ title }}
      </h3>
      <div class="mb-6 max-w-md space-y-2 text-sm text-muted-foreground">
        <p>{{ description }}</p>
      </div>
      <Button
        v-if="actionLabel"
        variant="secondary"
        class="rounded-sm w-full sm:w-auto"
        type="button"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </Button>
    </template>
  </div>
</template>

<script setup>
import { Button } from '@motork/component-library/future/primitives'
import { useFileDropZone } from '@/composables/useFileDropZone'

const props = defineProps({
  icon: {
    type: Object,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  actionLabel: {
    type: String,
    default: ''
  },
  fileDrop: {
    type: Boolean,
    default: false
  },
  dropHint: {
    type: String,
    default: ''
  },
  dropHeadline: {
    type: String,
    default: ''
  },
  dropHeadlineActive: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action', 'files-dropped'])

const { isFileDragActive, onFileDragEnter, onFileDragLeave, onFileDragOver, onFileDrop } =
  useFileDropZone({
    onFiles: (files) => {
      if (props.fileDrop) {
        emit('files-dropped', files)
      }
    }
  })
</script>
