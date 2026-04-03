<template>
  <div class="bg-purple-50/50 border border-purple-100 rounded-lg p-4">
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
        <Calendar class="w-4 h-4 shrink-0" />
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-sm text-foreground mb-2">{{ appointmentData.type }}</h4>
        <div class="space-y-1.5 text-sm text-gray-600">
          <div class="flex items-center gap-2">
            <Calendar class="w-4 h-4 shrink-0 text-muted-foreground" />
            <span>{{ formattedDate }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 shrink-0 text-muted-foreground" />
            <span>{{ formattedTime }}</span>
          </div>
          <div class="flex items-center gap-2">
            <User class="w-4 h-4 shrink-0 text-muted-foreground" />
            <span>{{ appointmentData.assignee }}</span>
          </div>
        </div>
        <div v-if="appointmentData.status" class="mt-2">
          <span 
            class="inline-flex px-2 py-0.5 rounded text-sm font-semibold"
            :class="getStatusClass(appointmentData.status)"
          >
            {{ appointmentData.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Clock, User } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  appointmentData: {
    type: Object,
    required: true
  }
})

const formattedDate = computed(() => {
  if (!props.appointmentData.date) return ''
  const date = new Date(props.appointmentData.date)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const formattedTime = computed(() => {
  if (!props.appointmentData.time) return ''
  return props.appointmentData.time
})

const getStatusClass = (status) => {
  const classes = {
    'scheduled': 'bg-blue-100 text-blue-700 border border-blue-200',
    'confirmed': 'bg-green-100 text-green-700 border border-green-200',
    'pending': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    'cancelled': 'bg-red-100 text-red-700 border border-red-200'
  }
  return classes[status?.toLowerCase()] || 'bg-muted text-muted-foreground border border-border'
}
</script>

