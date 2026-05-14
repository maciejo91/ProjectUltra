<template>
  <Card class="w-full border-0 bg-card shadow-mk-dashboard-card gap-2">
    <CardHeader
      class="cursor-pointer select-none"
      role="button"
      :aria-expanded="contactPanelOpen"
      :aria-label="t('forms.addNew.manualContact.sections.contactInfo')"
      @click="contactPanelOpen = !contactPanelOpen"
    >
      <CardTitle>{{ t('forms.addNew.manualContact.sections.contactInfo') }}</CardTitle>
      <CardAction>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-muted-foreground hover:text-foreground"
          :aria-label="contactPanelOpen ? t('forms.addNew.manualContact.collapseAria') : t('forms.addNew.manualContact.expandAria')"
          @click.stop="contactPanelOpen = !contactPanelOpen"
        >
          <ChevronDown
            class="h-3 w-3 transition-transform duration-200"
            :class="{ 'rotate-180': contactPanelOpen }"
          />
        </Button>
      </CardAction>
    </CardHeader>

    <transition name="mk-contact-expand">
      <CardContent v-show="contactPanelOpen" class="p-0">
        <div class="px-6 pb-0">
      <div class="relative rounded-lg border border-border bg-white p-6 pt-10 shadow-mk-dashboard-card">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="absolute right-2 top-2 z-10 h-8 w-8 text-muted-foreground hover:text-foreground"
          :aria-label="t('forms.addNew.manualContact.closeAria')"
          @click="emit('request-close')"
        >
          <X class="h-4 w-4" />
        </Button>

        <div class="space-y-6">
          <div>
            <p class="mb-2 text-sm font-medium text-foreground">
              {{ t('forms.addNew.manualContact.accountType') }}
            </p>
            <RadioGroup v-model="data.accountType" class="flex flex-wrap gap-6" aria-label="Account type">
              <div class="flex items-center gap-2">
                <RadioGroupItem id="mk-account-private" value="private" />
                <Label for="mk-account-private" class="text-sm text-foreground">
                  {{ t('forms.addNew.manualContact.private') }}
                </Label>
              </div>
              <div class="flex items-center gap-2">
                <RadioGroupItem id="mk-account-company" value="company" />
                <Label for="mk-account-company" class="text-sm text-foreground">
                  {{ t('forms.addNew.manualContact.company') }}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div v-if="data.accountType === 'company' && data.companyAccountMode === 'create'" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div class="space-y-2">
                <Label class="text-sm font-semibold text-foreground">
                  {{ t('forms.addNew.manualContact.companyName') }} <span class="text-destructive">*</span>
                </Label>
                <Input
                  v-model="data.company"
                  type="text"
                  class="h-10 w-full"
                  :placeholder="t('forms.addNew.manualContact.companyNamePlaceholder')"
                  :error="errors.company"
                />
                <p v-if="errors.company" class="text-sm text-brand-red">{{ errors.company }}</p>
              </div>
              <div class="space-y-2">
                <Label class="text-sm font-semibold text-foreground">
                  {{ t('forms.addNew.manualContact.companyAccount.vat') }}
                </Label>
                <Input
                  v-model="data.companyVat"
                  type="text"
                  class="h-10 w-full"
                  :placeholder="t('forms.addNew.manualContact.insertPlaceholder')"
                />
              </div>
              <div class="space-y-2">
                <Label class="text-sm font-semibold text-foreground">
                  {{ t('forms.addNew.manualContact.companyAccount.employees') }}
                </Label>
                <Input
                  v-model="data.companyEmployeeCount"
                  type="text"
                  inputmode="numeric"
                  class="h-10 w-full"
                  :placeholder="t('forms.addNew.manualContact.insertPlaceholder')"
                  :error="errors.companyEmployeeCount"
                />
                <p v-if="errors.companyEmployeeCount" class="text-sm text-brand-red">{{ errors.companyEmployeeCount }}</p>
              </div>
              <div class="space-y-2">
                <p class="text-sm font-semibold text-foreground">
                  {{ t('forms.addNew.manualContact.companyAccount.dealer') }}
                </p>
                <RadioGroup
                  v-model="dealerChoice"
                  class="flex flex-wrap gap-4"
                  :aria-label="t('forms.addNew.manualContact.companyAccount.dealer')"
                >
                  <div class="flex items-center gap-2">
                    <RadioGroupItem id="mk-dealer-yes" value="yes" />
                    <Label for="mk-dealer-yes" class="text-sm text-foreground">
                      {{ t('common.common.yes') }}
                    </Label>
                  </div>
                  <div class="flex items-center gap-2">
                    <RadioGroupItem id="mk-dealer-no" value="no" />
                    <Label for="mk-dealer-no" class="text-sm text-foreground">
                      {{ t('common.common.no') }}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div>
              <Button
                type="button"
                variant="link"
                class="h-auto gap-1.5 p-0 text-primary"
                @click="data.companyAccountMode = 'link'"
              >
                <Search class="size-4 shrink-0" aria-hidden="true" />
                {{ t('forms.addNew.manualContact.companyAccount.linkExisting') }}
              </Button>
            </div>
          </div>

          <div v-else-if="data.accountType === 'company' && data.companyAccountMode === 'link'" class="space-y-3">
            <SelectAccountBox
              :model-value="data.linkedAccount"
              @update:model-value="onLinkedAccountUpdate"
              @switch-to-create="data.companyAccountMode = 'create'"
            />
            <p v-if="errors.linkedAccount" class="text-sm text-brand-red">{{ errors.linkedAccount }}</p>
          </div>

          <div class="space-y-2">
            <Label class="text-sm font-semibold text-foreground">
              {{ t('forms.addNew.manualContact.fiscalEntityVisibility') }} <span class="text-destructive">*</span>
            </Label>
            <Popover :open="fiscalPopoverOpen" @update:open="(v) => (fiscalPopoverOpen = v)">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="flex h-10 min-h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm ring-offset-background transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  :aria-expanded="fiscalPopoverOpen"
                  :aria-label="t('forms.addNew.manualContact.fiscalEntityVisibility')"
                >
                  <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <template v-if="data.fiscalEntityIds?.length">
                      <Badge
                        v-for="eid in data.fiscalEntityIds"
                        :key="eid"
                        variant="secondary"
                        class="gap-1"
                      >
                        <span class="max-w-[12rem] truncate">{{ entityLabel(eid) }}</span>
                        <span
                          role="button"
                          tabindex="0"
                          class="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-sm hover:bg-muted"
                          :aria-label="`${t('forms.addNew.manualContact.removeFiscalEntityAria')} ${entityLabel(eid)}`"
                          @click.stop.prevent="removeFiscalEntity(eid)"
                          @keydown.enter.stop.prevent="removeFiscalEntity(eid)"
                          @keydown.space.stop.prevent="removeFiscalEntity(eid)"
                        >
                          <X class="h-3 w-3" />
                        </span>
                      </Badge>
                    </template>
                    <span v-else class="text-sm text-muted-foreground">{{ t('forms.placeholders.select') }}</span>
                  </div>
                  <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent class="w-[--reka-popover-trigger-width] min-w-[240px] p-2" align="start" @open-auto-focus.prevent>
                <div class="flex max-h-64 flex-col gap-0.5 overflow-y-auto" role="group" :aria-label="t('forms.addNew.manualContact.fiscalEntityVisibility')">
                  <label
                    v-for="ent in fiscalEntityOptions"
                    :key="ent.id"
                    class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                  >
                    <Checkbox
                      :model-value="data.fiscalEntityIds.includes(ent.id)"
                      @update:model-value="(v) => toggleFiscalEntityOption(ent.id, v === true)"
                    />
                    <span class="text-foreground">{{ t(ent.labelKey) }}</span>
                  </label>
                </div>
              </PopoverContent>
            </Popover>
            <p v-if="errors.fiscalEntities" class="text-sm text-brand-red">{{ errors.fiscalEntities }}</p>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
            <div class="space-y-2">
              <Label class="text-sm font-semibold text-foreground">
                {{ t('forms.addNew.manualContact.firstName') }} <span class="text-destructive">*</span>
              </Label>
              <Input
                v-model="data.firstName"
                type="text"
                class="h-10 w-full"
                :placeholder="t('forms.addNew.manualContact.insertPlaceholder')"
                :error="errors.firstName"
              />
              <p v-if="errors.firstName" class="text-sm text-brand-red">{{ errors.firstName }}</p>
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-semibold text-foreground">
                {{ t('forms.addNew.manualContact.lastName') }} <span class="text-destructive">*</span>
              </Label>
              <Input
                v-model="data.lastName"
                type="text"
                class="h-10 w-full"
                :placeholder="t('forms.addNew.manualContact.insertPlaceholder')"
                :error="errors.lastName"
              />
              <p v-if="errors.lastName" class="text-sm text-brand-red">{{ errors.lastName }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex min-h-10 items-center justify-between gap-3">
                <Label class="shrink-0 text-sm font-semibold text-foreground">
                  {{ t('forms.labels.phone') }} <span class="text-destructive">**</span>
                </Label>
                <span class="max-w-[min(100%,14rem)] text-right text-xs font-normal leading-snug text-muted-foreground sm:max-w-[18rem]">
                  {{ t('forms.addNew.manualContact.phoneEmailRule') }}
                </span>
              </div>
              <InternationalPhoneInput
                v-model="data.phone"
                class="w-full min-w-0"
                default-country="IT"
                :error="errors.phone || errors.phoneOrEmail"
              />
              <p v-if="errors.phone" class="text-sm text-brand-red">{{ errors.phone }}</p>
              <p v-else-if="errors.phoneOrEmail" class="text-sm text-brand-red">{{ errors.phoneOrEmail }}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                class="h-8 w-fit gap-1"
                :disabled="data.secondaryPhones.length > 0"
                @click="addSecondaryPhone"
              >
                <Plus class="size-3" />
                {{ t('forms.addNew.manualContact.addSecondaryPhone') }}
              </Button>
              <div
                v-for="(p, idx) in data.secondaryPhones"
                :key="'ph-' + idx"
                class="flex flex-col gap-2"
              >
                <Label class="text-sm font-semibold text-foreground" :for="`mk-secondary-phone-${idx}`">
                  {{ t('forms.addNew.manualContact.secondaryPhoneLabel') }}
                </Label>
                <div class="flex min-w-0 gap-2">
                  <InternationalPhoneInput
                    :input-id="`mk-secondary-phone-${idx}`"
                    v-model="data.secondaryPhones[idx]"
                    class="min-w-0 flex-1"
                    default-country="IT"
                    :error="errors.secondaryPhone"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-10 shrink-0"
                    @click="data.secondaryPhones.splice(idx, 1)"
                  >
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p v-if="errors.secondaryPhone" class="text-sm text-brand-red">{{ errors.secondaryPhone }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex min-h-10 items-center">
                <Label class="text-sm font-semibold text-foreground">
                  {{ t('forms.labels.email') }} <span class="text-destructive">**</span>
                </Label>
              </div>
              <Input
                v-model="data.email"
                type="email"
                class="h-10 w-full min-w-0"
                :placeholder="t('forms.addNew.manualContact.insertPlaceholder')"
                :error="errors.email"
              />
              <p v-if="errors.email" class="text-sm text-brand-red">{{ errors.email }}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                class="h-8 w-fit gap-1"
                :disabled="data.secondaryEmails.length > 0"
                @click="addSecondaryEmail"
              >
                <Plus class="size-3" />
                {{ t('forms.addNew.manualContact.addSecondaryEmail') }}
              </Button>
              <div
                v-for="(e, idx) in data.secondaryEmails"
                :key="'em-' + idx"
                class="flex flex-col gap-2"
              >
                <Label class="text-sm font-semibold text-foreground" :for="`mk-secondary-email-${idx}`">
                  {{ t('forms.addNew.manualContact.secondaryEmailLabel') }}
                </Label>
                <div class="flex min-w-0 gap-2">
                  <Input
                    :id="`mk-secondary-email-${idx}`"
                    v-model="data.secondaryEmails[idx]"
                    type="email"
                    class="h-10 min-w-0 flex-1"
                    :placeholder="t('forms.addNew.manualContact.insertPlaceholder')"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-10 shrink-0"
                    @click="data.secondaryEmails.splice(idx, 1)"
                  >
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label class="text-sm font-semibold text-foreground">{{ t('forms.addNew.manualContact.town') }}</Label>
              <Input v-model="data.town" type="text" class="h-10 w-full" :placeholder="t('forms.addNew.manualContact.insertPlaceholder')" />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-semibold text-foreground">{{ t('forms.addNew.manualContact.zip') }}</Label>
              <Input v-model="data.zip" type="text" class="h-10 w-full" :placeholder="t('forms.addNew.manualContact.insertPlaceholder')" />
            </div>
          </div>

          <div class="rounded-lg border border-border">
            <button
              type="button"
              class="flex w-full items-center justify-between overflow-hidden rounded-[10px] border-0 bg-[var(--primary-foreground)] px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
              @click="moreDetailsOpen = !moreDetailsOpen"
            >
              <span>{{ t('forms.addNew.manualContact.moreDetails') }}</span>
              <ChevronDown
                class="size-4 shrink-0 text-muted-foreground transition-transform"
                :class="moreDetailsOpen ? 'rotate-180' : ''"
              />
            </button>
            <div v-if="moreDetailsOpen" class="border-t border-border px-4 pb-4 pt-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.address') }}
                  </Label>
                  <Input
                    v-model="data.detailsAddress"
                    type="text"
                    class="h-10 w-full"
                    :placeholder="t('forms.addNew.manualContact.moreDetailsFields.placeholders.insert')"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.addressAdditionalInfo') }}
                  </Label>
                  <Input
                    v-model="data.detailsAddressAdditionalInfo"
                    type="text"
                    class="h-10 w-full"
                    :placeholder="t('forms.addNew.manualContact.moreDetailsFields.placeholders.insert')"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.stateProvince') }}
                  </Label>
                  <Select v-model="data.detailsStateProvince">
                    <SelectTrigger class="h-10 w-full">
                      <SelectValue :placeholder="t('forms.placeholders.select')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MI">MI</SelectItem>
                      <SelectItem value="RM">RM</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    <span class="text-destructive">*</span> {{ t('forms.addNew.manualContact.moreDetailsFields.country') }}
                  </Label>
                  <Select v-model="data.detailsCountry">
                    <SelectTrigger class="h-10 w-full">
                      <SelectValue :placeholder="t('forms.placeholders.select')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IT">Italy</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="NL">Netherlands</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.taxCode') }}
                  </Label>
                  <Input
                    v-model="data.detailsTaxCode"
                    type="text"
                    class="h-10 w-full"
                    :placeholder="t('forms.addNew.manualContact.moreDetailsFields.placeholders.insert')"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.language') }}
                  </Label>
                  <Select v-model="data.detailsLanguage">
                    <SelectTrigger class="h-10 w-full">
                      <SelectValue :placeholder="t('forms.placeholders.select')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="nl">Dutch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.dateOfBirth') }}
                  </Label>
                  <MiniCalendarDateField
                    v-model="data.detailsDateOfBirth"
                    :aria-label="t('forms.addNew.manualContact.moreDetailsFields.dateOfBirth')"
                    group-class="rounded-md"
                    input-class="min-w-0"
                    :max-date="dateOfBirthMaxIso"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.placeOfBirth') }}
                  </Label>
                  <Input
                    v-model="data.detailsPlaceOfBirth"
                    type="text"
                    class="h-10 w-full"
                    :placeholder="t('forms.addNew.manualContact.moreDetailsFields.placeholders.insert')"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.gender') }}
                  </Label>
                  <Select v-model="data.detailsGender">
                    <SelectTrigger class="h-10 w-full">
                      <SelectValue :placeholder="t('forms.placeholders.select')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.jobTitle') }}
                  </Label>
                  <Input
                    v-model="data.detailsJobTitle"
                    type="text"
                    class="h-10 w-full"
                    :placeholder="t('forms.addNew.manualContact.moreDetailsFields.placeholders.insert')"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-sm font-semibold text-foreground">
                    {{ t('forms.addNew.manualContact.moreDetailsFields.favoriteContactMethod') }}
                  </Label>
                  <Select v-model="data.detailsFavoriteContactMethod">
                    <SelectTrigger class="h-10 w-full">
                      <SelectValue :placeholder="t('forms.placeholders.select')" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 border-t border-border p-0">
            <div class="flex flex-col gap-6 pt-6">
              <div class="flex flex-col">
                <p class="text-sm font-medium leading-5 text-foreground">
                  {{ t('forms.addNew.manualContact.sections.privacy') }}
                </p>
                <div class="border-b border-border">
                  <div class="flex max-w-[1304px] items-center">
                    <button
                      v-for="eid in data.fiscalEntityIds"
                      :key="eid"
                      type="button"
                      class="py-1.5 transition-colors"
                      :class="activePrivacyEntityId === eid ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'"
                      @click="activePrivacyEntityId = eid"
                    >
                      <span class="flex items-center justify-center rounded-md px-2.5 py-2 text-sm leading-5">
                        {{ entityLabel(eid) }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div v-if="!data.fiscalEntityIds.length" class="text-sm text-muted-foreground">
                {{ t('forms.addNew.manualContact.privacyNeedEntities') }}
              </div>

              <div v-else-if="activePrivacyEntityId && privacyRow" class="flex flex-col gap-2">
                <div
                  v-for="consent in consentKeys"
                  :key="consent.key"
                  class="flex cursor-pointer items-start gap-2 text-left"
                  @click="privacyRow[consent.key] = !privacyRow[consent.key]"
                >
                  <div class="mt-0.5 shrink-0" @click.stop>
                    <Checkbox
                      :model-value="privacyRow[consent.key]"
                      @update:model-value="(v) => (privacyRow[consent.key] = v === true)"
                    />
                  </div>
                  <p class="text-sm font-medium leading-none text-foreground">
                    {{ t(consent.labelKey) }}
                  </p>
                </div>

                <div v-if="privacyRow.marketing" class="flex w-full gap-10 pl-6">
                  <div class="flex flex-col gap-2">
                    <p class="text-sm font-medium leading-5 text-muted-foreground">
                      {{ t('forms.addNew.manualContact.marketingChannels.call') }}
                    </p>
                    <div class="flex flex-col gap-2">
                      <div class="flex items-start gap-2 text-left">
                        <Switch
                          v-model="privacyRow.marketingChannels.callPrimary"
                          size="sm"
                          :disabled="!channelAvailability.callPrimary"
                        />
                        <p class="text-sm font-medium leading-none text-foreground">
                          {{ t('forms.addNew.manualContact.marketingChannels.phone') }}
                        </p>
                      </div>
                      <div class="flex items-start gap-2 text-left">
                        <Switch
                          v-model="privacyRow.marketingChannels.callSecondary"
                          size="sm"
                          :disabled="!channelAvailability.callSecondary"
                        />
                        <p class="text-sm font-medium leading-none text-foreground">
                          {{ t('forms.addNew.manualContact.marketingChannels.phoneSecondary') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <p class="text-sm font-medium leading-5 text-muted-foreground">
                      {{ t('forms.addNew.manualContact.marketingChannels.sms') }}
                    </p>
                    <div class="flex flex-col gap-2">
                      <div class="flex items-start gap-2 text-left">
                        <Switch
                          v-model="privacyRow.marketingChannels.smsPrimary"
                          size="sm"
                          :disabled="!channelAvailability.smsPrimary"
                        />
                        <p class="text-sm font-medium leading-none text-foreground">
                          {{ t('forms.addNew.manualContact.marketingChannels.phone') }}
                        </p>
                      </div>
                      <div class="flex items-start gap-2 text-left">
                        <Switch
                          v-model="privacyRow.marketingChannels.smsSecondary"
                          size="sm"
                          :disabled="!channelAvailability.smsSecondary"
                        />
                        <p class="text-sm font-medium leading-none text-foreground">
                          {{ t('forms.addNew.manualContact.marketingChannels.phoneSecondary') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <p class="text-sm font-medium leading-5 text-muted-foreground">
                      {{ t('forms.addNew.manualContact.marketingChannels.whatsapp') }}
                    </p>
                    <div class="flex flex-col gap-2">
                      <div class="flex items-start gap-2 text-left">
                        <Switch
                          v-model="privacyRow.marketingChannels.whatsappPrimary"
                          size="sm"
                          :disabled="!channelAvailability.whatsappPrimary"
                        />
                        <p class="text-sm font-medium leading-none text-foreground">
                          {{ t('forms.addNew.manualContact.marketingChannels.phone') }}
                        </p>
                      </div>
                      <div class="flex items-start gap-2 text-left">
                        <Switch
                          v-model="privacyRow.marketingChannels.whatsappSecondary"
                          size="sm"
                          :disabled="!channelAvailability.whatsappSecondary"
                        />
                        <p class="text-sm font-medium leading-none text-foreground">
                          {{ t('forms.addNew.manualContact.marketingChannels.phoneSecondary') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <p class="text-sm font-medium leading-5 text-muted-foreground">
                      {{ t('forms.addNew.manualContact.marketingChannels.email') }}
                    </p>
                    <div class="flex flex-col gap-2">
                      <div class="flex items-start gap-2 text-left">
                        <Switch
                          v-model="privacyRow.marketingChannels.emailPrimary"
                          size="sm"
                          :disabled="!channelAvailability.emailPrimary"
                        />
                        <p class="text-sm font-medium leading-none text-foreground">
                          {{ t('forms.addNew.manualContact.marketingChannels.emailPrimary') }}
                        </p>
                      </div>
                      <div class="flex items-start gap-2 text-left">
                        <Switch
                          v-model="privacyRow.marketingChannels.emailSecondary"
                          size="sm"
                          :disabled="!channelAvailability.emailSecondary"
                        />
                        <p class="text-sm font-medium leading-none text-foreground">
                          {{ t('forms.addNew.manualContact.marketingChannels.emailSecondary') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <p class="text-sm font-medium leading-5 text-muted-foreground">
                      {{ t('forms.addNew.manualContact.marketingChannels.mail') }}
                    </p>
                    <div class="flex flex-col gap-2">
                      <div class="flex items-start gap-2 text-left">
                        <Switch
                          v-model="privacyRow.marketingChannels.mailAddress"
                          size="sm"
                          :disabled="!channelAvailability.mailAddress"
                        />
                        <p class="text-sm font-medium leading-none text-foreground">
                          {{ t('forms.addNew.manualContact.marketingChannels.address') }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </CardContent>
    </transition>
  </Card>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, Plus, ChevronDown, Search } from 'lucide-vue-next'
import {
  Badge,
  Button,
  CardAction,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@motork/component-library/future/primitives'
import { FISCAL_ENTITY_COMPANY_A, FISCAL_ENTITY_COMPANY_B } from '@/constants/fiscalEntities'
import InternationalPhoneInput from '@/components/shared/InternationalPhoneInput.vue'
import SelectAccountBox from '@/components/addnew/SelectAccountBox.vue'
import MiniCalendarDateField from '@/components/shared/forms/MiniCalendarDateField.vue'
import { getTodayDateString } from '@/utils/formHelpers.js'

const props = defineProps({
  contactFormData: { type: Object, required: true },
  /** Validation errors (reactive) from `useAddFormValidation` for manual create */
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['request-close'])

const { t } = useI18n()

const data = props.contactFormData

const dateOfBirthMaxIso = computed(() => getTodayDateString())

const dealerChoice = computed({
  get: () => (data.companyIsDealer ? 'yes' : 'no'),
  set: (v) => {
    data.companyIsDealer = v === 'yes'
  }
})

function onLinkedAccountUpdate(acc) {
  data.linkedAccount = acc
  if (acc) {
    data.company = acc.companyName || acc.company || acc.name || ''
  } else {
    data.company = ''
  }
}

const contactPanelOpen = ref(true)
const moreDetailsOpen = ref(false)
const fiscalPopoverOpen = ref(false)

const fiscalEntityOptions = [
  { id: FISCAL_ENTITY_COMPANY_A, labelKey: 'forms.addNew.manualContact.entities.companyA' },
  { id: FISCAL_ENTITY_COMPANY_B, labelKey: 'forms.addNew.manualContact.entities.companyB' },
]

const activePrivacyEntityId = ref('')
const privacyRow = computed(() => (activePrivacyEntityId.value ? data.privacyConsents?.[activePrivacyEntityId.value] : null))

const hasPrimaryPhone = computed(() => !!(data.phone || '').trim())
const hasSecondaryPhone = computed(() => Array.isArray(data.secondaryPhones) && data.secondaryPhones.some((p) => (p || '').trim()))
const hasPrimaryEmail = computed(() => !!(data.email || '').trim())
const hasSecondaryEmail = computed(() => Array.isArray(data.secondaryEmails) && data.secondaryEmails.some((e) => (e || '').trim()))
const hasMailAddress = computed(() => !!(data.detailsAddress || '').trim())

const channelAvailability = computed(() => ({
  callPrimary: hasPrimaryPhone.value,
  callSecondary: hasSecondaryPhone.value,
  smsPrimary: hasPrimaryPhone.value,
  smsSecondary: hasSecondaryPhone.value,
  whatsappPrimary: hasPrimaryPhone.value,
  whatsappSecondary: hasSecondaryPhone.value,
  emailPrimary: hasPrimaryEmail.value,
  emailSecondary: hasSecondaryEmail.value,
  mailAddress: hasMailAddress.value,
}))

function clearMarketingChannels(row) {
  if (!row?.marketingChannels) return
  for (const key of Object.keys(row.marketingChannels)) {
    row.marketingChannels[key] = false
  }
}

watch(
  channelAvailability,
  (avail) => {
    const row = privacyRow.value
    if (!row?.marketingChannels) return
    for (const [k, isAvailable] of Object.entries(avail)) {
      if (!isAvailable) row.marketingChannels[k] = false
    }
  },
  { deep: true }
)

watch(
  () => privacyRow.value?.marketing,
  (isMarketing) => {
    if (isMarketing === false) clearMarketingChannels(privacyRow.value)
  }
)

const consentKeys = [
  { key: 'dataProcessing', labelKey: 'forms.addNew.manualContact.consents.dataProcessing', hintKey: null },
  { key: 'profiling', labelKey: 'forms.addNew.manualContact.consents.profiling', hintKey: null },
  { key: 'thirdParty', labelKey: 'forms.addNew.manualContact.consents.thirdParty', hintKey: null },
  { key: 'marketing', labelKey: 'forms.addNew.manualContact.consents.marketing', hintKey: null },
]

function defaultPrivacy() {
  return {
    dataProcessing: true,
    profiling: false,
    thirdParty: false,
    marketing: false,
    marketingChannels: {
      callPrimary: false,
      callSecondary: false,
      smsPrimary: false,
      smsSecondary: false,
      whatsappPrimary: false,
      whatsappSecondary: false,
      emailPrimary: false,
      emailSecondary: false,
      mailAddress: false,
    },
  }
}

function ensurePrivacyMap() {
  if (!data.privacyConsents || typeof data.privacyConsents !== 'object') {
    data.privacyConsents = {}
  }
  for (const key of Object.keys(data.privacyConsents)) {
    if (!data.fiscalEntityIds.includes(key)) {
      delete data.privacyConsents[key]
    }
  }
  for (const eid of data.fiscalEntityIds) {
    if (!data.privacyConsents[eid]) {
      data.privacyConsents[eid] = defaultPrivacy()
    } else if (!data.privacyConsents[eid].marketingChannels) {
      data.privacyConsents[eid].marketingChannels = defaultPrivacy().marketingChannels
    }
  }
}

function syncPrivacyForFiscal() {
  ensurePrivacyMap()
  if (activePrivacyEntityId.value && !data.fiscalEntityIds.includes(activePrivacyEntityId.value)) {
    activePrivacyEntityId.value = data.fiscalEntityIds[0] || ''
  } else if (!activePrivacyEntityId.value && data.fiscalEntityIds.length) {
    activePrivacyEntityId.value = data.fiscalEntityIds[0]
  }
}

function removeFiscalEntity(eid) {
  const ids = data.fiscalEntityIds || []
  if (ids.length <= 1) return
  data.fiscalEntityIds = ids.filter((x) => x !== eid)
  syncPrivacyForFiscal()
}

function toggleFiscalEntityOption(entId, checked) {
  const set = new Set(data.fiscalEntityIds || [])
  if (checked) {
    set.add(entId)
  } else if (set.size <= 1) {
    return
  } else {
    set.delete(entId)
  }
  data.fiscalEntityIds = fiscalEntityOptions.filter((o) => set.has(o.id)).map((o) => o.id)
  syncPrivacyForFiscal()
}

watch(
  () => data.fiscalEntityIds?.slice(),
  (ids) => {
    if (!ids?.length) {
      activePrivacyEntityId.value = ''
      return
    }
    ensurePrivacyMap()
    if (!ids.includes(activePrivacyEntityId.value)) {
      activePrivacyEntityId.value = ids[0]
    }
  },
  { deep: true, immediate: true }
)

function entityLabel(eid) {
  const f = fiscalEntityOptions.find((o) => o.id === eid)
  return f ? t(f.labelKey) : eid
}

function addSecondaryPhone() {
  if (!data.secondaryPhones) data.secondaryPhones = []
  data.secondaryPhones.push('')
}

function addSecondaryEmail() {
  if (!data.secondaryEmails) data.secondaryEmails = []
  data.secondaryEmails.push('')
}
</script>

<style scoped>
.mk-contact-expand-enter-active,
.mk-contact-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.mk-contact-expand-enter-from,
.mk-contact-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.mk-contact-expand-enter-to,
.mk-contact-expand-leave-from {
  max-height: 75rem;
  opacity: 1;
}
</style>
