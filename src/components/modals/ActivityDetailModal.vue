<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-[90vw] max-w-none max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader class="flex-shrink-0">
          <DialogTitle>{{ getActivityTitle() }}</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-6 py-4 w-full">
          <div class="space-y-4 w-full">
          <!-- Activity Metadata -->
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <component 
                :is="getActivityIcon()" 
                :size="16" 
                :class="getIconClass()"
              />
              <span class="font-medium text-foreground">{{ activity?.user || 'Unknown User' }}</span>
            </div>
            <div>{{ activity?.time || 'Unknown time' }}</div>
          </div>

          <!-- Activity Content -->
          <div 
            class="rounded-lg p-4"
            :style="getContentBackgroundStyle()"
          >
            <!-- Note Content -->
            <div v-if="activity?.type === 'note'">
              <p class="text-sm text-foreground whitespace-pre-line">
                {{ activity?.message || activity?.content || 'No content' }}
              </p>
            </div>

            <!-- Email Content -->
            <div v-else-if="activity?.type === 'email'" class="space-y-3">
              <div v-if="activity?.subject">
                <label class="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
                <p class="text-sm text-foreground">{{ activity.subject }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-muted-foreground mb-1">Message</label>
                <p class="text-sm text-foreground whitespace-pre-line">
                  {{ activity?.content || 'No content' }}
                </p>
              </div>
            </div>

            <!-- WhatsApp Content -->
            <div v-else-if="activity?.type === 'whatsapp'">
              <p class="text-sm text-foreground whitespace-pre-line">
                {{ activity?.content || 'No content' }}
              </p>
            </div>

            <!-- SMS Content -->
            <div v-else-if="activity?.type === 'sms'">
              <p class="text-sm text-foreground whitespace-pre-line">
                {{ activity?.content || 'No content' }}
              </p>
            </div>

            <!-- Survey Content -->
            <div v-else-if="activity?.type === 'survey'" class="space-y-2">
              <div v-for="(answer, question) in getSurveyResponses()" :key="question">
                <label class="block text-sm font-medium text-muted-foreground mb-1">{{ question }}</label>
                <p class="text-sm text-foreground">{{ answer }}</p>
              </div>
            </div>

            <!-- AI Summary Content -->
            <div v-else-if="activity?.type === 'ai-summary'">
              <p class="text-sm text-foreground whitespace-pre-line">
                {{ activity?.message || activity?.content || 'No content' }}
              </p>
            </div>

            <!-- Call Content -->
            <div v-else-if="activity?.type === 'call'">
              <p class="text-sm text-foreground">
                {{ activity?.message || activity?.action || 'No details available' }}
              </p>
            </div>

            <!-- Generic Content -->
            <div v-else>
              <p class="text-sm text-foreground whitespace-pre-line">
                {{ activity?.message || activity?.content || activity?.action || 'No details available' }}
              </p>
        </div>
      </div>
        </div>

        <DialogFooter class="flex-shrink-0">
          <Button
            label="Close"
            variant="outline"
            size="small"
            class="rounded-sm"
            @click="$emit('close')"
          />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { 
  StickyNote, 
  Mail, 
  MessageCircle, 
  Phone,
  FileText,
  Sparkles
} from 'lucide-vue-next'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  activity: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const getActivityTitle = () => {
  if (!props.activity) return 'Activity Details'
  
  const titles = {
    note: 'Note Details',
    email: 'Email Details',
    whatsapp: 'WhatsApp Message',
    sms: 'SMS Message',
    call: 'Call Details',
    survey: 'Survey Response',
    'ai-summary': 'AI Summary'
  }
  
  return titles[props.activity.type] || 'Activity Details'
}

const getActivityDescription = () => {
  if (!props.activity) return ''
  
  return `Created on ${props.activity.time || 'Unknown date'}`
}

const getActivityIcon = () => {
  if (!props.activity) return FileText
  
  const iconMap = {
    note: StickyNote,
    email: Mail,
    whatsapp: MessageCircle,
    sms: MessageCircle,
    call: Phone,
    'ai-summary': Sparkles
  }
  
  return iconMap[props.activity.type] || FileText
}

const getIconClass = () => {
  if (!props.activity) return 'text-gray-600'
  
  const classMap = {
    note: 'text-orange-600',
    email: 'text-blue-600',
    whatsapp: 'text-green-600',
    sms: 'text-purple-600',
    call: 'text-green-600',
    'ai-summary': 'text-purple-600'
  }
  
  return classMap[props.activity.type] || 'text-gray-600'
}

const getContentBackgroundStyle = () => {
  if (!props.activity) return 'background-color: #f5f5f5;'
  
  const bgMap = {
    note: 'background-color: #fef7ee;',
    email: 'background-color: #eff6ff;',
    whatsapp: 'background-color: #dcfce7;',
    sms: 'background-color: #f3e8ff;',
    survey: 'background-color: #f0f9ff;',
    'ai-summary': 'background-color: #f3e8ff;'
  }
  
  return bgMap[props.activity.type] || 'background-color: #f5f5f5;'
}

const getSurveyResponses = () => {
  if (!props.activity?.content) return {}
  
  try {
    const responses = typeof props.activity.content === 'string' 
      ? JSON.parse(props.activity.content) 
      : props.activity.content
    
    return responses
  } catch (e) {
    return {}
  }
}

const handleOpenChange = (isOpen) => {
  if (!isOpen) {
    emit('close')
  }
}
</script>
