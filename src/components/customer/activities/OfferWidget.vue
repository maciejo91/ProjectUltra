<template>
  <div class="bg-surface rounded-xl p-5 mb-6 animate-fade-in relative">
    <div v-if="!hideHeader" class="flex justify-between items-center mb-4">
      <h5 class="text-sm font-bold text-foreground">{{ item ? 'Edit Offer' : 'Create Offer' }}</h5>
      <Button variant="ghost" size="icon" @click="$emit('cancel')" class="text-muted-foreground hover:text-muted-foreground">
        <X class="w-4 h-4 shrink-0" />
      </Button>
    </div>
    
    <!-- Vehicle Selection Step (hidden when hideVehicleSelection, e.g. used inside AddOfferForm) -->
    <div v-if="!hideVehicleSelection && !selectedVehicle && !item && vehicleSelectionStep === 'select'" class="mb-6 space-y-4">
      <div v-if="vehicleSubView === 'choice'" class="rounded-lg border border-border bg-muted overflow-hidden p-6">
        <h6 class="text-sm font-semibold text-foreground mb-4">Select Vehicle</h6>
        <p class="text-sm text-muted-foreground mb-4">Choose how you want to add a vehicle to this offer:</p>
        <div class="space-y-3">
          <Button variant="outline" class="w-full justify-start gap-2" @click="vehicleSubView = 'stock'">
            <Warehouse class="w-4 h-4 shrink-0" />
            <span>Add from Stock — Search and select an existing vehicle from inventory</span>
          </Button>
          <Button variant="outline" class="w-full justify-start gap-2" @click="vehicleSubView = 'configure'">
            <Settings class="w-4 h-4 shrink-0" />
            <span>Configure Vehicle — Build/customize a new vehicle</span>
          </Button>
          <Button variant="outline" class="w-full justify-start gap-2" @click="vehicleSelectionStep = 'manual'">
            <PenLine class="w-4 h-4 shrink-0" />
            <span>Skip & Enter Manually — Create vehicle data from scratch</span>
          </Button>
        </div>
      </div>
      <div v-else class="rounded-lg border border-border bg-muted overflow-hidden p-6">
        <VehicleSelectionInline
          :requested-vehicle="selectedVehicle"
          :opportunity-id="taskId"
          :mode="vehicleSubView"
          show-back
          @vehicle-selected="handleVehicleSelectedFromInline"
          @back="vehicleSubView = 'choice'"
        />
      </div>
    </div>
    
    <!-- Selected Vehicle Display -->
    <div v-if="selectedVehicle || (vehicleSelectionStep === 'manual' && offerData.brand)" class="mb-6 p-4 bg-muted rounded-lg border border-border">
      <p class="text-sm text-muted-foreground mb-2">Creating offer for:</p>
      <div class="flex items-center gap-3">
        <div class="w-16 h-16 bg-surfaceTertiary rounded overflow-hidden flex-shrink-0">
          <img 
            v-if="(selectedVehicle?.image || offerData.image)" 
            :src="selectedVehicle?.image || offerData.image" 
            alt="Vehicle" 
            class="w-full h-full object-cover"
          />
          <Car v-else class="w-full h-full shrink-0 text-muted-foreground flex items-center justify-center" />
        </div>
        <div>
          <h4 class="font-bold text-sm text-foreground">
            {{ (selectedVehicle?.brand || offerData.brand) }} {{ (selectedVehicle?.model || offerData.model) }} ({{ (selectedVehicle?.year || offerData.year) }})
          </h4>
          <p class="text-sm text-muted-foreground">Base Price: € {{ formatCurrency(selectedVehicle?.price || offerData.price) }}</p>
        </div>
      </div>
    </div>
    
    <!-- Offer Form (show when vehicle selected or manual entry) -->
    <div v-if="selectedVehicle || vehicleSelectionStep === 'manual' || item" class="space-y-3">
      
      <!-- Personal Information Section -->
      <div class="border border-border rounded-lg bg-white shadow-nsc-card">
        <button
          type="button"
          @click="showPersonalInfo = !showPersonalInfo"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors rounded-t-lg"
        >
          <div class="flex items-center gap-2">
            <h6 class="text-sm font-semibold text-foreground">Personal Information</h6>
            <span class="text-sm text-red-600">*Required</span>
          </div>
          <i 
            :class="[
              'fa-solid transition-transform duration-200 text-muted-foreground text-sm',
              showPersonalInfo ? 'fa-chevron-up' : 'fa-chevron-down'
            ]"
          ></i>
        </button>
        
        <div v-if="showPersonalInfo" class="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <!-- Salutation -->
          <div>
            <Label class="text-sm font-medium text-muted-foreground mb-1">Salutation <span class="text-red-500">*</span></Label>
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
          
          <!-- Name Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">First Name <span class="text-red-500">*</span></Label>
              <Input 
                v-model="offerData.firstName" 
                placeholder="Enter first name"
                :disabled="isCustomerFieldDisabled"
              />
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Last Name <span class="text-red-500">*</span></Label>
              <Input 
                v-model="offerData.lastName" 
                placeholder="Enter last name"
                :disabled="isCustomerFieldDisabled"
              />
            </div>
          </div>
          
          <!-- Contact Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Email <span class="text-red-500">*</span></Label>
              <Input 
                type="email"
                v-model="offerData.email" 
                placeholder="email@example.com"
                :disabled="isCustomerFieldDisabled"
              />
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Phone Number</Label>
              <Input 
                type="tel"
                v-model="offerData.phone" 
                placeholder="+1 (555) 000-0000"
                :disabled="isCustomerFieldDisabled"
              />
            </div>
          </div>
          
          <!-- Address Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">ZIP / Postal Code <span class="text-red-500">*</span></Label>
              <Input 
                v-model="offerData.zipCode" 
                placeholder="Enter ZIP code"
                :disabled="isCustomerFieldDisabled"
              />
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">City</Label>
              <Input 
                v-model="offerData.city" 
                placeholder="Enter city"
                :disabled="isCustomerFieldDisabled"
              />
            </div>
          </div>
          
          <div>
            <Label class="text-sm font-medium text-muted-foreground mb-1">Address / Street</Label>
            <Input 
              v-model="offerData.address" 
              placeholder="Enter street address"
              :disabled="isCustomerFieldDisabled"
            />
          </div>
        </div>
      </div>
      
      <!-- Vehicle Details Section (for manual entry) -->
      <div v-if="vehicleSelectionStep === 'manual' && !selectedVehicle" class="border border-border rounded-lg bg-white shadow-nsc-card">
        <button
          type="button"
          @click="showVehicleDetails = !showVehicleDetails"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
        >
          <h6 class="text-sm font-semibold text-foreground">Vehicle Details</h6>
          <i 
            :class="[
              'fa-solid transition-transform duration-200 text-muted-foreground text-sm',
              showVehicleDetails ? 'fa-chevron-up' : 'fa-chevron-down'
            ]"
          ></i>
        </button>
        
        <div v-if="showVehicleDetails" class="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Brand</Label>
              <Input v-model="offerData.brand" placeholder="e.g., Audi" />
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Model</Label>
              <Input v-model="offerData.model" placeholder="e.g., e-tron GT" />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Year</Label>
              <Input type="number" v-model="offerData.year" placeholder="2024" />
            </div>
            <div>
              <Label class="text-sm font-medium text-muted-foreground mb-1">Image URL</Label>
              <Input v-model="offerData.image" placeholder="https://..." />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pricing & Financing Section -->
      <div class="border border-border rounded-lg bg-white shadow-nsc-card">
        <button
          type="button"
          @click="showPricing = !showPricing"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
        >
          <div class="flex items-center gap-2">
            <h6 class="text-sm font-semibold text-foreground">Pricing</h6>
            <span class="text-sm text-red-600">*Required</span>
          </div>
          <i 
            :class="[
              'fa-solid transition-transform duration-200 text-muted-foreground text-sm',
              showPricing ? 'fa-chevron-up' : 'fa-chevron-down'
            ]"
          ></i>
        </button>
        
        <div v-if="showPricing" class="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <!-- Base Price -->
          <div>
            <Label class="text-sm font-medium text-muted-foreground mb-1">Base Price (€) <span class="text-red-500">*</span></Label>
            <Input 
              type="number"
              v-model="offerData.price" 
              placeholder="0"
            />
          </div>
          
          <!-- VAT Toggle and Details -->
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <Checkbox 
                :checked="offerData.showVat"
                @update:checked="offerData.showVat = $event"
                id="show-vat"
              />
              <Label for="show-vat" class="text-sm font-medium text-muted-foreground cursor-pointer">Show VAT breakdown</Label>
            </div>
            
            <div v-if="offerData.showVat" class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label class="text-sm font-medium text-muted-foreground mb-1">VAT %</Label>
                <Input 
                  type="number"
                  step="0.1"
                  v-model="offerData.vatRate" 
                  placeholder="21"
                />
              </div>
              <div>
                <Label class="text-sm font-medium text-muted-foreground mb-1">VAT €</Label>
                <Input 
                  type="number"
                  :value="calculatedVat" 
                  readonly
                  class="bg-surfaceTertiary"
                />
              </div>
              <div>
                <Label class="text-sm font-medium text-muted-foreground mb-1">Subtotal €</Label>
                <Input 
                  type="number"
                  :value="subtotal" 
                  readonly
                  class="bg-surfaceTertiary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quotation Items Section -->
      <div class="border border-border rounded-lg bg-white shadow-nsc-card">
        <button
          type="button"
          @click="showQuotationItems = !showQuotationItems"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
        >
          <div class="flex items-center gap-2">
            <h6 class="text-sm font-semibold text-foreground">Quotation Items</h6>
            <span class="text-sm text-muted-foreground">({{ offerData.quotationItems.length }} items)</span>
          </div>
          <i 
            :class="[
              'fa-solid transition-transform duration-200 text-muted-foreground text-sm',
              showQuotationItems ? 'fa-chevron-up' : 'fa-chevron-down'
            ]"
          ></i>
        </button>
        
        <div v-if="showQuotationItems" class="px-4 pb-4 space-y-3 border-t border-border pt-4">
          <div class="flex justify-end">
            <Button
              variant="outline"
              size="small"
              @click="addQuotationItem"
            >
              <Plus class="w-3 h-3 shrink-0 mr-1" />
              Add Item
            </Button>
          </div>
          
          <!-- Additional Quotation Items -->
          <div v-for="(item, index) in offerData.quotationItems" :key="index" class="border border-border rounded-lg p-3 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="md:col-span-2">
                <Label class="text-sm font-medium text-muted-foreground mb-1">Item Name</Label>
                <Input 
                  v-model="item.name" 
                  placeholder="Item name"
                />
              </div>
              <div class="flex justify-between items-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="removeQuotationItem(index)"
                  class="text-red-600 hover:text-red-700 h-10 w-10"
                >
                  <Trash2 class="w-3 h-3 shrink-0" />
                </Button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <Label class="text-sm font-medium text-muted-foreground mb-1">Price (€)</Label>
                <Input 
                  type="number"
                  v-model="item.price" 
                  placeholder="0"
                />
              </div>
              <div>
                <Label class="text-sm font-medium text-muted-foreground mb-1">Quantity</Label>
                <Input 
                  type="number"
                  v-model="item.quantity" 
                  placeholder="1"
                  :value="item.quantity || 1"
                />
              </div>
            </div>
            <div class="flex justify-end">
              <span class="text-sm font-semibold text-foreground">Total: € {{ formatCurrency((item.price || 0) * (item.quantity || 1)) }}</span>
            </div>
          </div>
          
          <div v-if="offerData.quotationItems.length === 0" class="text-center py-6 text-muted-foreground text-sm">
            No quotation items added yet
          </div>
        </div>
      </div>
      
      <!-- Discounts Section -->
      <div class="border border-border rounded-lg bg-white shadow-nsc-card">
        <button
          type="button"
          @click="showDiscounts = !showDiscounts"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
        >
          <div class="flex items-center gap-2">
            <h6 class="text-sm font-semibold text-foreground">Discounts</h6>
            <span class="text-sm text-muted-foreground">({{ offerData.discounts.length }} discounts)</span>
          </div>
          <i 
            :class="[
              'fa-solid transition-transform duration-200 text-muted-foreground text-sm',
              showDiscounts ? 'fa-chevron-up' : 'fa-chevron-down'
            ]"
          ></i>
        </button>
        
        <div v-if="showDiscounts" class="px-4 pb-4 space-y-3 border-t border-border pt-4">
          <div class="flex justify-end">
            <Button
              variant="outline"
              size="small"
              @click="addDiscount"
            >
              <Plus class="w-3 h-3 shrink-0 mr-1" />
              Add Discount
            </Button>
          </div>
          
          <div v-for="(discount, index) in offerData.discounts" :key="index" class="border border-border rounded-lg p-3 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label class="text-sm font-medium text-muted-foreground mb-1">Discount Title</Label>
                <Input 
                  v-model="discount.title" 
                  placeholder="Discount title"
                />
              </div>
              <div>
                <Label class="text-sm font-medium text-muted-foreground mb-1">Amount (€)</Label>
                <Input 
                  type="number"
                  v-model="discount.price" 
                  placeholder="0"
                />
              </div>
            </div>
            <div class="flex justify-between items-center">
              <Label class="flex items-center gap-2 cursor-pointer">
                <Checkbox 
                  :checked="discount.vatInclusive"
                  @update:checked="discount.vatInclusive = $event"
                />
                <span class="text-sm text-muted-foreground">VAT inclusive</span>
              </Label>
              <Button
                variant="ghost"
                size="icon"
                @click="removeDiscount(index)"
                class="text-red-600 hover:text-red-700"
              >
                <Trash2 class="w-3 h-3 shrink-0" />
              </Button>
            </div>
          </div>
          
          <div v-if="offerData.discounts.length === 0" class="text-center py-6 text-muted-foreground text-sm">
            No discounts added yet
          </div>
        </div>
      </div>
      
      <!-- Financing Section -->
      <div class="border border-border rounded-lg bg-white shadow-nsc-card">
        <button
          type="button"
          @click="showFinancing = !showFinancing"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
        >
          <h6 class="text-sm font-semibold text-foreground">Financing</h6>
          <ChevronDown
            :class="['size-4 text-muted-foreground transition-transform duration-200', showFinancing && 'rotate-180']"
          />
        </button>
        <div v-if="showFinancing" class="px-4 pb-4 border-t border-border pt-4 space-y-3">
          <div v-if="financialPool.financingOptions.length > 0" class="space-y-3">
            <Select :model-value="financingSelectValue" @update:model-value="onFinancingSelect">
              <SelectTrigger class="w-full bg-muted/50 border-border h-9 text-sm">
                <SelectValue placeholder="Pick a financing option or Cash..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem v-for="fo in financialPool.financingOptions" :key="fo.id" :value="fo.id.toString()">
                  {{ fo.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" class="gap-2 w-full sm:w-auto" @click="$emit('open-add-financing')">
              <Plus class="size-4" />
              Add financing / purchase method
            </Button>
          </div>
          <div v-else class="flex flex-col items-center gap-2 py-2">
            <p class="text-sm text-muted-foreground">No financing options yet</p>
            <Button variant="outline" size="sm" class="gap-2" @click="$emit('open-add-financing')">
              <Plus class="size-4" />
              Add financing / purchase method
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Trade-In Section -->
      <div class="border border-border rounded-lg bg-white shadow-nsc-card">
        <button
          type="button"
          @click="showTradeIn = !showTradeIn"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
        >
          <h6 class="text-sm font-semibold text-foreground">Trade-In</h6>
          <ChevronDown
            :class="['size-4 text-muted-foreground transition-transform duration-200', showTradeIn && 'rotate-180']"
          />
        </button>
        <div v-if="showTradeIn" class="px-4 pb-4 border-t border-border pt-4 space-y-3">
          <div v-if="financialPool.tradeIns.length > 0" class="space-y-3">
            <Select
              :model-value="offerData.selectedTradeInId != null ? String(offerData.selectedTradeInId) : 'none'"
              @update:model-value="onTradeInSelect"
            >
              <SelectTrigger class="w-full bg-muted/50 border-border h-9 text-sm">
                <SelectValue placeholder="Pick a trade-in..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem v-for="ti in financialPool.tradeIns" :key="ti.id" :value="ti.id.toString()">
                  {{ ti.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" class="gap-2 w-full sm:w-auto" @click="$emit('open-add-tradein')">
              <Plus class="size-4" />
              Add trade-in
            </Button>
          </div>
          <div v-else class="flex flex-col items-center gap-2 py-2">
            <p class="text-sm text-muted-foreground">No trade-ins yet</p>
            <Button variant="outline" size="sm" class="gap-2" @click="$emit('open-add-tradein')">
              <Plus class="size-4" />
              Add trade-in
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Payment Methods Section -->
      <div class="border border-border rounded-lg bg-white shadow-nsc-card">
        <button
          type="button"
          @click="showPaymentMethods = !showPaymentMethods"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
        >
          <div class="flex items-center gap-2">
            <h6 class="text-sm font-semibold text-foreground">Payment Methods</h6>
            <span class="text-sm text-muted-foreground">({{ offerData.paymentMethods.length }} methods)</span>
          </div>
          <i 
            :class="[
              'fa-solid transition-transform duration-200 text-muted-foreground text-sm',
              showPaymentMethods ? 'fa-chevron-up' : 'fa-chevron-down'
            ]"
          ></i>
        </button>
        
        <div v-if="showPaymentMethods" class="px-4 pb-4 space-y-3 border-t border-border pt-4">
          <div class="flex justify-end">
            <Button
              variant="outline"
              size="small"
              @click="addPaymentMethod"
            >
              <Plus class="w-3 h-3 shrink-0 mr-1" />
              Add Payment Method
            </Button>
          </div>
          
          <div v-for="(payment, index) in offerData.paymentMethods" :key="index" class="border border-border rounded-lg p-3 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label class="text-sm font-medium text-muted-foreground mb-1">Description</Label>
                <Input 
                  v-model="payment.description" 
                  placeholder="Description (max 80 chars)"
                  :maxlength="80"
                />
              </div>
              <div>
                <Label class="text-sm font-medium text-muted-foreground mb-1">Amount (€)</Label>
                <Input 
                  type="number"
                  v-model="payment.amount" 
                  placeholder="0"
                />
              </div>
            </div>
            <div class="flex justify-between items-center">
              <Label class="flex items-center gap-2 cursor-pointer">
                <Checkbox 
                  :checked="payment.paid"
                  @update:checked="payment.paid = $event"
                />
                <span class="text-sm text-muted-foreground">PAID</span>
              </Label>
              <Button
                variant="ghost"
                size="icon"
                @click="removePaymentMethod(index)"
                class="text-red-600 hover:text-red-700"
              >
                <Trash2 class="w-3 h-3 shrink-0" />
              </Button>
            </div>
          </div>
          
          <div v-if="offerData.paymentMethods.length === 0" class="text-center py-6 text-muted-foreground text-sm">
            No payment methods added yet
          </div>
          
          <div v-if="offerData.paymentMethods.length > 0" class="bg-muted rounded-lg p-4 mt-4 space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-muted-foreground">Payment Methods Total:</span>
              <span class="text-sm font-bold text-foreground">€ {{ formatCurrency(paymentMethodsTotal) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-muted-foreground">Grand Total:</span>
              <span class="text-sm font-bold text-foreground">€ {{ formatCurrency(grandTotal) }}</span>
            </div>
            <div v-if="!paymentMethodsValid" class="text-sm text-red-600">
              ⚠️ Payment methods must equal Grand Total
            </div>
          </div>
        </div>
      </div>
      
      <!-- Terms & Conditions Section -->
      <div class="border border-border rounded-lg bg-white shadow-nsc-card">
        <button
          type="button"
          @click="showTerms = !showTerms"
          class="w-full flex items-center justify-between p-4 text-left hover:bg-muted transition-colors"
        >
          <div class="flex items-center gap-2">
            <h6 class="text-sm font-semibold text-foreground">Terms & Conditions</h6>
            <span class="text-sm text-red-600">*Required</span>
          </div>
          <i 
            :class="[
              'fa-solid transition-transform duration-200 text-muted-foreground text-sm',
              showTerms ? 'fa-chevron-up' : 'fa-chevron-down'
            ]"
          ></i>
        </button>
        
        <div v-if="showTerms" class="px-4 pb-4 space-y-4 border-t border-border pt-4">
          <!-- Notes / Comments -->
          <div>
            <Label class="text-sm font-medium text-muted-foreground mb-1">Notes / Comments</Label>
            <Textarea 
              v-model="offerData.notes" 
              rows="3"
              placeholder="Any special terms, conditions, or notes about this offer..."
            />
          </div>
          
          <!-- Expiration Date -->
          <div>
            <Label class="text-sm font-medium text-muted-foreground mb-1">Offer Expiration Date</Label>
            <Input 
              type="date"
              v-model="offerData.expirationDate" 
            />
          </div>
          
          <!-- Privacy & Consent -->
          <div class="space-y-3 pt-3 border-t border-border">
            <h6 class="text-sm font-semibold text-foreground">Privacy & Consent</h6>
            
            <div class="flex items-start gap-2">
              <Checkbox 
                :checked="offerData.privacyConsent"
                @update:checked="offerData.privacyConsent = $event"
                id="privacy-consent"
              />
              <Label for="privacy-consent" class="text-sm text-muted-foreground cursor-pointer">
                I agree to the privacy policy <span class="text-red-500">*</span>
              </Label>
            </div>
            
            <div class="flex items-start gap-2">
              <Checkbox 
                :checked="offerData.marketingConsent"
                @update:checked="offerData.marketingConsent = $event"
                id="marketing-consent"
              />
              <Label for="marketing-consent" class="text-sm text-muted-foreground cursor-pointer">
                I want to receive marketing communications
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div v-if="!hideActions" class="flex justify-end gap-2 mt-6 border-t border-border pt-4">
      <Button 
        label="Cancel"
        variant="outline"
        size="small"
        class="rounded-sm"
        @click="$emit('cancel')"
      />
      <Button 
        :label="item ? 'Update Offer' : 'Create Offer'"
        variant="primary"
        size="small"
        class="rounded-sm !bg-brand-red !hover:bg-brand-red-dark !text-white !border-brand-red"
        :disabled="!canSave"
        @click="handleSave"
      />
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Plus, ChevronDown, X, Warehouse, Settings, PenLine, Car, Trash2 } from 'lucide-vue-next'
import { useOpportunitiesStore } from '@/stores/opportunities'
import { 
  Button, Input, Label, Textarea, Checkbox,
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue 
} from '@motork/component-library/future/primitives'
import VehicleSelectionInline from '@/components/shared/VehicleSelectionInline.vue'

const opportunitiesStore = useOpportunitiesStore()

const props = defineProps({
  item: {
    type: Object,
    default: null
  },
  taskType: {
    type: String,
    default: 'opportunity'
  },
  taskId: {
    type: Number,
    required: true
  },
  selectedVehicle: {
    type: Object,
    default: null
  },
  customer: {
    type: Object,
    default: null
  },
  hideHeader: {
    type: Boolean,
    default: false
  },
  hideActions: {
    type: Boolean,
    default: false
  },
  /** When true, vehicle selection step is hidden; parent handles vehicle (e.g. AddOfferForm). */
  hideVehicleSelection: {
    type: Boolean,
    default: false
  },
  /** When hideVehicleSelection, 'manual' skips to form with manual vehicle entry. */
  initialVehicleStep: {
    type: String,
    default: 'select'
  },
  /** Trade-ins from task/opportunity (e.g. Request tab list). */
  tradeIns: {
    type: Array,
    default: () => []
  },
  /** Financing options from task/opportunity (e.g. Request tab list). */
  financingOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'cancel', 'open-add-tradein', 'open-add-financing'])

// Vehicle selection step state
const vehicleSelectionStep = ref('select') // 'select', 'manual'
const vehicleSubView = ref('choice') // 'choice' | 'stock' | 'configure'

function handleVehicleSelectedFromInline({ vehicle }) {
  offerData.value.price = vehicle.price || 0
  offerData.value.brand = vehicle.brand || ''
  offerData.value.model = vehicle.model || ''
  offerData.value.year = vehicle.year || ''
  offerData.value.image = vehicle.image || ''
  vehicleSelectionStep.value = 'manual'
  vehicleSubView.value = 'choice'
}

// Collapsible section states (all collapsed by default)
const showPersonalInfo = ref(false)
const showVehicleDetails = ref(false)
const showPricing = ref(false)
const showQuotationItems = ref(false)
const showDiscounts = ref(false)
const showFinancing = ref(false)
const showTradeIn = ref(false)
const showPaymentMethods = ref(false)
const showTerms = ref(false)

// Financial pool: activities + task tradeIns/financingOptions (e.g. from Request tab)
const financialPool = computed(() => {
  const activities = opportunitiesStore.currentOpportunityActivities || []
  const fromActivities = {
    tradeIns: (activities.filter(a => a.type === 'tradein') || []).map(a => ({
      id: a.id,
      ...(a.data || {}),
      label: a.data?.make && a.data?.model
        ? `${a.data.make} ${a.data.model} (${a.data.year || ''}) - €${(a.data.value ?? 0).toLocaleString()}`
        : (a.data?.label || `Trade-in #${a.id}`)
    })),
    financingOptions: (activities.filter(a => a.type === 'financing') || []).map(a => ({
      id: a.id,
      ...(a.data || {}),
      label: (a.data?.product || a.data?.productName)
        ? `${a.data.product || a.data.productName} (${a.data.apr || a.data.interestRate}% APR, ${a.data.term}mo)`
        : (a.data?.label || `Financing #${a.id}`)
    }))
  }
  const fromTask = {
    tradeIns: (props.tradeIns || []).map(t => ({
      id: t.id,
      label: t.label || `Trade-in`,
      value: t.valuation ?? 0
    })),
    financingOptions: (props.financingOptions || []).map(f => ({
      id: f.id,
      label: f.termMonths ? `${f.label} (${f.termMonths} mo)` : (f.label || 'Financing'),
      term: f.termMonths ?? null
    }))
  }
  return {
    tradeIns: [...fromTask.tradeIns, ...fromActivities.tradeIns.filter(a => !fromTask.tradeIns.some(t => String(t.id) === String(a.id)))],
    financingOptions: [...fromTask.financingOptions, ...fromActivities.financingOptions.filter(a => !fromTask.financingOptions.some(f => String(f.id) === String(a.id)))]
  }
})

function applyFinancingFromPool(id) {
  const fo = financialPool.value.financingOptions.find(o => String(o.id) === String(id))
  if (!fo) return
  offerData.value.financingType = 'financing'
  offerData.value.term = fo.term ?? offerData.value.term
  offerData.value.interestRate = fo.apr ?? fo.interestRate ?? offerData.value.interestRate
  offerData.value.downPayment = fo.downPayment ?? fo.deposit ?? offerData.value.downPayment
  offerData.value.monthlyPayment = fo.monthly ?? fo.monthlyPayment ?? offerData.value.monthlyPayment
  offerData.value.selectedFinancingId = fo.id
  offerData.value.selectedFinancingLabel = fo.product ?? fo.productName ?? fo.label ?? ''
}

function applyTradeInFromPool(id) {
  const ti = financialPool.value.tradeIns.find(o => String(o.id) === String(id))
  if (!ti) return
  offerData.value.tradeIn.valuation = ti.value ?? ti.valuation ?? 0
  const note = ti.make && ti.model
    ? `${ti.make} ${ti.model} (${ti.year || ''}) - ${ti.condition || ''} condition, ${ti.mileage ?? ''}km`
    : (ti.label || '')
  offerData.value.tradeIn.notes = note.trim() || offerData.value.tradeIn.notes
  offerData.value.selectedTradeInId = ti.id
  offerData.value.selectedTradeInLabel = (ti.make && ti.model ? `${ti.make} ${ti.model}` : null) ?? ti.label ?? ''
}

function onTradeInSelect(val) {
  if (!val || val === 'none') {
    offerData.value.tradeIn.valuation = 0
    offerData.value.tradeIn.notes = ''
    offerData.value.selectedTradeInId = null
    offerData.value.selectedTradeInLabel = ''
    return
  }
  applyTradeInFromPool(val)
}

const financingSelectValue = computed(() => {
  const id = offerData.value.selectedFinancingId
  if (id != null && id !== '') return String(id)
  return 'cash'
})

function onFinancingSelect(val) {
  if (val === 'cash' || val == null || val === '') {
    offerData.value.financingType = 'cash'
    offerData.value.selectedFinancingId = null
    offerData.value.selectedFinancingLabel = ''
    offerData.value.downPayment = 0
    offerData.value.monthlyPayment = 0
    offerData.value.term = 36
    offerData.value.interestRate = 3.5
    return
  }
  applyFinancingFromPool(val)
}

// Offer data
const offerData = ref({
  // Personal Information
  salutation: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  zipCode: '',
  address: '',
  city: '',
  
  // Offer Details
  price: 0,
  financingType: 'cash',
  downPayment: 0,
  monthlyPayment: 0,
  term: 36,
  interestRate: 3.5,
  notes: '',
  
  // Privacy
  privacyConsent: false,
  marketingConsent: false,
  
  // Vehicle info (from selected vehicle)
  brand: '',
  model: '',
  year: '',
  image: '',
  
  // New fields
  showVat: false,
  vatRate: 21,
  quotationItems: [],
  discounts: [],
  tradeIn: {
    showOnPdf: true,
    valuation: 0,
    notes: ''
  },
  paymentMethods: [],
  expirationDate: null,
  
  // Pool references
  selectedTradeInId: null,
  selectedTradeInLabel: '',
  selectedFinancingId: null,
  selectedFinancingLabel: ''
})

// Check if customer fields should be disabled (when customer data is available)
const isCustomerFieldDisabled = computed(() => {
  return !!props.customer
})

// Calculate VAT for an item
const calculateItemVat = (price) => {
  if (!offerData.value.showVat || !offerData.value.vatRate) return 0
  return (price * offerData.value.vatRate) / (100 + offerData.value.vatRate)
}

// Calculate subtotal (price without VAT)
const subtotal = computed(() => {
  let total = offerData.value.price || 0
  offerData.value.quotationItems.forEach(item => {
    total += (item.price || 0) * (item.quantity || 1)
  })
  if (offerData.value.showVat) {
    return total - calculatedVat.value
  }
  return total
})

// Calculate total VAT
const calculatedVat = computed(() => {
  if (!offerData.value.showVat || !offerData.value.vatRate) return 0
  let total = offerData.value.price || 0
  offerData.value.quotationItems.forEach(item => {
    total += (item.price || 0) * (item.quantity || 1)
  })
  return (total * offerData.value.vatRate) / (100 + offerData.value.vatRate)
})

// Calculate grand total
const grandTotal = computed(() => {
  let total = offerData.value.price || 0
  offerData.value.quotationItems.forEach(item => {
    total += (item.price || 0) * (item.quantity || 1)
  })
  offerData.value.discounts.forEach(discount => {
    total -= (discount.price || 0)
  })
  if (offerData.value.tradeIn.valuation) {
    total -= offerData.value.tradeIn.valuation
  }
  return total
})

// Calculate payment methods total
const paymentMethodsTotal = computed(() => {
  return offerData.value.paymentMethods.reduce((sum, payment) => sum + (payment.amount || 0), 0)
})

// Validate payment methods sum equals grand total
const paymentMethodsValid = computed(() => {
  if (offerData.value.paymentMethods.length === 0) return true // Optional
  return Math.abs(paymentMethodsTotal.value - grandTotal.value) < 0.01
})

// Add quotation item
const addQuotationItem = () => {
  offerData.value.quotationItems.push({
    type: 'custom',
    name: '',
    price: 0,
    quantity: 1,
    vat: 0
  })
}

// Remove quotation item
const removeQuotationItem = (index) => {
  offerData.value.quotationItems.splice(index, 1)
}

// Add discount
const addDiscount = () => {
  offerData.value.discounts.push({
    title: '',
    price: 0,
    vatInclusive: true
  })
}

// Remove discount
const removeDiscount = (index) => {
  offerData.value.discounts.splice(index, 1)
}

// Add payment method
const addPaymentMethod = () => {
  offerData.value.paymentMethods.push({
    description: '',
    amount: 0,
    paid: false
  })
}

// Remove payment method
const removePaymentMethod = (index) => {
  offerData.value.paymentMethods.splice(index, 1)
}

// Pre-populate customer data from context
const populateCustomerData = () => {
  if (props.customer) {
    // Split name if available
    const nameParts = (props.customer.name || '').split(' ')
    offerData.value.firstName = nameParts[0] || ''
    offerData.value.lastName = nameParts.slice(1).join(' ') || ''
    
    offerData.value.email = props.customer.email || ''
    offerData.value.phone = props.customer.phone || ''
    offerData.value.address = props.customer.address || ''
    offerData.value.city = props.customer.city || ''
    offerData.value.zipCode = props.customer.zipCode || props.customer.postalCode || ''
  }
}

// Initialize from selected vehicle and customer
onMounted(() => {
  populateCustomerData()

  if (props.item) {
    vehicleSelectionStep.value = 'manual'
  } else if (props.selectedVehicle) {
    vehicleSelectionStep.value = 'manual'
  } else if (props.hideVehicleSelection && props.initialVehicleStep === 'manual') {
    vehicleSelectionStep.value = 'manual'
  }

  if (props.selectedVehicle) {
    offerData.value.price = props.selectedVehicle.price || 0
    offerData.value.brand = props.selectedVehicle.brand || ''
    offerData.value.model = props.selectedVehicle.model || ''
    offerData.value.year = props.selectedVehicle.year || ''
    offerData.value.image = props.selectedVehicle.image || ''
  }
  
  // If editing existing offer
  if (props.item && props.item.data) {
    offerData.value = {
      ...offerData.value,
      ...props.item.data,
      price: props.item.data.price || props.item.data.total || 0,
      financingType: props.item.data.financingType || props.item.data.paymentMethod || 'cash',
      notes: props.item.data.notes || props.item.data.description || '',
      showVat: props.item.data.showVat || false,
      vatRate: props.item.data.vatRate || 21,
      quotationItems: props.item.data.quotationItems || [],
      discounts: props.item.data.discounts || [],
      tradeIn: props.item.data.tradeIn || {
        showOnPdf: true,
        valuation: 0,
        notes: ''
      },
      paymentMethods: props.item.data.paymentMethods || [],
      expirationDate: props.item.data.expirationDate || null,
      selectedTradeInId: props.item.data.selectedTradeInId || null,
      selectedTradeInLabel: props.item.data.selectedTradeInLabel || '',
      selectedFinancingId: props.item.data.selectedFinancingId || null,
      selectedFinancingLabel: props.item.data.selectedFinancingLabel || ''
    }
  }
})

// Watch for changes in selected vehicle
watch(() => props.selectedVehicle, (newVehicle) => {
  if (newVehicle && !props.item) {
    vehicleSelectionStep.value = 'manual'
    offerData.value.price = newVehicle.price || 0
    offerData.value.brand = newVehicle.brand || ''
    offerData.value.model = newVehicle.model || ''
    offerData.value.year = newVehicle.year || ''
    offerData.value.image = newVehicle.image || ''
  }
})

// Watch for changes in customer
watch(() => props.customer, () => {
  populateCustomerData()
})

// Expand Trade-In and Financing when pool has options (e.g. Add Offer modal)
watch(
  () => ({
    hasTradeIns: financialPool.value.tradeIns.length > 0,
    hasFinancing: financialPool.value.financingOptions.length > 0
  }),
  ({ hasTradeIns, hasFinancing }) => {
    if (hasTradeIns) showTradeIn.value = true
    if (hasFinancing) showFinancing.value = true
  },
  { immediate: true }
)

// Validation
const canSave = computed(() => {
  const baseValidation = (
    offerData.value.salutation !== '' &&
    offerData.value.firstName !== '' &&
    offerData.value.lastName !== '' &&
    offerData.value.email !== '' &&
    offerData.value.zipCode !== '' &&
    offerData.value.price > 0 &&
    offerData.value.financingType !== '' &&
    offerData.value.privacyConsent === true
  )
  
  // Vehicle must be selected or manual entry completed
  const vehicleValid = props.selectedVehicle || vehicleSelectionStep.value === 'manual'
  
  // Payment methods validation (if added, must equal grand total)
  const paymentValid = paymentMethodsValid.value
  
  return baseValidation && vehicleValid && paymentValid
})

// Format currency
const formatCurrency = (value) => {
  if (!value) return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Save handler
const handleSave = () => {
  if (!canSave.value) return
  
  const offerPayload = {
    id: props.item?.id || Date.now(),
    type: 'offer',
    action: props.item ? 'updated an offer' : 'created an offer',
    data: {
      // Personal information
      salutation: offerData.value.salutation,
      firstName: offerData.value.firstName,
      lastName: offerData.value.lastName,
      email: offerData.value.email,
      phone: offerData.value.phone,
      zipCode: offerData.value.zipCode,
      address: offerData.value.address,
      city: offerData.value.city,
      
      // Vehicle
      brand: offerData.value.brand,
      model: offerData.value.model,
      year: offerData.value.year,
      image: offerData.value.image,
      
      // Offer details
      price: offerData.value.price,
      total: grandTotal.value,
      paymentMethod: offerData.value.financingType,
      financingType: offerData.value.financingType,
      downPayment: offerData.value.downPayment,
      monthlyPayment: offerData.value.monthlyPayment,
      term: offerData.value.term,
      interestRate: offerData.value.interestRate,
      notes: offerData.value.notes,
      description: offerData.value.notes,
      
      // Privacy
      privacyConsent: offerData.value.privacyConsent,
      marketingConsent: offerData.value.marketingConsent,
      
      // New fields
      showVat: offerData.value.showVat,
      vatRate: offerData.value.vatRate,
      vatAmount: calculatedVat.value,
      subtotal: subtotal.value,
      quotationItems: offerData.value.quotationItems,
      discounts: offerData.value.discounts,
      tradeIn: offerData.value.tradeIn,
      paymentMethods: offerData.value.paymentMethods,
      expirationDate: offerData.value.expirationDate,
      grandTotal: grandTotal.value,
      
      // Pool references
      selectedTradeInId: offerData.value.selectedTradeInId,
      selectedTradeInLabel: offerData.value.selectedTradeInLabel,
      selectedFinancingId: offerData.value.selectedFinancingId,
      selectedFinancingLabel: offerData.value.selectedFinancingLabel
    },
    timestamp: props.item?.timestamp || new Date().toISOString(),
    isEdit: !!props.item
  }
  
  emit('save', offerPayload)
}

defineExpose({
  submit: handleSave,
  isValid: canSave,
  offerData
})
</script>
