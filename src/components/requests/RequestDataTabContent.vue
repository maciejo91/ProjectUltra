<template>
  <div class="space-y-6">
    <!-- Unified Add New Dropdown -->
    <div class="flex justify-end items-center pt-3 pb-1 px-1 mb-4">
      <div class="relative">
        <Button 
          variant="outline" 
          size="sm" 
          @click.stop="showAddMenu = !showAddMenu"
          class="flex items-center gap-2 rounded-md hover:bg-muted"
        >
          <span>Add New</span>
          <ChevronDown class="w-3.5 h-3.5" :class="{ 'rotate-180 transition-transform': showAddMenu }" />
        </Button>
        
        <div 
          v-if="showAddMenu" 
          v-click-outside="() => showAddMenu = false" 
          class="absolute right-0 top-full mt-1 z-50 min-w-[160px] shadow-lg animate-in fade-in slide-in-from-top-1"
        >
          <div class="bg-white border border-border rounded-lg p-1.5 space-y-0.5">
            <button 
              v-for="item in addMenuItems" 
              :key="item.key"
              @click="item.onClick(); showAddMenu = false"
              class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2"
            >
              <component :is="item.icon" class="w-4 h-4 text-muted-foreground" />
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Widget (Note or Attachment) -->
    <div v-if="showNoteWidget || showAttachmentWidget" class="animate-in fade-in slide-in-from-top-2">
      <NoteWidget
        v-if="showNoteWidget"
        :item="editingNoteItem"
        :task-type="taskType"
        :task-id="taskId"
        @save="handleNoteSave"
        @cancel="closeWidgets"
      />
      <AttachmentWidget
        v-if="showAttachmentWidget"
        :item="editingAttachmentItem"
        :task-type="taskType"
        :task-id="taskId"
        @save="handleAttachmentSave"
        @cancel="closeWidgets"
      />
    </div>

    <!-- Combined Chronological List: same style as customer profile feed -->
    <div v-if="allDataItems.length > 0" class="space-y-0 pb-6">
      <FeedItemCard
        v-for="item in allDataItems"
        :key="item.id"
        :item="item"
        :task-type="taskType"
        :customer-initials="customerInitials"
        @edit="handleEdit"
        @delete="$emit(item.type === 'note' ? 'note-delete' : 'attachment-delete', $event)"
      />
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!showNoteWidget && !showAttachmentWidget" class="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border mx-2">
      <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FolderOpen class="w-6 h-6 text-muted-foreground" />
      </div>
      <h4 class="text-foreground font-medium mb-1">No data stored</h4>
      <p class="text-muted-foreground text-sm">Notes and attachments for this request will appear here.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@motork/component-library/future/primitives'
import { ChevronDown, Paperclip, FolderOpen, StickyNote } from 'lucide-vue-next'
import NoteWidget from '@/components/shared/feed/NoteWidget.vue'
import AttachmentWidget from '@/components/shared/feed/AttachmentWidget.vue'
import FeedItemCard from '@/components/shared/feed/FeedItemCard.vue'

const props = defineProps({
  activities: { type: Array, default: () => [] },
  taskType: { type: String, default: 'lead' },
  taskId: { type: [Number, String], default: null },
  customerInitials: { type: String, default: '?' }
})

const emit = defineEmits(['note-save', 'note-delete', 'attachment-save', 'attachment-delete'])

const showAddMenu = ref(false)
const showNoteWidget = ref(false)
const editingNoteItem = ref(null)
const showAttachmentWidget = ref(false)
const editingAttachmentItem = ref(null)

const allDataItems = computed(() =>
  (props.activities || [])
    .filter((a) => a && (a.type === 'note' || a.type === 'attachment'))
    .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
)

const addMenuItems = [
  { key: 'note', label: 'Add note', icon: StickyNote, onClick: openAddNote },
  { key: 'attachment', label: 'Add attachment', icon: Paperclip, onClick: openAddAttachment }
]

function openAddNote() {
  closeWidgets()
  editingNoteItem.value = null
  showNoteWidget.value = true
}

function openAddAttachment() {
  closeWidgets()
  editingAttachmentItem.value = null
  showAttachmentWidget.value = true
}

function closeWidgets() {
  showNoteWidget.value = false
  editingNoteItem.value = null
  showAttachmentWidget.value = false
  editingAttachmentItem.value = null
}

function handleEdit(item) {
  closeWidgets()
  if (item.type === 'note') {
    editingNoteItem.value = item
    showNoteWidget.value = true
  } else if (item.type === 'attachment') {
    editingAttachmentItem.value = item
    showAttachmentWidget.value = true
  }
}

function handleNoteSave(data) {
  closeWidgets()
  emit('note-save', data)
}

function handleAttachmentSave(data) {
  closeWidgets()
  emit('attachment-save', data)
}
</script>
