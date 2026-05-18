<template>
  <Card class="border border-border flex flex-col overflow-hidden shadow-mk-dashboard-card">
    <CardHeader class="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-4 md:px-6 py-3 border-b border-border">
      <CardTitle class="text-sm font-medium leading-5">{{ t('home.performance.title') }}</CardTitle>
      <Select :model-value="selectedPeriod" @update:model-value="handlePeriodChange">
        <SelectTrigger
          size="sm"
          class="h-7 w-full rounded-lg border-0 bg-muted px-3 text-xs font-medium text-foreground shadow-none hover:bg-muted/80 focus:ring-0 focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" class="rounded-lg border-border">
          <SelectItem v-for="option in periodOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </CardHeader>

    <CardContent class="flex flex-col">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 4" :key="`skeleton-${n}`" class="h-16 bg-muted rounded animate-pulse"></div>
      </div>

      <!-- BDC Operator View -->
      <div v-else-if="userRole === 'operator'" class="space-y-4">
        <!-- SLA Compliance -->
        <div class="bg-muted rounded-lg p-4 border border-border">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-muted-foreground tracking-wider">SLA Compliance</span>
            <Badge
              :text="`${slaCompliancePercentage}%`"
              size="small"
              :theme="slaCompliancePercentage >= 90 ? 'green' : 'orange'"
            />
          </div>
          <div class="text-sm text-foreground font-medium">
            {{ bdcMetrics?.slaCompliance?.withinSLA || 0 }} / {{ bdcMetrics?.slaCompliance?.total || 0 }} tasks completed within SLA
          </div>
        </div>

        <!-- Managed Lead Tasks -->
        <div class="bg-muted rounded-lg p-4 border border-border">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-muted-foreground tracking-wider">Managed Lead Tasks</span>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold" :class="getManagedTaskStatusClass(bdcMetrics?.managedLeadTasks?.dailyAvg, bdcMetrics?.managedLeadTasks?.target)">
                {{ bdcMetrics?.managedLeadTasks?.dailyAvg || 0 }} / {{ bdcMetrics?.managedLeadTasks?.target || 0 }}
              </span>
            </div>
          </div>
          <div class="w-full bg-border rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="getManagedTaskStatusClass(bdcMetrics?.managedLeadTasks?.dailyAvg, bdcMetrics?.managedLeadTasks?.target, true)"
              :style="{ width: `${Math.min((bdcMetrics?.managedLeadTasks?.dailyAvg || 0) / 50 * 100, 100)}%` }"
            ></div>
          </div>
          <div class="text-sm text-muted-foreground mt-2 font-medium">Target: 20-50/day (avg this period)</div>
        </div>

        <!-- Handled No-Show Tasks -->
        <div class="bg-muted rounded-lg p-4 border border-border">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-muted-foreground tracking-wider">Handled No-Show Tasks</span>
            <span class="text-sm font-bold text-foreground">{{ bdcMetrics?.handledNoShowTasks?.total || 0 }}</span>
          </div>
          <div class="text-sm text-muted-foreground font-medium">{{ bdcMetrics?.handledNoShowTasks?.dailyAvg || 0 }} avg/day (this period)</div>
        </div>

        <!-- Follow-Up Tasks -->
        <div class="bg-muted rounded-lg p-4 border border-border">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-muted-foreground tracking-wider">Follow-Up Tasks</span>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold" :class="getManagedTaskStatusClass(bdcMetrics?.followUpTasks?.dailyAvg, bdcMetrics?.followUpTasks?.target)">
                {{ bdcMetrics?.followUpTasks?.dailyAvg || 0 }} / {{ bdcMetrics?.followUpTasks?.target || 0 }}
              </span>
            </div>
          </div>
          <div class="w-full bg-border rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="getManagedTaskStatusClass(bdcMetrics?.followUpTasks?.dailyAvg, bdcMetrics?.followUpTasks?.target, true)"
              :style="{ width: `${Math.min((bdcMetrics?.followUpTasks?.dailyAvg || 0) / 20 * 100, 100)}%` }"
            ></div>
          </div>
          <div class="text-sm text-muted-foreground mt-2 font-medium">Target: {{ bdcMetrics?.followUpTasks?.target || 10 }}/day (avg this period)</div>
        </div>

        <!-- Appointments Reserved -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-muted rounded-lg p-4 border border-border">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">Appointments Reserved</div>
                <div class="text-sm font-bold text-foreground leading-none">{{ bdcMetrics?.appointmentsReserved || 0 }}</div>
              </div>
              <div class="h-10 w-16 shrink-0" v-if="bdcMetrics?.appointmentsReservedTrend">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-appointments" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#0470e9;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#0470e9;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="generateAreaPath(bdcMetrics.appointmentsReservedTrend)"
                    fill="url(#gradient-appointments)"
                    class="transition-all duration-700"
                  />
                  <path
                    :d="generateSmoothPath(bdcMetrics.appointmentsReservedTrend)"
                    stroke="#0470e9"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-all duration-700"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-muted rounded-lg p-4 border border-border">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">Lead-to-Opp Rate</div>
                <div class="text-sm font-bold text-foreground leading-none">{{ bdcMetrics?.leadToOpportunityConversion || 0 }}%</div>
              </div>
              <div class="h-10 w-16 shrink-0" v-if="bdcMetrics?.leadToOpportunityConversionTrend">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-lead-opp" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#0470e9;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#0470e9;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="generateAreaPath(bdcMetrics.leadToOpportunityConversionTrend)"
                    fill="url(#gradient-lead-opp)"
                    class="transition-all duration-700"
                  />
                  <path
                    :d="generateSmoothPath(bdcMetrics.leadToOpportunityConversionTrend)"
                    stroke="#0470e9"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-all duration-700"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Salesperson View -->
      <div v-else-if="userRole === 'salesman'" class="space-y-4">
        <!-- Nudges -->
        <div v-if="salespersonNudges.length" class="bg-primary/15 border border-primary rounded-lg p-4 space-y-2">
          <div class="text-sm font-medium text-muted-foreground tracking-wider">What to do next</div>
          <ul class="space-y-1.5">
            <li
              v-for="nudge in salespersonNudges"
              :key="nudge.id"
              class="text-sm text-foreground flex items-start gap-2"
            >
              <Lightbulb class="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
              <span>{{ nudge.text }}</span>
            </li>
          </ul>
        </div>

        <!-- Contracts & Revenue -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-muted rounded-lg p-4 border border-border">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">Contracts Closed</div>
                <div class="text-sm font-bold text-foreground leading-none">{{ salespersonMetrics?.contractsClosed?.[selectedPeriod] || 0 }}</div>
              </div>
              <div class="h-10 w-16 shrink-0" v-if="getTrendData('contractsClosed')">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-contracts" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#0470e9;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#0470e9;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="generateAreaPath(getTrendData('contractsClosed'))"
                    fill="url(#gradient-contracts)"
                    class="transition-all duration-700"
                  />
                  <path
                    :d="generateSmoothPath(getTrendData('contractsClosed'))"
                    stroke="#0470e9"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-all duration-700"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-muted rounded-lg p-4 border border-border">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">Total Revenue</div>
                <div class="text-sm font-bold text-foreground leading-none">€{{ formatCurrency(salespersonMetrics?.revenue?.[selectedPeriod] || 0) }}</div>
              </div>
              <div class="h-10 w-16 shrink-0" v-if="getTrendData('revenue')">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-revenue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#0470e9;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#0470e9;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="generateAreaPath(getTrendData('revenue'))"
                    fill="url(#gradient-revenue)"
                    class="transition-all duration-700"
                  />
                  <path
                    :d="generateSmoothPath(getTrendData('revenue'))"
                    stroke="#0470e9"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-all duration-700"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue Targets -->
        <div class="space-y-3 bg-muted rounded-lg p-4 border border-border">
          <div v-if="selectedPeriod === 'week'" class="space-y-1">
            <div class="flex items-center justify-between text-sm font-medium text-muted-foreground tracking-wider">
              <span>{{ t('home.performance.weeklyTarget') }}</span>
              <span class="font-bold text-foreground">{{ getRevenueProgress('week') }}%</span>
            </div>
            <div class="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                class="h-full bg-primary transition-all duration-700"
                :style="{ width: `${Math.min(getRevenueProgress('week'), 100)}%` }"
              ></div>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex items-center justify-between text-sm font-medium text-muted-foreground tracking-wider">
              <span>{{ t('home.performance.monthlyTarget') }}</span>
              <span class="font-bold text-foreground">{{ getRevenueProgress('month') }}%</span>
            </div>
            <div class="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                class="h-full bg-primary transition-all duration-700"
                :style="{ width: `${Math.min(getRevenueProgress('month'), 100)}%` }"
              ></div>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex items-center justify-between text-sm font-medium text-muted-foreground tracking-wider">
              <span>{{ t('home.performance.quarterlyTarget') }}</span>
              <span class="font-bold text-foreground">{{ getRevenueProgress('quarter') }}%</span>
            </div>
            <div class="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div
                class="h-full bg-primary transition-all duration-700"
                :style="{ width: `${Math.min(getRevenueProgress('quarter'), 100)}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Pipeline & Win Rate -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-muted rounded-lg p-4 border border-border">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">Pipeline Value</div>
                <div class="text-sm font-bold text-foreground leading-none">€{{ formatCurrency(salespersonMetrics?.pipelineValue || 0) }}</div>
              </div>
              <div class="h-10 w-16 shrink-0" v-if="salespersonMetrics?.pipelineValueTrend">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-pipeline" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#0470e9;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#0470e9;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="generateAreaPath(salespersonMetrics.pipelineValueTrend)"
                    fill="url(#gradient-pipeline)"
                    class="transition-all duration-700"
                  />
                  <path
                    :d="generateSmoothPath(salespersonMetrics.pipelineValueTrend)"
                    stroke="#0470e9"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-all duration-700"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-muted rounded-lg p-4 border border-border">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">Current Win Rate</div>
                <div class="text-sm font-bold text-foreground leading-none">{{ salespersonMetrics?.winRate || 0 }}%</div>
              </div>
              <div class="h-10 w-16 shrink-0" v-if="salespersonMetrics?.winRateTrend">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-winrate" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#0470e9;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#0470e9;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="generateAreaPath(salespersonMetrics.winRateTrend)"
                    fill="url(#gradient-winrate)"
                    class="transition-all duration-700"
                  />
                  <path
                    :d="generateSmoothPath(salespersonMetrics.winRateTrend)"
                    stroke="#0470e9"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-all duration-700"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- New & Dormant Opportunities -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-muted rounded-lg p-4 border border-border">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">New Opps</div>
                <div class="text-sm font-bold text-foreground leading-none">{{ salespersonMetrics?.newOpportunities?.[selectedPeriod] || 0 }}</div>
              </div>
              <div class="h-10 w-16 shrink-0" v-if="getTrendData('newOpportunities')">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-new-opp" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#0470e9;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#0470e9;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="generateAreaPath(getTrendData('newOpportunities'))"
                    fill="url(#gradient-new-opp)"
                    class="transition-all duration-700"
                  />
                  <path
                    :d="generateSmoothPath(getTrendData('newOpportunities'))"
                    stroke="#0470e9"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-all duration-700"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-muted rounded-lg p-4 border border-border">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1">
                <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">Dormant Opps</div>
                <div class="text-sm font-bold text-destructive leading-none">{{ salespersonMetrics?.dormantOpportunities || 0 }}</div>
              </div>
              <div class="h-10 w-16 shrink-0" v-if="salespersonMetrics?.dormantOpportunitiesTrend">
                <svg class="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-dormant" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#EF4444;stop-opacity:0.4" />
                      <stop offset="100%" style="stop-color:#EF4444;stop-opacity:0.1" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="generateAreaPath(salespersonMetrics.dormantOpportunitiesTrend)"
                    fill="url(#gradient-dormant)"
                    class="transition-all duration-700"
                  />
                  <path
                    :d="generateSmoothPath(salespersonMetrics.dormantOpportunitiesTrend)"
                    stroke="#EF4444"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-all duration-700"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Manager View (stacked full-width for readability) -->
      <div v-else-if="userRole === 'manager'" class="space-y-4">
        <!-- Conversion Rate (full width) -->
        <div class="w-full bg-muted border border-border rounded-lg p-6 flex flex-col items-center justify-center">
          <div class="relative w-24 h-24 sm:w-28 sm:h-28 mb-3">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke-width="8" class="opacity-20" style="stroke:#0470e9" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke-width="8"
                class="transition-all duration-700"
                style="stroke:#0470e9"
                :stroke-dasharray="`${(managerMetrics?.conversionRate || 0) * 2.64} 265`"
                stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-sm font-bold text-foreground">{{ managerMetrics?.conversionRate || 0 }}%</div>
              </div>
            </div>
          </div>
          <div class="text-sm font-medium text-muted-foreground tracking-wider mb-1">Conversion Rate</div>
          <Badge
            :text="getConversionDescription(managerMetrics?.conversionRate || 0)"
            size="small"
            :theme="getConversionBadgeTheme(managerMetrics?.conversionRate || 0)"
          />
        </div>

        <!-- Sales Funnel (full width) -->
        <div class="w-full bg-muted border border-border rounded-lg p-4">
          <h3 class="text-sm font-medium text-muted-foreground tracking-wider mb-4">Sales Funnel</h3>
          <div class="space-y-3">
            <div
              v-for="stage in managerMetrics?.stages || []"
              :key="stage.name"
              class="flex items-center gap-1 sm:gap-1.5"
            >
              <span class="text-sm font-medium text-foreground w-16 sm:w-20 flex-shrink-0 pr-0.5">{{ stage.name }}</span>
              <div class="flex-1 min-w-0">
                <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :style="{ width: `${stage.percentage}%`, minWidth: '2px', backgroundColor: stage.colorCode || '#6b7280' }"
                  ></div>
                </div>
              </div>
              <span class="text-[10px] sm:text-sm font-semibold text-muted-foreground w-11 sm:w-12 text-right flex-shrink-0 whitespace-nowrap tabular-nums">{{ formatNumber(stage.count) }} ({{ stage.percentage }}%)</span>
              <Button
                v-if="!hideNavigation"
                variant="ghost"
                size="sm"
                class="shrink-0 h-7 w-7 p-0 rounded-sm text-muted-foreground hover:text-foreground"
                :aria-label="`View requests for ${stage.name}`"
                @click="goToRequestsForStage(stage.name)"
              >
                <Eye class="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Task Completion (full width) -->
        <div class="w-full bg-muted rounded-lg p-4 border border-border">
          <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">Task Completion</div>
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-sm font-bold text-foreground">{{ taskCompletionPercentage }}%</span>
            <span class="text-sm text-muted-foreground">completed on time</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2 overflow-hidden mb-2">
            <div
              class="h-full rounded-full transition-all"
              :style="{ width: `${taskCompletionPercentage}%`, backgroundColor: '#0470e9' }"
            ></div>
          </div>
          <div class="text-sm text-foreground">
            {{ managerMetrics?.taskCompletion?.completed || 0 }} / {{ managerMetrics?.taskCompletion?.total || 0 }} tasks
          </div>
          <div v-if="(managerMetrics?.taskCompletion?.overdueCount || 0) > 0" class="mt-2">
            <Badge :text="`${managerMetrics.taskCompletion.overdueCount} overdue`" size="small" theme="red" />
          </div>
        </div>

        <!-- Deals Won vs Lost (full width) -->
        <div class="w-full bg-muted rounded-lg p-4 border border-border">
          <div class="text-sm font-medium text-muted-foreground tracking-wider mb-2">Deals Won vs Lost</div>
          <div class="flex items-baseline gap-2 mb-2">
            <span class="text-sm font-bold" style="color:#0470e9">{{ managerMetrics?.dealsReport?.won || 0 }}</span>
            <span class="text-sm text-muted-foreground">won</span>
            <span class="text-muted-foreground mx-1">|</span>
            <span class="text-sm font-bold" style="color:#EF4444">{{ managerMetrics?.dealsReport?.lost || 0 }}</span>
            <span class="text-sm text-muted-foreground">lost</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2 overflow-hidden flex">
            <div
              class="h-full transition-all"
              :style="{ width: `${dealsWonPercentage}%`, backgroundColor: '#0470e9' }"
            ></div>
            <div
              class="h-full transition-all"
              :style="{ width: `${100 - dealsWonPercentage}%`, backgroundColor: '#EF4444' }"
            ></div>
          </div>
          <div class="text-sm text-muted-foreground mt-1">{{ managerMetrics?.dealsReport?.wonRate || 0 }}% win rate</div>
        </div>
      </div>

      <!-- Fallback for other roles -->
      <div v-else class="text-center py-8 text-muted-foreground">
        <LineChart class="w-10 h-10 shrink-0 mb-2 text-muted-foreground/50" />
        <p class="text-sm">Performance metrics not available</p>
        <p class="text-sm text-muted-foreground mt-1">Contact your administrator</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useHideNavigation } from '@/composables/useHideNavigation'
import { LineChart, Lightbulb, Eye } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { fetchBDCOperatorMetrics, fetchSalespersonMetrics, fetchManagerFunnelMetrics } from '@/api/dashboard'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@motork/component-library/future/primitives'
import { SEGMENT_KEYS } from '@/composables/useRequestsList'

const props = defineProps({
  defaultPeriod: {
    type: String,
    default: 'month'
  }
})

const router = useRouter()
const { hideNavigation } = useHideNavigation()
const { t } = useI18n()
const userStore = useUserStore()
const userRole = computed(() => userStore.userRole())
const userId = computed(() => userStore.currentUser?.id)

const selectedPeriod = ref(props.defaultPeriod)
const loading = ref(true)
const periodOptions = computed(() => [
  { value: 'week', label: t('home.performance.periodWeek') },
  { value: 'month', label: t('home.performance.periodMonth') },
  { value: 'quarter', label: t('home.performance.periodQuarter') },
  { value: 'year', label: t('home.performance.periodYear') }
])

const bdcMetrics = ref(null)
const salespersonMetrics = ref(null)
const managerMetrics = ref(null)

const slaCompliancePercentage = computed(() => {
  if (!bdcMetrics.value?.slaCompliance) return 0
  const { withinSLA, total } = bdcMetrics.value.slaCompliance
  const completed = withinSLA ?? bdcMetrics.value.slaCompliance.completed
  return total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0
})

const salespersonNudges = computed(() => {
  const nudges = salespersonMetrics.value?.nudges
  return Array.isArray(nudges) ? nudges.slice(0, 2) : []
})

const taskCompletionPercentage = computed(() => {
  const tc = managerMetrics.value?.taskCompletion
  if (!tc?.total) return 0
  return Math.round((tc.completed / tc.total) * 100)
})

const dealsWonPercentage = computed(() => {
  const dr = managerMetrics.value?.dealsReport
  const total = (dr?.won ?? 0) + (dr?.lost ?? 0)
  return total > 0 ? Math.round(((dr.won ?? 0) / total) * 100) : 0
})

const getManagedTaskStatusClass = (current, target, isBg = false) => {
  const val = current ?? 0
  const tgt = target ?? 20
  if (val >= tgt) return isBg ? 'perf-chart-primary' : 'perf-text-primary'
  if (val >= tgt * 0.5) return isBg ? 'perf-chart-yellow' : 'perf-text-yellow'
  return isBg ? 'perf-chart-red' : 'perf-text-red'
}

const getRevenueProgress = (period) => {
  if (!salespersonMetrics.value) return 0
  const revenue = salespersonMetrics.value.revenue?.[period] || 0
  const target = salespersonMetrics.value.revenueTargets?.[period] || 1
  return Math.round((revenue / target) * 100)
}

const formatCurrency = (amount) => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'k'
  }
  return amount.toString()
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const getStageColorClass = (color) => {
  const colorMap = {
    'red': 'perf-chart-red',
    'orange': 'perf-chart-yellow',
    'blue': 'perf-chart-primary',
    'purple': 'perf-chart-grey',
    'yellow': 'perf-chart-grey',
    'gray': 'perf-chart-grey'
  }
  return colorMap[color] || 'perf-chart-grey'
}

const getManagerStageColorClass = (color) => {
  const colorMap = {
    'red': 'perf-chart-red',
    'blue': 'perf-chart-primary',
    'orange': 'perf-chart-grey',
    'purple': 'perf-chart-grey',
    'yellow': 'perf-chart-grey',
    'gray': 'perf-chart-grey'
  }
  return colorMap[color] || 'perf-chart-grey'
}

const getConversionBadgeTheme = (rate) => {
  if (rate >= 20) return 'green'
  if (rate >= 15) return 'green'
  if (rate >= 10) return 'orange'
  return 'red'
}

const getTrendData = (metric) => {
  if (!salespersonMetrics.value) return null
  if (metric === 'contractsClosed') {
    return salespersonMetrics.value.contractsClosed?.[`${selectedPeriod.value}Trend`] || null
  }
  if (metric === 'revenue') {
    return salespersonMetrics.value.revenue?.[`${selectedPeriod.value}Trend`] || null
  }
  if (metric === 'newOpportunities') {
    return salespersonMetrics.value.newOpportunities?.[`${selectedPeriod.value}Trend`] || null
  }
  return null
}

const generateSmoothPath = (data) => {
  if (!data || data.length === 0) return ''
  
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1
  
  const width = 100
  const height = 40
  const padding = 4
  
  const points = data.map((value, index) => {
    return {
      x: (index / (data.length - 1)) * (width - padding * 2) + padding,
      y: height - padding - ((value - minValue) / range) * (height - padding * 2)
    }
  })
  
  if (points.length < 2) return ''
  
  let path = `M ${points[0].x},${points[0].y}`
  
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    const cp1x = curr.x + (next.x - curr.x) / 2
    const cp2x = curr.x + (next.x - curr.x) / 2
    path += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`
  }
  
  return path
}

const generateAreaPath = (data) => {
  const smoothLine = generateSmoothPath(data)
  if (!smoothLine) return ''
  
  const width = 100
  const height = 40
  const padding = 4
  
  const firstPointX = padding
  const lastPointX = width - padding
  
  return `${smoothLine} L ${lastPointX},${height} L ${firstPointX},${height} Z`
}

const getConversionDescription = (rate) => {
  if (rate >= 20) return 'Excellent performance'
  if (rate >= 15) return 'Good performance'
  if (rate >= 10) return 'Average performance'
  return 'Needs improvement'
}

/** Map Sales Funnel stage name to Requests page segment key for view filter */
const funnelStageToSegment = {
  'Total leads': SEGMENT_KEYS.ALL,
  'Assigned leads': SEGMENT_KEYS.ALL,
  'Managed leads': SEGMENT_KEYS.ALL,
  'Qualified leads': SEGMENT_KEYS.OPEN_OPPORTUNITIES,
  'Managed opportunities': SEGMENT_KEYS.IN_NEGOTIATION,
  'Won opportunities': SEGMENT_KEYS.WON
}

function goToRequestsForStage(stageName) {
  if (hideNavigation.value) return
  const segment = funnelStageToSegment[stageName] ?? SEGMENT_KEYS.ALL
  router.push({ path: '/requests', query: { segment } })
}

const loadMetrics = async () => {
  loading.value = true
  try {
    if (userRole.value === 'operator') {
      bdcMetrics.value = await fetchBDCOperatorMetrics(userId.value, selectedPeriod.value)
    } else if (userRole.value === 'salesman') {
      salespersonMetrics.value = await fetchSalespersonMetrics(userId.value, selectedPeriod.value)
    } else if (userRole.value === 'manager') {
      managerMetrics.value = await fetchManagerFunnelMetrics(selectedPeriod.value)
    }
  } catch (error) {
    console.error('Error loading performance metrics:', error)
  } finally {
    loading.value = false
  }
}

const handlePeriodChange = (period) => {
  selectedPeriod.value = period
  loadMetrics()
}

watch([userId, userRole], () => {
  loadMetrics()
}, { immediate: false })

watch(
  () => props.defaultPeriod,
  (v) => {
    if (v && v !== selectedPeriod.value) {
      selectedPeriod.value = v
      loadMetrics()
    }
  }
)

onMounted(() => {
  loadMetrics()
})
</script>

