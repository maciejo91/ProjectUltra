<template>
  <div class="relative overflow-hidden rounded-lg border border-border bg-background p-4">
    <div class="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
    <div class="pl-2">
      <ul class="list-inside list-disc space-y-2 text-sm text-foreground">
        <li v-if="summary">{{ summary }}</li>
        <li v-else class="italic text-muted-foreground">No highlights available.</li>
        
        <!-- Mock data from screenshot if no summary -->
        <template v-if="!summary">
          <li>Young professional interested in sporty coupes and performance vehicles.</li>
          <li>Very active on social media and prefers quick communication via SMS or WhatsApp.</li>
          <li>Available mostly on weekends.</li>
          <li>Budget: €35,000-€50,000.</li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  summary: { type: String, default: '' }
})
</script>
