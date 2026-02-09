<template>
  <div class="page-container">
    <!-- Header -->
    <PageHeader title="Settings">
      <template #actions>
      </template>
    </PageHeader>
    
    <!-- Content -->
    <div class="p-4 md:p-6 lg:p-8">
      <!-- Tabs -->
      <Tabs v-model="activeTab" class="mb-6">
        <TabsList class="flex shrink-0 border-0 bg-background rounded-none w-full relative h-full">
          <TabsTrigger
            value="general"
            class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
            :class="activeTab === 'general' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
          >
            <span>General</span>
            <span
              v-if="activeTab === 'general'"
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
            />
          </TabsTrigger>
          <TabsTrigger
            value="urgency"
            class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
            :class="activeTab === 'urgency' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
          >
            <span>Urgency Settings</span>
            <span
              v-if="activeTab === 'urgency'"
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
            />
          </TabsTrigger>
          <TabsTrigger
            value="navigation"
            class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
            :class="activeTab === 'navigation' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
          >
            <span>Navigation</span>
            <span
              v-if="activeTab === 'navigation'"
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
            />
          </TabsTrigger>
        </TabsList>

        <form @submit.prevent="handleSave" class="mt-6">
          <!-- General Tab Content -->
          <TabsContent value="general" class="overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 space-y-8">
              <!-- Opportunity Task Widget Thresholds -->
              <div class="bg-card border border-border rounded-lg p-6 lg:col-span-2">
                <h2 class="text-lg font-semibold text-foreground mb-4">Opportunity Task Widget Thresholds</h2>
                <p class="text-sm text-muted-foreground mb-6">Configure the number of days before task widgets are triggered for opportunities.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- OOFB -->
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">OOFB (Overdue Offer Follow-up)</Label>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <Label class="text-sm text-muted-foreground mb-1">Min Days</Label>
                        <Input
                          type="number"
                          v-model.number="localSettings.oofbMinDays"
                          min="1"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <Label class="text-sm text-muted-foreground mb-1">Max Days</Label>
                        <Input
                          type="number"
                          v-model.number="localSettings.oofbMaxDays"
                          min="1"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- UFB -->
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">UFB (Urgent Follow-up)</Label>
                    <Label class="text-sm text-muted-foreground mb-1">Days Threshold</Label>
                    <Input
                      type="number"
                      v-model.number="localSettings.ufbDays"
                      min="1"
                      class="w-full"
                    />
                  </div>

                  <!-- OFB -->
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">OFB (Offer Follow-up)</Label>
                    <Label class="text-sm text-muted-foreground mb-1">Days Threshold</Label>
                    <Input
                      type="number"
                      v-model.number="localSettings.ofbDays"
                      min="1"
                      class="w-full"
                    />
                  </div>

                  <!-- NFU -->
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">NFU (No Future Updates)</Label>
                    <Label class="text-sm text-muted-foreground mb-1">Days Threshold</Label>
                    <Input
                      type="number"
                      v-model.number="localSettings.nfuDays"
                      min="1"
                      class="w-full"
                    />
                  </div>

                  <!-- CFB -->
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">CFB (Contract Follow-up)</Label>
                    <Label class="text-sm text-muted-foreground mb-1">Days Threshold</Label>
                    <Input
                      type="number"
                      v-model.number="localSettings.cfbDays"
                      min="1"
                      class="w-full"
                    />
                  </div>

                  <!-- DFB -->
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">DFB (Delivery Feedback)</Label>
                    <Label class="text-sm text-muted-foreground mb-1">Days Threshold</Label>
                    <Input
                      type="number"
                      v-model.number="localSettings.dfbDays"
                      min="1"
                      class="w-full"
                    />
                  </div>

                </div>
              </div>

              <!-- Opportunity Expected Close Date -->
              <div class="bg-card border border-border rounded-lg p-6">
                <h2 class="text-lg font-semibold text-foreground mb-4">Expected Close Date</h2>
                <p class="text-sm text-muted-foreground mb-6">Configure default expected close date for new opportunities.</p>
                
                <div class="space-y-6">
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">Default Expected Close Date (Days)</Label>
                    <p class="text-sm text-muted-foreground mb-2">Number of days from creation date to set as default expected close date</p>
                    <Input
                      type="number"
                      v-model.number="localSettings.expectedCloseDateDays"
                      min="1"
                      class="w-full max-w-xs"
                    />
                  </div>
                </div>
              </div>

              <!-- Task Postponement -->
              <div class="bg-card border border-border rounded-lg p-6">
                <h2 class="text-lg font-semibold text-foreground mb-4">Task Postponement</h2>
                <p class="text-sm text-muted-foreground mb-6">Configure task postponement behavior.</p>
                
                <div class="space-y-6">
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">Default Postpone Period (Days)</Label>
                    <p class="text-sm text-muted-foreground mb-2">Default number of days to postpone a task when postponed</p>
                    <Input
                      type="number"
                      v-model.number="localSettings.postponeTaskDays"
                      min="1"
                      class="w-full max-w-xs"
                    />
                  </div>
                </div>
              </div>

              <!-- Opportunity Abandonment -->
              <div class="bg-card border border-border rounded-lg p-6">
                <h2 class="text-lg font-semibold text-foreground mb-4">Opportunity Abandonment</h2>
                <p class="text-sm text-muted-foreground mb-6">Configure when opportunities are marked as abandoned.</p>
                
                <div class="space-y-6">
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">Abandoned Threshold (Days)</Label>
                    <p class="text-sm text-muted-foreground mb-2">Number of days with no activity before marking as abandoned</p>
                    <Input
                      type="number"
                      v-model.number="localSettings.abandonedOpportunityDays"
                      min="1"
                      class="w-full max-w-xs"
                    />
                  </div>

                  <div>
                    <Label class="text-sm font-medium text-foreground mb-3">Eligible Stages</Label>
                    <p class="text-sm text-muted-foreground mb-3">Select which stages can be marked as abandoned</p>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div
                        v-for="stage in availableStages"
                        :key="stage"
                        class="flex items-center gap-2"
                      >
                        <Checkbox
                          :id="`stage-${stage}`"
                          :value="stage"
                          v-model="localSettings.abandonedEligibleStages"
                        />
                        <Label :for="`stage-${stage}`" class="text-sm text-foreground cursor-pointer">{{ stage }}</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lead Management -->
              <div class="bg-card border border-border rounded-lg p-6">
                <h2 class="text-lg font-semibold text-foreground mb-4">Lead Management</h2>
                <p class="text-sm text-muted-foreground mb-6">Configure lead qualification and conversion settings.</p>
                
                <div class="space-y-6">
                  <div>
                    <Label class="text-sm font-medium text-foreground mb-2">Max Contact Attempts</Label>
                    <p class="text-sm text-muted-foreground mb-2">Maximum number of contact attempts before auto-disqualification</p>
                    <Input
                      type="number"
                      v-model.number="localSettings.maxContactAttempts"
                      min="1"
                      max="20"
                      class="w-full max-w-xs"
                    />
                  </div>

                  <Checkbox
                    v-model="localSettings.excludeNotValidFromConversion"
                    label='Exclude "NOT VALID" leads from conversion rate calculations'
                  />
                </div>
              </div>

              <!-- Task Widgets -->
              <div class="bg-card border border-border rounded-lg p-6">
                <h2 class="text-lg font-semibold text-foreground mb-4">Task Widgets</h2>
                <p class="text-sm text-muted-foreground mb-6">Configure task widget behavior.</p>
                
                <Checkbox
                  v-model="localSettings.autoCloseWidgetsOnClose"
                  label="Auto-close NFU/OFB widgets when opportunity is closed (Won/Lost)"
                />
              </div>
            </div>
          </TabsContent>

          <!-- Navigation Settings Tab Content -->
          <TabsContent value="navigation" class="overflow-y-auto max-h-[calc(100vh-12rem)]">
            <div class="bg-card border border-border rounded-lg p-6">
              <h2 class="text-lg font-semibold text-foreground mb-4">Navigation Menu Items</h2>
              <p class="text-sm text-muted-foreground mb-6">Control which navigation items appear in the sidebar and mobile menu.</p>
              
              <div class="space-y-4">
                <Checkbox
                  v-model="localSettings.navigationVisibility.home"
                  label="Home"
                />
                <Checkbox
                  v-model="localSettings.navigationVisibility.tasks"
                  label="Tasks"
                />
                <Checkbox
                  v-model="localSettings.navigationVisibility.customers"
                  label="Customers"
                />
                <Checkbox
                  v-model="localSettings.navigationVisibility.calendar"
                  label="Calendar"
                />
                <Checkbox
                  v-model="localSettings.navigationVisibility.reports"
                  label="Reports"
                />
                <Checkbox
                  v-model="localSettings.navigationVisibility.lists"
                  label="Lists"
                />
                <Checkbox
                  v-model="localSettings.navigationVisibility.search"
                  label="Search"
                />
                <Checkbox
                  v-model="localSettings.navigationVisibility.language"
                  label="Language"
                />
                <div class="mt-6 p-3 bg-muted border border-border rounded-lg">
                  <p class="text-xs text-muted-foreground">
                    <strong>Note:</strong> The Settings icon is always visible to ensure you can access this page.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Urgency Settings Tab Content -->
          <TabsContent value="urgency" class="overflow-y-auto max-h-[calc(100vh-12rem)]">
            <!-- Lead Urgency Auto-Sorter -->
            <div class="bg-card border border-border rounded-lg p-6">
              <h2 class="text-lg font-semibold text-foreground mb-4">Lead Urgency Auto-Sorter</h2>
              
              <!-- Explanation Section -->
              <div class="mb-6">
                <p class="text-sm text-muted-foreground mb-4">
                  Prioritizes leads based on intent signals, behavioral engagement, and temporal urgency. Leads are scored and categorized into urgency levels.
                </p>
                <table class="w-full text-sm text-foreground border border-border rounded-lg">
                  <thead class="bg-muted">
                    <tr>
                      <th class="px-3 py-2 text-left font-semibold">Level</th>
                      <th class="px-3 py-2 text-left font-semibold">Score</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    <tr>
                      <td class="px-3 py-2 font-medium"><strong>HOT</strong></td>
                      <td class="px-3 py-2">{{ localSettings.urgencyThresholds?.hot || 80 }}-100</td>
                    </tr>
                    <tr>
                      <td class="px-3 py-2 font-medium"><strong>WARM</strong></td>
                      <td class="px-3 py-2">{{ localSettings.urgencyThresholds?.warm || 50 }}-{{ (localSettings.urgencyThresholds?.hot || 80) - 1 }}</td>
                    </tr>
                    <tr>
                      <td class="px-3 py-2 font-medium"><strong>STANDARD</strong></td>
                      <td class="px-3 py-2">{{ localSettings.urgencyThresholds?.standard || 20 }}-{{ (localSettings.urgencyThresholds?.warm || 50) - 1 }}</td>
                    </tr>
                    <tr>
                      <td class="px-3 py-2 font-medium"><strong>COLD</strong></td>
                      <td class="px-3 py-2">0-{{ (localSettings.urgencyThresholds?.standard || 20) - 1 }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Configuration Controls -->
              <div class="space-y-6 border-t border-border pt-6">
                <!-- Enable/Disable Toggle -->
                <div class="flex items-center gap-3">
                  <Toggle v-model="localSettings.urgencyEnabled" name="urgencyEnabled" />
                  <span class="text-sm font-medium text-foreground">
                    Enable Urgency Auto-Sorter
                  </span>
                </div>
                
                <div v-if="localSettings.urgencyEnabled" class="space-y-6">
                  <!-- Weight Sliders -->
                  <div>
                    <h3 class="text-sm font-medium text-foreground mb-2">Scoring Weights</h3>
                    <p class="text-sm text-muted-foreground mb-4">
                      Adjust the relative importance of each factor. Weights are automatically normalized to 100%, so the system uses the ratio between values rather than absolute percentages.
                    </p>
                    <div class="space-y-4">
                      <div>
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                              <Label class="text-sm font-medium text-foreground">Intent Signals</Label>
                              <span class="text-sm text-muted-foreground">{{ localSettings.urgencyWeights?.intent || 40 }}%</span>
                            </div>
                            <p class="text-sm text-muted-foreground">Measured by explicit actions: test drive requests, financing inquiries, trade-in value checks, dealer location searches, vehicle configuration activity</p>
                          </div>
                        </div>
                        <input
                          type="range"
                          v-model.number="localSettings.urgencyWeights.intent"
                          min="0"
                          max="100"
                          class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                              <Label class="text-sm font-medium text-foreground">Behavioral Engagement</Label>
                              <span class="text-sm text-muted-foreground">{{ localSettings.urgencyWeights?.behavioral || 35 }}%</span>
                            </div>
                            <p class="text-sm text-muted-foreground">Measured by digital interaction depth: time spent using configurator, number of return visits, downloaded brochures or financing materials, depth of features explored</p>
                          </div>
                        </div>
                        <input
                          type="range"
                          v-model.number="localSettings.urgencyWeights.behavioral"
                          min="0"
                          max="100"
                          class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                              <Label class="text-sm font-medium text-foreground">Temporal Urgency</Label>
                              <span class="text-sm text-muted-foreground">{{ localSettings.urgencyWeights?.temporal || 25 }}%</span>
                            </div>
                            <p class="text-sm text-muted-foreground">Measured by time-sensitive factors: lead freshness, weekend/evening submissions, approaching the 4th contact attempt, days since last contact</p>
                          </div>
                        </div>
                        <input
                          type="range"
                          v-model.number="localSettings.urgencyWeights.temporal"
                          min="0"
                          max="100"
                          class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <p class="text-sm text-muted-foreground mt-2">
                        Total: {{ (localSettings.urgencyWeights?.intent || 0) + (localSettings.urgencyWeights?.behavioral || 0) + (localSettings.urgencyWeights?.temporal || 0) }}% 
                        (weights will be normalized automatically)
                      </p>
                    </div>
                  </div>
                  
                  <!-- Threshold Inputs -->
                  <div>
                    <h3 class="text-sm font-medium text-foreground mb-4">Urgency Level Thresholds</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label class="text-sm font-medium text-foreground mb-2">HOT (minimum score)</Label>
                        <Input
                          type="number"
                          v-model.number="localSettings.urgencyThresholds.hot"
                          min="0"
                          max="100"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <Label class="text-sm font-medium text-foreground mb-2">WARM (minimum score)</Label>
                        <Input
                          type="number"
                          v-model.number="localSettings.urgencyThresholds.warm"
                          min="0"
                          max="100"
                          class="w-full"
                        />
                      </div>
                      <div>
                        <Label class="text-sm font-medium text-foreground mb-2">STANDARD (minimum score)</Label>
                        <Input
                          type="number"
                          v-model.number="localSettings.urgencyThresholds.standard"
                          min="0"
                          max="100"
                          class="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <!-- Preview Section -->
                  <div class="bg-muted border border-border rounded-lg p-4">
                    <h3 class="text-sm font-semibold text-foreground mb-3">Preview</h3>
                    <p class="text-xs text-muted-foreground mb-2">
                      Example scores based on current settings:
                    </p>
                    <div class="text-xs space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-foreground">HOT:</span>
                        <span class="font-medium text-foreground">{{ localSettings.urgencyThresholds?.hot || 80 }}-100</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-foreground">WARM:</span>
                        <span class="font-medium text-foreground">{{ localSettings.urgencyThresholds?.warm || 50 }}-{{ (localSettings.urgencyThresholds?.hot || 80) - 1 }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-foreground">STANDARD:</span>
                        <span class="font-medium text-foreground">{{ localSettings.urgencyThresholds?.standard || 20 }}-{{ (localSettings.urgencyThresholds?.warm || 50) - 1 }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-foreground">COLD:</span>
                        <span class="font-medium text-foreground">0-{{ (localSettings.urgencyThresholds?.standard || 20) - 1 }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-between items-center pt-4 border-t border-border mt-6">
              <Button
                label="Reset to Defaults"
                variant="outline"
                size="medium"
                @click="handleReset"
              />
              <div class="flex gap-3">
                <Button
                  label="Cancel"
                  variant="outline"
                  size="medium"
                  @click="handleCancel"
                />
                <Button
                  label="Save Settings"
                  variant="primary"
                  size="medium"
                  type="submit"
                />
              </div>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { Button, Checkbox, Toggle, Tabs, TabsList, TabsTrigger, TabsContent, Input, Label } from '@motork/component-library/future/primitives'
import PageHeader from '@/components/layout/PageHeader.vue'

const settingsStore = useSettingsStore()

// Tab state
const activeTab = ref('general')

// Available stages for abandonment eligibility
const availableStages = [
  'Qualified',
  'Awaiting Appointment',
  'In Negotiation'
]

// Local copy of settings for editing
const localSettings = ref({
  abandonedEligibleStages: [],
  urgencyEnabled: true,
  urgencyWeights: {
    intent: 40,
    behavioral: 35,
    temporal: 25
  },
  urgencyThresholds: {
    hot: 80,
    warm: 50,
    standard: 20
  },
  navigationVisibility: {
    home: true,
    tasks: true,
    customers: true,
    calendar: true,
    reports: true,
    lists: true,
    search: true,
    language: true
  }
})

// Load settings into local state
onMounted(() => {
  loadSettings()
})

function loadSettings() {
  localSettings.value = {
    ...settingsStore.settings,
    // Deep copy array to avoid reference issues
    abandonedEligibleStages: [...(settingsStore.settings.abandonedEligibleStages || [])],
    // Ensure urgency settings exist with defaults
    urgencyEnabled: settingsStore.settings.urgencyEnabled !== undefined ? settingsStore.settings.urgencyEnabled : true,
    urgencyWeights: {
      intent: settingsStore.settings.urgencyWeights?.intent || 40,
      behavioral: settingsStore.settings.urgencyWeights?.behavioral || 35,
      temporal: settingsStore.settings.urgencyWeights?.temporal || 25
    },
    urgencyThresholds: {
      hot: settingsStore.settings.urgencyThresholds?.hot || 80,
      warm: settingsStore.settings.urgencyThresholds?.warm || 50,
      standard: settingsStore.settings.urgencyThresholds?.standard || 20
    },
    // Ensure navigation visibility settings exist with defaults
    navigationVisibility: {
      home: settingsStore.settings.navigationVisibility?.home ?? true,
      tasks: settingsStore.settings.navigationVisibility?.tasks ?? true,
      customers: settingsStore.settings.navigationVisibility?.customers ?? true,
      calendar: settingsStore.settings.navigationVisibility?.calendar ?? true,
      reports: settingsStore.settings.navigationVisibility?.reports ?? true,
      lists: settingsStore.settings.navigationVisibility?.lists ?? true,
      search: settingsStore.settings.navigationVisibility?.search ?? true,
      language: settingsStore.settings.navigationVisibility?.language ?? true
    }
  }
}

function handleSave() {
  settingsStore.updateSettings(localSettings.value)
  alert('Settings saved successfully!')
}

function handleReset() {
  if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
    settingsStore.resetToDefaults()
    loadSettings()
    alert('Settings reset to defaults.')
  }
}

function handleCancel() {
  loadSettings()
}
</script>

<style scoped>
/* Tab styling to match TaskDetailView */
:deep([role="tablist"]) {
  border: none !important;
  border-bottom: 1px solid var(--color-border) !important;
  padding: 0 !important;
  margin: 0 !important;
  gap: 0 !important;
  height: auto !important;
  min-height: 48px !important;
}

:deep([role="tab"]) {
  background: transparent !important;
  border: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  margin: 0 !important;
  padding: 12px 16px !important;
  position: relative !important;
  box-shadow: none !important;
  height: 100% !important;
  min-height: 48px !important;
}

:deep([role="tab"]:not(:last-child)) {
  border-right: none !important;
}

:deep([role="tab"]::before),
:deep([role="tab"]::after) {
  display: none !important;
  box-shadow: none !important;
}

:deep([role="tab"] *) {
  box-shadow: none !important;
}

:deep([role="tab"][data-state="active"]) {
  color: var(--color-text-foreground) !important;
  box-shadow: none !important;
}

:deep([role="tab"][data-state="inactive"]) {
  color: var(--color-text-muted-foreground) !important;
  box-shadow: none !important;
}
</style>

