<template>
  <div class="page-container overflow-y-auto">
    <Tabs v-model="activeTab">
      <!-- Tabs only (title shown in top AppHeader) -->
      <PageHeader title="">
        <template #bottom>
          <div class="pb-0">
            <TabsList class="flex shrink-0 border-0 bg-background rounded-none w-full relative h-full">
              <TabsTrigger
                value="tasks"
                class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
                :class="activeTab === 'tasks' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
              >
                <span>Tasks</span>
                <span
                  v-if="activeTab === 'tasks'"
                  class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
                />
              </TabsTrigger>
              <TabsTrigger
                value="scores"
                class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
                :class="activeTab === 'scores' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
              >
                <span>Scores</span>
                <span
                  v-if="activeTab === 'scores'"
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
              <TabsTrigger
                v-if="isDev"
                value="development"
                class="flex items-center gap-2 text-sm font-medium transition-all relative flex-1 justify-center bg-transparent outline-none h-full"
                :class="activeTab === 'development' ? 'text-foreground' : 'text-muted-foreground hover:text-muted-foreground'"
              >
                <span>Development</span>
                <span
                  v-if="activeTab === 'development'"
                  class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary z-10"
                />
              </TabsTrigger>
            </TabsList>
          </div>
        </template>
      </PageHeader>

      <!-- Content -->
      <div class="pt-2 px-4 pb-8 md:pt-3 md:px-6 md:pb-10 lg:pt-4 lg:px-8 lg:pb-12">
        <form @submit.prevent="handleSave" class="mt-6 flex flex-col">
          <!-- Tasks Tab Content -->
          <TabsContent value="tasks" class="data-[state=inactive]:hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Card: Opportunity settings -->
              <div class="bg-card border border-border rounded-lg p-6 shadow-mk-dashboard-card flex flex-col">
                <h3 class="text-title mb-6">Opportunity settings</h3>
                <div class="space-y-8">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="space-y-3">
                      <Label class="text-content font-medium text-foreground">Expected Close Date (Days)</Label>
                      <Input type="number" v-model.number="localSettings.expectedCloseDateDays" min="1" class="w-full" />
                    </div>
                    <div class="space-y-3">
                      <Label class="text-content font-medium text-foreground">Abandoned Threshold (Days)</Label>
                      <Input type="number" v-model.number="localSettings.abandonedOpportunityDays" min="1" class="w-full" />
                    </div>
                  </div>
                  <div class="space-y-3">
                    <Label class="text-content font-medium text-foreground">Eligible Stages (abandonment)</Label>
                    <p class="text-meta">Stages that count toward abandonment.</p>
                    <div class="flex flex-wrap gap-4 pt-2">
                      <div v-for="stage in availableStages" :key="stage" class="flex items-center gap-2">
                        <Checkbox
                          :id="`tasks-stage-${stage}`"
                          :value="stage"
                          v-model="localSettings.abandonedEligibleStages"
                        />
                        <Label :for="`tasks-stage-${stage}`" class="text-content font-medium text-foreground cursor-pointer">{{ stage }}</Label>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <Label class="text-content font-medium text-foreground">Task widgets</Label>
                    <div class="flex items-center gap-2 pt-2">
                      <Checkbox
                        id="tasks-autoCloseWidgets"
                        v-model="localSettings.autoCloseWidgetsOnClose"
                      />
                      <Label for="tasks-autoCloseWidgets" class="text-content font-medium text-foreground cursor-pointer">Auto-close NFU/OFB widgets when opportunity is closed (Won/Lost)</Label>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <Label class="text-content font-medium text-foreground">Task thresholds & postponement</Label>
                    <p class="text-meta">Days for each task type and postpone period.</p>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-5">
                      <div class="space-y-3">
                        <Label class="text-meta">OOFB Min / Max</Label>
                        <div class="flex gap-2">
                          <Input type="number" v-model.number="localSettings.oofbMinDays" min="1" class="w-full" />
                          <Input type="number" v-model.number="localSettings.oofbMaxDays" min="1" class="w-full" />
                        </div>
                      </div>
                      <div class="space-y-3">
                        <Label class="text-meta">UFB (Days)</Label>
                        <Input type="number" v-model.number="localSettings.ufbDays" min="1" class="w-full" />
                      </div>
                      <div class="space-y-3">
                        <Label class="text-meta">OFB (Days)</Label>
                        <Input type="number" v-model.number="localSettings.ofbDays" min="1" class="w-full" />
                      </div>
                      <div class="space-y-3">
                        <Label class="text-meta">NFU (Days)</Label>
                        <Input type="number" v-model.number="localSettings.nfuDays" min="1" class="w-full" />
                      </div>
                      <div class="space-y-3">
                        <Label class="text-meta">CFB (Days)</Label>
                        <Input type="number" v-model.number="localSettings.cfbDays" min="1" class="w-full" />
                      </div>
                      <div class="space-y-3">
                        <Label class="text-meta">DFB (Days)</Label>
                        <Input type="number" v-model.number="localSettings.dfbDays" min="1" class="w-full" />
                      </div>
                      <div class="col-span-2 md:col-span-3 space-y-3">
                        <Label class="text-content font-medium text-foreground">Postpone Period (Days)</Label>
                        <Input type="number" v-model.number="localSettings.postponeTaskDays" min="1" class="w-full max-w-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card: Lead settings -->
              <div class="bg-card border border-border rounded-lg p-6 shadow-mk-dashboard-card flex flex-col">
                <h3 class="text-title mb-6">Lead settings</h3>
                <div class="space-y-8">
                  <div class="space-y-3">
                    <Label class="text-content font-medium text-foreground">Max Contact Attempts</Label>
                    <Input type="number" v-model.number="localSettings.maxContactAttempts" min="1" max="20" class="w-full max-w-xs" />
                  </div>
                  <div class="flex items-center gap-3">
                    <Checkbox
                      id="tasks-excludeNotValid"
                      v-model="localSettings.excludeNotValidFromConversion"
                    />
                    <Label for="tasks-excludeNotValid" class="text-content font-medium text-foreground cursor-pointer">Exclude "NOT VALID" leads from conversion rate calculations</Label>
                  </div>
                  <div class="space-y-4 pt-6 border-t border-border">
                    <h4 class="text-subtitle">Assigning rules</h4>
                    <div class="flex items-center gap-3">
                      <Checkbox
                        id="assigning-same-customer"
                        v-model="localSettings.assigningRules.assignLeadToSameCustomerEmployee"
                      />
                      <Label for="assigning-same-customer" class="text-content font-medium text-foreground cursor-pointer">Assign leads to employees who worked with the same customer before</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="shrink-0 border-t border-border pt-6 mt-6 mb-12 flex justify-end gap-3 flex-wrap">
              <Button
                variant="secondary"
                @click="handleCancel"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                class="bg-primary text-white"
              >
                Save
              </Button>
            </div>
          </TabsContent>

          <!-- Scores Tab Content (Lead & opportunity scoring) -->
          <TabsContent value="scores" class="data-[state=inactive]:hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <!-- Left: main scoring card -->
              <div class="bg-card border border-border rounded-lg p-6 shadow-mk-dashboard-card flex flex-col">
                <h3 class="text-title mb-4">Scoring weights (leads & opportunities)</h3>
                <p class="text-meta mb-6">Score formula = (Freshness × {{ scoringWeightsSummary.freshness }}% + Proximity × {{ scoringWeightsSummary.proximity }}% + Vehicle match × {{ scoringWeightsSummary.vehicleMatch }}% + Source quality × {{ scoringWeightsSummary.sourceQuality }}% + Engagement × {{ scoringWeightsSummary.engagement }}%)</p>
                <div class="space-y-6">
                  <!-- Freshness -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <Label class="text-content font-medium text-foreground">Freshness</Label>
                      <span class="text-meta">{{ localSettings.leadScoring?.weights?.freshness ?? 25 }}%</span>
                    </div>
                    <p class="text-meta">Newer leads score higher (&lt;24h=100%, 24–48h=50%, &gt;48h=10%)</p>
                    <input
                      type="range"
                      v-model.number="localSettings.leadScoring.weights.freshness"
                      min="0"
                      max="100"
                      class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <!-- Proximity -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <Label class="text-content font-medium text-foreground">Proximity</Label>
                      <span class="text-meta">{{ localSettings.leadScoring?.weights?.proximity ?? 20 }}%</span>
                    </div>
                    <p class="text-meta">Closer leads score higher (&lt;10km=100%, linear decay to 100km)</p>
                    <input
                      type="range"
                      v-model.number="localSettings.leadScoring.weights.proximity"
                      min="0"
                      max="100"
                      class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <!-- Vehicle Match + expandable -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <Label class="text-content font-medium text-foreground">Vehicle Match</Label>
                      <span class="text-meta">{{ localSettings.leadScoring?.weights?.vehicleMatch ?? 25 }}%</span>
                    </div>
                    <p class="text-meta">Match to in-stock inventory; optional bonus for older stock</p>
                    <input
                      type="range"
                      v-model.number="localSettings.leadScoring.weights.vehicleMatch"
                      min="0"
                      max="100"
                      class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <div class="mt-3 border-t border-border pt-3">
                      <CollapsibleSection
                        title="Inventory age bonus"
                        :is-expanded="vehicleMatchExpanded"
                        @toggle="vehicleMatchExpanded = !vehicleMatchExpanded"
                      >
                      <p class="text-meta mb-4">Prioritize selling older stock by giving a bonus for days in stock.</p>
                      <div class="space-y-5">
                        <div class="flex items-center gap-3">
                          <Checkbox
                            id="scores-prioritizeOldStock"
                            v-model="localSettings.leadScoring.prioritizeOldStock"
                          />
                          <Label for="scores-prioritizeOldStock" class="text-content font-medium text-foreground cursor-pointer">Prioritize old stock</Label>
                        </div>
                        <div v-if="localSettings.leadScoring.prioritizeOldStock" class="flex items-center gap-3 pt-2">
                          <Label class="text-content font-medium text-foreground shrink-0">Aging factor</Label>
                          <Input
                            type="number"
                            v-model.number="localSettings.leadScoring.agingFactor"
                            min="0"
                            max="2"
                            step="0.1"
                            class="w-full max-w-xs"
                          />
                        </div>
                      </div>
                      </CollapsibleSection>
                    </div>
                  </div>
                  <!-- Source Quality + expandable -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <Label class="text-content font-medium text-foreground">Source Quality</Label>
                      <span class="text-meta">{{ localSettings.leadScoring?.weights?.sourceQuality ?? 15 }}%</span>
                    </div>
                    <p class="text-meta">Ranked by source priority list below</p>
                    <input
                      type="range"
                      v-model.number="localSettings.leadScoring.weights.sourceQuality"
                      min="0"
                      max="100"
                      class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <div class="mt-3 border-t border-border pt-3">
                      <CollapsibleSection
                        title="Source priority"
                        :is-expanded="sourceQualityExpanded"
                        @toggle="sourceQualityExpanded = !sourceQualityExpanded"
                      >
                      <p class="text-meta mb-4">Order sources from highest to lowest quality. Top of the list gets max points.</p>
                      <ul class="space-y-0 divide-y divide-border">
                        <li
                          v-for="(source, index) in (localSettings.leadScoring?.sourcePriority ?? [])"
                          :key="source"
                          class="flex items-center gap-3 py-3 first:pt-0"
                        >
                          <span class="text-content font-medium text-foreground w-6 shrink-0">{{ index + 1 }}.</span>
                          <span class="text-content text-foreground flex-1 min-w-0">{{ source }}</span>
                          <div class="flex gap-1 shrink-0">
                            <button
                              type="button"
                              class="p-1.5 rounded-sm border border-border hover:bg-muted text-foreground disabled:opacity-50 disabled:pointer-events-none"
                              :disabled="index === 0"
                              @click="moveSourcePriority(index, -1)"
                              aria-label="Move up"
                            >
                              <ChevronUp class="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              class="p-1.5 rounded-sm border border-border hover:bg-muted text-foreground disabled:opacity-50 disabled:pointer-events-none"
                              :disabled="index === (localSettings.leadScoring?.sourcePriority?.length ?? 0) - 1"
                              @click="moveSourcePriority(index, 1)"
                              aria-label="Move down"
                            >
                              <ChevronDown class="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      </ul>
                      </CollapsibleSection>
                    </div>
                  </div>
                  <!-- Engagement -->
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <Label class="text-content font-medium text-foreground">Engagement</Label>
                      <span class="text-meta">{{ localSettings.leadScoring?.weights?.engagement ?? 15 }}%</span>
                    </div>
                    <p class="text-meta">Bonus when lead has replied (e.g. spoke-to-customer)</p>
                    <input
                      type="range"
                      v-model.number="localSettings.leadScoring.weights.engagement"
                      min="0"
                      max="100"
                      class="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <!-- Right: Urgency labels card -->
              <div class="bg-card border border-border rounded-lg p-6 shadow-mk-dashboard-card flex flex-col">
                <h3 class="text-title mb-4">Urgency labels (HOT / WARM / STANDARD / COLD)</h3>
                <p class="text-meta mb-6">The same score used for sorting drives the HOT/WARM/STANDARD/COLD level on leads and opportunities. Set the minimum score for each level.</p>
                <div class="flex items-center gap-3 mb-6">
                  <Checkbox
                    id="scores-urgencyEnabled"
                    v-model="localSettings.urgencyEnabled"
                  />
                  <Label for="scores-urgencyEnabled" class="text-content font-medium text-foreground cursor-pointer">Show urgency level on leads and opportunities (HOT/WARM/STANDARD/COLD)</Label>
                </div>
                <div v-if="localSettings.urgencyEnabled" class="space-y-6">
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div class="space-y-3">
                      <Label class="text-content font-medium text-foreground">HOT (minimum score)</Label>
                      <Input
                        type="number"
                        v-model.number="localSettings.urgencyThresholds.hot"
                        min="0"
                        max="100"
                        class="w-full"
                      />
                    </div>
                    <div class="space-y-3">
                      <Label class="text-content font-medium text-foreground">WARM (minimum score)</Label>
                      <Input
                        type="number"
                        v-model.number="localSettings.urgencyThresholds.warm"
                        min="0"
                        max="100"
                        class="w-full"
                      />
                    </div>
                    <div class="space-y-3">
                      <Label class="text-content font-medium text-foreground">STANDARD (minimum score)</Label>
                      <Input
                        type="number"
                        v-model.number="localSettings.urgencyThresholds.standard"
                        min="0"
                        max="100"
                        class="w-full"
                      />
                    </div>
                  </div>
                  <div class="bg-muted border border-border rounded-lg p-4">
                    <h4 class="text-subtitle mb-4">Preview</h4>
                    <table class="w-full text-content text-foreground">
                      <thead>
                        <tr class="border-b border-border">
                          <th class="px-3 py-2 text-left font-medium text-foreground">Level</th>
                          <th class="px-3 py-2 text-left font-medium text-foreground">Score range</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-border">
                        <tr>
                          <td class="px-3 py-2 font-medium text-foreground">HOT</td>
                          <td class="px-3 py-2 text-muted-foreground">{{ localSettings.urgencyThresholds?.hot ?? 80 }}-100+</td>
                        </tr>
                        <tr>
                          <td class="px-3 py-2 font-medium text-foreground">WARM</td>
                          <td class="px-3 py-2 text-muted-foreground">{{ localSettings.urgencyThresholds?.warm ?? 50 }}-{{ (localSettings.urgencyThresholds?.hot ?? 80) - 1 }}</td>
                        </tr>
                        <tr>
                          <td class="px-3 py-2 font-medium text-foreground">STANDARD</td>
                          <td class="px-3 py-2 text-muted-foreground">{{ localSettings.urgencyThresholds?.standard ?? 20 }}-{{ (localSettings.urgencyThresholds?.warm ?? 50) - 1 }}</td>
                        </tr>
                        <tr>
                          <td class="px-3 py-2 font-medium text-foreground">COLD</td>
                          <td class="px-3 py-2 text-muted-foreground">0-{{ (localSettings.urgencyThresholds?.standard ?? 20) - 1 }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer scoring placeholder (full width below) -->
            <div class="mt-6">
              <div class="bg-card border border-border rounded-lg p-6 shadow-mk-dashboard-card opacity-75 max-w-2xl">
                <h3 class="text-title mb-4">Customer scoring</h3>
                <p class="text-meta">Coming soon.</p>
              </div>
            </div>

            <!-- Dialog: How the total score is calculated (Motork) -->
            <Dialog :open="showScoreFormulaDialog" @update:open="showScoreFormulaDialog = $event">
              <DialogPortal>
                <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
                <DialogContent
                  class="w-full sm:max-w-lg max-h-[calc(100vh-4rem)] flex flex-col"
                  :show-close-button="true"
                >
                  <DialogHeader class="shrink-0">
                    <DialogTitle>How the total score is calculated</DialogTitle>
                    <DialogDescription>
                      Each lead gets a score from 0 to 100+ based on five criteria. Weights are normalized to 100%.
                    </DialogDescription>
                  </DialogHeader>
                  <div class="flex-1 overflow-y-auto py-4 w-full space-y-4">
                    <p class="text-content text-muted-foreground">
                      Each criterion contributes a value from 0 (worst) to 1 (best). The total is the weighted sum of these values, then scaled to 0–100. Vehicle match can add a small bonus for old stock, so the final score may exceed 100.
                    </p>
                    <p class="text-content text-muted-foreground">
                      <strong class="text-foreground">Formula:</strong> Total = (Freshness × {{ scoringWeightsSummary.freshness }}% + Proximity × {{ scoringWeightsSummary.proximity }}% + Vehicle match × {{ scoringWeightsSummary.vehicleMatch }}% + Source quality × {{ scoringWeightsSummary.sourceQuality }}% + Engagement × {{ scoringWeightsSummary.engagement }}%)
                    </p>
                    <p class="text-meta">
                      Effective weights update when you move the sliders. Freshness: newer leads score higher. Proximity: closer distance scores higher. Vehicle match: in-stock match scores higher; optional bonus for days in stock. Source quality: rank from the list below. Engagement: bonus if the lead has replied.
                    </p>
                  </div>
                </DialogContent>
              </DialogPortal>
            </Dialog>

            <div class="shrink-0 border-t border-border pt-6 mt-6 mb-12 flex justify-end gap-3 flex-wrap">
              <Button
                variant="secondary"
                @click="handleCancel"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                class="bg-primary text-white"
              >
                Save
              </Button>
            </div>
          </TabsContent>

          <!-- Navigation Settings Tab Content -->
          <TabsContent value="navigation" class="data-[state=inactive]:hidden">
            <div class="bg-card border border-border rounded-lg p-6 shadow-mk-dashboard-card max-w-2xl">
              <h3 class="text-title mb-4">Navigation Menu Items</h3>
              <p class="text-meta mb-6">Control which navigation items appear in the sidebar and mobile menu.</p>
              <div class="space-y-4">
                <div
                  v-for="item in NAV_ITEMS"
                  :key="item.id"
                  class="flex items-center gap-3 py-2"
                >
                  <Checkbox
                    :id="`nav-${item.id}`"
                    v-model="localSettings.navigationVisibility[item.id]"
                  />
                  <Label :for="`nav-${item.id}`" class="text-content font-medium text-foreground cursor-pointer">{{ item.label }}</Label>
                </div>
                <div class="mt-5 p-4 bg-muted border border-border rounded-lg">
                  <p class="text-meta">
                    <strong class="text-foreground">Note:</strong> The Settings icon is always visible to ensure you can access this page. Vehicles is always shown in the sidebar.
                  </p>
                </div>
              </div>
            </div>
            <div class="shrink-0 border-t border-border pt-6 mt-6 mb-12 flex justify-end gap-3 flex-wrap">
              <Button
                variant="secondary"
                @click="handleCancel"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                class="bg-primary text-white"
              >
                Save
              </Button>
            </div>
          </TabsContent>

          <!-- Development Tab (dev only) -->
          <TabsContent v-if="isDev" value="development" class="data-[state=inactive]:hidden">
            <div class="bg-card border border-border rounded-lg p-6 shadow-mk-dashboard-card max-w-2xl">
              <h3 class="text-title mb-4">Reset mock data</h3>
              <p class="text-meta mb-6">
                Clear localStorage for leads and opportunities so the app reloads from the current mock data.
                Use this when mock data has been updated (e.g. due date fixes) and you want changes to take effect.
              </p>
              <Button
                variant="outline"
                @click="handleResetMockData"
              >
                Reset mock data and reload
              </Button>
            </div>
          </TabsContent>
        </form>
      </div>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { resetMockData } from '@/utils/resetMockData'
import { Button, Checkbox, Tabs, TabsList, TabsTrigger, TabsContent, Input, Label, Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from '@motork/component-library/future/primitives'
import PageHeader from '@/components/layout/PageHeader.vue'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'
import { NAV_ITEMS } from '@/constants/navigationItems'
import { ChevronUp, ChevronDown } from 'lucide-vue-next'

const settingsStore = useSettingsStore()

// Show Development tab only in dev mode
const isDev = import.meta.env.DEV

// Tab state
const activeTab = ref('tasks')

// Scores tab: expandable sections (all collapsed by default)
const sourceQualityExpanded = ref(false)
const vehicleMatchExpanded = ref(false)

// Score formula explanation popup (Scores tab)
const showScoreFormulaDialog = ref(false)

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
  },
  leadScoring: {
    weights: {
      freshness: 25,
      proximity: 20,
      vehicleMatch: 25,
      sourceQuality: 15,
      engagement: 15
    },
    sourcePriority: ['Walk-in', 'Phone', 'Website', 'Google Ads', 'Facebook', '3rd Party'],
    prioritizeOldStock: true,
    agingFactor: 0.5
  },
  assigningRules: {
    assignLeadToSameCustomerEmployee: false
  }
})

// Normalized weight percentages (sum to 100) for the scoring summary – updates when sliders change
const scoringWeightsSummary = computed(() => {
  const w = localSettings.value.leadScoring?.weights ?? {}
  const f = w.freshness ?? 25
  const p = w.proximity ?? 20
  const v = w.vehicleMatch ?? 25
  const s = w.sourceQuality ?? 15
  const e = w.engagement ?? 15
  const sum = f + p + v + s + e || 1
  return {
    freshness: Math.round((f / sum) * 1000) / 10,
    proximity: Math.round((p / sum) * 1000) / 10,
    vehicleMatch: Math.round((v / sum) * 1000) / 10,
    sourceQuality: Math.round((s / sum) * 1000) / 10,
    engagement: Math.round((e / sum) * 1000) / 10
  }
})

function moveSourcePriority(index, direction) {
  const arr = [...(localSettings.value.leadScoring?.sourcePriority || [])]
  const next = index + direction
  if (next < 0 || next >= arr.length) return
  ;[arr[index], arr[next]] = [arr[next], arr[index]]
  localSettings.value.leadScoring.sourcePriority = arr
}

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
    },
    // Deep copy lead scoring for editing
    leadScoring: {
      weights: {
        freshness: settingsStore.settings.leadScoring?.weights?.freshness ?? 25,
        proximity: settingsStore.settings.leadScoring?.weights?.proximity ?? 20,
        vehicleMatch: settingsStore.settings.leadScoring?.weights?.vehicleMatch ?? 25,
        sourceQuality: settingsStore.settings.leadScoring?.weights?.sourceQuality ?? 15,
        engagement: settingsStore.settings.leadScoring?.weights?.engagement ?? 15
      },
      sourcePriority: [...(settingsStore.settings.leadScoring?.sourcePriority ?? ['Walk-in', 'Phone', 'Website', 'Google Ads', 'Facebook', '3rd Party'])],
      prioritizeOldStock: settingsStore.settings.leadScoring?.prioritizeOldStock ?? true,
      agingFactor: settingsStore.settings.leadScoring?.agingFactor ?? 0.5
    },
    // Assigning rules
    assigningRules: {
      assignLeadToSameCustomerEmployee: settingsStore.settings.assigningRules?.assignLeadToSameCustomerEmployee ?? false
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

function handleResetMockData() {
  if (confirm('Reset mock data and reload? Leads and opportunities will reload from mock data. User edits will be lost.')) {
    resetMockData({ reload: true })
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

