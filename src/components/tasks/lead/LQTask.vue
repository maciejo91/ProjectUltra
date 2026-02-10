<template>
  <div
    class="rounded-lg flex flex-col bg-muted"
  >
    <!-- Loading state before outcome (closing / postponing) -->
    <template v-if="outcomeSaving">
      <div class="flex-1 min-h-0 flex items-center justify-center rounded-lg bg-muted/80 py-4" aria-busy="true" aria-label="Saving outcome">
        <Spinner class="size-8 text-foreground shrink-0" />
      </div>
    </template>

    <!-- Success state (post qualify / disqualify / no-answer) -->
    <template v-else-if="successState">
      <div class="pt-1 px-1">
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
      <div class="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>Updated by {{ successState.actorName || 'Unknown' }}</span>
        <span class="tabular-nums">{{ successPerformedAtLabel }}</span>
      </div>
    </template>

    <template v-else>
      <!-- Contact block: white card -->
      <div class="pt-1 px-1">
        <div
          class="bg-white rounded-lg shadow-nsc-card overflow-hidden"
        >
        <DeadlineBanner
          :next-action-due="lead.nextActionDue"
          :show-deadline-banner="showDeadlineBanner"
          :task-id="lead.id"
        />
        <div class="p-4">
          <div class="flex justify-between items-start mb-3">
            <div class="min-w-0">
              <p class="text-base leading-normal font-medium text-foreground">{{ dynamicDescription }}</p>
            </div>
          </div>

        <!-- Call Interface Component -->
        <CallInterface
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

      <!-- Grey outcome area: outcome selection -->
      <div class="px-4 py-4 space-y-3">
        <!-- Inline Outcome Selection -->
        <div v-if="!successState" class="space-y-4">
            <div>
            <p class="text-sm font-medium text-foreground leading-normal mb-3">Log what is happening?</p>
            <div class="outcome-toggle-group grid grid-cols-3 gap-3">
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
                  <ThumbsDown :size="14" class="text-muted-foreground" />
                </span>
                <span>No interest/invalid</span>
              </Toggle>
              <Toggle
                variant="outline"
                :model-value="selectedOutcome === 'interested'"
                @update:model-value="(p) => selectOutcome(p ? 'interested' : null)"
                class="outcome-toggle-item w-full h-10 min-w-0 shadow-mk-dashboard-card border-0 text-sm"
              >
                <span class="inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Check :size="14" class="text-muted-foreground" />
                </span>
                <span>Interested</span>
              </Toggle>
            </div>
          </div>

          <!-- No Answer Follow-up (Inline) -->
          <div v-if="selectedOutcome === 'no-answer'" ref="expandedOutcomeRef" class="space-y-4">
            <!-- When did you call field -->
            <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
              <Label class="form-label">When did you call?</Label>
              <Input
                type="datetime-local"
                v-model="callLogDateTime"
                class="w-full"
              />
            </div>
            
            <!-- Send follow-up message -->
            <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
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
              <div v-if="followupChannel && followupChannel !== 'dont-send'" class="space-y-3">
                <!-- Template -->
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
                
                <!-- Editable message -->
                <div>
                  <Label class="form-label">Message</Label>
                  <Textarea
                    v-model="followupMessageBody"
                    rows="4"
                    class="w-full resize-none border-border bg-background text-foreground"
                    placeholder="Select a template or type your message..."
                  />
                </div>
              </div>
            </div>
            
            <!-- Next call attempt -->
            <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
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
                    <p class="text-xs text-muted-foreground">
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
              <!-- Reassign next attempt -->
              <div class="mt-4">
                <Label class="form-label">Reassign</Label>
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
            </div>
          </div>

          <!-- Not Valid (Inline) -->
          <div v-if="selectedOutcome === 'not-valid'" ref="expandedOutcomeRef" class="space-y-4">
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
              close-button-label="Close as not valid"
              @close="handleCloseFromForm"
              @cancel="cancelOutcome"
              @update:reason="setDisqualifyReason"
            />
          </div>

      <!-- Interested (Inline) -->
          <div v-if="selectedOutcome === 'interested'" ref="expandedOutcomeRef" class="space-y-4">
            <!-- Info note -->
            <div class="text-xs text-muted-foreground px-2">
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
            <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden">
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

                <!-- Trade-in -->
                <div class="space-y-2">
                  <Label class="form-label">Trade-in</Label>
                  <Button
                    variant="secondary"
                    size="sm"
                    class="gap-1.5 inline-flex items-center"
                    :disabled="tradeInActionLoading"
                    @click="handleAddTradeInClick"
                  >
                    <Spinner v-if="tradeInActionLoading" class="size-3.5 shrink-0" aria-hidden />
                    <Plus v-else class="size-3.5" />
                    Add trade-in
                  </Button>
                  <ul v-if="(lead.tradeIns || []).length" class="space-y-1.5">
                    <li
                      v-for="t in (lead.tradeIns || [])"
                      :key="t.id"
                      class="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg border border-border bg-muted/50 text-sm cursor-pointer hover:bg-muted transition-colors"
                      @click="openTradeInEdit(t)"
                    >
                      <span class="font-medium text-foreground">{{ t.label }}</span>
                      <span v-if="t.valuation != null" class="text-muted-foreground shrink-0 text-xs">€ {{ formatTradeInCurrency(t.valuation) }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Financing -->
                <div class="space-y-2">
                  <Label class="form-label">Financing</Label>
                  <Button
                    variant="secondary"
                    size="sm"
                    class="gap-1.5 inline-flex items-center"
                    :disabled="financingActionLoading"
                    @click="handleAddFinancingClick"
                  >
                    <Spinner v-if="financingActionLoading" class="size-3.5 shrink-0" aria-hidden />
                    <Plus v-else class="size-3.5" />
                    Add financing
                  </Button>
                  <ul v-if="(lead.financingOptions || []).length" class="space-y-1.5">
                    <li
                      v-for="f in (lead.financingOptions || [])"
                      :key="f.id"
                      class="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg border border-border bg-muted/50 text-sm cursor-pointer hover:bg-muted transition-colors"
                      @click="openFinancingEdit(f)"
                    >
                      <span class="font-medium text-foreground">{{ f.label }}</span>
                      <span v-if="f.termMonths" class="text-muted-foreground shrink-0 text-xs">{{ f.termMonths }} months</span>
                    </li>
                  </ul>
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

            <!-- Qualification method -->
            <div class="bg-white rounded-lg p-4 shadow-nsc-card">
              <h5 class="font-semibold text-foreground text-sm mb-3">Qualification method <span class="text-red-600">*</span></h5>
              <div class="space-y-2">
                <label
                  class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition-colors"
                  :class="
                    qualificationMethod === 'assign-only'
                      ? 'border-2 border-brand-blue bg-muted/50'
                      : 'border border-border hover:bg-muted/50'
                  "
                >
                  <input v-model="qualificationMethod" type="radio" value="assign-only" class="shrink-0" />
                  <span class="text-sm text-foreground">Assign only</span>
                </label>
                <label
                  class="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer transition-colors"
                  :class="
                    qualificationMethod === 'assign-and-schedule'
                      ? 'border-2 border-brand-blue bg-muted/50'
                      : 'border border-border hover:bg-muted/50'
                  "
                >
                  <input v-model="qualificationMethod" type="radio" value="assign-and-schedule" class="shrink-0" />
                  <span class="text-sm text-foreground">Assign and schedule</span>
                </label>
              </div>
            </div>

            <!-- Assign only flow -->
            <div
              v-if="qualificationMethod === 'assign-only'"
              class="space-y-4"
            >
              <!-- Assign appointment to -->
              <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
                <h5 class="font-semibold text-foreground text-sm mb-4">Assign appointment to</h5>
                
                <div class="grid grid-cols-2 gap-4">
                  <!-- Team -->
                  <div>
                    <Label class="form-label">Team <span class="optional">(optional)</span></Label>
                    <SelectMenu
                      v-model="selectedTeamId"
                      :items="teamSelectOptions"
                      placeholder="Search and select team..."
                      value-key="id"
                      class="w-full"
                    >
                      <template #item="{ item }">
                        <div class="flex items-center gap-2">
                          <span class="text-muted-foreground">{{ item.dealership || 'No location' }}</span>
                          <span class="text-muted-foreground">→</span>
                          <span class="font-medium text-foreground">{{ item.name }}</span>
                        </div>
                      </template>
                    </SelectMenu>
                  </div>

                  <!-- Salesperson -->
                  <div>
                    <Label class="form-label">Salesperson <span class="optional">(optional)</span></Label>
                    <SelectMenu
                      v-model="selectedSalesmanId"
                      :items="salespersonSelectOptions"
                      :disabled="!salespersonSelectOptions.length"
                      placeholder="Search and select salesperson..."
                      value-key="id"
                      class="w-full"
                    >
                      <template #item="{ item }">
                        <div class="flex items-center gap-2">
                          <div
                            class="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                            :class="getRoleAvatarClass(item.role)"
                          >
                            {{ getInitials(item.name) }}
                          </div>
                          <span class="font-medium text-foreground">{{ item.name }}</span>
                        </div>
                      </template>
                    </SelectMenu>
                  </div>
                </div>

                <!-- Notes for assignee -->
                <div class="mt-6">
                  <Label class="form-label">Notes for assignee</Label>
                  <Textarea 
                    v-model="noteForSellers"
                    rows="4" 
                    class="w-full"
                    placeholder="Add any notes or instructions for the assignee..."
                  />
                </div>
              </div>
            </div>

            <!-- Schedule (only when Assign and schedule) -->
            <div
              v-if="qualificationMethod === 'assign-and-schedule'"
              class="space-y-4"
            >
              <!-- Step 1: Event Type Selection (FIRST STEP) -->
              <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
                <Label class="form-label mb-2">Event type <span class="text-red-600">*</span></Label>
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

              <!-- Step 2: Assign appointment to (show when event type selected) -->
              <div v-if="qualificationEventType" ref="eventTypeExpandedRef" class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
                <h5 class="font-semibold text-foreground text-sm mb-4">Assign appointment to</h5>
                
                <div class="grid grid-cols-2 gap-4">
                  <!-- Team -->
                  <div>
                    <Label class="form-label">Team</Label>
                    <SelectMenu
                      v-model="selectedTeamId"
                      :items="teamSelectOptions"
                      placeholder="Search and select team..."
                      value-key="id"
                      class="w-full"
                    >
                      <template #item="{ item }">
                        <div class="flex items-center gap-2">
                          <span class="text-muted-foreground">{{ item.dealership || 'No location' }}</span>
                          <span class="text-muted-foreground">→</span>
                          <span class="font-medium text-foreground">{{ item.name }}</span>
                        </div>
                      </template>
                    </SelectMenu>
                  </div>

                  <!-- Salesperson -->
                  <div>
                    <Label class="form-label">Salesperson <span class="optional">(optional)</span></Label>
                    <SelectMenu
                      v-model="selectedSalesmanId"
                      :items="salespersonSelectOptions"
                      :disabled="!salespersonSelectOptions.length"
                      placeholder="Search and select salesperson..."
                      value-key="id"
                      class="w-full"
                    >
                      <template #item="{ item }">
                        <div class="flex items-center gap-2">
                          <div
                            class="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
                            :class="getRoleAvatarClass(item.role)"
                          >
                            {{ getInitials(item.name) }}
                          </div>
                          <span class="font-medium text-foreground">{{ item.name }}</span>
                        </div>
                      </template>
                    </SelectMenu>
                  </div>
                </div>
              </div>

              <!-- Step 3: Schedule (Calendar and Time Slots) - only after event type is selected -->
              <div v-if="qualificationEventType" class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
                <h5 class="font-semibold text-foreground text-sm mb-4">{{ t('forms.schedule.title') }} <span class="text-red-600">*</span></h5>
                
                <!-- Calendar and Time Slots - Two Column Layout -->
                <div class="bg-white rounded-lg border border-border overflow-hidden">
                  <div class="grid grid-cols-1 md:grid-cols-2 divide-x divide-black/5">
                    <!-- Left Column - Calendar -->
                    <div class="p-6">
                      <div class="flex items-center justify-between mb-4">
                        <button 
                          @click="previousMonth"
                          class="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
                        >
                          <ChevronLeft class="w-4 h-4 shrink-0 text-muted-foreground" />
                        </button>
                        <h6 class="text-sm font-semibold text-foreground">{{ currentMonthYear }}</h6>
                        <button 
                          @click="nextMonth"
                          class="p-1 hover:bg-muted rounded transition-colors cursor-pointer"
                        >
                          <ChevronRight class="w-4 h-4 shrink-0 text-muted-foreground" />
                        </button>
                      </div>
                      
                      <!-- Calendar Grid -->
                      <div class="grid grid-cols-7 gap-1 mb-2">
                        <div v-for="day in calendarDayLabels" 
                          :key="day"
                          class="text-center text-xs font-medium text-muted-foreground py-2">
                          {{ day }}
                        </div>
                      </div>
                      
                      <div class="grid grid-cols-7 gap-1">
                        <div 
                          v-for="(day, index) in calendarDays" 
                          :key="index"
                          @click="selectQualificationDate(day)"
                          class="aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition-all"
                          :class="isSelectedQualificationDate(day) 
                            ? 'bg-primary text-white cursor-pointer' 
                            : day ? 'text-muted-foreground hover:bg-muted cursor-pointer' : 'text-transparent'"
                        >
                          {{ day }}
                        </div>
                      </div>
                    </div>

                    <!-- Right Column - Time Slots -->
                    <div class="p-6">
                      <h6 class="text-sm font-semibold text-foreground mb-4">{{ selectedQualificationDateLabel }}</h6>
                      <div v-if="qualificationSelectedDate && availableScheduleSlots.length > 0" class="schedule-slot-toggle-group flex flex-col gap-2 w-full space-y-2">
                        <Toggle
                          v-for="slot in availableScheduleSlots"
                          :key="slot"
                          variant="outline"
                          :model-value="qualificationSelectedSlot === slot"
                          @update:model-value="(p) => setQualificationSelectedSlot(p ? slot : '')"
                          class="schedule-slot-toggle-item"
                        >
                          {{ slot }}
                        </Toggle>
                      </div>
                      <div v-else-if="qualificationSelectedDate && availableScheduleSlots.length === 0" class="text-sm text-muted-foreground py-4 text-center">
                        {{ t('forms.schedule.timeSlots.noSlots') }}
                      </div>
                      <div v-else class="text-sm text-muted-foreground py-4 text-center">
                        {{ t('forms.schedule.timeSlots.selectDate') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 4: Automated Communications (ALWAYS SHOW when assign-and-schedule) -->
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
        
        <!-- Unified Action Buttons at Bottom Right of Gray Wrapper -->
        <div v-if="selectedOutcome && !successState" class="flex justify-end gap-2 px-4 pb-4 pt-3 flex-wrap">
          <Button
            variant="secondary"
            @click="cancelOutcome"
          >
            Cancel
          </Button>
          <Button
            v-if="selectedOutcome === 'interested'"
            variant="outline"
            @click="onPostponeClick"
          >
            Postpone
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

        <!-- Next call attempt (below buttons, shown when Postpone is clicked) -->
        <div v-if="selectedOutcome === 'interested' && showPostponeRescheduleBlock" ref="postponeBlockRef" class="px-4 pb-4">
          <div class="bg-white rounded-lg shadow-nsc-card overflow-hidden p-6">
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
            <div v-if="rescheduleTime === 'monday' && aiSuggestionData" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex items-start gap-2">
                <Lightbulb class="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                <div class="flex-1">
                  <p class="text-sm font-semibold text-foreground mb-1">
                    {{ aiSuggestionData.formattedDate }} at {{ aiSuggestionData.time }}
                  </p>
                  <p class="text-xs text-muted-foreground">
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
            <!-- Reassign next attempt -->
            <div class="mt-4">
              <Label class="form-label">Reassign</Label>
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
            <div class="flex justify-end mt-4">
              <Button
                variant="primary"
                size="small"
                :disabled="!canPostponeFromInterested"
                @click="onConfirmPostpone"
              >
                Confirm postpone
              </Button>
            </div>
          </div>
        </div>
      </div>
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
import { ref, computed, toRef, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  Button,
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
  DialogTitle
} from '@motork/component-library/future/primitives'
import { Check, PhoneOff, ThumbsDown, RotateCcw, CalendarCheck, Phone, AlertTriangle, MessageCircle, Mail, X, Sparkles, Lightbulb, ChevronLeft, ChevronRight, Plus, Users } from 'lucide-vue-next'
import NoteWidget from '@/components/customer/activities/NoteWidget.vue'
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
import { mergeContactIntoDescription } from '@/utils/taskActionTitle'
import { useLeadActions } from '@/composables/useLeadActions'
import { LEAD_STAGES } from '@/utils/stageMapper'
import { useLQWidgetCall } from '@/composables/useLQWidgetCall'
import { useLQWidgetOutcomes } from '@/composables/useLQWidgetOutcomes'
import { useLQWidgetHandlers } from '@/composables/useLQWidgetHandlers'
import CallInterface from '@/components/tasks/lead/CallInterface.vue'
import DeadlineBanner from '@/components/tasks/shared/DeadlineBanner.vue'
import AppointmentCommunications from '@/components/shared/communication/AppointmentCommunications.vue'
import CloseAsLostForm from '@/components/shared/CloseAsLostForm.vue'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'
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
  }
})

const emit = defineEmits(['postponed', 'validated', 'qualified', 'disqualified', 'call-attempt-logged', 'note-saved', 'open-purchase-method', 'appointment-scheduled', 'survey-completed', 'survey-refused', 'not-responding', 'update:outcomeSaving'])

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

function formatTradeInCurrency(val) {
  if (val == null) return '0'
  const n = typeof val === 'string' ? parseFloat(val) : val
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// Assignment state
const selectedDealership = ref('')
const selectedTeam = ref('')
const selectedAssignee = ref('')

// Note for sellers (when assign-only is selected)
const noteForSellers = ref('')

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
  selectOutcome('interested')
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

const dynamicDescription = computed(() => {
  const base = leadState.primaryAction.value?.description || 'Begin lead qualification by verifying customer contact information.'
  const name = props.lead.customer?.name ?? ''
  const phone = props.lead.customer?.phone ?? ''
  return mergeContactIntoDescription(base, name, phone)
})

const isOverdue = computed(() => {
  // Lead tasks use nextActionDue only (scheduled appointments are for opportunities)
  if (!props.lead.nextActionDue) return false
  const due = new Date(props.lead.nextActionDue)
  const now = new Date()
  return due < now
})


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
  showNoteModal,
  followupChannels,
  followupChannel,
  selectedTemplate,
  rescheduleTime,
  customDate,
  customTime,
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
  qualificationMethod,
  qualificationEventType,
  qualificationDurationMinutes,
  qualificationCustomDuration,
  qualificationCalendarMonth,
  qualificationSelectedDate,
  qualificationSelectedSlot,
  setQualificationSelectedSlot,
  qualificationDateRange,
  qualificationCustomDateStart,
  qualificationCustomDateEnd,
  availableDatesForRange,
  qualificationScheduleSlotOptions,
  qualificationDurationValue,
  qualificationSelectedTeam,
  qualificationSelectedSalesman,
  suggestedTeam,
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

// Filter schedule slots based on selected team or salesperson availability
const availableScheduleSlots = computed(() => {
  if (!qualificationSelectedDate.value) {
    return []
  }
  
  // Format date as YYYY-MM-DD
  const dateStr = qualificationSelectedDate.value.toISOString().split('T')[0]
  
  // If salesperson is selected, use their availability
  if (qualificationSelectedSalesman.value) {
    const availableSlots = getAvailabilityForAssignee(`user-${qualificationSelectedSalesman.value.id}`, dateStr)
    return qualificationScheduleSlotOptions.value.filter(slot => availableSlots.includes(slot))
  }
  
  // If team is selected, use team availability
  if (qualificationSelectedTeam.value) {
    const availableSlots = getAvailabilityForAssignee(`team-${qualificationSelectedTeam.value.id}`, dateStr)
    return qualificationScheduleSlotOptions.value.filter(slot => availableSlots.includes(slot))
  }
  
  // If neither selected, show all slots (so time slots are visible by default)
  return qualificationScheduleSlotOptions.value || []
})

// Watch for date changes to reset time slot
watch(qualificationSelectedDate, () => {
  qualificationSelectedSlot.value = ''
})

const existingNotes = computed(() => {
  return props.activities.filter(activity => activity.type === 'note')
})

// Three suggested teams (first 3 from assignable teams) - kept for potential future use
const suggestedTeams = computed(() => {
  const teams = assignableTeams.value || []
  return teams.slice(0, 3)
})

// Sort teams so selected team appears first
const sortedTeams = computed(() => {
  if (!assignableTeams.value) return []
  const teams = [...assignableTeams.value]
  if (qualificationSelectedTeam.value) {
    const selectedIndex = teams.findIndex(t => t.id === qualificationSelectedTeam.value.id)
    if (selectedIndex > 0) {
      const selected = teams.splice(selectedIndex, 1)[0]
      teams.unshift(selected)
    }
  }
  return teams
})

// Team options for SelectMenu
const teamSelectOptions = computed(() => {
  return sortedTeams.value.map(team => ({
    ...team,
    label: `${team.dealership || 'No location'} → ${team.name}`,
    value: team.id
  }))
})

// Salesperson options for SelectMenu (filtered by selected team when set, otherwise all assignable users)
const salespersonSelectOptions = computed(() => {
  const users = qualificationSelectedTeam.value
    ? (assignableUsers.value?.filter(user =>
        user.team === qualificationSelectedTeam.value.name || user.teamId === qualificationSelectedTeam.value.id
      ) || [])
    : (assignableUsers.value || [])
  return users.map(user => ({
    ...user,
    label: user.name,
    value: user.id
  }))
})

// Computed refs for SelectMenu v-model (convert between object and ID)
const selectedTeamId = computed({
  get: () => qualificationSelectedTeam.value?.id || null,
  set: (id) => {
    if (!id) {
      qualificationSelectedTeam.value = null
      return
    }
    const team = assignableTeams.value?.find(t => t.id === id)
    qualificationSelectedTeam.value = team || null
  }
})

const selectedSalesmanId = computed({
  get: () => qualificationSelectedSalesman.value?.id || null,
  set: (id) => {
    if (!id) {
      qualificationSelectedSalesman.value = null
      return
    }
    const user = salespersonSelectOptions.value.find(u => u.id === id)
    qualificationSelectedSalesman.value = user || null
  }
})

// Next attempt reassign: combined users + teams for SelectMenu (unique _key for value-key)
const nextAttemptAssigneeOptions = computed(() => {
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
  return [...users, ...teams]
})

const selectedNextAttemptKey = computed({
  get: () => {
    const a = nextAttemptAssignee.value
    if (!a) return null
    return a.type === 'user' ? `user-${a.id}` : `team-${a.id}`
  },
  set: (key) => {
    if (!key) {
      nextAttemptAssignee.value = null
      return
    }
    const opt = nextAttemptAssigneeOptions.value.find(o => o._key === key)
    nextAttemptAssignee.value = opt ? { ...opt } : null
  }
})

function resolveInitialTeamForSchedule() {
  if (!qualificationEventType.value || qualificationSelectedTeam.value || qualificationSelectedSalesman.value) return
  const teams = assignableTeams.value
  if (!teams?.length) return
  const suggested = suggestedTeam.value
  if (suggested) {
    const team = teams.find(t => t.id === suggested.id || t.name === suggested.name)
    if (team) {
      qualificationSelectedTeam.value = team
      return
    }
  }
  if (props.lead.assignee) {
    const assigneeTeam = teams.find(t => t.name === props.lead.assignee)
    if (assigneeTeam) {
      qualificationSelectedTeam.value = assigneeTeam
      return
    }
  }
  qualificationSelectedTeam.value = teams[0]
}

watch(
  () => [
    qualificationEventType.value,
    suggestedTeam.value,
    (assignableTeams.value ?? []).length,
    props.lead.assignee
  ],
  () => {
    resolveInitialTeamForSchedule()
  },
  { immediate: true }
)

watch(
  () => qualificationEventType.value && !qualificationSelectedTeam.value,
  (shouldResolve) => {
    if (shouldResolve) {
      nextTick(resolveInitialTeamForSchedule)
    }
  },
  { immediate: true }
)

// Auto-select today's date when event type is selected
watch(qualificationEventType, (eventType) => {
  if (eventType && !qualificationSelectedDate.value) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    qualificationSelectedDate.value = today
    // Update calendar to show current month
    qualificationCurrentMonth.value = today.getMonth()
    qualificationCurrentYear.value = today.getFullYear()
    // Clear any previously selected slot
    qualificationSelectedSlot.value = ''
  }
}, { immediate: true })

// Use lead.assignee (set by TaskAssignee component) when entering "interested" flow (for assign-only)
watch(selectedOutcome, (outcome) => {
  if (outcome === 'interested' && qualificationMethod.value === 'assign-only' && !assignment.value?.assignee) {
    // Try to use the assignee from the lead object (set by TaskAssignee component)
    if (props.lead.assignee) {
      const assigneeUser = assignableUsers.value?.find(u => u.name === props.lead.assignee)
      const assigneeTeam = assignableTeams.value?.find(t => t.name === props.lead.assignee)
      
      if (assigneeUser) {
        assignment.value = { ...assignment.value, assignee: { ...assigneeUser, type: 'user' } }
      } else if (assigneeTeam) {
        assignment.value = { ...assignment.value, assignee: { ...assigneeTeam, type: 'team' } }
      }
    } else if (suggestedTeams.value.length > 0) {
      // Fallback: use first suggested team if no assignee
      assignment.value = { ...assignment.value, assignee: { ...suggestedTeams.value[0], type: 'team' } }
    }
  }
})

// Watch for team selection to reset salesman selection
watch(() => assignment.value?.assignee, (newAssignee) => {
  if (newAssignee?.type !== 'team') {
    qualificationSelectedSalesman.value = null
  }
})

// Watch for qualificationSelectedTeam changes to reset salesman selection and auto-select availability
watch(qualificationSelectedTeam, (newTeam) => {
  qualificationSelectedSalesman.value = null
  
  // Auto-select soonest availability for team
  if (newTeam && qualificationEventType.value) {
    selectSoonestAvailability(`team-${newTeam.id}`)
  }
})

// Watch for salesman changes to update availability
watch(qualificationSelectedSalesman, (newSalesman) => {
  // Auto-select soonest availability for salesperson
  if (newSalesman) {
    selectSoonestAvailability(`user-${newSalesman.id}`)
  } else if (qualificationSelectedTeam.value) {
    // If salesman is cleared, go back to team availability
    selectSoonestAvailability(`team-${qualificationSelectedTeam.value.id}`)
  }
})

// Watch for date changes to reset slot selection
watch(qualificationSelectedDate, () => {
  qualificationSelectedSlot.value = ''
})

// Helper function to find and select the soonest available date and time slot
const selectSoonestAvailability = (assigneeId) => {
  // Start from today and look for the next 30 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() + i)
    
    // Skip weekends
    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
      continue
    }
    
    const dateStr = checkDate.toISOString().split('T')[0]
    const availableSlots = getAvailabilityForAssignee(assigneeId, dateStr)
    
    if (availableSlots && availableSlots.length > 0) {
      // Found first available date with slots
      qualificationSelectedDate.value = checkDate
      
      // Update calendar to show this month
      qualificationCurrentMonth.value = checkDate.getMonth()
      qualificationCurrentYear.value = checkDate.getFullYear()
      
      // Select the first available time slot
      // Wait for next tick to ensure availableScheduleSlots is updated
      setTimeout(() => {
        const filteredSlots = qualificationScheduleSlotOptions.value.filter(slot => availableSlots.includes(slot))
        if (filteredSlots.length > 0) {
          qualificationSelectedSlot.value = filteredSlots[0]
        }
      }, 0)
      
      break
    }
  }
}


// Check if everything is selected for "Send and postpone" button
const canSendAndPostpone = computed(() => {
  if (selectedOutcome.value !== 'no-answer') return false
  if (!followupChannel.value) return false
  if (followupChannel.value !== 'dont-send' && !selectedTemplate.value) return false
  if (!rescheduleTime.value) return false
  if (rescheduleTime.value === 'custom' && (!customDate.value || !customTime.value)) return false
  return true
})

const canPostponeFromInterested = computed(() => {
  if (selectedOutcome.value !== 'interested') return false
  if (!rescheduleTime.value) return false
  if (rescheduleTime.value === 'custom' && (!customDate.value || !customTime.value)) return false
  return true
})

function onPostponeClick() {
  showPostponeRescheduleBlock.value = !showPostponeRescheduleBlock.value
}

async function onConfirmPostpone() {
  if (!canPostponeFromInterested.value) return
  await handlePostponeFromInterested()
  showPostponeRescheduleBlock.value = false
}

function scrollToExpandedContent(getEl) {
  nextTick(() => {
    const el = typeof getEl === 'function' ? getEl() : getEl
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

watch(selectedOutcome, (newOutcome) => {
  if (newOutcome) {
    scrollToExpandedContent(() => expandedOutcomeRef.value)
  }
})

watch(showPostponeRescheduleBlock, (show) => {
  if (show) {
    scrollToExpandedContent(() => postponeBlockRef.value)
    // Autofill reassign with current assignee when opening postpone "Next call attempt" card
    if (!nextAttemptAssignee.value && currentUser?.value) {
      nextAttemptAssignee.value = { ...currentUser.value, type: 'user' }
    }
  }
})

watch(qualificationEventType, (eventType) => {
  if (eventType) {
    scrollToExpandedContent(() => eventTypeExpandedRef.value)
  }
})

watch(selectedOutcome, (newOutcome) => {
  if (newOutcome !== 'interested') {
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

// Calendar state
const qualificationCurrentMonth = ref(new Date().getMonth())
const qualificationCurrentYear = ref(new Date().getFullYear())

// Calendar day labels - start from Monday
const calendarDayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

// Current month/year display
const currentMonthYear = computed(() => {
  const date = new Date(qualificationCurrentYear.value, qualificationCurrentMonth.value)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// Calendar days for current month (Monday = 0, Sunday = 6)
const calendarDays = computed(() => {
  const firstDay = new Date(qualificationCurrentYear.value, qualificationCurrentMonth.value, 1)
  const lastDay = new Date(qualificationCurrentYear.value, qualificationCurrentMonth.value + 1, 0)
  const daysInMonth = lastDay.getDate()
  // Convert Sunday (0) to 6, Monday (1) to 0, etc. so Monday is first
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  
  const days = []
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }
  return days
})

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

// Check if date is selected
const isSelectedQualificationDate = (day) => {
  if (!day || !qualificationSelectedDate.value) return false
  const selected = qualificationSelectedDate.value
  return selected.getDate() === day && 
         selected.getMonth() === qualificationCurrentMonth.value && 
         selected.getFullYear() === qualificationCurrentYear.value
}

// Select date from calendar
const selectQualificationDate = (day) => {
  if (!day) return
  const date = new Date(qualificationCurrentYear.value, qualificationCurrentMonth.value, day)
  qualificationSelectedDate.value = date
  qualificationSelectedSlot.value = ''
}

// Navigate months
const previousMonth = () => {
  if (qualificationCurrentMonth.value === 0) {
    qualificationCurrentMonth.value = 11
    qualificationCurrentYear.value--
  } else {
    qualificationCurrentMonth.value--
  }
}

const nextMonth = () => {
  if (qualificationCurrentMonth.value === 11) {
    qualificationCurrentMonth.value = 0
    qualificationCurrentYear.value++
  } else {
    qualificationCurrentMonth.value++
  }
}

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

const canQualify = computed(() => {
  const hasAssignee = Boolean(qualificationSelectedTeam.value || qualificationSelectedSalesman.value)
  if (qualificationMethod.value === 'assign-only') {
    return true
  }

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

// Handle close from CloseAsLostForm
function handleCloseFromForm(reason) {
  disqualifyReason.value = reason
  // Set a default category based on the reason if needed
  if (!disqualifyCategory.value) {
    // Default to "Not Valid" for lead disqualification
    disqualifyCategory.value = 'Not Valid'
  }
  handleNotValidConfirm()
}

const actionButtonLabel = computed(() => {
  if (selectedOutcome.value === 'no-answer') {
    return followupChannel.value === 'dont-send' ? 'Postpone' : 'Send and postpone'
  }
  if (selectedOutcome.value === 'not-valid') {
    return disqualifyCategory.value ? `Close as ${disqualifyCategory.value}` : 'Close'
  }
  if (selectedOutcome.value === 'interested') {
    return qualificationMethod.value === 'assign-only' ? 'Qualify' : 'Schedule and qualify'
  }
  return ''
})

const canConfirmAction = computed(() => {
  if (selectedOutcome.value === 'no-answer') {
    return canSendAndPostpone.value
  }
  if (selectedOutcome.value === 'not-valid') {
    return canCloseAsNotValid.value
  }
  if (selectedOutcome.value === 'interested') {
    return canQualify.value
  }
  return false
})

const handleConfirmAction = async () => {
  if (selectedOutcome.value === 'no-answer') {
    emit('update:outcomeSaving', true)
    await handleNoAnswerConfirm()
    // Parent clears loading when it finishes handling @postponed / @disqualified
  } else if (selectedOutcome.value === 'not-valid') {
    emit('update:outcomeSaving', true)
    handleNotValidConfirm()
  } else if (selectedOutcome.value === 'interested') {
    handleQualify()
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
  enrichLeadData
)

const {
  logManualCall,
  handleQualify,
  handleDisqualifyFromInterested,
  handleNoAnswerConfirm,
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

