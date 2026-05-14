<template>
  <div
    class="mk-collapsible-section-card overflow-hidden border border-border rounded-lg"
    :class="elevated ? 'shadow-mk-dashboard-card' : ''"
  >
    <!-- Section Header -->
    <component
      :is="staticHeader ? 'div' : 'button'"
      :type="staticHeader ? undefined : 'button'"
      class="w-full flex items-center justify-between gap-2 py-3 transition-colors text-left"
      :class="[
        noSidePadding ? 'px-0' : 'px-4',
        cardStyle && !staticHeader ? 'bg-white hover:bg-muted/30' : '',
        cardStyle && staticHeader ? 'bg-white' : '',
        !cardStyle && !staticHeader ? 'bg-muted/30 hover:bg-muted/50' : '',
        !cardStyle && staticHeader ? 'bg-muted/30' : '',
        uniformHeaderHeight ? 'min-h-14' : '',
        headerClass,
      ]"
      @click="onHeaderClick"
    >
      <div
        class="flex min-w-0 flex-1 items-center gap-2"
        :class="uniformHeaderHeight ? 'flex-nowrap' : 'flex-wrap'"
      >
        <h5
          class="mb-0 text-foreground"
          :class="[
            titleClass || 'text-sm font-semibold',
            noSidePadding ? 'px-4' : '',
            uniformHeaderHeight ? 'min-w-0 shrink truncate' : 'shrink-0',
          ]"
        >
          {{ title }}
        </h5>
        <slot name="afterTitle" />
      </div>
      <ChevronDown
        v-if="showChevron"
        class="w-3 h-3 shrink-0 text-muted-foreground transition-transform duration-200"
        :class="[{ 'rotate-180': isExpanded }, noSidePadding ? 'mr-4' : '']"
      />
    </component>
    
    <!-- Section Content: no body when staticHeader (compact empty bar per design) -->
    <transition v-if="!staticHeader" name="expand">
      <div v-if="isExpanded" :class="noSidePadding ? 'p-4' : 'px-4 pb-4'">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  isExpanded: {
    type: Boolean,
    default: false
  },
  noSidePadding: {
    type: Boolean,
    default: false
  },
  cardStyle: {
    type: Boolean,
    default: false
  },
  titleClass: {
    type: String,
    default: ''
  },
  /** When true, the header does not toggle expansion (non-interactive bar; use with #afterTitle). */
  staticHeader: {
    type: Boolean,
    default: false,
  },
  /** When false, hides the collapse chevron. */
  showChevron: {
    type: Boolean,
    default: true,
  },
  /** Elevated card shadow (e.g. compact empty header in quotation). */
  elevated: {
    type: Boolean,
    default: false,
  },
  /** Extra classes for the header row (e.g. compact vertical padding). */
  headerClass: {
    type: String,
    default: '',
  },
  /** When true, header uses min-h-14 and single-line title + afterTitle (quotation cards). */
  uniformHeaderHeight: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle'])

function onHeaderClick() {
  if (!props.staticHeader) emit('toggle')
}
</script>

<style scoped>
.mk-collapsible-section-card {
  background-color: var(--base-card);
  color: rgba(0, 0, 0, 1);
  border-color: var(--figma-border);
  background-clip: unset;
  -webkit-background-clip: unset;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 75rem;
  opacity: 1;
}
</style>
