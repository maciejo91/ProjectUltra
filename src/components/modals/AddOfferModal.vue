<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="flex w-full min-w-[50vw] max-w-[96rem] flex-col min-h-[50vh] max-h-[90vh] p-0">
        <DialogHeader class="flex-shrink-0 border-b border-border px-6 py-4">
          <DialogTitle class="text-foreground">Create offer</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-8 py-4">
          <nav class="flex items-center justify-center gap-1 sm:gap-2 mb-4 flex-wrap" aria-label="Steps">
            <ol class="flex items-center gap-1 sm:gap-2 flex-wrap">
              <template v-for="(s, i) in stepLabels" :key="s.key">
                <li
                  v-if="i > 0"
                  class="h-px w-3 sm:w-4 shrink-0 bg-border"
                  aria-hidden="true"
                />
                <li
                  class="flex flex-col items-center gap-1.5"
                  :class="currentStepIndex === i ? 'text-foreground font-medium' : 'text-muted-foreground'"
                >
                  <span
                    class="flex size-6 shrink-0 items-center justify-center rounded-full text-xs"
                    :class="currentStepIndex === i ? 'bg-primary text-primary-foreground' : 'bg-muted'"
                  >
                    {{ i + 1 }}
                  </span>
                  <span class="text-xs sm:text-sm text-center">{{ s.label }}</span>
                </li>
              </template>
            </ol>
          </nav>

          <!-- Step: Customer (when showCustomerStep) -->
          <div v-if="currentStepKey === 'customer'" class="space-y-4 max-w-2xl">
            <p class="text-sm text-muted-foreground">Select the customer for this offer.</p>
            <CustomerSearchSelect
              :model-value="selectedCustomer"
              label="Search Customer"
              contacts-only
              :show-clear="false"
              change-label="Change"
              @update:model-value="onCustomerSelected"
            />
          </div>

          <!-- Step: Vehicle (when not preselected) -->
          <div v-if="currentStepKey === 'vehicle'" class="space-y-4">
            <div v-if="vehicleSubView === 'choice'" class="grid gap-3 sm:grid-cols-1">
              <Button
                v-if="requestedVehicle"
                variant="outline"
                class="h-auto w-full justify-start gap-3 px-4 py-3 text-left"
                @click="useRequestedVehicle"
              >
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                  <img
                    v-if="requestedVehicle.image"
                    :src="requestedVehicle.image"
                    :alt="`${requestedVehicle.brand} ${requestedVehicle.model}`"
                    class="size-full object-cover"
                  />
                  <Car v-else class="size-5 text-foreground" />
                </div>
                <div class="min-w-0">
                  <span class="font-medium text-foreground">Use requested vehicle</span>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ requestedVehicle.brand }} {{ requestedVehicle.model }} ({{ requestedVehicle.year }}) — € {{ formatCurrency(priceGrossStep1(requestedVehicle.price)) }} (incl. VAT)
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                class="h-auto w-full justify-start gap-3 px-4 py-3 text-left"
                @click="vehicleSubView = 'stock'"
              >
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Package class="size-5 text-foreground" />
                </div>
                <div class="min-w-0">
                  <span class="font-medium text-foreground">Add from Stock</span>
                  <p class="text-xs text-muted-foreground mt-0.5">Search and select an existing vehicle from inventory</p>
                </div>
              </Button>
              <Button
                variant="outline"
                class="h-auto w-full justify-start gap-3 px-4 py-3 text-left"
                @click="vehicleSubView = 'configure'"
              >
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Settings class="size-5 text-foreground" />
                </div>
                <div class="min-w-0">
                  <span class="font-medium text-foreground">Configure Vehicle</span>
                  <p class="text-xs text-muted-foreground mt-0.5">Build or customize a new vehicle</p>
                </div>
              </Button>
              <Button
                variant="outline"
                class="h-auto w-full justify-start gap-3 px-4 py-3 text-left"
                @click="skipToManual"
              >
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <PenLine class="size-5 text-foreground" />
                </div>
                <div class="min-w-0">
                  <span class="font-medium text-foreground">Skip & Enter Manually</span>
                  <p class="text-xs text-muted-foreground mt-0.5">Create vehicle data from scratch</p>
                </div>
              </Button>
            </div>
            <div v-if="vehicleSubView === 'stock' || vehicleSubView === 'configure'">
              <VehicleSelectionInline
                ref="vehicleSelectionRef"
                :requested-vehicle="requestedVehicle"
                :opportunity-id="opportunityId"
                :mode="vehicleSubView === 'stock' ? 'stock' : 'configure'"
                show-back
                hide-back
                @vehicle-selected="onVehicleSelected"
                @back="vehicleSubView = 'choice'"
                @selection-change="onStockSelectionChange"
              />
            </div>
          </div>

          <!-- Step 2: Personal information -->
          <div v-if="currentStepKey === 'personal'" class="space-y-4 max-w-2xl">
            <div class="space-y-4">
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">Salutation</Label>
                <Select v-model="offerData.salutation">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select salutation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                    <SelectItem value="Ms.">Ms.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-xs font-medium text-muted-foreground mb-1">First Name</Label>
                  <Input v-model="offerData.firstName" placeholder="Enter first name" :disabled="!!customer" />
                </div>
                <div>
                  <Label class="text-xs font-medium text-muted-foreground mb-1">Last Name</Label>
                  <Input v-model="offerData.lastName" placeholder="Enter last name" :disabled="!!customer" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-xs font-medium text-muted-foreground mb-1">Email</Label>
                  <Input type="email" v-model="offerData.email" placeholder="email@example.com" :disabled="!!customer" />
                </div>
                <div>
                  <Label class="text-xs font-medium text-muted-foreground mb-1">Phone Number</Label>
                  <Input type="tel" v-model="offerData.phone" placeholder="+1 (555) 000-0000" :disabled="!!customer" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label class="text-xs font-medium text-muted-foreground mb-1">ZIP / Postal Code</Label>
                  <Input v-model="offerData.zipCode" placeholder="Enter ZIP code" :disabled="!!customer" />
                </div>
                <div>
                  <Label class="text-xs font-medium text-muted-foreground mb-1">City</Label>
                  <Input v-model="offerData.city" placeholder="Enter city" :disabled="!!customer" />
                </div>
              </div>
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">Address / Street</Label>
                <Input v-model="offerData.address" placeholder="Enter street address" :disabled="!!customer" />
              </div>
            </div>
          </div>

          <!-- Step 3: Trade-in & Financing -->
          <div v-if="currentStepKey === 'tradein_financing'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TradeInsCard
                :items="taskTradeIns"
                :add-loading="tradeInAddLoading"
                @open-add="$emit('open-add-tradein')"
                @open-edit="(t) => $emit('open-edit-tradein', t)"
              />
              <FinancingOptionsCard
                :items="taskFinancingOptions"
                @open-add="$emit('open-add-financing')"
                @open-edit="(f) => $emit('open-edit-financing', f)"
              />
            </div>
            <div class="border border-border rounded-lg bg-muted/50 p-4 space-y-3 max-w-xl">
              <p class="text-sm font-medium text-foreground">Use in this offer (Trade-in — select one or more)</p>
              <div class="space-y-2">
                <Label class="text-xs font-medium text-muted-foreground">Trade-ins</Label>
                <div class="flex flex-col gap-2">
                  <div
                    v-for="ti in taskTradeIns"
                    :key="ti.id"
                    class="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer transition-colors"
                    :class="isTradeInSelected(ti.id) ? 'bg-primary/10 border-primary' : 'bg-background'"
                    @click="toggleTradeInSelection(ti.id)"
                  >
                    <Checkbox :checked="isTradeInSelected(ti.id)" @click.prevent="toggleTradeInSelection(ti.id)" />
                    <div class="flex-1 min-w-0">
                      <span class="font-medium text-foreground">{{ ti.label }}</span>
                      <span v-if="ti.valuation != null" class="text-muted-foreground text-xs ml-2">€ {{ formatCurrency(ti.valuation) }}</span>
                      <p v-if="ti.brand || ti.model || ti.year" class="text-xs text-muted-foreground mt-0.5">
                        {{ [ti.brand, ti.model, ti.year].filter(Boolean).join(' ') }}
                      </p>
                    </div>
                  </div>
                </div>
                <p v-if="!taskTradeIns.length" class="text-xs text-muted-foreground">No trade-ins added yet. Use the card above to add.</p>
              </div>
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">Financing</Label>
                <Select :model-value="financingSelectValue" @update:model-value="onFinancingSelect">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pick financing or Cash..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="lease">Lease</SelectItem>
                    <SelectItem v-for="fo in taskFinancingOptions" :key="fo.id" :value="String(fo.id)">
                      {{ fo.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <!-- Step 4: Pricing -->
          <div v-if="currentStepKey === 'pricing'" class="space-y-4 max-w-2xl">
            <div v-if="!resolvedVehicle" class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg space-y-4">
              <p class="text-sm font-medium text-foreground md:col-span-2">Vehicle details (manual entry)</p>
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">Brand</Label>
                <Input v-model="offerData.brand" placeholder="e.g., Audi" />
              </div>
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">Model</Label>
                <Input v-model="offerData.model" placeholder="e.g., e-tron GT" />
              </div>
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">Year</Label>
                <Input type="number" v-model="offerData.year" placeholder="2024" />
              </div>
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">Image URL</Label>
                <Input v-model="offerData.image" placeholder="https://..." />
              </div>
            </div>
            <div>
              <Label class="text-xs font-medium text-muted-foreground mb-1">Base Price (€)</Label>
              <Input type="number" :value="offerData.price" readonly class="bg-muted" placeholder="0" />
            </div>
            <div class="flex items-center gap-2">
              <Checkbox :checked="offerData.showVat" @update:checked="offerData.showVat = $event" id="show-vat" />
              <Label for="show-vat" class="text-xs font-medium text-muted-foreground cursor-pointer">Show VAT breakdown</Label>
            </div>
            <div v-if="offerData.showVat" class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">VAT (e.g. % or legal text)</Label>
                <Input type="text" v-model="offerData.vatRate" :placeholder="defaultVatForLocale" />
              </div>
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">VAT €</Label>
                <Input type="text" :value="displayVatAmount" readonly class="bg-muted" />
              </div>
              <div>
                <Label class="text-xs font-medium text-muted-foreground mb-1">Subtotal €</Label>
                <Input type="number" :value="subtotal" readonly class="bg-muted" />
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <Label class="text-sm font-medium text-foreground">Quotation items</Label>
                <Button variant="outline" size="sm" @click="addQuotationItem">
                  <Plus class="size-4 mr-1" />
                  Add item
                </Button>
              </div>
              <div v-for="(item, index) in offerData.quotationItems" :key="index" class="border border-border rounded-lg p-3 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div class="md:col-span-2">
                    <Label class="text-xs font-medium text-muted-foreground mb-1">Item name</Label>
                    <Input v-model="item.name" placeholder="Item name" />
                  </div>
                  <div class="flex justify-end items-end">
                    <Button variant="ghost" size="icon" class="text-destructive hover:text-destructive" @click="removeQuotationItem(index)">
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <Label class="text-xs font-medium text-muted-foreground mb-1">Price (€)</Label>
                    <Input type="number" :value="(item.price || 0)" readonly class="bg-muted" placeholder="0" />
                  </div>
                  <div>
                    <Label class="text-xs font-medium text-muted-foreground mb-1">Quantity</Label>
                    <Input type="number" v-model="item.quantity" placeholder="1" />
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <Label class="text-sm font-medium text-foreground">Discounts (applied to taxable amount, not subject to VAT)</Label>
                <Button variant="outline" size="sm" @click="addDiscount">
                  <Plus class="size-4 mr-1" />
                  Add discount
                </Button>
              </div>
              <div v-for="(discount, index) in offerData.discounts" :key="index" class="border border-border rounded-lg p-3 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label class="text-xs font-medium text-muted-foreground mb-1">Discount title</Label>
                    <Input v-model="discount.title" placeholder="Discount title" />
                  </div>
                  <div class="flex gap-2 items-end">
                    <div class="flex-1">
                      <Label class="text-xs font-medium text-muted-foreground mb-1">Type</Label>
                      <Select v-model="discount.type">
                        <SelectTrigger class="w-full">
                          <SelectValue placeholder="€ or %" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="absolute">Amount (€)</SelectItem>
                          <SelectItem value="percent">Percentage (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="flex-1" v-if="discount.type === 'absolute'">
                      <Label class="text-xs font-medium text-muted-foreground mb-1">Amount (€)</Label>
                      <Input type="number" v-model="discount.price" placeholder="0" />
                    </div>
                    <div class="flex-1" v-if="discount.type === 'percent'">
                      <Label class="text-xs font-medium text-muted-foreground mb-1">Percent (%)</Label>
                      <Input type="number" v-model="discount.percent" placeholder="0" />
                    </div>
                  </div>
                </div>
                <div class="flex justify-end">
                  <Button variant="ghost" size="icon" class="text-destructive hover:text-destructive" @click="removeDiscount(index)">
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div class="space-y-3">
              <Label class="text-sm font-medium text-foreground">Promotions</Label>
              <div class="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-foreground">Public OEM</span>
                  <Toggle
                    variant="outline"
                    :model-value="promoPublicOemEnabled"
                    @update:model-value="promoPublicOemEnabled = $event"
                  >
                    {{ promoPublicOemEnabled ? 'On' : 'Off' }}
                  </Toggle>
                </div>
                <div v-if="promoPublicOemEnabled" class="text-xs text-muted-foreground">
                  Placeholder — € / % (read-only, from API)
                </div>
                <div class="flex items-center justify-between gap-4">
                  <span class="text-sm text-foreground">OEM Commercial</span>
                  <Toggle
                    variant="outline"
                    :model-value="promoOemCommercialEnabled"
                    @update:model-value="promoOemCommercialEnabled = $event"
                  >
                    {{ promoOemCommercialEnabled ? 'On' : 'Off' }}
                  </Toggle>
                </div>
                <div v-if="promoOemCommercialEnabled" class="text-xs text-muted-foreground">
                  Placeholder — € / % (read-only, from API)
                </div>
                <div class="space-y-2">
                  <Label class="text-sm font-medium text-foreground">Dealer Promos (editable)</Label>
                  <Button variant="outline" size="sm" @click="addDealerPromo">
                    <Plus class="size-4 mr-1" />
                    Add dealer promo
                  </Button>
                  <div v-for="(promo, index) in offerData.promotions" :key="index" class="border border-border rounded-lg p-3 space-y-2 flex gap-2">
                    <Input v-model="promo.label" placeholder="Label / free text" class="flex-1" />
                    <Select v-model="promo.valueType">
                      <SelectTrigger class="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amount">€</SelectItem>
                        <SelectItem value="percent">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input v-if="promo.valueType === 'amount'" type="number" v-model="promo.amount" placeholder="0" class="w-24" />
                    <Input v-else type="number" v-model="promo.percent" placeholder="0" class="w-24" />
                    <Button variant="ghost" size="icon" class="text-destructive shrink-0" @click="removeDealerPromo(index)">
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-medium text-muted-foreground">Rounding</Label>
              <Select v-model="offerData.rounding">
                <SelectTrigger class="w-full max-w-xs">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="100">Nearest 100</SelectItem>
                  <SelectItem value="1000">Nearest 1000</SelectItem>
                </SelectContent>
              </Select>
              <p v-if="offerData.rounding && offerData.rounding !== 'none'" class="text-xs text-muted-foreground">
                Final total: € {{ formatCurrency(finalTotal) }}
              </p>
            </div>
          </div>

          <!-- Step 5: Payment methods -->
          <div v-if="currentStepKey === 'payment'" class="space-y-4 max-w-2xl">
            <div class="flex justify-between items-center">
              <Label class="text-sm font-medium text-foreground">Payment methods</Label>
              <Button variant="outline" size="sm" @click="addPaymentMethod">
                <Plus class="size-4 mr-1" />
                Add payment method
              </Button>
            </div>
            <div v-for="(payment, index) in offerData.paymentMethods" :key="index" class="border border-border rounded-lg p-3 space-y-3">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label class="text-xs font-medium text-muted-foreground mb-1">Description</Label>
                  <Input v-model="payment.description" placeholder="Description (max 80 chars)" :maxlength="80" />
                </div>
                <div>
                  <Label class="text-xs font-medium text-muted-foreground mb-1">Amount (€)</Label>
                  <Input type="number" v-model="payment.amount" placeholder="0" />
                </div>
              </div>
              <div class="flex justify-between items-center">
                <Label class="flex items-center gap-2 cursor-pointer">
                  <Checkbox :checked="payment.paid" @update:checked="payment.paid = $event" />
                  <span class="text-xs text-muted-foreground">PAID</span>
                </Label>
                <Button variant="ghost" size="icon" class="text-destructive hover:text-destructive" @click="removePaymentMethod(index)">
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </div>
            <div class="bg-muted rounded-lg p-4 space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-medium text-muted-foreground">Grand total:</span>
                <span class="text-sm font-bold text-foreground">€ {{ formatCurrency(finalTotal) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs font-medium text-muted-foreground">Remaining balance (Cash):</span>
                <span class="text-sm font-bold text-foreground">€ {{ formatCurrency(remainingBalanceCash) }}</span>
              </div>
              <p class="text-xs text-muted-foreground">Total minus down payment. Add payment methods below to match grand total.</p>
            </div>
            <div v-if="offerData.paymentMethods.length > 0" class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs font-medium text-muted-foreground">Payment methods total:</span>
                <span class="text-sm font-bold text-foreground">€ {{ formatCurrency(paymentMethodsTotal) }}</span>
              </div>
              <p v-if="!paymentMethodsValid" class="text-xs text-destructive">Payment methods must equal grand total</p>
            </div>
          </div>

          <!-- Step 6: Terms & conditions -->
          <div v-if="currentStepKey === 'terms'" class="space-y-4 max-w-2xl">
            <div>
              <Label class="text-xs font-medium text-muted-foreground mb-1">Notes / Comments</Label>
              <Textarea v-model="offerData.notes" rows="3" placeholder="Any special terms, conditions, or notes..." />
            </div>
            <div>
              <Label class="text-xs font-medium text-muted-foreground mb-1">Offer expiration date</Label>
              <Input type="date" v-model="offerData.expirationDate" />
            </div>
            <div class="space-y-3 pt-3 border-t border-border">
              <p class="text-xs font-semibold text-foreground">Privacy & consent</p>
              <div class="flex items-start gap-2">
                <Checkbox :checked="offerData.privacyConsent" @update:checked="offerData.privacyConsent = $event" id="privacy-consent" />
                <Label for="privacy-consent" class="text-xs text-muted-foreground cursor-pointer">I agree to the privacy policy</Label>
              </div>
              <div class="flex items-start gap-2">
                <Checkbox :checked="offerData.marketingConsent" @update:checked="offerData.marketingConsent = $event" id="marketing-consent" />
                <Label for="marketing-consent" class="text-xs text-muted-foreground cursor-pointer">I want to receive marketing communications</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="flex-shrink-0 flex flex-col-reverse sm:flex-row gap-2 border-t border-border px-6 py-4 sm:justify-between sm:items-center">
          <div class="flex justify-end sm:justify-start order-1 min-w-0">
            <Button variant="ghost" size="sm" class="gap-2" @click="handleBackClick">
              <ChevronLeft class="size-4" />
              Back
            </Button>
          </div>
          <div class="flex flex-col-reverse sm:flex-row gap-2 order-2">
            <Button
              v-if="!isLastStep"
              variant="outline"
              size="sm"
              class="w-full sm:w-auto"
              :disabled="isNextDisabled"
              @click="handleNext"
            >
              Next
            </Button>
            <Button
              v-if="isLastStep"
              variant="default"
              size="sm"
              class="w-full sm:w-auto"
              :disabled="!canSubmit"
              @click="submitForm"
            >
              Create offer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Car, ChevronLeft, Package, PenLine, Plus, Settings, Trash2 } from 'lucide-vue-next'
import { Button, Checkbox, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Toggle } from '@motork/component-library/future/primitives'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle
} from '@motork/component-library/future/primitives'
import VehicleSelectionInline from '@/components/shared/VehicleSelectionInline.vue'
import TradeInsCard from '@/components/shared/TradeInsCard.vue'
import FinancingOptionsCard from '@/components/shared/FinancingOptionsCard.vue'
import CustomerSearchSelect from '@/components/shared/CustomerSearchSelect.vue'

const BASE_STEP_KEYS = ['vehicle', 'personal', 'tradein_financing', 'pricing', 'payment', 'terms']
const BASE_STEP_LABELS = [
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'personal', label: 'Personal' },
  { key: 'tradein_financing', label: 'Trade-in & Financing' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'payment', label: 'Payment' },
  { key: 'terms', label: 'Terms' }
]

const props = defineProps({
  /** When set, vehicle step is skipped and this vehicle is used. */
  preselectedVehicle: { type: Object, default: null },
  /** When true, adds a customer selection step as the first step (e.g. from vehicles page). */
  showCustomerStep: { type: Boolean, default: false },
  show: { type: Boolean, required: true },
  opportunity: { type: Object, default: null },
  /** When true, the Trade-ins card Add button shows loading (e.g. while saving a trade-in). */
  tradeInAddLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel', 'open-add-tradein', 'open-add-financing', 'open-edit-tradein', 'open-edit-financing'])

const stepIndex = ref(0)
const vehicleSubView = ref('choice')
const resolvedVehicle = ref(null)
const vehicleSelectionRef = ref(null)
const hasStockSelection = ref(false)
const promoPublicOemEnabled = ref(false)
const promoOemCommercialEnabled = ref(false)
const selectedCustomer = ref(null)

function onCustomerSelected(c) {
  selectedCustomer.value = c
  if (c) populateCustomer()
}

const stepKeys = computed(() => {
  const keys = [...BASE_STEP_KEYS]
  if (props.showCustomerStep) keys.unshift('customer')
  if (props.preselectedVehicle) keys.splice(keys.indexOf('vehicle'), 1)
  return keys
})
const stepLabels = computed(() => {
  const labels = [...BASE_STEP_LABELS]
  if (props.showCustomerStep) labels.unshift({ key: 'customer', label: 'Customer' })
  if (props.preselectedVehicle) labels.splice(labels.findIndex(l => l.key === 'vehicle'), 1)
  return labels
})

const resolvedTaskId = computed(() => props.opportunity?.id ?? null)
const customer = computed(() => {
  if (props.showCustomerStep && selectedCustomer.value) {
    const c = selectedCustomer.value
    return {
      id: c.id,
      name: c.name || [c.firstName, c.lastName].filter(Boolean).join(' '),
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      zipCode: c.zipCode || c.postalCode,
      initials: c.initials || (c.name || '').split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    }
  }
  return props.opportunity?.customer ?? null
})
const taskTradeIns = computed(() => props.opportunity?.tradeIns ?? [])
const taskFinancingOptions = computed(() => props.opportunity?.financingOptions ?? [])
const requestedVehicle = computed(
  () =>
    props.preselectedVehicle ||
    props.opportunity?.selectedVehicle ||
    props.opportunity?.vehicle ||
    props.opportunity?.requestedCar ||
    null
)
const opportunityId = computed(() => props.opportunity?.id ?? null)

const { locale } = useI18n()
const defaultVatForLocale = computed(() => (locale.value === 'it' ? '22' : '21'))

const currentStepKey = computed(() => stepKeys.value[stepIndex.value] ?? 'vehicle')
const currentStepIndex = computed(() => stepIndex.value)
const isLastStep = computed(() => stepIndex.value === stepKeys.value.length - 1)


const offerData = ref({
  salutation: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  zipCode: '',
  address: '',
  city: '',
  price: 0,
  financingType: 'cash',
  downPayment: 0,
  monthlyPayment: 0,
  term: 36,
  interestRate: 3.5,
  notes: '',
  privacyConsent: false,
  marketingConsent: false,
  brand: '',
  model: '',
  year: '',
  image: '',
  showVat: true,
  vatRate: '',
    quotationItems: [],
  discounts: [],
  rounding: 'none',
  promotions: [],
  tradeIn: { showOnPdf: true, valuation: 0, notes: '' },
  paymentMethods: [],
  expirationDate: null,
  selectedTradeInIds: [],
  selectedFinancingId: null,
  selectedFinancingLabel: ''
})

function toggleTradeInSelection(id) {
  const ids = [...(offerData.value.selectedTradeInIds || [])]
  const s = String(id)
  const idx = ids.indexOf(s)
  if (idx >= 0) ids.splice(idx, 1)
  else ids.push(s)
  offerData.value.selectedTradeInIds = ids
  const first = taskTradeIns.value?.find(o => String(o.id) === ids[0])
  offerData.value.tradeIn.valuation = totalTradeInValue.value
  offerData.value.tradeIn.notes = first ? (first.label || '') : ''
}

function isTradeInSelected(id) {
  return (offerData.value.selectedTradeInIds || []).indexOf(String(id)) >= 0
}

const financingSelectValue = computed(() => {
  const id = offerData.value.selectedFinancingId
  if (id != null && id !== '') return String(id)
  const type = offerData.value.financingType
  if (type === 'rent' || type === 'lease') return type
  return 'cash'
})

function applyFinancingFromPool(id) {
  const fo = taskFinancingOptions.value?.find(o => String(o.id) === String(id))
  if (!fo) return
  offerData.value.selectedFinancingId = fo.id
  offerData.value.selectedFinancingLabel = fo.label ?? ''
}

function onFinancingSelect(val) {
  if (val === 'cash' || val === 'rent' || val === 'lease' || val == null || val === '') {
    offerData.value.financingType = val || 'cash'
    offerData.value.selectedFinancingId = null
    offerData.value.selectedFinancingLabel = val === 'rent' ? 'Rent' : val === 'lease' ? 'Lease' : ''
    return
  }
  offerData.value.financingType = 'financing'
  applyFinancingFromPool(val)
}

const subtotal = computed(() => {
  let total = offerData.value.price || 0
  offerData.value.quotationItems.forEach(item => {
    total += (item.price || 0) * (item.quantity || 1)
  })
  if (offerData.value.showVat) return total - calculatedVat.value
  return total
})

const vatRateNumeric = computed(() => {
  const v = offerData.value.vatRate
  if (v === '' || v == null) return null
  const n = parseFloat(String(v).trim())
  return Number.isFinite(n) ? n : null
})

const calculatedVat = computed(() => {
  if (!offerData.value.showVat || vatRateNumeric.value == null) return 0
  let total = offerData.value.price || 0
  offerData.value.quotationItems.forEach(item => {
    total += (item.price || 0) * (item.quantity || 1)
  })
  return (total * vatRateNumeric.value) / (100 + vatRateNumeric.value)
})

const displayVatAmount = computed(() => {
  if (!offerData.value.showVat) return '0'
  if (vatRateNumeric.value != null) return formatCurrency(calculatedVat.value)
  return '—'
})

const taxableAmountBeforeDiscounts = computed(() => {
  let total = offerData.value.price || 0
  offerData.value.quotationItems.forEach(item => {
    total += (item.price || 0) * (item.quantity || 1)
  })
  return total
})

const totalTradeInValue = computed(() => {
  const ids = offerData.value.selectedTradeInIds || []
  if (!ids.length) return Number(offerData.value.tradeIn?.valuation || 0)
  let sum = 0
  ids.forEach(id => {
    const ti = taskTradeIns.value?.find(o => String(o.id) === String(id))
    if (ti) sum += Number(ti.valuation ?? 0)
  })
  return sum
})

const promotionsTotal = computed(() => {
  const taxable = taxableAmountBeforeDiscounts.value
  let sum = 0
  offerData.value.promotions.forEach(p => {
    if (p.valueType === 'percent' && (p.percent != null && p.percent !== '')) {
      sum += (taxable * Number(p.percent)) / 100
    } else {
      sum += Number(p.amount || 0)
    }
  })
  return sum
})

const discountTotal = computed(() => {
  const taxable = taxableAmountBeforeDiscounts.value
  let sum = 0
  offerData.value.discounts.forEach(d => {
    if (d.type === 'percent' && (d.percent != null && d.percent !== '')) {
      sum += (taxable * Number(d.percent)) / 100
    } else {
      sum += Number(d.price || 0)
    }
  })
  return sum
})

const totalAfterDiscountsAndTradeIn = computed(() => {
  let total = taxableAmountBeforeDiscounts.value - discountTotal.value - promotionsTotal.value
  total -= totalTradeInValue.value
  return total
})

const vatOnTotal = computed(() => {
  if (vatRateNumeric.value == null) return 0
  return (totalAfterDiscountsAndTradeIn.value * vatRateNumeric.value) / (100 + vatRateNumeric.value)
})

const totalBeforeRounding = computed(() => {
  return totalAfterDiscountsAndTradeIn.value
})

const roundingAmount = computed(() => {
  const r = offerData.value.rounding
  const t = totalBeforeRounding.value
  if (r === 'none' || !r) return 0
  if (r === '100') return Math.round(t / 100) * 100 - t
  if (r === '1000') return Math.round(t / 1000) * 1000 - t
  return 0
})

const finalTotal = computed(() => {
  return totalBeforeRounding.value + roundingAmount.value
})

const grandTotal = computed(() => finalTotal.value)

const paymentMethodsTotal = computed(() =>
  offerData.value.paymentMethods.reduce((sum, p) => sum + (p.amount || 0), 0)
)

const remainingBalanceCash = computed(() => {
  const total = finalTotal.value
  const down = Number(offerData.value.downPayment || 0)
  return Math.max(0, total - down)
})
const paymentMethodsValid = computed(() => {
  if (offerData.value.paymentMethods.length === 0) return true
  return Math.abs(paymentMethodsTotal.value - finalTotal.value) < 0.01
})

const canSubmit = computed(() => {
  return offerData.value.price > 0 && paymentMethodsValid.value
})

const isNextDisabled = computed(() => {
  if (currentStepKey.value === 'customer') return !selectedCustomer.value
  if (currentStepKey.value === 'vehicle') {
    if (vehicleSubView.value === 'stock') return !hasStockSelection.value
  }
  return false
})

function formatCurrency(val) {
  if (val == null) return '0'
  const n = typeof val === 'string' ? parseFloat(val) : val
  return Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0'
}

function priceGrossStep1(price) {
  const p = Number(price) || 0
  const vat = parseFloat(defaultVatForLocale.value)
  if (!Number.isFinite(vat)) return p
  return p * (1 + vat / 100)
}

function populateCustomer() {
  const c = customer.value
  if (!c) return
  const fullName = c.name || [c.firstName, c.lastName].filter(Boolean).join(' ')
  const nameParts = fullName.split(' ')
  offerData.value.firstName = nameParts[0] || ''
  offerData.value.lastName = nameParts.slice(1).join(' ') || ''
  offerData.value.email = c.email || ''
  offerData.value.phone = c.phone || ''
  offerData.value.address = c.address || ''
  offerData.value.city = c.city || ''
  offerData.value.zipCode = c.zipCode || c.postalCode || ''
}

function addQuotationItem() {
  applyMarketDefaultsToVat()
  offerData.value.quotationItems.push({ type: 'custom', name: '', price: 0, quantity: 1, vat: 0 })
}
function removeQuotationItem(index) {
  offerData.value.quotationItems.splice(index, 1)
}
function addDiscount() {
  offerData.value.discounts.push({ title: '', type: 'absolute', price: 0, percent: null })
}
function removeDiscount(index) {
  offerData.value.discounts.splice(index, 1)
}

function addDealerPromo() {
  offerData.value.promotions.push({ label: '', valueType: 'amount', amount: 0, percent: null })
}
function removeDealerPromo(index) {
  offerData.value.promotions.splice(index, 1)
}

function addPaymentMethod() {
  offerData.value.paymentMethods.push({ description: '', amount: 0, paid: false })
}
function removePaymentMethod(index) {
  offerData.value.paymentMethods.splice(index, 1)
}

function useRequestedVehicle() {
  resolvedVehicle.value = { ...requestedVehicle.value }
  offerData.value.price = requestedVehicle.value?.price ?? 0
  offerData.value.brand = requestedVehicle.value?.brand ?? ''
  offerData.value.model = requestedVehicle.value?.model ?? ''
  offerData.value.year = requestedVehicle.value?.year ?? ''
  offerData.value.image = requestedVehicle.value?.image ?? ''
  stepIndex.value = 1
}

function onStockSelectionChange({ hasSelection }) {
  hasStockSelection.value = !!hasSelection
}

function onVehicleSelected({ vehicle }) {
  resolvedVehicle.value = { ...vehicle }
  offerData.value.price = vehicle?.price ?? 0
  offerData.value.brand = vehicle?.brand ?? ''
  offerData.value.model = vehicle?.model ?? ''
  offerData.value.year = vehicle?.year ?? ''
  offerData.value.image = vehicle?.image ?? ''
  stepIndex.value = 1
}

function skipToManual() {
  resolvedVehicle.value = null
  stepIndex.value = 1
}

function handleNext() {
  if (currentStepKey.value === 'vehicle') {
    if (vehicleSubView.value === 'stock' && hasStockSelection.value && vehicleSelectionRef.value) {
      vehicleSelectionRef.value.confirmSelection()
      return
    }
    if (vehicleSubView.value !== 'stock' && vehicleSubView.value !== 'configure') return
  }
  if (isLastStep.value) return
  stepIndex.value = Math.min(stepIndex.value + 1, stepKeys.value.length - 1)
}

function handleBackClick() {
  if (stepIndex.value > 0) {
    stepIndex.value--
    if (stepIndex.value === 0) {
      vehicleSubView.value = 'choice'
      hasStockSelection.value = false
    }
    return
  }
  emit('cancel')
}

function handleOpenChange(isOpen) {
  if (!isOpen) emit('cancel')
}

function submitForm() {
  if (!canSubmit.value) return
  const payload = {
    id: Date.now(),
    type: 'offer',
    action: 'created an offer',
    data: {
      salutation: offerData.value.salutation,
      firstName: offerData.value.firstName,
      lastName: offerData.value.lastName,
      email: offerData.value.email,
      phone: offerData.value.phone,
      zipCode: offerData.value.zipCode,
      address: offerData.value.address,
      city: offerData.value.city,
      brand: offerData.value.brand,
      model: offerData.value.model,
      year: offerData.value.year,
      image: offerData.value.image,
      price: offerData.value.price,
      total: finalTotal.value,
      paymentMethod: offerData.value.financingType,
      financingType: offerData.value.financingType,
      downPayment: offerData.value.downPayment,
      monthlyPayment: offerData.value.monthlyPayment,
      term: offerData.value.term,
      interestRate: offerData.value.interestRate,
      notes: offerData.value.notes,
      privacyConsent: offerData.value.privacyConsent,
      marketingConsent: offerData.value.marketingConsent,
      showVat: offerData.value.showVat,
      vatRate: offerData.value.vatRate,
      vatAmount: calculatedVat.value,
      subtotal: subtotal.value,
      quotationItems: offerData.value.quotationItems,
      discounts: offerData.value.discounts,
      rounding: offerData.value.rounding,
      promotions: offerData.value.promotions,
      finalTotal: finalTotal.value,
      tradeIn: offerData.value.tradeIn,
      paymentMethods: offerData.value.paymentMethods,
      expirationDate: offerData.value.expirationDate,
      grandTotal: finalTotal.value,
      selectedTradeInIds: offerData.value.selectedTradeInIds,
      selectedFinancingId: offerData.value.selectedFinancingId,
      selectedFinancingLabel: offerData.value.selectedFinancingLabel
    },
    timestamp: new Date().toISOString(),
    isEdit: false
  }
  if (props.showCustomerStep && selectedCustomer.value) {
    payload.selectedCustomerId = selectedCustomer.value.id
    payload.selectedCustomerType = selectedCustomer.value.type || 'contact'
  }
  emit('confirm', payload)
}

function reset() {
  stepIndex.value = 0
  vehicleSubView.value = 'choice'
  selectedCustomer.value = null
  const preVehicle = props.preselectedVehicle
  resolvedVehicle.value = preVehicle ? { ...preVehicle } : null
  hasStockSelection.value = false
  offerData.value = {
    salutation: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipCode: '',
    address: '',
    city: '',
    price: 0,
    financingType: 'cash',
    downPayment: 0,
    monthlyPayment: 0,
    term: 36,
    interestRate: 3.5,
    notes: '',
    privacyConsent: false,
    marketingConsent: false,
    brand: '',
    model: '',
    year: '',
    image: '',
    showVat: true,
    vatRate: defaultVatForLocale.value,
    quotationItems: [],
    discounts: [],
    rounding: 'none',
    promotions: [],
    tradeIn: { showOnPdf: true, valuation: 0, notes: '' },
    paymentMethods: [],
    expirationDate: null,
    selectedTradeInIds: [],
    selectedFinancingId: null,
    selectedFinancingLabel: ''
  }
  promoPublicOemEnabled.value = false
  promoOemCommercialEnabled.value = false
  populateCustomer()
  if (resolvedVehicle.value) {
    offerData.value.price = resolvedVehicle.value.price ?? 0
    offerData.value.brand = resolvedVehicle.value.brand ?? ''
    offerData.value.model = resolvedVehicle.value.model ?? ''
    offerData.value.year = resolvedVehicle.value.year ?? ''
    offerData.value.image = resolvedVehicle.value.image ?? ''
  }
}

watch(() => props.show, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    reset()
  }
})

watch(() => props.opportunity, () => {
  populateCustomer()
  if (resolvedVehicle.value) {
    offerData.value.price = resolvedVehicle.value.price ?? 0
    offerData.value.brand = resolvedVehicle.value.brand ?? ''
    offerData.value.model = resolvedVehicle.value.model ?? ''
    offerData.value.year = resolvedVehicle.value.year ?? ''
    offerData.value.image = resolvedVehicle.value.image ?? ''
  }
}, { immediate: true })

function applyMarketDefaultsToVat() {
  if (offerData.value.vatRate === '' || offerData.value.vatRate == null) {
    offerData.value.vatRate = defaultVatForLocale.value
  }
}

watch(currentStepKey, (key) => {
  if (key === 'pricing') applyMarketDefaultsToVat()
})
</script>
