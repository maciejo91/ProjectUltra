<template>
  <div 
    class="overflow-visible p-4 flex flex-col flex-1 min-h-0 rounded-lg bg-white shadow-nsc-card"
    style="border-radius: var(--border-radius-rounded-lg, 10px);"
  >
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-base font-medium text-foreground leading-6">{{ t('entities.activity.title') }}</h3>
        
        <!-- Filter Dropdown, Add Activity Button, and Chips (Right side of title) -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Filter Dropdown -->
          <DropdownMenu :modal="false">
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                class="relative w-8 h-8"
                aria-label="Filter activity"
              >
                <Filter class="w-4 h-4 shrink-0" />
<span 
                v-if="hasActiveFilters"
                class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-primary"
              ></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56" align="end">
              <DropdownMenuItem
                v-for="filter in activityFilters"
                :key="filter.value"
                @select="(e) => { e.preventDefault(); toggleFilter(filter.value); }"
                class="flex items-center gap-2 cursor-pointer"
              >
                <Check
                  v-if="selectedFilters.includes(filter.value)"
                  class="w-4 h-4 shrink-0"
                />
                <span v-else class="w-4 h-4 shrink-0" aria-hidden="true"></span>
                <span>{{ filter.label }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <!-- Add Activity Button: same DropdownMenu as Filter for consistent popover -->
          <DropdownMenu :modal="false">
            <DropdownMenuTrigger as-child>
              <Button
                variant="default"
                size="icon"
                class="relative w-8 h-8"
                aria-label="Add activity"
              >
                <Plus class="w-4 h-4 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-48" align="end">
              <DropdownMenuItem
                v-for="item in addActivityCommunicationItems"
                :key="item.type"
                @select="(e) => { e.preventDefault(); handleAddActivity(item.type); }"
                class="flex items-center gap-2 cursor-pointer"
              >
                <component :is="item.icon" class="w-4 h-4 shrink-0" :class="item.iconClass" />
                <span>{{ item.label }}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                v-for="item in addActivityOtherItems"
                :key="item.type"
                @select="(e) => { e.preventDefault(); handleAddActivity(item.type); }"
                class="flex items-center gap-2 cursor-pointer"
              >
                <component :is="item.icon" class="w-4 h-4 shrink-0" :class="item.iconClass" />
                <span>{{ item.label }}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                v-if="showAddAppointment"
                @select="(e) => { e.preventDefault(); handleAddAppointment(); }"
                class="flex items-center gap-2 cursor-pointer"
              >
                <Calendar class="w-4 h-4 shrink-0 text-purple-600" />
                <span>Schedule appointment</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div> <!-- Close flex items-center justify-between mb-2 -->
      </div> <!-- Close mb-4 -->
    
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div v-if="sortedActivities.length > 0" class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div class="flex flex-col items-start gap-1 mb-4">
          <h3
            class="text-sm font-normal text-muted-foreground leading-normal"
          >
            {{ getActivityDateHeader(sortedActivities) }}
          </h3>
        </div>
        <div class="space-y-4 pb-2">
          <div
            v-for="activity in sortedActivities"
            :key="activity.id"
            class="space-y-2"
          >
            <div
              class="flex flex-col"
              :class="{
                'cursor-pointer hover:opacity-95 transition-opacity':
                  activity.type === 'note' ||
                  activity.type === 'email' ||
                  activity.type === 'whatsapp' ||
                  activity.type === 'customer-email' ||
                  activity.type === 'customer-whatsapp',
              }"
              @click="handleActivityClick(activity)"
            >
              <div class="flex items-center gap-2 flex-nowrap">
                <div
                  :class="[
                    'size-8 rounded-md flex items-center justify-center shrink-0',
                    activity.type === 'note'
                      ? 'bg-orange-100'
                      : activity.type === 'call'
                        ? 'bg-green-100'
                        : activity.type === 'ai-summary'
                          ? 'bg-purple-100'
                          : activity.type === 'email' || activity.type === 'customer-email'
                            ? 'bg-blue-100'
                            :                     activity.type === 'whatsapp' || activity.type === 'customer-whatsapp'
                              ? 'bg-green-100'
                              : activity.type === 'appointment'
                                ? 'bg-purple-100'
                                : 'bg-muted',
                  ]"
                >
                  <StickyNote
                    v-if="activity.type === 'note'"
                    :size="16"
                    class="text-orange-600"
                  />
                  <Phone
                    v-else-if="activity.type === 'call'"
                    :size="16"
                    class="text-green-600"
                  />
                  <Sparkles
                    v-else-if="activity.type === 'ai-summary'"
                    :size="16"
                    class="text-purple-600"
                  />
                  <Mail
                    v-else-if="activity.type === 'email' || activity.type === 'customer-email'"
                    :size="16"
                    class="text-blue-600"
                  />
                  <MessageCircle
                    v-else-if="activity.type === 'whatsapp' || activity.type === 'customer-whatsapp'"
                    :size="16"
                    class="text-green-600"
                  />
                  <Calendar
                    v-else-if="activity.type === 'appointment'"
                    :size="16"
                    class="text-purple-600"
                  />
                  <FileText v-else :size="16" class="text-foreground" />
                </div>
                <div class="flex items-center justify-between gap-2 min-w-0 flex-1 flex-nowrap">
                  <p
                    class="text-sm text-foreground min-w-0 truncate leading-normal"
                  >
                    <span
                      :class="[
                        'font-normal',
                        activity.type === 'ai-summary' ? 'font-medium' : '',
                      ]"
                    >
                      {{ activity.type === 'ai-summary' ? 'MotorKAI' : activity.user }}
                    </span>
                    <span v-if="activity.type === 'note'" class="text-muted-foreground">
                      added a note</span
                    >
                    <span
                      v-else-if="activity.type === 'created'"
                      class="text-muted-foreground"
                    >
                      {{ activity.message || activity.action }}</span
                    >
                    <span v-else-if="activity.type === 'call'" class="text-muted-foreground">
                      {{ ' ' + (activity.message || activity.action) }}</span
                    >
                    <span
                      v-else-if="activity.type === 'ai-summary'"
                      class="text-muted-foreground"
                    >
                      summary</span
                    >
                    <span v-else-if="activity.type === 'email' || activity.type === 'customer-email'" class="text-muted-foreground">
                      {{ ' sent an email' }}</span
                    >
                    <span
                      v-else-if="activity.type === 'whatsapp' || activity.type === 'customer-whatsapp'"
                      class="text-muted-foreground"
                    >
                      {{ ' sent a WhatsApp message' }}</span
                    >
                    <span v-else-if="activity.type === 'appointment'" class="text-muted-foreground">
                      {{ ' ' + (activity.message || activity.title || 'Appointment') }}</span
                    >
                    <span v-else class="text-muted-foreground">
                      {{ ' ' + (activity.message || activity.action) }}</span
                    >
                  </p>
                  <span
                    class="text-sm text-muted-foreground shrink-0 whitespace-nowrap leading-normal"
                  >
                    {{ formatActivityTime(activity) }}
                  </span>
                </div>
              </div>
              <div class="flex-1 min-w-0 pl-10">
                <div
                  v-if="activity.type === 'note' && (activity.message || activity.content)"
                  class="mt-2 bg-amber-50 rounded-lg p-4 backdrop-blur-sm"
                >
                  <p
                    class="text-sm text-foreground wrap-break-word leading-normal"
                  >
                    {{ activity.message || activity.content }}
                  </p>
                </div>
                <div
                  v-if="(activity.type === 'email' || activity.type === 'customer-email') && activity.content"
                  class="mt-2 relative group rounded-lg"
                >
                  <div class="bg-blue-50 rounded-lg p-4">
                    <p
                      class="text-sm text-foreground wrap-break-word leading-normal"
                    >
                      {{ activity.content }}
                    </p>
                  </div>
                  <Button
                    v-if="activity.type === 'customer-email'"
                    variant="outline"
                    size="sm"
                    class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:!bg-background hover:!text-foreground hover:!border-border transition-opacity rounded-sm"
                    @click.stop="handleAddActivity('email')"
                  >
                    <Reply class="w-3.5 h-3.5 shrink-0" />
                    {{ t('entities.activity.reply') }}
                  </Button>
                </div>
                <div
                  v-if="(activity.type === 'whatsapp' || activity.type === 'customer-whatsapp') && activity.content"
                  class="mt-2 relative group rounded-lg"
                >
                  <div class="bg-green-50 rounded-lg p-4">
                    <p
                      class="text-sm text-foreground wrap-break-word leading-normal"
                    >
                      {{ activity.content }}
                    </p>
                  </div>
                  <Button
                    v-if="activity.type === 'customer-whatsapp'"
                    variant="outline"
                    size="sm"
                    class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 hover:!opacity-100 hover:!bg-background hover:!text-foreground hover:!border-border transition-opacity rounded-sm"
                    @click.stop="handleAddActivity('whatsapp')"
                  >
                    <Reply class="w-3.5 h-3.5 shrink-0" />
                    {{ t('entities.activity.reply') }}
                  </Button>
                </div>
                <div
                  v-if="activity.type === 'ai-summary' && (activity.message || activity.content)"
                  class="mt-2 bg-purple-50 rounded-lg p-4"
                >
                  <p
                    class="text-sm text-foreground wrap-break-word leading-normal"
                  >
                    {{ activity.message || activity.content }}
                  </p>
                </div>
                <div
                  v-if="activity.type === 'call'"
                  class="mt-2 bg-muted rounded-lg p-4"
                >
                  <p
                    class="text-sm text-foreground wrap-break-word leading-normal"
                  >
                    {{ getCallSummary(activity) }}
                  </p>
                  <Button
                    v-if="getCallTranscriptLines(activity).length > 0"
                    variant="outline"
                    size="sm"
                    class="mt-3 rounded-sm"
                    @click.stop="openTranscriptDialog(activity)"
                  >
                    {{ t('common.call.showTranscript') }}
                  </Button>
                </div>
                <div
                  v-if="activity.type === 'appointment'"
                  class="mt-2 bg-purple-50 rounded-lg p-4"
                >
                  <p class="text-sm font-medium text-foreground">{{ activity.title || activity.message || 'Appointment' }}</p>
                  <p v-if="activity.location" class="text-sm text-muted-foreground mt-1">{{ activity.location }}</p>
                  <p v-if="activity.customerName" class="text-sm text-muted-foreground">{{ activity.customerName }}</p>
                  <p v-if="activity.vehicle" class="text-sm text-muted-foreground">{{ activity.vehicle }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="py-8 flex-1 flex flex-col justify-center min-h-full">
        <div class="text-center">
          <Clock :size="32" class="mx-auto text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground">No activity yet</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Transcript dialog -->
  <Dialog :open="!!transcriptDialogActivity" @update:open="(open) => !open && (transcriptDialogActivity = null)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent
        class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] flex flex-col"
        :show-close-button="true"
      >
        <DialogHeader class="shrink-0">
          <DialogTitle>{{ t('common.call.transcript') }}</DialogTitle>
        </DialogHeader>
        <div class="flex-1 overflow-y-auto py-4 w-full space-y-3">
          <div
            v-for="(line, idx) in transcriptDialogLines"
            :key="idx"
            class="flex gap-2 text-sm font-mono"
          >
            <span :class="line.speaker === 'Lead' ? 'text-emerald-700 font-semibold shrink-0' : 'text-green-600 font-semibold shrink-0'">{{ line.speaker }}:</span>
            <span class="text-foreground wrap-break-word">{{ line.text }}</span>
          </div>
        </div>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Button } from '@motork/component-library/future/primitives'
import { 
  StickyNote, 
  Mail, 
  MessageCircle, 
  Phone,
  FileText,
  Clock,
  Sparkles,
  Paperclip,
  Filter,
  Plus,
  X,
  Reply,
  Check,
  Calendar
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import { useI18n } from 'vue-i18n'
import { formatTime } from '@/utils/formatters'

const { t } = useI18n()

function formatActivityTime(activity) {
  if (activity?.time) return activity.time
  const ts = activity?.timestamp || activity?.createdAt
  return ts ? formatTime(ts) : ''
}

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  expandedSummaries: {
    type: Object,
    default: () => ({})
  },
  showAddAppointment: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['activity-click', 'toggle-summary-expanded', 'add-activity', 'add-appointment'])

const addActivityCommunicationItems = [
  { type: 'email', label: 'Email', icon: Mail, iconClass: 'text-primary' },
  { type: 'sms', label: 'SMS', icon: MessageCircle, iconClass: 'text-purple-600' },
  { type: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, iconClass: 'text-green-600' },
  { type: 'call', label: 'Call', icon: Phone, iconClass: 'text-green-600' }
]
const addActivityOtherItems = [
  { type: 'note', label: 'Note', icon: StickyNote, iconClass: 'text-orange-600' },
  { type: 'attachment', label: 'Attachment', icon: Paperclip, iconClass: 'text-muted-foreground' }
]

const activityFilters = computed(() => {
  const filters = [
    { label: t('entities.activity.filterAll'), value: 'all' },
    { label: t('entities.activity.filterCommunication'), value: 'communication' },
    { label: t('entities.activity.filterNotes'), value: 'notes' },
    { label: t('entities.activity.filterSystemUpdates'), value: 'system-updates' }
  ]
  if (props.showAddAppointment) {
    filters.splice(3, 0, { label: 'Appointments', value: 'appointments' })
  }
  return filters
})

const selectedFilters = ref(['all'])
const transcriptDialogActivity = ref(null)

function getCallTranscriptLines(activity) {
  const transcription = activity?.data?.transcription || activity?.transcription
  if (!transcription?.leadLines?.length && !transcription?.salesLines?.length) return []
  const lead = transcription.leadLines ?? []
  const sales = transcription.salesLines ?? []
  const lines = []
  const maxLen = Math.max(lead.length, sales.length)
  for (let i = 0; i < maxLen; i++) {
    if (lead[i]) lines.push({ speaker: 'Lead', text: lead[i] })
    if (sales[i]) lines.push({ speaker: 'Sales', text: sales[i] })
  }
  return lines
}

const transcriptDialogLines = computed(() =>
  transcriptDialogActivity.value ? getCallTranscriptLines(transcriptDialogActivity.value) : []
)

function getCallSummary(activity) {
  return activity?.data?.summary || activity?.content || 'Call completed.'
}

function openTranscriptDialog(activity) {
  transcriptDialogActivity.value = activity
}

const toggleFilter = (filterValue) => {
  if (filterValue === 'all') {
    selectedFilters.value = ['all']
  } else {
    const current = selectedFilters.value.filter(v => v !== 'all')
    const index = current.indexOf(filterValue)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(filterValue)
    }
    selectedFilters.value = current.length > 0 ? current : ['all']
  }
}

const hasActiveFilters = computed(() =>
  selectedFilters.value.length > 0 &&
  !(selectedFilters.value.length === 1 && selectedFilters.value[0] === 'all')
)

function getActivityFilterCategory(activity) {
  if (['email', 'sms', 'whatsapp', 'call', 'customer-email', 'customer-whatsapp'].includes(activity.type)) return 'communication'
  if (activity.type === 'note') return 'notes'
  if (activity.type === 'appointment') return 'appointments'
  if (activity.type === 'transcription' || activity.transcription) return 'system-updates'
  if (activity.type === 'system' || activity.type === 'created' || activity.type === 'status') return 'system-updates'
  if (activity.type === 'ai-summary') return 'notes'
  return null
}

const sortedActivities = computed(() => {
  let filtered = [...props.activities]
  const selected = selectedFilters.value
  const showAll = selected.length === 0 || selected.includes('all')
  if (!showAll) {
    filtered = filtered.filter(activity => {
      const category = getActivityFilterCategory(activity)
      return category && selected.includes(category)
    })
  }
  return filtered.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0).getTime()
    const timeB = new Date(b.timestamp || b.createdAt || 0).getTime()
    return timeB - timeA
  })
})

const getActivityDateHeader = (activities) => {
  if (!activities || activities.length === 0) return ''
  
  const mostRecent = activities[0]
  const timestamp = mostRecent.timestamp || mostRecent.createdAt
  
  if (!timestamp) return 'Recent Activity'
  
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  })
}

const handleActivityClick = (activity) => {
  if (['note', 'email', 'whatsapp', 'customer-email', 'customer-whatsapp'].includes(activity.type)) {
    emit('activity-click', activity)
  }
}

const handleAddActivity = (action) => {
  emit('add-activity', action)
}

function handleAddAppointment() {
  emit('add-appointment')
}
</script>

<style scoped>
.size-8 {
  width: 2rem;
  height: 2rem;
}

.wrap-break-word {
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

</style>
