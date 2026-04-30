<template>
  <Card class="border-0 gap-4 shadow-none">
    <CardHeader class="space-y-4 pb-2">
      <CardTitle class="text-base font-medium text-foreground">
        {{ leadDetailsSectionTitle }}
      </CardTitle>
      <LeadDepartmentSegment
        v-model="form.department"
        :aria-label="t('forms.addNew.leadDetails.department.label')"
      >
        <template #sales>
          <span class="inline-flex items-center justify-center gap-1.5">
            <Tag class="size-4 shrink-0" aria-hidden="true" />
            <span>{{ t('forms.addNew.leadDetails.department.sales') }}</span>
          </span>
        </template>
        <template #service>
          <span class="inline-flex items-center justify-center gap-1.5">
            <Wrench class="size-4 shrink-0" aria-hidden="true" />
            <span>{{ t('forms.addNew.leadDetails.department.service') }}</span>
          </span>
        </template>
      </LeadDepartmentSegment>
    </CardHeader>
    <CardContent class="pt-0">
      <div :class="[innerPanelClass, 'space-y-4']">
        <p class="sr-only">{{ t('forms.addNew.leadDetails.recordType.label') }}</p>
        <!-- Lead vs Opportunity: pill row + CircleHelp (Figma Creation-flow) -->
        <RadioGroup
          v-model="form.recordType"
          class="w-full"
          :aria-label="t('forms.addNew.leadDetails.recordType.label')"
        >
          <div :class="recordTypeRowOuterClass">
            <div :class="recordTypeRowGridClass">
            <div
              :class="[
                'relative flex h-9 w-full min-w-0 items-center rounded-[10px] border px-2.5 transition-colors',
                form.recordType === 'lead'
                  ? 'border-[#b4d4f8] bg-blue-50 dark:border-blue-800/40 dark:bg-blue-950/30'
                  : 'border-border',
              ]"
            >
              <div class="flex min-w-0 flex-1 items-center gap-2 pr-7">
                <RadioGroupItem id="ld-rt-lead" value="lead" class="shrink-0" />
                <Label
                  for="ld-rt-lead"
                  class="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium leading-none text-foreground"
                >
                  {{ t('forms.addNew.leadDetails.recordType.lead') }}
                </Label>
              </div>
              <div
                class="absolute right-1.5 top-1/2 z-10 flex -translate-y-1/2 items-center"
              >
                <TooltipProvider :delay-duration="200">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button
                        type="button"
                        class="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-background/60 hover:text-foreground"
                        :aria-label="t('forms.addNew.leadDetails.tooltips.infoAria', { type: t('forms.addNew.leadDetails.recordType.lead') })"
                        :aria-describedby="leadTipId"
                        @click.stop.prevent
                      >
                        <CircleHelp class="size-5" stroke-width="1.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end" class="max-w-sm text-balance">
                      {{ leadCardTooltip }}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p :id="leadTipId" class="sr-only">{{ leadCardTooltip }}</p>
            </div>
            <div
              :class="[
                'relative flex h-9 w-full min-w-0 items-center rounded-[10px] border px-2.5 transition-colors',
                form.recordType === 'opportunity'
                  ? 'border-[#b4d4f8] bg-blue-50 dark:border-blue-800/40 dark:bg-blue-950/30'
                  : 'border-border',
              ]"
            >
              <div class="flex min-w-0 flex-1 items-center gap-2 pr-7">
                <RadioGroupItem id="ld-rt-opp" value="opportunity" class="shrink-0" />
                <Label
                  for="ld-rt-opp"
                  class="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium leading-none text-foreground"
                >
                  {{ t('forms.addNew.leadDetails.recordType.opportunity') }}
                </Label>
              </div>
              <div
                class="absolute right-1.5 top-1/2 z-10 flex -translate-y-1/2 items-center"
              >
                <TooltipProvider :delay-duration="200">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <button
                        type="button"
                        class="inline-flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-background/60 hover:text-foreground"
                        :aria-label="t('forms.addNew.leadDetails.tooltips.infoAria', { type: t('forms.addNew.leadDetails.recordType.opportunity') })"
                        :aria-describedby="oppTipId"
                        @click.stop.prevent
                      >
                        <CircleHelp class="size-5" stroke-width="1.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="end" class="max-w-sm text-balance">
                      {{ opportunityCardTooltip }}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p :id="oppTipId" class="sr-only">{{ opportunityCardTooltip }}</p>
            </div>
            </div>
          </div>
        </RadioGroup>

      <!-- Service + Opportunity: single 3-column grid (row-major: col1 | col2 | col3 per Figma) -->
      <div
        v-if="showServiceOppTop"
        class="grid grid-cols-1 gap-x-4 gap-y-6 pb-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.requestType') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.requestType"
            :items="requestTypeSelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.selectType')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.requestType" class="text-sm text-destructive">{{ errors.requestType }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.service') }} <span class="text-destructive">*</span>
          </Label>
          <Input
            v-model="form.serviceName"
            class="h-8 w-full rounded-[10px] text-sm"
            :placeholder="t('forms.addNew.leadDetails.placeholders.insert')"
            :error="!!errors.serviceName"
          />
          <p v-if="errors.serviceName" class="text-sm text-destructive">{{ errors.serviceName }}</p>
        </div>
        <div class="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.labels.description') }}
          </Label>
          <Input
            v-model="form.serviceDescription"
            class="h-8 w-full rounded-[10px] text-sm"
            :placeholder="t('forms.addNew.leadDetails.placeholders.insert')"
            :error="!!errors.serviceDescription"
          />
          <p v-if="errors.serviceDescription" class="text-sm text-destructive">{{ errors.serviceDescription }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.price') }}
          </Label>
          <div class="relative w-full">
            <span
              class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground"
              aria-hidden="true"
            >€</span>
            <Input
              v-model="form.servicePrice"
              class="h-8 w-full rounded-[10px] pl-8 text-sm"
              inputmode="decimal"
              :placeholder="t('forms.addNew.leadDetails.placeholders.price')"
              :error="!!errors.servicePrice"
            />
          </div>
          <p v-if="errors.servicePrice" class="text-sm text-destructive">{{ errors.servicePrice }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.channel') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.channel"
            :items="channelSelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.channel" class="text-sm text-destructive">{{ errors.channel }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.source') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.source"
            :items="sourceSelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.source" class="text-sm text-destructive">{{ errors.source }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.sourceDetail') }}
          </Label>
          <Input
            v-model="form.sourceDetail"
            :disabled="isSourceDetailDisabled"
            class="h-8 w-full rounded-[10px] text-sm"
            :placeholder="t('forms.addNew.leadDetails.placeholders.insert')"
          />
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.fiscalEntity') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.fiscalEntity"
            :items="fiscalEntitySelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.fiscalEntity" class="text-sm text-destructive">{{ errors.fiscalEntity }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.dealership') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.dealership"
            :items="dealershipSelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.dealership" class="text-sm text-destructive">{{ errors.dealership }}</p>
        </div>
        <div class="space-y-2 sm:col-span-2 lg:col-span-1">
          <div class="space-y-2">
            <Label class="text-sm font-medium text-foreground">
              {{ t('forms.labels.assignee') }} <span class="text-destructive">*</span>
            </Label>
            <SelectMenu
              v-model="form.assigneeId"
              :items="assigneeSelectItems"
              value-key="value"
              :placeholder="t('forms.addNew.leadDetails.placeholders.selectAssignee')"
              :class="leadDetailsSelectMenuClass"
            >
              <template #item="{ item }">
                <span>{{ item.label }}</span>
              </template>
            </SelectMenu>
            <p v-if="errors.assigneeId" class="text-sm text-destructive">{{ errors.assigneeId }}</p>
          </div>
          <div class="flex w-full min-w-0 items-center gap-2.5">
            <Switch
              id="ld-assignee-rel-svc-opp"
              size="sm"
              class="shrink-0"
              :model-value="form.assigneesFromRelationshipOnly === true"
              @update:model-value="(v) => (form.assigneesFromRelationshipOnly = v === true)"
            />
            <Label for="ld-assignee-rel-svc-opp" class="min-w-0 flex-1 cursor-pointer text-pretty text-sm font-normal text-foreground">
              {{ t('forms.addNew.leadDetails.fields.assigneesRelationshipOnly') }}
            </Label>
          </div>
        </div>
      </div>

      <!-- Standard request grid: Sales (L+O), Service+Lead -->
      <div v-if="showStandardRequestGrid" class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.requestType') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.requestType"
            :items="requestTypeSelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.selectType')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.requestType" class="text-sm text-destructive">{{ errors.requestType }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.channel') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.channel"
            :items="channelSelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.channel" class="text-sm text-destructive">{{ errors.channel }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.source') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.source"
            :items="sourceSelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.source" class="text-sm text-destructive">{{ errors.source }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.sourceDetail') }}
          </Label>
          <Input
            v-model="form.sourceDetail"
            :disabled="isSourceDetailDisabled"
            class="h-8 w-full rounded-[10px] text-sm"
            :placeholder="t('forms.addNew.leadDetails.placeholders.insert')"
          />
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.fiscalEntity') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.fiscalEntity"
            :items="fiscalEntitySelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.fiscalEntity" class="text-sm text-destructive">{{ errors.fiscalEntity }}</p>
        </div>
        <div class="space-y-2">
          <Label class="text-sm font-medium text-foreground">
            {{ t('forms.addNew.leadDetails.fields.dealership') }} <span class="text-destructive">*</span>
          </Label>
          <SelectMenu
            v-model="form.dealership"
            :items="dealershipSelectItems"
            value-key="value"
            :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
            :class="leadDetailsSelectMenuClass"
          >
            <template #item="{ item }">
              <span>{{ item.label }}</span>
            </template>
          </SelectMenu>
          <p v-if="errors.dealership" class="text-sm text-destructive">{{ errors.dealership }}</p>
        </div>
      </div>

      <!-- Opportunity: assignee + “show only…” (Sales opportunity only — Service opp uses unified grid above) -->
      <div v-if="isOpp && !showServiceOppTop" class="space-y-2 pb-2">
        <div class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <div class="space-y-2">
            <Label class="text-sm font-medium text-foreground">
              {{ t('forms.labels.assignee') }} <span class="text-destructive">*</span>
            </Label>
            <SelectMenu
              v-model="form.assigneeId"
              :items="assigneeSelectItems"
              value-key="value"
              :placeholder="t('forms.addNew.leadDetails.placeholders.selectAssignee')"
              :class="leadDetailsSelectMenuClass"
            >
              <template #item="{ item }">
                <span>{{ item.label }}</span>
              </template>
            </SelectMenu>
            <p v-if="errors.assigneeId" class="text-sm text-destructive">{{ errors.assigneeId }}</p>
          </div>
        </div>
        <div class="flex w-full min-w-0 items-center gap-2.5">
          <Switch
            id="ld-assignee-rel"
            size="sm"
            class="shrink-0"
            :model-value="form.assigneesFromRelationshipOnly === true"
            @update:model-value="(v) => (form.assigneesFromRelationshipOnly = v === true)"
          />
          <Label for="ld-assignee-rel" class="min-w-0 flex-1 cursor-pointer text-pretty text-sm font-normal text-foreground">
            {{ t('forms.addNew.leadDetails.fields.assigneesRelationshipOnly') }}
          </Label>
        </div>
      </div>

      <!-- Message / notes -->
      <div v-if="showRequestMessage" class="space-y-2">
        <Label class="text-sm font-medium text-foreground">
          {{ t('forms.addNew.leadDetails.fields.requestMessage') }}
        </Label>
        <Textarea
          v-model="form.requestMessage"
          class="min-h-16 w-full rounded-[10px] text-sm"
          :placeholder="t('forms.addNew.leadDetails.placeholders.startTyping')"
        />
      </div>
      <div v-if="showNotesToSellers" class="space-y-2">
        <Label class="text-sm font-medium text-foreground">
          {{ t('forms.addNew.leadDetails.fields.notesToSellers') }}
        </Label>
        <Textarea v-model="form.notesToSellers" class="min-h-[88px] w-full" :placeholder="t('forms.addNew.leadDetails.placeholders.notes')" />
      </div>
      <div v-if="showServiceOppNotes" class="space-y-2">
        <Label class="text-sm font-medium text-foreground">
          {{ t('forms.labels.notes') }}
        </Label>
        <Textarea v-model="form.serviceOppNotes" class="min-h-[88px] w-full" :placeholder="t('forms.addNew.leadDetails.placeholders.notes')" />
      </div>

      <!-- Vehicle (Figma Sales+Lead: h-8 search + ⌘K + secondary Insert manually) -->
      <div class="space-y-2">
        <p
          v-if="!hasSelectedStockVehicle && !vehicle.manualOpen && !vehicle.configureOpen"
          class="text-sm font-medium leading-5 text-foreground"
        >
          <span v-if="vehicleTitleShowAsterisk" class="text-destructive">* </span>{{ vehicleSectionTitle }}
        </p>
        <div
          v-if="hasSelectedStockVehicle || vehicle.manualOpen || vehicle.configureOpen"
          class="rounded-lg border border-border bg-card overflow-hidden shadow-mk-dashboard-card"
        >
          <div class="relative flex flex-col gap-4 p-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="absolute right-2 top-2 z-10 h-8 w-8 text-muted-foreground hover:text-foreground"
              :aria-label="t('common.buttons.remove')"
              @click="onRequestClearVehicle"
            >
              <X class="h-4 w-4" aria-hidden="true" />
            </Button>

            <!-- Figma 1710:100591 — section title only when not repeating outer label pattern -->
            <template v-if="hasSelectedStockVehicle">
              <p class="pr-10 text-sm font-medium leading-5 text-foreground">
                {{ vehicleSectionTitle }}
              </p>

              <!-- Hero: thumbnail | title+badge+trim (8px gap, items-start) -->
              <div class="flex w-full items-start gap-2">
                <div class="h-[72px] w-[90px] shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    v-if="selectedStockVehicle?.image"
                    :src="selectedStockVehicle.image"
                    :alt="`${selectedStockVehicle.brand || ''} ${selectedStockVehicle.model || ''}`.trim()"
                    class="h-full w-full object-cover"
                  />
                </div>

                <div class="flex min-h-[72px] min-w-0 flex-1 flex-col gap-0.5">
                  <div class="flex w-full min-w-0 items-center gap-2">
                    <div class="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        v-if="!isService && stockConditionBadge"
                        class="inline-flex shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-sm font-normal leading-5 text-foreground"
                        :class="stockConditionBadgeClass"
                      >
                        {{ stockConditionBadge }}
                      </span>
                      <Button
                        type="button"
                        variant="link"
                        class="h-8 min-w-0 max-w-full justify-start gap-1.5 px-0 text-sm font-medium text-primary"
                        @click.stop.prevent
                      >
                        <span class="min-w-0 truncate leading-5">{{ stockVehicleTitleLine }}</span>
                        <ArrowUpRight class="size-4 shrink-0 opacity-80" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                  <p
                    v-if="stockVehicleTrimLine"
                    class="w-full text-sm leading-5 text-muted-foreground"
                  >
                    {{ stockVehicleTrimLine }}
                  </p>
                </div>
              </div>

              <template v-if="isService">
                <!-- Owned vehicle (Service): compact preview per Figma -->
                <div class="grid w-full grid-cols-1 gap-x-2 gap-y-2 lg:grid-cols-5">
                  <div class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.registrationDate') }}</p>
                    <p class="text-foreground">{{ selectedStockVehicle?.registration || '—' }}</p>
                  </div>
                  <div class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.mileage') }}</p>
                    <p class="text-foreground">
                      {{ selectedStockVehicle?.kilometers != null ? `${selectedStockVehicle.kilometers.toLocaleString()} km` : '—' }}
                    </p>
                  </div>
                  <div class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.ownership') }}</p>
                    <p class="text-foreground">{{ ownedVehicleOwnershipLabel }}</p>
                  </div>
                  <div class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.ownershipStartingDate') }}</p>
                    <p class="text-foreground">{{ ownedVehicleOwnershipStartingDate }}</p>
                  </div>
                  <div v-if="stockPlateDisplay || stockVinDisplay" class="flex min-w-0 flex-col gap-1 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.identity') }}</p>
                    <div class="flex min-w-0 flex-wrap items-center gap-2">
                      <div
                        v-if="stockPlateDisplay"
                        class="inline-flex max-w-full items-center gap-1 overflow-hidden rounded-[2px] border border-border bg-background py-0.5 pl-0.5 pr-1 shadow-[0px_0px_0px_1px_rgba(14,63,126,0.04),0px_1px_1px_-0.5px_rgba(42,51,69,0.04)]"
                      >
                        <span
                          class="h-4 w-1.5 shrink-0 rounded-bl-[1px] rounded-tl-[1px] bg-primary"
                          aria-hidden="true"
                        />
                        <span class="whitespace-nowrap text-sm font-normal leading-5 text-muted-foreground">
                          {{ stockPlateDisplay }}
                        </span>
                      </div>
                      <div
                        v-if="stockVinDisplay"
                        class="inline-flex min-w-0 max-w-full items-center overflow-hidden rounded-[2px] border border-border bg-background px-1 py-0.5 shadow-[0px_0px_0px_1px_rgba(14,63,126,0.04),0px_1px_1px_-0.5px_rgba(42,51,69,0.04)]"
                      >
                        <span class="truncate font-mono text-sm font-normal leading-5 text-muted-foreground">{{ stockVinDisplay }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-0 text-sm leading-5 lg:col-span-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.specification') }}</p>
                    <p class="text-foreground">{{ specText }}</p>
                  </div>
                </div>
              </template>
              <template v-else>
                <!-- Figma: 5×2 grid, 8px gap; row2 = registration | interactions | identity -->
                <div class="grid w-full grid-cols-1 gap-x-2 gap-y-2 lg:grid-cols-5">
                  <div class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.status') }}</p>
                    <p class="text-foreground">{{ stockVehicleInventoryTypeLabel }}</p>
                  </div>
                  <div class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.dealership') }}</p>
                    <p class="text-foreground">{{ selectedStockVehicle?.dealership || '—' }}</p>
                  </div>
                  <div class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.price') }}</p>
                    <p class="text-foreground">
                      {{ selectedStockVehicle?.price != null ? `${selectedStockVehicle.price.toLocaleString()}€` : '—' }}
                    </p>
                  </div>
                  <div class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.specification') }}</p>
                    <p class="text-foreground">{{ specText }}</p>
                  </div>
                  <div class="flex flex-col gap-1 text-sm leading-5 lg:gap-0">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.mileage') }}</p>
                    <p class="text-foreground">
                      {{ selectedStockVehicle?.kilometers != null ? `${selectedStockVehicle.kilometers.toLocaleString()} km` : '—' }}
                    </p>
                  </div>

                  <div class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.registrationDate') }}</p>
                    <p class="text-foreground">{{ selectedStockVehicle?.registration || '—' }}</p>
                  </div>
                  <div v-if="hasStockInteractionMetrics" class="flex flex-col gap-0 text-sm leading-5">
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.interactions') }}</p>
                    <div class="flex flex-wrap items-center gap-3">
                      <span v-if="stockMetricsFunnel != null" class="inline-flex items-center gap-1 text-foreground">
                        <Filter class="size-4 shrink-0 opacity-80 text-muted-foreground" aria-hidden="true" />
                        {{ stockMetricsFunnel }}
                      </span>
                      <span v-if="stockMetricsTag != null" class="inline-flex items-center gap-1 text-foreground">
                        <LucideTag class="size-4 shrink-0 opacity-80 text-muted-foreground" aria-hidden="true" />
                        {{ stockMetricsTag }}
                      </span>
                    </div>
                  </div>
                  <div
                    v-if="stockPlateDisplay || stockVinDisplay"
                    class="flex min-w-0 flex-col gap-1 text-sm leading-5 lg:col-span-1"
                    :class="{ 'lg:col-start-3': !hasStockInteractionMetrics }"
                  >
                    <p class="text-muted-foreground">{{ t('requestDetail.vehicleCard.identity') }}</p>
                    <div class="flex min-w-0 flex-wrap items-center gap-2">
                      <div
                        v-if="stockPlateDisplay"
                        class="inline-flex max-w-full items-center gap-1 overflow-hidden rounded-[2px] border border-border bg-background py-0.5 pl-0.5 pr-1 shadow-[0px_0px_0px_1px_rgba(14,63,126,0.04),0px_1px_1px_-0.5px_rgba(42,51,69,0.04)]"
                      >
                        <span
                          class="h-4 w-1.5 shrink-0 rounded-bl-[1px] rounded-tl-[1px] bg-primary"
                          aria-hidden="true"
                        />
                        <span class="whitespace-nowrap text-sm font-normal leading-5 text-muted-foreground">
                          {{ stockPlateDisplay }}
                        </span>
                      </div>
                      <div
                        v-if="stockVinDisplay"
                        class="inline-flex min-w-0 max-w-full items-center overflow-hidden rounded-[2px] border border-border bg-background px-1 py-0.5 shadow-[0px_0px_0px_1px_rgba(14,63,126,0.04),0px_1px_1px_-0.5px_rgba(42,51,69,0.04)]"
                      >
                        <span class="truncate font-mono text-sm font-normal leading-5 text-muted-foreground">{{ stockVinDisplay }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </template>

            <!-- Manual insert: title (dismiss = corner control, same as manual contact card) -->
            <template v-else-if="vehicle.manualOpen">
              <p class="pr-10 text-sm font-medium leading-5 text-foreground">
                {{ vehicleSectionTitle }}
              </p>
            </template>
            <template v-else-if="vehicle.configureOpen">
              <p class="pr-10 text-sm font-medium leading-5 text-foreground">
                Vehicle information
              </p>

              <div class="flex w-full items-start gap-3">
                <div class="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    v-if="vehicle.configImageUrl"
                    :src="vehicle.configImageUrl"
                    alt=""
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div class="flex min-h-14 min-w-0 flex-1 flex-col gap-0.5">
                  <div class="flex w-full min-w-0 items-center gap-2">
                    <span class="inline-flex shrink-0 items-center justify-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium leading-none text-secondary-foreground">
                      New
                    </span>
                    <p class="min-w-0 truncate text-sm font-medium leading-5 text-foreground">
                      {{ vehicle.label || '—' }}
                    </p>
                  </div>
                  <p class="w-full text-sm leading-5 text-muted-foreground">
                    {{ vehicle.summary || '—' }}
                  </p>
                </div>
              </div>

              <div class="grid w-full grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                <div class="flex flex-col gap-0 text-sm leading-5">
                  <p class="text-muted-foreground">Quantity</p>
                  <p class="text-foreground">{{ vehicle.configQuantity ?? '—' }}</p>
                </div>
                <div class="flex flex-col gap-0 text-sm leading-5">
                  <p class="text-muted-foreground">Price</p>
                  <p class="text-foreground">
                    {{ vehicle.configPrice != null ? `${Number(vehicle.configPrice).toLocaleString()}€` : '—' }}
                  </p>
                </div>
                <div class="flex flex-col gap-0 text-sm leading-5">
                  <p class="text-muted-foreground">Specification</p>
                  <p class="text-foreground">{{ vehicle.configSpecification || '—' }}</p>
                </div>
                <div class="flex flex-col gap-0 text-sm leading-5">
                  <p class="text-muted-foreground">Purchase method</p>
                  <p class="text-foreground">{{ vehicle.configPurchaseMethod || '—' }}</p>
                </div>
              </div>
            </template>

            <!-- Manual insert fields (Figma 1710:68242) -->
            <div
              v-if="vehicle.manualOpen"
              class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3"
            >
            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">
                {{ t('forms.addNew.leadDetails.vehicle.manual.fields.vehicleClass') }}
              </Label>
              <Input
                v-model="vehicle.manualVehicleClass"
                class="h-8 w-full rounded-[10px] text-sm"
                :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">
                {{ t('forms.addNew.leadDetails.vehicle.manual.fields.vehicleType') }}
              </Label>
              <Input
                v-model="vehicle.manualVehicleType"
                class="h-8 w-full rounded-[10px] text-sm"
                :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">
                {{ t('forms.addNew.leadDetails.vehicle.manual.fields.brand') }} <span class="text-destructive">*</span>
              </Label>
              <SelectMenu
                v-model="vehicle.manualBrand"
                :items="manualBrandSelectItems"
                value-key="value"
                :placeholder="t('forms.addNew.leadDetails.vehicle.manual.placeholders.selectBrand')"
                :class="leadDetailsSelectMenuClass"
              >
                <template #item="{ item }">
                  <span>{{ item.label }}</span>
                </template>
              </SelectMenu>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">
                {{ t('forms.addNew.leadDetails.vehicle.manual.fields.model') }} <span class="text-destructive">*</span>
              </Label>
              <SelectMenu
                v-model="vehicle.manualModel"
                :items="manualModelSelectItems"
                value-key="value"
                :disabled="!manualModelSelectEnabled"
                :placeholder="manualModelPlaceholder"
                :class="leadDetailsSelectMenuClass"
              >
                <template #item="{ item }">
                  <span>{{ item.label }}</span>
                </template>
              </SelectMenu>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">
                {{ t('forms.addNew.leadDetails.vehicle.manual.fields.version') }}
              </Label>
              <Input
                v-model="vehicle.manualVersion"
                class="h-8 w-full rounded-[10px] text-sm"
                :placeholder="t('forms.addNew.leadDetails.placeholders.insert')"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">
                {{ t('forms.addNew.leadDetails.vehicle.manual.fields.fuelType') }}
              </Label>
              <Input
                v-model="vehicle.manualFuelType"
                class="h-8 w-full rounded-[10px] text-sm"
                :placeholder="t('forms.addNew.leadDetails.placeholders.select')"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">
                {{ t('forms.addNew.leadDetails.vehicle.manual.fields.quantity') }} <span class="text-destructive">*</span>
              </Label>
              <Input
                v-model="vehicle.manualQuantity"
                class="h-8 w-full rounded-[10px] text-sm"
                inputmode="numeric"
                :placeholder="t('forms.addNew.leadDetails.vehicle.manual.placeholders.quantity')"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-medium text-foreground">
                {{ t('forms.addNew.leadDetails.vehicle.manual.fields.vehiclePrice') }}
              </Label>
              <div class="relative w-full">
                <span
                  class="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground"
                  aria-hidden="true"
                >€</span>
                <Input
                  v-model="vehicle.manualVehiclePrice"
                  class="h-8 w-full rounded-[10px] pl-8 text-sm"
                  inputmode="decimal"
                  :placeholder="t('forms.addNew.leadDetails.placeholders.price')"
                />
              </div>
            </div>
          </div>
          </div>
        </div>

        <div v-else class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div
            role="button"
            tabindex="0"
            :class="[
              'flex h-8 min-h-8 w-full min-w-0 max-w-full cursor-pointer items-center gap-1.5 rounded-[10px] border bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[220px] sm:max-w-[220px] sm:shrink-0',
              errors.vehicle ? 'border-destructive ring-2 ring-destructive' : 'border-input',
            ]"
            @click="openVehicleModal"
            @keydown.enter.prevent="openVehicleModal"
          >
            <Search class="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span class="min-w-0 flex-1 truncate text-left text-muted-foreground">{{ vehicleDisplayText }}</span>
            <kbd
              class="inline-flex h-5 shrink-0 items-center justify-center rounded-md bg-muted px-1 text-xs font-medium leading-none text-muted-foreground"
            >{{ keyboardShortcutLabel }}</kbd>
          </div>

          <div class="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <Button
              v-if="showConfigureVehicle"
              type="button"
              variant="secondary"
              class="h-8 rounded-md px-2.5 text-sm"
              @click="onConfigure"
            >
              {{ t('forms.addNew.leadDetails.vehicle.configure') }}
            </Button>
            <Button
              type="button"
              variant="secondary"
              class="h-8 rounded-md px-2.5 text-sm"
              @click="onInsertManually"
            >
              {{ t('forms.addNew.leadDetails.vehicle.insertManually') }}
            </Button>
          </div>
        </div>

        <p v-if="errors.vehicle" class="text-sm text-destructive">{{ errors.vehicle }}</p>
      </div>
      </div>
    </CardContent>
  </Card>

  <VehicleFromStockModal
    v-model:open="vehicleModalOpen"
    :inventory-mode="vehiclePickerInventoryMode"
    :prefill-search="vehicleModalPrefillSearch"
    @select="onVehiclePicked"
    @insert-manually="onInsertManuallyFromVehicleModal"
  />

  <VehicleConfiguratorModal v-model:open="vehicleConfiguratorOpen" @save="onVehicleConfigured" />

  <Dialog :open="showDiscardManualVehicleConfirm" @update:open="(o) => (showDiscardManualVehicleConfirm = o)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-md max-h-[calc(100vh-4rem)] flex flex-col">
        <DialogHeader>
          <DialogTitle>{{ t('forms.addNew.manualContact.discardTitle') }}</DialogTitle>
          <p class="pt-1 text-sm text-muted-foreground">{{ t('forms.addNew.manualContact.discardMessage') }}</p>
        </DialogHeader>
        <DialogFooter class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" class="w-full sm:w-auto" @click="showDiscardManualVehicleConfirm = false">
            {{ t('common.buttons.cancel') }}
          </Button>
          <Button variant="default" class="w-full sm:w-auto" @click="confirmDiscardManualVehicle">
            {{ t('forms.addNew.manualContact.discardConfirm') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpRight, CircleHelp, Filter, Search, Tag as LucideTag, Tag, Wrench, X } from 'lucide-vue-next'
import { SelectMenu } from '@motork/component-library/future/components'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@motork/component-library/future/primitives'
import { FISCAL_ENTITY_COMPANY_A, FISCAL_ENTITY_COMPANY_B } from '@/constants/fiscalEntities'
import { VEHICLE_BRANDS, getModelsForBrand } from '@/constants/vehicleSuggestions'
import { fetchUsers } from '@/api/users'
import { getVehicleTableOwnerLabel } from '@/utils/vehicleInventoryTable'
import { getVehicleConditionBadgeClass, getVehicleConditionLabel } from '@/utils/vehicleHelpers'
import LeadDepartmentSegment from '@/components/addnew/LeadDepartmentSegment.vue'
import VehicleFromStockModal from '@/components/addnew/VehicleFromStockModal.vue'
import VehicleConfiguratorModal from '@/components/addnew/VehicleConfiguratorModal.vue'

const props = defineProps({
  leadForm: { type: Object, required: true },
  vehicleFormData: { type: Object, required: true },
  /** Display name of contact chosen in SelectContactBox (not manual create). */
  existingContactName: { type: String, default: '' },
  errors: { type: Object, default: () => ({}) },
})

const { t } = useI18n()
const form = props.leadForm
const vehicle = props.vehicleFormData

/** Creation-flow (Figma): white inner card, layered shadow */
const innerPanelClass =
  'rounded-[10px] border border-border/80 bg-white p-4 shadow-[0px_0px_0px_1px_rgba(14,63,126,0.04),0px_1px_1px_-0.5px_rgba(42,51,69,0.04),0px_3px_3px_-1.5px_rgba(42,51,70,0.04),0px_6px_6px_-3px_rgba(42,51,70,0.04),0px_12px_12px_-6px_rgba(14,63,126,0.04),0px_24px_24px_-12px_rgba(14,63,126,0.04)] dark:border-border dark:bg-card'

const tipUid = useId()
const leadTipId = `ld-tip-lead-${tipUid}`
const oppTipId = `ld-tip-opp-${tipUid}`
const isService = computed(() => form.department === 'service')
const isOpp = computed(() => form.recordType === 'opportunity')
const isLead = computed(() => form.recordType === 'lead')

const leadDetailsSectionTitle = computed(() =>
  isOpp.value
    ? t('forms.addNew.leadDetails.titleOpportunity')
    : t('forms.addNew.leadDetails.title'),
)

const showServiceOppTop = computed(() => isService.value && isOpp.value)
const showStandardRequestGrid = computed(() => !showServiceOppTop.value)

/** Department + Lead/Opp rows: one column width vs sm 2-col / lg 3-col form grids (gap-x-4); same for all flows incl. service opp */
const recordTypeRowOuterClass =
  'w-full min-w-0 max-w-full sm:max-w-[calc((100%-1rem)/2)] lg:max-w-[calc((100%-2rem)/3)]'

/** Inner: two equal segments + gap-x-4 between them (matches form grid gap) */
const recordTypeRowGridClass =
  'grid w-full min-w-0 grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-4'

const showRequestMessage = computed(() => isLead.value)
const showNotesToSellers = computed(() => !isService.value && isOpp.value)
const showServiceOppNotes = computed(() => isService.value && isOpp.value)

/** Service department (lead or opportunity): aftersales request types */
const REQUEST_TYPE_VALUES_SERVICE = [
  'expiring_financing',
  'expiring_guarantee',
  'generic_aftersales',
  'livespark',
  'spare_parts',
  'workshop',
]

/** Sales + Lead or Sales + Opportunity: same product list (alphabetical labels in UI) */
const REQUEST_TYPE_VALUES_SALES = [
  'financing_early_payoff',
  'financing_expiration',
  'fleet',
  'generic_sales',
  'livespark',
  'long_term_rent',
  'online_sales',
  'quotation',
  'sellspark',
  'short_term_rent',
  'test_drive',
  'trade_in',
]

const requestTypeValues = computed(() => {
  if (form.department === 'sales' && (form.recordType === 'lead' || form.recordType === 'opportunity')) {
    return REQUEST_TYPE_VALUES_SALES
  }
  return REQUEST_TYPE_VALUES_SERVICE
})

watch(
  requestTypeValues,
  (list) => {
    if (form.requestType && !list.includes(form.requestType)) {
      form.requestType = ''
    }
  },
  { immediate: true },
)

const channelValues = [
  'automation',
  'email',
  'integration',
  'manual_import',
  'other',
  'phone',
  'walk_in',
  'whatsapp',
]

const sourceValues = [
  'marketing',
  'marketing_automation',
  'other',
  'social',
  'third_parties',
  'web',
]

watch(
  () => [form.channel, form.source],
  () => {
    if (form.channel && !channelValues.includes(form.channel)) {
      form.channel = ''
    }
    if (form.source && !sourceValues.includes(form.source)) {
      form.source = ''
    }
  },
  { immediate: true },
)

watch(
  () => [form.department, form.recordType],
  () => {
    if (form.department !== 'sales' || form.recordType !== 'opportunity') {
      vehicle.configureOpen = false
    }
  },
)

/** Source detail is editable only after a source is selected (all department / record-type layouts). */
const isSourceDetailDisabled = computed(
  () => form.source == null || String(form.source).trim() === '',
)
const dealershipValues = ['milano', 'firenze', 'roma', 'bari', 'trento']

const fiscalEntityOptions = [
  { id: FISCAL_ENTITY_COMPANY_A, labelKey: 'forms.addNew.manualContact.entities.companyA' },
  { id: FISCAL_ENTITY_COMPANY_B, labelKey: 'forms.addNew.manualContact.entities.companyB' },
]

const assigneeUsers = ref([])
onMounted(async () => {
  try {
    const users = await fetchUsers()
    assigneeUsers.value = users || []
  } catch {
    assigneeUsers.value = []
  }
})

const leadDetailsSelectMenuClass = 'h-8 min-h-8 w-full rounded-[10px] text-sm'

const requestTypeSelectItems = computed(() =>
  requestTypeValues.value.map((opt) => ({
    value: opt,
    label: t(`forms.addNew.leadDetails.options.requestType.${opt}`),
  })),
)

const channelSelectItems = computed(() =>
  channelValues.map((opt) => ({
    value: opt,
    label: t(`forms.addNew.leadDetails.options.channel.${opt}`),
  })),
)

const sourceSelectItems = computed(() =>
  sourceValues.map((opt) => ({
    value: opt,
    label: t(`forms.addNew.leadDetails.options.source.${opt}`),
  })),
)

const dealershipSelectItems = computed(() =>
  dealershipValues.map((opt) => ({
    value: opt,
    label: t(`forms.addNew.leadDetails.options.dealership.${opt}`),
  })),
)

const fiscalEntitySelectItems = computed(() =>
  fiscalEntityOptions.map((opt) => ({
    value: opt.id,
    label: t(opt.labelKey),
  })),
)

const assigneeSelectItems = computed(() =>
  assigneeUsers.value.map((u) => ({
    value: String(u.id),
    label: u.team ? `${u.name} · ${u.team}` : u.name,
  })),
)

/** "?" on Lead row: copy depends on Sales vs Service department */
const leadCardTooltip = computed(() =>
  t(`forms.addNew.leadDetails.tooltips.lead.${form.department}`),
)

/** "?" on Opportunity row */
const opportunityCardTooltip = computed(() =>
  t(`forms.addNew.leadDetails.tooltips.opportunity.${form.department}`),
)

const vehicleSectionTitle = computed(() => {
  if (!isService.value) {
    return isOpp.value
      ? t('forms.addNew.leadDetails.vehicle.sectionVehicleInfo')
      : t('forms.addNew.leadDetails.vehicle.sectionVehicleRequested')
  }
  return t('forms.addNew.leadDetails.vehicle.sectionOwnedVehicle')
})

/** Sales + Opportunity: extra “Configure” path before “Insert manually”. */
const showConfigureVehicle = computed(() => !isService.value && isOpp.value)

/** Required: Sales + Lead ("Requested vehicle") and Sales + Opportunity ("Vehicle information") */
const vehicleTitleShowAsterisk = computed(() => !isService.value && (isLead.value || isOpp.value))

const vehiclePickerInventoryMode = computed(() =>
  isService.value && (isLead.value || isOpp.value) ? 'customer-vehicles' : 'in-stock',
)

const vehicleModalPrefillSearch = computed(() => {
  if (vehiclePickerInventoryMode.value !== 'customer-vehicles') return ''
  return String(props.existingContactName || '').trim()
})

const vehicleDisplayText = computed(() => {
  const label = (vehicle.label || vehicle.summary || '').trim()
  if (label) return label
  if (isService.value && isLead.value) {
    return t('forms.addNew.leadDetails.vehicle.searchCustomerVehiclesPlaceholder')
  }
  return t('forms.addNew.leadDetails.vehicle.searchPlaceholder')
})

const selectedStockVehicle = computed(() => vehicle.stockVehicle || null)
const hasSelectedStockVehicle = computed(() => selectedStockVehicle.value && selectedStockVehicle.value.id != null)

const stockVehicleInventoryTypeLabel = computed(() => {
  const v = selectedStockVehicle.value
  if (!v) return '—'
  const inv = v.inventoryType
  if (inv === 'in-stock') return t('requestDetail.vehicleCard.stockInStock')
  if (inv === 'customer-vehicles') return t('forms.addNew.leadDetails.vehicle.inventoryCustomerVehicles')
  return '—'
})

const specText = computed(() => {
  const v = selectedStockVehicle.value
  if (!v) return '—'
  const a = (v.fuelType || '').toString().trim()
  const b = (v.gearType || '').toString().trim()
  const out = [a, b].filter(Boolean).join(' - ')
  return out || '—'
})

/** Match Request detail `VehicleRequestCard` (condition pill + listing metrics + identity chips). */
const stockVehicleTitleLine = computed(() => {
  const v = selectedStockVehicle.value
  if (!v) return ''
  const parts = [v.brand, v.model].filter(Boolean)
  return parts.join(' ').trim() || '—'
})

const stockVehicleTrimLine = computed(() => {
  const v = selectedStockVehicle.value
  if (!v) return ''
  const trim = (v.trim || v.variant || v.engineLine || '').toString().trim()
  if (trim) return trim
  return (v.summary || vehicle.label || '').toString().trim()
})

const stockConditionBadge = computed(() => getVehicleConditionLabel(selectedStockVehicle.value))

const stockConditionBadgeClass = computed(() =>
  getVehicleConditionBadgeClass(stockConditionBadge.value)
)

const stockMetricsFunnel = computed(() => selectedStockVehicle.value?.listingMetrics?.funnelViews)
const stockMetricsTag = computed(() => selectedStockVehicle.value?.listingMetrics?.tagCount)
const hasStockInteractionMetrics = computed(
  () => stockMetricsFunnel.value != null || stockMetricsTag.value != null,
)

const stockPlateDisplay = computed(() => {
  const v = selectedStockVehicle.value
  if (!v) return ''
  return (v.plateNumber || v.plate || v.plates || '').toString().trim()
})

const stockVinDisplay = computed(() => {
  const v = selectedStockVehicle.value
  if (!v) return ''
  return (v.vin || '').toString().trim()
})

const ownedVehicleOwnershipLabel = computed(() => {
  const v = selectedStockVehicle.value
  if (!v) return '—'
  const label = getVehicleTableOwnerLabel(v)
  return label || '—'
})

const formatRegistration = (registration) => {
  if (!registration) return '—'
  if (typeof registration === 'string' && registration.includes('/')) return registration
  const d = new Date(String(registration))
  if (Number.isNaN(d.getTime())) return String(registration)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = String(d.getFullYear())
  return `${mm}/${yyyy}`
}

const ownedVehicleOwnershipStartingDate = computed(() => {
  const v = selectedStockVehicle.value
  if (!v) return '—'
  const raw = v.ownedSince || v.soldAt || v.registration
  if (!raw) return '—'
  return formatRegistration(raw)
})

const isMac = ref(typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform))
const keyboardShortcutLabel = computed(() => (isMac.value ? '⌘K' : 'Ctrl+K'))

const vehicleModalOpen = ref(false)
const vehicleConfiguratorOpen = ref(false)
const showDiscardManualVehicleConfirm = ref(false)

const manualBrandOptions = VEHICLE_BRANDS

const manualModelOptions = computed(() => getModelsForBrand(vehicle.manualBrand))

const manualBrandSelectItems = computed(() =>
  manualBrandOptions.map((b) => ({ value: b, label: b })),
)

const manualModelSelectItems = computed(() =>
  manualModelOptions.value.map((m) => ({ value: m, label: m })),
)

const manualModelSelectEnabled = computed(() => String(vehicle.manualBrand ?? '').trim() !== '')

const manualModelPlaceholder = computed(() =>
  manualModelSelectEnabled.value
    ? t('forms.addNew.leadDetails.vehicle.manual.placeholders.selectModel')
    : t('forms.addNew.leadDetails.vehicle.manual.placeholders.selectBrandFirst'),
)

watch(
  () => vehicle.manualBrand,
  () => {
    const models = getModelsForBrand(vehicle.manualBrand)
    if (vehicle.manualModel && !models.includes(vehicle.manualModel)) {
      vehicle.manualModel = ''
    }
  },
  { immediate: true },
)

function isManualVehicleDirty() {
  if (!vehicle.manualOpen) return false
  const t = (s) => String(s ?? '').trim()
  if (t(vehicle.manualVehicleClass)) return true
  if (t(vehicle.manualVehicleType)) return true
  if (t(vehicle.manualBrand)) return true
  if (t(vehicle.manualModel)) return true
  if (t(vehicle.manualVersion)) return true
  if (t(vehicle.manualFuelType)) return true
  if (t(vehicle.manualVehiclePrice)) return true
  const q = t(vehicle.manualQuantity)
  if (q === '') return true
  if (q !== '1') return true
  return false
}

function onRequestClearVehicle() {
  if (vehicle.manualOpen && isManualVehicleDirty()) {
    showDiscardManualVehicleConfirm.value = true
    return
  }
  clearVehicleSelection()
}

function confirmDiscardManualVehicle() {
  showDiscardManualVehicleConfirm.value = false
  clearVehicleSelection()
}

function openVehicleModal() {
  vehicleModalOpen.value = true
}

function onVehiclePicked(v) {
  // Mutual exclusivity: picking stock closes/clears manual mode
  vehicle.manualOpen = false
  vehicle.configureOpen = false

  vehicle.stockVehicle = v || null
  vehicle.stockVehicleId = v?.id ?? null
  vehicle.label = [v?.brand, v?.model, v?.year].filter(Boolean).join(' ')
  vehicle.summary = v?.summary || ''
  vehicle.vin = v?.vin || ''
  vehicle.plateNumber = v?.plateNumber || ''
  vehicle.brand = v?.brand || ''
  vehicle.model = v?.model || ''
}

function onInsertManually() {
  // Mutual exclusivity: manual hides any stock selection
  clearVehicleSelection()
  vehicle.manualOpen = true
  vehicle.configureOpen = false
}

function onInsertManuallyFromVehicleModal() {
  vehicleModalOpen.value = false
  onInsertManually()
}

function onConfigure() {
  clearVehicleSelection()
  vehicle.configureOpen = false
  vehicleConfiguratorOpen.value = true
}

function onVehicleConfigured(payload) {
  clearVehicleSelection()
  vehicle.configureOpen = true

  vehicle.label = String(payload?.label || '').trim()
  vehicle.summary = String(payload?.summary || '').trim()
  vehicle.brand = String(payload?.brand || '').trim()
  vehicle.model = String(payload?.model || '').trim()

  vehicle.configImageUrl = String(payload?.imageUrl || '').trim()
  vehicle.configQuantity = payload?.quantity != null ? Number(payload.quantity) : 1
  vehicle.configPrice = payload?.price != null ? Number(payload.price) : null
  vehicle.configSpecification = String(payload?.specification || '').trim()
  vehicle.configPurchaseMethod = String(payload?.purchaseMethod || '').trim()
}

function clearVehicleSelection() {
  vehicle.stockVehicleId = null
  vehicle.stockVehicle = null
  vehicle.label = ''
  vehicle.summary = ''
  vehicle.vin = ''
  vehicle.plateNumber = ''
  vehicle.brand = ''
  vehicle.model = ''
  vehicle.manualOpen = false
  vehicle.configureOpen = false

  vehicle.manualVehicleClass = ''
  vehicle.manualVehicleType = ''
  vehicle.manualBrand = ''
  vehicle.manualModel = ''
  vehicle.manualVersion = ''
  vehicle.manualFuelType = ''
  vehicle.manualQuantity = '1'
  vehicle.manualVehiclePrice = ''

  vehicle.configImageUrl = ''
  vehicle.configQuantity = null
  vehicle.configPrice = null
  vehicle.configSpecification = ''
  vehicle.configPurchaseMethod = ''
}

function onGlobalKey(e) {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
    const tag = (e.target && e.target.tagName) || ''
    const te = (e.target && e.target.isContentEditable) || false
    if (te || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    e.preventDefault()
    openVehicleModal()
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('keydown', onGlobalKey)
  isMac.value = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
})
onUnmounted(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('keydown', onGlobalKey)
})
</script>
