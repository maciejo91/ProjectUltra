<template>
  <div>
    <div class="flex items-center justify-end gap-4">
      <button
        type="button"
        class="text-xs font-medium text-muted-foreground hover:text-foreground"
        @click="toggleAll"
      >
        {{ noneExpanded ? 'Expand all' : 'Collapse all' }}
      </button>
    </div>

    <div class="mt-4 space-y-2.5">
    <div ref="sectionEls.vehicleDetails">
      <CollapsibleSection
        title="Vehicle details"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.vehicleDetails"
        card-style
        uniform-header-height
        @toggle="toggleSection('vehicleDetails')"
      >
        <div class="space-y-2.5">
          <div
            v-if="showNetPrices"
            class="flex flex-wrap items-center gap-2.5"
          >
            <span class="min-w-0 flex-1 select-none text-xs leading-none text-muted-foreground invisible">
              Item description
            </span>
            <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">Net price</span>
            <span class="w-40 shrink-0 text-xs leading-none text-muted-foreground">VAT (%)</span>
            <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">Price VAT incl.</span>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg bg-muted px-2.5 py-1">
              <TruncatingTooltip :text="vehicleLine" wrapper-class="min-w-0 flex-1">
                <p class="truncate text-sm leading-normal text-muted-foreground">{{ vehicleLine }}</p>
              </TruncatingTooltip>
            </div>
            <template v-if="showNetPrices">
              <VehicleDetailAmountPill :amount="toNet(vehicleBaseTotal)" />
              <TruncatingTooltip :text="vatSelectLabel" wrapper-class="w-40 shrink-0 min-w-0">
                <VehicleDetailVatStub :label="vatSelectLabel" />
              </TruncatingTooltip>
              <VehicleDetailAmountPill :amount="Number(vehicleBaseTotal)" />
            </template>
            <VehicleDetailAmountPill v-else :amount="Number(vehicleBaseTotal)" />
          </div>

          <div
            v-if="colourLabel"
            class="flex flex-wrap items-center gap-2.5"
          >
            <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg bg-muted px-2.5 py-1">
              <TruncatingTooltip :text="`Colour: ${colourLabel}`" wrapper-class="min-w-0 flex-1">
                <p class="truncate text-sm leading-normal text-muted-foreground">
                  Colour: {{ colourLabel }}
                </p>
              </TruncatingTooltip>
            </div>
            <template v-if="showNetPrices">
              <VehicleDetailAmountPill
                v-if="colourPriceDelta > 0"
                :amount="toNet(colourPriceDelta)"
              />
              <div
                v-else
                class="flex h-8 w-32 shrink-0 items-center justify-end rounded-lg bg-muted px-2.5 py-1 text-sm text-muted-foreground"
              >
                —
              </div>
              <TruncatingTooltip :text="vatSelectLabel" wrapper-class="w-40 shrink-0 min-w-0">
                <VehicleDetailVatStub :label="vatSelectLabel" />
              </TruncatingTooltip>
              <VehicleDetailAmountPill v-if="colourPriceDelta > 0" :amount="colourPriceDelta" />
              <VehicleDetailAmountPill v-else :amount="0" />
            </template>
            <VehicleDetailAmountPill v-else-if="colourPriceDelta > 0" :amount="colourPriceDelta" />
            <VehicleDetailAmountPill v-else :amount="0" />
          </div>

          <div
            v-if="interiorColourLabel"
            class="flex flex-wrap items-center gap-2.5"
          >
            <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg bg-muted px-2.5 py-1">
              <TruncatingTooltip :text="`Interior: ${interiorColourLabel}`" wrapper-class="min-w-0 flex-1">
                <p class="truncate text-sm leading-normal text-muted-foreground">
                  Interior: {{ interiorColourLabel }}
                </p>
              </TruncatingTooltip>
            </div>
            <template v-if="showNetPrices">
              <VehicleDetailAmountPill
                v-if="interiorColourPriceDelta > 0"
                :amount="toNet(interiorColourPriceDelta)"
              />
              <div
                v-else
                class="flex h-8 w-32 shrink-0 items-center justify-end rounded-lg bg-muted px-2.5 py-1 text-sm text-muted-foreground"
              >
                —
              </div>
              <TruncatingTooltip :text="vatSelectLabel" wrapper-class="w-40 shrink-0 min-w-0">
                <VehicleDetailVatStub :label="vatSelectLabel" />
              </TruncatingTooltip>
              <VehicleDetailAmountPill v-if="interiorColourPriceDelta > 0" :amount="interiorColourPriceDelta" />
              <VehicleDetailAmountPill v-else :amount="0" />
            </template>
            <VehicleDetailAmountPill v-else-if="interiorColourPriceDelta > 0" :amount="interiorColourPriceDelta" />
            <VehicleDetailAmountPill v-else :amount="0" />
          </div>

          <div
            v-if="selectedEquipment.length"
            class="space-y-2.5"
          >
            <p class="text-xs font-medium leading-none text-muted-foreground">
              Selected equipment
            </p>
            <div
              v-for="item in selectedEquipment"
              :key="item.id"
              class="flex flex-wrap items-center gap-2.5"
            >
              <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg bg-muted px-2.5 py-1">
                <TruncatingTooltip :text="item.name" wrapper-class="min-w-0 flex-1">
                  <p class="truncate text-sm leading-normal text-muted-foreground">{{ item.name }}</p>
                </TruncatingTooltip>
              </div>
              <template v-if="showNetPrices">
                <VehicleDetailAmountPill :amount="toNet(item.price)" />
                <TruncatingTooltip :text="vatSelectLabel" wrapper-class="w-40 shrink-0 min-w-0">
                  <VehicleDetailVatStub :label="vatSelectLabel" />
                </TruncatingTooltip>
                <VehicleDetailAmountPill :amount="Number(item.price)" />
              </template>
              <VehicleDetailAmountPill v-else :amount="Number(item.price)" />
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.promoCampaigns">
      <CollapsibleSection
        title="Promo and Campaigns"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.promoCampaigns"
        card-style
        uniform-header-height
        @toggle="toggleSection('promoCampaigns')"
      >
        <div class="space-y-4">
          <section v-if="promos.length" class="space-y-2.5">
            <p class="pt-1 text-xs font-normal text-muted-foreground">OEM promo</p>
            <div class="space-y-3">
              <PromoCard
                v-for="promo in promos"
                :key="promo.id"
                kind="oem"
                :checkbox-id="`promo-${promo.id}`"
                :selected="!!promoSelection[promo.id]"
                :disabled="disabledPromoIds.includes(promo.id)"
                :label="promo.label"
                :description="promo.description"
                :expires-at="promo.expiresAt || ''"
                :show-net-prices="showNetPrices"
                :vat-options="vatOptions"
                :modal-vat-rate-percent="Number(vatRatePercent)"
                :oem-percent="oemPercentForPromo(promo)"
                :oem-amount-gross="oemAmountGrossForPromo(promo)"
                :oem-amount-net="oemAmountNetForPromo(promo)"
                @toggle="(v) => emit('toggle-promo', promo.id, v)"
              />
            </div>
          </section>

          <section v-if="userCampaigns.length" class="space-y-2.5">
            <p class="text-xs font-medium text-muted-foreground">Dealer campaigns</p>
            <div class="space-y-3">
              <PromoCard
                v-for="c in userCampaigns"
                :key="c.id"
                kind="dealer"
                :checkbox-id="`campaign-${c.id}`"
                :selected="!!c.active"
                :label="c.description || 'Dealer campaign'"
                :description="c.description || ''"
                :expires-at="c.expiresAt || ''"
                :campaign="c"
                :show-net-prices="showNetPrices"
                :vat-options="vatOptions"
                :modal-vat-rate-percent="Number(vatRatePercent)"
                :paired-discount-vehicle-base="campaignPairedVehicleListBase"
                editable
                removable
                @toggle="(v) => emit('toggle-campaign-active', c.id, v)"
                @update:description="(t) => emit('update-campaign', c.id, { description: t })"
                @update:percent="(p) => emit('update-campaign', c.id, { percent: p })"
                @update:amount="(a) => emit('update-campaign', c.id, { amount: a })"
                @update:vat-rate-percent="(rate) => emit('update-campaign-vat', c.id, rate)"
                @remove="emit('remove-campaign', c.id)"
              />
            </div>
          </section>

          <div class="flex w-full flex-wrap items-center justify-start gap-2 py-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="rounded-md"
              @click="handleAddCampaign"
            >
              <Plus class="size-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.discounts">
      <CollapsibleSection
        v-if="userDiscounts.length === 0"
        title="Discounts"
        :title-class="collapsibleSectionTitleClass"
        static-header
        :show-chevron="false"
        card-style
        uniform-header-height
      >
        <template #afterTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="ml-auto shrink-0 rounded-md font-medium"
            @click.stop="handleAddDiscount"
          >
            <Plus class="size-4 mr-1.5" />
            Add
          </Button>
        </template>
      </CollapsibleSection>

      <CollapsibleSection
        v-else
        title="Discounts"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.discounts"
        card-style
        uniform-header-height
        @toggle="toggleSection('discounts')"
      >
        <div class="flex flex-col gap-4">
          <div v-if="showNetPrices" class="space-y-2.5">
            <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5">
              <span class="min-w-0 flex-1 select-none text-xs leading-none text-muted-foreground invisible">
                Item description
              </span>
              <div class="flex shrink-0 flex-nowrap items-center gap-2.5">
                <span class="w-64 shrink-0 text-xs leading-none text-muted-foreground">Net Discount</span>
                <span class="w-40 shrink-0 text-xs leading-none text-muted-foreground">VAT (%)</span>
                <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">
                  Discount VAT incl.
                </span>
                <span class="w-8 shrink-0" aria-hidden="true" />
              </div>
            </div>

            <div
              v-for="d in userDiscounts"
              :key="d.id"
              class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5"
            >
              <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg border border-input bg-background px-2.5 py-1">
                <Input
                  type="text"
                  :model-value="d.description || ''"
                  placeholder="Item description"
                  class="h-7 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-foreground shadow-none focus-visible:ring-0"
                  @update:model-value="(v) => emit('update-discount', d.id, { description: String(v ?? '') })"
                />
              </div>
              <div class="flex shrink-0 flex-nowrap items-center gap-2.5">
                <div class="flex h-8 shrink-0 flex-nowrap overflow-hidden rounded-lg border border-input">
                  <div class="relative w-24 min-w-0 shrink-0 border-r border-input bg-background px-2.5 pl-7">
                    <Input
                      type="text"
                      inputmode="decimal"
                      :model-value="discountPercentInputValue(d)"
                      class="h-7 min-w-0 border-0 bg-transparent p-0 text-right text-sm text-foreground shadow-none focus-visible:ring-0"
                      @update:model-value="(v) => onDiscountPercentChange(d.id, v)"
                    />
                    <span
                      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                      aria-hidden="true"
                    >
                      %
                    </span>
                  </div>
                  <div class="relative w-40 min-w-0 shrink-0 bg-background px-2.5 pl-7">
                    <Input
                      type="text"
                      inputmode="decimal"
                      :model-value="discountAmountInputValue(d)"
                      class="h-7 min-w-0 border-0 bg-transparent p-0 text-right text-sm text-foreground shadow-none focus-visible:ring-0"
                      @update:model-value="(v) => onDiscountAmountChange(d.id, v)"
                    />
                    <span
                      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                      aria-hidden="true"
                    >
                      €
                    </span>
                  </div>
                </div>
                <TruncatingCatalogSelect
                  select-class="w-40 shrink-0"
                  :model-value="String(discountRowVatRate(d))"
                  :display-label="discountRowVatDisplayLabel(d)"
                  :options="discountVatSelectOptions"
                  @update:model-value="(v) => emit('update-discount-vat', d.id, Number(v))"
                />
                <QuotationReadOnlyAmount width-class="w-32 shrink-0" :amount="discountGrossAmount(d)" />
                <div class="flex w-8 shrink-0 items-center justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-8 shrink-0 rounded-md"
                    @click="emit('remove-discount', d.id)"
                  >
                    <Trash2 class="size-4" />
                    <span class="sr-only">Remove discount</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col gap-2.5">
            <div
              v-for="d in userDiscounts"
              :key="d.id"
              class="flex flex-wrap items-center gap-2.5"
            >
              <Input
                type="text"
                :model-value="d.description || ''"
                placeholder="Item description"
                class="h-8 min-w-0 flex-1 bg-background border-border"
                @update:model-value="(v) => emit('update-discount', d.id, { description: String(v ?? '') })"
              />
              <div class="flex shrink-0 items-stretch">
                <div class="relative flex h-8 w-24 shrink-0 items-center rounded-l-lg border border-border bg-background">
                  <span
                    class="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground"
                    aria-hidden="true"
                  >
                    %
                  </span>
                  <Input
                    type="text"
                    inputmode="decimal"
                    :model-value="discountPercentInputValue(d)"
                    class="h-8 w-full min-w-0 border-0 bg-transparent pr-2.5 pl-7 text-right text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    @update:model-value="(v) => onDiscountPercentChange(d.id, v)"
                  />
                </div>
                <div class="relative -ml-px flex h-8 w-40 shrink-0 items-center rounded-r-lg border border-border bg-background">
                  <span
                    class="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground"
                    aria-hidden="true"
                  >
                    €
                  </span>
                  <Input
                    type="text"
                    inputmode="decimal"
                    :model-value="discountAmountInputValue(d)"
                    class="h-8 w-full min-w-0 border-0 bg-transparent pr-2.5 pl-7 text-right text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    @update:model-value="(v) => onDiscountAmountChange(d.id, v)"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="size-8 shrink-0 rounded-md"
                @click="emit('remove-discount', d.id)"
              >
                <Trash2 class="size-4" />
                <span class="sr-only">Remove discount</span>
              </Button>
            </div>
          </div>

          <div
            v-if="userDiscounts.length > 0"
            class="flex gap-2 py-1"
          >
            <Info class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p class="min-w-0 flex-1 text-xs leading-normal text-muted-foreground">
              The percentage discount is applied to the vehicle's total list price (excluding accessories, extra services, taxes, and promotions).
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="rounded-md font-medium"
              @click="handleAddDiscount"
            >
              <Plus class="size-4 mr-1.5" />
              Add
            </Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.accessories">
      <CollapsibleSection
        v-if="!hasUserAccessoryLines"
        title="Accessories and services"
        :title-class="collapsibleSectionTitleClass"
        static-header
        :show-chevron="false"
        card-style
        uniform-header-height
      >
        <template #afterTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="ml-auto shrink-0 rounded-md font-medium"
            @click.stop="handleAddAccessoryLine"
          >
            <Plus class="size-4 mr-1.5" />
            Add
          </Button>
        </template>
      </CollapsibleSection>

      <CollapsibleSection
        v-else
        title="Accessories and services"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.accessories"
        card-style
        uniform-header-height
        @toggle="toggleSection('accessories')"
      >
        <div class="flex flex-col gap-4">
          <div v-if="showNetPrices" class="space-y-2.5">
            <div class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5">
              <span class="min-w-0 flex-1 select-none text-xs leading-none text-muted-foreground invisible">
                Item description
              </span>
              <div class="flex shrink-0 flex-nowrap items-center gap-2.5">
                <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">Net price</span>
                <span class="w-40 shrink-0 text-xs leading-none text-muted-foreground">VAT (%)</span>
                <span class="w-32 shrink-0 text-xs leading-none text-muted-foreground">Price VAT incl.</span>
                <span class="w-8 shrink-0" aria-hidden="true" />
              </div>
            </div>

            <div
              v-for="row in userAccessoryLines"
              :key="row.id"
              class="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5"
            >
              <div class="flex h-8 min-w-0 flex-1 items-center rounded-lg border border-input bg-background px-2.5 py-1">
                <Input
                  type="text"
                  :model-value="row.description || ''"
                  placeholder="Item description"
                  class="h-7 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-foreground shadow-none focus-visible:ring-0"
                  @update:model-value="(v) => emit('update-accessory-line', row.id, { description: String(v ?? '') })"
                />
              </div>
              <div class="flex shrink-0 flex-nowrap items-center gap-2.5">
                <QuotationEditableAmount
                  width-class="w-32 shrink-0"
                  :model-value="accessoryNetInputString(row)"
                  @update:model-value="(v) => onAccessoryNetAmountChange(row.id, v)"
                />
                <TruncatingCatalogSelect
                  select-class="w-40 shrink-0"
                  :model-value="String(accessoryRowVatRate(row))"
                  :display-label="accessoryRowVatDisplayLabel(row)"
                  :options="discountVatSelectOptions"
                  @update:model-value="(v) => emit('update-accessory-line', row.id, { vatRatePercent: Number(v) })"
                />
                <QuotationEditableAmount
                  width-class="w-32 shrink-0"
                  :model-value="accessoryGrossInputString(row)"
                  @update:model-value="(v) => onAccessoryGrossAmountChange(row.id, v)"
                />
                <div class="flex w-8 shrink-0 items-center justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="size-8 shrink-0 rounded-md"
                    @click="emit('remove-accessory-line', row.id)"
                  >
                    <Trash2 class="size-4" />
                    <span class="sr-only">Remove line</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col gap-2.5">
            <div
              v-for="row in userAccessoryLines"
              :key="row.id"
              class="flex flex-wrap items-center gap-2.5"
            >
              <Input
                type="text"
                :model-value="row.description || ''"
                placeholder="Item description"
                class="h-8 min-w-0 flex-1 bg-background border-border"
                @update:model-value="(v) => emit('update-accessory-line', row.id, { description: String(v ?? '') })"
              />
              <div class="relative flex h-8 w-32 shrink-0 items-center rounded-lg border border-border bg-background">
                <span
                  class="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  €
                </span>
                <Input
                  type="text"
                  inputmode="decimal"
                  :model-value="accessoryPriceInputValue(row)"
                  class="h-8 w-full min-w-0 border-0 bg-transparent pr-2.5 pl-7 text-right text-sm text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  @update:model-value="(v) => onAccessoryPriceChange(row.id, v)"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="size-8 shrink-0 rounded-md"
                @click="emit('remove-accessory-line', row.id)"
              >
                <Trash2 class="size-4" />
                <span class="sr-only">Remove line</span>
              </Button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              class="h-9 shrink-0 rounded-md px-4 font-medium"
              @click="handleAddAccessoryLine"
            >
              <Plus class="size-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.taxes">
      <CollapsibleSection
        title="Taxes and extra-costs"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.taxes"
        card-style
        uniform-header-height
        @toggle="toggleSection('taxes')"
      >
      <div class="space-y-2.5">
        <QuotationTaxesTable
          :lines="taxExtraCostLines"
          :show-net-prices="showNetPrices"
          :vat-amount="vatAmount"
          :modal-vat-rate-percent="vatRatePercent"
          :vat-options="vatOptions"
          @add-line="emit('add-tax-line')"
          @remove-line="(id) => emit('remove-tax-line', id)"
          @update-line="(id, patch) => emit('update-tax-line', id, patch)"
        />
      </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.tradeIn">
      <CollapsibleSection
        v-if="!hasUserTradeInLines"
        title="Trade-in"
        :title-class="collapsibleSectionTitleClass"
        static-header
        :show-chevron="false"
        card-style
        uniform-header-height
      >
        <template #afterTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="ml-auto shrink-0 rounded-md font-medium"
            @click.stop="openTradeInModalAdd"
          >
            <Plus class="size-4 mr-1.5" />
            Add
          </Button>
        </template>
      </CollapsibleSection>

      <CollapsibleSection
        v-else
        title="Trade-in"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.tradeIn"
        card-style
        uniform-header-height
        @toggle="toggleSection('tradeIn')"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-4">
            <div
              v-for="row in userTradeInLines"
              :key="row.id"
              class="flex items-center justify-start gap-2"
            >
              <div class="min-w-0 flex-1 rounded-lg border border-border bg-background p-4">
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
                  <div class="min-w-0 flex-1 space-y-3">
                    <div
                      class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2 gap-y-0"
                    >
                      <Car
                        class="row-start-1 col-start-1 size-6 shrink-0 text-sidebar-foreground mt-0.5"
                        aria-hidden="true"
                      />
                      <TruncatingTooltip
                        :text="tradeInDisplayTitle(row)"
                        wrapper-class="row-start-1 col-start-2 min-w-0"
                      >
                        <p class="truncate text-base font-medium text-foreground">
                          {{ tradeInDisplayTitle(row) || '—' }}
                        </p>
                      </TruncatingTooltip>
                      <p
                        v-if="tradeInDisplayVersion(row)"
                        class="col-span-2 row-start-2 min-w-0 truncate text-sm text-muted-foreground"
                      >
                        {{ tradeInDisplayVersion(row) }}
                      </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-muted-foreground">
                      <div class="flex min-w-0 items-start justify-start gap-1.5">
                        <Calendar
                          class="size-4 shrink-0 text-sidebar-foreground"
                          aria-hidden="true"
                        />
                        <span class="min-w-0 truncate text-card-foreground">{{
                          row.firstRegistration || '—'
                        }}</span>
                      </div>
                      <div class="flex min-w-0 items-start justify-start gap-1.5">
                        <Gauge
                          class="size-4 shrink-0 text-sidebar-foreground"
                          aria-hidden="true"
                        />
                        <span class="min-w-0 truncate text-card-foreground">{{
                          row.mileageLabel || '—'
                        }}</span>
                      </div>
                      <div class="flex min-w-0 max-w-full items-center justify-start">
                        <LicensePlateBadge
                          :plate="row.licensePlate || ''"
                          uppercase
                          truncate
                          placeholder="—"
                        />
                      </div>
                    </div>
                  </div>
                  <div class="flex shrink-0 flex-col gap-0 md:items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="size-8 shrink-0 self-end rounded-md"
                      @click="openTradeInModalEdit(row)"
                    >
                      <PenLine class="size-4" />
                      <span class="sr-only">Edit trade-in details</span>
                    </Button>
                    <div class="space-y-1">
                      <p class="text-xs leading-none text-muted-foreground">Evaluation</p>
                      <div class="flex h-8 w-full min-w-0 items-center justify-end rounded-lg border border-border bg-muted px-2.5 sm:w-40">
                        <span class="truncate text-right text-sm text-muted-foreground">
                          € {{ formatTradeInMoney(row.valuation) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="size-8 shrink-0 rounded-md"
                @click="emit('remove-trade-in-line', row.id)"
              >
                <Trash2 class="size-4" />
                <span class="sr-only">Remove trade-in</span>
              </Button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              class="h-9 shrink-0 rounded-md px-4 font-medium"
              @click="openTradeInModalAdd"
            >
              <Plus class="size-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </CollapsibleSection>
    </div>

    <div ref="sectionEls.purchaseMethod">
      <CollapsibleSection
        v-if="userPurchaseMethods.length === 0"
        title="Purchase methods"
        :title-class="collapsibleSectionTitleClass"
        static-header
        :show-chevron="false"
        card-style
        uniform-header-height
      >
        <template #afterTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="ml-auto shrink-0 rounded-md font-medium"
            @click.stop="openPurchaseMethodAdd"
          >
            <Plus class="size-4 mr-1.5" />
            Add
          </Button>
        </template>
      </CollapsibleSection>

      <CollapsibleSection
        v-else
        title="Purchase methods"
        :title-class="collapsibleSectionTitleClass"
        :is-expanded="open.purchaseMethod"
        card-style
        uniform-header-height
        @toggle="toggleSection('purchaseMethod')"
      >
        <div class="flex flex-col gap-3">
          <PurchaseMethodQuotationCard
            v-for="row in userPurchaseMethods"
            :key="row.id"
            :method="row"
            :selected="selectedPurchaseMethodIdSet.has(row.id)"
            @update:selected="(v) => emit('toggle-purchase-method-selected', row.id, v)"
            @edit="openPurchaseMethodEdit(row)"
            @delete="requestDeletePurchaseMethod(row.id)"
          />
        </div>
        <div class="flex flex-wrap gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            class="h-9 shrink-0 rounded-md px-4 font-medium"
            @click="openPurchaseMethodAdd"
          >
            <Plus class="size-4 mr-2" />
            Add
          </Button>
        </div>
      </CollapsibleSection>
    </div>

    <div class="mb-0 overflow-visible rounded-lg border-0 bg-transparent p-0">
      <Field class="pt-4">
        <FieldLabel class="text-sm font-medium text-foreground" for="quotation-additional-notes">
          {{ t('forms.addNew.leadDetails.vehicle.quotation.additionalNotes') }}
        </FieldLabel>
        <Textarea
          id="quotation-additional-notes"
          v-model="quotationNotesModel"
          rows="4"
          class="w-full resize-none rounded-lg border border-border bg-background text-sm text-foreground"
          :placeholder="t('forms.addNew.leadDetails.vehicle.quotation.additionalNotesPlaceholder')"
        />
      </Field>
    </div>

    <div class="mb-0 overflow-hidden rounded-lg bg-transparent p-0">
      <div class="mt-6 space-y-2">
        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Label
            class="shrink-0 text-sm font-medium text-foreground sm:max-w-md"
            for="quotation-offer-valid-until"
          >
            {{ t('forms.addNew.leadDetails.vehicle.quotation.offerValidUntil') }}
          </Label>
          <div class="relative flex min-w-0 w-fit">
            <MiniCalendarDateField
              id="quotation-offer-valid-until"
              inline-width
              :model-value="quotationOfferValidUntil"
              :aria-label="t('forms.addNew.leadDetails.vehicle.quotation.offerValidUntil')"
              group-class="rounded-md"
              input-class="min-w-0"
              popover-content-class="z-[110]"
              @update:model-value="(v) => emit('update:quotationOfferValidUntil', String(v ?? ''))"
            />
          </div>
        </div>
        <p class="text-xs leading-snug text-muted-foreground">
          {{ t('forms.addNew.leadDetails.vehicle.quotation.offerValidityDisclaimer') }}
        </p>
      </div>
    </div>
    </div>

    <TradeInQuotationModal
      :open="tradeInModalOpen"
      :mode="tradeInModalMode"
      :initial="tradeInModalInitial"
      @update:open="(v) => (tradeInModalOpen = v)"
      @save="onTradeInModalSave"
    />

    <PurchaseMethodConfiguratorModal
      :open="purchaseMethodModalOpen"
      :mode="purchaseMethodModalMode"
      :editing-id="purchaseMethodEditId"
      :initial="purchaseMethodModalInitial"
      :default-vehicle-price="vehicleBaseTotal"
      @update:open="(v) => (purchaseMethodModalOpen = v)"
      @save="onPurchaseMethodModalSave"
    />

    <Dialog :open="purchaseMethodDeleteId !== ''" @update:open="onPurchaseMethodDeleteOpenChange">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
        <DialogContent class="w-full sm:max-w-md max-h-[calc(100vh-4rem)] flex flex-col" :show-close-button="true">
          <DialogHeader class="shrink-0">
            <DialogTitle>Remove purchase method?</DialogTitle>
          </DialogHeader>
          <div class="flex-1 overflow-y-auto py-4 w-full">
            <p class="text-sm text-muted-foreground">
              This removes the purchase method from the quotation. You cannot undo this action.
            </p>
          </div>
          <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3">
            <Button variant="outline" class="rounded-sm w-full sm:w-auto" type="button" @click="purchaseMethodDeleteId = ''">
              Cancel
            </Button>
            <Button variant="destructive" class="rounded-sm w-full sm:w-auto" type="button" @click="confirmDeletePurchaseMethod">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick, watch } from 'vue'
import { Info, Plus, Trash2, Car, Calendar, Gauge, PenLine } from 'lucide-vue-next'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Field,
  FieldLabel,
  Input,
  Label,
  Textarea,
} from '@motork/component-library/future/primitives'
import { useI18n } from 'vue-i18n'
import MiniCalendarDateField from '@/components/shared/forms/MiniCalendarDateField.vue'
import CollapsibleSection from '@/components/shared/CollapsibleSection.vue'
import TradeInQuotationModal from '@/components/addnew/configurator/TradeInQuotationModal.vue'
import PurchaseMethodConfiguratorModal from '@/components/addnew/configurator/PurchaseMethodConfiguratorModal.vue'
import PurchaseMethodQuotationCard from '@/components/addnew/configurator/PurchaseMethodQuotationCard.vue'
import VehicleDetailAmountPill from '@/components/addnew/configurator/VehicleDetailAmountPill.vue'
import VehicleDetailVatStub from '@/components/addnew/configurator/VehicleDetailVatStub.vue'
import PromoCard from '@/components/addnew/configurator/PromoCard.vue'
import QuotationEditableAmount from '@/components/addnew/configurator/QuotationEditableAmount.vue'
import QuotationReadOnlyAmount from '@/components/addnew/configurator/QuotationReadOnlyAmount.vue'
import QuotationTaxesTable from '@/components/addnew/configurator/QuotationTaxesTable.vue'
import LicensePlateBadge from '@/components/shared/LicensePlateBadge.vue'
import TruncatingCatalogSelect from '@/components/shared/TruncatingCatalogSelect.vue'
import TruncatingTooltip from '@/components/shared/TruncatingTooltip.vue'

const props = defineProps({
  vehicleLine: { type: String, default: '' },
  /** Configured vehicle list price, always gross (catalog); net column uses toNet(). */
  vehicleBaseTotal: { type: Number, default: 0 },
  colourLabel: { type: String, default: '' },
  colourPriceDelta: { type: Number, default: 0 },
  interiorColourLabel: { type: String, default: '' },
  interiorColourPriceDelta: { type: Number, default: 0 },
  selectedEquipment: { type: Array, default: () => [] },
  showNetPrices: { type: Boolean, default: false },
  vatRatePercent: { type: Number, default: 0 },
  /** Net or gross discount base: vehicle + factory equipment (same as alignDiscount*; excl. promos, accessories, taxes). */
  discountPairingBase: { type: Number, default: 0 },
  promos: { type: Array, required: true },
  promoSelection: { type: Object, required: true },
  disabledPromoIds: { type: Array, default: () => [] },
  userCampaigns: { type: Array, default: () => [] },
  vatOptions: { type: Array, default: () => [] },
  userDiscounts: { type: Array, default: () => [] },
  userAccessoryLines: { type: Array, default: () => [] },
  userTradeInLines: { type: Array, default: () => [] },
  userPurchaseMethods: { type: Array, default: () => [] },
  selectedPurchaseMethodIds: { type: Array, default: () => [] },
  taxExtraCostLines: { type: Array, required: true },
  vatAmount: { type: Number, default: 0 },
  quotationNotes: { type: String, default: '' },
  quotationOfferValidUntil: { type: String, default: '' },
})

const emit = defineEmits([
  'toggle-promo',
  'add-discount',
  'update-discount',
  'update-discount-vat',
  'remove-discount',
  'add-accessory-line',
  'update-accessory-line',
  'remove-accessory-line',
  'add-trade-in-line',
  'update-trade-in-line',
  'remove-trade-in-line',
  'add-campaign',
  'update-campaign',
  'update-campaign-vat',
  'remove-campaign',
  'toggle-campaign-active',
  'add-purchase-method',
  'replace-purchase-method',
  'remove-purchase-method',
  'toggle-purchase-method-selected',
  'add-tax-line',
  'remove-tax-line',
  'update-tax-line',
  'update:quotationNotes',
  'update:quotationOfferValidUntil',
])

const { t } = useI18n()

const quotationNotesModel = computed({
  get: () => props.quotationNotes,
  set: (v) => emit('update:quotationNotes', String(v ?? '')),
})

const collapsibleSectionTitleClass = 'text-base font-semibold'

const vatSelectLabel = computed(() => {
  const p = Number(props.vatRatePercent)
  if (!Number.isFinite(p) || p <= 0) return '0% VAT'
  const label = Number.isInteger(p) ? String(p) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `${label}% VAT`
})

/** Full vehicle list base for dealer campaign %/amount pairing (matches composable alignCampaignFrom*). */
const campaignPairedVehicleListBase = computed(() => {
  const g = Number(props.vehicleBaseTotal)
  if (!Number.isFinite(g) || g <= 0) return 0
  if (props.showNetPrices) return toNet(g)
  return g
})

const discountVatSelectOptions = computed(() =>
  props.vatOptions.map((o) => ({
    value: String(o?.rate ?? ''),
    label: String(o?.label ?? ''),
  })),
)

function discountRowVatRate(d) {
  const row = Number(d?.vatRatePercent)
  if (Number.isFinite(row) && row >= 0) return row
  return Number(props.vatRatePercent) || 0
}

function discountRowVatDisplayLabel(d) {
  const rate = discountRowVatRate(d)
  const opt = props.vatOptions.find((o) => Number(o?.rate) === Number(rate))
  if (opt?.label) return String(opt.label)
  const p = rate
  if (!Number.isFinite(p) || p <= 0) return '0% VAT'
  const label = Number.isInteger(p) ? String(p) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `${label}% VAT`
}

function discountGrossAmount(d) {
  return Number(d?.grossAmount ?? d?.amount ?? 0)
}

const hasUserAccessoryLines = computed(() => props.userAccessoryLines.length > 0)

watch(hasUserAccessoryLines, (next, prev) => {
  if (!next) open.accessories = false
  else if (next && !prev) open.accessories = true
})

const hasUserTradeInLines = computed(() => props.userTradeInLines.length > 0)

const tradeInModalOpen = ref(false)
const tradeInModalMode = ref('add')
const tradeInEditId = ref(null)
const tradeInModalInitial = ref({})

watch(hasUserTradeInLines, (next, prev) => {
  if (!next) open.tradeIn = false
  else if (next && !prev) open.tradeIn = true
})

const hasUserPurchaseMethods = computed(() => props.userPurchaseMethods.length > 0)

watch(hasUserPurchaseMethods, (next, prev) => {
  if (!next) open.purchaseMethod = false
  else if (next && !prev) open.purchaseMethod = true
})

const selectedPurchaseMethodIdSet = computed(
  () => new Set((props.selectedPurchaseMethodIds || []).map(String)),
)

const purchaseMethodModalOpen = ref(false)
const purchaseMethodModalMode = ref('add')
const purchaseMethodEditId = ref('')
const purchaseMethodModalInitial = ref({})
const purchaseMethodDeleteId = ref('')

function openPurchaseMethodAdd() {
  purchaseMethodModalMode.value = 'add'
  purchaseMethodEditId.value = ''
  purchaseMethodModalInitial.value = {}
  purchaseMethodModalOpen.value = true
}

function openPurchaseMethodEdit(row) {
  purchaseMethodModalMode.value = 'edit'
  purchaseMethodEditId.value = String(row?.id || '')
  purchaseMethodModalInitial.value = { ...row }
  purchaseMethodModalOpen.value = true
}

function onPurchaseMethodModalSave(row) {
  if (purchaseMethodModalMode.value === 'edit') {
    emit('replace-purchase-method', row)
  } else {
    emit('add-purchase-method', row)
  }
}

function requestDeletePurchaseMethod(id) {
  purchaseMethodDeleteId.value = String(id || '')
}

function onPurchaseMethodDeleteOpenChange(isOpen) {
  if (!isOpen) purchaseMethodDeleteId.value = ''
}

function confirmDeletePurchaseMethod() {
  const id = purchaseMethodDeleteId.value
  if (id) emit('remove-purchase-method', id)
  purchaseMethodDeleteId.value = ''
}

function addPurchaseMethodFromSearch() {
  openPurchaseMethodAdd()
  openSection('purchaseMethod')
}

const sectionKeys = [
  'vehicleDetails',
  'promoCampaigns',
  'discounts',
  'accessories',
  'taxes',
  'tradeIn',
  'purchaseMethod',
]

const sectionEls = {
  vehicleDetails: ref(null),
  promoCampaigns: ref(null),
  discounts: ref(null),
  accessories: ref(null),
  taxes: ref(null),
  tradeIn: ref(null),
  purchaseMethod: ref(null),
}

const open = reactive({
  vehicleDetails: true,
  promoCampaigns: false,
  discounts: false,
  accessories: false,
  taxes: false,
  tradeIn: false,
  purchaseMethod: false,
})

function toggleSection(key) {
  open[key] = !open[key]
}

const noneExpanded = computed(() => sectionKeys.every((key) => open[key] === false))

function toggleAll() {
  const next = noneExpanded.value
  for (const key of sectionKeys) {
    open[key] = next
  }
}

async function openSection(key) {
  if (!key || !(key in open)) return
  open[key] = true
  await nextTick()
  sectionEls[key]?.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
}

function addDiscountFromSearch(payload) {
  emit('add-discount', {
    description: String(payload?.description || '').trim() || 'Discount',
    percent: Number(payload?.percent) || 0,
    amount: Number(payload?.amount) || 0,
  })
  openSection('discounts')
}

function addCampaignFromSearch(payload) {
  emit('add-campaign', {
    description: String(payload?.description || '').trim() || 'Campaign',
    percent: Number(payload?.percent) || 0,
    amount: Number(payload?.amount) || 0,
  })
  openSection('promoCampaigns')
}

function addAccessoryFromSearch(payload) {
  emit('add-accessory-line', {
    description: String(payload?.description || '').trim(),
    price: Math.max(0, Number(payload?.price) || 0),
  })
  openSection('accessories')
}

function handleAddAccessoryLine() {
  emit('add-accessory-line', { description: '', price: 0 })
  open.accessories = true
}

function addTradeInFromSearch(payload) {
  tradeInModalMode.value = 'add'
  tradeInEditId.value = null
  tradeInModalInitial.value = { ...(payload && typeof payload === 'object' ? payload : {}) }
  tradeInModalOpen.value = true
  openSection('tradeIn')
}

function openTradeInModalAdd() {
  tradeInModalMode.value = 'add'
  tradeInEditId.value = null
  tradeInModalInitial.value = {}
  tradeInModalOpen.value = true
}

function openTradeInModalEdit(row) {
  tradeInModalMode.value = 'edit'
  tradeInEditId.value = row?.id || null
  tradeInModalInitial.value = row ? { ...row } : {}
  tradeInModalOpen.value = true
}

function onTradeInModalSave(payload) {
  if (tradeInModalMode.value === 'edit' && tradeInEditId.value) {
    emit('update-trade-in-line', tradeInEditId.value, payload)
  } else {
    emit('add-trade-in-line', payload)
  }
}

function tradeInDisplayTitle(row) {
  const t = String(row?.title || '').trim()
  if (t) return t
  const b = String(row?.brand || '').trim()
  const m = String(row?.model || '').trim()
  if (b && m) return `${b} ${m}`.trim()
  if (b) return b
  if (m) return m
  return ''
}

function tradeInDisplayVersion(row) {
  return String(row?.version || row?.trimLine || '').trim()
}

function formatTradeInMoney(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return '—'
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function accessoryPriceInputValue(row) {
  const n = displayValue(Number(row?.price || 0))
  if (!Number.isFinite(n)) return '0'
  if (n === 0) return '0'
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function accessoryRowVatRate(row) {
  const r = Number(row?.vatRatePercent)
  if (Number.isFinite(r) && r >= 0) return r
  return Number(props.vatRatePercent) || 0
}

function accessoryRowVatDisplayLabel(row) {
  const rate = accessoryRowVatRate(row)
  const opt = props.vatOptions.find((o) => Number(o?.rate) === Number(rate))
  if (opt?.label) return String(opt.label)
  const p = rate
  if (!Number.isFinite(p) || p <= 0) return '0% VAT'
  const label = Number.isInteger(p) ? String(p) : p.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return `${label}% VAT`
}

function accessoryGrossAmount(row) {
  return Math.max(0, Number(row?.price || 0))
}

function accessoryGrossInputString(row) {
  const gross = accessoryGrossAmount(row)
  const n = gross
  return Number.isFinite(n) && n !== 0 ? String(n) : ''
}

function accessoryNetInputString(row) {
  const gross = accessoryGrossAmount(row)
  const r = accessoryRowVatRate(row) / 100
  const net = r > 0 ? gross / (1 + r) : gross
  const n = net
  return Number.isFinite(n) && n !== 0 ? String(n) : ''
}

function onAccessoryNetAmountChange(id, raw) {
  const row = props.userAccessoryLines.find((r) => r.id === id)
  const n = parseDecimalInput(raw)
  if (!Number.isFinite(n) || n < 0) {
    emit('update-accessory-line', id, { price: 0 })
    return
  }
  const rate = accessoryRowVatRate(row || {}) / 100
  const gross = rate > 0 ? n * (1 + rate) : n
  emit('update-accessory-line', id, { price: gross })
}

function onAccessoryGrossAmountChange(id, raw) {
  const n = parseDecimalInput(raw)
  if (!Number.isFinite(n) || n < 0) {
    emit('update-accessory-line', id, { price: 0 })
    return
  }
  emit('update-accessory-line', id, { price: n })
}

function onAccessoryPriceChange(id, raw) {
  const n = parseDecimalInput(raw)
  if (!Number.isFinite(n) || n < 0) {
    emit('update-accessory-line', id, { price: 0 })
    return
  }
  emit('update-accessory-line', id, { price: n })
}

function parseDecimalInput(raw) {
  const s = String(raw ?? '').trim().replace(/\s/g, '').replace(',', '.')
  if (s === '' || s === '-' || s === '.' || s === '-.') return NaN
  return Number(s)
}

function discountPercentInputValue(d) {
  const p = Number(d?.percent ?? 0)
  if (Number.isFinite(p) && p !== 0) {
    const rounded = Math.round(p * 100) / 100
    return String(rounded)
  }
  const base = Number(props.discountPairingBase)
  if (!Number.isFinite(base) || base <= 0) return '0'
  let absAmt = 0
  if (props.showNetPrices) {
    absAmt = Math.abs(Number(d?.netAmount ?? d?.amount ?? 0))
  } else {
    absAmt = Math.abs(Number(d?.grossAmount ?? d?.amount ?? 0))
  }
  if (!Number.isFinite(absAmt) || absAmt === 0) return '0'
  const derived = (absAmt / base) * 100
  if (!Number.isFinite(derived) || derived === 0) return '0'
  const rounded = Math.round(derived * 100) / 100
  return String(-Math.abs(rounded))
}

function discountAmountInputValue(d) {
  const raw = props.showNetPrices
    ? Number(d?.netAmount ?? d?.amount ?? 0)
    : Number(d?.grossAmount ?? d?.amount ?? 0)
  if (!Number.isFinite(raw) || raw === 0) return '0'
  const rounded = Math.round(raw * 100) / 100
  return rounded === 0 ? '0' : String(rounded)
}

function onDiscountPercentChange(id, raw) {
  const n = parseDecimalInput(raw)
  if (!Number.isFinite(n) || n === 0) {
    emit('update-discount', id, { percent: 0 })
    return
  }
  emit('update-discount', id, { percent: Math.abs(n) })
}

function onDiscountAmountChange(id, raw) {
  const n = parseDecimalInput(raw)
  if (!Number.isFinite(n) || n === 0) {
    emit('update-discount', id, { amount: 0 })
    return
  }
  emit('update-discount', id, { amount: Math.abs(n) })
}

function handleAddDiscount() {
  emit('add-discount', {
    description: '',
    percent: 0,
    amount: 0,
  })
  open.discounts = true
}

function handleAddCampaign() {
  emit('add-campaign', {
    description: '',
    percent: 0,
    amount: 0,
  })
}

/** Gross list price of the configured vehicle (vehicleBaseTotal is always gross). */
function vehicleListPriceGrossForPromo() {
  const g = Number(props.vehicleBaseTotal)
  return Number.isFinite(g) ? g : 0
}

function oemPercentForPromo(promo) {
  const p = promo
  if (!p) return 0
  if (p.discountType === 'percent') return -Math.abs(Number(p.discountPercent))
  const baseGross = Number(props.vehicleBaseTotal)
  const base = props.showNetPrices ? toNet(baseGross) : baseGross
  const grossAmt = Math.abs(Number(p.amount || 0))
  const amt = props.showNetPrices ? toNet(grossAmt) : grossAmt
  if (!Number.isFinite(amt) || amt === 0) return 0
  if (!Number.isFinite(base) || base <= 0) return Number.NaN
  return -(amt / base) * 100
}

function oemAmountGrossForPromo(promo) {
  const p = promo
  if (!p) return 0
  if (p.discountType === 'percent') {
    const base = vehicleListPriceGrossForPromo()
    const pct = Math.abs(Number(p.discountPercent))
    if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(pct)) return 0
    return -Math.abs((base * pct) / 100)
  }
  const amt = Number(p.amount || 0)
  return Number.isFinite(amt) ? -Math.abs(amt) : 0
}

function oemAmountNetForPromo(promo) {
  const g = oemAmountGrossForPromo(promo)
  if (!Number.isFinite(g) || g === 0) return 0
  return -Math.abs(toNet(Math.abs(g)))
}

function toNet(grossValue) {
  const gross = Number(grossValue)
  if (!Number.isFinite(gross)) return 0
  const rate = Number(props.vatRatePercent || 0) / 100
  if (rate <= 0) return gross
  return gross / (1 + rate)
}

function displayValue(value) {
  return props.showNetPrices ? toNet(value) : Number(value)
}

function formatCurrency(value) {
  const n = displayValue(value)
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`
}

defineExpose({
  openSection,
  addDiscountFromSearch,
  addCampaignFromSearch,
  addAccessoryFromSearch,
  addTradeInFromSearch,
  addPurchaseMethodFromSearch,
})
</script>
