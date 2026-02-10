<template>
  <div v-if="$slots.bottom" class="page-header-with-bottom bg-background">
    <header class="page-header-main page-header-no-border">
      <div class="page-header-content">
        <div class="min-w-0 flex-1">
          <h1 class="page-header-title">{{ title }}</h1>
        </div>
        <div v-if="$slots.actions" class="page-header-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </header>
    <div class="section-header-bottom px-4">
      <slot name="bottom"></slot>
    </div>
  </div>
  <template v-else>
    <header class="page-header-main">
      <div class="page-header-content">
        <div class="min-w-0 flex-1">
          <h1 class="page-header-title">{{ title }}</h1>
        </div>
        <div v-if="$slots.actions" class="page-header-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </header>
  </template>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>
