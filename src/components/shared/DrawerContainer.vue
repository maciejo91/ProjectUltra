<template>
  <!-- Drawer Backdrop -->
  <transition name="fade">
    <div 
      v-if="show"
      class="fixed inset-0 bg-black/50 z-40"
      @click="handleClose"
    ></div>
  </transition>
  
  <!-- Drawer -->
  <transition name="slide-right">
    <div 
      v-if="show"
      class="fixed top-0 right-0 bottom-0 w-full lg:w-4/5 xl:w-3/4 bg-background z-50 shadow-xl flex flex-col overflow-hidden border-l border-border"
    >
      <!-- Content Slot - fills height so TaskDetailView can use independent scroll -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* Drawer Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
