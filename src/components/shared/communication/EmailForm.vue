<template>
  <div class="w-full flex flex-col">
    <div class="flex items-center gap-3 py-1 border-b border-border">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.from') }}</span>
      <Input
        v-model="from"
        type="email"
        :placeholder="t('emailForm.placeholders.from')"
        class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8"
      />
    </div>

    <div class="flex items-center gap-3 py-1 border-b border-border">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.to') }}</span>
      <div class="flex-1 min-w-0">
        <div class="flex min-h-8 flex-wrap items-center gap-1">
          <Badge
            v-for="(email, idx) in toList"
            :key="`${email}-${idx}`"
            variant="secondary"
            class="h-8 rounded-md gap-1 pl-2.5 pr-1.5 text-sm leading-none"
          >
            <span class="max-w-[16rem] truncate">{{ email }}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              class="h-6 w-6 rounded-sm p-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
              :aria-label="t('emailForm.recipients.remove')"
              @click="removeTo(idx)"
            >
              <X class="size-3" />
            </Button>
          </Badge>
          <Input
            ref="toInputRef"
            v-model="toDraft"
            type="text"
            :placeholder="toList.length ? '' : t('emailForm.placeholders.to')"
            class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8 text-sm flex-1 min-w-20"
            @keydown="(e) => onRecipientKeydown(e, 'to')"
            @blur="flushRecipientDraft('to')"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 py-1 border-b border-border">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.cc') }}</span>
      <div class="flex-1 min-w-0">
        <div class="flex min-h-8 flex-wrap items-center gap-1">
          <Badge
            v-for="(email, idx) in ccList"
            :key="`${email}-${idx}`"
            variant="secondary"
            class="h-8 rounded-md gap-1 pl-2.5 pr-1.5 text-sm leading-none"
          >
            <span class="max-w-[16rem] truncate">{{ email }}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              class="h-6 w-6 rounded-sm p-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
              :aria-label="t('emailForm.recipients.remove')"
              @click="removeCc(idx)"
            >
              <X class="size-3" />
            </Button>
          </Badge>
          <Input
            ref="ccInputRef"
            v-model="ccDraft"
            type="text"
            :placeholder="ccList.length ? '' : t('emailForm.placeholders.cc')"
            class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8 text-sm flex-1 min-w-20"
            @keydown="(e) => onRecipientKeydown(e, 'cc')"
            @blur="flushRecipientDraft('cc')"
          />
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3 py-1 border-b border-border">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.template') }}</span>
      <Select :model-value="selectedTemplate" @update:model-value="selectTemplate">
        <SelectTrigger class="h-8 min-h-8 w-full border-0 bg-transparent px-0 shadow-none">
          <SelectValue :placeholder="t('emailForm.placeholders.template')" />
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem v-for="template in templates" :key="template" :value="template">
            {{ template }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="flex items-center gap-3 py-1">
      <span class="w-14 text-sm text-muted-foreground shrink-0">{{ t('emailForm.fields.subject') }}</span>
      <Input
        v-model="subject"
        type="text"
        :placeholder="t('emailForm.placeholders.subject')"
        class="border-0 shadow-none focus-visible:ring-0 px-0 h-8 min-h-8"
      />
    </div>

    <div class="py-2">
      <TooltipProvider :delay-duration="150">
        <div class="rounded-md border border-border overflow-hidden bg-background">
          <div class="flex items-center justify-between gap-2 bg-muted px-2 py-1.5 border-b border-border">
            <div class="flex items-center gap-1">
            <Popover :open="textStylePopoverOpen" @update:open="(v) => (textStylePopoverOpen = v)">
              <PopoverTrigger as-child>
                <span class="inline-flex">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="rounded-sm"
                        :aria-label="t('emailForm.editor.textStyle')"
                      >
                        <Type class="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      {{ t('emailForm.editor.textStyle') }}
                    </TooltipContent>
                  </Tooltip>
                </span>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-44 p-2">
                <div class="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="rounded-sm hover:bg-muted"
                    :aria-label="t('emailForm.editor.bold')"
                    @click="applyTextStyle('bold')"
                  >
                    <Bold class="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="rounded-sm hover:bg-muted"
                    :aria-label="t('emailForm.editor.italic')"
                    @click="applyTextStyle('italic')"
                  >
                    <Italic class="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="rounded-sm hover:bg-muted"
                    :aria-label="t('emailForm.editor.underline')"
                    @click="applyTextStyle('underline')"
                  >
                    <Underline class="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="rounded-sm hover:bg-muted"
                    :aria-label="t('emailForm.editor.strikethrough')"
                    @click="applyTextStyle('strikethrough')"
                  >
                    <Strikethrough class="size-4" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger as-child>
                <Select :model-value="fontSize" @update:model-value="setFontSize">
                  <SelectTrigger class="h-7 min-h-7 w-14 rounded-sm bg-background/60 px-1.5 text-xs">
                    <SelectValue :placeholder="t('emailForm.editor.fontSize')" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem v-for="opt in fontSizeOptions" :key="opt" :value="opt">
                      {{ opt }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {{ t('emailForm.editor.fontSize') }}
              </TooltipContent>
            </Tooltip>

            <Popover :open="fontColorPopoverOpen" @update:open="(v) => (fontColorPopoverOpen = v)">
              <PopoverTrigger as-child>
                <span class="inline-flex">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="rounded-sm"
                        :aria-label="t('emailForm.editor.fontColor')"
                      >
                        <Baseline class="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      {{ t('emailForm.editor.fontColor') }}
                    </TooltipContent>
                  </Tooltip>
                </span>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-52 p-2">
                <div class="grid grid-cols-5 gap-2">
                  <Button
                    v-for="opt in fontColorOptions"
                    :key="opt.value"
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="rounded-sm hover:bg-muted"
                    :aria-label="t(opt.labelKey)"
                    @click="selectFontColor(opt.value)"
                  >
                    <span
                      class="size-3.5 rounded-full border border-border"
                      :class="opt.dotClass"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  class="rounded-sm"
                  :aria-label="t('emailForm.editor.bullets')"
                  @click="applyInlineFormatting('bullets')"
                >
                  <List class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {{ t('emailForm.editor.bullets') }}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  class="rounded-sm"
                  :aria-label="t('emailForm.editor.orderedList')"
                  @click="applyInlineFormatting('ordered')"
                >
                  <ListOrdered class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {{ t('emailForm.editor.orderedList') }}
              </TooltipContent>
            </Tooltip>

            <Popover :open="alignmentPopoverOpen" @update:open="(v) => (alignmentPopoverOpen = v)">
              <PopoverTrigger as-child>
                <span class="inline-flex">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="rounded-sm"
                        :aria-label="t('emailForm.editor.alignment')"
                      >
                        <AlignLeft class="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      {{ t('emailForm.editor.alignment') }}
                    </TooltipContent>
                  </Tooltip>
                </span>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-44 p-2">
                <div class="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="rounded-sm hover:bg-muted"
                    :aria-label="t('emailForm.editor.alignLeft')"
                    @click="applyAlignment('align-left')"
                  >
                    <AlignLeft class="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="rounded-sm hover:bg-muted"
                    :aria-label="t('emailForm.editor.alignCenter')"
                    @click="applyAlignment('align-center')"
                  >
                    <AlignCenter class="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="rounded-sm hover:bg-muted"
                    :aria-label="t('emailForm.editor.alignRight')"
                    @click="applyAlignment('align-right')"
                  >
                    <AlignRight class="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    class="rounded-sm hover:bg-muted"
                    :aria-label="t('emailForm.editor.alignJustify')"
                    @click="applyAlignment('align-justify')"
                  >
                    <AlignJustify class="size-4" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  class="rounded-sm"
                  :aria-label="t('emailForm.editor.image')"
                  @click="applyInlineFormatting('image')"
                >
                  <Image class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {{ t('emailForm.editor.image') }}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  class="rounded-sm"
                  :aria-label="t('emailForm.editor.code')"
                  @click="applyInlineFormatting('code')"
                >
                  <Code class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {{ t('emailForm.editor.code') }}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  class="rounded-sm"
                  :aria-label="t('emailForm.editor.link')"
                  @click="applyInlineFormatting('link')"
                >
                  <Link2 class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {{ t('emailForm.editor.link') }}
              </TooltipContent>
            </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  class="h-7 min-h-7 px-2 rounded-sm text-xs font-normal text-foreground hover:text-foreground"
                  :aria-label="t('emailForm.editor.privacyLandingPage')"
                  @click="applyInlineFormatting('privacy')"
                >
                  <Plus class="size-3.5 mr-1.5" />
                  {{ t('emailForm.editor.privacyLandingPage') }}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                {{ t('emailForm.editor.privacyLandingPage') }}
              </TooltipContent>
            </Tooltip>
          </div>
          <div class="px-2 py-2">
            <Textarea
              ref="messageRef"
              v-model="message"
              :placeholder="t('emailForm.placeholders.message')"
              class="min-h-40 border-0 shadow-none focus-visible:ring-0 px-0 resize-none"
            />
          </div>
        </div>
      </TooltipProvider>
    </div>

    <div class="mt-5 pt-0">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div v-if="showAttachButton" class="space-y-2">
            <div class="space-y-0.5">
              <div class="text-sm font-medium text-foreground">
                {{ t('emailForm.attach.label') }}
              </div>
              <div class="text-sm text-muted-foreground">
                {{ t('emailForm.attach.helper') }}
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="secondary"
                  type="button"
                  class="rounded-sm gap-2"
                  :disabled="!recentAttachments.length"
                >
                  <Paperclip class="w-4 h-4 shrink-0" aria-hidden="true" />
                  {{ t('emailForm.attach.fromLeadSpark') }}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-80 p-2">
                <div class="text-xs font-medium text-muted-foreground pb-2">
                  {{ t('emailForm.attach.availableTitle') }}
                </div>
                <div v-if="!recentAttachments.length" class="py-6 text-center text-sm text-muted-foreground">
                  {{ t('emailForm.attach.availableEmpty') }}
                </div>
                <div v-else class="max-h-56 overflow-y-auto space-y-1">
                  <Button
                    v-for="att in recentAttachments"
                    :key="String(att.id ?? att.fileName ?? att.timestamp ?? JSON.stringify(att))"
                    type="button"
                    variant="ghost"
                    class="w-full justify-start rounded-sm text-sm font-normal"
                    @click="addRecentAttachment(att)"
                  >
                    {{ att.fileName || att.name || t('emailForm.attach.fileFallback') }}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="secondary"
              type="button"
              class="rounded-sm gap-2"
              @click="openDeviceFilePicker"
            >
              <Upload class="w-4 h-4 shrink-0" aria-hidden="true" />
              {{ t('emailForm.attach.fromDevice') }}
            </Button>
            <input
              ref="deviceInputRef"
              type="file"
              multiple
              class="hidden"
              @change="onDeviceFilesSelected"
            />
            </div>
          </div>
          <input
            v-else
            ref="deviceInputRef"
            type="file"
            multiple
            class="hidden"
            @change="onDeviceFilesSelected"
          />

          <div v-if="showActions" class="flex items-center justify-end gap-2">
            <Button variant="outline" type="button" class="rounded-sm" @click="$emit('cancel')">
              {{ t('emailForm.actions.cancel') }}
            </Button>
            <Button variant="default" type="button" class="rounded-sm" :disabled="!canSubmit()" @click="handleSend">
              {{ t('emailForm.actions.send') }}
            </Button>
          </div>
        </div>

        <p v-if="attachmentError" class="text-sm text-destructive mt-2">{{ attachmentError }}</p>
        <ul v-if="attachments.length" class="mt-3 space-y-2">
          <li
            v-for="(att, index) in attachments"
            :key="att.source === 'device' ? att.name + index : (att.id ?? att.fileName) + index"
            class="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
          >
            <span class="truncate min-w-0">{{ att.fileName || att.name }}</span>
            <button
              type="button"
              class="shrink-0 text-muted-foreground hover:text-foreground p-1"
              :aria-label="t('emailForm.attach.removeAria')"
              @click="removeAttachment(index)"
            >
              <X class="w-4 h-4" />
            </button>
          </li>
        </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Code,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paperclip,
  Plus,
  Strikethrough,
  Type,
  Underline,
  Upload,
  X
} from 'lucide-vue-next'
import { fetchContactById } from '@/api/contacts'
import { fetchAccountById } from '@/api/accounts'
import { useUserStore } from '@/stores/user'
import {
  Badge,
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@motork/component-library/future/primitives'

const { t } = useI18n()

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024

const props = defineProps({
  draft: {
    type: Object,
    default: null
  },
  showAttachButton: {
    type: Boolean,
    default: true
  },
  initialTo: {
    type: String,
    default: ''
  },
  initialFrom: {
    type: String,
    default: ''
  },
  initialCc: {
    type: String,
    default: ''
  },
  initialTemplate: {
    type: String,
    default: ''
  },
  initialMessage: {
    type: String,
    default: ''
  },
  showActions: {
    type: Boolean,
    default: true
  },
  recentAttachments: {
    type: Array,
    default: () => []
  },
  recipientCustomerId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['send', 'cancel', 'update:valid', 'update:draft'])

const userStore = useUserStore()
const { currentUser } = storeToRefs(userStore)

const selectedTemplate = ref(props.initialTemplate)
const from = ref('')
const to = ref('')
const cc = ref(props.initialCc)
const subject = ref('')
const message = ref(props.initialMessage)
const attachments = ref([])
const attachmentError = ref('')
const deviceInputRef = ref(null)
const isTemplatePopoverOpen = ref(false)
const alignmentPopoverOpen = ref(false)
const fontColorPopoverOpen = ref(false)
const textStylePopoverOpen = ref(false)
const messageRef = ref(null)
const toInputRef = ref(null)
const ccInputRef = ref(null)

const toList = ref([])
const ccList = ref([])

const toDraft = ref('')
const ccDraft = ref('')

const fontSizeOptions = ['12px', '14px', '16px', '18px']
const fontSize = ref(fontSizeOptions[1])

const selectedFontColor = ref('default')

const fontColorOptions = computed(() => [
  { value: 'default', labelKey: 'emailForm.editor.fontColorDefault', dotClass: 'bg-foreground' },
  { value: 'muted', labelKey: 'emailForm.editor.fontColorMuted', dotClass: 'bg-muted-foreground' },
  { value: 'primary', labelKey: 'emailForm.editor.fontColorPrimary', dotClass: 'bg-primary' },
  { value: 'destructive', labelKey: 'emailForm.editor.fontColorDanger', dotClass: 'bg-destructive' },
  { value: 'subtle', labelKey: 'emailForm.editor.fontColorSubtle', dotClass: 'bg-muted' }
])

function selectFontColor(value) {
  selectedFontColor.value = value
  fontColorPopoverOpen.value = false
}

function setFontSize(next) {
  if (typeof next === 'string' && next) fontSize.value = next
  applyInlineFormatting('font-size')
}

function applyAlignment(kind) {
  applyInlineFormatting(kind)
  alignmentPopoverOpen.value = false
}

function applyTextStyle(kind) {
  applyInlineFormatting(kind)
  textStylePopoverOpen.value = false
}

function parseEmailList(raw) {
  return String(raw || '')
    .split(/[,\n;]/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

function syncRecipientStrings() {
  to.value = toList.value.join(', ')
  cc.value = ccList.value.join(', ')
}

function addRecipient(kind, email) {
  const next = String(email || '').trim()
  if (!next) return
  const listRef = kind === 'to' ? toList : ccList
  if (listRef.value.includes(next)) return
  listRef.value = [...listRef.value, next]
  syncRecipientStrings()
}

function removeTo(idx) {
  toList.value = toList.value.filter((_, i) => i !== idx)
  syncRecipientStrings()
}

function removeCc(idx) {
  ccList.value = ccList.value.filter((_, i) => i !== idx)
  syncRecipientStrings()
}

function flushRecipientDraft(kind) {
  const draftRef = kind === 'to' ? toDraft : ccDraft
  const parts = parseEmailList(draftRef.value)
  parts.forEach((p) => addRecipient(kind, p))
  draftRef.value = ''
}

function onRecipientKeydown(event, kind) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    flushRecipientDraft(kind)
  }
  if (event.key === 'Backspace') {
    const draftRef = kind === 'to' ? toDraft : ccDraft
    const listRef = kind === 'to' ? toList : ccList
    if (!draftRef.value && listRef.value.length) {
      listRef.value = listRef.value.slice(0, -1)
      syncRecipientStrings()
    }
  }
}

let recipientEmailRequestId = 0

async function resolveRecipientEmail() {
  const direct = String(props.initialTo || '').trim()
  if (direct) return direct
  const cid = props.recipientCustomerId
  if (cid == null || cid === '') return ''
  try {
    const contact = await fetchContactById(cid)
    return contact?.email || ''
  } catch {
    try {
      const account = await fetchAccountById(cid)
      return account?.email || ''
    } catch {
      return ''
    }
  }
}

function applyDraftToLocal(nextDraft) {
  if (!nextDraft) return
  selectedTemplate.value = nextDraft.template ?? selectedTemplate.value
  from.value = nextDraft.from ?? from.value
  to.value = nextDraft.to ?? to.value
  cc.value = nextDraft.cc ?? cc.value
  subject.value = nextDraft.subject ?? subject.value
  message.value = nextDraft.message ?? message.value
  attachments.value = Array.isArray(nextDraft.attachments) ? [...nextDraft.attachments] : attachments.value

  toList.value = parseEmailList(to.value)
  ccList.value = parseEmailList(cc.value)
}

function buildDraftPayload() {
  return {
    template: selectedTemplate.value,
    from: from.value,
    to: to.value,
    cc: cc.value,
    subject: subject.value,
    message: message.value,
    attachments: [...attachments.value]
  }
}

const isSyncingFromParent = ref(false)
let lastEmittedDraftJson = ''

function emitDraftUpdate() {
  if (!props.draft) return
  if (isSyncingFromParent.value) return

  const payload = {
    ...(props.draft || {}),
    ...buildDraftPayload()
  }

  const json = JSON.stringify(payload)
  if (json === lastEmittedDraftJson) return
  lastEmittedDraftJson = json
  emit('update:draft', payload)
}

function syncComposerParticipants() {
  if (props.draft?.from) {
    from.value = String(props.draft.from || '').trim().replace(/@{2,}/g, '@')
    return
  }
  const nextFromRaw = String(props.initialFrom || '').trim() || currentUser.value?.email || ''
  from.value = String(nextFromRaw || '').trim().replace(/@{2,}/g, '@')
}

watch(
  () => [
    props.initialFrom,
    props.initialTo,
    props.recipientCustomerId,
    currentUser.value?.email
  ],
  async () => {
    syncComposerParticipants()
    if (props.draft?.to) {
      to.value = props.draft.to
      toList.value = parseEmailList(to.value)
      return
    }
    const req = ++recipientEmailRequestId
    const resolved = await resolveRecipientEmail()
    if (req !== recipientEmailRequestId) return
    to.value = resolved
    toList.value = parseEmailList(resolved)
  },
  { immediate: true }
)

watch(
  () => props.draft,
  (next) => {
    if (!next) return
    const incomingJson = JSON.stringify({ ...(next || {}), ...buildDraftPayload() })
    if (incomingJson === lastEmittedDraftJson) return

    isSyncingFromParent.value = true
    applyDraftToLocal(next)
    isSyncingFromParent.value = false
  },
  { immediate: true }
)

watch(
  [selectedTemplate, from, to, cc, subject, message, attachments],
  () => {
    emitDraftUpdate()
  },
  { deep: true }
)

const templateContent = {
  'Follow-up': {
    subject: 'Following up on your inquiry',
    message: 'Hi! I wanted to follow up on our previous conversation. Are you still interested in moving forward? Let me know if you have any questions.'
  },
  'Meeting Confirmation': {
    subject: 'Meeting Confirmation',
    message: 'This is a confirmation for our meeting scheduled on [DATE] at [TIME]. Looking forward to speaking with you!'
  },
  'Quote Proposal': {
    subject: 'Your Quote Proposal',
    message: 'Thank you for your interest! I\'ve prepared a quote based on your requirements. Please find the details attached. Let me know if you have any questions.'
  },
  'Unable to Reach': {
    subject: 'Tried to reach you',
    message: 'I tried reaching you but wasn\'t able to connect. Please let me know a good time to call you back, or feel free to reach out at your convenience.'
  }
}

const templates = Object.keys(templateContent)

const onTemplateChange = (nextTemplate) => {
  if (typeof nextTemplate === 'string') selectedTemplate.value = nextTemplate
  const key = selectedTemplate.value
  if (key && templateContent[key]) {
    subject.value = templateContent[key].subject
    message.value = templateContent[key].message
  }
}

function selectTemplate(nextTemplate) {
  onTemplateChange(nextTemplate)
  isTemplatePopoverOpen.value = false
}

watch(selectedTemplate, (next) => {
  if (!next) return
  const payload = templateContent[next]
  if (!payload) return
  subject.value = payload.subject
  message.value = payload.message
})

function canSubmit() {
  return !!message.value.trim()
}

function totalAttachmentSize() {
  return attachments.value.reduce((sum, att) => {
    if (att.source === 'device' && att.file) return sum + (att.file.size || 0)
    return sum
  }, 0)
}

function openDeviceFilePicker() {
  deviceInputRef.value?.click()
}

function addDeviceFiles(fileList) {
  attachmentError.value = ''
  const files = Array.from(fileList || [])
  let sizeSoFar = totalAttachmentSize()
  for (const file of files) {
    if (sizeSoFar + file.size > MAX_ATTACHMENT_BYTES) {
      attachmentError.value = t('emailForm.attach.errorMaxSize')
      break
    }
    attachments.value.push({ source: 'device', file, name: file.name })
    sizeSoFar += file.size
  }
}

function onDeviceFilesSelected(event) {
  addDeviceFiles(event.target.files)
  event.target.value = ''
}

function removeAttachment(index) {
  attachments.value.splice(index, 1)
  attachmentError.value = ''
}

function addRecentAttachment(att) {
  if (!att) return
  const key = String(att.id ?? att.fileName ?? att.timestamp ?? '')
  const exists = attachments.value.some(
    (a) => String(a.id ?? a.fileName ?? a.timestamp ?? '') === key && key !== ''
  )
  if (exists) return
  attachments.value.push({ ...att, source: att.source || 'leadspark' })
}

function applyInlineFormatting(kind) {
  const el = messageRef.value?.$el?.querySelector?.('textarea') || messageRef.value
  const textarea = el && el.tagName === 'TEXTAREA' ? el : null
  if (!textarea) return
  const start = textarea.selectionStart ?? 0
  const end = textarea.selectionEnd ?? 0
  const raw = String(message.value || '')
  const selected = raw.slice(start, end)

  const insert = (text) => {
    const next = raw.slice(0, start) + text + raw.slice(end)
    message.value = next
    requestAnimationFrame(() => {
      textarea.focus()
      const pos = start + String(text).length
      textarea.setSelectionRange(pos, pos)
    })
  }

  const wrap = (prefix, suffix = prefix) => {
    const next = raw.slice(0, start) + prefix + selected + suffix + raw.slice(end)
    message.value = next
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    })
  }

  if (kind === 'bold') return wrap('**')
  if (kind === 'italic') return wrap('*')
  if (kind === 'underline') return wrap('<u>', '</u>')
  if (kind === 'strikethrough') return wrap('~~')
  if (kind === 'link') return wrap('[', '](https://)')
  if (kind === 'font-size') return wrap(`<span style="font-size:${fontSize.value}">`, '</span>')
  if (kind === 'privacy') return insert(`[${t('emailForm.editor.privacyLandingPage')}](https://)`)
  if (kind === 'text-style') return wrap('<span>', '</span>')
  if (kind === 'bullets') {
    const block = selected || ''
    const lines = block ? block.split('\n') : ['']
    const nextBlock = lines.map((l) => (l.trim().startsWith('- ') ? l : `- ${l}`)).join('\n')
    const next = raw.slice(0, start) + nextBlock + raw.slice(end)
    message.value = next
    return
  }
  if (kind === 'ordered') {
    const block = selected || ''
    const lines = block ? block.split('\n') : ['']
    let i = 1
    const nextBlock = lines.map((l) => `${i++}. ${l.replace(/^\d+\.\s+/, '')}`).join('\n')
    message.value = raw.slice(0, start) + nextBlock + raw.slice(end)
    return
  }
  if (kind === 'code') return wrap('```', '```')
  if (kind === 'image') return wrap('![alt text](', 'https://)')
  if (kind === 'align-left') return wrap('<div style="text-align:left">', '</div>')
  if (kind === 'align-center') return wrap('<div style="text-align:center">', '</div>')
  if (kind === 'align-right') return wrap('<div style="text-align:right">', '</div>')
  if (kind === 'align-justify') return wrap('<div style="text-align:justify">', '</div>')
}

const handleSend = () => {
  if (!message.value.trim()) return
  if (totalAttachmentSize() > MAX_ATTACHMENT_BYTES) {
    attachmentError.value = t('emailForm.attach.errorMaxSize')
    return
  }
  emit('send', {
    type: 'email',
    template: selectedTemplate.value,
    from: from.value,
    to: to.value,
    cc: cc.value,
    subject: subject.value,
    message: message.value,
    attachments: [...attachments.value]
  })
}

watch(message, () => {
  emit('update:valid', canSubmit())
}, { immediate: true })

defineExpose({
  submit: handleSend,
  canSubmit,
  openDeviceFilePicker
})
</script>
