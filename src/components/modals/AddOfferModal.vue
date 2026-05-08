<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
      <DialogContent class="w-full sm:max-w-2xl max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-2rem)] flex flex-col p-0" :show-close-button="true">
        <DialogHeader class="shrink-0 border-b border-border px-6 py-4">
          <DialogTitle class="text-foreground text-xl font-bold">Create offer</DialogTitle>
        </DialogHeader>

        <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-8">
          <nav class="flex items-center justify-center mb-6" aria-label="Steps">
            <ol class="flex items-start w-full justify-between">
              <template v-for="(s, i) in stepLabels" :key="s.key">
                <li class="flex flex-col items-center gap-2 shrink-0 w-16 sm:w-24">
                  <span
                    class="flex size-6 sm:size-7 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-sm font-bold transition-colors"
                    :class="currentStepIndex === i ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'"
                  >
                    {{ i + 1 }}
                  </span>
                  <span
                    class="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight text-center leading-tight transition-colors"
                    :class="currentStepIndex === i ? 'text-foreground' : 'text-muted-foreground'"
                  >
                    {{ s.label }}
                  </span>
                </li>
                <li v-if="i < stepLabels.length - 1" class="h-px flex-1 bg-border mt-3 sm:mt-3.5" aria-hidden="true" />
              </template>
            </ol>
          </nav>

          <!-- Step: Customer -->
          <div v-if="currentStepKey === 'customer'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-border">
                <User class="size-4 text-primary" />
                <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Select Customer</h3>
              </div>
              <CustomerSearchSelect
                :model-value="selectedCustomer"
                label="Search Customer"
                contacts-only
                :show-clear="false"
                change-label="Change"
                @update:model-value="onCustomerSelected"
              />
            </div>
          </div>

          <!-- Step: Vehicle -->
          <div v-if="currentStepKey === 'vehicle'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="flex items-center gap-2 pb-2 border-b border-border">
              <Car class="size-4 text-primary" />
              <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Vehicle Selection</h3>
            </div>
            
            <div v-if="vehicleSubView === 'choice'" class="grid gap-4 sm:grid-cols-2">
              <Button
                v-if="requestedVehicle"
                variant="outline"
                class="h-auto justify-start gap-4 p-4 text-left hover:bg-muted/50 transition-all border-2"
                :class="resolvedVehicle ? 'border-primary bg-primary/5' : 'border-transparent'"
                @click="useRequestedVehicle"
              >
                <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden border border-border">
                  <img
                    v-if="requestedVehicle.image"
                    :src="requestedVehicle.image"
                    :alt="`${requestedVehicle.brand} ${requestedVehicle.model}`"
                    class="size-full object-cover"
                  />
                  <Car v-else class="size-6 text-muted-foreground" />
                </div>
                <div class="min-w-0">
                  <span class="block text-sm font-bold text-foreground">Requested Vehicle</span>
                  <p class="text-[11px] text-muted-foreground mt-1 truncate">
                    {{ requestedVehicle.brand }} {{ requestedVehicle.model }}
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                class="h-auto justify-start gap-4 p-4 text-left hover:bg-muted/50 transition-all border-2 border-transparent"
                @click="vehicleSubView = 'stock'"
              >
                <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Package class="size-6 text-primary" />
                </div>
                <div class="min-w-0">
                  <span class="block text-sm font-bold text-foreground">From Stock</span>
                  <p class="text-[11px] text-muted-foreground mt-1">Browse inventory</p>
                </div>
              </Button>

              <Button
                variant="outline"
                class="h-auto justify-start gap-4 p-4 text-left hover:bg-muted/50 transition-all border-2 border-transparent"
                @click="vehicleSubView = 'configure'"
              >
                <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <Settings class="size-6 text-primary" />
                </div>
                <div class="min-w-0">
                  <span class="block text-sm font-bold text-foreground">Configure New</span>
                  <p class="text-[11px] text-muted-foreground mt-1">Custom build</p>
                </div>
              </Button>

              <Button
                variant="outline"
                class="h-auto justify-start gap-4 p-4 text-left hover:bg-muted/50 transition-all border-2 border-transparent"
                @click="skipToManual"
              >
                <div class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                  <PenLine class="size-6 text-muted-foreground" />
                </div>
                <div class="min-w-0">
                  <span class="block text-sm font-bold text-foreground">Manual Entry</span>
                  <p class="text-[11px] text-muted-foreground mt-1">Enter data from scratch</p>
                </div>
              </Button>
            </div>

            <div v-if="vehicleSubView === 'stock' || vehicleSubView === 'configure'" class="animate-in slide-in-from-right-4 duration-300">
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
          <div v-if="currentStepKey === 'personal'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-border">
                <User2 class="size-4 text-primary" />
                <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Personal Details</h3>
              </div>
              
              <div class="space-y-2">
                <Label class="text-sm font-semibold uppercase text-muted-foreground">Salutation</Label>
                <div class="outcome-toggle-group flex gap-3">
                  <Toggle
                    v-for="s in ['Mr.', 'Mrs.', 'Ms.']"
                    :key="s"
                    variant="outline"
                    class="outcome-toggle-item flex-1 font-medium"
                    :model-value="offerData.salutation === s"
                    @update:model-value="(v) => offerData.salutation = v ? s : ''"
                  >
                    {{ s }}
                  </Toggle>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">First Name</Label>
                  <Input v-model="offerData.firstName" placeholder="Enter first name" :disabled="!!customer" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Last Name</Label>
                  <Input v-model="offerData.lastName" placeholder="Enter last name" :disabled="!!customer" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Email</Label>
                  <Input type="email" v-model="offerData.email" placeholder="email@example.com" :disabled="!!customer" class="bg-background" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Phone Number</Label>
                  <Input type="tel" v-model="offerData.phone" placeholder="+1 (555) 000-0000" :disabled="!!customer" class="bg-background" />
                </div>
              </div>

              <div class="space-y-4 pt-4 border-t border-border">
                <div class="flex items-center gap-2">
                  <MapPin class="size-4 text-primary" />
                  <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Address Information</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div class="space-y-1.5">
                    <Label class="text-sm font-semibold uppercase text-muted-foreground">ZIP / Postal Code</Label>
                    <Input v-model="offerData.zipCode" placeholder="Enter ZIP" :disabled="!!customer" class="bg-background" />
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-sm font-semibold uppercase text-muted-foreground">City</Label>
                    <Input v-model="offerData.city" placeholder="Enter city" :disabled="!!customer" class="bg-background" />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <Label class="text-sm font-semibold uppercase text-muted-foreground">Address / Street</Label>
                  <Input v-model="offerData.address" placeholder="Enter street address" :disabled="!!customer" class="bg-background" />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Trade-in & Financing -->
          <div v-if="currentStepKey === 'tradein_financing'" class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TradeInsCard
                :items="taskTradeIns"
                :add-loading="tradeInAddLoading"
                @open-add="$emit('open-add-tradein')"
                @open-edit="(t) => $emit('open-edit-tradein', t)"
                class="shadow-sm border-border"
              />
              <FinancingOptionsCard
                :items="taskFinancingOptions"
                @open-add="$emit('open-add-financing')"
                @open-edit="(f) => $emit('open-edit-financing', f)"
                class="shadow-sm border-border"
              />
            </div>

            <div class="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-6">
              <div class="space-y-4">
                <div class="flex items-center gap-2">
                  <RefreshCw class="size-4 text-primary" />
                  <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Apply to Offer</h3>
                </div>
                
                <div class="space-y-3">
                  <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Selected Trade-ins</Label>
                  <div class="grid grid-cols-1 gap-2">
                    <div
                      v-for="ti in taskTradeIns"
                      :key="ti.id"
                      class="flex items-center gap-3 p-3 rounded-lg border border-border bg-background cursor-pointer hover:border-primary/50 transition-all shadow-sm"
                      :class="isTradeInSelected(ti.id) ? 'border-primary ring-1 ring-primary' : ''"
                      @click="toggleTradeInSelection(ti.id)"
                    >
                      <Checkbox :checked="isTradeInSelected(ti.id)" @click.prevent="toggleTradeInSelection(ti.id)" />
                      <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                          <span class="text-sm font-bold text-foreground">{{ ti.label }}</span>
                          <span v-if="ti.valuation != null" class="text-sm font-bold text-primary">€ {{ formatCurrency(ti.valuation) }}</span>
                        </div>
                        <p class="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
                          {{ [ti.brand, ti.model, ti.year].filter(Boolean).join(' ') }}
                        </p>
                      </div>
                    </div>
                    <div v-if="!taskTradeIns.length" class="text-center py-4 rounded-lg border border-dashed border-border bg-background/50">
                      <p class="text-[10px] font-bold uppercase text-muted-foreground">No trade-ins available</p>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Financing Plan</Label>
                  <Select :model-value="financingSelectValue" @update:model-value="onFinancingSelect">
                    <SelectTrigger class="bg-background font-medium">
                      <SelectValue placeholder="Pick financing or Cash..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash Payment</SelectItem>
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
          </div>

          <!-- Step 4: Pricing -->
          <div v-if="currentStepKey === 'pricing'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div v-if="!resolvedVehicle" class="p-5 rounded-xl border border-border bg-muted/20 space-y-4">
              <div class="flex items-center gap-2 border-b border-border pb-2">
                <FileText class="size-4 text-primary" />
                <h3 class="text-sm font-bold text-foreground uppercase tracking-wider">Manual Vehicle Entry</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div class="space-y-1.5">
                  <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Brand</Label>
                  <Input v-model="offerData.brand" placeholder="e.g., Audi" class="bg-background h-9" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Model</Label>
                  <Input v-model="offerData.model" placeholder="e.g., e-tron GT" class="bg-background h-9" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Year</Label>
                  <Input type="number" v-model="offerData.year" placeholder="2024" class="bg-background h-9" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Image URL</Label>
                  <Input v-model="offerData.image" placeholder="https://..." class="bg-background h-9" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div class="space-y-6">
                <div class="space-y-4">
                  <div class="flex items-center gap-2 border-b border-border pb-2">
                    <Tags class="size-4 text-primary" />
                    <h3 class="text-sm font-bold text-foreground uppercase tracking-wider">Base Configuration</h3>
                  </div>
                  <div class="space-y-4">
                    <div class="space-y-1.5 bg-primary/5 p-4 rounded-lg border border-primary/10">
                      <Label class="text-[10px] font-bold uppercase text-primary px-1">Base Price (€)</Label>
                      <Input type="number" :value="offerData.price" readonly class="bg-background text-xl font-black border-none shadow-none" />
                    </div>
                    <div class="flex items-center gap-3 px-1">
                      <Checkbox :checked="offerData.showVat" @update:checked="offerData.showVat = $event" id="show-vat" />
                      <Label for="show-vat" class="text-sm font-bold text-muted-foreground cursor-pointer uppercase tracking-tight">Show VAT breakdown</Label>
                    </div>
                    <div v-if="offerData.showVat" class="p-4 rounded-lg bg-muted/30 border border-border space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                          <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">VAT Rate (%)</Label>
                          <Input type="text" v-model="offerData.vatRate" :placeholder="defaultVatForLocale" class="bg-background h-8" />
                        </div>
                        <div class="space-y-1">
                          <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">VAT Amount</Label>
                          <div class="h-8 flex items-center px-3 rounded-md bg-background border border-border text-sm font-bold">
                            € {{ displayVatAmount }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center justify-between border-b border-border pb-2">
                    <div class="flex items-center gap-2">
                      <PlusCircle class="size-4 text-primary" />
                      <h3 class="text-sm font-bold text-foreground uppercase tracking-wider">Options & Extras</h3>
                    </div>
                    <Button variant="ghost" size="sm" @click="addQuotationItem" class="h-7 text-[10px] font-black uppercase text-primary">
                      <Plus class="size-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div class="space-y-3">
                    <div v-for="(item, index) in offerData.quotationItems" :key="index" class="relative group p-4 rounded-xl border border-border bg-background hover:bg-muted/5 transition-all shadow-sm">
                      <Button variant="ghost" size="icon" class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" @click="removeQuotationItem(index)">
                        <Trash2 class="size-3" />
                      </Button>
                      <div class="space-y-3">
                        <div class="space-y-1">
                          <Label class="text-[9px] font-bold uppercase text-muted-foreground px-1">Description</Label>
                          <Input v-model="item.name" placeholder="Optional feature name" class="h-8 bg-muted/20" />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div class="space-y-1">
                            <Label class="text-[9px] font-bold uppercase text-muted-foreground px-1">Price (€)</Label>
                            <Input type="number" v-model="item.price" class="h-8 bg-muted/20" />
                          </div>
                          <div class="space-y-1">
                            <Label class="text-[9px] font-bold uppercase text-muted-foreground px-1">Qty</Label>
                            <Input type="number" v-model="item.quantity" class="h-8 bg-muted/20" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="!offerData.quotationItems.length" class="text-center py-6 border-2 border-dashed border-border rounded-xl">
                      <p class="text-[10px] font-bold uppercase text-muted-foreground">No extras added</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between border-b border-border pb-2">
                    <div class="flex items-center gap-2">
                      <Percent class="size-4 text-primary" />
                      <h3 class="text-sm font-bold text-foreground uppercase tracking-wider">Discounts</h3>
                    </div>
                    <Button variant="ghost" size="sm" @click="addDiscount" class="h-7 text-[10px] font-black uppercase text-primary">
                      <Plus class="size-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div class="space-y-3">
                    <div v-for="(discount, index) in offerData.discounts" :key="index" class="relative group p-4 rounded-xl border border-border bg-background hover:bg-muted/5 transition-all shadow-sm">
                      <Button variant="ghost" size="icon" class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" @click="removeDiscount(index)">
                        <Trash2 class="size-3" />
                      </Button>
                      <div class="space-y-3">
                        <div class="space-y-1">
                          <Label class="text-[9px] font-bold uppercase text-muted-foreground px-1">Title</Label>
                          <Input v-model="discount.title" placeholder="e.g. Dealer Discount" class="h-8 bg-muted/20" />
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div class="space-y-1">
                            <Label class="text-[9px] font-bold uppercase text-muted-foreground px-1">Type</Label>
                            <Select v-model="discount.type">
                              <SelectTrigger class="h-8 bg-muted/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="absolute">Amount (€)</SelectItem>
                                <SelectItem value="percent">Percent (%)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div class="space-y-1">
                            <Label class="text-[9px] font-bold uppercase text-muted-foreground px-1">Value</Label>
                            <Input v-if="discount.type === 'absolute'" type="number" v-model="discount.price" class="h-8 bg-muted/20" />
                            <Input v-else type="number" v-model="discount.percent" class="h-8 bg-muted/20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center gap-2 border-b border-border pb-2">
                    <Sparkles class="size-4 text-primary" />
                    <h3 class="text-sm font-bold text-foreground uppercase tracking-wider">Promotions</h3>
                  </div>
                  <div class="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                    <div class="flex items-center justify-between p-3 rounded-lg bg-background border border-border shadow-sm">
                      <div class="flex items-center gap-2">
                        <div class="size-2 rounded-full bg-primary" />
                        <span class="text-[11px] font-bold uppercase tracking-tight">Public OEM Offer</span>
                      </div>
                      <Toggle variant="outline" size="sm" :model-value="promoPublicOemEnabled" @update:model-value="promoPublicOemEnabled = $event" class="h-6 text-[9px] font-black">
                        {{ promoPublicOemEnabled ? 'ON' : 'OFF' }}
                      </Toggle>
                    </div>
                    <div class="flex items-center justify-between p-3 rounded-lg bg-background border border-border shadow-sm">
                      <div class="flex items-center gap-2">
                        <div class="size-2 rounded-full bg-primary" />
                        <span class="text-[11px] font-bold uppercase tracking-tight">OEM Commercial</span>
                      </div>
                      <Toggle variant="outline" size="sm" :model-value="promoOemCommercialEnabled" @update:model-value="promoOemCommercialEnabled = $event" class="h-6 text-[9px] font-black">
                        {{ promoOemCommercialEnabled ? 'ON' : 'OFF' }}
                      </Toggle>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Payment methods -->
          <div v-if="currentStepKey === 'payment'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="flex flex-col md:flex-row gap-6">
              <div class="flex-1 space-y-6">
                <div class="flex items-center justify-between border-b border-border pb-2">
                  <div class="flex items-center gap-2">
                    <Wallet class="size-4 text-primary" />
                    <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Payment Plan</h3>
                  </div>
                  <Button variant="outline" size="sm" @click="addPaymentMethod" class="h-8 rounded-full font-bold uppercase text-[10px]">
                    <Plus class="size-3.5 mr-1.5" /> Add Step
                  </Button>
                </div>

                <div class="space-y-3">
                  <div v-for="(payment, index) in offerData.paymentMethods" :key="index" class="relative group p-5 rounded-xl border border-border bg-background hover:bg-muted/5 transition-all shadow-sm space-y-4">
                    <Button variant="ghost" size="icon" class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" @click="removePaymentMethod(index)">
                      <Trash2 class="size-3.5" />
                    </Button>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="space-y-1.5">
                        <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Description</Label>
                        <Input v-model="payment.description" placeholder="e.g. Booking Fee" :maxlength="80" class="h-9 bg-muted/20" />
                      </div>
                      <div class="space-y-1.5">
                        <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Amount (€)</Label>
                        <Input type="number" v-model="payment.amount" class="h-9 bg-muted/20" />
                      </div>
                    </div>
                    <div class="flex items-center gap-3 pt-1">
                      <Checkbox :checked="payment.paid" @update:checked="payment.paid = $event" :id="'pm-paid-'+index" />
                      <Label :for="'pm-paid-'+index" class="text-sm font-bold text-muted-foreground cursor-pointer uppercase select-none">Mark as paid</Label>
                    </div>
                  </div>
                  <div v-if="!offerData.paymentMethods.length" class="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/5">
                    <CreditCard class="size-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p class="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">No individual payments scheduled</p>
                  </div>
                </div>
              </div>

              <div class="w-full md:w-80 space-y-6">
                <div class="p-6 rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 space-y-6">
                  <div class="space-y-1">
                    <p class="text-[10px] font-black uppercase tracking-widest opacity-80">Final Offer Total</p>
                    <p class="text-3xl font-black">€ {{ formatCurrency(finalTotal) }}</p>
                  </div>
                  <div class="space-y-3 pt-4 border-t border-primary-foreground/20">
                    <div class="flex justify-between items-center opacity-90">
                      <span class="text-sm font-bold uppercase tracking-tight">Down Payment</span>
                      <span class="text-sm font-bold">€ {{ formatCurrency(offerData.downPayment || 0) }}</span>
                    </div>
                    <div class="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                      <span class="text-sm font-bold uppercase tracking-tight">Remaining (Cash)</span>
                      <span class="text-sm font-black">€ {{ formatCurrency(remainingBalanceCash) }}</span>
                    </div>
                  </div>
                </div>

                <div v-if="offerData.paymentMethods.length > 0" class="p-5 rounded-xl border border-border bg-muted/20 space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Scheduled Total:</span>
                    <span class="text-sm font-black text-foreground">€ {{ formatCurrency(paymentMethodsTotal) }}</span>
                  </div>
                  <div v-if="!paymentMethodsValid" class="flex items-center gap-2 p-2 rounded-md bg-destructive/10 text-destructive border border-destructive/20 animate-pulse">
                    <AlertCircle class="size-3.5 shrink-0" />
                    <span class="text-[9px] font-black uppercase leading-tight">Payments must match grand total!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 6: Terms & conditions -->
          <div v-if="currentStepKey === 'terms'" class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-6">
                <div class="space-y-4">
                  <div class="flex items-center gap-2 border-b border-border pb-2">
                    <MessageSquare class="size-4 text-primary" />
                    <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Notes & Comments</h3>
                  </div>
                  <Textarea v-model="offerData.notes" rows="6" placeholder="Any special terms, conditions, or internal notes for this customer..." class="bg-background resize-none text-sm" />
                </div>
              </div>

              <div class="space-y-6">
                <div class="space-y-4">
                  <div class="flex items-center gap-2 border-b border-border pb-2">
                    <Calendar class="size-4 text-primary" />
                    <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Validity</h3>
                  </div>
                  <div class="space-y-1.5">
                    <Label class="text-[10px] font-bold uppercase text-muted-foreground px-1">Offer Expiration Date</Label>
                    <Input type="date" v-model="offerData.expirationDate" class="bg-background h-10" />
                  </div>
                </div>

                <div class="space-y-4 pt-4">
                  <div class="flex items-center gap-2 border-b border-border pb-2">
                    <ShieldCheck class="size-4 text-primary" />
                    <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">Consent & Privacy</h3>
                  </div>
                  <div class="space-y-4">
                    <div class="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer" @click="offerData.privacyConsent = !offerData.privacyConsent">
                      <Checkbox :checked="offerData.privacyConsent" class="mt-0.5" />
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-foreground uppercase tracking-tight">Privacy Policy</p>
                        <p class="text-[10px] text-muted-foreground leading-relaxed font-medium">The customer has read and agreed to the dealership's privacy policy and data processing terms.</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer" @click="offerData.marketingConsent = !offerData.marketingConsent">
                      <Checkbox :checked="offerData.marketingConsent" class="mt-0.5" />
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-foreground uppercase tracking-tight">Marketing Communications</p>
                        <p class="text-[10px] text-muted-foreground leading-relaxed font-medium">The customer wishes to receive updates, news, and promotional offers from our dealership.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="shrink-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-t border-border px-6 py-4 bg-muted/10">
          <Button variant="outline" size="sm" @click="handleBackClick" class="rounded-sm w-full sm:w-auto font-bold uppercase tracking-wider text-[10px]">
            <ChevronLeft v-if="currentStepIndex > 0" class="size-3.5 mr-2" />
            {{ currentStepIndex === 0 ? 'Cancel' : 'Back' }}
          </Button>

          <div class="flex flex-col sm:flex-row gap-3">
            <Button
              v-if="!isLastStep"
              variant="default"
              size="sm"
              class="rounded-sm w-full sm:w-auto font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
              :disabled="isNextDisabled"
              @click="handleNext"
            >
              Continue
            </Button>
            <Button
              v-if="isLastStep"
              variant="default"
              size="sm"
              class="rounded-sm w-full sm:w-auto font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
              :disabled="!canSubmit"
              @click="submitForm"
            >
              Finalize & Create Offer
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
import {
  AlertCircle,
  Calendar,
  Car,
  ChevronLeft,
  CreditCard,
  FileText,
  MapPin,
  MessageSquare,
  Package,
  PenLine,
  Percent,
  Plus,
  PlusCircle,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  Trash2,
  User,
  User2,
  Wallet
} from 'lucide-vue-next'
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
