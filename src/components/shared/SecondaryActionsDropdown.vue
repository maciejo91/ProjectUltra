<template>
  <div class="relative">
    <Button
      variant="secondary"
      @click.stop="toggleDropdown"
      :disabled="!actions || actions.length === 0"
      class="inline-flex items-center gap-2 cursor-pointer text-sm"
    >
      <span>More actions</span>
      <ChevronDown 
        class="w-3 h-3 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </Button>

    <!-- Dropdown menu -->
    <div 
      v-if="isOpen && menuItems.length > 0"
      class="absolute right-0 top-full mt-2 z-[1000] w-56 bg-white border border-black/10 rounded-lg shadow-nsc-card py-1"
      v-click-outside="closeDropdown"
      @click.stop
    >
      <button
        v-for="menuItem in menuItems"
        :key="menuItem.key"
        @click="menuItem.onClick"
        :disabled="menuItem.disabled"
        class="w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ menuItem.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps({
  actions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['action-selected'])

const isOpen = ref(false)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleActionClick = (action) => {
  if (action.disabled) return
  
  closeDropdown()
  emit('action-selected', action)
  
  // Call handler if provided
  if (action.handler && typeof action.handler === 'function') {
    action.handler()
  }
}

const menuItems = computed(() => {
  return (props.actions || []).map(action => ({
    key: action.key,
    label: action.label,
    disabled: !!action.disabled,
    onClick: () => handleActionClick(action)
  }))
})
</script>


