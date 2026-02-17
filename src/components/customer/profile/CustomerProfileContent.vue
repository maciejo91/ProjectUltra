<template>
  <div class="flex flex-col h-full bg-muted/30">
    <!-- Tabs -->
    <div class="bg-white border-b border-border px-6 sticky top-0 z-10">
      <Tabs
        :model-value="activeTab"
        :tabs="tabs"
        :hide-counts="hideTabCounts"
        @update:model-value="$emit('update:activeTab', $event)"
      />
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <div v-if="activeTab === 'overview'" class="space-y-6 max-w-5xl mx-auto">
        <!-- Highlights -->
        <HighlightsBox :summary="summary" />
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <!-- Activity Feed -->
           <div class="space-y-4">
             <ActivityFeed 
               :activities="activities" 
               @add="$emit('add-activity')"
             />
           </div>
           
           <!-- Upcoming Appointments -->
           <div class="space-y-4">
             <div class="flex items-center justify-between">
               <h3 class="text-lg font-semibold text-foreground">Upcoming appointments</h3>
               <Button variant="outline" size="sm" @click="$emit('add-appointment')">Add</Button>
             </div>
             
             <template v-if="appointments.length > 0">
               <UpcomingAppointments 
                 v-for="app in appointments"
                 :key="app.id"
                 :title="app.title"
                 :date="formatDate(app.start)"
                 :location="app.location"
                 :customerName="app.customerName"
                 :vehicle="app.vehicle"
               />
             </template>
             <div v-else class="text-sm text-muted-foreground italic">No upcoming appointments.</div>
           </div>
        </div>
      </div>
      
      <div v-else-if="activeTab === 'activity'" class="w-full">
        <TaskActivityCard
          :activities="activities"
          :expanded-summaries="expandedSummaries"
          class="w-full"
          @activity-click="() => {}"
          @add-activity="$emit('add-activity', $event)"
        />
      </div>

      <div v-else-if="activeTab === 'negotiations'">
        <NegotiationsList 
          :leads="leads" 
          :opportunities="opportunities"
          @click="handleNegotiationClick"
        />
      </div>
      
      <div v-else-if="activeTab === 'communicate'">
        <CommunicationWidget
          :task-type="'contact'"
          :task-id="customerId"
          :phone-number="phoneNumber || ''"
          :inline="true"
          selection-card-title="Call or send message"
          selection-card-description="Log a call outcome or send an email, SMS or WhatsApp to this customer."
          @save="$emit('communication-save', $event)"
          @cancel="() => {}"
        />
      </div>

      <div v-else-if="activeTab === 'notes'" class="space-y-4">
        <div v-if="!showNoteWidget" class="flex justify-end">
          <Button variant="outline" size="sm" @click="openAddNote">Add note</Button>
        </div>
        <NoteWidget
          v-if="showNoteWidget"
          :item="editingNoteItem"
          :task-type="'contact'"
          :task-id="customerId"
          :hide-header="true"
          @save="handleNoteSave"
          @cancel="showNoteWidget = false; editingNoteItem = null"
        />
        <div v-if="notesItems.length > 0" class="space-y-4">
          <FeedItemCard
            v-for="item in notesItems"
            :key="item.id"
            :item="item"
            task-type="contact"
            :customer-initials="customerInitials"
            @edit="(i) => { editingNoteItem = i; showNoteWidget = true }"
            @delete="$emit('note-delete', $event)"
          />
        </div>
        <div v-else-if="!showNoteWidget" class="text-center py-10 text-muted-foreground text-sm">No notes yet. Add a note to get started.</div>
      </div>
      
      <div v-else-if="activeTab === 'attachments'" class="space-y-4">
        <div v-if="!showAttachmentWidget" class="flex justify-end">
          <Button variant="outline" size="sm" @click="openAddAttachment">Add attachment</Button>
        </div>
        <AttachmentWidget
          v-if="showAttachmentWidget"
          :item="editingAttachmentItem"
          :task-type="'contact'"
          :task-id="customerId"
          @save="handleAttachmentSave"
          @cancel="showAttachmentWidget = false; editingAttachmentItem = null"
        />
        <div v-if="attachmentItems.length > 0" class="space-y-4">
          <FeedItemCard
            v-for="item in attachmentItems"
            :key="item.id"
            :item="item"
            task-type="contact"
            :customer-initials="customerInitials"
            @edit="(i) => { editingAttachmentItem = i; showAttachmentWidget = true }"
            @delete="$emit('attachment-delete', $event)"
          />
        </div>
        <div v-else-if="!showAttachmentWidget" class="text-center py-10 text-muted-foreground text-sm">No attachments yet. Add an attachment to get started.</div>
      </div>
      
      <div v-else-if="activeTab === 'appointments'" class="space-y-4">
        <div class="flex justify-end">
          <Button variant="outline" size="sm" @click="$emit('add-appointment')">Add</Button>
        </div>
        <template v-if="appointments.length > 0">
          <UpcomingAppointments
            v-for="app in appointments"
            :key="app.id"
            :title="app.title"
            :date="formatDate(app.start)"
            :location="app.location"
            :customerName="app.customerName"
            :vehicle="app.vehicle"
          />
        </template>
        <div v-else class="text-center py-10 text-muted-foreground text-sm">No upcoming appointments.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@motork/component-library/future/primitives'
import Tabs from '@/components/customer/widgets/Tabs.vue'
import CommunicationWidget from '@/components/shared/communication/CommunicationWidget.vue'
import NoteWidget from '@/components/customer/activities/NoteWidget.vue'
import AttachmentWidget from '@/components/customer/activities/AttachmentWidget.vue'
import FeedItemCard from '@/components/customer/feed/FeedItemCard.vue'
import HighlightsBox from './HighlightsBox.vue'
import ActivityFeed from './ActivityFeed.vue'
import UpcomingAppointments from './UpcomingAppointments.vue'
import NegotiationsList from './NegotiationsList.vue'
import TaskActivityCard from '@/components/tasks/TaskActivityCard.vue'

const props = defineProps({
  summary: String,
  activities: { type: Array, default: () => [] },
  appointments: { type: Array, default: () => [] },
  leads: { type: Array, default: () => [] },
  opportunities: { type: Array, default: () => [] },
  loading: Boolean,
  phoneNumber: { type: String, default: '' },
  customerId: { type: [Number, String], default: null },
  customerInitials: { type: String, default: '?' },
  hideTabCounts: { type: Boolean, default: false },
  activeTab: { type: String, default: 'overview' }
})

const emit = defineEmits(['add-activity', 'add-appointment', 'communication-save', 'note-save', 'note-delete', 'attachment-save', 'attachment-delete', 'update:activeTab'])

const router = useRouter()
const showNoteWidget = ref(false)
const editingNoteItem = ref(null)
const showAttachmentWidget = ref(false)
const editingAttachmentItem = ref(null)
const expandedSummaries = ref({})

const notesItems = computed(() =>
  (props.activities || []).filter((a) => a && (a.type === 'note')).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
)
const attachmentItems = computed(() =>
  (props.activities || []).filter((a) => a && (a.type === 'attachment')).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
)

const tabs = computed(() => [
  { key: 'overview', label: 'Overview', count: 1 },
  { key: 'communicate', label: 'Communicate', count: 0 },
  { key: 'activity', label: 'Activity', count: (props.activities || []).length },
  { key: 'negotiations', label: 'Negotiations', count: props.leads.length + props.opportunities.length },
  { key: 'notes', label: 'Notes', count: notesItems.value.length },
  { key: 'attachments', label: 'Attachments', count: attachmentItems.value.length },
  { key: 'appointments', label: 'Appointments', count: props.appointments.length }
])

function openAddNote() {
  editingNoteItem.value = null
  showNoteWidget.value = true
}
function openAddAttachment() {
  editingAttachmentItem.value = null
  showAttachmentWidget.value = true
}
function handleNoteSave(data) {
  showNoteWidget.value = false
  editingNoteItem.value = null
  emit('note-save', data)
}
function handleAttachmentSave(data) {
  showAttachmentWidget.value = false
  editingAttachmentItem.value = null
  emit('attachment-save', data)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

const handleNegotiationClick = (item) => {
  if (item.type === 'lead') {
    router.push({ path: `/tasks/${item.id}`, query: { type: 'lead' } })
  } else {
    router.push({ path: `/tasks/${item.id}`, query: { type: 'opportunity' } })
  }
}
</script>
