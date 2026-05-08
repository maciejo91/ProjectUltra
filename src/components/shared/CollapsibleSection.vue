<template>
  <div
    class="mk-collapsible-section-card overflow-hidden border border-border rounded-lg"
  >
    <!-- Section Header -->
    <button
      type="button"
      @click="$emit('toggle')"
      class="w-full flex items-center justify-between py-3 transition-colors"
      :class="[
        noSidePadding ? 'px-0' : 'px-4',
        cardStyle ? 'bg-white hover:bg-muted/30' : 'bg-muted/30 hover:bg-muted/50'
      ]"
    >
      <h5
        class="mb-0 text-foreground"
        :class="[
          titleClass || 'text-sm font-semibold',
          noSidePadding ? 'px-4' : ''
        ]"
      >
        {{ title }}
      </h5>
      <ChevronDown
        class="w-3 h-3 shrink-0 text-muted-foreground transition-transform duration-200"
        :class="[{ 'rotate-180': isExpanded }, noSidePadding ? 'mr-4' : '']"
      />
    </button>
    
    <!-- Section Content -->
    <transition name="expand">
      <div v-if="isExpanded" :class="noSidePadding ? 'p-4' : 'px-4 pb-4'">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ChevronDown } from 'lucide-vue-next'

defineProps({
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
  }
})

defineEmits(['toggle'])
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
