<template>
  <div class="flex h-auto max-h-none w-full shrink-0 flex-col">
    <!-- Loading state before outcome (closing / postponing) -->
    <template v-if="outcomeSaving">
      <div class="flex-1 min-h-0 flex items-center justify-center rounded-lg bg-muted/80 py-4" aria-busy="true" aria-label="Saving outcome">
        <Spinner class="size-8 text-foreground shrink-0" />
      </div>
    </template>

    <!-- Success state (post qualify / disqualify / no-answer) -->
    <template v-else-if="successState">
      <div class="pt-1">
        <div
          class="bg-white rounded-lg p-4 shadow-nsc-card flex flex-col relative"
        >
        <div class="flex items-center gap-3">
          <div class="size-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
            <Check :size="16" class="text-green-600" />
          </div>
          <div class="flex-1 pr-10 min-w-0">
            <p class="text-sm font-medium text-foreground">
              {{ successState.statusText }}
            </p>
            <p v-if="successState.reason" class="text-sm text-muted-foreground mt-1">
              {{ successState.reason }}
            </p>
          </div>
        </div>
        <div
          v-if="successState.meeting"
          class="mt-4 bg-white rounded-lg shadow-nsc-card overflow-hidden"        >
          <div class="grid grid-cols-2 gap-3 p-4 text-sm">
            <div>
              <span class="text-muted-foreground">Date:</span>
              <span class="ml-2 font-medium text-foreground">{{ successState.meeting.date }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Time:</span>
              <span class="ml-2 font-medium text-foreground">{{ successState.meeting.time }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Type:</span>
              <span class="ml-2 font-medium text-foreground capitalize">{{ successState.meeting.title }}</span>
            </div>
            <div>
              <span class="text-muted-foreground">Assigned to:</span>
              <span class="ml-2 font-medium text-foreground">{{ successState.meeting.location }}</span>
            </div>
          </div>
        </div>
        <div v-if="successState.kind === 'not-interested'" class="flex justify-end mt-4">
          <Button
            variant="outline"
            size="small"
            class="flex items-center gap-2 cursor-pointer"
            @click="handleReopen"
          >
            <RotateCcw :size="14" />
            Re-open
          </Button>
        </div>
        </div>
      </div>
      <div class="py-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>Updated by {{ successState.actorName || 'Unknown' }}</span>
        <span class="tabular-nums">{{ successPerformedAtLabel }}</span>
      </div>
    </template>

    <template v-else>
      <!-- Loading: until lead data (and hasPhone) is known -->
      <template v-if="isLeadDataLoading">
        <div
          v-if="hideContactCard"
          class="flex items-center justify-center py-6"
          aria-busy="true"
          aria-label="Loading"
        >
          <Spinner class="size-6 text-foreground shrink-0" />
        </div>
        <div v-else class="pt-1">
          <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden">
            <div class="p-8 flex items-center justify-center gap-3 min-h-[120px]" aria-busy="true" aria-label="Loading">
              <Spinner class="size-6 text-foreground shrink-0" />
              <span class="text-sm text-muted-foreground">Loading...</span>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
      <!-- Contact block: white card (padding matches opportunity management cards) -->
      <div v-if="!hideContactCard" class="pt-1">
        <div
          class="bg-white rounded-lg shadow-nsc-card overflow-hidden"
        >
        <DeadlineBanner
          :next-action-due="lead.nextActionDue"
          :show-deadline-banner="showDeadlineBanner"
          :task-id="lead.id"
        />
        <div class="p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-base leading-normal font-medium text-foreground min-w-0 flex-1">{{ contactDescription }}</p>
            <!-- Call Interface when lead has phone; otherwise email card -->
            <CallInterface
              v-if="hasPhone"
              :inline="true"
              class="shrink-0"
              :is-call-active="isCallActive"
              :call-ended="callEnded"
              :call-duration="callDuration"
              :call-notes="callNotes"
              :formatted-call-duration="formattedCallDuration"
              :mock-transcription="mockTranscription"
              :contact-attempts="contactAttempts"
              :max-contact-attempts="maxContactAttempts"
              :lead-summary="leadSummary"
              :caller-name="callerName"
              :assigned-person-name="currentUser?.name ?? ''"
              :is-muted="isMuted"
              @start-call="startCall"
              @end-call="onEndCall"
              @close="onCallClose"
              @toggle-mute="toggleMute"
              @log-manual-call="logManualCall"
              @extract-information="handleExtractInformation"
              @update:call-notes="updateCallNotes"
              @copy-number="copyNumber"
            />
          </div>
        </div>
      </div>
    </div>

      <!-- Grey outcome area: outcome selection and expanded cards -->
      <div class="mk-expanded-cards-area space-y-4" :class="hideContactCard ? 'pt-0' : ''">
        <!-- No phone: email form + inline conversations -->
        <div v-if="!hasPhone && !successState" class="space-y-4">
          <LQTaskSendEmailCard
            :lead="lead"
            :contact-name="lead.customer?.name ?? 'the customer'"
            :recent-attachments="recentAttachmentsForEmail"
          />
          <div id="lqtask-conversations" class="space-y-4">
            <h4 class="text-sm font-medium text-foreground">Conversations</h4>
            <RequestConversationsTabContent :activities="conversationActivities" />
          </div>
        </div>
        <!-- Inline Outcome Selection (when lead has phone) -->
        <div v-else-if="!successState" class="space-y-4">
            <div v-if="!selectedOutcome">
            <p class="text-sm font-medium text-foreground leading-normal mb-3">{{ t('requestDetail.floatingLq.outcomeQuestion') }}</p>
            <div class="outcome-toggle-group grid grid-cols-3 gap-3">
              <Toggle
                variant="outline"
                :model-value="selectedOutcome === 'answer'"
                @update:model-value="(p) => selectOutcome(p ? 'answer' : null)"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
              >
                <span class="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Phone :size="14" class="text-muted-foreground" />
                </span>
                <span>Answer</span>
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="selectedOutcome === 'no-answer'"
                @update:model-value="(p) => selectOutcome(p ? 'no-answer' : null)"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
              >
                <span class="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
                  <PhoneOff :size="14" class="text-muted-foreground" />
                </span>
                <span>No answer</span>
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="selectedOutcome === 'not-valid'"
                @update:model-value="(p) => selectOutcome(p ? 'not-valid' : null)"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
              >
                <span class="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
                  <X :size="14" class="text-muted-foreground" />
                </span>
                <span>Not valid</span>
              </Toggle>
            </div>
          </div>

          <!-- What's next? (when outcome is no-answer or answer) -->
          <div v-if="selectedOutcome === 'no-answer'" class="space-y-2">
            <div class="space-y-2 mb-2">
              <div>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  :aria-label="t('requestDetail.lqfTask.backToCallOutcome')"
                  @click="handleBackToCallOutcome"
                >
                  <ArrowLeft class="size-4" aria-hidden="true" />
                </button>
              </div>
              <p class="text-sm font-medium text-foreground leading-normal">{{ t('requestDetail.lqfTask.nextStepQuestion') }}</p>
            </div>
            <div class="outcome-toggle-group grid grid-cols-2 gap-3 w-4/5">
              <Toggle
                variant="outline"
                :model-value="selectedNextStep === 'postpone'"
                @update:model-value="(p) => setNextStep(p ? 'postpone' : null)"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
              >
                <Clock :size="14" class="shrink-0 text-muted-foreground" />
                <span>Postpone</span>
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="selectedNextStep === 'close-lead'"
                @update:model-value="(p) => setNextStep(p ? 'close-lead' : null)"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
              >
                <X :size="14" class="shrink-0 text-muted-foreground" />
                <span>Close</span>
              </Toggle>
            </div>
          </div>
          <div v-if="selectedOutcome === 'answer' && !selectedNextStep" class="space-y-2 w-full">
            <div class="space-y-2 mb-2">
              <div>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  :aria-label="t('requestDetail.lqfTask.backToCallOutcome')"
                  @click="handleBackToCallOutcome"
                >
                  <ArrowLeft class="size-4" aria-hidden="true" />
                </button>
              </div>
              <p class="text-sm font-medium text-foreground leading-normal">{{ t('requestDetail.lqfTask.nextStepQuestion') }}</p>
            </div>
            <div class="outcome-toggle-group grid grid-cols-3 gap-3 w-4/5">
              <Toggle
                variant="outline"
                :model-value="selectedNextStep === 'interested'"
                @update:model-value="(p) => setNextStep(p ? 'interested' : null)"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
              >
                <ThumbsUp :size="14" class="shrink-0 text-muted-foreground" />
                <span>Interested</span>
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="selectedNextStep === 'not-interested'"
                @update:model-value="(p) => setNextStep(p ? 'not-interested' : null)"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
              >
                <ThumbsDown :size="14" class="shrink-0 text-muted-foreground" />
                <span>Not interested</span>
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="selectedNextStep === 'postpone'"
                @update:model-value="(p) => setNextStep(p ? 'postpone' : null)"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
              >
                <Clock :size="14" class="shrink-0 text-muted-foreground" />
                <span>Postpone</span>
              </Toggle>
            </div>
          </div>

          <!-- No Answer + Postpone: follow-up and next call attempt -->
          <div v-if="selectedOutcome === 'no-answer' && selectedNextStep === 'postpone'" ref="expandedOutcomeRef" class="space-y-4">
            <div>
              <button
                type="button"
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                :aria-label="t('requestDetail.lqfTask.backToWhatsNext')"
                @click="handleBackToWhatsNextChoices"
              >
                <ArrowLeft class="size-4" aria-hidden="true" />
              </button>
            </div>
            <!-- When did you call field -->
            <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-4">
              <Label class="form-label">When did you call?</Label>
              <Input
                type="datetime-local"
                v-model="callLogDateTime"
                class="w-full"
              />
            </div>
            
            <!-- Send follow-up message -->
            <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-4">
              <h5 class="font-semibold text-foreground text-sm mb-4">Send follow-up message</h5>
              
              <!-- Channel Selection -->
              <div class="followup-channel-toggle-group flex flex-wrap gap-2 mb-4">
                <Toggle
                  variant="outline"
                  :model-value="followupChannel === 'whatsapp'"
                  @update:model-value="(p) => p && setFollowupChannel('whatsapp')"
                  class="followup-toggle-item"
                >
                  <MessageCircle class="w-3 h-3 shrink-0" />
                  <span>WhatsApp</span>
                </Toggle>
                <Toggle
                  variant="outline"
                  :model-value="followupChannel === 'sms'"
                  @update:model-value="(p) => p && setFollowupChannel('sms')"
                  class="followup-toggle-item"
                >
                  <MessageCircle class="w-3 h-3 shrink-0" />
                  <span>SMS</span>
                </Toggle>
                <Toggle
                  variant="outline"
                  :model-value="followupChannel === 'email'"
                  @update:model-value="(p) => p && setFollowupChannel('email')"
                  class="followup-toggle-item"
                >
                  <Mail class="w-3 h-3 shrink-0" />
                  <span>Email</span>
                </Toggle>
                <Toggle
                  variant="outline"
                  :model-value="followupChannel === 'dont-send'"
                  @update:model-value="(p) => p && setFollowupChannel('dont-send')"
                  class="followup-toggle-item"
                >
                  <X class="w-3 h-3 shrink-0" />
                  <span>Don't send</span>
                </Toggle>
              </div>
              
              <!-- Template and editable message (only show if channel selected and not 'dont-send') -->
              <div v-if="followupChannel && followupChannel !== 'dont-send'" class="space-y-4">
                <!-- Template (for WhatsApp, template content is not editable) -->
                <div>
                  <Label class="form-label">Template</Label>
                  <Select v-model="selectedTemplate">
                    <SelectTrigger class="w-full h-10 min-h-10">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="followup-1">Follow-up 1</SelectItem>
                      <SelectItem value="followup-2">Follow-up 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <!-- Message (read-only for WhatsApp templates) -->
                <div>
                  <Label class="form-label">Message</Label>
                  <Textarea
                    v-model="followupMessageBody"
                    rows="4"
                    class="w-full resize-none border-border bg-background text-foreground"
                    placeholder="Select a template or type your message..."
                    :readonly="followupChannel === 'whatsapp'"
                  />
                </div>
              </div>
            </div>
            
            <!-- Next call attempt -->
            <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-4">
              <h5 class="font-semibold text-foreground text-sm mb-4">Next call attempt</h5>
              <div class="reschedule-toggle-group flex flex-wrap gap-2">
                <Toggle
                  variant="outline"
                  :model-value="rescheduleTime === 'tomorrow-9am'"
                  @update:model-value="(p) => p && setRescheduleTime('tomorrow-9am')"
                  class="followup-toggle-item"
                >
                  Tomorrow 9:00 AM
                </Toggle>
                <Toggle
                  variant="outline"
                  :model-value="rescheduleTime === 'monday'"
                  @update:model-value="(p) => p && setRescheduleTime('monday')"
                  class="followup-toggle-item mk-ai-mode-active-toggle"
                >
                  <Sparkles
                    :size="14"
                    class="mk-sparkles-icon shrink-0"
                    :fill="rescheduleTime === 'monday' ? 'url(#sparkles-gradient)' : 'currentColor'"
                    :stroke="rescheduleTime === 'monday' ? 'none' : 'currentColor'"
                    :stroke-width="rescheduleTime === 'monday' ? 0 : 1.5"
                  />
                  Suggest AI time
                </Toggle>
                <Toggle
                  variant="outline"
                  :model-value="rescheduleTime === 'custom'"
                  @update:model-value="(p) => p && setRescheduleTime('custom')"
                  class="followup-toggle-item"
                >
                  Select time
                </Toggle>
              </div>
              <!-- AI Suggestion Details -->
              <div v-if="rescheduleTime === 'monday' && aiSuggestionData" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-start gap-2">
                  <Lightbulb class="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                  <div class="flex-1">
                    <p class="text-sm font-semibold text-foreground mb-1">
                      {{ aiSuggestionData.formattedDate }} at {{ aiSuggestionData.time }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      {{ aiSuggestionData.reason }}
                    </p>
                  </div>
                </div>
              </div>
              <!-- Custom Time Selection -->
              <div v-if="rescheduleTime === 'custom'" class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <Label class="form-label">Date</Label>
                  <Input type="date" v-model="customDate" class="w-full" />
                </div>
                <div>
                  <Label class="form-label">Time</Label>
                  <Input type="time" v-model="customTime" class="w-full" />
                </div>
              </div>
              <!-- Assigned to (next attempt) -->
              <div class="mt-4">
                <Label class="form-label">Assigned to</Label>
                <SelectMenu
                  v-model="selectedNextAttemptKey"
                  :items="nextAttemptAssigneeOptions"
                  value-key="_key"
                  placeholder="Assign next attempt to..."
                  class="w-full"
                >
                  <template #item="{ item }">
                    <div class="flex items-center gap-2">
                      <div
                        v-if="item.type === 'user'"
                        class="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                        :class="getRoleAvatarClass(item.role)"
                      >
                        {{ getInitials(item.name) }}
                      </div>
                      <Users v-else-if="item.type === 'team'" class="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span class="font-medium text-foreground">{{ item.label }}</span>
                    </div>
                  </template>
                </SelectMenu>
              </div>
              <!-- Note to assignee (no-answer + postpone) -->
              <div class="mt-4">
                <Label class="form-label">Note to assignee</Label>
                <Textarea
                  v-model="noteForNextAttemptAssignee"
                  rows="3"
                  class="w-full resize-none border-border bg-background text-foreground"
                  placeholder="Add any notes or instructions for the assignee..."
                />
              </div>
            </div>
          </div>

          <!-- No Answer + Close lead: reuse close reason card -->
          <div v-if="selectedOutcome === 'no-answer' && selectedNextStep === 'close-lead'" ref="expandedOutcomeRef" class="space-y-4">
            <div>
              <button
                type="button"
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                :aria-label="t('requestDetail.lqfTask.backToWhatsNext')"
                @click="handleBackToWhatsNextChoices"
              >
                <ArrowLeft class="size-4" aria-hidden="true" />
              </button>
            </div>
            <div class="bg-white rounded-lg p-4 shadow-nsc-card">
              <Label class="form-label">When did you call?</Label>
              <Input
                type="datetime-local"
                v-model="callLogDateTime"
                class="w-full"
              />
            </div>
            <CloseAsLostForm
              :preselected-reason="disqualifyReason"
              close-button-label="Close"
              @close="handleCloseFromFormNoAnswer"
              @cancel="cancelOutcome"
              @update:reason="setDisqualifyReason"
            />
          </div>

          <!-- Not Valid (or Answer + Not interested): close as lost -->
          <div v-if="(selectedOutcome === 'not-valid') || (selectedOutcome === 'answer' && selectedNextStep === 'not-interested')" ref="expandedOutcomeRef" class="space-y-4">
            <div v-if="selectedOutcome === 'answer' && selectedNextStep === 'not-interested'">
              <button
                type="button"
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                :aria-label="t('requestDetail.lqfTask.backToWhatsNext')"
                @click="handleBackToWhatsNextChoices"
              >
                <ArrowLeft class="size-4" aria-hidden="true" />
              </button>
            </div>
            <p
              v-if="selectedOutcome === 'not-valid'"
              class="text-sm font-medium text-foreground leading-normal mb-2"
            >
              {{ t('requestDetail.lqfTask.nextStepQuestion') }}
            </p>
            <!-- When did you call field -->
            <div class="bg-white rounded-lg p-4 shadow-nsc-card">
              <Label class="form-label">When did you call?</Label>
              <Input
                type="datetime-local"
                v-model="callLogDateTime"
                class="w-full"
              />
            </div>
            <CloseAsLostForm
              :preselected-reason="disqualifyReason"
              close-button-label="Close"
              @close="handleCloseFromForm"
              @cancel="cancelOutcome"
              @update:reason="setDisqualifyReason"
            />
          </div>

      <!-- Answer + Interested (Inline) -->
          <div v-if="selectedOutcome === 'answer' && selectedNextStep === 'interested'" ref="expandedOutcomeRef" class="space-y-4">
            <div>
              <button
                type="button"
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                :aria-label="t('requestDetail.lqfTask.backToWhatsNext')"
                @click="handleBackToWhatsNextChoices"
              >
                <ArrowLeft class="size-4" aria-hidden="true" />
              </button>
            </div>
            <!-- Info note -->
            <div class="text-sm text-muted-foreground">
              <span class="text-red-600">*</span> Required fields
            </div>
            
            <!-- When did you call field -->
            <div class="bg-white rounded-lg p-4 shadow-nsc-card">
              <Label class="form-label">When did you call?</Label>
              <Input
                type="datetime-local"
                v-model="callLogDateTime"
                class="w-full"
              />
            </div>
            <!-- Enrich Lead Card (collapsible, collapsed by default) -->
            <div ref="enrichLeadSectionRef" class="bg-white rounded-lg shadow-nsc-card overflow-hidden">
              <CollapsibleSection
                title="Enrich lead"
                :is-expanded="enrichLeadExpanded"
                card-style
                @toggle="enrichLeadExpanded = !enrichLeadExpanded"
              >
                <div class="space-y-4 pt-1">
                <!-- Customer interest level -->
                <div>
                  <Label class="form-label">Customer interest level?</Label>
                  <div class="flex gap-4">
                    <Label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        v-model="enrichLeadData.interestLevel"
                        value="High"
                        class="w-4 h-4 text-brand-blue focus:ring-brand-blue border-gray-300"
                      />
                      <span class="text-sm text-muted-foreground">High</span>
                    </Label>
                    <Label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        v-model="enrichLeadData.interestLevel"
                        value="Medium"
                        class="w-4 h-4 text-brand-blue focus:ring-brand-blue border-gray-300"
                      />
                      <span class="text-sm text-muted-foreground">Medium</span>
                    </Label>
                    <Label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        v-model="enrichLeadData.interestLevel"
                        value="Low"
                        class="w-4 h-4 text-brand-blue focus:ring-brand-blue border-gray-300"
                      />
                      <span class="text-sm text-muted-foreground">Low</span>
                    </Label>
                  </div>
                </div>

                <!-- Expected purchase timeline -->
                <div>
                  <Label class="form-label">Expected purchase timeline?</Label>
                  <Select v-model="enrichLeadData.purchaseTimeline">
                    <SelectTrigger class="w-full h-10 min-h-10">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Immediate">Immediate</SelectItem>
                      <SelectItem value="Within 1 month">Within 1 month</SelectItem>
                      <SelectItem value="Within 3 months">Within 3 months</SelectItem>
                      <SelectItem value="Within 6 months">Within 6 months</SelectItem>
                      <SelectItem value="Just browsing">Just browsing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <!-- Budget range -->
                <div>
                  <Label class="form-label">Budget range (if discussed)?</Label>
                  <Select v-model="enrichLeadData.budgetRange">
                    <SelectTrigger class="w-full h-10 min-h-10">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under €30k">Under €30k</SelectItem>
                      <SelectItem value="€30k-€50k">€30k-€50k</SelectItem>
                      <SelectItem value="€50k-€80k">€50k-€80k</SelectItem>
                      <SelectItem value="€80k+">€80k+</SelectItem>
                      <SelectItem value="Not discussed">Not discussed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <!-- Additional notes -->
                <div>
                  <Label class="form-label">Additional notes</Label>
                  <Textarea 
                    v-model="enrichLeadData.additionalNotes"
                    rows="4" 
                    class="w-full"
                    placeholder="Any relevant information about customer interest or preferences..."
                  />
                </div>
                </div>

                <div class="flex justify-end gap-2 mt-4">
                  <Button
                    label="Save"
                    variant="primary"
                    size="small"
                    @click="handleEnrichLeadSave"
                  />
                </div>
              </CollapsibleSection>
            </div>

            <div class="space-y-4">
              <!-- Schedule: filters + event type + calendar / slots -->
              <div ref="eventTypeExpandedRef" class="bg-white rounded-lg shadow-nsc-card overflow-x-hidden overflow-y-visible p-4">
                <h5 class="font-semibold text-foreground text-sm mb-4">{{ t('forms.schedule.title') }} <span class="text-red-600">*</span></h5>

                <div
                  v-if="qualificationScheduleSummaryVisible"
                  class="rounded-lg border border-border bg-muted/40 overflow-hidden"
                >
                  <div class="flex min-w-0 gap-0">
                    <div class="w-1 shrink-0 bg-primary" aria-hidden="true" />
                    <div class="flex-1 min-w-0 p-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div class="space-y-3 min-w-0 flex-1">
                        <p class="text-sm font-semibold text-foreground leading-snug">
                          {{ qualificationScheduleEventTypeLabel }}
                        </p>
                        <p class="text-sm text-foreground">
                          <span class="text-muted-foreground">{{ t('forms.schedule.summary.dateTime') }}</span>
                          {{ selectedQualificationDateLabel }}
                          <span class="text-muted-foreground" aria-hidden="true"> · </span>
                          {{ qualificationSelectedSlot }}
                        </p>
                        <div class="flex items-start gap-3 min-w-0">
                          <span class="text-sm text-muted-foreground shrink-0 pt-0.5">{{ t('forms.schedule.assignee.label') }}</span>
                          <div class="flex items-center gap-2 min-w-0">
                            <div
                              v-if="qualificationScheduleSummaryAssigneeIsUser"
                              class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                              :class="getRoleAvatarClass(qualificationSelectedSalesman?.role)"
                            >
                              {{ getInitials(qualificationSelectedSalesman?.name) }}
                            </div>
                            <div
                              v-else
                              class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"
                            >
                              <Users class="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <span class="text-sm font-medium text-foreground truncate">{{ qualificationScheduleSummaryAssigneeName }}</span>
                          </div>
                        </div>
                        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                          <span class="text-muted-foreground shrink-0">{{ t('forms.schedule.dealership.label') }}</span>
                          <span class="text-foreground">{{ qualificationScheduleSummaryDealership || '—' }}</span>
                        </div>
                        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
                          <span class="text-muted-foreground shrink-0">{{ t('forms.schedule.team.label') }}</span>
                          <span class="text-foreground">{{ qualificationScheduleSummaryTeamName || '—' }}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        class="rounded-sm shrink-0 w-full sm:w-auto"
                        @click="openQualificationScheduleEditor"
                      >
                        <Pencil class="w-4 h-4 shrink-0 mr-2" aria-hidden="true" />
                        {{ t('forms.schedule.summary.edit') }}
                      </Button>
                    </div>
                  </div>
                </div>

                <template v-else>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
                  <div>
                    <Label class="form-label mb-2">{{ t('forms.schedule.dealership.label') }}</Label>
                    <SelectMenu
                      v-model="qualificationScheduleDealershipSelect"
                      :items="scheduleDealershipSelectOptions"
                      :placeholder="t('forms.schedule.dealership.placeholder')"
                      value-key="value"
                      class="w-full"
                    >
                      <template #item="{ item }">
                        <span>{{ item.label }}</span>
                      </template>
                    </SelectMenu>
                  </div>
                  <div>
                    <Label class="form-label mb-2">{{ t('forms.schedule.team.label') }}</Label>
                    <SelectMenu
                      v-model="qualificationScheduleTeamSelect"
                      :items="scheduleTeamSelectOptions"
                      :placeholder="t('forms.schedule.team.placeholder')"
                      value-key="value"
                      class="w-full"
                    >
                      <template #item="{ item }">
                        <span>{{ item.label }}</span>
                      </template>
                    </SelectMenu>
                  </div>
                  <div>
                    <Label class="form-label mb-2">{{ t('forms.schedule.assignee.label') }}</Label>
                    <SelectMenu
                      v-model="qualificationScheduleAssigneeSelect"
                      :items="scheduleAssigneeSelectOptions"
                      :placeholder="t('forms.schedule.assignee.placeholder')"
                      value-key="value"
                      class="w-full"
                    >
                      <template #item="{ item }">
                        <span>{{ item.label }}</span>
                      </template>
                    </SelectMenu>
                  </div>
                </div>

                <div class="mb-4">
                  <Label class="form-label mb-2">{{ t('forms.schedule.eventType.label') }} <span class="text-red-600">*</span></Label>
                  <SelectMenu
                    v-model="qualificationEventType"
                    :items="qualificationEventTypeOptionsForSelect"
                    :placeholder="t('forms.schedule.eventType.placeholder')"
                    value-key="value"
                    class="w-full"
                  >
                    <template #item="{ item }">
                      <span>{{ item.label }}</span>
                    </template>
                  </SelectMenu>
                </div>

                <!-- Calendar and Time Slots - Two Column Layout -->
                <div
                  v-if="qualificationEventType && qualificationSelectedDate"
                  class="min-w-0 bg-white rounded-lg border border-border overflow-x-hidden overflow-y-visible"
                >
                  <div
                    class="flex min-w-0 flex-col md:flex-row md:items-start md:divide-x md:divide-black/5"
                  >
                    <div class="shrink-0 max-w-full min-w-0 md:min-w-80">
                      <MiniCalendar
                        v-model="qualificationSelectedDate"
                        :preserve-day-when-changing-month="true"
                        class="gap-2 p-3"
                      />
                    </div>

                    <!-- Right column: unique time slots; slot opens popover (assignee list) -->
                    <div class="min-w-0 overflow-x-hidden p-4 flex flex-col md:flex-1">
                      <div
                        class="flex items-center gap-3 mb-3 shrink-0 min-w-0 w-full"
                      >
                        <h6 class="text-sm font-semibold text-foreground min-w-0 truncate">
                          {{ selectedQualificationDateLabel }}
                        </h6>
                        <div
                          v-if="scheduleHeaderAssigneeDisplay"
                          class="flex items-center gap-2 ml-auto min-w-0 shrink"
                        >
                          <div
                            v-if="scheduleHeaderAssigneeDisplay.kind === 'user'"
                            class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                            :class="getRoleAvatarClass(scheduleHeaderAssigneeDisplay.role)"
                          >
                            {{ getInitials(scheduleHeaderAssigneeDisplay.name) }}
                          </div>
                          <div
                            v-else
                            class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"
                          >
                            <Users class="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span class="text-sm font-medium text-foreground truncate text-right min-w-0">
                            {{ scheduleHeaderAssigneeDisplay.name }}
                          </span>
                        </div>
                      </div>
                      <div
                        v-if="qualificationSelectedDate && uniqueSlotsForSelectedDate.length > 0"
                        class="flex flex-col gap-2 w-full"
                      >
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          <div
                            v-for="column in scheduleSlotColumnsDisplay"
                            :key="column.key"
                            class="flex flex-col min-w-0"
                          >
                            <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground shrink-0 mb-2">
                              {{ column.label }}
                            </p>
                            <div
                              class="schedule-slot-toggle-group flex flex-col gap-2"
                            >
                              <template v-for="slot in column.slots" :key="slot">
                              <button
                                v-if="!shouldPickAssigneeViaPopover"
                                type="button"
                                class="schedule-slot-toggle-item w-full shrink-0 transition-colors"
                                :class="{ 'hover:bg-muted': !isScheduleSlotConfirmed(slot) }"
                                :aria-pressed="isScheduleSlotConfirmed(slot) ? 'true' : 'false'"
                                @click="handleScheduleSlotDirectSelect(slot)"
                              >
                                {{ slot }}
                              </button>
                              <Popover
                                v-else
                                :open="openScheduleSlotPopover === slot"
                                @update:open="(v) => onScheduleSlotPopoverOpenChange(slot, v)"
                              >
                                <PopoverTrigger as-child>
                                  <button
                                    type="button"
                                    class="schedule-slot-toggle-item w-full shrink-0 transition-colors"
                                    :class="{ 'hover:bg-muted': !isScheduleSlotConfirmed(slot) }"
                                    :aria-pressed="isScheduleSlotConfirmed(slot) ? 'true' : 'false'"
                                  >
                                    {{ slot }}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  class="min-w-96 max-w-2xl p-0 rounded-lg border border-border bg-background shadow-lg"
                                  side="bottom"
                                  align="start"
                                >
                                  <div class="p-3 flex flex-col gap-3 min-w-0">
                                    <p class="text-sm font-medium text-foreground">{{ t('forms.schedule.slotPopover.people') }}</p>
                                    <Input
                                      v-model="scheduleSlotAssigneeSearchQuery"
                                      type="search"
                                      :placeholder="t('forms.schedule.slotPopover.searchPlaceholder')"
                                      class="w-full"
                                      :aria-label="t('forms.schedule.slotPopover.searchPlaceholder')"
                                      autocomplete="off"
                                    />
                                    <div class="max-h-56 overflow-y-auto space-y-1 min-h-0">
                                      <button
                                        v-for="item in assigneesFilteredForSlot(slot)"
                                        :key="item.assigneeId"
                                        type="button"
                                        class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-left border transition-colors"
                                        :class="isScheduleSlotItemSelected(slot, item)
                                          ? 'border-primary bg-muted/50'
                                          : 'border-transparent hover:bg-muted'"
                                        @click="selectScheduleSlotAssignee(slot, item)"
                                      >
                                        <div
                                          v-if="item.type === 'user'"
                                          class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                                          :class="item.avatarClass"
                                        >
                                          {{ getInitials(item.name) }}
                                        </div>
                                        <div
                                          v-else
                                          class="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"
                                        >
                                          <Users class="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <span class="min-w-0 flex-1 flex flex-col gap-0.5 text-left">
                                          <span class="text-sm font-medium text-foreground truncate">{{ item.name }}</span>
                                          <span class="text-xs text-muted-foreground truncate">{{ item.departmentLabel }}</span>
                                        </span>
                                      </button>
                                      <p
                                        v-if="
                                          assigneesAvailableForSlot(slot).length > 0 &&
                                          assigneesFilteredForSlot(slot).length === 0
                                        "
                                        class="text-sm text-muted-foreground px-3 py-2 text-center"
                                      >
                                        {{ t('forms.schedule.slotPopover.noResults') }}
                                      </p>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              </template>
                            </div>
                          </div>
                        </div>
                        <Button
                          v-if="scheduleSlotsExceedsCollapsedMax"
                          type="button"
                          variant="secondary"
                          size="sm"
                          class="w-full shrink-0 rounded-sm"
                          @click="scheduleTimeSlotsExpanded = !scheduleTimeSlotsExpanded"
                        >
                          {{
                            scheduleTimeSlotsExpanded
                              ? t('forms.schedule.timeSlots.showLess')
                              : t('forms.schedule.timeSlots.showMore')
                          }}
                        </Button>
                      </div>
                      <div v-else-if="qualificationSelectedDate && uniqueSlotsForSelectedDate.length === 0" class="text-sm text-muted-foreground py-4 text-center">
                        {{ t('forms.schedule.timeSlots.noSlots') }}
                      </div>
                      <div v-else class="text-sm text-muted-foreground py-4 text-center">
                        {{ t('forms.schedule.timeSlots.selectDate') }}
                      </div>
                    </div>
                  </div>
                </div>
                </template>

                <div
                  v-if="isQualificationScheduleComplete"
                  class="mt-4 pt-4 border-t border-border"
                >
                  <Label class="text-sm font-medium text-foreground mb-2 block" :for="qualificationScheduleInternalNoteId">
                    {{ t('forms.schedule.summary.internalNote') }}
                  </Label>
                  <Textarea
                    :id="qualificationScheduleInternalNoteId"
                    v-model="qualificationScheduleInternalNote"
                    rows="2"
                    class="w-full min-h-16 text-sm resize-y"
                    :placeholder="t('forms.schedule.summary.internalNotePlaceholder')"
                    :aria-label="t('forms.schedule.summary.internalNote')"
                  />
                </div>
              </div>

              <!-- Automated communications (after slot + assignee are set) -->
              <AppointmentCommunications
                :appointment="{
                  type: qualificationEventType,
                  date: qualificationSelectedDate,
                  time: qualificationSelectedSlot,
                  duration: qualificationDurationValue
                }"
                :customer="lead.customer"
                :salesperson="qualificationSelectedSalesman"
                :team="qualificationSelectedTeam"
                :dealership="qualificationSelectedTeam?.dealership ? { name: qualificationSelectedTeam.dealership } : null"
                @update="handleCommunicationsUpdate"
              />
            </div>
          </div>
        </div>
        
        <!-- Unified Action Buttons at Bottom Right of Gray Wrapper (hidden for Answer + Postpone; buttons appear below postpone card) -->
        <div v-if="hasActiveOutcomeSelection && !successState && !(selectedOutcome === 'answer' && selectedNextStep === 'postpone')" class="flex justify-end gap-2 pt-3 flex-wrap">
          <Button
            variant="secondary"
            @click="cancelOutcome"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            :disabled="!canConfirmAction"
            @click="handleConfirmAction"
            class="bg-primary text-white"
          >
            {{ actionButtonLabel }}
          </Button>
        </div>

        <!-- Next call attempt: when Answer + Postpone -->
        <div v-if="selectedOutcome === 'answer' && selectedNextStep === 'postpone'" ref="postponeBlockRef">
          <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-4 w-full">
            <div class="space-y-2 mb-4">
              <div>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  :aria-label="t('requestDetail.lqfTask.backToWhatsNext')"
                  @click="handleBackToWhatsNextChoices"
                >
                  <ArrowLeft class="size-4" aria-hidden="true" />
                </button>
              </div>
              <h5 class="font-semibold text-foreground text-sm">Next call attempt</h5>
            </div>
            <div class="reschedule-toggle-group flex flex-wrap gap-2">
              <Toggle
                variant="outline"
                :model-value="rescheduleTime === 'tomorrow-9am'"
                @update:model-value="(p) => p && setRescheduleTime('tomorrow-9am')"
                class="followup-toggle-item"
              >
                Tomorrow 9:00 AM
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="rescheduleTime === 'monday'"
                @update:model-value="(p) => p && setRescheduleTime('monday')"
                class="followup-toggle-item mk-ai-mode-active-toggle"
              >
                <Sparkles
                  :size="14"
                  class="mk-sparkles-icon shrink-0"
                  :fill="rescheduleTime === 'monday' ? 'url(#sparkles-gradient)' : 'currentColor'"
                  :stroke="rescheduleTime === 'monday' ? 'none' : 'currentColor'"
                  :stroke-width="rescheduleTime === 'monday' ? 0 : 1.5"
                />
                Suggest AI time
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="rescheduleTime === 'custom'"
                @update:model-value="(p) => p && setRescheduleTime('custom')"
                class="followup-toggle-item"
              >
                Select time
              </Toggle>
            </div>
            <div v-if="rescheduleTime === 'monday' && aiSuggestionData" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-start gap-2">
                <Lightbulb class="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                <div class="flex-1">
                  <p class="text-sm font-semibold text-foreground mb-1">
                    {{ aiSuggestionData.formattedDate }} at {{ aiSuggestionData.time }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ aiSuggestionData.reason }}
                  </p>
                </div>
              </div>
            </div>
            <div v-if="rescheduleTime === 'custom'" class="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label class="form-label">Date</Label>
                <Input type="date" v-model="customDate" class="w-full" />
              </div>
              <div>
                <Label class="form-label">Time</Label>
                <Input type="time" v-model="customTime" class="w-full" />
              </div>
            </div>
            <!-- Mark as scheduled recall appointment -->
            <div v-if="rescheduleTime" class="mt-3 flex items-center gap-2">
              <Checkbox
                :id="`mark-recall-answer-${lead.id}`"
                v-model:checked="markAsScheduledRecall"
                class="rounded border-border"
              />
              <Label :for="`mark-recall-answer-${lead.id}`" class="text-sm font-normal text-foreground cursor-pointer">
                Mark as scheduled recall appointment
              </Label>
            </div>
            <!-- Assigned to (next attempt) -->
            <div class="mt-4">
              <Label class="form-label">Assigned to</Label>
              <SelectMenu
                v-model="selectedNextAttemptKey"
                :items="nextAttemptAssigneeOptions"
                value-key="_key"
                placeholder="Assign next attempt to..."
                class="w-full"
              >
                <template #item="{ item }">
                  <div class="flex items-center gap-2">
                    <div
                      v-if="item.type === 'user'"
                      class="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                      :class="getRoleAvatarClass(item.role)"
                    >
                      {{ getInitials(item.name) }}
                    </div>
                    <Users v-else-if="item.type === 'team'" class="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span class="font-medium text-foreground">{{ item.label }}</span>
                  </div>
                </template>
              </SelectMenu>
            </div>
            <!-- Note to assignee (answer + postpone) -->
            <div class="mt-4">
              <Label class="form-label">Note to assignee</Label>
              <Textarea
                v-model="noteForNextAttemptAssignee"
                rows="3"
                class="w-full resize-none border-border bg-background text-foreground"
                placeholder="Add any notes or instructions for the assignee..."
              />
            </div>
          </div>
        </div>

        <!-- Cancel + Confirm postpone below the card (Answer + Postpone only) -->
        <div
          v-if="selectedOutcome === 'answer' && selectedNextStep === 'postpone' && !successState"
          class="flex w-full flex-col gap-2 pt-3 sm:flex-row sm:flex-wrap sm:justify-end"
        >
          <Button variant="secondary" class="w-full rounded-sm sm:w-auto" @click="cancelOutcome">
            Cancel
          </Button>
          <Button
            variant="primary"
            :disabled="!canPostponeFromInterested"
            class="w-full rounded-sm bg-primary text-white sm:w-auto"
            @click="onConfirmPostpone"
          >
            Postpone
          </Button>
        </div>
      </div>
      </template>
    </template>

    <!-- Note Modal -->
    <NoteWidget
      ref="noteWidgetRef"
      modal
      :show="showNoteModal"
      :item="null"
      :task-type="'lead'"
      :task-id="lead.id"
      @save="handleNoteSave"
      @close="showNoteModal = false"
      @cancel="showNoteModal = false"
    />

    <!-- Assignment Modal -->
    <ReassignUserModal
      :show="showAssignmentModal"
      title="Assign to salesman"
      confirm-label="Assign"
      @confirm="handleAssignmentConfirm"
      @close="showAssignmentModal = false"
    />


    <!-- Purchase Method Modal (standalone: skip intermediate purchaseMethodsStore call) -->
    <PurchaseMethodModal
      :show="showFinancingModal"
      :task-type="'lead'"
      :task-id="lead.id"
      :purchase-method="editingFinancingOption"
      standalone
      @save="handlePurchaseMethodSave"
      @save-start="financingActionLoading = true"
      @save-end="financingActionLoading = false"
      @delete="handleFinancingDelete"
      @close="showFinancingModal = false; editingFinancingOption = null"
    />

    <!-- Add Trade-In Modal -->
    <AddVehicleModal
      :show="showVehicleModal"
      mode="tradein"
      :task-type="'lead'"
      :task-id="lead.id"
      :customer-id="lead.customerId"
      :item="editingTradeIn"
      :loading="tradeInActionLoading"
      @close="showVehicleModal = false; editingTradeIn = null"
      @save="handleVehicleSave"
      @delete="handleTradeInDelete"
    />

  </div>
</template>

<script setup>
import { ref, computed, toRef, watch, nextTick, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  Button,
  Checkbox,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Label,
  Input,
  Textarea,
  Toggle,
  Spinner
} from '@motork/component-library/future/primitives'
import { SelectMenu } from '@motork/component-library/future/components'

const { t } = useI18n()
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@motork/component-library/future/primitives'
import { Check, PhoneOff, ThumbsUp, ThumbsDown, Clock, RotateCcw, CalendarCheck, Phone, AlertTriangle, MessageCircle, Mail, X, Sparkles, Lightbulb, Plus, Users, Pencil, ArrowLeft } from 'lucide-vue-next'
import NoteWidget from '@/components/shared/feed/NoteWidget.vue'
import ReassignUserModal from '@/components/modals/ReassignUserModal.vue'
import PurchaseMethodModal from '@/components/modals/PurchaseMethodModal.vue'
import AddVehicleModal from '@/components/modals/AddVehicleModal.vue'
import { useTradeInVehicle } from '@/composables/useTradeInVehicle'
import CommunicationSelector from '@/components/shared/communication/CommunicationSelector.vue'
import { useUsersStore } from '@/stores/users'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { useLeadsStore } from '@/stores/leads'
import { useToastStore } from '@/stores/toast'
import { formatDate, formatTime } from '@/utils/formatters'
import { defineAsyncComponent } from 'vue'
import { mergeContactIntoDescription, getNoPhoneContactDescription } from '@/utils/taskActionTitle'
import { useLeadActions } from '@/composables/useLeadActions'
import { LEAD_STAGES } from '@/utils/stageMapper'
import { useLQWidgetCall } from '@/composables/useLQWidgetCall'
import { useLQWidgetOutcomes } from '@/composables/useLQWidgetOutcomes'
import { useLQWidgetHandlers } from '@/composables/useLQWidgetHandlers'
import CallInterface from '@/components/tasks/lead/CallInterface.vue'

const LQTaskSendEmailCard = defineAsyncComponent(() =>
  import('@/components/tasks/lead/LQTaskSendEmailCard.vue')
)
import DeadlineBanner from '@/components/tasks/shared/DeadlineBanner.vue'
import AppointmentCommunications from '@/components/shared/communication/AppointmentCommunications.vue'
import MiniCalendar from '@/components/calendar/MiniCalendar.vue'
import CloseAsLostForm from '@/components/shared/CloseAsLostForm.vue'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'
import RequestConversationsTabContent from '@/components/requests/RequestConversationsTabContent.vue'
import { getAvailabilityForAssignee } from '@/services/availabilityService'
import { simulateCallExtraction } from '@/simulation/callExtractionSimulation'

const props = defineProps({
  lead: {
    type: Object,
    required: true
  },
  activities: {
    type: Array,
    default: () => []
  },
  showDeadlineBanner: {
    type: Boolean,
    default: true
  },
  outcomeSaving: {
    type: Boolean,
    default: false
  },
  hideContactCard: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['postponed', 'validated', 'qualified', 'disqualified', 'call-attempt-logged', 'note-saved', 'open-purchase-method', 'appointment-scheduled', 'survey-completed', 'survey-refused', 'not-responding', 'update:outcomeSaving', 'postpone-expected-close', 'reassigned'])

const usersStore = useUsersStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const leadsStore = useLeadsStore()
const toastStore = useToastStore()

// Use lead actions composable
const leadState = useLeadActions(() => props.lead, {})

// Use call composable
const callState = useLQWidgetCall()
const { 
  isCallActive, 
  callEnded, 
  callDuration, 
  callNotes, 
  isMuted,
  callData, 
  extractedData, 
  mockTranscription, 
  formattedCallDuration, 
  startCall: startCallFromComposable, 
  endCall: endCallFromComposable, 
  toggleMute,
  copyNumber: copyNumberFromComposable, 
  extractInformation: extractInformationFromComposable 
} = callState

// State that stays in component
const noteWidgetRef = ref(null)
const expandedOutcomeRef = ref(null)
const postponeBlockRef = ref(null)
const eventTypeExpandedRef = ref(null)
const showAssignmentModal = ref(false)
const showFinancingModal = ref(false)
const showVehicleModal = ref(false)
const showPostponeRescheduleBlock = ref(false)
const enrichLeadSectionRef = ref(null)
const enrichLeadExpanded = ref(false)
const editingTradeIn = ref(null)
const editingFinancingOption = ref(null)
const tradeInActionLoading = ref(false)
const financingActionLoading = ref(false)

// Static data that stays in component
const assignableUsers = computed(() => usersStore.assignableUsers)
const assignableTeams = computed(() => usersStore.assignableTeams)
const currentUser = computed(() => userStore.currentUser)

// Enrich lead data
const enrichLeadData = ref({
  interestLevel: '',
  purchaseTimeline: '',
  budgetRange: '',
  additionalNotes: ''
})

// Assignment state
const selectedDealership = ref('')
const selectedTeam = ref('')
const selectedAssignee = ref('')

// Note to assignee when postponing (no-answer + postpone or answer + postpone)
const noteForNextAttemptAssignee = ref('')

// Available dealerships (unique from teams)
const availableDealerships = computed(() => {
  const dealerships = new Set()
  assignableTeams.value?.forEach(team => {
    if (team.dealership) {
      dealerships.add(team.dealership)
    }
  })
  return Array.from(dealerships).sort()
})

// Filtered teams based on selected dealership
const filteredTeams = computed(() => {
  if (!selectedDealership.value) {
    return assignableTeams.value || []
  }
  return assignableTeams.value?.filter(team => team.dealership === selectedDealership.value) || []
})

// Filtered assignees based on selected team
const filteredAssignees = computed(() => {
  if (!selectedTeam.value) {
    return assignableUsers.value || []
  }
  const team = assignableTeams.value?.find(t => t.id === selectedTeam.value)
  if (!team) return assignableUsers.value || []
  return assignableUsers.value?.filter(user => user.team === team.name || user.teamId === team.id) || []
})

// Helper functions
const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const getRoleAvatarClass = (role) => {
  const classes = {
    'manager': 'bg-blue-100 text-blue-700',
    'salesman': 'bg-purple-100 text-purple-700',
    'operator': 'bg-orange-100 text-orange-700'
  }
  return classes[role] || 'bg-muted text-muted-foreground'
}

const handleAssignmentConfirm = (assignee) => {
  assignment.value.assignee = assignee
  // Reset salesman selection if team changed
  if (assignee.type === 'team') {
    qualificationSelectedSalesman.value = null
  }
  showAssignmentModal.value = false
}


// Check if task is already assigned and show outcome
const isTaskAssigned = computed(() => {
  return !!callLogAssignee.value
})

const currentTaskOutcome = computed(() => {
  if (successState.value) {
    return successState.value.statusText
  }
  // Check if there's a recent activity with outcome
  const recentActivity = props.activities
    .filter(a => a.type === 'call' || a.type === 'outcome')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
  if (recentActivity) {
    return recentActivity.outcome || recentActivity.content || 'Outcome logged'
  }
  return null
})

// Handle enrich lead save
const handleEnrichLeadSave = async () => {
  try {
    const data = enrichLeadData.value
    const noteParts = []
    
    // Build note content from form data
    if (data.interestLevel) {
      noteParts.push(`Interest level: ${data.interestLevel}`)
    }
    if (data.purchaseTimeline) {
      noteParts.push(`Purchase timeline: ${data.purchaseTimeline}`)
    }
    if (data.budgetRange) {
      noteParts.push(`Budget range: ${data.budgetRange}`)
    }
    if (data.additionalNotes) {
      noteParts.push(data.additionalNotes)
    }
    
    const noteContent = noteParts.join('\n')
    
    if (noteContent.trim()) {
      await leadsStore.addActivity(props.lead.id, {
        type: 'note',
        user: currentUser.value?.name || 'You',
        action: 'enriched lead information',
        content: noteContent,
        timestamp: new Date().toISOString()
      })
      
      emit('note-saved', {
        type: 'note',
        content: noteContent,
        timestamp: new Date().toISOString(),
        enrichData: { ...data }
      })
    }
    
    // Save survey data if any fields are filled
    const hasSurveyData = data.interestLevel || data.purchaseTimeline || data.budgetRange
    if (hasSurveyData) {
      const surveyResponses = {
        interestLevel: data.interestLevel,
        purchaseTimeline: data.purchaseTimeline,
        budgetRange: data.budgetRange
      }
      
      await leadsStore.addActivity(props.lead.id, {
        type: 'survey',
        action: 'Lead Qualification Survey',
        content: JSON.stringify(surveyResponses),
        timestamp: new Date().toISOString()
      })
      
      emit('survey-completed', { lead: props.lead, responses: surveyResponses })
    }
    
    enrichLeadData.value = {
      interestLevel: '',
      purchaseTimeline: '',
      budgetRange: '',
      additionalNotes: ''
    }
  } catch (error) {
    console.error('Error saving enriched lead data:', error)
  }
}

// Wrapper functions for coordination
const startCall = () => {
  startCallFromComposable()
  // Auto-assign and auto-fill time when initiating call (don't show outcome selection yet)
  initCallLogForm(false)
}

const copyNumber = () => {
  copyNumberFromComposable(props.lead.customer.phone)
}

const updateCallNotes = (value) => {
  callNotes.value = value
}

function handleExtractInformation() {
  const result = simulateCallExtraction(callData.value)
  extractedData.value = { tradeIn: result.tradeIn, financing: result.financing }
  enrichLeadData.value = {
    interestLevel: result.interestLevel,
    purchaseTimeline: result.purchaseTimeline,
    budgetRange: result.budgetRange,
    additionalNotes: result.additionalNotes
  }
  if (result.tradeIn) preferences.value.tradeIn = true
  if (result.financing) preferences.value.financing = true
  selectOutcome('answer')
  setNextStep('interested')
  enrichLeadExpanded.value = true
}

async function addCallActivity() {
  const userName = currentUser.value?.name || 'You'
  const transcription = callData.value?.transcription
  const summary = 'Lead confirmed their details and the call covered the main inquiry discussed in the transcript.'
  await leadsStore.addActivity(props.lead.id, {
    type: 'call',
    user: userName,
    action: 'made a call',
    content: `${userName} made a call`,
    data: transcription
      ? { transcription, duration: callData.value?.duration, summary }
      : { summary, duration: callData.value?.duration },
    timestamp: new Date().toISOString()
  })
}

const onEndCall = () => {
  endCallFromComposable()
}

const onCallClose = async () => {
  if (callEnded.value) {
    await addCallActivity()
  }
  callState.resetCall()
}

const callerName = computed(() => props.lead.customer?.name || 'Caller')

const leadSummary = computed(() => {
  const name = props.lead.customer?.name || 'Lead'
  const car = props.lead.requestedCar
  const vehicle = car ? `${car.brand || ''} ${car.model || ''} (${car.year || ''})`.trim() : 'a vehicle'
  const source = props.lead.source || 'Generic sales'
  const created = props.lead.createdAt
    ? `${formatDate(props.lead.createdAt)}, ${formatTime(props.lead.createdAt)}`
    : ''
  return `${name} is interested in ${vehicle}. Lead comes from ${source}${created ? `, created ${created}` : ''}.`
})

const hasPhone = computed(() => !!(props.lead.customer?.phone ?? '').trim())

const dynamicDescription = computed(() => {
  const base = leadState.primaryAction.value?.description || 'Begin lead qualification by verifying customer contact information.'
  const name = props.lead.customer?.name ?? ''
  const phone = props.lead.customer?.phone ?? ''
  return mergeContactIntoDescription(base, name, phone)
})

const contactDescription = computed(() =>
  hasPhone.value
    ? dynamicDescription.value
    : getNoPhoneContactDescription(props.lead.customer?.name ?? '')
)

const isOverdue = computed(() => {
  // Lead tasks use nextActionDue only (scheduled appointments are for opportunities)
  if (!props.lead.nextActionDue) return false
  const due = new Date(props.lead.nextActionDue)
  const now = new Date()
  return due < now
})

// Show loading only until this lead's full data is in the store (avoids stuck loading from global leadsStore.loading)
const isLeadDataLoading = computed(() => {
  const leadId = props.lead?.id
  if (leadId == null) return false
  return leadsStore.currentLead?.id !== leadId
})

// Conversation activities (email/WhatsApp) for inline thread when no phone
const CONVERSATION_TYPES = ['email', 'customer-email', 'whatsapp', 'customer-whatsapp']
const conversationActivities = computed(() => {
  const list = (props.activities || []).filter((a) => CONVERSATION_TYPES.includes(a.type))
  return [...list].sort(
    (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
  )
})

const recentAttachmentsForEmail = computed(() =>
  (props.activities || []).filter((a) => a.type === 'attachment')
)

// Use contactAttempts and maxContactAttempts from state machine
const contactAttempts = leadState.contactAttempts
const maxContactAttempts = leadState.maxContactAttempts

// Use outcome composable
const outcomeState = useLQWidgetOutcomes(
  toRef(props, 'lead'),
  callData,
  extractedData,
  contactAttempts,
  maxContactAttempts,
  currentUser
)

const {
  showOutcomeSelection,
  selectedOutcome,
  selectedNextStep,
  setNextStep,
  showNoteModal,
  followupChannels,
  followupChannel,
  selectedTemplate,
  rescheduleTime,
  customDate,
  customTime,
  markAsScheduledRecall,
  disqualifyCategory,
  disqualifyReason,
  assignment,
  preferences,
  messageTemplates,
  messagePreview,
  followupMessageBody,
  resolveFollowupMessage,
  selectOutcome,
  cancelOutcome,
  calculateNextCallDate,
  surveyCompleted,
  surveyResponses,
  showSurvey,
  aiSuggestionData,
  handleAISuggestionClick,
  callLogDateTime,
  callLogAssignee,
  nextAttemptAssignee,
  confirmCallLogForm,
  cancelCallLogForm,
  initCallLogForm,
  successState,
  successPerformedAt,
  qualificationEventType,
  qualificationDurationMinutes,
  qualificationCustomDuration,
  qualificationSelectedDate,
  qualificationSelectedSlot,
  qualificationScheduleDepartment,
  qualificationScheduleDealership,
  qualificationScheduleTeamId,
  qualificationScheduleAssigneeFilter,
  setQualificationSelectedSlot,
  qualificationDateRange,
  qualificationCustomDateStart,
  qualificationCustomDateEnd,
  availableDatesForRange,
  qualificationScheduleSlotOptions,
  qualificationDurationValue,
  qualificationSelectedTeam,
  qualificationSelectedSalesman,
  communicationPreferences,
  restorePostponedInterestedState
} = outcomeState

// Restore postponed interested form when opening a lead that was postponed from interested flow
watch(
  () => props.lead?.postponedInterestedState,
  (draft) => {
    if (!draft) return
    restorePostponedInterestedState(draft)
    if (draft.enrichLeadData && typeof draft.enrichLeadData === 'object') {
      enrichLeadData.value = {
        interestLevel: draft.enrichLeadData.interestLevel ?? '',
        purchaseTimeline: draft.enrichLeadData.purchaseTimeline ?? '',
        budgetRange: draft.enrichLeadData.budgetRange ?? '',
        additionalNotes: draft.enrichLeadData.additionalNotes ?? ''
      }
    }
  },
  { immediate: true }
)

function setFollowupChannel(v) {
  followupChannel.value = v
}

function setRescheduleTime(v) {
  if (!v) {
    rescheduleTime.value = null
    return
  }
  if (v === 'monday') {
    handleAISuggestionClick()
  } else {
    rescheduleTime.value = v
    if (v === 'custom') {
      const today = new Date()
      customDate.value = today.toISOString().split('T')[0]
    }
  }
}

function setDisqualifyReason(v) {
  disqualifyReason.value = v
}

// Handle communications update
const handleCommunicationsUpdate = (communications) => {
  communicationPreferences.value = communications
}

// Helper function to check if two dates are the same day
const qualificationIsSameDay = (a, b) => {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// Handle date range selection
const handleDateRangeSelect = (range) => {
  qualificationDateRange.value = range
  qualificationSelectedDate.value = null
  qualificationSelectedSlot.value = ''
  
  // Auto-select first available date for "tomorrow" or "this-week"
  if (range === 'tomorrow' && availableDatesForRange.value.length > 0) {
    qualificationSelectedDate.value = availableDatesForRange.value[0]
  } else if (range === 'this-week' && availableDatesForRange.value.length > 0) {
    qualificationSelectedDate.value = availableDatesForRange.value[0]
  }
}

const SCHEDULE_DEALERSHIP_ALL = '__all__'

const scheduleDealershipSelectOptions = computed(() => {
  const dealerships = [
    ...new Set(
      (assignableTeams.value || []).map((t) => t.dealership).filter(Boolean)
    )
  ].sort()
  return [
    { label: t('forms.schedule.dealership.all'), value: SCHEDULE_DEALERSHIP_ALL },
    ...dealerships.map((d) => ({ label: d, value: d }))
  ]
})

const qualificationScheduleDealershipSelect = computed({
  get: () =>
    qualificationScheduleDealership.value
      ? qualificationScheduleDealership.value
      : SCHEDULE_DEALERSHIP_ALL,
  set: (v) => {
    qualificationScheduleDealership.value =
      v === SCHEDULE_DEALERSHIP_ALL || !v ? '' : v
  }
})

const SCHEDULE_TEAM_ALL = '__all__'

const scheduleTeamsForTeamFilter = computed(() => {
  let teams = assignableTeams.value || []
  if (qualificationScheduleDealership.value) {
    teams = teams.filter((t) => t.dealership === qualificationScheduleDealership.value)
  }
  return [...teams].sort((a, b) => a.name.localeCompare(b.name))
})

const scheduleTeamSelectOptions = computed(() => {
  const showDealershipSuffix = !qualificationScheduleDealership.value
  return [
    { label: t('forms.schedule.team.all'), value: SCHEDULE_TEAM_ALL },
    ...scheduleTeamsForTeamFilter.value.map((team) => ({
      label:
        showDealershipSuffix && team.dealership
          ? `${team.name} · ${team.dealership}`
          : team.name,
      value: team.id
    }))
  ]
})

const qualificationScheduleTeamSelect = computed({
  get: () =>
    qualificationScheduleTeamId.value != null
      ? qualificationScheduleTeamId.value
      : SCHEDULE_TEAM_ALL,
  set: (v) => {
    if (v === SCHEDULE_TEAM_ALL || v == null || v === '') {
      qualificationScheduleTeamId.value = null
      return
    }
    const n = typeof v === 'number' ? v : parseInt(String(v), 10)
    qualificationScheduleTeamId.value = Number.isFinite(n) ? n : null
  }
})

const SCHEDULE_ASSIGNEE_ALL = '__all__'

const scheduleAssigneeCandidates = computed(() => {
  const dealershipFilter = qualificationScheduleDealership.value
  const teamIdFilter = qualificationScheduleTeamId.value
  let teams = assignableTeams.value || []
  if (dealershipFilter) {
    teams = teams.filter((t) => t.dealership === dealershipFilter)
  }
  if (teamIdFilter != null) {
    teams = teams.filter((t) => t.id === teamIdFilter)
  }
  const teamIds = new Set(teams.map((t) => t.id))
  const teamNames = new Set(teams.map((t) => t.name))
  const users = (assignableUsers.value || [])
    .filter(
      (u) =>
        !dealershipFilter ||
        teamIds.has(u.teamId) ||
        teamNames.has(u.team)
    )
    .map((u) => ({
      type: 'user',
      id: u.id,
      name: u.name,
      team: u.team,
      role: u.role,
      assigneeId: `user-${u.id}`,
      departmentLabel: u.team || '',
      avatarClass: getRoleAvatarClass(u.role)
    }))
  const teamAssignees = teams.map((t) => ({
    type: 'team',
    id: t.id,
    name: t.name,
    assigneeId: `team-${t.id}`,
    departmentLabel: t.dealership || '',
    avatarClass: 'bg-muted text-muted-foreground'
  }))
  return [...users, ...teamAssignees]
})

const scheduleAssigneeSelectOptions = computed(() => [
  { label: t('forms.schedule.assignee.all'), value: SCHEDULE_ASSIGNEE_ALL },
  ...scheduleAssigneeCandidates.value.map((a) => ({
    label:
      a.type === 'user' && a.departmentLabel
        ? `${a.name} · ${a.departmentLabel}`
        : a.name,
    value: a.assigneeId
  }))
])

const qualificationScheduleAssigneeSelect = computed({
  get: () =>
    qualificationScheduleAssigneeFilter.value
      ? qualificationScheduleAssigneeFilter.value
      : SCHEDULE_ASSIGNEE_ALL,
  set: (v) => {
    qualificationScheduleAssigneeFilter.value =
      v === SCHEDULE_ASSIGNEE_ALL || v == null || v === '' ? '' : String(v)
  }
})

const scheduleAssignees = computed(() => {
  const list = scheduleAssigneeCandidates.value
  const f = qualificationScheduleAssigneeFilter.value
  if (!f) return list
  return list.filter((a) => a.assigneeId === f)
})

const shouldPickAssigneeViaPopover = computed(
  () => !qualificationScheduleAssigneeFilter.value
)

// For selected date: each assignee with their available slots (for calendar right column)
const availabilityByAssigneeForSelectedDate = computed(() => {
  if (!qualificationSelectedDate.value) return []
  const dateStr = qualificationSelectedDate.value.toISOString().split('T')[0]
  return scheduleAssignees.value
    .map(assignee => {
      const slots = getAvailabilityForAssignee(assignee.assigneeId, dateStr)
      return { ...assignee, slots }
    })
    .filter(item => item.slots.length > 0)
})

const openScheduleSlotPopover = ref(null)
const scheduleSlotAssigneeSearchQuery = ref('')
const scheduleFiltersSyncFromSlotPopover = ref(false)
const qualificationScheduleEditing = ref(true)
const qualificationScheduleInternalNote = ref('')
const qualificationScheduleInternalNoteId = useId()

function resolveAssignableTeamForScheduleUser(user) {
  if (!user) return null
  const byId = user.teamId != null
    ? assignableTeams.value?.find((t) => t.id === user.teamId)
    : null
  if (byId) return byId
  return assignableTeams.value?.find((t) => t.name === user.team) ?? null
}
const SCHEDULE_VISIBLE_TIME_SLOTS_MAX = 8
const scheduleTimeSlotsExpanded = ref(false)

function qualificationDepartmentKeyFromTeamLabel(label) {
  if (!label) return ''
  const lower = label.toLowerCase()
  if (lower.includes('used')) return 'sales-used'
  if (lower.includes('new')) return 'sales-new'
  return ''
}

const uniqueSlotsForSelectedDate = computed(() => {
  const seen = new Set()
  for (const item of availabilityByAssigneeForSelectedDate.value) {
    for (const s of item.slots) seen.add(s)
  }
  return qualificationScheduleSlotOptions.value.filter((s) => seen.has(s))
})

const scheduleSlotGroupsForSelectedDate = computed(() => {
  const morning = []
  const afternoon = []
  for (const slot of uniqueSlotsForSelectedDate.value) {
    const hour = parseInt(String(slot).split(':')[0], 10)
    if (Number.isNaN(hour)) continue
    if (hour < 12) morning.push(slot)
    else afternoon.push(slot)
  }
  const groups = []
  if (morning.length) {
    groups.push({
      key: 'morning',
      label: t('forms.schedule.timeSlots.morning'),
      slots: morning
    })
  }
  if (afternoon.length) {
    groups.push({
      key: 'afternoon',
      label: t('forms.schedule.timeSlots.afternoon'),
      slots: afternoon
    })
  }
  return groups
})

const scheduleSlotColumns = computed(() => {
  const morning = scheduleSlotGroupsForSelectedDate.value.find((g) => g.key === 'morning')
  const afternoon = scheduleSlotGroupsForSelectedDate.value.find((g) => g.key === 'afternoon')
  return [
    {
      key: 'morning',
      label: t('forms.schedule.timeSlots.morning'),
      slots: morning?.slots ?? []
    },
    {
      key: 'afternoon',
      label: t('forms.schedule.timeSlots.afternoon'),
      slots: afternoon?.slots ?? []
    }
  ]
})

const scheduleSlotsExceedsCollapsedMax = computed(() => {
  const cols = scheduleSlotColumns.value
  const total = (cols[0]?.slots?.length ?? 0) + (cols[1]?.slots?.length ?? 0)
  return total > SCHEDULE_VISIBLE_TIME_SLOTS_MAX
})

const scheduleSlotColumnsDisplay = computed(() => {
  const cols = scheduleSlotColumns.value
  const morning = cols[0]?.slots ?? []
  const afternoon = cols[1]?.slots ?? []
  if (
    scheduleTimeSlotsExpanded.value ||
    morning.length + afternoon.length <= SCHEDULE_VISIBLE_TIME_SLOTS_MAX
  ) {
    return cols
  }
  let budget = SCHEDULE_VISIBLE_TIME_SLOTS_MAX
  const visMorning = morning.slice(0, Math.min(morning.length, budget))
  budget -= visMorning.length
  const visAfternoon = afternoon.slice(0, Math.min(afternoon.length, budget))
  return [
    { ...cols[0], slots: visMorning },
    { ...cols[1], slots: visAfternoon }
  ]
})

function assigneesAvailableForSlot(slot) {
  return availabilityByAssigneeForSelectedDate.value.filter((item) => item.slots.includes(slot))
}

function handleScheduleSlotDirectSelect(slot) {
  const filterId = qualificationScheduleAssigneeFilter.value
  if (!filterId) return
  const item = assigneesAvailableForSlot(slot).find((a) => a.assigneeId === filterId)
  if (item) {
    selectScheduleSlotAssignee(slot, item)
  }
}

function assigneesFilteredForSlot(slot) {
  const items = assigneesAvailableForSlot(slot)
  const q = scheduleSlotAssigneeSearchQuery.value.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => {
    const name = (item.name || '').toLowerCase()
    const dept = (item.departmentLabel || '').toLowerCase()
    return name.includes(q) || dept.includes(q)
  })
}

function onScheduleSlotPopoverOpenChange(slot, open) {
  if (open) {
    scheduleSlotAssigneeSearchQuery.value = ''
    openScheduleSlotPopover.value = slot
  } else if (openScheduleSlotPopover.value === slot) {
    openScheduleSlotPopover.value = null
    scheduleSlotAssigneeSearchQuery.value = ''
  }
}

function isScheduleSlotItemSelected(slot, item) {
  if (qualificationSelectedSlot.value !== slot) return false
  if (item.type === 'user' && qualificationSelectedSalesman.value?.id === item.id) return true
  if (item.type === 'team' && qualificationSelectedTeam.value?.id === item.id) return true
  return false
}

function selectScheduleSlotAssignee(slot, item) {
  scheduleFiltersSyncFromSlotPopover.value = true
  try {
    if (item.type === 'user') {
      const user = assignableUsers.value?.find((u) => u.id === item.id) ?? null
      const team = resolveAssignableTeamForScheduleUser(user)
      qualificationScheduleDealership.value = team?.dealership || user?.dealership || ''
      qualificationScheduleTeamId.value = team?.id ?? null
      qualificationScheduleAssigneeFilter.value = item.assigneeId
      qualificationSelectedSlot.value = slot
      qualificationSelectedSalesman.value = user
      qualificationSelectedTeam.value = null
      qualificationScheduleDepartment.value = qualificationDepartmentKeyFromTeamLabel(
        user?.team || item.team || ''
      )
    } else {
      const team = assignableTeams.value?.find((t) => t.id === item.id) ?? null
      qualificationScheduleDealership.value = team?.dealership || ''
      qualificationScheduleTeamId.value = team?.id ?? null
      qualificationScheduleAssigneeFilter.value = item.assigneeId
      qualificationSelectedSlot.value = slot
      qualificationSelectedTeam.value = team
      qualificationSelectedSalesman.value = null
      qualificationScheduleDepartment.value = qualificationDepartmentKeyFromTeamLabel(team?.name || '')
    }
  } finally {
    nextTick(() => {
      scheduleFiltersSyncFromSlotPopover.value = false
    })
  }
  scheduleSlotAssigneeSearchQuery.value = ''
  openScheduleSlotPopover.value = null
  if (
    qualificationEventType.value &&
    qualificationSelectedDate.value &&
    qualificationSelectedSlot.value &&
    (qualificationSelectedSalesman.value || qualificationSelectedTeam.value)
  ) {
    qualificationScheduleEditing.value = false
  }
}

function isScheduleSlotConfirmed(slot) {
  if (qualificationSelectedSlot.value !== slot) return false
  return Boolean(qualificationSelectedSalesman.value || qualificationSelectedTeam.value)
}

watch(qualificationSelectedDate, () => {
  scheduleTimeSlotsExpanded.value = false
  qualificationSelectedSlot.value = ''
  qualificationScheduleDepartment.value = ''
  qualificationSelectedSalesman.value = null
  qualificationSelectedTeam.value = null
  openScheduleSlotPopover.value = null
})

watch(qualificationScheduleDealership, () => {
  if (scheduleFiltersSyncFromSlotPopover.value) return
  qualificationScheduleTeamId.value = null
  qualificationScheduleAssigneeFilter.value = ''
  qualificationSelectedSlot.value = ''
  qualificationScheduleDepartment.value = ''
  qualificationSelectedSalesman.value = null
  qualificationSelectedTeam.value = null
  openScheduleSlotPopover.value = null
})

watch(qualificationScheduleTeamId, () => {
  if (scheduleFiltersSyncFromSlotPopover.value) return
  qualificationScheduleAssigneeFilter.value = ''
  qualificationSelectedSlot.value = ''
  qualificationScheduleDepartment.value = ''
  qualificationSelectedSalesman.value = null
  qualificationSelectedTeam.value = null
  openScheduleSlotPopover.value = null
})

watch(qualificationScheduleAssigneeFilter, () => {
  if (scheduleFiltersSyncFromSlotPopover.value) return
  qualificationSelectedSlot.value = ''
  qualificationScheduleDepartment.value = ''
  qualificationSelectedSalesman.value = null
  qualificationSelectedTeam.value = null
  openScheduleSlotPopover.value = null
})

const existingNotes = computed(() => {
  return props.activities.filter(activity => activity.type === 'note')
})

// Next attempt reassign: empty option + combined users + teams for SelectMenu (unique _key for value-key)
const NEXT_ATTEMPT_NONE_KEY = '__none__'
const nextAttemptAssigneeOptions = computed(() => {
  const noneOption = { _key: NEXT_ATTEMPT_NONE_KEY, type: 'none', label: 'Unassigned' }
  const users = (assignableUsers.value || []).map(u => ({
    ...u,
    type: 'user',
    _key: `user-${u.id}`,
    label: u.name
  }))
  const teams = (assignableTeams.value || []).map(t => ({
    ...t,
    type: 'team',
    _key: `team-${t.id}`,
    label: t.name
  }))
  return [noneOption, ...users, ...teams]
})

const selectedNextAttemptKey = computed({
  get: () => {
    const a = nextAttemptAssignee.value
    if (!a) return NEXT_ATTEMPT_NONE_KEY
    return a.type === 'user' ? `user-${a.id}` : `team-${a.id}`
  },
  set: (key) => {
    if (!key || key === NEXT_ATTEMPT_NONE_KEY) {
      nextAttemptAssignee.value = null
      return
    }
    const opt = nextAttemptAssigneeOptions.value.find(o => o._key === key)
    nextAttemptAssignee.value = opt ? { ...opt } : null
  }
})

// Auto-select today's date when event type is selected
watch(qualificationEventType, (eventType) => {
  if (eventType && !qualificationSelectedDate.value) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    qualificationSelectedDate.value = today
    qualificationSelectedSlot.value = ''
    qualificationScheduleDepartment.value = ''
  }
}, { immediate: true })

// Show action buttons when outcome is set and (for answer/no-answer) next step is set
const hasActiveOutcomeSelection = computed(() => {
  if (!selectedOutcome.value) return false
  if (selectedOutcome.value === 'not-valid') return true
  return selectedNextStep.value != null
})

// Check if everything is selected for "Send and postpone" button (no-answer + postpone)
const canSendAndPostpone = computed(() => {
  if (selectedOutcome.value !== 'no-answer' || selectedNextStep.value !== 'postpone') return false
  if (!followupChannel.value) return false
  if (followupChannel.value !== 'dont-send' && !selectedTemplate.value) return false
  if (!rescheduleTime.value) return false
  if (rescheduleTime.value === 'custom' && (!customDate.value || !customTime.value)) return false
  return true
})

const canPostponeFromInterested = computed(() => {
  if (selectedOutcome.value !== 'answer' || (selectedNextStep.value !== 'interested' && selectedNextStep.value !== 'postpone')) return false
  if (!rescheduleTime.value) return false
  if (rescheduleTime.value === 'custom' && (!customDate.value || !customTime.value)) return false
  return true
})

async function onConfirmPostpone() {
  if (!canPostponeFromInterested.value) return
  await handlePostponeFromInterested()
  showPostponeRescheduleBlock.value = false
}

function scrollToExpandedContent(getEl, delayMs = 0, block = null) {
  const run = () => {
    const el = typeof getEl === 'function' ? getEl() : getEl
    if (!el) return
    const defaultBlock = props.hideContactCard ? 'nearest' : 'start'
    el.scrollIntoView({
      behavior: 'smooth',
      block: block ?? defaultBlock,
      inline: 'nearest'
    })
  }
  if (delayMs > 0) {
    setTimeout(() => nextTick(run), delayMs)
  } else {
    nextTick(run)
  }
}

function openQualificationScheduleEditor() {
  qualificationScheduleEditing.value = true
  nextTick(() => {
    scrollToExpandedContent(() => eventTypeExpandedRef.value, 0, 'nearest')
  })
}

function handleBackToCallOutcome() {
  selectOutcome(null)
  setNextStep(null)
}

function handleBackToWhatsNextChoices() {
  setNextStep(null)
}

watch(selectedOutcome, (newOutcome) => {
  if (newOutcome) {
    scrollToExpandedContent(() => expandedOutcomeRef.value)
  }
})

watch(selectedNextStep, (next) => {
  if (next && selectedOutcome.value) {
    scrollToExpandedContent(() => expandedOutcomeRef.value)
  }
})

watch(qualificationEventType, (eventType) => {
  if (eventType) {
    nextTick(() => {
      nextTick(() => {
        scrollToExpandedContent(() => eventTypeExpandedRef.value, 0, 'nearest')
      })
    })
  }
})

// Scroll into view when user expands collapsible sections so next inputs are visible
watch(enrichLeadExpanded, (expanded) => {
  if (expanded) {
    scrollToExpandedContent(() => enrichLeadSectionRef.value, 320)
  }
})

watch([selectedOutcome, selectedNextStep], ([outcome, next]) => {
  const isAnswerInterested = outcome === 'answer' && next === 'interested'
  const isPostpone = (outcome === 'no-answer' && next === 'postpone') || (outcome === 'answer' && next === 'postpone')
  if (isPostpone && props.lead?.assignee) {
    const assigneeName = props.lead.assignee
    const assigneeUser = assignableUsers.value?.find(u => u.name === assigneeName)
    const assigneeTeam = assignableTeams.value?.find(t => t.name === assigneeName)
    if (assigneeUser) {
      nextAttemptAssignee.value = { ...assigneeUser, type: 'user' }
    } else if (assigneeTeam) {
      nextAttemptAssignee.value = { ...assigneeTeam, type: 'team' }
    }
  }
  if (!isAnswerInterested) {
    showPostponeRescheduleBlock.value = false
    enrichLeadData.value = {
      interestLevel: '',
      purchaseTimeline: '',
      budgetRange: '',
      additionalNotes: ''
    }
    selectedDealership.value = ''
    selectedTeam.value = ''
    selectedAssignee.value = ''
  }
  if (!isPostpone) {
    noteForNextAttemptAssignee.value = ''
  }
})

// Auto-fill dealership and team when assignee is selected
watch(selectedAssignee, (assigneeId) => {
  if (assigneeId) {
    const user = assignableUsers.value?.find(u => u.id === assigneeId)
    if (user) {
      const userTeam = assignableTeams.value?.find(team => 
        team.name === user.team || team.id === user.teamId
      )
      if (userTeam) {
        selectedTeam.value = userTeam.id
        if (userTeam.dealership) {
          selectedDealership.value = userTeam.dealership
        }
      }
    }
  }
})

// Reset assignee when team changes (if team doesn't match current assignee)
watch(selectedTeam, (teamId) => {
  if (teamId && selectedAssignee.value) {
    const user = assignableUsers.value?.find(u => u.id === selectedAssignee.value)
    const team = assignableTeams.value?.find(t => t.id === teamId)
    if (user && team && user.team !== team.name && user.teamId !== team.id) {
      selectedAssignee.value = ''
    }
  }
})

// Reset team and assignee when dealership changes (if dealership doesn't match)
watch(selectedDealership, (dealership) => {
  if (dealership && selectedTeam.value) {
    const team = assignableTeams.value?.find(t => t.id === selectedTeam.value)
    if (team && team.dealership !== dealership) {
      selectedTeam.value = ''
      selectedAssignee.value = ''
    }
  }
})

// Watch for call ending to initialize datetime and assignee
watch(callEnded, (ended) => {
  if (ended && !successState.value) {
    // Initialize datetime and assignee when call ends
    initCallLogForm(false)
  }
})

const qualificationEventTypeOptions = [
  { value: 'appointment-on-phone', label: 'Appointment on the phone (15m)' },
  { value: 'appointment-at-dealership', label: 'Appointment at the dealership (30m)' },
  { value: 'recall-internal', label: 'Recall - internal (15m)' },
  { value: 'appointment-at-dealership-test-drive', label: 'Appointment at the dealership + Test drive (1h)' },
  { value: 'appointment-at-workshop', label: 'Appointment at the workshop (15m)' },
  { value: 'appointment-at-customer-site', label: 'Appointment at customer\'s site (1h 40m)' },
  { value: 'appointment-at-customer-site-test-drive', label: 'Appointment at customer\'s site + Test drive (5h)' }
]

// Event type options for SelectMenu
const qualificationEventTypeOptionsForSelect = computed(() => 
  qualificationEventTypeOptions.map(opt => ({
    value: opt.value,
    label: opt.label
  }))
)

// Selected date label
const selectedQualificationDateLabel = computed(() => {
  if (!qualificationSelectedDate.value) {
    return t('forms.schedule.timeSlots.selectDate')
  }
  const date = qualificationSelectedDate.value
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`
})

const scheduleHeaderAssigneeDisplay = computed(() => {
  if (!shouldPickAssigneeViaPopover.value || !qualificationSelectedSlot.value) return null
  const u = qualificationSelectedSalesman.value
  if (u?.name) {
    return { kind: 'user', name: u.name, role: u.role }
  }
  const team = qualificationSelectedTeam.value
  if (team?.name) {
    return { kind: 'team', name: team.name }
  }
  return null
})

const isQualificationScheduleComplete = computed(() =>
  Boolean(
    qualificationEventType.value &&
      qualificationSelectedDate.value &&
      qualificationSelectedSlot.value &&
      (qualificationSelectedSalesman.value || qualificationSelectedTeam.value)
  )
)

const qualificationScheduleSummaryVisible = computed(
  () => !qualificationScheduleEditing.value && isQualificationScheduleComplete.value
)

const qualificationScheduleEventTypeLabel = computed(() => {
  const v = qualificationEventType.value
  if (!v) return ''
  const opt = qualificationEventTypeOptions.find((o) => o.value === v)
  return opt?.label ?? v
})

const qualificationScheduleSummaryAssigneeIsUser = computed(
  () => !!qualificationSelectedSalesman.value
)

const qualificationScheduleSummaryAssigneeName = computed(() => {
  if (qualificationSelectedSalesman.value?.name) {
    return qualificationSelectedSalesman.value.name
  }
  return qualificationSelectedTeam.value?.name ?? ''
})

const qualificationScheduleSummaryDealership = computed(() => {
  if (qualificationSelectedTeam.value?.dealership) {
    return qualificationSelectedTeam.value.dealership
  }
  const u = qualificationSelectedSalesman.value
  const team = u ? resolveAssignableTeamForScheduleUser(u) : null
  return (
    team?.dealership ||
    u?.dealership ||
    qualificationScheduleDealership.value ||
    ''
  )
})

const qualificationScheduleSummaryTeamName = computed(() => {
  if (qualificationSelectedTeam.value?.name) {
    return qualificationSelectedTeam.value.name
  }
  const u = qualificationSelectedSalesman.value
  if (!u) return ''
  const team = resolveAssignableTeamForScheduleUser(u)
  return team?.name || u.team || ''
})

watch(isQualificationScheduleComplete, (complete) => {
  if (!complete) {
    qualificationScheduleEditing.value = true
    qualificationScheduleInternalNote.value = ''
  }
})

// Map event types to their durations in minutes
const eventTypeDurationMap = {
  'appointment-on-phone': 15,
  'appointment-at-dealership': 30,
  'recall-internal': 15,
  'appointment-at-dealership-test-drive': 60,
  'appointment-at-workshop': 15,
  'appointment-at-customer-site': 100, // 1h 40m = 100 minutes
  'appointment-at-customer-site-test-drive': 300 // 5h = 300 minutes
}

const handleQualificationDurationSelect = (minutes) => {
  qualificationDurationMinutes.value = minutes
  qualificationCustomDuration.value = ''
}

// Watch custom duration input to clear preset minutes
watch(qualificationCustomDuration, (value) => {
  if (value) {
    qualificationDurationMinutes.value = null
  }
})

// Watch for event type changes and auto-set duration
watch(qualificationEventType, (newEventType) => {
  if (!newEventType) return
  
  const duration = eventTypeDurationMap[newEventType]
  if (!duration) return
  
  if (duration === 15) {
    handleQualificationDurationSelect(15)
  } else if (duration === 30) {
    handleQualificationDurationSelect(30)
  } else if (duration === 60) {
    handleQualificationDurationSelect(60)
  } else {
    qualificationDurationMinutes.value = null
    qualificationCustomDuration.value = duration.toString()
  }
})

const canQualifyFromStage = computed(() => {
  const stage = leadState.displayStage.value
  return stage === LEAD_STAGES.NEW || stage === LEAD_STAGES.VALID_TO_BE_CALLED_BACK || stage === LEAD_STAGES.TO_BE_CALLED_BACK
})

const canQualify = computed(() => {
  if (!canQualifyFromStage.value) return false
  const hasAssignee = Boolean(qualificationSelectedTeam.value || qualificationSelectedSalesman.value)
  return Boolean(
    qualificationEventType.value &&
    qualificationDurationValue.value &&
    qualificationSelectedDate.value &&
    qualificationSelectedSlot.value &&
    hasAssignee
  )
})

const canCloseAsNotValid = computed(() => {
  return !!disqualifyReason.value
})

// Handle close from CloseAsLostForm (Not valid / Answer + Not interested)
function handleCloseFromForm(reason) {
  disqualifyReason.value = reason
  if (!disqualifyCategory.value) {
    disqualifyCategory.value = 'Not Valid'
  }
  handleNotValidConfirm()
}

// Handle close from CloseAsLostForm when No Answer + Close lead
function handleCloseFromFormNoAnswer() {
  handleNoAnswerCloseLead()
}

const actionButtonLabel = computed(() => {
  if (selectedOutcome.value === 'no-answer') {
    if (selectedNextStep.value === 'close-lead') return 'Close'
    return followupChannel.value === 'dont-send' ? 'Postpone' : 'Send and postpone'
  }
  if (selectedOutcome.value === 'not-valid' || (selectedOutcome.value === 'answer' && selectedNextStep.value === 'not-interested')) {
    return 'Close'
  }
  if (selectedOutcome.value === 'answer' && selectedNextStep.value === 'interested') {
    return 'Schedule and qualify'
  }
  if (selectedOutcome.value === 'answer' && selectedNextStep.value === 'postpone') {
    return 'Postpone'
  }
  return ''
})

const canConfirmAction = computed(() => {
  if (selectedOutcome.value === 'no-answer') {
    if (selectedNextStep.value === 'close-lead') return canCloseAsNotValid.value
    return canSendAndPostpone.value
  }
  if (selectedOutcome.value === 'not-valid' || (selectedOutcome.value === 'answer' && selectedNextStep.value === 'not-interested')) {
    return canCloseAsNotValid.value
  }
  if (selectedOutcome.value === 'answer' && selectedNextStep.value === 'interested') {
    return canQualify.value
  }
  if (selectedOutcome.value === 'answer' && selectedNextStep.value === 'postpone') {
    return canPostponeFromInterested.value
  }
  return false
})

const handleConfirmAction = async () => {
  if (selectedOutcome.value === 'no-answer') {
    if (selectedNextStep.value === 'close-lead') {
      emit('update:outcomeSaving', true)
      await handleNoAnswerCloseLead()
    } else {
      emit('update:outcomeSaving', true)
      await handleNoAnswerConfirm()
    }
  } else if (selectedOutcome.value === 'not-valid' || (selectedOutcome.value === 'answer' && selectedNextStep.value === 'not-interested')) {
    emit('update:outcomeSaving', true)
    handleNotValidConfirm()
  } else if (selectedOutcome.value === 'answer' && selectedNextStep.value === 'interested') {
    handleQualify()
  } else if (selectedOutcome.value === 'answer' && selectedNextStep.value === 'postpone') {
    await onConfirmPostpone()
  }
}

const handlers = useLQWidgetHandlers(
  emit,
  callState,
  outcomeState,
  toRef(props, 'lead'),
  contactAttempts,
  maxContactAttempts,
  leadsStore,
  currentUser,
  enrichLeadData,
  qualificationScheduleInternalNote
)

const {
  logManualCall,
  handleQualify,
  handleDisqualifyFromInterested,
  handleNoAnswerConfirm,
  handleNoAnswerCloseLead,
  handlePostponeFromInterested,
  handleNotValidConfirm,
  handleNoteSave,
  handleSurveyCompleted,
  handleSurveyRefused,
  handleNotResponding,
  handleReopen
} = handlers

const successPerformedAtLabel = computed(() => {
  if (!successPerformedAt.value) return ''
  const d = successPerformedAt.value
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = String(d.getFullYear())
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
})


// Trade-in handler
const { saveTradeInVehicle } = useTradeInVehicle()

const handleAddTradeInClick = async () => {
  tradeInActionLoading.value = true
  editingTradeIn.value = null
  await nextTick()
  showVehicleModal.value = true
  tradeInActionLoading.value = false
}

const handleAddFinancingClick = async () => {
  financingActionLoading.value = true
  editingFinancingOption.value = null
  await nextTick()
  showFinancingModal.value = true
  financingActionLoading.value = false
}

const handlePurchaseMethodSave = async (purchaseMethodData) => {
  financingActionLoading.value = true
  const editingItem = editingFinancingOption.value
  const isEdit = !!editingItem

  // Close modal; loading stays visible until save completes (same as trade-in)
  editingFinancingOption.value = null
  showFinancingModal.value = false

  try {
    preferences.value.financing = true
    const typeLabel = purchaseMethodData.type === 'FIN' ? 'Captive Financing'
      : purchaseMethodData.type === 'LEA' ? 'Leasing'
      : 'Long-Term Rental'
    const monthly = purchaseMethodData.fields?.monthlyInstalment || 0

    const duration = purchaseMethodData.fields?.duration ?? purchaseMethodData.termMonths ?? null
    const foLabel = purchaseMethodData.label ?? (duration ? `${typeLabel} - ${duration} months` : typeLabel)
    const fullItem = {
      id: purchaseMethodData.id || editingItem?.id || `fo-${Date.now()}`,
      label: foLabel,
      termMonths: duration ?? null,
      type: purchaseMethodData.type,
      fields: purchaseMethodData.fields ? { ...purchaseMethodData.fields } : {},
      currency: purchaseMethodData.currency || 'EUR',
      offerValidFrom: purchaseMethodData.offerValidFrom ?? null,
      offerValidTo: purchaseMethodData.offerValidTo ?? null
    }
    const list = props.lead.financingOptions || []
    const updatedList = isEdit
      ? list.map((f) => (String(f.id) === String(fullItem.id) ? fullItem : f))
      : [...list, fullItem]

    // Run addActivity and updateLead in parallel (both independent)
    await Promise.all([
      !isEdit ? leadsStore.addActivity(props.lead.id, {
        type: 'purchase-method',
        user: currentUser.value?.name || 'You',
        action: `added a ${typeLabel} purchase method`,
        content: `${typeLabel}: €${monthly.toLocaleString()}/month for ${purchaseMethodData.fields?.duration || 0} months`,
        data: {
          purchaseMethodId: purchaseMethodData.id,
          type: purchaseMethodData.type,
          ...purchaseMethodData.fields
        },
        timestamp: new Date().toISOString()
      }) : Promise.resolve(),
      leadsStore.updateLead(props.lead.id, { financingOptions: updatedList })
    ])

    emit('note-saved', { type: 'purchase-method', ...purchaseMethodData })
  } catch (error) {
    console.error('Error saving purchase method:', error)
    toastStore.pushToast('error', 'Failed to save financing option')
  } finally {
    financingActionLoading.value = false
  }
}

// Handle vehicle save (handles drove, requested, and trade-in)
function openTradeInEdit(t) {
  editingTradeIn.value = t
  showVehicleModal.value = true
}

function openFinancingEdit(f) {
  editingFinancingOption.value = f
  showFinancingModal.value = true
}

async function handleTradeInDelete() {
  const toRemove = editingTradeIn.value
  if (!toRemove) return
  const newList = (props.lead.tradeIns || []).filter((t) => String(t.id) !== String(toRemove.id))
  editingTradeIn.value = null
  showVehicleModal.value = false
  tradeInActionLoading.value = true
  try {
    await leadsStore.updateLead(props.lead.id, { tradeIns: newList })
  } catch (error) {
    toastStore.pushToast('error', 'Failed to delete trade-in')
  } finally {
    tradeInActionLoading.value = false
  }
}

async function handleFinancingDelete() {
  const toRemove = editingFinancingOption.value
  if (!toRemove) return
  const newList = (props.lead.financingOptions || []).filter((f) => String(f.id) !== String(toRemove.id))
  editingFinancingOption.value = null
  showFinancingModal.value = false
  financingActionLoading.value = true
  try {
    await leadsStore.updateLead(props.lead.id, { financingOptions: newList })
  } catch (error) {
    toastStore.pushToast('error', 'Failed to delete financing option')
  } finally {
    financingActionLoading.value = false
  }
}

const handleVehicleSave = async (data) => {
  const isTradeIn = data.vehicleType === 'tradein' || props.mode === 'tradein'
  const editingItem = editingTradeIn.value
  const isEdit = !!editingItem
  if (isTradeIn) tradeInActionLoading.value = true

  // Close modal immediately so user can continue working
  if (isTradeIn) {
    editingTradeIn.value = null
    showVehicleModal.value = false
  }

  try {
    if (isTradeIn) {
      // Save in background
      preferences.value.tradeIn = true
      const v = data.vehicle || {}
      const parts = [v.brand, v.model].filter(Boolean)
      const label = (parts.length ? parts.join(' ') + (v.year ? ` (${v.year})` : '') : 'Trade-in') || 'Trade-in'
      const valuation = data.valuation?.tradeInPrice ?? 0
      const fullItem = {
        id: isEdit ? editingItem.id : `ti-${Date.now()}`,
        label: label || 'Trade-in',
        valuation: typeof valuation === 'number' ? valuation : parseFloat(valuation) || 0,
        vehicle: v,
        valuationDetail: data.valuation || {}
      }
      const list = props.lead.tradeIns || []
      const updatedList = isEdit
        ? list.map((t) => (String(t.id) === String(fullItem.id) ? fullItem : t))
        : [...list, fullItem]

      // Run updateLead and saveTradeInVehicle in parallel (both independent)
      await Promise.all([
        leadsStore.updateLead(props.lead.id, { tradeIns: updatedList }),
        !isEdit ? saveTradeInVehicle('lead', props.lead.id, data.vehicle, data.valuation || {}).then(result => {
          emit('note-saved', {
            type: 'tradein',
            id: result.activity.id,
            action: 'added a trade-in',
            vehicleId: result.vehicle.id,
            data: result.activity.data,
            timestamp: result.activity.timestamp
          })
        }) : Promise.resolve()
      ])
    } else {
      const { addVehicleToCustomer } = await import('@/api/contacts')
      await addVehicleToCustomer(props.lead.customerId, data.vehicle)
      showVehicleModal.value = false
      emit('note-saved', { type: 'vehicle', vehicleType: data.vehicleType, ...data.vehicle })
    }
  } catch (err) {
    console.error('Error saving vehicle:', err)
    if (isTradeIn) {
      toastStore.pushToast('error', 'Failed to save trade-in')
    }
  } finally {
    if (isTradeIn) tradeInActionLoading.value = false
  }
}

// Handle follow-up communication send (uses editable message body; placeholders resolved when sending)
const handleFollowupSend = async (data) => {
  try {
    followupChannel.value = data.type
    selectedTemplate.value = data.template || ''
    const nextCallDateIso = data.nextCallDate ?? null
    const resolvedMessage = resolveFollowupMessage(followupMessageBody.value, nextCallDateIso)
    
    // Map communication type to activity action
    const actionMap = {
      'email': 'sent an email',
      'sms': 'sent an SMS',
      'whatsapp': 'sent a WhatsApp message'
    }
    
    const userName = currentUser.value?.name || 'You'
    let content = data.message ?? resolvedMessage
    if (data.type === 'email' && data.subject) {
      content = `${data.subject}: ${content}`
    }
    
    await leadsStore.addActivity(props.lead.id, {
      type: data.type,
      user: userName,
      action: actionMap[data.type] || 'sent a message',
      content: content,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('Failed to save follow-up communication:', err)
  }
}

</script>

