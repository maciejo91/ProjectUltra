<template>
  <div v-if="$slots.bottom" class="page-header-with-bottom bg-background">
    <header
      v-if="title || $slots.actions"
      class="page-header-main page-header-no-border"
    >
      <div class="page-header-content">
        <div v-if="title" class="min-w-0 flex-1">
          <h1 class="page-header-title">{{ title }}</h1>
        </div>
        <div v-if="$slots.actions" class="page-header-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </header>
    <div class="section-header-bottom px-4" :class="{ 'section-header-bottom-tabs-only': !title && !$slots.actions }">
      <slot name="bottom"></slot>
    </div>
  </div>
  <template v-else>
    <header class="page-header-main">
      <div class="page-header-content">
        <div v-if="title" class="min-w-0 flex-1">
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
    default: ''
  }
})
</script>
