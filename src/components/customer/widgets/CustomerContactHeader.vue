<template>
  <div class="page-header-main">
    <div class="page-header-content">
      <!-- Left: Customer Info -->
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <!-- Avatar -->
        <button
          @click.stop="handleAvatarClick"
          class="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity shrink-0 shadow-sm"
          :class="{ 'cursor-pointer': customerId }"
        >
          <User class="w-5 h-5" />
        </button>

        <!-- Info Stack -->
        <div class="min-w-0 flex-1 flex flex-col justify-center">
          <!-- Name, Entity Type, and Tags -->
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-lg font-semibold text-foreground truncate leading-tight">{{ name }}</h1>
            <span
              v-if="taskType && taskType !== 'contact'"
              class="px-2 py-0.5 rounded text-xs font-medium border shrink-0"
              :class="taskType === 'lead'
                ? 'bg-badge-green text-emerald-700'
                : 'bg-purple-50 text-purple-700 border-purple-200'"
            >
              {{ taskType === 'lead' ? 'Lead' : 'Opportunity' }}
            </span>
            <!-- Tags -->
            <div class="flex items-center gap-1.5">
              <Badge 
                v-for="tag in tags" 
                :key="tag"
                :text="tag"
                size="small"
                theme="blue"
              />
              <button
                @click.stop="handleAddTag"
                class="text-xs text-muted-foreground hover:text-primary font-medium hover:underline flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Plus class="w-3 h-3" />
                <span>tag</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right: Action Buttons -->
      <div class="page-header-actions">
        <Button 
          v-if="showCloseButton"
          variant="secondary" 
          size="icon" 
          @click.stop="$emit('close')"
        >
          <X :size="16" class="text-muted-foreground" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Button, Badge } from '@motork/component-library/future/primitives'
import { X, User, Plus } from 'lucide-vue-next'

const props = defineProps({
  initials: { type: String, required: true },
  name: { type: String, required: true },
  avatarColorClass: { type: String, default: 'bg-orange-100 text-orange-600' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  thirdFieldValue: { type: String, default: '' },
  emailLabel: { type: String, default: 'Email' },
  phoneLabel: { type: String, default: 'Phone' },
  thirdFieldLabel: { type: String, default: 'Expected Close' },
  taskType: { type: String, default: 'lead' },
  customerId: { type: [Number, String], default: null },
  tags: {
    type: Array,
    default: () => []
  },
  showCloseButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-tag', 'close'])
const router = useRouter()

const handleAddTag = () => emit('add-tag')
const handleAvatarClick = () => {
  if (props.customerId) router.push(`/customer/${props.customerId}`)
}
</script>
